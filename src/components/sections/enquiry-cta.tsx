"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { RevealText } from "@/components/reveal-text";
import { getAssetUrl } from "@/lib/assets";

function PlayableCtaVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch((err) => {
        console.error("Error playing CTA video:", err);
      });
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      onClick={togglePlay}
      className="group relative w-full aspect-video overflow-hidden rounded-2xl bg-black border border-line-strong shadow-xl cursor-pointer"
    >
      <video
        ref={videoRef}
        src={getAssetUrl("/admissions/admission-hero-v1.mp4")}
        className="h-full w-full object-cover"
        playsInline
        muted={isMuted}
        controls={isPlaying}
      />

      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 transition-colors duration-300 group-hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/95 text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-8 w-8 fill-current" />
          </div>
          <span className="mt-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cream drop-shadow">
            Play Guide
          </span>
        </div>
      )}

      {isPlaying && (
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-cream backdrop-blur-sm transition-transform hover:scale-105"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export function EnquiryCta() {
  return (
    <section className="bg-parchment py-24 sm:py-36">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="flex flex-col items-start gap-10 lg:col-span-7">
            <h2 className="max-w-[16ch] font-display text-[clamp(2.4rem,7vw,6rem)] font-light leading-[0.98] tracking-[-0.025em] text-oxblood">
              <RevealText
                text="Begin your preparation."
                splitBy="words"
                stagger={0.07}
                distance={30}
                amount={0.4}
              />
            </h2>
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
              Admissions for the next batch are open. Send an enquiry and our team
              will call you back to discuss the right track, schedule and fee
              structure for your goal.
            </p>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-3 bg-oxblood px-8 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
            >
              Enquire for admission
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="lg:col-span-5 w-full">
            <PlayableCtaVideo />
          </div>
        </div>
      </div>
    </section>
  );
}
