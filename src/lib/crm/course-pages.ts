import crypto from "node:crypto";
import { sanitizeBlogHtml, slugifyBlogTitle } from "@/lib/crm/blog-posts";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";
import { localize } from "@/lib/i18n-content";
import { isAllowedCrmMediaUrl } from "@/lib/crm/media-storage";
import { examTracks, featuredExams } from "@/lib/site";

export const coursePageStatuses = ["draft", "published", "archived"] as const;

export type CoursePageStatus = (typeof coursePageStatuses)[number];

export const courseDivisions = ["bharti", "school", "sports", "camp"] as const;

export type CourseDivision = (typeof courseDivisions)[number];

export const courseDivisionLabels: Record<CourseDivision, string> = {
  bharti: "Bharti coaching",
  school: "School",
  sports: "Sports academy",
  camp: "Summer camp",
};

export const courseMediums = ["marathi", "semi_english"] as const;

export type CourseMedium = (typeof courseMediums)[number];

export const courseMediumLabels: Record<CourseMedium, string> = {
  marathi: "Marathi medium",
  semi_english: "Semi-English medium",
};

export type CoursePage = {
  id: string;
  seedKey: string | null;
  title: string;
  titleMr: string | null;
  slug: string;
  summary: string;
  summaryMr: string | null;
  bodyHtml: string;
  bodyHtmlMr: string | null;
  category: string;
  categoryMr: string | null;
  division: CourseDivision;
  medium: CourseMedium | null;
  audience: string | null;
  audienceMr: string | null;
  exams: string | null;
  examsMr: string | null;
  duration: string | null;
  durationMr: string | null;
  image: string;
  imageAlt: string | null;
  imageAltMr: string | null;
  status: CoursePageStatus;
  seoTitle: string | null;
  seoTitleMr: string | null;
  seoDescription: string | null;
  seoDescriptionMr: string | null;
  displayOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CoursePageInput = {
  seedKey?: string | null;
  title: string;
  titleMr?: string | null;
  slug?: string;
  summary: string;
  summaryMr?: string | null;
  bodyHtml: string;
  bodyHtmlMr?: string | null;
  category: string;
  categoryMr?: string | null;
  division?: string | null;
  medium?: string | null;
  audience?: string | null;
  audienceMr?: string | null;
  exams?: string | null;
  examsMr?: string | null;
  duration?: string | null;
  durationMr?: string | null;
  image: string;
  imageAlt?: string | null;
  imageAltMr?: string | null;
  status: CoursePageStatus;
  seoTitle?: string | null;
  seoTitleMr?: string | null;
  seoDescription?: string | null;
  seoDescriptionMr?: string | null;
  displayOrder?: number;
};

export type CourseCard = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  href: string;
  division: CourseDivision;
  medium: CourseMedium | null;
};

const COURSE_PAGES_FILE = "crm-course-pages.json";
const DEFAULT_IMAGE = "/img-reading.jpg";

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCoursePageStatus(value: string): value is CoursePageStatus {
  return coursePageStatuses.includes(value as CoursePageStatus);
}

function parseDivision(value: unknown): CourseDivision {
  const normalized = String(value ?? "").trim();
  return (courseDivisions as readonly string[]).includes(normalized)
    ? (normalized as CourseDivision)
    : "bharti";
}

function parseMedium(value: unknown): CourseMedium | null {
  const normalized = String(value ?? "").trim();
  return (courseMediums as readonly string[]).includes(normalized)
    ? (normalized as CourseMedium)
    : null;
}

function safeCoverImageUrl(value: string) {
  const trimmed = value.trim();

  return isAllowedCrmMediaUrl(trimmed) ? trimmed : "";
}

function courseBody(input: {
  title: string;
  summary: string;
  exams?: string;
  audience?: string;
}) {
  const exams = input.exams || input.title;
  const audience = input.audience || `${input.title} aspirants`;

  return sanitizeBlogHtml(`
    <h2>What this course covers</h2>
    <p>${input.summary}</p>
    <p>The programme is built for <strong>${audience}</strong>, with classroom teaching, revision, test practice, and mentor review kept in one route.</p>
    <h3>Exam focus</h3>
    <ul>
      <li>${exams}</li>
      <li>Concept lectures and syllabus mapping</li>
      <li>Timed practice, mock tests, and doubt-clearing support</li>
      <li>Attempt planning based on the student's level and target date</li>
    </ul>
    <h3>How admission works</h3>
    <p>Send an enquiry, speak with a mentor, and choose the right batch after your preparation level and timeline are understood.</p>
  `);
}

function staticCoursePages(): CoursePage[] {
  const now = new Date(0).toISOString();
  const featured = featuredExams.map((course, index) => ({
    id: `static-featured-${course.key}`,
    seedKey: `featured-${course.key}`,
    title: course.title,
    titleMr: course.titleMr ?? null,
    slug: slugifyBlogTitle(course.title),
    summary: course.blurb,
    summaryMr: course.blurbMr ?? null,
    bodyHtml: courseBody({
      title: course.title,
      summary: course.blurb,
      exams: course.exams,
      audience: "defence aspirants",
    }),
    bodyHtmlMr: null,
    category: "Defence",
    categoryMr: "संरक्षण",
    division: "bharti" as const,
    medium: null,
    audience: "Defence aspirants",
    audienceMr: "संरक्षण विद्यार्थी",
    exams: course.exams,
    examsMr: null,
    duration: "Foundation, crash, and interview-preparation support",
    durationMr: "फाउंडेशन, क्रॅश व मुलाखत-तयारी सहाय्य",
    image: course.image,
    imageAlt: course.alt,
    imageAltMr: null,
    status: "published" as const,
    seoTitle: null,
    seoTitleMr: null,
    seoDescription: course.blurb,
    seoDescriptionMr: course.blurbMr ?? null,
    displayOrder: index + 1,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  }));
  const tracks = examTracks.map((track, index) => ({
    id: `static-track-${slugifyBlogTitle(track.title)}`,
    seedKey: `track-${slugifyBlogTitle(track.title)}`,
    title: track.title,
    titleMr: track.titleMr ?? null,
    slug: slugifyBlogTitle(track.title),
    summary: track.blurb,
    summaryMr: track.blurbMr ?? null,
    bodyHtml: courseBody({
      title: track.title,
      summary: track.blurb,
      exams: track.title,
    }),
    bodyHtmlMr: null,
    category: "Exam track",
    categoryMr: "परीक्षा मार्ग",
    division: "bharti" as const,
    medium: null,
    audience: `${track.title} aspirants`,
    audienceMr: null,
    exams: track.title,
    examsMr: track.titleMr ?? null,
    duration: "Foundation, test-series, and revision support",
    durationMr: "फाउंडेशन, टेस्ट-सिरीज व उजळणी सहाय्य",
    image: track.image,
    imageAlt: null,
    imageAltMr: null,
    status: "published" as const,
    seoTitle: null,
    seoTitleMr: null,
    seoDescription: track.blurb,
    seoDescriptionMr: track.blurbMr ?? null,
    displayOrder: featured.length + index + 1,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  }));

  const divisionBody = (input: { intro: string; points: string[] }) =>
    sanitizeBlogHtml(`
      <h2>About this program</h2>
      <p>${input.intro}</p>
      <ul>
        ${input.points.map((point) => `<li>${point}</li>`).join("\n")}
      </ul>
      <h3>How admission works</h3>
      <p>Send an enquiry or visit the campus — the office will explain seats, timings, and fees, and complete admission in person.</p>
    `);
  const baseOrder = featured.length + tracks.length;
  const divisions: CoursePage[] = [
    {
      id: "static-school-marathi",
      seedKey: "school-marathi",
      title: "Baliraja School — Marathi Medium",
      titleMr: "बलिराजा शाळा — मराठी माध्यम",
      slug: "school-marathi-medium",
      summary:
        "Full schooling in Marathi medium on the Baliraja campus — disciplined classrooms, sports grounds, and the same mentoring culture that trains bharti aspirants.",
      summaryMr:
        "बलिराजा कॅम्पसवर मराठी माध्यमात संपूर्ण शालेय शिक्षण — शिस्तबद्ध वर्ग, क्रीडांगणे आणि भरती विद्यार्थ्यांना घडवणारीच मार्गदर्शन संस्कृती.",
      bodyHtmlMr: null,
      categoryMr: "शाळा",
      audienceMr: "शालेय विद्यार्थी व पालक",
      examsMr: null,
      durationMr: "संपूर्ण शैक्षणिक वर्ष",
      imageAltMr: null,
      seoTitleMr: null,
      seoDescriptionMr: null,
      bodyHtml: divisionBody({
        intro:
          "Marathi-medium schooling with structured classes, daily study discipline, and access to the campus grounds and library.",
        points: [
          "State-board syllabus taught in Marathi medium",
          "Sports and physical training on the academy grounds",
          "Regular unit tests with parent updates",
          "Hostel and mess guidance for outstation students",
        ],
      }),
      category: "School",
      division: "school",
      medium: "marathi",
      audience: "School students and parents",
      exams: null,
      duration: "Full academic year",
      image: "/home/con-Guidance-for-students-planning-the-next-step.png",
      imageAlt: "Students receiving guidance at Baliraja",
      status: "published",
      seoTitle: null,
      seoDescription:
        "Marathi-medium schooling at Baliraja Institute, Gangapur, Tal. Bhudargad, Dist. Kolhapur.",
      displayOrder: baseOrder + 1,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "static-school-semi-english",
      seedKey: "school-semi-english",
      title: "Baliraja School — Semi-English Medium",
      titleMr: "बलिराजा शाळा — सेमी-इंग्रजी माध्यम",
      slug: "school-semi-english-medium",
      summary:
        "Semi-English medium schooling — Marathi-first teaching with mathematics and science in English, preparing students for higher education without losing their footing.",
      summaryMr:
        "सेमी-इंग्रजी माध्यम शिक्षण — मराठी-प्राधान्य शिकवण, गणित व विज्ञान इंग्रजीत, विद्यार्थ्यांना पाया न गमावता उच्च शिक्षणासाठी तयार करते.",
      bodyHtmlMr: null,
      categoryMr: "शाळा",
      audienceMr: "शालेय विद्यार्थी व पालक",
      examsMr: null,
      durationMr: "संपूर्ण शैक्षणिक वर्ष",
      imageAltMr: null,
      seoTitleMr: null,
      seoDescriptionMr: null,
      bodyHtml: divisionBody({
        intro:
          "Semi-English schooling where mathematics and science are taught in English and other subjects in Marathi, easing the path to English-medium higher education.",
        points: [
          "State-board syllabus with maths and science in English",
          "Language support so no student is left behind",
          "Sports and physical training on the academy grounds",
          "Regular unit tests with parent updates",
        ],
      }),
      category: "School",
      division: "school",
      medium: "semi_english",
      audience: "School students and parents",
      exams: null,
      duration: "Full academic year",
      image: "/home/pre-courses.png",
      imageAlt: "Classroom teaching at Baliraja",
      status: "published",
      seoTitle: null,
      seoDescription:
        "Semi-English medium schooling at Baliraja Institute, Gangapur, Tal. Bhudargad, Dist. Kolhapur.",
      displayOrder: baseOrder + 2,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "static-sports-academy",
      seedKey: "sports-academy",
      title: "Sports Academy",
      titleMr: "क्रीडा अकॅडमी",
      slug: "sports-academy",
      summary:
        "Ground training, coaching, and physical development — open to school students and bharti aspirants building toward physical eligibility standards.",
      summaryMr:
        "मैदानी प्रशिक्षण, कोचिंग व शारीरिक विकास — शालेय विद्यार्थी व शारीरिक पात्रता निकषांकडे वाटचाल करणाऱ्या भरती विद्यार्थ्यांसाठी खुले.",
      bodyHtmlMr: null,
      categoryMr: "क्रीडा",
      audienceMr: "शालेय विद्यार्थी व तरुण खेळाडू",
      examsMr: null,
      durationMr: "हंगामी व वर्षभर बॅचेस",
      imageAltMr: null,
      seoTitleMr: null,
      seoDescriptionMr: null,
      bodyHtml: divisionBody({
        intro:
          "Structured sports coaching on the academy grounds: running, field events, and strength work with measured progress over the season.",
        points: [
          "Morning and evening ground batches",
          "Running, shot put, and field-event coaching",
          "Physical measurements tracked over time",
          "A natural bridge into bharti physical-test preparation",
        ],
      }),
      category: "Sports",
      division: "sports",
      medium: null,
      audience: "School students and young athletes",
      exams: null,
      duration: "Seasonal and year-round batches",
      image: "/home/pre-student-life.png",
      imageAlt: "Training on the Baliraja grounds",
      status: "published",
      seoTitle: null,
      seoDescription:
        "Sports academy at Baliraja Institute, Gangapur — ground training and physical development coaching.",
      displayOrder: baseOrder + 3,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "static-summer-camp",
      seedKey: "summer-camp",
      title: "Summer Camp",
      titleMr: "उन्हाळी शिबिर",
      slug: "summer-camp",
      summary:
        "Vacation camps on the Baliraja campus — sports, discipline, and guided activity for younger students during school holidays.",
      summaryMr:
        "बलिराजा कॅम्पसवर सुट्टीतील शिबिरे — शालेय सुट्ट्यांमध्ये लहान विद्यार्थ्यांसाठी क्रीडा, शिस्त व मार्गदर्शित उपक्रम.",
      bodyHtmlMr: null,
      categoryMr: "शिबिर",
      audienceMr: "सुट्टीतील शालेय विद्यार्थी",
      examsMr: null,
      durationMr: "उन्हाळी सुट्टी बॅचेस",
      imageAltMr: null,
      seoTitleMr: null,
      seoDescriptionMr: null,
      bodyHtml: divisionBody({
        intro:
          "A residential-style vacation camp mixing sports, physical activity, and disciplined daily routine on the academy campus.",
        points: [
          "Daily sports and ground activity",
          "Yoga, drill, and discipline routines",
          "Guided study hours and value education",
          "Safe campus environment with mess arrangements",
        ],
      }),
      category: "Camp",
      division: "camp",
      medium: null,
      audience: "School students during vacations",
      exams: null,
      duration: "Summer vacation batches",
      image: "/home/con-Keep-adding-real-moments.JPG",
      imageAlt: "Camp activity at Baliraja",
      status: "published",
      seoTitle: null,
      seoDescription:
        "Summer camp at Baliraja Institute, Gangapur — sports, discipline, and activity during school vacations.",
      displayOrder: baseOrder + 4,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return [...featured, ...tracks, ...divisions];
}

function mrText(value: unknown): string | null {
  return value ? String(value) : null;
}

function mapDbCoursePage(row: Record<string, unknown>): CoursePage {
  const status = String(row.status);

  return {
    id: String(row.id),
    seedKey: row.seed_key ? String(row.seed_key) : null,
    title: String(row.title),
    titleMr: mrText(row.title_mr),
    slug: String(row.slug),
    summary: String(row.summary),
    summaryMr: mrText(row.summary_mr),
    bodyHtml: String(row.body_html),
    bodyHtmlMr: mrText(row.body_html_mr),
    category: String(row.category),
    categoryMr: mrText(row.category_mr),
    division: parseDivision(row.division),
    medium: parseMedium(row.medium),
    audience: row.audience ? String(row.audience) : null,
    audienceMr: mrText(row.audience_mr),
    exams: row.exams ? String(row.exams) : null,
    examsMr: mrText(row.exams_mr),
    duration: row.duration ? String(row.duration) : null,
    durationMr: mrText(row.duration_mr),
    image: String(row.image),
    imageAlt: row.image_alt ? String(row.image_alt) : null,
    imageAltMr: mrText(row.image_alt_mr),
    status: isCoursePageStatus(status) ? status : "draft",
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoTitleMr: mrText(row.seo_title_mr),
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    seoDescriptionMr: mrText(row.seo_description_mr),
    displayOrder: Number(row.display_order ?? 100),
    publishedAt: row.published_at
      ? new Date(String(row.published_at)).toISOString()
      : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function listStoredCoursePages() {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        seed_key,
        title,
        title_mr,
        slug,
        summary,
        summary_mr,
        body_html,
        body_html_mr,
        category,
        category_mr,
        division,
        medium,
        audience,
        audience_mr,
        exams,
        exams_mr,
        duration,
        duration_mr,
        image,
        image_alt,
        image_alt_mr,
        status,
        seo_title,
        seo_title_mr,
        seo_description,
        seo_description_mr,
        display_order,
        published_at,
        created_at,
        updated_at
      FROM crm_course_pages
      ORDER BY display_order ASC, updated_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbCoursePage(row));
  }

  return (await readJsonFile<CoursePage[]>(COURSE_PAGES_FILE, [])).map(
    (page) => ({
      ...page,
      division: parseDivision(page.division),
      medium: parseMedium(page.medium),
    }),
  );
}

function mergeCoursePages(stored: CoursePage[]) {
  const templates = staticCoursePages();
  const storedBySeed = new Map(
    stored.flatMap((page) => (page.seedKey ? [[page.seedKey, page]] : [])),
  );
  const templateKeys = new Set(
    templates.flatMap((page) => (page.seedKey ? [page.seedKey] : [])),
  );
  const merged = templates.map(
    (template) => storedBySeed.get(template.seedKey ?? "") ?? template,
  );
  const custom = stored.filter(
    (page) => !page.seedKey || !templateKeys.has(page.seedKey),
  );

  return [...merged, ...custom].sort(
    (a, b) =>
      a.displayOrder - b.displayOrder ||
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function normalizeInput(
  input: CoursePageInput,
  existing: CoursePage[],
  currentId?: string,
) {
  const title = cleanText(input.title);
  const bodyHtml = sanitizeBlogHtml(input.bodyHtml);
  const baseSlug =
    slugifyBlogTitle(input.slug || title) || `course-${Date.now()}`;
  const taken = new Set(
    existing.filter((page) => page.id !== currentId).map((page) => page.slug),
  );
  let slug = baseSlug;
  let index = 2;
  let status: CoursePageStatus = "draft";

  if (input.status === "published") {
    status = "published";
  } else if (input.status === "archived") {
    status = "archived";
  }

  while (taken.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return {
    seedKey: cleanText(input.seedKey) || null,
    title,
    titleMr: cleanText(input.titleMr) || null,
    slug,
    summary: cleanText(input.summary),
    summaryMr: cleanText(input.summaryMr) || null,
    bodyHtml,
    bodyHtmlMr: input.bodyHtmlMr ? sanitizeBlogHtml(input.bodyHtmlMr) : null,
    category: cleanText(input.category) || "Course",
    categoryMr: cleanText(input.categoryMr) || null,
    division: parseDivision(input.division),
    medium: parseMedium(input.medium),
    audience: cleanText(input.audience) || null,
    audienceMr: cleanText(input.audienceMr) || null,
    exams: cleanText(input.exams) || null,
    examsMr: cleanText(input.examsMr) || null,
    duration: cleanText(input.duration) || null,
    durationMr: cleanText(input.durationMr) || null,
    image: safeCoverImageUrl(cleanText(input.image)) || DEFAULT_IMAGE,
    imageAlt: cleanText(input.imageAlt) || null,
    imageAltMr: cleanText(input.imageAltMr) || null,
    status,
    seoTitle: cleanText(input.seoTitle) || null,
    seoTitleMr: cleanText(input.seoTitleMr) || null,
    seoDescription: cleanText(input.seoDescription) || null,
    seoDescriptionMr: cleanText(input.seoDescriptionMr) || null,
    displayOrder: Number.isFinite(input.displayOrder)
      ? Number(input.displayOrder)
      : 100,
  };
}

export async function listCoursePages() {
  const stored = await listStoredCoursePages();
  return mergeCoursePages(stored);
}

export async function listPublishedCourseCards(
  locale = "en",
): Promise<CourseCard[]> {
  return (await listCoursePages())
    .filter((page) => page.status === "published")
    .map((page) => localize(page, locale))
    .map((page) => ({
      eyebrow: page.category,
      title: page.title,
      body: page.summary,
      image: page.image,
      href: `/courses/${page.slug}`,
      division: page.division,
      medium: page.medium,
    }));
}

export async function getCoursePageBySlug(
  slug: string,
  publishedOnly = true,
  locale = "en",
) {
  const normalized = slugifyBlogTitle(slug);
  const page =
    (await listCoursePages()).find((item) => item.slug === normalized) ?? null;

  if (!page) return null;
  if (publishedOnly && page.status !== "published") return null;

  return localize(page, locale);
}

export async function getCoursePageBySeedKey(
  seedKey: string,
  publishedOnly = true,
  locale = "en",
) {
  const page =
    (await listCoursePages()).find((item) => item.seedKey === seedKey) ?? null;

  if (!page) return null;
  if (publishedOnly && page.status !== "published") return null;

  return localize(page, locale);
}

export async function saveCoursePage(
  id: string | null,
  input: CoursePageInput,
) {
  const now = new Date().toISOString();
  const stored = await listStoredCoursePages();
  const merged = mergeCoursePages(stored);
  const existing =
    stored.find((page) => page.id === id) ??
    stored.find((page) => page.seedKey && page.seedKey === input.seedKey) ??
    null;
  const values = normalizeInput(input, merged, existing?.id ?? id ?? undefined);
  const publishedAt =
    values.status === "published"
      ? (existing?.publishedAt ?? now)
      : values.status === "draft"
        ? null
        : (existing?.publishedAt ?? null);
  const page: CoursePage = {
    id: existing?.id ?? crypto.randomUUID(),
    ...values,
    publishedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_course_pages (
        id,
        seed_key,
        title,
        title_mr,
        slug,
        summary,
        summary_mr,
        body_html,
        body_html_mr,
        category,
        category_mr,
        division,
        medium,
        audience,
        audience_mr,
        exams,
        exams_mr,
        duration,
        duration_mr,
        image,
        image_alt,
        image_alt_mr,
        status,
        seo_title,
        seo_title_mr,
        seo_description,
        seo_description_mr,
        display_order,
        published_at,
        created_at,
        updated_at
      )
      VALUES (
        ${page.id},
        ${page.seedKey},
        ${page.title},
        ${page.titleMr},
        ${page.slug},
        ${page.summary},
        ${page.summaryMr},
        ${page.bodyHtml},
        ${page.bodyHtmlMr},
        ${page.category},
        ${page.categoryMr},
        ${page.division},
        ${page.medium},
        ${page.audience},
        ${page.audienceMr},
        ${page.exams},
        ${page.examsMr},
        ${page.duration},
        ${page.durationMr},
        ${page.image},
        ${page.imageAlt},
        ${page.imageAltMr},
        ${page.status},
        ${page.seoTitle},
        ${page.seoTitleMr},
        ${page.seoDescription},
        ${page.seoDescriptionMr},
        ${page.displayOrder},
        ${page.publishedAt},
        ${page.createdAt},
        ${page.updatedAt}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        seed_key = EXCLUDED.seed_key,
        title = EXCLUDED.title,
        title_mr = EXCLUDED.title_mr,
        slug = EXCLUDED.slug,
        summary = EXCLUDED.summary,
        summary_mr = EXCLUDED.summary_mr,
        body_html = EXCLUDED.body_html,
        body_html_mr = EXCLUDED.body_html_mr,
        category = EXCLUDED.category,
        category_mr = EXCLUDED.category_mr,
        division = EXCLUDED.division,
        medium = EXCLUDED.medium,
        audience = EXCLUDED.audience,
        audience_mr = EXCLUDED.audience_mr,
        exams = EXCLUDED.exams,
        exams_mr = EXCLUDED.exams_mr,
        duration = EXCLUDED.duration,
        duration_mr = EXCLUDED.duration_mr,
        image = EXCLUDED.image,
        image_alt = EXCLUDED.image_alt,
        image_alt_mr = EXCLUDED.image_alt_mr,
        status = EXCLUDED.status,
        seo_title = EXCLUDED.seo_title,
        seo_title_mr = EXCLUDED.seo_title_mr,
        seo_description = EXCLUDED.seo_description,
        seo_description_mr = EXCLUDED.seo_description_mr,
        display_order = EXCLUDED.display_order,
        published_at = EXCLUDED.published_at,
        updated_at = EXCLUDED.updated_at
    `;
    return page;
  }

  const next = existing
    ? stored.map((item) => (item.id === existing.id ? page : item))
    : [page, ...stored];
  await writeJsonFile(COURSE_PAGES_FILE, next);

  return page;
}
