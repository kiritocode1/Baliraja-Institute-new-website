/**
 * Baliraja Institute crest — clean single-colour line-art that inherits
 * `currentColor` (white on dark, ink on light), so it never carries a
 * background box. A shield holding a rising sun over an open book:
 * education, and the dawn the Baliraja name promises.
 */
export function BalirajaCrest({
  className,
  title = "Baliraja Institute crest",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 80 96"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={title}
    >
      {/* Shield */}
      <path
        d="M14 11 H66 V46 C66 68 50 84 40 88 C30 84 14 68 14 46 Z"
        strokeWidth={3}
      />
      {/* Sun rays */}
      <path d="M40 17 V21" />
      <path d="M29 22 L31.5 25.5" />
      <path d="M51 22 L48.5 25.5" />
      <path d="M23 30 L26.5 31.5" />
      <path d="M57 30 L53.5 31.5" />
      {/* Rising sun + horizon */}
      <path d="M30 36 A10 10 0 0 1 50 36" />
      <path d="M26 36 H54" />
      {/* Open book */}
      <path d="M40 52 C34 48.5 27 48.5 24 51.5 L24 64 C27 61 34 61 40 64 Z" />
      <path d="M40 52 C46 48.5 53 48.5 56 51.5 L56 64 C53 61 46 61 40 64 Z" />
    </svg>
  );
}
