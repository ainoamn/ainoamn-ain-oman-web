// src/pages/admin/contracts/[id].tsx
import Head from "next/head";
// Header and Footer handled by MainLayout in _app.tsx
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import InstantLink from "@/components/InstantLink";

type Booking = {
  id:string; bookingNumber:string; status:string;
  startDate:string; durationMonths:number; totalRent:number;
  buildingId?:string; unitId?:string;
  tenant?: any; // بيانات المستأجر ومرفقاته
  attachments?: { name:string; url?:string }[];
  contractSnapshot?: { templateName:string; bodyAr:string; bodyEn:string; fields:Record<string,string> };
};

type BuildingLite = {
  id:string;
  buildingNo:string;
  address:string;
  images?:string[];
  coverIndex?:number;
  units?: { id:string; unitNo:string; area?:number; type?:string; images?:string[] }[];
};

function render(body: string, fields: Record<string, string>) {
  let out = body || "";
  Object.entries(fields || {}).forEach(([k, v]) => {
    out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v || ""));
  });
  return out;
}
function resolveSrc(name?:string){
  if(!name) return "";
  if(/^https?:\/\//.test(name) || name.startsWith("data:") || name.startsWith("/")) return name;
  return `/uploads/${name}`;
}

export default function AdminContractPage(){
  const { query } = useRouter();
  const raw = String(Array.isArray(query.id)? query.id[0] : query.id || "");
  const [b,setB]=useState<Booking|null>(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);
  const [building,setBuilding]=useState<BuildingLite|null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ if(!raw) return;
    (async()=>{
      setLoading(true); setErr(null);
      try{
        // جلب الحجز
        let r = await fetch(`/api/bookings/${encodeURIComponent(raw)}`);
        let d:any = r.ok? await r.json() : null;
        if(!d?.item){
          const rr = await fetch(`/api/bookings?number=${encodeURIComponent(raw)}`);
          const dj = rr.ok? await rr.json(): null;
          const item = Array.isArray(dj?.items)? dj.items.find((x:any)=>x.bookingNumber===raw || x.id===raw) : null;
          d = item ? { item } : null;
        }
        if(!d?.item) throw 0;
        setB(d.item);

        // جلب العقار للوحدة
        if(d.item.buildingId){
          const rb = await fetch(`/api/buildings/${encodeURIComponent(d.item.buildingId)}`);
          const db = rb.ok? await rb.json():null;
          if(db?.item) setBuilding(db.item);
        }
      }catch{ setErr("تعذّر جلب البيانات"); } finally{ setLoading(false); }
    })();
  },[raw]);

  const ar = useMemo(()=> render(b?.contractSnapshot?.bodyAr||"", b?.contractSnapshot?.fields||{}), [b]);
  const en = useMemo(()=> render(b?.contractSnapshot?.bodyEn||"", b?.contractSnapshot?.fields||{}), [b]);

  function onPrint(){
    window.print();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>عقد #{raw}</title></Head>
      {/* Header handled by MainLayout */}
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">عقد #{b?.bookingNumber || raw}</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn">رجوع</Link>
            <button onClick={onPrint} className="btn btn-outline">طباعة / PDF</button>
          </div>
        </div>

        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : b ? (
          <div ref={printRef} className="space-y-4">
            {/* ملخص العقد */}
            <section className="border rounded-2xl p-3 space-y-1 text-sm">
              <div className="font-semibold">ملخص العقد</div>
              <div>الحالة: {b.status}</div>
              <div>بداية: {new Date(b.startDate).toLocaleDateString("ar", { calendar: 'gregory', numberingSystem: 'latn' })} • مدة: {b.durationMonths} شهر</div>
              <div>القيمة الإجمالية: {b.totalRent}</div>
              <div>الرقم: {b.bookingNumber || b.id}</div>
            </section>

            {/* بيانات العقار والوحدة */}
            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">العقار والوحدة</div>
              {building ? (
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">مبنى</div>
                    <div className="font-medium">#{building.buildingNo}</div>
                    <div className="text-gray-700">{building.address}</div>
                  </div>
                  {(() => {
                    const u = building.units?.find(x=>x.id===b.unitId);
                    const img = resolveSrc(u?.images?.[0]);
                    return (
                      <div className="flex items-center gap-2">
                        {img ? <img src={img} className="w-16 h-16 object-cover rounded" alt="" /> : <div className="w-16 h-16 bg-gray-200 rounded" />}
                        <div>
                          <div className="text-gray-600">الوحدة</div>
                          <div className="font-medium">#{u?.unitNo || b.unitId}</div>
                          {!!u?.area && <div className="text-xs text-gray-600">المساحة: {u.area} م²</div>}
                          {!!u?.type && <div className="text-xs text-gray-600">النوع: {u.type}</div>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : <div className="text-sm text-gray-600">—</div>}
            </section>

            {/* المستأجر والمرفقات */}
            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">المستأجر</div>
              {b.tenant ? (
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div>الاسم: {b.tenant?.name}</div>
                  <div>الهاتف: {b.tenant?.phone}</div>
                  <div>البريد: {b.tenant?.email}</div>
                  <div>العنوان: {b.tenant?.address}</div>
                </div>
              ) : <div className="text-sm text-gray-600">—</div>}

              {!!(b.attachments||[]).length && (
                <div className="pt-2">
                  <div className="font-medium mb-1 text-sm">المرفقات</div>
                  <ul className="list-disc pr-5 text-sm">
                    {(b.attachments||[]).map((a,i)=>(
                      <li key={i}>
                        {a.url ? <a className="link" href={a.url} target="_blank" rel="noreferrer">{a.name}</a> : a.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* نصوص العقد */}
            <section className="border rounded-2xl p-3">
              <div className="font-semibold mb-2">النص العربي</div>
              <div className="text-sm whitespace-pre-wrap">{ar}</div>
            </section>
            <section className="border rounded-2xl p-3">
              <div className="font-semibold mb-2">English</div>
              <div className="text-sm whitespace-pre-wrap">{en}</div>
            </section>
          </div>
        ) : <div>لا يوجد عقد.</div>}
      </main>
      {/* Footer handled by MainLayout */}
      <style jsx global>{`
        @media print {
          header, footer, nav, .btn, a[href]:after { display: none !important; }
          main { padding: 0 !important; }
          .border { border: 1px solid #000 !important; }
        }
      `}</style>
    </div>
  );
}
