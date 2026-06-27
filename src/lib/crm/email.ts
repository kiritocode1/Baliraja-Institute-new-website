import nodemailer from "nodemailer";
import { getGmailFrom } from "@/lib/crm/config";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_SMTP_APP_PASSWORD;

  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD must be configured.",
      );
    }

    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return transporter;
}

export async function sendAdminOtpEmail(email: string, otp: string) {
  const mailer = getTransporter();
  const from = getGmailFrom();

  if (!mailer || !from) {
    console.info(`[CRM dev OTP] ${email}: ${otp}`);
    return { sent: false, devCode: otp };
  }

  await mailer.sendMail({
    from,
    to: email,
    subject: "Your Baliraja CRM login code",
    text: `Your Baliraja CRM login code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #231f20; line-height: 1.5;">
        <p>Your Baliraja CRM login code is:</p>
        <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700;">${otp}</p>
        <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
}
