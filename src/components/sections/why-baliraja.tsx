import Image from "next/image";
import Link from "next/link";
import { whyPoints } from "@/lib/site";

function Diamond() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mx-7 inline-block h-[0.42em] w-[0.42em] shrink-0 text-brass sm:mx-10"
      aria-hidden="true"
    >
      <path d="M12 0 L24 12 L12 24 L0 12 Z" fill="currentColor" />
    </svg>
  );
}

function MarqueeUnit() {
  return (
    <span className="flex items-center">
      <span className="font-display text-[clamp(3rem,11vw,9rem)] font-light leading-none tracking-[-0.02em] text-oxblood">
        Why Baliraja
      </span>
      <Diamond />
    </span>
  );
}

export function WhyBaliraja() {
  return (
    <section id="why" className="overflow-hidden bg-parchment py-24 sm:py-32">
      {/* Marquee heading */}
      <div
        className="marquee relative flex w-full select-none overflow-hidden"
        aria-label="Why Baliraja"
      >
        <div className="marquee-track" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <MarqueeUnit key={`a-${i}`} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <MarqueeUnit key={`b-${i}`} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto mt-16 grid max-w-[100rem] gap-10 px-5 sm:px-8 lg:mt-20 lg:grid-cols-12 lg:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden lg:col-span-6">
          <Image
            src="/img-classroom.jpg"
            alt="Aspirants at a Baliraja Institute lecture, working through the day's session"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-8 lg:col-span-6 lg:pt-4">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src="/img-reading.jpg"
              alt="A student reaching for a reference title in the academy's study hall"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <p className="max-w-prose text-pretty text-lg leading-relaxed text-ink sm:text-xl">
            Choosing Baliraja means joining a disciplined community that has
            sent students from the villages around Gangapur into the state and
            central services. The work is unglamorous and the hours are long;
            the support is constant.
          </p>

          <ul className="flex flex-col gap-3.5">
            {whyPoints.map((point) => (
              <li key={point} className="flex gap-3.5 text-[0.98rem] leading-relaxed text-ink-soft">
                <svg viewBox="0 0 24 24" className="mt-1.5 h-2.5 w-2.5 shrink-0 text-brass-deep" aria-hidden="true">
                  <path d="M12 0 L24 12 L12 24 L0 12 Z" fill="currentColor" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/admissions"
            className="group inline-flex w-fit items-center gap-3 text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-oxblood"
          >
            <span className="link-hover link-hover--slide">Begin your enquiry</span>
            <span
              className="grid h-9 w-9 place-items-center rounded-full border border-line-strong transition-colors group-hover:border-oxblood group-hover:bg-oxblood group-hover:text-cream"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
