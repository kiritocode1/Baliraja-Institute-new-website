import { RevealText } from "@/components/reveal-text";
import { pillars, site } from "@/lib/site";

export function MissionPromise() {
  return (
    <section id="record" className="bg-oxblood text-cream">
      <div className="mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-x-16">
          <p className="pt-3 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted lg:pt-5">
            Our promise
          </p>
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.6vw,3.6rem)] font-light leading-[1.08] tracking-[-0.018em]">
            <RevealText
              text={`The name carries an obligation. ${site.motto}.`}
              splitBy="words"
              stagger={0.05}
              distance={24}
              amount={0.35}
            />
          </h2>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-12 border-t border-cream/15 pt-14 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.num} className="flex flex-col gap-4">
              <span className="font-display text-2xl text-brass-bright">
                {pillar.num}
              </span>
              <h3 className="font-display text-[1.7rem] font-normal leading-tight text-cream">
                {pillar.title}
              </h3>
              <p className="max-w-prose text-[0.96rem] leading-relaxed text-cream-muted">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
