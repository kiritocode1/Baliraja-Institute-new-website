import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionIntro } from "@/components/page-sections";

export const metadata: Metadata = {
  title: "Feature Directory",
  description:
    "Every page, portal, and workflow on the Baliraja Institute website — what it does, where it lives, and how to use it.",
  robots: { index: false, follow: false },
};

type Feature = {
  title: string;
  url: string;
  /** Dynamic routes and APIs are documented but not linked. */
  linkable?: boolean;
  audience: string;
  description: string;
  howTo: string[];
};

type FeatureGroup = {
  eyebrow: string;
  title: string;
  body: string;
  features: Feature[];
};

const groups: FeatureGroup[] = [
  {
    eyebrow: "Public website",
    title: "Pages for visitors",
    body: "Open to everyone — no login needed. These pages inform families, showcase the institute, and collect admission enquiries.",
    features: [
      {
        title: "Home",
        url: "/",
        audience: "Everyone",
        description:
          "The landing page: hero video, exam tracks, latest updates, gallery preview, and editorial sections introducing the institute.",
        howTo: [
          "Scroll through exam tracks to find your target exam (Army, Navy, MPSC, UPSC and more).",
          "Use the header navigation to jump to any section of the site.",
        ],
      },
      {
        title: "About",
        url: "/about",
        audience: "Everyone",
        description:
          "The institute's story, mission, and campus background for families evaluating Baliraja.",
        howTo: ["Read top to bottom; follow the CTA to admissions when ready."],
      },
      {
        title: "Why Baliraja",
        url: "/why-baliraja",
        audience: "Everyone",
        description:
          "The case for choosing Baliraja: outcomes, teaching approach, and what makes the institute different.",
        howTo: ["Compare the proof points, then head to Courses or Admissions."],
      },
      {
        title: "Courses",
        url: "/courses",
        audience: "Prospective students",
        description:
          "Catalogue of all coaching tracks. Each course opens a detail page with syllabus, batch, and eligibility information.",
        howTo: [
          "Browse the course cards and click one to open its detail page.",
          "Course detail pages live at /courses/[slug], e.g. /courses/army.",
        ],
      },
      {
        title: "Admissions",
        url: "/admissions",
        audience: "Prospective students & parents",
        description:
          "The admission enquiry form. Submissions become leads that counsellors follow up from the CRM.",
        howTo: [
          "Fill in student, contact, and program details and submit.",
          "For fee support, open /admissions?request=scholarship — the form pre-selects the scholarship request.",
          "The office follows up by phone; there is no online admission payment at this stage.",
        ],
      },
      {
        title: "Scholarships",
        url: "/scholarships",
        audience: "Prospective students & parents",
        description:
          "Fee-concession pathways for farming families, merit students, defence aspirants, and repeat-attempt students.",
        howTo: [
          "Find the concession pathway that matches your situation.",
          "Click “Apply for consideration” — it routes to the admissions form with the scholarship request flagged.",
        ],
      },
      {
        title: "Gallery",
        url: "/gallery",
        audience: "Everyone",
        description:
          "Photo gallery of campus life, events, and training. Images are managed from the CRM and served from cloud storage.",
        howTo: ["Scroll to browse; images lazy-load as you go."],
      },
      {
        title: "News & Events",
        url: "/news-events",
        audience: "Everyone",
        description:
          "Public notices, test-series updates, defence camps, and announcements. Articles are published from the CRM blog editor.",
        howTo: [
          "Click any card to read the full article at /news-events/[slug].",
          "/notices redirects here — both URLs reach the same page.",
        ],
      },
      {
        title: "Student Life",
        url: "/student-life",
        audience: "Prospective students & parents",
        description:
          "Hostel, mess, grounds, and daily-routine information for residential students.",
        howTo: ["Read through; contact the office for hostel availability."],
      },
      {
        title: "Contact Us",
        url: "/contact-us",
        audience: "Everyone",
        description:
          "Phone numbers, address, map, and office hours for reaching the institute directly.",
        howTo: ["Call or visit during office hours; use the map for directions."],
      },
    ],
  },
  {
    eyebrow: "Student portal",
    title: "For enrolled students",
    body: "A private area where enrolled students read course notices, track fee dues, and pay online through Razorpay. Access is granted by the office — only students marked active in the CRM can log in.",
    features: [
      {
        title: "Student Login",
        url: "/student/login",
        audience: "Enrolled students",
        description:
          "Passwordless login using a one-time code sent to the email address registered with the office.",
        howTo: [
          "Enter the email address you gave the office at admission time.",
          "Check your inbox for the one-time code (OTP) and enter it.",
          "If no code arrives, your record may be inactive or the email may differ — contact the office to update it.",
          "A successful login opens the dashboard and keeps you signed in on that device.",
        ],
      },
      {
        title: "Student Dashboard",
        url: "/student",
        audience: "Enrolled students",
        description:
          "Overview of your enrollment: latest notices, pending fee amount, and shortcuts to every portal section.",
        howTo: [
          "Log in first — the dashboard redirects to /student/login otherwise.",
          "Use the three cards to jump to Notices, Fees, or Receipts.",
        ],
      },
      {
        title: "Notices & Materials",
        url: "/student/notices",
        audience: "Enrolled students",
        description:
          "Course notices and study materials targeted to your course, batch, or directly to you. Attachments download from cloud storage.",
        howTo: [
          "Open the page to see everything currently addressed to you.",
          "You only see notices for your own enrollment; archived or expired notices disappear automatically.",
          "Click an attachment to download it.",
        ],
      },
      {
        title: "Fees & Online Payment",
        url: "/student/fees",
        audience: "Enrolled students",
        description:
          "All fee invoices raised by the office — pending, processing, paid, and refunded — with online payment via Razorpay (UPI, cards, netbanking).",
        howTo: [
          "Open the page to see each invoice with its amount and due status.",
          "Click “Pay” on a pending invoice — Razorpay Checkout opens in a secure window.",
          "Complete payment by UPI, card, or netbanking.",
          "After payment the invoice shows “processing” until Razorpay's server confirmation arrives, then flips to “paid” — usually within moments.",
          "If a payment fails, the invoice returns to pending and you can retry.",
          "Never rely on a screenshot alone — the paid status on this page and the receipt are the confirmation.",
        ],
      },
      {
        title: "Payment Receipts",
        url: "/student/receipts/[id]",
        linkable: false,
        audience: "Enrolled students",
        description:
          "A printable receipt for each paid invoice, showing the amount, date, and Razorpay payment reference.",
        howTo: [
          "Open a paid invoice from /student/fees and click through to its receipt.",
          "Receipts only open for the student who owns the invoice.",
          "Use your browser's print dialog to save it as a PDF.",
        ],
      },
    ],
  },
  {
    eyebrow: "Admin CRM",
    title: "For institute staff",
    body: "The staff back-office. Admins log in with a Gmail one-time code and manage everything the public site and student portal show. Only email addresses added to the admin list can enter.",
    features: [
      {
        title: "CRM Login",
        url: "/crm/login",
        audience: "Staff",
        description:
          "Admin login via one-time code emailed through Gmail. Admin sessions are completely separate from student sessions.",
        howTo: [
          "Enter your admin email address — it must already be on the admin list.",
          "Enter the code from your inbox to open the dashboard.",
          "To add a new admin, an existing admin adds their email under /crm/admins first.",
        ],
      },
      {
        title: "Dashboard",
        url: "/crm",
        audience: "Staff",
        description:
          "Counts, environment health checks (database, email, storage, Razorpay), and shortcuts to every workspace section.",
        howTo: [
          "Check the health pills after any deployment — a red pill means a missing environment variable.",
          "Use the section cards to navigate.",
        ],
      },
      {
        title: "Leads",
        url: "/crm/leads",
        audience: "Counsellors",
        description:
          "Every admission enquiry submitted from the public form. Track status, assign counsellors, and record follow-up notes.",
        howTo: [
          "Open a lead to see contact details and the requested program.",
          "Update the status as the conversation progresses.",
          "When a lead joins, convert them to a student from the Students section.",
        ],
      },
      {
        title: "Scholarships",
        url: "/crm/scholarships",
        audience: "Counsellors",
        description:
          "Enquiries that requested fee support, kept separate so concession conversations don't get lost among general leads.",
        howTo: [
          "Review each request and record the concession decision in the notes.",
        ],
      },
      {
        title: "Courses",
        url: "/crm/courses",
        audience: "Content admins",
        description:
          "Editor for the public course pages — Army, Navy, MPSC, UPSC and other tracks — including text, images, and SEO fields.",
        howTo: [
          "Pick a course to edit its public page content.",
          "Upload images through the editor; they are stored in cloud storage and served through the site.",
          "Save to publish — changes appear on /courses/[slug] immediately.",
        ],
      },
      {
        title: "Blog",
        url: "/crm/blog",
        audience: "Content admins",
        description:
          "Rich-text editor for News & Events articles with image upload and SEO fields. Published posts appear on /news-events.",
        howTo: [
          "Create a post, write with the rich-text toolbar, and add a cover image.",
          "Fill the SEO title and description for search results.",
          "Publish to make it live; unpublish to pull it back without deleting.",
        ],
      },
      {
        title: "Gallery",
        url: "/crm/gallery",
        audience: "Content admins",
        description:
          "Manage the public campus gallery and the media upload workflow.",
        howTo: [
          "Upload images here to have them appear on the public /gallery page.",
        ],
      },
      {
        title: "Students",
        url: "/crm/students",
        audience: "Office staff",
        description:
          "The heart of the student portal: create student records, control portal access, assign courses and batches, publish notices, and raise fee invoices.",
        howTo: [
          "Create a student with name, phone, and the email they will log in with — or convert an existing lead.",
          "Mark the student active to allow portal login; inactive students cannot receive login codes.",
          "Assign a course and batch so the student sees the right notices.",
          "Publish notices/materials targeted at a course, a batch, or one student; attach files as needed.",
          "Raise fee invoices with amount and due date — the student sees them on /student/fees and can pay online.",
          "Invoice status updates automatically after Razorpay confirms payment; do not mark invoices paid by hand for online payments.",
        ],
      },
      {
        title: "Admins",
        url: "/crm/admins",
        audience: "Owners",
        description:
          "Control which email addresses can log in to this CRM.",
        howTo: [
          "Add a colleague's email to grant access; remove it to revoke.",
          "Keep this list short — every entry is a full-access admin.",
        ],
      },
    ],
  },
  {
    eyebrow: "System endpoints",
    title: "Behind the scenes",
    body: "API routes that power the portal and CRM. Nothing here is opened in a browser — documented for operators and developers.",
    features: [
      {
        title: "Razorpay Webhook",
        url: "/api/razorpay/webhook",
        linkable: false,
        audience: "Razorpay servers",
        description:
          "The final source of truth for payments. Razorpay calls this endpoint after a payment is captured, failed, or refunded; only then is an invoice marked paid.",
        howTo: [
          "Configure this URL in the Razorpay dashboard with the shared webhook secret (RAZORPAY_WEBHOOK_SECRET).",
          "Events are stored raw for idempotency and audit; duplicates are ignored after processing.",
          "Failed payments move processing invoices back to pending; full refunds mark invoices refunded.",
        ],
      },
      {
        title: "Fee Order Creation",
        url: "/api/student/fees/[id]/order",
        linkable: false,
        audience: "Student portal (internal)",
        description:
          "Creates the Razorpay order (in paise) when a student clicks Pay. Repeated clicks reuse the existing order while it is pending.",
        howTo: [
          "Called automatically by the fees page; requires a logged-in student session.",
        ],
      },
      {
        title: "Payment Verification",
        url: "/api/student/fees/[id]/verify",
        linkable: false,
        audience: "Student portal (internal)",
        description:
          "Verifies the Razorpay checkout callback: signature, order, amount, currency, and payment status must all match before the invoice moves to processing. Final paid status still waits for the webhook.",
        howTo: [
          "Called automatically after checkout completes; never mark fees paid from the browser callback alone.",
        ],
      },
      {
        title: "CRM Media Upload",
        url: "/api/crm/media/upload",
        linkable: false,
        audience: "CRM editors (internal)",
        description:
          "Handles image uploads from the blog, course, and gallery editors into Cloudflare R2 (with Vercel Blob fallback).",
        howTo: [
          "Used automatically by the CRM editors; requires an admin session.",
        ],
      },
      {
        title: "Media Proxy",
        url: "/api/crm/media/file/[...key]",
        linkable: false,
        audience: "Browsers (internal)",
        description:
          "Serves CRM-uploaded media through the site's own domain so images work regardless of storage configuration.",
        howTo: ["No action needed — image URLs on the site route through it."],
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-parchment">
      <PageHero
        eyebrow="Feature directory"
        title="Everything this site can do"
        body="Every page, portal, and workflow in one place — what it does, where it lives, and step-by-step how to use it. Bookmark this page for staff onboarding and student orientation."
      />

      {groups.map((group) => (
        <section
          key={group.eyebrow}
          className="border-t border-line-strong bg-parchment-deep py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
            <SectionIntro
              eyebrow={group.eyebrow}
              title={group.title}
              body={group.body}
            />

            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              {group.features.map((feature) => (
                <article
                  key={feature.url}
                  className="flex flex-col bg-parchment p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
                        {feature.audience}
                      </p>
                      <h3 className="mt-3 font-display text-2xl font-normal leading-tight text-oxblood">
                        {feature.title}
                      </h3>
                    </div>
                    {feature.linkable === false ? (
                      <code className="shrink-0 border border-line-strong px-3 py-1 text-[0.7rem] text-ink-soft">
                        {feature.url}
                      </code>
                    ) : (
                      <Link
                        href={feature.url}
                        className="inline-flex shrink-0 items-center gap-1.5 border border-line-strong px-3 py-1 text-[0.7rem] font-semibold text-oxblood transition-colors hover:bg-oxblood hover:text-cream"
                      >
                        {feature.url}
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      </Link>
                    )}
                  </div>

                  <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                    {feature.description}
                  </p>

                  <p className="mt-5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    How to use it
                  </p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[0.9rem] leading-relaxed text-ink-soft">
                    {feature.howTo.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
