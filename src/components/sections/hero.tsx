import { getLocale, getTranslations } from "next-intl/server";
import { VerticalCutReveal } from "@/components/vertical-cut-reveal";
import { getAssetUrl } from "@/lib/assets";
import { localize } from "@/lib/i18n-content";
import { site } from "@/lib/site";

export async function Hero() {
  const t = await getTranslations("Hero");
  const locale = await getLocale();
  const s = localize(site, locale);
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-river-deep text-cream">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={getAssetUrl("/home/hero-video.mp4")} type="video/mp4" />
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

      <div className="relative flex min-h-[100svh] w-full flex-col justify-end px-5 pb-[clamp(1.75rem,4vw,3.75rem)] pt-32 sm:px-8">
        <p className="max-w-[35rem] text-pretty text-[0.92rem] leading-relaxed text-cream/88 sm:text-[1rem]">
          {t("intro", { name: s.longName, place: s.place })}
        </p>

        <div className="mt-5 h-px w-full bg-cream/32" aria-hidden="true" />

        <h1 className={`mt-4 max-w-full font-sans text-[clamp(2.4rem,11vw,9rem)] font-light tracking-normal text-cream sm:max-w-none sm:text-[clamp(4.4rem,9vw,9rem)] 2xl:whitespace-nowrap ${locale === "mr" ? "leading-[1.1] sm:leading-[1.0]" : "leading-[0.9] sm:leading-[0.78]"}`}>
          <VerticalCutReveal
            containerClassName="2xl:flex-nowrap"
            staggerDuration={0.06}
            transition={{ damping: 28, stiffness: 160, type: "spring" }}
          >
            {t("title")}
          </VerticalCutReveal>
        </h1>
      </div>
    </section>
  );
}
