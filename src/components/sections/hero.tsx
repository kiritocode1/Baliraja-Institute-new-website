import { VerticalCutReveal } from "@/components/vertical-cut-reveal";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-river-deep text-cream">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/home/hero-video.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.055 248 / 0.36) 0%, oklch(0.25 0.06 230 / 0.12) 38%, oklch(0.16 0.045 42 / 0.78) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[42svh] bg-gradient-to-t from-black/42 via-black/18 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[116rem] flex-col justify-end px-5 pb-[clamp(1.75rem,4vw,3.75rem)] pt-32 sm:px-8">
        <p className="max-w-[35rem] text-pretty text-[0.92rem] leading-relaxed text-cream/88 sm:text-[1rem]">
          {site.longName} is a career academy in {site.place}, preparing
          students for public service, defence, banking, police and state exams.
        </p>

        <div className="mt-5 h-px w-full bg-cream/32" aria-hidden="true" />

        <h1 className="mt-4 max-w-[8.4ch] font-sans text-[clamp(4.25rem,19vw,12rem)] font-light leading-[0.78] tracking-normal text-cream sm:max-w-none sm:text-[clamp(5.6rem,12vw,12rem)] 2xl:whitespace-nowrap">
          <VerticalCutReveal
            containerClassName="2xl:flex-nowrap"
            staggerDuration={0.06}
            transition={{ damping: 28, stiffness: 160, type: "spring" }}
          >
            Discover Your Path
          </VerticalCutReveal>
        </h1>
      </div>
    </section>
  );
}
