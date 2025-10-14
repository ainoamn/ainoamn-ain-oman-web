import Head from "next/head";

import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { InvestmentOpportunity } from "@/types/invest";

export default function OpportunityDetails() {
  const { t, dir } = useI18n();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [op, setOp] = useState<InvestmentOpportunity | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invest/${id}`).then(r=>r.json()).then(setOp);
  }, [id]);

  async function subscribe() {
    alert(t("invest.kyc_required","يتطلب إكمال الهوية (KYC) وخطة اشتراك مناسبة."));
  }

  return (
    <>
      <Head><title>{op?.title || t("invest.loading","جاري التحميل...")} | Ain Oman</title></Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">{op?.title || "..."}</h1>
          <div className="text-slate-600 mb-4">{op?.type} • {op?.city}</div>

          <div className="rounded-2xl bg-white p-4 shadow-sm mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-xs text-slate-500">{t("invest.target_irr","العائد المستهدف")}</div><div className="text-lg font-semibold">{op?.targetIRR}%</div></div>
              <div><div className="text-xs text-slate-500">{t("invest.min_ticket","الحد الأدنى")}</div><div className="text-lg font-semibold">{op?.minTicket?.toLocaleString()}</div></div>
              <div><div className="text-xs text-slate-500">{t("invest.duration","المدة")}</div><div className="text-lg font-semibold">{op?.durationMonths} {t("invest.months","شهر")}</div></div>
              <div><div className="text-xs text-slate-500">{t("invest.risk","المخاطر")}</div><div className="text-lg font-semibold">{op?.riskBand}</div></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm mb-4">
            <h2 className="text-xl font-semibold mb-2">{t("invest.summary","الملخص")}</h2>
            <p className="text-slate-700">{op?.shortSummary || t("invest.no_summary","لا يوجد ملخص متاح حالياً.")}</p>
          </div>

          <div className="flex gap-3">
            <a href="/invest/calculator" className="rounded-xl border px-4 py-2 hover:bg-slate-50">{t("invest.run_calculator","حساب العوائد")}</a>
            <button onClick={subscribe} className="rounded-xl bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">{t("invest.subscribe","اشتراك/حجز")}</button>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            {t("invest.disclaimer","تنويه: هذا المحتوى ليس نصيحة استثمارية وقد يتطلب موافقات تنظيمية.")}
          </p>
        </div>
      </main>
    </>
  );
}
