"use client";

import { motion, type Transition } from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type TextUnit = {
  characters: string[];
  needsSpace: boolean;
};

type VerticalCutRevealProps = {
  autoStart?: boolean;
  children: React.ReactNode;
  containerClassName?: string;
  elementLevelClassName?: string;
  onComplete?: () => void;
  onStart?: () => void;
  reverse?: boolean;
  splitBy?: "words" | "characters" | "lines" | string;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  transition?: Transition;
  wordLevelClassName?: string;
};

export type VerticalCutRevealRef = {
  reset: () => void;
  startAnimation: () => void;
};

const splitIntoCharacters = (text: string): string[] => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }

  return Array.from(text);
};

export const VerticalCutReveal = forwardRef<
  VerticalCutRevealRef,
  VerticalCutRevealProps
>(
  (
    {
      autoStart = true,
      children,
      containerClassName,
      elementLevelClassName,
      onComplete,
      onStart,
      reverse = false,
      splitBy = "words",
      staggerDuration = 0.08,
      staggerFrom = "first",
      transition = {
        damping: 24,
        stiffness: 190,
        type: "spring",
      },
      wordLevelClassName,
    },
    ref,
  ) => {
    const text =
      typeof children === "string" ? children : children?.toString() || "";
    const [isAnimating, setIsAnimating] = useState(false);

    const elements = useMemo(() => {
      const words = text.split(" ");

      if (splitBy === "characters") {
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }

      const splitText =
        splitBy === "words"
          ? words
          : splitBy === "lines"
            ? text.split("\n")
            : text.split(splitBy);

      return splitText.map((value, i) => ({
        characters: [value],
        needsSpace: i !== splitText.length - 1,
      }));
    }, [text, splitBy]);

    const totalCharacters = useMemo(() => {
      return elements.reduce(
        (acc, word) => acc + word.characters.length + (word.needsSpace ? 1 : 0),
        0,
      );
    }, [elements]);

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total =
          splitBy === "characters" ? totalCharacters : elements.length;

        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last")
          return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
          const center = Math.floor(total / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
          const randomIndex = Math.floor(Math.random() * total);
          return Math.abs(randomIndex - index) * staggerDuration;
        }

        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [elements.length, staggerFrom, staggerDuration, splitBy, totalCharacters],
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({
      reset: () => setIsAnimating(false),
      startAnimation,
    }));

    useEffect(() => {
      if (autoStart) startAnimation();
    }, [autoStart, startAnimation]);

    const variants = {
      hidden: { y: reverse ? "-100%" : "100%" },
      visible: (i: number) => ({
        y: 0,
        transition: {
          ...transition,
          delay: ((transition.delay as number) || 0) + getStaggerDelay(i),
        },
      }),
    };

    return (
      <span
        className={cn(
          "flex flex-wrap whitespace-pre-wrap",
          splitBy === "lines" && "flex-col",
          containerClassName,
        )}
      >
        <span className="sr-only">{text}</span>

        {elements.map((wordObj: TextUnit, wordIndex, array) => {
          const previousCharsCount = array
            .slice(0, wordIndex)
            .reduce((sum, word) => sum + word.characters.length, 0);

          return (
            <span
              aria-hidden="true"
              className={cn("inline-flex overflow-hidden", wordLevelClassName)}
              key={`${wordObj.characters.join("")}-${wordIndex}`}
            >
              {wordObj.characters.map((char, charIndex) => (
                <span
                  className={cn(
                    "relative whitespace-pre-wrap",
                    elementLevelClassName,
                  )}
                  // biome-ignore lint/suspicious/noArrayIndexKey: split text order is stable and each fragment has no local state.
                  key={`${char}-${charIndex}`}
                >
                  <motion.span
                    animate={isAnimating ? "visible" : "hidden"}
                    className="inline-block"
                    custom={previousCharsCount + charIndex}
                    initial="hidden"
                    onAnimationComplete={
                      wordIndex === elements.length - 1 &&
                      charIndex === wordObj.characters.length - 1
                        ? onComplete
                        : undefined
                    }
                    variants={variants}
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
              {wordObj.needsSpace ? <span> </span> : null}
            </span>
          );
        })}
      </span>
    );
  },
);

VerticalCutReveal.displayName = "VerticalCutReveal";
