import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
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
import { listPublishedGalleryImages } from "@/lib/crm/gallery";
import { localize } from "@/lib/i18n-content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const locale = await getLocale();
  const [rawPages, galleryImages] = await Promise.all([
    listCoursePages(),
    listPublishedGalleryImages(locale),
  ]);
  const pages = rawPages.map((page) => localize(page, locale));
  // The exam-tracks section renders CRM course pages: edits in /crm/courses
  // show here after publish.
  const bharti = pages.filter(
    (page) => page.status === "published" && page.division === "bharti",
  );
  const featured = bharti
    .filter((page) => page.seedKey?.startsWith("featured-"))
    .slice(0, 2)
    .map((page) => ({
      key: page.slug,
      title: page.title,
      blurb: page.summary,
      exams: page.exams ?? page.title,
      image: page.image,
      alt: page.imageAlt ?? page.title,
      href: `/courses/${page.slug}`,
    }));
  const tracks = bharti
    .filter((page) => !page.seedKey?.startsWith("featured-"))
    .map((page, index) => ({
      code: String(index + 1).padStart(2, "0"),
      title: page.title,
      blurb: page.summary,
      image: page.image,
      href: `/courses/${page.slug}`,
    }));

  return (
    <>
      <Hero />
      <AcademyEditorial />
      <HomeRouteLauncher />
      <PreparationPrinciples />
      <AcademyContext />
      <Gallery
        images={
          galleryImages.length > 0
            ? galleryImages.slice(0, 6).map((image) => ({
                src: image.url,
                alt: image.alt,
                caption: image.caption,
              }))
            : undefined
        }
      />
      <ExamTracks featured={featured} tracks={tracks} />
      <HomeStories />
      <EnquiryCta />
    </>
  );
}
