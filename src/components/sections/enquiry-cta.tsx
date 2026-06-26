import Link from "next/link";
import { RevealText } from "@/components/reveal-text";

export function EnquiryCta() {
  return (
    <section className="bg-parchment py-24 sm:py-36">
      <div className="mx-auto flex max-w-[100rem] flex-col items-start gap-10 px-5 sm:px-8">
        <h2 className="max-w-[16ch] font-display text-[clamp(2.4rem,7vw,6rem)] font-light leading-[0.98] tracking-[-0.025em] text-oxblood">
          <RevealText
            text="Begin your preparation."
            splitBy="words"
            stagger={0.07}
            distance={30}
            amount={0.4}
          />
        </h2>
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
          Admissions for the next batch are open. Send an enquiry and our team
          will call you back to discuss the right track, schedule and fee
          structure for your goal.
        </p>
        <Link
          href="/admissions"
          className="inline-flex items-center gap-3 bg-oxblood px-8 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
        >
          Enquire for admission
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
