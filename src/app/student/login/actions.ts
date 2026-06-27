"use server";

import { redirect } from "next/navigation";
import {
  getCrmEnvStatus,
  normalizeEmail,
  STUDENT_OTP_TTL_MINUTES,
} from "@/lib/crm/config";
import { sendStudentOtpEmail } from "@/lib/crm/email";
import {
  getActiveStudentByEmail,
  getStudentDashboard,
} from "@/lib/crm/students";
import { getStudentSession, setStudentSession } from "@/lib/student/auth";
import {
  generateStudentOtp,
  storeStudentOtp,
  verifyStudentOtp,
} from "@/lib/student/otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^[0-9]{6}$/;

export type RequestStudentOtpState = {
  status: "idle" | "error" | "sent";
  email?: string;
  message?: string;
};

export type VerifyStudentOtpState = {
  status: "idle" | "error";
  message?: string;
};

export async function requestStudentOtp(
  _prev: RequestStudentOtpState,
  formData: FormData,
): Promise<RequestStudentOtpState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const env = getCrmEnvStatus();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Enter a valid student email address." };
  }

  if (!env.databaseConfigured && process.env.NODE_ENV === "production") {
    return {
      status: "error",
      message: "Student login needs the Neon database connection.",
    };
  }

  const student = await getActiveStudentByEmail(email);

  if (student) {
    const otp = generateStudentOtp();

    try {
      await storeStudentOtp(email, otp);
      await sendStudentOtpEmail(email, otp);
    } catch (err) {
      console.error("Unable to send student OTP:", err);
      return {
        status: "error",
        message: "The login code could not be sent. Check the Gmail settings.",
      };
    }
  }

  return {
    status: "sent",
    email,
    message: `If this email belongs to an active student, a ${STUDENT_OTP_TTL_MINUTES}-minute code has been sent.`,
  };
}

export async function verifyStudentOtpAction(
  _prev: VerifyStudentOtpState,
  formData: FormData,
): Promise<VerifyStudentOtpState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const otp = String(formData.get("otp") ?? "").trim();

  if (!EMAIL_RE.test(email) || !OTP_RE.test(otp)) {
    return {
      status: "error",
      message: "Enter the 6-digit code from your email.",
    };
  }

  const student = await getActiveStudentByEmail(email);

  if (!student) {
    return {
      status: "error",
      message: "This login code is invalid or expired.",
    };
  }

  const valid = await verifyStudentOtp(email, otp);

  if (!valid) {
    return {
      status: "error",
      message: "This login code is invalid or expired.",
    };
  }

  await setStudentSession({ studentId: student.id, email: student.email });
  redirect("/student");
}

export async function redirectIfStudentLoggedIn() {
  const session = await getStudentSession();

  if (!session) return;

  const dashboard = await getStudentDashboard(session.studentId);

  if (dashboard) redirect("/student");
}
