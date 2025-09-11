// src/pages/manage-messages/index.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

type Thread = { threadId:string; propertyId:string; withId:string; lastText:string; lastTs:string };
type Msg = { id:string; propertyId:string; fromId:string; toId:string; text:string; ts:string };

function currentUserId(){ // من localStorage
  if (typeof window==="undefined") return "guest";
  try{
    const raw = localStorage.getItem("ao_user");
    if (!raw) return "guest";
    const js = JSON.parse(raw);
    return js?.id || "guest";
  }catch{ return "guest"; }
}

export default function ManageMessages(){
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread|null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [txt, setTxt] = useState("");

  const uid = currentUserId();

  useEffect(()=>{
    fetch("/api/conversations", { headers: { "x-user-id": uid } })
      .then(r=>r.json()).then(d => setThreads(Array.isArray(d?.items)? d.items: []));
  }, [uid]);

  useEffect(()=>{
    if (!active) return setMsgs([]);
    fetch(`/api/messages?propertyId=${encodeURIComponent(active.propertyId)}`, { headers: { "x-user-id": uid } })
      .then(r=>r.json()).then(d => setMsgs(Array.isArray(d?.items)? d.items: []));
  }, [active, uid]);

  const send = async () => {
    const t = txt.trim(); if (!t || !active) return;
    setTxt("");
    const r = await fetch("/api/messages", {
      method:"POST",
      headers: { "Content-Type":"application/json", "x-user-id": uid },
      body: JSON.stringify({ propertyId: active.propertyId, text: t, toId: active.withId })
    });
    if (r.ok) {
      const js = await r.json();
      setMsgs(prev => [...prev, js.item]);
    }
  };

  return (
    <Layout>
      <Head><title>مراسلاتي | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">المراسلات</h1>
            <Link href="/manage-properties" className="text-sm underline">عودة للوحة العقارات</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="p-3 border-b font-semibold">المحادثات</div>
              <div className="max-h-[70vh] overflow-y-auto">
                {threads.length===0 ? <div className="p-3 text-sm text-gray-500">لا توجد محادثات.</div> : threads.map(t=>(
                  <button key={t.threadId} onClick={()=>setActive(t)} className={`w-full text-right p-3 border-b hover:bg-gray-50 ${active?.threadId===t.threadId?"bg-gray-50":""}`}>
                    <div className="text-sm font-semibold">عقار #{t.propertyId}</div>
                    <div className="text-xs text-gray-600 line-clamp-1">{t.lastText}</div>
                    <div className="text-[10px] text-gray-400">{new Date(t.lastTs).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-xl flex flex-col">
              <div className="p-3 border-b font-semibold">{active ? `عقار #${active.propertyId}` : "اختر محادثة"}</div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {msgs.map((m)=>(
                  <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-xl ${m.fromId===uid?"bg-emerald-600 text-white ms-auto":"bg-gray-100"}`}>
                    <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                    <div className="text-[10px] opacity-70 mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
                  </div>
                ))}
                {active && msgs.length===0 && <div className="text-sm text-gray-500">لا رسائل بعد.</div>}
              </div>
              <div className="p-3 border-t flex items-center gap-2">
                <input className="border rounded-lg p-2 flex-1" placeholder="اكتب رسالة…" value={txt} onChange={(e)=>setTxt(e.target.value)} />
                <button onClick={send} className="px-4 py-2 rounded-lg bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">إرسال</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
