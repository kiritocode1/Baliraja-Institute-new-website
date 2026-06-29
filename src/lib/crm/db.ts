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
      request_type TEXT NOT NULL DEFAULT 'admission',
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
    ALTER TABLE crm_leads
    ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'admission'
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
    CREATE TABLE IF NOT EXISTS crm_course_pages (
      id TEXT PRIMARY KEY,
      seed_key TEXT UNIQUE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      body_html TEXT NOT NULL,
      category TEXT NOT NULL,
      audience TEXT,
      exams TEXT,
      duration TEXT,
      image TEXT NOT NULL,
      image_alt TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      seo_title TEXT,
      seo_description TEXT,
      display_order INTEGER NOT NULL DEFAULT 100,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS crm_students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      guardian_name TEXT,
      guardian_phone TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS crm_student_otps (
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
    CREATE TABLE IF NOT EXISTS crm_student_enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES crm_students(id) ON DELETE CASCADE,
      course_key TEXT NOT NULL,
      course_title TEXT NOT NULL,
      course_slug TEXT,
      batch_name TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS crm_course_notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body_html TEXT NOT NULL,
      attachment_url TEXT,
      attachment_name TEXT,
      target_scope TEXT NOT NULL DEFAULT 'all',
      course_key TEXT,
      batch_name TEXT,
      student_id TEXT REFERENCES crm_students(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS crm_fee_invoices (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES crm_students(id) ON DELETE CASCADE,
      enrollment_id TEXT REFERENCES crm_student_enrollments(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount_paise INTEGER NOT NULL,
      due_date DATE,
      status TEXT NOT NULL DEFAULT 'pending',
      razorpay_order_id TEXT UNIQUE,
      receipt_number TEXT NOT NULL UNIQUE,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS crm_fee_payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES crm_fee_invoices(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES crm_students(id) ON DELETE CASCADE,
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      amount_paise INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      method TEXT,
      status TEXT NOT NULL DEFAULT 'created',
      signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
      captured_at TIMESTAMPTZ,
      raw_payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS crm_razorpay_events (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE,
      event_type TEXT NOT NULL,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      signature TEXT NOT NULL,
      raw_payload TEXT NOT NULL,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    CREATE INDEX IF NOT EXISTS crm_leads_request_type_idx
    ON crm_leads (request_type)
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

  await db`
    CREATE INDEX IF NOT EXISTS crm_course_pages_status_idx
    ON crm_course_pages (status, display_order ASC)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_course_pages_updated_at_idx
    ON crm_course_pages (updated_at DESC)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_students_active_idx
    ON crm_students (active)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_student_otps_email_idx
    ON crm_student_otps (email, created_at DESC)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_student_enrollments_student_idx
    ON crm_student_enrollments (student_id, status)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_course_notices_status_idx
    ON crm_course_notices (status, published_at DESC)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_fee_invoices_student_idx
    ON crm_fee_invoices (student_id, status, due_date)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_fee_payments_order_idx
    ON crm_fee_payments (razorpay_order_id)
  `;

  await db`
    CREATE UNIQUE INDEX IF NOT EXISTS crm_fee_payments_payment_unique_idx
    ON crm_fee_payments (razorpay_payment_id)
    WHERE razorpay_payment_id IS NOT NULL
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_razorpay_events_order_idx
    ON crm_razorpay_events (razorpay_order_id)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS crm_razorpay_events_payment_idx
    ON crm_razorpay_events (event_type, razorpay_payment_id)
  `;

  await db`
    CREATE UNIQUE INDEX IF NOT EXISTS crm_razorpay_events_payment_unique_idx
    ON crm_razorpay_events (event_type, razorpay_payment_id)
    WHERE event_id IS NULL AND razorpay_payment_id IS NOT NULL
  `;

  schemaReady = true;
  return true;
}
