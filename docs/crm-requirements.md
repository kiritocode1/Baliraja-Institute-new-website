# CRM and Admin Requirements

This site is currently built as a marketing and admissions website where most
operational content lives in `src/lib/site.ts`. The CRM/admin layer should focus
on the parts that change often, require follow-up, or should be updated by the
Baliraja office without a code change.

## Highest priority

### Admission enquiries

Current surface:
- `src/components/enquiry-form.tsx`
- `src/app/admissions/actions.ts`

Why CRM is needed:
- The enquiry form is the main business action on the site.
- Submissions currently write to a local development file at `.data/enquiries.jsonl`.
- Real admissions need assignment, follow-up, notes, and conversion tracking.

Suggested fields:
- Student name
- Phone
- Email
- Exam track
- Message or questions
- Preferred language or medium
- Attempt date or target exam cycle
- Source page and campaign source
- Status: new, contacted, counselled, visit scheduled, enrolled, not interested
- Assigned counsellor
- Next follow-up date
- Internal notes
- Created date and last contacted date

### Other forms and applications

Current surface:
- Not modeled separately yet, but implied by scholarships, events, test-series
  registration, campus visits, and concession copy.

Why CRM is needed:
- These flows should not become disconnected forms that create duplicate student
  records.
- Every form should either create a lead or attach activity to an existing lead.

Suggested form types:
- Scholarship or fee-concession request
- Event or guidance-camp registration
- Test-series registration
- Campus-visit request
- Contact callback request
- Document upload request for concession review

Suggested shared fields:
- Student identity and phone
- Related course, batch, event, or scholarship
- Request status
- Assigned staff member
- Follow-up date
- Required documents
- Internal notes

### Courses and exam tracks

Current surface:
- `examTracks`
- `featuredExams`
- `/courses`
- Course-prefilled admissions links like `/admissions?track=Army`

Why CRM is needed:
- Courses change whenever batches, exam focus, or defence/civil-service priorities
  change.
- Course names feed the admissions form, so this data should be controlled from
  one place.

Suggested fields:
- Course title
- Category: defence, civil services, banking, SSC, police, local government
- Exam names covered
- Short description
- Medium: Marathi, English, or both
- Batch type: foundation, crash, test series, weekend, weekday
- Active or archived
- Display order
- Hero/card image
- Admission form value
- Related notices, updates, and scholarship options

### Batches and schedules

Current surface:
- Mentioned across admissions copy, notices, updates, and course cards, but not
  modeled as a separate data object yet.

Why CRM is needed:
- Students ask about timings, start dates, capacity, and medium before admission.
- Notices and enquiries should point to real batch records instead of free text.

Suggested fields:
- Batch name
- Course/track
- Start date
- End date or duration
- Days and time
- Medium
- Faculty or mentor
- Seat capacity
- Enrollment status: upcoming, open, full, completed
- Fee notes or concession availability

## Content that should be admin-editable

### Notices

Current surface:
- `notices`
- Home page notice board
- `/news-events` notice board

Why CRM is needed:
- Notices are operational and date-sensitive.
- Expired notices should not require code cleanup.

Suggested fields:
- Notice title
- Date
- Tag
- Full body
- Audience: all students, admissions, current batch, defence, scholarship
- Attachment or PDF
- Publish date
- Expiry date
- Pin to top
- Related course or batch

### Latest updates, news, and events

Current surface:
- `updates`
- `/news-events`
- Home page latest updates carousel

Why CRM is needed:
- Updates include admissions announcements, test series, events, and scholarship
  announcements.
- Events may need registration, capacity, and follow-up.

Suggested fields:
- Title
- Tag
- Summary
- Full details
- Date label
- Event date and time, if applicable
- Location, if applicable
- Image
- CTA link
- Registration required
- Capacity
- Publish status: draft, scheduled, published, archived

### Blog and preparation insights

Current surface:
- `blogPosts`
- Home page insights section
- `/news-events` insight cards

Why CRM is needed:
- Articles help the institute look active and useful.
- Staff should be able to publish guidance without developer support.

Suggested fields:
- Title
- Excerpt
- Body
- Category
- Author
- Read time
- Image
- SEO title and description
- Publish date
- Draft/published status

Implemented CRM foundation:
- `crm_blog_posts` stores draft, published, and archived posts in Neon.
- `/api/crm/media/upload` stores editor images in Vercel Blob when
  `BLOB_READ_WRITE_TOKEN` is configured.
- Local development falls back to `.data/crm-blog-posts.json` and
  `public/media/crm-blog/`.

### Scholarships and concessions

Current surface:
- `scholarshipPrograms`
- `/scholarships`
- Admission and support copy

Why CRM is needed:
- Concession pathways need eligibility, required documents, and review status.
- Scholarship applications should connect to the enquiry/admissions pipeline.

Suggested fields:
- Program title
- Audience
- Description
- Eligibility rules
- Required documents
- Concession range or note
- Review process
- Active dates
- Related courses or batches
- Application status for each student

### Gallery and media

Current surface:
- `galleryImages`
- `campusLifeItems`
- Page hero images

Why CRM is needed:
- The site should use real campus photos over time.
- Captions, alt text, and display order need lightweight admin control.

Suggested fields:
- Image
- Alt text
- Caption
- Category: classroom, study hall, library, mentoring, event, defence practice
- Page placement
- Display order
- Published/hidden

### Student voices and testimonials

Current surface:
- `studentVoices`
- Home page and student-life page

Why CRM is needed:
- Testimonials need consent and should be tied to a real student context.
- The office may want to rotate quotes by course or campaign.

Suggested fields:
- Student name or anonymized label
- Track
- Quote
- Image
- Consent recorded
- Result or context, if verified
- Published/hidden
- Display order

## Lower priority, but still useful

### FAQs

Current surface:
- `admissionsFaqs`
- `studentLifeFaqs`

CRM value:
- Useful once staff start hearing repeated questions from enquiries.
- Can stay static until there is frequent churn.

### Contact details and office hours

Current surface:
- `site.contact`
- Header/footer/contact page CTAs

CRM value:
- Simple admin setting is useful for phone, email, hours, address, map link, and
  WhatsApp.
- Low complexity, but important because wrong contact details lose leads.

### Proof stats and institute claims

Current surface:
- `proofStats`
- About, admissions, courses, and scholarship pages

CRM value:
- Claims should stay verified and editable.
- Keep an audit trail for anything that sounds like a result, count, ranking, or
  selection statistic.

## Recommended CRM MVP

Build the first admin phase around these objects:

1. Leads/enquiries
2. Courses/tracks
3. Batches/schedules
4. Notices
5. Updates/events
6. Scholarships/concessions

This gives the office control over the live admissions workflow and the content
students check most often. Blog posts, gallery, testimonials, FAQs, and proof
stats can follow after the admissions pipeline is reliable.

## Workflow requirements

- Admin roles: owner/admin, counsellor, content editor
- Draft, scheduled, published, and archived states for public content
- Expiry dates for notices and event announcements
- Search and filters for leads by course, status, counsellor, and follow-up date
- Internal notes on leads and scholarship applications
- File uploads for notice PDFs, scholarship documents, and gallery images
- Audit history for admissions status changes and public content edits
- Basic export for leads and scholarship applications
