// src/pages/dashboard/widgets.tsx
import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import React, { useEffect, useState } from "react";
import {
  Cog6ToothIcon, HomeIcon, BuildingOfficeIcon, HeartIcon, BellAlertIcon,
  ClipboardDocumentListIcon, EnvelopeOpenIcon, BanknotesIcon, CalendarDaysIcon, StarIcon,
} from "@heroicons/react/24/outline";

/** مفاتيح الودجات */
type WidgetKey =
  | "stats" | "subscriptions" | "auctions" | "createAuction"
  | "tasks" | "messages" | "invoices" | "favorites" | "properties" | "calendar";

const WIDGETS: WidgetKey[] = [
  "stats","subscriptions","auctions","createAuction","tasks","messages","invoices","favorites","properties","calendar",
];

type AdminDefaults = Record<WidgetKey, boolean>;
type UserOverrides = Partial<Record<WidgetKey, boolean>>;
type PlanCaps = Record<WidgetKey, boolean>;

const LS_ADMIN = "ain.dashboard.admin";
const LS_USER_OVR = "ain.dashboard.user";

const DEFAULT_ADMIN: AdminDefaults = {
  stats:true, subscriptions:true, auctions:true, createAuction:true,
  tasks:true, messages:true, invoices:true, favorites:true, properties:true, calendar:true,
};

function loadAdminDefaults(): AdminDefaults {
  if (typeof window === "undefined") return DEFAULT_ADMIN;
  try { const raw = localStorage.getItem(LS_ADMIN); return raw ? { ...DEFAULT_ADMIN, ...JSON.parse(raw) } : DEFAULT_ADMIN; }
  catch { return DEFAULT_ADMIN; }
}
function loadUserOverrides(): UserOverrides {
  if (typeof window === "undefined") return {};
  try { const raw = localStorage.getItem(LS_USER_OVR); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
function saveUserOverrides(v: UserOverrides) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USER_OVR, JSON.stringify(v));
  window.dispatchEvent(new Event("ain:userOverrides:change"));
}
function readUserPlans(): string[] {
  if (typeof window === "undefined") return ["free"];
  try {
    const uRaw = localStorage.getItem("ain_auth"); const u = uRaw ? JSON.parse(uRaw) : null;
    if (u?.subscriptions?.length) return u.subscriptions.map((s:any)=> s.planId || s.id || s);
    const ls = localStorage.getItem("user_plans"); return ls ? JSON.parse(ls) : ["free"];
  } catch { return ["free"]; }
}
function capsForPlans(userPlans: string[]): PlanCaps {
  const caps: PlanCaps = { stats:true, subscriptions:true, auctions:true, createAuction:true, tasks:true, messages:true, invoices:true, favorites:true, properties:true, calendar:true };
  const PLAN_TO_CAPS: Record<string, Partial<PlanCaps>> = {
    free: { createAuction:false, invoices:false },
    basic:{ createAuction:true, invoices:true },
    pro:  { createAuction:true, invoices:true, messages:true },
    elite:{ createAuction:true, invoices:true, messages:true, tasks:true },
  };
  if (!userPlans?.length) return { ...caps, ...PLAN_TO_CAPS.free };
  for (const pid of userPlans) Object.assign(caps, PLAN_TO_CAPS[pid] || {});
  return caps;
}

/** UI helpers */
function SidebarLink({ href, icon: Icon, text }:{ href:string; icon:any; text:string }) {
  return (
    <InstantLink href={href} className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800">
      <Icon className="w-4 h-4 text-[var(--brand-700)]" /><span className="text-sm">{text}</span>
    </InstantLink>
  );
}
function UserShell({ children, sidebar }:{ children:React.ReactNode; sidebar:React.ReactNode; }) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[260px_1fr] gap-4">
        <aside className="hidden md:flex flex-col gap-4 border rounded-2xl p-4 bg-white dark:bg-gray-900 dark:border-gray-800 h-fit sticky top-4">{sidebar}</aside>
        <section>{children}</section>
      </div>
    </main>
  );
}

export default function DashboardWidgetsPage() {
  const [adminDefaults, setAdminDefaults] = useState<AdminDefaults>(DEFAULT_ADMIN);
  const [userOverrides, setUserOverrides] = useState<UserOverrides>({});
  const [plans, setPlans] = useState<string[]>(["free"]);

  useEffect(() => {
    setAdminDefaults(loadAdminDefaults());
    setUserOverrides(loadUserOverrides());
    setPlans(readUserPlans());
  }, []);

  const caps = capsForPlans(plans);
  const canCustomize = plans.some((p) => p === "basic" || p === "pro" || p === "elite");

  const toggleUser = (w: WidgetKey) => {
    if (!canCustomize) return;
    const next = { ...userOverrides, [w]: !(userOverrides[w] !== false) ? false : true };
    setUserOverrides(next);
    saveUserOverrides(next);
  };

  const sidebar = (
    <>
      <div className="flex items-center gap-2">
        <HomeIcon className="w-5 h-5 text-[var(--brand-700)]" />
        <h3 className="font-semibold text-sm">لوحة المستخدم</h3>
      </div>
      <nav className="space-y-1">
        <SidebarLink href="/dashboard" icon={HomeIcon} text="الملخص" />
        <SidebarLink href="/properties" icon={BuildingOfficeIcon} text="عقاراتي" />
        <SidebarLink href="/favorites" icon={HeartIcon} text="المفضلة" />
        <SidebarLink href="/auctions" icon={BellAlertIcon} text="المزادات" />
        <SidebarLink href="/admin/tasks" icon={ClipboardDocumentListIcon} text="المهام" />
        <SidebarLink href="/messages" icon={EnvelopeOpenIcon} text="الرسائل" />
        <SidebarLink href="/billing" icon={BanknotesIcon} text="الفواتير" />
        <SidebarLink href="/calendar" icon={CalendarDaysIcon} text="التقويم" />
        <SidebarLink href="/subscriptions" icon={StarIcon} text="الباقات والاشتراكات" />
      </nav>

      <div className="border-t pt-3">
        <div className="flex items-center gap-2 mb-2">
          <Cog6ToothIcon className="w-4 h-4 text-[var(--brand-700)]" />
          <span className="text-xs font-semibold">عناصر لوحة المستخدم</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">هذه الصفحة للتحكم بالعناصر. يبقى الشريط ثابت.</p>
      </div>
    </>
  );

  return (
    <UserShell sidebar={sidebar}>
      <Head><title>تخصيص عناصر لوحة المستخدم | Ain Oman</title></Head>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">عناصر لوحة المستخدم</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            لا يمكن إظهار عناصر عطّلها الأدمن أو غير مسموحة في باقتك.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InstantLink href="/dashboard" className="btn btn-secondary">رجوع للملخص</InstantLink>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WIDGETS.map((w) => {
          const disabled = !canCustomize || !adminDefaults[w] || caps[w] === false;
          return (
            <div key={w} className={`flex items-center justify-between border rounded-xl px-3 py-3 bg-white dark:bg-gray-900 dark:border-gray-800 ${disabled?"opacity-50":""}`}>
              <div className="text-sm">
                {w==="stats"?"إحصائيات أعلى اللوحة":w==="subscriptions"?"الاشتراكات":w==="auctions"?"المزادات":
                w==="createAuction"?"زر إنشاء مزاد":w==="tasks"?"المهام":w==="messages"?"الرسائل":
                w==="invoices"?"الفواتير":w==="favorites"?"المفضلة":w==="properties"?"العقارات":"التقويم"}
                {!adminDefaults[w] && <span className="ms-2 text-xs text-rose-600">موقوف من الأدمن</span>}
                {caps[w] === false && <span className="ms-2 text-xs text-amber-600">غير متاح في الباقة</span>}
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" checked={userOverrides[w] !== false} onChange={()=>toggleUser(w)} disabled={disabled} className="opacity-0 w-0 h-0" />
                <span className={`absolute inset-0 rounded-full transition-colors ${userOverrides[w] !== false ? "bg-[var(--brand-700)]":"bg-gray-300 dark:bg-gray-700"}`} />
                <span className={`absolute top-0.5 ${userOverrides[w] !== false ? "right-0.5":"left-0.5"} w-5 h-5 bg-white rounded-full transition-all`} />
              </label>
            </div>
          );
        })}
      </div>
    </UserShell>
  );
}
