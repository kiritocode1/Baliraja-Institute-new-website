import type { Metadata } from "next";
import { Hanken_Grotesk, Spectral } from "next/font/google";
import "./globals.css";
import { MaterialSpotlight } from "@/components/sections/material-spotlight";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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

const siteDescription =
  "Baliraja Institute Career Academy in Gangapur, Maharashtra. Coaching for MPSC, UPSC, Army, Navy, Banking, SSC, Police Bharti, Talathi and ZP exams with mentoring, tests and study-hall support.";
const ogImage = "/opengraph-image";
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: site.longName,
  alternateName: site.name,
  url: site.websiteHref,
  logo: `${site.websiteHref}/icon.svg`,
  image: `${site.websiteHref}/img-classroom.jpg`,
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
  metadataBase: new URL("https://balirajaacademy.in"),
  applicationName: site.name,
  title: {
    default: `${site.longName}, ${site.place} — ${site.motto}`,
    template: `%s — ${site.name}`,
  },
  description: siteDescription,
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  openGraph: {
    title: `${site.longName}, ${site.place}`,
    description: siteDescription,
    url: site.websiteHref,
    siteName: site.longName,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${site.longName} in ${site.place}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.longName}, ${site.place}`,
    description: siteDescription,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full bg-parchment text-ink">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is generated from fixed site metadata.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <SiteHeader />
        <main id="top">{children}</main>
        <SiteFooter />
        <MaterialSpotlight />
      </body>
    </html>
  );
}
