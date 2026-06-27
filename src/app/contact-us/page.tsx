import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { NextUpCta, PageHero, SectionIntro } from "@/components/page-sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Baliraja Institute Career Academy in Gangapur for admissions, courses, scholarships and campus visits.",
  alternates: { canonical: "/contact-us" },
};

const contactCards = [
  {
    title: "Visit",
    body: site.contact.address,
    href: "https://maps.google.com/?q=Baliraja%20Institute%20Career%20Academy%20Gangapur",
    label: "Open map",
    icon: MapPin,
  },
  {
    title: "Call",
    body: site.contact.phone,
    href: site.contact.phoneHref,
    label: "Call office",
    icon: Phone,
  },
  {
    title: "Email",
    body: site.contact.email,
    href: site.contact.emailHref,
    label: "Send email",
    icon: Mail,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Contact"
        title="Visit the campus"
        body="Clear contact details matter before a student commits: address, phone, email and a simple path to admissions."
        image="/hero-poster.jpg"
        imageAlt="Baliraja Institute campus visual"
        actions={[
          { href: "/admissions", label: "Start admission enquiry" },
          { href: "/courses", label: "Explore courses" },
        ]}
      />

      <section className="bg-parchment-deep py-24 sm:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <SectionIntro
            eyebrow="Reach us"
            title="Talk to the right person"
            body="Use the route that matches your need: visit for counselling, call for batch timing, or email for documents and concession queries."
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
            Office hours: {site.contact.hours}
          </p>
        </div>
      </section>

      <NextUpCta
        title="Admissions"
        body="Ready to choose a batch? Send a short enquiry and let a mentor call you back."
        href="/admissions"
        label="Start enquiry"
      />
    </div>
  );
}
