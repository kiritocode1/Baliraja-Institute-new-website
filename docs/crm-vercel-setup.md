# CRM Vercel Setup

The CRM is designed for a low-cost Vercel deployment:

- Next.js App Router server actions for auth and CRM mutations
- Gmail SMTP through `nodemailer` for OTP emails
- Neon Postgres through the Vercel Marketplace for admins, CRM leads, OTPs, and
  blog/course content
- Vercel Blob for blog images, course images, and future CRM files/document
  uploads
- Signed HTTP-only cookies for separate admin and student sessions
- Razorpay Orders, Checkout, and signed webhooks for student fee invoices
- No Resend dependency

## Required environment variables

Set these in Vercel Project Settings:

```txt
CRM_BOOTSTRAP_ADMIN_EMAILS=owner@example.com,counsellor@example.com
CRM_SESSION_SECRET=replace-with-at-least-32-random-characters
STUDENT_SESSION_SECRET=replace-with-a-different-32-random-character-secret
GMAIL_SMTP_USER=baliraja.example@gmail.com
GMAIL_SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM_EMAIL=baliraja.example@gmail.com
GMAIL_FROM_NAME=Baliraja Institute
DATABASE_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_WEBHOOK_SECRET=replace-with-razorpay-webhook-secret
```

## Gmail setup

Use a dedicated Gmail or Google Workspace mailbox for CRM login emails.

1. Enable 2-Step Verification on the Gmail account.
2. Create a Gmail App Password for mail sending.
3. Store the Gmail address in `GMAIL_SMTP_USER`.
4. Store the app password in `GMAIL_SMTP_APP_PASSWORD`.

Do not use the normal Gmail account password.

## Admin access

`crm_admins` is the source of truth for who can log in. The login flow only sends
an OTP when the normalized email exists in that table and is active.

`CRM_BOOTSTRAP_ADMIN_EMAILS` is only a first-run seed. When the admin table is
empty, the app inserts those comma-separated emails as active admins. After that,
manage admins from the CRM dashboard.

Examples:

```txt
CRM_BOOTSTRAP_ADMIN_EMAILS=founder@balirajaacademy.in,office@balirajaacademy.in
```

## Database

Use Neon Postgres from the Vercel Marketplace so `DATABASE_URL` is injected into
the Vercel project. The app creates the CRM and student tables automatically on
first use:

- `crm_leads`
- `crm_admins`
- `crm_admin_otps`
- `crm_blog_posts`
- `crm_course_pages`
- `crm_students`
- `crm_student_otps`
- `crm_student_enrollments`
- `crm_course_notices`
- `crm_fee_invoices`
- `crm_fee_payments`
- `crm_razorpay_events`

Local development can run without `DATABASE_URL`; it falls back to `.data/`
files. Production should always use Neon because Vercel's filesystem is not
persistent.

## Blob storage

Use Vercel Blob for blog/course images and future CRM file storage, such as
notice PDFs, concession documents, and gallery uploads. The app includes a CRM
Blob helper under `src/lib/crm/blob.ts`, an authenticated media upload endpoint
at `/api/crm/media/upload`, and reads the standard `BLOB_READ_WRITE_TOKEN`
environment variable.

Create and connect a Blob store from the linked project:

```bash
vercel blob create-store baliraja-crm --access private --yes
```

If your installed Vercel CLI exposes the older command shape, use:

```bash
vercel blob store add baliraja-crm
```

After connecting the store, pull env vars locally:

```bash
vercel env pull .env.local --yes
```

## Budget notes

For the current CRM scope, the $20 Vercel tier should be protected by keeping the
system simple:

- Gmail handles OTP email, so there is no transactional email vendor bill.
- Neon stores small CRM rows; leads and OTPs are tiny relational records.
- Blob should only store files; lead/admin/blog/course metadata stays in Neon.
- CRM pages are dynamic and admin-only, so traffic should be low.

If the CRM later adds document uploads, use Vercel Blob only for those files and
keep lead metadata in Neon.

## Student portal

Admins manage student records, enrollments, notices, and fees from `/crm`.
Students log in at `/student/login` with Gmail OTP. The student session uses
`STUDENT_SESSION_SECRET` and a separate cookie from the admin CRM session.

Only active student rows can receive OTPs. Unknown or inactive email addresses
get the same generic response as valid emails, but no code is sent.

## Razorpay fees

The student fee flow uses one-time invoices:

1. Admin creates an invoice in `/crm`.
2. Student opens `/student/fees` and starts Razorpay Checkout. Creating a
   Razorpay order only attaches the order id to the invoice; it does not mark
   the invoice paid or processing.
3. Repeated clicks reuse the pending order. Once the browser callback is
   verified, the invoice moves to `processing` and the Pay button is disabled so
   the student cannot accidentally pay twice while the webhook is pending.
4. The browser callback verifies `razorpay_order_id`,
   `razorpay_payment_id`, and `razorpay_signature`, then fetches the payment
   from Razorpay and checks order id, amount, currency, and payment status.
5. The Razorpay webhook at `/api/razorpay/webhook` verifies
   `x-razorpay-signature` and marks the invoice paid only for
   `payment.captured`.
6. Raw webhook payloads are stored in `crm_razorpay_events` for idempotency and
   audit. Duplicate webhooks return success only when the earlier copy was
   already processed; unprocessed duplicates are retried.
7. `payment.failed` returns a processing invoice to pending. `payment.refunded`
   can mark a fully refunded invoice as refunded.

In Razorpay Dashboard, configure the webhook URL as:

```txt
https://your-production-domain.example/api/razorpay/webhook
```

Subscribe to:

- `payment.captured`
- `payment.failed`
- `payment.refunded`

Use the same dashboard webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
