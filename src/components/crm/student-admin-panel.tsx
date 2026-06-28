import {
  createCourseNoticeAction,
  createEnrollmentAction,
  createFeeInvoiceAction,
  saveStudentAction,
  setStudentActiveAction,
} from "@/app/crm/actions";
import type {
  CourseNotice,
  CourseOption,
  StudentSummary,
} from "@/lib/crm/students";
import { formatPaise } from "@/lib/crm/students";

type StudentAdminPanelProps = {
  students: StudentSummary[];
  notices: CourseNotice[];
  courseOptions: CourseOption[];
};

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

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function StudentRow({
  student,
  courseOptions,
}: {
  student: StudentSummary;
  courseOptions: CourseOption[];
}) {
  const pendingAmount = student.invoices
    .filter(
      (invoice) =>
        invoice.status === "pending" || invoice.status === "processing",
    )
    .reduce((sum, invoice) => sum + invoice.amountPaise, 0);

  return (
    <article className="border-t border-line py-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-2xl leading-tight text-oxblood">
              {student.name}
            </h3>
            <span
              className={`border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
                student.active
                  ? "border-brass text-brass-deep"
                  : "border-line-strong text-ink-soft"
              }`}
            >
              {student.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-1 text-sm text-ink-soft">
            <a
              href={`mailto:${student.email}`}
              className="w-fit hover:text-oxblood"
            >
              {student.email}
            </a>
            <a
              href={`tel:${student.phone}`}
              className="w-fit hover:text-oxblood"
            >
              {student.phone}
            </a>
            {student.guardianName ? (
              <span>
                Guardian: {student.guardianName}
                {student.guardianPhone ? ` · ${student.guardianPhone}` : ""}
              </span>
            ) : null}
          </div>
          {student.notes ? (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {student.notes}
            </p>
          ) : null}
          <form action={setStudentActiveAction} className="mt-4">
            <input type="hidden" name="id" value={student.id} />
            <input
              type="hidden"
              name="active"
              value={String(!student.active)}
            />
            <button
              type="submit"
              className="border border-line-strong px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
            >
              {student.active ? "Deactivate" : "Activate"}
            </button>
          </form>
        </div>

        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Enrollments
          </p>
          <div className="mt-3 space-y-3">
            {student.enrollments.length > 0 ? (
              student.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border border-line p-3">
                  <p className="font-medium text-ink">
                    {enrollment.courseTitle}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {enrollment.batchName || "No batch"} · {enrollment.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-soft">No course assigned.</p>
            )}
          </div>
          <form action={createEnrollmentAction} className="mt-4 grid gap-3">
            <input type="hidden" name="studentId" value={student.id} />
            <select name="courseKey" required className={fieldClass}>
              <option value="">Assign course</option>
              {courseOptions.map((course) => (
                <option key={course.key} value={course.key}>
                  {course.title}
                </option>
              ))}
            </select>
            <input
              name="batchName"
              placeholder="Batch name"
              className={fieldClass}
            />
            <button
              type="submit"
              className="w-fit bg-oxblood px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
            >
              Add enrollment
            </button>
          </form>
        </div>

        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Fees
          </p>
          <p className="mt-3 font-display text-3xl text-oxblood">
            {formatPaise(pendingAmount)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">Pending amount</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            Processing means the browser callback passed and the final Razorpay
            webhook is still pending.
          </p>
          <div className="mt-4 space-y-3">
            {student.invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="border border-line p-3">
                <p className="font-medium text-ink">{invoice.title}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {formatPaise(invoice.amountPaise)} · {invoice.status}
                </p>
              </div>
            ))}
          </div>
          <form action={createFeeInvoiceAction} className="mt-4 grid gap-3">
            <input type="hidden" name="studentId" value={student.id} />
            <select name="enrollmentId" className={fieldClass}>
              <option value="">No enrollment link</option>
              {student.enrollments.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.id}>
                  {enrollment.courseTitle}
                </option>
              ))}
            </select>
            <input
              name="title"
              required
              placeholder="Fee title"
              className={fieldClass}
            />
            <input
              name="amountRupees"
              required
              inputMode="decimal"
              placeholder="Amount in rupees"
              className={fieldClass}
            />
            <input name="dueDate" type="date" className={fieldClass} />
            <textarea
              name="description"
              rows={2}
              placeholder="Fee note"
              className={`${fieldClass} resize-none`}
            />
            <button
              type="submit"
              className="w-fit bg-oxblood px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
            >
              Create invoice
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

export function StudentAdminPanel({
  students,
  notices,
  courseOptions,
}: StudentAdminPanelProps) {
  const activeStudents = students.filter((student) => student.active).length;
  const pendingFees = students.reduce(
    (sum, student) =>
      sum +
      student.invoices
        .filter(
          (invoice) =>
            invoice.status === "pending" || invoice.status === "processing",
        )
        .reduce((studentSum, invoice) => studentSum + invoice.amountPaise, 0),
    0,
  );

  return (
    <section id="crm-students" className="mt-10 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Students
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Portal access and fees
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Create student login records, assign course pages, publish targeted
            notices, and issue one-time fee invoices for Razorpay payment.
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

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_28rem]">
        <div>
          <div className="border-b border-line pb-4">
            <h3 className="font-display text-3xl text-oxblood">
              Student records
            </h3>
          </div>
          {students.length > 0 ? (
            students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                courseOptions={courseOptions}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <h3 className="font-display text-3xl text-oxblood">
                No students yet
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                Convert a lead or create the first student record to enable
                student portal login.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <form action={saveStudentAction} className="border border-line p-5">
            <h3 className="font-display text-2xl text-oxblood">Add student</h3>
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
            <button
              type="submit"
              className="mt-5 bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
            >
              Save student
            </button>
          </form>

          <form
            action={createCourseNoticeAction}
            className="border border-line p-5"
          >
            <h3 className="font-display text-2xl text-oxblood">
              Create notice
            </h3>
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
            <input id="notice-batch" name="batchName" className={fieldClass} />
            <label htmlFor="notice-student" className={`mt-4 ${labelClass}`}>
              Student
            </label>
            <select id="notice-student" name="studentId" className={fieldClass}>
              <option value="">No student target</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.email}
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
            <label
              htmlFor="notice-attachment-url"
              className={`mt-4 ${labelClass}`}
            >
              Attachment URL
            </label>
            <input
              id="notice-attachment-url"
              name="attachmentUrl"
              placeholder="Vercel Blob URL"
              className={fieldClass}
            />
            <label
              htmlFor="notice-attachment-name"
              className={`mt-4 ${labelClass}`}
            >
              Attachment name
            </label>
            <input
              id="notice-attachment-name"
              name="attachmentName"
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
            <button
              type="submit"
              className="mt-5 bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
            >
              Save notice
            </button>
          </form>

          <div className="border border-line p-5">
            <h3 className="font-display text-2xl text-oxblood">
              Recent notices
            </h3>
            <div className="mt-4 space-y-4">
              {notices.slice(0, 6).map((notice) => (
                <article key={notice.id} className="border-t border-line pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="border border-line-strong px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      {notice.status}
                    </span>
                    <span className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">
                      {notice.targetScope}
                    </span>
                  </div>
                  <h4 className="mt-2 font-semibold text-ink">
                    {notice.title}
                  </h4>
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
        </aside>
      </div>
    </section>
  );
}
