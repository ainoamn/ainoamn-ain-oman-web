// src/pages/admin/settings.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { useTranslation } from "@/hooks/useTranslation";
import ManualDevTool from "@/components/admin/settings/ManualDevTool";
import HeaderFooterTool from "@/components/admin/settings/HeaderFooterTool";
import AdsTool from "@/components/admin/settings/AdsTool";
import StudioTab from "@/components/admin/settings/StudioTab";

type Tab = "general" | "dev" | "hf" | "ads" | "studio";

export default function AdminSettings() {
  const { t, dir } = useTranslation();
  const r = useRouter();
  const tab = (r.query.tab as Tab) || "dev";

  function setTab(next: Tab) {
    r.push({ pathname: "/admin/settings", query: { tab: next } }, undefined, { shallow: true });
  }

  return (
    <AdminLayout>
      <Head><title>{t("admin.settings.title","الإعدادات")} | Ain Oman</title></Head>

      <div dir={dir} className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{t("admin.settings.title","الإعدادات")}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setTab("general")} className={`rounded-xl border px-3 py-1.5 text-sm ${tab==="general"?"bg-slate-900 text-white":"hover:bg-slate-50"}`}>عام</button>
          <button onClick={()=>setTab("dev")}     className={`rounded-xl border px-3 py-1.5 text-sm ${tab==="dev"    ?"bg-slate-900 text-white":"hover:bg-slate-50"}`}>أداة التطوير اليدوية</button>
          <button onClick={()=>setTab("hf")}      className={`rounded-xl border px-3 py-1.5 text-sm ${tab==="hf"     ?"bg-slate-900 text-white":"hover:bg-slate-50"}`}>الهيدر والفوتر</button>
          <button onClick={()=>setTab("ads")}     className={`rounded-xl border px-3 py-1.5 text-sm ${tab==="ads"    ?"bg-slate-900 text-white":"hover:bg-slate-50"}`}>الإعلانات</button>
          <button onClick={()=>setTab("studio")}  className={`rounded-xl border px-3 py-1.5 text-sm ${tab==="studio" ?"bg-slate-900 text-white":"hover:bg-slate-50"}`}>الاستوديو</button>
        </div>

        {tab==="general" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-base font-semibold text-slate-900">إعدادات عامة</h3>
            <p className="text-sm text-slate-600">ضع أي إعداد عام هنا لاحقًا.</p>
          </section>
        )}
        {tab==="dev"    && <ManualDevTool/>}
        {tab==="hf"     && <HeaderFooterTool/>}
        {tab==="ads"    && <AdsTool/>}
        {tab==="studio" && <StudioTab/>}
      </div>
    </AdminLayout>
  );
}
