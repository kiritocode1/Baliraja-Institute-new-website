import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { AdmissionHeroVideoPlayer } from "@/components/admission-hero-video-player";
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
import { getAssetUrl } from "@/lib/assets";
import { localize } from "@/lib/i18n-content";
import { createPageMetadata } from "@/lib/seo";
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

const requestTypes = [
  "admission",
  "scholarship",
  "course_guidance",
  "campus_visit",
];

export const metadata = createPageMetadata({
  title: "Admissions",
  description:
    "Enquire for admission to Baliraja Institute Career Academy, Gangapur (Kolhapur). Army, Navy, Police Bharti, SSC and Railway batches.",
  path: "/admissions",
});

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string; request?: string }>;
}) {
  const t = await getTranslations("Admissions");
  const locale = await getLocale();
  const s = localize(site, locale);
  const stats = localize(proofStats, locale);
  const discovery = localize(admissionsDiscoverySteps, locale);
  const support = localize(supportPoints, locale);
  const faqs = localize(admissionsFaqs, locale);
  const guide = localize(preparationGuide, locale);
  const steps = [
    { num: "01", title: t("step1Title"), body: t("step1Body") },
    { num: "02", title: t("step2Title"), body: t("step2Body") },
    { num: "03", title: t("step3Title"), body: t("step3Body") },
  ];
  const { track, request } = await searchParams;
  // Track values are matched within the active locale, since in-site links
  // produce locale-consistent track names.
  const trackNames = [
    ...localize(featuredExams, locale).map((exam) => exam.title),
    ...localize(examTracks, locale).map((exam) => exam.title),
    "School",
    "Sports",
    "Summer Camp",
  ];
  const validTrack =
    track && trackNames.some((trackName) => trackName === track) ? track : "";
  const validRequestType =
    request && requestTypes.includes(request) ? request : "admission";

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        actions={[
          { href: "/courses", label: t("heroCompare") },
          { href: "/scholarships", label: t("heroConcessions") },
        ]}
      >
        <AdmissionHeroVideoPlayer />
      </PageHero>

      <DiscoveryProcess
        eyebrow={t("discoveryEyebrow")}
        title={t("discoveryTitle")}
        body={t("discoveryBody")}
        steps={discovery}
      />

      {/* Form + aside */}
      <section className="mx-auto max-w-[100rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <EnquiryForm
              defaultTrack={validTrack}
              defaultRequestType={validRequestType}
            />
          </div>

          <aside className="flex flex-col gap-12 lg:col-span-5">
            <div className="relative aspect-[5/3] overflow-hidden">
              <Image
                src={getAssetUrl("admissions/adminssion-study.png")}
                alt="A Baliraja Institute aspirant at work in the academy's study hall"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <div>
              <h2 className="font-display text-2xl font-normal text-oxblood">
                {t("whatNext")}
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
                {t("preferTalk")}
              </h2>
              <div className="mt-4 flex flex-col gap-1.5 text-[0.98rem]">
                <a
                  href={s.contact.phoneHref}
                  className="link-hover link-hover--slide w-fit text-ink"
                >
                  {s.contact.phone}
                </a>
                <a
                  href={s.contact.emailHref}
                  className="link-hover link-hover--slide w-fit text-ink"
                >
                  {s.contact.email}
                </a>
                <span className="text-ink-soft">{s.contact.hours}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <StatBand stats={stats} />

      <GuideCtaPanel guide={guide} />

      <SupportGrid
        eyebrow={t("supportEyebrow")}
        title={t("supportTitle")}
        body={t("supportBody")}
        points={support}
      />

      <FaqBand
        eyebrow={t("faqEyebrow")}
        title={t("faqTitle")}
        body={t("faqBody")}
        items={faqs}
      />

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/scholarships"
      />
    </div>
  );
}
