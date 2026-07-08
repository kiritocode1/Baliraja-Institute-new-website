import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  ImageCardGrid,
  NextUpCta,
  PageHero,
  SectionIntro,
} from "@/components/page-sections";
import { PlayableReelGrid } from "@/components/playable-reel-grid";
import { listPublishedBlogCards } from "@/lib/crm/blog-posts";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "News & Notices",
  description:
    "Latest Baliraja Institute notices, test-series updates, events, admissions announcements and exam preparation insights in one place.",
  path: "/news-events",
});

export default async function NewsEventsPage() {
  const t = await getTranslations("NewsEvents");
  const locale = await getLocale();
  const formatDate = (value: string | null) => {
    if (!value) return t("recent");
    return new Intl.DateTimeFormat(locale === "mr" ? "mr-IN" : "en-IN", {
      dateStyle: "medium",
    }).format(new Date(value));
  };
  const storyReels = [
    { id: "story-1", src: "/home/story-v1.mov", title: t("reel1") },
    { id: "story-2", src: "/home/story-v2.MOV", title: t("reel2") },
    { id: "story-3", src: "/home/story-v3.mp4", title: t("reel3") },
    { id: "story-4", src: "/student-life/about-v1.mp4", title: t("reel4") },
  ];
  // Everything on this page comes from the CRM blog editor.
  const posts = await listPublishedBlogCards(locale);
  const latestCards = posts.slice(0, 6).map((post) => ({
    eyebrow: post.category,
    title: post.title,
    body: `${post.excerpt} ${post.readTime}.`,
    image: post.image,
    href: post.href,
  }));

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        actions={[
          { href: "/admissions", label: t("heroAsk") },
          { href: "/courses", label: t("heroExplore") },
        ]}
      />
      <PlayableReelGrid reels={storyReels} />

      <ImageCardGrid
        eyebrow={t("latestEyebrow")}
        title={t("latestTitle")}
        body={t("latestBody")}
        items={latestCards}
      />

      <section className="bg-parchment py-24 sm:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <SectionIntro
            eyebrow={t("boardEyebrow")}
            title={t("boardTitle")}
            body={t("boardBody")}
          />
          <div className="mt-10 border-y border-line">
            {posts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="grid gap-3 border-b border-line py-5 transition-colors last:border-b-0 hover:bg-parchment-deep sm:grid-cols-[9rem_10rem_1fr]"
              >
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                  {formatDate(post.publishedAt)}
                </p>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {post.category}
                </p>
                <h2 className="font-display text-2xl font-normal leading-tight text-oxblood">
                  {post.title}
                </h2>
              </Link>
            ))}
            {posts.length === 0 ? (
              <p className="py-10 text-sm leading-relaxed text-ink-soft">
                {t("empty")}
              </p>
            ) : null}
          </div>
          <Link
            href="/admissions"
            className="mt-10 inline-flex items-center gap-3 bg-oxblood px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-deep"
          >
            {t("askNotice")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <NextUpCta
        title={t("nextUpTitle")}
        body={t("nextUpBody")}
        href="/contact-us"
      />
    </div>
  );
}
