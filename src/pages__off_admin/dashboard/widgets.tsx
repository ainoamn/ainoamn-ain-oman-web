// src/pages/admin/dashboard/widgets.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  Cog6ToothIcon, HomeIcon, LinkIcon,
  TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon, PlusIcon,
  ChartBarIcon, StarIcon, BellAlertIcon, WrenchScrewdriverIcon, ClipboardDocumentListIcon,
  EnvelopeOpenIcon, BanknotesIcon, HeartIcon, BuildingOfficeIcon, CalendarDaysIcon,
  UsersIcon, CurrencyDollarIcon, PresentationChartLineIcon, ArrowPathIcon, InboxIcon, ShieldCheckIcon, DocumentTextIcon,
} from "@heroicons/react/24/outline";

/* مفاتيح التخزين */
const LS_FEATURES = "ain.features.registry";
const LS_ADMIN_LINKS = "ain.dashboard.admin.links";
const LS_ADMIN = "ain.dashboard.admin";
const LS_WIDGET_OVERRIDES = "ain.dashboard.widget.overrides";

/* أدوات تخزين آمنة */
function loadJSON<T>(key: string, fallback: T, validate?: (v:any)=>boolean): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    if (validate && !validate(v)) throw new Error("invalid");
    return v as T;
  } catch {
    try { localStorage.removeItem(key); } catch {}
    return fallback;
  }
}
function saveJSON<T>(key:string, v:T){ if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(v)); }

/* النماذج */
type Feature = { key:string; label:string; iconKey:string; source:"widget"|"adminLink"; meta?:Record<string,any> };

type WidgetKey =
  | "stats"
  | "subscriptions"
  | "auctions"
  | "createAuction"
  | "tasks"
  | "messages"
  | "invoices"
  | "favorites"
  | "properties"
  | "calendar"
  | "users"
  | "earnings"
  | "performance"
  | "inbox"
  | "security"
  | "documents";

type WidgetDef = { key:WidgetKey; label:string; icon:any };

const WIDGETS: WidgetDef[] = [
  { key: "stats",           label: "إحصائيات أعلى اللوحة", icon: ChartBarIcon },
  { key: "subscriptions",   label: "الاشتراكات",            icon: StarIcon },
  { key: "auctions",        label: "المزادات",               icon: BellAlertIcon },
  { key: "createAuction",   label: "زر إنشاء مزاد",         icon: WrenchScrewdriverIcon },
  { key: "tasks",           label: "المهام",                 icon: ClipboardDocumentListIcon },
  { key: "messages",        label: "الرسائل",               icon: EnvelopeOpenIcon },
  { key: "invoices",        label: "الفواتير",              icon: BanknotesIcon },
  { key: "favorites",       label: "المفضلة",               icon: HeartIcon },
  { key: "properties",      label: "العقارات",              icon: BuildingOfficeIcon },
  { key: "calendar",        label: "التقويم",               icon: CalendarDaysIcon },
  { key: "users",           label: "المستخدمون",            icon: UsersIcon },
  { key: "earnings",        label: "الإيرادات",             icon: CurrencyDollarIcon },
  { key: "performance",     label: "الأداء",                icon: PresentationChartLineIcon },
  { key: "inbox",           label: "الوارد",                icon: InboxIcon },
  { key: "security",        label: "الأمان",                icon: ShieldCheckIcon },
  { key: "documents",       label: "المستندات",             icon: DocumentTextIcon },
];

type AdminDefaults = Record<WidgetKey, boolean>;
const DEFAULT_ADMIN: AdminDefaults = WIDGETS.reduce((acc, w) => { acc[w.key] = true; return acc; }, {} as AdminDefaults);

type WidgetOverrides = Record<WidgetKey, { label?:string; iconKey?:string; hidden?:boolean }>;

/* ✅ أضفنا enabled?:boolean ولا نكسر التوافق: الافتراضي true */
type AdminLink = { id:string; label:string; href:string; iconKey:string; enabled?: boolean };

/* أيقونات لاختيارها من القوائم */
const ICONS_REGISTRY = [
  { key: "chart",   label: "إحصائيات", icon: ChartBarIcon },
  { key: "star",    label: "نجمة",     icon: StarIcon },
  { key: "bell",    label: "تنبيه",    icon: BellAlertIcon },
  { key: "wrench",  label: "أدوات",    icon: WrenchScrewdriverIcon },
  { key: "tasks",   label: "مهام",     icon: ClipboardDocumentListIcon },
  { key: "mail",    label: "رسائل",    icon: EnvelopeOpenIcon },
  { key: "money",   label: "مال",      icon: BanknotesIcon },
  { key: "heart",   label: "قلب",      icon: HeartIcon },
  { key: "building",label: "مبنى",     icon: BuildingOfficeIcon },
  { key: "calendar",label: "تقويم",    icon: CalendarDaysIcon },
  { key: "users",   label: "مستخدمون", icon: UsersIcon },
  { key: "dollar",  label: "دولار",    icon: CurrencyDollarIcon },
  { key: "perf",    label: "أداء",     icon: PresentationChartLineIcon },
  { key: "inbox",   label: "وارد",     icon: InboxIcon },
  { key: "shield",  label: "أمان",     icon: ShieldCheckIcon },
  { key: "doc",     label: "مستند",    icon: DocumentTextIcon },
  { key: "link",    label: "رابط",     icon: LinkIcon },
];
function iconCompByKey(key:string){
  const i = ICONS_REGISTRY.find(x=>x.key===key);
  return i ? i.icon : LinkIcon;
}
function iconKeyForWidget(w:WidgetKey):string{
  switch (w){
    case "stats": return "chart";
    case "subscriptions": return "star";
    case "auctions": return "bell";
    case "createAuction": return "wrench";
    case "tasks": return "tasks";
    case "messages": return "mail";
    case "invoices": return "money";
    case "favorites": return "heart";
    case "properties": return "building";
    case "calendar": return "calendar";
    case "users": return "users";
    case "earnings": return "dollar";
    case "performance": return "perf";
    case "inbox": return "inbox";
    case "security": return "shield";
    case "documents": return "doc";
    default: return "link";
  }
}

/* تحميل/حفظ حالات الأدمن والروابط والتخصيصات */
function loadAdminDefaults(): AdminDefaults {
  const v = loadJSON<AdminDefaults>(LS_ADMIN, DEFAULT_ADMIN, (x)=> typeof x === "object" && x);
  return { ...DEFAULT_ADMIN, ...v };
}
function saveAdminDefaults(v: AdminDefaults) {
  saveJSON(LS_ADMIN, v);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ain:adminDefaults:change"));
}
function loadAdminLinks(): AdminLink[] { return loadJSON<AdminLink[]>(LS_ADMIN_LINKS, [], Array.isArray); }
function saveAdminLinks(links: AdminLink[]) {
  saveJSON(LS_ADMIN_LINKS, links);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ain:adminLinks:change"));
}
function loadWidgetOverrides(): WidgetOverrides {
  return loadJSON<WidgetOverrides>(LS_WIDGET_OVERRIDES, {}, (x)=> typeof x === "object" && x);
}
function saveWidgetOverrides(ov: WidgetOverrides){
  saveJSON(LS_WIDGET_OVERRIDES, ov);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ain:widgetOverrides:change"));
}

/* مزامنة سجل الميزات */
function syncFeaturesFromState(adm: AdminDefaults, links: AdminLink[], overrides: WidgetOverrides){
  const feats: Feature[] = [];
  for (const w of Object.keys(adm) as WidgetKey[]){
    if (!adm[w]) continue;
    const base = WIDGETS.find(x=>x.key===w)!;
    const ov = overrides[w] || {};
    feats.push({
      key: `widget.${w}`,
      label: ov.label?.trim() || base.label,
      iconKey: ov.iconKey || iconKeyForWidget(w),
      source: "widget",
    });
  }
  /* ✅ لا نضيف إلا الروابط المفعلة أو التي ليس لها enabled (افتراضي true) */
  for (const l of links){
    if (l.enabled === false) continue;
    feats.push({ key: `link.${l.id}`, label: l.label, iconKey: l.iconKey, source: "adminLink", meta:{ href:l.href } });
  }
  saveJSON(LS_FEATURES, feats);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ain:features:change"));
}

/* عناصر واجهة مشتركة */
function SidebarLink({ href, icon:Icon, text }:{ href:string; icon:any; text:string; }){
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-gray-800">
      <Icon className="w-4 h-4 text-[var(--brand-700)]" />
      <span className="text-sm">{text}</span>
    </Link>
  );
}
function AdminShell({ children, sidebar }:{ children:React.ReactNode; sidebar:React.ReactNode; }) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[260px_1fr] gap-4">
        <aside className="hidden md:flex flex-col gap-4 border rounded-2xl p-4 bg-white dark:bg-gray-900 dark:border-gray-800 h-fit sticky top-4">
          {sidebar}
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
function IconAction({ label, onClick, Icon, color }:{ label:string; onClick:()=>void; Icon:any; color?:"rose"|"slate" }){
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`relative group p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 ${color==="rose"?"text-rose-600":"text-slate-600"}`}
      title={label}
    >
      <Icon className={`w-4 h-4 ${color==="rose"?"text-rose-600":"text-slate-600"} group-hover:scale-110 transition-transform`} />
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
        {label}
      </span>
    </button>
  );
}
function ToggleRow({ label, value, onChange, icon:Icon, rightSlot }:{
  label:string; value:boolean; onChange:()=>void; icon:any; rightSlot?:React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-[var(--brand-700)]" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="relative inline-block w-12 h-6">
          <input type="checkbox" checked={value} onChange={onChange} className="opacity-0 w-0 h-0" />
          <span className={`absolute inset-0 rounded-full transition-colors ${value?"bg-[var(--brand-700)]":"bg-gray-300 dark:bg-gray-700"}`} />
          <span className={`absolute top-0.5 ${value?"right-0.5":"left-0.5"} w-5 h-5 bg-white rounded-full transition-all`} />
        </label>
        {rightSlot}
      </div>
    </div>
  );
}

/* نافذة منبثقة عامة */
function Modal({
  open, title, children, onClose,
}:{
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 dark:border dark:border-gray-800 shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-base font-semibold">{title}</h3>
            <button onClick={onClose} aria-label="إغلاق" className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* الصفحة */
export default function AdminDashboardWidgetsPage() {
  const [adm, setAdm] = useState<AdminDefaults>(DEFAULT_ADMIN);
  const [overrides, setOverrides] = useState<WidgetOverrides>({});
  const [links, setLinks] = useState<AdminLink[]>([]);

  // إضافة رابط جديد
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [iconKey, setIconKey] = useState("link");

  // تحرير رابط
  const [editId, setEditId] = useState<string|undefined>(undefined);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");
  const [editIconKey, setEditIconKey] = useState("link");

  // تحرير ودجت
  const [editWidgetKey, setEditWidgetKey] = useState<WidgetKey|null>(null);
  const [editWidgetLabel, setEditWidgetLabel] = useState("");
  const [editWidgetIconKey, setEditWidgetIconKey] = useState("link");

  useEffect(() => {
    const initAdm = loadAdminDefaults();
    const initLinks = loadAdminLinks();
    const initOverrides = loadWidgetOverrides();
    setAdm(initAdm);
    setLinks(initLinks);
    setOverrides(initOverrides);
    syncFeaturesFromState(initAdm, initLinks, initOverrides);
  }, []);

  const toggle = (w: WidgetKey) => {
    setAdm((prev)=>{
      const next = { ...prev, [w]: !prev[w] };
      saveAdminDefaults(next);
      syncFeaturesFromState(next, links, overrides);
      return next;
    });
  };

  const handleSave = () => {
    saveAdminDefaults(adm);
    saveAdminLinks(links);
    saveWidgetOverrides(overrides);
    syncFeaturesFromState(adm, links, overrides);
    alert("تم الحفظ.");
  };
  const handleRestore = () => {
    const def = DEFAULT_ADMIN;
    setAdm(def);
    saveAdminDefaults(def);
    syncFeaturesFromState(def, links, overrides);
  };

  const startEdit = (l: AdminLink) => {
    setEditId(l.id);
    setEditLabel(l.label);
    setEditHref(l.href);
    setEditIconKey(l.iconKey);
  };
  const cancelEdit = () => { setEditId(undefined); setEditLabel(""); setEditHref(""); setEditIconKey("link"); };
  const confirmEdit = () => {
    if (!editId) return;
    const next = links.map(l => l.id === editId ? { ...l, label: editLabel, href: editHref, iconKey: editIconKey } : l);
    setLinks(next);
    saveAdminLinks(next);
    syncFeaturesFromState(adm, next, overrides);
    cancelEdit();
  };

  const removeLink = (id:string) => {
    if (!confirm("حذف الرابط؟")) return;
    const next = links.filter(l=>l.id !== id);
    setLinks(next);
    saveAdminLinks(next);
    syncFeaturesFromState(adm, next, overrides);
  };

  const addLink = () => {
    if (!label.trim() || !href.trim()) return alert("أكمل الحقول");
    const id = `${Date.now()}`;
    const next = [...links, { id, label: label.trim(), href: href.trim(), iconKey, enabled: true }];
    setLinks(next);
    saveAdminLinks(next);
    syncFeaturesFromState(adm, next, overrides);
    setLabel(""); setHref(""); setIconKey("link");
  };

  const startEditWidget = (w: WidgetKey) => {
    const base = WIDGETS.find(x=>x.key===w)!;
    const ov = overrides[w] || {};
    setEditWidgetKey(w);
    setEditWidgetLabel(ov.label ?? base.label);
    setEditWidgetIconKey(ov.iconKey ?? iconKeyForWidget(w));
  };
  const cancelEditWidget = () => { setEditWidgetKey(null); setEditWidgetLabel(""); setEditWidgetIconKey("link"); };
  const confirmEditWidget = () => {
    if (!editWidgetKey) return;
    const nextOv: WidgetOverrides = {
      ...overrides,
      [editWidgetKey]: {
        ...(overrides[editWidgetKey] || {}),
        label: editWidgetLabel.trim() || undefined,
        iconKey: editWidgetIconKey || undefined,
        hidden: false,
      },
    };
    setOverrides(nextOv);
    saveWidgetOverrides(nextOv);
    syncFeaturesFromState(adm, links, nextOv);
    cancelEditWidget();
  };
  const deleteWidget = (w:WidgetKey) => {
    const nextOv = { ...overrides };
    delete nextOv[w];
    setOverrides(nextOv);
    saveWidgetOverrides(nextOv);
    syncFeaturesFromState(adm, links, nextOv);
  };

  /* ✅ تفعيل/تعطيل رابط إداري إضافي */
  const toggleLinkEnabled = (id: string) => {
    setLinks(prev => {
      const next = prev.map(l => l.id === id ? { ...l, enabled: l.enabled === false ? true : !l.enabled ? false : !l.enabled } : l);
      // التصحيح: نريد قلب القيمة ببساطة. السابق معقد. لنكتب بوضوح:
      return prev.map(l => l.id === id ? { ...l, enabled: l.enabled === false ? true : (l.enabled === true ? false : false) } : l);
    });
  };

  /* نسخة بسيطة وصحيحة */
  const toggleLink = (id:string) => {
    const next = links.map(l => l.id === id ? { ...l, enabled: l.enabled === false ? true : l.enabled === true ? false : false } : l);
    setLinks(next);
    saveAdminLinks(next);
    syncFeaturesFromState(adm, next, overrides);
  };

  const sidebar = (
    <>
      <div className="flex items-center gap-2">
        <Cog6ToothIcon className="w-5 h-5 text-[var(--brand-700)]" />
        <h3 className="font-semibold text-sm">خيارات الموقع</h3>
      </div>
      <nav className="space-y-1">
        <SidebarLink href="/admin/dashboard" icon={HomeIcon} text="لوحة الأدمن" />
      </nav>
    </>
  );

  const builtIn = useMemo(()=>WIDGETS, []);
  /* ✅ ترتيب الروابط الإضافية أبجديًا (عربي) */
  const sortedLinks = useMemo(
    () => [...links].sort((a,b)=> (a.label||"").localeCompare(b.label||"", "ar")),
    [links]
  );

  return (
    <AdminShell sidebar={sidebar}>
      <Head><title>عناصر لوحة المستخدم (أدمن) | Ain Oman</title></Head>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">عناصر لوحة المستخدم</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">أي عنصر تضيفه هنا يظهر كميزة ضمن الباقات فورًا.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRestore} className="btn btn-secondary">استعادة الافتراضي</button>
          <button onClick={handleSave} className="btn btn-primary">حفظ</button>
        </div>
      </div>

      {/* شبكة عناصر لوحة المستخدم */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {builtIn.map(({ key, label, icon }) => {
          const ov = overrides[key] || {};
          const shownLabel = ov.label?.trim() || label;
          return (
            <div key={key} className="flex flex-col gap-2">
              <ToggleRow
                label={shownLabel}
                value={adm[key]}
                onChange={()=>toggle(key)}
                icon={icon}
                rightSlot={
                  <div className="flex items-center gap-1">
                    <IconAction label="تعديل" onClick={()=>startEditWidget(key)} Icon={PencilSquareIcon} />
                    <IconAction label="حذف" onClick={()=>deleteWidget(key)} Icon={TrashIcon} color="rose" />
                  </div>
                }
              />
              {/* النموذج القديم داخل الصفحة (أبقيناه مخفيًا لأن التحرير الآن بمنبثقة) */}
              {false && (
                <div className="grid md:grid-cols-[1fr_1fr_auto_auto] gap-2">
                  <input value={editWidgetLabel} onChange={(e)=>setEditWidgetLabel(e.target.value)} className="input" />
                  <select value={editWidgetIconKey} onChange={(e)=>setEditWidgetIconKey(e.target.value)} className="input">
                    {ICONS_REGISTRY.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                  </select>
                  <button onClick={confirmEditWidget} className="btn btn-primary flex items-center gap-1">
                    <CheckIcon className="w-4 h-4" />حفظ
                  </button>
                  <button onClick={cancelEditWidget} className="btn btn-secondary flex items-center gap-1">
                    <XMarkIcon className="w-4 h-4" />إلغاء
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* روابط إدارية إضافية — ✅ بنفس مظهر عناصر لوحة المستخدم + زر تفعيل/تعطيل لكل رابط وبشكل مرتب */}
      <div className="border rounded-2xl p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-[var(--brand-700)]" />
            <h3 className="text-base font-semibold">روابط إدارية إضافية</h3>
          </div>
        </div>

        {/* إضافة رابط جديد */}
        <div className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <input value={label} onChange={(e)=>setLabel(e.target.value)} placeholder="المسمّى الظاهر" className="input" />
          <input value={href} onChange={(e)=>setHref(e.target.value)} placeholder="الرابط مثل /reports" className="input" />
          <select value={iconKey} onChange={(e)=>setIconKey(e.target.value)} className="input">
            {ICONS_REGISTRY.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
          </select>
          <button onClick={addLink} className="btn btn-secondary flex items-center gap-1"><PlusIcon className="w-4 h-4" />إضافة</button>
        </div>

        {/* ✅ عرض الروابط الإضافية كـ ToggleRow تمامًا مثل العناصر الأساسية */}
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedLinks.length === 0 && (
            <div className="col-span-full py-2 text-sm text-gray-500">لا توجد روابط مضافة.</div>
          )}
          {sortedLinks.map((l)=>{
            const Icon = iconCompByKey(l.iconKey);
            const enabled = l.enabled !== false; // الافتراضي مفعّل
            return (
              <div key={l.id} className="flex flex-col gap-2">
                <ToggleRow
                  label={l.label}
                  value={enabled}
                  onChange={()=>toggleLink(l.id)}
                  icon={Icon}
                  rightSlot={
                    <div className="flex items-center gap-1">
                      <IconAction label="تعديل" onClick={()=>startEdit(l)} Icon={PencilSquareIcon} />
                      <IconAction label="حذف" onClick={()=>removeLink(l.id)} Icon={TrashIcon} color="rose" />
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* نافذة تحرير الرابط */}
      <Modal open={!!editId} title="تحرير الرابط الإداري" onClose={cancelEdit}>
        <div className="grid gap-3">
          <label className="text-sm">
            المسمّى
            <input value={editLabel} onChange={(e)=>setEditLabel(e.target.value)} className="input mt-1 w-full" />
          </label>
          <label className="text-sm">
            الرابط
            <input value={editHref} onChange={(e)=>setEditHref(e.target.value)} className="input mt-1 w-full" />
          </label>
          <label className="text-sm">
            الأيقونة
            <select value={editIconKey} onChange={(e)=>setEditIconKey(e.target.value)} className="input mt-1 w-full">
              {ICONS_REGISTRY.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={cancelEdit} className="btn btn-secondary flex items-center gap-1">
              <XMarkIcon className="w-4 h-4" /> إلغاء
            </button>
            <button onClick={confirmEdit} className="btn btn-primary flex items-center gap-1">
              <CheckIcon className="w-4 h-4" /> حفظ
            </button>
          </div>
        </div>
      </Modal>

      {/* نافذة تعديل عنصر لوحة المستخدم */}
      <Modal open={editWidgetKey !== null} title="تعديل عنصر لوحة المستخدم" onClose={cancelEditWidget}>
        <div className="grid gap-3">
          <label className="text-sm">
            المسمّى
            <input value={editWidgetLabel} onChange={(e)=>setEditWidgetLabel(e.target.value)} className="input mt-1 w-full" />
          </label>
          <label className="text-sm">
            الأيقونة
            <select value={editWidgetIconKey} onChange={(e)=>setEditWidgetIconKey(e.target.value)} className="input mt-1 w-full">
              {ICONS_REGISTRY.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={cancelEditWidget} className="btn btn-secondary flex items-center gap-1">
              <XMarkIcon className="w-4 h-4" /> إلغاء
            </button>
            <button onClick={confirmEditWidget} className="btn btn-primary flex items-center gap-1">
              <CheckIcon className="w-4 h-4" /> حفظ
            </button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
