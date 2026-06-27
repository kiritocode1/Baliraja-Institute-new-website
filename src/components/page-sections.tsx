import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { RevealText } from "@/components/reveal-text";
import type {
  CampusLifeItem,
  ProofStat,
  StudentVoice,
  SupportPoint,
} from "@/lib/site";

const nextUpEchoes = ["one", "two", "three", "four", "five", "six"];

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
    <section className="relative isolate min-h-[76svh] overflow-hidden bg-oxblood-deep text-cream">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.18 0.06 25 / 0.92) 0%, oklch(0.22 0.07 25 / 0.68) 45%, oklch(0.24 0.07 25 / 0.24) 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[76svh] max-w-[100rem] flex-col justify-end px-5 pb-14 pt-32 sm:px-8 sm:pb-18">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-[13ch] font-display text-[clamp(3rem,8vw,7.8rem)] font-light leading-[0.94] tracking-normal">
          <RevealText
            text={title}
            immediate
            splitBy="words"
            stagger={0.08}
            distance={32}
          />
        </h1>
        <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-cream/88 sm:text-lg">
          {body}
        </p>
        {actions.length > 0 ? (
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  index === 0
                    ? "inline-flex items-center gap-3 bg-brass px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-oxblood-deep transition-colors hover:bg-brass-bright"
                    : "link-hover link-hover--slide text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream"
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
        {children}
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
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1.02] tracking-normal text-oxblood">
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
              ? "mx-auto mt-5 max-w-2xl text-pretty text-[1rem] leading-relaxed text-ink-soft"
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
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto grid max-w-[100rem] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className={reverse ? "lg:order-2 lg:col-span-6" : "lg:col-span-6"}>
          <div className="relative aspect-[4/3] overflow-hidden bg-parchment-deep">
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
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,4.4vw,4rem)] font-light leading-[1.02] tracking-normal text-oxblood">
            {title}
          </h2>
          <p className="mt-6 text-pretty text-[1rem] leading-relaxed text-ink-soft">
            {body}
          </p>
          {action ? (
            <Link
              href={action.href}
              className="mt-8 inline-flex items-center gap-3 bg-oxblood px-6 py-3 text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-deep"
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
    <section className="bg-oxblood text-cream">
      <div className="mx-auto grid max-w-[100rem] divide-y divide-cream/15 px-5 py-6 sm:px-8 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="py-8 lg:px-8">
            <p className="font-display text-[clamp(2.8rem,6vw,5rem)] font-light leading-none text-brass-bright">
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
    <section className="bg-parchment-deep py-24 sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <SectionIntro eyebrow={eyebrow} title={title} body={body} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.title}
                href={item.href}
                className="group overflow-hidden bg-parchment"
              >
                <ImageCard item={item} />
              </Link>
            ) : (
              <article
                key={item.title}
                className="group overflow-hidden bg-parchment"
              >
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
      <div className="relative aspect-[4/3] overflow-hidden bg-oxblood-deep">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-oxblood-deep/55 to-transparent opacity-70" />
        <span className="absolute left-5 top-5 bg-brass px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-oxblood-deep">
          {item.eyebrow}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl font-normal leading-tight text-oxblood">
          {item.title}
        </h3>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
          {item.body}
        </p>
        {item.href ? (
          <span className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-oxblood">
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
    <section className="bg-parchment py-24 sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <SectionIntro eyebrow={eyebrow} title={title} body={body} />
        <div className="mt-12 grid border border-line lg:grid-cols-4">
          {points.map((point) => (
            <article
              key={point.title}
              className="border-b border-line p-7 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <h3 className="font-display text-2xl font-normal text-oxblood">
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

export function VoiceGrid({ voices }: { voices: StudentVoice[] }) {
  return (
    <section className="bg-oxblood-deep py-24 text-cream sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="max-w-4xl">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream-muted">
            Student voices
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[1.02] tracking-normal">
            Hear what focused aspirants value.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {voices.map((voice) => (
            <article key={voice.name} className="bg-cream text-ink">
              <div className="relative aspect-[4/3] overflow-hidden bg-oxblood">
                <Image
                  src={voice.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
                  {voice.track}
                </p>
                <blockquote className="mt-4 font-display text-2xl leading-tight text-oxblood">
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
    <section className="overflow-hidden bg-brass text-oxblood-deep">
      <Link href={href} className="group block">
        <div className="mx-auto max-w-[100rem] px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em]">
            {eyebrow}
          </p>
          <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex max-w-full overflow-hidden text-nowrap font-display text-[clamp(3rem,8vw,7rem)] font-light leading-none opacity-25">
                {nextUpEchoes.map((echo) => (
                  <span key={`${title}-${echo}`} className="pr-8">
                    {title}
                  </span>
                ))}
              </div>
              <h2 className="mt-5 font-display text-[clamp(2.3rem,5vw,4.6rem)] font-light leading-none tracking-normal">
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-oxblood-deep/75">
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
