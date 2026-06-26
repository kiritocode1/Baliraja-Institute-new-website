import { Hero } from "@/components/sections/hero";
import { WelcomeStatement } from "@/components/sections/welcome-statement";
import { WhyBaliraja } from "@/components/sections/why-baliraja";
import { ExamTracks } from "@/components/sections/exam-tracks";
import { MissionPromise } from "@/components/sections/promise";
import { EnquiryCta } from "@/components/sections/enquiry-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <WelcomeStatement />
      <WhyBaliraja />
      <ExamTracks />
      <MissionPromise />
      <EnquiryCta />
    </>
  );
}
