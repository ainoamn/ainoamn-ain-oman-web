import React from "react";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import AdvancedSearch from "../../components/legal/AdvancedSearch";
import CaseGrid from "../../components/legal/CaseGrid";
import StatsOverview from "../../components/legal/StatsOverview";

type Case = { id: string; title: string; status: "OPEN"|"ON_HOLD"|"CLOSED"; stage: string; clientId: string; primaryLawyerId: string; updatedAt: string; };
type Person = { id: string; subscriptionNo: string; name: string };

export default function LegalCasesPage() {
  const [items, setItems] = React.useState<Case[]>([]);
  const [filtered, setFiltered] = React.useState<Case[]>([]);
  const [lawyers, setLawyers] = React.useState<Person[]>([]);
  const [clients, setClients] = React.useState<Person[]>([]);
  const hdrs = { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };

  const load = async () => {
    const [r1,r2,r3] = await Promise.all([
      fetch("/api/legal/cases", { headers: hdrs }),
      fetch("/api/legal/directory?kind=LAWYER", { headers: hdrs }),
      fetch("/api/legal/directory?kind=CLIENT", { headers: hdrs }),
    ]);
    const list = await r1.json(); const L = await r2.json(); const C = await r3.json();
    setItems(list||[]); setFiltered(list||[]); setLawyers(L||[]); setClients(C||[]);
  };
  React.useEffect(()=>{ load(); const t = setInterval(load, 5000); return ()=>clearInterval(t); }, []);

  const onFilter = (f: { q?:string; status?:string; lawyerId?:string; clientId?:string; from?:string; to?:string; }) => {
    let arr = [...items];
    if (f.q) arr = arr.filter(c=>c.title.includes(f.q!));
    if (f.status) arr = arr.filter(c=>c.status===f.status);
    if (f.lawyerId) arr = arr.filter(c=>c.primaryLawyerId===f.lawyerId);
    if (f.clientId) arr = arr.filter(c=>c.clientId===f.clientId);
    if (f.from) arr = arr.filter(c=> new Date(c.updatedAt) >= new Date(f.from!) );
    if (f.to) arr = arr.filter(c=> new Date(c.updatedAt) <= new Date(f.to!) );
    setFiltered(arr);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">إدارة القضايا</h1>
        <div className="flex gap-2">
          <Link href="/legal/directory" className="px-3 py-2 rounded border">إدارة المحامين/العملاء</Link>
          <Link href="/legal/new" className="px-3 py-2 rounded bg-black text-white">قضية جديدة</Link>
        </div>
      </div>

      <AdvancedSearch onFilter={onFilter} lawyers={lawyers} clients={clients} />
      <div className="my-3">
        <h2 className="font-semibold mb-2">إحصاءات</h2>
        <StatsOverview items={filtered} />
      </div>
      <CaseGrid items={filtered} />
    </Layout>
  );
}
