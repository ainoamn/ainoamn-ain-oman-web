import type { PlanCaps, WidgetKey } from "./dashboard-config";

/** خريطة القدرات لكل باقة. أضف باقاتك الحقيقية هنا أو اجلبها من /api/plans */
const PLAN_TO_CAPS: Record<string, Partial<PlanCaps>> = {
  free:    { createAuction:false, invoices:false, favorites:true, stats:true, auctions:true, subscriptions:true, properties:true, calendar:true, tasks:true, messages:true },
  basic:   { createAuction:true,  invoices:true,  favorites:true },
  pro:     { createAuction:true,  invoices:true,  favorites:true, messages:true },
  elite:   { createAuction:true,  invoices:true,  favorites:true, messages:true, tasks:true },
};

export function capsForPlans(userPlans: string[]): PlanCaps {
  // ابدأ بكل شيء مسموح ثم قيّد حسب الباقات إن لزم
  const acc: Record<WidgetKey, boolean> = {
    stats:true, subscriptions:true, auctions:true, createAuction:true,
    tasks:true, messages:true, invoices:true, favorites:true, properties:true, calendar:true,
  };
  if (!userPlans || userPlans.length === 0) {
    // زائر أو بلا اشتراك: اعتبره free
    return { ...acc, ...PLAN_TO_CAPS.free } as PlanCaps;
  }
  for (const pid of userPlans) Object.assign(acc, PLAN_TO_CAPS[pid] || {});
  return acc as PlanCaps;
}
