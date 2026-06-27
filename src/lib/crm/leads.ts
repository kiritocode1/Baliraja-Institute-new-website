import crypto from "node:crypto";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import {
  appendJsonlFile,
  readJsonFile,
  writeJsonFile,
} from "@/lib/crm/local-store";

export const leadStatuses = [
  "new",
  "contacted",
  "counselled",
  "visit_scheduled",
  "enrolled",
  "not_interested",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  track: string;
  message: string | null;
  status: LeadStatus;
  assignedTo: string | null;
  notes: string | null;
  source: string;
  receivedAt: string;
  updatedAt: string;
};

export type CreateLeadInput = {
  name: string;
  phone: string;
  email: string | null;
  track: string;
  message: string | null;
  source?: string;
};

export type LeadStats = {
  total: number;
  newCount: number;
  contactedCount: number;
  enrolledCount: number;
};

const LEADS_FILE = "crm-leads.json";

function isLeadStatus(value: string): value is LeadStatus {
  return leadStatuses.includes(value as LeadStatus);
}

function mapDbLead(row: Record<string, unknown>): Lead {
  const status = String(row.status);

  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    track: String(row.track),
    message: row.message ? String(row.message) : null,
    status: isLeadStatus(status) ? status : "new",
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    notes: row.notes ? String(row.notes) : null,
    source: String(row.source ?? "admissions_form"),
    receivedAt: new Date(String(row.received_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
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
  const lead: Lead = {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    email: input.email,
    track: input.track,
    message: input.message,
    status: "new",
    assignedTo: null,
    notes: null,
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
        message,
        status,
        assigned_to,
        notes,
        source,
        received_at,
        updated_at
      )
      VALUES (
        ${lead.id},
        ${lead.name},
        ${lead.phone},
        ${lead.email},
        ${lead.track},
        ${lead.message},
        ${lead.status},
        ${lead.assignedTo},
        ${lead.notes},
        ${lead.source},
        ${lead.receivedAt},
        ${lead.updatedAt}
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
        message,
        status,
        assigned_to,
        notes,
        source,
        received_at,
        updated_at
      FROM crm_leads
      ORDER BY received_at DESC
      LIMIT ${limit}
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbLead(row));
  }

  return readJsonFile<Lead[]>(LEADS_FILE, []);
}

export async function getLeadById(id: string) {
  return (await listLeads(500)).find((lead) => lead.id === id) ?? null;
}

export async function updateLead(
  id: string,
  input: {
    status: LeadStatus;
    assignedTo: string | null;
    notes: string | null;
  },
) {
  const now = new Date().toISOString();
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      UPDATE crm_leads
      SET
        status = ${input.status},
        assigned_to = ${input.assignedTo},
        notes = ${input.notes},
        updated_at = ${now}
      WHERE id = ${id}
    `;
    return;
  }

  const leads = await readJsonFile<Lead[]>(LEADS_FILE, []);
  const next = leads.map((lead) =>
    lead.id === id ? { ...lead, ...input, updatedAt: now } : lead,
  );
  await writeJsonFile(LEADS_FILE, next);
}

export function getLeadStats(leads: Lead[]): LeadStats {
  return {
    total: leads.length,
    newCount: leads.filter((lead) => lead.status === "new").length,
    contactedCount: leads.filter((lead) => lead.status === "contacted").length,
    enrolledCount: leads.filter((lead) => lead.status === "enrolled").length,
  };
}

export function parseLeadStatus(value: string) {
  return isLeadStatus(value) ? value : null;
}
