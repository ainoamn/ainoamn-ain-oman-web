// src/pages/pricing.tsx
import React from "react";
import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "مجاني",
    price: "0 ر.ع",
    period: "/شهري",
    features: [
      "تصفح العقارات والمزادات",
      "حفظ 10 عناصر مفضّلة",
      "إشعارات بريدية أساسية",
      "ملف مستخدم أساسي",
    ],
    cta: "ابدأ الآن",
  },
  {
    id: "basic",
    name: "أساسي",
    price: "9 ر.ع",
    period: "/شهري",
    features: [
      "كل مزايا المجاني",
      "متابعة مزاد واحد مباشر",
      "تنبيه سعر/مزايدة",
      "دعم أساسي",
    ],
    cta: "اشترك",
  },
  {
    id: "pro",
    name: "احترافي",
    price: "29 ر.ع",
    period: "/شهري",
    features: [
      "متابعة حتى 5 مزادات مباشرة",
      "أدوات تحليل عقاري أساسية",
      "لوحة تحكم شخصية",
      "تقارير PDF شهرية",
    ],
    cta: "اشترك",
  },
  {
    id: "business",
    name: "أعمال",
    price: "79 ر.ع",
    period: "/شهري",
    features: [
      "لوحات للشركات/الوكلاء",
      "إدارة فرق ومهام",
      "تكاملات دفع وفواتير",
      "واجهات API محدودة",
    ],
    cta: "تجربة مجانية",
  },
  {
    id: "enterprise",
    name: "مؤسسي",
    price: "—",
    period: "",
    features: [
      "حلول مخصّصة ومتكاملة",
      "تكاملات حكومية ومصرفية",
      "ذكاء اصطناعي متقدم",
      "SLA ودعم 24/7",
    ],
    cta: "تواصل معنا",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold">الباقات والاشتراكات</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          اختر الخطة المناسبة، ويمكنك الترقية أو الإلغاء في أي وقت.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
            <div className="font-semibold text-lg">{p.name}</div>
            <div className="mt-2 text-3xl font-bold">{p.price} <span className="text-base font-normal">{p.period}</span></div>
            <ul className="mt-4 space-y-2 text-sm">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {p.id === "enterprise" ? (
                <Link href="/contact" className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white inline-block">{p.cta}</Link>
              ) : (
                <Link href={`/checkout?plan=${p.id}`} className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white inline-block">{p.cta}</Link>
              )}
            </div>
            <div className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
              بالاشتراك، أنت توافق على الشروط وسياسة الخصوصية.
            </div>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold">كيفية الاشتراك</h2>
        <ol className="mt-3 space-y-2 text-sm list-decimal list-inside">
          <li>اختر الباقة.</li>
          <li>سجّل الدخول أو أنشئ حسابًا.</li>
          <li>أكمل عملية الدفع.</li>
          <li>ابدأ باستخدام الخصائص فورًا، ويمكنك إدارة الاشتراك من لوحة التحكم.</li>
        </ol>
      </section>
    </div>
  );
}
