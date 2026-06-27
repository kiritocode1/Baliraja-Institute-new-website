import type { MetadataRoute } from "next";
import { listBlogPosts } from "@/lib/crm/blog-posts";
import { listCoursePages } from "@/lib/crm/course-pages";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type SitemapEntry = MetadataRoute.Sitemap[number];

const staticRoutes: Array<{
  path: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.75 },
  { path: "/student-life", changeFrequency: "monthly", priority: 0.7 },
  { path: "/courses", changeFrequency: "weekly", priority: 0.9 },
  { path: "/admissions", changeFrequency: "weekly", priority: 0.9 },
  { path: "/scholarships", changeFrequency: "monthly", priority: 0.7 },
  { path: "/news-events", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.65 },
];

function absoluteUrl(path: string) {
  return new URL(path, site.websiteHref).toString();
}

function absoluteImageUrl(value: string) {
  try {
    return new URL(value, site.websiteHref).toString();
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [courses, blogs] = await Promise.all([
    listCoursePages(),
    listBlogPosts(),
  ]);
  const courseEntries = courses
    .filter((page) => page.status === "published")
    .map((page) => {
      const image = absoluteImageUrl(page.image);

      return {
        url: absoluteUrl(`/courses/${page.slug}`),
        lastModified: new Date(page.updatedAt),
        changeFrequency: "weekly" as const,
        priority: page.seedKey?.startsWith("featured-") ? 0.86 : 0.78,
        ...(image ? { images: [image] } : {}),
      };
    });
  const blogEntries = blogs
    .filter((post) => post.status === "published")
    .map((post) => {
      const image = absoluteImageUrl(post.image);

      return {
        url: absoluteUrl(`/news-events/${post.slug}`),
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.66,
        ...(image ? { images: [image] } : {}),
      };
    });

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...courseEntries,
    ...blogEntries,
  ];
}
