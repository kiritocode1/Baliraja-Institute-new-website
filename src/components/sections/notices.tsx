import Link from "next/link";
import { RevealText } from "@/components/reveal-text";
import { notices } from "@/lib/site";

export function Notices() {
  return (
    <section id="notices" className="bg-oxblood-deep text-cream">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brass-bright" />
              Notice board
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.02em]">
              <RevealText
                text="Notices"
                splitBy="characters"
                stagger={0.03}
                distance={24}
              />
            </h2>
          </div>
          <Link
            href="/news-events"
            className="link-hover link-hover--slide text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream"
          >
            See all updates
          </Link>
        </div>

        <ul className="mt-12 border-t border-cream/15">
          {notices.map((n) => (
            <li key={n.title}>
              <Link
                href="/news-events"
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 border-b border-cream/15 py-6 transition-colors hover:bg-cream/[0.03] sm:grid-cols-[7.5rem_8rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="order-1 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-cream-muted tabular-nums">
                  {n.date}
                </span>
                <span className="order-3 w-fit border border-brass/50 px-2.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-brass-bright sm:order-2">
                  {n.tag}
                </span>
                <span className="order-2 font-display text-[1.15rem] font-normal leading-snug text-cream transition-colors group-hover:text-brass-bright sm:order-3 sm:text-[1.3rem]">
                  {n.title}
                </span>
                <span
                  aria-hidden="true"
                  className="order-4 hidden text-cream-muted transition-transform group-hover:translate-x-1 group-hover:text-brass-bright sm:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
