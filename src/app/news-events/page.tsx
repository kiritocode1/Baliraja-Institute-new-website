import { ArrowRight } from "lucide-react";
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

const storyReels = [
  {
    id: "story-1",
    src: "/home/story-v1.mov",
    title: "Journey 1",
  },
  {
    id: "story-2",
    src: "/home/story-v2.MOV",
    title: "Journey 2",
  },
  {
    id: "story-3",
    src: "/home/story-v3.mp4",
    title: "Journey 3",
  },
  {
    id: "story-4",
    src: "/student-life/about-v1.mp4",
    title: "Journey 4",
  },
];

function formatDate(value: string | null) {
  if (!value) return "Recent";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function NewsEventsPage() {
  // Everything on this page comes from the CRM blog editor.
  const posts = await listPublishedBlogCards();
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
        eyebrow="News & notices"
        title="Updates in one place"
        body="Students need one destination for admissions notices, test-series updates, exam guidance and event announcements. Everything below is published from the academy office."
        actions={[
          { href: "/admissions", label: "Ask about admission" },
          { href: "/courses", label: "Explore courses" },
        ]}
      />
      <PlayableReelGrid reels={storyReels} />

      <ImageCardGrid
        eyebrow="Latest"
        title="Updates students should not miss"
        body="Admissions, test series, events and scholarship announcements are grouped here so students do not have to check separate notice and news pages."
        items={latestCards}
      />

      <section className="bg-parchment py-24 sm:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <SectionIntro
            eyebrow="Notice board"
            title="All published notices"
            body="Every announcement in one scannable list — newest first, straight from the academy office."
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
                No announcements published yet. New posts from the office appear
                here immediately.
              </p>
            ) : null}
          </div>
          <Link
            href="/admissions"
            className="mt-10 inline-flex items-center gap-3 bg-oxblood px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-deep"
          >
            Ask about a notice
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <NextUpCta
        title="Contact"
        body="Need a direct answer about a notice, batch or concession? Contact the office or visit the campus."
        href="/contact-us"
      />
    </div>
  );
}
