import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import type { InvestmentOpportunity } from "@/types/invest";

export default function InvestIndex() {
  const { t, dir } = useI18n();
  const [items, setItems] = useState<InvestmentOpportunity[]>([]);

  useEffect(() => {
    fetch("/api/invest/opportunities").then(r=>r.json()).then(setItems);
  }, []);

  return (
    <Layout>
      <Head><title>{t("invest.title","الاستثمار")} | Ain Oman</title></Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("invest.title","الاستثمار")}</h1>
            <Link href="/invest/calculator" className="rounded-xl border px-4 py-2 hover:bg-slate-50">{t("invest.calculator","محاكي العوائد")}</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(op => (
              <Link key={op.id} href={`/invest/${op.id}`} className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
                <div className="aspect-video w-full rounded-xl bg-slate-100 mb-3"></div>
                <div className="text-lg font-semibold">{op.title}</div>
                <div className="text-sm text-slate-600">{op.type} • {op.city || ""}</div>
                <div className="mt-2 text-sm">{t("invest.target_irr","العائد المستهدف")}: <span className="font-semibold">{op.targetIRR}%</span></div>
                <div className="text-sm">{t("invest.min_ticket","الحد الأدنى للتذكرة")}: <span className="font-semibold">{op.minTicket.toLocaleString()}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
