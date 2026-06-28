import type { Metadata } from "next";
import { EnquiryCta } from "@/components/sections/enquiry-cta";
import { ExamTracks } from "@/components/sections/exam-tracks";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import {
  AcademyContext,
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
      <AcademyContext />
      <Gallery />
      <ExamTracks courseLinks={courseLinks} />
      <HomeStories />
      <EnquiryCta />
    </>
  );
}
