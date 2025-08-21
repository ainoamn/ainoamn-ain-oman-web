// src/pages/dashboard/index.tsx
import React from "react";
import Link from "next/link";

const roles = [
  { id: "tenant", name: "مستأجر فردي", desc: "إدارة عقودك ومدفوعاتك وطلبات الصيانة.", href: "/dashboard/tenant" },
  { id: "corporate-tenant", name: "مستأجر شركة", desc: "إدارة وحدات متعددة وتفويض الموظفين.", href: "/dashboard/corporate-tenant" },
  { id: "landlord", name: "مالك/مؤجر", desc: "إدارة العقارات والعقود والتحصيل.", href: "/dashboard/landlord" },
  { id: "agency", name: "وكالة/وسيط", desc: "إدارة القوائم والفرق والحملات.", href: "/dashboard/agency" },
  { id: "developer", name: "مطور عقاري", desc: "إدارة المشاريع، الجداول الزمنية، والوحدات.", href: "/dashboard/developer" },
  { id: "hoa", name: "جمعية ملاك (HOA)", desc: "إدارة المباني والرسوم والصيانة.", href: "/dashboard/hoa" },
  { id: "investor", name: "مستثمر/REIT/Fractional", desc: "استثمارات جزئية وصناديق وتوزيعات.", href: "/dashboard/investor" },
  { id: "admin", name: "مدير النظام", desc: "التحكم الكامل، الميزات، الترجمات، والتكاملات.", href: "/dashboard/admin" },
];

export default function DashboardIndex() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">لوحات التحكم</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        اختر نوع اللوحة المناسبة لدورك.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {roles.map((r) => (
          <Link key={r.id} href={r.href} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-sm transition block">
            <div className="font-semibold">{r.name}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{r.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
