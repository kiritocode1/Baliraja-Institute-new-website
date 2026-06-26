import type { Metadata } from "next";
import Image from "next/image";
import { RevealText } from "@/components/reveal-text";
import { EnquiryForm } from "@/components/enquiry-form";
import { examTracks, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Enquire for admission to Baliraja Institute Career Academy, Gangapur. MPSC, UPSC, Banking, SSC, Police Bharti and Talathi batches.",
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
  const validTrack =
    track && examTracks.some((t) => t.title === track) ? track : "";

  return (
    <div className="bg-parchment">
      {/* Header band */}
      <section className="border-b border-line bg-oxblood text-cream">
        <div className="mx-auto max-w-[100rem] px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-40">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted">
            Admissions · Open for the next batch
          </p>
          <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-light leading-[0.98] tracking-[-0.02em]">
            <RevealText
              text="Enquire for admission"
              immediate
              splitBy="words"
              stagger={0.08}
              distance={28}
            />
          </h1>
          <p className="mt-6 max-w-xl text-pretty leading-relaxed text-cream/85">
            One short form. No payment, no obligation. We read every enquiry and
            call you back to plan your preparation in person.
          </p>
        </div>
      </section>

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
                <a href={site.contact.phoneHref} className="link-hover link-hover--slide w-fit text-ink">
                  {site.contact.phone}
                </a>
                <a href={site.contact.emailHref} className="link-hover link-hover--slide w-fit text-ink">
                  {site.contact.email}
                </a>
                <span className="text-ink-soft">{site.contact.hours}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
