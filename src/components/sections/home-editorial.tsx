import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  MessageCircleQuestion,
  NotebookPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedPathText } from "@/components/animated-path-text";
import { updates } from "@/lib/site";

const routeCards = [
  {
    eyebrow: "01",
    title: "Courses",
    body: "Civil services, defence, banking, SSC, police, Talathi and ZP tracks.",
    href: "/courses",
    image: "/img-reading.jpg",
  },
  {
    eyebrow: "02",
    title: "Student Life",
    body: "Study hall, classroom rhythm, mocks, mentoring and daily discipline.",
    href: "/student-life",
    image: "/img-books.jpg",
  },
  {
    eyebrow: "03",
    title: "Admissions",
    body: "A short enquiry, a mentor call, and a batch recommendation.",
    href: "/admissions",
    image: "/hero-poster.jpg",
  },
  {
    eyebrow: "04",
    title: "Scholarships",
    body: "Practical fee support for serious students and farming families.",
    href: "/scholarships",
    image: "/img-study.jpg",
  },
];

const principles = [
  {
    title: "Choose one route",
    body: "Start with the exam in front of you. A focused attempt beats scattered preparation.",
    icon: GraduationCap,
  },
  {
    title: "Keep a daily table",
    body: "Class, reading, revision and mock practice need a visible rhythm, not vague motivation.",
    icon: NotebookPen,
  },
  {
    title: "Test before comfort",
    body: "Mock pressure shows speed, gaps and presentation while there is still time to correct.",
    icon: BookOpenCheck,
  },
  {
    title: "Ask early",
    body: "Fees, medium, hostel, family visits and batch timing should be settled before joining.",
    icon: MessageCircleQuestion,
  },
];

export function AcademyEditorial() {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto grid max-w-[104rem] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            Our story
          </p>
          <h2 className="mt-5 max-w-[10ch] font-title text-[clamp(4rem,8vw,8.8rem)] font-normal leading-[0.82] tracking-normal text-ink">
            A room for the attempt.
          </h2>
          <p className="mt-7 max-w-xl text-pretty text-[1.06rem] leading-relaxed text-ink-soft">
            Baliraja should feel less like a brochure and more like a working
            academy: a place where students arrive with one exam, sit at one
            table, and know what the next week asks from them.
          </p>
        </div>

        <div className="grid gap-3 lg:col-span-7 lg:grid-cols-12 lg:items-end">
          <figure className="relative aspect-[4/3] overflow-hidden bg-parchment-deep lg:col-span-5 lg:mb-12">
            <Image
              src="/img-classroom.jpg"
              alt="Baliraja classroom session"
              fill
              sizes="(max-width: 1024px) 100vw, 35vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.035]"
            />
          </figure>
          <figure className="relative aspect-[5/4] overflow-hidden bg-parchment-deep lg:col-span-4">
            <Image
              src="/img-study.jpg"
              alt="Student studying at Baliraja"
              fill
              sizes="(max-width: 1024px) 100vw, 30vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.035]"
            />
          </figure>
          <figure className="relative aspect-[3/4] overflow-hidden bg-parchment-deep lg:col-span-3 lg:mb-24">
            <Image
              src="/img-books.jpg"
              alt="Baliraja books and notes"
              fill
              sizes="(max-width: 1024px) 100vw, 25vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.035]"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

export function HomeRouteLauncher() {
  return (
    <section className="relative overflow-hidden bg-stone py-24 text-ink sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-8 h-40 w-[42rem] max-w-[92vw] -translate-x-1/2 text-river/35">
        <AnimatedPathText
          duration={18}
          path="M 4 80 C 24 4, 76 4, 96 80"
          text="BALIRAJA · TO EDUCATE AND TO SERVE · GANGAPUR · "
          textClassName="fill-current text-[0.18rem] font-semibold uppercase tracking-[0.2em]"
          viewBox="0 0 100 100"
        />
      </div>

      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            Explore
          </p>
          <h2 className="mt-5 font-title text-[clamp(4rem,9vw,9.5rem)] font-normal leading-[0.82] tracking-normal">
            Discover your preparation path
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-[1.02rem] leading-relaxed text-ink-soft">
            The site should answer one question quickly: where should this
            student go next?
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden bg-paper md:grid-cols-2 lg:grid-cols-4">
          {routeCards.map((card) => (
            <Link
              className="group relative min-h-[30rem] overflow-hidden bg-ink text-cream outline-none"
              href={card.href}
              key={card.title}
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover opacity-78 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/78 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream/70">
                  {card.eyebrow}
                </p>
                <h3 className="mt-3 font-title text-[clamp(3rem,5vw,5.2rem)] font-normal leading-[0.82]">
                  {card.title}
                </h3>
                <p className="mt-4 max-w-xs translate-y-2 text-[0.92rem] leading-relaxed text-cream/78 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  {card.body}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PreparationPrinciples() {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
              Your best foot forward
            </p>
            <h2 className="mt-5 max-w-[9ch] font-title text-[clamp(4rem,8vw,8rem)] font-normal leading-[0.82] tracking-normal text-ink">
              Preparation tips
            </h2>
          </div>
          <p className="max-w-2xl text-pretty text-[1.06rem] leading-relaxed text-ink-soft lg:pt-10">
            A parent or student should leave every section with a useful next
            action. These four principles keep the experience practical.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((item) => {
            const Icon = item.icon;

            return (
              <article className="group" key={item.title}>
                <Icon
                  className="size-7 text-river transition-transform duration-500 group-hover:-translate-y-1"
                  aria-hidden="true"
                  strokeWidth={1.8}
                />
                <h3 className="mt-8 text-2xl font-semibold leading-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HomeStories() {
  const featured = updates.slice(0, 3);

  return (
    <section className="bg-stone py-24 sm:py-32">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            News & events
          </p>
          <h2 className="mt-5 font-title text-[clamp(4rem,8vw,8.6rem)] font-normal leading-[0.82] tracking-normal text-ink">
            Academy stories
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-[1rem] leading-relaxed text-ink-soft">
            Keep the homepage current with fewer, clearer stories instead of a
            long wall of announcements.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.86fr_1.28fr_0.86fr] lg:items-center">
          {featured.map((item, index) => (
            <Link
              className="group relative block overflow-hidden bg-ink text-cream"
              href={item.href}
              key={item.title}
            >
              <div
                className={
                  index === 1
                    ? "relative aspect-[16/10]"
                    : "relative aspect-[4/5]"
                }
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-82 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/78 via-ink/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="w-fit border border-cream/38 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-cream/80">
                  {item.tag}
                </p>
                <h3 className="mt-4 max-w-xl text-balance text-2xl font-semibold leading-tight sm:text-3xl">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/news-events"
            className="inline-flex items-center gap-3 text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-ink"
          >
            View all
            <span className="grid size-9 place-items-center rounded-full border border-ink/35 transition-colors hover:bg-ink hover:text-cream">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
