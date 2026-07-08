import { getLocale, getTranslations } from "next-intl/server";
import {
  FeatureBand,
  ImageCardGrid,
  NextUpCta,
  PageHero,
  StatBand,
} from "@/components/page-sections";
import { PlayableReelGrid } from "@/components/playable-reel-grid";
import {
  getCoursePageBySeedKey,
  listPublishedCourseCards,
} from "@/lib/crm/course-pages";
import { localize } from "@/lib/i18n-content";
import { createPageMetadata } from "@/lib/seo";
import { featuredExams, proofStats } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Courses",
  description:
    "Explore Baliraja Institute tracks for Army, Navy, Air Force, Police Bharti, SSC, Railway and allied recruitment preparation.",
  path: "/courses",
});

function featuredBody(course: {
  exams: string | null;
  summary: string;
  duration: string | null;
}) {
  return [course.exams, course.summary, course.duration]
    .filter(Boolean)
    .join(". ");
}

export default async function CoursesPage() {
  const t = await getTranslations("Courses");
  const locale = await getLocale();
  const [courseCards, armyPage, navyPage] = await Promise.all([
    listPublishedCourseCards(locale),
    getCoursePageBySeedKey("featured-army", true, locale),
    getCoursePageBySeedKey("featured-navy", true, locale),
  ]);
  const fx = localize(featuredExams, locale);
  const stats = localize(proofStats, locale);
  const courseReels = [
    { id: "course-1", src: "/courses/course-hero-v1.mp4", title: t("reel1") },
    { id: "course-2", src: "/student-life/about-v4.mp4", title: t("reel2") },
    { id: "course-3", src: "/courses/course-hero-v2.mp4", title: t("reel3") },
    { id: "course-4", src: "/student-life/aboutv-v3.mp4", title: t("reel4") },
  ];
  const army = armyPage ?? {
    title: fx[0].title,
    category: fx[0].kicker,
    exams: fx[0].exams,
    summary: fx[0].blurb,
    duration: null,
    image: fx[0].image,
    imageAlt: fx[0].alt,
    slug: fx[0].key,
  };
  const navy = navyPage ?? {
    title: fx[1].title,
    category: fx[1].kicker,
    exams: fx[1].exams,
    summary: fx[1].blurb,
    duration: null,
    image: fx[1].image,
    imageAlt: fx[1].alt,
    slug: fx[1].key,
  };

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        imageAlt="A Baliraja student reading exam preparation material"
        actions={[
          { href: "/admissions", label: t("heroGuidance") },
          { href: "/scholarships", label: t("heroConcessions") },
        ]}
      />
      <PlayableReelGrid reels={courseReels} />

      <FeatureBand
        eyebrow={army.category}
        title={army.title}
        body={featuredBody(army)}
        image={army.image}
        imageAlt={army.imageAlt ?? army.title}
        action={{
          href: `/courses/${army.slug}`,
          label: t("prepareFor", { title: army.title }),
        }}
      />

      <FeatureBand
        eyebrow={navy.category}
        title={navy.title}
        body={featuredBody(navy)}
        image={navy.image}
        imageAlt={navy.imageAlt ?? navy.title}
        action={{
          href: `/courses/${navy.slug}`,
          label: t("prepareFor", { title: navy.title }),
        }}
        reverse
      />

      <StatBand stats={stats} />

      <ImageCardGrid
        eyebrow={t("tracksEyebrow")}
        title={t("tracksTitle")}
        body={t("tracksBody")}
        items={courseCards.filter((card) => card.division === "bharti")}
      />

      {courseCards.some((card) => card.division === "school") ? (
        <ImageCardGrid
          eyebrow={t("schoolEyebrow")}
          title={t("schoolTitle")}
          body={t("schoolBody")}
          items={courseCards.filter((card) => card.division === "school")}
        />
      ) : null}

      {courseCards.some((card) => card.division === "sports") ? (
        <ImageCardGrid
          eyebrow={t("sportsEyebrow")}
          title={t("sportsTitle")}
          body={t("sportsBody")}
          items={courseCards.filter((card) => card.division === "sports")}
        />
      ) : null}

      {courseCards.some((card) => card.division === "camp") ? (
        <ImageCardGrid
          eyebrow={t("campsEyebrow")}
          title={t("campsTitle")}
          body={t("campsBody")}
          items={courseCards.filter((card) => card.division === "camp")}
        />
      ) : null}

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/admissions"
        label={t("nextUpLabel")}
      />
    </div>
  );
}
