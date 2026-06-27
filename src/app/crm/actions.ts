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
import {
  type CoursePageInput,
  type CoursePageStatus,
  saveCoursePage,
} from "@/lib/crm/course-pages";
import { getLeadById, parseLeadStatus, updateLead } from "@/lib/crm/leads";
import {
  createCourseNotice,
  createEnrollment,
  createFeeInvoice,
  findCourseOption,
  listCourseOptions,
  type NoticeStatus,
  type NoticeTargetScope,
  saveStudent,
  setStudentActive,
} from "@/lib/crm/students";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function revalidateBlogSurfaces() {
  revalidatePath("/crm");
  revalidatePath("/");
  revalidatePath("/news-events");
  revalidatePath("/news-events/[slug]", "page");
}

function revalidateCourseSurfaces() {
  revalidatePath("/crm");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/sitemap.xml");
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

function parseCourseStatus(status: CoursePageStatus): CoursePageStatus {
  if (status === "published" || status === "archived") return status;
  return "draft";
}

function parseCoursePageInput(input: CoursePageInput): CoursePageInput {
  const title = String(input.title ?? "").trim();
  const summary = String(input.summary ?? "").trim();
  const bodyHtml = String(input.bodyHtml ?? "").trim();
  const category = String(input.category ?? "").trim() || "Course";
  const image = String(input.image ?? "").trim() || "/img-reading.jpg";
  const displayOrder = Number(input.displayOrder ?? 100);

  if (!title || !summary || !bodyHtml) {
    throw new Error("Title, summary, and course body are required.");
  }

  return {
    seedKey: String(input.seedKey ?? "").trim() || null,
    title,
    slug: String(input.slug ?? "").trim(),
    summary,
    bodyHtml,
    category,
    audience: String(input.audience ?? "").trim() || null,
    exams: String(input.exams ?? "").trim() || null,
    duration: String(input.duration ?? "").trim() || null,
    image,
    imageAlt: String(input.imageAlt ?? "").trim() || null,
    status: parseCourseStatus(input.status),
    seoTitle: String(input.seoTitle ?? "").trim() || null,
    seoDescription: String(input.seoDescription ?? "").trim() || null,
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 100,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textareaToHtml(value: string) {
  const trimmed = value.trim();

  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  return trimmed
    .split(/\n{2,}/)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

function parseNoticeStatus(value: string): NoticeStatus {
  if (value === "published" || value === "archived") return value;
  return "draft";
}

function parseNoticeTargetScope(value: string): NoticeTargetScope {
  if (value === "course" || value === "batch" || value === "student") {
    return value;
  }

  return "all";
}

function parseRupeesToPaise(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return 0;

  return Math.round(amount * 100);
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

export async function saveCoursePageAction(
  id: string | null,
  input: CoursePageInput,
) {
  await requireAdminSession();

  const page = await saveCoursePage(id || null, parseCoursePageInput(input));
  revalidateCourseSurfaces();

  return { success: true, page };
}

export async function saveStudentAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const phone = String(formData.get("phone") ?? "").trim();
  const guardianName =
    String(formData.get("guardianName") ?? "").trim() || null;
  const guardianPhone =
    String(formData.get("guardianPhone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !EMAIL_RE.test(email) || !phone) {
    throw new Error("Student name, email, and phone are required.");
  }

  await saveStudent(id, {
    name,
    email,
    phone,
    guardianName,
    guardianPhone,
    active: true,
    notes,
  });
  revalidatePath("/crm");
  revalidatePath("/student");
}

export async function setStudentActiveAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";

  if (!id) throw new Error("Invalid student update.");

  await setStudentActive(id, active);
  revalidatePath("/crm");
  revalidatePath("/student");
}

export async function createEnrollmentAction(formData: FormData) {
  await requireAdminSession();

  const studentId = String(formData.get("studentId") ?? "").trim();
  const courseKey = String(formData.get("courseKey") ?? "").trim();
  const batchName = String(formData.get("batchName") ?? "").trim() || null;

  if (!studentId || !courseKey) {
    throw new Error("Student and course are required.");
  }

  await createEnrollment({ studentId, courseKey, batchName });
  revalidatePath("/crm");
  revalidatePath("/student");
}

export async function convertLeadToStudentAction(formData: FormData) {
  await requireAdminSession();

  const leadId = String(formData.get("leadId") ?? "").trim();
  const courseKey = String(formData.get("courseKey") ?? "").trim();
  const batchName =
    String(formData.get("batchName") ?? "").trim() || "Admissions batch";
  const lead = await getLeadById(leadId);

  if (!lead || !lead.email) {
    throw new Error("Lead must have an email before student login can work.");
  }

  const student = await saveStudent(null, {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    active: true,
    notes: lead.message,
  });

  if (!student) throw new Error("Unable to create student.");

  const options = await listCourseOptions();
  const matchedCourse =
    (courseKey ? await findCourseOption(courseKey) : null) ??
    options.find(
      (course) =>
        course.title.toLowerCase() === lead.track.toLowerCase() ||
        course.slug.toLowerCase() === lead.track.toLowerCase(),
    );

  if (matchedCourse) {
    await createEnrollment({
      studentId: student.id,
      courseKey: matchedCourse.key,
      batchName,
    });
  }

  await updateLead(lead.id, {
    status: "enrolled",
    assignedTo: lead.assignedTo,
    notes: lead.notes,
  });
  revalidatePath("/crm");
  revalidatePath("/student");
}

export async function createCourseNoticeAction(formData: FormData) {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  const bodyHtml = textareaToHtml(String(formData.get("body") ?? ""));
  const status = parseNoticeStatus(String(formData.get("status") ?? ""));
  const targetScope = parseNoticeTargetScope(
    String(formData.get("targetScope") ?? ""),
  );

  await createCourseNotice({
    title,
    bodyHtml,
    status,
    targetScope,
    courseKey: String(formData.get("courseKey") ?? "").trim() || null,
    batchName: String(formData.get("batchName") ?? "").trim() || null,
    studentId: String(formData.get("studentId") ?? "").trim() || null,
    attachmentUrl: String(formData.get("attachmentUrl") ?? "").trim() || null,
    attachmentName: String(formData.get("attachmentName") ?? "").trim() || null,
    expiresAt: String(formData.get("expiresAt") ?? "").trim() || null,
  });
  revalidatePath("/crm");
  revalidatePath("/student");
  revalidatePath("/student/notices");
}

export async function createFeeInvoiceAction(formData: FormData) {
  await requireAdminSession();

  const studentId = String(formData.get("studentId") ?? "").trim();
  const enrollmentId =
    String(formData.get("enrollmentId") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const amountPaise = parseRupeesToPaise(
    String(formData.get("amountRupees") ?? ""),
  );
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;

  if (!studentId || !title || amountPaise < 100) {
    throw new Error("Student, fee title, and amount are required.");
  }

  await createFeeInvoice({
    studentId,
    enrollmentId,
    title,
    description,
    amountPaise,
    dueDate,
  });
  revalidatePath("/crm");
  revalidatePath("/student");
  revalidatePath("/student/fees");
}
