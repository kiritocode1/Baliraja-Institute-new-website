/**
 * Single source of truth for Baliraja Institute site content.
 * Edit copy, links, and contact details here; header, overlay menu,
 * and footer all read from this module.
 */

export const site = {
  name: "Baliraja Institute",
  longName: "Baliraja Institute Career Academy",
  place: "Gangapur",
  motto: "To Educate and To Serve",
  established: "2009",
  contact: {
    address: "Station Road, Gangapur, Dist. Chhatrapati Sambhajinagar, Maharashtra 431109",
    phone: "+91 98XXX XXXXX",
    phoneHref: "tel:+9198000000000",
    email: "admissions@baliraja-academy.in",
    emailHref: "mailto:admissions@baliraja-academy.in",
    hours: "Mon to Sat, 8:00 to 20:00",
  },
} as const;

export type NavLink = { label: string; href: string };

/** Top-bar primary links (desktop, inline). */
export const primaryNav: NavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Courses", href: "/#courses" },
  { label: "Results", href: "/#record" },
  { label: "Admissions", href: "/admissions" },
];

/** Overlay menu — large primary destinations. */
export const overlayPrimary: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About the Academy", href: "/#about" },
  { label: "Exam Tracks", href: "/#courses" },
  { label: "Our Record", href: "/#record" },
  { label: "Admissions", href: "/admissions" },
];

/** Overlay menu — secondary destinations. */
export const overlaySecondary: NavLink[] = [
  { label: "Why Baliraja", href: "/#why" },
  { label: "Faculty & Mentors", href: "/#about" },
  { label: "Test Series", href: "/#courses" },
  { label: "Scholarships", href: "/admissions" },
  { label: "Contact", href: "/#contact" },
];

export const socials: NavLink[] = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "WhatsApp", href: "#" },
];

export type ExamTrack = {
  code: string;
  title: string;
  blurb: string;
};

export const examTracks: ExamTrack[] = [
  {
    code: "01",
    title: "MPSC",
    blurb: "Rajyaseva, PSI, STI, ASO and combined group services, with integrated prelims and mains coverage.",
  },
  {
    code: "02",
    title: "UPSC Civil Services",
    blurb: "Foundation to mains mentoring in Marathi and English mediums, optional subject guidance, and answer writing.",
  },
  {
    code: "03",
    title: "Banking & Insurance",
    blurb: "IBPS, SBI, RBI and allied recruitment, built around quantitative aptitude, reasoning and daily speed drills.",
  },
  {
    code: "04",
    title: "SSC & Railways",
    blurb: "CGL, CHSL, MTS and RRB tracks with sectional tests and a tier-wise practice calendar.",
  },
  {
    code: "05",
    title: "Police Bharti",
    blurb: "Written preparation paired with ground and physical-test guidance for constable and driver recruitment.",
  },
  {
    code: "06",
    title: "Talathi & ZP",
    blurb: "Talathi, Gram Sevak, Zilla Parishad and Saralseva exams, with district-specific current affairs.",
  },
];

export type Pillar = { num: string; title: string; body: string };

export const pillars: Pillar[] = [
  {
    num: "01",
    title: "Educate",
    body: "Structured batches, a year-long study calendar, a stocked reading hall and current-affairs sessions that turn syllabus into understanding, not rote.",
  },
  {
    num: "02",
    title: "Mentor",
    body: "Small cohorts, weekly answer-writing review and one-to-one strategy so every aspirant has a mentor who knows their name and their attempt history.",
  },
  {
    num: "03",
    title: "Serve",
    body: "Fee concessions for farming and first-generation families, and free guidance camps in surrounding villages. The name Baliraja is a promise to the land we come from.",
  },
];

/** Qualitative proof points. No fabricated counts; replace bracketed
 *  figures with your verified numbers before launch. */
export const whyPoints: string[] = [
  "A faculty drawn from serving and retired officers who have cleared these very exams.",
  "A full-length test series modelled on the latest MPSC and UPSC patterns, evaluated by hand.",
  "A quiet, long-hours study hall and reference library, open six days a week.",
  "Hostel and mess guidance for students arriving from across Marathwada.",
];
