"use client";

import React, {
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import {
  type MotionStyle,
  type MotionValue,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { cn } from "@/lib/utils";

const wrap = (min: number, max: number, value: number): number => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

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

type SpringConfig = {
  damping?: number;
  mass?: number;
  restDelta?: number;
  restSpeed?: number;
  stiffness?: number;
};

type MarqueeItem = {
  child: React.ReactNode;
  itemIndex: number;
  key: string;
  repeatIndex: number;
};

interface PathItemProps {
  baseOffset: MotionValue<number>;
  calculateZIndex: (offsetDistance: number) => number | undefined;
  child: React.ReactNode;
  draggable: boolean;
  easing?: (value: number) => number;
  enableRollingZIndex: boolean;
  grabCursor: boolean;
  isHovered: React.MutableRefObject<boolean>;
  item: MarqueeItem;
  itemsLength: number;
  path: string;
}

function PathMarqueeItem({
  baseOffset,
  calculateZIndex,
  child,
  draggable,
  easing,
  enableRollingZIndex,
  grabCursor,
  isHovered,
  item,
  itemsLength,
  path,
}: PathItemProps) {
  const currentOffsetDistance = useMotionValue(0);
  const itemOffset = useTransform(baseOffset, (value) => {
    const position = (item.itemIndex * 100) / itemsLength;
    const wrappedValue = wrap(0, 100, value + position);
    const offset = easing ? easing(wrappedValue / 100) * 100 : wrappedValue;
    return `${offset}%`;
  });
  const zIndex = useTransform(currentOffsetDistance, calculateZIndex);

  useEffect(() => {
    return itemOffset.on("change", (value) => {
      const match = value.match(/^([\d.]+)%$/);
      if (match?.[1]) currentOffsetDistance.set(Number.parseFloat(match[1]));
    });
  }, [currentOffsetDistance, itemOffset]);

  return (
    <motion.div
      aria-hidden={item.repeatIndex > 0}
      className={cn(
        "absolute left-0 top-0 touch-none",
        draggable && grabCursor && "cursor-grab",
      )}
      key={item.key}
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
      }}
      style={
        {
          backfaceVisibility: "hidden",
          offsetDistance: itemOffset,
          offsetPath: `path('${path}')`,
          zIndex: enableRollingZIndex ? zIndex : undefined,
          willChange: "offset-distance",
        } as MotionStyle
      }
    >
      {child}
    </motion.div>
  );
}

interface MarqueeAlongSvgPathProps {
  baseVelocity?: number;
  children: React.ReactNode;
  className?: string;
  dragAwareDirection?: boolean;
  draggable?: boolean;
  dragSensitivity?: number;
  dragVelocityDecay?: number;
  direction?: "normal" | "reverse";
  easing?: (value: number) => number;
  enableRollingZIndex?: boolean;
  grabCursor?: boolean;
  height?: number | string;
  path: string;
  pathId?: string;
  preserveAspectRatio?: PreserveAspectRatio;
  repeat?: number;
  responsive?: boolean;
  scrollAwareDirection?: boolean;
  scrollContainer?: HTMLElement | RefObject<HTMLElement | null> | null;
  scrollSpringConfig?: SpringConfig;
  showPath?: boolean;
  slowDownFactor?: number;
  slowDownSpringConfig?: SpringConfig;
  slowdownOnHover?: boolean;
  useScrollVelocity?: boolean;
  viewBox?: string;
  width?: number | string;
  zIndexBase?: number;
  zIndexRange?: number;
}

export default function MarqueeAlongSvgPath({
  baseVelocity = 5,
  children,
  className,
  dragAwareDirection = false,
  draggable = false,
  dragSensitivity = 0.2,
  dragVelocityDecay = 0.96,
  direction = "normal",
  easing,
  enableRollingZIndex = true,
  grabCursor = false,
  height = "100%",
  path,
  pathId,
  preserveAspectRatio = "xMidYMid meet",
  repeat = 3,
  responsive = false,
  scrollAwareDirection = false,
  scrollContainer,
  scrollSpringConfig = { damping: 50, stiffness: 400 },
  showPath = false,
  slowDownFactor = 0.3,
  slowDownSpringConfig = { damping: 50, stiffness: 400 },
  slowdownOnHover = false,
  useScrollVelocity = false,
  viewBox = "0 0 100 100",
  width = "100%",
  zIndexBase = 1,
  zIndexRange = 10,
}: MarqueeAlongSvgPathProps) {
  const generatedId = useId();
  const container = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const baseOffset = useMotionValue(0);
  const reducedMotion = useReducedMotion();

  const scrollOptions =
    scrollContainer && "current" in scrollContainer
      ? { container: scrollContainer as RefObject<HTMLElement> }
      : undefined;
  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, scrollSpringConfig);
  const defaultVelocity = useMotionValue(1);
  const velocityFactor = useTransform(
    useScrollVelocity ? smoothVelocity : defaultVelocity,
    [0, 1000],
    [0, 5],
    { clamp: false },
  );

  const hoverFactorValue = useMotionValue(1);
  const smoothHoverFactor = useSpring(
    hoverFactorValue,
    slowDownSpringConfig,
  );
  const isHovered = useRef(false);
  const isDragging = useRef(false);
  const dragVelocity = useRef(0);
  const directionFactor = useRef(direction === "normal" ? 1 : -1);
  const lastPointerPosition = useRef({ x: 0, y: 0 });

  const items = useMemo<MarqueeItem[]>(() => {
    const childrenArray = React.Children.toArray(children);
    return childrenArray.flatMap((child, childIndex) =>
      Array.from({ length: repeat }, (_, repeatIndex) => {
        const itemIndex = repeatIndex * childrenArray.length + childIndex;
        return {
          child,
          itemIndex,
          key: `${childIndex}-${repeatIndex}`,
          repeatIndex,
        };
      }),
    );
  }, [children, repeat]);

  const id = pathId || `marquee-path-${generatedId.replace(/:/g, "")}`;

  const calculateZIndex = useCallback(
    (offsetDistance: number) => {
      if (!enableRollingZIndex) return undefined;
      return Math.floor(zIndexBase + (offsetDistance / 100) * zIndexRange);
    },
    [enableRollingZIndex, zIndexBase, zIndexRange],
  );

  useEffect(() => {
    if (!responsive) return;

    const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
    const originalWidth = vbWidth || 100;
    const originalHeight = vbHeight || 100;

    const updateScale = () => {
      const wrapper = container.current;
      const marqueeContainer = marqueeContainerRef.current;
      if (!wrapper || !marqueeContainer) return;

      const scale = Math.min(
        wrapper.clientWidth / originalWidth,
        wrapper.clientHeight / originalHeight,
      );
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      const offsetX = (wrapper.clientWidth - scaledWidth) / 2;
      const offsetY = (wrapper.clientHeight - scaledHeight) / 2;

      marqueeContainer.style.width = `${originalWidth}px`;
      marqueeContainer.style.height = `${originalHeight}px`;
      marqueeContainer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      marqueeContainer.style.transformOrigin = "top left";
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [responsive, viewBox]);

  useAnimationFrame((_, delta) => {
    if (reducedMotion && !isDragging.current) return;

    if (isDragging.current && draggable) {
      baseOffset.set(baseOffset.get() + dragVelocity.current);
      dragVelocity.current *= dragVelocityDecay;
      if (Math.abs(dragVelocity.current) < 0.01) dragVelocity.current = 0;
      return;
    }

    hoverFactorValue.set(
      isHovered.current && slowdownOnHover ? slowDownFactor : 1,
    );

    if (scrollAwareDirection && !isDragging.current) {
      if (velocityFactor.get() < 0) directionFactor.current = -1;
      else if (velocityFactor.get() > 0) directionFactor.current = 1;
    }

    let moveBy =
      directionFactor.current *
      baseVelocity *
      (delta / 1000) *
      smoothHoverFactor.get();

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    if (draggable) {
      moveBy += dragVelocity.current;

      if (dragAwareDirection && Math.abs(dragVelocity.current) > 0.1) {
        directionFactor.current = Math.sign(dragVelocity.current);
      }

      if (Math.abs(dragVelocity.current) > 0.01) {
        dragVelocity.current *= dragVelocityDecay;
      } else {
        dragVelocity.current = 0;
      }
    }

    baseOffset.set(baseOffset.get() + moveBy);
  });

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    if (grabCursor) event.currentTarget.style.cursor = "grabbing";

    isDragging.current = true;
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
    dragVelocity.current = 0;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || !isDragging.current) return;

    const deltaX = event.clientX - lastPointerPosition.current.x;
    const deltaY = event.clientY - lastPointerPosition.current.y;
    const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    dragVelocity.current = (deltaX > 0 ? delta : -delta) * dragSensitivity;
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isDragging.current = false;
    if (grabCursor) event.currentTarget.style.cursor = "grab";
  };

  return (
    <div
      className={cn("relative overflow-visible", className)}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={container}
    >
      <div
        className="relative overflow-visible"
        ref={marqueeContainerRef}
        style={{ contain: "layout style" }}
      >
        <svg
          className="h-full w-full overflow-visible"
          height={height}
          preserveAspectRatio={preserveAspectRatio}
          viewBox={viewBox}
          width={width}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={path}
            fill="none"
            id={id}
            stroke={showPath ? "currentColor" : "none"}
            strokeDasharray={showPath ? "8 12" : undefined}
            strokeLinecap="round"
            strokeWidth={showPath ? 1.4 : undefined}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {items.map((item) => (
          <PathMarqueeItem
            baseOffset={baseOffset}
            calculateZIndex={calculateZIndex}
            child={item.child}
            draggable={draggable}
            easing={easing}
            enableRollingZIndex={enableRollingZIndex}
            grabCursor={grabCursor}
            isHovered={isHovered}
            item={item}
            itemsLength={items.length}
            key={item.key}
            path={path}
          />
        ))}
      </div>
    </div>
  );
}
