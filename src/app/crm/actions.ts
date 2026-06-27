"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addAdmin, setAdminActive } from "@/lib/crm/admins";
import { clearAdminSession, requireAdminSession } from "@/lib/crm/auth";
import { normalizeEmail } from "@/lib/crm/config";
import { parseLeadStatus, updateLead } from "@/lib/crm/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function logoutAction() {
  await clearAdminSession();
  redirect("/crm/login");
}

export async function updateLeadAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const status = parseLeadStatus(String(formData.get("status") ?? ""));
  const assignedTo = String(formData.get("assignedTo") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id || !status) {
    throw new Error("Invalid lead update.");
  }

  await updateLead(id, { status, assignedTo, notes });
  revalidatePath("/crm");
}

export async function addAdminAction(formData: FormData) {
  await requireAdminSession();

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const name = String(formData.get("name") ?? "").trim() || null;

  if (!EMAIL_RE.test(email)) {
    throw new Error("Invalid admin email.");
  }

  await addAdmin({ email, name });
  revalidatePath("/crm");
}

export async function setAdminActiveAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const active = String(formData.get("active") ?? "") === "true";

  if (!id) {
    throw new Error("Invalid admin update.");
  }

  if (email === session.email && !active) {
    throw new Error("You cannot deactivate your own admin access.");
  }

  await setAdminActive(id, active);
  revalidatePath("/crm");
}
