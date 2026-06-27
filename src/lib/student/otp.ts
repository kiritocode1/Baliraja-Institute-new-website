import crypto from "node:crypto";
import {
  getStudentAuthSecret,
  STUDENT_OTP_TTL_MINUTES,
} from "@/lib/crm/config";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";

type StoredStudentOtp = {
  id: string;
  email: string;
  otpHash: string;
  expiresAt: string;
  attempts: number;
  usedAt: string | null;
  createdAt: string;
};

const OTP_FILE = "crm-student-otps.json";
const MAX_ATTEMPTS = 5;

export function generateStudentOtp() {
  return crypto.randomInt(100000, 1_000_000).toString();
}

function hashStudentOtp(email: string, otp: string) {
  return crypto
    .createHmac("sha256", getStudentAuthSecret())
    .update(`${email}:${otp}`)
    .digest("hex");
}

export async function storeStudentOtp(email: string, otp: string) {
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + STUDENT_OTP_TTL_MINUTES * 60_000);
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_student_otps (
        id,
        email,
        otp_hash,
        expires_at,
        created_at
      )
      VALUES (
        ${id},
        ${email},
        ${hashStudentOtp(email, otp)},
        ${expiresAt.toISOString()},
        ${now.toISOString()}
      )
    `;
    return;
  }

  const otps = await readJsonFile<StoredStudentOtp[]>(OTP_FILE, []);
  otps.unshift({
    id,
    email,
    otpHash: hashStudentOtp(email, otp),
    expiresAt: expiresAt.toISOString(),
    attempts: 0,
    usedAt: null,
    createdAt: now.toISOString(),
  });
  await writeJsonFile(
    OTP_FILE,
    otps.filter((entry) => new Date(entry.expiresAt).getTime() > now.getTime()),
  );
}

export async function verifyStudentOtp(email: string, otp: string) {
  const submittedHash = hashStudentOtp(email, otp);
  const now = new Date();
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const records = (await db`
      SELECT id, otp_hash, attempts
      FROM crm_student_otps
      WHERE email = ${email}
        AND used_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `) as Array<{ id: string; otp_hash: string; attempts: number }>;
    const record = records[0];

    if (!record) return false;

    await db`
      UPDATE crm_student_otps
      SET attempts = attempts + 1
      WHERE id = ${record.id}
    `;

    if (Number(record.attempts) >= MAX_ATTEMPTS) return false;
    if (record.otp_hash !== submittedHash) return false;

    await db`
      UPDATE crm_student_otps
      SET used_at = NOW()
      WHERE id = ${record.id}
    `;

    return true;
  }

  const otps = await readJsonFile<StoredStudentOtp[]>(OTP_FILE, []);
  const record = otps.find(
    (entry) =>
      entry.email === email &&
      !entry.usedAt &&
      new Date(entry.expiresAt).getTime() > now.getTime(),
  );

  if (!record) return false;

  record.attempts += 1;

  if (record.attempts > MAX_ATTEMPTS || record.otpHash !== submittedHash) {
    await writeJsonFile(OTP_FILE, otps);
    return false;
  }

  record.usedAt = now.toISOString();
  await writeJsonFile(OTP_FILE, otps);

  return true;
}
