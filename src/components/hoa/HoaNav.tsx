"use client";

import InstantLink from '@/components/InstantLink';
import { useTSafe } from "@/lib/i18n-safe";
import type { ComponentType, SVGProps } from "react";
import {
  FiHome,
  FiBell,
  FiAlertTriangle,
  FiFileText,
  FiUsers,
  FiSettings,
  FiList,
  FiMapPin,
} from "react-icons/fi";

// نوع أيقونة اختياري
type IconT = ComponentType<SVGProps<SVGSVGElement>> | undefined;

// بديل آمن إذا كانت الأيقونة غير متاحة
function FallbackIcon() {
  return <span aria-hidden>•</span>;
}

const items: Array<{
  href: string;
  icon: IconT;
  key: string;
  label: string;
}> = [
  { href: "/owners-association/home", icon: FiHome, key: "hoa.nav.home", label: "الرئيسية" },
  { href: "/owners-association/requests", icon: FiList, key: "hoa.requests.title", label: "الطلبات" },
  { href: "/owners-association/tracking", icon: FiMapPin, key: "hoa.tracking.title", label: "المتابعة" },
  { href: "/owners-association/notifications", icon: FiBell, key: "hoa.notifications.title", label: "الإشعارات" },
  { href: "/owners-association/alerts", icon: FiAlertTriangle, key: "hoa.alerts.title", label: "التنبيهات" },
  { href: "/owners-association/documents", icon: FiFileText, key: "hoa.docs.title", label: "المستندات" },
  { href: "/owners-association/investors", icon: FiUsers, key: "hoa.investors.title", label: "المستثمرون" },
  { href: "/owners-association/management", icon: FiSettings, key: "hoa.mgmt.title", label: "الإدارة" },
];

export default function HoaNav() {
  const { t, dir } = useTSafe();

  // يعمل مع Pages Router وApp Router بدون هوكات الراوتر
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <nav dir={dir} className="mb-4">
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          const Icon = it.icon || FallbackIcon; // حارس
          return (
            <li key={it.href}>
              <InstantLink 
                href={it.href}
                className={
                  "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border " +
                  (active
                    ? "bg-[var(--brand-700,#0f766e)] text-white border-[var(--brand-700,#0f766e)]"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800")
                }
              >
                <Icon />
                <span>{t(it.key, it.label)}</span>
              </InstantLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
