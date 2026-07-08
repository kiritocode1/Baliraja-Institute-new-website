/**
 * Single source of truth for Baliraja Institute site content.
 * Edit copy, links, and contact details here; header, overlay menu,
 * and footer all read from this module.
 */

import { getAssetUrl } from "@/lib/assets";

export const site = {
  name: "Baliraja Institute",
  nameMr: "बलिराजा इन्स्टिट्यूट",
  longName: "Baliraja Institute Career Academy",
  longNameMr: "बलिराजा इन्स्टिट्यूट करिअर अकॅडमी",
  place: "Gangapur",
  placeMr: "गंगापूर",
  motto: "To Educate and To Serve",
  mottoMr: "शिक्षण आणि सेवा",
  established: "2009",
  website: "balirajaacademy.in",
  websiteHref: "https://balirajaacademy.in",
  contact: {
    address:
      "Gangapur, Near Adamapur (Balumama Temple), Tal. Bhudargad, Dist. Kolhapur, Maharashtra 416 209",
    phone: "+91 90979 74444",
    phoneHref: "tel:+919097974444",
    email: "balirajaca@gmail.com",
    emailHref: "mailto:balirajaca@gmail.com",
    hours: "Mon to Sat, 8:00 to 20:00",
  },
} as const;

export type NavLink = { label: string; labelMr?: string; href: string };
export type NavGroup = {
  heading: string;
  headingMr?: string;
  body: string;
  bodyMr?: string;
  links: NavLink[];
};

/** Top-bar primary links (desktop, inline). */
export const primaryNav: NavLink[] = [
  { label: "Home", labelMr: "मुख्यपृष्ठ", href: "/" },
  { label: "About", labelMr: "आमच्याबद्दल", href: "/about" },
  { label: "Student Life", labelMr: "विद्यार्थी जीवन", href: "/student-life" },
  { label: "Courses", labelMr: "अभ्यासक्रम", href: "/courses" },
  { label: "School", labelMr: "शाळा", href: "/school" },
  { label: "Admissions", labelMr: "प्रवेश", href: "/admissions" },
];

/** Overlay menu groups: fewer choices first, detailed paths second. */
export const overlayNavGroups: NavGroup[] = [
  {
    heading: "Academy",
    headingMr: "अकॅडमी",
    body: "Know the people, place, and promise.",
    bodyMr: "आमची माणसे, ठिकाण आणि वचन जाणून घ्या.",
    links: [
      { label: "Home", labelMr: "मुख्यपृष्ठ", href: "/" },
      { label: "About Baliraja", labelMr: "बलिराजाबद्दल", href: "/about" },
      { label: "Why Baliraja", labelMr: "बलिराजा का", href: "/why-baliraja" },
      { label: "Campus Gallery", labelMr: "कॅम्पस गॅलरी", href: "/gallery" },
    ],
  },
  {
    heading: "Learning",
    headingMr: "शिक्षण",
    body: "Find the course path, student rhythm, and updates.",
    bodyMr: "अभ्यासक्रमाचा मार्ग, विद्यार्थ्यांची दिनचर्या आणि अद्यतने पाहा.",
    links: [
      { label: "All Courses", labelMr: "सर्व अभ्यासक्रम", href: "/courses" },
      { label: "School", labelMr: "शाळा", href: "/school" },
      { label: "Student Life", labelMr: "विद्यार्थी जीवन", href: "/student-life" },
      { label: "News & Notices", labelMr: "बातम्या आणि सूचना", href: "/news-events" },
      { label: "Student Portal", labelMr: "विद्यार्थी पोर्टल", href: "/student/login" },
    ],
  },
  {
    heading: "Join",
    headingMr: "सामील व्हा",
    body: "Start the conversation with the office.",
    bodyMr: "कार्यालयाशी संवाद सुरू करा.",
    links: [
      { label: "Admissions", labelMr: "प्रवेश", href: "/admissions" },
      { label: "Scholarships", labelMr: "शिष्यवृत्ती", href: "/scholarships" },
      { label: "Contact", labelMr: "संपर्क", href: "/contact-us" },
      { label: "Admin Portal", labelMr: "प्रशासक पोर्टल", href: "/crm" },
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
  titleMr?: string;
  blurb: string;
  blurbMr?: string;
  /** Unsplash preview shown on hover in the exam-track list. */
  image: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

export const examTracks: ExamTrack[] = [
  {
    code: "01",
    title: "Banking & Insurance",
    titleMr: "बँकिंग व विमा",
    blurb:
      "IBPS, SBI, RBI and allied recruitment, built around quantitative aptitude, reasoning and daily speed drills.",
    blurbMr:
      "आयबीपीएस, एसबीआय, आरबीआय व संलग्न भरती — संख्यात्मक अभियोग्यता, तर्कशक्ती व रोजच्या वेगाच्या सरावावर आधारित.",
    image: unsplash("1598981457915-aea220950616"),
  },
  {
    code: "02",
    title: "SSC & Railways",
    titleMr: "एसएससी व रेल्वे",
    blurb:
      "CGL, CHSL, MTS and RRB tracks with sectional tests and a tier-wise practice calendar.",
    blurbMr:
      "सीजीएल, सीएचएसएल, एमटीएस व आरआरबी मार्ग — विभागीय चाचण्या व टप्प्यानुसार सराव वेळापत्रकासह.",
    image: "/home/exam-railways.webp",
  },
  {
    code: "03",
    title: "Police Bharti",
    titleMr: "पोलीस भरती",
    blurb:
      "Written preparation paired with ground and physical-test guidance for constable and driver recruitment.",
    blurbMr:
      "कॉन्स्टेबल व चालक भरतीसाठी लेखी तयारीसोबत मैदानी व शारीरिक-चाचणी मार्गदर्शन.",
    image: "/home/exam-police-bharati.webp",
  },
  {
    code: "04",
    title: "Talathi & ZP",
    titleMr: "तलाठी व झेडपी",
    blurb:
      "Talathi, Gram Sevak, Zilla Parishad and Saralseva exams, with district-specific current affairs.",
    blurbMr:
      "तलाठी, ग्रामसेवक, जिल्हा परिषद व सरळसेवा परीक्षा — जिल्हानिहाय चालू घडामोडींसह.",
    image: "/home/exam-zp.jpeg",
  },
];

export type Pillar = {
  num: string;
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
};

export const pillars: Pillar[] = [
  {
    num: "01",
    title: "Educate",
    titleMr: "शिक्षण",
    body: "Structured batches, a year-long study calendar, a stocked reading hall and current-affairs sessions that turn syllabus into understanding, not rote.",
    bodyMr:
      "रचनाबद्ध बॅचेस, वर्षभराचे अभ्यास वेळापत्रक, सुसज्ज वाचनालय आणि चालू घडामोडींची सत्रे — जी अभ्यासक्रमाचे घोकंपट्टीऐवजी आकलनात रूपांतर करतात.",
  },
  {
    num: "02",
    title: "Mentor",
    titleMr: "मार्गदर्शन",
    body: "Small cohorts, weekly answer-writing review and one-to-one strategy so every aspirant has a mentor who knows their name and their attempt history.",
    bodyMr:
      "लहान गट, दर आठवड्याला उत्तरलेखनाचा आढावा आणि वैयक्तिक रणनीती — जेणेकरून प्रत्येक विद्यार्थ्याला त्याचे नाव व प्रयत्नांचा इतिहास ओळखणारा मार्गदर्शक मिळतो.",
  },
  {
    num: "03",
    title: "Serve",
    titleMr: "सेवा",
    body: "Fee concessions for farming and first-generation families, and free guidance camps in surrounding villages. The name Baliraja is a promise to the land we come from.",
    bodyMr:
      "शेतकरी व पहिल्या पिढीतील कुटुंबांसाठी फी सवलती आणि आसपासच्या गावांमध्ये मोफत मार्गदर्शन शिबिरे. बलिराजा हे नाव आपल्या मातीला दिलेले वचन आहे.",
  },
];

/** Qualitative proof points. No fabricated counts; replace bracketed
 *  figures with your verified numbers before launch. */
export const whyPoints: string[] = [
  "A faculty drawn from serving and retired officers who have cleared these very exams.",
  "A full-length test series modelled on the latest police and defence bharti patterns, evaluated by hand.",
  "A quiet, long-hours study hall and reference library, open six days a week.",
  "Hostel and mess guidance for students arriving from across western Maharashtra.",
];

export const whyPointsMr: string[] = [
  "याच परीक्षा उत्तीर्ण झालेले कार्यरत व सेवानिवृत्त अधिकारी असलेले शिक्षकवर्ग.",
  "नवीनतम पोलीस व संरक्षण भरती नमुन्यांवर आधारित, हाताने तपासली जाणारी संपूर्ण टेस्ट सिरीज.",
  "आठवड्यातून सहा दिवस उघडे राहणारे शांत, दीर्घ-तासांचे अभ्यासगृह व संदर्भ ग्रंथालय.",
  "पश्चिम महाराष्ट्रातून येणाऱ्या विद्यार्थ्यांसाठी वसतिगृह व भोजनालय मार्गदर्शन.",
];

/* ------------------------------------------------------------------ *
 *  Featured defence tracks — Army & Navy lead the exam list because
 *  these are the entries aspirants here care about most.
 * ------------------------------------------------------------------ */
export type FeaturedExam = {
  key: string;
  kicker: string;
  kickerMr?: string;
  title: string;
  titleMr?: string;
  exams: string;
  blurb: string;
  blurbMr?: string;
  image: string;
  alt: string;
};

export const featuredExams: FeaturedExam[] = [
  {
    key: "army",
    kicker: "Defence · most asked for",
    kickerMr: "संरक्षण · सर्वाधिक विचारले जाणारे",
    title: "Army",
    titleMr: "आर्मी",
    exams: "NDA · CDS · AFCAT · Agniveer GD & Technical · TGC",
    blurb:
      "Written coaching, physical preparation and SSB interview guidance for the National Defence Academy and Agniveer recruitment.",
    blurbMr:
      "राष्ट्रीय संरक्षण अकादमी व अग्निवीर भरतीसाठी लेखी मार्गदर्शन, शारीरिक तयारी व एसएसबी मुलाखत मार्गदर्शन.",
    image: "/home/exam-army.webp",
    alt: "An officer cadet on parade in ceremonial dress with the national tricolour sash",
  },
  {
    key: "navy",
    kicker: "Defence · most asked for",
    kickerMr: "संरक्षण · सर्वाधिक विचारले जाणारे",
    title: "Navy",
    titleMr: "नेव्ही",
    exams: "INET · Agniveer SSR & MR · Coast Guard · NDA",
    blurb:
      "Aptitude, science and English preparation for Indian Navy Agniveer and Coast Guard entries, with timed mocks built to the latest pattern.",
    blurbMr:
      "भारतीय नौदल अग्निवीर व तटरक्षक दल प्रवेशांसाठी अभियोग्यता, विज्ञान व इंग्रजी तयारी — नवीनतम नमुन्यावर आधारित वेळबद्ध मॉक्ससह.",
    image: unsplash("1726450663094-b90adfeea0f8"),
    alt: "An Indian Navy warship under way on the open sea",
  },
];

/* Admission process steps (interactive stepper). */
export type AdmissionStep = {
  num: string;
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
};
export const admissionSteps: AdmissionStep[] = [
  {
    num: "01",
    title: "Send your enquiry",
    titleMr: "तुमची चौकशी पाठवा",
    body: "Share your exam, your attempt and a number we can reach you on. It takes a minute and costs nothing.",
    bodyMr:
      "तुमची परीक्षा, तुमचा प्रयत्न आणि आम्ही संपर्क करू शकू असा एक क्रमांक सांगा. यास एक मिनिट लागतो आणि काहीही खर्च नाही.",
  },
  {
    num: "02",
    title: "Talk to a mentor",
    titleMr: "मार्गदर्शकाशी बोला",
    body: "Within two working days a mentor calls to understand your goal and recommend the right track and batch timing.",
    bodyMr:
      "दोन कामकाजाच्या दिवसांत मार्गदर्शक तुमचे ध्येय समजून घेण्यासाठी व योग्य मार्ग व बॅच वेळेची शिफारस करण्यासाठी कॉल करतो.",
  },
  {
    num: "03",
    title: "Sit a diagnostic test",
    titleMr: "निदान चाचणी द्या",
    body: "A short, no-pressure assessment shows your strong areas and the gaps, so the plan is built around you, not a template.",
    bodyMr:
      "एक छोटी, दडपणविरहित चाचणी तुमची बलस्थाने व त्रुटी दाखवते, जेणेकरून योजना साचेबद्ध नव्हे तर तुमच्याभोवती बनते.",
  },
  {
    num: "04",
    title: "Choose your batch",
    titleMr: "तुमची बॅच निवडा",
    body: "Weekday or weekend, Marathi or English medium, foundation or crash. We map a schedule to your life and your attempt date.",
    bodyMr:
      "आठवड्याचे दिवस की शनिवार-रविवार, मराठी की इंग्रजी माध्यम, फाउंडेशन की क्रॅश. आम्ही तुमच्या दिनक्रम व परीक्षेच्या तारखेनुसार वेळापत्रक ठरवतो.",
  },
  {
    num: "05",
    title: "Confirm your seat",
    titleMr: "तुमची जागा निश्चित करा",
    body: "Visit the campus, see the study hall, and complete enrolment. Fee concessions for farming and first-generation families apply here.",
    bodyMr:
      "कॅम्पसला भेट द्या, अभ्यासगृह पाहा आणि नोंदणी पूर्ण करा. शेतकरी व पहिल्या पिढीतील कुटुंबांसाठी फी सवलती येथे लागू होतात.",
  },
  {
    num: "06",
    title: "Begin your preparation",
    titleMr: "तुमची तयारी सुरू करा",
    body: "Join your cohort, collect your test-series calendar and library access, and start the work that earns the result.",
    bodyMr:
      "तुमच्या गटात सामील व्हा, टेस्ट-सिरीज वेळापत्रक व ग्रंथालय प्रवेश घ्या, आणि निकाल मिळवून देणारे काम सुरू करा.",
  },
];

/* Campus and university context. Add new entries here as the institute collects
 * more real photographs, parent-facing notes, or nearby-university context. */
export type AcademyContextItem = {
  eyebrow: string;
  eyebrowMr?: string;
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
  image: string;
  alt: string;
  href?: string;
};

export const academyContextItems: AcademyContextItem[] = [
  {
    eyebrow: "Academy",
    eyebrowMr: "अकॅडमी",
    title: "A working place for serious attempts",
    titleMr: "गंभीर प्रयत्नांसाठी एक कार्यशील जागा",
    body: "Baliraja is presented as a real study environment: classrooms, reading hours, mentor conversations and a practical admission path.",
    bodyMr: "बलिराजा एक खरे अभ्यास वातावरण म्हणून सादर केले आहे: वर्ग, वाचनाचे तास, मार्गदर्शक संवाद आणि व्यावहारिक प्रवेश मार्ग.",
    image: "/home/con-A-working-place-for-serious-attempts.jpg",
    alt: "Baliraja Institute classroom prepared for a competitive exam lecture",
    href: "/about",
  },
  {
    eyebrow: "University route",
    eyebrowMr: "विद्यापीठ मार्ग",
    title: "Guidance for students planning the next step",
    titleMr: "पुढील पाऊल नियोजित करणाऱ्या विद्यार्थ्यांसाठी मार्गदर्शन",
    body: "Students and families can add university, eligibility, documents and career-path information here as those pages grow.",
    bodyMr: "ही पाने वाढतील तसतशी विद्यार्थी व कुटुंबे विद्यापीठ, पात्रता, कागदपत्रे आणि करिअर-मार्गाची माहिती येथे जोडू शकतात.",
    image: "/home/con-Guidance-for-students-planning-the-next-step.png",
    alt: "Students walking toward an institutional campus building",
    href: "/student-life",
  },
  {
    eyebrow: "Study base",
    eyebrowMr: "अभ्यास आधार",
    title: "Reading, revision and reference material",
    titleMr: "वाचन, उजळणी व संदर्भ साहित्य",
    body: "Use this block for reading-hall details, library photographs, book lists, newspaper practice and daily study routines.",
    bodyMr: "या भागाचा उपयोग वाचनालय तपशील, ग्रंथालय छायाचित्रे, पुस्तक याद्या, वृत्तपत्र सराव आणि रोजच्या अभ्यास दिनचर्येसाठी करा.",
    image: "/img-books.jpg",
    alt: "Reference books and notes for Baliraja Institute students",
    href: "/student-life",
  },
  {
    eyebrow: "Gallery",
    eyebrowMr: "गॅलरी",
    title: "Keep adding real moments",
    titleMr: "खरे क्षण जोडत राहा",
    body: "The gallery below is data-driven. Drop in new campus, classroom, event, library or university-visit images and update the array.",
    bodyMr: "खालील गॅलरी डेटा-आधारित आहे. नवीन कॅम्पस, वर्ग, कार्यक्रम, ग्रंथालय किंवा विद्यापीठ-भेटीच्या प्रतिमा टाका आणि अ‍ॅरे अद्ययावत करा.",
    image: "/home/con-Keep-adding-real-moments.JPG",
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
  captionMr?: string;
  type?: "image" | "video";
  aspect?: "vertical" | "horizontal";
};
export const galleryImages: GalleryImage[] = [
  {
    src: "/home/camp-v1.mov",
    alt: "Baliraja campus video 1",
    caption: "Campus rhythm",
    captionMr: "कॅम्पसची लय",
    type: "video",
    aspect: "vertical",
  },
  {
    src: "/home/camp-v2.mov",
    alt: "Baliraja campus video 2",
    caption: "Active library",
    captionMr: "सक्रिय वाचनालय",
    type: "video",
    aspect: "vertical",
  },
  {
    src: "/home/camp-v3.mp4",
    alt: "Baliraja campus video 3",
    caption: "Classroom debate",
    captionMr: "वर्गातील चर्चा",
    type: "video",
    aspect: "vertical",
  },
  {
    src: "/home/camp-v4.mp4",
    alt: "Baliraja campus video 4",
    caption: "Mentor review",
    captionMr: "मार्गदर्शक आढावा",
    type: "video",
    aspect: "vertical",
  },
];

/* Latest updates (news carousel). Sample copy; replace before launch. */
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
    title: "Building a realistic bharti study timetable you will actually keep",
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
  labelMr?: string;
  note: string;
  noteMr?: string;
};

export const proofStats: ProofStat[] = [
  {
    value: "2009",
    label: "Established in Gangapur",
    labelMr: "गंगापूरमध्ये स्थापित",
    note: "A long-running local academy built around competitive exam preparation.",
    noteMr:
      "स्पर्धा परीक्षा तयारीभोवती उभी राहिलेली दीर्घकाळ चालणारी स्थानिक अकॅडमी.",
  },
  {
    value: "6",
    label: "Core exam tracks",
    labelMr: "मुख्य परीक्षा मार्ग",
    note: "Civil services, defence, banking, SSC, police, Talathi and ZP preparation.",
    noteMr: "नागरी सेवा, संरक्षण, बँकिंग, एसएससी, पोलीस, तलाठी व झेडपी तयारी.",
  },
  {
    value: "12h",
    label: "Study-day culture",
    labelMr: "अभ्यास-दिवस संस्कृती",
    note: "Lecture, reading, revision, current affairs and mock practice in one rhythm.",
    noteMr: "व्याख्यान, वाचन, उजळणी, चालू घडामोडी व मॉक सराव एका लयीत.",
  },
  {
    value: "1:1",
    label: "Mentor reviews",
    labelMr: "वैयक्तिक आढावा",
    note: "Attempt planning and answer-review conversations for serious aspirants.",
    noteMr: "गंभीर विद्यार्थ्यांसाठी प्रयत्न नियोजन व उत्तर-आढावा संवाद.",
  },
];

export type CampusLifeItem = {
  eyebrow: string;
  eyebrowMr?: string;
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
  image: string;
  href?: string;
};

export const campusLifeItems: CampusLifeItem[] = [
  {
    eyebrow: "Reading hall",
    eyebrowMr: "वाचनगृह",
    title: "A quiet place to keep showing up",
    titleMr: "सातत्याने येत राहण्यासाठी एक शांत जागा",
    body: "Long benches, reference books and a study culture shaped for students who need disciplined hours away from home distractions.",
    bodyMr:
      "लांब बाकं, संदर्भ पुस्तके आणि घरातील विचलनांपासून दूर शिस्तबद्ध तास हवे असणाऱ्या विद्यार्थ्यांसाठी घडवलेली अभ्यास संस्कृती.",
    image: unsplash("1513475382585-d06e58bcb0e0"),
    href: "/student-life",
  },
  {
    eyebrow: "Daily lectures",
    eyebrowMr: "रोजची व्याख्याने",
    title: "Syllabus split into workable blocks",
    titleMr: "अभ्यासक्रमाचे व्यवहार्य टप्प्यांत विभाजन",
    body: "Faculty-led classes convert large exam syllabi into weekly targets, revision loops and testable outcomes.",
    bodyMr:
      "शिक्षकांच्या नेतृत्वाखालील वर्ग मोठ्या अभ्यासक्रमाचे साप्ताहिक उद्दिष्टे, उजळणी चक्रे व तपासण्याजोग्या निकालांत रूपांतर करतात.",
    image: getAssetUrl("/student-life/Explore-v-2.png"),
    href: "/courses",
  },
  {
    eyebrow: "Test series",
    eyebrowMr: "टेस्ट सिरीज",
    title: "Mock pressure before exam pressure",
    titleMr: "परीक्षेच्या दडपणाआधी मॉकचे दडपण",
    body: "Timed tests, rank sheets and hand-reviewed answers help aspirants understand speed, accuracy and presentation.",
    bodyMr:
      "वेळबद्ध चाचण्या, गुणवत्ता याद्या व हाताने तपासलेली उत्तरे विद्यार्थ्यांना वेग, अचूकता व मांडणी समजण्यास मदत करतात.",
    image: unsplash("1434030216411-0b793f4b4173"),
    href: "/news-events",
  },
  {
    eyebrow: "Defence practice",
    eyebrowMr: "संरक्षण सराव",
    title: "Written, physical and interview prep",
    titleMr: "लेखी, शारीरिक व मुलाखत तयारी",
    body: "Army and Navy aspirants get written preparation alongside physical-test guidance and SSB orientation.",
    bodyMr:
      "आर्मी व नेव्ही विद्यार्थ्यांना लेखी तयारीसोबत शारीरिक-चाचणी मार्गदर्शन व एसएसबी ओळख मिळते.",
    image: getAssetUrl("/student-life/Explore-v-4.webp"),
    href: "/courses",
  },
  {
    eyebrow: "Mentoring",
    eyebrowMr: "मार्गदर्शन",
    title: "A plan for the attempt in front of you",
    titleMr: "समोरील प्रयत्नासाठी एक योजना",
    body: "Mentors help students choose the right batch, medium, timetable and test strategy based on their current level.",
    bodyMr:
      "मार्गदर्शक विद्यार्थ्यांना त्यांच्या सध्याच्या स्तरानुसार योग्य बॅच, माध्यम, वेळापत्रक व चाचणी रणनीती निवडण्यास मदत करतात.",
    image: getAssetUrl("/student-life/Explore-v-5.png"),
    href: "/about",
  },
  {
    eyebrow: "Community",
    eyebrowMr: "समुदाय",
    title: "A cohort that keeps the pace",
    titleMr: "वेग टिकवणारा एक गट",
    body: "Students preparing for similar exams learn together, discuss current affairs and keep each other accountable.",
    bodyMr:
      "समान परीक्षांची तयारी करणारे विद्यार्थी एकत्र शिकतात, चालू घडामोडींवर चर्चा करतात व एकमेकांना जबाबदार ठेवतात.",
    image: getAssetUrl("/student-life/Explore-v-6.png"),
    href: "/student-life",
  },
];

export type SupportPoint = {
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
};

export const supportPoints: SupportPoint[] = [
  {
    title: "Attempt planning",
    titleMr: "प्रयत्न नियोजन",
    body: "Students map syllabus coverage, revision windows and mock-test timing around their real exam calendar.",
    bodyMr:
      "विद्यार्थी त्यांच्या प्रत्यक्ष परीक्षा वेळापत्रकाभोवती अभ्यासक्रम व्याप्ती, उजळणी कालावधी व मॉक-चाचणी वेळेचे नियोजन करतात.",
  },
  {
    title: "Current affairs discipline",
    titleMr: "चालू घडामोडींची शिस्त",
    body: "Daily newspaper, state-level updates and revision notes keep preparation connected to the latest exam patterns.",
    bodyMr:
      "रोजचे वृत्तपत्र, राज्यस्तरीय अद्यतने व उजळणी टिपणे तयारीला नवीनतम परीक्षा नमुन्यांशी जोडून ठेवतात.",
  },
  {
    title: "Library and reference access",
    titleMr: "ग्रंथालय व संदर्भ प्रवेश",
    body: "Reference material, previous papers and focused reading hours support students who need a serious study base.",
    bodyMr:
      "संदर्भ साहित्य, मागील प्रश्नपत्रिका व केंद्रित वाचन तास गंभीर अभ्यास आधार हवा असलेल्या विद्यार्थ्यांना साथ देतात.",
  },
  {
    title: "Family-aware counselling",
    titleMr: "कुटुंब-सजग समुपदेशन",
    body: "Fee concessions and practical guidance are handled with sensitivity for farming and first-generation families.",
    bodyMr:
      "शेतकरी व पहिल्या पिढीतील कुटुंबांसाठी फी सवलती व व्यावहारिक मार्गदर्शन संवेदनशीलतेने हाताळले जाते.",
  },
];

export type ExperiencePath = {
  kicker: string;
  kickerMr?: string;
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
  href: string;
  image: string;
};

export const preparationExperiences: ExperiencePath[] = [
  {
    kicker: "Classes",
    kickerMr: "वर्ग",
    title: "Understand the syllabus before you chase it",
    titleMr: "अभ्यासक्रमाचा पाठलाग करण्याआधी तो समजून घ्या",
    body: "Daily lectures break large exam demands into teachable blocks, revision loops and weekly targets.",
    bodyMr:
      "रोजची व्याख्याने मोठ्या परीक्षा मागण्यांचे शिकवण्याजोगे टप्पे, उजळणी चक्रे व साप्ताहिक उद्दिष्टांत विभाजन करतात.",
    href: "/courses",
    image: unsplash("1561089489-f13d5e730d72"),
  },
  {
    kicker: "Study hall",
    kickerMr: "अभ्यासगृह",
    title: "A place where the hours become possible",
    titleMr: "जिथे तास शक्य होतात अशी जागा",
    body: "Quiet desks, reference books and a serious room help students study beyond the lecture timetable.",
    bodyMr:
      "शांत डेस्क, संदर्भ पुस्तके व एक गंभीर खोली विद्यार्थ्यांना व्याख्यान वेळापत्रकाबाहेरही अभ्यास करण्यास मदत करतात.",
    href: "/student-life",
    image: unsplash("1513475382585-d06e58bcb0e0"),
  },
  {
    kicker: "Testing",
    kickerMr: "चाचणी",
    title: "Know your score before the exam tells you",
    titleMr: "परीक्षा सांगण्याआधी तुमचा गुण जाणून घ्या",
    body: "Full-length mocks, answer review and rank sheets make progress visible while there is still time to correct it.",
    bodyMr:
      "संपूर्ण मॉक्स, उत्तर आढावा व गुणवत्ता याद्या सुधारण्यास वेळ असतानाच प्रगती दृश्यमान करतात.",
    href: "/news-events",
    image: unsplash("1434030216411-0b793f4b4173"),
  },
  {
    kicker: "Mentoring",
    kickerMr: "मार्गदर्शन",
    title: "A plan shaped around your attempt",
    titleMr: "तुमच्या प्रयत्नाभोवती घडलेली योजना",
    body: "Mentors help students choose medium, batch pace, exam route and revision strategy without wasting months.",
    bodyMr:
      "मार्गदर्शक विद्यार्थ्यांना महिने वाया न घालवता माध्यम, बॅच गती, परीक्षा मार्ग व उजळणी रणनीती निवडण्यास मदत करतात.",
    href: "/about",
    image: unsplash("1606761568499-6d2451b23c66"),
  },
];

export type DiscoveryStep = {
  label: string;
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
};

export const admissionsDiscoverySteps: DiscoveryStep[] = [
  {
    label: "01",
    title: "Your background",
    titleMr: "तुमची पार्श्वभूमी",
    body: "We ask about your exam, education, language comfort, attempt history and the time you can realistically give.",
    bodyMr:
      "आम्ही तुमची परीक्षा, शिक्षण, भाषेतील सोय, प्रयत्नांचा इतिहास आणि तुम्ही प्रत्यक्षात देऊ शकणारा वेळ याबद्दल विचारतो.",
  },
  {
    label: "02",
    title: "Your current level",
    titleMr: "तुमचा सध्याचा स्तर",
    body: "A diagnostic test or mentor conversation shows where you are strong and where the first month must focus.",
    bodyMr:
      "निदान चाचणी किंवा मार्गदर्शक संवाद तुम्ही कुठे बलवान आहात व पहिल्या महिन्याने कुठे लक्ष द्यावे हे दाखवतो.",
  },
  {
    label: "03",
    title: "Your support needs",
    titleMr: "तुमच्या सहाय्याच्या गरजा",
    body: "Fee concessions, hostel and mess guidance, study-hall timing and family questions are discussed before joining.",
    bodyMr:
      "फी सवलती, वसतिगृह व भोजनालय मार्गदर्शन, अभ्यासगृह वेळ व कौटुंबिक प्रश्न सामील होण्यापूर्वी चर्चिले जातात.",
  },
  {
    label: "04",
    title: "Your batch route",
    titleMr: "तुमचा बॅच मार्ग",
    body: "You leave with a recommended batch, test calendar and next action instead of a generic brochure.",
    bodyMr:
      "सामान्य माहितीपत्रकाऐवजी तुम्ही शिफारस केलेली बॅच, चाचणी वेळापत्रक व पुढील कृती घेऊन जाता.",
  },
];

export type GuideCta = {
  eyebrow: string;
  eyebrowMr?: string;
  title: string;
  titleMr?: string;
  body: string;
  bodyMr?: string;
  image: string;
  imageAlt: string;
  points: string[];
  pointsMr?: string[];
  primary: NavLink;
  secondary: NavLink;
};

export const preparationGuide: GuideCta = {
  eyebrow: "Preparation guide",
  eyebrowMr: "तयारी मार्गदर्शक",
  title: "Is Baliraja right for this attempt?",
  titleMr: "या प्रयत्नासाठी बलिराजा योग्य आहे का?",
  body: "Use the enquiry call like a counselling session. Bring the exam you want, your attempt date, your weak areas and any fee or travel questions.",
  bodyMr:
    "चौकशी कॉलचा उपयोग समुपदेशन सत्रासारखा करा. तुमची इच्छित परीक्षा, प्रयत्नाची तारीख, कमकुवत भाग आणि फी किंवा प्रवासाचे प्रश्न घेऊन या.",
  image: unsplash("1495446815901-a7297e633e8d"),
  imageAlt: "Open notes and books arranged for a competitive exam study plan",
  points: [
    "Which exam track should come first",
    "How many months your current level needs",
    "Which batch timing fits your routine",
    "What fee support or visit documents to ask about",
  ],
  pointsMr: [
    "कोणता परीक्षा मार्ग आधी घ्यावा",
    "तुमच्या सध्याच्या स्तराला किती महिने लागतील",
    "कोणती बॅच वेळ तुमच्या दिनक्रमात बसते",
    "कोणते फी सहाय्य किंवा भेटीचे कागदपत्र विचारावेत",
  ],
  primary: { label: "Start the enquiry", labelMr: "चौकशी सुरू करा", href: "/admissions" },
  secondary: {
    label: "Call the office",
    labelMr: "कार्यालयाला कॉल करा",
    href: site.contact.phoneHref,
  },
};

export type FaqItem = {
  question: string;
  questionMr?: string;
  answer: string;
  answerMr?: string;
};

export const admissionsFaqs: FaqItem[] = [
  {
    question: "Do I need to know my exact exam before enquiring?",
    questionMr: "चौकशी करण्याआधी मला माझी नेमकी परीक्षा माहीत असावी लागते का?",
    answer:
      "No. Share the broad direction, such as police, army, or another bharti route. A mentor can help narrow the track after understanding your level and timeline.",
    answerMr:
      "नाही. पोलीस, आर्मी किंवा अन्य भरती मार्ग यांसारखी ढोबळ दिशा सांगा. तुमचा स्तर व कालमर्यादा समजून घेतल्यावर मार्गदर्शक मार्ग निश्चित करण्यास मदत करू शकतो.",
  },
  {
    question: "Can parents visit before admission?",
    questionMr: "प्रवेशापूर्वी पालक भेट देऊ शकतात का?",
    answer:
      "Yes. Families can visit the campus, see the reading hall, discuss fees and ask practical questions before confirming a seat.",
    answerMr:
      "होय. जागा निश्चित करण्यापूर्वी कुटुंबे कॅम्पसला भेट देऊ शकतात, वाचनगृह पाहू शकतात, फीबद्दल चर्चा करू शकतात व व्यावहारिक प्रश्न विचारू शकतात.",
  },
  {
    question: "Is there Marathi and English-medium support?",
    questionMr: "मराठी व इंग्रजी माध्यमाचे सहाय्य आहे का?",
    answer:
      "Batch recommendations consider language comfort. Students can ask about Marathi and English-medium guidance during the mentor call.",
    answerMr:
      "बॅचच्या शिफारशी भाषेतील सोयीचा विचार करतात. विद्यार्थी मार्गदर्शक कॉलदरम्यान मराठी व इंग्रजी-माध्यम मार्गदर्शनाबद्दल विचारू शकतात.",
  },
  {
    question: "How are scholarships or fee concessions decided?",
    questionMr: "शिष्यवृत्ती किंवा फी सवलती कशा ठरवल्या जातात?",
    answer:
      "Concessions are handled through a practical review of need, seriousness, diagnostic performance and available seats in the relevant batch.",
    answerMr:
      "गरज, गांभीर्य, निदान चाचणीतील कामगिरी व संबंधित बॅचमधील उपलब्ध जागा यांच्या व्यावहारिक आढाव्याद्वारे सवलती हाताळल्या जातात.",
  },
  {
    question: "Can I join only the test series?",
    questionMr: "मी फक्त टेस्ट सिरीज घेऊ शकतो का?",
    answer:
      "Yes, depending on the exam and current schedule. Ask for the test-series calendar when you enquire.",
    answerMr:
      "होय, परीक्षा व सध्याच्या वेळापत्रकानुसार. चौकशी करताना टेस्ट-सिरीज वेळापत्रक मागा.",
  },
];

export const studentLifeFaqs: FaqItem[] = [
  {
    question: "How long can students use the study hall?",
    questionMr: "विद्यार्थी अभ्यासगृह किती वेळ वापरू शकतात?",
    answer:
      "Study-hall access is built around the academy timetable, with extended hours during exam season when announced on the notice board.",
    answerMr:
      "अभ्यासगृह प्रवेश अकॅडमीच्या वेळापत्रकाभोवती असतो, परीक्षा हंगामात सूचना फलकावर जाहीर केल्यास वाढीव तासांसह.",
  },
  {
    question: "Is hostel or mess support provided?",
    questionMr: "वसतिगृह किंवा भोजनालय सहाय्य दिले जाते का?",
    answer:
      "Baliraja guides outstation students toward practical hostel and mess options near the academy, especially for students coming from villages around Kolhapur district.",
    answerMr:
      "बलिराजा बाहेरगावच्या विद्यार्थ्यांना, विशेषतः कोल्हापूर जिल्ह्यातील गावांतून येणाऱ्यांना, अकॅडमीजवळील व्यावहारिक वसतिगृह व भोजनालय पर्यायांकडे मार्गदर्शन करते.",
  },
  {
    question: "How often do students get feedback?",
    questionMr: "विद्यार्थ्यांना किती वेळा अभिप्राय मिळतो?",
    answer:
      "Mock tests, answer review and mentor conversations give students regular feedback on accuracy, speed, presentation and revision discipline.",
    answerMr:
      "मॉक चाचण्या, उत्तर आढावा व मार्गदर्शक संवाद विद्यार्थ्यांना अचूकता, वेग, मांडणी व उजळणी शिस्तीवर नियमित अभिप्राय देतात.",
  },
  {
    question: "Do defence students get physical-test guidance?",
    questionMr: "संरक्षण विद्यार्थ्यांना शारीरिक-चाचणी मार्गदर्शन मिळते का?",
    answer:
      "Army and Navy aspirants can ask for written preparation, physical-test targets and SSB orientation as part of one preparation route.",
    answerMr:
      "आर्मी व नेव्ही विद्यार्थी एका तयारी मार्गाचा भाग म्हणून लेखी तयारी, शारीरिक-चाचणी उद्दिष्टे व एसएसबी ओळख मागू शकतात.",
  },
];

export type StudentVoice = {
  name: string;
  nameMr?: string;
  track: string;
  trackMr?: string;
  quote: string;
  quoteMr?: string;
  image: string;
};

export const studentVoices: StudentVoice[] = [
  {
    name: "Police bharti aspirant",
    nameMr: "पोलीस भरती विद्यार्थी",
    track: "Constable track",
    trackMr: "कॉन्स्टेबल मार्ग",
    quote:
      "The weekly test review showed me where I was losing marks, not just what I had studied.",
    quoteMr:
      "साप्ताहिक चाचणी आढाव्याने मी काय अभ्यासले एवढेच नव्हे, तर कुठे गुण गमावत होतो हे मला दाखवले.",
    image: getAssetUrl("/student-life/student-v-1.png"),
  },
  {
    name: "Defence aspirant",
    nameMr: "संरक्षण विद्यार्थी",
    track: "NDA and Agniveer",
    trackMr: "एनडीए व अग्निवीर",
    quote:
      "Written practice, physical targets and interview preparation were treated as one plan.",
    quoteMr:
      "लेखी सराव, शारीरिक उद्दिष्टे व मुलाखत तयारी एकाच योजनेप्रमाणे हाताळली गेली.",
    image: getAssetUrl("/student-life/student-v-2.webp"),
  },
  {
    name: "Banking student",
    nameMr: "बँकिंग विद्यार्थी",
    track: "IBPS and SBI",
    trackMr: "आयबीपीएस व एसबीआय",
    quote:
      "Speed drills helped me stop guessing and start solving sections in the right order.",
    quoteMr:
      "वेगाच्या सरावाने मला अंदाज लावणे थांबवून योग्य क्रमाने विभाग सोडवायला मदत केली.",
    image: getAssetUrl("/student-life/student-v-3.png"),
  },
  {
    name: "Rural first-generation student",
    nameMr: "ग्रामीण पहिल्या पिढीतील विद्यार्थी",
    track: "Talathi and ZP",
    trackMr: "तलाठी व झेडपी",
    quote:
      "The study hall and simple guidance made it possible to prepare seriously from Gangapur.",
    quoteMr:
      "अभ्यासगृह व साध्या मार्गदर्शनामुळे गंगापूरहून गंभीरपणे तयारी करणे शक्य झाले.",
    image: getAssetUrl("/student-life/student-v-4.png"),
  },
];

export type ScholarshipProgram = {
  title: string;
  titleMr?: string;
  audience: string;
  audienceMr?: string;
  body: string;
  bodyMr?: string;
  tags: string[];
  tagsMr?: string[];
};

export const scholarshipPrograms: ScholarshipProgram[] = [
  {
    title: "Baliraja farming-family concession",
    titleMr: "बलिराजा शेतकरी-कुटुंब सवलत",
    audience: "Farming and first-generation families",
    audienceMr: "शेतकरी व पहिल्या पिढीतील कुटुंबे",
    body: "Need-aware concessions for students whose preparation depends on making coaching fees manageable.",
    bodyMr:
      "ज्यांची तयारी कोचिंग फी परवडण्यावर अवलंबून आहे अशा विद्यार्थ्यांसाठी गरज-सजग सवलती.",
    tags: ["Need aware", "Rural students", "Interview required"],
    tagsMr: ["गरज-सजग", "ग्रामीण विद्यार्थी", "मुलाखत आवश्यक"],
  },
  {
    title: "Merit test concession",
    titleMr: "गुणवत्ता चाचणी सवलत",
    audience: "High-performing aspirants",
    audienceMr: "उत्कृष्ट कामगिरी करणारे विद्यार्थी",
    body: "Fee support based on diagnostic performance, past academic record and seriousness of preparation.",
    bodyMr:
      "निदान चाचणीतील कामगिरी, मागील शैक्षणिक नोंद व तयारीच्या गांभीर्यावर आधारित फी सहाय्य.",
    tags: ["Merit", "Diagnostic test", "Batch limited"],
    tagsMr: ["गुणवत्ता", "निदान चाचणी", "बॅच मर्यादित"],
  },
  {
    title: "Defence preparation support",
    titleMr: "संरक्षण तयारी सहाय्य",
    audience: "Army and Navy aspirants",
    audienceMr: "आर्मी व नेव्ही विद्यार्थी",
    body: "Guidance support for students preparing for NDA, CDS, Agniveer and related defence entries.",
    bodyMr:
      "एनडीए, सीडीएस, अग्निवीर व संबंधित संरक्षण प्रवेशांची तयारी करणाऱ्या विद्यार्थ्यांसाठी मार्गदर्शन सहाय्य.",
    tags: ["Defence", "Physical test", "SSB guidance"],
    tagsMr: ["संरक्षण", "शारीरिक चाचणी", "एसएसबी मार्गदर्शन"],
  },
  {
    title: "Restart scholarship",
    audience: "Repeat-attempt students",
    body: "Reduced-fee support for students who need a corrected plan after an unsuccessful attempt.",
    tags: ["Repeat attempt", "Mentor review", "Mock analysis"],
  },
];
