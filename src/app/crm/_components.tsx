import {
  BadgeIndianRupee,
  Bell,
  BookOpen,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  HandCoins,
  Images,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  addAdminAction,
  deleteGalleryImageAction,
  logoutAction,
  setAdminActiveAction,
  updateGalleryImageAction,
  updateLeadAction,
  uploadGalleryImageAction,
} from "@/app/crm/actions";
import type { CrmAdmin } from "@/lib/crm/admins";
import { listAdmins } from "@/lib/crm/admins";
import { requireAdminSession } from "@/lib/crm/auth";
import type { BlogPost } from "@/lib/crm/blog-posts";
import {
  type CrmMediaStorage,
  getCrmEnvStatus,
  normalizeEmail,
} from "@/lib/crm/config";
import type { CoursePage } from "@/lib/crm/course-pages";
import { type CrmGalleryImage, galleryAlbums } from "@/lib/crm/gallery";
import {
  getLeadRequestTypeLabel,
  getLeadStats,
  getStatusLabel,
  type Lead,
  leadRequestTypes,
  leadStatuses,
} from "@/lib/crm/leads";
import type { CourseNotice, StudentSummary } from "@/lib/crm/students";
import { formatPaise } from "@/lib/crm/students";
import { galleryImages } from "@/lib/site";
import {
  admissionProgramLabels,
  referralSourceLabels,
} from "@/schemas/admission.schema";

export const crmSections = [
  {
    key: "dashboard",
    href: "/crm",
    title: "Dashboard",
    body: "Counts, health checks, and public-site shortcuts.",
    Icon: LayoutDashboard,
  },
  {
    key: "leads",
    href: "/crm/leads",
    title: "Leads",
    body: "Review enquiries, assign counsellors, and update follow-up notes.",
    Icon: Inbox,
  },
  {
    key: "scholarships",
    href: "/crm/scholarships",
    title: "Scholarships",
    body: "Review concession requests and fee-support conversations.",
    Icon: HandCoins,
  },
  {
    key: "courses",
    href: "/crm/courses",
    title: "Courses",
    body: "Edit public pages for Army, Navy, Police Bharti and other tracks.",
    Icon: GraduationCap,
  },
  {
    key: "blog",
    href: "/crm/blog",
    title: "Blog",
    body: "Publish guidance articles with rich text, images, and SEO fields.",
    Icon: FileText,
  },
  {
    key: "gallery",
    href: "/crm/gallery",
    title: "Gallery",
    body: "Track the public campus gallery and media upload workflow.",
    Icon: Images,
  },
  {
    key: "students",
    href: "/crm/students",
    title: "Students",
    body: "Manage portal login, notices, course access, and fee invoices.",
    Icon: Users,
  },
  {
    key: "tests",
    href: "/crm/tests",
    title: "Tests",
    body: "Record written mock and ground test results batch by batch.",
    Icon: ClipboardList,
  },
  {
    key: "admins",
    href: "/crm/admins",
    title: "Admins",
    body: "Control who can receive Gmail OTP access to this CRM.",
    Icon: ShieldCheck,
  },
] as const;

export type CrmSectionKey = (typeof crmSections)[number]["key"];

export function getCrmSection(key: string) {
  return crmSections.find((section) => section.key === key);
}

export async function getCrmChromeData() {
  const [session, admins] = await Promise.all([
    requireAdminSession(),
    listAdmins(),
  ]);

  return {
    admins,
    env: getCrmEnvStatus(),
    session,
  };
}

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

function CrmQuickLink({
  href,
  title,
  body,
  icon,
  external = false,
  stat,
}: {
  href: string;
  title: string;
  body: string;
  icon: ReactNode;
  external?: boolean;
  stat?: string | number;
}) {
  const className =
    "group flex min-h-36 flex-col justify-between border border-line bg-parchment p-4 transition-colors hover:border-oxblood";
  const content = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex size-10 items-center justify-center bg-parchment-deep text-oxblood transition-colors group-hover:bg-oxblood group-hover:text-cream">
          {icon}
        </span>
        {stat !== undefined ? (
          <span className="font-display text-3xl leading-none text-oxblood">
            {stat}
          </span>
        ) : external ? (
          <ExternalLink className="size-4 text-ink-soft" aria-hidden="true" />
        ) : null}
      </span>
      <span>
        <span className="block font-display text-2xl leading-none text-oxblood">
          {title}
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-ink-soft">
          {body}
        </span>
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function CrmChrome({
  active,
  admins,
  children,
  env,
  sessionEmail,
}: {
  active: CrmSectionKey;
  admins: CrmAdmin[];
  children: ReactNode;
  env: ReturnType<typeof getCrmEnvStatus>;
  sessionEmail: string;
}) {
  return (
    <section className="bg-parchment-deep px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[100rem]">
        <div className="flex flex-col gap-5 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
              Baliraja CRM
            </p>
            <h1 className="mt-4 font-display text-5xl leading-none text-oxblood sm:text-6xl">
              CRM workspace
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Signed in as {sessionEmail}. Each workflow now has its own page.
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

        <nav
          className="mt-6 flex flex-wrap gap-2"
          aria-label="CRM workspace pages"
        >
          {crmSections.map(({ href, key, title, Icon }) => {
            const isActive = active === key;

            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 border px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? "border-oxblood bg-oxblood text-cream"
                    : "border-line-strong text-ink hover:border-oxblood hover:text-oxblood"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-wrap gap-2">
          <EnvPill ok={admins.length > 0} label="Admin table" />
          <EnvPill ok={env.gmailConfigured} label="Gmail OTP" />
          <EnvPill ok={env.databaseConfigured} label="Neon DB" />
          <EnvPill ok={env.r2Configured} label="R2" />
          <EnvPill ok={env.s3Configured} label="S3" />
          <EnvPill ok={env.sessionSecretConfigured} label="Session secret" />
          <EnvPill
            ok={env.studentSessionSecretConfigured}
            label="Student session"
          />
          <EnvPill ok={env.razorpayConfigured} label="Razorpay" />
        </div>

        {children}
      </div>
    </section>
  );
}

export function CrmDashboard({
  admins,
  blogPosts,
  courseNotices,
  coursePages,
  leads,
  students,
}: {
  admins: CrmAdmin[];
  blogPosts: BlogPost[];
  courseNotices: CourseNotice[];
  coursePages: CoursePage[];
  leads: Lead[];
  students: StudentSummary[];
}) {
  const stats = getLeadStats(leads);
  const activeStudents = students.filter((student) => student.active).length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const enrolledThisMonth = leads.filter(
    (lead) =>
      lead.status === "enrolled" &&
      new Date(lead.updatedAt).getTime() >= monthStart.getTime(),
  ).length;
  const pendingFees = students.reduce(
    (sum, student) =>
      sum +
      student.invoices
        .filter(
          (invoice) =>
            invoice.status === "pending" || invoice.status === "processing",
        )
        .reduce((studentSum, invoice) => studentSum + invoice.amountPaise, 0),
    0,
  );

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Metric label="Total leads" value={stats.total} />
        <Metric label="New" value={stats.newCount} />
        <Metric label="Scholarships" value={stats.scholarshipCount} />
        <Metric label="Enrolled this month" value={enrolledThisMonth} />
        <Metric label="Active students" value={activeStudents} />
        <Metric label="Pending fees" value={formatPaise(pendingFees)} />
      </div>

      <section
        className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-7"
        aria-label="CRM pages"
      >
        <CrmQuickLink
          href="/crm/leads"
          title="Leads"
          body="Update admissions follow-up without scrolling past publishers."
          icon={<Inbox className="size-5" aria-hidden="true" />}
          stat={stats.total}
        />
        <CrmQuickLink
          href="/crm/scholarships"
          title="Scholarships"
          body="See concession requests before opening the full lead queue."
          icon={<HandCoins className="size-5" aria-hidden="true" />}
          stat={stats.scholarshipCount}
        />
        <CrmQuickLink
          href="/crm/courses"
          title="Courses"
          body="Edit public course pages and publishing status."
          icon={<GraduationCap className="size-5" aria-hidden="true" />}
          stat={coursePages.length}
        />
        <CrmQuickLink
          href="/crm/blog"
          title="Blog"
          body="Write and publish preparation articles."
          icon={<FileText className="size-5" aria-hidden="true" />}
          stat={blogPosts.length}
        />
        <CrmQuickLink
          href="/crm/gallery"
          title="Gallery"
          body="Audit the public media inventory."
          icon={<Images className="size-5" aria-hidden="true" />}
          stat={galleryImages.length}
        />
        <CrmQuickLink
          href="/crm/students"
          title="Students"
          body="Manage portal access, notices, and invoices."
          icon={<Users className="size-5" aria-hidden="true" />}
          stat={students.length}
        />
        <CrmQuickLink
          href="/crm/admins"
          title="Admins"
          body="Manage OTP access for office staff."
          icon={<ShieldCheck className="size-5" aria-hidden="true" />}
          stat={admins.filter((admin) => admin.active).length}
        />
      </section>

      <section
        className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Public site shortcuts"
      >
        <CrmQuickLink
          href="/"
          title="Home"
          body="Open the public landing page after content changes."
          icon={<LayoutDashboard className="size-5" aria-hidden="true" />}
          external
        />
        <CrmQuickLink
          href="/courses"
          title="Courses"
          body="Check the public course grid and course-page entry points."
          icon={<BookOpen className="size-5" aria-hidden="true" />}
          external
        />
        <CrmQuickLink
          href="/news-events"
          title="News & notices"
          body={`${courseNotices.length} student notices plus public posts.`}
          icon={<FileText className="size-5" aria-hidden="true" />}
          external
        />
        <CrmQuickLink
          href="/gallery"
          title="Gallery"
          body="Open the dedicated public gallery page."
          icon={<Images className="size-5" aria-hidden="true" />}
          external
        />
        <CrmQuickLink
          href="/scholarships"
          title="Scholarships"
          body="Preview the public concession request path."
          icon={<BadgeIndianRupee className="size-5" aria-hidden="true" />}
          external
        />
        <CrmQuickLink
          href="/student/login"
          title="Student portal"
          body="Open the student OTP login and fee dashboard entry point."
          icon={<Bell className="size-5" aria-hidden="true" />}
          external
        />
        <CrmQuickLink
          href="/admissions"
          title="Admissions"
          body="Test the enquiry form and track-prefilled submissions."
          icon={<Inbox className="size-5" aria-hidden="true" />}
          external
        />
      </section>
    </>
  );
}

function formatProgramList(programs: Lead["desiredPrograms"]) {
  return programs
    .map((program) => admissionProgramLabels[program] ?? program)
    .join(", ");
}

function formatReferralList(referrals: Lead["referralSources"]) {
  return referrals
    .map((source) => referralSourceLabels[source] ?? source)
    .join(", ");
}

function formatEducation(education: Lead["education"]) {
  if (!education) return "";

  return [
    education.tenth ? `10th ${education.tenth.percentage}%` : "",
    education.twelfth
      ? `12th ${education.twelfth.stream ? `${education.twelfth.stream} ` : ""}${education.twelfth.percentage}%`
      : "",
    education.graduation
      ? `Graduation ${education.graduation.course}${
          education.graduation.percentage
            ? ` ${education.graduation.percentage}%`
            : ""
        }`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function AdmissionDetails({ lead }: { lead: Lead }) {
  const programs = formatProgramList(lead.desiredPrograms);
  const referrals = formatReferralList(lead.referralSources);
  const education = formatEducation(lead.education);
  const hasDetails = Boolean(
    lead.gender ||
      lead.guardianName ||
      lead.dateOfBirth ||
      lead.fullAddress ||
      lead.mobile2 ||
      programs ||
      education ||
      lead.weightKg ||
      lead.heightCm ||
      referrals ||
      lead.otherReferralDetail,
  );

  if (!hasDetails) return null;

  return (
    <div className="grid gap-4 border border-line bg-parchment-deep p-4 text-sm xl:col-span-3 md:grid-cols-3">
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Student
        </p>
        <p className="mt-2 text-ink">
          {[lead.gender, lead.dateOfBirth].filter(Boolean).join(" · ") || "—"}
        </p>
        {lead.guardianName ? (
          <p className="mt-1 text-ink-soft">Guardian: {lead.guardianName}</p>
        ) : null}
        {lead.fullAddress ? (
          <p className="mt-1 text-ink-soft">{lead.fullAddress}</p>
        ) : null}
      </div>
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Program
        </p>
        {programs ? <p className="mt-2 text-ink">{programs}</p> : null}
        {education ? <p className="mt-1 text-ink-soft">{education}</p> : null}
        {lead.weightKg || lead.heightCm ? (
          <p className="mt-1 text-ink-soft">
            {lead.weightKg ? `${lead.weightKg} kg` : ""}
            {lead.weightKg && lead.heightCm ? " · " : ""}
            {lead.heightCm ? `${lead.heightCm} cm` : ""}
          </p>
        ) : null}
      </div>
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Referral
        </p>
        {referrals ? <p className="mt-2 text-ink">{referrals}</p> : null}
        {lead.otherReferralDetail ? (
          <p className="mt-1 text-ink-soft">{lead.otherReferralDetail}</p>
        ) : null}
        {lead.mobile2 ? (
          <a
            href={`tel:${lead.mobile2}`}
            className="mt-1 block w-fit text-ink-soft hover:text-oxblood"
          >
            Alternate: {lead.mobile2}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function LeadRow({
  lead,
  studentId,
}: {
  lead: Lead;
  studentId: string | null;
}) {
  return (
    <article
      id={`lead-${lead.id}`}
      className="grid scroll-mt-24 gap-5 border-t border-line py-6 xl:grid-cols-[minmax(14rem,1.1fr)_minmax(13rem,0.9fr)_minmax(24rem,1.4fr)]"
    >
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
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="w-fit hover:text-oxblood"
            >
              {lead.email}
            </a>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
          Track
        </p>
        <p className="mt-2 text-base font-medium text-ink">{lead.track}</p>
        <span
          className={`mt-3 inline-flex border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] ${
            lead.requestType === "scholarship"
              ? "border-brass text-brass-deep"
              : "border-line-strong text-ink-soft"
          }`}
        >
          {getLeadRequestTypeLabel(lead.requestType)}
        </span>
        {lead.message ? (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {lead.message}
          </p>
        ) : null}
      </div>

      <form action={updateLeadAction} className="grid gap-4 md:grid-cols-3">
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
            htmlFor={`request-type-${lead.id}`}
            className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Type
          </label>
          <select
            id={`request-type-${lead.id}`}
            name="requestType"
            defaultValue={lead.requestType}
            className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
          >
            {leadRequestTypes.map((type) => (
              <option key={type} value={type}>
                {getLeadRequestTypeLabel(type)}
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
        <div className="md:col-span-3">
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

      <AdmissionDetails lead={lead} />

      <div className="xl:col-span-3">
        {studentId ? (
          <Link
            href={`/crm/students/${studentId}`}
            className="inline-flex border border-line-strong px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
          >
            View student
          </Link>
        ) : (
          <Link
            href={`/crm/leads/${lead.id}/convert`}
            className="inline-flex bg-brass-deep px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood"
          >
            Convert to student
          </Link>
        )}
      </div>
    </article>
  );
}

export function LeadsPanel({
  leads,
  students,
  statusFilter,
}: {
  leads: Lead[];
  students: StudentSummary[];
  statusFilter?: string;
}) {
  const activeStatus = leadStatuses.find((status) => status === statusFilter);
  const visibleLeads = activeStatus
    ? leads.filter((lead) => lead.status === activeStatus)
    : leads;
  const studentIdByLead = new Map(
    students.flatMap((student) =>
      student.leadId ? [[student.leadId, student.id] as const] : [],
    ),
  );
  const studentIdByEmail = new Map(
    students.flatMap((student) =>
      student.email ? [[student.email, student.id] as const] : [],
    ),
  );

  return (
    <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Leads
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Admissions follow-up
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Enquiries, counsellor ownership, notes, and student conversion live
            here now.
          </p>
        </div>
        <Metric label="Total leads" value={leads.length} />
      </div>

      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Filter leads by status"
      >
        <Link
          href="/crm/leads"
          className={`border px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
            !activeStatus
              ? "border-oxblood bg-oxblood text-cream"
              : "border-line-strong text-ink hover:border-oxblood"
          }`}
        >
          All ({leads.length})
        </Link>
        {leadStatuses.map((status) => {
          const count = leads.filter((lead) => lead.status === status).length;

          return (
            <Link
              key={status}
              href={`/crm/leads?status=${status}`}
              className={`border px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                activeStatus === status
                  ? "border-oxblood bg-oxblood text-cream"
                  : "border-line-strong text-ink hover:border-oxblood"
              }`}
            >
              {getStatusLabel(status)} ({count})
            </Link>
          );
        })}
      </nav>

      {visibleLeads.length > 0 ? (
        visibleLeads.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            studentId={
              studentIdByLead.get(lead.id) ??
              (lead.email
                ? studentIdByEmail.get(normalizeEmail(lead.email))
                : null) ??
              null
            }
          />
        ))
      ) : (
        <div className="py-16 text-center">
          <h2 className="font-display text-3xl text-oxblood">No leads yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            Enquiries from the admissions page will appear here once the form is
            submitted.
          </p>
        </div>
      )}
    </section>
  );
}

export function ScholarshipRequestsPanel({
  leads,
  students,
}: {
  leads: Lead[];
  students: StudentSummary[];
}) {
  const scholarshipLeads = leads.filter(
    (lead) => lead.requestType === "scholarship",
  );
  const studentIdByLead = new Map(
    students.flatMap((student) =>
      student.leadId ? [[student.leadId, student.id] as const] : [],
    ),
  );

  return (
    <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Scholarships
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Concession request follow-up
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Scholarship requests are separated from the full lead queue for
            faster fee-support follow-up.
          </p>
        </div>
        <Metric
          label="Open scholarship requests"
          value={scholarshipLeads.length}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {scholarshipLeads.length > 0 ? (
          scholarshipLeads.map((lead) => (
            <article key={lead.id} className="border border-line p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-brass px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                  {getStatusLabel(lead.status)}
                </span>
                <span className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">
                  {formatDate(lead.receivedAt)}
                </span>
              </div>
              <h3 className="mt-3 font-display text-2xl leading-tight text-oxblood">
                {lead.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-ink">{lead.track}</p>
              <div className="mt-3 flex flex-col gap-1 text-sm text-ink-soft">
                <a
                  href={`tel:${lead.phone}`}
                  className="w-fit hover:text-oxblood"
                >
                  {lead.phone}
                </a>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="w-fit hover:text-oxblood"
                  >
                    {lead.email}
                  </a>
                ) : null}
              </div>
              {lead.message ? (
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                  {lead.message}
                </p>
              ) : null}

              <form
                action={updateLeadAction}
                className="mt-4 grid gap-3 border-t border-line pt-4"
              >
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="status" value={lead.status} />
                <input
                  type="hidden"
                  name="requestType"
                  value={lead.requestType}
                />
                <input
                  type="hidden"
                  name="assignedTo"
                  value={lead.assignedTo ?? ""}
                />
                <input type="hidden" name="notes" value={lead.notes ?? ""} />
                <div>
                  <label
                    htmlFor={`concession-status-${lead.id}`}
                    className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
                  >
                    Concession decision
                  </label>
                  <select
                    id={`concession-status-${lead.id}`}
                    name="concessionStatus"
                    defaultValue={lead.concessionStatus ?? "requested"}
                    className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
                  >
                    <option value="requested">Requested</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <textarea
                  name="concessionNote"
                  rows={2}
                  defaultValue={lead.concessionNote ?? ""}
                  placeholder="e.g. 20% off tuition, farming family"
                  aria-label="Concession note"
                  className="w-full resize-none border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
                />
                <button
                  type="submit"
                  className="w-fit bg-oxblood px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-oxblood-bright"
                >
                  Save decision
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {studentIdByLead.get(lead.id) ? (
                  <Link
                    href={`/crm/students/${studentIdByLead.get(lead.id)}`}
                    className="inline-flex border border-line-strong px-3 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
                  >
                    View student
                  </Link>
                ) : (
                  <Link
                    href={`/crm/leads/${lead.id}/convert`}
                    className="inline-flex bg-brass-deep px-3 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-oxblood"
                  >
                    Convert to student
                  </Link>
                )}
                <Link
                  href={`/crm/leads#lead-${lead.id}`}
                  className="inline-flex border border-line-strong px-3 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
                >
                  Open in leads
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="border border-line bg-parchment-deep p-8 text-center lg:col-span-3">
            <h3 className="font-display text-3xl text-oxblood">
              No scholarship requests yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              New concession enquiries will appear here when visitors select
              Scholarship / fee concession in the admissions form.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

const galleryFieldClass =
  "w-full border border-line-strong bg-parchment px-3 py-2 text-sm text-ink";

export function GalleryAdminPanel({
  images,
  mediaStorage,
}: {
  images: CrmGalleryImage[];
  mediaStorage: CrmMediaStorage;
}) {
  return (
    <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Gallery
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Public gallery manager
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Upload campus, school, sports, camp, and event photos. Published
            images appear on the public gallery grouped by album.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] ${
              mediaStorage !== "local"
                ? "border-brass text-brass-deep"
                : "border-destructive/40 text-destructive"
            }`}
          >
            Media storage:{" "}
            {mediaStorage === "local" ? "Missing" : mediaStorage.toUpperCase()}
          </span>
          <Link
            href="/gallery"
            className="border border-line-strong px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
            target="_blank"
          >
            Open public gallery
          </Link>
        </div>
      </div>

      <form
        action={uploadGalleryImageAction}
        className="mt-6 grid gap-3 border border-line bg-parchment-deep p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="lg:col-span-1">
          <label
            htmlFor="gallery-file"
            className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Image
          </label>
          <input
            id="gallery-file"
            name="file"
            type="file"
            accept="image/*"
            required
            className="w-full text-sm text-ink file:mr-3 file:border file:border-line-strong file:bg-parchment file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.12em]"
          />
        </div>
        <input
          name="caption"
          required
          placeholder="Caption"
          aria-label="Caption"
          className={`${galleryFieldClass} self-end`}
        />
        <input
          name="alt"
          placeholder="Alt text (optional)"
          aria-label="Alt text"
          className={`${galleryFieldClass} self-end`}
        />
        <select
          name="album"
          aria-label="Album"
          className={`${galleryFieldClass} self-end`}
        >
          {galleryAlbums.map((album) => (
            <option key={album} value={album}>
              {album.charAt(0).toUpperCase() + album.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="self-end bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
        >
          Upload
        </button>
      </form>

      {images.length === 0 ? (
        <p className="mt-6 border border-line bg-parchment-deep p-4 text-sm leading-relaxed text-ink-soft">
          No uploaded images yet — the public gallery is still showing the
          built-in starter set. It switches to your uploads as soon as the first
          image lands here.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <article key={image.id} className="border border-line">
            <div className="relative aspect-[4/3] overflow-hidden bg-parchment-deep">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
              {!image.published ? (
                <span className="absolute left-2 top-2 bg-ink px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-cream">
                  Hidden
                </span>
              ) : null}
            </div>
            <form action={updateGalleryImageAction} className="grid gap-2 p-4">
              <input type="hidden" name="id" value={image.id} />
              <input
                name="caption"
                defaultValue={image.caption}
                required
                aria-label="Caption"
                className={galleryFieldClass}
              />
              <input
                name="alt"
                defaultValue={image.alt}
                aria-label="Alt text"
                className={galleryFieldClass}
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  name="album"
                  defaultValue={image.album}
                  aria-label="Album"
                  className={galleryFieldClass}
                >
                  {galleryAlbums.map((album) => (
                    <option key={album} value={album}>
                      {album.charAt(0).toUpperCase() + album.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={image.sortOrder}
                  aria-label="Sort order"
                  className={galleryFieldClass}
                />
                <select
                  name="published"
                  defaultValue={String(image.published)}
                  aria-label="Visibility"
                  className={galleryFieldClass}
                >
                  <option value="true">Published</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-fit bg-oxblood px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-oxblood-bright"
              >
                Save
              </button>
            </form>
            <form
              action={deleteGalleryImageAction}
              className="border-t border-line p-4"
            >
              <input type="hidden" name="id" value={image.id} />
              <button
                type="submit"
                className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-destructive hover:underline"
              >
                Delete image
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
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
          <span
            className={`border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] ${
              admin.role === "admin"
                ? "border-oxblood/40 text-oxblood"
                : "border-line-strong text-ink-soft"
            }`}
          >
            {admin.role === "admin" ? "Owner" : "Staff"}
          </span>
          <span className="text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
            {admin.source}
          </span>
        </div>
        {admin.name ? (
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {admin.name}
          </p>
        ) : null}
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

export function AdminAccessPanel({
  admins,
  currentEmail,
}: {
  admins: CrmAdmin[];
  currentEmail: string;
}) {
  return (
    <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Admins
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            CRM access
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Active admin records decide who can receive a login OTP. Bootstrap
            emails only seed the table when it is empty.
          </p>
          <div className="mt-6">
            {admins.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                currentEmail={currentEmail}
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
          <label
            htmlFor="admin-role"
            className="mt-4 mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            Role
          </label>
          <select
            id="admin-role"
            name="role"
            defaultValue="staff"
            className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
          >
            <option value="staff">Staff — everything except this page</option>
            <option value="admin">Owner — can manage admins</option>
          </select>
          <button
            type="submit"
            className="mt-5 bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
          >
            Save admin
          </button>
        </form>
      </div>
    </section>
  );
}
