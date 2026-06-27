import type { Metadata } from "next";
import { FeePaymentPanel } from "@/components/student/fee-payment-panel";
import { StudentPortalShell } from "@/components/student/portal-shell";
import { getStudentDashboard } from "@/lib/crm/students";
import { requireStudentSession } from "@/lib/student/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Fees",
  robots: { index: false, follow: false },
};

export default async function StudentFeesPage() {
  const session = await requireStudentSession();
  const dashboard = await getStudentDashboard(session.studentId);

  if (!dashboard) {
    return (
      <section className="bg-parchment-deep px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-5xl text-oxblood">
          Student access inactive
        </h1>
      </section>
    );
  }

  return (
    <StudentPortalShell student={dashboard.student} activePath="fees">
      <div className="mt-8">
        <FeePaymentPanel
          invoices={dashboard.invoices}
          student={{
            name: dashboard.student.name,
            email: dashboard.student.email,
            phone: dashboard.student.phone,
          }}
        />
      </div>
    </StudentPortalShell>
  );
}
