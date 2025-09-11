import React from "react";

type Props = { onFilter: (f: { q?: string; status?: string; lawyerId?: string; clientId?: string; from?: string; to?: string; }) => void; lawyers: { id:string; subscriptionNo:string; name:string }[]; clients: { id:string; subscriptionNo:string; name:string }[]; };

export default function AdvancedSearch({ onFilter, lawyers, clients }: Props) {
  const [q, setQ] = React.useState(""); const [status, setStatus] = React.useState(""); const [lawyerId, setLawyerId] = React.useState(""); const [clientId, setClientId] = React.useState(""); const [from, setFrom] = React.useState(""); const [to, setTo] = React.useState("");
  const apply = () => onFilter({ q:q||undefined, status: status||undefined, lawyerId: lawyerId||undefined, clientId: clientId||undefined, from: from||undefined, to: to||undefined });
  return (
    <div className="p-3 border rounded bg-white">
      <div className="grid md:grid-cols-6 gap-2">
        <input className="border rounded p-2" placeholder="بحث..." value={q} onChange={e=>setQ(e.target.value)} />
        <select className="border rounded p-2" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">كل الحالات</option><option value="OPEN">مفتوحة</option><option value="ON_HOLD">معلقة</option><option value="CLOSED">مغلقة</option>
        </select>
        <select className="border rounded p-2" value={lawyerId} onChange={e=>setLawyerId(e.target.value)}>
          <option value="">أي محامٍ</option>{lawyers.map(p=><option key={p.id} value={p.id}>{p.subscriptionNo} — {p.name}</option>)}
        </select>
        <select className="border rounded p-2" value={clientId} onChange={e=>setClientId(e.target.value)}>
          <option value="">أي عميل</option>{clients.map(p=><option key={p.id} value={p.id}>{p.subscriptionNo} — {p.name}</option>)}
        </select>
        <input className="border rounded p-2" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <input className="border rounded p-2" type="date" value={to} onChange={e=>setTo(e.target.value)} />
      </div>
      <div className="text-right mt-2"><button className="px-4 py-2 rounded bg-black text-white" onClick={apply}>تطبيق الفلاتر</button></div>
    </div>
  );
}
