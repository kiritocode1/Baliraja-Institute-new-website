import { ScrollTextReveal } from "@/components/scroll-text-reveal";

export function WelcomeStatement() {
  return (
    <section id="about" className="bg-oxblood text-cream">
      <div className="mx-auto grid max-w-[100rem] gap-y-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[auto_1fr] lg:gap-x-16">
        <p className="pt-3 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted lg:pt-6">
          Welcome
        </p>

        <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.7rem)] font-light leading-[1.12] tracking-[-0.015em]">
          <ScrollTextReveal
            parts={[
              {
                text: "A career academy rooted in the soil of Marathwada, where first-generation aspirants are prepared for the services that serve the public.",
                className: "text-cream",
                ghostClassName: "text-cream-muted opacity-35",
              },
              {
                text: "The discipline of an institution, the attention of a mentor.",
                className: "text-cream-muted",
                ghostClassName: "text-cream-muted opacity-30",
              },
            ]}
          />
        </h2>
      </div>
    </section>
  );
}
