import type { Metadata } from "next";
import { site } from "@/lib/site";

export const siteUrl = new URL(site.websiteHref);

export const siteDescription =
  "Baliraja Institute Career Academy in Gangapur, Maharashtra. Coaching for MPSC, UPSC, Army, Navy, Banking, SSC, Police Bharti, Talathi and ZP exams with mentoring, tests and study-hall support.";

export const defaultOgImagePath = "/opengraph-image";
export const defaultTwitterImagePath = "/twitter-image";
export const defaultOgImageAlt = `${site.longName} in ${site.place}`;

export function absoluteUrl(value: string) {
  return new URL(value, siteUrl).toString();
}

export const defaultOgImage = absoluteUrl(defaultOgImagePath);
export const defaultTwitterImage = absoluteUrl(defaultTwitterImagePath);

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultOgImagePath,
  imageAlt = `${title} — ${site.name}`,
}: PageMetadataInput): Metadata {
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.longName,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url:
            image === defaultOgImagePath
              ? defaultTwitterImage
              : absoluteUrl(image),
          alt: imageAlt,
        },
      ],
    },
  };
}
