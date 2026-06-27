import type { Metadata } from "next";
import {
  FeatureBand,
  NextUpCta,
  PageHero,
  StatBand,
  SupportGrid,
} from "@/components/page-sections";
import { pillars, proofStats, site, supportPoints } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Baliraja",
  description:
    "Learn about Baliraja Institute Career Academy, Gangapur, its mentoring culture, exam preparation model and promise to educate and serve.",
};

const pillarPoints = pillars.map((pillar) => ({
  title: pillar.title,
  body: pillar.body,
}));

export default function AboutPage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="About Baliraja"
        title="The Baliraja difference"
        body={`${site.longName} is built for serious aspirants from Gangapur, Marathwada and nearby rural communities who need structure, mentoring and a place to study with purpose.`}
        image="/img-classroom.jpg"
        imageAlt="Baliraja Institute classroom with students preparing for competitive exams"
        actions={[
          { href: "/admissions", label: "Start admission enquiry" },
          { href: "/student-life", label: "See student life" },
        ]}
      />

      <FeatureBand
        eyebrow="Welcome"
        title="An academy shaped around the student who has to earn every attempt."
        body="Baliraja keeps the day practical: clear lectures, current-affairs routines, reading hours, mock tests and review conversations. The aim is not to impress students with complexity. It is to help them prepare consistently until the exam date arrives."
        image="/img-study.jpg"
        imageAlt="A Baliraja Institute aspirant studying at a desk"
        action={{ href: "/courses", label: "Explore exam tracks" }}
      />

      <StatBand stats={proofStats} />

      <SupportGrid
        eyebrow="Promise"
        title="To educate and to serve"
        body="The Wesley reference uses mission, values and community proof as a spine. Baliraja’s version is simpler and more direct: teach well, mentor closely and keep rural students in the room."
        points={pillarPoints}
      />

      <FeatureBand
        eyebrow="Method"
        title="Preparation is treated as a routine, not a slogan."
        body="Every exam track is broken into classes, reading, revision and test practice. Mentors help students choose a realistic route through the syllabus instead of trying to chase every notification at once."
        image="/img-reading.jpg"
        imageAlt="A student reading reference material for a competitive exam"
        action={{ href: "/news-events", label: "Read academy updates" }}
        reverse
      />

      <SupportGrid
        eyebrow="Student support"
        title="The systems around the classroom matter."
        body="Aspirants need more than lectures. They need study space, review discipline, current affairs and honest feedback on where they stand."
        points={supportPoints}
      />

      <NextUpCta
        title="Student Life"
        body="See the everyday spaces, routines and support systems that make Baliraja more than a timetable."
        href="/student-life"
      />
    </div>
  );
}
