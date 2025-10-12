// src/pages/development/projects/index.tsx
import React, { useEffect, useState } from "react";
import InstantLink from '@/components/InstantLink';

type DevProject = {
  id: string; name: string; city?: string; status?: string; createdAt?: string;
};

export default function DevProjectsListPage() {
  const [items, setItems] = useState<DevProject[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/development/projects");
        const j = await r.json();
        setItems(Array.isArray(j) ? j : []);
      } catch {
        setItems([
          { id: "PR-OM-2025-000001", name: "مجمع الواجهة — بوشر", city: "مسقط", status: "selling" },
          { id: "PR-OM-2025-000002", name: "أبراج النسيم — نزوى", city: "الداخلية", status: "planned" },
        ]);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">مشاريع التطوير العقاري</h1>
        <InstantLink href="/admin/development/projects/new" className="px-4 py-2 rounded-xl border">+ مشروع جديد (إدارة)</InstantLink>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {items.map((it) => (
          <InstantLink key={it.id} href={`/development/projects/${it.id}`} className="rounded-2xl border p-5 hover:shadow-sm transition block">
            <div className="font-semibold">{it.name}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{it.city ?? "—"} · {it.status ?? "—"}</div>
          </InstantLink>
        ))}
      </div>
    </div>
  );
}
