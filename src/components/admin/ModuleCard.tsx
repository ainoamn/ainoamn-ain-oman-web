// src/components/admin/ModuleCard.tsx
import Link from "next/link";
import { useMemo } from "react";
import { type AdminModule } from "@/lib/admin/registry";

type Props = {
  mod?: AdminModule;          // الاسم الصحيح
  module?: AdminModule;       // للسماح بالاستخدام القديم
  dir?: "rtl" | "ltr";
};

const CENTRAL = new Set<string>([
  "tasks","reservations","notifications","accounts","hoa",
  "properties","auctions","partners","reviews",
  "billing","invoices","subscriptions",
  "ads","coupons","ai-panel","valuation",
  "i18n","features","projects","impersonate",
]);
function ModuleCard(props: Props) {
  const m = props.mod ?? props.module;
  if (!m) return null;

  const title = useMemo(() => m.title || m.titleEn || m.id, [m]);
  const href = useMemo(
    () => m.href || (CENTRAL.has(m.id) ? `/admin/dashboard?section=${encodeURIComponent(m.id)}` : "#"),
    [m]
  );

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
      dir={props.dir}
    >
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {m.description ? (
        <div className="mt-1 text-sm text-slate-600">{m.description}</div>
      ) : null}
    </Link>
  );
}
