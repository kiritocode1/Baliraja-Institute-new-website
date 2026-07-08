import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { NextUpCta, PageHero } from "@/components/page-sections";
import { Gallery } from "@/components/sections/gallery";
import { getAssetUrl } from "@/lib/assets";
import { galleryAlbums, listPublishedGalleryImages } from "@/lib/crm/gallery";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Campus Gallery",
  description:
    "View Baliraja Institute campus, classroom, reading hall and preparation photographs from the Gangapur academy.",
  path: "/gallery",
});

/**
 * Starter set shown until the CRM gallery has its first uploaded image.
 */
const FALLBACK_IMAGES: string[] = [
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

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("GalleryPage");
  const locale = await getLocale();
  const sp = await searchParams;
  const albumParam = Array.isArray(sp.album) ? sp.album[0] : sp.album;
  const allImages = await listPublishedGalleryImages(locale);
  const activeAlbum = galleryAlbums.find((album) => album === albumParam);
  const usedAlbums = galleryAlbums.filter((album) =>
    allImages.some((image) => image.album === album),
  );
  const visible = activeAlbum
    ? allImages.filter((image) => image.album === activeAlbum)
    : allImages;

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        actions={[
          { href: "/student-life", label: t("studentLife") },
          { href: "/contact-us", label: t("visit") },
        ]}
      >
        {usedAlbums.length > 1 ? (
          <nav
            className="mt-10 flex flex-wrap gap-2"
            aria-label="Gallery albums"
          >
            <Link
              href="/gallery"
              className={`border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                !activeAlbum
                  ? "border-oxblood bg-oxblood text-cream"
                  : "border-line-strong text-ink hover:border-oxblood"
              }`}
            >
              {t("all")}
            </Link>
            {usedAlbums.map((album) => (
              <Link
                key={album}
                href={`/gallery?album=${album}`}
                className={`border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  activeAlbum === album
                    ? "border-oxblood bg-oxblood text-cream"
                    : "border-line-strong text-ink hover:border-oxblood"
                }`}
              >
                {album.charAt(0).toUpperCase() + album.slice(1)}
              </Link>
            ))}
          </nav>
        ) : null}

        <Gallery
          hideIntro
          images={
            allImages.length > 0
              ? visible.map((image) => ({
                  src: image.url,
                  alt: image.alt,
                  caption: image.caption,
                }))
              : FALLBACK_IMAGES
          }
        />
      </PageHero>

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/student-life"
      />
    </div>
  );
}
