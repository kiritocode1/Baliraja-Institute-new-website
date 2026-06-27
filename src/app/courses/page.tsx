import type { Metadata } from "next";
import {
  FeatureBand,
  ImageCardGrid,
  NextUpCta,
  PageHero,
  StatBand,
} from "@/components/page-sections";
import {
  getCoursePageBySeedKey,
  listPublishedCourseCards,
} from "@/lib/crm/course-pages";
import { featuredExams, proofStats } from "@/lib/site";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore Baliraja Institute exam tracks for MPSC, UPSC, Army, Navy, Banking, SSC, Police Bharti, Talathi and ZP preparation.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Courses",
    description:
      "Explore Baliraja Institute exam tracks for MPSC, UPSC, Army, Navy, Banking, SSC, Police Bharti, Talathi and ZP preparation.",
    url: "/courses",
  },
};

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
  const [courseCards, armyPage, navyPage] = await Promise.all([
    listPublishedCourseCards(),
    getCoursePageBySeedKey("featured-army"),
    getCoursePageBySeedKey("featured-navy"),
  ]);
  const army = armyPage ?? {
    title: featuredExams[0].title,
    category: featuredExams[0].kicker,
    exams: featuredExams[0].exams,
    summary: featuredExams[0].blurb,
    duration: null,
    image: featuredExams[0].image,
    imageAlt: featuredExams[0].alt,
    slug: featuredExams[0].key,
  };
  const navy = navyPage ?? {
    title: featuredExams[1].title,
    category: featuredExams[1].kicker,
    exams: featuredExams[1].exams,
    summary: featuredExams[1].blurb,
    duration: null,
    image: featuredExams[1].image,
    imageAlt: featuredExams[1].alt,
    slug: featuredExams[1].key,
  };

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Courses"
        title="Choose the right exam track"
        body="Defence entries, civil services, banking, SSC, police and local government tracks are separated clearly so students can choose with confidence."
        image="/img-reading.jpg"
        imageAlt="A Baliraja student reading exam preparation material"
        actions={[
          { href: "/admissions", label: "Ask for guidance" },
          { href: "/scholarships", label: "See concessions" },
        ]}
      />

      <FeatureBand
        eyebrow={army.category}
        title={army.title}
        body={featuredBody(army)}
        image={army.image}
        imageAlt={army.imageAlt ?? army.title}
        action={{
          href: `/courses/${army.slug}`,
          label: `Prepare for ${army.title}`,
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
          label: `Prepare for ${navy.title}`,
        }}
        reverse
      />

      <StatBand stats={proofStats} />

      <ImageCardGrid
        eyebrow="Exam tracks"
        title="Pick your preparation route"
        body="Each course now has a focused page with exam scope, batch guidance, and a clear admission path."
        items={courseCards}
      />

      <NextUpCta
        title="Admissions"
        body="Once the route is clear, the next step is a mentor call and a batch recommendation."
        href="/admissions"
        label="Start enquiry"
      />
    </div>
  );
}
