import Head from "next/head";
// Header and Footer are now handled by MainLayout in _app.tsx
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    type Badge = { id:string; name:string; tone:"emerald"|"sky"|"amber"|"violet"; desc:string; };
const BADGES: Badge[] = [
  {"id":"BDG-001","name":"موثّق","tone":"emerald","desc":"تم التحقق من الهوية والمستندات"},
  {"id":"BDG-002","name":"مميّز","tone":"sky","desc":"شركة ضمن برنامج الشراكة"},
  {"id":"BDG-003","name":"الأكثر مبيعًا","tone":"amber","desc":"أداء عالٍ في الصفقات"},
  {"id":"BDG-004","name":"خدمة ممتازة","tone":"violet","desc":"تقييمات فوق 4.7"},
];
function toneClasses(t:Badge["tone"]){return ({"emerald":"bg-emerald-50 text-emerald-700 ring-emerald-200",
  "sky":"bg-sky-50 text-sky-700 ring-sky-200", "amber":"bg-amber-50 text-amber-700 ring-amber-200",
  "violet":"bg-violet-50 text-violet-700 ring-violet-200"} as any)[t];}
export function Content(){
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">الشارات</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map(b => (
            <div key={b.id} className={"rounded-2xl border bg-white p-4 ring-1 " + toneClasses(b.tone)}>
              <h3 className="font-semibold">{b.name}</h3>
              <p className="text-sm opacity-80 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>الشارات | Ain Oman</title></Head>
          <div className="flex-1">
            <Content />
          </div>
        </main>
      );
    }
