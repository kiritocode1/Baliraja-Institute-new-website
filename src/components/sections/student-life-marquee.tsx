import Image from "next/image";
import MarqueeAlongSvgPath from "@/components/fancy/blocks/marquee-along-svg-path";
import { campusLifeItems } from "@/lib/site";

const studentLifePath =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

const moments = campusLifeItems.map((item, index) => ({
  ...item,
  code: String(index + 1).padStart(2, "0"),
}));

export function StudentLifeMarquee() {
  return (
    <section className="relative overflow-hidden bg-oxblood-deep py-20 text-cream sm:py-24">
      <div className="mx-auto grid max-w-[100rem] gap-8 px-5 sm:px-8 lg:grid-cols-[0.55fr_0.45fr] lg:items-end">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-bright">
            Campus rhythm
          </p>
          <h2 className="mt-4 max-w-[14ch] font-display text-[clamp(2.6rem,6vw,5.8rem)] font-light leading-[0.98] tracking-[-0.025em]">
            Student life moves in loops.
          </h2>
        </div>
        <p className="max-w-xl text-pretty text-[1rem] leading-relaxed text-cream/78 sm:text-[1.1rem] lg:justify-self-end">
          Lectures, test pressure, reading-room discipline and mentoring keep
          circling back until the day starts feeling like preparation.
        </p>
      </div>

      <div className="relative mt-8 h-[13rem] text-brass/55 sm:h-[15rem] lg:h-[17rem]">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-cream/10" />
        <MarqueeAlongSvgPath
          baseVelocity={7}
          className="h-full w-full"
          draggable
          dragSensitivity={0.1}
          grabCursor
          path={studentLifePath}
          repeat={2}
          responsive
          showPath
          slowdownOnHover
          viewBox="0 0 996 330"
        >
          {moments.map((item) => (
            <div className="-translate-x-1/2 -translate-y-1/2" key={item.title}>
              <figure className="group relative h-[4.75rem] w-[3.25rem] overflow-hidden bg-parchment shadow-[0_10px_26px_rgba(0,0,0,0.24)] transition-transform duration-300 ease-out hover:scale-105 sm:h-20 sm:w-14 lg:h-24 lg:w-16">
                <Image
                  alt={item.title}
                  className="h-full w-full object-cover saturate-[0.92] transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                  fill
                  sizes="(max-width: 640px) 3.25rem, (max-width: 1024px) 3.5rem, 4rem"
                  src={item.image}
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-oxblood-deep via-oxblood-deep/78 to-transparent px-1.5 pb-1.5 pt-7 text-cream">
                  <span className="block text-[0.38rem] font-semibold uppercase tracking-[0.14em] text-brass-bright sm:text-[0.43rem]">
                    {item.code} · {item.eyebrow}
                  </span>
                </figcaption>
              </figure>
            </div>
          ))}
        </MarqueeAlongSvgPath>
      </div>
    </section>
  );
}
