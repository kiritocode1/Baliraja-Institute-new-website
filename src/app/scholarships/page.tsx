import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  NextUpCta,
  PageHero,
  SectionIntro,
  StatBand,
} from "@/components/page-sections";
import { proofStats, scholarshipPrograms } from "@/lib/site";

export const metadata: Metadata = {
  title: "Scholarships",
  description:
    "Baliraja Institute scholarship and fee-concession options for farming families, merit students, defence aspirants and repeat-attempt students.",
};

export default function ScholarshipsPage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Scholarships"
        title="Support for serious students"
        body="Wesley makes scholarships visible as a first-class admissions pathway. Baliraja’s version focuses on practical concessions for rural, farming, defence and repeat-attempt students."
        image="/img-study.jpg"
        imageAlt="A student writing notes during competitive exam preparation"
        actions={[
          { href: "/admissions", label: "Apply for consideration" },
          { href: "/contact-us", label: "Talk to the office" },
        ]}
      />

      <StatBand stats={proofStats} />

      <section className="bg-parchment-deep py-24 sm:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <SectionIntro
            eyebrow="Concession pathways"
            title="Find the right support route"
            body="These cards keep the page scannable. Exact eligibility, forms and concession amounts should be verified with the office before launch."
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {scholarshipPrograms.map((program) => (
              <article key={program.title} className="bg-parchment p-7">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                  {program.audience}
                </p>
                <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-oxblood">
                  {program.title}
                </h2>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                  {program.body}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {program.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-line-strong px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-soft"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <Link
            href="/admissions"
            className="mt-10 inline-flex items-center gap-3 bg-oxblood px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-deep"
          >
            Start with an enquiry
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <NextUpCta
        title="News & Events"
        body="Check notices, test-series updates, defence camps and scholarship announcements before choosing a batch."
        href="/news-events"
      />
    </div>
  );
}
