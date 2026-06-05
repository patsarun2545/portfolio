"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/hooks/useLocale";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  User,
  Code2,
  Briefcase,
  GraduationCap,
  FileText,
  Mail,
  LogOut,
  Menu,
  MoreVertical,
  ExternalLink,
  Moon,
  Sun,
  Globe,
  Zap,
} from "lucide-react";

const navigation = [
  { key: "dashboard", href: "/admin/dashboard", iconName: "LayoutDashboard" },
  { key: "about", href: "/admin/about", iconName: "User" },
  { key: "engineeringHighlights", href: "/admin/engineering-highlights", iconName: "Zap" },
  { key: "skills", href: "/admin/skills", iconName: "Code2" },
  { key: "projects", href: "/admin/projects", iconName: "Briefcase" },
  { key: "experience", href: "/admin/experience", iconName: "Briefcase" },
  { key: "education", href: "/admin/education", iconName: "GraduationCap" },
  { key: "blog", href: "/admin/blog", iconName: "FileText" },
  { key: "messages", href: "/admin/messages", iconName: "Mail" },
];

interface AdminMobileHeaderProps {
  pathname: string;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onLogout: () => void;
}

export default function AdminMobileHeader({
  pathname,
  isDarkMode,
  setIsDarkMode,
  onLogout,
}: AdminMobileHeaderProps) {
  const { t, locale, setLocale } = useLocale();
  const [localeMounted, setLocaleMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleMounted(true);
    // Standard pattern to prevent hydration mismatch with localStorage
  }, []);
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="flex items-center justify-between p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent" aria-label={t("admin.openMenu")}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 sm:p-6 border-b border-border">
              <SheetTitle className="text-lg sm:text-xl font-bold">{t("admin.panel")}</SheetTitle>
              <SheetDescription className="text-sm">{t("admin.navigateTo")}</SheetDescription>
            </SheetHeader>
            <div className="p-4 sm:p-6">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const IconComponent = item.iconName === "LayoutDashboard" ? LayoutDashboard :
                    item.iconName === "User" ? User :
                      item.iconName === "Code2" ? Code2 :
                        item.iconName === "Zap" ? Zap :
                          item.iconName === "Briefcase" ? Briefcase :
                            item.iconName === "GraduationCap" ? GraduationCap :
                              item.iconName === "FileText" ? FileText :
                                item.iconName === "Mail" ? Mail : LayoutDashboard;
                  const iconColor = item.iconName === "LayoutDashboard" ? "text-blue-500" :
                    item.iconName === "User" ? "text-green-500" :
                      item.iconName === "Code2" ? "text-purple-500" :
                        item.iconName === "Zap" ? "text-yellow-500" :
                          item.iconName === "Briefcase" ? "text-orange-500" :
                            item.iconName === "GraduationCap" ? "text-pink-500" :
                              item.iconName === "FileText" ? "text-cyan-500" :
                                item.iconName === "Mail" ? "text-red-500" : "text-blue-500";
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-foreground hover:bg-accent hover:shadow-sm"
                        }`}
                    >
                      <IconComponent className={`h-5 w-5 ${isActive ? "" : iconColor}`} />
                      {t(`admin.${item.key}`)}
                    </Link>
                  );
                })}
              </nav>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 hover:bg-accent"
                  onClick={() => setLocale(locale === "th" ? "en" : "th")}
                >
                  <Globe className="h-5 w-5 mr-2 text-blue-400" />
                  {localeMounted ? (locale === "th" ? "English" : "ไทย") : "TH"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 hover:bg-accent"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <Sun className="h-5 w-5 mr-2 text-yellow-400" /> : <Moon className="h-5 w-5 mr-2 text-indigo-400" />}
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 hover:bg-accent"
                  asChild
                >
                  <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2 text-teal-400" />
                    {t("admin.viewPortfolio")}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 hover:bg-accent"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5 mr-2 text-red-400" />
                  {t("admin.logout")}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">{t("admin.panel")}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent" aria-label={t("admin.moreOptions")}>
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-sm font-medium">{t("admin.quickActionsLabel")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocale(locale === "th" ? "en" : "th")} className="cursor-pointer hover:bg-accent">
              <Globe className="h-4 w-4 mr-2 text-blue-400" />
              {localeMounted ? (locale === "th" ? "English" : "ไทย") : "TH"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)} className="cursor-pointer hover:bg-accent">
              {isDarkMode ? <Sun className="h-4 w-4 mr-2 text-yellow-400" /> : <Moon className="h-4 w-4 mr-2 text-indigo-400" />}
              {isDarkMode ? t("admin.lightMode") : t("admin.darkMode")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:bg-accent">
                <ExternalLink className="h-4 w-4 mr-2 text-teal-400" />
                {t("admin.viewPortfolio")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer hover:bg-accent">
              <LogOut className="h-4 w-4 mr-2 text-red-400" />
              {t("admin.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
