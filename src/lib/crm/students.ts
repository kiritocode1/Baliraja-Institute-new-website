import crypto from "node:crypto";
import { sanitizeBlogHtml } from "@/lib/crm/blog-posts";
import { normalizeEmail } from "@/lib/crm/config";
import { listCoursePages } from "@/lib/crm/course-pages";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";

export const enrollmentStatuses = [
  "active",
  "paused",
  "completed",
  "cancelled",
] as const;
export const noticeStatuses = ["draft", "published", "archived"] as const;
export const noticeTargetScopes = [
  "all",
  "course",
  "batch",
  "student",
] as const;
export const feeInvoiceStatuses = [
  "pending",
  "processing",
  "paid",
  "cancelled",
  "refunded",
] as const;

export type EnrollmentStatus = (typeof enrollmentStatuses)[number];
export type NoticeStatus = (typeof noticeStatuses)[number];
export type NoticeTargetScope = (typeof noticeTargetScopes)[number];
export type FeeInvoiceStatus = (typeof feeInvoiceStatuses)[number];

export type CrmStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  guardianName: string | null;
  guardianPhone: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentEnrollment = {
  id: string;
  studentId: string;
  courseKey: string;
  courseTitle: string;
  courseSlug: string | null;
  batchName: string | null;
  status: EnrollmentStatus;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CourseNotice = {
  id: string;
  title: string;
  bodyHtml: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  targetScope: NoticeTargetScope;
  courseKey: string | null;
  batchName: string | null;
  studentId: string | null;
  status: NoticeStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeeInvoice = {
  id: string;
  studentId: string;
  enrollmentId: string | null;
  title: string;
  description: string | null;
  amountPaise: number;
  dueDate: string | null;
  status: FeeInvoiceStatus;
  razorpayOrderId: string | null;
  receiptNumber: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeePayment = {
  id: string;
  invoiceId: string;
  studentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  method: string | null;
  status: string;
  signatureVerified: boolean;
  capturedAt: string | null;
  rawPayload: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  key: string;
  title: string;
  slug: string;
};

export type StudentSummary = CrmStudent & {
  enrollments: StudentEnrollment[];
  invoices: FeeInvoice[];
};

export type StudentDashboard = {
  student: CrmStudent;
  enrollments: StudentEnrollment[];
  notices: CourseNotice[];
  invoices: FeeInvoice[];
};

export type StudentInput = {
  name: string;
  email: string;
  phone: string;
  guardianName?: string | null;
  guardianPhone?: string | null;
  active?: boolean;
  notes?: string | null;
};

export type EnrollmentInput = {
  studentId: string;
  courseKey: string;
  batchName?: string | null;
  status?: EnrollmentStatus;
};

export type NoticeInput = {
  title: string;
  bodyHtml: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  targetScope: NoticeTargetScope;
  courseKey?: string | null;
  batchName?: string | null;
  studentId?: string | null;
  status: NoticeStatus;
  expiresAt?: string | null;
};

export type FeeInvoiceInput = {
  studentId: string;
  enrollmentId?: string | null;
  title: string;
  description?: string | null;
  amountPaise: number;
  dueDate?: string | null;
};

const STUDENTS_FILE = "crm-students.json";
const ENROLLMENTS_FILE = "crm-student-enrollments.json";
const NOTICES_FILE = "crm-course-notices.json";
const INVOICES_FILE = "crm-fee-invoices.json";
const PAYMENTS_FILE = "crm-fee-payments.json";
const RAZORPAY_EVENTS_FILE = "crm-razorpay-events.json";

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function nullableText(value: unknown) {
  return cleanText(value) || null;
}

function isEnrollmentStatus(value: string): value is EnrollmentStatus {
  return enrollmentStatuses.includes(value as EnrollmentStatus);
}

function isNoticeStatus(value: string): value is NoticeStatus {
  return noticeStatuses.includes(value as NoticeStatus);
}

function isNoticeTargetScope(value: string): value is NoticeTargetScope {
  return noticeTargetScopes.includes(value as NoticeTargetScope);
}

function isFeeInvoiceStatus(value: string): value is FeeInvoiceStatus {
  return feeInvoiceStatuses.includes(value as FeeInvoiceStatus);
}

function mapDbStudent(row: Record<string, unknown>): CrmStudent {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
    guardianName: row.guardian_name ? String(row.guardian_name) : null,
    guardianPhone: row.guardian_phone ? String(row.guardian_phone) : null,
    active: Boolean(row.active),
    notes: row.notes ? String(row.notes) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapDbEnrollment(row: Record<string, unknown>): StudentEnrollment {
  const status = String(row.status);

  return {
    id: String(row.id),
    studentId: String(row.student_id),
    courseKey: String(row.course_key),
    courseTitle: String(row.course_title),
    courseSlug: row.course_slug ? String(row.course_slug) : null,
    batchName: row.batch_name ? String(row.batch_name) : null,
    status: isEnrollmentStatus(status) ? status : "active",
    startedAt: row.started_at
      ? new Date(String(row.started_at)).toISOString()
      : null,
    endedAt: row.ended_at ? new Date(String(row.ended_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapDbNotice(row: Record<string, unknown>): CourseNotice {
  const scope = String(row.target_scope);
  const status = String(row.status);

  return {
    id: String(row.id),
    title: String(row.title),
    bodyHtml: String(row.body_html),
    attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
    attachmentName: row.attachment_name ? String(row.attachment_name) : null,
    targetScope: isNoticeTargetScope(scope) ? scope : "all",
    courseKey: row.course_key ? String(row.course_key) : null,
    batchName: row.batch_name ? String(row.batch_name) : null,
    studentId: row.student_id ? String(row.student_id) : null,
    status: isNoticeStatus(status) ? status : "draft",
    publishedAt: row.published_at
      ? new Date(String(row.published_at)).toISOString()
      : null,
    expiresAt: row.expires_at
      ? new Date(String(row.expires_at)).toISOString()
      : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapDbInvoice(row: Record<string, unknown>): FeeInvoice {
  const status = String(row.status);

  return {
    id: String(row.id),
    studentId: String(row.student_id),
    enrollmentId: row.enrollment_id ? String(row.enrollment_id) : null,
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    amountPaise: Number(row.amount_paise),
    dueDate: row.due_date ? String(row.due_date) : null,
    status: isFeeInvoiceStatus(status) ? status : "pending",
    razorpayOrderId: row.razorpay_order_id
      ? String(row.razorpay_order_id)
      : null,
    receiptNumber: String(row.receipt_number),
    paidAt: row.paid_at ? new Date(String(row.paid_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export function getCourseKey(input: {
  id: string;
  seedKey?: string | null;
  slug: string;
}) {
  if (input.seedKey) return `seed:${input.seedKey}`;
  return `course:${input.id || input.slug}`;
}

export async function listCourseOptions(): Promise<CourseOption[]> {
  return (await listCoursePages())
    .filter((page) => page.status === "published")
    .map((page) => ({
      key: getCourseKey(page),
      title: page.title,
      slug: page.slug,
    }));
}

export async function findCourseOption(courseKey: string) {
  return (
    (await listCourseOptions()).find((course) => course.key === courseKey) ??
    null
  );
}

async function listStoredStudents() {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        name,
        email,
        phone,
        guardian_name,
        guardian_phone,
        active,
        notes,
        created_at,
        updated_at
      FROM crm_students
      ORDER BY created_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbStudent(row));
  }

  return readJsonFile<CrmStudent[]>(STUDENTS_FILE, []);
}

async function listStoredEnrollments() {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        student_id,
        course_key,
        course_title,
        course_slug,
        batch_name,
        status,
        started_at,
        ended_at,
        created_at,
        updated_at
      FROM crm_student_enrollments
      ORDER BY created_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbEnrollment(row));
  }

  return readJsonFile<StudentEnrollment[]>(ENROLLMENTS_FILE, []);
}

async function listStoredNotices() {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        title,
        body_html,
        attachment_url,
        attachment_name,
        target_scope,
        course_key,
        batch_name,
        student_id,
        status,
        published_at,
        expires_at,
        created_at,
        updated_at
      FROM crm_course_notices
      ORDER BY updated_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbNotice(row));
  }

  return readJsonFile<CourseNotice[]>(NOTICES_FILE, []);
}

async function listStoredInvoices() {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id,
        student_id,
        enrollment_id,
        title,
        description,
        amount_paise,
        due_date,
        status,
        razorpay_order_id,
        receipt_number,
        paid_at,
        created_at,
        updated_at
      FROM crm_fee_invoices
      ORDER BY created_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbInvoice(row));
  }

  return readJsonFile<FeeInvoice[]>(INVOICES_FILE, []);
}

export async function listStudents(): Promise<StudentSummary[]> {
  const [students, enrollments, invoices] = await Promise.all([
    listStoredStudents(),
    listStoredEnrollments(),
    listStoredInvoices(),
  ]);

  return students.map((student) => ({
    ...student,
    enrollments: enrollments.filter(
      (enrollment) => enrollment.studentId === student.id,
    ),
    invoices: invoices.filter((invoice) => invoice.studentId === student.id),
  }));
}

export async function getStudentById(id: string) {
  return (
    (await listStoredStudents()).find((student) => student.id === id) ?? null
  );
}

export async function getActiveStudentByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return (
    (await listStoredStudents()).find(
      (student) => student.email === normalized && student.active,
    ) ?? null
  );
}

export async function getStudentByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return (
    (await listStoredStudents()).find(
      (student) => student.email === normalized,
    ) ?? null
  );
}

export async function saveStudent(id: string | null, input: StudentInput) {
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);
  const student: CrmStudent = {
    id: id || crypto.randomUUID(),
    name: cleanText(input.name),
    email,
    phone: cleanText(input.phone),
    guardianName: nullableText(input.guardianName),
    guardianPhone: nullableText(input.guardianPhone),
    active: input.active ?? true,
    notes: nullableText(input.notes),
    createdAt: now,
    updatedAt: now,
  };

  if (!student.name || !student.email || !student.phone) {
    throw new Error("Student name, email, and phone are required.");
  }

  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_students (
        id,
        name,
        email,
        phone,
        guardian_name,
        guardian_phone,
        active,
        notes,
        created_at,
        updated_at
      )
      VALUES (
        ${student.id},
        ${student.name},
        ${student.email},
        ${student.phone},
        ${student.guardianName},
        ${student.guardianPhone},
        ${student.active},
        ${student.notes},
        ${now},
        ${now}
      )
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        guardian_name = EXCLUDED.guardian_name,
        guardian_phone = EXCLUDED.guardian_phone,
        active = EXCLUDED.active,
        notes = EXCLUDED.notes,
        updated_at = EXCLUDED.updated_at
    `;
    return getStudentByEmail(student.email);
  }

  const students = await listStoredStudents();
  const existingIndex = students.findIndex(
    (item) => item.id === id || item.email === email,
  );

  if (existingIndex >= 0) {
    student.id = students[existingIndex].id;
    student.createdAt = students[existingIndex].createdAt;
    students[existingIndex] = student;
  } else {
    students.unshift(student);
  }

  await writeJsonFile(STUDENTS_FILE, students);
  return student;
}

export async function setStudentActive(id: string, active: boolean) {
  const now = new Date().toISOString();
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      UPDATE crm_students
      SET active = ${active}, updated_at = ${now}
      WHERE id = ${id}
    `;
    return;
  }

  const students = await listStoredStudents();
  await writeJsonFile(
    STUDENTS_FILE,
    students.map((student) =>
      student.id === id ? { ...student, active, updatedAt: now } : student,
    ),
  );
}

export async function createEnrollment(input: EnrollmentInput) {
  const now = new Date().toISOString();
  const course = await findCourseOption(input.courseKey);

  if (!course) throw new Error("Select a valid published course.");

  const enrollment: StudentEnrollment = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    courseKey: course.key,
    courseTitle: course.title,
    courseSlug: course.slug,
    batchName: nullableText(input.batchName),
    status: input.status ?? "active",
    startedAt: now,
    endedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_student_enrollments (
        id,
        student_id,
        course_key,
        course_title,
        course_slug,
        batch_name,
        status,
        started_at,
        created_at,
        updated_at
      )
      VALUES (
        ${enrollment.id},
        ${enrollment.studentId},
        ${enrollment.courseKey},
        ${enrollment.courseTitle},
        ${enrollment.courseSlug},
        ${enrollment.batchName},
        ${enrollment.status},
        ${enrollment.startedAt},
        ${enrollment.createdAt},
        ${enrollment.updatedAt}
      )
    `;
    return enrollment;
  }

  const enrollments = await listStoredEnrollments();
  enrollments.unshift(enrollment);
  await writeJsonFile(ENROLLMENTS_FILE, enrollments);
  return enrollment;
}

export async function listCourseNotices() {
  return listStoredNotices();
}

export async function createCourseNotice(input: NoticeInput) {
  const now = new Date().toISOString();
  const status = input.status === "published" ? "published" : "draft";
  const notice: CourseNotice = {
    id: crypto.randomUUID(),
    title: cleanText(input.title),
    bodyHtml: sanitizeBlogHtml(input.bodyHtml),
    attachmentUrl: nullableText(input.attachmentUrl),
    attachmentName: nullableText(input.attachmentName),
    targetScope: isNoticeTargetScope(input.targetScope)
      ? input.targetScope
      : "all",
    courseKey: nullableText(input.courseKey),
    batchName: nullableText(input.batchName),
    studentId: nullableText(input.studentId),
    status,
    publishedAt: status === "published" ? now : null,
    expiresAt: nullableText(input.expiresAt),
    createdAt: now,
    updatedAt: now,
  };

  if (!notice.title || !notice.bodyHtml) {
    throw new Error("Notice title and body are required.");
  }

  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_course_notices (
        id,
        title,
        body_html,
        attachment_url,
        attachment_name,
        target_scope,
        course_key,
        batch_name,
        student_id,
        status,
        published_at,
        expires_at,
        created_at,
        updated_at
      )
      VALUES (
        ${notice.id},
        ${notice.title},
        ${notice.bodyHtml},
        ${notice.attachmentUrl},
        ${notice.attachmentName},
        ${notice.targetScope},
        ${notice.courseKey},
        ${notice.batchName},
        ${notice.studentId},
        ${notice.status},
        ${notice.publishedAt},
        ${notice.expiresAt},
        ${notice.createdAt},
        ${notice.updatedAt}
      )
    `;
    return notice;
  }

  const notices = await listStoredNotices();
  notices.unshift(notice);
  await writeJsonFile(NOTICES_FILE, notices);
  return notice;
}

export async function createFeeInvoice(input: FeeInvoiceInput) {
  const now = new Date().toISOString();
  const invoice: FeeInvoice = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    enrollmentId: nullableText(input.enrollmentId),
    title: cleanText(input.title),
    description: nullableText(input.description),
    amountPaise: Math.max(0, Math.round(Number(input.amountPaise))),
    dueDate: nullableText(input.dueDate),
    status: "pending",
    razorpayOrderId: null,
    receiptNumber: `BR-${new Date().getFullYear()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };

  if (!invoice.title || invoice.amountPaise < 100) {
    throw new Error("Invoice title and amount are required.");
  }

  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_fee_invoices (
        id,
        student_id,
        enrollment_id,
        title,
        description,
        amount_paise,
        due_date,
        status,
        receipt_number,
        created_at,
        updated_at
      )
      VALUES (
        ${invoice.id},
        ${invoice.studentId},
        ${invoice.enrollmentId},
        ${invoice.title},
        ${invoice.description},
        ${invoice.amountPaise},
        ${invoice.dueDate},
        ${invoice.status},
        ${invoice.receiptNumber},
        ${invoice.createdAt},
        ${invoice.updatedAt}
      )
    `;
    return invoice;
  }

  const invoices = await listStoredInvoices();
  invoices.unshift(invoice);
  await writeJsonFile(INVOICES_FILE, invoices);
  return invoice;
}

export async function listStudentInvoices(studentId: string) {
  return (await listStoredInvoices()).filter(
    (invoice) => invoice.studentId === studentId,
  );
}

export async function getStudentInvoice(studentId: string, invoiceId: string) {
  return (
    (await listStudentInvoices(studentId)).find(
      (invoice) => invoice.id === invoiceId,
    ) ?? null
  );
}

export async function getInvoiceByRazorpayOrder(orderId: string) {
  return (
    (await listStoredInvoices()).find(
      (invoice) => invoice.razorpayOrderId === orderId,
    ) ?? null
  );
}

export async function getStudentDashboard(
  studentId: string,
): Promise<StudentDashboard | null> {
  const [student, enrollments, invoices] = await Promise.all([
    getStudentById(studentId),
    listStoredEnrollments(),
    listStoredInvoices(),
  ]);

  if (!student || !student.active) return null;

  const studentEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.studentId === student.id && enrollment.status === "active",
  );
  const notices = await listVisibleNoticesForStudent(
    student,
    studentEnrollments,
  );

  return {
    student,
    enrollments: studentEnrollments,
    notices,
    invoices: invoices.filter((invoice) => invoice.studentId === student.id),
  };
}

export async function listVisibleNoticesForStudent(
  student: CrmStudent,
  enrollments?: StudentEnrollment[],
) {
  const activeEnrollments =
    enrollments ??
    (await listStoredEnrollments()).filter(
      (enrollment) =>
        enrollment.studentId === student.id && enrollment.status === "active",
    );
  const courseKeys = new Set(activeEnrollments.map((item) => item.courseKey));
  const batches = new Set(
    activeEnrollments.flatMap((item) =>
      item.batchName ? [item.batchName] : [],
    ),
  );
  const now = Date.now();

  return (await listStoredNotices())
    .filter((notice) => {
      if (notice.status !== "published") return false;
      if (notice.expiresAt && new Date(notice.expiresAt).getTime() < now) {
        return false;
      }
      if (notice.targetScope === "all") return true;
      if (notice.targetScope === "student")
        return notice.studentId === student.id;
      if (notice.targetScope === "course") {
        return Boolean(notice.courseKey && courseKeys.has(notice.courseKey));
      }
      if (notice.targetScope === "batch") {
        return Boolean(notice.batchName && batches.has(notice.batchName));
      }

      return false;
    })
    .sort((a, b) => {
      const left = a.publishedAt ?? a.updatedAt;
      const right = b.publishedAt ?? b.updatedAt;
      return new Date(right).getTime() - new Date(left).getTime();
    });
}

async function updateInvoice(nextInvoice: FeeInvoice) {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      UPDATE crm_fee_invoices
      SET
        status = ${nextInvoice.status},
        razorpay_order_id = ${nextInvoice.razorpayOrderId},
        paid_at = ${nextInvoice.paidAt},
        updated_at = ${nextInvoice.updatedAt}
      WHERE id = ${nextInvoice.id}
    `;
    return;
  }

  const invoices = await listStoredInvoices();
  await writeJsonFile(
    INVOICES_FILE,
    invoices.map((invoice) =>
      invoice.id === nextInvoice.id ? nextInvoice : invoice,
    ),
  );
}

export async function attachRazorpayOrder(input: {
  invoiceId: string;
  studentId: string;
  orderId: string;
}) {
  const invoice = await getStudentInvoice(input.studentId, input.invoiceId);

  if (!invoice) throw new Error("Invoice not found.");
  if (invoice.status === "paid") throw new Error("Invoice is already paid.");

  const nextInvoice: FeeInvoice = {
    ...invoice,
    razorpayOrderId: input.orderId,
    status: "processing",
    updatedAt: new Date().toISOString(),
  };

  await updateInvoice(nextInvoice);
  return nextInvoice;
}

export async function recordCheckoutVerifiedPayment(input: {
  invoiceId: string;
  studentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaise: number;
  rawPayload: unknown;
}) {
  const now = new Date().toISOString();
  const payment: FeePayment = {
    id: crypto.randomUUID(),
    invoiceId: input.invoiceId,
    studentId: input.studentId,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    amountPaise: input.amountPaise,
    currency: "INR",
    method: null,
    status: "authorized",
    signatureVerified: true,
    capturedAt: null,
    rawPayload: input.rawPayload,
    createdAt: now,
    updatedAt: now,
  };
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_fee_payments (
        id,
        invoice_id,
        student_id,
        razorpay_order_id,
        razorpay_payment_id,
        amount_paise,
        currency,
        status,
        signature_verified,
        raw_payload,
        created_at,
        updated_at
      )
      VALUES (
        ${payment.id},
        ${payment.invoiceId},
        ${payment.studentId},
        ${payment.razorpayOrderId},
        ${payment.razorpayPaymentId},
        ${payment.amountPaise},
        ${payment.currency},
        ${payment.status},
        ${payment.signatureVerified},
        ${JSON.stringify(payment.rawPayload)}::jsonb,
        ${payment.createdAt},
        ${payment.updatedAt}
      )
    `;
    return payment;
  }

  const payments = await readJsonFile<FeePayment[]>(PAYMENTS_FILE, []);
  payments.unshift(payment);
  await writeJsonFile(PAYMENTS_FILE, payments);
  return payment;
}

export async function markInvoicePaidFromRazorpay(input: {
  orderId: string;
  paymentId: string;
  amountPaise: number;
  method: string | null;
  rawPayload: unknown;
}) {
  const invoice = await getInvoiceByRazorpayOrder(input.orderId);

  if (!invoice) return null;
  if (invoice.status === "paid") return invoice;
  if (invoice.amountPaise !== input.amountPaise) {
    throw new Error("Captured Razorpay amount does not match invoice amount.");
  }

  const now = new Date().toISOString();
  const nextInvoice: FeeInvoice = {
    ...invoice,
    status: "paid",
    paidAt: invoice.paidAt ?? now,
    updatedAt: now,
  };
  const payment: FeePayment = {
    id: crypto.randomUUID(),
    invoiceId: invoice.id,
    studentId: invoice.studentId,
    razorpayOrderId: input.orderId,
    razorpayPaymentId: input.paymentId,
    amountPaise: input.amountPaise,
    currency: "INR",
    method: input.method,
    status: "captured",
    signatureVerified: true,
    capturedAt: now,
    rawPayload: input.rawPayload,
    createdAt: now,
    updatedAt: now,
  };
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      UPDATE crm_fee_invoices
      SET status = 'paid', paid_at = ${nextInvoice.paidAt}, updated_at = ${now}
      WHERE id = ${invoice.id}
    `;
    await db`
      INSERT INTO crm_fee_payments (
        id,
        invoice_id,
        student_id,
        razorpay_order_id,
        razorpay_payment_id,
        amount_paise,
        currency,
        method,
        status,
        signature_verified,
        captured_at,
        raw_payload,
        created_at,
        updated_at
      )
      VALUES (
        ${payment.id},
        ${payment.invoiceId},
        ${payment.studentId},
        ${payment.razorpayOrderId},
        ${payment.razorpayPaymentId},
        ${payment.amountPaise},
        ${payment.currency},
        ${payment.method},
        ${payment.status},
        ${payment.signatureVerified},
        ${payment.capturedAt},
        ${JSON.stringify(payment.rawPayload)}::jsonb,
        ${payment.createdAt},
        ${payment.updatedAt}
      )
    `;
    return nextInvoice;
  }

  await updateInvoice(nextInvoice);
  const payments = await readJsonFile<FeePayment[]>(PAYMENTS_FILE, []);
  payments.unshift(payment);
  await writeJsonFile(PAYMENTS_FILE, payments);
  return nextInvoice;
}

export async function storeRazorpayEvent(input: {
  eventId: string | null;
  eventType: string;
  orderId: string | null;
  paymentId: string | null;
  signature: string;
  rawPayload: string;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    if (input.eventId) {
      const existing = (await db`
        SELECT id
        FROM crm_razorpay_events
        WHERE event_id = ${input.eventId}
        LIMIT 1
      `) as Array<{ id: string }>;

      if (existing.length > 0) return { id: existing[0].id, inserted: false };
    }

    await db`
      INSERT INTO crm_razorpay_events (
        id,
        event_id,
        event_type,
        razorpay_order_id,
        razorpay_payment_id,
        signature,
        raw_payload,
        created_at
      )
      VALUES (
        ${id},
        ${input.eventId},
        ${input.eventType},
        ${input.orderId},
        ${input.paymentId},
        ${input.signature},
        ${input.rawPayload},
        ${now}
      )
    `;
    return { id, inserted: true };
  }

  const events = await readJsonFile<
    Array<{
      id: string;
      eventId: string | null;
      eventType: string;
      orderId: string | null;
      paymentId: string | null;
      signature: string;
      rawPayload: string;
      processedAt: string | null;
      createdAt: string;
    }>
  >(RAZORPAY_EVENTS_FILE, []);
  const existing = input.eventId
    ? events.find((event) => event.eventId === input.eventId)
    : null;

  if (existing) return { id: existing.id, inserted: false };

  events.unshift({
    id,
    eventId: input.eventId,
    eventType: input.eventType,
    orderId: input.orderId,
    paymentId: input.paymentId,
    signature: input.signature,
    rawPayload: input.rawPayload,
    processedAt: null,
    createdAt: now,
  });
  await writeJsonFile(RAZORPAY_EVENTS_FILE, events);
  return { id, inserted: true };
}

export async function markRazorpayEventProcessed(id: string) {
  const ready = await ensureCrmSchema();
  const db = getSql();
  const now = new Date().toISOString();

  if (ready && db) {
    await db`
      UPDATE crm_razorpay_events
      SET processed_at = ${now}
      WHERE id = ${id}
    `;
    return;
  }

  const events = await readJsonFile<
    Array<{ id: string; processedAt: string | null }>
  >(RAZORPAY_EVENTS_FILE, []);
  await writeJsonFile(
    RAZORPAY_EVENTS_FILE,
    events.map((event) =>
      event.id === id ? { ...event, processedAt: now } : event,
    ),
  );
}

export function formatPaise(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);
}
