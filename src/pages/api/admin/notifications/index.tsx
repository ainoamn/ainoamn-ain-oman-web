/**
 * Admin UI: Notifications Center
 * Path: /admin/notifications
 * Location: src/pages/admin/notifications/index.tsx
 *
 * Features:
 * - Manage templates (email/whatsapp)
 * - Send test message with {{placeholders}}
 * - View/clear send log (paginated)
 */
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type {
  NotificationTemplate,
  NotificationChannel,
  TemplateVariable,
  SendRequest,
  PaginatedLogs,
} from "@/types/notifications";
import {
  getTemplates,
  saveTemplates,
  sendTest,
  getLog,
  clearLog,
} from "@/lib/notificationsClient";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function NotificationsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Send test
  const [selTpl, setSelTpl] = useState<string>("");
  const [to, setTo] = useState("");
  const [dataJson, setDataJson] = useState('{"customer":"عبد الحميد"}');
  const [sending, setSending] = useState(false);

  // Logs
  const [logs, setLogs] = useState<PaginatedLogs | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const t = await getTemplates();
        setTemplates(t);
        setSelTpl(t[0]?.id || "");
      } catch (e: any) {
        setErr(e?.message || "تعذر تحميل القوالب");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const l = await getLog(page, pageSize);
        setLogs(l);
      } catch (e) {}
    })();
  }, [page]);

  const addTemplate = (channel: NotificationChannel) => {
    const t: NotificationTemplate = {
      id: uuid(),
      channel,
      name: channel === "email" ? "custom_email" : "custom_whatsapp",
      enabled: true,
      subject: channel === "email" ? "موضوع الرسالة" : undefined,
      body: "مرحباً {{customer}}، هذا قالب جديد",
      variables: [{ name: "customer", example: "عبد الحميد", required: true }],
      updatedAt: new Date().toISOString(),
      description: "قالب مُنشأ من الواجهة",
      lang: "ar",
    };
    setTemplates((p) => [t, ...p]);
  };

  const removeTemplate = (id: string) => {
    setTemplates((p) => p.filter((x) => x.id !== id));
  };

  const updateTemplate = (id: string, patch: Partial<NotificationTemplate>) => {
    setTemplates((p) => p.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x)));
  };

  const addVariable = (id: string) => {
    setTemplates((p) =>
      p.map((x) =>
        x.id === id
          ? {
              ...x,
              variables: [...(x.variables || []), { name: "varName", example: "", required: false }],
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );
  };

  const removeVariable = (id: string, idx: number) => {
    setTemplates((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, variables: (x.variables || []).filter((_, i) => i !== idx), updatedAt: new Date().toISOString() }
          : x
      )
    );
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setErr(null);
      await saveTemplates(templates);
    } catch (e: any) {
      setErr(e?.message || "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const doSend = async () => {
    try {
      setSending(true);
      setErr(null);
      const payload: SendRequest = {
        channel: (templates.find((t) => t.id === selTpl)?.channel || "email") as NotificationChannel,
        templateId: selTpl,
        to,
        data: JSON.parse(dataJson || "{}"),
      };
      await sendTest(payload);
      const l = await getLog(1, pageSize);
      setLogs(l);
      setPage(1);
    } catch (e: any) {
      setErr(e?.message || "فشل الإرسال");
    } finally {
      setSending(false);
    }
  };

  const totalTemplates = templates.length;
  const emailCount = useMemo(() => templates.filter((t) => t.channel === "email").length, [templates]);
  const whatsappCount = totalTemplates - emailCount;

  return (
    <Layout>
      <Head><title>لوحة الإشعارات</title></Head>
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة الإشعارات</h1>
            <p className="text-sm text-gray-500">قوالب البريد/الواتساب، إرسال اختباري، وسجل الإرسال.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => addTemplate("email")}
              className="rounded-xl px-3 py-1.5 text-sm font-semibold ring-1 ring-gray-200 hover:bg-gray-50">+ قالب بريد</button>
            <button onClick={() => addTemplate("whatsapp")}
              className="rounded-xl px-3 py-1.5 text-sm font-semibold ring-1 ring-gray-200 hover:bg-gray-50">+ قالب واتساب</button>
            <button onClick={saveAll} disabled={saving}
              className="rounded-xl px-4 py-2 font-semibold ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ القوالب"}
            </button>
          </div>
        </header>

        {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{err}</div>}

        {loading ? (
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">جارٍ التحميل…</div>
        ) : (
          <>
            {/* Templates */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">القوالب ({totalTemplates})</h2>
                <div className="text-xs text-gray-500">بريد: {emailCount} • واتساب: {whatsappCount}</div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">
                        {t.name} <span className="ml-2 text-xs text-gray-500">({t.channel})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={t.enabled}
                            onChange={(e) => updateTemplate(t.id, { enabled: e.target.checked })} />
                          مفعّل
                        </label>
                        <button onClick={() => removeTemplate(t.id)}
                          className="rounded-lg px-2 py-1 text-xs text-red-700 ring-1 ring-red-200 hover:bg-red-50">حذف</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">الاسم الداخلي</label>
                        <input className="w-full rounded-lg border border-gray-300 p-2" value={t.name}
                          onChange={(e) => updateTemplate(t.id, { name: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">اللغة</label>
                        <input className="w-full rounded-lg border border-gray-300 p-2" value={t.lang || ""}
                          onChange={(e) => updateTemplate(t.id, { lang: e.target.value })} placeholder="ar | en ..." />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-gray-500">الوصف</label>
                        <input className="w-full rounded-lg border border-gray-300 p-2" value={t.description || ""}
                          onChange={(e) => updateTemplate(t.id, { description: e.target.value })} />
                      </div>

                      {t.channel === "email" && (
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs text-gray-500">موضوع البريد</label>
                          <input className="w-full rounded-lg border border-gray-300 p-2" value={t.subject || ""}
                            onChange={(e) => updateTemplate(t.id, { subject: e.target.value })} />
                        </div>
                      )}

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs text-gray-500">النص (يدعم {{placeholders}})</label>
                        <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={5} value={t.body}
                          onChange={(e) => updateTemplate(t.id, { body: e.target.value })} />
                      </div>
                    </div>

                    {/* Variables */}
                    <div className="mt-3 rounded-xl border border-gray-100 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-semibold">المتغيرات</div>
                        <button onClick={() => addVariable(t.id)}
                          className="rounded-lg px-2 py-1 text-xs ring-1 ring-gray-200 hover:bg-gray-50">+ متغير</button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {(t.variables || []).map((v: TemplateVariable, i: number) => (
                          <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <input className="rounded-lg border border-gray-300 p-2" placeholder="name"
                              value={v.name} onChange={(e) => {
                                const vv = [...(t.variables || [])];
                                vv[i] = { ...vv[i], name: e.target.value };
                                updateTemplate(t.id, { variables: vv });
                              }} />
                            <input className="rounded-lg border border-gray-300 p-2" placeholder="example"
                              value={v.example || ""} onChange={(e) => {
                                const vv = [...(t.variables || [])];
                                vv[i] = { ...vv[i], example: e.target.value };
                                updateTemplate(t.id, { variables: vv });
                              }} />
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={!!v.required} onChange={(e) => {
                                  const vv = [...(t.variables || [])];
                                  vv[i] = { ...vv[i], required: e.target.checked };
                                  updateTemplate(t.id, { variables: vv });
                                }} />
                                مطلوب
                              </label>
                              <button onClick={() => removeVariable(t.id, i)}
                                className="rounded-lg px-2 py-1 text-xs text-red-700 ring-1 ring-red-200 hover:bg-red-50">حذف</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 text-right text-xs text-gray-500">آخر تعديل: {new Date(t.updatedAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Send test */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <h2 className="mb-3 text-lg font-semibold">إرسال اختباري</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">القالب</label>
                  <select className="w-full rounded-lg border border-gray-300 p-2" value={selTpl} onChange={(e) => setSelTpl(e.target.value)}>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">إلى</label>
                  <input className="w-full rounded-lg border border-gray-300 p-2" value={to} onChange={(e) => setTo(e.target.value)}
                    placeholder="email@example.com أو +9689xxxxxxx" />
                </div>
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-xs text-gray-500">بيانات JSON</label>
                  <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={5} value={dataJson} onChange={(e) => setDataJson(e.target.value)} />
                </div>
              </div>
              <div className="mt-3">
                <button onClick={doSend} disabled={sending}
                  className="rounded-xl px-4 py-2 font-semibold ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60">
                  {sending ? "جارٍ الإرسال..." : "إرسال"}
                </button>
              </div>
            </section>

            {/* Log */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">سجل الإرسال</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))}
                    className="rounded-lg px-2 py-1 text-xs ring-1 ring-gray-200 hover:bg-gray-50">‹</button>
                  <span className="text-xs text-gray-500">صفحة {page}</span>
                  <button onClick={() => setPage(page + 1)}
                    className="rounded-lg px-2 py-1 text-xs ring-1 ring-gray-200 hover:bg-gray-50">›</button>
                  <button onClick={async () => { await clearLog(); const l = await getLog(1, pageSize); setLogs(l); setPage(1); }}
                    className="rounded-lg px-2 py-1 text-xs text-red-700 ring-1 ring-red-200 hover:bg-red-50">مسح السجل</button>
                </div>
              </div>

              {!logs ? (
                <div className="text-sm text-gray-500">لا توجد بيانات.</div>
              ) : logs.items.length === 0 ? (
                <div className="text-sm text-gray-500">السجل فارغ.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">الوقت</th>
                        <th className="p-2 text-left">القناة</th>
                        <th className="p-2 text-left">إلى</th>
                        <th className="p-2 text-left">القالب</th>
                        <th className="p-2 text-left">الحالة</th>
                        <th className="p-2 text-left">معاينة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.items.map((it) => (
                        <tr key={it.id} className="border-b">
                          <td className="p-2">{new Date(it.ts).toLocaleString()}</td>
                          <td className="p-2">{it.channel}</td>
                          <td className="p-2">{it.to}</td>
                          <td className="p-2">{it.templateId}</td>
                          <td className="p-2">{it.status}</td>
                          <td className="p-2">{it.previewUrl || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 text-xs text-gray-500">
                    إجمالي: {logs.total} — ({logs.pageSize} في الصفحة)
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
