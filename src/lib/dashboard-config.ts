// مستويات الإعداد
export type WidgetKey =
  | "stats" | "subscriptions" | "auctions" | "createAuction"
  | "tasks" | "messages" | "invoices" | "favorites"
  | "properties" | "calendar";

export type AdminDefaults = Record<WidgetKey, boolean>;
export type UserOverrides = Partial<Record<WidgetKey, boolean>>;
export type PlanCaps     = Record<WidgetKey, boolean>;

export const WIDGETS: WidgetKey[] = [
  "stats","subscriptions","auctions","createAuction",
  "tasks","messages","invoices","favorites","properties","calendar",
];

const LS_ADMIN = "ain.dashboard.admin";
const LS_USER  = "ain.dashboard.user";      // لكل مستخدم (per-user) اختياري
const LS_LEGACY_USER = "userDashboardSettings"; // توافق خلفي

export const DEFAULT_ADMIN: AdminDefaults = {
  stats:true, subscriptions:true, auctions:true, createAuction:true,
  tasks:true, messages:true, invoices:true, favorites:true, properties:true, calendar:true,
};

export function loadAdminDefaults(): AdminDefaults {
  if (typeof window === "undefined") return DEFAULT_ADMIN;
  try {
    const raw = localStorage.getItem(LS_ADMIN);
    return raw ? { ...DEFAULT_ADMIN, ...JSON.parse(raw) } : DEFAULT_ADMIN;
  } catch { return DEFAULT_ADMIN; }
}
export function saveAdminDefaults(v: AdminDefaults) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ADMIN, JSON.stringify(v));
  window.dispatchEvent(new Event("ain:adminDefaults:change"));
}

export function loadUserOverrides(userId?: string): UserOverrides {
  if (typeof window === "undefined") return {};
  try {
    // توافق خلفي: نقل userDashboardSettings إلى المفاتيح الجديدة مرة واحدة
    const legacy = localStorage.getItem(LS_LEGACY_USER);
    if (legacy) {
      const j = JSON.parse(legacy);
      const migrated: UserOverrides = {
        stats: j.showStats !== false,
        subscriptions: j.showSubscriptions !== false,
        auctions: j.showAuctions !== false,
        createAuction: j.showCreateAuction !== false,
      };
      localStorage.removeItem(LS_LEGACY_USER);
      localStorage.setItem(LS_USER, JSON.stringify(migrated));
      return migrated;
    }
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
export function saveUserOverrides(v: UserOverrides) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USER, JSON.stringify(v));
  window.dispatchEvent(new Event("ain:userOverrides:change"));
}

export function computeEffectiveVisibility(
  widgets: WidgetKey[],
  adminDefaults: AdminDefaults,
  planCaps: PlanCaps,
  userOverrides: UserOverrides
): Record<WidgetKey, boolean> {
  const out: Record<WidgetKey, boolean> = {} as any;
  for (const w of widgets) {
    // منطق الدمج: افتراضي الأدمن ∧ قدرة الباقة ∧ تفضيل المستخدم
    const base = !!adminDefaults[w];
    const cap  = planCaps[w] !== false; // افتراضيًا مسموح إن لم يُذكر
    const user = userOverrides[w];
    out[w] = base && cap && (user !== false);
  }
  return out;
}
