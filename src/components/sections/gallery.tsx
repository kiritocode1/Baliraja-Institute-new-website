"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { RevealText } from "@/components/reveal-text";
import { getAssetUrl } from "@/lib/assets";
import { galleryImages } from "@/lib/site";

export function Gallery({
  hideIntro = false,
  images,
}: {
  hideIntro?: boolean;
  images?: string[];
}) {
  const [activeVideoSrc, setActiveVideoSrc] = useState<string | null>(null);

  const displayItems = images
    ? images.map((img, i) => ({
        src: getAssetUrl(img),
        alt: `Campus photo ${i + 1}`,
        caption: `Gallery Photo ${i + 1}`,
        type: "image" as const,
        aspect: "horizontal" as const,
      }))
    : galleryImages;

  return (
    <section id="gallery" className={hideIntro ? "mt-10" : "bg-parchment py-20 sm:py-28"}>
      <div className={hideIntro ? "" : "mx-auto max-w-[100rem] px-5 sm:px-8"}>
        {!hideIntro && (
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
        )}

        <div className={hideIntro ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12" : "mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-12"}>
          {displayItems.map((img) => {
            const isVertical = img.aspect === "vertical";
            const colSpanClass = isVertical
              ? "col-span-1 lg:col-span-3 aspect-[9/16] sm:aspect-[3/4]"
              : images
                ? "col-span-2 lg:col-span-4 aspect-[4/3] sm:aspect-[16/10]"
                : "col-span-2 lg:col-span-6 aspect-[4/3] sm:aspect-[16/10]";

            return (
              <figure
                key={img.caption}
                className={`group relative overflow-hidden bg-parchment-deep rounded-2xl ${colSpanClass}`}
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 350px" } as React.CSSProperties}
              >
                {img.type === "video" ? (
                  <GalleryVideoCard
                    src={getAssetUrl(img.src)}
                    alt={img.alt}
                    caption={img.caption}
                    isActive={activeVideoSrc === img.src}
                    onPlay={() => setActiveVideoSrc(img.src)}
                    onPause={() => {
                      if (activeVideoSrc === img.src) {
                        setActiveVideoSrc(null);
                      }
                    }}
                  />
                ) : (
                  <>
                    <Image
                      src={getAssetUrl(img.src)}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      quality={60}
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] transform-gpu will-change-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-oxblood-deep/76 via-transparent to-transparent opacity-85 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100" />
                    <figcaption className="absolute bottom-3 left-3 right-3 translate-y-0 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-cream opacity-100 transition-all duration-500 sm:bottom-4 sm:left-4 sm:right-4 sm:translate-y-2 sm:text-[0.72rem] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      {img.caption}
                    </figcaption>
                  </>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface GalleryVideoCardProps {
  src: string;
  alt: string;
  caption: string;
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
}

function GalleryVideoCard({ src, alt, caption, isActive, onPlay, onPause }: GalleryVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch((err) => {
        console.error("Error playing gallery video:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    if (isActive) {
      onPause();
    } else {
      onPlay();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={getAssetUrl(src)}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
      />

      {/* Subtle bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Interactive Play Overlay */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/15 transition-colors group-hover:bg-black/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream/95 text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </div>
          <span className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cream drop-shadow">
            Play Video
          </span>
        </div>
      )}

      {/* Floating Controls when playing */}
      {isActive && (
        <>
          {/* Pause overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/25 hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream/95 text-ink shadow-md">
              <Pause className="h-5 w-5 fill-current" />
            </div>
          </div>

          {/* Mute toggle button */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-cream backdrop-blur-sm transition-transform hover:scale-105"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>
        </>
      )}

      {/* Caption at bottom */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none transition-all duration-300">
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-brass-bright">
          Campus Life
        </p>
        <p className="mt-0.5 font-display text-xs text-cream drop-shadow-sm">
          {caption}
        </p>
      </div>
    </div>
  );
}
