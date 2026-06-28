"use client";

import {
  type UseScrollOptions,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { type RefObject, useEffect, useId, useRef } from "react";

type PreserveAspectRatioAlign =
  | "none"
  | "xMinYMin"
  | "xMidYMin"
  | "xMaxYMin"
  | "xMinYMid"
  | "xMidYMid"
  | "xMaxYMid"
  | "xMinYMax"
  | "xMidYMax"
  | "xMaxYMax";

type PreserveAspectRatioMeetOrSlice = "meet" | "slice";

type PreserveAspectRatio =
  | PreserveAspectRatioAlign
  | `${Exclude<PreserveAspectRatioAlign, "none">} ${PreserveAspectRatioMeetOrSlice}`;

type AnimatedPathTextProps = {
  animationType?: "auto" | "scroll";
  duration?: number;
  easingFunction?: {
    calcMode?: string;
    keySplines?: string;
    keyTimes?: string;
  };
  height?: number | string;
  path: string;
  pathClassName?: string;
  pathId?: string;
  preserveAspectRatio?: PreserveAspectRatio;
  repeatCount?: number | "indefinite";
  scrollContainer?: RefObject<HTMLElement | null>;
  scrollOffset?: UseScrollOptions["offset"];
  scrollTransformValues?: [number, number];
  showPath?: boolean;
  svgClassName?: string;
  text: string;
  textAnchor?: "start" | "middle" | "end";
  textClassName?: string;
  viewBox?: string;
  width?: number | string;
};

export function AnimatedPathText({
  animationType = "auto",
  duration = 4,
  easingFunction = {},
  height = "100%",
  path,
  pathClassName,
  pathId,
  preserveAspectRatio = "xMidYMid meet",
  repeatCount = "indefinite",
  scrollContainer,
  scrollOffset = ["start end", "end end"],
  scrollTransformValues = [0, 100],
  showPath = false,
  svgClassName,
  text,
  textAnchor = "start",
  textClassName,
  viewBox = "0 0 100 100",
  width = "100%",
}: AnimatedPathTextProps) {
  const generatedId = useId();
  const textPathRefs = useRef<SVGTextPathElement[]>([]);
  const reducedMotion = useReducedMotion();
  const id = pathId || `animated-path-${generatedId.replace(/:/g, "")}`;

  const { scrollYProgress } = useScroll({
    ...(scrollContainer && {
      container: scrollContainer as RefObject<HTMLElement>,
    }),
    offset: scrollOffset,
  });
  const startOffset = useTransform(
    scrollYProgress,
    [0, 1],
    scrollTransformValues,
  );

  useEffect(() => {
    if (animationType !== "scroll" || reducedMotion) return;

    return startOffset.on("change", (value) => {
      textPathRefs.current.forEach((textPath) => {
        textPath?.setAttribute("startOffset", `${value}%`);
      });
    });
  }, [animationType, reducedMotion, startOffset]);

  const animationProps =
    animationType === "auto" && !reducedMotion
      ? {
          begin: "0s",
          dur: `${duration}s`,
          from: "0%",
          repeatCount,
          to: "100%",
          ...easingFunction,
        }
      : null;

  return (
    <svg
      aria-hidden="true"
      className={svgClassName}
      height={height}
      preserveAspectRatio={preserveAspectRatio}
      viewBox={viewBox}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={pathClassName}
        d={path}
        fill="none"
        id={id}
        stroke={showPath ? "currentColor" : "none"}
      />

      <text fill="currentColor" textAnchor={textAnchor}>
        <textPath
          className={textClassName}
          href={`#${id}`}
          ref={(ref) => {
            if (ref) textPathRefs.current[0] = ref;
          }}
          startOffset="0%"
        >
          {animationProps ? (
            <animate attributeName="startOffset" {...animationProps} />
          ) : null}
          {text}
        </textPath>
      </text>

      {animationProps ? (
        <text fill="currentColor" textAnchor={textAnchor}>
          <textPath
            className={textClassName}
            href={`#${id}`}
            ref={(ref) => {
              if (ref) textPathRefs.current[1] = ref;
            }}
            startOffset="-100%"
          >
            <animate
              attributeName="startOffset"
              {...animationProps}
              from="-100%"
              to="0%"
            />
            {text}
          </textPath>
        </text>
      ) : null}
    </svg>
  );
}
