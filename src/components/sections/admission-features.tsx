"use client";

import { useState } from "react";
import Link from "next/link";
import { RevealText } from "@/components/reveal-text";
import { admissionSteps } from "@/lib/site";

export function AdmissionFeatures() {
  const [active, setActive] = useState(0);
  const step = admissionSteps[active];

  return (
    <section id="process" className="bg-oxblood text-cream">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted">
              Admission, step by step
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.02em]">
              <RevealText text="How you join" splitBy="words" stagger={0.06} distance={26} />
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-[0.96rem] leading-relaxed text-cream-muted">
            No queues, no agents, no jargon. Six clear steps from your first
            enquiry to your first day in the batch.
          </p>
        </div>

        <div className="mt-14 grid overflow-hidden border border-cream/15 lg:grid-cols-[minmax(0,1fr)_1.5fr]">
          {/* Step list */}
          <ul className="flex flex-col border-b border-cream/15 lg:border-b-0 lg:border-r">
            {admissionSteps.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.num}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    className={`flex w-full items-center gap-4 px-6 py-5 text-left transition-colors sm:px-8 ${
                      isActive
                        ? "bg-oxblood-deep text-cream"
                        : "text-cream-muted hover:text-cream"
                    }`}
                  >
                    <span
                      className={`font-display text-sm tabular-nums ${isActive ? "text-brass-bright" : "text-cream-muted"}`}
                    >
                      {s.num}
                    </span>
                    <span className="font-display text-[1.15rem] font-normal leading-tight">
                      {s.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Detail */}
          <div className="flex flex-col justify-between gap-10 bg-oxblood-deep p-8 sm:p-12">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-brass-bright">
                Step {step.num}
              </p>
              <h3 className="mt-4 max-w-[14ch] font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-light leading-[1.05] tracking-[-0.015em]">
                {step.title}
              </h3>
              <p className="mt-5 max-w-prose text-[1.02rem] leading-relaxed text-cream/85">
                {step.body}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/admissions"
                className="inline-flex items-center gap-3 bg-brass px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-oxblood-deep transition-colors hover:bg-brass-bright"
              >
                Start with step one
                <span aria-hidden="true">→</span>
              </Link>
              <span className="text-[0.82rem] text-cream-muted">
                {active + 1} of {admissionSteps.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
