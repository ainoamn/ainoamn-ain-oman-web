// @ts-nocheck
// src/pages/contracts/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { Contract } from "@/types/domain";


export default function ContractPage() {
const router = useRouter();
const { id } = router.query as { id: string };
const [c, setC] = useState<Contract | null>(null);
const [agree, setAgree] = useState(false);
const tenantId = "tenant-1";
const landlordId = "landlord-1";


async function refresh() {
const r = await fetch(`/api/contracts/${id}`);
const data = await r.json();
setC(data);
}


useEffect(() => {
if (id) refresh();
}, [id]);


async function tenantAccept() {
if (!c) return;
const r = await fetch(`/api/contracts/${c.id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ action: "tenant_accept" }),
});
if (r.ok) refresh();
}


async function landlordApprove() {
if (!c) return;
const r = await fetch(`/api/contracts/${c.id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ action: "landlord_approve" }),
});
if (r.ok) refresh();
}


async function landlordReject() {
if (!c) return;
const reason = prompt("سبب الرفض؟") || "";
const r = await fetch(`/api/contracts/${c.id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ action: "landlord_reject", reason }),
});
if (r.ok) refresh();
}


if (!c) return <main className="p-6">جار التحميل…</main>;


return (
<main className="min-h-screen bg-slate-50">
<div className="mx-auto max-w-3xl p-6 space-y-4">
<div className="text-sm text-slate-500">{c.id}</div>
<h1 className="text-2xl font-bold">عقد الإيجار</h1>
<div className="bg-white rounded-xl shadow p-4" dangerouslySetInnerHTML={{ __html: c.termsHtml }} />


{c.status === "awaiting_tenant_sign" && (
	<div className="bg-white rounded-xl shadow p-4">
		<label className="flex items-center gap-2">
			<input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
			<span>قرأتُ جميع البنود وأوافق عليها</span>
		</label>
		<button
			className="mt-3 px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-50"
			disabled={!agree}
			onClick={tenantAccept}
		>
			أوافق وأوقع
		</button>
	</div>
)}

{c.status === "awaiting_landlord_approve" && (
	<div className="bg-white rounded-xl shadow p-4">
		<div className="flex gap-2">
			<button className="px-4 py-2 bg-green-600 text-white rounded" onClick={landlordApprove}>الموافقة</button>
			<button className="px-4 py-2 bg-red-600 text-white rounded" onClick={landlordReject}>رفض</button>
		</div>
	</div>
)}

</div>
</main>
	);
}