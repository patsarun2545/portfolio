import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const [projectsCount, skillsCount, blogPostsCount, unreadMessagesCount, engineeringHighlightsCount] =
    await Promise.all([
      prisma.project.count(),
      prisma.skill.count(),
      prisma.blogPost.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.engineeringHighlight.count(),
    ]);

  return (
    <DashboardContent
      projectsCount={projectsCount}
      skillsCount={skillsCount}
      blogPostsCount={blogPostsCount}
      unreadMessagesCount={unreadMessagesCount}
      engineeringHighlightsCount={engineeringHighlightsCount}
    />
  );
}
