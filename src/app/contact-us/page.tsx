import { Mail, MapPin, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { NextUpCta, PageHero, SectionIntro } from "@/components/page-sections";
import { localize } from "@/lib/i18n-content";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Baliraja Institute Career Academy in Gangapur for admissions, courses, scholarships and campus visits.",
  path: "/contact-us",
});

const MAP_QUERY = encodeURIComponent(
  "Baliraja Institute Career Academy, Gangapur, Bhudargad, Kolhapur, Maharashtra 416209",
);

export default async function ContactPage() {
  const t = await getTranslations("ContactUs");
  const locale = await getLocale();
  const s = localize(site, locale);
  const contactCards = [
    {
      title: t("visitTitle"),
      body: s.contact.address,
      href: `https://maps.google.com/?q=${MAP_QUERY}`,
      label: t("visitLabel"),
      icon: MapPin,
    },
    {
      title: t("callTitle"),
      body: s.contact.phone,
      href: s.contact.phoneHref,
      label: t("callLabel"),
      icon: Phone,
    },
    {
      title: t("emailTitle"),
      body: s.contact.email,
      href: s.contact.emailHref,
      label: t("emailLabel"),
      icon: Mail,
    },
  ];

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        image="/student-life/aboutv-v3.mp4"
        imageAlt="Baliraja Institute background video"
        actions={[
          { href: "/admissions", label: t("heroEnquiry") },
          { href: "/courses", label: t("heroExplore") },
        ]}
      />

      <section className="bg-parchment-deep py-24 sm:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <SectionIntro
            eyebrow={t("reachEyebrow")}
            title={t("reachTitle")}
            body={t("reachBody")}
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="bg-parchment p-7">
                  <Icon className="size-7 text-brass-deep" aria-hidden="true" />
                  <h2 className="mt-6 font-display text-3xl font-normal text-oxblood">
                    {card.title}
                  </h2>
                  <p className="mt-4 min-h-16 text-[0.98rem] leading-relaxed text-ink-soft">
                    {card.body}
                  </p>
                  <Link
                    href={card.href}
                    className="mt-6 inline-flex text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-oxblood"
                  >
                    {card.label}
                  </Link>
                </article>
              );
            })}
          </div>
          <p className="mt-8 text-[0.95rem] text-ink-soft">
            {t("officeHours", { hours: s.contact.hours })}
          </p>

          <div className="mt-12 overflow-hidden border border-line-strong">
            <iframe
              title="Baliraja Institute on Google Maps — Gangapur, Tal. Bhudargad, Dist. Kolhapur"
              src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
              className="h-[26rem] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/admissions"
        label={t("nextUpLabel")}
      />
    </div>
  );
}
