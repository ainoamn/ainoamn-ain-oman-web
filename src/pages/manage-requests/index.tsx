// src/pages/manage-requests/index.tsx
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
// Layout handled by _app.tsx
import InstantLink from '@/components/InstantLink';

type Req = {
  id:string; propertyId:string; ownerId?:string|null; userId:string;
  type:"viewing"|"booking"; name:string; phone:string; date?:string|null; time?:string|null; months?:number|null;
  note?:string|null; status:"pending"|"approved"|"declined"|"proposed";
  proposedDate?:string|null; proposedTime?:string|null; createdAt:string; updatedAt:string;
};

function currentUserId(){
  if (typeof window==="undefined") return "guest";
  try{ return JSON.parse(localStorage.getItem("ao_user")||"{}")?.id || "guest"; }catch{ return "guest"; }
}

export default function ManageRequests(){
  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = currentUserId();

  const refresh = () => {
    setLoading(true);
    fetch("/api/requests", { headers: { "x-user-id": uid } })
      .then(r=>r.json()).then(d=> setItems(Array.isArray(d?.items)? d.items: []))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ refresh(); },[]);

  const myItems = useMemo(()=> items.filter(r => r.ownerId===uid || r.userId===uid), [items, uid]);

  const act = async (r:Req, patch:any) => {
    const res = await fetch(`/api/requests/${encodeURIComponent(r.id)}`, {
      method:"PUT",
      headers: { "Content-Type":"application/json", "x-user-id": uid },
      body: JSON.stringify(patch)
    });
    if (res.ok) refresh();
  };

  return (
    <>
      <Head><title>طلبات المعاينة والحجز | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">الطلبات</h1>
            <InstantLink href="/manage-properties" className="text-sm underline">عودة للوحة العقارات</InstantLink>
          </div>

          {loading ? <div className="text-gray-500">جارِ التحميل…</div> : (
            <div className="overflow-x-auto bg-white border rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">النوع</th>
                    <th className="p-3">عقار</th>
                    <th className="p-3">العميل</th>
                    <th className="p-3">التاريخ/الوقت</th>
                    <th className="p-3">الشهور</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {myItems.map(r=>(
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{r.type==="viewing"?"معاينة":"حجز"}</td>
                      <td className="p-3">#{r.propertyId}</td>
                      <td className="p-3">{r.name} <span className="text-xs text-gray-500">({r.phone})</span></td>
                      <td className="p-3">{r.date || "—"} {r.time || ""}</td>
                      <td className="p-3">{r.months ?? "—"}</td>
                      <td className="p-3">{r.status}</td>
                      <td className="p-3">
                        {r.status==="pending" && (
                          <div className="flex flex-wrap gap-2">
                            <button onClick={()=>act(r,{ status:"approved" })} className="px-3 py-1 rounded bg-emerald-600 text-white">موافقة</button>
                            <button onClick={()=>act(r,{ status:"declined" })} className="px-3 py-1 rounded bg-red-600 text-white">رفض</button>
                            {r.type==="viewing" && (
                              <ProposeBtn onPropose={(d,t)=>act(r,{ status:"proposed", proposedDate:d, proposedTime:t })}/>
                            )}
                          </div>
                        )}
                        {r.status==="proposed" && <div className="text-xs">مقترح: {r.proposedDate} {r.proposedTime}</div>}
                      </td>
                    </tr>
                  ))}
                  {myItems.length===0 && (
                    <tr><td className="p-3 text-gray-500" colSpan={7}>لا توجد طلبات.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ProposeBtn({ onPropose }:{ onPropose:(d:string,t:string)=>void }){
  const [open, setOpen] = useState(false);
  const [d, setD] = useState(""); const [t, setT] = useState("");
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-3 py-1 rounded bg-amber-600 text-white">اقتراح موعد</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center" onClick={()=>setOpen(false)}>
          <div className="bg-white rounded-xl p-4 w-full max-w-sm" onClick={(e)=>e.stopPropagation()}>
            <div className="font-semibold mb-2">اقتراح موعد بديل</div>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="border rounded p-2" value={d} onChange={(e)=>setD(e.target.value)} />
              <input type="time" className="border rounded p-2" value={t} onChange={(e)=>setT(e.target.value)} />
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button onClick={()=>setOpen(false)} className="px-3 py-1 rounded border">إلغاء</button>
              <button onClick={()=>{ onPropose(d,t); setOpen(false); }} className="px-3 py-1 rounded bg-[var(--brand-800)] text-white">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
