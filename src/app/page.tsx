import type { Metadata } from "next";
import { EnquiryCta } from "@/components/sections/enquiry-cta";
import { ExamTracks } from "@/components/sections/exam-tracks";
import { Hero } from "@/components/sections/hero";
import {
  AcademyEditorial,
  HomeRouteLauncher,
  HomeStories,
  PreparationPrinciples,
} from "@/components/sections/home-editorial";
import { listCoursePages } from "@/lib/crm/course-pages";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const courseLinks = Object.fromEntries(
    (await listCoursePages())
      .filter((page) => page.status === "published" && page.seedKey)
      .map((page) => [page.seedKey as string, `/courses/${page.slug}`]),
  );

  return (
    <>
      <Hero />
      <AcademyEditorial />
      <HomeRouteLauncher />
      <PreparationPrinciples />
      <ExamTracks courseLinks={courseLinks} />
      <HomeStories />
      <EnquiryCta />
    </>
  );
}
