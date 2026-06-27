import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ImageCardGrid,
  NextUpCta,
  PageHero,
  SectionIntro,
} from "@/components/page-sections";
import { listPublishedBlogCards } from "@/lib/crm/blog-posts";
import { notices, updates } from "@/lib/site";

export const metadata: Metadata = {
  title: "News & Events",
  description:
    "Latest Baliraja Institute notices, test-series updates, events, admissions announcements and exam preparation insights.",
};

const updateCards = updates.map((update) => ({
  eyebrow: update.tag,
  title: update.title,
  body: `${update.date}. Latest academy announcement for current and upcoming aspirants.`,
  image: update.image,
  href: update.href,
}));

export default async function NewsEventsPage() {
  const blogPosts = await listPublishedBlogCards();
  const insightCards = blogPosts.map((post) => ({
    eyebrow: post.category,
    title: post.title,
    body: `${post.excerpt} ${post.readTime}.`,
    image: post.image,
    href: post.href,
  }));

  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="News & events"
        title="Academy stories and notices"
        body="Students need one place for admissions notices, test-series updates, exam guidance and event announcements."
        image="/img-classroom.jpg"
        imageAlt="Students in a Baliraja Institute classroom"
        actions={[
          { href: "/admissions", label: "Ask about admission" },
          { href: "/courses", label: "Explore courses" },
        ]}
      />

      <ImageCardGrid
        eyebrow="Latest"
        title="Updates students should not miss"
        body="A visual update section gives admissions, test series and events enough weight to be seen quickly."
        items={updateCards}
      />

      <section className="bg-parchment py-24 sm:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <SectionIntro
            eyebrow="Notice board"
            title="Current notices"
            body="Keep this list short and operational: dates, tags and clear titles that students can scan quickly."
          />
          <div className="mt-10 border-y border-line">
            {notices.map((notice) => (
              <article
                key={`${notice.date}-${notice.title}`}
                className="grid gap-3 border-b border-line py-5 last:border-b-0 sm:grid-cols-[9rem_10rem_1fr]"
              >
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                  {notice.date}
                </p>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {notice.tag}
                </p>
                <h2 className="font-display text-2xl font-normal leading-tight text-oxblood">
                  {notice.title}
                </h2>
              </article>
            ))}
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

      <ImageCardGrid
        eyebrow="Insights"
        title="Preparation stories"
        body="Short article cards give the institute an active editorial layer for study methods, exam craft and mentoring notes."
        items={insightCards}
      />

      <NextUpCta
        title="Contact"
        body="Need a direct answer about a notice, batch or concession? Contact the office or visit the campus."
        href="/contact-us"
      />
    </div>
  );
}
