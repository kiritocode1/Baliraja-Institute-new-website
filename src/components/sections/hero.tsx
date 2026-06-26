import Link from "next/link";
import { RevealText } from "@/components/reveal-text";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-oxblood-deep text-cream">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Cinematic maroon grade for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.245 0.072 25 / 0.55) 0%, oklch(0.245 0.072 25 / 0.15) 38%, oklch(0.2 0.06 25 / 0.78) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[100rem] px-5 pb-12 pt-28 sm:px-8 sm:pb-16">
        <p className="max-w-xl text-pretty text-[0.95rem] leading-relaxed text-cream/85 sm:text-base">
          {site.longName}, {site.place}. Coaching for the MPSC, UPSC and public
          services, for aspirants from across Marathwada and beyond.
        </p>

        <div className="mt-7 h-px w-full bg-cream/25" />

        <h1 className="mt-6 font-display font-light tracking-[-0.02em]">
          <RevealText
            text={site.motto}
            immediate
            splitBy="words"
            stagger={0.09}
            distance={30}
            delay={0.15}
            className="text-[clamp(2.6rem,9vw,8.5rem)] leading-[0.95]"
          />
        </h1>

        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link
            href="/admissions"
            className="inline-flex items-center gap-3 bg-brass px-7 py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-oxblood-deep transition-colors hover:bg-brass-bright"
          >
            Enquire for admission
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/#courses"
            className="link-hover link-hover--slide text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-cream"
          >
            Explore exam tracks
          </Link>
        </div>
      </div>
    </section>
  );
}
