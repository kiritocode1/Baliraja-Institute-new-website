import crypto from "node:crypto";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";

export const testKinds = ["written", "ground"] as const;
export type TestKind = (typeof testKinds)[number];

export type CrmTest = {
  id: string;
  title: string;
  kind: TestKind;
  courseKey: string | null;
  batchName: string | null;
  testDate: string | null;
  maxMarks: number | null;
  /** Ground tests: metric columns entered per student, e.g. "1600m", "Shot put". */
  metricNames: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TestResult = {
  id: string;
  testId: string;
  studentId: string;
  marks: number | null;
  /** Ground metrics keyed by metric name; values stay free text ("5:40", "7.9m"). */
  metrics: Record<string, string>;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentTestResult = TestResult & { test: CrmTest };

export type TestInput = {
  title: string;
  kind: TestKind;
  courseKey?: string | null;
  batchName?: string | null;
  testDate?: string | null;
  maxMarks?: number | null;
  metricNames?: string[];
  notes?: string | null;
};

export type TestResultInput = {
  studentId: string;
  marks: number | null;
  metrics: Record<string, string>;
  remarks: string | null;
};

const TESTS_FILE = "crm-tests.json";
const RESULTS_FILE = "crm-test-results.json";

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJsonValue(value: unknown) {
  if (typeof value !== "string") return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseMetricNames(value: unknown): string[] {
  const parsed = parseJsonValue(value);
  return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
}

function parseMetrics(value: unknown): Record<string, string> {
  const parsed = parseJsonValue(value);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).map(([key, val]) => [
      key,
      String(val),
    ]),
  );
}

function mapDbTest(row: Record<string, unknown>): CrmTest {
  const kind = String(row.kind);

  return {
    id: String(row.id),
    title: String(row.title),
    kind: kind === "ground" ? "ground" : "written",
    courseKey: row.course_key ? String(row.course_key) : null,
    batchName: row.batch_name ? String(row.batch_name) : null,
    testDate: row.test_date ? String(row.test_date) : null,
    maxMarks:
      row.max_marks === null || row.max_marks === undefined
        ? null
        : Number(row.max_marks),
    metricNames: parseMetricNames(row.metric_names),
    notes: row.notes ? String(row.notes) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapDbResult(row: Record<string, unknown>): TestResult {
  return {
    id: String(row.id),
    testId: String(row.test_id),
    studentId: String(row.student_id),
    marks:
      row.marks === null || row.marks === undefined ? null : Number(row.marks),
    metrics: parseMetrics(row.metrics),
    remarks: row.remarks ? String(row.remarks) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function listTests(): Promise<CrmTest[]> {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id, title, kind, course_key, batch_name, test_date, max_marks,
        metric_names, notes, created_at, updated_at
      FROM crm_tests
      ORDER BY test_date DESC NULLS LAST, created_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbTest(row));
  }

  return readJsonFile<CrmTest[]>(TESTS_FILE, []);
}

export async function getTestById(id: string) {
  return (await listTests()).find((test) => test.id === id) ?? null;
}

export async function createTest(input: TestInput): Promise<CrmTest> {
  const now = new Date().toISOString();
  const test: CrmTest = {
    id: crypto.randomUUID(),
    title: cleanText(input.title),
    kind: input.kind === "ground" ? "ground" : "written",
    courseKey: cleanText(input.courseKey) || null,
    batchName: cleanText(input.batchName) || null,
    testDate: cleanText(input.testDate) || null,
    maxMarks: input.maxMarks ?? null,
    metricNames: (input.metricNames ?? []).map(cleanText).filter(Boolean),
    notes: cleanText(input.notes) || null,
    createdAt: now,
    updatedAt: now,
  };

  if (!test.title) throw new Error("Test title is required.");
  if (test.kind === "written" && !test.maxMarks) {
    throw new Error("Written tests need maximum marks.");
  }
  if (test.kind === "ground" && test.metricNames.length === 0) {
    throw new Error(
      "Ground tests need at least one metric (e.g. 1600m, Shot put).",
    );
  }

  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_tests (
        id, title, kind, course_key, batch_name, test_date, max_marks,
        metric_names, notes, created_at, updated_at
      )
      VALUES (
        ${test.id}, ${test.title}, ${test.kind}, ${test.courseKey},
        ${test.batchName}, ${test.testDate}, ${test.maxMarks},
        ${JSON.stringify(test.metricNames)}::jsonb, ${test.notes},
        ${test.createdAt}, ${test.updatedAt}
      )
    `;
    return test;
  }

  const tests = await readJsonFile<CrmTest[]>(TESTS_FILE, []);
  tests.unshift(test);
  await writeJsonFile(TESTS_FILE, tests);
  return test;
}

async function listStoredResults(): Promise<TestResult[]> {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id, test_id, student_id, marks, metrics, remarks,
        created_at, updated_at
      FROM crm_test_results
      ORDER BY created_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbResult(row));
  }

  return readJsonFile<TestResult[]>(RESULTS_FILE, []);
}

export async function listTestResults(testId: string) {
  return (await listStoredResults()).filter(
    (result) => result.testId === testId,
  );
}

export async function saveTestResults(testId: string, rows: TestResultInput[]) {
  const now = new Date().toISOString();
  const ready = await ensureCrmSchema();
  const db = getSql();

  // Rows with no entered data are skipped, not stored as empty results.
  const meaningful = rows.filter(
    (row) =>
      row.marks !== null ||
      Object.values(row.metrics).some((value) => value.trim()) ||
      (row.remarks ?? "").trim(),
  );

  if (ready && db) {
    for (const row of meaningful) {
      await db`
        INSERT INTO crm_test_results (
          id, test_id, student_id, marks, metrics, remarks,
          created_at, updated_at
        )
        VALUES (
          ${crypto.randomUUID()}, ${testId}, ${row.studentId}, ${row.marks},
          ${JSON.stringify(row.metrics)}::jsonb, ${row.remarks}, ${now}, ${now}
        )
        ON CONFLICT (test_id, student_id)
        DO UPDATE SET
          marks = EXCLUDED.marks,
          metrics = EXCLUDED.metrics,
          remarks = EXCLUDED.remarks,
          updated_at = EXCLUDED.updated_at
      `;
    }
    return meaningful.length;
  }

  const results = await readJsonFile<TestResult[]>(RESULTS_FILE, []);

  for (const row of meaningful) {
    const existingIndex = results.findIndex(
      (item) => item.testId === testId && item.studentId === row.studentId,
    );

    if (existingIndex >= 0) {
      results[existingIndex] = {
        ...results[existingIndex],
        marks: row.marks,
        metrics: row.metrics,
        remarks: row.remarks,
        updatedAt: now,
      };
    } else {
      results.unshift({
        id: crypto.randomUUID(),
        testId,
        studentId: row.studentId,
        marks: row.marks,
        metrics: row.metrics,
        remarks: row.remarks,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await writeJsonFile(RESULTS_FILE, results);
  return meaningful.length;
}

export async function listResultsForStudent(
  studentId: string,
): Promise<StudentTestResult[]> {
  const [tests, results] = await Promise.all([
    listTests(),
    listStoredResults(),
  ]);
  const testsById = new Map(tests.map((test) => [test.id, test]));

  return results
    .filter((result) => result.studentId === studentId)
    .flatMap((result) => {
      const test = testsById.get(result.testId);
      return test ? [{ ...result, test }] : [];
    })
    .sort((a, b) => {
      const left = a.test.testDate ?? a.createdAt;
      const right = b.test.testDate ?? b.createdAt;
      return right.localeCompare(left);
    });
}

/** Rank within a written test: 1 + number of strictly better scores. */
export async function getWrittenTestRank(testId: string, studentId: string) {
  const results = await listTestResults(testId);
  const mine = results.find((result) => result.studentId === studentId);

  if (!mine || mine.marks === null) return null;

  const better = results.filter(
    (result) => result.marks !== null && result.marks > (mine.marks as number),
  ).length;

  return { rank: better + 1, of: results.length };
}
