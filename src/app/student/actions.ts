"use server";

import { redirect } from "next/navigation";
import { clearStudentSession } from "@/lib/student/auth";

export async function logoutStudentAction() {
  await clearStudentSession();
  redirect("/student/login");
}
