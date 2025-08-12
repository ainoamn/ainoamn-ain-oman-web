import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

function npv(rate: number, cashflows: number[]) {
  return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0);
}

function irr(cashflows: number[], guess = 0.1, maxIter = 100): number | null {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    const f = cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
    const df = cashflows.reduce((acc, cf, t) => acc - (t * cf) / Math.pow(1 + rate, t + 1), 0);
    const next = rate - f / df;
    if (isNaN(next) || !isFinite(next)) return null;
    if (Math.abs(next - rate) < 1e-7) return next;
    rate = next;
  }
  return null;
}

export default function InvestCalculator() {
  const { t, dir } = useI18n();
  const [initial, setInitial] = useState(10000);
  const [cash, setCash] = useState([3000, 3000, 3000, 3000, 3000]); // 5 periods
  const rate = 0.1;

  const flows = [-initial, ...cash];
  const calcNPV = npv(rate, flows);
  const calcIRR = irr(flows);

  return (
    <Layout>
      <Head><title>{t("invest.calculator","محاكي العوائد")} | Ain Oman</title></Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">{t("invest.calculator","محاكي العوائد")}</h1>

          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
            <div>
              <label className="block text-sm mb-1">{t("invest.initial","الاستثمار الأولي")}</label>
              <input type="number" value={initial} onChange={e=>setInitial(parseFloat(e.target.value))} className="w-full rounded-xl border px-3 py-2"/>
            </div>
            <div>
              <label className="block text-sm mb-1">{t("invest.cashflows","التدفقات (بالأرقام مفصولة بفواصل)")}</label>
              <input
                value={cash.join(",")}
                onChange={e=>setCash(e.target.value.split(",").map(v=>parseFloat(v.trim())||0))}
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">{t("invest.npv_at","NPV عند 10%")}</div>
                <div className="text-2xl font-semibold">{calcNPV.toFixed(2)}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">{t("invest.irr","IRR")}</div>
                <div className="text-2xl font-semibold">{calcIRR !== null ? (calcIRR * 100).toFixed(2) + "%" : "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
