import { ArrowLeft, BookOpen, Clock, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanitizeBlogHtml } from "@/lib/crm/blog-posts";
import { getCoursePageBySlug } from "@/lib/crm/course-pages";
import { site } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function absoluteUrl(value: string) {
  return new URL(value, site.websiteHref).toString();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCoursePageBySlug(slug);

  if (!page) {
    return { title: "Course not found" };
  }

  const title = page.seoTitle || `${page.title} Course`;
  const description = page.seoDescription || page.summary;
  const url = `/courses/${page.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.longName,
      images: [{ url: absoluteUrl(page.image), alt: page.imageAlt ?? title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(page.image)],
    },
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCoursePageBySlug(slug);

  if (!page) notFound();

  const url = `${site.websiteHref}/courses/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: page.title,
    description: page.seoDescription || page.summary,
    url,
    image: absoluteUrl(page.image),
    provider: {
      "@type": "EducationalOrganization",
      name: site.longName,
      url: site.websiteHref,
      telephone: site.contact.phone,
      address: site.contact.address,
    },
    audience: page.audience || undefined,
    teaches: page.exams || page.title,
  };

  return (
    <article className="bg-parchment">
      <section className="relative isolate min-h-[72svh] overflow-hidden bg-oxblood-deep text-cream">
        <Image
          src={page.image}
          alt={page.imageAlt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.18 0.06 25 / 0.94) 0%, oklch(0.22 0.07 25 / 0.74) 48%, oklch(0.24 0.07 25 / 0.28) 100%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[72svh] max-w-[100rem] flex-col justify-end px-5 pb-14 pt-32 sm:px-8">
          <Link
            href="/courses"
            className="mb-10 inline-flex w-fit items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream-muted transition-colors hover:text-brass"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Courses
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-brass px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-oxblood-deep">
              {page.category}
            </span>
            {page.exams ? (
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                {page.exams}
              </span>
            ) : null}
          </div>
          <h1 className="mt-6 max-w-[13ch] font-display text-[clamp(3rem,8vw,7.5rem)] font-light leading-[0.94] tracking-normal">
            {page.title}
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-cream/88 sm:text-lg">
            {page.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {page.audience ? (
              <span className="inline-flex items-center gap-2 border border-cream/20 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cream">
                <Users className="size-4" aria-hidden="true" />
                {page.audience}
              </span>
            ) : null}
            {page.duration ? (
              <span className="inline-flex items-center gap-2 border border-cream/20 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cream">
                <Clock className="size-4" aria-hidden="true" />
                {page.duration}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[100rem] gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="max-w-4xl">
            <div
              className="blog-content"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Course HTML is sanitized with a strict allowlist before saving and again before rendering.
              dangerouslySetInnerHTML={{
                __html: sanitizeBlogHtml(page.bodyHtml),
              }}
            />
          </div>

          <aside className="h-fit border border-line bg-parchment-deep p-6">
            <BookOpen className="size-8 text-oxblood" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl leading-none text-oxblood">
              Start with a mentor call
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Share your target exam and attempt timeline. The office will map
              you to the right batch, medium, and test-series route.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/admissions?track=${encodeURIComponent(page.title)}`}
                className="inline-flex items-center justify-center bg-oxblood px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-deep"
              >
                Enquire for this course
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center border border-line-strong px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-oxblood transition-colors hover:border-oxblood"
              >
                Contact the office
              </Link>
            </div>
          </aside>
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
