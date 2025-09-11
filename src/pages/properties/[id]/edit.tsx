// src/pages/properties/[id]/edit.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";

export default function PropertyEditPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { t, dir } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={dir}>
      <Head>
        <title>{t("property.edit.title", "تعديل العقار")} | Ain Oman</title>
      </Head>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="text-sm text-slate-500 mb-6">
            <Link className="hover:underline" href="/properties">
              {t("nav.properties", "العقارات")}
            </Link>
            <span className="mx-2">/</span>
            <Link className="hover:underline" href={`/properties/${id ?? "_"}`}>
              {t("nav.property", "العقار")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">
              {t("property.edit", "تعديل")}
            </span>
          </nav>

          <h1 className="text-2xl font-semibold mb-6">
            {t("property.edit.heading", "تعديل بيانات العقار")} #{id}
          </h1>

          {/* نموذج التعديل */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm mb-1">
                {t("property.fields.title", "عنوان العقار")}
              </label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                placeholder={
                  t(
                    "property.placeholders.title",
                    "مثال: شقة 3 غرف في المعبيلة"
                  ) as string
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">
                  {t("property.fields.price", "السعر")}
                </label>
                <input
                  type="number"
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t("property.fields.status", "الحالة")}
                </label>
                <select className="w-full border rounded-xl px-3 py-2">
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">
                {t("property.fields.description", "الوصف")}
              </label>
              <textarea className="w-full border rounded-xl px-3 py-2 h-32" />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white"
              >
                {t("actions.save", "حفظ")}
              </button>
              <Link
                href={`/properties/${id ?? "_"}`}
                className="px-4 py-2 rounded-xl border"
              >
                {t("actions.cancel", "إلغاء")}
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
