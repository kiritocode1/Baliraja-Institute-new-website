import Image from "next/image";
import { RevealText } from "@/components/reveal-text";
import { galleryImages } from "@/lib/site";

// Asymmetric editorial spans so the grid never reads as identical cards.
const spans = [
  "col-span-2 lg:col-span-7 aspect-[16/10]",
  "col-span-2 lg:col-span-5 aspect-[16/10]",
  "col-span-1 lg:col-span-4 aspect-[4/5]",
  "col-span-1 lg:col-span-4 aspect-[4/5]",
  "col-span-2 lg:col-span-4 aspect-[4/5]",
  "col-span-2 lg:col-span-5 aspect-[16/10]",
  "col-span-2 lg:col-span-7 aspect-[16/10]",
  "col-span-2 lg:col-span-12 aspect-[21/9]",
];

export function Gallery() {
  return (
    <section id="gallery" className="bg-parchment py-24 sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
              Inside the academy
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.02em] text-oxblood">
              <RevealText
                text="Campus life"
                splitBy="words"
                stagger={0.06}
                distance={26}
              />
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-[0.98rem] leading-relaxed text-ink-soft">
            Long hours, full benches and a reading hall that rarely empties. A
            look at the ordinary days that build extraordinary results.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">
          {galleryImages.map((img, i) => (
            <figure
              key={img.caption}
              className={`group relative overflow-hidden bg-parchment-deep ${spans[i % spans.length]}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-oxblood-deep/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <figcaption className="absolute bottom-4 left-4 translate-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
