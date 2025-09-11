// src/pages/policies.tsx
import Head from "next/head";
import { useI18n } from "@/lib/i18n";

export default function PoliciesPage() {
  const { t, dir } = useI18n();
  return (
    <main dir={dir} className="min-h-screen bg-slate-50">
      <Head>
        <title>{t("policies.title", "السياسات")} | Ain Oman</title>
      </Head>

      <section className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">{t("policies.title", "السياسات")}</h1>
        <p className="text-slate-600">{t("policies.subtitle", "سياسة الخصوصية وشروط الاستخدام")}</p>

        <article className="rounded-2xl border bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">{t("policies.privacy.title", "سياسة الخصوصية")}</h2>
          <p className="text-sm text-slate-700">
            {t(
              "policies.privacy.body",
              "نلتزم بحماية بياناتك الشخصية. تُستخدم المعلومات لتحسين الخدمة والتواصل عند الحاجة، ولن نشاركها مع طرف ثالث إلا وفق القانون."
            )}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">{t("policies.terms.title", "شروط الاستخدام")}</h2>
          <ul className="list-inside list-disc text-sm text-slate-700">
            <li>{t("policies.terms.1", "استخدم المنصة وفق القوانين المحلية.")}</li>
            <li>{t("policies.terms.2", "تحديث بياناتك مسؤوليتك.")}</li>
            <li>{t("policies.terms.3", "قد نقوم بتعديل الشروط بإشعار مسبق.")}</li>
          </ul>
        </article>

        <article className="rounded-2xl border bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">{t("policies.cookies.title", "ملفات تعريف الارتباط")}</h2>
          <p className="text-sm text-slate-700">
            {t(
              "policies.cookies.body",
              "نستخدم ملفات تعريف الارتباط لتحسين الأداء وتحليل الاستخدام. يمكنك ضبط الإعدادات من المتصفح."
            )}
          </p>
        </article>
      </section>
    </main>
  );
}
