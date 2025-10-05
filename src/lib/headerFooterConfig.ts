// src/lib/headerFooterConfig.ts
export type MenuItem = { label: string; href: string; children?: MenuItem[]; show?: boolean };
export type Announcement = { id: string; text: string; visible: boolean; closable: boolean; level: "info"|"success"|"warning"|"danger"; };
export type HeaderFooterConfig = {
  brandName: string;
  primaryColor: string;           // يضخ في --brand-600 / --brand-700
  footerOpacity: number;          // 0..1, افتراضي 0.7
  showStatsMini: boolean;         // إحصائيات صغيرة في الهيدر/الفوتر
  phones: string[];
  emails: string[];
  socials: { label: string; href: string }[];
  payments: { label: string; logo: string; href?: string; show?: boolean }[];
  headerMenus: MenuItem[];
  footerColumns: { title: string; items: MenuItem[]; show?: boolean }[];
  announcements: Announcement[];
};

export const defaultConfig: HeaderFooterConfig = {
  brandName: "عين عُمان",
  primaryColor: "#0d9488",
  footerOpacity: 0.7,
  showStatsMini: true,
  phones: ["+96800000000"],
  emails: ["info@example.com"],
  socials: [],
  payments: [
    { label: "Visa", logo: "/images/payments/visa.svg", show: true },
    { label: "Mastercard", logo: "/images/payments/mastercard.svg", show: true },
    { label: "AMEX", logo: "/images/payments/amex.svg", show: false },
  ],
  headerMenus: [
    { label: "الرئيسية", href: "/" },
    { label: "العقارات", href: "/properties" },
    { label: "المزادات", href: "/auctions" },
    { label: "المطورون", href: "/development/projects" },
    { label: "المزيد", href: "#", children: [
      { label: "من نحن", href: "/about" },
      { label: "تواصل معنا", href: "/contact" },
      { label: "السياسات", href: "/policies" },
      { label: "التقييمات", href: "/reviews" },
    ]},
  ],
  footerColumns: [
    { title: "روابط", items: [
      { label: "العقارات", href: "/properties" },
      { label: "المزادات", href: "/auctions" },
      { label: "لوحة المهام", href: "/admin/tasks" },
      { label: "الباقات", href: "/subscriptions" },
    ]},
    { title: "الدعم", items: [
      { label: "الخصوصية", href: "/privacy" },
      { label: "الشروط", href: "/terms" },
      { label: "الأسئلة الشائعة", href: "/faq" },
    ]},
  ],
  announcements: [],
};

export const CONFIG_KEY = "hf.config.v1";

export function mergeConfig(a: HeaderFooterConfig, b: Partial<HeaderFooterConfig>): HeaderFooterConfig {
  return { ...a, ...b,
    headerMenus: b.headerMenus ?? a.headerMenus,
    footerColumns: b.footerColumns ?? a.footerColumns,
    payments: b.payments ?? a.payments,
    announcements: b.announcements ?? a.announcements,
  };
}
