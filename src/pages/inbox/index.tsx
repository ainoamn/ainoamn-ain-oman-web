// src/pages/inbox/index.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";

type Thread = { id:string; propertyId:string; ownerId:string; customerId:string; lastTs:number; lastText:string };
type Message = { id:string; conversationId:string; propertyId:string; from:string; to:string; text:string; ts:number };

function getUserIdClient(): string|null { try { return localStorage.getItem("ao_user_id"); } catch { return null; } }

export default function Inbox(){
  const uid = getUserIdClient();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread|null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [txt, setTxt] = useState("");

  useEffect(()=>{
    if (!uid) return;
    fetch(`/api/messages?threads=1`, { headers: { "x-user-id": uid }})
      .then(r=>r.json())
      .then(d=>setThreads(Array.isArray(d?.threads)? d.threads: []))
      .catch(()=>{});
  }, [uid]);

  useEffect(()=>{
    if (!uid || !active) return;
    fetch(`/api/messages?conversationId=${encodeURIComponent(active.id)}`, { headers: { "x-user-id": uid }})
      .then(r=>r.json()).then(d=>setMsgs(Array.isArray(d?.messages)? d.messages:[])).catch(()=>{});
  }, [uid, active?.id]);

  const send = async () => {
    if (!uid || !active) return;
    const t = txt.trim(); if (!t) return;
    setTxt("");
    const r = await fetch(`/api/messages`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-user-id": uid },
      body: JSON.stringify({ conversationId: active.id, propertyId: active.propertyId, text: t, toUserId: (uid===active.ownerId?active.customerId:active.ownerId) })
    });
    if (r.ok) {
      const d = await r.json();
      setMsgs(prev => [...prev, d.message]);
      // تحديث ملخّص الخيط
      setThreads(prev => prev.map(th => th.id===active.id ? { ...th, lastText: d.message.text, lastTs: d.message.ts } : th));
    }
  };

  return (
    <Layout>
      <Head><title>صندوق الوارد | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
          <aside className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-3 py-2 border-b font-semibold">المحادثات</div>
            <div className="max-h-[70vh] overflow-y-auto">
              {threads.map(t=>(
                <button key={t.id} onClick={()=>setActive(t)} className={`w-full text-right px-3 py-2 border-b hover:bg-gray-50 ${active?.id===t.id?"bg-gray-50":""}`}>
                  <div className="text-sm font-semibold">عقار #{t.propertyId}</div>
                  <div className="text-xs text-gray-600 line-clamp-1">{t.lastText || "—"}</div>
                  <div className="text-[10px] text-gray-400">{t.lastTs ? new Date(t.lastTs).toLocaleString() : ""}</div>
                </button>
              ))}
              {threads.length===0 && <div className="p-3 text-sm text-gray-500">لا توجد محادثات.</div>}
            </div>
          </aside>

          <section className="bg-white border rounded-2xl p-3 flex flex-col">
            {active ? (
              <>
                <div className="px-1 pb-2 border-b">
                  <div className="font-semibold">محادثة العقار #{active.propertyId}</div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 p-2">
                  {msgs.map(m=>(
                    <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-xl ${m.from===uid?"bg-emerald-600 text-white ms-auto":"bg-gray-100"}`}>
                      <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                      <div className="text-[10px] opacity-70 mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  {msgs.length===0 && <div className="text-sm text-gray-500">ابدأ المحادثة.</div>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input value={txt} onChange={e=>setTxt(e.target.value)} className="border rounded-lg p-2 flex-1" placeholder="اكتب رسالتك…" />
                  <button onClick={send} className="px-3 py-2 rounded-lg bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">إرسال</button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 p-6">اختر محادثة من القائمة.</div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}
