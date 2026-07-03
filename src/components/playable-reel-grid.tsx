"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { getAssetUrl } from "@/lib/assets";

const REELS = [
  {
    id: "reel-1",
    src: "/student-life/about-v1.mp4",
    title: "Classroom Environment",
  },
  {
    id: "reel-2",
    src: "/student-life/about-v2.mp4",
    title: "Library & Study Space",
  },
  {
    id: "reel-3",
    src: "/student-life/aboutv-v3.mp4",
    title: "Student Mentorship",
  },
  {
    id: "reel-4",
    src: "/student-life/about-v4.mp4",
    title: "Academy Overview",
  },
];

export interface ReelItem {
  id: string;
  src: string;
  title: string;
}

export function PlayableReelGrid({ reels }: { reels?: ReelItem[] }) {
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const displayReels = reels || REELS;

  return (
    <div className="mt-8 mx-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {displayReels.map((reel) => (
        <ReelCard
          key={reel.id}
          src={reel.src}
          title={reel.title}
          isActive={activeReelId === reel.id}
          onPlay={() => setActiveReelId(reel.id)}
          onPause={() => {
            if (activeReelId === reel.id) {
              setActiveReelId(null);
            }
          }}
        />
      ))}
    </div>
  );
}

interface ReelCardProps {
  src: string;
  title: string;
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
}

function ReelCard({ src, title, isActive, onPlay, onPause }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false); // Default to unmuted so audio plays

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
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
    <div
      className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink/5 border border-line-strong transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={getAssetUrl(src)}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
      />

      {/* Subtle bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Interactive Play Overlay */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/90 text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-8 w-8 fill-current" />
          </div>
          <span className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cream drop-shadow-md">
            Click to Play
          </span>
        </div>
      )}

      {/* Floating Header & Footer controls when playing */}
      {isActive && (
        <>
          {/* Pause overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/20 hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream/90 text-ink shadow-md">
              <Pause className="h-6 w-6 fill-current" />
            </div>
          </div>

          {/* Mute toggle button */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-cream backdrop-blur-sm transition-transform hover:scale-105"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </>
      )}

      {/* Title label at bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass-bright">
          Reel
        </p>
        <p className="mt-1 font-display text-sm font-medium text-cream drop-shadow-sm">
          {title}
        </p>
      </div>
    </div>
  );
}
