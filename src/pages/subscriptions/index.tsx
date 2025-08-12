// src/pages/subscriptions/index.tsx
import Head from "next/head";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

type Plan = {
  id: "FREE" | "PRO" | "BUSINESS";
  name: string;
  priceOMR: number;
  period: "/mo" | "/yr";
  features: string[];
  cta: string;
  highlight?: boolean;
  includesCreateAuction: boolean;
};

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "مجاني",
    priceOMR: 0,
    period: "/mo",
    cta: "ابدأ مجانًا",
    features: [
      "تصفّح المزادات",
      "تقديم مزايدة بحدود أساسية",
      "إشعارات عبر البريد",
    ],
    includesCreateAuction: false,
  },
  {
    id: "PRO",
    name: "احترافي",
    priceOMR: 9.9,
    period: "/mo",
    cta: "اشترك الآن",
    features: [
      "إنشاء وعرض المزادات",
      "تحسينات وصف العقار بالذكاء الاصطناعي",
      "تحليلات تسعير ذكية (أساسيات)",
      "دعم أولوية",
    ],
    includesCreateAuction: true,
    highlight: true,
  },
  {
    id: "BUSINESS",
    name: "شركات",
    priceOMR: 29.0,
    period: "/mo",
    cta: "تواصل للمؤسسات",
    features: [
      "صلاحيات متعددة للمستخدمين",
      "إنشاء غير محدود للمزادات",
      "تحليلات تسعير متقدمة + توصيات",
      "ربط بنكي وفوترة مفوترة (فوترة شهرية)",
      "دعم مخصص ومدير نجاح",
    ],
    includesCreateAuction: true,
  },
];

export default function SubscriptionsPage() {
  const { t, dir } = useI18n();
  const { user, upgrade } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);

  const onSelect = async (id: Plan["id"]) => {
    setBusy(id);
    await new Promise((r) => setTimeout(r, 600));
    upgrade(id);
    setBusy(null);
    alert("تم تفعيل الخطة بنجاح (محاكاة). يمكن لاحقًا ربط بوابة دفع Stripe/PayTabs.");
  };

  return (
    <main dir={dir} className="min-h-screen bg-slate-50">
      <Head>
        <title>باقات الاشتراك | Ain Oman</title>
      </Head>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">باقات الاشتراك</h1>
          <p className="mt-2 text-slate-600">اختر الخطة المناسبة لاحتياجاتك لفتح مزايا إضافية.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div key={p.id} className={`rounded-2xl border shadow-sm p-6 ${p.highlight ? "border-teal-400" : "border-slate-200"} bg-white`}>
              {p.highlight && (
                <div className="mb-3 inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
                  الأكثر اختيارًا
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
              <div className="mt-2 flex items-end gap-1">
                <div className="text-3xl font-extrabold text-slate-900">{p.priceOMR}</div>
                <div className="text-slate-500">ر.ع {p.period}</div>
              </div>
              <ul className="mt-5 space-y-2 text-slate-700">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>{f}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.includesCreateAuction ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {p.includesCreateAuction ? "يتضمن إنشاء المزادات" : "لا يتضمن إنشاء المزادات"}
                  </span>
                </li>
              </ul>

              <button
                disabled={!!busy}
                onClick={() => onSelect(p.id)}
                className={`mt-6 w-full rounded-xl px-5 py-3 font-semibold text-white transition ${
                  p.highlight ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-700 hover:bg-slate-800"
                } ${busy ? "opacity-60 cursor-wait" : ""}`}
              >
                {busy === p.id ? "جارٍ المعالجة..." : p.cta}
              </button>

              {p.id !== "FREE" && (
                <p className="mt-3 text-xs text-slate-500 text-center">
                  الدفع الإلكتروني لاحقًا عبر Stripe/PayTabs (Placeholder الآن).
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-slate-600">
          مستخدمك الحالي: <span className="font-semibold">{user.name}</span> — الخطة: <span className="font-semibold">{user.tier}</span>
        </div>
      </div>
    </main>
  );
}
