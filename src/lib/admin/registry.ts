// =============================================
// src/lib/admin/registry.ts
// =============================================

export type AdminModule = {
  id: string;
  title: string; // ar default
  titleEn?: string;
  href: string;
  icon?: string; // maps to your <Icon name="..." /> if available
  group:
    | "operations"
    | "content"
    | "finance"
    | "marketing"
    | "ai"
    | "settings"
    | "dev";
  description?: string;
  featureFlag?: string; // if present, will be checked against feature flags
};

/**
 * قائمة الوحدات المبنية على هيكل المشروع الحالي.
 * عدّل أو أضف عناصر جديدة حسب الحاجة.
 */
export const ADMIN_MODULES: AdminModule[] = [
  // العمليات
  { id: "tasks", title: "المهام", titleEn: "Tasks", href: "/admin/tasks", icon: "list-checks", group: "operations" },
  { id: "reservations", title: "الحجوزات", titleEn: "Reservations", href: "/reservations", icon: "calendar-days", group: "operations" },
  { id: "notifications", title: "الإشعارات", titleEn: "Notifications", href: "/notifications", icon: "bell", group: "operations" },
  { id: "accounts", title: "الحسابات", titleEn: "Accounts", href: "/accounts", icon: "users", group: "operations" },
  { id: "hoa", title: "جمعية الملاك", titleEn: "Owners Association", href: "/hoa", icon: "building-2", group: "operations" },

  // المحتوى
  { id: "properties", title: "العقارات", titleEn: "Properties", href: "/properties", icon: "home", group: "content" },
  { id: "auctions", title: "المزادات", titleEn: "Auctions", href: "/auctions", icon: "gavel", group: "content" },
  { id: "partners", title: "شركاؤنا", titleEn: "Partners", href: "/partners", icon: "handshake", group: "content" },
  { id: "reviews", title: "التقييمات", titleEn: "Reviews", href: "/reviews", icon: "star", group: "content" },

  // المالية
  { id: "billing", title: "الفوترة", titleEn: "Billing", href: "/billing/invoices", icon: "receipt", group: "finance" },
  { id: "invoices", title: "الفواتير", titleEn: "Invoices", href: "/invoices", icon: "file-text", group: "finance" },
  { id: "subscriptions", title: "الاشتراكات", titleEn: "Subscriptions", href: "/subscriptions", icon: "badge-dollar-sign", group: "finance" },

  // التسويق
  { id: "ads", title: "الإعلانات", titleEn: "Ads", href: "/ads", icon: "megaphone", group: "marketing" },
  { id: "coupons", title: "القسائم", titleEn: "Coupons", href: "/coupons", icon: "tickets", group: "marketing" },

  // الذكاء الاصطناعي
  { id: "ai-panel", title: "لوحة الذكاء", titleEn: "AI Panel", href: "/ai", icon: "bot", group: "ai", featureFlag: "ai" },
  { id: "valuation", title: "التقييم الذكي", titleEn: "Valuation", href: "/invest/portfolio", icon: "chart-line", group: "ai", featureFlag: "aiValuation" },

  // الإعدادات
  { id: "i18n", title: "الترجمات", titleEn: "Translations", href: "/i18n", icon: "languages", group: "settings" },
  { id: "features", title: "الخصائص", titleEn: "Features", href: "/admin/settings", icon: "settings", group: "settings" },

  // التطوير
  { id: "projects", title: "مشاريع التطوير", titleEn: "Dev Projects", href: "/development/projects", icon: "code", group: "dev" },
  { id: "impersonate", title: "انتحال مستخدم للتجربة", titleEn: "Impersonate", href: "/dev/roles", icon: "user-cog", group: "dev" },
];

export type FeatureFlags = Record<string, boolean>;

export function filterModulesByFlags(mods: AdminModule[], flags: FeatureFlags): AdminModule[] {
  return mods.filter((m) => (m.featureFlag ? !!flags?.[m.featureFlag] : true));
}

export const GROUP_LABELS: Record<AdminModule["group"], { ar: string; en: string }> = {
  operations: { ar: "العمليات", en: "Operations" },
  content: { ar: "المحتوى", en: "Content" },
  finance: { ar: "المالية", en: "Finance" },
  marketing: { ar: "التسويق", en: "Marketing" },
  ai: { ar: "الذكاء الاصطناعي", en: "AI" },
  settings: { ar: "الإعدادات", en: "Settings" },
  dev: { ar: "التطوير", en: "Dev" },
};
