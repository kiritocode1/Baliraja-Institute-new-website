import { Download } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { StudentPortalShell } from "@/components/student/portal-shell";
import { getStudentDashboard } from "@/lib/crm/students";
import { requireStudentSession } from "@/lib/student/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Notices",
  robots: { index: false, follow: false },
};

export default async function StudentNoticesPage() {
  const t = await getTranslations("Student");
  const locale = await getLocale();
  const formatDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale === "mr" ? "mr-IN" : "en-IN", {
          dateStyle: "medium",
        }).format(new Date(value))
      : t("noDate");
  const session = await requireStudentSession();
  const dashboard = await getStudentDashboard(session.studentId);

  if (!dashboard) {
    return (
      <section className="bg-parchment-deep px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-5xl text-oxblood">{t("inactive")}</h1>
      </section>
    );
  }

  return (
    <StudentPortalShell student={dashboard.student} activePath="notices">
      <section className="mt-8 bg-parchment px-5 py-7 sm:px-7">
        <div className="border-b border-line pb-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            {t("courseNotices")}
          </p>
          <h2 className="mt-3 font-display text-4xl text-oxblood">
            {t("assignedUpdates")}
          </h2>
        </div>
        <div className="divide-y divide-line">
          {dashboard.notices.map((notice) => (
            <article key={notice.id} className="py-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
                  {formatDate(notice.publishedAt ?? notice.updatedAt)}
                </p>
                <span className="border border-line-strong px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {notice.targetScope}
                </span>
              </div>
              <h3 className="mt-3 font-display text-3xl text-oxblood">
                {notice.title}
              </h3>
              <div
                className="blog-content mt-4 max-w-3xl text-ink-soft"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: notices are sanitized when admins create them.
                dangerouslySetInnerHTML={{ __html: notice.bodyHtml }}
              />
              {notice.attachmentUrl ? (
                <a
                  href={notice.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 bg-oxblood px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
                >
                  <Download className="size-4" aria-hidden="true" />
                  {notice.attachmentName || t("downloadAttachment")}
                </a>
              ) : null}
            </article>
          ))}
          {dashboard.notices.length === 0 ? (
            <div className="py-16 text-center">
              <h3 className="font-display text-3xl text-oxblood">
                {t("noNoticesYet")}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                {t("noNoticesYetBody")}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </StudentPortalShell>
  );
}
