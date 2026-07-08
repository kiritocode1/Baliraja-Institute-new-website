import { getLocale, getTranslations } from "next-intl/server";
import {
  FaqBand,
  GuideCtaPanel,
  ImageCardGrid,
  NextUpCta,
  PageHero,
  SupportGrid,
  VoiceGrid,
} from "@/components/page-sections";
import { PlayableReelGrid } from "@/components/playable-reel-grid";
import { localize } from "@/lib/i18n-content";
import { createPageMetadata } from "@/lib/seo";
import {
  campusLifeItems,
  preparationGuide,
  studentLifeFaqs,
  studentVoices,
  supportPoints,
} from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Student Life",
  description:
    "Explore student life at Baliraja Institute: reading hall, daily lectures, mock tests, defence practice, mentoring and student support.",
  path: "/student-life",
});

export default async function StudentLifePage() {
  const t = await getTranslations("StudentLife");
  const locale = await getLocale();
  const campus = localize(campusLifeItems, locale);
  const voices = localize(studentVoices, locale);
  const support = localize(supportPoints, locale);
  const faqs = localize(studentLifeFaqs, locale);
  const guide = localize(preparationGuide, locale);

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        imageAlt="Competitive exam books and notes used by Baliraja Institute students"
        actions={[
          { href: "/admissions", label: t("heroEnquire") },
          { href: "/courses", label: t("heroCompare") },
        ]}
      />
      <PlayableReelGrid />

      <ImageCardGrid
        eyebrow={t("exploreEyebrow")}
        title={t("exploreTitle")}
        body={t("exploreBody")}
        items={campus}
      />

      <VoiceGrid voices={voices} />

      <SupportGrid
        eyebrow={t("wellbeingEyebrow")}
        title={t("wellbeingTitle")}
        body={t("wellbeingBody")}
        points={support}
      />

      <FaqBand
        eyebrow={t("faqEyebrow")}
        title={t("faqTitle")}
        body={t("faqBody")}
        items={faqs}
      />

      <GuideCtaPanel guide={guide} />

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/courses"
      />
    </div>
  );
}
