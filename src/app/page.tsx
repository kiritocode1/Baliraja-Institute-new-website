import {
  ExperienceExplorer,
  GuideCtaPanel,
  ImageCardGrid,
  VoiceGrid,
} from "@/components/page-sections";
import { AdmissionFeatures } from "@/components/sections/admission-features";
import { Blog } from "@/components/sections/blog";
import { EnquiryCta } from "@/components/sections/enquiry-cta";
import { ExamTracks } from "@/components/sections/exam-tracks";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { LatestUpdates } from "@/components/sections/latest-updates";
import { Notices } from "@/components/sections/notices";
import { MissionPromise } from "@/components/sections/promise";
import { WelcomeStatement } from "@/components/sections/welcome-statement";
import { WhyBaliraja } from "@/components/sections/why-baliraja";
import {
  campusLifeItems,
  preparationExperiences,
  preparationGuide,
  studentVoices,
} from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero />
      <WelcomeStatement />
      <WhyBaliraja />
      <ExperienceExplorer
        eyebrow="Discover your path"
        title="The preparation experience"
        body="Before a student joins, they should be able to picture the work: classes, study hall, test pressure and a mentor who keeps the attempt realistic."
        items={preparationExperiences}
      />
      <ImageCardGrid
        eyebrow="Academy life"
        title="More than a classroom"
        body="Daily preparation is easier to understand when students can see the routine: mentoring, testing, study spaces, current affairs and peer discipline."
        items={campusLifeItems}
      />
      <ExamTracks />
      <AdmissionFeatures />
      <Gallery />
      <MissionPromise />
      <VoiceGrid voices={studentVoices} />
      <GuideCtaPanel guide={preparationGuide} />
      <LatestUpdates />
      <Notices />
      <Blog />
      <EnquiryCta />
    </>
  );
}
