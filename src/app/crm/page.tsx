import type { Metadata } from "next";
import { logoutAction, updateLeadAction } from "@/app/crm/actions";
import { requireAdminSession } from "@/lib/crm/auth";
import { getCrmEnvStatus } from "@/lib/crm/config";
import {
  getLeadStats,
  getStatusLabel,
  type Lead,
  leadStatuses,
  listLeads,
} from "@/lib/crm/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-line bg-parchment p-5">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl leading-none text-oxblood">
        {value}
      </p>
    </div>
  );
}

function EnvPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] ${
        ok
          ? "border-brass text-brass-deep"
          : "border-destructive/40 text-destructive"
      }`}
    >
      {label}: {ok ? "Ready" : "Missing"}
    </span>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <article className="grid gap-5 border-t border-line py-6 xl:grid-cols-[minmax(14rem,1.1fr)_minmax(13rem,0.9fr)_minmax(24rem,1.4fr)]">
      <div>
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
          {formatDate(lead.receivedAt)}
        </p>
        <h2 className="mt-2 font-display text-2xl leading-tight text-oxblood">
          {lead.name}
        </h2>
        <div className="mt-3 flex flex-col gap-1 text-sm text-ink-soft">
          <a href={`tel:${lead.phone}`} className="w-fit hover:text-oxblood">
            {lead.phone}
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="w-fit hover:text-oxblood"
            >
              {lead.email}
            </a>
          )}
        </div>
      </div>

      <div>
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
          Track
        </p>
        <p className="mt-2 text-base font-medium text-ink">{lead.track}</p>
        {lead.message && (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {lead.message}
          </p>
        )}
      </div>

      <form action={updateLeadAction} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={lead.id} />
        <div>
          <label
            htmlFor={`status-${lead.id}`}
            className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Status
          </label>
          <select
            id={`status-${lead.id}`}
            name="status"
            defaultValue={lead.status}
            className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
          >
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={`assigned-${lead.id}`}
            className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Assigned to
          </label>
          <input
            id={`assigned-${lead.id}`}
            name="assignedTo"
            defaultValue={lead.assignedTo ?? ""}
            placeholder="Counsellor"
            className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor={`notes-${lead.id}`}
            className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Internal notes
          </label>
          <textarea
            id={`notes-${lead.id}`}
            name="notes"
            rows={3}
            defaultValue={lead.notes ?? ""}
            placeholder="Call notes, visit timing, concession context..."
            className="w-full resize-none border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
          />
        </div>
        <button
          type="submit"
          className="w-fit bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
        >
          Save lead
        </button>
      </form>
    </article>
  );
}

export default async function CrmPage() {
  const [session, leads] = await Promise.all([
    requireAdminSession(),
    listLeads(),
  ]);
  const stats = getLeadStats(leads);
  const env = getCrmEnvStatus();

  return (
    <section className="bg-parchment-deep px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[100rem]">
        <div className="flex flex-col gap-5 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
              Baliraja CRM
            </p>
            <h1 className="mt-4 font-display text-5xl leading-none text-oxblood sm:text-6xl">
              Admission leads
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Signed in as {session.email}. New admissions form submissions land
              here with status, assignment, and internal notes.
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="border border-line-strong px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total leads" value={stats.total} />
          <Metric label="New" value={stats.newCount} />
          <Metric label="Contacted" value={stats.contactedCount} />
          <Metric label="Enrolled" value={stats.enrolledCount} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <EnvPill ok={env.adminEmailsConfigured} label="Admin list" />
          <EnvPill ok={env.gmailConfigured} label="Gmail OTP" />
          <EnvPill ok={env.databaseConfigured} label="Neon DB" />
          <EnvPill ok={env.sessionSecretConfigured} label="Session secret" />
        </div>

        <div className="mt-10 bg-parchment px-5 sm:px-7">
          {leads.length > 0 ? (
            leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
          ) : (
            <div className="py-16 text-center">
              <h2 className="font-display text-3xl text-oxblood">
                No leads yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                Enquiries from the admissions page will appear here once the
                form is submitted.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
