import React from "react";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold">نظام المحاماة</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/legal">القضايا</Link>
            <Link href="/legal/new">قضية جديدة</Link>
            <Link href="/legal/directory">إدارة المحامين/العملاء</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">{children}</main>
      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs opacity-70">© {new Date().getFullYear()} نظام المحاماة</div>
      </footer>
    </div>
  );
}
