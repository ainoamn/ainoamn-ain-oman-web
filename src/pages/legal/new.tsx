import React from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";

type Person = { id: string; subscriptionNo: string; name: string };

export default function NewCasePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [primaryLawyerId, setPrimaryLawyerId] = React.useState("");
  const [lawyers, setLawyers] = React.useState<Person[]>([]);
  const [clients, setClients] = React.useState<Person[]>([]);
  const hdrs = { "Content-Type":"application/json", "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };

  const loadLists = async () => {
    const [r1,r2] = await Promise.all([
      fetch("/api/legal/directory?kind=LAWYER", { headers: hdrs }),
      fetch("/api/legal/directory?kind=CLIENT", { headers: hdrs }),
    ]);
    setLawyers(await r1.json()); setClients(await r2.json());
  };
  React.useEffect(()=>{ loadLists(); }, []);

  const saveAndContinue = async () => {
    if (!title || !clientId || !primaryLawyerId) { alert("أكمل البيانات"); return; }
    const r = await fetch("/api/legal/cases", { method: "POST", headers: hdrs, body: JSON.stringify({ title, clientId, primaryLawyerId }) });
    if (!r.ok) { alert("تعذر إنشاء القضية"); return; }
    const c = await r.json();
    router.push(`/legal/${c.id}`);
  };

  return (
    <Layout>
      <h1 className="text-xl font-semibold mb-3">قضية جديدة</h1>
      <div className="p-4 border rounded bg-white grid md:grid-cols-2 gap-3">
        <input className="border rounded p-2" placeholder="عنوان القضية" value={title} onChange={e=>setTitle(e.target.value)} />
        <div>
          <div className="text-sm mb-1">العميل</div>
          <select className="border rounded p-2 w-full" value={clientId} onChange={e=>setClientId(e.target.value)}>
            <option value="">اختر من القائمة</option>
            {clients.map(p=><option key={p.id} value={p.id}>{p.subscriptionNo} — {p.name}</option>)}
          </select>
        </div>
        <div>
          <div className="text-sm mb-1">المحامي الأساسي</div>
          <select className="border rounded p-2 w-full" value={primaryLawyerId} onChange={e=>setPrimaryLawyerId(e.target.value)}>
            <option value="">اختر من القائمة</option>
            {lawyers.map(p=><option key={p.id} value={p.id}>{p.subscriptionNo} — {p.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 text-right">
          <button className="px-4 py-2 rounded bg-black text-white" onClick={saveAndContinue}>الحفظ والمتابعة</button>
        </div>
      </div>
    </Layout>
  );
}
