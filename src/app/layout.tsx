import type { Metadata } from "next";
import { Hanken_Grotesk, Spectral } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AccessibilitySettingsPanel } from "@/components/accessibility-settings-panel";
import { ClientMotionRoot } from "@/components/client-motion-root";
import { MaterialSpotlight } from "@/components/sections/material-spotlight";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  absoluteUrl,
  defaultOgImage,
  defaultOgImageAlt,
  defaultOgImageHeight,
  defaultOgImageWidth,
  defaultTwitterImage,
  siteDescription,
  siteUrl,
} from "@/lib/seo";
import { site, socials } from "@/lib/site";

const display = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const zarathustra = localFont({
  src: "../fonts/zarathustra-v01.otf",
  variable: "--font-zarathustra",
  display: "swap",
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: site.longName,
  alternateName: site.name,
  url: siteUrl.toString(),
  logo: absoluteUrl("/icon.svg"),
  image: defaultOgImage,
  description: siteDescription,
  foundingDate: site.established,
  slogan: site.motto,
  telephone: site.contact.phone,
  email: site.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address,
    addressLocality: site.place,
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  areaServed: ["Gangapur", "Chhatrapati Sambhajinagar", "Maharashtra"],
  sameAs: socials.map((item) => item.href),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: site.contact.phone,
    email: site.contact.email,
    contactType: "Admissions office",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Marathi"],
  },
  knowsAbout: [
    "MPSC coaching",
    "UPSC coaching",
    "Army exam preparation",
    "Navy exam preparation",
    "Banking exam preparation",
    "SSC exam preparation",
    "Police Bharti preparation",
    "Talathi and ZP exams",
  ],
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: site.name,
  generator: "Next.js",
  title: {
    default: `${site.longName}, ${site.place}`,
    template: `%s | ${site.name}`,
  },
  description: siteDescription,
  abstract:
    "Competitive exam coaching in Gangapur for civil services, defence, banking, SSC, police and local government aspirants.",
  keywords: [
    "Baliraja Institute",
    "Baliraja Institute Gangapur",
    "Baliraja Career Academy",
    "Gangapur",
    "Chhatrapati Sambhajinagar coaching",
    "MPSC coaching",
    "UPSC coaching",
    "Army coaching",
    "Navy coaching",
    "Police Bharti coaching",
    "Talathi coaching",
    "competitive exams Maharashtra",
    "career academy",
  ],
  authors: [{ name: site.longName, url: site.websiteHref }],
  creator: site.longName,
  publisher: site.longName,
  category: "Education",
  classification: "Competitive exam coaching institute",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  appleWebApp: {
    title: site.name,
    capable: true,
    statusBarStyle: "default",
  },
  openGraph: {
    title: `${site.longName}, ${site.place}`,
    description: siteDescription,
    url: "/",
    siteName: site.longName,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: defaultOgImage,
        width: defaultOgImageWidth,
        height: defaultOgImageHeight,
        alt: defaultOgImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.longName}, ${site.place}`,
    description: siteDescription,
    images: [
      {
        url: defaultTwitterImage,
        width: defaultOgImageWidth,
        height: defaultOgImageHeight,
        alt: defaultOgImageAlt,
      },
    ],
  },
  other: {
    "geo.region": "IN-MH",
    "geo.placename": `${site.place}, Maharashtra`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${zarathustra.variable} h-full`}
    >
      <body className="min-h-full bg-parchment text-ink">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is generated from fixed site metadata.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <ClientMotionRoot>
          <SiteHeader />
          <main id="top" className="relative z-20 bg-parchment">
            {children}
          </main>
          <MaterialSpotlight />
          <SiteFooter />
          <AccessibilitySettingsPanel />
        </ClientMotionRoot>
      </body>
    </html>
  );
}
