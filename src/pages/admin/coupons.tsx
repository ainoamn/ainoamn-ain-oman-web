import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

/** أنواع الخصم الأساسية */
type CouponType = "percent" | "amount" | "renewal_percent" | "renewal_amount" | "trial_days";

/** أهداف/أقسام الكوبون. مرنة وقابلة للتوسعة */
type CouponTargets = {
  plans?: string[];
  adProducts?: string[];
  // أقسام مستقبلية: cars, jobs, services ... الخ
  [customScope: string]: any;
};

type Coupon = {
  code: string;
  type: CouponType;
  value: number;
  targets?: CouponTargets;
  expiresAt?: number | null;
  maxRedemptions?: number | null;
  redeemed?: number;
  createdAt?: number;
};

type Plan = { id: string; name: string; icon?: string; priceOMR: number; period: "/mo" | "/yr" | string };
type AdProduct = { id: string; name: string; icon?: string; priceOMR: number; durationDays: number };

function toInput(ms?: number | null) {
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
function AdminCoupons() {
  const { dir } = useI18n();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [ads, setAds] = useState<AdProduct[]>([]);
  const [items, setItems] = useState<Coupon[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  // نموذج
  const [form, setForm] = useState<Coupon>({
    code: "",
    type: "percent",
    value: 10,
    targets: { plans: [], adProducts: [] },
    expiresAt: null,
    maxRedemptions: null,
  });
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // أقسام مخصّصة (ديناميكية)
  const [customScopeKey, setCustomScopeKey] = useState("");
  const [customScopeList, setCustomScopeList] = useState("");

  const planIndex = useMemo(() => Object.fromEntries(plans.map((p) => [p.id, p])), [plans]);
  const adIndex = useMemo(() => Object.fromEntries(ads.map((p) => [p.id, p])), [ads]);

  async function load(query = "") {
    const [c, p, a] = await Promise.all([
      fetch(`/api/coupons${query ? `?q=${encodeURIComponent(query)}` : ""}`).then((r) => r.json()),
      fetch("/api/plans").then((r) => r.json()),
      fetch("/api/ad-products").then((r) => r.json()),
    ]);
    setItems(c.items || []);
    setPlans(p.items || []);
    setAds(a.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ code: "", type: "percent", value: 10, targets: { plans: [], adProducts: [] }, expiresAt: null, maxRedemptions: null });
    setEditingCode(null);
    setCustomScopeKey("");
    setCustomScopeList("");
  };

  const save = async () => {
    if (!form.code.trim()) return alert("أدخل كودًا");
    if (typeof form.value !== "number" || Number.isNaN(form.value)) return alert("قيمة غير صحيحة");

    setBusy(true);
    try {
      const payload = { ...form, code: form.code.trim().toUpperCase() };
      if (editingCode && editingCode !== form.code.trim()) {
        await fetch(`/api/coupons/${encodeURIComponent(editingCode)}`, { method: "DELETE" });
        const r = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error("create failed");
      } else if (editingCode) {
        const r = await fetch(`/api/coupons/${encodeURIComponent(editingCode)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error("update failed");
      } else {
        const r = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error("create failed");
      }
      resetForm();
      await load(q);
    } catch {
      alert("تعذّر الحفظ");
    } finally {
      setBusy(false);
    }
  };

  const edit = (c: Coupon) => {
    setEditingCode(c.code);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      targets: c.targets || {},
      expiresAt: c.expiresAt ?? null,
      maxRedemptions: c.maxRedemptions ?? null,
    });
  };

  const remove = async (code: string) => {
    if (!confirm("حذف الكود؟")) return;
    setBusy(true);
    try {
      await fetch(`/api/coupons/${encodeURIComponent(code)}`, { method: "DELETE" });
      await load(q);
    } finally {
      setBusy(false);
    }
  };

  // تبديل عناصر الأقسام المعروفة
  const toggleKnown = (scope: "plans" | "adProducts", id: string) => {
    const t = { ...(form.targets || {}) };
    const set = new Set<string>(Array.isArray(t[scope]) ? (t[scope] as string[]) : []);
    set.has(id) ? set.delete(id) : set.add(id);
    t[scope] = Array.from(set);
    setForm({ ...form, targets: t });
  };

  // إضافة/تعديل قسم مخصص (قيمة مفصولة بفواصل)
  const addCustomScope = () => {
    const key = customScopeKey.trim();
    if (!key) return;
    const arr = customScopeList
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const t = { ...(form.targets || {}) };
    t[key] = arr;
    setForm({ ...form, targets: t });
    setCustomScopeKey("");
    setCustomScopeList("");
  };

  // حذف قسم مخصص بالكامل
  const removeScope = (key: string) => {
    const t = { ...(form.targets || {}) };
    delete t[key];
    setForm({ ...form, targets: t });
  };

  // عرض قيم القسم (مع اختصار)
  const showScopeValues = (val: any) => {
    if (!val) return "—";
    if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  // مفاتيح الأقسام المخصصة باستثناء الأقسام المعروفة
  const customKeys = useMemo(() => {
    const keys = Object.keys(form.targets || {});
    return keys.filter((k) => k !== "plans" && k !== "adProducts");
  }, [form.targets]);

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head>
        <title>لوحة الخصومات</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">الخصومات / الأكواد</h1>
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-3 py-2 w-64"
              placeholder="بحث بالكود"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(q)}
            />
            <button onClick={() => load(q)} className="px-3 py-2 rounded bg-slate-700 text-white">
              بحث
            </button>
            <button onClick={() => { setQ(""); load(""); }} className="px-3 py-2 rounded border">
              مسح
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* النموذج */}
          <div className="bg-white rounded-xl p-5 shadow">
            <h2 className="font-semibold mb-3">{editingCode ? "تعديل كود" : "إضافة كود"}</h2>
            <div className="space-y-3">
              <input
                className="w-full border rounded p-2 font-mono"
                placeholder="CODE"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full border rounded p-2"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                >
                  <option value="percent">نسبة %</option>
                  <option value="amount">مبلغ</option>
                  <option value="renewal_percent">نسبة للتجديد</option>
                  <option value="renewal_amount">مبلغ للتجديد</option>
                  <option value="trial_days">أيام تجربة</option>
                </select>
                <input
                  className="w-full border rounded p-2"
                  type="number"
                  placeholder="القيمة"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>

              {/* الأقسام المعروفة: باقات الاشتراك */}
              <div>
                <div className="text-sm font-semibold mb-1">تطبيق على باقات الاشتراك</div>
                <div className="max-h-28 overflow-auto border rounded p-2">
                  {plans.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={!!form.targets?.plans?.includes(p.id)}
                        onChange={() => toggleKnown("plans", p.id)}
                      />
                      <span className="inline-flex items-center gap-2">
                        {p.icon?.startsWith("http") ? (
                          <img src={p.icon} alt="" className="w-4 h-4 rounded" />
                        ) : (
                          <span className="text-sm">{p.icon || "•"}</span>
                        )}
                        <span>{p.name}</span>
                      </span>
                    </label>
                  ))}
                  {plans.length === 0 && <div className="text-slate-500 text-sm">لا توجد باقات</div>}
                </div>
              </div>

              {/* الأقسام المعروفة: أنواع الإعلانات */}
              <div>
                <div className="text-sm font-semibold mb-1">تطبيق على أنواع الإعلانات</div>
                <div className="max-h-28 overflow-auto border rounded p-2">
                  {ads.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={!!form.targets?.adProducts?.includes(a.id)}
                        onChange={() => toggleKnown("adProducts", a.id)}
                      />
                      <span className="inline-flex items-center gap-2">
                        {a.icon?.startsWith("http") ? (
                          <img src={a.icon} alt="" className="w-4 h-4 rounded" />
                        ) : (
                          <span className="text-sm">{a.icon || "•"}</span>
                        )}
                        <span>{a.name}</span>
                      </span>
                    </label>
                  ))}
                  {ads.length === 0 && <div className="text-slate-500 text-sm">لا توجد أنواع</div>}
                </div>
              </div>

              {/* أقسام مخصّصة ديناميكية */}
              <div className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">أقسام مخصّصة</div>
                  {customKeys.length > 0 && (
                    <span className="text-xs text-slate-500">يمكن حذف أي قسم بالنقر على زر الحذف</span>
                  )}
                </div>

                {customKeys.length === 0 && <div className="text-sm text-slate-500 mb-2">لا توجد أقسام مخصّصة</div>}

                {customKeys.map((k) => (
                  <div key={k} className="flex items-center justify-between mb-2">
                    <div className="text-sm font-mono">{k}</div>
                    <div className="text-xs text-slate-700 truncate max-w-[60%]">{showScopeValues((form.targets || {})[k])}</div>
                    <button onClick={() => removeScope(k)} className="px-2 py-1 border rounded text-rose-600">
                      حذف
                    </button>
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="اسم القسم (مثال: cars)"
                    value={customScopeKey}
                    onChange={(e) => setCustomScopeKey(e.target.value)}
                  />
                  <input
                    className="border rounded px-2 py-1 col-span-2"
                    placeholder="قيم مفصولة بفواصل (id1,id2,...)"
                    value={customScopeList}
                    onChange={(e) => setCustomScopeList(e.target.value)}
                  />
                </div>
                <div className="mt-2">
                  <button onClick={addCustomScope} className="px-3 py-1 bg-slate-700 text-white rounded">
                    إضافة/تحديث
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm mb-1">تاريخ الانتهاء</div>
                  <input
                    className="w-full border rounded p-2"
                    type="datetime-local"
                    value={toInput(form.expiresAt ?? null)}
                    onChange={(e) => setForm({ ...form, expiresAt: fromInput(e.target.value) })}
                  />
                </div>
                <div>
                  <div className="text-sm mb-1">الحد الأقصى للاستخدام</div>
                  <input
                    className="w-full border rounded p-2"
                    type="number"
                    placeholder="غير محدود"
                    value={form.maxRedemptions ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxRedemptions: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button disabled={busy} onClick={save} className="px-4 py-2 bg-teal-600 text-white rounded">
                  {editingCode ? "حفظ" : "إضافة"}
                </button>
                {editingCode && (
                  <button onClick={resetForm} className="px-3 py-2 border rounded">
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* القائمة */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow">
            <h2 className="font-semibold mb-3">الأكواد</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">الكود</th>
                    <th className="p-2">النوع</th>
                    <th className="p-2">القيمة</th>
                    <th className="p-2">الاشتراك</th>
                    <th className="p-2">الإعلانات</th>
                    <th className="p-2">أقسام أخرى</th>
                    <th className="p-2">ينتهي</th>
                    <th className="p-2">المسموح</th>
                    <th className="p-2">المستخدم</th>
                    <th className="p-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => {
                    const otherKeys = Object.keys(c.targets || {}).filter((k) => k !== "plans" && k !== "adProducts");
                    return (
                      <tr key={c.code} className="border-b">
                        <td className="p-2 font-mono">{c.code}</td>
                        <td className="p-2">{c.type}</td>
                        <td className="p-2">{c.value}</td>
                        <td className="p-2">
                          {c.targets?.plans?.length
                            ? c.targets.plans.map((id) => planIndex[id]?.name || id).join(", ")
                            : "الكل"}
                        </td>
                        <td className="p-2">
                          {c.targets?.adProducts?.length
                            ? c.targets.adProducts.map((id) => adIndex[id]?.name || id).join(", ")
                            : "الكل"}
                        </td>
                        <td className="p-2">
                          {otherKeys.length ? (
                            <div className="space-y-1">
                              {otherKeys.map((k) => (
                                <div key={k}>
                                  <span className="font-mono">{k}:</span> {showScopeValues((c.targets as any)[k])}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-2">{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "—"}</td>
                        <td className="p-2">{c.maxRedemptions ?? "—"}</td>
                        <td className="p-2">{c.redeemed ?? 0}</td>
                        <td className="p-2 whitespace-nowrap">
                          <button onClick={() => edit(c)} className="px-3 py-1 rounded bg-slate-700 text-white me-2">
                            تعديل
                          </button>
                          <button onClick={() => remove(c.code)} className="px-3 py-1 rounded bg-rose-600 text-white">
                            حذف
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-slate-500">
                        لا توجد أكواد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
