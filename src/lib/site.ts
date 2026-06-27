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
    blurb:
      "Rajyaseva, PSI, STI, ASO and combined group services, with integrated prelims and mains coverage.",
    image: unsplash("1561089489-f13d5e730d72"),
  },
  {
    code: "02",
    title: "UPSC Civil Services",
    blurb:
      "Foundation to mains mentoring in Marathi and English mediums, optional subject guidance, and answer writing.",
    image: unsplash("1513475382585-d06e58bcb0e0"),
  },
  {
    code: "03",
    title: "Banking & Insurance",
    blurb:
      "IBPS, SBI, RBI and allied recruitment, built around quantitative aptitude, reasoning and daily speed drills.",
    image: unsplash("1598981457915-aea220950616"),
  },
  {
    code: "04",
    title: "SSC & Railways",
    blurb:
      "CGL, CHSL, MTS and RRB tracks with sectional tests and a tier-wise practice calendar.",
    image: unsplash("1574130303188-31a915382726"),
  },
  {
    code: "05",
    title: "Police Bharti",
    blurb:
      "Written preparation paired with ground and physical-test guidance for constable and driver recruitment.",
    image: unsplash("1527822618093-743f3e57977c"),
  },
  {
    code: "06",
    title: "Talathi & ZP",
    blurb:
      "Talathi, Gram Sevak, Zilla Parishad and Saralseva exams, with district-specific current affairs.",
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
  {
    src: unsplash("1561089489-f13d5e730d72"),
    alt: "A faculty member teaching a full lecture hall",
    caption: "The daily lecture",
  },
  {
    src: unsplash("1581726707445-75cbe4efc586"),
    alt: "Students seated and attentive in class",
    caption: "In the classroom",
  },
  {
    src: unsplash("1513475382585-d06e58bcb0e0"),
    alt: "A student reaching for a reference title",
    caption: "The reading hall",
  },
  {
    src: unsplash("1598981457915-aea220950616"),
    alt: "An aspirant working alone at a desk",
    caption: "Late hours",
  },
  {
    src: unsplash("1574130303188-31a915382726"),
    alt: "A small group studying together",
    caption: "Group study",
  },
  {
    src: unsplash("1535058489223-1331b20fa114"),
    alt: "A shelf of reference books",
    caption: "Reference library",
  },
  {
    src: unsplash("1606761568499-6d2451b23c66"),
    alt: "A mentor guiding a student one to one",
    caption: "One-to-one mentoring",
  },
  {
    src: unsplash("1604866830893-c13cafa515d5"),
    alt: "Open library shelves filled with books",
    caption: "Open shelves",
  },
];

/* Latest updates (news carousel). Sample copy; replace before launch. */
export type Update = {
  tag: string;
  title: string;
  date: string;
  image: string;
  href: string;
};
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
  {
    date: "24 Jun 2026",
    tag: "Notice",
    title: "Admission enquiries open for the 2026 to 2027 academic year",
  },
  {
    date: "20 Jun 2026",
    tag: "Test Series",
    title: "MPSC Rajyaseva prelims test-series schedule released",
  },
  {
    date: "18 Jun 2026",
    tag: "Defence",
    title: "NDA and Agniveer doubt-clearing session this Sunday, 10 am",
  },
  {
    date: "12 Jun 2026",
    tag: "Notice",
    title: "Library timings extended to 9 pm through the exam season",
  },
  {
    date: "05 Jun 2026",
    tag: "Scholarship",
    title: "Concession forms for first-generation students now available",
  },
  {
    date: "28 May 2026",
    tag: "Result",
    title: "May full-length mock results are live on the student portal",
  },
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
    excerpt:
      "A week-by-week method for covering the syllabus without burning out by the third month.",
    category: "Strategy",
    readTime: "6 min read",
    image: unsplash("1434030216411-0b793f4b4173"),
    href: "/#updates",
  },
  {
    title: "The SSB interview: what selectors are really looking for",
    excerpt:
      "Officer-like qualities are not a mystery. Here is how we prepare defence aspirants for the five-day assessment.",
    category: "Defence",
    readTime: "8 min read",
    image: unsplash("1585802540745-bb23da2d6246"),
    href: "/#updates",
  },
  {
    title: "Current affairs without the overwhelm: a daily method",
    excerpt:
      "Thirty focused minutes a day beats three frantic hours before the exam. Our reading and revision loop.",
    category: "Method",
    readTime: "5 min read",
    image: unsplash("1495446815901-a7297e633e8d"),
    href: "/#updates",
  },
];

export type ProofStat = {
  value: string;
  label: string;
  note: string;
};

export const proofStats: ProofStat[] = [
  {
    value: "2009",
    label: "Established in Gangapur",
    note: "A long-running local academy built around competitive exam preparation.",
  },
  {
    value: "6",
    label: "Core exam tracks",
    note: "Civil services, defence, banking, SSC, police, Talathi and ZP preparation.",
  },
  {
    value: "12h",
    label: "Study-day culture",
    note: "Lecture, reading, revision, current affairs and mock practice in one rhythm.",
  },
  {
    value: "1:1",
    label: "Mentor reviews",
    note: "Attempt planning and answer-review conversations for serious aspirants.",
  },
];

export type CampusLifeItem = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  href?: string;
};

export const campusLifeItems: CampusLifeItem[] = [
  {
    eyebrow: "Reading hall",
    title: "A quiet place to keep showing up",
    body: "Long benches, reference books and a study culture shaped for students who need disciplined hours away from home distractions.",
    image: unsplash("1513475382585-d06e58bcb0e0"),
    href: "/student-life",
  },
  {
    eyebrow: "Daily lectures",
    title: "Syllabus split into workable blocks",
    body: "Faculty-led classes convert large exam syllabi into weekly targets, revision loops and testable outcomes.",
    image: unsplash("1561089489-f13d5e730d72"),
    href: "/courses",
  },
  {
    eyebrow: "Test series",
    title: "Mock pressure before exam pressure",
    body: "Timed tests, rank sheets and hand-reviewed answers help aspirants understand speed, accuracy and presentation.",
    image: unsplash("1434030216411-0b793f4b4173"),
    href: "/news-events",
  },
  {
    eyebrow: "Defence practice",
    title: "Written, physical and interview prep",
    body: "Army and Navy aspirants get written preparation alongside physical-test guidance and SSB orientation.",
    image: unsplash("1615482319206-d2545553676e"),
    href: "/courses",
  },
  {
    eyebrow: "Mentoring",
    title: "A plan for the attempt in front of you",
    body: "Mentors help students choose the right batch, medium, timetable and test strategy based on their current level.",
    image: unsplash("1606761568499-6d2451b23c66"),
    href: "/about",
  },
  {
    eyebrow: "Community",
    title: "A cohort that keeps the pace",
    body: "Students preparing for similar exams learn together, discuss current affairs and keep each other accountable.",
    image: unsplash("1574130303188-31a915382726"),
    href: "/student-life",
  },
];

export type SupportPoint = {
  title: string;
  body: string;
};

export const supportPoints: SupportPoint[] = [
  {
    title: "Attempt planning",
    body: "Students map syllabus coverage, revision windows and mock-test timing around their real exam calendar.",
  },
  {
    title: "Current affairs discipline",
    body: "Daily newspaper, state-level updates and revision notes keep preparation connected to the latest exam patterns.",
  },
  {
    title: "Library and reference access",
    body: "Reference material, previous papers and focused reading hours support students who need a serious study base.",
  },
  {
    title: "Family-aware counselling",
    body: "Fee concessions and practical guidance are handled with sensitivity for farming and first-generation families.",
  },
];

export type StudentVoice = {
  name: string;
  track: string;
  quote: string;
  image: string;
};

export const studentVoices: StudentVoice[] = [
  {
    name: "MPSC foundation aspirant",
    track: "Rajyaseva track",
    quote:
      "The weekly test review showed me where I was losing marks, not just what I had studied.",
    image: unsplash("1598981457915-aea220950616"),
  },
  {
    name: "Defence aspirant",
    track: "NDA and Agniveer",
    quote:
      "Written practice, physical targets and interview preparation were treated as one plan.",
    image: unsplash("1615482319206-d2545553676e"),
  },
  {
    name: "Banking student",
    track: "IBPS and SBI",
    quote:
      "Speed drills helped me stop guessing and start solving sections in the right order.",
    image: unsplash("1567057420215-0afa9aa9253a"),
  },
  {
    name: "Rural first-generation student",
    track: "Talathi and ZP",
    quote:
      "The study hall and simple guidance made it possible to prepare seriously from Gangapur.",
    image: unsplash("1606761568499-6d2451b23c66"),
  },
];

export type ScholarshipProgram = {
  title: string;
  audience: string;
  body: string;
  tags: string[];
};

export const scholarshipPrograms: ScholarshipProgram[] = [
  {
    title: "Baliraja farming-family concession",
    audience: "Farming and first-generation families",
    body: "Need-aware concessions for students whose preparation depends on making coaching fees manageable.",
    tags: ["Need aware", "Rural students", "Interview required"],
  },
  {
    title: "Merit test concession",
    audience: "High-performing aspirants",
    body: "Fee support based on diagnostic performance, past academic record and seriousness of preparation.",
    tags: ["Merit", "Diagnostic test", "Batch limited"],
  },
  {
    title: "Defence preparation support",
    audience: "Army and Navy aspirants",
    body: "Guidance support for students preparing for NDA, CDS, Agniveer and related defence entries.",
    tags: ["Defence", "Physical test", "SSB guidance"],
  },
  {
    title: "Restart scholarship",
    audience: "Repeat-attempt students",
    body: "Reduced-fee support for students who need a corrected plan after an unsuccessful attempt.",
    tags: ["Repeat attempt", "Mentor review", "Mock analysis"],
  },
];
