import { BookOpen, FileText, ReceiptIndianRupee } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StudentPortalShell } from "@/components/student/portal-shell";
import { formatPaise, getStudentDashboard } from "@/lib/crm/students";
import { requireStudentSession } from "@/lib/student/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Portal",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function StudentPortalPage() {
  const session = await requireStudentSession();
  const dashboard = await getStudentDashboard(session.studentId);

  if (!dashboard) {
    return (
      <section className="bg-parchment-deep px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-5xl text-oxblood">
          Student access inactive
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          Contact the office if your admission record should be active.
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

  return (
    <StudentPortalShell student={dashboard.student} activePath="overview">
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/student/notices"
          className="group border border-line bg-parchment p-5 transition-colors hover:border-oxblood"
        >
          <FileText className="size-6 text-oxblood" aria-hidden="true" />
          <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Visible notices
          </p>
          <p className="mt-2 font-display text-4xl text-oxblood">
            {dashboard.notices.length}
          </p>
        </Link>
        <div className="border border-line bg-parchment p-5">
          <BookOpen className="size-6 text-oxblood" aria-hidden="true" />
          <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Active courses
          </p>
          <p className="mt-2 font-display text-4xl text-oxblood">
            {dashboard.enrollments.length}
          </p>
        </div>
        <Link
          href="/student/fees"
          className="group border border-line bg-parchment p-5 transition-colors hover:border-oxblood"
        >
          <ReceiptIndianRupee
            className="size-6 text-oxblood"
            aria-hidden="true"
          />
          <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Pending fees
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
              Latest notices
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
                No active notices are assigned to your course or batch yet.
              </p>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-parchment p-5">
            <h2 className="font-display text-3xl text-oxblood">Courses</h2>
            <div className="mt-4 space-y-3">
              {dashboard.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border border-line p-3">
                  <p className="font-medium text-ink">
                    {enrollment.courseTitle}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {enrollment.batchName || "No batch"}
                  </p>
                </div>
              ))}
              {dashboard.enrollments.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-soft">
                  No active course enrollment is assigned yet.
                </p>
              ) : null}
            </div>
          </section>

          <section className="bg-parchment p-5">
            <h2 className="font-display text-3xl text-oxblood">Fees</h2>
            <div className="mt-4 space-y-3">
              {pendingInvoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="border border-line p-3">
                  <p className="font-medium text-ink">{invoice.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatPaise(invoice.amountPaise)} · due{" "}
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              ))}
              {pendingInvoices.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-soft">
                  No pending fee invoices.
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </StudentPortalShell>
  );
}
