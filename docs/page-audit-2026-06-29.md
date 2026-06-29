# Page Snapshot Audit - 2026-06-29

## Scope

Audited the current route set exposed by the public navigation, footer, student portal entry, CRM entry, and generated course pages.

Local URL tested: `http://localhost:3020`

Dev server command used: `./node_modules/.bin/next dev --port 3020`

Note: `pnpm dev -- --port 3020` did not start because the local pnpm wrapper attempted an install and failed on ignored build scripts for `sharp@0.34.5`.

## Snapshot Coverage

Agent Browser snapshots were taken for:

- `/`
- `/about`
- `/student-life`
- `/courses`
- `/courses/army`
- `/courses/navy`
- `/courses/mpsc`
- `/courses/upsc-civil-services`
- `/courses/banking-and-insurance`
- `/courses/ssc-and-railways`
- `/courses/police-bharti`
- `/courses/talathi-and-zp`
- `/admissions`
- `/scholarships`
- `/news-events`
- `/gallery`
- `/why-baliraja`
- `/contact-us`
- `/notices`
- `/student/login`
- `/student`
- `/student/notices`
- `/student/fees`
- `/crm/login`
- `/crm`

Local evidence artifacts:

- DOM snapshots: `.tmp/page-audit-snapshots/*.snapshot.txt`
- Visual screenshots: `.tmp/page-audit-snapshots/*.png`

## Executive Findings

- No rendered internal link returned a raw 404 in the local crawl.
- `/notices` redirects to `/news-events`.
- `/student`, `/student/notices`, and `/student/fees` redirect to `/student/login` when logged out.
- `/crm` redirects to `/crm/login` when logged out.
- The main problems are not broken HTTP statuses. They are misleading destinations, public-facing builder copy, generic/fallback content, and components that look like placeholders.

## Links That Lead Nowhere Useful

| Page | Link text | Destination | Finding |
| --- | --- | --- | --- |
| Global footer, every page | `Faculty & Mentors` | `/about` | There is no faculty or mentors page/section. The label promises a specific destination, but users land on the generic About page. Source: `src/components/site-footer.tsx:24`. |
| Global footer, every page | `Test Series` | `/news-events` | There is no dedicated test-series page or filtered section. Users land on a mixed news/notices page. Source: `src/components/site-footer.tsx:42`. |
| Global footer, every page | `Admin Portal` | `/crm` -> `/crm/login` | Public footer exposes an internal admin entry. It works technically, but it is odd from public pages and likely should be hidden or moved. Source: `src/components/site-footer.tsx:51`. |
| Overlay menu, public pages | `Admin Portal` | `/crm` -> `/crm/login` | Same issue as footer, but more prominent because it appears in the public menu. Source: `src/lib/site.ts:69`. |
| `/news-events`, `/notices` | `Event Free SSB interview guidance camp... READ MORE` | `/news-events` | Self-link. The event card promises details but reloads the same page. Source: `src/lib/site.ts:360`, rendered by `src/app/news-events/page.tsx:20-26`. |
| `/news-events`, `/notices` | Static insight cards | `/news-events` | The three insight cards all link back to the listing page instead of article pages. Source: `src/lib/site.ts:430`, `src/lib/site.ts:439`, `src/lib/site.ts:448`; fallback rendered by `src/lib/crm/blog-posts.ts:321-334`. |
| `/news-events`, `/notices` | `Defence New NDA and Agniveer foundation batch...` | `/courses` | A specific batch announcement goes to the generic courses page, not a defence/batch detail page. Source: `src/lib/site.ts:353`. |
| `/news-events`, `/notices` | `Test Series UPSC prelims full-length series...` | `/admissions` | A specific test-series card goes to admissions. It is not broken, but the destination does not match the content. Source: `src/lib/site.ts:367`. |
| `/about` | `Read academy updates` | `/news-events` | Acceptable fallback, but it currently lands on sample/generic update cards rather than real academy updates. Source: `src/app/about/page.tsx:65`. |
| Public/social links | `Instagram` | `https://www.instagram.com/balirajacareeeracademy/` | HTTP returns 200, but Instagram often returns 200 for generic/profile states. The handle spelling has `careeer` with three `e`s and needs human verification. Source: `src/lib/site.ts:78`. |

## Public-Facing Copy That Reads Like Builder Notes

| Page | Text | Why it is a problem | Source |
| --- | --- | --- | --- |
| `/` | `The site should answer one question quickly: where should this student go next?` | Talks about the website as a website instead of speaking to the student/parent. | `src/components/sections/home-editorial.tsx:140-142` |
| `/` | `This area is built for the content that usually grows after launch...` | Internal planning copy is visible on the homepage. | `src/components/sections/home-editorial.tsx:238-242` |
| `/` | `Students and families can add university, eligibility, documents and career-path information here as those pages grow.` | Tells the content team what to add later. | `src/lib/site.ts:261-266` |
| `/` | `Use this block for reading-hall details, library photographs, book lists, newspaper practice and daily study routines.` | Direct CMS/developer instruction visible to users. | `src/lib/site.ts:269-274` |
| `/` | `The gallery below is data-driven. Drop in new campus, classroom, event, library or university-visit images and update the array.` | Direct implementation note visible to users. | `src/lib/site.ts:277-282` |
| `/scholarships` | `These cards keep the page scannable. Exact eligibility, forms and concession amounts should be verified with the office before launch.` | Exact example of AI/builder copy. Also says `before launch` on a public page. | `src/app/scholarships/page.tsx:41-45` |
| `/news-events`, `/notices` | `Latest academy announcement for current and upcoming aspirants.` | Repeated filler sentence on every update card. | `src/app/news-events/page.tsx:20-26` |
| `/news-events`, `/notices` | `Keep this list short and operational: dates, tags and clear titles that students can scan quickly.` | Editorial instruction, not user-facing copy. | `src/app/news-events/page.tsx:61-65` |
| `/news-events`, `/notices` | `Short article cards give the institute an active editorial layer...` | Explains the component purpose rather than the content. | `src/app/news-events/page.tsx:94-99` |
| `/gallery` | `A dedicated gallery page gives students and parents a real place... instead of landing on a homepage fragment.` | Self-referential page-building copy. | `src/app/gallery/page.tsx:15-24` |
| `/why-baliraja` | `This page answers the first parent and student question...` | Self-referential page strategy copy. | `src/app/why-baliraja/page.tsx:32-41` |
| `/why-baliraja` | `These are the proof points families should find quickly...` | Internal content-planning language. | `src/app/why-baliraja/page.tsx:55-60` |
| `/student-life` | `The student-life route should answer...` | Uses implementation wording (`route`) on the page. | `src/app/student-life/page.tsx:53-58` |
| `/courses` | `Each course now has a focused page...` | `now has` reads like release-note copy. | `src/app/courses/page.tsx:100-105` |
| `/courses` | `Once the route is clear...` | Minor, but repeats internal route language. | `src/app/courses/page.tsx:107-112` |
| `/contact-us` | `Use the route that matches your need...` | Slightly product/IA language instead of natural contact copy. | `src/app/contact-us/page.tsx:55-59` |
| `/student/login` | `The portal sends a one-time code through the Baliraja Gmail account.` | Exposes implementation/provider detail to students. Better: `We will send a one-time code to your registered email.` | `src/app/student/login/page.tsx:25-28` |
| `/crm/login` | `Enter an email from the configured admin list... institute Gmail account.` | Exposes implementation/config language on an admin login page. | `src/app/crm/login/page.tsx:25-28` |

## Components Or Sections That Do Not Make Sense On Their Page

| Page | Component/section | Finding | Source |
| --- | --- | --- | --- |
| `/scholarships` | `StatBand` with `proofStats` | General proof stats (`2009`, `6`, `12h`, `1:1`) do not explain scholarships or concessions. Use scholarship-specific proof, remove it, or move it lower. | `src/app/scholarships/page.tsx:37`; data at `src/lib/site.ts:458-478` |
| `/student-life` | `VoiceGrid` | The `studentVoices` are anonymous/generic personas (`MPSC foundation aspirant`, `Defence aspirant`, etc.) with stock images. This reads fabricated unless these are explicitly framed as examples. | `src/app/student-life/page.tsx:51`; data at `src/lib/site.ts:716-744` |
| `/about` | `FounderMessage` | The founder quote is shown with default name `Founder` and no real person. It feels unfinished and should be replaced with an actual founder name/photo or removed. | `src/app/about/page.tsx:48`; default props at `src/components/page-sections.tsx:210-218` |
| `/why-baliraja` | `whyPoints` | Claims such as `serving and retired officers who have cleared these very exams` and `evaluated by hand` need verification. If not verified, they are risky proof claims. | `src/lib/site.ts:159-166` |
| `/gallery` | Gallery images | The grid repeats the same few local images under different captions (`Classroom`, `Lecture day`, `Mentor review`, etc.). This looks like placeholder media rather than a real gallery. | `src/lib/site.ts:286-329` |
| `/news-events` | Latest cards + insight cards | The page mixes notices, future announcements, and fallback blog cards, but none of the cards has a real detail page. It feels like scaffolding rather than a finished news system. | `src/app/news-events/page.tsx:20-36`, `src/app/news-events/page.tsx:52-99` |
| `/courses/*` | Generated course body | Every generated course page uses the same scaffold: `What this course covers`, `Concept lectures and syllabus mapping`, `Timed practice...`, `How admission works`. It resolves, but it reads templated and thin. | generator at `src/lib/crm/course-pages.ts:94-117`; renderer at `src/app/courses/[slug]/page.tsx:139-174` |
| Public header/footer on login pages | Full public nav/footer | `/student/login` and `/crm/login` inherit the same marketing header/footer, including `Admin Portal`. It is not broken, but for login pages the public footer makes the surface noisy and exposes irrelevant links. | layout uses shared shell; footer issue from `src/components/site-footer.tsx:16-55` |

## Sample Or Placeholder Data Still Shipping

| Data | Finding | Source |
| --- | --- | --- |
| Latest updates | Code comment says `Sample copy; replace before launch`; rendered cards are future-dated June-August 2026 and generic. | `src/lib/site.ts:332-376` |
| Notices | Code comment says `Sample copy; replace before launch`; these dates/titles are public on `/news-events`. | `src/lib/site.ts:378-411` |
| Blog/insights | Code comment says `Sample copy; replace before launch`; fallback cards all link to `/news-events`. | `src/lib/site.ts:413-450`; fallback in `src/lib/crm/blog-posts.ts:321-334` |
| Proof stats | Some stats are qualitative or unverified (`12h`, `1:1`) and reused on pages where they may not fit. | `src/lib/site.ts:458-478` |
| Scholarship programs | The categories are plausible, but amounts, eligibility, documents, and process are missing. The page itself admits it needs verification. | `src/lib/site.ts:747-779`; `src/app/scholarships/page.tsx:41-45` |
| Course pages | Static fallback creates course pages for every track even without CRM content, using one generic body template. | `src/lib/crm/course-pages.ts:119-174` |

## Redirects Observed

| Requested URL | Final URL | Finding |
| --- | --- | --- |
| `/notices` | `/news-events` | Redirect works. Keep only if `notices` is intentionally an alias. |
| `/student` | `/student/login` | Expected when logged out. |
| `/student/notices` | `/student/login` | Expected when logged out. |
| `/student/fees` | `/student/login` | Expected when logged out. |
| `/crm` | `/crm/login` | Expected when logged out, but public links to it are questionable. |

## Link Status Pass

Internal rendered targets checked locally:

- `/`
- `/about`
- `/admissions`
- `/admissions?request=scholarship`
- `/admissions?track=Army`
- `/admissions?track=Banking%20%26%20Insurance`
- `/admissions?track=MPSC`
- `/admissions?track=Navy`
- `/admissions?track=Police%20Bharti`
- `/admissions?track=SSC%20%26%20Railways`
- `/admissions?track=Talathi%20%26%20ZP`
- `/admissions?track=UPSC%20Civil%20Services`
- `/contact-us`
- `/courses`
- `/courses/army`
- `/courses/banking-and-insurance`
- `/courses/mpsc`
- `/courses/navy`
- `/courses/police-bharti`
- `/courses/ssc-and-railways`
- `/courses/talathi-and-zp`
- `/courses/upsc-civil-services`
- `/crm` -> `/crm/login`
- `/gallery`
- `/news-events`
- `/scholarships`
- `/student-life`
- `/student/login`
- `/why-baliraja`

Result: all returned `200` after redirects. The problem is destination quality, not server status.

External link check:

- Facebook: returned `200`.
- WhatsApp: redirected to WhatsApp send URL and returned `200`.
- Google Maps query: redirected and returned `200`.
- Instagram: returned `200`, but handle spelling still needs verification.

## Recommended Cleanup Order

1. Replace all builder/meta copy on `/`, `/scholarships`, `/news-events`, `/gallery`, `/why-baliraja`, `/student-life`, `/courses`, `/contact-us`, `/student/login`, and `/crm/login`.
2. Decide whether public navigation should expose `Admin Portal`; if yes, move it to a low-priority utility area, not the main public menu/footer.
3. Remove or fix footer labels that imply missing pages: `Faculty & Mentors`, `Test Series`.
4. Give `/news-events` real detail pages or remove `READ MORE` behavior from cards that only go to generic pages.
5. Replace generated course-page body templates with track-specific content before treating course pages as finished.
6. Replace fake/generic student voices and founder quote with real names, real quotes, or remove those sections.
7. Replace repeated/placeholder gallery images with verified campus photos and captions.
8. Verify public claims in `proofStats` and `whyPoints` before launch.
