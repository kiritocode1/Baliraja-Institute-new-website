"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addAdmin, isOwnerEmail, setAdminActive } from "@/lib/crm/admins";
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
import {
  createGalleryImage,
  deleteGalleryImage,
  updateGalleryImage,
} from "@/lib/crm/gallery";
import {
  getLeadById,
  parseConcessionStatusInput,
  parseLeadRequestType,
  parseLeadStatus,
  type StudentCategory,
  updateLead,
} from "@/lib/crm/leads";
import { uploadCrmMediaFile } from "@/lib/crm/media-upload";
import {
  createEnrollment,
  createFeeInvoice,
  defaultDocuments,
  deleteCourseNotice,
  findCourseOption,
  getStudentById,
  listCourseOptions,
  type NoticeStatus,
  type NoticeTargetScope,
  type StudentInput,
  saveCourseNotice,
  saveStudent,
  setStudentActive,
  updateStudentDocuments,
} from "@/lib/crm/students";
import { createTest, getTestById, saveTestResults } from "@/lib/crm/tests";
import {
  type AdmissionFormInput,
  categoryValues,
} from "@/schemas/admission.schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function revalidateCrmPaths(...paths: string[]) {
  for (const path of new Set(["/crm", ...paths])) {
    revalidatePath(path);
  }
}

function revalidateBlogSurfaces() {
  revalidateCrmPaths("/crm/blog");
  revalidatePath("/");
  revalidatePath("/news-events");
  revalidatePath("/news-events/[slug]", "page");
}

function revalidateCourseSurfaces() {
  revalidateCrmPaths("/crm/courses");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/school");
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

  const mr = (value: unknown) => String(value ?? "").trim() || null;

  return {
    title,
    titleMr: mr(input.titleMr),
    slug: String(input.slug ?? "").trim(),
    excerpt,
    excerptMr: mr(input.excerptMr),
    bodyHtml,
    bodyHtmlMr: mr(input.bodyHtmlMr),
    category,
    categoryMr: mr(input.categoryMr),
    author: String(input.author ?? "").trim() || null,
    readTime: String(input.readTime ?? "").trim(),
    image,
    status:
      input.status === "published" || input.status === "archived"
        ? input.status
        : "draft",
    seoTitle: String(input.seoTitle ?? "").trim() || null,
    seoTitleMr: mr(input.seoTitleMr),
    seoDescription: String(input.seoDescription ?? "").trim() || null,
    seoDescriptionMr: mr(input.seoDescriptionMr),
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

  const mr = (value: unknown) => String(value ?? "").trim() || null;

  return {
    seedKey: String(input.seedKey ?? "").trim() || null,
    title,
    titleMr: mr(input.titleMr),
    slug: String(input.slug ?? "").trim(),
    summary,
    summaryMr: mr(input.summaryMr),
    bodyHtml,
    bodyHtmlMr: mr(input.bodyHtmlMr),
    category,
    categoryMr: mr(input.categoryMr),
    division: String(input.division ?? "").trim() || null,
    medium: String(input.medium ?? "").trim() || null,
    audience: String(input.audience ?? "").trim() || null,
    audienceMr: mr(input.audienceMr),
    exams: String(input.exams ?? "").trim() || null,
    examsMr: mr(input.examsMr),
    duration: String(input.duration ?? "").trim() || null,
    durationMr: mr(input.durationMr),
    image,
    imageAlt: String(input.imageAlt ?? "").trim() || null,
    imageAltMr: mr(input.imageAltMr),
    status: parseCourseStatus(input.status),
    seoTitle: String(input.seoTitle ?? "").trim() || null,
    seoTitleMr: mr(input.seoTitleMr),
    seoDescription: String(input.seoDescription ?? "").trim() || null,
    seoDescriptionMr: mr(input.seoDescriptionMr),
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

function optionalNumber(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? "").trim();

  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseStudentCategory(value: string): StudentCategory | null {
  return (categoryValues as readonly string[]).includes(value)
    ? (value as StudentCategory)
    : null;
}

/** Shared by the add-student and edit-profile forms. */
function studentProfileFromForm(formData: FormData): Partial<StudentInput> {
  const gender = String(formData.get("gender") ?? "").trim();
  const education: NonNullable<AdmissionFormInput["education"]> = {};
  const tenth = optionalNumber(formData, "educationTenth");
  const twelfth = optionalNumber(formData, "educationTwelfth");
  const twelfthStream = String(
    formData.get("educationTwelfthStream") ?? "",
  ).trim();
  const graduationCourse = String(
    formData.get("educationGraduationCourse") ?? "",
  ).trim();
  const graduation = optionalNumber(formData, "educationGraduation");

  if (tenth !== null) education.tenth = { percentage: tenth };
  if (twelfth !== null) {
    education.twelfth = {
      ...(twelfthStream ? { stream: twelfthStream } : {}),
      percentage: twelfth,
    };
  }
  if (graduationCourse) {
    education.graduation = {
      course: graduationCourse,
      ...(graduation !== null ? { percentage: graduation } : {}),
    };
  }

  return {
    gender: gender === "male" || gender === "female" ? gender : null,
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    fullAddress: String(formData.get("fullAddress") ?? ""),
    category: parseStudentCategory(String(formData.get("category") ?? "")),
    maharashtraDomicile: formData.get("maharashtraDomicile") === "true",
    heightCm: optionalNumber(formData, "heightCm"),
    weightKg: optionalNumber(formData, "weightKg"),
    chestCm: optionalNumber(formData, "chestCm"),
    education: Object.keys(education).length > 0 ? education : null,
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
  const requestType = parseLeadRequestType(
    String(formData.get("requestType") ?? ""),
  );
  const assignedTo = String(formData.get("assignedTo") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id || !status || !requestType) {
    throw new Error("Invalid lead update.");
  }

  // Concession fields only travel from forms that render them.
  const hasConcession = formData.has("concessionStatus");
  const concessionStatus = hasConcession
    ? parseConcessionStatusInput(String(formData.get("concessionStatus") ?? ""))
    : undefined;
  const concessionNote = hasConcession
    ? String(formData.get("concessionNote") ?? "").trim() || null
    : undefined;

  await updateLead(id, {
    status,
    requestType,
    assignedTo,
    notes,
    concessionStatus,
    concessionNote,
  });
  revalidateCrmPaths("/crm/leads", "/crm/scholarships");
}

async function requireOwnerSession() {
  const session = await requireAdminSession();

  if (!(await isOwnerEmail(session.email))) {
    throw new Error("Only owner admins can manage CRM access.");
  }

  return session;
}

export async function addAdminAction(formData: FormData) {
  await requireOwnerSession();

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const name = String(formData.get("name") ?? "").trim() || null;
  const role =
    String(formData.get("role") ?? "") === "staff" ? "staff" : "admin";

  if (!EMAIL_RE.test(email)) {
    throw new Error("Invalid admin email.");
  }

  await addAdmin({ email, name, role });
  revalidateCrmPaths("/crm/admins");
}

export async function setAdminActiveAction(formData: FormData) {
  const session = await requireOwnerSession();
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
  revalidateCrmPaths("/crm/admins");
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

  if (!name || !phone) {
    throw new Error("Student name and phone are required.");
  }

  if (email && !EMAIL_RE.test(email)) {
    throw new Error("Enter a valid email or leave it empty.");
  }

  await saveStudent(id, {
    name,
    email: email || null,
    phone,
    guardianName,
    guardianPhone,
    active: true,
    notes,
    ...studentProfileFromForm(formData),
  });
  revalidateCrmPaths("/crm/students");
  revalidatePath("/student");
}

export async function updateStudentDocumentsAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const student = id ? await getStudentById(id) : null;

  if (!student) throw new Error("Student not found.");

  const documents = (
    student.documents.length > 0 ? student.documents : defaultDocuments()
  ).map((doc) => ({
    name: doc.name,
    submitted: formData.get(`doc:${doc.name}`) === "on",
  }));

  await updateStudentDocuments(id, documents);
  revalidateCrmPaths("/crm/students");
}

export async function setStudentActiveAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";

  if (!id) throw new Error("Invalid student update.");

  await setStudentActive(id, active);
  revalidateCrmPaths("/crm/students");
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
  revalidateCrmPaths("/crm/students");
  revalidatePath("/student");
}

export async function convertLeadToStudentAction(formData: FormData) {
  await requireAdminSession();

  const leadId = String(formData.get("leadId") ?? "").trim();
  const courseKey = String(formData.get("courseKey") ?? "").trim();
  const batchName =
    String(formData.get("batchName") ?? "").trim() || "Admissions batch";
  const lead = await getLeadById(leadId);

  if (!lead) throw new Error("Lead not found.");

  // Review-form values win; the lead's own data is the fallback.
  const name = String(formData.get("name") ?? "").trim() || lead.name;
  const email = normalizeEmail(
    String(formData.get("email") ?? "").trim() || lead.email || "",
  );
  const phone = String(formData.get("phone") ?? "").trim() || lead.phone;
  const guardianName =
    String(formData.get("guardianName") ?? "").trim() ||
    lead.guardianName ||
    null;
  const guardianPhone =
    String(formData.get("guardianPhone") ?? "").trim() || lead.mobile2 || null;
  const notes =
    String(formData.get("notes") ?? "").trim() ||
    lead.notes ||
    lead.message ||
    null;

  if (email && !EMAIL_RE.test(email)) {
    throw new Error("Enter a valid email or leave it empty.");
  }

  const student = await saveStudent(null, {
    name,
    email: email || null,
    phone,
    guardianName,
    guardianPhone,
    active: true,
    notes,
    // Everything the enquiry collected lands on the student record.
    gender: lead.gender,
    dateOfBirth: lead.dateOfBirth,
    fullAddress: lead.fullAddress,
    category: lead.category,
    maharashtraDomicile: lead.maharashtraDomicile,
    education: lead.education,
    heightCm: lead.heightCm,
    weightKg: lead.weightKg,
    chestCm: lead.chestCm,
    desiredPrograms: lead.desiredPrograms,
    leadId: lead.id,
    concessionStatus: lead.concessionStatus,
    concessionNote: lead.concessionNote,
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
    requestType: lead.requestType,
    assignedTo: lead.assignedTo,
    notes: lead.notes,
  });
  revalidateCrmPaths("/crm/leads", "/crm/scholarships", "/crm/students");
  revalidatePath("/student");
  redirect(`/crm/students/${student.id}`);
}

function revalidateGallerySurfaces() {
  revalidateCrmPaths("/crm/gallery");
  revalidatePath("/");
  revalidatePath("/gallery");
}

export async function uploadGalleryImageAction(formData: FormData) {
  await requireAdminSession();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image to upload.");
  }

  const uploaded = await uploadCrmMediaFile(file, "gallery");

  await createGalleryImage({
    url: uploaded.url,
    caption: String(formData.get("caption") ?? ""),
    captionMr: String(formData.get("captionMr") ?? ""),
    alt: String(formData.get("alt") ?? ""),
    altMr: String(formData.get("altMr") ?? ""),
    album: String(formData.get("album") ?? "campus"),
    sortOrder: optionalNumber(formData, "sortOrder"),
  });
  revalidateGallerySurfaces();
}

export async function updateGalleryImageAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) throw new Error("Invalid gallery update.");

  await updateGalleryImage(id, {
    caption: String(formData.get("caption") ?? ""),
    captionMr: String(formData.get("captionMr") ?? ""),
    alt: String(formData.get("alt") ?? ""),
    altMr: String(formData.get("altMr") ?? ""),
    album: String(formData.get("album") ?? "campus"),
    sortOrder: optionalNumber(formData, "sortOrder") ?? 100,
    published: formData.get("published") === "true",
  });
  revalidateGallerySurfaces();
}

export async function deleteGalleryImageAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) throw new Error("Invalid gallery delete.");

  await deleteGalleryImage(id);
  revalidateGallerySurfaces();
}

export async function createTestAction(formData: FormData) {
  await requireAdminSession();

  const kind =
    String(formData.get("kind") ?? "") === "ground" ? "ground" : "written";
  const test = await createTest({
    title: String(formData.get("title") ?? ""),
    kind,
    courseKey: String(formData.get("courseKey") ?? "").trim() || null,
    batchName: String(formData.get("batchName") ?? "").trim() || null,
    testDate: String(formData.get("testDate") ?? "").trim() || null,
    maxMarks: optionalNumber(formData, "maxMarks"),
    metricNames: String(formData.get("metricNames") ?? "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  revalidateCrmPaths("/crm/tests");
  redirect(`/crm/tests/${test.id}`);
}

export async function saveTestResultsAction(formData: FormData) {
  await requireAdminSession();

  const testId = String(formData.get("testId") ?? "").trim();
  const test = testId ? await getTestById(testId) : null;

  if (!test) throw new Error("Test not found.");

  const studentIds = formData.getAll("studentIds").map(String);
  const rows = studentIds.map((studentId) => {
    const marksRaw = String(formData.get(`marks:${studentId}`) ?? "").trim();
    const marks = marksRaw ? Number(marksRaw) : null;
    const metrics: Record<string, string> = {};

    for (const name of test.metricNames) {
      const value = String(
        formData.get(`metric:${studentId}:${name}`) ?? "",
      ).trim();
      if (value) metrics[name] = value;
    }

    return {
      studentId,
      marks: marks !== null && Number.isFinite(marks) ? marks : null,
      metrics,
      remarks:
        String(formData.get(`remarks:${studentId}`) ?? "").trim() || null,
    };
  });

  await saveTestResults(testId, rows);
  revalidateCrmPaths("/crm/tests");
  revalidatePath(`/crm/tests/${testId}`);
  revalidatePath("/student");
  revalidatePath("/student/results");
}

export async function saveCourseNoticeAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const bodyHtml = textareaToHtml(String(formData.get("body") ?? ""));
  const status = parseNoticeStatus(String(formData.get("status") ?? ""));
  const targetScope = parseNoticeTargetScope(
    String(formData.get("targetScope") ?? ""),
  );

  // Prefer an uploaded file; the URL field keeps or clears the current one.
  const attachment = formData.get("attachment");
  let attachmentUrl =
    String(formData.get("attachmentUrl") ?? "").trim() || null;
  let attachmentName =
    String(formData.get("attachmentName") ?? "").trim() || null;

  if (attachment instanceof File && attachment.size > 0) {
    const uploaded = await uploadCrmMediaFile(attachment, "notices");
    attachmentUrl = uploaded.url;
    attachmentName = attachmentName ?? uploaded.filename;
  }

  await saveCourseNotice(id, {
    title,
    bodyHtml,
    status,
    targetScope,
    courseKey: String(formData.get("courseKey") ?? "").trim() || null,
    batchName: String(formData.get("batchName") ?? "").trim() || null,
    studentId: String(formData.get("studentId") ?? "").trim() || null,
    attachmentUrl,
    attachmentName,
    expiresAt: String(formData.get("expiresAt") ?? "").trim() || null,
  });
  revalidateCrmPaths("/crm/notices", "/crm/students");
  revalidatePath("/student");
  revalidatePath("/student/notices");
}

export async function deleteCourseNoticeAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) throw new Error("Invalid notice delete.");

  await deleteCourseNotice(id);
  revalidateCrmPaths("/crm/notices", "/crm/students");
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
  revalidateCrmPaths("/crm/students");
  revalidatePath("/student");
  revalidatePath("/student/fees");
}
