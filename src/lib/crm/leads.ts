import crypto from "node:crypto";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import {
  appendJsonlFile,
  readJsonFile,
  writeJsonFile,
} from "@/lib/crm/local-store";
import {
  type AdmissionFormInput,
  categoryValues,
  programValues,
  referralValues,
} from "@/schemas/admission.schema";

export const leadStatuses = [
  "new",
  "contacted",
  "counselled",
  "visit_scheduled",
  "enrolled",
  "not_interested",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export const leadRequestTypes = [
  "admission",
  "scholarship",
  "course_guidance",
  "campus_visit",
] as const;

export type LeadRequestType = (typeof leadRequestTypes)[number];

export const concessionStatuses = [
  "requested",
  "approved",
  "rejected",
] as const;

export type ConcessionStatus = (typeof concessionStatuses)[number];
export type StudentCategory = (typeof categoryValues)[number];

export type AdmissionLeadDetails = {
  gender: AdmissionFormInput["gender"] | null;
  guardianName: string | null;
  dateOfBirth: string | null;
  fullAddress: string | null;
  mobile2: string | null;
  education: AdmissionFormInput["education"] | null;
  desiredPrograms: AdmissionFormInput["desiredPrograms"];
  weightKg: number | null;
  heightCm: number | null;
  chestCm: number | null;
  category: StudentCategory | null;
  maharashtraDomicile: boolean | null;
  referralSources: AdmissionFormInput["referralSources"];
  otherReferralDetail: string | null;
  declarationAgreed: boolean;
};

export type Lead = AdmissionLeadDetails & {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  track: string;
  requestType: LeadRequestType;
  message: string | null;
  status: LeadStatus;
  assignedTo: string | null;
  notes: string | null;
  concessionStatus: ConcessionStatus | null;
  concessionNote: string | null;
  source: string;
  receivedAt: string;
  updatedAt: string;
};

export type CreateLeadInput = Partial<AdmissionLeadDetails> & {
  name: string;
  phone: string;
  email: string | null;
  track: string;
  message: string | null;
  requestType?: LeadRequestType;
  source?: string;
};

export type LeadStats = {
  total: number;
  newCount: number;
  contactedCount: number;
  enrolledCount: number;
  scholarshipCount: number;
};

const LEADS_FILE = "crm-leads.json";

function isLeadStatus(value: string): value is LeadStatus {
  return leadStatuses.includes(value as LeadStatus);
}

function isLeadRequestType(value: string): value is LeadRequestType {
  return leadRequestTypes.includes(value as LeadRequestType);
}

function normalizeLeadRequestType(value: unknown): LeadRequestType {
  const normalized = String(value ?? "").trim();
  return isLeadRequestType(normalized) ? normalized : "admission";
}

function maybeString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function maybeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseJsonValue(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseProgramList(
  value: unknown,
): AdmissionLeadDetails["desiredPrograms"] {
  const parsed = parseJsonValue(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((item): item is (typeof programValues)[number] =>
    programValues.includes(item),
  );
}

function parseReferralList(
  value: unknown,
): AdmissionLeadDetails["referralSources"] {
  const parsed = parseJsonValue(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((item): item is (typeof referralValues)[number] =>
    referralValues.includes(item),
  );
}

function parseEducation(value: unknown): AdmissionLeadDetails["education"] {
  const parsed = parseJsonValue(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  return parsed as AdmissionLeadDetails["education"];
}

function parseCategory(value: unknown): StudentCategory | null {
  const normalized = String(value ?? "").trim();
  return (categoryValues as readonly string[]).includes(normalized)
    ? (normalized as StudentCategory)
    : null;
}

function parseConcessionStatus(value: unknown): ConcessionStatus | null {
  const normalized = String(value ?? "").trim();
  return (concessionStatuses as readonly string[]).includes(normalized)
    ? (normalized as ConcessionStatus)
    : null;
}

function normalizeAdmissionDetails(
  input: Partial<AdmissionLeadDetails>,
): AdmissionLeadDetails {
  return {
    gender: input.gender ?? null,
    guardianName: input.guardianName ?? null,
    dateOfBirth: input.dateOfBirth ?? null,
    fullAddress: input.fullAddress ?? null,
    mobile2: input.mobile2 ?? null,
    education: input.education ?? null,
    desiredPrograms: input.desiredPrograms ?? [],
    weightKg: input.weightKg ?? null,
    heightCm: input.heightCm ?? null,
    chestCm: input.chestCm ?? null,
    category: input.category ?? null,
    maharashtraDomicile: input.maharashtraDomicile ?? null,
    referralSources: input.referralSources ?? [],
    otherReferralDetail: input.otherReferralDetail ?? null,
    declarationAgreed: input.declarationAgreed ?? false,
  };
}

function mapDbLead(row: Record<string, unknown>): Lead {
  const status = String(row.status);
  const gender = String(row.gender ?? "");

  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    track: String(row.track),
    requestType: normalizeLeadRequestType(row.request_type),
    message: row.message ? String(row.message) : null,
    status: isLeadStatus(status) ? status : "new",
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    notes: row.notes ? String(row.notes) : null,
    source: String(row.source ?? "admissions_form"),
    receivedAt: new Date(String(row.received_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    gender: gender === "male" || gender === "female" ? gender : null,
    guardianName: maybeString(row.guardian_name),
    dateOfBirth: maybeString(row.date_of_birth),
    fullAddress: maybeString(row.full_address),
    mobile2: maybeString(row.mobile2),
    education: parseEducation(row.education),
    desiredPrograms: parseProgramList(row.desired_programs),
    weightKg: maybeNumber(row.weight_kg),
    heightCm: maybeNumber(row.height_cm),
    chestCm: maybeNumber(row.chest_cm),
    category: parseCategory(row.category),
    maharashtraDomicile:
      row.maharashtra_domicile === null ||
      row.maharashtra_domicile === undefined
        ? null
        : row.maharashtra_domicile === true,
    referralSources: parseReferralList(row.referral_sources),
    otherReferralDetail: maybeString(row.other_referral_detail),
    declarationAgreed: row.declaration_agreed === true,
    concessionStatus: parseConcessionStatus(row.concession_status),
    concessionNote: maybeString(row.concession_note),
  };
}

function normalizeStoredLead(lead: Lead): Lead {
  const details = normalizeAdmissionDetails(lead);
  return {
    ...lead,
    ...details,
    requestType: normalizeLeadRequestType(lead.requestType),
    status: isLeadStatus(lead.status) ? lead.status : "new",
    concessionStatus: parseConcessionStatus(lead.concessionStatus),
    concessionNote: lead.concessionNote ?? null,
  };
}

export function getStatusLabel(status: LeadStatus) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function createLead(input: CreateLeadInput) {
  const now = new Date().toISOString();
  const admissionDetails = normalizeAdmissionDetails(input);
  const lead: Lead = {
    ...admissionDetails,
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    email: input.email,
    track: input.track,
    requestType: input.requestType ?? "admission",
    message: input.message,
    status: "new",
    assignedTo: null,
    notes: null,
    concessionStatus: input.requestType === "scholarship" ? "requested" : null,
    concessionNote: null,
    source: input.source ?? "admissions_form",
    receivedAt: now,
    updatedAt: now,
  };
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_leads (
        id,
        name,
        phone,
        email,
        track,
        request_type,
        message,
        status,
        assigned_to,
        notes,
        concession_status,
        concession_note,
        source,
        received_at,
        updated_at,
        gender,
        guardian_name,
        date_of_birth,
        full_address,
        mobile2,
        education,
        desired_programs,
        weight_kg,
        height_cm,
        chest_cm,
        category,
        maharashtra_domicile,
        referral_sources,
        other_referral_detail,
        declaration_agreed
      )
      VALUES (
        ${lead.id},
        ${lead.name},
        ${lead.phone},
        ${lead.email},
        ${lead.track},
        ${lead.requestType},
        ${lead.message},
        ${lead.status},
        ${lead.assignedTo},
        ${lead.notes},
        ${lead.concessionStatus},
        ${lead.concessionNote},
        ${lead.source},
        ${lead.receivedAt},
        ${lead.updatedAt},
        ${lead.gender},
        ${lead.guardianName},
        ${lead.dateOfBirth},
        ${lead.fullAddress},
        ${lead.mobile2},
        ${JSON.stringify(lead.education)}::jsonb,
        ${JSON.stringify(lead.desiredPrograms)}::jsonb,
        ${lead.weightKg},
        ${lead.heightCm},
        ${lead.chestCm},
        ${lead.category},
        ${lead.maharashtraDomicile},
        ${JSON.stringify(lead.referralSources)}::jsonb,
        ${lead.otherReferralDetail},
        ${lead.declarationAgreed}
      )
    `;
    return lead;
  }

  const leads = await readJsonFile<Lead[]>(LEADS_FILE, []);
  leads.unshift(lead);
  await writeJsonFile(LEADS_FILE, leads);
  await appendJsonlFile("enquiries.jsonl", lead);

  return lead;
}

export async function listLeads(limit = 100) {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        name,
        phone,
        email,
        track,
        request_type,
        message,
        status,
        assigned_to,
        notes,
        source,
        received_at,
        updated_at,
        gender,
        guardian_name,
        date_of_birth,
        full_address,
        mobile2,
        education,
        desired_programs,
        weight_kg,
        height_cm,
        chest_cm,
        category,
        maharashtra_domicile,
        referral_sources,
        other_referral_detail,
        declaration_agreed,
        concession_status,
        concession_note
      FROM crm_leads
      ORDER BY received_at DESC
      LIMIT ${limit}
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbLead(row));
  }

  const leads = await readJsonFile<Lead[]>(LEADS_FILE, []);
  return leads.map((lead) => normalizeStoredLead(lead));
}

export async function getLeadById(id: string) {
  return (await listLeads(500)).find((lead) => lead.id === id) ?? null;
}

export async function updateLead(
  id: string,
  input: {
    status: LeadStatus;
    requestType: LeadRequestType;
    assignedTo: string | null;
    notes: string | null;
    concessionStatus?: ConcessionStatus | null;
    concessionNote?: string | null;
  },
) {
  const now = new Date().toISOString();
  const ready = await ensureCrmSchema();
  const db = getSql();
  const existing = await getLeadById(id);
  const concessionStatus =
    input.concessionStatus !== undefined
      ? input.concessionStatus
      : (existing?.concessionStatus ?? null);
  const concessionNote =
    input.concessionNote !== undefined
      ? input.concessionNote
      : (existing?.concessionNote ?? null);

  if (ready && db) {
    await db`
      UPDATE crm_leads
      SET
        status = ${input.status},
        request_type = ${input.requestType},
        assigned_to = ${input.assignedTo},
        notes = ${input.notes},
        concession_status = ${concessionStatus},
        concession_note = ${concessionNote},
        updated_at = ${now}
      WHERE id = ${id}
    `;
    return;
  }

  const leads = await readJsonFile<Lead[]>(LEADS_FILE, []);
  const next = leads.map((lead) =>
    lead.id === id
      ? { ...lead, ...input, concessionStatus, concessionNote, updatedAt: now }
      : lead,
  );
  await writeJsonFile(LEADS_FILE, next);
}

export function parseConcessionStatusInput(value: string) {
  return parseConcessionStatus(value);
}

export function getLeadStats(leads: Lead[]): LeadStats {
  return {
    total: leads.length,
    newCount: leads.filter((lead) => lead.status === "new").length,
    contactedCount: leads.filter((lead) => lead.status === "contacted").length,
    enrolledCount: leads.filter((lead) => lead.status === "enrolled").length,
    scholarshipCount: leads.filter((lead) => lead.requestType === "scholarship")
      .length,
  };
}

export function parseLeadStatus(value: string) {
  return isLeadStatus(value) ? value : null;
}

export function parseLeadRequestType(value: string) {
  return isLeadRequestType(value) ? value : null;
}

export function getLeadRequestTypeLabel(type: LeadRequestType) {
  switch (type) {
    case "scholarship":
      return "Scholarship";
    case "course_guidance":
      return "Course guidance";
    case "campus_visit":
      return "Campus visit";
    case "admission":
      return "Admission";
  }
}
