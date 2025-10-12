// src/components/admin/widgets/QuickActions.tsx
// Client widget: quick links to common admin actions.
import InstantLink from '@/components/InstantLink';
import { useTranslation } from "@/hooks/useTranslation";

export default function QuickActions() {
  const { t, dir } = useTranslation();
  const actions = [
    { label: t("admin.quick.createTask", "إنشاء مهمة"), href: "/admin/tasks" },
    { label: t("admin.quick.addProperty", "إضافة عقار"), href: "/properties/new" },
    { label: t("admin.quick.createAuction", "إنشاء مزاد"), href: "/auctions/sell" },
    { label: t("admin.quick.sendNotice", "إرسال إشعار"), href: "/notifications" },
  ];

  return (
    <section dir={dir} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{t("admin.quick.title", "إجراءات سريعة")}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((a) => (
          <InstantLink key={a.href} href={a.href} className="rounded-xl border border-slate-300 px-3 py-2 text-center hover:bg-slate-50">
            {a.label}
          </InstantLink>
        ))}
      </div>
    </section>
  );
}
