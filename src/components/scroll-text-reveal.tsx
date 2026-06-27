"use client";

import {
  type MotionValue,
  motion,
  type UseScrollOptions,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ScrollTextRevealPart {
  text: string;
  className?: string;
  ghostClassName?: string;
}

interface ScrollTextRevealProps {
  parts: ScrollTextRevealPart[];
  className?: string;
  wordClassName?: string;
  ghostClassName?: string;
  offset?: UseScrollOptions["offset"];
}

type Segment =
  | {
      type: "word";
      key: string;
      value: string;
      wordIndex: number;
      className?: string;
      ghostClassName?: string;
    }
  | {
      type: "space";
      key: string;
      value: string;
    };

function getSegments(parts: ScrollTextRevealPart[]) {
  let cursor = 0;
  let wordIndex = 0;
  const segments: Segment[] = [];

  parts.forEach((part, partIndex) => {
    for (const value of part.text.split(/(\s+)/).filter(Boolean)) {
      const key = `${cursor}-${value}`;
      cursor += value.length;

      if (/^\s+$/.test(value)) {
        segments.push({ type: "space", key, value });
        continue;
      }

      segments.push({
        type: "word",
        key,
        value,
        wordIndex,
        className: part.className,
        ghostClassName: part.ghostClassName,
      });
      wordIndex += 1;
    }

    if (partIndex < parts.length - 1) {
      segments.push({ type: "space", key: `${cursor}-part-space`, value: " " });
      cursor += 1;
    }
  });

  return { segments, wordCount: wordIndex };
}

interface WordProps {
  children: string;
  className?: string;
  ghostClassName?: string;
  ghostFallbackClassName?: string;
  progress: MotionValue<number>;
  range: [number, number];
  reduceMotion: boolean;
  wordClassName?: string;
}

function Word({
  children,
  className,
  ghostClassName,
  ghostFallbackClassName,
  progress,
  range,
  reduceMotion,
  wordClassName,
}: WordProps) {
  const opacity = useTransform(progress, range, [0, 1]);

  if (reduceMotion) {
    return (
      <span
        className={cn("inline-block align-baseline", wordClassName, className)}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={cn("relative inline-block align-baseline", wordClassName)}>
      <span
        className={cn(
          "absolute inset-0 pointer-events-none",
          ghostFallbackClassName,
          ghostClassName,
        )}
      >
        {children}
      </span>
      <motion.span
        className={cn("relative inline-block", className)}
        style={{ opacity }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function ScrollTextReveal({
  parts,
  className,
  wordClassName,
  ghostClassName = "text-cream-muted opacity-35",
  offset = ["start 0.9", "start 0.25"],
}: ScrollTextRevealProps) {
  const container = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: container,
    offset,
  });
  const { segments, wordCount } = useMemo(() => getSegments(parts), [parts]);
  const text = useMemo(() => parts.map((part) => part.text).join(" "), [parts]);

  return (
    <span ref={container} className={cn("inline", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {segments.map((segment) => {
          if (segment.type === "space") {
            return (
              <span key={segment.key} className="whitespace-pre">
                {segment.value}
              </span>
            );
          }

          const start = segment.wordIndex / wordCount;
          const end = (segment.wordIndex + 1) / wordCount;

          return (
            <Word
              key={segment.key}
              className={segment.className}
              ghostClassName={segment.ghostClassName}
              ghostFallbackClassName={ghostClassName}
              progress={scrollYProgress}
              range={[start, end]}
              reduceMotion={Boolean(reduceMotion)}
              wordClassName={wordClassName}
            >
              {segment.value}
            </Word>
          );
        })}
      </span>
    </span>
  );
}
