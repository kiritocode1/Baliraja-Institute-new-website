import Link from "next/link";
import { createTestAction } from "@/app/crm/actions";
import type { CourseOption } from "@/lib/crm/students";
import type { CrmTest } from "@/lib/crm/tests";

const fieldClass =
  "w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink";
const labelClass =
  "mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft";

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function TestsPanel({
  tests,
  courseOptions,
  batchNames,
}: {
  tests: CrmTest[];
  courseOptions: CourseOption[];
  batchNames: string[];
}) {
  const courseTitleByKey = new Map(
    courseOptions.map((course) => [course.key, course.title]),
  );

  return (
    <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
      <div className="border-b border-line pb-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
          Tests
        </p>
        <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
          Written mocks &amp; ground tests
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Create a test, then open it to enter the whole batch&apos;s results in
          one go. Students see their own results in the portal.
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_26rem]">
        <div>
          {tests.length > 0 ? (
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line-strong bg-parchment-deep text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    <th className="px-4 py-3">Test</th>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Course / batch</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr
                      key={test.id}
                      className="border-t border-line transition-colors hover:bg-parchment-deep"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/crm/tests/${test.id}`}
                          className="font-semibold text-oxblood hover:underline"
                        >
                          {test.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {test.kind === "written"
                            ? `Out of ${test.maxMarks}`
                            : test.metricNames.join(", ")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="border border-line-strong px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                          {test.kind}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {test.courseKey
                          ? (courseTitleByKey.get(test.courseKey) ??
                            test.courseKey)
                          : "All courses"}
                        {test.batchName ? ` · ${test.batchName}` : ""}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {formatDate(test.testDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-line bg-parchment-deep py-12 text-center">
              <h3 className="font-display text-3xl text-oxblood">
                No tests yet
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                Create the first written mock or ground test to start recording
                results.
              </p>
            </div>
          )}
        </div>

        <form action={createTestAction} className="border border-line p-5">
          <h3 className="font-display text-2xl text-oxblood">Create test</h3>
          <label htmlFor="test-title" className={`mt-5 ${labelClass}`}>
            Title
          </label>
          <input
            id="test-title"
            name="title"
            required
            placeholder="Weekly mock #12 / Sunday ground test"
            className={fieldClass}
          />
          <label htmlFor="test-kind" className={`mt-4 ${labelClass}`}>
            Kind
          </label>
          <select id="test-kind" name="kind" className={fieldClass}>
            <option value="written">Written (marks)</option>
            <option value="ground">Ground (metrics)</option>
          </select>
          <label htmlFor="test-course" className={`mt-4 ${labelClass}`}>
            Course
          </label>
          <select id="test-course" name="courseKey" className={fieldClass}>
            <option value="">All courses</option>
            {courseOptions.map((course) => (
              <option key={course.key} value={course.key}>
                {course.title}
              </option>
            ))}
          </select>
          <label htmlFor="test-batch" className={`mt-4 ${labelClass}`}>
            Batch
          </label>
          <input
            id="test-batch"
            name="batchName"
            list="test-batch-options"
            placeholder="All batches"
            className={fieldClass}
          />
          <datalist id="test-batch-options">
            {batchNames.map((batch) => (
              <option key={batch} value={batch} />
            ))}
          </datalist>
          <label htmlFor="test-date" className={`mt-4 ${labelClass}`}>
            Test date
          </label>
          <input
            id="test-date"
            name="testDate"
            type="date"
            className={fieldClass}
          />
          <label htmlFor="test-max-marks" className={`mt-4 ${labelClass}`}>
            Max marks (written)
          </label>
          <input
            id="test-max-marks"
            name="maxMarks"
            type="number"
            step="0.5"
            placeholder="100"
            className={fieldClass}
          />
          <label htmlFor="test-metrics" className={`mt-4 ${labelClass}`}>
            Metrics (ground, comma separated)
          </label>
          <input
            id="test-metrics"
            name="metricNames"
            placeholder="1600m, 100m, Shot put"
            className={fieldClass}
          />
          <label htmlFor="test-notes" className={`mt-4 ${labelClass}`}>
            Notes
          </label>
          <textarea
            id="test-notes"
            name="notes"
            rows={2}
            className={`${fieldClass} resize-none`}
          />
          <button
            type="submit"
            className="mt-5 bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
          >
            Create test
          </button>
        </form>
      </div>
    </section>
  );
}
