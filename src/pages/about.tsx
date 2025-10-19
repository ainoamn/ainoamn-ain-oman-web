// @ts-nocheck
// src/pages/about.tsx
import Head from "next/head";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t, dir } = useI18n();
  return (
    <main dir={dir} className="min-h-screen bg-slate-50">
      <Head>
        <title>{t("about.title", "من نحن")} | Ain Oman</title>
      </Head>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">{t("about.title", "من نحن")}</h1>
        <p className="mb-8 text-slate-600">{t("about.subtitle", "منصة عقارية ذكية تربط الأفراد والشركات بخدمات موثوقة.")}</p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">{t("about.mission.title", "رسالتنا")}</h2>
            <p className="text-slate-600">
              {t("about.mission.body", "تسهيل بيع وشراء وإدارة العقارات بتجربة رقمية موحدة وتكاملات حكومية وشركاء موثوقين.")}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">{t("about.vision.title", "رؤيتنا")}</h2>
            <p className="text-slate-600">
              {t("about.vision.body", "أن تكون عين عُمان بوابة العقار الأولى في السلطنة والخليج من حيث السهولة والموثوقية.")}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">{t("about.values.title", "قيمنا")}</h2>
            <ul className="list-inside list-disc text-slate-600">
              <li>{t("about.values.1", "الشفافية")}</li>
              <li>{t("about.values.2", "السرعة")}</li>
              <li>{t("about.values.3", "الأمان")}</li>
              <li>{t("about.values.4", "خدمة العميل")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">{t("about.partners.title", "شركاؤنا")}</h2>
          <p className="text-slate-600">
            {t("about.partners.body", "نعمل مع بنوك ومطوّرين ووكلاء معتمدين لتقديم حلول متكاملة للعملاء.")}
          </p>
        </div>
      </section>
    </main>
  );
}
