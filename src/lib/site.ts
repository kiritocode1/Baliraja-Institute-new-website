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
  website: "balirajaacademy.in",
  websiteHref: "https://balirajaacademy.in",
  contact: {
    address: "Gangapur, Dist. Chhatrapati Sambhajinagar, Maharashtra",
    phone: "+91 90979 74444",
    phoneHref: "tel:+919097974444",
    email: "balirajaca@gmail.com",
    emailHref: "mailto:balirajaca@gmail.com",
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
  { label: "Admission Process", href: "/#process" },
  { label: "Campus Gallery", href: "/#gallery" },
  { label: "Latest Updates", href: "/#updates" },
  { label: "Notices", href: "/#notices" },
  { label: "Insights", href: "/#blog" },
  { label: "Contact", href: "/#contact" },
];

export const socials: NavLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/balirajaacademy/" },
  { label: "WhatsApp", href: "https://wa.me/919097974444" },
];

export type ExamTrack = {
  code: string;
  title: string;
  blurb: string;
  /** Unsplash preview shown on hover in the exam-track list. */
  image: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

export const examTracks: ExamTrack[] = [
  {
    code: "01",
    title: "MPSC",
    blurb: "Rajyaseva, PSI, STI, ASO and combined group services, with integrated prelims and mains coverage.",
    image: unsplash("1561089489-f13d5e730d72"),
  },
  {
    code: "02",
    title: "UPSC Civil Services",
    blurb: "Foundation to mains mentoring in Marathi and English mediums, optional subject guidance, and answer writing.",
    image: unsplash("1513475382585-d06e58bcb0e0"),
  },
  {
    code: "03",
    title: "Banking & Insurance",
    blurb: "IBPS, SBI, RBI and allied recruitment, built around quantitative aptitude, reasoning and daily speed drills.",
    image: unsplash("1598981457915-aea220950616"),
  },
  {
    code: "04",
    title: "SSC & Railways",
    blurb: "CGL, CHSL, MTS and RRB tracks with sectional tests and a tier-wise practice calendar.",
    image: unsplash("1574130303188-31a915382726"),
  },
  {
    code: "05",
    title: "Police Bharti",
    blurb: "Written preparation paired with ground and physical-test guidance for constable and driver recruitment.",
    image: unsplash("1527822618093-743f3e57977c"),
  },
  {
    code: "06",
    title: "Talathi & ZP",
    blurb: "Talathi, Gram Sevak, Zilla Parishad and Saralseva exams, with district-specific current affairs.",
    image: unsplash("1606761568499-6d2451b23c66"),
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

/* ------------------------------------------------------------------ *
 *  Featured defence tracks — Army & Navy lead the exam list because
 *  these are the entries aspirants here care about most.
 * ------------------------------------------------------------------ */
export type FeaturedExam = {
  key: string;
  kicker: string;
  title: string;
  exams: string;
  blurb: string;
  image: string;
  alt: string;
};

export const featuredExams: FeaturedExam[] = [
  {
    key: "army",
    kicker: "Defence · most asked for",
    title: "Army",
    exams: "NDA · CDS · AFCAT · Agniveer GD & Technical · TGC",
    blurb:
      "Written coaching, physical preparation and SSB interview guidance for the National Defence Academy and Agniveer recruitment.",
    image: unsplash("1615482319206-d2545553676e"),
    alt: "An officer cadet on parade in ceremonial dress with the national tricolour sash",
  },
  {
    key: "navy",
    kicker: "Defence · most asked for",
    title: "Navy",
    exams: "INET · Agniveer SSR & MR · Coast Guard · NDA",
    blurb:
      "Aptitude, science and English preparation for Indian Navy Agniveer and Coast Guard entries, with timed mocks built to the latest pattern.",
    image: unsplash("1726450663094-b90adfeea0f8"),
    alt: "An Indian Navy warship under way on the open sea",
  },
];

/* Admission process steps (interactive stepper). */
export type AdmissionStep = { num: string; title: string; body: string };
export const admissionSteps: AdmissionStep[] = [
  {
    num: "01",
    title: "Send your enquiry",
    body: "Share your exam, your attempt and a number we can reach you on. It takes a minute and costs nothing.",
  },
  {
    num: "02",
    title: "Talk to a mentor",
    body: "Within two working days a mentor calls to understand your goal and recommend the right track and batch timing.",
  },
  {
    num: "03",
    title: "Sit a diagnostic test",
    body: "A short, no-pressure assessment shows your strong areas and the gaps, so the plan is built around you, not a template.",
  },
  {
    num: "04",
    title: "Choose your batch",
    body: "Weekday or weekend, Marathi or English medium, foundation or crash. We map a schedule to your life and your attempt date.",
  },
  {
    num: "05",
    title: "Confirm your seat",
    body: "Visit the campus, see the study hall, and complete enrolment. Fee concessions for farming and first-generation families apply here.",
  },
  {
    num: "06",
    title: "Begin your preparation",
    body: "Join your cohort, collect your test-series calendar and library access, and start the work that earns the result.",
  },
];

/* Campus-life gallery. */
export type GalleryImage = { src: string; alt: string; caption: string };
export const galleryImages: GalleryImage[] = [
  { src: unsplash("1561089489-f13d5e730d72"), alt: "A faculty member teaching a full lecture hall", caption: "The daily lecture" },
  { src: unsplash("1581726707445-75cbe4efc586"), alt: "Students seated and attentive in class", caption: "In the classroom" },
  { src: unsplash("1513475382585-d06e58bcb0e0"), alt: "A student reaching for a reference title", caption: "The reading hall" },
  { src: unsplash("1598981457915-aea220950616"), alt: "An aspirant working alone at a desk", caption: "Late hours" },
  { src: unsplash("1574130303188-31a915382726"), alt: "A small group studying together", caption: "Group study" },
  { src: unsplash("1535058489223-1331b20fa114"), alt: "A shelf of reference books", caption: "Reference library" },
  { src: unsplash("1606761568499-6d2451b23c66"), alt: "A mentor guiding a student one to one", caption: "One-to-one mentoring" },
  { src: unsplash("1604866830893-c13cafa515d5"), alt: "Open library shelves filled with books", caption: "Open shelves" },
];

/* Latest updates (news carousel). Sample copy; replace before launch. */
export type Update = { tag: string; title: string; date: string; image: string; href: string };
export const updates: Update[] = [
  {
    tag: "Admissions",
    title: "Enquiries open for the 2026 to 2027 batch",
    date: "June 2026",
    image: unsplash("1567057420215-0afa9aa9253a"),
    href: "/admissions",
  },
  {
    tag: "Defence",
    title: "New NDA and Agniveer foundation batch begins this monsoon",
    date: "July 2026",
    image: unsplash("1615482319206-d2545553676e"),
    href: "/#courses",
  },
  {
    tag: "Event",
    title: "Free SSB interview guidance camp for defence aspirants",
    date: "July 2026",
    image: unsplash("1726450663094-b90adfeea0f8"),
    href: "/#courses",
  },
  {
    tag: "Test Series",
    title: "UPSC prelims full-length series now open for registration",
    date: "August 2026",
    image: unsplash("1513475382585-d06e58bcb0e0"),
    href: "/admissions",
  },
  {
    tag: "Scholarship",
    title: "Merit fee concession for farming families announced",
    date: "August 2026",
    image: unsplash("1561089489-f13d5e730d72"),
    href: "/admissions",
  },
];

/* Notice board. Sample copy; replace before launch. */
export type Notice = { date: string; tag: string; title: string };
export const notices: Notice[] = [
  { date: "24 Jun 2026", tag: "Notice", title: "Admission enquiries open for the 2026 to 2027 academic year" },
  { date: "20 Jun 2026", tag: "Test Series", title: "MPSC Rajyaseva prelims test-series schedule released" },
  { date: "18 Jun 2026", tag: "Defence", title: "NDA and Agniveer doubt-clearing session this Sunday, 10 am" },
  { date: "12 Jun 2026", tag: "Notice", title: "Library timings extended to 9 pm through the exam season" },
  { date: "05 Jun 2026", tag: "Scholarship", title: "Concession forms for first-generation students now available" },
  { date: "28 May 2026", tag: "Result", title: "May full-length mock results are live on the student portal" },
];

/* Blog / insights. Sample copy; replace before launch. */
export type BlogPost = {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  href: string;
};
export const blogPosts: BlogPost[] = [
  {
    title: "Building a realistic MPSC timetable you will actually keep",
    excerpt: "A week-by-week method for covering the syllabus without burning out by the third month.",
    category: "Strategy",
    readTime: "6 min read",
    image: unsplash("1434030216411-0b793f4b4173"),
    href: "/#updates",
  },
  {
    title: "The SSB interview: what selectors are really looking for",
    excerpt: "Officer-like qualities are not a mystery. Here is how we prepare defence aspirants for the five-day assessment.",
    category: "Defence",
    readTime: "8 min read",
    image: unsplash("1585802540745-bb23da2d6246"),
    href: "/#updates",
  },
  {
    title: "Current affairs without the overwhelm: a daily method",
    excerpt: "Thirty focused minutes a day beats three frantic hours before the exam. Our reading and revision loop.",
    category: "Method",
    readTime: "5 min read",
    image: unsplash("1495446815901-a7297e633e8d"),
    href: "/#updates",
  },
];
