import Head from "next/head";
    // Header is now handled by MainLayout in _app.tsx
    
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    type Post = { id:string; title:string; body:string; date:string; };
type Meeting = { id:string; title:string; date:string; location:string; };
const POSTS: Post[] = [
  {"id":"HOA-001","title":"تنبيه صيانة المصاعد","body":"سيتم إجراء صيانة يوم الجمعة.","date":"2025-08-12"},
  {"id":"HOA-002","title":"تذكير رسوم الخدمات","body":"يرجى سداد الرسوم قبل نهاية الشهر.","date":"2025-08-20"},
];
const MEETINGS: Meeting[] = [
  {"id":"M-001","title":"اجتماع الجمعية العمومية","date":"2025-09-01 18:00","location":"قاعة الاجتماعات - المبنى A"},
];
export function Content(){
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          {POSTS.map(p=> (
            <article key={p.id} className="rounded-2xl border bg-white p-4">
              <h3 className="font-semibold text-slate-900">{p.title}</h3>
              <p className="text-sm text-slate-700 mt-1">{p.body}</p>
              <time className="text-xs text-slate-500 mt-2 block">{p.date}</time>
            </article>
          ))}
        </div>
        <aside className="grid gap-4">
          <div className="rounded-2xl border bg-white p-4">
            <h4 className="font-semibold text-slate-900">الاجتماعات القادمة</h4>
            <ul className="mt-2 space-y-2">
              {MEETINGS.map(m=> (
                <li key={m.id} className="rounded-xl border p-3 text-sm">
                  <div className="font-medium">{m.title}</div>
                  <div className="text-slate-600">{m.date}</div>
                  <div className="text-slate-600">{m.location}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>جمعية الملاك | Ain Oman</title></Head>
          
          <div className="flex-1">
            <Content />
          </div>
          
        </main>
      );
    }
