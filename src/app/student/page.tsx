import {
  BookOpen,
  ClipboardList,
  FileText,
  ReceiptIndianRupee,
} from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { StudentPortalShell } from "@/components/student/portal-shell";
import { formatPaise, getStudentDashboard } from "@/lib/crm/students";
import { listResultsForStudent } from "@/lib/crm/tests";
import { requireStudentSession } from "@/lib/student/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Portal",
  robots: { index: false, follow: false },
};

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function StudentPortalPage() {
  const t = await getTranslations("Student");
  const locale = await getLocale();
  const formatDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale === "mr" ? "mr-IN" : "en-IN", {
          dateStyle: "medium",
        }).format(new Date(value))
      : t("noDate");
  const session = await requireStudentSession();
  const dashboard = await getStudentDashboard(session.studentId);

  if (!dashboard) {
    return (
      <section className="bg-parchment-deep px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-5xl text-oxblood">{t("inactive")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          {t("inactiveBody")}
        </p>
      </section>
    );
  }

  const pendingInvoices = dashboard.invoices.filter(
    (invoice) =>
      invoice.status === "pending" || invoice.status === "processing",
  );
  const pendingAmount = pendingInvoices.reduce(
    (sum, invoice) => sum + invoice.amountPaise,
    0,
  );
  const results = await listResultsForStudent(session.studentId);
  const latestResult = results[0] ?? null;

  return (
    <StudentPortalShell student={dashboard.student} activePath="overview">
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/student/notices"
          className="group border border-line bg-parchment p-5 transition-colors hover:border-oxblood"
        >
          <FileText className="size-6 text-oxblood" aria-hidden="true" />
          <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            {t("visibleNotices")}
          </p>
          <p className="mt-2 font-display text-4xl text-oxblood">
            {dashboard.notices.length}
          </p>
        </Link>
        <div className="border border-line bg-parchment p-5">
          <BookOpen className="size-6 text-oxblood" aria-hidden="true" />
          <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            {t("activeCourses")}
          </p>
          <p className="mt-2 font-display text-4xl text-oxblood">
            {dashboard.enrollments.length}
          </p>
        </div>
        <Link
          href="/student/results"
          className="group border border-line bg-parchment p-5 transition-colors hover:border-oxblood"
        >
          <ClipboardList className="size-6 text-oxblood" aria-hidden="true" />
          <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            {t("latestResult")}
          </p>
          <p className="mt-2 font-display text-2xl leading-tight text-oxblood">
            {latestResult
              ? latestResult.test.kind === "written"
                ? `${latestResult.marks ?? "—"} / ${latestResult.test.maxMarks}`
                : latestResult.test.title
              : "—"}
          </p>
          {latestResult ? (
            <p className="mt-1 text-xs text-ink-soft">
              {latestResult.test.kind === "written"
                ? latestResult.test.title
                : t("groundTestRecorded")}
            </p>
          ) : null}
        </Link>
        <Link
          href="/student/fees"
          className="group border border-line bg-parchment p-5 transition-colors hover:border-oxblood"
        >
          <ReceiptIndianRupee
            className="size-6 text-oxblood"
            aria-hidden="true"
          />
          <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            {t("pendingFees")}
          </p>
          <p className="mt-2 font-display text-4xl text-oxblood">
            {formatPaise(pendingAmount)}
          </p>
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section className="bg-parchment px-5 py-7 sm:px-7">
          <div className="border-b border-line pb-5">
            <h2 className="font-display text-4xl text-oxblood">
              {t("latestNotices")}
            </h2>
          </div>
          <div className="divide-y divide-line">
            {dashboard.notices.slice(0, 4).map((notice) => (
              <article key={notice.id} className="py-5">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
                  {formatDate(notice.publishedAt ?? notice.updatedAt)}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-ink">
                  {notice.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                  {stripHtml(notice.bodyHtml)}
                </p>
              </article>
            ))}
            {dashboard.notices.length === 0 ? (
              <p className="py-8 text-sm leading-relaxed text-ink-soft">
                {t("noNoticesAssigned")}
              </p>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-parchment p-5">
            <h2 className="font-display text-3xl text-oxblood">
              {t("courses")}
            </h2>
            <div className="mt-4 space-y-3">
              {dashboard.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border border-line p-3">
                  <p className="font-medium text-ink">
                    {enrollment.courseTitle}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {enrollment.batchName || t("noBatch")}
                  </p>
                </div>
              ))}
              {dashboard.enrollments.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-soft">
                  {t("noEnrollment")}
                </p>
              ) : null}
            </div>
          </section>

          <section className="bg-parchment p-5">
            <h2 className="font-display text-3xl text-oxblood">
              {t("feesHeading")}
            </h2>
            <div className="mt-4 space-y-3">
              {pendingInvoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="border border-line p-3">
                  <p className="font-medium text-ink">{invoice.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatPaise(invoice.amountPaise)} · {t("due")}{" "}
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              ))}
              {pendingInvoices.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-soft">
                  {t("noPendingInvoices")}
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </StudentPortalShell>
  );
}
