import type { Metadata } from "next";
import {
  FaqBand,
  GuideCtaPanel,
  ImageCardGrid,
  NextUpCta,
  PageHero,
  SupportGrid,
  VoiceGrid,
} from "@/components/page-sections";
import {
  campusLifeItems,
  preparationGuide,
  studentLifeFaqs,
  studentVoices,
  supportPoints,
} from "@/lib/site";
import { StudentLifeMarquee } from "@/components/sections/student-life-marquee";

export const metadata: Metadata = {
  title: "Student Life",
  description:
    "Explore student life at Baliraja Institute: reading hall, daily lectures, mock tests, defence practice, mentoring and student support.",
  alternates: { canonical: "/student-life" },
};

export default function StudentLifePage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Student life"
        title="Live the preparation day"
        body="Aspirants and parents should be able to picture the day before admission: study rhythm, classroom energy, mentoring and the community that keeps students moving."
        image="/img-books.jpg"
        imageAlt="Competitive exam books and notes used by Baliraja Institute students"
        actions={[
          { href: "/admissions", label: "Enquire for a batch" },
          { href: "/courses", label: "Compare courses" },
        ]}
      />

      <StudentLifeMarquee />

      <ImageCardGrid
        eyebrow="Explore"
        title="A full day of preparation"
        body="Browse the spaces and routines students use every week: study hall, lectures, test practice, defence preparation and one-to-one mentoring."
        items={campusLifeItems}
      />

      <VoiceGrid voices={studentVoices} />

      <SupportGrid
        eyebrow="Wellbeing and discipline"
        title="Support that keeps preparation realistic"
        body="The student-life route should answer a parent’s and student’s practical question: what will daily life feel like after admission?"
        points={supportPoints}
      />

      <FaqBand
        eyebrow="Practical questions"
        title="Life after admission"
        body="Students and families usually need direct answers about study hours, stay arrangements, feedback and defence preparation before they commit."
        items={studentLifeFaqs}
      />

      <GuideCtaPanel guide={preparationGuide} />

      <NextUpCta
        title="Courses"
        body="Move from life on campus to the exam tracks, batch formats and preparation paths Baliraja offers."
        href="/courses"
      />
    </div>
  );
}
