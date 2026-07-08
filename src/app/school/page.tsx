import { getLocale, getTranslations } from "next-intl/server";
import { ImageCardGrid, NextUpCta, PageHero } from "@/components/page-sections";
import { courseMediums, listPublishedCourseCards } from "@/lib/crm/course-pages";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "School",
  description:
    "Baliraja Institute schools in Marathi and semi-English medium — disciplined schooling on the same campus that trains bharti aspirants.",
  path: "/school",
});

export default async function SchoolPage() {
  const t = await getTranslations("School");
  const locale = await getLocale();
  const cards = (await listPublishedCourseCards(locale)).filter(
    (card) => card.division === "school",
  );
  const withoutMedium = cards.filter((card) => !card.medium);
  const mediumLabel = (medium: string) =>
    medium === "marathi" ? t("mediumMarathi") : t("mediumSemiEnglish");

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        actions={[
          { href: "/admissions?track=School", label: t("heroEnquire") },
          { href: "/contact-us", label: t("heroVisit") },
        ]}
      />

      {cards.length === 0 ? (
        <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-display text-4xl text-oxblood">
            {t("emptyTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
            {t("emptyBody")}
          </p>
        </section>
      ) : (
        <>
          {courseMediums.map((medium) => {
            const mediumCards = cards.filter((card) => card.medium === medium);

            if (mediumCards.length === 0) return null;

            return (
              <ImageCardGrid
                key={medium}
                eyebrow={mediumLabel(medium)}
                title={mediumLabel(medium)}
                body={t("mediumBody")}
                items={mediumCards}
              />
            );
          })}
          {withoutMedium.length > 0 ? (
            <ImageCardGrid
              eyebrow={t("programsEyebrow")}
              title={t("programsEyebrow")}
              body={t("programsBody")}
              items={withoutMedium}
            />
          ) : null}
        </>
      )}

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/admissions?track=School"
        label={t("nextUpLabel")}
      />
    </div>
  );
}
