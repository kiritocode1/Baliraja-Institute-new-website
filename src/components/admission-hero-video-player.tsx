"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { getAssetUrl } from "@/lib/assets";

export function AdmissionHeroVideoPlayer() {
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
        console.error("Error playing admissions video:", err);
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
      className="group relative mt-10 w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-2xl bg-black border border-line-strong transition-all duration-500 hover:shadow-2xl cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={getAssetUrl("/admissions/admission-hero-v1.mp4")}
        className="h-full w-full object-cover"
        playsInline
        muted={isMuted}
        controls={isPlaying}
      />

      {/* Play Overlay before play starts */}
      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-all duration-300 group-hover:bg-black/45">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream/90 text-ink shadow-2xl transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1.5 h-10 w-10 fill-current" />
          </div>
        </div>
      )}

      {/* Floating Controls Overlay */}
      {isPlaying && (
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-cream backdrop-blur-md transition-transform hover:scale-105"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
