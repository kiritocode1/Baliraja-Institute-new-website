import { BalirajaCrest } from "@/components/baliraja-crest";
import { SlideUnderlineLink } from "@/components/links";
import { site, examTracks, socials } from "@/lib/site";

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Academy",
    links: [
      { label: "About", href: "/#about" },
      { label: "Why Baliraja", href: "/#why" },
      { label: "Our Record", href: "/#record" },
      { label: "Faculty & Mentors", href: "/#about" },
    ],
  },
  {
    heading: "Exam Tracks",
    links: examTracks.map((t) => ({ label: t.title, href: "/#courses" })),
  },
  {
    heading: "Admissions",
    links: [
      { label: "Enquire & Apply", href: "/admissions" },
      { label: "Test Series", href: "/#courses" },
      { label: "Scholarships", href: "/admissions" },
      { label: "Visit the Campus", href: "/#contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="bg-oxblood-deep text-cream"
    >
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        {/* Masthead */}
        <div className="flex flex-col gap-8 border-b border-cream/15 py-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center border border-cream/30 px-2.5 py-2">
              <BalirajaCrest className="h-10 w-auto text-cream" />
            </span>
            <div>
              <p className="font-display text-xl leading-none">
                {site.longName}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.22em] text-cream-muted">
                {site.place} · Estd. {site.established}
              </p>
            </div>
          </div>
          <p className="max-w-sm font-display text-2xl italic leading-snug text-cream/90">
            {site.motto}.
          </p>
        </div>

        {/* Link columns + contact */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5 text-[0.95rem]">
                {col.links.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    <SlideUnderlineLink href={l.href}>{l.label}</SlideUnderlineLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Connect" className="flex flex-col gap-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
              Connect
            </p>
            <ul className="flex flex-col gap-2.5 text-[0.95rem]">
              {socials.map((l) => (
                <li key={l.label}>
                  <SlideUnderlineLink href={l.href}>{l.label}</SlideUnderlineLink>
                </li>
              ))}
            </ul>
          </nav>

          <address className="col-span-2 flex flex-col gap-4 not-italic sm:col-span-3 lg:col-span-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
              Visit
            </p>
            <p className="text-[0.95rem] leading-relaxed text-cream/85">
              {site.contact.address}
            </p>
            <div className="flex flex-col gap-1.5 text-[0.95rem]">
              <a href={site.contact.phoneHref} className="link-hover link-hover--slide">
                {site.contact.phone}
              </a>
              <a href={site.contact.emailHref} className="link-hover link-hover--slide">
                {site.contact.email}
              </a>
              <span className="text-cream-muted">{site.contact.hours}</span>
            </div>
          </address>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3 border-t border-cream/15 py-7 text-xs text-cream-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.longName}, {site.place}. All rights reserved.
          </p>
          <p className="uppercase tracking-[0.2em]">{site.motto}</p>
        </div>
      </div>
    </footer>
  );
}
