import type { Metadata } from "next";
import {
  FeatureBand,
  ImageCardGrid,
  NextUpCta,
  PageHero,
  StatBand,
} from "@/components/page-sections";
import { examTracks, featuredExams, proofStats } from "@/lib/site";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore Baliraja Institute exam tracks for MPSC, UPSC, Army, Navy, Banking, SSC, Police Bharti, Talathi and ZP preparation.",
};

const courseCards = examTracks.map((track) => ({
  eyebrow: track.code,
  title: track.title,
  body: track.blurb,
  image: track.image,
  href: `/admissions?track=${encodeURIComponent(track.title)}`,
}));

export default function CoursesPage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Courses"
        title="Choose the right exam track"
        body="Wesley groups student pathways clearly. Baliraja does the same here: defence entries, civil services, banking, SSC, police and local government tracks are separated so students can choose with confidence."
        image="/img-reading.jpg"
        imageAlt="A Baliraja student reading exam preparation material"
        actions={[
          { href: "/admissions", label: "Ask for guidance" },
          { href: "/scholarships", label: "See concessions" },
        ]}
      />

      <FeatureBand
        eyebrow={featuredExams[0].kicker}
        title={featuredExams[0].title}
        body={`${featuredExams[0].exams}. ${featuredExams[0].blurb}`}
        image={featuredExams[0].image}
        imageAlt={featuredExams[0].alt}
        action={{ href: "/admissions?track=Army", label: "Enquire for Army" }}
      />

      <FeatureBand
        eyebrow={featuredExams[1].kicker}
        title={featuredExams[1].title}
        body={`${featuredExams[1].exams}. ${featuredExams[1].blurb}`}
        image={featuredExams[1].image}
        imageAlt={featuredExams[1].alt}
        action={{ href: "/admissions?track=Navy", label: "Enquire for Navy" }}
        reverse
      />

      <StatBand stats={proofStats} />

      <ImageCardGrid
        eyebrow="Exam tracks"
        title="Pick your preparation route"
        body="Each card should lead students toward a focused enquiry, not a generic contact form."
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
