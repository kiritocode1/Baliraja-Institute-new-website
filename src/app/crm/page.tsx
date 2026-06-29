import {
  BadgeIndianRupee,
  Bell,
  BookOpen,
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
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  addAdminAction,
  convertLeadToStudentAction,
  logoutAction,
  setAdminActiveAction,
  updateLeadAction,
} from "@/app/crm/actions";
import { BlogEditor } from "@/components/crm/blog-editor";
import { CourseEditor } from "@/components/crm/course-editor";
import { StudentAdminPanel } from "@/components/crm/student-admin-panel";
import { type CrmAdmin, listAdmins } from "@/lib/crm/admins";
import { requireAdminSession } from "@/lib/crm/auth";
import { listBlogPosts } from "@/lib/crm/blog-posts";
import { getCrmEnvStatus } from "@/lib/crm/config";
import { listCoursePages } from "@/lib/crm/course-pages";
import {
  getLeadRequestTypeLabel,
  getLeadStats,
  getStatusLabel,
  type Lead,
  leadRequestTypes,
  leadStatuses,
  listLeads,
} from "@/lib/crm/leads";
import {
  type CourseOption,
  listCourseNotices,
  listCourseOptions,
  listStudents,
} from "@/lib/crm/students";
import { galleryImages } from "@/lib/site";

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

function CrmQuickLink({
  href,
  title,
  body,
  icon,
  external = false,
}: {
  href: string;
  title: string;
  body: string;
  icon: ReactNode;
  external?: boolean;
}) {
  const className =
    "group flex min-h-32 flex-col justify-between border border-line bg-parchment p-4 transition-colors hover:border-oxblood";
  const content = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex size-10 items-center justify-center bg-parchment-deep text-oxblood transition-colors group-hover:bg-oxblood group-hover:text-cream">
          {icon}
        </span>
        {external ? (
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

function LeadRow({
  lead,
  courseOptions,
}: {
  lead: Lead;
  courseOptions: CourseOption[];
}) {
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
        <span
          className={`mt-3 inline-flex border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] ${
            lead.requestType === "scholarship"
              ? "border-brass text-brass-deep"
              : "border-line-strong text-ink-soft"
          }`}
        >
          {getLeadRequestTypeLabel(lead.requestType)}
        </span>
        {lead.message && (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {lead.message}
          </p>
        )}
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

      {lead.email ? (
        <form
          action={convertLeadToStudentAction}
          className="border border-line bg-parchment-deep p-4 xl:col-span-3"
        >
          <input type="hidden" name="leadId" value={lead.id} />
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label
                htmlFor={`lead-course-${lead.id}`}
                className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
              >
                Course
              </label>
              <select
                id={`lead-course-${lead.id}`}
                name="courseKey"
                className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
              >
                <option value="">Match from lead track</option>
                {courseOptions.map((course) => (
                  <option key={course.key} value={course.key}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={`lead-batch-${lead.id}`}
                className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
              >
                Batch
              </label>
              <input
                id={`lead-batch-${lead.id}`}
                name="batchName"
                placeholder="June 2026 morning"
                className="w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink"
              />
            </div>
            <button
              type="submit"
              className="w-fit bg-brass-deep px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood"
            >
              Create student
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}

function ScholarshipRequestsPanel({ leads }: { leads: Lead[] }) {
  const scholarshipLeads = leads.filter(
    (lead) => lead.requestType === "scholarship",
  );

  return (
    <section
      id="crm-scholarships"
      className="mt-10 bg-parchment px-5 py-7 sm:px-7"
    >
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Scholarships
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Concession request follow-up
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Requests sent from the scholarships page and admissions form are
            tagged here first, then handled through the normal lead workflow.
          </p>
        </div>
        <div className="border border-line bg-parchment-deep p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Open scholarship requests
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {scholarshipLeads.length}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {scholarshipLeads.length > 0 ? (
          scholarshipLeads.slice(0, 6).map((lead) => (
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

function GalleryAdminPanel({ usesBlobStorage }: { usesBlobStorage: boolean }) {
  return (
    <section id="crm-gallery" className="mt-10 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Gallery
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Campus media inventory
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            The public gallery has a dedicated page at /gallery. This CRM
            section tracks the current gallery set and keeps the upload workflow
            visible for future campus, classroom, event and library images.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] ${
              usesBlobStorage
                ? "border-brass text-brass-deep"
                : "border-destructive/40 text-destructive"
            }`}
          >
            Blob storage: {usesBlobStorage ? "Ready" : "Missing"}
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

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {galleryImages.map((item) => (
          <article
            key={`${item.src}-${item.caption}`}
            className="border border-line"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-parchment-deep">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-ink">{item.caption}</h3>
              <p className="mt-2 break-all text-xs leading-relaxed text-ink-soft">
                {item.src}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function CrmPage() {
  const [
    session,
    leads,
    admins,
    blogPosts,
    coursePages,
    students,
    courseNotices,
    courseOptions,
  ] = await Promise.all([
    requireAdminSession(),
    listLeads(),
    listAdmins(),
    listBlogPosts(),
    listCoursePages(),
    listStudents(),
    listCourseNotices(),
    listCourseOptions(),
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
              CRM workspace
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Signed in as {session.email}. Jump between admissions, course
              pages, blog publishing, and admin access from one dashboard.
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Total leads" value={stats.total} />
          <Metric label="New" value={stats.newCount} />
          <Metric label="Scholarships" value={stats.scholarshipCount} />
          <Metric label="Contacted" value={stats.contactedCount} />
          <Metric label="Enrolled" value={stats.enrolledCount} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <EnvPill ok={admins.length > 0} label="Admin table" />
          <EnvPill ok={env.gmailConfigured} label="Gmail OTP" />
          <EnvPill ok={env.databaseConfigured} label="Neon DB" />
          <EnvPill ok={env.blobConfigured} label="Blob" />
          <EnvPill ok={env.sessionSecretConfigured} label="Session secret" />
          <EnvPill
            ok={env.studentSessionSecretConfigured}
            label="Student session"
          />
          <EnvPill ok={env.razorpayConfigured} label="Razorpay" />
        </div>

        <section
          id="crm-overview"
          className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-7"
          aria-label="CRM quick links"
        >
          <CrmQuickLink
            href="#crm-leads"
            title="Leads"
            body="Review enquiries, assign counsellors, and update follow-up notes."
            icon={<Inbox className="size-5" aria-hidden="true" />}
          />
          <CrmQuickLink
            href="#crm-scholarships"
            title="Scholarships"
            body="Review concession requests and fee-support conversations."
            icon={<HandCoins className="size-5" aria-hidden="true" />}
          />
          <CrmQuickLink
            href="#crm-courses"
            title="Courses"
            body="Edit public pages for Army, Navy, MPSC, UPSC and other tracks."
            icon={<GraduationCap className="size-5" aria-hidden="true" />}
          />
          <CrmQuickLink
            href="#crm-blog"
            title="Blog"
            body="Publish guidance articles with rich text, images, and SEO fields."
            icon={<FileText className="size-5" aria-hidden="true" />}
          />
          <CrmQuickLink
            href="#crm-gallery"
            title="Gallery"
            body="Track the public campus gallery and media upload workflow."
            icon={<Images className="size-5" aria-hidden="true" />}
          />
          <CrmQuickLink
            href="#crm-students"
            title="Students"
            body="Manage portal login, notices, course access, and fee invoices."
            icon={<Users className="size-5" aria-hidden="true" />}
          />
          <CrmQuickLink
            href="#crm-admins"
            title="Admins"
            body="Control who can receive Gmail OTP access to this CRM."
            icon={<ShieldCheck className="size-5" aria-hidden="true" />}
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
            body="Preview articles, notices, and latest update cards."
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

        <CourseEditor
          pages={coursePages}
          usesBlobStorage={env.blobConfigured}
        />

        <ScholarshipRequestsPanel leads={leads} />

        <BlogEditor posts={blogPosts} usesBlobStorage={env.blobConfigured} />

        <GalleryAdminPanel usesBlobStorage={env.blobConfigured} />

        <StudentAdminPanel
          students={students}
          notices={courseNotices}
          courseOptions={courseOptions}
        />

        <section id="crm-leads" className="mt-10 bg-parchment px-5 sm:px-7">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                courseOptions={courseOptions}
              />
            ))
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
        </section>

        <section
          id="crm-admins"
          className="mt-10 bg-parchment px-5 py-7 sm:px-7"
        >
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
