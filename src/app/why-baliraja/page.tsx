import {
  FeatureBand,
  NextUpCta,
  PageHero,
  StatBand,
  SupportGrid,
} from "@/components/page-sections";
import { createPageMetadata } from "@/lib/seo";
import { proofStats, supportPoints, whyPoints } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Why Baliraja",
  description:
    "Why students choose Baliraja Institute Career Academy in Gangapur for competitive exam preparation, mentoring, study discipline and rural student support.",
  path: "/why-baliraja",
});

const whySupportPoints = whyPoints.map((point, index) => ({
  title:
    [
      "Faculty who know the exams",
      "Tests built around the real pattern",
      "A serious study base",
      "Practical stay guidance",
    ][index] ?? "Baliraja support",
  body: point,
}));

export default function WhyBalirajaPage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Why Baliraja"
        title="Why Baliraja"
        body="This page answers the first parent and student question: what makes this academy worth visiting before choosing a batch?"
        image="/img-study.jpg"
        imageAlt="A Baliraja Institute student writing notes during focused preparation"
        actions={[
          { href: "/admissions", label: "Start admission enquiry" },
          { href: "/courses", label: "Compare courses" },
        ]}
      />

      <StatBand stats={proofStats} />

      <FeatureBand
        eyebrow="The difference"
        title="A working academy, not just a course list."
        body="Baliraja combines classes, study hall discipline, current affairs routines, mock tests and mentor review so students can see what to do every week."
        image="/img-reading.jpg"
        imageAlt="A student reading competitive exam preparation material"
        action={{ href: "/student-life", label: "See the daily rhythm" }}
      />

      <SupportGrid
        eyebrow="Reasons to choose Baliraja"
        title="What students should be able to trust"
        body="These are the proof points families should find quickly before they compare courses or call the office."
        points={whySupportPoints}
      />

      <SupportGrid
        eyebrow="Student support"
        title="Preparation needs a system around it"
        body="Support beyond the classroom helps serious aspirants keep studying through the parts of preparation that are easiest to abandon."
        points={supportPoints}
      />

      <NextUpCta
        title="Admissions"
        body="Ready to compare a route or ask about concessions? Start with an enquiry and let the office guide the next step."
        href="/admissions"
      />
    </div>
  );
}
