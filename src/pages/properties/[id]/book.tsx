// src/pages/properties/[id]/book.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { Property } from "@/types/domain";
import { asMoney } from "@/lib/money";


export default function BookPropertyPage() {
const router = useRouter();
const { id } = router.query as { id: string };
const [p, setP] = useState<Property | null>(null);
const [amount, setAmount] = useState(0);
const tenantId = "tenant-1"; // محاكاة هوية المستخدم


useEffect(() => {
if (!id) return;
fetch(`/api/properties/${id}`).then((r) => r.json()).then((prop) => {
setP(prop);
setAmount(Math.min(prop.price, Math.max(10, Math.round(prop.price * 0.2))));
});
}, [id]);


async function pay() {
if (!p) return;
// 1) إنشاء حجز
const r1 = await fetch("/api/bookings", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ propertyId: p.id, tenantId, amount: Number(amount) }),
});
const booking = await r1.json();
if (!r1.ok) return alert(booking.error || "فشل الحجز");


// 2) تسجيل دفعة (محاكاة نجاح فوري)
const r2 = await fetch("/api/payments", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ bookingId: booking.id, amount: Number(amount), method: "card" }),
});
const data = await r2.json();
if (!r2.ok) return alert(data.error || "فشل الدفع");


// 3) العثور على العقد الناتج وإعادة التوجيه لقراءته وتوقيعه
const resContracts = await fetch(`/api/contracts?tenantId=${tenantId}`);
const contracts = await resContracts.json();
const c = contracts.find((x: any) => x.bookingId === booking.id);
if (c) router.push(`/contracts/${c.id}`);
else alert("تم الدفع. لم يتم العثور على العقد");
}


if (!p) return <main className="p-6">جار التحميل…</main>;


return (
<main className="min-h-screen bg-slate-50">
<div className="mx-auto max-w-xl p-6 space-y-4">
<h1 className="text-2xl font-bold">حجز العقار</h1>
<div className="text-sm text-slate-500">{p.id}</div>
}