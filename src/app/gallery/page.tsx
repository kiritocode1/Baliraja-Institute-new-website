import { NextUpCta, PageHero } from "@/components/page-sections";
import { Gallery } from "@/components/sections/gallery";
import { getAssetUrl } from "@/lib/assets";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Campus Gallery",
  description:
    "View Baliraja Institute campus, classroom, reading hall and preparation photographs from the Gangapur academy.",
  path: "/gallery",
});

/**
 * Static gallery image list — all files are served from cloud storage (R2/S3).
 * To add a new photo: upload it to the bucket under /gallery/ then add its
 * filename to this array. No server filesystem access at runtime.
 */
const GALLERY_IMAGES: string[] = [
  "924A0093.JPG",
  "924A0236.JPG",
  "924A0239.JPG",
  "924A0240.JPG",
  "924A0266.JPG",
  "924A0267.JPG",
  "924A0268.JPG",
  "924A0271 (1).JPG",
  "924A0273.JPG",
  "924A0274 (1).JPG",
  "924A0275.JPG",
  "924A0286.JPG",
  "924A0293.JPG",
  "924A0295.JPG",
  "924A0296.JPG",
  "924A0298.JPG",
  "924A0306.JPG",
  "IMG_4873.JPG.jpeg",
  "IMG_4915.JPG.jpeg",
  "IMG_4917.JPG.jpeg",
  "IMG_4918.JPG.jpeg",
  "IMG_4929.JPG.jpeg",
  "IMG_4984.JPG.jpeg",
].map((file) => getAssetUrl(`/gallery/${file}`));

export default function GalleryPage() {
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
        <Gallery hideIntro images={GALLERY_IMAGES} />
      </PageHero>

      <NextUpCta
        title="Student Life"
        body="Move from the photographs to the routines, mentoring and study support behind daily preparation."
        href="/student-life"
      />
    </div>
  );
}

