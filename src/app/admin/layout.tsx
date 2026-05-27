import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import ClientLocaleProvider from "@/components/LocaleProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLocaleProvider includeAdmin={true}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </ClientLocaleProvider>
  );
}