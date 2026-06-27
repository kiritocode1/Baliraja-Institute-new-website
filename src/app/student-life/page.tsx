import type { Metadata } from "next";
import {
  ImageCardGrid,
  NextUpCta,
  PageHero,
  SupportGrid,
  VoiceGrid,
} from "@/components/page-sections";
import { campusLifeItems, studentVoices, supportPoints } from "@/lib/site";

export const metadata: Metadata = {
  title: "Student Life",
  description:
    "Explore student life at Baliraja Institute: reading hall, daily lectures, mock tests, defence practice, mentoring and student support.",
};

export default function StudentLifePage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Student life"
        title="Live the preparation day"
        body="The strongest part of Wesley’s site is that it shows life, not just facilities. Baliraja’s student-life page does the same for aspirants: study rhythm, classroom energy, mentoring and the community that keeps students moving."
        image="/img-books.jpg"
        imageAlt="Competitive exam books and notes used by Baliraja Institute students"
        actions={[
          { href: "/admissions", label: "Enquire for a batch" },
          { href: "/courses", label: "Compare courses" },
        ]}
      />

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

      <NextUpCta
        title="Courses"
        body="Move from life on campus to the exam tracks, batch formats and preparation paths Baliraja offers."
        href="/courses"
      />
    </div>
  );
}
