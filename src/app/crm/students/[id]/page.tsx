import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CrmChrome, getCrmChromeData } from "@/app/crm/_components";
import {
  createEnrollmentAction,
  createFeeInvoiceAction,
  saveCourseNoticeAction,
  saveStudentAction,
  setStudentActiveAction,
  updateStudentDocumentsAction,
} from "@/app/crm/actions";
import {
  defaultDocuments,
  formatPaise,
  getStudentDetail,
  listBatchNames,
  listCourseOptions,
} from "@/lib/crm/students";
import { listResultsForStudent } from "@/lib/crm/tests";
import {
  admissionProgramLabels,
  categoryLabels,
  categoryValues,
} from "@/schemas/admission.schema";

type StudentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student CRM",
  robots: { index: false, follow: false },
};

const fieldClass =
  "w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink";
const labelClass =
  "mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft";
const buttonClass =
  "bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright";
const cardTitleClass = "font-display text-2xl text-oxblood";

function formatDate(value: string | null) {
  if (!value) return "—";

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

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { id } = await params;
  const [chrome, detail, courseOptions, testResults, batchNames] =
    await Promise.all([
      getCrmChromeData(),
      getStudentDetail(id),
      listCourseOptions(),
      listResultsForStudent(id),
      listBatchNames(),
    ]);

  if (!detail) notFound();

  const { student, enrollments, invoices, payments, notices } = detail;
  const pending = invoices
    .filter(
      (invoice) =>
        invoice.status === "pending" || invoice.status === "processing",
    )
    .reduce((sum, invoice) => sum + invoice.amountPaise, 0);

  return (
    <CrmChrome
      active="students"
      admins={chrome.admins}
      env={chrome.env}
      sessionEmail={chrome.session.email}
    >
      <section className="mt-10 bg-parchment px-5 py-7 sm:px-7">
        <Link
          href="/crm/students"
          className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-oxblood"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All students
        </Link>

        <div className="mt-5 flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl leading-none text-oxblood sm:text-5xl">
                {student.name}
              </h1>
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
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
              {student.email ? (
                <a
                  href={`mailto:${student.email}`}
                  className="hover:text-oxblood"
                >
                  {student.email}
                </a>
              ) : (
                <span>No email — portal login unavailable</span>
              )}
              <a href={`tel:${student.phone}`} className="hover:text-oxblood">
                {student.phone}
              </a>
              <span>Added {formatDate(student.createdAt)}</span>
              {student.leadId ? (
                <Link
                  href={`/crm/leads#lead-${student.leadId}`}
                  className="font-semibold text-oxblood hover:underline"
                >
                  View original enquiry
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Pending fees
              </p>
              <p className="mt-1 font-display text-3xl text-oxblood">
                {formatPaise(pending)}
              </p>
            </div>
            <form action={setStudentActiveAction}>
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
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[24rem_1fr]">
          <div className="space-y-8">
            <form action={saveStudentAction} className="border border-line p-5">
              <h2 className={cardTitleClass}>Profile</h2>
              <input type="hidden" name="id" value={student.id} />
              <label htmlFor="student-name" className={`mt-5 ${labelClass}`}>
                Name
              </label>
              <input
                id="student-name"
                name="name"
                required
                defaultValue={student.name}
                className={fieldClass}
              />
              <label htmlFor="student-email" className={`mt-4 ${labelClass}`}>
                Email (required for portal login)
              </label>
              <input
                id="student-email"
                name="email"
                type="email"
                defaultValue={student.email ?? ""}
                className={fieldClass}
              />
              <label htmlFor="student-phone" className={`mt-4 ${labelClass}`}>
                Phone
              </label>
              <input
                id="student-phone"
                name="phone"
                required
                defaultValue={student.phone}
                className={fieldClass}
              />
              <label
                htmlFor="student-guardian"
                className={`mt-4 ${labelClass}`}
              >
                Guardian
              </label>
              <input
                id="student-guardian"
                name="guardianName"
                defaultValue={student.guardianName ?? ""}
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
                defaultValue={student.guardianPhone ?? ""}
                className={fieldClass}
              />

              <p className="mt-6 border-t border-line pt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
                Physical &amp; bharti profile
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="student-gender" className={labelClass}>
                    Gender
                  </label>
                  <select
                    id="student-gender"
                    name="gender"
                    defaultValue={student.gender ?? ""}
                    className={fieldClass}
                  >
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="student-dob" className={labelClass}>
                    Date of birth
                  </label>
                  <input
                    id="student-dob"
                    name="dateOfBirth"
                    placeholder="DD/MM/YYYY"
                    defaultValue={student.dateOfBirth ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="student-height" className={labelClass}>
                    Height (cm)
                  </label>
                  <input
                    id="student-height"
                    name="heightCm"
                    type="number"
                    step="0.1"
                    defaultValue={student.heightCm ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="student-weight" className={labelClass}>
                    Weight (kg)
                  </label>
                  <input
                    id="student-weight"
                    name="weightKg"
                    type="number"
                    step="0.1"
                    defaultValue={student.weightKg ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="student-chest" className={labelClass}>
                    Chest (cm)
                  </label>
                  <input
                    id="student-chest"
                    name="chestCm"
                    type="number"
                    step="0.1"
                    defaultValue={student.chestCm ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="student-category" className={labelClass}>
                    Category
                  </label>
                  <select
                    id="student-category"
                    name="category"
                    defaultValue={student.category ?? ""}
                    className={fieldClass}
                  >
                    <option value="">—</option>
                    {categoryValues.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="maharashtraDomicile"
                  value="true"
                  defaultChecked={student.maharashtraDomicile === true}
                  className="size-4 accent-oxblood"
                />
                Maharashtra domicile
              </label>

              <label htmlFor="student-address" className={`mt-4 ${labelClass}`}>
                Address
              </label>
              <textarea
                id="student-address"
                name="fullAddress"
                rows={2}
                defaultValue={student.fullAddress ?? ""}
                className={`${fieldClass} resize-none`}
              />

              <p className={`mt-4 ${labelClass}`}>Education</p>
              <div className="grid grid-cols-3 gap-3">
                <input
                  name="educationTenth"
                  type="number"
                  step="0.01"
                  placeholder="10th %"
                  aria-label="10th percentage"
                  defaultValue={student.education?.tenth?.percentage ?? ""}
                  className={fieldClass}
                />
                <input
                  name="educationTwelfth"
                  type="number"
                  step="0.01"
                  placeholder="12th %"
                  aria-label="12th percentage"
                  defaultValue={student.education?.twelfth?.percentage ?? ""}
                  className={fieldClass}
                />
                <input
                  name="educationTwelfthStream"
                  placeholder="12th stream"
                  aria-label="12th stream"
                  defaultValue={student.education?.twelfth?.stream ?? ""}
                  className={fieldClass}
                />
                <input
                  name="educationGraduationCourse"
                  placeholder="Graduation course"
                  aria-label="Graduation course"
                  defaultValue={student.education?.graduation?.course ?? ""}
                  className={`${fieldClass} col-span-2`}
                />
                <input
                  name="educationGraduation"
                  type="number"
                  step="0.01"
                  placeholder="Grad %"
                  aria-label="Graduation percentage"
                  defaultValue={student.education?.graduation?.percentage ?? ""}
                  className={fieldClass}
                />
              </div>
              {student.desiredPrograms.length > 0 ? (
                <p className="mt-3 text-xs text-ink-soft">
                  Programs from enquiry:{" "}
                  {student.desiredPrograms
                    .map(
                      (program) =>
                        admissionProgramLabels[
                          program as keyof typeof admissionProgramLabels
                        ] ?? program,
                    )
                    .join(", ")}
                </p>
              ) : null}

              <label htmlFor="student-notes" className={`mt-4 ${labelClass}`}>
                Notes
              </label>
              <textarea
                id="student-notes"
                name="notes"
                rows={4}
                defaultValue={student.notes ?? ""}
                className={`${fieldClass} resize-none`}
              />
              <button type="submit" className={`mt-5 ${buttonClass}`}>
                Save profile
              </button>
            </form>

            <div className="border border-line p-5">
              <h2 className={cardTitleClass}>Enrollments</h2>
              <div className="mt-4 space-y-3">
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border border-line p-3">
                      <p className="font-medium text-ink">
                        {enrollment.courseTitle}
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {enrollment.batchName || "No batch"} ·{" "}
                        {enrollment.status} · since{" "}
                        {formatDate(enrollment.startedAt)}
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
                  list="detail-batch-options"
                  className={fieldClass}
                />
                <datalist id="detail-batch-options">
                  {batchNames.map((batch) => (
                    <option key={batch} value={batch} />
                  ))}
                </datalist>
                <button type="submit" className={`w-fit ${buttonClass}`}>
                  Add enrollment
                </button>
              </form>
            </div>

            <form
              action={updateStudentDocumentsAction}
              className="border border-line p-5"
            >
              <h2 className={cardTitleClass}>Documents</h2>
              <input type="hidden" name="id" value={student.id} />
              <div className="mt-4 space-y-2">
                {(student.documents.length > 0
                  ? student.documents
                  : defaultDocuments()
                ).map((doc) => (
                  <label
                    key={doc.name}
                    className="flex cursor-pointer items-center gap-3 border border-line px-3 py-2.5 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      name={`doc:${doc.name}`}
                      defaultChecked={doc.submitted}
                      className="size-4 accent-oxblood"
                    />
                    {doc.name}
                  </label>
                ))}
              </div>
              <button type="submit" className={`mt-4 ${buttonClass}`}>
                Save documents
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="border border-line p-5">
              <h2 className={cardTitleClass}>Fee invoices</h2>
              {student.concessionStatus ? (
                <p
                  className={`mt-3 border p-3 text-sm leading-relaxed ${
                    student.concessionStatus === "approved"
                      ? "border-brass bg-parchment-deep text-ink"
                      : "border-line bg-parchment-deep text-ink-soft"
                  }`}
                >
                  <span className="font-semibold uppercase tracking-[0.12em]">
                    Concession {student.concessionStatus}
                  </span>
                  {student.concessionNote ? ` — ${student.concessionNote}` : ""}
                  {student.concessionStatus === "approved"
                    ? " · Enter already-discounted amounts below."
                    : ""}
                </p>
              ) : null}
              <div className="mt-4 space-y-4">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => {
                    const invoicePayments = payments.filter(
                      (payment) => payment.invoiceId === invoice.id,
                    );

                    return (
                      <article
                        key={invoice.id}
                        className="border border-line p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink">
                              {invoice.title}
                            </p>
                            <p className="mt-1 text-sm text-ink-soft">
                              {invoice.receiptNumber} · due{" "}
                              {formatDate(invoice.dueDate)}
                              {invoice.paidAt
                                ? ` · paid ${formatDate(invoice.paidAt)}`
                                : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-2xl text-oxblood">
                              {formatPaise(invoice.amountPaise)}
                            </p>
                            <span className="mt-1 inline-flex border border-line-strong px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                        {invoice.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                            {invoice.description}
                          </p>
                        ) : null}
                        {invoicePayments.length > 0 ? (
                          <div className="mt-3 border-t border-line pt-3">
                            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                              Payments
                            </p>
                            <div className="mt-2 space-y-1 text-sm text-ink-soft">
                              {invoicePayments.map((payment) => (
                                <p key={payment.id}>
                                  {payment.status}
                                  {payment.method ? ` · ${payment.method}` : ""}
                                  {payment.razorpayPaymentId
                                    ? ` · ${payment.razorpayPaymentId}`
                                    : ""}
                                  {" · "}
                                  {formatDate(
                                    payment.capturedAt ?? payment.createdAt,
                                  )}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <p className="text-sm text-ink-soft">No invoices yet.</p>
                )}
              </div>

              <form
                action={createFeeInvoiceAction}
                className="mt-5 grid gap-3 border-t border-line pt-5 md:grid-cols-2"
              >
                <input type="hidden" name="studentId" value={student.id} />
                <select name="enrollmentId" className={fieldClass}>
                  <option value="">No enrollment link</option>
                  {enrollments.map((enrollment) => (
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
                  className={`${fieldClass} resize-none md:col-span-2`}
                />
                <button type="submit" className={`w-fit ${buttonClass}`}>
                  Create invoice
                </button>
              </form>
            </div>

            <div className="border border-line p-5">
              <h2 className={cardTitleClass}>Test results</h2>
              <div className="mt-4 space-y-3">
                {testResults.length > 0 ? (
                  testResults.map((result) => (
                    <article
                      key={result.id}
                      className="flex flex-wrap items-baseline justify-between gap-2 border border-line p-3"
                    >
                      <div>
                        <Link
                          href={`/crm/tests/${result.test.id}`}
                          className="font-semibold text-oxblood hover:underline"
                        >
                          {result.test.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {formatDate(result.test.testDate ?? result.createdAt)}
                          {result.remarks ? ` · ${result.remarks}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-ink">
                        {result.test.kind === "written"
                          ? `${result.marks ?? "—"} / ${result.test.maxMarks}`
                          : Object.entries(result.metrics)
                              .map(([name, value]) => `${name}: ${value}`)
                              .join(" · ") || "—"}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-ink-soft">
                    No test results recorded yet.
                  </p>
                )}
              </div>
            </div>

            <div className="border border-line p-5">
              <h2 className={cardTitleClass}>Notices for this student</h2>
              <div className="mt-4 space-y-3">
                {notices.length > 0 ? (
                  notices.map((notice) => (
                    <article key={notice.id} className="border border-line p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-line-strong px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                          {notice.status}
                        </span>
                        <span className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">
                          {formatDate(notice.publishedAt ?? notice.updatedAt)}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-ink">
                        {notice.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                        {stripHtml(notice.bodyHtml)}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-ink-soft">
                    No notices addressed directly to this student. Course and
                    batch notices still reach them through their enrollment.
                  </p>
                )}
              </div>

              <form
                action={saveCourseNoticeAction}
                className="mt-5 grid gap-3 border-t border-line pt-5"
              >
                <input type="hidden" name="targetScope" value="student" />
                <input type="hidden" name="studentId" value={student.id} />
                <input type="hidden" name="status" value="published" />
                <input
                  name="title"
                  required
                  placeholder="Notice title"
                  className={fieldClass}
                />
                <textarea
                  name="body"
                  rows={3}
                  required
                  placeholder="Notice for this student only"
                  className={`${fieldClass} resize-none`}
                />
                <button type="submit" className={`w-fit ${buttonClass}`}>
                  Publish notice
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </CrmChrome>
  );
}
