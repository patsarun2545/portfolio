"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/useLocale";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  Code2,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Zap,
  FolderOpen,
  Building2,
  } from "lucide-react";

const navigation = [
  { key: "dashboard", href: "/admin/dashboard", iconName: "LayoutDashboard" },
  { key: "about", href: "/admin/about", iconName: "User" },
  { key: "engineeringHighlights", href: "/admin/engineering-highlights", iconName: "Zap" },
  { key: "skills", href: "/admin/skills", iconName: "Code2" },
  { key: "projects", href: "/admin/projects", iconName: "FolderOpen" },
  { key: "experience", href: "/admin/experience", iconName: "Building2" },
  { key: "education", href: "/admin/education", iconName: "GraduationCap" },
  { key: "blog", href: "/admin/blog", iconName: "FileText" },
  { key: "messages", href: "/admin/messages", iconName: "Mail" },
];

interface AdminSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  pathname: string;
  onLogout: () => void;
}

export default function AdminSidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isDarkMode,
  setIsDarkMode,
  pathname,
  onLogout,
}: AdminSidebarProps) {
  const { t, locale, setLocale } = useLocale();
  const [localeMounted, setLocaleMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleMounted(true);
    // Standard pattern to prevent hydration mismatch with localStorage
  }, []);
  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 bottom-0 bg-card border-r border-border flex-col transition-all duration-300 ${isSidebarCollapsed ? "w-16" : "w-56"
        }`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isSidebarCollapsed && (
          <h1 className="text-lg font-bold tracking-tight">{t("admin.panel")}</h1>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="shrink-0 h-9 w-9 hover:bg-accent"
            aria-label={isSidebarCollapsed ? t("admin.expandSidebar") : t("admin.collapseSidebar")}
            aria-expanded={isSidebarCollapsed}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.iconName === "LayoutDashboard" ? LayoutDashboard :
            item.iconName === "User" ? User :
              item.iconName === "Code2" ? Code2 :
                item.iconName === "Zap" ? Zap :
                item.iconName === "FolderOpen" ? FolderOpen :
                  item.iconName === "Building2" ? Building2 :
                    item.iconName === "Briefcase" ? Briefcase :
                    item.iconName === "GraduationCap" ? GraduationCap :
                      item.iconName === "FileText" ? FileText :
                        item.iconName === "Mail" ? Mail : LayoutDashboard;
          const iconColor = item.iconName === "LayoutDashboard" ? "text-blue-500" :
            item.iconName === "User" ? "text-green-500" :
              item.iconName === "Code2" ? "text-purple-500" :
                item.iconName === "Zap" ? "text-yellow-500" :
                  item.iconName === "FolderOpen" ? "text-orange-500" :
                  item.iconName === "Building2" ? "text-amber-500" :
                    item.iconName === "Briefcase" ? "text-amber-500" :
                    item.iconName === "GraduationCap" ? "text-pink-500" :
                      item.iconName === "FileText" ? "text-cyan-500" :
                        item.iconName === "Mail" ? "text-red-500" : "text-blue-500";
          return (
            <Link
              key={item.key}
              href={item.href}
              title={isSidebarCollapsed ? t(`admin.${item.key}`) : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-foreground hover:bg-accent hover:shadow-sm"
                }`}
            >
              <IconComponent className={`h-5 w-5 shrink-0 ${isActive ? "" : iconColor}`} />
              {!isSidebarCollapsed && <span>{t(`admin.${item.key}`)}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-border space-y-1">
        <Button
          variant="ghost"
          className={`w-full justify-start h-9 hover:bg-accent ${isSidebarCollapsed ? "px-3" : ""}`}
          onClick={() => setLocale(locale === "th" ? "en" : "th")}
          title={isSidebarCollapsed ? (localeMounted && locale === "th" ? "English" : "ไทย") : undefined}
        >
          <Globe className="h-5 w-5 shrink-0 text-blue-400" />
          {!isSidebarCollapsed && <span className="ml-2">{localeMounted ? (locale === "th" ? "English" : "ไทย") : "TH"}</span>}
        </Button>
        <Button
          variant="ghost"
          className={`w-full justify-start h-9 hover:bg-accent ${isSidebarCollapsed ? "px-3" : ""}`}
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isSidebarCollapsed ? (isDarkMode ? t("admin.lightMode") : t("admin.darkMode")) : undefined}
        >
          {isDarkMode ? <Sun className="h-5 w-5 shrink-0 text-yellow-400" /> : <Moon className="h-5 w-5 shrink-0 text-indigo-400" />}
          {!isSidebarCollapsed && <span className="ml-2">{isDarkMode ? t("admin.lightMode") : t("admin.darkMode")}</span>}
        </Button>
        <Button
          variant="ghost"
          className={`w-full justify-start h-9 hover:bg-accent ${isSidebarCollapsed ? "px-3" : ""}`}
          asChild
          title={isSidebarCollapsed ? t("admin.viewPortfolio") : undefined}
        >
          <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <ExternalLink className="h-5 w-5 shrink-0 text-teal-400" />
            {!isSidebarCollapsed && <span className="ml-2">{t("admin.viewPortfolio")}</span>}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className={`w-full justify-start h-9 hover:bg-accent ${isSidebarCollapsed ? "px-3" : ""}`}
          onClick={onLogout}
          title={isSidebarCollapsed ? t("admin.logout") : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 text-red-400" />
          {!isSidebarCollapsed && <span className="ml-2">{t("admin.logout")}</span>}
        </Button>
      </div>
    </aside>
  );
}
