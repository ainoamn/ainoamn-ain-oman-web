import Head from "next/head";
    import Header from "@/components/layout/Header";
    import Footer from "@/components/layout/Footer";
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    type Entry = { id:string; type:"in"|"out"; label:string; amount:number; date:string };
const ENTRIES: Entry[] = [
  {"id":"ACC-1","type":"in","label":"اشتراكات مميزة","amount":320.000,"date":"2025-08-01"},
  {"id":"ACC-2","type":"out","label":"تكاليف استضافة","amount":90.500,"date":"2025-08-02"},
  {"id":"ACC-3","type":"in","label":"عمولة مبيعات","amount":740.250,"date":"2025-08-05"},
];
export function Content(){
  const totalIn = ENTRIES.filter(e=>e.type==="in").reduce((s,e)=>s+e.amount,0);
  const totalOut = ENTRIES.filter(e=>e.type==="out").reduce((s,e)=>s+e.amount,0);
  const net = totalIn - totalOut;
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">الحسابات</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">إجمالي الإيرادات</div><div className="text-xl font-bold">{totalIn.toFixed(3)} ر.ع</div></div>
          <div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">إجمالي المصروفات</div><div className="text-xl font-bold">{totalOut.toFixed(3)} ر.ع</div></div>
          <div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">صافي الربح</div><div className="text-xl font-bold">{net.toFixed(3)} ر.ع</div></div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full rounded-2xl overflow-hidden border bg-white">
            <thead className="bg-slate-100"><tr>
              <th className="px-3 py-2 text-start text-sm">التاريخ</th>
              <th className="px-3 py-2 text-start text-sm">البيان</th>
              <th className="px-3 py-2 text-start text-sm">النوع</th>
              <th className="px-3 py-2 text-start text-sm">المبلغ</th>
            </tr></thead>
            <tbody>
              {ENTRIES.map(e => (
                <tr key={e.id} className="border-t">
                  <td className="px-3 py-2 text-sm">{e.date}</td>
                  <td className="px-3 py-2 text-sm">{e.label}</td>
                  <td className="px-3 py-2 text-sm">{e.type=="in"?"داخل":"خارج"}</td>
                  <td className="px-3 py-2 text-sm">{e.amount.toFixed(3)} ر.ع</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>الحسابات | Ain Oman</title></Head>
          <Header />
          <div className="flex-1">
            <Content />
          </div>
          <Footer />
        </main>
      );
    }