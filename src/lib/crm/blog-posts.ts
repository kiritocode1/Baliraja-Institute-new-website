import crypto from "node:crypto";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";
import { blogPosts as staticBlogPosts } from "@/lib/site";

export const blogPostStatuses = ["draft", "published", "archived"] as const;

export type BlogPostStatus = (typeof blogPostStatuses)[number];

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  category: string;
  author: string | null;
  readTime: string;
  image: string;
  status: BlogPostStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt: string;
  bodyHtml: string;
  category: string;
  author?: string | null;
  readTime?: string;
  image: string;
  status: BlogPostStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type BlogCard = {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  href: string;
};

const BLOG_POSTS_FILE = "crm-blog-posts.json";
const DEFAULT_CATEGORY = "Guidance";
const DEFAULT_IMAGE = "/img-classroom.jpg";

function isBlogPostStatus(value: string): value is BlogPostStatus {
  return blogPostStatuses.includes(value as BlogPostStatus);
}

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyBlogTitle(value: string) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadTime(html: string) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
}

function safeUrl(value: string, allowedDataImages = false) {
  const trimmed = value.trim();

  if (!trimmed) return "";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return trimmed;
    if (
      allowedDataImages &&
      url.protocol === "data:" &&
      /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);/i.test(trimmed)
    ) {
      return trimmed;
    }
  } catch {
    return "";
  }

  return "";
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

export function sanitizeBlogHtml(input: string) {
  const allowedTags = new Set([
    "a",
    "blockquote",
    "br",
    "div",
    "em",
    "figcaption",
    "figure",
    "h2",
    "h3",
    "h4",
    "hr",
    "img",
    "li",
    "ol",
    "p",
    "strong",
    "ul",
  ]);

  let html = input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\/?(?:iframe|object|embed|form|input|button|select|textarea|svg|math|meta|link)[^>]*>/gi,
      "",
    );

  html = html.replace(
    /<\/?([a-z0-9-]+)([^>]*)>/gi,
    (match, rawTag, rawAttrs) => {
      const tag = String(rawTag).toLowerCase();
      const closing = match.startsWith("</");

      if (!allowedTags.has(tag)) return "";
      if (closing) return `</${tag}>`;

      const attrs: string[] = [];
      const attrRe =
        /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
      for (const attrMatch of String(rawAttrs).matchAll(attrRe)) {
        const name = attrMatch[1].toLowerCase();
        const value = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

        if (name.startsWith("on") || name === "style" || name === "srcset") {
          continue;
        }

        if (tag === "a" && name === "href") {
          const href = safeUrl(value);
          if (href) attrs.push(`href="${href.replace(/"/g, "&quot;")}"`);
          continue;
        }

        if (tag === "a" && (name === "target" || name === "rel")) {
          continue;
        }

        if (tag === "img" && name === "src") {
          const src = safeUrl(value, true);
          if (src) attrs.push(`src="${src.replace(/"/g, "&quot;")}"`);
          continue;
        }

        if (tag === "img" && (name === "alt" || name === "title")) {
          attrs.push(`${name}="${cleanText(value).replace(/"/g, "&quot;")}"`);
        }
      }

      if (tag === "a")
        attrs.push('rel="noopener noreferrer"', 'target="_blank"');
      return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
    },
  );

  return html.trim();
}

function normalizeInput(
  input: BlogPostInput,
  existing: BlogPost[],
  currentId?: string,
) {
  const title = cleanText(input.title);
  const bodyHtml = sanitizeBlogHtml(input.bodyHtml);
  let status: BlogPostStatus = "draft";

  if (input.status === "published") {
    status = "published";
  } else if (input.status === "archived") {
    status = "archived";
  }
  const baseSlug =
    slugifyBlogTitle(input.slug || title) || `post-${Date.now()}`;
  const taken = new Set(
    existing.filter((post) => post.id !== currentId).map((post) => post.slug),
  );
  let slug = baseSlug;
  let index = 2;

  while (taken.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return {
    title,
    slug,
    excerpt: cleanText(input.excerpt),
    bodyHtml,
    category: cleanText(input.category) || DEFAULT_CATEGORY,
    author: cleanText(input.author) || null,
    readTime: cleanText(input.readTime) || estimateReadTime(bodyHtml),
    image: safeCoverImageUrl(cleanText(input.image)) || DEFAULT_IMAGE,
    status,
    seoTitle: cleanText(input.seoTitle) || null,
    seoDescription: cleanText(input.seoDescription) || null,
  };
}

function mapDbBlogPost(row: Record<string, unknown>): BlogPost {
  const status = String(row.status);

  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt),
    bodyHtml: String(row.body_html),
    category: String(row.category),
    author: row.author ? String(row.author) : null,
    readTime: String(row.read_time),
    image: String(row.image),
    status: isBlogPostStatus(status) ? status : "draft",
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    publishedAt: row.published_at
      ? new Date(String(row.published_at)).toISOString()
      : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function listLocalBlogPosts() {
  return readJsonFile<BlogPost[]>(BLOG_POSTS_FILE, []);
}

async function listExistingBlogPosts() {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        title,
        slug,
        excerpt,
        body_html,
        category,
        author,
        read_time,
        image,
        status,
        seo_title,
        seo_description,
        published_at,
        created_at,
        updated_at
      FROM crm_blog_posts
      ORDER BY updated_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbBlogPost(row));
  }

  return listLocalBlogPosts();
}

export async function listBlogPosts() {
  return listExistingBlogPosts();
}

export async function listPublishedBlogCards(
  limit?: number,
): Promise<BlogCard[]> {
  const posts = (await listExistingBlogPosts())
    .filter((post) => post.status === "published")
    .sort((a, b) => {
      const aDate = a.publishedAt ?? a.updatedAt;
      const bDate = b.publishedAt ?? b.updatedAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  if (posts.length === 0) {
    return staticBlogPosts.slice(0, limit).map((post) => ({ ...post }));
  }

  return posts.slice(0, limit).map((post) => ({
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    readTime: post.readTime,
    image: post.image,
    href: `/news-events/${post.slug}`,
  }));
}

export async function getBlogPostBySlug(slug: string, publishedOnly = true) {
  const normalized = slugifyBlogTitle(slug);
  const posts = await listExistingBlogPosts();
  const post = posts.find((item) => item.slug === normalized) ?? null;

  if (!post) return null;
  if (publishedOnly && post.status !== "published") return null;

  return post;
}

export async function createBlogPost(input: BlogPostInput) {
  const now = new Date().toISOString();
  const existing = await listExistingBlogPosts();
  const values = normalizeInput(input, existing);
  const post: BlogPost = {
    id: crypto.randomUUID(),
    ...values,
    publishedAt: values.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_blog_posts (
        id,
        title,
        slug,
        excerpt,
        body_html,
        category,
        author,
        read_time,
        image,
        status,
        seo_title,
        seo_description,
        published_at,
        created_at,
        updated_at
      )
      VALUES (
        ${post.id},
        ${post.title},
        ${post.slug},
        ${post.excerpt},
        ${post.bodyHtml},
        ${post.category},
        ${post.author},
        ${post.readTime},
        ${post.image},
        ${post.status},
        ${post.seoTitle},
        ${post.seoDescription},
        ${post.publishedAt},
        ${post.createdAt},
        ${post.updatedAt}
      )
    `;
    return post;
  }

  await writeJsonFile(BLOG_POSTS_FILE, [post, ...existing]);
  return post;
}

export async function updateBlogPost(id: string, input: BlogPostInput) {
  const now = new Date().toISOString();
  const existing = await listExistingBlogPosts();
  const current = existing.find((post) => post.id === id);

  if (!current) throw new Error("Blog post not found.");

  const values = normalizeInput(input, existing, id);
  const publishedAt =
    values.status === "published"
      ? (current.publishedAt ?? now)
      : values.status === "draft"
        ? null
        : current.publishedAt;
  const post: BlogPost = {
    ...current,
    ...values,
    publishedAt,
    updatedAt: now,
  };
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      UPDATE crm_blog_posts
      SET
        title = ${post.title},
        slug = ${post.slug},
        excerpt = ${post.excerpt},
        body_html = ${post.bodyHtml},
        category = ${post.category},
        author = ${post.author},
        read_time = ${post.readTime},
        image = ${post.image},
        status = ${post.status},
        seo_title = ${post.seoTitle},
        seo_description = ${post.seoDescription},
        published_at = ${post.publishedAt},
        updated_at = ${post.updatedAt}
      WHERE id = ${id}
    `;
    return post;
  }

  await writeJsonFile(
    BLOG_POSTS_FILE,
    existing.map((item) => (item.id === id ? post : item)),
  );
  return post;
}

export async function deleteBlogPost(id: string) {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      DELETE FROM crm_blog_posts
      WHERE id = ${id}
    `;
    return;
  }

  const existing = await listLocalBlogPosts();
  await writeJsonFile(
    BLOG_POSTS_FILE,
    existing.filter((post) => post.id !== id),
  );
}
