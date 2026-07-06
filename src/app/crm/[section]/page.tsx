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
import { listBlogPosts } from "@/lib/crm/blog-posts";
import { listCoursePages } from "@/lib/crm/course-pages";
import { listLeads } from "@/lib/crm/leads";
import {
  listCourseNotices,
  listCourseOptions,
  listStudents,
} from "@/lib/crm/students";

type CrmSectionPageProps = {
  params: Promise<{ section: string }>;
};

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

export default async function CrmSectionPage({ params }: CrmSectionPageProps) {
  const { section } = await params;
  const crmSection = getCrmSection(section);

  if (!crmSection || crmSection.key === "dashboard") notFound();

  const active = crmSection.key as CrmSectionKey;

  if (section === "leads") {
    const [chrome, leads, courseOptions] = await Promise.all([
      getCrmChromeData(),
      listLeads(),
      listCourseOptions(),
    ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <LeadsPanel leads={leads} courseOptions={courseOptions} />
      </CrmChrome>
    );
  }

  if (section === "scholarships") {
    const [chrome, leads] = await Promise.all([
      getCrmChromeData(),
      listLeads(),
    ]);

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <ScholarshipRequestsPanel leads={leads} />
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
    const chrome = await getCrmChromeData();

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <GalleryAdminPanel mediaStorage={chrome.env.mediaStorage} />
      </CrmChrome>
    );
  }

  if (section === "students") {
    const [chrome, students, courseNotices, courseOptions] = await Promise.all([
      getCrmChromeData(),
      listStudents(),
      listCourseNotices(),
      listCourseOptions(),
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
        />
      </CrmChrome>
    );
  }

  if (section === "admins") {
    const chrome = await getCrmChromeData();

    return (
      <CrmChrome
        active={active}
        admins={chrome.admins}
        env={chrome.env}
        sessionEmail={chrome.session.email}
      >
        <AdminAccessPanel
          admins={chrome.admins}
          currentEmail={chrome.session.email}
        />
      </CrmChrome>
    );
  }

  notFound();
}
