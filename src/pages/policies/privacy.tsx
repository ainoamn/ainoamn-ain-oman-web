import Head from "next/head";
    import Header from "@/components/layout/Header";
    import Footer from "@/components/layout/Footer";
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    export function Content(){
  return (
    <section className="py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 bg-white border rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">سياسة الخصوصية</h1>
        <p className="text-sm text-slate-700 mb-2">نلتزم بحماية بياناتك. هذه نسخة أولية وسيتم تحديثها لاحقًا.</p>
        <ul className="list-disc ms-5 space-y-2 text-sm text-slate-700">
          <li>جمع أقل قدر من البيانات اللازمة لتقديم الخدمة.</li>
          <li>عدم مشاركة البيانات مع أطراف ثالثة دون موافقة صريحة.</li>
          <li>تخزين آمن وتشفير عند الإمكان.</li>
          <li>إمكانية تصدير/حذف بياناتك عند الطلب.</li>
        </ul>
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>سياسة الخصوصية | Ain Oman</title></Head>
          <Header />
          <div className="flex-1">
            <Content />
          </div>
          <Footer />
        </main>
      );
    }