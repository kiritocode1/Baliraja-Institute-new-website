import { getLocale, getTranslations } from "next-intl/server";
import { AboutHeroVideoPlayer } from "@/components/about-hero-video-player";
import {
  FeatureBand,
  FounderMessage,
  NextUpCta,
  PageHero,
  StatBand,
  SupportGrid,
} from "@/components/page-sections";
import { localize } from "@/lib/i18n-content";
import { createPageMetadata } from "@/lib/seo";
import { pillars, proofStats, site, supportPoints } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "About Baliraja",
  description:
    "Learn about Baliraja Institute Career Academy, Gangapur, its mentoring culture, exam preparation model and promise to educate and serve.",
  path: "/about",
});

export default async function AboutPage() {
  const t = await getTranslations("About");
  const locale = await getLocale();
  const s = localize(site, locale);
  const pillarPoints = localize(pillars, locale).map((pillar) => ({
    title: pillar.title,
    body: pillar.body,
  }));
  const stats = localize(proofStats, locale);
  const support = localize(supportPoints, locale);

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody", { name: s.longName })}
        actions={[
          { href: "/admissions", label: t("heroEnquiry") },
          { href: "/student-life", label: t("heroStudentLife") },
        ]}
      >
        <AboutHeroVideoPlayer />
      </PageHero>

      <FeatureBand
        eyebrow={t("welcomeEyebrow")}
        title={t("welcomeTitle")}
        body={t("welcomeBody")}
        image="/about/about-featured.png"
        imageAlt="A Baliraja Institute aspirant studying at a desk"
        action={{ href: "/courses", label: t("welcomeAction") }}
      />

      <FounderMessage quote={t("founderQuote")} />

      <StatBand stats={stats} />

      <SupportGrid
        eyebrow={t("promiseEyebrow")}
        title={t("promiseTitle")}
        body={t("promiseBody")}
        points={pillarPoints}
      />

      <FeatureBand
        eyebrow={t("methodEyebrow")}
        title={t("methodTitle")}
        body={t("methodBody")}
        image="/about/about-featured-2.JPG"
        imageAlt="A student reading reference material for a competitive exam"
        action={{ href: "/news-events", label: t("methodAction") }}
        reverse
      />

      <SupportGrid
        eyebrow={t("supportEyebrow")}
        title={t("supportTitle")}
        body={t("supportBody")}
        points={support}
      />

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/student-life"
      />
    </div>
  );
}
