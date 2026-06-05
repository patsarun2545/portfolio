"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Code2,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface DashboardContentProps {
  projectsCount: number;
  skillsCount: number;
  blogPostsCount: number;
  unreadMessagesCount: number;
  engineeringHighlightsCount: number;
}

export default function DashboardContent({
  projectsCount,
  skillsCount,
  blogPostsCount,
  unreadMessagesCount,
  engineeringHighlightsCount,
}: DashboardContentProps) {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    // Check if toast was already shown in this session (only on client)
    if (typeof window !== "undefined" && !hasShownToastRef.current) {
      const hasShownLoginToast = sessionStorage.getItem("hasShownLoginToast");
      if (!hasShownLoginToast) {
        hasShownToastRef.current = true;
        // Small delay to ensure toast provider is ready
        setTimeout(() => {
          toast.success(t("admin.loginSuccess"));
          sessionStorage.setItem("hasShownLoginToast", "true");
        }, 300);
      }
    }
  }, [t]);

  const stats = [
    {
      title: mounted ? t("admin.engineeringHighlights") : "Engineering Highlights",
      count: engineeringHighlightsCount,
      icon: Zap,
      href: "/admin/engineering-highlights",
      color: "bg-yellow-500",
    },
    {
      title: mounted ? t("admin.skills") : "Skills",
      count: skillsCount,
      icon: Code2,
      href: "/admin/skills",
      color: "bg-purple-500",
    },
    {
      title: mounted ? t("admin.projects") : "Projects",
      count: projectsCount,
      icon: Briefcase,
      href: "/admin/projects",
      color: "bg-orange-500",
    },
    {
      title: mounted ? t("admin.blogPosts") : "Blog Posts",
      count: blogPostsCount,
      icon: FileText,
      href: "/admin/blog",
      color: "bg-cyan-500",
    },
    {
      title: mounted ? t("admin.unreadMessages") : "Unread Messages",
      count: unreadMessagesCount,
      icon: Mail,
      href: "/admin/messages",
      color: "bg-red-500",
    },
  ];

  const quickActions = [
    { name: mounted ? t("admin.about") : "About", href: "/admin/about", icon: User, color: "bg-blue-500" },
    { name: mounted ? t("admin.experience") : "Experience", href: "/admin/experience", icon: Briefcase, color: "bg-green-500" },
    { name: mounted ? t("admin.education") : "Education", href: "/admin/education", icon: GraduationCap, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{mounted ? t("admin.dashboard") : "Dashboard"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{mounted ? t("admin.welcomeBack") : "Welcome back"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
                <div className={`p-1.5 rounded-md ${stat.color}`}>
                  <stat.icon className="h-3.5 w-3.5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{mounted ? t("admin.quickActions") : "Quick Actions"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color} shrink-0`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{action.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {mounted ? t("admin.manage") : "Manage"} {action.name.toLowerCase()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
