import prisma from "@/lib/db";
import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import SkillsSection from "@/components/public/SkillsSection";
import ExperienceSection from "@/components/public/ExperienceSection";
import EducationSection from "@/components/public/EducationSection";
import ProjectsSection from "@/components/public/ProjectsSection";
import BlogSection from "@/components/public/BlogSection";
import ContactSection from "@/components/public/ContactSection";
import { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const about = await prisma.about.findFirst();

  const title = locale === "th" ? (about?.titleTh ?? about?.title) : about?.title;
  const bio = locale === "th" ? (about?.bioTh ?? about?.bio) : about?.bio;

  return {
    title: `${about?.name || "Portfolio"} - ${title || ""}`,
    description: bio || "Full Stack Developer Portfolio",
    openGraph: {
      title: `${about?.name || "Portfolio"} - ${title || ""}`,
      description: bio || "Full Stack Developer Portfolio",
      images: about?.avatarUrl ? [about.avatarUrl] : [],
      type: "website",
    },
  };
}

export default async function HomePage() {
  const [about, skills, experiences, education, projects, blogPosts] = await Promise.all([
    prisma.about.findFirst(),
    prisma.skill.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.experience.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.education.findMany({
      orderBy: { sortOrder: "asc" },
    }).then(edu => edu.map(e => ({
      ...e,
      gpa: e.gpa ? Number(e.gpa) : null,
    }))),
    prisma.project.findMany({
      where: { isVisible: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  if (!about) {
    return (
      <main className="min-h-screen">
        <p>No about information found. Please add data to the database.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection about={about} />
      <AboutSection about={about} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <ExperienceSection experiences={experiences} />
      <EducationSection education={education} />
      <BlogSection posts={blogPosts} />
      <ContactSection />
      <footer className="py-6 sm:py-8 px-4 text-center text-muted-foreground text-sm sm:text-base">
        <p>&copy; {new Date().getFullYear()} {about.name}. All rights reserved.</p>
      </footer>
    </main>
  );
}
