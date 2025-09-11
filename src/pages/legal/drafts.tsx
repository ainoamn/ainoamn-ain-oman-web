// src/pages/legal/drafts.tsx
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import CaseGrid from "@/components/legal/CaseGrid";
import { useRouter } from "next/router";

type CaseItem = any;
const hdrs = { "x-tenant-id": "TENANT-1", "x-user-id": "U1", "x-roles": "LAWYER" };

export default function DraftsPage() {
  const [items, setItems] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(()=>{
    (async ()=>{
      const r = await fetch("/api/legal/cases", { headers: hdrs });
      const list = await r.json();
      const drafts = (list as CaseItem[]).filter(c => c.status==="ON_HOLD" || (Array.isArray(c.tags)&&c.tags.includes("draft")));
      setItems(drafts); setLoading(false);
    })();
  },[]);

  return (
    <Layout>
      <main className="container mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">المسودات</h1>
        {loading ? <div className="p-6 border rounded">جاري التحميل…</div> :
          <CaseGrid items={items} onOpen={(id:string)=>router.push(`/legal/${id}`)} />}
      </main>
    </Layout>
  );
}
