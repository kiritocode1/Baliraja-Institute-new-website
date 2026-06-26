"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import {
  KineticTextReveal,
  type KineticTextRevealRef,
} from "@/components/ui/kinetic-text-reveal";

type KineticProps = Omit<
  React.ComponentProps<typeof KineticTextReveal>,
  "ref" | "autoPlay"
>;

type RevealTextProps = KineticProps & {
  /** Re-run every time it re-enters the viewport. Default: play once. */
  repeat?: boolean;
  /** Fraction of the element visible before it fires. */
  amount?: number;
  /** Skip the viewport gate and play immediately on mount (above-the-fold). */
  immediate?: boolean;
};

/**
 * Wraps the kinetic-text-reveal component so big typography only reveals
 * once it scrolls into view (per the brief), driving the component's
 * imperative play() handle from a framer-motion useInView gate.
 */
export function RevealText({
  repeat = false,
  amount = 0.45,
  immediate = false,
  ...props
}: RevealTextProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const apiRef = useRef<KineticTextRevealRef>(null);
  const inView = useInView(wrapRef, { once: !repeat, amount });
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (immediate) return;
    if (inView) {
      apiRef.current?.play();
      hasPlayed.current = true;
    } else if (repeat && hasPlayed.current) {
      apiRef.current?.reset();
    }
  }, [inView, repeat, immediate]);

  return (
    <span ref={wrapRef} className="inline-block max-w-full">
      <KineticTextReveal ref={apiRef} autoPlay={immediate} {...props} />
    </span>
  );
}
