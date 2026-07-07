import Link from "next/link";
import { createCourseNoticeAction, saveStudentAction } from "@/app/crm/actions";
import type {
  CourseNotice,
  CourseOption,
  StudentSummary,
} from "@/lib/crm/students";
import { formatPaise } from "@/lib/crm/students";

export type StudentListFilters = {
  q?: string;
  course?: string;
  batch?: string;
  status?: string;
  fees?: string;
};

type StudentAdminPanelProps = {
  students: StudentSummary[];
  notices: CourseNotice[];
  courseOptions: CourseOption[];
  filters: StudentListFilters;
};

const fieldClass =
  "w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink";
const labelClass =
  "mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft";
const buttonClass =
  "bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright";
const summaryClass =
  "cursor-pointer font-display text-2xl text-oxblood [&::-webkit-details-marker]:hidden";

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

function pendingAmount(student: StudentSummary) {
  return student.invoices
    .filter(
      (invoice) =>
        invoice.status === "pending" || invoice.status === "processing",
    )
    .reduce((sum, invoice) => sum + invoice.amountPaise, 0);
}

function filterStudents(
  students: StudentSummary[],
  filters: StudentListFilters,
) {
  const q = (filters.q ?? "").trim().toLowerCase();

  return students.filter((student) => {
    if (
      q &&
      ![student.name, student.email, student.phone].some((value) =>
        value?.toLowerCase().includes(q),
      )
    ) {
      return false;
    }
    if (
      filters.course &&
      !student.enrollments.some((item) => item.courseKey === filters.course)
    ) {
      return false;
    }
    if (
      filters.batch &&
      !student.enrollments.some((item) => item.batchName === filters.batch)
    ) {
      return false;
    }
    if (filters.status === "active" && !student.active) return false;
    if (filters.status === "inactive" && student.active) return false;
    if (filters.fees === "pending" && pendingAmount(student) === 0) {
      return false;
    }

    return true;
  });
}

function StudentTable({ students }: { students: StudentSummary[] }) {
  if (students.length === 0) {
    return (
      <div className="border border-line bg-parchment-deep py-12 text-center">
        <h3 className="font-display text-3xl text-oxblood">No students</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          No records match the current search. Clear the filters, convert a
          lead, or add a student below.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line-strong bg-parchment-deep text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Batch</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Pending fees</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const pending = pendingAmount(student);

            return (
              <tr
                key={student.id}
                className="border-t border-line transition-colors hover:bg-parchment-deep"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/crm/students/${student.id}`}
                    className="font-semibold text-oxblood hover:underline"
                  >
                    {student.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {student.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-ink">{student.phone}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {student.enrollments
                    .map((item) => item.courseTitle)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {student.enrollments
                    .flatMap((item) => (item.batchName ? [item.batchName] : []))
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`border px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] ${
                      student.active
                        ? "border-brass text-brass-deep"
                        : "border-line-strong text-ink-soft"
                    }`}
                  >
                    {student.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-ink">
                  {pending > 0 ? formatPaise(pending) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StudentAdminPanel({
  students,
  notices,
  courseOptions,
  filters,
}: StudentAdminPanelProps) {
  const filtered = filterStudents(students, filters);
  const activeStudents = students.filter((student) => student.active).length;
  const pendingFees = students.reduce(
    (sum, student) => sum + pendingAmount(student),
    0,
  );
  const batchNames = [
    ...new Set(
      students.flatMap((student) =>
        student.enrollments.flatMap((item) =>
          item.batchName ? [item.batchName] : [],
        ),
      ),
    ),
  ].sort();
  const hasFilters = Boolean(
    (filters.q ?? "").trim() ||
      filters.course ||
      filters.batch ||
      filters.status ||
      filters.fees,
  );

  return (
    <section id="crm-students" className="mt-10 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Students
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Student records
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Search and open a student to manage their profile, enrollments,
            notices, and fee invoices. Convert enquiries from the Leads page.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-parchment-deep p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Active students
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {activeStudents}
          </p>
        </div>
        <div className="border border-line bg-parchment-deep p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Published notices
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {notices.filter((notice) => notice.status === "published").length}
          </p>
        </div>
        <div className="border border-line bg-parchment-deep p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Pending fees
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {formatPaise(pendingFees)}
          </p>
        </div>
      </div>

      <form
        method="get"
        action="/crm/students"
        className="mt-8 grid gap-3 border border-line bg-parchment-deep p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search name, phone, email"
          aria-label="Search students"
          className={`${fieldClass} lg:col-span-2`}
        />
        <select
          name="course"
          defaultValue={filters.course ?? ""}
          aria-label="Filter by course"
          className={fieldClass}
        >
          <option value="">All courses</option>
          {courseOptions.map((course) => (
            <option key={course.key} value={course.key}>
              {course.title}
            </option>
          ))}
        </select>
        <select
          name="batch"
          defaultValue={filters.batch ?? ""}
          aria-label="Filter by batch"
          className={fieldClass}
        >
          <option value="">All batches</option>
          {batchNames.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          aria-label="Filter by status"
          className={fieldClass}
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          name="fees"
          defaultValue={filters.fees ?? ""}
          aria-label="Filter by fees"
          className={fieldClass}
        >
          <option value="">Any fees</option>
          <option value="pending">Has pending fees</option>
        </select>
        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
          <button type="submit" className={buttonClass}>
            Filter
          </button>
          {hasFilters ? (
            <Link
              href="/crm/students"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft hover:text-oxblood"
            >
              Clear
            </Link>
          ) : null}
          <p className="ml-auto text-sm text-ink-soft">
            {filtered.length} of {students.length} students
          </p>
        </div>
      </form>

      <div className="mt-4">
        <StudentTable students={filtered} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <details className="border border-line p-5">
          <summary className={summaryClass}>Add student</summary>
          <form action={saveStudentAction}>
            <label htmlFor="student-name" className={`mt-5 ${labelClass}`}>
              Name
            </label>
            <input
              id="student-name"
              name="name"
              required
              className={fieldClass}
            />
            <label htmlFor="student-email" className={`mt-4 ${labelClass}`}>
              Email
            </label>
            <input
              id="student-email"
              name="email"
              type="email"
              required
              className={fieldClass}
            />
            <label htmlFor="student-phone" className={`mt-4 ${labelClass}`}>
              Phone
            </label>
            <input
              id="student-phone"
              name="phone"
              required
              className={fieldClass}
            />
            <label htmlFor="student-guardian" className={`mt-4 ${labelClass}`}>
              Guardian
            </label>
            <input
              id="student-guardian"
              name="guardianName"
              className={fieldClass}
            />
            <label
              htmlFor="student-guardian-phone"
              className={`mt-4 ${labelClass}`}
            >
              Guardian phone
            </label>
            <input
              id="student-guardian-phone"
              name="guardianPhone"
              className={fieldClass}
            />
            <label htmlFor="student-notes" className={`mt-4 ${labelClass}`}>
              Notes
            </label>
            <textarea
              id="student-notes"
              name="notes"
              rows={3}
              className={`${fieldClass} resize-none`}
            />
            <button type="submit" className={`mt-5 ${buttonClass}`}>
              Save student
            </button>
          </form>
        </details>

        <details className="border border-line p-5">
          <summary className={summaryClass}>Create notice</summary>
          <form action={createCourseNoticeAction}>
            <label htmlFor="notice-title" className={`mt-5 ${labelClass}`}>
              Title
            </label>
            <input
              id="notice-title"
              name="title"
              required
              className={fieldClass}
            />
            <label htmlFor="notice-target" className={`mt-4 ${labelClass}`}>
              Target
            </label>
            <select
              id="notice-target"
              name="targetScope"
              className={fieldClass}
            >
              <option value="all">All students</option>
              <option value="course">Course</option>
              <option value="batch">Batch</option>
              <option value="student">Student</option>
            </select>
            <label htmlFor="notice-course" className={`mt-4 ${labelClass}`}>
              Course
            </label>
            <select id="notice-course" name="courseKey" className={fieldClass}>
              <option value="">No course target</option>
              {courseOptions.map((course) => (
                <option key={course.key} value={course.key}>
                  {course.title}
                </option>
              ))}
            </select>
            <label htmlFor="notice-batch" className={`mt-4 ${labelClass}`}>
              Batch name
            </label>
            <input
              id="notice-batch"
              name="batchName"
              list="batch-name-options"
              className={fieldClass}
            />
            <datalist id="batch-name-options">
              {batchNames.map((batch) => (
                <option key={batch} value={batch} />
              ))}
            </datalist>
            <label htmlFor="notice-student" className={`mt-4 ${labelClass}`}>
              Student
            </label>
            <select id="notice-student" name="studentId" className={fieldClass}>
              <option value="">No student target</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.email ?? student.phone}
                </option>
              ))}
            </select>
            <label htmlFor="notice-body" className={`mt-4 ${labelClass}`}>
              Body
            </label>
            <textarea
              id="notice-body"
              name="body"
              rows={5}
              required
              className={`${fieldClass} resize-none`}
            />
            <label htmlFor="notice-attachment" className={`mt-4 ${labelClass}`}>
              Attachment (PDF or image)
            </label>
            <input
              id="notice-attachment"
              name="attachment"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
              className="w-full text-sm text-ink file:mr-3 file:border file:border-line-strong file:bg-parchment file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.12em]"
            />
            <label
              htmlFor="notice-attachment-name"
              className={`mt-3 ${labelClass}`}
            >
              Attachment display name
            </label>
            <input
              id="notice-attachment-name"
              name="attachmentName"
              placeholder="Defaults to the file name"
              className={fieldClass}
            />
            <label htmlFor="notice-expires" className={`mt-4 ${labelClass}`}>
              Expires
            </label>
            <input
              id="notice-expires"
              name="expiresAt"
              type="datetime-local"
              className={fieldClass}
            />
            <label htmlFor="notice-status" className={`mt-4 ${labelClass}`}>
              Status
            </label>
            <select id="notice-status" name="status" className={fieldClass}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button type="submit" className={`mt-5 ${buttonClass}`}>
              Save notice
            </button>
          </form>
        </details>
      </div>

      <div className="mt-8 border border-line p-5">
        <h3 className="font-display text-2xl text-oxblood">Recent notices</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notices.slice(0, 6).map((notice) => (
            <article key={notice.id} className="border border-line p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-line-strong px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {notice.status}
                </span>
                <span className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">
                  {notice.targetScope}
                </span>
              </div>
              <h4 className="mt-2 font-semibold text-ink">{notice.title}</h4>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                {stripHtml(notice.bodyHtml)}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-soft">
                {formatDate(notice.publishedAt ?? notice.updatedAt)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
