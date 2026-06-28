import type { Metadata } from "next";
import { site } from "@/lib/site";

export const siteUrl = new URL(site.websiteHref);

export const siteDescription =
  "Competitive exam coaching in Gangapur for MPSC, UPSC, Defence, Banking, SSC, Police Bharti, Talathi and ZP aspirants.";

export const defaultOgImagePath = "/opengraph.png";
export const defaultTwitterImagePath = "/twitter.png";
export const defaultOgImageWidth = 2540;
export const defaultOgImageHeight = 1406;
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
          width: defaultOgImageWidth,
          height: defaultOgImageHeight,
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
          width: defaultOgImageWidth,
          height: defaultOgImageHeight,
          alt: imageAlt,
        },
      ],
    },
  };
}
