import { ImageCardGrid, NextUpCta, PageHero } from "@/components/page-sections";
import {
  courseMediumLabels,
  courseMediums,
  listPublishedCourseCards,
} from "@/lib/crm/course-pages";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "School",
  description:
    "Baliraja Institute schools in Marathi and semi-English medium — disciplined schooling on the same campus that trains bharti aspirants.",
  path: "/school",
});

export default async function SchoolPage() {
  const cards = (await listPublishedCourseCards()).filter(
    (card) => card.division === "school",
  );
  const withoutMedium = cards.filter((card) => !card.medium);

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="School"
        title="Baliraja schools"
        body="Alongside bharti coaching, Baliraja runs schooling in Marathi and semi-English medium — the same campus discipline, sports grounds, and mentoring applied from the school bench onward."
        actions={[
          { href: "/admissions?track=School", label: "Enquire for admission" },
          { href: "/contact-us", label: "Visit the campus" },
        ]}
      />

      {cards.length === 0 ? (
        <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-display text-4xl text-oxblood">
            School pages are being prepared
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
            Standards and admission details will appear here soon. Meanwhile,
            send an enquiry from the admissions page or call the office — the
            team will walk you through mediums, standards, and fees.
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
                eyebrow={courseMediumLabels[medium]}
                title={courseMediumLabels[medium]}
                body="Open the standard you are interested in for syllabus, admission, and fee details."
                items={mediumCards}
              />
            );
          })}
          {withoutMedium.length > 0 ? (
            <ImageCardGrid
              eyebrow="School programs"
              title="School programs"
              body="Open a program for details and the admission path."
              items={withoutMedium}
            />
          ) : null}
        </>
      )}

      <NextUpCta
        title="Admissions"
        body="Tell us the student's standard and preferred medium — the office will call back with seat availability."
        href="/admissions?track=School"
        label="Start enquiry"
      />
    </div>
  );
}
