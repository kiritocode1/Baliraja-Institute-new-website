"use server";

import { createLead, parseLeadRequestType } from "@/lib/crm/leads";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<
    Record<"name" | "phone" | "email" | "track" | "requestType", string>
  >;
};

const PHONE_RE = /^[0-9+\-\s()]{10,18}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // Honeypot — bots fill hidden fields, humans don't.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "success", message: "Thank you. We'll be in touch." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const requestType = parseLeadRequestType(
    String(formData.get("requestType") ?? ""),
  );
  const message = String(formData.get("message") ?? "").trim();

  const errors: EnquiryState["errors"] = {};
  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!PHONE_RE.test(phone))
    errors.phone = "Enter a valid phone number we can call you on.";
  if (email && !EMAIL_RE.test(email))
    errors.email = "That email address doesn't look right.";
  if (!track) errors.track = "Choose the exam you're preparing for.";
  if (!requestType) errors.requestType = "Choose what this enquiry is about.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const enquiry = {
    name,
    phone,
    email: email || null,
    track,
    requestType: requestType ?? "admission",
    message: message || null,
  };

  try {
    await createLead(enquiry);
  } catch (err) {
    // Never block the visitor's confirmation because the CRM write failed.
    console.error("Enquiry received but not persisted:", enquiry, err);
  }

  return {
    status: "success",
    message: `Thank you, ${name.split(" ")[0]}. Your enquiry for ${track} has reached us; our team will call you within two working days.`,
  };
}
