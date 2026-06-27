import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentPortalShell } from "@/components/student/portal-shell";
import {
  formatPaise,
  getStudentDashboard,
  getStudentInvoice,
} from "@/lib/crm/students";
import { requireStudentSession } from "@/lib/student/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Fee Receipt",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function StudentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([
    params,
    requireStudentSession(),
  ]);
  const [dashboard, invoice] = await Promise.all([
    getStudentDashboard(session.studentId),
    getStudentInvoice(session.studentId, id),
  ]);

  if (!dashboard || !invoice || invoice.status !== "paid") notFound();

  return (
    <StudentPortalShell student={dashboard.student} activePath="receipts">
      <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
        <div className="border-b border-line pb-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Fee receipt
          </p>
          <h2 className="mt-3 font-display text-4xl text-oxblood">
            {invoice.receiptNumber}
          </h2>
        </div>
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Student
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">
              {dashboard.student.name}
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              {dashboard.student.email} · {dashboard.student.phone}
            </p>

            <div className="mt-8 border-t border-line pt-6">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Fee item
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">
                {invoice.title}
              </h3>
              {invoice.description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {invoice.description}
                </p>
              ) : null}
            </div>
          </div>
          <aside className="border border-line bg-parchment-deep p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Amount paid
            </p>
            <p className="mt-2 font-display text-4xl text-oxblood">
              {formatPaise(invoice.amountPaise)}
            </p>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-ink-soft">Paid on</dt>
                <dd className="font-medium text-ink">
                  {formatDate(invoice.paidAt)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-soft">Razorpay order</dt>
                <dd className="font-mono text-xs text-ink">
                  {invoice.razorpayOrderId || "Recorded"}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </StudentPortalShell>
  );
}
