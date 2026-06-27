export const CRM_SESSION_COOKIE = "baliraja_crm_session";
export const CRM_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
export const CRM_OTP_TTL_MINUTES = 10;

export type CrmEnvStatus = {
  adminEmailsConfigured: boolean;
  databaseConfigured: boolean;
  gmailConfigured: boolean;
  sessionSecretConfigured: boolean;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminEmails() {
  return new Set(
    (process.env.CRM_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string) {
  return getAdminEmails().has(normalizeEmail(email));
}

export function getCrmEnvStatus(): CrmEnvStatus {
  return {
    adminEmailsConfigured: getAdminEmails().size > 0,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    gmailConfigured: Boolean(
      process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_APP_PASSWORD,
    ),
    sessionSecretConfigured: Boolean(
      process.env.CRM_SESSION_SECRET || process.env.AUTH_SECRET,
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

export function getGmailFrom() {
  const email = process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_SMTP_USER;
  const name = process.env.GMAIL_FROM_NAME || "Baliraja CRM";

  if (!email) return null;

  return `${name} <${email}>`;
}
