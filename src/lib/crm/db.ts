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
    CREATE TABLE IF NOT EXISTS crm_admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

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
    CREATE TABLE IF NOT EXISTS crm_blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL,
      body_html TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT,
      read_time TEXT NOT NULL,
      image TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      seo_title TEXT,
      seo_description TEXT,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_admins_active_idx
    ON crm_admins (active)
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

  await db`
    CREATE INDEX IF NOT EXISTS crm_blog_posts_status_idx
    ON crm_blog_posts (status, published_at DESC)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_blog_posts_updated_at_idx
    ON crm_blog_posts (updated_at DESC)
  `;

  schemaReady = true;
  return true;
}
