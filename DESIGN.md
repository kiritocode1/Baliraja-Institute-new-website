# DESIGN.md — Baliraja Institute design system

Tokens live in `src/app/globals.css` (`:root` + `@theme inline`). Shared content
(nav, exam tracks, contact, copy) lives in `src/lib/site.ts`. Use the brand utility
classes (`bg-oxblood`, `text-cream`, `border-line`, `text-brass-deep`, …) rather than
raw hex anywhere.

## Color — strategy: Committed
Deep oxblood carries the feature surfaces; parchment is the ground; brass is the
single accent. OKLCH, neutrals tinted warm. Never `#000`/`#fff`.

| Token | OKLCH | Role |
|---|---|---|
| `--parchment` | `0.957 0.013 83` | page ground, light sections |
| `--parchment-deep` | `0.927 0.019 80` | alternating light section (exam tracks) |
| `--oxblood` | `0.33 0.105 25` | primary maroon surface, buttons |
| `--oxblood-deep` | `0.245 0.072 25` | footer, overlay base, hero grade |
| `--oxblood-bright` | `0.42 0.13 27` | hover, overlay panel |
| `--maroon-mid` | `0.37 0.12 26` | overlay panel |
| `--brass` | `0.705 0.095 76` | accent, primary CTA on dark, overlay flash |
| `--brass-bright` | `0.80 0.105 82` | brass hover / numerals on maroon |
| `--brass-deep` | `0.55 0.088 70` | brass text/markers on parchment (contrast) |
| `--ink` | `0.255 0.022 40` | body text on parchment |
| `--ink-soft` | `0.462 0.022 45` | secondary text on parchment |
| `--cream` | `0.955 0.015 84` | text on maroon |
| `--cream-muted` | `0.80 0.035 72` | secondary text on maroon |
| `--line` / `--line-strong` | `0.86 / 0.78 0.02 78` | hairlines on parchment |

Section rhythm: `dark video → maroon → parchment → parchment-deep → maroon → parchment → dark maroon footer`.

## Typography — magazine shape
- **Display** (`--font-display`, `font-display`): **Spectral** (serif), weights 300–600,
  used at huge `clamp()` sizes with `-0.02em` tracking for headings, the motto, and
  overlay primary links.
- **Body/UI** (`--font-body`, default `font-sans`): **Hanken Grotesk** (variable
  grotesque). Uppercase + `0.14–0.28em` tracking for kickers and labels.
- Both self-hosted via `next/font/google`. Headings default to `font-weight: 400`.
- Measure capped with `max-w-prose` / `max-w-xl`. Heading scale steps ≥ 1.25.

## Layout & spacing
- Page max width `100rem`, gutters `px-5` (mobile) → `sm:px-8`.
- Section vertical rhythm `py-24` → `sm:py-32`; varied, never uniform.
- Left-aligned, asymmetric (`auto_1fr` label/heading grids). No centered icon-card stacks.
- Radius is tight (`--radius: 0.25rem`) — institutional, not bubbly. Cards avoided;
  imagery uses bare aspect-ratio frames, lists use hairline separators.

## Components (reusable)
- `components/links.tsx` — `SvgUnderlineLink` (SVG line draws in on hover, top-bar),
  `SlideUnderlineLink` (the `.link-hover--slide` spec, menu/footer).
- `components/reveal-text.tsx` — `RevealText`: wraps `ui/kinetic-text-reveal` and drives
  its `play()` handle from a `useInView` gate (`immediate` for above-the-fold).
- `components/ui/kinetic-text-reveal.tsx` — installed via
  `pnpm dlx shadcn@latest add @componentry/kinetic-text-reveal` (framer-motion).
- `components/site-header.tsx` — top bar + GSAP overlay menu (4 `scaleY` curtain panels,
  clip-path reveal, `SplitText` masked line-stagger). Scroll-aware light/solid switch.
- `components/site-footer.tsx` — mega-menu footer with contact row.
- `components/enquiry-form.tsx` + `app/admissions/actions.ts` — React 19 `useActionState`
  form with a validated server action (local `.data/enquiries.jsonl` sink; wire to
  email/CRM/DB in production).

## Motion
- Easing: `power3.inOut` (GSAP curtain), `power3.out` (line rise), and
  `cubic-bezier(0.16,1,0.3,1)` (ease-out-expo) for CSS. No bounce/elastic.
- Only transforms/opacity/clip-path/filter are animated — never layout properties.
- `prefers-reduced-motion`: marquee stops, overlay opens instantly, kinetic reveals
  resolve to plain visible text. Always test it.

## Imagery
Self-hosted in `/public`: `hero.mp4` (+ `hero-poster.jpg`), `img-classroom.jpg`,
`img-reading.jpg`, `img-study.jpg`, `img-books.jpg`. Warm-toned to sit with maroon.
Hero video is graded with a maroon gradient for legible cream text. Swap these for
real Baliraja photography (campus, faculty, study hall, selected students) before launch.
Logo: `/public/baliraja-logo.svg`, shown in a framed cream box on dark surfaces.
