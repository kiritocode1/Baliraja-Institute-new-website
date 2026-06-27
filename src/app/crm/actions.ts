"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdminSession } from "@/lib/crm/auth";
import { parseLeadStatus, updateLead } from "@/lib/crm/leads";

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
