import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import ClientLocaleProvider from "@/components/LocaleProvider";

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
