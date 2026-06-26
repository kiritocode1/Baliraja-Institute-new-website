import Link from "next/link";
import { RevealText } from "@/components/reveal-text";
import { examTracks } from "@/lib/site";

export function ExamTracks() {
  return (
    <section id="courses" className="bg-parchment-deep py-24 sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
              What we prepare you for
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.02em] text-oxblood">
              <RevealText text="Exam Tracks" splitBy="characters" stagger={0.03} distance={26} />
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-[0.98rem] leading-relaxed text-ink-soft">
            One academy, six disciplined routes into the services. Choose a
            track to begin an enquiry; our team will map a study plan to your
            attempt.
          </p>
        </div>

        <ul className="mt-14 border-t border-line-strong">
          {examTracks.map((track) => (
            <li key={track.code}>
              <Link
                href={`/admissions?track=${encodeURIComponent(track.title)}`}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 border-b border-line-strong py-7 transition-colors hover:bg-parchment sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,26rem)_auto] sm:gap-x-8 sm:py-8"
              >
                <span className="font-display text-lg text-brass-deep tabular-nums sm:text-xl">
                  {track.code}
                </span>
                <span className="font-display text-[clamp(1.7rem,3.4vw,2.7rem)] font-light leading-tight tracking-[-0.015em] text-oxblood transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                  {track.title}
                </span>
                <span className="col-span-2 max-w-prose text-pretty text-[0.95rem] leading-relaxed text-ink-soft sm:col-span-1 sm:col-start-3">
                  {track.blurb}
                </span>
                <span
                  className="col-start-2 mt-1 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-oxblood opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:col-start-4 sm:mt-0"
                  aria-hidden="true"
                >
                  Enquire <span>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
