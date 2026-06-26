"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { RevealText } from "@/components/reveal-text";
import { examTracks, featuredExams } from "@/lib/site";

function TrackRow({
  variant,
  title,
  right,
}: {
  variant: "normal" | "invert";
  title: string;
  right: string;
}) {
  return (
    <div className={`track-row track-row--${variant}`}>
      <span className="font-display text-[clamp(1.5rem,3.2vw,2.5rem)] font-light leading-none tracking-[-0.02em]">
        {title}
      </span>
      <span className="shrink-0 text-[0.72rem] font-semibold uppercase tracking-[0.18em] tabular-nums">
        {right}
      </span>
    </div>
  );
}

export function ExamTracks() {
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = Array.from(list.querySelectorAll<HTMLElement>(".track"));
    const wrappers = rows.map(
      (r) => r.querySelector<HTMLElement>(".track-wrapper")!,
    );
    if (!rows.length) return;

    // Warm the preview cache so the first hover is instant.
    examTracks.forEach((t) => {
      const im = new window.Image();
      im.src = t.image;
    });

    let H = rows[0].getBoundingClientRect().height;
    let pos = { BOTTOM: 0, MIDDLE: -H, TOP: -2 * H };
    wrappers.forEach((w) => gsap.set(w, { y: pos.TOP }));

    const last = { x: 0, y: 0 };
    let active: HTMLElement | null = null;
    let ticking = false;
    let idleTimer: number | null = null;

    const clearPreview = () => {
      preview.querySelectorAll("img").forEach((img) =>
        gsap.to(img, {
          scale: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => img.remove(),
        }),
      );
    };

    const addPreview = (index: number) => {
      const img = document.createElement("img");
      img.src = examTracks[index].image;
      img.alt = "";
      img.style.transform = "scale(0)";
      img.style.zIndex = String(Date.now());
      preview.appendChild(img);
      gsap.to(img, { scale: 1, duration: 0.45, ease: "power2.out" });
    };

    // The two "normal" panels are identical, so snapping between TOP/BOTTOM is
    // invisible — it just lets the invert panel slide in from the entry edge.
    const enter = (row: HTMLElement, wrapper: HTMLElement, clientY: number, index: number) => {
      active = row;
      const rect = row.getBoundingClientRect();
      const fromTop = clientY < rect.top + rect.height / 2;
      gsap.set(wrapper, { y: fromTop ? pos.TOP : pos.BOTTOM });
      gsap.to(wrapper, { y: pos.MIDDLE, duration: 0.4, ease: "power2.out" });
      addPreview(index);
    };
    const leave = (wrapper: HTMLElement, clientY: number, row: HTMLElement) => {
      const rect = row.getBoundingClientRect();
      const fromTop = clientY < rect.top + rect.height / 2;
      gsap.to(wrapper, {
        y: fromTop ? pos.TOP : pos.BOTTOM,
        duration: 0.4,
        ease: "power2.out",
      });
      active = null;
    };

    const offs: Array<() => void> = [];
    rows.forEach((row, index) => {
      const wrapper = wrappers[index];
      const onEnter = (e: MouseEvent) => enter(row, wrapper, e.clientY, index);
      const onLeave = (e: MouseEvent) => leave(wrapper, e.clientY, row);
      const onFocus = () => {
        const r = row.getBoundingClientRect();
        enter(row, wrapper, r.top + 1, index);
      };
      const onBlur = () => {
        const r = row.getBoundingClientRect();
        leave(wrapper, r.bottom + 1, row);
        clearPreview();
      };
      row.addEventListener("mouseenter", onEnter);
      row.addEventListener("mouseleave", onLeave);
      row.addEventListener("focus", onFocus);
      row.addEventListener("blur", onBlur);
      offs.push(() => {
        row.removeEventListener("mouseenter", onEnter);
        row.removeEventListener("mouseleave", onLeave);
        row.removeEventListener("focus", onFocus);
        row.removeEventListener("blur", onBlur);
      });
    });

    const inside = (x: number, y: number) => {
      const r = list.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const onMove = (e: MouseEvent) => {
      last.x = e.clientX;
      last.y = e.clientY;
      if (!inside(e.clientX, e.clientY)) {
        clearPreview();
        return;
      }
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        const imgs = preview.querySelectorAll("img");
        imgs.forEach((img, i) => {
          if (i < imgs.length - 1)
            gsap.to(img, {
              scale: 0,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => img.remove(),
            });
        });
      }, 2000);
    };
    window.addEventListener("mousemove", onMove);

    // Keep slides correct when the list scrolls under a stationary cursor.
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (!inside(last.x, last.y)) clearPreview();
        if (active) {
          const rect = active.getBoundingClientRect();
          const over =
            last.x >= rect.left &&
            last.x <= rect.right &&
            last.y >= rect.top &&
            last.y <= rect.bottom;
          if (!over) {
            const wrapper = active.querySelector<HTMLElement>(".track-wrapper")!;
            const fromTop = last.y < rect.top + rect.height / 2;
            gsap.to(wrapper, {
              y: fromTop ? pos.TOP : pos.BOTTOM,
              duration: 0.4,
              ease: "power2.out",
            });
            active = null;
          }
        }
        rows.forEach((row, i) => {
          if (row === active) return;
          const rect = row.getBoundingClientRect();
          const over =
            last.x >= rect.left &&
            last.x <= rect.right &&
            last.y >= rect.top &&
            last.y <= rect.bottom;
          if (over) {
            gsap.to(wrappers[i], {
              y: pos.MIDDLE,
              duration: 0.4,
              ease: "power2.out",
            });
            active = row;
          }
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      H = rows[0].getBoundingClientRect().height;
      pos = { BOTTOM: 0, MIDDLE: -H, TOP: -2 * H };
      wrappers.forEach((w) => {
        if (w !== active?.querySelector(".track-wrapper")) gsap.set(w, { y: pos.TOP });
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      offs.forEach((off) => off());
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (idleTimer) window.clearTimeout(idleTimer);
      preview.querySelectorAll("img").forEach((img) => img.remove());
      gsap.killTweensOf(wrappers);
    };
  }, []);

  return (
    <section id="courses" className="bg-parchment-deep py-24 sm:py-32">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
              What we prepare you for
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.02em] text-oxblood">
              <RevealText text="Exam Tracks" splitBy="characters" stagger={0.03} distance={26} />
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-[0.98rem] leading-relaxed text-ink-soft">
            One academy, six disciplined routes into the services. Hover a track
            to preview it; choose one to begin an enquiry.
          </p>
        </div>
      </div>

      {/* Featured defence tracks — Army & Navy lead the list */}
      <div className="mx-auto mt-12 max-w-[100rem] px-5 sm:px-8">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
          Defence services · the entries asked for first
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {featuredExams.map((f) => (
            <Link
              key={f.key}
              href={`/admissions?track=${encodeURIComponent(f.title)}`}
              className="group flex flex-col"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(0.2 0.06 25 / 0.05) 35%, oklch(0.2 0.06 25 / 0.82) 100%)",
                  }}
                />
                <span className="absolute left-4 top-4 bg-brass px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-oxblood-deep">
                  Defence
                </span>
                <h3 className="absolute bottom-4 left-5 font-display text-[clamp(2.6rem,6vw,4.5rem)] font-light leading-none text-cream">
                  {f.title}
                </h3>
              </div>
              <div className="mt-5 flex flex-1 flex-col gap-3">
                <p className="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-oxblood">
                  {f.exams}
                </p>
                <p className="max-w-prose text-[0.96rem] leading-relaxed text-ink-soft">
                  {f.blurb}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-oxblood">
                  <span className="link-hover link-hover--slide">
                    Prepare for {f.title}
                  </span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[100rem] px-5 sm:px-8">
        <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brass-deep">
          And every state and central service
        </p>
        <div ref={listRef} className="track-list">
          {examTracks.map((t) => (
            <Link
              key={t.code}
              href={`/admissions?track=${encodeURIComponent(t.title)}`}
              className="track"
              aria-label={`${t.title}: ${t.blurb} Enquire.`}
            >
              <div className="track-wrapper" aria-hidden="true">
                <TrackRow variant="normal" title={t.title} right={t.code} />
                <TrackRow variant="invert" title={t.title} right="Enquire →" />
                <TrackRow variant="normal" title={t.title} right={t.code} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div ref={previewRef} className="track-preview" aria-hidden="true" />
    </section>
  );
}
