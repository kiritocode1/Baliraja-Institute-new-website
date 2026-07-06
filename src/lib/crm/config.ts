export const CRM_SESSION_COOKIE = "baliraja_crm_session";
export const CRM_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
export const CRM_OTP_TTL_MINUTES = 10;
export const STUDENT_SESSION_COOKIE = "baliraja_student_session";
export const STUDENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const STUDENT_OTP_TTL_MINUTES = 10;

export type CrmMediaStorage = "r2" | "s3" | "blob" | "local";

export type CrmEnvStatus = {
  bootstrapAdminsConfigured: boolean;
  blobConfigured: boolean;
  databaseConfigured: boolean;
  gmailConfigured: boolean;
  mediaStorage: CrmMediaStorage;
  razorpayConfigured: boolean;
  r2Configured: boolean;
  s3Configured: boolean;
  sessionSecretConfigured: boolean;
  studentSessionSecretConfigured: boolean;
};

function getR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  );
}

function getS3Configured() {
  return Boolean(
    (process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET) &&
      (process.env.YOUR_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
      (process.env.YOUR_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY),
  );
}

function getBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getCrmMediaStorage(): CrmMediaStorage {
  if (getR2Configured()) return "r2";
  if (getS3Configured()) return "s3";
  if (getBlobConfigured()) return "blob";
  return "local";
}

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
    blobConfigured: getBlobConfigured(),
    mediaStorage: getCrmMediaStorage(),
    r2Configured: getR2Configured(),
    s3Configured: getS3Configured(),
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
