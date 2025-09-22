import React from "react";

type Stage = { id: string; caseId: string; from?: string; to: string; at: string; note?: string; by?: string; voided?: boolean; voidReason?: string };
type Person = { id: string; name: string; subscriptionNo: string };
function CaseTimeline({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<Stage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [note, setNote] = React.useState("");
  const [at, setAt] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [people, setPeople] = React.useState<Map<string,string>>(new Map());

  const hdrs = { "Content-Type":"application/json","x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };

  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/legal/proceedings?caseId=${encodeURIComponent(caseId)}`, { headers: hdrs });
    const j = await r.json();
    if (r.ok) setItems(j.stages || []);
    setLoading(false);
  };
  React.useEffect(() => { if (caseId) load(); }, [caseId]);

  React.useEffect(()=>{
    (async ()=>{
      const map = new Map<string,string>();
      for (const k of ["LAWYER","CLIENT"]) {
        const r = await fetch(`/api/legal/directory?kind=${k}`, { headers: hdrs });
        const j: Person[] = await r.json();
        j.forEach(p => map.set(p.id, `${p.subscriptionNo} — ${p.name}`));
      }
      setPeople(map);
    })();
  },[]);

  const addNote = async () => {
    setBusy(true);
    const body: any = { kind: "stageAdd", caseId, note: note.trim() || undefined };
    if (at) body.at = new Date(at).toISOString();
    const r = await fetch("/api/legal/proceedings", { method: "POST", headers: hdrs, body: JSON.stringify(body) });
    setBusy(false);
    if (r.ok) { setNote(""); setAt(""); load(); } else alert("تعذر إضافة الحدث");
  };

  const save = async (id: string, patch: Partial<Stage>) => {
    const body: any = { kind: "stageUpdate", caseId, id };
    if (patch.note !== undefined) body.note = patch.note;
    if (patch.at !== undefined) body.at = patch.at;
    const r = await fetch("/api/legal/proceedings", { method: "POST", headers: hdrs, body: JSON.stringify(body) });
    if (!r.ok) alert("تعذر الحفظ"); else load();
  };

  const voidItem = async (id: string) => {
    const reason = prompt("سبب الشطب (إجباري):")?.trim();
    if (!reason) return;
    const r = await fetch("/api/legal/proceedings", { method: "POST", headers: hdrs, body: JSON.stringify({ kind: "stageVoid", caseId, id, reason }) });
    if (!r.ok) alert("تعذر الشطب"); else load();
  };

  if (loading) return <section className="p-4 border rounded">جاري التحميل…</section>;

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const z = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
  };

  return (
    <section className="p-4 border rounded">
      <h2 className="font-semibold mb-3">الخط الزمني للقضية</h2>

      <div className="bg-gray-50 p-3 rounded mb-4 grid md:grid-cols-3 gap-2">
        <input className="border rounded p-2" placeholder="ملاحظة" value={note} onChange={e=>setNote(e.target.value)} />
        <input className="border rounded p-2" type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} />
        <button className="px-4 py-2 rounded bg-black text-white disabled:opacity-60" disabled={busy} onClick={addNote}>
          {busy ? "يضيف..." : "إضافة حدث"}
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <div className="opacity-70 text-sm">لا أحداث بعد.</div>}
        {items.sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime()).map(s=>(
          <div key={s.id} className={`p-3 border rounded ${s.voided?"opacity-60":""}`}>
            <div className="flex justify-between items-center">
              <div className="text-sm">المرحلة: <b>{s.to}</b>{s.from ? <span className="opacity-70"> من {s.from}</span> : null}</div>
              <div className="text-xs opacity-70">{new Date(s.at).toLocaleString()}</div>
            </div>
            <div className="text-xs opacity-70 mt-1">المستخدم: {people.get(s.by||"") || s.by || "—"}</div>
            <div className="grid md:grid-cols-3 gap-2 mt-2">
              <input className="border rounded p-2 md:col-span-2" value={s.note || ""} onChange={e=>setItems(v=>v.map(x=>x.id===s.id?{...x, note:e.target.value}:x))}/>
              <input className="border rounded p-2" type="datetime-local" value={fmt(s.at)} onChange={e=>setItems(v=>v.map(x=>x.id===s.id?{...x, at:new Date(e.target.value).toISOString()}:x))}/>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 rounded border" onClick={()=>save(s.id, { note: s.note, at: s.at })}>حفظ</button>
              {!s.voided && <button className="px-3 py-1 rounded border" onClick={()=>voidItem(s.id)}>شطب</button>}
              {s.voided && <span className="text-xs">مشطوب: {s.voidReason}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
