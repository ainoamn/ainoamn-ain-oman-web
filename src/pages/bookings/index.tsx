// src/pages/bookings/index.tsx
import React, { useEffect, useState } from "react";
import type { Booking } from "@/types/domain";


export default function MyBookingsPage() {
const [items, setItems] = useState<Booking[]>([]);
const tenantId = "tenant-1";


useEffect(() => {
fetch(`/api/bookings?tenantId=${tenantId}`).then((r) => r.json()).then(setItems);
}, []);


return (
<main className="min-h-screen bg-slate-50">
<div className="mx-auto max-w-5xl p-6">
<h1 className="text-2xl font-bold mb-4">حجوزاتي</h1>
<table className="w-full bg-white rounded-xl shadow">
<thead>
<tr className="text-right text-sm text-slate-500">
<th className="p-3">المعرف</th>
<th className="p-3">العقار</th>
<th className="p-3">المبلغ</th>
<th className="p-3">الحالة</th>
</tr>
</thead>
<tbody>
{items.map((b) => (
<tr key={b.id} className="border-t">
<td className="p-3">{b.id}</td>
<td className="p-3">{b.propertyId}</td>
<td className="p-3">{b.amount}</td>
<td className="p-3">{b.status}</td>
</tr>
))}
</tbody>
</table>
</div>
</main>
);
}