import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CrmChrome, getCrmChromeData } from "@/app/crm/_components";
import { saveTestResultsAction } from "@/app/crm/actions";
import { listCourseOptions, listStudents } from "@/lib/crm/students";
import { getTestById, listTestResults } from "@/lib/crm/tests";

type TestRosterPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Test results CRM",
  robots: { index: false, follow: false },
};

const fieldClass =
  "w-full border border-line-strong bg-parchment px-2 py-2 text-sm text-ink";

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function TestRosterPage({ params }: TestRosterPageProps) {
  const { id } = await params;
  const [chrome, test, students, courseOptions] = await Promise.all([
    getCrmChromeData(),
    getTestById(id),
    listStudents(),
    listCourseOptions(),
  ]);

  if (!test) notFound();

  const results = await listTestResults(test.id);
  const resultByStudent = new Map(
    results.map((result) => [result.studentId, result]),
  );
  const courseTitle = test.courseKey
    ? (courseOptions.find((course) => course.key === test.courseKey)?.title ??
      test.courseKey)
    : null;
  const roster = students.filter(
    (student) =>
      student.active &&
      (!test.courseKey ||
        student.enrollments.some(
          (enrollment) =>
            enrollment.status === "active" &&
            enrollment.courseKey === test.courseKey &&
            (!test.batchName || enrollment.batchName === test.batchName),
        )) &&
      (test.courseKey ||
        !test.batchName ||
        student.enrollments.some(
          (enrollment) =>
            enrollment.status === "active" &&
            enrollment.batchName === test.batchName,
        )),
  );

  return (
    <CrmChrome
      active="tests"
      admins={chrome.admins}
      env={chrome.env}
      sessionEmail={chrome.session.email}
    >
      <section className="mt-10 bg-parchment px-5 py-7 sm:px-7">
        <Link
          href="/crm/tests"
          className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-oxblood"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All tests
        </Link>

        <div className="mt-5 border-b border-line pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl leading-none text-oxblood">
              {test.title}
            </h1>
            <span className="border border-line-strong px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {test.kind}
            </span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            {courseTitle ?? "All courses"}
            {test.batchName ? ` · ${test.batchName}` : " · all batches"}
            {` · ${formatDate(test.testDate)}`}
            {test.kind === "written" ? ` · out of ${test.maxMarks}` : ""}
          </p>
          {test.notes ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {test.notes}
            </p>
          ) : null}
        </div>

        {roster.length === 0 ? (
          <div className="mt-8 border border-line bg-parchment-deep py-12 text-center">
            <h2 className="font-display text-3xl text-oxblood">
              No enrolled students match
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              Nobody is actively enrolled in this test&apos;s course/batch yet.
              Assign enrollments from the student pages first.
            </p>
          </div>
        ) : (
          <form action={saveTestResultsAction} className="mt-8">
            <input type="hidden" name="testId" value={test.id} />
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line-strong bg-parchment-deep text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    <th className="px-4 py-3">Student</th>
                    {test.kind === "written" ? (
                      <th className="px-4 py-3">Marks / {test.maxMarks}</th>
                    ) : (
                      test.metricNames.map((name) => (
                        <th key={name} className="px-4 py-3">
                          {name}
                        </th>
                      ))
                    )}
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => {
                    const result = resultByStudent.get(student.id);

                    return (
                      <tr key={student.id} className="border-t border-line">
                        <td className="px-4 py-3">
                          <input
                            type="hidden"
                            name="studentIds"
                            value={student.id}
                          />
                          <Link
                            href={`/crm/students/${student.id}`}
                            className="font-semibold text-oxblood hover:underline"
                          >
                            {student.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {student.phone}
                          </p>
                        </td>
                        {test.kind === "written" ? (
                          <td className="px-4 py-3">
                            <input
                              name={`marks:${student.id}`}
                              type="number"
                              step="0.5"
                              min="0"
                              max={test.maxMarks ?? undefined}
                              defaultValue={result?.marks ?? ""}
                              aria-label={`Marks for ${student.name}`}
                              className={`${fieldClass} max-w-28`}
                            />
                          </td>
                        ) : (
                          test.metricNames.map((name) => (
                            <td key={name} className="px-4 py-3">
                              <input
                                name={`metric:${student.id}:${name}`}
                                defaultValue={result?.metrics[name] ?? ""}
                                placeholder="—"
                                aria-label={`${name} for ${student.name}`}
                                className={`${fieldClass} max-w-32`}
                              />
                            </td>
                          ))
                        )}
                        <td className="px-4 py-3">
                          <input
                            name={`remarks:${student.id}`}
                            defaultValue={result?.remarks ?? ""}
                            placeholder="Qualified / needs work"
                            aria-label={`Remarks for ${student.name}`}
                            className={fieldClass}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="submit"
              className="mt-5 bg-oxblood px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
            >
              Save all results
            </button>
            <p className="mt-3 text-sm text-ink-soft">
              Rows left empty are skipped. Re-saving updates existing results.
            </p>
          </form>
        )}
      </section>
    </CrmChrome>
  );
}
