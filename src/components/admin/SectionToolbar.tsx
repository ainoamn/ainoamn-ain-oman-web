// src/components/admin/SectionToolbar.tsx
import InstantLink from '@/components/InstantLink';
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

export default function SectionToolbar({ section }: { section: string }) {
  const { t, dir } = useTranslation();
  const { has } = useAuth();

  const actions: { id: string; label: string; href: string }[] = [];

  if (section === "tasks") {
    if (has(["task:create"])) actions.push({ id: "new-task", label: t("actions.newTask") || "مهمة جديدة", href: "/admin/tasks" });
  }
  if (section === "reservations") {
    if (has(["reservation:create"])) actions.push({ id: "new-res", label: t("actions.newReservation") || "حجز جديد", href: "/reservations/new" });
  }
  if (section === "notifications") {
    if (has(["notification:create"])) actions.push({ id: "new-notify", label: t("actions.newNotification") || "تنبيه جديد", href: "/notifications" });
  }
  if (section === "accounts") {
    if (has(["account:manage"])) actions.push({ id: "manage-accounts", label: t("actions.manageAccounts") || "إدارة الحسابات", href: "/accounts" });
  }
  if (section === "hoa") {
    if (has(["hoa:manage"])) actions.push({ id: "hoa-panel", label: t("actions.hoaPanel") || "لوحة جمعية الملاك", href: "/owners-association" });
  }
  if (section === "properties") {
    if (has(["property:create"])) actions.push({ id: "new-property", label: t("actions.newProperty") || "إضافة عقار", href: "/properties/new" });
  }
  if (section === "auctions") {
    if (has(["auction:create"])) actions.push({ id: "new-auction", label: t("actions.newAuction") || "إنشاء مزاد", href: "/auctions/sell" });
    if (has(["auction:approve"])) actions.push({ id: "approve-auction", label: t("actions.approveAuctions") || "مراجعة واعتماد المزادات", href: "/auctions" });
  }
  if (section === "partners") {
    if (has(["partner:manage"])) actions.push({ id: "partners", label: t("actions.managePartners") || "إدارة الشركاء", href: "/partners" });
  }
  if (section === "reviews") {
    if (has(["review:moderate"])) actions.push({ id: "moderate-reviews", label: t("actions.moderateReviews") || "مراجعة التقييمات", href: "/reviews" });
  }
  if (section === "billing") {
    if (has(["billing:manage"])) actions.push({ id: "billing", label: t("actions.billing") || "لوحة الفوترة", href: "/billing/invoices" });
  }
  if (section === "invoices") {
    if (has(["invoice:manage"])) actions.push({ id: "invoices", label: t("actions.invoices") || "إدارة الفواتير", href: "/invoices" });
  }
  if (section === "subscriptions") {
    if (has(["subscription:manage"])) actions.push({ id: "subscriptions", label: t("actions.subscriptions") || "إدارة الاشتراكات", href: "/subscriptions" });
  }
  if (section === "ads") {
    if (has(["ads:manage"])) actions.push({ id: "ads", label: t("actions.manageAds") || "إدارة الإعلانات", href: "/ads" });
  }
  if (section === "coupons") {
    if (has(["coupon:manage"])) actions.push({ id: "coupons", label: t("actions.manageCoupons") || "إدارة القسائم", href: "/coupons" });
  }
  if (section === "ai-panel") {
    if (has(["ai:use"])) actions.push({ id: "ai", label: t("actions.aiPanel") || "لوحة الذكاء", href: "/ai" });
  }
  if (section === "valuation") {
    if (has(["valuation:use"])) actions.push({ id: "valuation", label: t("actions.valuation") || "التقييم الذكي", href: "/invest/portfolio" });
  }
  if (section === "i18n") {
    if (has(["i18n:manage"])) actions.push({ id: "i18n", label: t("actions.translations") || "إدارة الترجمات", href: "/i18n" });
  }
  if (section === "features") {
    if (has(["feature:manage"])) actions.push({ id: "features", label: t("actions.features") || "خصائص المنصة", href: "/admin/settings" });
  }
  if (section === "projects") {
    if (has(["project:manage"])) actions.push({ id: "projects", label: t("actions.devProjects") || "مشاريع التطوير", href: "/development/projects" });
  }
  if (section === "impersonate") {
    if (has(["impersonate:use"])) actions.push({ id: "impersonate", label: t("actions.impersonate") || "انتحال مستخدم", href: "/dev/roles" });
  }

  if (!actions.length) return null;

  return (
    <div dir={dir} className="mb-4 flex flex-wrap items-center gap-2">
      {actions.map((a) => (
        <InstantLink key={a.id} href={a.href} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          {a.label}
        </InstantLink>
      ))}
    </div>
  );
}
