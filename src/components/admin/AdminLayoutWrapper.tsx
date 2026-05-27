"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { logout } from "@/lib/actions/index";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useLocale } from "@/hooks/useLocale";

const AdminSidebar = dynamic(() => import("@/components/admin/AdminSidebar"), {
  ssr: false,
  loading: () => <div className="w-56 h-screen bg-muted animate-pulse" />
});
const AdminMobileHeader = dynamic(() => import("@/components/admin/AdminMobileHeader"), {
  ssr: false,
  loading: () => <div className="h-16 bg-muted animate-pulse" />
});

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();

  // Generate CSRF token on mount
  useEffect(() => {
    if (!isLoginPage) {
      fetch("/api/admin/csrf", { method: "POST" });
    }
  }, [isLoginPage]);

  const handleLogout = async () => {
    // Clear the login toast flag so it shows again on next login
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hasShownLoginToast");
    }
    toast.success(t("admin.logoutSuccess"));
    await logout();
  };

  const isDarkMode = resolvedTheme === "dark";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Collapsible */}
      <AdminSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isDarkMode={isDarkMode}
        setIsDarkMode={(value: boolean) => setTheme(value ? "dark" : "light")}
        pathname={pathname}
        onLogout={handleLogout}
      />

      {/* Mobile/Tablet Header */}
      <AdminMobileHeader
        pathname={pathname}
        isDarkMode={isDarkMode}
        setIsDarkMode={(value: boolean) => setTheme(value ? "dark" : "light")}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={`lg:transition-all lg:duration-300 pt-16 lg:pt-0 ${isSidebarCollapsed ? "lg:ml-16" : "lg:ml-56"
        }`}>
        <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">{children}</div>
      </main>
    </div>
  );
}
