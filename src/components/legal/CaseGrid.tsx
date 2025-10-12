import React from "react";
import InstantLink from '@/components/InstantLink';

type Case = { id: string; title: string; status: string; stage: string; clientId: string; primaryLawyerId: string; updatedAt: string };

export default function CaseGrid({ items }: { items: Case[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {items.map(c=>(
        <InstantLink href={`/legal/${c.id}`} key={c.id} className="p-3 border rounded bg-white hover:shadow">
          <div className="font-medium">{c.title}</div>
          <div className="text-xs opacity-70 mt-1">الحالة: {c.status} | المرحلة: {c.stage}</div>
          <div className="text-xs opacity-70 mt-1">آخر تحديث: {new Date(c.updatedAt).toLocaleString()}</div>
        </InstantLink>
      ))}
      {items.length===0 && <div className="opacity-70">لا توجد قضايا</div>}
    </div>
  );
}
