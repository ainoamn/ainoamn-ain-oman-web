// src/pages/dashboard/messages/index.tsx
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
// Layout handled by _app.tsx

type Thread = {
  id: string;
  propertyId: string;
  ownerId: string;
  clientId: string;
  participantsNames?: Record<string,string>;
  lastTs: string;
  lastText: string;
};
type Message = { id:string; threadId:string; senderId:string; text:string; ts:string };

function getSession() {
  if (typeof window === "undefined") return null;
  const uid = localStorage.getItem("ao_uid");
  const name = localStorage.getItem("ao_name") || "مستخدم";
  const phone = localStorage.getItem("ao_phone") || "";
  if (!uid) return null;
  return { userId: uid, name, phone };
}

export default function MessagesDashboard() {
  const me = getSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [txt, setTxt] = useState("");

  useEffect(() => {
    if (!me) return;
    fetch(`/api/messages?userId=${encodeURIComponent(me.userId)}`)
      .then(r=>r.json())
      .then(d=> setThreads(Array.isArray(d?.threads)? d.threads: []));
  }, []);

  useEffect(() => {
    if (!active) return;
    fetch(`/api/messages?threadId=${encodeURIComponent(active.id)}`)
      .then(r=>r.json())
      .then(d => setMsgs(Array.isArray(d?.messages)? d.messages: []));
  }, [active]);

  const canChat = !!me;

  const send = async () => {
    if (!canChat || !active) return;
    const t = txt.trim(); if (!t) return;
    setTxt("");
    const r = await fetch(`/api/messages/${encodeURIComponent(active.id)}`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ senderId: me!.userId, text: t })
    });
    if (r.ok) {
      const d = await r.json();
      setMsgs(d?.messages || []);
    }
  };

  return (
    <>
      <Head><title>المراسلات | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">المراسلات</h1>

          {!me && <div className="mb-4 text-sm text-red-600">الرجاء تسجيل الدخول من صفحة <a href="/auth/login" className="underline">تسجيل الدخول</a>.</div>}

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
            <aside className="bg-white border rounded-xl overflow-hidden">
              <div className="p-3 border-b font-semibold">المحادثات</div>
              <div className="max-h-[70vh] overflow-y-auto">
                {threads.length===0 ? (
                  <div className="p-3 text-sm text-gray-500">لا توجد محادثات بعد.</div>
                ) : threads.map(th => (
                  <button key={th.id} onClick={()=>setActive(th)} className={`w-full text-right px-3 py-2 border-b hover:bg-gray-50 ${active?.id===th.id?"bg-gray-50":""}`}>
                    <div className="text-sm font-semibold"># {th.propertyId}</div>
                    <div className="text-xs text-gray-600 line-clamp-1">{th.lastText || "—"}</div>
                    <div className="text-[11px] text-gray-400">{new Date(th.lastTs).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </aside>

            <section className="bg-white border rounded-xl p-3 flex flex-col">
              {!active ? (
                <div className="text-sm text-gray-500">اختر محادثة من القائمة.</div>
              ) : (
                <>
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold">محادثة العقار #{active.propertyId}</div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {msgs.map(m=>(
                      <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-xl ${m.senderId===me?.userId ? "ms-auto bg-emerald-600 text-white" : "bg-gray-100"}`}>
                        <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                        <div className="text-[10px] opacity-70 mt-1">{new Date(m.ts).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input disabled={!canChat} value={txt} onChange={e=>setTxt(e.target.value)} className="border rounded-lg p-2 flex-1" placeholder={canChat?"اكتب رسالة…":"سجل الدخول أولًا"} />
                    <button onClick={send} disabled={!canChat} className="px-3 py-2 rounded-lg bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white disabled:opacity-50">إرسال</button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
