import type { Metadata } from "next";
import { StudentPortalShell } from "@/components/student/portal-shell";
import { getStudentDashboard } from "@/lib/crm/students";
import { listResultsForStudent, listTestResults } from "@/lib/crm/tests";
import { requireStudentSession } from "@/lib/student/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Results",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function StudentResultsPage() {
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

  const results = await listResultsForStudent(session.studentId);
  // Batch rank per written test: 1 + strictly better scores.
  const ranks = new Map<string, { rank: number; of: number }>();

  for (const result of results) {
    if (result.test.kind !== "written" || result.marks === null) continue;

    const all = await listTestResults(result.test.id);
    const better = all.filter(
      (item) => item.marks !== null && item.marks > (result.marks as number),
    ).length;

    ranks.set(result.id, { rank: better + 1, of: all.length });
  }

  return (
    <StudentPortalShell student={dashboard.student} activePath="results">
      <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
        <div className="border-b border-line pb-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Test results
          </p>
          <h2 className="mt-3 font-display text-4xl text-oxblood">
            Your written mocks and ground tests
          </h2>
        </div>

        <div className="divide-y divide-line">
          {results.map((result) => {
            const rank = ranks.get(result.id);
            const percentage =
              result.test.kind === "written" &&
              result.marks !== null &&
              result.test.maxMarks
                ? Math.round((result.marks / result.test.maxMarks) * 1000) / 10
                : null;

            return (
              <article key={result.id} className="py-6">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
                    {formatDate(result.test.testDate ?? result.createdAt)}
                  </p>
                  <span className="border border-line-strong px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {result.test.kind}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-3xl text-oxblood">
                  {result.test.title}
                </h3>
                {result.test.kind === "written" ? (
                  <p className="mt-3 text-lg font-medium text-ink">
                    {result.marks ?? "—"} / {result.test.maxMarks}
                    {percentage !== null ? ` (${percentage}%)` : ""}
                    {rank ? (
                      <span className="ml-3 border border-brass px-2 py-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                        Rank {rank.rank} of {rank.of}
                      </span>
                    ) : null}
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {Object.entries(result.metrics).map(([name, value]) => (
                      <p
                        key={name}
                        className="border border-line bg-parchment-deep px-3 py-2 text-sm text-ink"
                      >
                        <span className="font-semibold">{name}:</span> {value}
                      </p>
                    ))}
                  </div>
                )}
                {result.remarks ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {result.remarks}
                  </p>
                ) : null}
              </article>
            );
          })}
          {results.length === 0 ? (
            <p className="py-10 text-sm leading-relaxed text-ink-soft">
              No test results yet. Results appear here after the office records
              your written mock or ground test performance.
            </p>
          ) : null}
        </div>
      </section>
    </StudentPortalShell>
  );
}
