/**
 * Single source of truth for Baliraja Institute site content.
 * Edit copy, links, and contact details here; header, overlay menu,
 * and footer all read from this module.
 */

import { getAssetUrl } from "./assets";

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
export type NavGroup = {
  heading: string;
  body: string;
  links: NavLink[];
};

/** Top-bar primary links (desktop, inline). */
export const primaryNav: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Student Life", href: "/student-life" },
  { label: "Courses", href: "/courses" },
  { label: "Admissions", href: "/admissions" },
];

/** Overlay menu groups: fewer choices first, detailed paths second. */
export const overlayNavGroups: NavGroup[] = [
  {
    heading: "Academy",
    body: "Know the people, place, and promise.",
    links: [
      { label: "Home", href: "/" },
      { label: "About Baliraja", href: "/about" },
      { label: "Why Baliraja", href: "/why-baliraja" },
      { label: "Campus Gallery", href: "/gallery" },
    ],
  },
  {
    heading: "Learning",
    body: "Find the course path, student rhythm, and updates.",
    links: [
      { label: "All Courses", href: "/courses" },
      { label: "Student Life", href: "/student-life" },
      { label: "News & Notices", href: "/news-events" },
      { label: "Student Portal", href: "/student/login" },
    ],
  },
  {
    heading: "Join",
    body: "Start the conversation with the office.",
    links: [
      { label: "Admissions", href: "/admissions" },
      { label: "Scholarships", href: "/scholarships" },
      { label: "Contact", href: "/contact-us" },
      { label: "Admin Portal", href: "/crm" },
    ],
  },
];

export const socials: NavLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/balirajaacademy/" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/balirajacareeeracademy/",
  },
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
    image: getAssetUrl("/home/exam-mpsc.webp"),
  },
  {
    code: "02",
    title: "UPSC Civil Services",
    blurb:
      "Foundation to mains mentoring in Marathi and English mediums, optional subject guidance, and answer writing.",
    image: getAssetUrl("/home/exam-upsc.jpg"),
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
    image: getAssetUrl("/home/exam-railways.webp"),
  },
  {
    code: "05",
    title: "Police Bharti",
    blurb:
      "Written preparation paired with ground and physical-test guidance for constable and driver recruitment.",
    image: getAssetUrl("/home/exam-police-bharati.webp"),
  },
  {
    code: "06",
    title: "Talathi & ZP",
    blurb:
      "Talathi, Gram Sevak, Zilla Parishad and Saralseva exams, with district-specific current affairs.",
    image: getAssetUrl("/home/exam-zp.jpeg"),
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
    image: getAssetUrl("/home/exam-army.webp"),
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

/* Campus and university context. Add new entries here as the institute collects
 * more real photographs, parent-facing notes, or nearby-university context. */
export type AcademyContextItem = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  href?: string;
};

export const academyContextItems: AcademyContextItem[] = [
  {
    eyebrow: "Academy",
    title: "A working place for serious attempts",
    body: "Baliraja is presented as a real study environment: classrooms, reading hours, mentor conversations and a practical admission path.",
    image: getAssetUrl("/home/con-A-working-place-for-serious-attempts.jpg"),
    alt: "Baliraja Institute classroom prepared for a competitive exam lecture",
    href: "/about",
  },
  {
    eyebrow: "University route",
    title: "Guidance for students planning the next step",
    body: "Students and families can add university, eligibility, documents and career-path information here as those pages grow.",
    image: getAssetUrl(
      "/home/con-Guidance-for-students-planning-the-next-step.png",
    ),
    alt: "Students walking toward an institutional campus building",
    href: "/student-life",
  },
  {
    eyebrow: "Study base",
    title: "Reading, revision and reference material",
    body: "Use this block for reading-hall details, library photographs, book lists, newspaper practice and daily study routines.",
    image: "/img-books.jpg",
    alt: "Reference books and notes for Baliraja Institute students",
    href: "/student-life",
  },
  {
    eyebrow: "Gallery",
    title: "Keep adding real moments",
    body: "The gallery below is data-driven. Drop in new campus, classroom, event, library or university-visit images and update the array.",
    image: getAssetUrl("/home/con-Keep-adding-real-moments.JPG"),
    alt: "A student writing notes during exam preparation",
    href: "/gallery",
  },
];

/* Campus-life gallery. Prefer local/public images first; replace or append as
 * real academy/gallery photographs become available. */
export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  type?: "image" | "video";
  aspect?: "vertical" | "horizontal";
};
export const galleryImages: GalleryImage[] = [
  {
    src: getAssetUrl("/home/camp-v1.mov"),
    alt: "Baliraja campus video 1",
    caption: "Campus rhythm",
    type: "video",
    aspect: "vertical",
  },
  {
    src: getAssetUrl("/home/camp-v2.mov"),
    alt: "Baliraja campus video 2",
    caption: "Active library",
    type: "video",
    aspect: "vertical",
  },
  {
    src: getAssetUrl("/home/camp-v3.mp4"),
    alt: "Baliraja campus video 3",
    caption: "Classroom debate",
    type: "video",
    aspect: "vertical",
  },
  {
    src: getAssetUrl("/home/camp-v4.mp4"),
    alt: "Baliraja campus video 4",
    caption: "Mentor review",
    type: "video",
    aspect: "vertical",
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
    href: "/courses",
  },
  {
    tag: "Event",
    title: "Free SSB interview guidance camp for defence aspirants",
    date: "July 2026",
    image: unsplash("1726450663094-b90adfeea0f8"),
    href: "/news-events",
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
    href: "/scholarships",
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
    href: "/news-events",
  },
  {
    title: "The SSB interview: what selectors are really looking for",
    excerpt:
      "Officer-like qualities are not a mystery. Here is how we prepare defence aspirants for the five-day assessment.",
    category: "Defence",
    readTime: "8 min read",
    image: unsplash("1585802540745-bb23da2d6246"),
    href: "/news-events",
  },
  {
    title: "Current affairs without the overwhelm: a daily method",
    excerpt:
      "Thirty focused minutes a day beats three frantic hours before the exam. Our reading and revision loop.",
    category: "Method",
    readTime: "5 min read",
    image: unsplash("1495446815901-a7297e633e8d"),
    href: "/news-events",
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

export type ExperiencePath = {
  kicker: string;
  title: string;
  body: string;
  href: string;
  image: string;
};

export const preparationExperiences: ExperiencePath[] = [
  {
    kicker: "Classes",
    title: "Understand the syllabus before you chase it",
    body: "Daily lectures break large exam demands into teachable blocks, revision loops and weekly targets.",
    href: "/courses",
    image: unsplash("1561089489-f13d5e730d72"),
  },
  {
    kicker: "Study hall",
    title: "A place where the hours become possible",
    body: "Quiet desks, reference books and a serious room help students study beyond the lecture timetable.",
    href: "/student-life",
    image: unsplash("1513475382585-d06e58bcb0e0"),
  },
  {
    kicker: "Testing",
    title: "Know your score before the exam tells you",
    body: "Full-length mocks, answer review and rank sheets make progress visible while there is still time to correct it.",
    href: "/news-events",
    image: unsplash("1434030216411-0b793f4b4173"),
  },
  {
    kicker: "Mentoring",
    title: "A plan shaped around your attempt",
    body: "Mentors help students choose medium, batch pace, exam route and revision strategy without wasting months.",
    href: "/about",
    image: unsplash("1606761568499-6d2451b23c66"),
  },
];

export type DiscoveryStep = {
  label: string;
  title: string;
  body: string;
};

export const admissionsDiscoverySteps: DiscoveryStep[] = [
  {
    label: "01",
    title: "Your background",
    body: "We ask about your exam, education, language comfort, attempt history and the time you can realistically give.",
  },
  {
    label: "02",
    title: "Your current level",
    body: "A diagnostic test or mentor conversation shows where you are strong and where the first month must focus.",
  },
  {
    label: "03",
    title: "Your support needs",
    body: "Fee concessions, hostel and mess guidance, study-hall timing and family questions are discussed before joining.",
  },
  {
    label: "04",
    title: "Your batch route",
    body: "You leave with a recommended batch, test calendar and next action instead of a generic brochure.",
  },
];

export type GuideCta = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  points: string[];
  primary: NavLink;
  secondary: NavLink;
};

export const preparationGuide: GuideCta = {
  eyebrow: "Preparation guide",
  title: "Is Baliraja right for this attempt?",
  body: "Use the enquiry call like a counselling session. Bring the exam you want, your attempt date, your weak areas and any fee or travel questions.",
  image: unsplash("1495446815901-a7297e633e8d"),
  imageAlt: "Open notes and books arranged for a competitive exam study plan",
  points: [
    "Which exam track should come first",
    "How many months your current level needs",
    "Which batch timing fits your routine",
    "What fee support or visit documents to ask about",
  ],
  primary: { label: "Start the enquiry", href: "/admissions" },
  secondary: { label: "Call the office", href: site.contact.phoneHref },
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const admissionsFaqs: FaqItem[] = [
  {
    question: "Do I need to know my exact exam before enquiring?",
    answer:
      "No. Share the broad direction, such as MPSC, defence, banking or police. A mentor can help narrow the track after understanding your level and timeline.",
  },
  {
    question: "Can parents visit before admission?",
    answer:
      "Yes. Families can visit the campus, see the reading hall, discuss fees and ask practical questions before confirming a seat.",
  },
  {
    question: "Is there Marathi and English-medium support?",
    answer:
      "Batch recommendations consider language comfort. Students can ask about Marathi and English-medium guidance during the mentor call.",
  },
  {
    question: "How are scholarships or fee concessions decided?",
    answer:
      "Concessions are handled through a practical review of need, seriousness, diagnostic performance and available seats in the relevant batch.",
  },
  {
    question: "Can I join only the test series?",
    answer:
      "Yes, depending on the exam and current schedule. Ask for the test-series calendar when you enquire.",
  },
];

export const studentLifeFaqs: FaqItem[] = [
  {
    question: "How long can students use the study hall?",
    answer:
      "Study-hall access is built around the academy timetable, with extended hours during exam season when announced on the notice board.",
  },
  {
    question: "Is hostel or mess support provided?",
    answer:
      "Baliraja guides outstation students toward practical hostel and mess options near the academy, especially for students coming from villages around Marathwada.",
  },
  {
    question: "How often do students get feedback?",
    answer:
      "Mock tests, answer review and mentor conversations give students regular feedback on accuracy, speed, presentation and revision discipline.",
  },
  {
    question: "Do defence students get physical-test guidance?",
    answer:
      "Army and Navy aspirants can ask for written preparation, physical-test targets and SSB orientation as part of one preparation route.",
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
