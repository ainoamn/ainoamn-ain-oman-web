// src/components/layout/SiteFooter.tsx
import React from "react";
import { useLayoutScope } from "@/contexts/LayoutScope";

type Props = { force?: boolean };

export default function SiteFooter({ force = false }: Props) {
  const scope = useLayoutScope();
  if (scope?.global && !force) return null;

  return (
    <footer className="mt-10 border-t" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600 flex flex-wrap items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} عين عُمان — جميع الحقوق محفوظة</div>
        <div className="flex items-center gap-4">
          <a className="hover:text-gray-900" href="/privacy">الخصوصية</a>
          <a className="hover:text-gray-900" href="/terms">الشروط</a>
        </div>
      </div>
    </footer>
  );
}
