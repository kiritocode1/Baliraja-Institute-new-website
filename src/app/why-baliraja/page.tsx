import { getLocale, getTranslations } from "next-intl/server";
import {
  FeatureBand,
  NextUpCta,
  PageHero,
  StatBand,
  SupportGrid,
} from "@/components/page-sections";
import { PlayableReelGrid } from "@/components/playable-reel-grid";
import { localize } from "@/lib/i18n-content";
import { createPageMetadata } from "@/lib/seo";
import { proofStats, supportPoints, whyPoints, whyPointsMr } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Why Baliraja",
  description:
    "Why students choose Baliraja Institute Career Academy in Gangapur for competitive exam preparation, mentoring, study discipline and rural student support.",
  path: "/why-baliraja",
});

export default async function WhyBalirajaPage() {
  const t = await getTranslations("WhyBaliraja");
  const locale = await getLocale();
  const stats = localize(proofStats, locale);
  const support = localize(supportPoints, locale);
  const points = locale === "mr" ? whyPointsMr : whyPoints;
  const titles = [t("whyTitle1"), t("whyTitle2"), t("whyTitle3"), t("whyTitle4")];
  const whySupportPoints = points.map((point, index) => ({
    title: titles[index] ?? t("whyFallback"),
    body: point,
  }));

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        actions={[
          { href: "/admissions", label: t("heroEnquiry") },
          { href: "/courses", label: t("heroCompare") },
        ]}
      />
      <PlayableReelGrid />

      <StatBand stats={stats} />

      <FeatureBand
        eyebrow={t("diffEyebrow")}
        title={t("diffTitle")}
        body={t("diffBody")}
        image="/img-reading.jpg"
        imageAlt="A student reading competitive exam preparation material"
        action={{ href: "/student-life", label: t("diffAction") }}
      />

      <SupportGrid
        eyebrow={t("reasonsEyebrow")}
        title={t("reasonsTitle")}
        body={t("reasonsBody")}
        points={whySupportPoints}
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
        href="/admissions"
      />
    </div>
  );
}
