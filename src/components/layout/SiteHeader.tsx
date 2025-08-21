import React from "react";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="font-black text-xl">عين عُمان</a>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <a className="hover:text-gray-900" href="/">الرئيسية</a>
            <a className="hover:text-gray-900" href="/admin/tasks/TEST123">المهام</a>
          </nav>
        </div>
        <div className="text-sm text-gray-600">لوحة الإدارة</div>
      </div>
    </header>
  );
}
