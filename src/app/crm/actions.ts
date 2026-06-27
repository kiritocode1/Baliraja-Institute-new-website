"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addAdmin, setAdminActive } from "@/lib/crm/admins";
import { clearAdminSession, requireAdminSession } from "@/lib/crm/auth";
import {
  type BlogPostInput,
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
} from "@/lib/crm/blog-posts";
import { normalizeEmail } from "@/lib/crm/config";
import { parseLeadStatus, updateLead } from "@/lib/crm/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function revalidateBlogSurfaces() {
  revalidatePath("/crm");
  revalidatePath("/");
  revalidatePath("/news-events");
  revalidatePath("/news-events/[slug]", "page");
}

function parseBlogPostInput(input: BlogPostInput): BlogPostInput {
  const title = String(input.title ?? "").trim();
  const excerpt = String(input.excerpt ?? "").trim();
  const bodyHtml = String(input.bodyHtml ?? "").trim();
  const category = String(input.category ?? "").trim() || "Guidance";
  const image = String(input.image ?? "").trim() || "/img-classroom.jpg";

  if (!title || !excerpt || !bodyHtml) {
    throw new Error("Title, excerpt, and article body are required.");
  }

  return {
    title,
    slug: String(input.slug ?? "").trim(),
    excerpt,
    bodyHtml,
    category,
    author: String(input.author ?? "").trim() || null,
    readTime: String(input.readTime ?? "").trim(),
    image,
    status:
      input.status === "published" || input.status === "archived"
        ? input.status
        : "draft",
    seoTitle: String(input.seoTitle ?? "").trim() || null,
    seoDescription: String(input.seoDescription ?? "").trim() || null,
  };
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/crm/login");
}

export async function updateLeadAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const status = parseLeadStatus(String(formData.get("status") ?? ""));
  const assignedTo = String(formData.get("assignedTo") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id || !status) {
    throw new Error("Invalid lead update.");
  }

  await updateLead(id, { status, assignedTo, notes });
  revalidatePath("/crm");
}

export async function addAdminAction(formData: FormData) {
  await requireAdminSession();

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const name = String(formData.get("name") ?? "").trim() || null;

  if (!EMAIL_RE.test(email)) {
    throw new Error("Invalid admin email.");
  }

  await addAdmin({ email, name });
  revalidatePath("/crm");
}

export async function setAdminActiveAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const active = String(formData.get("active") ?? "") === "true";

  if (!id) {
    throw new Error("Invalid admin update.");
  }

  if (email === session.email && !active) {
    throw new Error("You cannot deactivate your own admin access.");
  }

  await setAdminActive(id, active);
  revalidatePath("/crm");
}

export async function createBlogPostAction(input: BlogPostInput) {
  await requireAdminSession();

  const post = await createBlogPost(parseBlogPostInput(input));
  revalidateBlogSurfaces();

  return { success: true, post };
}

export async function updateBlogPostAction(id: string, input: BlogPostInput) {
  await requireAdminSession();

  if (!id) {
    throw new Error("Invalid blog post update.");
  }

  const post = await updateBlogPost(id, parseBlogPostInput(input));
  revalidateBlogSurfaces();

  return { success: true, post };
}

export async function deleteBlogPostAction(id: string) {
  await requireAdminSession();

  if (!id) {
    throw new Error("Invalid blog post delete.");
  }

  await deleteBlogPost(id);
  revalidateBlogSurfaces();

  return { success: true };
}
