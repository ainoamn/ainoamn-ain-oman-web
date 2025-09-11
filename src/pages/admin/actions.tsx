// src/pages/admin/actions.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type ActionId = "chat_owner" | "chat_admin" | "book_visit" | "negotiate" | "book_unit" | "link";
type ActionDef = { id: string; label: string; visible: boolean; order: number; action: ActionId; href?: string };

const ACTION_OPTIONS: ActionId[] = ["chat_owner", "chat_admin", "book_visit", "negotiate", "book_unit", "link"];
const ALLOWED_ROLES = ["admin", "manager", "owner", "superadmin"];

export default function AdminActionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ActionDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // حارس عميل: اسمح بالدخول إن كان المستخدم مسجل دخول عبر النظام العام
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        // جرّب API الجلسة
        const r = await fetch(process.env.NEXT_PUBLIC_AUTH_ME_ENDPOINT || "/api/auth/me", {
          credentials: "include",
        });
        if (r.ok) {
          const d = await r.json();
          const role =
            d?.user?.role ||
            d?.user?.type ||
            (d?.user?.isAdmin ? "admin" : undefined);
          const ok = role && ALLOWED_ROLES.includes(String(role).toLowerCase());
          if (ok) {
            if (!cancelled) setAuthChecked(true);
            return;
          }
        }
      } catch {
        // تجاهل
      }

      // محاولة احتياطية: قراءة رمز محلي إن كان تطبيقك يخزّن جلسة في localStorage
      try {
        const ls = typeof window !== "undefined"
          ? (localStorage.getItem("ain_auth") || localStorage.getItem("auth_token"))
          : null;
        if (ls) {
          const u = JSON.parse(ls);
          const role =
            u?.user?.role ||
            u?.role ||
            (u?.isAdmin ? "admin" : undefined);
          if (role && ALLOWED_ROLES.includes(String(role).toLowerCase())) {
            if (!cancelled) setAuthChecked(true);
            return;
          }
        }
      } catch {
        // تجاهل
      }

      // غير مصرح -> أعد للتسجيل عبر /login
      if (!cancelled) {
        const ret = router.asPath || "/admin/actions";
        router.replace(`/login?return=${encodeURIComponent(ret)}`);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // حمّل البيانات فقط بعد اجتياز الحارس
  useEffect(() => {
    if (!authChecked) return;
    setLoading(true);
    fetch("/api/ui/actions")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d?.items) ? d.items : []))
      .finally(() => setLoading(false));
  }, [authChecked]);

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, label: "زر مخصص", visible: true, order: prev.length + 1, action: "link", href: "https://example.com" },
    ]);
  };

  const update = (idx: number, patch: Partial<ActionDef>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/ui/actions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!r.ok) alert("فشل حفظ التغييرات");
      else alert("تم الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("إرجاع الإعدادات الافتراضية؟")) return;
    await fetch("/api/ui/actions", { method: "POST" });
    const r = await fetch("/api/ui/actions");
    const d = await r.json();
    setItems(d?.items || []);
  };

  // شاشة انتظار أثناء تحقق الحارس أو تحميل البيانات
  if (!authChecked) {
    return (
      <Layout>
        <Head><title>إدارة الأزرار | لوحة التحكم</title></Head>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-sm text-gray-600">جارٍ التحقق من الصلاحيات…</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>إدارة الأزرار | لوحة التحكم</title></Head>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-3">إدارة الأزرار (تفاصيل العقار)</h1>

        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : (
          <>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-right">#</th>
                    <th className="p-2 text-right">المعرف</th>
                    <th className="p-2 text-right">النص</th>
                    <th className="p-2 text-right">نوع الفعل</th>
                    <th className="p-2 text-right">رابط (للنوع link)</th>
                    <th className="p-2 text-right">ترتيب</th>
                    <th className="p-2 text-right">ظهور</th>
                    <th className="p-2 text-right">حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {items.sort((a, b) => a.order - b.order).map((it, idx) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">
                        <input className="border rounded p-1 w-40" value={it.id} onChange={(e) => update(idx, { id: e.target.value })} />
                      </td>
                      <td className="p-2">
                        <input className="border rounded p-1 w-40" value={it.label} onChange={(e) => update(idx, { label: e.target.value })} />
                      </td>
                      <td className="p-2">
                        <select className="border rounded p-1" value={it.action} onChange={(e) => update(idx, { action: e.target.value as ActionId })}>
                          {ACTION_OPTIONS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input className="border rounded p-1 w-56" value={it.href ?? ""} onChange={(e) => update(idx, { href: e.target.value })} placeholder="https://..." />
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          className="border rounded p-1 w-20"
                          value={it.order}
                          onChange={(e) => update(idx, { order: e.target.value ? +e.target.value : it.order })}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input type="checkbox" checked={it.visible} onChange={(e) => update(idx, { visible: e.target.checked })} />
                      </td>
                      <td className="p-2">
                        <button className="text-red-600 underline" onClick={() => remove(idx)}>
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button onClick={addRow} className="px-3 py-2 rounded bg-gray-200">
                إضافة زر
              </button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">
                {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
              </button>
              <button onClick={reset} className="px-3 py-2 rounded bg-rose-100 text-rose-700">
                استرجاع الافتراضي
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

// بدون إعادة توجيه خادمي. السماح بالتحميل ثم التحقق عميلًا.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
