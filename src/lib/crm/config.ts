export const CRM_SESSION_COOKIE = "baliraja_crm_session";
export const CRM_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
export const CRM_OTP_TTL_MINUTES = 10;
export const STUDENT_SESSION_COOKIE = "baliraja_student_session";
export const STUDENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const STUDENT_OTP_TTL_MINUTES = 10;

export type CrmEnvStatus = {
  bootstrapAdminsConfigured: boolean;
  databaseConfigured: boolean;
  gmailConfigured: boolean;
  razorpayConfigured: boolean;
  s3Configured: boolean;
  sessionSecretConfigured: boolean;
  studentSessionSecretConfigured: boolean;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getBootstrapAdminEmails() {
  return new Set(
    (
      process.env.CRM_BOOTSTRAP_ADMIN_EMAILS ??
      process.env.CRM_ADMIN_EMAILS ??
      ""
    )
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean),
  );
}

export function getCrmEnvStatus(): CrmEnvStatus {
  return {
    bootstrapAdminsConfigured: getBootstrapAdminEmails().size > 0,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    gmailConfigured: Boolean(
      process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_APP_PASSWORD,
    ),
    razorpayConfigured: Boolean(
      process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_WEBHOOK_SECRET,
    ),
    s3Configured: Boolean(
      (process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET) &&
        (process.env.YOUR_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
        (process.env.YOUR_SECRET_ACCESS_KEY ||
          process.env.AWS_SECRET_ACCESS_KEY),
    ),
    sessionSecretConfigured: Boolean(
      process.env.CRM_SESSION_SECRET || process.env.AUTH_SECRET,
    ),
    studentSessionSecretConfigured: Boolean(
      process.env.STUDENT_SESSION_SECRET || process.env.AUTH_SECRET,
    ),
  };
}

export function getAuthSecret() {
  const secret = process.env.CRM_SESSION_SECRET || process.env.AUTH_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CRM_SESSION_SECRET or AUTH_SECRET must be configured in production.",
    );
  }

  return "baliraja-local-dev-crm-secret";
}

export function getStudentAuthSecret() {
  const secret = process.env.STUDENT_SESSION_SECRET || process.env.AUTH_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "STUDENT_SESSION_SECRET or AUTH_SECRET must be configured in production.",
    );
  }

  return "baliraja-local-dev-student-secret";
}

export function getGmailFrom() {
  const email = process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_SMTP_USER;
  const name = process.env.GMAIL_FROM_NAME || "Baliraja CRM";

  if (!email) return null;

  return `${name} <${email}>`;
}
