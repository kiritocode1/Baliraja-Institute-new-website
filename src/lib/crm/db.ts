import { neon } from "@neondatabase/serverless";

type Sql = ReturnType<typeof neon>;

let sql: Sql | null = null;
let schemaReady = false;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  const url = process.env.DATABASE_URL;

  if (!url) return null;
  if (!sql) sql = neon(url);

  return sql;
}

export async function ensureCrmSchema() {
  const db = getSql();

  if (!db) return false;
  if (schemaReady) return true;

  await db`
    CREATE TABLE IF NOT EXISTS crm_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      track TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to TEXT,
      notes TEXT,
      source TEXT NOT NULL DEFAULT 'admissions_form',
      received_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS crm_admin_otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_leads_received_at_idx
    ON crm_leads (received_at DESC)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_leads_status_idx
    ON crm_leads (status)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_admin_otps_email_idx
    ON crm_admin_otps (email, created_at DESC)
  `;

  schemaReady = true;
  return true;
}
