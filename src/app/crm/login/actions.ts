"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/crm/admins";
import { getAdminSession, setAdminSession } from "@/lib/crm/auth";
import {
  CRM_OTP_TTL_MINUTES,
  getCrmEnvStatus,
  normalizeEmail,
} from "@/lib/crm/config";
import { sendAdminOtpEmail } from "@/lib/crm/email";
import { generateOtp, storeOtp, verifyOtp } from "@/lib/crm/otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^[0-9]{6}$/;

export type RequestOtpState = {
  status: "idle" | "error" | "sent";
  email?: string;
  message?: string;
};

export type VerifyOtpState = {
  status: "idle" | "error";
  message?: string;
};

export async function requestOtp(
  _prev: RequestOtpState,
  formData: FormData,
): Promise<RequestOtpState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const env = getCrmEnvStatus();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Enter a valid admin email address." };
  }

  if (!env.databaseConfigured && !env.bootstrapAdminsConfigured) {
    return {
      status: "error",
      message:
        "Add a database admin row or set CRM_BOOTSTRAP_ADMIN_EMAILS once.",
    };
  }

  if (await isAdminEmail(email)) {
    const otp = generateOtp();

    try {
      await storeOtp(email, otp);
      await sendAdminOtpEmail(email, otp);
    } catch (err) {
      console.error("Unable to send CRM OTP:", err);
      return {
        status: "error",
        message: "The login code could not be sent. Check the Gmail settings.",
      };
    }
  }

  return {
    status: "sent",
    email,
    message: `If this email is on the admin list, a ${CRM_OTP_TTL_MINUTES}-minute code has been sent.`,
  };
}

export async function verifyOtpAction(
  _prev: VerifyOtpState,
  formData: FormData,
): Promise<VerifyOtpState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const otp = String(formData.get("otp") ?? "").trim();

  if (!EMAIL_RE.test(email) || !OTP_RE.test(otp)) {
    return {
      status: "error",
      message: "Enter the 6-digit code from your email.",
    };
  }

  if (!(await isAdminEmail(email))) {
    return {
      status: "error",
      message: "This login code is invalid or expired.",
    };
  }

  const valid = await verifyOtp(email, otp);

  if (!valid) {
    return {
      status: "error",
      message: "This login code is invalid or expired.",
    };
  }

  await setAdminSession(email);
  redirect("/crm");
}

export async function redirectIfLoggedIn() {
  const session = await getAdminSession();

  if (session) redirect("/crm");
}
