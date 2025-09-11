// src/pages/admin/subscriptions.tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

/* تخزين مشترك */
const LS_FEATURES = "ain.features.registry"; // يملؤه /admin/dashboard/widgets
const LS_PLANS = "ain.subscriptions.plans";  // يبقي ربط الميزات بالباقات بعد التحديث

/* أنواع */
type Period = "/mo" | "/yr";
type Feature = {
  key: string;            // مثل: "widget.stats" أو "link.12345"
  label: string;          // الاسم الظاهر القادم من widgets
  iconKey?: string;
  source: "widget" | "adminLink";
  meta?: Record<string, any>;
};
type Plan = {
  id: string;
  name: string;
  priceOMR: number;
  period: Period;
  annualDiscountPercent?: number;
  highlight?: boolean;
  description?: string;
  icon?: string;
  // ملاحظة: يمكن أن تحتوي features نصوصًا قديمة أو مفاتيح من سجل الميزات
  features: string[];
  recommended?: boolean;
  popular?: boolean;
  capabilities?: Record<string, any>;
  stockLimit?: number | null;
};
type Sub = {
  id: string;
  serial: string;
  userId: string;
  name: string;
  planId: string;
  state: "pending" | "active" | "declined" | "banned";
  startAt: number | null;
  endAt: number | null;
  promoted: boolean;
  priceOMR: number;
  discount?: any;
  finalPriceOMR: number;
  billingPeriod: Period;
  payment: { method: string; status: string };
  createdAt: number;
  remainingMs?: number | null;
};
type Task = { id: string; title: string; description: string; status: "open" | "done" };

/* بيانات تجريبية عند غياب الخادم */
const MOCK_PLANS: Plan[] = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    priceOMR: 10,
    period: "/mo",
    annualDiscountPercent: 10,
    highlight: false,
    description: "باقة مناسبة للمستخدمين الجدد",
    icon: "📊",
    features: ["عرض 10 عقارات", "widget.stats"],
    capabilities: { includesCreateAuction: false, includesFeaturedAds: false, maxListings: 10 },
    stockLimit: 100,
  },
  {
    id: "professional",
    name: "الباقة المحترفة",
    priceOMR: 25,
    period: "/mo",
    annualDiscountPercent: 15,
    highlight: true,
    description: "باقة متقدمة للوسطاء العقاريين",
    icon: "🚀",
    features: ["widget.stats", "widget.subscriptions", "تقارير أداء"],
    capabilities: { includesCreateAuction: true, includesFeaturedAds: true, maxListings: 50 },
    stockLimit: 50,
  },
  {
    id: "enterprise",
    name: "الباقة المتميزة",
    priceOMR: 50,
    period: "/mo",
    annualDiscountPercent: 20,
    highlight: false,
    description: "باقة شاملة للشركات الكبيرة",
    icon: "🏆",
    features: ["widget.stats", "widget.subscriptions", "widget.auctions", "تقارير متقدمة"],
    capabilities: { includesCreateAuction: true, includesFeaturedAds: true, maxListings: 999 },
    stockLimit: 20,
  },
];

const MOCK_SUBS: Sub[] = [
  {
    id: "sub_001",
    serial: "SUB-2023-001",
    userId: "user_001",
    name: "أحمد السيد",
    planId: "professional",
    state: "active",
    startAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    promoted: true,
    priceOMR: 25,
    finalPriceOMR: 25,
    billingPeriod: "/mo",
    payment: { method: "online", status: "paid" },
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    remainingMs: 30 * 24 * 60 * 60 * 1000,
  },
];

const MOCK_TASKS: Task[] = [
  { id: "task_001", title: "مراجعة الاشتراكات المنتهية", description: "مراجعة الاشتراكات التي على وشك الانتهاء", status: "open" },
  { id: "task_002", title: "تحديث الأسعار", description: "تحديث أسعار الباقات للربع القادم", status: "open" },
];

/* أدوات مساعدة */
function toInput(ms: number | null) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fromInput(s: string) {
  if (!s) return null;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : null;
}
function fmtRemain(ms?: number | null) {
  if (ms == null) return "—";
  const d = Math.ceil(ms / (24 * 60 * 60 * 1000));
  return d <= 0 ? "انتهى" : `${d} يوم`;
}
const yr = (t: number) => {
  const d = new Date(t);
  d.setFullYear(d.getFullYear() + 1);
  return d.getTime();
};
const mo = (t: number) => {
  const d = new Date(t);
  d.setMonth(d.getMonth() + 1);
  return d.getTime();
};
function readLS<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}
function writeLS<T>(k: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(k, JSON.stringify(data));
    // إعلام الصفحات الأخرى
    window.dispatchEvent(new Event("storage"));
    // حدث عام
    window.dispatchEvent(new CustomEvent("plansUpdated", { detail: data }));
    // حدث مخصص تستمع له صفحة العرض
    window.dispatchEvent(new Event("ain:plans:change"));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

/* جلب آمن مع مهلة + رجوع للبيانات التجريبية */
async function safeFetch(url: string, options: RequestInit = {}) {
  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
  try {
    const response = (await Promise.race([fetch(url, options), timeoutPromise])) as Response;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch {
    if (url.includes("/api/plans")) return { items: MOCK_PLANS };
    if (url.includes("/api/subscriptions")) return { items: MOCK_SUBS };
    if (url.includes("/api/tasks")) return { items: MOCK_TASKS };
    return { items: [] };
  }
}

/* دمج التراكب من التخزين مع بيانات الخادم قبل الحفظ والنشر */
function mergeOverlayWithServer(
  base: { id: string; features?: string[] }[],
  overlay: { id: string; features?: string[] }[]
) {
  const map = new Map(overlay.map((o) => [o.id, o]));
  return base.map((p) => {
    const ov = map.get(p.id);
    if (!ov || !ov.features || ov.features.length === 0) return p;
    return { ...p, features: ov.features };
  });
}

/* الصفحة */
export default function AdminSubscriptions() {
  const { dir } = useI18n();

  const [featuresReg, setFeaturesReg] = useState<Feature[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<Plan>({
    id: "",
    name: "",
    priceOMR: 0,
    period: "/mo",
    annualDiscountPercent: 10,
    highlight: false,
    description: "",
    icon: "",
    features: [],
    capabilities: { includesCreateAuction: false, includesFeaturedAds: false, maxListings: 10 },
    stockLimit: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "subscriptions" | "tasks">("plans");
  const [usingMockData, setUsingMockData] = useState(false);

  const planById = useMemo(() => Object.fromEntries(plans.map((p) => [p.id, p])), [plans]);
  const now = Date.now();
  const activeByPlan = useMemo(() => {
    const m: Record<string, number> = {};
    subs.forEach((s) => {
      if (s.state === "active" && s.endAt && s.endAt > now) m[s.planId] = (m[s.planId] || 0) + 1;
    });
    return m;
  }, [subs, now]);

  // تحميل أولي + دمج تراكب الميزات من التخزين حتى لا يضيع بعد التحديث
  async function load(scan = false) {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      const [plansData, subsData, tasksData] = await Promise.all([
        safeFetch("/api/plans"),
        safeFetch(`/api/subscriptions${scan ? "?scan=1" : ""}`),
        safeFetch("/api/tasks"),
      ]);

      const serverPlans = (plansData.items || []) as Plan[];
      // دمج آخر تخصيص محفوظ قبل الكتابة إلى الحالة أو التخزين
      const prevOverlay = readLS<{ id: string; features?: string[] }[]>(LS_PLANS, []);
      const merged = mergeOverlayWithServer(serverPlans, prevOverlay);

      setPlans(merged);
      setSubs(subsData.items || []);
      setTasks(tasksData.items || []);

      // حفظ النسخة المدموجة في التخزين وبثّ الحدث ليستمع له /subscriptions
      writeLS(LS_PLANS, merged);
    } catch {
      setUsingMockData(true);
      setPlans(MOCK_PLANS);
      setSubs(MOCK_SUBS);
      setTasks(MOCK_TASKS);
      setError("حدث خطأ أثناء تحميل البيانات. تم استخدام بيانات تجريبية.");
      writeLS(LS_PLANS, MOCK_PLANS);
    } finally {
      // تحميل سجل الميزات مهما كان
      const feats = readLS<Feature[]>(LS_FEATURES, []);
      setFeaturesReg(Array.isArray(feats) ? feats : []);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onChange = () => setFeaturesReg(readLS<Feature[]>(LS_FEATURES, []));
    if (typeof window !== "undefined") window.addEventListener("ain:features:change", onChange);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("ain:features:change", onChange);
    };
  }, []);

  // حفظ باقة واحدة (النموذج يسار)
  const savePlan = async () => {
    if (!form.name.trim()) return alert("اسم الباقة مطلوب");
    try {
      const payload = { ...form, capabilities: form.capabilities || {}, features: form.features || [] };
      if (!form.id) {
        await safeFetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await safeFetch(`/api/plans/${encodeURIComponent(form.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      await load(); // load ينشر ويكتب للتخزين بعد الدمج
      alert("تم حفظ الباقة بنجاح!");
    } catch {
      alert("فشل في حفظ الباقة. تأكد من اتصال الخادم.");
    }
  };

  // حفظ جميع الباقات بعد تعديل مصفوفة الميزات
  const saveAllPlans = async () => {
    try {
      for (const p of plans) {
        const payload = { ...p, features: p.features || [], capabilities: p.capabilities || {} };
        await safeFetch(`/api/plans/${encodeURIComponent(p.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      // حفظ الباقات الحالية في التخزين وبثّ الحدث
      writeLS(LS_PLANS, plans);
      alert("تم حفظ جميع التغييرات.");
    } catch {
      alert("تعذر حفظ بعض التغييرات. تحقق من الخادم.");
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      priceOMR: 0,
      period: "/mo",
      annualDiscountPercent: 10,
      highlight: false,
      description: "",
      icon: "",
      features: [],
      capabilities: { includesCreateAuction: false, includesFeaturedAds: false, maxListings: 10 },
      stockLimit: null,
    });
  };

  const editPlan = (p: Plan) => {
    setForm({
      ...p,
      features: [...(p.features || [])],
      capabilities: { ...(p.capabilities || {}) },
    });
  };

  const deletePlan = async (id: string) => {
    if (!confirm("حذف الباقة؟")) return;
    try {
      await safeFetch(`/api/plans/${encodeURIComponent(id)}`, { method: "DELETE" });
      await load(); // load ينشر ويكتب للتخزين بعد الدمج
      alert("تم حذف الباقة بنجاح!");
    } catch {
      alert("فشل في حذف الباقة. تأكد من اتصال الخادم.");
    }
  };

  // ربط مفتاح ميزة من سجل widgets مع الباقة
  const togglePlanFeatureKey = (planId: string, featureKey: string) => {
  setPlans(prev => {
    const next = prev.map(p => {
      if (p.id !== planId) return p;
      const list = Array.isArray(p.features) ? p.features : [];
      const hasKey = list.includes(featureKey);
      const updatedFeatures = hasKey ? list.filter(k => k !== featureKey) : [...list, featureKey];
      return { ...p, features: updatedFeatures };
    });
    writeLS(LS_PLANS, next); // يبثّ التغييرات لصفحة /subscriptions
    return next;
  });
};


  // إبقاء ميزات الباقات متزامنة عند تغيّر سجل الميزات: إزالة المفاتيح التي اختفت
  useEffect(() => {
    if (featuresReg.length === 0) return;
    const validKeys = new Set(featuresReg.map((f) => f.key));
    setPlans((prev) => {
      const updatedPlans = prev.map((p) => ({
        ...p,
        features: (p.features || []).filter((k) =>
          !k.startsWith("widget.") && !k.startsWith("link.") ? true : validKeys.has(k)
        ),
      }));
      writeLS(LS_PLANS, updatedPlans);
      return updatedPlans;
    });
  }, [featuresReg.map((f) => f.key).join("|")]);

  const setLocalSub = (id: string, patch: Partial<Sub>) => setSubs((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const persistSub = async (s: Sub) => {
    try {
      await safeFetch(`/api/subscriptions/${encodeURIComponent(s.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      await load();
      alert("تم حفظ الاشتراك بنجاح!");
    } catch {
      alert("فشل في حفظ الاشتراك. تأكد من اتصال الخادم.");
    }
  };
  const approve = (s: Sub) => {
    const start = s.startAt ?? Date.now();
    const end = s.endAt ?? (s.billingPeriod === "/yr" ? yr(start) : mo(start));
    setLocalSub(s.id, { state: "active", startAt: start, endAt: end });
    alert("تم تفعيل الاشتراك!");
  };

  const addFeatureText = () => setForm({ ...form, features: [...(form.features || []), ""] });
  const updateFeatureText = (index: number, value: string) => {
    const nf = [...(form.features || [])];
    nf[index] = value;
    setForm({ ...form, features: nf });
  };
  const removeFeatureText = (index: number) => {
    const nf = [...(form.features || [])];
    nf.splice(index, 1);
    setForm({ ...form, features: nf });
  };

  const retryLoad = () => {
    setError(null);
    setLoading(true);
    load();
  };

  const humanizePlanFeature = (token: string) => {
    const f = featuresReg.find((x) => x.key === token);
    return f ? f.label : token;
  };

  if (loading) {
    return (
      <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
        <Head>
          <title>لوحة التحكم - الباقات والاشتراكات</title>
        </Head>
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1 w-full flex flex-col items-center justify-center">
          <ArrowPathIcon className="w-12 h-12 text-teal-600 animate-spin mb-4" />
          <div className="text-lg">جاري التحميل...</div>
          <p className="text-sm text-gray-500 mt-2">قد تستغرق العملية بضع ثوانٍ</p>
          <button
            onClick={() => {
              setLoading(false);
              setUsingMockData(true);
              setPlans(MOCK_PLANS);
              setSubs(MOCK_SUBS);
              setTasks(MOCK_TASKS);
              setFeaturesReg(readLS<Feature[]>(LS_FEATURES, []));
              writeLS(LS_PLANS, MOCK_PLANS);
            }}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center"
          >
            <EyeIcon className="w-5 h-5 ml-2" />
            استخدام بيانات تجريبية
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head>
        <title>لوحة التحكم - الباقات والاشتراكات</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        {/* تنبيه بيانات تجريبية */}
        {usingMockData && (
          <div className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 ml-2" />
            <div>
              <p className="font-medium">يتم استخدام بيانات تجريبية</p>
              <p className="text-sm">واجهات برمجة التطبيقات غير متاحة حالياً</p>
            </div>
            <button onClick={retryLoad} className="mr-auto px-3 py-1 bg-amber-600 text-white rounded text-sm flex items-center">
              <ArrowPathIcon className="w-4 h-4 ml-1" />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* تبويبات */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "plans" ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("plans")}
          >
            إدارة الباقات
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "subscriptions" ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("subscriptions")}
          >
            إدارة الاشتراكات
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "tasks" ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("tasks")}
          >
            المهام
          </button>
        </div>

        {/* تبويب الباقات */}
        {activeTab === "plans" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">إدارة الباقات</h1>
              <div className="flex gap-2">
                <button onClick={() => load(true)} className="px-3 py-2 rounded bg-teal-600 text-white">
                  فحص قرب الانتهاء
                </button>
                <button onClick={load} className="px-3 py-2 rounded border">
                  تحديث البيانات
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              {/* نموذج */}
              <div className="lg:col-span-1 bg-white rounded-xl p-5 shadow">
                <h2 className="font-semibold mb-3">{form.id ? "تعديل باقة" : "إضافة باقة"}</h2>
                <div className="space-y-3">
                  <input className="w-full border rounded p-2" placeholder="اسم الباقة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="w-full border rounded p-2"
                      placeholder="السعر الشهري (ر.ع)"
                      type="number"
                      value={form.priceOMR}
                      onChange={(e) => setForm({ ...form, priceOMR: Number(e.target.value) })}
                    />
                    <select className="w-full border rounded p-2" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as Period })}>
                      <option value="/mo">شهري</option>
                      <option value="/yr">سنوي</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="w-full border rounded p-2"
                      placeholder="خصم سنوي %"
                      type="number"
                      value={form.annualDiscountPercent ?? 10}
                      onChange={(e) => setForm({ ...form, annualDiscountPercent: Number(e.target.value) })}
                    />
                    <input
                      className="w-full border rounded p-2"
                      placeholder="حد السعة (اختياري)"
                      type="number"
                      value={form.stockLimit ?? ""}
                      onChange={(e) => setForm({ ...form, stockLimit: e.target.value === "" ? null : Number(e.target.value) })}
                    />
                  </div>
                  <input className="w-full border rounded p-2" placeholder="إيموجي/رابط الأيقونة" value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                  <textarea className="w-full border rounded p-2" placeholder="وصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                  {/* ميزات نص حر */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">ميزات (نص حر)</label>
                      <button type="button" onClick={addFeatureText} className="text-sm text-teal-600 flex items-center">
                        <PlusIcon className="w-4 h-4 ml-1" />
                        إضافة
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(form.features || [])
                        .filter((t) => !t.startsWith("widget.") && !t.startsWith("link."))
                        .map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              className="flex-1 border rounded p-2"
                              placeholder="الميزة"
                              value={feature}
                              onChange={(e) => updateFeatureText(index, e.target.value)}
                            />
                            <button type="button" onClick={() => removeFeatureText(index)} className="p-2 text-red-600">
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* القدرات */}
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.capabilities?.includesCreateAuction}
                      onChange={(e) => setForm({ ...form, capabilities: { ...(form.capabilities || {}), includesCreateAuction: e.target.checked } })}
                    />
                    <span>إنشاء مزادات</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.capabilities?.includesFeaturedAds}
                      onChange={(e) => setForm({ ...form, capabilities: { ...(form.capabilities || {}), includesFeaturedAds: e.target.checked } })}
                    />
                    <span>إعلانات مميزة</span>
                  </label>
                  <label className="block">
                    <span className="block mb-1">حد الإعلانات</span>
                    <input
                      type="number"
                      className="w-full border rounded p-2"
                      value={Number(form.capabilities?.maxListings ?? 10)}
                      onChange={(e) => setForm({ ...form, capabilities: { ...(form.capabilities || {}), maxListings: Number(e.target.value) } })}
                    />
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={!!form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.checked })} />
                    <span>تمييز الباقة</span>
                  </label>
                  <div className="flex gap-2 mt-2">
                    <button onClick={savePlan} className="px-4 py-2 bg-teal-600 text-white rounded">
                      {form.id ? "حفظ" : "إضافة"}
                    </button>
                    {form.id && (
                      <button onClick={resetForm} className="px-3 py-2 border rounded">
                        إلغاء
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* بطاقات الباقات */}
              <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow">
                <h2 className="font-semibold mb-3">الباقات المتاحة ({plans.length})</h2>
                {plans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                    <p>لا توجد باقات متاحة</p>
                    <p className="text-sm mt-2">تأكد من أن واجهة برمجة التطبيقات تعمل بشكل صحيح</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {plans.map((p) => (
                      <div key={p.id} className="border rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{p.icon || "•"}</span>
                          <div className="font-semibold">
                            {p.name} {p.highlight ? "⭐" : ""}
                          </div>
                        </div>
                        <div className="text-sm text-slate-600">{p.description}</div>
                        <div className="mt-2 text-sm">
                          شهري: {p.priceOMR} ر.ع — سنوي: {(p.priceOMR * 12 * (1 - (p.annualDiscountPercent ?? 10) / 100)).toFixed(3)} ر.ع
                        </div>
                        {/* عرض الميزات: مفاتيح السجل تُحوّل إلى عناوينها */}
                        {p.features && p.features.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-1">الميزات:</div>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {p.features.map((token, idx) => (
                                <li key={idx} className="flex items-start">
                                  <CheckIcon className="w-4 h-4 text-teal-600 mt-0.5 mr-1 flex-shrink-0" />
                                  <span>{humanizePlanFeature(token)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Number.isFinite(p.stockLimit as any) && (
                          <div className="text-xs mt-3 p-2 bg-slate-100 rounded">السعة: {activeByPlan[p.id] || 0} / {p.stockLimit}</div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => editPlan(p)} className="px-3 py-1 rounded bg-slate-700 text-white flex items-center">
                            <PencilIcon className="w-4 h-4 ml-1" />
                            تعديل
                          </button>
                          <button onClick={() => deletePlan(p.id)} className="px-3 py-1 rounded bg-rose-600 text-white flex items-center">
                            <TrashIcon className="w-4 h-4 ml-1" />
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* مصفوفة ربط الباقات مع عناصر لوحة المستخدم القادمة من widgets */}
            <div className="bg-white rounded-xl p-5 shadow mb-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">الميزات من عناصر لوحة المستخدم</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFeaturesReg(readLS<Feature[]>(LS_FEATURES, []))} className="px-3 py-2 rounded border">
                    تحديث الميزات
                  </button>
                  <button onClick={saveAllPlans} className="px-3 py-2 rounded bg-teal-600 text-white">
                    حفظ التغييرات
                  </button>
                </div>
              </div>

              {featuresReg.length === 0 ? (
                <div className="text-sm text-slate-500">
                  لا توجد ميزات قادمة من لوحة الأدمن. أضف/فعّل العناصر من
                  <a href="/admin/dashboard/widgets" className="text-teal-700 underline ml-1">
                    /admin/dashboard/widgets
                  </a>
                  .
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-start py-2">الميزة</th>
                        {plans.map((p) => (
                          <th key={p.id} className="text-center py-2">
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {featuresReg.map((f) => (
                        <tr key={f.key} className="border-t">
                          <td className="py-2">{f.label}</td>
                          {plans.map((p) => {
                            const checked = (p.features || []).includes(f.key);
                            return (
                              <td key={p.id} className="text-center py-2">
                                <input type="checkbox" checked={checked} onChange={() => togglePlanFeatureKey(p.id, f.key)} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* تبويب الاشتراكات */}
        {activeTab === "subscriptions" && (
          <>
            <h1 className="text-2xl font-bold mb-6">الاشتراكات ({subs.length})</h1>
            <div className="bg-white rounded-xl p-5 shadow mb-10 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">الرقم</th>
                    <th className="p-2">المستخدم</th>
                    <th className="p-2">الباقة</th>
                    <th className="p-2">الفوترة</th>
                    <th className="p-2">الحالة</th>
                    <th className="p-2">بداية</th>
                    <th className="p-2">نهاية</th>
                    <th className="p-2">المتبقي</th>
                    <th className="p-2">الإجمالي</th>
                    <th className="p-2">إجراءات</th>
                    <th className="p-2">حفظ</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => {
                    const plan = planById[s.planId];
                    return (
                      <tr key={s.id} className="border-b">
                        <td className="p-2 font-mono">{s.serial}</td>
                        <td className="p-2">
                          <span className="text-teal-700">
                            {s.name} ({s.userId})
                          </span>
                        </td>
                        <td className="p-2">{plan?.name || s.planId}</td>
                        <td className="p-2">{s.billingPeriod === "/yr" ? "سنوي" : "شهري"}</td>
                        <td className="p-2">
                          <select className="border rounded px-2 py-1" value={s.state} onChange={(e) => setLocalSub(s.id, { state: e.target.value as Sub["state"] })}>
                            <option value="pending">معلق</option>
                            <option value="active">مفعل</option>
                            <option value="declined">مرفوض</option>
                            <option value="banned">محظور</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="datetime-local" className="border rounded px-2 py-1" value={toInput(s.startAt)} onChange={(e) => setLocalSub(s.id, { startAt: fromInput(e.target.value) })} />
                        </td>
                        <td className="p-2">
                          <input type="datetime-local" className="border rounded px-2 py-1" value={toInput(s.endAt)} onChange={(e) => setLocalSub(s.id, { endAt: fromInput(e.target.value) })} />
                        </td>
                        <td className="p-2">{fmtRemain(s.remainingMs)}</td>
                        <td className="p-2">{s.finalPriceOMR}</td>
                        <td className="p-2 whitespace-nowrap">
                          <button onClick={() => approve(s)} className="px-3 py-1 rounded bg-emerald-600 text-white me-2">
                            تفعيل فوري
                          </button>
                          <button onClick={() => setLocalSub(s.id, { state: "declined" })} className="px-3 py-1 rounded bg-rose-600 text-white">
                            رفض
                          </button>
                        </td>
                        <td className="p-2">
                          <button onClick={() => persistSub(s)} className="px-3 py-1 rounded bg-teal-600 text-white">
                            حفظ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {subs.length === 0 && (
                    <tr>
                      <td colSpan={11} className="p-4 text-center text-slate-500">
                        لا توجد اشتراكات
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* تبويب المهام */}
        {activeTab === "tasks" && (
          <>
            <h2 className="text-xl font-bold mb-3">المهام ({tasks.length})</h2>
            <div className="bg-white rounded-xl p-5 shadow">
              {tasks.length === 0 ? (
                <div className="text-slate-500 text-sm">لا توجد مهام</div>
              ) : (
                <ul className="list-disc ps-5 text-sm space-y-1">
                  {tasks.map((t) => (
                    <li key={t.id}>
                      {t.title} — <span className="text-slate-500">{t.status === "done" ? "منجزة" : "مفتوحة"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
