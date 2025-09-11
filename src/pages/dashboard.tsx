// src/pages/dashboard.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  HomeIcon,
  HeartIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  InboxIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  PresentationChartLineIcon,
  TagIcon,
  UsersIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

/* نفس مفاتيح صفحة widgets */
const LS_ADMIN = "ain.dashboard.admin";
const LS_WIDGET_OVERRIDES = "ain.dashboard.widget.overrides";
const LS_ADMIN_LINKS = "ain.dashboard.admin.links";

/* أدوات تخزين آمنة */
function loadJSON<T>(key: string, fallback: T, validate?: (v: any) => boolean): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    if (validate && !validate(v)) throw new Error("invalid shape");
    return v as T;
  } catch {
    try { localStorage.removeItem(key); } catch {}
    return fallback;
  }
}

/* ربط لوحة المستخدم مع widgets */
type AdminToggles = Record<string, boolean>;
type WidgetOverride = { label?: string; iconKey?: string; hidden?: boolean };
type WidgetOverrides = Record<string, WidgetOverride>;
type AdminLink = { id?: string; label: string; href: string; iconKey?: string; enabled?: boolean };

function useWidgetsSync() {
  const [adm, setAdm] = useState<AdminToggles>({});
  const [ov, setOv] = useState<WidgetOverrides>({});
  const [links, setLinks] = useState<AdminLink[]>([]);

  useEffect(() => {
    const loadAll = () => {
      setAdm(loadJSON<AdminToggles>(LS_ADMIN, {}, (x) => typeof x === "object"));
      setOv(loadJSON<WidgetOverrides>(LS_WIDGET_OVERRIDES, {}, (x) => typeof x === "object"));
      setLinks(loadJSON<AdminLink[]>(LS_ADMIN_LINKS, [], Array.isArray));
    };
    loadAll();

    const onAdm = () => loadAll();
    const onOv = () => loadAll();
    const onLinks = () => loadAll();

    window.addEventListener("ain:adminDefaults:change", onAdm);
    window.addEventListener("ain:widgetOverrides:change", onOv);
    window.addEventListener("ain:adminLinks:change", onLinks);

    return () => {
      window.removeEventListener("ain:adminDefaults:change", onAdm);
      window.removeEventListener("ain:widgetOverrides:change", onOv);
      window.removeEventListener("ain:adminLinks:change", onLinks);
    };
  }, []);

  const isOn = (key: string, def = true) => (adm?.[key] ?? def) && !(ov?.[key]?.hidden);
  const labelOf = (key: string, fallback: string) => ov?.[key]?.label?.trim() || fallback;

  return { isOn, labelOf, links };
}

/* عناصر العرض */
function Card({ title, children, action, icon: Icon }: {
  title: string; children: React.ReactNode; action?: React.ReactNode; icon?: any;
}) {
  return (
    <section className="border bg-white dark:bg-gray-900 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="w-5 h-5 text-[var(--brand-700)]" /> : null}
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function KPI({ title, value, icon: Icon }: {
  title: string; value: string | number; icon: any;
}) {
  return (
    <div className="border bg-white dark:bg-gray-900 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <Icon className="w-5 h-5 text-[var(--brand-700)]" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

/* خريطة أيقونات للأزرار */
const BTN_ICON: Record<string, any> = {
  summary: PresentationChartLineIcon,
  myProperties: BuildingOfficeIcon,
  favorites: HeartIcon,
  auctions: TagIcon,
  tasks: ClipboardDocumentListIcon,
  inbox: InboxIcon,
  invoices: BanknotesIcon,
  calendar: CalendarIcon,
  subscriptions: UsersIcon,
};
function iconCompByKey(key?: string) {
  switch (key) {
    case "chart": return PresentationChartLineIcon;
    case "building": return BuildingOfficeIcon;
    case "heart": return HeartIcon;
    case "bell": return TagIcon;
    case "tasks": return ClipboardDocumentListIcon;
    case "inbox": return InboxIcon;
    case "money": return BanknotesIcon;
    case "calendar": return CalendarIcon;
    case "users": return UsersIcon;
    case "link": default: return LinkIcon;
  }
}

export default function UserDashboardPage() {
  const { isOn, labelOf, links } = useWidgetsSync();

  /* الأزرار العلوية — عناصر لوحة المستخدم */
  const topButtons = useMemo(() => ([
    { key: "summary", label: labelOf("summary", "الملخص"), href: "/dashboard", icon: BTN_ICON.summary },
    { key: "myProperties", label: labelOf("myProperties", "عقاراتي"), href: "/properties", icon: BTN_ICON.myProperties },
    { key: "favorites", label: labelOf("favorites", "المفضلة"), href: "/favorites", icon: BTN_ICON.favorites },
    { key: "auctions", label: labelOf("auctions", "المزادات"), href: "/auctions", icon: BTN_ICON.auctions },
    { key: "tasks", label: labelOf("tasks", "المهام"), href: "/admin/tasks", icon: BTN_ICON.tasks },
    { key: "inbox", label: labelOf("inbox", "الرسائل"), href: "/messages", icon: BTN_ICON.inbox },
    { key: "invoices", label: labelOf("invoices", "الفواتير"), href: "/billing", icon: BTN_ICON.invoices },
    { key: "calendar", label: labelOf("calendar", "التقويم"), href: "/calendar", icon: BTN_ICON.calendar },
    { key: "subscriptions", label: labelOf("subscriptions", "الباقات والاشتراكات"), href: "/subscriptions", icon: BTN_ICON.subscriptions },
  ]), [labelOf]);

  /* الروابط الإدارية الإضافية — يظهر فقط المفعّل enabled !== false */
  const adminLinkButtons = useMemo(() => {
    return links
      .filter(l => l && l.enabled !== false)
      .map((l) => ({
        key: `adminlink:${l.href}`,
        label: l.label,
        href: l.href,
        icon: iconCompByKey(l.iconKey),
      }));
  }, [links]);

  /* بيانات عرض تجريبية */
  const kpis = useMemo(() => ([
    { k: "k_users", title: "مستخدمون نشطون", value: "1,243", icon: UsersIcon },
    { k: "k_props", title: "عقاراتك", value: "18", icon: BuildingOfficeIcon },
    { k: "k_due",   title: "مستحقات عليك", value: "320 ر.ع", icon: BanknotesIcon },
    { k: "k_msgs",  title: "رسائل جديدة", value: "5", icon: InboxIcon },
  ]), []);
  const inbox = useMemo(() => ([
    { id: "m1", from: "support@ain-oman.com", subject: "مرحبًا بك" },
    { id: "m2", from: "billing@ain-oman.com", subject: "فاتورة سبتمبر" },
  ]), []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir="rtl">
      <Head><title>لوحة المستخدم | Ain Oman</title></Head>
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="text-sm text-slate-500 mb-6">
            <span className="text-slate-700">لوحة المستخدم</span>
          </nav>

          {/* شبكة الأزرار: عناصر لوحة المستخدم المفعّلة + الروابط الإدارية الإضافية المفعّلة */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
            {/* عناصر لوحة المستخدم بحسب مفاتيح widgets */}
            {topButtons
              .filter(b => isOn(b.key, true))
              .map((b) => {
                const Ico = b.icon || LinkIcon;
                return (
                  <Link
                    key={b.key}
                    href={b.href}
                    className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-800"
                  >
                    <Ico className="w-4 h-4 text-[var(--brand-700)]" />
                    <span className="text-sm">{b.label}</span>
                  </Link>
                );
              })}

            {/* الروابط الإدارية الإضافية — تعتمد على enabled فقط */}
            {adminLinkButtons.map((b) => {
              const Ico = b.icon || LinkIcon;
              return (
                <Link
                  key={b.key}
                  href={b.href}
                  className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-800"
                >
                  <Ico className="w-4 h-4 text-[var(--brand-700)]" />
                  <span className="text-sm">{b.label}</span>
                </Link>
              );
            })}
          </div>

          {/* مؤشرات عليا */}
          {isOn("stats") && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpis.map((k) => (
                <KPI key={k.k} title={labelOf(k.k, k.title)} value={k.value} icon={k.icon} />
              ))}
            </section>
          )}

          {/* مهام */}
          {isOn("tasks") && (
            <Card
              title={labelOf("tasks", "مهامي")}
              icon={ClipboardDocumentListIcon}
              action={<Link href="/admin/tasks" className="text-sm underline">فتح المهام</Link>}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">لا توجد مهام جديدة.</div>
            </Card>
          )}

          <div className="h-6" />

          {/* الفواتير */}
          {isOn("invoices") && (
            <Card
              title={labelOf("invoices", "فواتيري")}
              icon={BanknotesIcon}
              action={<Link href="/billing" className="text-sm underline">إدارة</Link>}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr><th className="text-start py-2">رقم</th><th className="text-start py-2">المبلغ</th><th className="text-start py-2">الحالة</th></tr></thead>
                  <tbody>
                    <tr className="border-t"><td className="py-2">INV-3022</td><td className="py-2">120 ر.ع</td><td className="py-2">بانتظار</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="h-6" />

          {/* البريد الوارد */}
          {isOn("inbox") && (
            <Card
              title={labelOf("inbox", "البريد الوارد")}
              icon={InboxIcon}
              action={<Link href="/messages" className="text-sm underline">فتح البريد</Link>}
            >
              <ul className="divide-y dark:divide-gray-800">
                {inbox.map((m) => (
                  <li key={m.id} className="py-2">
                    <div className="text-sm font-medium">{m.subject}</div>
                    <div className="text-xs text-gray-500">{m.from}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
