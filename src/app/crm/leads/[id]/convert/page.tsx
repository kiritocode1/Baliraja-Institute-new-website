import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CrmChrome, getCrmChromeData } from "@/app/crm/_components";
import { convertLeadToStudentAction } from "@/app/crm/actions";
import { getLeadById } from "@/lib/crm/leads";
import {
  getStudentByEmail,
  getStudentByLeadId,
  listCourseOptions,
} from "@/lib/crm/students";
import {
  admissionProgramLabels,
  categoryLabels,
} from "@/schemas/admission.schema";

type ConvertLeadPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Convert lead CRM",
  robots: { index: false, follow: false },
};

const fieldClass =
  "w-full border border-line-strong bg-parchment px-3 py-2.5 text-sm text-ink";
const labelClass =
  "mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft";

function ReferenceItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;

  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink">{value}</p>
    </div>
  );
}

export default async function ConvertLeadPage({
  params,
}: ConvertLeadPageProps) {
  const { id } = await params;
  const [chrome, lead, courseOptions] = await Promise.all([
    getCrmChromeData(),
    getLeadById(id),
    listCourseOptions(),
  ]);

  if (!lead) notFound();

  const existingStudent =
    (await getStudentByLeadId(lead.id)) ??
    (lead.email ? await getStudentByEmail(lead.email) : null);
  const matchedCourse = courseOptions.find(
    (course) =>
      course.title.toLowerCase() === lead.track.toLowerCase() ||
      course.slug.toLowerCase() === lead.track.toLowerCase(),
  );
  const education = lead.education
    ? [
        lead.education.tenth ? `10th ${lead.education.tenth.percentage}%` : "",
        lead.education.twelfth
          ? `12th ${lead.education.twelfth.stream ? `${lead.education.twelfth.stream} ` : ""}${lead.education.twelfth.percentage}%`
          : "",
        lead.education.graduation
          ? `Graduation ${lead.education.graduation.course}${
              lead.education.graduation.percentage
                ? ` ${lead.education.graduation.percentage}%`
                : ""
            }`
          : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : null;
  const physical =
    lead.heightCm || lead.weightKg || lead.chestCm
      ? [
          lead.heightCm ? `${lead.heightCm} cm` : "",
          lead.weightKg ? `${lead.weightKg} kg` : "",
          lead.chestCm ? `${lead.chestCm} cm chest` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : null;
  const programs =
    lead.desiredPrograms
      .map((program) => admissionProgramLabels[program] ?? program)
      .join(", ") || null;

  return (
    <CrmChrome
      active="leads"
      admins={chrome.admins}
      env={chrome.env}
      sessionEmail={chrome.session.email}
    >
      <section className="mt-10 bg-parchment px-5 py-7 sm:px-7">
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-oxblood"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All leads
        </Link>

        <div className="mt-5 border-b border-line pb-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Convert to student
          </p>
          <h1 className="mt-3 font-display text-4xl leading-none text-oxblood sm:text-5xl">
            {lead.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Review what the student record will contain, adjust anything, and
            confirm. The student can then log in to the portal with the email
            below.
          </p>
        </div>

        {existingStudent ? (
          <div className="mt-8 border border-brass bg-parchment-deep p-6">
            <h2 className="font-display text-2xl text-oxblood">
              Already converted
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              A student record for this enquiry already exists. Open it to
              manage enrollments, notices, and fees.
            </p>
            <Link
              href={`/crm/students/${existingStudent.id}`}
              className="mt-4 inline-flex bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
            >
              View student
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_24rem]">
            <form
              action={convertLeadToStudentAction}
              className="border border-line p-6"
            >
              <input type="hidden" name="leadId" value={lead.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="convert-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="convert-name"
                    name="name"
                    required
                    defaultValue={lead.name}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="convert-email" className={labelClass}>
                    Email (portal login)
                  </label>
                  <input
                    id="convert-email"
                    name="email"
                    type="email"
                    defaultValue={lead.email ?? ""}
                    placeholder={
                      lead.email
                        ? undefined
                        : "Optional — without it, no portal login"
                    }
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="convert-phone" className={labelClass}>
                    Phone
                  </label>
                  <input
                    id="convert-phone"
                    name="phone"
                    required
                    defaultValue={lead.phone}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="convert-guardian" className={labelClass}>
                    Guardian
                  </label>
                  <input
                    id="convert-guardian"
                    name="guardianName"
                    defaultValue={lead.guardianName ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="convert-guardian-phone"
                    className={labelClass}
                  >
                    Guardian phone
                  </label>
                  <input
                    id="convert-guardian-phone"
                    name="guardianPhone"
                    defaultValue={lead.mobile2 ?? ""}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="convert-course" className={labelClass}>
                    Enroll in course
                  </label>
                  <select
                    id="convert-course"
                    name="courseKey"
                    defaultValue={matchedCourse?.key ?? ""}
                    className={fieldClass}
                  >
                    <option value="">No enrollment yet</option>
                    {courseOptions.map((course) => (
                      <option key={course.key} value={course.key}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="convert-batch" className={labelClass}>
                    Batch
                  </label>
                  <input
                    id="convert-batch"
                    name="batchName"
                    placeholder="June 2026 morning"
                    className={fieldClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="convert-notes" className={labelClass}>
                    Notes
                  </label>
                  <textarea
                    id="convert-notes"
                    name="notes"
                    rows={3}
                    defaultValue={lead.notes ?? lead.message ?? ""}
                    className={`${fieldClass} resize-none`}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 bg-brass-deep px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood"
              >
                Create student record
              </button>
            </form>

            <aside className="space-y-4 border border-line bg-parchment-deep p-6">
              <h2 className="font-display text-2xl text-oxblood">
                From the enquiry
              </h2>
              <ReferenceItem label="Track" value={lead.track} />
              <ReferenceItem label="Programs" value={programs} />
              <ReferenceItem label="Education" value={education} />
              <ReferenceItem label="Physical" value={physical} />
              <ReferenceItem
                label="Category"
                value={lead.category ? categoryLabels[lead.category] : null}
              />
              <ReferenceItem
                label="Domicile"
                value={
                  lead.maharashtraDomicile === null
                    ? null
                    : lead.maharashtraDomicile
                      ? "Maharashtra"
                      : "Outside Maharashtra"
                }
              />
              <ReferenceItem label="Date of birth" value={lead.dateOfBirth} />
              <ReferenceItem label="Gender" value={lead.gender} />
              <ReferenceItem label="Address" value={lead.fullAddress} />
              <ReferenceItem
                label="Concession"
                value={
                  lead.concessionStatus
                    ? `${lead.concessionStatus}${lead.concessionNote ? ` — ${lead.concessionNote}` : ""}`
                    : null
                }
              />
              <ReferenceItem label="Message" value={lead.message} />
              <p className="border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
                Everything shown here is copied onto the student record
                automatically and stays editable there.
              </p>
            </aside>
          </div>
        )}
      </section>
    </CrmChrome>
  );
}
