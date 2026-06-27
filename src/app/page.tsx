import { ImageCardGrid, VoiceGrid } from "@/components/page-sections";
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
import { campusLifeItems, studentVoices } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero />
      <WelcomeStatement />
      <WhyBaliraja />
      <ImageCardGrid
        eyebrow="Academy life"
        title="More than a classroom"
        body="Wesley turns college life into a browsable experience. Baliraja now does the same for daily preparation, mentoring, testing and study spaces."
        items={campusLifeItems}
      />
      <ExamTracks />
      <AdmissionFeatures />
      <Gallery />
      <MissionPromise />
      <VoiceGrid voices={studentVoices} />
      <LatestUpdates />
      <Notices />
      <Blog />
      <EnquiryCta />
    </>
  );
}
