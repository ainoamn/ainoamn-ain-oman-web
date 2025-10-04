import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Booking = {
  id: string;
  propertyId?: string;
  unitId?: string;
  status?: string;
  amount?: number | string;
  total?: number | string;
  totalAmount?: number | string;
  createdAt?: string;
  customerInfo?: { name?: string; phone?: string; email?: string };
  meta?: Record<string, any>;
  [k: string]: any;
};
type PropertyLite = {
  id: string;
  title?: string | { ar?: string; en?: string };
  referenceNo?: string;
  images?: string[];
  coverIndex?: number;
  [k: string]: any;
};

const fmtAmount = (v: unknown) => {
  const n = Number.parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? n.toFixed(3) : "0.000";
};
const fmtDate = (v: unknown) => {
  const d = v ? new Date(String(v)) : new Date();
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("ar-OM");
};

async function safeJson<T = any>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(await r.text().catch(() => `${r.status} ${r.statusText}`));
  return r.json();
}
async function fetchArray(url: string): Promise<any[]> {
  const r = await fetch(url, { cache: "no-store", credentials: "include" });
  const j = await safeJson<any>(r);
  if (Array.isArray(j)) return j;
  if (Array.isArray(j?.items)) return j.items;
  if (Array.isArray(j?.data)) return j.data;
  return [];
}

export default function BookingsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Booking | null>(null);
  const [prop, setProp] = useState<PropertyLite | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      // 1) APIك الأصلي
      let arr = await fetchArray(`/api/bookings`).catch(()=>[]);
      if (!arr.length) arr = await fetchArray(`/api/reservations`).catch(()=>[]);
      // 2) دمج مع طبقة التوافق
      const compat = await fetchArray(`/api/_compat/bookings/list`).catch(()=>[]);
      const map = new Map<string, any>();
      for (const b of arr) map.set(String(b.id ?? b.bookingId ?? ""), b);
      for (const b of compat) {
        const id = String(b.id ?? b.bookingId ?? "");
        if (!id) continue;
        const prev = map.get(id) || {};
        map.set(id, { ...prev, ...b });
      }
      const list = Array.from(map.values());
      const norm: Booking[] = list.map((b: any) => ({
        id: String(b.id ?? b.bookingId ?? `${Date.now()}`),
        propertyId: b.propertyId ?? b.property_id ?? "-",
        unitId: b.unitId,
        status: b.status ?? b.state ?? "pending",
        amount: b.amount ?? b.totalAmount ?? b.total ?? 0,
        total: b.total ?? b.totalAmount ?? b.amount ?? 0,
        totalAmount: b.totalAmount ?? b.total ?? b.amount ?? 0,
        createdAt: b.createdAt ?? b.created_at ?? b.date ?? new Date().toISOString(),
        customerInfo: b.customerInfo ?? b.customer ?? { name: b.name, phone: b.phone, email: b.email },
        meta: b.meta ?? {},
        ...b,
      }));
      setItems(norm);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  async function openDetails(b: Booking) {
    setSel({ ...b }); setProp(null);
    try {
      const r = await fetch(`/api/bookings/${encodeURIComponent(b.id)}`, { cache: "no-store", credentials: "include" });
      if (r.ok) {
        const j = await r.json();
        const it = (j?.item || j) as any;
        setSel((prev) => ({ ...(prev || {}), ...it, totalAmount: it.totalAmount ?? it.total ?? it.amount ?? (prev?.totalAmount ?? 0) }));
      }
    } catch {}
    try {
      const pid = String(b.propertyId || ""); if (!pid) return;
      let pr: any = null;
      let rr = await fetch(`/api/properties/${encodeURIComponent(pid)}`, { cache: "no-store", credentials: "include" });
      if (rr.ok) pr = (await rr.json())?.item;
      if (!pr) {
        rr = await fetch(`/api/property/properties/${encodeURIComponent(pid)}`, { cache: "no-store", credentials: "include" });
        if (rr.ok) pr = (await rr.json())?.item;
      }
      if (pr) setProp(pr);
    } catch {}
  }

  async function updateStatus(id: string, status: string) {
    setBusy(true);
    try {
      const propertyId = String(sel?.propertyId || items.find(i => i.id === id)?.propertyId || "");
      const body = JSON.stringify({ id, status, propertyId });

      // 1) APIك الأصلي
      let r = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body,
      });
      if (!r.ok) {
        r = await fetch(`/api/reservations/${encodeURIComponent(id)}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body,
        });
      }
      // 2) توافق إذا فشل الأصلي
      if (!r.ok) {
        r = await fetch(`/api/_compat/bookings/update`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body,
        });
      }
      if (!r.ok) throw new Error(await r.text().catch(()=>"تعذر تحديث الحالة"));

      // كتابة متفائلة بالحالة في الواجهة فورًا
      setItems(list => list.map(b => b.id === id ? { ...b, status } : b));
      if (sel?.id === id) setSel(s => s ? { ...s, status } : s);

      // عكس الحالة على سجل العقار في طبقة التوافق
      if (propertyId) {
        fetch(`/api/_compat/properties/reflect-booking`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({ propertyId, status }),
        }).catch(()=>{});
      }

      alert("تم تحديث حالة الحجز");
    } catch (e: any) { alert(e?.message || "فشل التحديث"); }
    finally { setBusy(false); }
  }

  // إنشاء مهمة عبر النموذج
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<{ title: string; type: string; assignee: string; dueDate: string; description: string }>({
    title: "", type: "booking_followup", assignee: "", dueDate: "", description: ""
  });
  function openTaskModal(b: Booking) {
    if (!b?.propertyId) return alert("لا يوجد propertyId لهذا الحجز");
    setTaskForm({
      title: `متابعة حجز #${b.id}`, type: "booking_followup", assignee: "", dueDate: "",
      description: `حجز مرتبط بالعقار ${b.propertyId} بقيمة ${fmtAmount(b.totalAmount ?? b.total ?? b.amount)} ر.ع`,
    });
    setTaskOpen(true); setSel(b);
  }
  async function submitTask() {
    if (!sel?.propertyId) return alert("لا يوجد propertyId");
    
    const payload = {
      title: taskForm.title, 
      status: "open", 
      type: taskForm.type,
      assignee: taskForm.assignee || undefined, 
      dueDate: taskForm.dueDate || undefined,
      description: taskForm.description || undefined, 
      propertyId: String(sel.propertyId), 
      bookingId: sel.id,
      priority: "medium"
    };
    
    try {
      console.log("Creating task from booking:", payload);
      
      // استخدام API المبسط
      let response = await fetch("/api/tasks/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      // إذا فشل API المبسط، جرب API الأساسي
      if (!response.ok) {
        console.log("Simple API failed, trying basic API...");
        response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log("Task created successfully:", data);
        
        setTaskOpen(false);
        alert("تم إنشاء المهمة بنجاح");
        
        // الانتقال إلى صفحة المهام المتوافقة
        router.push(`/tasks/compat?propertyId=${encodeURIComponent(String(sel.propertyId))}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل في إنشاء المهمة");
      }
    } catch (e: any) {
      console.error("Error creating task:", e);
      alert(e?.message || "تعذر إنشاء المهمة");
    }
  }

  useEffect(() => { load(); }, []);

  const rows = useMemo(() =>
    items.map((b) => (
      <tr key={b.id} className="border-t">
        <td className="p-3 font-mono">{b.id}</td>
        <td className="p-3">
          {b.propertyId ? (
            <Link className="underline" href={`/properties/${encodeURIComponent(String(b.propertyId))}`}>{b.propertyId}</Link>
          ) : ("-")}
        </td>
        <td className="p-3">{fmtAmount(b.amount ?? b.totalAmount ?? b.total)} ر.ع</td>
        <td className="p-3">{b.status || "-"}</td>
        <td className="p-3">
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border" onClick={() => openDetails(b)}>التفاصيل</button>
            <button className="px-3 py-1 rounded border" disabled={busy} onClick={() => updateStatus(b.id, "confirmed")}>تأكيد</button>
            <button className="px-3 py-1 rounded border" disabled={busy} onClick={() => updateStatus(b.id, "cancelled")}>إلغاء</button>
            <button className="px-3 py-1 rounded border" disabled={busy} onClick={() => openTaskModal(b)}>إحالة لمهمة</button>
          </div>
        </td>
      </tr>
    ))
  , [items, busy]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-bold mb-4">الحجوزات</h1>
        <div className="mb-4 text-sm text-slate-500">عدد السجلات: {items.length}</div>

        <div className="overflow-x-auto rounded-xl shadow bg-white">
          <table className="w-full text-right">
            <thead>
              <tr className="text-right text-sm text-slate-500">
                <th className="p-3">المعرف</th><th className="p-3">العقار</th><th className="p-3">المبلغ</th><th className="p-3">الحالة</th><th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
            {items.length === 0 && !loading && (
              <tbody><tr><td className="p-3 text-slate-500" colSpan={5}>لا توجد حجوزات.</td></tr></tbody>
            )}
          </table>
          {loading && <div className="p-4">جار التحميل…</div>}
        </div>

        {/* نموذج إنشاء المهمة */}
        {taskOpen && sel && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">إحالة الحجز #{sel.id} إلى مهمة</h2>
                <button className="px-3 py-1 rounded border" onClick={() => setTaskOpen(false)}>إغلاق</button>
              </div>
              <div className="p-4 space-y-3">
                <label className="block">
                  <span className="text-sm">عنوان المهمة</span>
                  <input className="mt-1 w-full rounded border p-2" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-sm">النوع</span>
                  <input className="mt-1 w-full rounded border p-2" value={taskForm.type} onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })} placeholder="booking_followup أو general" />
                </label>
                <label className="block">
                  <span className="text-sm">المحال إليه</span>
                  <input className="mt-1 w-full rounded border p-2" value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })} placeholder="user id / name" />
                </label>
                <label className="block">
                  <span className="text-sm">تاريخ الاستحقاق</span>
                  <input type="date" className="mt-1 w-full rounded border p-2" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-sm">الوصف</span>
                  <textarea className="mt-1 w-full rounded border p-2" rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                </label>
              </div>
              <div className="p-4 border-t text-right">
                <button className="px-4 py-2 rounded border mr-2" onClick={() => setTaskOpen(false)}>إلغاء</button>
                <button className="px-4 py-2 rounded border bg-gray-50" disabled={busy} onClick={submitTask}>إنشاء المهمة</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
