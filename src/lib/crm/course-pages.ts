import crypto from "node:crypto";
import { sanitizeBlogHtml, slugifyBlogTitle } from "@/lib/crm/blog-posts";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";
import { examTracks, featuredExams } from "@/lib/site";

export const coursePageStatuses = ["draft", "published", "archived"] as const;

export type CoursePageStatus = (typeof coursePageStatuses)[number];

export type CoursePage = {
  id: string;
  seedKey: string | null;
  title: string;
  slug: string;
  summary: string;
  bodyHtml: string;
  category: string;
  audience: string | null;
  exams: string | null;
  duration: string | null;
  image: string;
  imageAlt: string | null;
  status: CoursePageStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CoursePageInput = {
  seedKey?: string | null;
  title: string;
  slug?: string;
  summary: string;
  bodyHtml: string;
  category: string;
  audience?: string | null;
  exams?: string | null;
  duration?: string | null;
  image: string;
  imageAlt?: string | null;
  status: CoursePageStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  displayOrder?: number;
};

export type CourseCard = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  href: string;
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

function safeCoverImageUrl(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;

  try {
    const url = new URL(trimmed);

    if (
      url.protocol === "https:" &&
      (url.hostname === "images.unsplash.com" ||
        url.hostname.endsWith(".public.blob.vercel-storage.com"))
    ) {
      return trimmed;
    }
  } catch {
    return "";
  }

  return "";
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
    slug: slugifyBlogTitle(course.title),
    summary: course.blurb,
    bodyHtml: courseBody({
      title: course.title,
      summary: course.blurb,
      exams: course.exams,
      audience: "defence aspirants",
    }),
    category: "Defence",
    audience: "Defence aspirants",
    exams: course.exams,
    duration: "Foundation, crash, and interview-preparation support",
    image: course.image,
    imageAlt: course.alt,
    status: "published" as const,
    seoTitle: null,
    seoDescription: course.blurb,
    displayOrder: index + 1,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  }));
  const tracks = examTracks.map((track, index) => ({
    id: `static-track-${slugifyBlogTitle(track.title)}`,
    seedKey: `track-${slugifyBlogTitle(track.title)}`,
    title: track.title,
    slug: slugifyBlogTitle(track.title),
    summary: track.blurb,
    bodyHtml: courseBody({
      title: track.title,
      summary: track.blurb,
      exams: track.title,
    }),
    category: "Exam track",
    audience: `${track.title} aspirants`,
    exams: track.title,
    duration: "Foundation, test-series, and revision support",
    image: track.image,
    imageAlt: null,
    status: "published" as const,
    seoTitle: null,
    seoDescription: track.blurb,
    displayOrder: featured.length + index + 1,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  }));

  return [...featured, ...tracks];
}

function mapDbCoursePage(row: Record<string, unknown>): CoursePage {
  const status = String(row.status);

  return {
    id: String(row.id),
    seedKey: row.seed_key ? String(row.seed_key) : null,
    title: String(row.title),
    slug: String(row.slug),
    summary: String(row.summary),
    bodyHtml: String(row.body_html),
    category: String(row.category),
    audience: row.audience ? String(row.audience) : null,
    exams: row.exams ? String(row.exams) : null,
    duration: row.duration ? String(row.duration) : null,
    image: String(row.image),
    imageAlt: row.image_alt ? String(row.image_alt) : null,
    status: isCoursePageStatus(status) ? status : "draft",
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
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
        slug,
        summary,
        body_html,
        category,
        audience,
        exams,
        duration,
        image,
        image_alt,
        status,
        seo_title,
        seo_description,
        display_order,
        published_at,
        created_at,
        updated_at
      FROM crm_course_pages
      ORDER BY display_order ASC, updated_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbCoursePage(row));
  }

  return readJsonFile<CoursePage[]>(COURSE_PAGES_FILE, []);
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
    slug,
    summary: cleanText(input.summary),
    bodyHtml,
    category: cleanText(input.category) || "Course",
    audience: cleanText(input.audience) || null,
    exams: cleanText(input.exams) || null,
    duration: cleanText(input.duration) || null,
    image: safeCoverImageUrl(cleanText(input.image)) || DEFAULT_IMAGE,
    imageAlt: cleanText(input.imageAlt) || null,
    status,
    seoTitle: cleanText(input.seoTitle) || null,
    seoDescription: cleanText(input.seoDescription) || null,
    displayOrder: Number.isFinite(input.displayOrder)
      ? Number(input.displayOrder)
      : 100,
  };
}

export async function listCoursePages() {
  const stored = await listStoredCoursePages();
  return mergeCoursePages(stored);
}

export async function listPublishedCourseCards(): Promise<CourseCard[]> {
  return (await listCoursePages())
    .filter((page) => page.status === "published")
    .map((page) => ({
      eyebrow: page.category,
      title: page.title,
      body: page.summary,
      image: page.image,
      href: `/courses/${page.slug}`,
    }));
}

export async function getCoursePageBySlug(slug: string, publishedOnly = true) {
  const normalized = slugifyBlogTitle(slug);
  const page =
    (await listCoursePages()).find((item) => item.slug === normalized) ?? null;

  if (!page) return null;
  if (publishedOnly && page.status !== "published") return null;

  return page;
}

export async function getCoursePageBySeedKey(
  seedKey: string,
  publishedOnly = true,
) {
  const page =
    (await listCoursePages()).find((item) => item.seedKey === seedKey) ?? null;

  if (!page) return null;
  if (publishedOnly && page.status !== "published") return null;

  return page;
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
        slug,
        summary,
        body_html,
        category,
        audience,
        exams,
        duration,
        image,
        image_alt,
        status,
        seo_title,
        seo_description,
        display_order,
        published_at,
        created_at,
        updated_at
      )
      VALUES (
        ${page.id},
        ${page.seedKey},
        ${page.title},
        ${page.slug},
        ${page.summary},
        ${page.bodyHtml},
        ${page.category},
        ${page.audience},
        ${page.exams},
        ${page.duration},
        ${page.image},
        ${page.imageAlt},
        ${page.status},
        ${page.seoTitle},
        ${page.seoDescription},
        ${page.displayOrder},
        ${page.publishedAt},
        ${page.createdAt},
        ${page.updatedAt}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        seed_key = EXCLUDED.seed_key,
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        summary = EXCLUDED.summary,
        body_html = EXCLUDED.body_html,
        category = EXCLUDED.category,
        audience = EXCLUDED.audience,
        exams = EXCLUDED.exams,
        duration = EXCLUDED.duration,
        image = EXCLUDED.image,
        image_alt = EXCLUDED.image_alt,
        status = EXCLUDED.status,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description,
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
