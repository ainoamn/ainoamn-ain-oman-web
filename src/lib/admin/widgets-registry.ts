// src/lib/admin/widgets-registry.ts
// Registry maps widget keys to components for DynamicWidgets.

import dynamic from "next/dynamic";

export const widgetRegistry: Record<string, any> = {
  "stats-overview": dynamic(() => import("@/components/admin/widgets/StatsOverview"), { ssr: false }),
  "recent-activity": dynamic(() => import("@/components/admin/widgets/RecentActivity"), { ssr: false }),
  "notifications": dynamic(() => import("@/components/admin/widgets/Notifications"), { ssr: false }),
  "quick-actions": dynamic(() => import("@/components/admin/widgets/QuickActions"), { ssr: false }),
  "system-health": dynamic(() => import("@/components/admin/widgets/SystemHealth"), { ssr: false }),
  "alerts-banner": dynamic(() => import("@/components/admin/widgets/AlertsBanner"), { ssr: false }),
};

export type DashboardSection = {
  title?: string;
  widgets: string[]; // keys from registry
};

export type DashboardLayout = {
  left: DashboardSection[];
  right: DashboardSection[];
};

export const defaultDashboard: DashboardLayout = {
  left: [
    { title: undefined, widgets: ["alerts-banner"] },
    { title: undefined, widgets: ["stats-overview", "recent-activity"] },
  ],
  right: [
    { title: undefined, widgets: ["notifications", "quick-actions", "system-health"] },
  ],
};
