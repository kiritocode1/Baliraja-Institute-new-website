# CRM Vercel Setup

The CRM is designed for a low-cost Vercel deployment:

- Next.js App Router server actions for auth and CRM mutations
- Gmail SMTP through `nodemailer` for OTP emails
- Neon Postgres through the Vercel Marketplace for admins, CRM leads, and OTPs
- Signed HTTP-only cookies for admin sessions
- No Resend dependency

## Required environment variables

Set these in Vercel Project Settings:

```txt
CRM_BOOTSTRAP_ADMIN_EMAILS=owner@example.com,counsellor@example.com
CRM_SESSION_SECRET=replace-with-at-least-32-random-characters
GMAIL_SMTP_USER=baliraja.example@gmail.com
GMAIL_SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM_EMAIL=baliraja.example@gmail.com
GMAIL_FROM_NAME=Baliraja Institute
DATABASE_URL=postgresql://...
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
the Vercel project. The app creates the CRM tables automatically on first use:

- `crm_leads`
- `crm_admins`
- `crm_admin_otps`

Local development can run without `DATABASE_URL`; it falls back to `.data/`
files. Production should always use Neon because Vercel's filesystem is not
persistent.

## Budget notes

For the current CRM scope, the $20 Vercel tier should be protected by keeping the
system simple:

- Gmail handles OTP email, so there is no transactional email vendor bill.
- Neon stores small CRM rows; leads and OTPs are tiny relational records.
- No image or document upload is implemented yet, so Blob storage is not used.
- CRM pages are dynamic and admin-only, so traffic should be low.

If the CRM later adds document uploads, use Vercel Blob only for those files and
keep lead metadata in Neon.
