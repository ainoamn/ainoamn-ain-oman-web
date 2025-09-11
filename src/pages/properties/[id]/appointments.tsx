// src/pages/properties/[id]/appointments.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  note?: string;
  status: "pending" | "approved" | "canceled" | "rescheduled";
  createdAt: number;
  updatedAt?: number;
};

function Badge({ s }: { s: Appointment["status"] }) {
  const base = "px-2 py-1 rounded text-xs";
  if (s === "pending") return <span className={`${base} bg-amber-100 text-amber-800`}>بانتظار الاعتماد</span>;
  if (s === "approved") return <span className={`${base} bg-emerald-100 text-emerald-800`}>معتمد</span>;
  if (s === "canceled") return <span className={`${base} bg-rose-100 text-rose-800`}>ملغى</span>;
  return <span className={`${base} bg-sky-100 text-sky-800`}>أُعيدت جدولته</span>;
}

export default function PropertyAppointmentsPage() {
  const router = useRouter();
  const id = (router.query.id as string) || "";
  const invalidId = !id || id === "[id]";
  const { t, dir } = useI18n();

  const [role, setRole] = useState<"user" | "owner" | "admin">("user");
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openNew = useMemo(() => router.query.new === "1", [router.query.new]);

  const [editId, setEditId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function fetchList() {
    if (invalidId) {
      setLoading(false);
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // نرسل scope=all. السيرفر سيقيّد النتائج للمستخدم العادي تلقائيًا.
      const r = await fetch(`/api/properties/${encodeURIComponent(id)}/appointments?scope=all`);
      const ct = r.headers.get("content-type") || "";
      const txt = await r.text();
      const j = ct.includes("application/json")
        ? JSON.parse(txt)
        : { error: "non_json", detail: txt.slice(0, 200) };
      if (!r.ok) throw new Error(j.detail || j.error || `HTTP ${r.status}`);
      setRole(j.role);
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch (e: any) {
      setError(e?.message || "fetch_failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const createNew = async () => {
    if (!name || !phone || !date || !time) {
      alert("يرجى تعبئة الاسم والهاتف والتاريخ والوقت");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/properties/${encodeURIComponent(id)}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, date, time, note }),
      });
      const ct = r.headers.get("content-type") || "";
      const txt = await r.text();
      const j = ct.includes("application/json")
        ? JSON.parse(txt)
        : { error: "non_json", detail: txt.slice(0, 200) };
      if (!r.ok) throw new Error(j.detail || j.error || `HTTP ${r.status}`);
      setName("");
      setPhone("");
      setDate("");
      setTime("");
      setNote("");
      await fetchList();
      alert("تم إرسال طلب الموعد.");
    } catch (e: any) {
      alert(e?.message || "فشل إنشاء الموعد");
    } finally {
      setBusy(false);
    }
  };

  const patch = async (appointmentId: string, body: any) => {
    const r = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const ct = r.headers.get("content-type") || "";
    const txt = await r.text();
    const j = ct.includes("application/json")
      ? JSON.parse(txt)
      : { error: "non_json", detail: txt.slice(0, 200) };
    if (!r.ok) throw new Error(j.detail || j.error || `HTTP ${r.status}`);
    return j.item as Appointment;
  };

  const approve = async (row: Appointment) => {
    try {
      await patch(row.id, { action: "approve" });
      await fetchList();
    } catch (e: any) {
      alert(e?.message || "فشل الاعتماد");
    }
  };

  const cancel = async (row: Appointment) => {
    if (!confirm("تأكيد إلغاء الموعد؟")) return;
    try {
      await patch(row.id, { action: "cancel" });
      await fetchList();
    } catch (e: any) {
      alert(e?.message || "فشل الإلغاء");
    }
  };

  const startReschedule = (row: Appointment) => {
    setEditId(row.id);
    setEditDate(row.date);
    setEditTime(row.time);
  };

  const saveReschedule = async () => {
    if (!editId || !editDate || !editTime) {
      alert("أدخل التاريخ والوقت");
      return;
    }
    try {
      await patch(editId, { action: "reschedule", date: editDate, time: editTime });
      setEditId(null);
      await fetchList();
    } catch (e: any) {
      alert(e?.message || "فشل إعادة الجدولة");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={dir}>
      <Head>
        <title>{t("property.appointments.title", "مواعيد المعاينة")} | Ain Oman</title>
      </Head>

      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="text-sm text-slate-500 mb-6">
            <Link className="hover:underline" href="/properties">
              {t("nav.properties", "العقارات")}
            </Link>
            <span className="mx-2">/</span>
            <Link className="hover:underline" href={`/properties/${id || ""}`}>
              {t("nav.property", "العقار")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">{t("property.appointments", "المواعيد")}</span>
          </nav>

          {invalidId && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              الرابط غير صحيح. افتح: <b>/properties/رقم_العقار/appointments</b> مثلاً:
              <Link className="ms-2 underline" href="/properties/1757499789743/appointments?new=1">
                /properties/1757499789743/appointments
              </Link>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">{t("appointments.new", "طلب موعد جديد للمعاينة")}</div>
              <div className="text-xs text-slate-500">
                الدور: <b>{role}</b>
              </div>
            </div>

            {openNew && <div className="text-xs text-slate-500 mb-3">تم فتح النموذج تلقائيًا حسب الرابط.</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="mb-1 text-slate-600">{t("field.name", "الاسم")}</div>
                <input className="border rounded p-2 w-full" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="text-sm">
                <div className="mb-1 text-slate-600">{t("field.phone", "رقم الهاتف")}</div>
                <input
                  className="border rounded p-2 w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9689xxxxxxx"
                />
              </label>
              <label className="text-sm">
                <div className="mb-1 text-slate-600">{t("field.date", "التاريخ")}</div>
                <input type="date" className="border rounded p-2 w-full" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="text-sm">
                <div className="mb-1 text-slate-600">{t("field.time", "الوقت")}</div>
                <input type="time" className="border rounded p-2 w-full" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
            <label className="text-sm block mt-3">
              <div className="mb-1 text-slate-600">{t("field.note", "ملاحظات")}</div>
              <textarea className="border rounded p-2 w-full" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <div className="mt-3">
              <button
                onClick={createNew}
                disabled={busy || invalidId}
                className="px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white disabled:opacity-50"
              >
                {busy ? t("sending", "جارٍ الإرسال") : t("submit.request", "إرسال الطلب")}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 mt-2">* القراءة والكتابة عبر API موحدة. لا يعتمد على localStorage.</div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 overflow-auto">
            <div className="font-semibold mb-4">{t("appointments.list", "قائمة المواعيد")}</div>

            {loading ? (
              <div className="text-slate-500">جارٍ التحميل…</div>
            ) : error ? (
              <div className="text-rose-600">{error}</div>
            ) : invalidId ? (
              <div className="text-slate-500">أدخل معرف عقار صالح لعرض المواعيد.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-start">#</th>
                    <th className="px-3 py-2 text-start">{t("appointments.visitor", "الزائر")}</th>
                    <th className="px-3 py-2 text-start">{t("appointments.phone", "الهاتف")}</th>
                    <th className="px-3 py-2 text-start">{t("appointments.datetime", "التاريخ والوقت")}</th>
                    <th className="px-3 py-2 text-start">{t("appointments.status", "الحالة")}</th>
                    <th className="px-3 py-2 text-start">{t("actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                        {t("appointments.empty", "لا توجد مواعيد بعد.")}
                      </td>
                    </tr>
                  ) : (
                    items.map((row, i) => {
                      const isEditing = editId === row.id;
                      const isManager = role === "admin" || role === "owner";
                      return (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="px-3 py-2">{i + 1}</td>
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.phone}</td>
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  type="date"
                                  className="border rounded p-1"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                />
                                <input
                                  type="time"
                                  className="border rounded p-1"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                />
                              </div>
                            ) : (
                              `${row.date} ${row.time}`
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <Badge s={row.status} />
                          </td>
                          <td className="px-3 py-2">
                            {isEditing ? (
                              <div className="flex flex-wrap gap-2">
                                <button onClick={saveReschedule} className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white">
                                  حفظ
                                </button>
                                <button onClick={() => setEditId(null)} className="px-3 py-1 rounded border">
                                  إلغاء
                                </button>
                              </div>
                            ) : isManager ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => {
                                    patch(row.id, { action: "approve" })
                                      .then(fetchList)
                                      .catch((e) => alert(e?.message || "فشل الاعتماد"));
                                  }}
                                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                                  disabled={row.status === "approved"}
                                >
                                  اعتماد
                                </button>
                                <button
                                  onClick={() => startReschedule(row)}
                                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white"
                                >
                                  تعديل الموعد
                                </button>
                                <button
                                  onClick={() => cancel(row)}
                                  className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => cancel(row)}
                                  className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white"
                                  disabled={row.status === "canceled"}
                                >
                                  إلغاء
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
