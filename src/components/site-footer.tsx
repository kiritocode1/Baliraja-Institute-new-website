import { getLocale, getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/brand-logo";
import { SlideUnderlineLink } from "@/components/links";
import { listCoursePages } from "@/lib/crm/course-pages";
import { localize } from "@/lib/i18n-content";
import { site, socials } from "@/lib/site";

type FooterColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

type FooterT = Awaited<ReturnType<typeof getTranslations<"Footer">>>;

async function buildColumns(t: FooterT): Promise<FooterColumn[]> {
  // Exam-track links come from published bharti course pages in the CRM.
  const courseLinks = (await listCoursePages())
    .filter((page) => page.status === "published" && page.division === "bharti")
    .slice(0, 5)
    .map((page) => ({ label: page.title, href: `/courses/${page.slug}` }));

  return [
    {
      heading: t("col.academy"),
      links: [
        { label: t("link.about"), href: "/about" },
        { label: t("link.studentLife"), href: "/student-life" },
        { label: t("link.whyBaliraja"), href: "/why-baliraja" },
        { label: t("link.facultyMentors"), href: "/about" },
      ],
    },
    {
      heading: t("col.examTracks"),
      links: [{ label: t("link.allCourses"), href: "/courses" }, ...courseLinks],
    },
    {
      heading: t("col.admissions"),
      links: [
        { label: t("link.enquireApply"), href: "/admissions" },
        { label: t("link.scholarships"), href: "/scholarships" },
        { label: t("link.testSeries"), href: "/news-events" },
        { label: t("link.visitCampus"), href: "/contact-us" },
      ],
    },
    {
      heading: t("col.stories"),
      links: [
        { label: t("link.newsNotices"), href: "/news-events" },
        { label: t("link.campusGallery"), href: "/gallery" },
        { label: t("link.adminPortal"), href: "/crm" },
        { label: t("link.contact"), href: "/contact-us" },
      ],
    },
  ];
}

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations("Footer");
  const s = localize(site, locale);
  const columns = await buildColumns(t);

  return (
    <footer
      id="contact"
      className="sticky bottom-0 z-0 bg-oxblood-deep text-cream"
    >
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        {/* Masthead */}
        <div className="flex flex-col gap-8 border-b border-cream/15 py-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-5">
            <BrandLogo className="w-36 shrink-0 sm:w-44" />
            <div>
              <p className="font-display text-xl leading-none">{s.longName}</p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.22em] text-cream-muted">
                {s.place} · {t("estd")} {site.established}
              </p>
            </div>
          </div>
          <p className="max-w-sm font-display text-2xl italic leading-snug text-cream/90">
            {s.motto}.
          </p>
        </div>

        {/* Link columns + contact */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-14 sm:grid-cols-3 lg:grid-cols-6">
          {columns.map((col) => (
            <nav
              key={col.heading}
              aria-label={col.heading}
              className="flex flex-col gap-4"
            >
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5 text-[0.95rem]">
                {col.links.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    <SlideUnderlineLink href={l.href}>
                      {l.label}
                    </SlideUnderlineLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label={t("connect")} className="flex flex-col gap-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
              {t("connect")}
            </p>
            <ul className="flex flex-col gap-2.5 text-[0.95rem]">
              {socials.map((l) => (
                <li key={l.label}>
                  <SlideUnderlineLink href={l.href}>
                    {l.label}
                  </SlideUnderlineLink>
                </li>
              ))}
            </ul>
          </nav>

          <address className="col-span-2 flex flex-col gap-4 not-italic sm:col-span-3 lg:col-span-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
              {t("visit")}
            </p>
            <p className="text-[0.95rem] leading-relaxed text-cream/85">
              {s.contact.address}
            </p>
            <div className="flex flex-col gap-1.5 text-[0.95rem]">
              <a
                href={site.contact.phoneHref}
                className="link-hover link-hover--slide"
              >
                {site.contact.phone}
              </a>
              <a
                href={site.contact.emailHref}
                className="link-hover link-hover--slide"
              >
                {site.contact.email}
              </a>
              <span className="text-cream-muted">{site.contact.hours}</span>
            </div>
          </address>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3 border-t border-cream/15 py-7 text-xs text-cream-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.longName}, {s.place}.{" "}
            {t("rightsReserved")}
          </p>
          <p className="uppercase tracking-[0.2em]">{s.motto}</p>
        </div>
      </div>
    </footer>
  );
}
