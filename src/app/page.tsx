import { Hero } from "@/components/sections/hero";
import { WelcomeStatement } from "@/components/sections/welcome-statement";
import { WhyBaliraja } from "@/components/sections/why-baliraja";
import { ExamTracks } from "@/components/sections/exam-tracks";
import { AdmissionFeatures } from "@/components/sections/admission-features";
import { Gallery } from "@/components/sections/gallery";
import { MissionPromise } from "@/components/sections/promise";
import { LatestUpdates } from "@/components/sections/latest-updates";
import { Notices } from "@/components/sections/notices";
import { Blog } from "@/components/sections/blog";
import { EnquiryCta } from "@/components/sections/enquiry-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <WelcomeStatement />
      <WhyBaliraja />
      <ExamTracks />
      <AdmissionFeatures />
      <Gallery />
      <MissionPromise />
      <LatestUpdates />
      <Notices />
      <Blog />
      <EnquiryCta />
    </>
  );
}
