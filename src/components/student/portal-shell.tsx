import Link from "next/link";
import type { ReactNode } from "react";
import { logoutStudentAction } from "@/app/student/actions";
import type { CrmStudent } from "@/lib/crm/students";

type StudentPortalShellProps = {
  student: CrmStudent;
  activePath: "overview" | "notices" | "fees" | "receipts";
  children: ReactNode;
};

const navItems = [
  { href: "/student", label: "Overview", key: "overview" },
  { href: "/student/notices", label: "Notices", key: "notices" },
  { href: "/student/fees", label: "Fees", key: "fees" },
] as const;

export function StudentPortalShell({
  student,
  activePath,
  children,
}: StudentPortalShellProps) {
  return (
    <section className="bg-parchment-deep px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[92rem]">
        <header className="border-b border-line pb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
                Student portal
              </p>
              <h1 className="mt-3 font-display text-5xl leading-none text-oxblood sm:text-6xl">
                {student.name}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {student.email} · {student.phone}
              </p>
            </div>
            <form action={logoutStudentAction}>
              <button
                type="submit"
                className="border border-line-strong px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
              >
                Sign out
              </button>
            </form>
          </div>
          <nav
            aria-label="Student portal sections"
            className="mt-6 flex flex-wrap gap-2"
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  activePath === item.key
                    ? "border-oxblood bg-oxblood text-cream"
                    : "border-line-strong text-ink hover:border-oxblood hover:text-oxblood"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </section>
  );
}
