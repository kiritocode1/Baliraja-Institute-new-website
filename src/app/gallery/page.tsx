import fs from "node:fs";
import path from "node:path";
import { NextUpCta, PageHero } from "@/components/page-sections";
import { Gallery } from "@/components/sections/gallery";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Campus Gallery",
  description:
    "View Baliraja Institute campus, classroom, reading hall and preparation photographs from the Gangapur academy.",
  path: "/gallery",
});

export default function GalleryPage() {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  let images: string[] = [];
  try {
    images = fs
      .readdirSync(galleryDir)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
      })
      .map((file) => `/gallery/${file}`);
  } catch (err) {
    console.error("Error reading gallery files:", err);
  }

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Campus gallery"
        title="Campus gallery"
        body="A dedicated gallery page gives students and parents a real place to inspect classroom, reading hall and preparation moments instead of landing on a homepage fragment."
        actions={[
          { href: "/student-life", label: "See student life" },
          { href: "/contact-us", label: "Visit the campus" },
        ]}
      >
        <Gallery hideIntro images={images} />
      </PageHero>

      <NextUpCta
        title="Student Life"
        body="Move from the photographs to the routines, mentoring and study support behind daily preparation."
        href="/student-life"
      />
    </div>
  );
}
