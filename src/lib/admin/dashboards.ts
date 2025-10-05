// src/lib/admin/dashboards.ts
import dynamic from "next/dynamic";

export type WidgetKey =
  | "alerts-banner" | "stats-overview" | "recent-activity"
  | "notifications" | "quick-actions" | "system-health";

export const Widgets: Record<WidgetKey, any> = {
  "alerts-banner": dynamic(() => import("@/components/admin/widgets/AlertsBanner"), { ssr: false }),
  "stats-overview": dynamic(() => import("@/components/admin/widgets/StatsOverview"), { ssr: false }),
  "recent-activity": dynamic(() => import("@/components/admin/widgets/RecentActivity"), { ssr: false }),
  "notifications": dynamic(() => import("@/components/admin/widgets/Notifications"), { ssr: false }),
  "quick-actions": dynamic(() => import("@/components/admin/widgets/QuickActions"), { ssr: false }),
  "system-health": dynamic(() => import("@/components/admin/widgets/SystemHealth"), { ssr: false }),
};

export type SectionLayout = { left: WidgetKey[]; right: WidgetKey[] };
export type DashboardsConfig = Record<string, SectionLayout>;

export const DASHBOARDS: DashboardsConfig = {
  // العمليات
  tasks:         { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications","quick-actions","system-health"] },
  reservations:  { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications","quick-actions","system-health"] },
  notifications: { left: ["alerts-banner","notifications","recent-activity"],  right: ["stats-overview","quick-actions","system-health"] },
  accounts:      { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications","quick-actions","system-health"] },
  hoa:           { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications","system-health"] },

  // المحتوى
  properties:    { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications","quick-actions"] },
  auctions:      { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications","quick-actions"] },
  partners:      { left: ["alerts-banner","recent-activity"],                right: ["notifications","system-health"] },
  reviews:       { left: ["alerts-banner","recent-activity"],                right: ["notifications","system-health"] },

  // المالية
  billing:       { left: ["alerts-banner","stats-overview"],                 right: ["notifications","system-health"] },
  invoices:      { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications"] },
  subscriptions: { left: ["alerts-banner","stats-overview"],                 right: ["notifications","quick-actions"] },

  // التسويق
  ads:           { left: ["alerts-banner","stats-overview","recent-activity"], right: ["notifications"] },
  coupons:       { left: ["alerts-banner","recent-activity"],                right: ["notifications","quick-actions"] },

  // الذكاء الاصطناعي
  "ai-panel":    { left: ["alerts-banner","stats-overview"],                 right: ["system-health","notifications"] },
  valuation:     { left: ["alerts-banner","stats-overview"],                 right: ["notifications"] },

  // الإعدادات
  i18n:          { left: ["alerts-banner","recent-activity"],                right: ["system-health"] },
  features:      { left: ["alerts-banner","recent-activity"],                right: ["system-health"] },

  // التطوير
  projects:      { left: ["alerts-banner","recent-activity"],                right: ["system-health","notifications"] },
  impersonate:   { left: ["alerts-banner"],                                  right: ["system-health"] },
};
