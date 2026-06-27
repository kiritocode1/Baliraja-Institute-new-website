import Image from "next/image";
import Link from "next/link";
import { RevealText } from "@/components/reveal-text";
import { listPublishedBlogCards } from "@/lib/crm/blog-posts";

export async function Blog() {
  const blogPosts = await listPublishedBlogCards(3);

  return (
    <section id="blog" className="bg-parchment py-24 sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
              From the desk
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.02em] text-oxblood">
              <RevealText
                text="Insights & method"
                splitBy="words"
                stagger={0.06}
                distance={26}
              />
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-[0.98rem] leading-relaxed text-ink-soft">
            Study strategy, exam craft and honest notes from our mentors,
            written for the aspirant who is doing the work alone.
          </p>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((p) => (
            <Link key={p.title} href={p.href} className="group flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-parchment-deep">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
                <span className="absolute left-4 top-4 bg-parchment px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-oxblood">
                  {p.category}
                </span>
              </div>
              <div className="mt-5 flex flex-1 flex-col">
                <h3 className="font-display text-[1.5rem] font-normal leading-tight text-oxblood transition-colors group-hover:text-brass-deep">
                  {p.title}
                </h3>
                <p className="mt-3 text-pretty text-[0.96rem] leading-relaxed text-ink-soft">
                  {p.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                  <span className="link-hover link-hover--slide text-oxblood">
                    Read article
                  </span>
                  <span className="text-ink-soft">{p.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
