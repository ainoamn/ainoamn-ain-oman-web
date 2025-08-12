import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

export default function CreateHOA() {
  const { t, dir } = useI18n();
  const [name, setName] = useState("");
  const [property, setProperty] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/hoa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, property }),
    });
    window.location.href = "/owners-association";
  }

  return (
    <Layout>
      <Head><title>{t("owners.create", "إنشاء جمعية")} | Ain Oman</title></Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">{t("owners.create", "إنشاء جمعية")}</h1>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1">{t("owners.form.name", "اسم الجمعية")}</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} required className="w-full rounded-xl border px-3 py-2" placeholder={t("owners.form.name_ph", "مثال: جمعية الندى")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("owners.form.property", "العقار/المبنى")}</label>
              <input value={property} onChange={(e)=>setProperty(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder={t("owners.form.property_ph", "اختر/اكتب اسم العقار")} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">{t("common.save", "حفظ")}</button>
              <a href="/owners-association" className="rounded-xl border px-4 py-2 hover:bg-slate-50">{t("common.cancel", "إلغاء")}</a>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
}
