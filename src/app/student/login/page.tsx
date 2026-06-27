import type { Metadata } from "next";
import { StudentLoginForm } from "@/components/student/login-form";
import { redirectIfStudentLoggedIn } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Login",
  robots: { index: false, follow: false },
};

export default async function StudentLoginPage() {
  await redirectIfStudentLoggedIn();

  return (
    <section className="bg-parchment-deep px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[82rem] gap-10 lg:grid-cols-[1fr_29rem] lg:items-start">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Baliraja student portal
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] text-oxblood sm:text-7xl">
            Course notices and fees in one place.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Students can log in with the email registered at the institute. The
            portal sends a one-time code through the Baliraja Gmail account.
          </p>
        </div>
        <StudentLoginForm />
      </div>
    </section>
  );
}
