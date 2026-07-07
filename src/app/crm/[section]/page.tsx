import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AdminAccessPanel,
  CrmChrome,
  type CrmSectionKey,
  GalleryAdminPanel,
  getCrmChromeData,
  getCrmSection,
  LeadsPanel,
  ScholarshipRequestsPanel,
} from "@/app/crm/_components";
import { BlogEditor } from "@/components/crm/blog-editor";
import { CourseEditor } from "@/components/crm/course-editor";
import { StudentAdminPanel } from "@/components/crm/student-admin-panel";
import { TestsPanel } from "@/components/crm/tests-panel";
import { isOwnerEmail } from "@/lib/crm/admins";
import { listBlogPosts } from "@/lib/crm/blog-posts";
import { listCoursePages } from "@/lib/crm/course-pages";
import { listGalleryImages } from "@/lib/crm/gallery";
import { listLeads } from "@/lib/crm/leads";
import {
  listCourseNotices,
  listCourseOptions,
  listStudents,
} from "@/lib/crm/students";
import { listTests } from "@/lib/crm/tests";

type CrmSectionPageProps = {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) || undefined;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CrmSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const crmSection = getCrmSection(section);

  return {
    title: crmSection ? `${crmSection.title} CRM` : "CRM",
    robots: { index: false, follow: false },
  };
}

export default async function CrmSectionPage({
  params,
  searchParams,
}: CrmSectionPageProps) {
  const { section } = await params;
  const crmSection = getCrmSection(section);

  if (!crmSection || crmSection.key === "dashboard") notFound();

  const active = crmSection.key as CrmSectionKey;

  if (section === "leads") {
    const [chrome, leads, students, sp] = await Promise.all([
      getCrmChromeData(),
      listLeads(),
      listStudents(),
      searchParams,
    ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <LeadsPanel
          leads={leads}
          students={students}
          statusFilter={firstParam(sp.status)}
        />
      </CrmChrome>
    );
  }

  if (section === "scholarships") {
    const [chrome, leads, students] = await Promise.all([
      getCrmChromeData(),
      listLeads(),
      listStudents(),
    ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <ScholarshipRequestsPanel leads={leads} students={students} />
      </CrmChrome>
    );
  }

  if (section === "courses") {
    const [chrome, coursePages] = await Promise.all([
      getCrmChromeData(),
      listCoursePages(),
    ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <CourseEditor
          pages={coursePages}
          mediaStorage={chrome.env.mediaStorage}
        />
      </CrmChrome>
    );
  }

  if (section === "blog") {
    const [chrome, blogPosts] = await Promise.all([
      getCrmChromeData(),
      listBlogPosts(),
    ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <BlogEditor posts={blogPosts} mediaStorage={chrome.env.mediaStorage} />
      </CrmChrome>
    );
  }

  if (section === "gallery") {
    const [chrome, images] = await Promise.all([
      getCrmChromeData(),
      listGalleryImages(),
    ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <GalleryAdminPanel
          images={images}
          mediaStorage={chrome.env.mediaStorage}
        />
      </CrmChrome>
    );
  }

  if (section === "students") {
    const [chrome, students, courseNotices, courseOptions, sp] =
      await Promise.all([
        getCrmChromeData(),
        listStudents(),
        listCourseNotices(),
        listCourseOptions(),
        searchParams,
      ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <StudentAdminPanel
          students={students}
          notices={courseNotices}
          courseOptions={courseOptions}
          filters={{
            q: firstParam(sp.q),
            course: firstParam(sp.course),
            batch: firstParam(sp.batch),
            status: firstParam(sp.status),
            fees: firstParam(sp.fees),
          }}
        />
      </CrmChrome>
    );
  }

  if (section === "tests") {
    const [chrome, tests, students, courseOptions] = await Promise.all([
      getCrmChromeData(),
      listTests(),
      listStudents(),
      listCourseOptions(),
    ]);
    const batchNames = [
      ...new Set(
        students.flatMap((student) =>
          student.enrollments.flatMap((enrollment) =>
            enrollment.batchName ? [enrollment.batchName] : [],
          ),
        ),
      ),
    ].sort();

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <TestsPanel
          tests={tests}
          courseOptions={courseOptions}
          batchNames={batchNames}
        />
      </CrmChrome>
    );
  }

  if (section === "admins") {
    const chrome = await getCrmChromeData();
    const isOwner = await isOwnerEmail(chrome.session.email);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        {isOwner ? (
          <AdminAccessPanel
            admins={chrome.admins}
            currentEmail={chrome.session.email}
          />
        ) : (
          <section className="mt-8 bg-parchment px-5 py-16 text-center sm:px-7">
            <h2 className="font-display text-4xl text-oxblood">Owners only</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              Your account has staff access. Ask an owner admin to manage the
              CRM access list.
            </p>
          </section>
        )}
      </CrmChrome>
    );
  }

  notFound();
}
