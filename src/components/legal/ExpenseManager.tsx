import React from "react";

type Exp = { id:string; label:string; amount:number; at:string; voided?:boolean; voidReason?:string };

export default function ExpenseManager({ caseId }: { caseId: string }) {
  const hdrs = { "Content-Type":"application/json","x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };
  const [items, setItems] = React.useState<Exp[]>([]);
  const [label, setLabel] = React.useState("");
  const [amount, setAmount] = React.useState<number>(0);

  const load = async () => { const r = await fetch(`/api/legal/expenses?caseId=${caseId}`, { headers: hdrs }); const j = await r.json(); if (r.ok) setItems(j); };
  React.useEffect(()=>{ load(); }, [caseId]);

  const add = async () => {
    if (!label.trim() || amount<=0) { alert("أكمل البيانات"); return; }
    const r = await fetch("/api/legal/expenses", { method: "POST", headers: hdrs, body: JSON.stringify({ action:"add", caseId, label: label.trim(), amount }) });
    if (!r.ok) { alert("تعذر الإضافة"); return; }
    setLabel(""); setAmount(0); load();
  };

  return (
    <section className="p-4 border rounded bg-white">
      <h3 className="font-semibold mb-3">المصاريف</h3>
      <div className="grid md:grid-cols-3 gap-2 mb-3">
        <input className="border rounded p-2" placeholder="وصف" value={label} onChange={e=>setLabel(e.target.value)} />
        <input className="border rounded p-2" type="number" placeholder="المبلغ" value={Number.isFinite(amount)?amount:""} onChange={e=>setAmount(Number(e.target.value))} />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={add}>إضافة</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">التاريخ</th><th>الوصف</th><th>المبلغ</th></tr></thead>
          <tbody>
            {items.filter(x=>!x.voided).map(x=>(
              <tr key={x.id} className="border-b last:border-b-0">
                <td className="py-2">{new Date(x.at).toLocaleString()}</td>
                <td>{x.label}</td>
                <td>{x.amount.toFixed(2)}</td>
              </tr>
            ))}
            {items.length===0 && <tr><td colSpan={3} className="py-3 text-center opacity-70">لا مصاريف</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
