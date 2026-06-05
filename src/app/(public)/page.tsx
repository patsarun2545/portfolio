import prisma from "@/lib/db";
import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import ErrorBoundary from "@/components/ErrorBoundary";

const EngineeringHighlightsSection = dynamic(() => import("@/components/public/EngineeringHighlightsSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

const SkillsSection = dynamic(() => import("@/components/public/SkillsSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

const ProjectsSection = dynamic(() => import("@/components/public/ProjectsSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

const ExperienceSection = dynamic(() => import("@/components/public/ExperienceSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

const EducationSection = dynamic(() => import("@/components/public/EducationSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

const BlogSection = dynamic(() => import("@/components/public/BlogSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

const GitHubStatsSection = dynamic(() => import("@/components/public/GitHubStatsSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

const ContactSection = dynamic(() => import("@/components/public/ContactSection"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>,
});

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
  const [about, skills, experiences, education, projects, blogPosts, engineeringHighlights] = await Promise.all([
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
    prisma.engineeringHighlight.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
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
      <EngineeringHighlightsSection highlights={engineeringHighlights} />
      <SkillsSection skills={skills} />
      <ErrorBoundary>
        <ProjectsSection projects={projects} />
      </ErrorBoundary>
      <ExperienceSection experiences={experiences} />
      <EducationSection education={education} />
      <ErrorBoundary>
        <BlogSection posts={blogPosts} />
      </ErrorBoundary>
      <ErrorBoundary>
        <GitHubStatsSection />
      </ErrorBoundary>
      <ContactSection />
      <footer className="py-6 sm:py-8 px-4 text-center text-muted-foreground text-sm sm:text-base">
        <p>&copy; {new Date().getFullYear()} {about.name}. All rights reserved.</p>
      </footer>
    </main>
  );
}
