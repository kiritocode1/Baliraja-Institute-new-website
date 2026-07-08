import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  NextUpCta,
  PageHero,
  SectionIntro,
  StatBand,
} from "@/components/page-sections";
import { localize } from "@/lib/i18n-content";
import { createPageMetadata } from "@/lib/seo";
import { proofStats, scholarshipPrograms } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Scholarships",
  description:
    "Baliraja Institute scholarship and fee-concession options for farming families, merit students, defence aspirants and repeat-attempt students.",
  path: "/scholarships",
});

export default async function ScholarshipsPage() {
  const t = await getTranslations("Scholarships");
  const locale = await getLocale();
  const stats = localize(proofStats, locale);
  const programs = localize(scholarshipPrograms, locale);

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        image="/student-life/Explore-v-4.webp"
        imageAlt="Baliraja Institute study support and scholarships"
        actions={[
          {
            href: "/admissions?request=scholarship",
            label: t("heroApply"),
          },
          { href: "/contact-us", label: t("heroTalk") },
        ]}
      />

      <StatBand stats={stats} />

      <section className="bg-parchment-deep py-24 sm:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <SectionIntro
            eyebrow={t("introEyebrow")}
            title={t("introTitle")}
            body={t("introBody")}
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {programs.map((program) => (
              <article key={program.title} className="bg-parchment p-7">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                  {program.audience}
                </p>
                <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-oxblood">
                  {program.title}
                </h2>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                  {program.body}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {program.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-line-strong px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-soft"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <Link
            href="/admissions?request=scholarship"
            className="mt-10 inline-flex items-center gap-3 bg-oxblood px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-deep"
          >
            {t("startEnquiry")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/news-events"
      />
    </div>
  );
}
