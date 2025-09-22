/**
 * Admin UI: Actions Settings page
 * Path: /admin/settings/actions
 * Location: src/pages/admin/settings/actions.tsx
 *
 * Notes:
 * - Pure Tailwind + native elements (no external UI deps)
 * - Avoids using 'fs' on the client. All persistence is via API.
 * - Mobile-first responsive layout (stack). On lg+: split columns.
 */

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { ActionsSettings, BuiltinActionKey, CustomAction } from "@/types/actions-settings";
import { fetchActionsSettings, saveActionsSettings } from "@/lib/actionsSettingsClient";

const BUILTIN_LIST: { key: BuiltinActionKey; label: string }[] = [
  { key: "chatOwner", label: "دردشة مع المالك" },
  { key: "contactAdmin", label: "تواصل مع الإدارة" },
  { key: "requestViewing", label: "طلب معاينة" },
  { key: "negotiatePrice", label: "مناقشة السعر" },
  { key: "reserveProperty", label: "حجز العقار" },
];

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function ActionsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ActionsSettings>({
    builtin: BUILTIN_LIST.map((b) => ({ key: b.key, enabled: true })),
    custom: [],
    showAnnualPrice: true,
    iconSize: 18,
  });

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchActionsSettings();
        const map = new Map(s.builtin.map((b) => [b.key, b.enabled]));
        const fixedBuiltins = BUILTIN_LIST.map((b) => ({
          key: b.key,
          enabled: map.has(b.key) ? !!map.get(b.key) : true,
        }));
        setSettings({ ...s, builtin: fixedBuiltins });
      } catch (e: any) {
        setError(e?.message || "تعذر تحميل الإعدادات");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggleBuiltin = (key: BuiltinActionKey) => {
    setSettings((prev) => ({
      ...prev,
      builtin: prev.builtin.map((b) => (b.key === key ? { ...b, enabled: !b.enabled } : b)),
    }));
  };

  const addCustom = () => {
    const order = (settings.custom?.length || 0) + 1;
    const newItem: CustomAction = {
      id: uuid(),
      labelAr: "زر مخصص جديد",
      labelEn: "New Custom Action",
      icon: "Sparkle",
      kind: "link",
      url: "https://example.com",
      enabled: true,
      order,
    };
    setSettings((p) => ({ ...p, custom: [...(p.custom || []), newItem] }));
  };

  const updateCustom = (id: string, patch: Partial<CustomAction>) => {
    setSettings((p) => ({
      ...p,
      custom: (p.custom || []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const removeCustom = (id: string) => {
    setSettings((p) => ({
      ...p,
      custom: (p.custom || []).filter((c) => c.id !== id),
    }));
  };

  const moveCustom = (id: string, dir: -1 | 1) => {
    setSettings((p) => {
      const arr = [...(p.custom || [])].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((c) => c.id === id);
      if (idx < 0) return p;
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= arr.length) return p;
      const a = arr[idx], b = arr[swapIdx];
      const tmp = a.order;
      a.order = b.order;
      b.order = tmp;
      return { ...p, custom: arr };
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      await saveActionsSettings(settings);
    } catch (e: any) {
      setError(e?.message || "تعذر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const builtinsEnabledCount = useMemo(
    () => settings.builtin.filter((b) => b.enabled).length,
    [settings.builtin]
  );

  return (
    <Layout>
      <Head>
        <title>إعدادات أزرار صفحة العقار</title>
      </Head>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">إعدادات أزرار صفحة العقار</h1>
            <p className="text-sm text-gray-500">
              تحكم في إظهار/إخفاء الأزرار المدمجة، وأضف أزرارًا مخصصة مع ترتيبها.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              className="rounded-xl px-4 py-2 font-semibold shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">جارٍ التحميل…</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Built-in actions */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">الأزرار المدمجة</h2>
                <span className="text-xs text-gray-500">
                  مفعل: {builtinsEnabledCount} / {BUILTIN_LIST.length}
                </span>
              </div>
              <div className="space-y-3">
                {BUILTIN_LIST.map((b) => {
                  const item = settings.builtin.find((x) => x.key === b.key);
                  const enabled = item ? item.enabled : true;
                  return (
                    <label
                      key={b.key}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <div className="font-medium">{b.label}</div>
                      <input
                        type="checkbox"
                        className="h-5 w-5"
                        checked={enabled}
                        onChange={() => handleToggleBuiltin(b.key)}
                      />
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-3">
                <label className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">إظهار السعر السنوي بجانب الشهري/اليومي</div>
                    <div className="text-xs text-gray-500">
                      مثال: 60 شهريًا → 720 سنويًا (حساب تلقائي ×12)
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={settings.showAnnualPrice}
                    onChange={() =>
                      setSettings((p) => ({ ...p, showAnnualPrice: !p.showAnnualPrice }))
                    }
                  />
                </label>
              </div>
            </section>

            {/* Custom actions */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">أزرار مخصصة</h2>
                <button
                  onClick={addCustom}
                  className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  + إضافة زر
                </button>
              </div>

              <div className="space-y-4">
                {(settings.custom || []).sort((a, b) => a.order - b.order).map((c) => (
                  <div key={c.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">#{c.order}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveCustom(c.id, -1)}
                          className="rounded-lg px-2 py-1 text-xs ring-1 ring-gray-200 hover:bg-gray-50"
                          title="أعلى"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveCustom(c.id, 1)}
                          className="rounded-lg px-2 py-1 text-xs ring-1 ring-gray-200 hover:bg-gray-50"
                          title="أسفل"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeCustom(c.id)}
                          className="rounded-lg px-2 py-1 text-xs text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">الاسم (AR)</label>
                        <input
                          className="w-full rounded-lg border border-gray-300 p-2"
                          value={c.labelAr}
                          onChange={(e) => updateCustom(c.id, { labelAr: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Name (EN)</label>
                        <input
                          className="w-full rounded-lg border border-gray-300 p-2"
                          value={c.labelEn}
                          onChange={(e) => updateCustom(c.id, { labelEn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">الأيقونة (اختياري)</label>
                        <input
                          className="w-full rounded-lg border border-gray-300 p-2"
                          value={c.icon || ""}
                          onChange={(e) => updateCustom(c.id, { icon: e.target.value })}
                          placeholder="MessageCircle, Phone, Sparkle..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">النوع</label>
                        <select
                          className="w-full rounded-lg border border-gray-300 p-2"
                          value={c.kind}
                          onChange={(e) =>
                            updateCustom(c.id, { kind: e.target.value as "link" | "modal" })
                          }
                        >
                          <option value="link">رابط خارجي</option>
                          <option value="modal">نافذة داخلية (Modal)</option>
                        </select>
                      </div>

                      {c.kind === "link" ? (
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs text-gray-500">الرابط (URL)</label>
                          <input
                            className="w-full rounded-lg border border-gray-300 p-2"
                            value={c.url || ""}
                            onChange={(e) => updateCustom(c.id, { url: e.target.value })}
                            placeholder="https://... or tel:+968..., whatsapp://send?phone=..."
                          />
                        </div>
                      ) : (
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs text-gray-500">معرّف النافذة (Modal ID)</label>
                          <input
                            className="w-full rounded-lg border border-gray-300 p-2"
                            value={c.modalId || ""}
                            onChange={(e) => updateCustom(c.id, { modalId: e.target.value })}
                            placeholder="pricing-modal, quick-form-modal ..."
                          />
                        </div>
                      )}

                      <label className="flex items-center justify-between rounded-xl border border-gray-200 p-2">
                        <span className="text-sm">مفعّل</span>
                        <input
                          type="checkbox"
                          className="h-5 w-5"
                          checked={c.enabled}
                          onChange={(e) => updateCustom(c.id, { enabled: e.target.checked })}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Appearance */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
              <h2 className="mb-3 text-lg font-semibold">المظهر</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="flex items-center justify-between rounded-xl border border-gray-200 p-2">
                  <span className="text-sm">حجم الأيقونة (px)</span>
                  <input
                    type="number"
                    className="w-24 rounded-lg border border-gray-300 p-2 text-end"
                    value={settings.iconSize || 18}
                    min={12}
                    max={48}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, iconSize: Number(e.target.value || 18) }))
                    }
                  />
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
