import Link from "next/link";
import {
  deleteCourseNoticeAction,
  saveCourseNoticeAction,
} from "@/app/crm/actions";
import type {
  CourseNotice,
  CourseOption,
  StudentSummary,
} from "@/lib/crm/students";

const fieldClass =
  "w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink";
const labelClass =
  "mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft";
const buttonClass =
  "bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright";
const fileClass =
  "w-full text-sm text-ink file:mr-3 file:border file:border-line-strong file:bg-parchment file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.12em]";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function NoticeFormFields({
  notice,
  courseOptions,
  students,
  idPrefix,
}: {
  notice: CourseNotice | null;
  courseOptions: CourseOption[];
  students: StudentSummary[];
  idPrefix: string;
}) {
  return (
    <>
      {notice ? <input type="hidden" name="id" value={notice.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor={`${idPrefix}-title`} className={labelClass}>
            Title
          </label>
          <input
            id={`${idPrefix}-title`}
            name="title"
            required
            defaultValue={notice?.title ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-target`} className={labelClass}>
            Send to
          </label>
          <select
            id={`${idPrefix}-target`}
            name="targetScope"
            defaultValue={notice?.targetScope ?? "all"}
            className={fieldClass}
          >
            <option value="all">All students</option>
            <option value="course">One course</option>
            <option value="batch">One batch</option>
            <option value="student">One student</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-status`} className={labelClass}>
            Status
          </label>
          <select
            id={`${idPrefix}-status`}
            name="status"
            defaultValue={notice?.status ?? "published"}
            className={fieldClass}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-course`} className={labelClass}>
            Course (for course target)
          </label>
          <select
            id={`${idPrefix}-course`}
            name="courseKey"
            defaultValue={notice?.courseKey ?? ""}
            className={fieldClass}
          >
            <option value="">—</option>
            {courseOptions.map((course) => (
              <option key={course.key} value={course.key}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-batch`} className={labelClass}>
            Batch (for batch target)
          </label>
          <input
            id={`${idPrefix}-batch`}
            name="batchName"
            list="notice-batch-options"
            defaultValue={notice?.batchName ?? ""}
            className={fieldClass}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${idPrefix}-student`} className={labelClass}>
            Student (for student target)
          </label>
          <select
            id={`${idPrefix}-student`}
            name="studentId"
            defaultValue={notice?.studentId ?? ""}
            className={fieldClass}
          >
            <option value="">—</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.email ?? student.phone}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${idPrefix}-body`} className={labelClass}>
            Notice body
          </label>
          <textarea
            id={`${idPrefix}-body`}
            name="body"
            rows={4}
            required
            defaultValue={notice ? stripHtml(notice.bodyHtml) : ""}
            className={`${fieldClass} resize-none`}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-attachment`} className={labelClass}>
            Attachment (PDF or image)
          </label>
          <input
            id={`${idPrefix}-attachment`}
            name="attachment"
            type="file"
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
            className={fileClass}
          />
          {notice?.attachmentUrl ? (
            <input
              type="hidden"
              name="attachmentUrl"
              value={notice.attachmentUrl}
            />
          ) : null}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-attachment-name`} className={labelClass}>
            Attachment display name
          </label>
          <input
            id={`${idPrefix}-attachment-name`}
            name="attachmentName"
            defaultValue={notice?.attachmentName ?? ""}
            placeholder="Defaults to the file name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-expires`} className={labelClass}>
            Expires (optional)
          </label>
          <input
            id={`${idPrefix}-expires`}
            name="expiresAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(notice?.expiresAt ?? null)}
            className={fieldClass}
          />
        </div>
      </div>
    </>
  );
}

export function NoticesPanel({
  notices,
  courseOptions,
  students,
  batchNames,
}: {
  notices: CourseNotice[];
  courseOptions: CourseOption[];
  students: StudentSummary[];
  batchNames: string[];
}) {
  const courseTitleByKey = new Map(
    courseOptions.map((course) => [course.key, course.title]),
  );
  const studentNameById = new Map(
    students.map((student) => [student.id, student.name]),
  );
  const published = notices.filter(
    (notice) => notice.status === "published",
  ).length;

  const targetLabel = (notice: CourseNotice) => {
    if (notice.targetScope === "course") {
      return `Course: ${notice.courseKey ? (courseTitleByKey.get(notice.courseKey) ?? notice.courseKey) : "—"}`;
    }
    if (notice.targetScope === "batch") {
      return `Batch: ${notice.batchName ?? "—"}`;
    }
    if (notice.targetScope === "student") {
      return `Student: ${notice.studentId ? (studentNameById.get(notice.studentId) ?? "removed") : "—"}`;
    }
    return "All students";
  };

  return (
    <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Notices
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Student notices &amp; materials
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Everything published here reaches the student portal — to everyone,
            a course, a batch, or one student. Edit, archive, or delete any
            notice below.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="border border-line bg-parchment-deep p-4">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Published
            </p>
            <p className="mt-2 font-display text-3xl text-oxblood">
              {published}
            </p>
          </div>
          <div className="border border-line bg-parchment-deep p-4">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Total
            </p>
            <p className="mt-2 font-display text-3xl text-oxblood">
              {notices.length}
            </p>
          </div>
        </div>
      </div>

      <datalist id="notice-batch-options">
        {batchNames.map((batch) => (
          <option key={batch} value={batch} />
        ))}
      </datalist>

      <form
        action={saveCourseNoticeAction}
        className="mt-8 border border-line bg-parchment-deep p-5"
      >
        <h3 className="font-display text-2xl text-oxblood">Publish a notice</h3>
        <div className="mt-4">
          <NoticeFormFields
            notice={null}
            courseOptions={courseOptions}
            students={students}
            idPrefix="new-notice"
          />
        </div>
        <button type="submit" className={`mt-5 ${buttonClass}`}>
          Save notice
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <article key={notice.id} className="border border-line">
              <div className="flex flex-wrap items-center gap-3 border-b border-line bg-parchment-deep px-5 py-4">
                <span
                  className={`border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
                    notice.status === "published"
                      ? "border-brass text-brass-deep"
                      : "border-line-strong text-ink-soft"
                  }`}
                >
                  {notice.status}
                </span>
                <h3 className="font-display text-2xl leading-tight text-oxblood">
                  {notice.title}
                </h3>
                <span className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
                  {targetLabel(notice)} ·{" "}
                  {formatDate(notice.publishedAt ?? notice.updatedAt)}
                </span>
                {notice.attachmentUrl ? (
                  <Link
                    href={notice.attachmentUrl}
                    target="_blank"
                    className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-oxblood hover:underline"
                  >
                    {notice.attachmentName ?? "Attachment"}
                  </Link>
                ) : null}
              </div>

              <details>
                <summary className="cursor-pointer px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft hover:text-oxblood [&::-webkit-details-marker]:hidden">
                  Edit notice
                </summary>
                <div className="border-t border-line p-5">
                  <form action={saveCourseNoticeAction}>
                    <NoticeFormFields
                      notice={notice}
                      courseOptions={courseOptions}
                      students={students}
                      idPrefix={`notice-${notice.id}`}
                    />
                    <button type="submit" className={`mt-4 ${buttonClass}`}>
                      Save changes
                    </button>
                  </form>
                  <form
                    action={deleteCourseNoticeAction}
                    className="mt-3 border-t border-line pt-3"
                  >
                    <input type="hidden" name="id" value={notice.id} />
                    <button
                      type="submit"
                      className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-destructive hover:underline"
                    >
                      Delete notice permanently
                    </button>
                  </form>
                </div>
              </details>
            </article>
          ))
        ) : (
          <div className="border border-line bg-parchment-deep py-12 text-center">
            <h3 className="font-display text-3xl text-oxblood">
              No notices yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              Publish the first notice above — students see it in the portal
              immediately.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
