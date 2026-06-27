import type { Metadata } from "next";
import { Hanken_Grotesk, Spectral } from "next/font/google";
import "./globals.css";
import { MaterialSpotlight } from "@/components/sections/material-spotlight";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://balirajaacademy.in"),
  title: {
    default: `${site.longName}, ${site.place} — ${site.motto}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Baliraja Institute Career Academy, Gangapur. Coaching for MPSC, UPSC, Banking, SSC, Police Bharti and Talathi exams, built on the promise to educate and to serve.",
  keywords: [
    "Baliraja Institute",
    "Gangapur",
    "MPSC coaching",
    "UPSC coaching",
    "competitive exams Maharashtra",
    "career academy",
  ],
  openGraph: {
    title: `${site.longName}, ${site.place}`,
    description: `${site.motto}. Coaching for MPSC, UPSC, Banking, SSC, Police Bharti and Talathi.`,
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full bg-parchment text-ink">
        <SiteHeader />
        <main id="top">{children}</main>
        <SiteFooter />
        <MaterialSpotlight />
      </body>
    </html>
  );
}
