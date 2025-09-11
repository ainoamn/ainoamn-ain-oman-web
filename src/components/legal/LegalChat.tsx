import React from "react";

type Msg = { id:string; text:string; at:string; by:string; voided?:boolean; voidReason?:string };

export default function LegalChat({ caseId }: { caseId: string }) {
  const hdrs = { "Content-Type":"application/json","x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };
  const [items, setItems] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState("");

  const load = async () => { const r = await fetch(`/api/legal/messages?caseId=${caseId}`, { headers: hdrs }); const j = await r.json(); if (r.ok) setItems(j); };
  React.useEffect(()=>{ load(); }, [caseId]);

  const send = async () => {
    const t = text.trim(); if (!t) return;
    const r = await fetch("/api/legal/messages", { method: "POST", headers: hdrs, body: JSON.stringify({ action:"create", caseId, text:t }) });
    if (!r.ok) { alert("تعذر الإرسال"); return; }
    setText(""); load();
  };

  return (
    <section className="p-4 border rounded bg-white">
      <h3 className="font-semibold mb-3">المحادثة</h3>
      <div className="space-y-2 max-h-[320px] overflow-auto border rounded p-2 bg-gray-50">
        {items.filter(m=>!m.voided).map(m=>(
          <div key={m.id} className="bg-white p-2 rounded border">
            <div className="text-xs opacity-70">{new Date(m.at).toLocaleString()} — {m.by}</div>
            <div className="mt-1 text-sm whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}
        {items.length===0 && <div className="opacity-70 text-sm">لا رسائل.</div>}
      </div>
      <div className="flex gap-2 mt-2">
        <input className="border rounded p-2 flex-1" placeholder="اكتب رسالة..." value={text} onChange={e=>setText(e.target.value)} />
        <button className="px-4 py-2 rounded bg-black text-white" onClick={send}>إرسال</button>
      </div>
    </section>
  );
}
