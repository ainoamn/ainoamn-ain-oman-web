import React from "react";

type Kind = "LAWYER"|"CLIENT";
type Person = { id: string; subscriptionNo: string; name: string; phoneNumbers?: string[]; emails?: string[] };
function DirectoryManager() {
  const [kind, setKind] = React.useState<Kind>("LAWYER");
  const [list, setList] = React.useState<Person[]>([]);
  const [form, setForm] = React.useState<Person>({ id:"", subscriptionNo:"", name:"", phoneNumbers: [""], emails:[""] });
  const [busy, setBusy] = React.useState(false);
  const hdrs = { "Content-Type":"application/json", "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };

  const load = async () => { const r = await fetch(`/api/legal/directory?kind=${kind}`, { headers: hdrs }); const j = await r.json(); if (r.ok) setList(j); };
  React.useEffect(()=>{ load(); }, [kind]);

  const setPhone = (i:number, v:string)=> setForm(f=>({ ...f, phoneNumbers: (f.phoneNumbers||[]).map((x,idx)=> idx===i?v:x) }));
  const addPhone = ()=> setForm(f=>({ ...f, phoneNumbers: [...(f.phoneNumbers||[]), ""] }));
  const setEmail = (i:number, v:string)=> setForm(f=>({ ...f, emails: (f.emails||[]).map((x,idx)=> idx===i?v:x) }));
  const addEmail = ()=> setForm(f=>({ ...f, emails: [...(f.emails||[]), ""] }));

  const save = async () => {
    if (!form.subscriptionNo || !form.name) { alert("رقم الاشتراك والاسم إجباريان"); return; }
    const goodPhones = (form.phoneNumbers||[]).filter(Boolean).every(p=>/^[0-9+\-\s]{6,}$/.test(p));
    if (!goodPhones) { alert("أدخل أرقام هواتف صحيحة"); return; }
    setBusy(true);
    const r = await fetch(`/api/legal/directory?kind=${kind}`, { method: "POST", headers: hdrs, body: JSON.stringify({ action:"upsert", ...form }) });
    setBusy(false);
    if (!r.ok) alert("تعذر الحفظ"); else { setForm({ id:"", subscriptionNo:"", name:"", phoneNumbers:[""], emails:[""] }); load(); }
  };

  const edit = (p: Person) => setForm({ id: p.id, subscriptionNo: p.subscriptionNo, name: p.name, phoneNumbers: p.phoneNumbers||[""], emails: p.emails||[""] });

  return (
    <section className="p-4 border rounded bg-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">إدارة المحامين/العملاء</h2>
        <select className="border rounded p-2" value={kind} onChange={e=>setKind(e.target.value as Kind)}>
          <option value="LAWYER">محامون</option>
          <option value="CLIENT">عملاء</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-3 border rounded">
          <div className="grid gap-2">
            <input className="border rounded p-2" placeholder="رقم الاشتراك" value={form.subscriptionNo} onChange={e=>setForm(f=>({...f, subscriptionNo:e.target.value}))}/>
            <input className="border rounded p-2" placeholder="الاسم" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/>
            <div>
              <div className="font-medium text-sm mb-1">أرقام الهواتف</div>
              {(form.phoneNumbers||[]).map((p,i)=>(
                <input key={i} className="border rounded p-2 w-full mb-1" placeholder="+968 9xxxxxxx" value={p} onChange={e=>setPhone(i,e.target.value)}/>
              ))}
              <button className="text-sm underline" onClick={addPhone}>إضافة رقم</button>
            </div>
            <div>
              <div className="font-medium text-sm mb-1">الإيميلات</div>
              {(form.emails||[]).map((p,i)=>(
                <input key={i} className="border rounded p-2 w-full mb-1" placeholder="example@domain.com" value={p} onChange={e=>setEmail(i,e.target.value)}/>
              ))}
              <button className="text-sm underline" onClick={addEmail}>إضافة بريد</button>
            </div>
            <div className="text-right">
              <button className="px-4 py-2 rounded bg-black text-white disabled:opacity-60" disabled={busy} onClick={save}>
                {busy ? "يحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 border rounded overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="py-2">الرقم</th><th>الاسم</th><th>هواتف</th><th>إيميلات</th><th></th></tr></thead>
            <tbody>
              {list.map(p=>(
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="py-2">{p.subscriptionNo}</td>
                  <td>{p.name}</td>
                  <td>{(p.phoneNumbers||[]).join(" , ")}</td>
                  <td>{(p.emails||[]).join(" , ")}</td>
                  <td><button className="px-3 py-1 rounded border" onClick={()=>edit(p)}>تعديل</button></td>
                </tr>
              ))}
              {list.length===0 && <tr><td colSpan={5} className="py-3 text-center opacity-70">لا بيانات</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
