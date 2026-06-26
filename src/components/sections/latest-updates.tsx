"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { RevealText } from "@/components/reveal-text";
import { updates } from "@/lib/site";

export function LatestUpdates() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section id="updates" className="overflow-hidden bg-parchment-deep py-24 sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
              News & events
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-light leading-[1] tracking-[-0.02em] text-oxblood">
              <RevealText text="Latest Updates" splitBy="words" stagger={0.06} distance={28} />
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous updates"
              className="grid h-12 w-12 place-items-center rounded-full border border-line-strong text-oxblood transition-colors hover:border-oxblood hover:bg-oxblood hover:text-cream"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="More updates"
              className="grid h-12 w-12 place-items-center rounded-full border border-line-strong text-oxblood transition-colors hover:border-oxblood hover:bg-oxblood hover:text-cream"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {updates.map((u) => (
          <Link
            key={u.title}
            href={u.href}
            data-card
            className="group relative aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden sm:aspect-[5/4] sm:w-[30rem] lg:w-[34rem]"
          >
            <Image
              src={u.image}
              alt=""
              fill
              sizes="(max-width: 640px) 82vw, 34rem"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.2 0.06 25 / 0.1) 30%, oklch(0.2 0.06 25 / 0.85) 100%)",
              }}
            />
            <span className="absolute left-5 top-5 bg-brass px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-oxblood-deep">
              {u.tag}
            </span>
            <span className="absolute right-5 top-5 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cream/80">
              {u.date}
            </span>
            <div className="absolute inset-x-5 bottom-5">
              <h3 className="max-w-[18ch] font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-light leading-tight text-cream">
                {u.title}
              </h3>
              <span className="mt-3 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream/85">
                Read more
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
