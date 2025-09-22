// src/pages/admin/properties/index.tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Unit = { id:string; unitNo:string; rentAmount?:number; currency?:string; status?:string; published?:boolean; image?:string };
type Building = {
  id:string; buildingNo:string; address:string; createdAt:string; updatedAt:string;
  unitsCount:number; units:Unit[]; published?:boolean; images?:string[]; coverIndex?:number; archived?:boolean;
};

function resolveSrc(name?:string){
  if(!name) return "";
  if(/^https?:\/\//.test(name) || name.startsWith("data:") || name.startsWith("/")) return name;
  return `/uploads/${name}`;
}

export default function AdminPropertiesList(){
  const [items,setItems]=useState<Building[]>([]);
  const [loading,setLoading]=useState(true);

  const [fNo,setFNo]=useState(""); const [fAddr,setFAddr]=useState("");
  const [fStatus,setFStatus]=useState<""|"vacant"|"reserved"|"leased">("");
  const [fPublished,setFPublished]=useState<""|"yes"|"no">("");

  useEffect(()=>{ (async()=>{
    const r = await fetch("/api/buildings");
    const d = r.ok? await r.json():{items:[]};
    setItems(Array.isArray(d?.items)? d.items : []);
    setLoading(false);
  })(); },[]);

  async function publishBuilding(id:string, val:boolean){
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ published: val }) });
    if(r.ok){ setItems(s=>s.map(x=>x.id===id?{...x,published:val}:x)); }
  }
  async function publishUnit(bid:string, uid:string, val:boolean){
    const r = await fetch(`/api/buildings/${encodeURIComponent(bid)}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ unitId: uid, unitPublished: val }) });
    if(r.ok){ setItems(s=>s.map(b=> b.id!==bid? b : ({...b, units: b.units.map(u=>u.id===uid?{...u,published:val}:u)}))); }
  }
  async function archiveBuilding(id:string){
    const ok = confirm("أرشفة المبنى ستخفيه من القوائم. هل تريد المتابعة؟");
    if(!ok) return;
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ archived: true, published: false }) });
    if(r.ok){ setItems(s=>s.map(x=>x.id===id?{...x,archived:true,published:false}:x)); }
  }

  const filtered = useMemo(()=>{
    return items.filter(b=>{
      if(b.archived) return false;
      if(fNo && !b.buildingNo.includes(fNo)) return false;
      if(fAddr && !b.address.includes(fAddr)) return false;
      if(fPublished==="yes" && !b.published) return false;
      if(fPublished==="no" && b.published) return false;
      if(fStatus){
        const any = b.units.some(u=>{
          const st = u.status==="leased"?"leased": u.status==="reserved"?"reserved":"vacant";
          return st===fStatus;
        });
        if(!any) return false;
      }
      return true;
    });
  },[items,fNo,fAddr,fPublished,fStatus]);

  function coverThumb(b:Building){
    const imgs=b.images||[]; const i=typeof b.coverIndex==="number"? b.coverIndex:0;
    return resolveSrc(imgs[i]||imgs[0]||"");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>إدارة العقارات</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">العقارات</h1>
          <Link href="/admin/buildings/new" className="btn btn-primary">إدخال مبنى</Link>
        </div>

        {/* فلاتر */}
        <div className="border rounded-2xl p-3 grid sm:grid-cols-5 gap-2">
          <input className="form-input" placeholder="رقم المبنى" value={fNo} onChange={e=>setFNo(e.target.value)} />
          <input className="form-input sm:col-span-2" placeholder="العنوان" value={fAddr} onChange={e=>setFAddr(e.target.value)} />
          <select className="form-input" value={fStatus} onChange={e=>setFStatus(e.target.value as any)}>
            <option value="">حالة الوحدة</option><option value="vacant">شاغر</option><option value="reserved">محجوز</option><option value="leased">مؤجر</option>
          </select>
          <select className="form-input" value={fPublished} onChange={e=>setFPublished(e.target.value as any)}>
            <option value="">نشر المبنى</option><option value="yes">منشور</option><option value="no">غير منشور</option>
          </select>
        </div>

        {loading? <div>جارٍ التحميل…</div> : (
          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">المبنى</th>
                  <th className="p-2 text-left">العنوان</th>
                  <th className="p-2 text-left">الوحدات</th>
                  <th className="p-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b=>(
                  <tr key={b.id} className="border-b align-top">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {coverThumb(b) ? <img src={coverThumb(b)} className="w-10 h-10 object-cover rounded" alt="" /> : <div className="w-10 h-10 rounded bg-gray-200" />}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">مبنى {b.buildingNo}</div>
                            {/* زر نشر بجانب اسم المبنى */}
                            <label className="text-xs inline-flex items-center gap-1">
                              <input type="checkbox" checked={!!b.published} onChange={e=>publishBuilding(b.id,e.target.checked)} />
                              نشر
                            </label>
                          </div>
                          <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-2">{b.address}</td>

                    <td className="p-2">
                      {b.units.map(u=>(
                        <div key={u.id} className="flex items-center justify-between gap-2 border-b last:border-b-0 py-1">
                          <div className="flex items-center gap-2">
                            {u.image ? <img src={resolveSrc(u.image)} className="w-8 h-8 object-cover rounded" alt="" /> : <div className="w-8 h-8 rounded bg-gray-200" />}
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span>وحدة {u.unitNo}</span>
                                {/* زر نشر بجانب رقم الوحدة */}
                                <label className="text-xs inline-flex items-center gap-1">
                                  <input type="checkbox" checked={!!u.published} onChange={e=>publishUnit(b.id,u.id,e.target.checked)} />
                                  نشر
                                </label>
                              </div>
                              <div className="text-xs text-gray-500">{u.rentAmount||0} {u.currency||"OMR"} • {u.status==="leased"?"مؤجر":u.status==="reserved"?"محجوز":"شاغر"}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link className="btn btn-outline btn-sm" href={`/admin/rent/${encodeURIComponent(b.id)}/${encodeURIComponent(u.id)}`}>إدارة التأجير</Link>
                          </div>
                        </div>
                      ))}
                    </td>

                    <td className="p-2">
                      <div className="flex flex-col gap-2">
                        <Link className="btn btn-outline btn-sm" href={`/admin/buildings/edit/${encodeURIComponent(b.id)}`}>تعديل المبنى</Link>
                        <button className="btn btn-outline btn-sm" onClick={()=>archiveBuilding(b.id)}>أرشفة المبنى</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td className="p-3 text-center text-gray-600" colSpan={4}>لا توجد مبانٍ مطابقة.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
