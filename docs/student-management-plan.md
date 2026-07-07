# Baliraja Student Management Rework Plan

## Context

Baliraja is primarily a police/defence bharti coaching college, and also
runs **schools (Marathi and semi-English medium), sports programs, and
summer camps**. The system's backbone is the **admission form**
(`src/schemas/admission.schema.ts` — already bharti-shaped: programs are
police / army / staff / airforce / navy / railway, and it collects DOB,
gender, guardian, address, education %, height, weight) and the **dynamic
courses table** (`crm_course_pages`, used by enrollments via `courseKey`).

One system covers every division: a school standard, a sports program, and
a summer camp are all rows in the courses table (with a `category` field —
see Phase 5), so enrollments, batches, notices, fees, and test results work
for all of them without parallel modules.

The static marketing pages (home, about, why-baliraja, student-life,
contact, and the hardcoded MPSC/UPSC exam-track copy in `src/lib/site.ts`)
are **out of scope** — they don't feed the CRM. The MPSC/UPSC entries only
exist as seed templates for the courses table; admins can archive them from
`/crm/courses` and publish the real bharti courses. No code change needed
for that.

## Problem

The plumbing works (data layer, Razorpay, portal auth) but the workflows
around it don't fit how a bharti college actually operates:

- `/crm/students` is one endless page of full-height cards with embedded
  forms. No search, no filters, no detail page. Unusable past ~50 students.
- Students cannot be edited after creation (only activate/deactivate).
- Lead → student conversion exists (`convertLeadToStudentAction`) but is
  buried and silently discards the bharti-relevant data the admission form
  collects: DOB, gender, address, education, **height and weight** — the
  exact numbers that decide physical eligibility.
- The student record has no bharti profile at all: no physical
  measurements, no caste category (reservation category changes physical
  cutoffs), no document checklist (caste/domicile certificates).
- No mock-test or ground-test results anywhere — the core service of a
  bharti college (weekly written mocks + ground tests: running, shot put)
  has no home in the system, and students can't see their results.
- No link between a lead and the student it became, in either direction.
- Email is mandatory to convert, so phone-only enquiries can never become
  student records even when they enroll.
- Scholarship handling is a dead end: `/crm/scholarships` just filters
  leads and tells staff to "record the decision in the notes". No decision
  field; an approved concession never reaches the student record or the
  person raising invoices.
- All staff are full admins; no distinction between the owner and office
  staff / ground instructors who only enter results and manage students.
- Batches are free text; a typo silently breaks batch-targeted notices.
- Notice attachments are a raw "S3 URL" text field while the blog editor
  already has a working upload pipeline.
- The gallery is a hardcoded list in `src/lib/site.ts`; the CRM "Gallery"
  panel only displays it. No upload, no captions editing, no albums —
  despite the media pipeline already existing.
- The schools, sports, and summer-camp divisions have no presence: no
  public tab, no way to enquire about them on the admission form, no way
  to enroll their students.

## Phase 1 — Make students manageable

### Student list (`/crm/students`)

Replace the card wall with a compact table: name, phone, program/course,
batch, active status, pending fee amount. Each row links to the detail page.

- Text search across name / phone / email (server-side, querystring).
- Filters: course, batch, active/inactive, has-pending-fees.
- "Add student" moves to a header action; summary metrics stay.

### Student detail page (`/crm/students/[id]`)

Everything about one student in one place:

- Editable profile form (reuses `saveStudent`, which already upserts).
- Enrollments list + add-enrollment form (existing actions).
- All fee invoices + create-invoice form + payment history per invoice.
- Notices targeted at this student + shortcut to create one pre-scoped.
- Test results section (Phase 3) and enquiry cross-link (Phase 2) land here.

### Conversion made prominent

- A clear "Convert to student" button per lead opening a pre-filled,
  editable review (`/crm/leads/[id]/convert`) showing exactly what will be
  created, instead of the current silent two-field form.
- After conversion, redirect to the new student's detail page.
- Already-converted leads show "View student" instead.

## Phase 2 — The bharti student profile

### Admission form gains the missing bharti fields

Add to `admission.schema.ts` and the public form:

- `chestCm` (optional; measured for male candidates in police PST)
- `category` (Open / SC / ST / OBC / EWS / NT / SBC / other — decides
  reservation cutoffs and physical-standard relaxations)
- `maharashtraDomicile` (boolean)

These flow into leads exactly like existing fields.

### Full profile carries onto the student

Add nullable columns to `crm_students` (mirrored in the JSON fallback):

- `gender`, `date_of_birth`, `full_address`, `category`,
  `maharashtra_domicile`
- `education` (jsonb, same shape as the lead's)
- `height_cm`, `weight_kg`, `chest_cm` — shown prominently on the detail
  page as the "Physical profile", editable (staff re-measure over time;
  latest values live here, history arrives with ground tests in Phase 3)
- `desired_programs` (jsonb)
- `documents` (jsonb checklist: `[{name, submitted}]` — Aadhaar, domicile
  certificate, caste certificate, school leaving certificate, photos;
  checkbox list on the detail page, no file uploads)
- `lead_id` (nullable)

Conversion copies everything. The CRM "Add student" form grows the same
fields (collapsed "Full profile" section so quick creation stays quick).

### Cross-links

- `crm_students.lead_id` set on conversion; lead shows "View student";
  student detail shows "View original enquiry". Reverse link resolved by
  querying students on `lead_id` — one source of truth.

### Scholarships / fee concessions

- Add to leads: `concession_status` (`requested` / `approved` /
  `rejected`) and `concession_note` (free text, e.g. "20% off tuition,
  farming family"). The scholarships panel gets inline decision controls.
- Both carry onto the student; shown next to the fee/invoice section so
  whoever raises invoices sees the approved discount before typing an
  amount.
- Deliberately no structured discount math on invoices: the admin types the
  already-discounted amount; the note is the reminder.

### Phone-only students

- Make `email` nullable. Portal login stays email-gated
  (`getActiveStudentByEmail` already only matches non-null emails — no
  auth change). The form marks email "required for portal login" instead
  of required-always; conversion warns instead of blocking.
- DB: relax unique email to a partial unique index
  (`WHERE email IS NOT NULL`); `saveStudent` upserts by id when email is
  null.

## Phase 3 — Tests & results

The core differentiator for a bharti college: track written mocks and
ground tests, show students their results.

### Data

- `crm_tests`: id, title, `kind` (`written` | `ground`), `course_key`
  (nullable = all courses), `batch_name` (nullable), `test_date`,
  `max_marks` (written only), notes, created/updated.
- `crm_test_results`: id, test_id, student_id, `marks` (written: marks
  obtained), `metrics` (jsonb for ground tests, e.g.
  `{"run_1600m_sec": 340, "shotput_m": 7.9, "run_100m_sec": 13.2}`),
  `remarks` (text, e.g. "qualified", "needs 20s improvement"), unique on
  (test_id, student_id).
- Ground-test metric names are free-form keys entered by staff, rendered
  as-is. No fixed metric registry — events differ per recruitment cycle.
  Add one only if inconsistent naming becomes a real problem.

### CRM pages

- `/crm/tests`: list + create tests; filter by course/batch/kind.
- `/crm/tests/[id]`: roster-style entry — every enrolled student of the
  test's course/batch in one form, marks/metrics entered in a single save.
  This is the page ground instructors live in after every Sunday test.
- Student detail page shows the student's results timeline (written marks
  as `x / max`, ground metrics listed) so counsellors see progress at a
  glance.

### Student portal

- `/student/results`: the student's results, newest first — written marks
  with percentage and batch rank (computed on the fly from the same test's
  results), ground metrics with remarks.
- Dashboard card shows the latest result + link.

## Phase 4 — Polish

### Staff roles

- Add `role` to `crm_admins`: `owner` | `staff` (default staff). One gate:
  only owners see/manage `/crm/admins`. Everything else stays open to all
  active admins — finer permissions only if misuse actually happens.

### Batches as real entities

- `crm_batches`: id, course_key, name, starts/ends, active. Enrollment,
  notice, and test forms use a batch dropdown filtered by course, with a
  "new batch" input. Existing free-text names seeded in on first ensure.

### Notice attachments via upload

- Reuse `/api/crm/media/upload` (R2/Blob) in the notice form — file input
  replaces the raw URL field (URL stays as advanced fallback).

### Lead pipeline view

- Status counts across the top of `/crm/leads` (new / contacted /
  counselled / visit scheduled / enrolled / not interested), each a filter.
- Dashboard gains "enrolled this month".

### Gallery rework

- `crm_gallery_images`: id, url, caption, alt, `album` (campus / school /
  sports / camps / events), sort order, published flag.
- `/crm/gallery` becomes a real manager: upload via the existing
  `/api/crm/media/upload` pipeline, edit caption/alt/album, reorder,
  unpublish.
- Public `/gallery` renders from the table with album tabs; falls back to
  the current static `site.ts` list only while the table is empty, then
  the static list is deleted.
- Home-page gallery preview pulls the latest published images.

## Phase 5 — Schools, sports & summer camps

### Course categories

- Add `category` to `crm_course_pages`: `bharti` (default for existing
  pages) / `school` / `sports` / `camp`, and optional `medium`
  (`marathi` / `semi_english`) for school entries.
- School standards ("5th Standard — Marathi medium"), sports programs, and
  camps ("Summer Camp May 2027") become course pages. Everything built in
  Phases 1–3 — enrollments, batches, fees, notices, tests — applies to
  them with zero extra code.

### Public site

- New "School" tab in the primary nav → `/school`: intro content plus the
  published school-category courses (grouped by medium), with an enquiry
  CTA into the admissions form.
- `/courses` groups by category so bharti tracks, sports, and camps don't
  interleave. Sports and camps ride on the same page (own sections) —
  separate landing pages only if content demands it later.

### Admission form & leads

- Extend `programValues` with `school`, `sports`, `summer_camp` (labels:
  School, Sports Academy, Summer Camp). Leads flow through the existing
  pipeline unchanged; counsellors see the division from the programs.
- Height / weight / education become optional when only
  school / sports / summer_camp programs are selected (they stay required
  for bharti programs) — a parent enquiring for a school seat shouldn't be
  forced to enter chest measurement.

## Non-goals

- Static marketing pages (home/about/etc.) — separate content task.
- Attendance tracking — real need eventually, but daily-marking UX is its
  own project; the tests roster pattern will be the template when it comes.
- Automatic eligibility verdicts (comparing measurements to official
  PST/PET standards) — standards shift per recruitment notification; staff
  judge, the system records. Revisit once real data accumulates.
- Document file uploads — checklist only for now; the media pipeline can
  back uploads later.
- No changes to admin auth flow, student OTP auth, or the Razorpay flow.
- No client-side data-grid library — server-rendered tables with
  querystring filters.

## Test Plan

- Students list: search and each filter narrow correctly; rows open the
  detail page; empty states render.
- Student detail: profile edits persist and reflect on the portal; invoice
  and enrollment creation work from the new location; document checklist
  saves.
- Conversion: full admission details land on the student (including
  chest/category/domicile once Phase 2 form lands); phone-only lead
  converts with a portal warning; converted lead shows "View student";
  double-convert blocked via existing `lead_id`.
- Phone-only student cannot request an OTP; adding an email later enables
  login.
- Scholarships: decision persists from the scholarships panel; concession
  shows on the student detail next to fees; non-scholarship leads show no
  concession UI.
- Tests: roster entry saves all rows in one submit; re-saving updates
  (unique test_id + student_id); student portal shows only the logged-in
  student's results; rank matches manual ordering; students in other
  batches don't see the test.
- Staff roles: staff admin cannot open `/crm/admins`; owner can.
- Batches: dropdowns offer only the selected course's batches;
  batch-targeted notices still reach the right students.
- Notice upload stores to R2/Blob and downloads from the portal.
- Gallery: upload appears on public `/gallery` under its album; unpublish
  hides it; static fallback renders only when the table is empty.
- Divisions: school course page publishes and appears on `/school` under
  the right medium; a school-only enquiry submits without height/weight; a
  bharti enquiry still requires them; enrolling a student into a camp
  course works through the same enrollment form.
- Regression: admin login, blog/course editors, Razorpay order → verify →
  webhook flow, `npm run lint`, `npm run build`.

## Assumptions

- Neon Postgres primary, JSON-file fallback kept working — every schema
  addition mirrors into the fallback shape.
- Existing students (all with email) unaffected by nullable email.
- Phases land in order as separate commits; each phase shippable alone.
- Nothing is committed until explicitly approved.
