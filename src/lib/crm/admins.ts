import crypto from "node:crypto";
import { getBootstrapAdminEmails, normalizeEmail } from "@/lib/crm/config";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";

export type CrmAdmin = {
  id: string;
  email: string;
  name: string | null;
  role: "admin";
  active: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
};

const ADMINS_FILE = "crm-admins.json";

function mapDbAdmin(row: Record<string, unknown>): CrmAdmin {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    role: "admin",
    active: Boolean(row.active),
    source: String(row.source ?? "manual"),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function readLocalAdmins() {
  return readJsonFile<CrmAdmin[]>(ADMINS_FILE, []);
}

async function seedLocalAdminsIfEmpty() {
  const admins = await readLocalAdmins();

  if (admins.length > 0) return admins;

  const now = new Date().toISOString();
  const seeded = [...getBootstrapAdminEmails()].map((email) => ({
    id: crypto.randomUUID(),
    email,
    name: null,
    role: "admin" as const,
    active: true,
    source: "bootstrap",
    createdAt: now,
    updatedAt: now,
  }));

  if (seeded.length > 0) {
    await writeJsonFile(ADMINS_FILE, seeded);
  }

  return seeded;
}

export async function seedBootstrapAdminsIfNeeded() {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (!ready || !db) {
    await seedLocalAdminsIfEmpty();
    return;
  }

  const counts = (await db`
    SELECT COUNT(*)::int AS count
    FROM crm_admins
  `) as Array<{ count: number }>;

  if (Number(counts[0]?.count ?? 0) > 0) return;

  for (const email of getBootstrapAdminEmails()) {
    await db`
      INSERT INTO crm_admins (
        id,
        email,
        role,
        active,
        source,
        created_at,
        updated_at
      )
      VALUES (
        ${crypto.randomUUID()},
        ${email},
        'admin',
        TRUE,
        'bootstrap',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;
  }
}

export async function isAdminEmail(email: string) {
  const normalized = normalizeEmail(email);
  await seedBootstrapAdminsIfNeeded();

  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT id
      FROM crm_admins
      WHERE email = ${normalized}
        AND active = TRUE
      LIMIT 1
    `) as Array<{ id: string }>;

    return rows.length > 0;
  }

  const admins = await readLocalAdmins();
  return admins.some((admin) => admin.email === normalized && admin.active);
}

export async function listAdmins() {
  await seedBootstrapAdminsIfNeeded();

  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        email,
        name,
        role,
        active,
        source,
        created_at,
        updated_at
      FROM crm_admins
      ORDER BY created_at ASC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbAdmin(row));
  }

  return readLocalAdmins();
}

export async function addAdmin(input: { email: string; name: string | null }) {
  const email = normalizeEmail(input.email);
  const now = new Date().toISOString();
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_admins (
        id,
        email,
        name,
        role,
        active,
        source,
        created_at,
        updated_at
      )
      VALUES (
        ${crypto.randomUUID()},
        ${email},
        ${input.name},
        'admin',
        TRUE,
        'manual',
        ${now},
        ${now}
      )
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        active = TRUE,
        updated_at = EXCLUDED.updated_at
    `;
    return;
  }

  const admins = await seedLocalAdminsIfEmpty();
  const existing = admins.find((admin) => admin.email === email);

  if (existing) {
    existing.name = input.name;
    existing.active = true;
    existing.updatedAt = now;
    await writeJsonFile(ADMINS_FILE, admins);
    return;
  }

  admins.push({
    id: crypto.randomUUID(),
    email,
    name: input.name,
    role: "admin",
    active: true,
    source: "manual",
    createdAt: now,
    updatedAt: now,
  });
  await writeJsonFile(ADMINS_FILE, admins);
}

export async function setAdminActive(id: string, active: boolean) {
  const ready = await ensureCrmSchema();
  const db = getSql();
  const now = new Date().toISOString();

  if (ready && db) {
    await db`
      UPDATE crm_admins
      SET active = ${active}, updated_at = ${now}
      WHERE id = ${id}
    `;
    return;
  }

  const admins = await readLocalAdmins();
  const next = admins.map((admin) =>
    admin.id === id ? { ...admin, active, updatedAt: now } : admin,
  );
  await writeJsonFile(ADMINS_FILE, next);
}
