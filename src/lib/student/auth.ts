import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getStudentAuthSecret,
  normalizeEmail,
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_MAX_AGE_SECONDS,
} from "@/lib/crm/config";

export type StudentSession = {
  studentId: string;
  email: string;
  role: "student";
  issuedAt: number;
  expiresAt: number;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getStudentAuthSecret())
    .update(payload)
    .digest("base64url");
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createStudentSessionToken(input: {
  studentId: string;
  email: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const session: StudentSession = {
    studentId: input.studentId,
    email: normalizeEmail(input.email),
    role: "student",
    issuedAt: now,
    expiresAt: now + STUDENT_SESSION_MAX_AGE_SECONDS,
  };
  const payload = base64Url(JSON.stringify(session));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifyStudentSessionToken(token: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return null;
  if (!timingSafeEqual(signPayload(payload), signature)) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as StudentSession;

    if (session.role !== "student") return null;
    if (!session.studentId || !session.email) return null;
    if (session.expiresAt < Math.floor(Date.now() / 1000)) return null;

    return session;
  } catch {
    return null;
  }
}

export async function setStudentSession(input: {
  studentId: string;
  email: string;
}) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: STUDENT_SESSION_COOKIE,
    value: createStudentSessionToken(input),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STUDENT_SESSION_MAX_AGE_SECONDS,
  });
}

export async function getStudentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (!token) return null;

  return verifyStudentSessionToken(token);
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);
}

export async function requireStudentSession() {
  const session = await getStudentSession();

  if (!session) redirect("/student/login");

  return session;
}
