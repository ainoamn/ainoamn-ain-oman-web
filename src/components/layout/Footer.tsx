// src/components/layout/Footer.tsx
import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* عن المنصة */}
          <div>
            <div className="font-semibold text-lg">عين عُمان</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-6">
              منصّة عقارية لإدارة العقارات، المزادات، مشاريع التطوير، ولوحات المهام—بهويّة موحّدة
              كما هو معتمد في المستندات.
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <div className="font-semibold">روابط</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/properties" className="hover:underline">العقارات</Link></li>
              <li><Link href="/auctions" className="hover:underline">المزادات</Link></li>
              <li><Link href="/development" className="hover:underline">التطوير العقاري</Link></li>
              <li><Link href="/admin/tasks" className="hover:underline">لوحة المهام</Link></li>
              <li><Link href="/pricing" className="hover:underline">الباقات</Link></li>
            </ul>
          </div>

          {/* تواصل */}
          <div>
            <div className="font-semibold">تواصل</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>البريد: <a href="mailto:info@example.com" className="hover:underline">info@example.com</a></li>
              <li>الهاتف: <a href="tel:+96800000000" className="hover:underline">+968 00 000 000</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} عين عُمان — جميع الحقوق محفوظة.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">الشروط</Link>
            <Link href="/privacy" className="hover:underline">الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/*
ملاحظات تشغيل سريعة (تم وضعها كتعليق كي لا تكسر البناء):
- تأكد أن next.config.js مضبوط على i18n و RTL حسب المستند 1-11.
- أي نصوص توثيقية يجب أن تُحفظ في ملفات MD/README أو داخل تعليقات، لا بعد إغلاق المكوّن.
*/
