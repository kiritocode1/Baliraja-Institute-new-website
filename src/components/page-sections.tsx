import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { RevealText } from "@/components/reveal-text";
import type {
  CampusLifeItem,
  DiscoveryStep,
  ExperiencePath,
  FaqItem,
  GuideCta,
  ProofStat,
  StudentVoice,
  SupportPoint,
} from "@/lib/site";

type Action = {
  href: string;
  label: string;
};

export function PageHero({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  actions = [],
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  actions?: Action[];
  children?: ReactNode;
}) {
  return (
    <section className="bg-stone pb-16 pt-28 text-ink sm:pb-20 sm:pt-36">
      <div className="mx-auto grid max-w-[104rem] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-[11ch] font-title text-[clamp(4.3rem,10vw,10rem)] font-normal leading-[0.82] tracking-normal">
            <RevealText
              text={title}
              immediate
              splitBy="words"
              stagger={0.06}
              distance={30}
            />
          </h1>
        </div>

        <div className="lg:col-span-5">
          <p className="max-w-xl text-pretty text-[1.02rem] leading-relaxed text-ink-soft sm:text-lg">
            {body}
          </p>
          {actions.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {actions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={
                    index === 0
                      ? "inline-flex items-center gap-3 bg-ink px-6 py-3 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-river-deep"
                      : "link-hover link-hover--slide text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-ink"
                  }
                >
                  {action.label}
                  {index === 0 ? (
                    <ArrowRight className="size-4" aria-hidden="true" />
                  ) : null}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative aspect-[16/8] overflow-hidden bg-parchment-deep lg:col-span-12">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/18 to-transparent" />
        </div>

        {children ? <div className="lg:col-span-12">{children}</div> : null}
      </div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
  align = "split",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "split" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      }
    >
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-title text-[clamp(3.4rem,7vw,7rem)] font-normal leading-[0.84] tracking-normal text-ink">
          <RevealText
            text={title}
            splitBy="words"
            stagger={0.06}
            distance={26}
          />
        </h2>
      </div>
      {body ? (
        <p
          className={
            align === "center"
              ? "mx-auto mt-6 max-w-2xl text-pretty text-[1rem] leading-relaxed text-ink-soft"
              : "max-w-md text-pretty text-[1rem] leading-relaxed text-ink-soft"
          }
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function FeatureBand({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  action,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  action?: Action;
  reverse?: boolean;
}) {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-[104rem] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className={reverse ? "lg:order-2 lg:col-span-6" : "lg:col-span-6"}>
          <div className="relative aspect-[4/3] overflow-hidden bg-stone">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
        <div
          className={
            reverse
              ? "lg:order-1 lg:col-span-5"
              : "lg:col-span-5 lg:col-start-8"
          }
        >
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-title text-[clamp(3.5rem,7vw,7rem)] font-normal leading-[0.84] tracking-normal text-ink">
            {title}
          </h2>
          <p className="mt-6 text-pretty text-[1rem] leading-relaxed text-ink-soft">
            {body}
          </p>
          {action ? (
            <Link
              href={action.href}
              className="mt-8 inline-flex items-center gap-3 bg-ink px-6 py-3 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-river-deep"
            >
              {action.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function StatBand({ stats }: { stats: ProofStat[] }) {
  return (
    <section className="bg-river-deep text-cream">
      <div className="mx-auto grid max-w-[104rem] divide-y divide-cream/14 px-5 py-6 sm:px-8 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="py-8 lg:px-8">
            <p className="font-title text-[clamp(3.2rem,6vw,6rem)] font-normal leading-none text-paper">
              {stat.value}
            </p>
            <p className="mt-4 font-semibold uppercase tracking-[0.16em] text-cream">
              {stat.label}
            </p>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-cream-muted">
              {stat.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ImageCardGrid({
  eyebrow,
  title,
  body,
  items,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  items: CampusLifeItem[];
}) {
  return (
    <section className="bg-stone py-24 sm:py-32">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <SectionIntro eyebrow={eyebrow} title={title} body={body} />
        <div className="mt-14 grid gap-px overflow-hidden bg-paper sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.title}
                href={item.href}
                className="group bg-paper"
              >
                <ImageCard item={item} />
              </Link>
            ) : (
              <article key={item.title} className="group bg-paper">
                <ImageCard item={item} />
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function ImageCard({ item }: { item: CampusLifeItem }) {
  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/58 to-transparent opacity-65" />
        <span className="absolute left-5 top-5 bg-paper px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-ink">
          {item.eyebrow}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold leading-tight text-ink">
          {item.title}
        </h3>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
          {item.body}
        </p>
        {item.href ? (
          <span className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-river-deep">
            Read more
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        ) : null}
      </div>
    </>
  );
}

export function SupportGrid({
  eyebrow,
  title,
  body,
  points,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: SupportPoint[];
}) {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <SectionIntro eyebrow={eyebrow} title={title} body={body} />
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {points.map((point) => (
            <article
              key={point.title}
              className="border-t border-line-strong pt-5"
            >
              <h3 className="text-2xl font-semibold leading-tight text-ink">
                {point.title}
              </h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                {point.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExperienceExplorer({
  eyebrow,
  title,
  body,
  items,
}: {
  eyebrow: string;
  title: string;
  body: string;
  items: ExperiencePath[];
}) {
  return (
    <section className="bg-parchment py-24 sm:py-32">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
            {eyebrow}
          </p>
          <h2 className="mt-4 max-w-[10ch] font-display text-[clamp(2.6rem,6vw,5.8rem)] font-light leading-[0.95] tracking-normal text-oxblood">
            <RevealText
              text={title}
              splitBy="words"
              stagger={0.06}
              distance={28}
            />
          </h2>
          <p className="mt-7 max-w-md text-pretty text-[1rem] leading-relaxed text-ink-soft">
            {body}
          </p>
        </div>

        <div className="grid gap-px bg-line sm:grid-cols-2">
          {items.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className="group bg-parchment transition-colors hover:bg-parchment-deep"
            >
              <article className="flex min-h-full flex-col">
                <div className="relative aspect-[5/4] overflow-hidden bg-oxblood-deep">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 36vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-oxblood-deep/60 via-oxblood-deep/10 to-transparent" />
                  <span className="absolute left-5 top-5 font-display text-3xl font-light text-brass-bright">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                    {item.kicker}
                  </p>
                  <h3 className="mt-4 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.02] text-oxblood">
                    {item.title}
                  </h3>
                  <p className="mt-5 text-[0.96rem] leading-relaxed text-ink-soft">
                    {item.body}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-oxblood">
                    Explore
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DiscoveryProcess({
  eyebrow,
  title,
  body,
  steps,
}: {
  eyebrow: string;
  title: string;
  body: string;
  steps: DiscoveryStep[];
}) {
  return (
    <section className="bg-river-deep text-cream">
      <div className="mx-auto grid max-w-[104rem] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted">
            {eyebrow}
          </p>
          <h2 className="mt-5 font-title text-[clamp(4rem,8vw,8rem)] font-normal leading-[0.84] tracking-normal">
            {title}
          </h2>
          <p className="mt-7 max-w-md text-pretty leading-relaxed text-cream-muted">
            {body}
          </p>
        </div>

        <div className="grid border-t border-cream/18 sm:grid-cols-2 sm:border-l sm:border-t-0">
          {steps.map((step) => (
            <article
              key={step.label}
              className="border-b border-cream/18 py-7 sm:border-r sm:p-8 [&:nth-last-child(-n+2)]:sm:border-b-0 [&:nth-child(2n)]:sm:border-r-0"
            >
              <p className="font-title text-5xl font-normal text-paper">
                {step.label}
              </p>
              <h3 className="mt-5 text-2xl font-semibold leading-tight">
                {step.title}
              </h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-cream-muted">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GuideCtaPanel({ guide }: { guide: GuideCta }) {
  return (
    <section className="bg-river-deep py-20 text-cream sm:py-28">
      <div className="mx-auto grid max-w-[92rem] px-5 sm:px-8 lg:grid-cols-2">
        <div className="relative min-h-[24rem] overflow-hidden bg-ink lg:min-h-[35rem]">
          <Image
            src={guide.image}
            alt={guide.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
        </div>

        <div className="bg-river p-7 text-cream sm:p-10 lg:p-14">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream/75">
            {guide.eyebrow}
          </p>
          <h2 className="mt-5 max-w-[10ch] font-title text-[clamp(4rem,8vw,8rem)] font-normal leading-[0.84] tracking-normal">
            {guide.title}
          </h2>
          <p className="mt-6 max-w-xl text-pretty leading-relaxed text-cream/82">
            {guide.body}
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {guide.points.map((point) => (
              <li
                key={point}
                className="border-t border-cream/24 pt-3 text-[0.94rem] font-medium leading-snug text-cream"
              >
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={guide.primary.href}
              className="inline-flex items-center gap-3 bg-paper px-6 py-3 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-river-deep transition-colors hover:bg-cream"
            >
              {guide.primary.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={guide.secondary.href}
              className="link-hover link-hover--slide text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-cream"
            >
              {guide.secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqBand({
  eyebrow,
  title,
  body,
  items,
}: {
  eyebrow: string;
  title: string;
  body: string;
  items: FaqItem[];
}) {
  return (
    <section className="bg-stone py-24 sm:py-32">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <SectionIntro eyebrow={eyebrow} title={title} body={body} />
        <div className="mt-14 grid gap-x-14 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.question}
              className="border-t border-line-strong pt-5"
            >
              <h3 className="text-2xl font-semibold leading-tight text-ink">
                {item.question}
              </h3>
              <p className="mt-5 text-[0.98rem] leading-relaxed text-ink-soft">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VoiceGrid({ voices }: { voices: StudentVoice[] }) {
  return (
    <section className="bg-river-deep py-24 text-cream sm:py-32">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="max-w-4xl">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted">
            Student voices
          </p>
          <h2 className="mt-5 font-title text-[clamp(4rem,8vw,8rem)] font-normal leading-[0.84] tracking-normal">
            Hear what focused aspirants value.
          </h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden bg-cream/18 sm:grid-cols-2 lg:grid-cols-4">
          {voices.map((voice) => (
            <article key={voice.name} className="bg-paper text-ink">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                <Image
                  src={voice.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-river">
                  {voice.track}
                </p>
                <blockquote className="mt-4 text-2xl font-semibold leading-tight text-ink">
                  “{voice.quote}”
                </blockquote>
                <p className="mt-5 text-[0.9rem] font-medium text-ink-soft">
                  {voice.name}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NextUpCta({
  eyebrow = "Next up",
  title,
  body,
  href,
  label = "Read more",
}: {
  eyebrow?: string;
  title: string;
  body: string;
  href: string;
  label?: string;
}) {
  return (
    <section className="overflow-hidden bg-paper text-ink">
      <Link href={href} className="group block">
        <div className="mx-auto max-w-[104rem] border-t border-line-strong px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            {eyebrow}
          </p>
          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-title text-[clamp(4rem,8vw,8rem)] font-normal leading-[0.84] tracking-normal">
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-ink-soft">
                {body}
              </p>
            </div>
            <span className="inline-flex items-center gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em]">
              {label}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
