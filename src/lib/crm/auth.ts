import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CRM_SESSION_COOKIE,
  CRM_SESSION_MAX_AGE_SECONDS,
  getAuthSecret,
  normalizeEmail,
} from "@/lib/crm/config";

export type AdminSession = {
  email: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createSessionToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const session: AdminSession = {
    email: normalizeEmail(email),
    role: "admin",
    issuedAt: now,
    expiresAt: now + CRM_SESSION_MAX_AGE_SECONDS,
  };
  const payload = base64Url(JSON.stringify(session));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): AdminSession | null {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return null;
  if (!timingSafeEqual(signPayload(payload), signature)) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;

    if (session.role !== "admin") return null;
    if (session.expiresAt < Math.floor(Date.now() / 1000)) return null;

    return session;
  } catch {
    return null;
  }
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: CRM_SESSION_COOKIE,
    value: createSessionToken(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CRM_SESSION_MAX_AGE_SECONDS,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CRM_SESSION_COOKIE)?.value;

  if (!token) return null;

  return verifySessionToken(token);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CRM_SESSION_COOKIE);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) redirect("/crm/login");

  return session;
}
