import type { Metadata } from "next";
import Image from "next/image";
import { EnquiryForm } from "@/components/enquiry-form";
import {
  DiscoveryProcess,
  FaqBand,
  GuideCtaPanel,
  NextUpCta,
  PageHero,
  StatBand,
  SupportGrid,
} from "@/components/page-sections";
import {
  admissionsDiscoverySteps,
  admissionsFaqs,
  examTracks,
  featuredExams,
  preparationGuide,
  proofStats,
  site,
  supportPoints,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Enquire for admission to Baliraja Institute Career Academy, Gangapur. MPSC, UPSC, Banking, SSC, Police Bharti and Talathi batches.",
  alternates: { canonical: "/admissions" },
};

const steps: { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "You send an enquiry",
    body: "Tell us your exam, your attempt and how to reach you. It takes a minute.",
  },
  {
    num: "02",
    title: "We call you back",
    body: "Within two working days, a mentor discusses the right track, schedule and fees.",
  },
  {
    num: "03",
    title: "You visit and enrol",
    body: "Sit in on a session, see the study hall, and confirm your seat for the batch.",
  },
];

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const trackNames = [
    ...featuredExams.map((exam) => exam.title),
    ...examTracks.map((exam) => exam.title),
  ];
  const validTrack =
    track && trackNames.some((trackName) => trackName === track) ? track : "";

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Admissions · Open for the next batch"
        title="Your journey starts here"
        body="One short form. No payment, no obligation. We read every enquiry and call you back to plan the right track, batch timing and fee structure in person."
        image="/hero-poster.jpg"
        imageAlt="Baliraja Institute students beginning exam preparation"
        actions={[
          { href: "/courses", label: "Compare courses" },
          { href: "/scholarships", label: "See concessions" },
        ]}
      />

      <DiscoveryProcess
        eyebrow="Discovering you"
        title="The right batch starts with the right questions"
        body="The admission conversation is not a sales counter. It is a short review of the student’s exam goal, present level, family context and support needs."
        steps={admissionsDiscoverySteps}
      />

      {/* Form + aside */}
      <section className="mx-auto max-w-[100rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm defaultTrack={validTrack} />
          </div>

          <aside className="flex flex-col gap-12 lg:col-span-5">
            <div className="relative aspect-[5/3] overflow-hidden">
              <Image
                src="/img-study.jpg"
                alt="A Baliraja Institute aspirant at work in the academy's study hall"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <div>
              <h2 className="font-display text-2xl font-normal text-oxblood">
                What happens next
              </h2>
              <ol className="mt-6 flex flex-col">
                {steps.map((step) => (
                  <li
                    key={step.num}
                    className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line py-5 last:border-b"
                  >
                    <span className="font-display text-lg text-brass-deep">
                      {step.num}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{step.title}</p>
                      <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-line pt-6">
              <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-brass-deep">
                Prefer to talk?
              </h2>
              <div className="mt-4 flex flex-col gap-1.5 text-[0.98rem]">
                <a
                  href={site.contact.phoneHref}
                  className="link-hover link-hover--slide w-fit text-ink"
                >
                  {site.contact.phone}
                </a>
                <a
                  href={site.contact.emailHref}
                  className="link-hover link-hover--slide w-fit text-ink"
                >
                  {site.contact.email}
                </a>
                <span className="text-ink-soft">{site.contact.hours}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <StatBand stats={proofStats} />

      <GuideCtaPanel guide={preparationGuide} />

      <SupportGrid
        eyebrow="Admissions support"
        title="A mentor call before a commitment"
        body="Admissions should help the student choose correctly. The counselling call covers exam track, attempt date, medium, fee support and daily study expectations."
        points={supportPoints}
      />

      <FaqBand
        eyebrow="Admissions FAQs"
        title="Still have questions?"
        body="The most common questions are practical: track choice, family visits, medium, concessions and test-series access."
        items={admissionsFaqs}
      />

      <NextUpCta
        title="Scholarships"
        body="Need fee support before joining a batch? Check concession pathways for rural, farming, defence and repeat-attempt students."
        href="/scholarships"
      />
    </div>
  );
}
