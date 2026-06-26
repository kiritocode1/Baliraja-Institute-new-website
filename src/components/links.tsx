import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Top-bar link with an SVG line that draws in on hover.
 * pathLength={1} normalises the stroke so dasharray/​dashoffset = 1
 * always equals the full length regardless of width.
 */
export function SvgUnderlineLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("svg-underline", className)}>
      <span>{children}</span>
      <svg viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0.5 4 C 28 1.5, 72 1.5, 99.5 4" pathLength={1} />
      </svg>
    </Link>
  );
}

/** Sliding underline link (provided spec). Works for internal and hash links. */
export function SlideUnderlineLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("link-hover link-hover--slide", className)}
    >
      {children}
    </Link>
  );
}
