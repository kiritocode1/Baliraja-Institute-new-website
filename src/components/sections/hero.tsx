import Link from "next/link";
import { VerticalCutReveal } from "@/components/vertical-cut-reveal";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[96svh] flex-col justify-end overflow-hidden bg-oxblood-deep text-cream">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.05 248 / 0.18) 0%, oklch(0.18 0.05 248 / 0.34) 45%, oklch(0.17 0.045 42 / 0.9) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-[104rem] gap-8 px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:grid-cols-[1fr_0.42fr] lg:items-end">
        <div>
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-cream/70">
            {site.longName} · {site.place}
          </p>

          <h1 className="mt-7 max-w-[12ch] font-title text-[clamp(4.4rem,13vw,12rem)] font-normal leading-[0.79] tracking-normal">
            <VerticalCutReveal staggerDuration={0.08}>
              Preparation that keeps its word.
            </VerticalCutReveal>
          </h1>
        </div>

        <div className="max-w-lg lg:pb-3">
          <p className="text-pretty text-[1rem] leading-relaxed text-cream/82 sm:text-lg">
            A Gangapur academy for serious MPSC, UPSC, defence, banking, SSC,
            police and Talathi aspirants. One route, one mentor call, one daily
            rhythm students can actually follow.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-3 bg-cream px-6 py-3 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-oxblood-deep transition-colors hover:bg-brass-bright"
            >
              Start enquiry
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/#courses"
              className="link-hover link-hover--slide text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-cream"
            >
              See exam tracks
            </Link>
          </div>
        </div>

        <div className="border-t border-cream/22 pt-5 lg:col-span-2">
          <dl className="grid gap-4 text-cream/78 sm:grid-cols-3">
            {[
              ["2009", "Established in Gangapur"],
              ["6+", "Exam tracks"],
              ["1:1", "Mentor reviews"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-6 border-b border-cream/12 pb-3 sm:block sm:border-b-0 sm:pb-0"
              >
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.18em]">
                  {label}
                </dt>
                <dd className="font-title text-4xl leading-none text-cream">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
