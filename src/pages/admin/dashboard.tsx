// src/pages/admin/dashboard.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  Cog6ToothIcon, HomeIcon, LinkIcon,
  UsersIcon, CurrencyDollarIcon, BuildingOfficeIcon, BanknotesIcon,
  BellAlertIcon, ClipboardDocumentListIcon, InboxIcon,
  ShieldCheckIcon, ServerStackIcon, ArrowPathIcon, PresentationChartLineIcon, DocumentTextIcon,
} from "@heroicons/react/24/outline";

/* ===== أدوات تخزين آمنة ===== */
function loadJSON<T>(key: string, fallback: T, validate?: (v:any)=>boolean): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    if (validate && !validate(v)) throw new Error("invalid shape");
    return v as T;
  } catch {
    try { localStorage.removeItem(key); } catch (_e) {}
    return fallback;
  }
}

/* ===== روابط إدارية مخصصة (تظهر في السايدبار) ===== */
type AdminLink = { id: string; label: string; href: string; iconKey: string; enabled?: boolean };
const LS_ADMIN_LINKS = "ain.dashboard.admin.links";

/* === مفاتيح الربط مع صفحة widgets.tsx (تشغيل/إخفاء وإعادة تسمية) === */
const LS_ADMIN = "ain.dashboard.admin";
const LS_WIDGET_OVERRIDES = "ain.dashboard.widget.overrides";
type WidgetKey =
  | "stats" | "subscriptions" | "auctions" | "createAuction" | "tasks" | "messages"
  | "invoices" | "favorites" | "properties" | "calendar" | "users" | "earnings"
  | "performance" | "inbox" | "security" | "documents";
type AdminToggles = Record<WidgetKey, boolean>;
type WidgetOverride = { label?: string; iconKey?: string; hidden?: boolean };
type WidgetOverrides = Record<WidgetKey, WidgetOverride>;

/* أيقونات الروابط */
const ICONS_REGISTRY: Record<string, any> = {
  chart: PresentationChartLineIcon,
  users: UsersIcon,
  cash: CurrencyDollarIcon,
  building: BuildingOfficeIcon,
  money: BanknotesIcon,
  bell: BellAlertIcon,
  tasks: ClipboardDocumentListIcon,
  inbox: InboxIcon,
  shield: ShieldCheckIcon,
  server: ServerStackIcon,
  refresh: ArrowPathIcon,
  doc: DocumentTextIcon,
  home: HomeIcon,
  link: LinkIcon,

  // خرائط افتراضية لبعض الودجتس
  star: PresentationChartLineIcon,
  mail: InboxIcon,
  heart: DocumentTextIcon,
  calendar: ServerStackIcon,
  dollar: CurrencyDollarIcon,
  perf: PresentationChartLineIcon,
};
function getIcon(key?: string) { return (key && ICONS_REGISTRY[key]) || LinkIcon; }

/* ===== قائمة شاملة لصفحات الإدارة من هيكل المشروع ===== */
const ADMIN_PAGES = [
  { id:"admin-home", label:"مركز الإدارة", href:"/admin", iconKey:"home" },
  { id:"admin-dashboard", label:"لوحة الأدمن", href:"/admin/dashboard", iconKey:"chart" },
  { id:"admin-widgets", label:"عناصر لوحة المستخدم", href:"/admin/dashboard/widgets", iconKey:"chart" },
  { id:"admin-i18n", label:"إدارة الترجمة", href:"/admin/i18n", iconKey:"doc" },
  { id:"admin-features", label:"ميزات النظام", href:"/admin/features", iconKey:"server" },
  { id:"admin-header-footer", label:"الهيدر والفوتر", href:"/admin/header-footer", iconKey:"server" },
  { id:"admin-settings", label:"إعدادات الإدارة", href:"/admin/settings", iconKey:"shield" },
  { id:"admin-ads", label:"الإعلانات", href:"/admin/ads", iconKey:"bell" },
  { id:"admin-coupons", label:"الكوبونات", href:"/admin/coupons", iconKey:"money" },
  { id:"admin-invoices", label:"فواتير الإدارة", href:"/admin/invoices", iconKey:"cash" },
  { id:"admin-billing-invoices", label:"فواتير الفوترة", href:"/admin/billing/invoices", iconKey:"cash" },
  { id:"admin-reservations", label:"الحجوزات", href:"/admin/reservations", iconKey:"inbox" },
  { id:"admin-subscriptions", label:"الاشتراكات", href:"/admin/subscriptions", iconKey:"chart" },
  { id:"admin-tasks", label:"إدارة المهام", href:"/admin/tasks", iconKey:"tasks" },
  { id:"admin-auctions", label:"إدارة المزادات", href:"/admin/auctions", iconKey:"bell" },
  { id:"admin-projects", label:"مشاريع التطوير", href:"/admin/development/projects", iconKey:"building" },
  { id:"admin-projects-new", label:"مشروع جديد", href:"/admin/development/projects/new", iconKey:"refresh" },
  { id:"admin-notifications", label:"الإشعارات", href:"/admin/notifications", iconKey:"bell" },
  { id:"admin-ai", label:"لوحة الذكاء الاصطناعي", href:"/admin/ai-panel", iconKey:"server" },
  { id:"admin-users", label:"المستخدمون", href:"/admin/users", iconKey:"users" },
  { id:"admin-impersonate", label:"انتحال المستخدم", href:"/admin/impersonate", iconKey:"users" },
  { id:"admin-sequencing", label:"التسلسل", href:"/admin/sequencing", iconKey:"refresh" },
  { id:"admin-seq-test", label:"اختبار التسلسل", href:"/admin/seq-test", iconKey:"refresh" },
  { id:"admin-studio", label:"الاستوديو", href:"/admin/studio", iconKey:"doc" },
  { id:"admin-accounts", label:"الحسابات", href:"/admin/accounts", iconKey:"cash" },
];

/* ===== عناصر واجهة ===== */
function SidebarLink({ href, icon: Icon, text }:{ href:string; icon:any; text:string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800">
      <Icon className="w-4 h-4 text-[var(--brand-700)]" /><span className="text-sm">{text}</span>
    </Link>
  );
}
function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i/(data.length-1))*100},${24 - (v/max)*24}`).join(" ");
  return <svg viewBox="0 0 100 24" className="w-full h-6"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}
function KPI({ title, value, sub, icon:Icon, series }:{
  title:string; value:string|number; sub?:string; icon:any; series?:number[];
}) {
  return (
    <div className="border bg-white dark:bg-gray-900 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
        <Icon className="w-5 h-5 text-[var(--brand-700)]" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {series && <div className="mt-2 text-[var(--brand-700)]"><Spark data={series} /></div>}
    </div>
  );
}
function SectionCard({ title, icon:Icon, action, children }:{
  title:string; icon:any; action?:React.ReactNode; children:React.ReactNode;
}) {
  return (
    <div className="border bg-white dark:bg-gray-900 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Icon className="w-5 h-5 text-[var(--brand-700)]" /><h3 className="text-base font-semibold">{title}</h3></div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ===== الصفحة ===== */
function AdminDashboardPage() {
  const [adm, setAdm] = useState<AdminToggles>({} as AdminToggles);
  const [overrides, setOverrides] = useState<WidgetOverrides>({});
  const [links, setLinks] = useState<AdminLink[]>([]);

  useEffect(() => {
    const loadAll = () => {
      setAdm(loadJSON<AdminToggles>(LS_ADMIN, {} as AdminToggles, (x)=>typeof x==="object" && x));
      setOverrides(loadJSON<WidgetOverrides>(LS_WIDGET_OVERRIDES, {}, (x)=>typeof x==="object" && x));
      setLinks(loadJSON<AdminLink[]>(LS_ADMIN_LINKS, [], Array.isArray));
    };
    loadAll();

    const onAdm = () => loadAll();
    const onOv  = () => loadAll();
    const onLinks = () => setLinks(loadJSON<AdminLink[]>(LS_ADMIN_LINKS, [], Array.isArray));

    window.addEventListener("ain:adminDefaults:change", onAdm);
    window.addEventListener("ain:widgetOverrides:change", onOv);
    window.addEventListener("ain:adminLinks:change", onLinks);

    return () => {
      window.removeEventListener("ain:adminDefaults:change", onAdm);
      window.removeEventListener("ain:widgetOverrides:change", onOv);
      window.removeEventListener("ain:adminLinks:change", onLinks);
    };
  }, []);

  const isOn = (key: WidgetKey, defaultOn = true) =>
    (adm?.[key] ?? defaultOn) && !(overrides?.[key]?.hidden);

  const labelOf = (key: WidgetKey, fallback: string) =>
    overrides?.[key]?.label?.trim() || fallback;

  const IconOf = (key: WidgetKey, fallbackIconKey: string) =>
    getIcon(overrides?.[key]?.iconKey || fallbackIconKey);

  /* روابط إدارية مفعّلة فقط */
  const enabledLinks = useMemo(
    () => links.filter(l => l && l.enabled !== false),
    [links]
  );

  /* بيانات تجريبية */
  const kpis = useMemo(()=>[
    { k:"stat_users", title:"المستخدمون النشطون", value:"1,243", sub:"اليوم", icon:UsersIcon, series:[4,6,5,7,8,9,12,9,11,13,12,14] },
    { k:"stat_revenue", title:"إيرادات الشهر", value:"9,420 ر.ع", sub:"هذا الشهر", icon:CurrencyDollarIcon, series:[1,2,1,3,4,5,4,6,7,8,7,9] },
    { k:"stat_props", title:"عقارات مضافة", value:326, sub:"آخر 30 يوم", icon:BuildingOfficeIcon, series:[2,3,4,3,5,6,4,7,6,5,8,9] },
    { k:"stat_due", title:"فواتير متأخرة", value:18, sub:"بانتظار الدفع", icon:BanknotesIcon, series:[3,2,3,4,3,5,4,4,5,6,5,4] },
  ],[]);
  const alerts = useMemo(()=>[
    { id:1, text:"تذكير: تحديث سياسات الخصوصية قبل نهاية الأسبوع", level:"info" },
    { id:2, text:"تحذير: فواتير متأخرة لدى 4 عملاء", level:"warn" },
    { id:3, text:"معلومة: إطلاق إصدار الواجهات 1.3", level:"info" },
  ],[]);
  const tasks = useMemo(()=>[
    { id:"t1", title:"مراجعة طلبات المزاد الجديدة", status:"open" },
    { id:"t2", title:"تدقيق ترجمة الواجهة العربية", status:"inprogress" },
    { id:"t3", title:"إقفال فواتير أغسطس", status:"open" },
    { id:"t4", title:"تحديث صفحة الاشتراكات", status:"done" },
  ],[]);
  const invoices = useMemo(()=>[
    { id:"INV-3021", client:"شركة النور", amount:"320 ر.ع", due:"10/09/2025", state:"متأخرة" },
    { id:"INV-3022", client:"عقارات السهام", amount:"120 ر.ع", due:"15/09/2025", state:"بانتظار" },
    { id:"INV-3023", client:"مؤسسة الإتقان", amount:"870 ر.ع", due:"20/09/2025", state:"بانتظار" },
  ],[]);
  const messages = useMemo(()=>[
    { id:"m1", from:"support@ain-oman.com", subject:"طلب مساعدة", unread:true },
    { id:"m2", from:"billing@ain-oman.com", subject:"إشعار دفع", unread:false },
    { id:"m3", from:"no-reply@ain-oman.com", subject:"تقارير أسبوعية", unread:true },
  ],[]);
  const recent = useMemo(()=>[
    { id:"r1", what:"إضافة عقار جديد", who:"ahmad", when:"اليوم 10:21" },
    { id:"r2", what:"ترقية باقة عميل", who:"admin", when:"أمس 18:03" },
    { id:"r3", what:"إغلاق مزاد رقم #881", who:"fatma", when:"أمس 11:45" },
    { id:"r4", what:"حذف رسالة مزعجة", who:"moderator", when:"قبل 3 ساعات" },
  ],[]);

  const sidebar = (
    <>
      <div className="flex items-center gap-2">
        <Cog6ToothIcon className="w-5 h-5 text-[var(--brand-700)]" />
        <h3 className="font-semibold text-sm">خيارات الموقع</h3>
      </div>

      <nav className="space-y-1">
        <SidebarLink href="/admin/dashboard" icon={HomeIcon} text="لوحة الأدمن" />
        <SidebarLink href="/admin/dashboard/widgets" icon={PresentationChartLineIcon} text="عناصر لوحة المستخدم" />
        <SidebarLink href="/admin/tasks" icon={ClipboardDocumentListIcon} text="إدارة المهام" />
        <SidebarLink href="/admin/auctions" icon={BellAlertIcon} text="إدارة المزادات" />
        <SidebarLink href="/properties" icon={BuildingOfficeIcon} text="العقارات" />
        <SidebarLink href="/billing" icon={BanknotesIcon} text="الفوترة" />
        <SidebarLink href="/messages" icon={InboxIcon} text="صندوق الوارد" />
        <SidebarLink href="/subscriptions" icon={PresentationChartLineIcon} text="الباقات والاشتراكات" />
        <SidebarLink href="/settings" icon={Cog6ToothIcon} text="الإعدادات العامة" />
      </nav>

      {/* روابط مخصصة من widgets — مفعّلة فقط */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-[var(--brand-700)]" />
          <span className="text-xs font-semibold">روابط الإدارة</span>
        </div>
        <nav className="mt-2 space-y-1">
          {enabledLinks.length === 0 && <div className="text-xs text-gray-500">لا توجد روابط مضافة.</div>}
          {enabledLinks.map((l)=> {
            const Icon = getIcon(l.iconKey);
            return <SidebarLink key={l.id} href={l.href} icon={Icon} text={l.label} />;
          })}
        </nav>
      </div>

      {/* لوحات الإدارة الشاملة من الهيكل */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2">
          <PresentationChartLineIcon className="w-4 h-4 text-[var(--brand-700)]" />
          <span className="text-xs font-semibold">لوحات الإدارة</span>
        </div>
        <nav className="mt-2 space-y-1">
          {ADMIN_PAGES.map(p => {
            const Icon = getIcon(p.iconKey);
            return <SidebarLink key={p.id} href={p.href} icon={Icon} text={p.label} />;
          })}
        </nav>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950" dir="rtl">
      <Head><title>لوحة تحكم الأدمن | Ain Oman</title></Head>
      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[260px_1fr] gap-4">
        <aside className="hidden md:flex flex-col gap-4 border rounded-2xl p-4 bg-white dark:bg-gray-900 dark:border-gray-800 h-fit sticky top-4">
          {sidebar}
        </aside>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">لوحة تحكم الأدمن</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">اضغط «عناصر لوحة المستخدم» لفتح الإعداد.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings" className="btn btn-secondary">الإعدادات</Link>
              <Link href="/dashboard" className="btn btn-primary">معاينة لوحة المستخدم</Link>
            </div>
          </div>

          {/* KPIs */}
          {isOn("stats") && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpis.map((k, i) => (
                <KPI key={i} title={labelOf("performance", k.title)} value={k.value} sub={k.sub}
                  icon={PresentationChartLineIcon} series={k.series} />
              ))}
            </section>
          )}

          {/* تنبيهات + مهام + صحة النظام */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
            {isOn("documents") && (
              <SectionCard
                title={labelOf("documents","تنبيهات النظام")}
                icon={BellAlertIcon}
                action={<Link href="/admin/alerts" className="text-sm text-[var(--brand-700)] hover:underline">الكل</Link>}
              >
                <ul className="text-sm list-disc ms-4 text-gray-600 dark:text-gray-300">
                  {alerts.map((a)=>(
                    <li key={a.id}>
                      <span className={`me-2 inline-block w-2 h-2 rounded-full ${a.level==="warn"?"bg-amber-500":"bg-sky-500"}`} />
                      {a.text}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {isOn("tasks") && (
              <SectionCard
                title={labelOf("tasks","لوحة المهام")}
                icon={ClipboardDocumentListIcon}
                action={<Link href="/admin/tasks" className="text-sm text-[var(--brand-700)] hover:underline">فتح المهام</Link>}
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  {tasks.map((t)=>(
                    <div key={t.id} className="border rounded-xl p-3 flex items-center justify-between bg-white dark:bg-gray-900 dark:border-gray-800">
                      <div>
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="text-xs text-gray-500">
                          {t.status==="open"?"مفتوحة":t.status==="inprogress"?"قيد التنفيذ":"مكتملة"}
                        </div>
                      </div>
                      <PresentationChartLineIcon className="w-4 h-4 text-[var(--brand-700)]" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {isOn("security") && (
              <SectionCard
                title={labelOf("security","صحة النظام")}
                icon={ShieldCheckIcon}
                action={<Link href="/admin/monitoring" className="text-sm text-[var(--brand-700)] hover:underline">التفاصيل</Link>}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="border rounded-xl p-3"><div className="text-gray-500">وقت التشغيل</div><div className="font-semibold">99.98%</div></div>
                  <div className="border rounded-xl p-3"><div className="text-gray-500">طوابير المعالجة</div><div className="font-semibold">12 مهام</div></div>
                  <div className="border rounded-xl p-3"><div className="text-gray-500">وظائف نشطة</div><div className="font-semibold">241</div></div>
                  <div className="border rounded-xl p-3"><div className="text-gray-500">آخر نشر</div><div className="font-semibold">قبل 2 يوم</div></div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <ServerStackIcon className="w-4 h-4" /><span>الخوادم سليمة. لا توجد أخطاء حرجة.</span>
                </div>
              </SectionCard>
            )}
          </section>

          {/* الفواتير + الوارد */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {isOn("invoices") && (
              <SectionCard
                title={labelOf("invoices","الفواتير")}
                icon={BanknotesIcon}
                action={<Link href="/billing" className="text-sm text-[var(--brand-700)] hover:underline">إدارة الفواتير</Link>}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-start py-2">رقم</th><th className="text-start py-2">العميل</th><th className="text-start py-2">المبلغ</th><th className="text-start py-2">الاستحقاق</th><th className="text-start py-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((i)=>(
                        <tr key={i.id} className="border-t">
                          <td className="py-2">{i.id}</td><td className="py-2">{i.client}</td><td className="py-2">{i.amount}</td><td className="py-2">{i.due}</td>
                          <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${i.state==="متأخرة"?"bg-rose-100 text-rose-700":"bg-amber-100 text-amber-700"}`}>{i.state}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            {isOn("inbox") && (
              <SectionCard
                title={labelOf("inbox","صندوق الوارد")}
                icon={InboxIcon}
                action={<Link href="/messages" className="text-sm text-[var(--brand-700)] hover:underline">فتح البريد</Link>}
              >
                <ul className="divide-y dark:divide-gray-800">
                  {messages.map((m)=>(
                    <li key={m.id} className="py-2 flex items-center justify-between">
                      <div><div className="text-sm font-medium">{m.subject}</div><div className="text-xs text-gray-500">{m.from}</div></div>
                      {m.unread ? <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-700">غير مقروء</span> : <span className="text-xs text-gray-400">—</span>}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </section>

          {/* نظرة عامة وروابط إدارة سريعة */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {isOn("performance") && (
              <SectionCard
                title={labelOf("performance","نظرة عامة")}
                icon={PresentationChartLineIcon}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="border rounded-xl p-3"><div className="text-gray-500">قوائم مميزة</div><div className="font-semibold">72</div></div>
                  <div className="border rounded-xl p-3"><div className="text-gray-500">مزايدات نشطة</div><div className="font-semibold">5</div></div>
                  <div className="border rounded-xl p-3"><div className="text-gray-500">عملاء جدد</div><div className="font-semibold">28</div></div>
                  <div className="border rounded-xl p-3"><div className="text-gray-500">معدّل التحويل</div><div className="font-semibold">3.7%</div></div>
                </div>
              </SectionCard>
            )}

            {isOn("documents") && (
              <SectionCard
                title={labelOf("documents","إجراءات سريعة")}
                icon={DocumentTextIcon}
              >
                <div className="flex flex-wrap gap-2">
                  <Link href="/admin/users" className="btn btn-secondary text-sm">إدارة المستخدمين</Link>
                  <Link href="/properties/new" className="btn btn-secondary text-sm">إضافة عقار</Link>
                  <Link href="/admin/auctions" className="btn btn-secondary text-sm">إدارة المزادات</Link>
                  <Link href="/subscriptions" className="btn btn-secondary text-sm">إدارة الباقات</Link>
                  <Link href="/settings" className="btn btn-secondary text-sm">الإعدادات</Link>
                </div>
              </SectionCard>
            )}
          </section>

          {/* شبكة روابط شاملة للوحات الإدارة */}
          <section className="mt-6">
            <SectionCard title="لوحات الإدارة" icon={PresentationChartLineIcon}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ADMIN_PAGES.map(p => {
                  const Icon = getIcon(p.iconKey);
                  return (
                    <Link key={p.id} href={p.href}
                      className="border rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-800">
                      <div>
                        <div className="text-sm font-medium">{p.label}</div>
                        <div className="text-xs text-gray-500">{p.href}</div>
                      </div>
                      <Icon className="w-4 h-4 text-[var(--brand-700)]" />
                    </Link>
                  );
                })}
              </div>
            </SectionCard>
          </section>
        </section>
      </div>
    </main>
  );
}
