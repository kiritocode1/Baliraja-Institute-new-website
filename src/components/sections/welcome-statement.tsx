import { RevealText } from "@/components/reveal-text";

export function WelcomeStatement() {
  return (
    <section
      id="about"
      className="bg-oxblood text-cream"
    >
      <div className="mx-auto grid max-w-[100rem] gap-y-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[auto_1fr] lg:gap-x-16">
        <p className="pt-3 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted lg:pt-6">
          Welcome
        </p>

        <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.7rem)] font-light leading-[1.12] tracking-[-0.015em]">
          <RevealText
            text="A career academy rooted in the soil of Marathwada, where first-generation aspirants are prepared for the services that serve the public."
            splitBy="words"
            stagger={0.045}
            distance={22}
            amount={0.3}
            className="text-cream"
          />{" "}
          <RevealText
            text="The discipline of an institution, the attention of a mentor."
            splitBy="words"
            stagger={0.04}
            distance={22}
            amount={0.3}
            segmentClassName="text-cream-muted"
            className="text-cream-muted"
          />
        </h2>
      </div>
    </section>
  );
}
