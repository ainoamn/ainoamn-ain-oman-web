// src/pages/dashboard/developer.tsx
import React from "react";
import InstantLink from '@/components/InstantLink';

export default function Page() {
  const features = ["إدارة المشاريع والوحدات", "الخطط الزمنية والمستهدفات", "مزادات على وحدات مختارة", "تقارير مبيعات"] as string[];
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">مطور عقاري</h1>
        <InstantLink href="/dashboard" className="text-teal-700 hover:underline">رجوع</InstantLink>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="font-semibold">المهام وأتمتة الإجراءات</div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">تتبع الأعمال اليومية والتذكيرات والتقويم.</p>
          <div className="mt-3 text-sm">
            <InstantLink href="/admin/tasks" className="px-3 py-2 rounded-xl border inline-block">فتح لوحة المهام</InstantLink>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="font-semibold">خصائص اللوحة</div>
          <ul className="mt-2 text-sm space-y-2">
            {features.map((s, i) => (<li key={i} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-teal-600 inline-block"/><span>{s}</span></li>))}
          </ul>
        </div>
      </div>
    </div>
  );
}
