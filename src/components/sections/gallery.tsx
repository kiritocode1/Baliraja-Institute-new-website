import Image from "next/image";
import { RevealText } from "@/components/reveal-text";
import { galleryImages } from "@/lib/site";

export function Gallery() {
  return (
    <section id="gallery" className="bg-parchment py-20 sm:py-28">
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

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-12">
          {galleryImages.map((img) => {
            const isVertical = img.aspect === "vertical";
            const colSpanClass = isVertical
              ? "col-span-1 lg:col-span-3 aspect-[9/16] sm:aspect-[3/4]"
              : "col-span-2 lg:col-span-6 aspect-[4/3] sm:aspect-[16/10]";

            return (
              <figure
                key={img.caption}
                className={`group relative overflow-hidden bg-parchment-deep ${colSpanClass}`}
              >
                {img.type === "video" ? (
                  <video
                    src={img.src}
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-oxblood-deep/76 via-transparent to-transparent opacity-85 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100" />
                <figcaption className="absolute bottom-3 left-3 right-3 translate-y-0 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-cream opacity-100 transition-all duration-500 sm:bottom-4 sm:left-4 sm:right-4 sm:translate-y-2 sm:text-[0.72rem] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                  {img.caption}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
