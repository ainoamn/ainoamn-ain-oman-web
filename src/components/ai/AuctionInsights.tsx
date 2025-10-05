// src/components/ai/AuctionInsights.tsx
import React, { useMemo, useState } from "react";

export default function AuctionInsights({ startingPrice, currentBid, area, bedrooms, bathrooms }: {
  startingPrice: number;
  currentBid: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
}) {
  // Simple heuristic-based insights (placeholder for real AI service)
  const [risk, setRisk] = useState<"LOW"|"MEDIUM"|"HIGH">("LOW");

  const fair = useMemo(() => {
    const base = startingPrice * 1.03;
    const areaAdj = (area ? area / 400 : 1) * 0.05;
    const roomAdj = ((bedrooms || 0) + (bathrooms || 0) * 0.5) * 0.01;
    const v = base * (1 + areaAdj + roomAdj);
    const premium = (currentBid - v) / v;
    setRisk(premium > 0.15 ? "HIGH" : premium > 0.07 ? "MEDIUM" : "LOW");
    return Math.round(v);
  }, [startingPrice, currentBid, area, bedrooms, bathrooms]);

  const nextStep = useMemo(() => {
    const gap = Math.max(100, Math.round(currentBid * 0.005));
    return currentBid + gap;
  }, [currentBid]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-3">تحليلات ذكية</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">القيمة العادلة التقديرية</div>
          <div className="text-lg font-semibold">{fair.toLocaleString()} ر.ع</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">مخاطر المزايدة</div>
          <div className={`text-sm font-semibold ${risk === "HIGH" ? "text-rose-600" : risk === "MEDIUM" ? "text-amber-600" : "text-emerald-600"}`}>
            {risk === "HIGH" ? "عالية" : risk === "MEDIUM" ? "متوسطة" : "منخفضة"}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">الخطوة المقترحة التالية</div>
          <div className="text-lg font-semibold">{nextStep.toLocaleString()} ر.ع</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">* تم الحساب بخوارزمية مبدئية — يمكن لاحقًا ربط خدمة تقييم عقاري بالذكاء الاصطناعي وبيانات سوق فعلية.</p>
    </div>
  );
}
