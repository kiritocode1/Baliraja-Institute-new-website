import type { Metadata } from "next";
import {
  addAdminAction,
  logoutAction,
  setAdminActiveAction,
  updateLeadAction,
} from "@/app/crm/actions";
import { type CrmAdmin, listAdmins } from "@/lib/crm/admins";
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

function AdminRow({
  admin,
  currentEmail,
}: {
  admin: CrmAdmin;
  currentEmail: string;
}) {
  const canDeactivateSelf = admin.email === currentEmail && admin.active;

  return (
    <article className="grid gap-4 border-t border-line py-5 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold text-ink">{admin.email}</h3>
          <span
            className={`border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
              admin.active
                ? "border-brass text-brass-deep"
                : "border-line-strong text-ink-soft"
            }`}
          >
            {admin.active ? "Active" : "Inactive"}
          </span>
          <span className="text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
            {admin.source}
          </span>
        </div>
        {admin.name && (
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {admin.name}
          </p>
        )}
      </div>
      <form action={setAdminActiveAction}>
        <input type="hidden" name="id" value={admin.id} />
        <input type="hidden" name="email" value={admin.email} />
        <input type="hidden" name="active" value={String(!admin.active)} />
        <button
          type="submit"
          disabled={canDeactivateSelf}
          className="border border-line-strong px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood disabled:cursor-not-allowed disabled:opacity-40"
        >
          {admin.active ? "Deactivate" : "Activate"}
        </button>
      </form>
    </article>
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
  const [session, leads, admins] = await Promise.all([
    requireAdminSession(),
    listLeads(),
    listAdmins(),
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
          <EnvPill ok={admins.length > 0} label="Admin table" />
          <EnvPill ok={env.gmailConfigured} label="Gmail OTP" />
          <EnvPill ok={env.databaseConfigured} label="Neon DB" />
          <EnvPill ok={env.blobConfigured} label="Blob" />
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

        <section className="mt-10 bg-parchment px-5 py-7 sm:px-7">
          <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
                Admins
              </p>
              <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
                CRM access
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                Active admin records decide who can receive a login OTP.
                Bootstrap emails only seed the table when it is empty.
              </p>
              <div className="mt-6">
                {admins.map((admin) => (
                  <AdminRow
                    key={admin.id}
                    admin={admin}
                    currentEmail={session.email}
                  />
                ))}
              </div>
            </div>
            <form
              action={addAdminAction}
              className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
            >
              <h3 className="font-display text-2xl text-oxblood">Add admin</h3>
              <label
                htmlFor="admin-email"
                className="mt-5 mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
              >
                Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                placeholder="office@balirajaacademy.in"
                className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
              />
              <label
                htmlFor="admin-name"
                className="mt-4 mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
              >
                Name
              </label>
              <input
                id="admin-name"
                name="name"
                placeholder="Office staff"
                className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
              />
              <button
                type="submit"
                className="mt-5 bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
              >
                Save admin
              </button>
            </form>
          </div>
        </section>
      </div>
    </section>
  );
}
