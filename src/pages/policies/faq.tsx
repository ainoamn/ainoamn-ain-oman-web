// src/pages/policies/faq.tsx
import Head from "next/head";
// Header and Footer are now handled by MainLayout in _app.tsx
import { useState } from "react";

// ---- i18n fallback ----
let useI18n: any;
try {
  useI18n = require("@/lib/i18n").useI18n;
} catch {
  useI18n = () => ({
    t: (k: string, d?: string) => ({
      "faq.title": "الأسئلة الشائعة",
      "faq.subtitle": "إجابات سريعة عن أكثر الأسئلة تكرارًا حول Ain Oman.",
      "faq.contact": "لم تجد إجابتك؟ تواصل معنا",
    } as Record<string, string>)[k] || d || k,
    lang: "ar",
    dir: "rtl",
  });
}

type QA = { q: string; a: string };

const ITEMS: QA[] = [
  { q: "كيف أضيف عقارًا؟", a: "اذهب إلى صفحة إضافة عقار، ثم ارفع الصور والوسوم وأكمل المعلومات واحفظ وانشر." },
  { q: "هل المزايدات موثّقة؟", a: "نعم، سيتم ربط المزايدات مع منصة مزادات عُمان والجهات ذات العلاقة لتوثيق الإجراءات." },
  { q: "كيف يتم الدفع؟", a: "يوجد طرق دفع متعددة عبر بوابات محلية ودولية، مع فواتير وسجلات دفع داخل حسابك." },
  { q: "كيف أحصل على شارة التوثيق؟", a: "أكمل توثيق الهوية والمستندات المطلوبة من صفحة الشارات، وسيتم مراجعتها وإصدار الشارة." },
  { q: "هل يمكن ربط حسابي مع شركتي؟", a: "نعم، أنشئ حساب شركة ثم أضف الموظفين مع الصلاحيات المناسبة من لوحة التحكم." },
];

function Content() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">{t("faq.title")}</h1>
          <p className="opacity-95 mt-1">{t("faq.subtitle")}</p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {ITEMS.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div key={idx} className="rounded-2xl border bg-white shadow-sm">
                <button
                  type="button"
                  className="w-full text-right px-4 py-4 flex items-center justify-between"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : idx)}
                >
                  <span className="text-slate-900 font-semibold">{item.q}</span>
                  <span className={`ms-3 inline-flex h-7 w-7 items-center justify-center rounded-full ${isOpen ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 text-slate-700">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <a href="/contact" className="inline-block rounded-full bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 font-semibold">
            {t("faq.contact")}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const { dir } = useI18n();
  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head>
        <title>الأسئلة الشائعة | Ain Oman</title>
      </Head>
      <div className="flex-1">
        <Content />
      </div>
    </main>
  );
}
