"use server";

import { createLead, parseLeadRequestType } from "@/lib/crm/leads";
import {
  type AdmissionFormInput,
  admissionFormSchema,
  admissionProgramLabels,
} from "@/schemas/admission.schema";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function optionalText(formData: FormData, name: string) {
  return text(formData, name) || undefined;
}

function numberValue(formData: FormData, name: string) {
  const raw = text(formData, name);
  return raw ? Number(raw) : undefined;
}

function admissionValues(formData: FormData) {
  const education: Partial<AdmissionFormInput["education"]> = {};
  const tenthPercentage = text(formData, "education.tenth.percentage");
  const twelfthStream = text(formData, "education.twelfth.stream");
  const twelfthPercentage = text(formData, "education.twelfth.percentage");
  const graduationCourse = text(formData, "education.graduation.course");
  const graduationPercentage = text(
    formData,
    "education.graduation.percentage",
  );

  if (tenthPercentage) {
    education.tenth = { percentage: Number(tenthPercentage) };
  }

  if (twelfthStream || twelfthPercentage) {
    education.twelfth = {
      ...(twelfthStream ? { stream: twelfthStream } : {}),
      percentage: Number(twelfthPercentage),
    };
  }

  if (graduationCourse || graduationPercentage) {
    education.graduation = {
      course: graduationCourse,
      ...(graduationPercentage
        ? { percentage: Number(graduationPercentage) }
        : {}),
    };
  }

  return {
    fullName: text(formData, "fullName"),
    gender: text(formData, "gender"),
    guardianName: text(formData, "guardianName"),
    dateOfBirth: text(formData, "dateOfBirth"),
    fullAddress: text(formData, "fullAddress"),
    mobile1: text(formData, "mobile1"),
    mobile2: optionalText(formData, "mobile2"),
    email: optionalText(formData, "email"),
    category: optionalText(formData, "category"),
    maharashtraDomicile: formData.get("maharashtraDomicile") === "true",
    education,
    desiredPrograms: formData.getAll("desiredPrograms").map(String),
    weightKg: numberValue(formData, "weightKg"),
    heightCm: numberValue(formData, "heightCm"),
    chestCm: numberValue(formData, "chestCm"),
    referralSources: formData.getAll("referralSources").map(String),
    otherReferralDetail: optionalText(formData, "otherReferralDetail"),
    declarationAgreed: formData.get("declarationAgreed") === "true",
  };
}

function fieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] ??= issue.message;
  }

  return errors;
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // Honeypot — bots fill hidden fields, humans don't.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "success", message: "Thank you. We'll be in touch." };
  }

  const parsed = admissionFormSchema.safeParse(admissionValues(formData));
  const requestType = parseLeadRequestType(
    String(formData.get("requestType") ?? ""),
  );

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const admission = parsed.data;
  const track = admission.desiredPrograms
    .map((program) => admissionProgramLabels[program])
    .join(", ");
  const enquiry = {
    name: admission.fullName,
    phone: admission.mobile1,
    email: admission.email ?? null,
    track,
    requestType: requestType ?? "admission",
    message: null,
    source: "admission_form",
    gender: admission.gender,
    guardianName: admission.guardianName,
    dateOfBirth: admission.dateOfBirth,
    fullAddress: admission.fullAddress,
    mobile2: admission.mobile2 ?? null,
    education: admission.education ?? null,
    desiredPrograms: admission.desiredPrograms,
    weightKg: admission.weightKg ?? null,
    heightCm: admission.heightCm ?? null,
    chestCm: admission.chestCm ?? null,
    category: admission.category ?? null,
    maharashtraDomicile: admission.maharashtraDomicile ?? null,
    referralSources: admission.referralSources,
    otherReferralDetail: admission.otherReferralDetail ?? null,
    declarationAgreed: admission.declarationAgreed,
  };

  try {
    await createLead(enquiry);
  } catch (err) {
    // Never block the visitor's confirmation because the CRM write failed.
    console.error("Enquiry received but not persisted:", enquiry, err);
  }

  return {
    status: "success",
    message: `Thank you, ${admission.fullName.split(" ")[0]}. Your admission form for ${track} has reached us; our team will call you within two working days.`,
  };
}
