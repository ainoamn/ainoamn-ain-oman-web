/**
 * TaskInvitePanel
 * إرسال دعوة بالمشاركة في المهمة عبر البريد/الواتساب باستخدام لوحة الإشعارات.
 * يتوقع وجود قوالب باسم task_invite (email/whatsapp) في /admin/notifications.
 */
import { useState } from "react";

async function postInvite(taskId: string, emails: string[], phones: string[], message?: string) {
  const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails, phones, message }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || "فشل إرسال الدعوات");
  }
}

export default function TaskInvitePanel({ taskId, onDone }: { taskId: string; onDone?: () => void }) {
  const [emails, setEmails] = useState("");
  const [phones, setPhones] = useState("");
  const [message, setMessage] = useState("تمت دعوتك للمشاركة في مهمة.");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    try {
      setBusy(true); setMsg(null);
      const eList = emails.split(/[,\s;]+/).map(s => s.trim()).filter(Boolean);
      const pList = phones.split(/[,\s;]+/).map(s => s.trim()).filter(Boolean);
      await postInvite(taskId, eList, pList, message);
      setMsg("تم إرسال الدعوات.");
      onDone?.();
    } catch (e: any) {
      setMsg(e?.message || "تعذر الإرسال");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="text-sm text-gray-600">إرسال دعوات للمشاركة</div>
      <input className="w-full rounded-lg border border-gray-300 p-2" placeholder="بريد إلكتروني (مفصول بفواصل)" value={emails} onChange={(e)=>setEmails(e.target.value)} />
      <input className="w-full rounded-lg border border-gray-300 p-2" placeholder="أرقام واتساب (E.164 مثل +9689xxxxxxx، مفصول بفواصل)" value={phones} onChange={(e)=>setPhones(e.target.value)} />
      <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={3} placeholder="رسالة قصيرة (اختياري)" value={message} onChange={(e)=>setMessage(e.target.value)} />
      <div className="flex items-center gap-2">
        <button onClick={submit} disabled={busy} className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60">
          {busy ? "جارٍ الإرسال…" : "إرسال الدعوات"}
        </button>
        {msg && <div className="text-xs text-gray-600">{msg}</div>}
      </div>
    </div>
  );
}
