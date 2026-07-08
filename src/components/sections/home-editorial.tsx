"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  MessageCircleQuestion,
  NotebookPen,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { AnimatedPathText } from "@/components/animated-path-text";
import { getAssetUrl } from "@/lib/assets";
import { localize } from "@/lib/i18n-content";
import { academyContextItems } from "@/lib/site";

const routeCards = [
  {
    eyebrow: "01",
    title: "Courses",
    titleMr: "अभ्यासक्रम",
    body: "Civil services, defence, banking, SSC, police, Talathi and ZP tracks.",
    bodyMr: "नागरी सेवा, संरक्षण, बँकिंग, एसएससी, पोलीस, तलाठी व झेडपी मार्ग.",
    href: "/courses",
    image: "/home/pre-courses.png",
  },
  {
    eyebrow: "02",
    title: "Student Life",
    titleMr: "विद्यार्थी जीवन",
    body: "Study hall, classroom rhythm, mocks, mentoring and daily discipline.",
    bodyMr: "अभ्यासिका, वर्गातील दिनचर्या, मॉक्स, मार्गदर्शन व रोजची शिस्त.",
    href: "/student-life",
    image: "/home/pre-student-life.png",
  },
  {
    eyebrow: "03",
    title: "Admissions",
    titleMr: "प्रवेश",
    body: "A short enquiry, a mentor call, and a batch recommendation.",
    bodyMr: "एक छोटी चौकशी, एक मार्गदर्शक कॉल, आणि बॅचची शिफारस.",
    href: "/admissions",
    image: "/home/pre-admission.jpeg",
  },
  {
    eyebrow: "04",
    title: "Scholarships",
    titleMr: "शिष्यवृत्ती",
    body: "Practical fee support for serious students and farming families.",
    bodyMr: "गंभीर विद्यार्थी व शेतकरी कुटुंबांसाठी व्यावहारिक फी सहाय्य.",
    href: "/scholarships",
    image: "/home/pre-scholarship.png",
  },
];

const principles = [
  {
    title: "Choose one route",
    titleMr: "एकच मार्ग निवडा",
    body: "Start with the exam in front of you. A focused attempt beats scattered preparation.",
    bodyMr: "समोरच्या परीक्षेपासून सुरुवात करा. विखुरलेल्या तयारीपेक्षा केंद्रित प्रयत्न श्रेष्ठ.",
    icon: GraduationCap,
  },
  {
    title: "Keep a daily table",
    titleMr: "रोजचे वेळापत्रक ठेवा",
    body: "Class, reading, revision and mock practice need a visible rhythm, not vague motivation.",
    bodyMr: "वर्ग, वाचन, उजळणी व मॉक सराव यांना स्पष्ट दिनचर्या हवी, अस्पष्ट प्रेरणा नव्हे.",
    icon: NotebookPen,
  },
  {
    title: "Test before comfort",
    titleMr: "आरामाआधी चाचणी",
    body: "Mock pressure shows speed, gaps and presentation while there is still time to correct.",
    bodyMr: "सुधारण्यास वेळ असतानाच मॉकचा दबाव वेग, त्रुटी व मांडणी दाखवतो.",
    icon: BookOpenCheck,
  },
  {
    title: "Ask early",
    titleMr: "लवकर विचारा",
    body: "Fees, medium, hostel, family visits and batch timing should be settled before joining.",
    bodyMr: "फी, माध्यम, वसतिगृह, कौटुंबिक भेटी व बॅच वेळ हे सामील होण्यापूर्वी ठरवावे.",
    icon: MessageCircleQuestion,
  },
];

export function AcademyEditorial() {
  const t = useTranslations("Home");
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-[104rem] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            {t("ourStory")}
          </p>
          <h2 className="mt-5 max-w-[10ch] font-title text-[clamp(3.35rem,8vw,8.8rem)] font-normal leading-[0.84] tracking-normal text-ink">
            {t("roomTitle")}
          </h2>
          <p className="mt-7 max-w-xl text-pretty text-[1.06rem] leading-relaxed text-ink-soft">
            {t("roomBody")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-7 lg:grid-cols-12 lg:items-end">
          <figure className="relative col-span-2 aspect-[3/4] overflow-hidden bg-parchment-deep lg:col-span-5 lg:mb-12">
            <video
              src={getAssetUrl("/home/aca-v1.mov")}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.035]"
              autoPlay
              muted
              loop
              playsInline
            />
          </figure>
          <figure className="relative aspect-[3/4] overflow-hidden bg-parchment-deep lg:col-span-4">
            <video
              src={getAssetUrl("/home/aca-v2.mov")}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.035]"
              autoPlay
              muted
              loop
              playsInline
            />
          </figure>
          <figure className="relative aspect-[3/4] overflow-hidden bg-parchment-deep lg:col-span-3 lg:mb-24">
            <video
              src={getAssetUrl("/home/aca-v3.mov")}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.035]"
              autoPlay
              muted
              loop
              playsInline
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

export function HomeRouteLauncher() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const cards = localize(routeCards, locale);
  return (
    <section className="relative overflow-hidden bg-stone py-28 text-ink sm:py-36 lg:py-44">
      <div className="pointer-events-none absolute left-1/2 top-10 hidden h-52 w-[56rem] max-w-[92vw] -translate-x-1/2 text-river/35 sm:block lg:top-14 lg:h-64 lg:w-[66rem]">
        <AnimatedPathText
          duration={22}
          path="M 4 80 C 24 4, 76 4, 96 80"
          text="BALIRAJA · TO EDUCATE AND TO SERVE · GANGAPUR · "
          textClassName="fill-current text-[0.24rem] font-semibold uppercase tracking-[0.22em] lg:text-[0.27rem]"
          viewBox="0 0 100 100"
        />
      </div>

      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.36em] text-river sm:text-[0.84rem]">
            {t("explore")}
          </p>
          <h2 className="mt-7 font-title text-[clamp(4.35rem,10vw,11.75rem)] font-normal leading-[0.8] tracking-normal">
            {t("discoverTitle")}
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-pretty text-[1.08rem] leading-relaxed text-ink-soft sm:text-xl">
            {t("discoverBody")}
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden bg-paper md:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              className="group relative min-h-[21rem] overflow-hidden bg-ink text-cream outline-none sm:min-h-[27rem] lg:min-h-[34rem]"
              href={card.href}
              key={card.title}
            >
              <Image
                src={getAssetUrl(card.image)}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover opacity-78 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/78 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cream/70">
                  {card.eyebrow}
                </p>
                <h3 className="mt-3 font-title text-[clamp(2rem,5vw,3rem)] font-normal leading-[0.82] lg:text-[clamp(1.75rem,2.2vw,2.4rem)] xl:text-[clamp(2.2rem,2.8vw,3.2rem)]">
                  {card.title}
                </h3>
                <p className="mt-5 max-w-sm translate-y-0 text-[1rem] leading-relaxed text-cream/78 opacity-100 transition duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
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
  const t = useTranslations("Home");
  const locale = useLocale();
  const items = localize(principles, locale);
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
              {t("bestFoot")}
            </p>
            <h2 className="mt-5 max-w-[9ch] font-title text-[clamp(3.35rem,8vw,8rem)] font-normal leading-[0.84] tracking-normal text-ink">
              {t("tipsTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-pretty text-[1.06rem] leading-relaxed text-ink-soft lg:pt-10">
            {t("tipsBody")}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {items.map((item) => {
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

export function AcademyContext() {
  const t = useTranslations("Home");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const items = localize(academyContextItems, locale);
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
              {t("campusContext")}
            </p>
            <h2 className="mt-5 max-w-[10ch] font-title text-[clamp(3.35rem,8vw,8rem)] font-normal leading-[0.84] tracking-normal text-ink">
              {t("moreThanTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-pretty text-[1rem] leading-relaxed text-ink-soft sm:text-[1.06rem] lg:pb-3">
            {t("moreThanBody")}
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden bg-line md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const content = (
              <>
                <div className="relative aspect-[16/10] overflow-hidden bg-stone sm:aspect-[5/4] md:aspect-[4/3] xl:aspect-[5/4]">
                  <Image
                    src={getAssetUrl(item.image)}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                  />
                </div>
                <div className="flex flex-col justify-between bg-parchment p-5 sm:min-h-60 sm:p-6">
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-river">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-4 text-balance text-2xl font-semibold leading-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                  </div>
                  {item.href ? (
                    <span className="mt-8 inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
                      {tc("open")}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
              </>
            );

            return item.href ? (
              <Link
                className="group block min-w-0 bg-parchment outline-none"
                href={item.href}
                key={item.title}
              >
                {content}
              </Link>
            ) : (
              <article className="group min-w-0 bg-parchment" key={item.title}>
                {content}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HomeStories() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  const STORIES = localize(
    [
      {
        id: "story-1",
        src: "/home/story-v1.mov",
        title: "Journey 1",
        titleMr: "प्रवास १",
      },
      {
        id: "story-2",
        src: "/home/story-v2.MOV",
        title: "Journey 2",
        titleMr: "प्रवास २",
      },
      {
        id: "story-3",
        src: "/home/story-v3.mp4",
        title: "Journey 3",
        titleMr: "प्रवास ३",
      },
      {
        id: "story-4",
        src: "/student-life/about-v1.mp4",
        title: "Journey 4",
        titleMr: "प्रवास ४",
      },
    ],
    locale,
  );

  return (
    <section className="bg-stone py-20 sm:py-28">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-river">
            {t("studentCorner")}
          </p>
          <h2 className="mt-5 font-title text-[clamp(3.35rem,8vw,8.6rem)] font-normal leading-[0.84] tracking-normal text-ink">
            {t("storiesTitle")}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-[1rem] leading-relaxed text-ink-soft">
            {t("storiesBody")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-[104rem] mx-auto">
          {STORIES.map((story) => (
            <StoryCard
              key={story.id}
              src={story.src}
              title={story.title}
              isActive={activeStoryId === story.id}
              onPlay={() => setActiveStoryId(story.id)}
              onPause={() => {
                if (activeStoryId === story.id) {
                  setActiveStoryId(null);
                }
              }}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/news-events"
            className="inline-flex items-center gap-3 text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-ink"
          >
            {t("viewAllUpdates")}
            <span className="grid size-9 place-items-center rounded-full border border-ink/35 transition-colors hover:bg-ink hover:text-cream">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

interface StoryCardProps {
  src: string;
  title: string;
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
}

function StoryCard({ src, title, isActive, onPlay, onPause }: StoryCardProps) {
  const t = useTranslations("Home");
  const tc = useTranslations("Common");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch((err) => {
        console.error("Error playing story video:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    if (isActive) {
      onPause();
    } else {
      onPlay();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink border border-cream/10 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={getAssetUrl(src)}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
      />

      {/* Subtle bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Interactive Play Overlay */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/90 text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-8 w-8 fill-current" />
          </div>
          <span className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cream drop-shadow-md">
            {t("clickToPlay")}
          </span>
        </div>
      )}

      {/* Floating Header & Footer controls when playing */}
      {isActive && (
        <>
          {/* Pause overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/20 hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream/90 text-ink shadow-md">
              <Pause className="h-6 w-6 fill-current" />
            </div>
          </div>

          {/* Mute toggle button */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-cream backdrop-blur-sm transition-transform hover:scale-105"
            aria-label={isMuted ? tc("unmute") : tc("mute")}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </>
      )}

      {/* Title label at bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass-bright">
          {t("story")}
        </p>
        <p className="mt-1 font-display text-sm font-medium text-cream drop-shadow-sm">
          {title}
        </p>
      </div>
    </div>
  );
}
