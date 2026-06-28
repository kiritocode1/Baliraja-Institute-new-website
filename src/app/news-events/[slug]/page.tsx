import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, sanitizeBlogHtml } from "@/lib/crm/blog-posts";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article not found" };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = absoluteUrl(post.image);

  return {
    title,
    description,
    alternates: { canonical: `/news-events/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `/news-events/${post.slug}`,
      siteName: site.longName,
      locale: "en_IN",
      images: [{ url: image, alt: post.title }],
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const publishedDate = formatDate(post.publishedAt);
  const url = `${site.websiteHref}/news-events/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: absoluteUrl(post.image),
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author || site.longName,
    },
    publisher: {
      "@type": "Organization",
      name: site.longName,
      logo: {
        "@type": "ImageObject",
        url: `${site.websiteHref}/icon.svg`,
      },
    },
    mainEntityOfPage: url,
  };

  return (
    <article className="bg-parchment">
      <section className="relative isolate min-h-[68svh] overflow-hidden bg-oxblood-deep text-cream">
        <Image
          src={post.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.18 0.06 25 / 0.94) 0%, oklch(0.22 0.07 25 / 0.72) 48%, oklch(0.24 0.07 25 / 0.28) 100%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[68svh] max-w-[100rem] flex-col justify-end px-5 pb-14 pt-32 sm:px-8">
          <Link
            href="/news-events"
            className="mb-10 inline-flex w-fit items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream-muted transition-colors hover:text-brass"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            News & events
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-brass px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-oxblood-deep">
              {post.category}
            </span>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
              {post.readTime}
            </span>
            {publishedDate ? (
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                {publishedDate}
              </span>
            ) : null}
          </div>
          <h1 className="mt-6 max-w-[13ch] font-display text-[clamp(3rem,8vw,7.5rem)] font-light leading-[0.94] tracking-normal">
            {post.title}
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-cream/88 sm:text-lg">
            {post.excerpt}
          </p>
          {post.author ? (
            <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-brass">
              By {post.author}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div
            className="blog-content"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Blog HTML is sanitized with a strict allowlist before saving and again before rendering.
            dangerouslySetInnerHTML={{
              __html: sanitizeBlogHtml(post.bodyHtml),
            }}
          />
        </div>
      </section>

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is generated from sanitized CRM strings and fixed site metadata.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
