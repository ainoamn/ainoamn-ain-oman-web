// src/pages/properties/[id]/handover.tsx
import Head from "next/head"; import { useRouter } from "next/router"; import { useState } from "react";

export default function HandoverPage() {
  const { query:{ id } } = useRouter(); const [electricity,setE]=useState(""); const [water,setW]=useState(""); const [notes,setN]=useState("");
  async function save() {
    await fetch("/api/rentals/workflow/"+localStorage.getItem("current_rental_id"), { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ event:"handover_done" }) });
    alert("تم حفظ محضر التسليم");
  }
  return (
    <>
      <Head><title>توثيق التسليم | Ain Oman</title></Head>
      <main className="mx-auto max-w-3xl p-4 space-y-4">
        <h1 className="text-2xl font-bold">توثيق حالة العقار</h1>
        <div><label className="block font-medium">قراءة الكهرباء</label><input className="border p-2 w-full" value={electricity} onChange={e=>setE(e.target.value)} /></div>
        <div><label className="block font-medium">قراءة الماء</label><input className="border p-2 w-full" value={water} onChange={e=>setW(e.target.value)} /></div>
        <div><label className="block font-medium">ملاحظات</label><textarea className="border p-2 w-full" rows={4} value={notes} onChange={e=>setN(e.target.value)} /></div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded" onClick={save}>حفظ محضر التسليم</button>
      </main>
    </>
  );
}
