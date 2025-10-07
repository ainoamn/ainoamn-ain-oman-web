import Head from "next/head";
// Header and Footer are now handled by MainLayout in _app.tsx
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    export function Content(){
  return (
    <section className="py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 bg-white border rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">الشروط والأحكام</h1>
        <p className="text-sm text-slate-700 mb-2">هذه نسخة تمهيدية للاستخدام التجريبي، وسيتم تحديثها لاحقًا.</p>
        <ol className="list-decimal ms-5 space-y-2 text-sm text-slate-700">
          <li>استخدام المنصة وفق القوانين المعمول بها في سلطنة عمان.</li>
          <li>التزام المستخدم بصحة البيانات والمستندات.</li>
          <li>سياسة الإعلانات والمزادات والاشتراكات تخضع للتحديث.</li>
          <li>لا تتحمل المنصة مسؤولية التعاملات خارج نظام الدفع المعتمد.</li>
        </ol>
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>الشروط والأحكام | Ain Oman</title></Head>
          <div className="flex-1">
            <Content />
          </div>
        </main>
      );
    }