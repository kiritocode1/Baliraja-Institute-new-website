import type { Metadata } from "next";
import {
  CrmChrome,
  CrmDashboard,
  getCrmChromeData,
} from "@/app/crm/_components";
import { listBlogPosts } from "@/lib/crm/blog-posts";
import { listCoursePages } from "@/lib/crm/course-pages";
import { listLeads } from "@/lib/crm/leads";
import { listCourseNotices, listStudents } from "@/lib/crm/students";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

export default async function CrmPage() {
  const [chrome, leads, blogPosts, coursePages, students, courseNotices] =
    await Promise.all([
      getCrmChromeData(),
      listLeads(),
      listBlogPosts(),
      listCoursePages(),
      listStudents(),
      listCourseNotices(),
    ]);

  return (
    <CrmChrome
      active="dashboard"
      admins={chrome.admins}
      env={chrome.env}
      sessionEmail={chrome.session.email}
    >
      <CrmDashboard
        admins={chrome.admins}
        blogPosts={blogPosts}
        courseNotices={courseNotices}
        coursePages={coursePages}
        leads={leads}
        students={students}
      />
    </CrmChrome>
  );
}
