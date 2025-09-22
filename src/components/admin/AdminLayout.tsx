// src/components/admin/AdminLayout.tsx
import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/hooks/useTranslation";
function AdminLayout({ children }: { children: ReactNode }) {
  const { dir } = useTranslation();
  return (
    <div dir={dir} className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto grid max-w-[1440px] grid-cols-[auto,1fr] gap-0 px-4 py-4">
        <AdminSidebar />
        <div className="min-h-[70vh] px-4">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
