// src/pages/admin/properties/index.tsx
import Head from "next/head";
import InstantImage from '@/components/InstantImage';
// Header is now handled by MainLayout in _app.tsx

import InstantLink from '@/components/InstantLink';
import { useEffect, useMemo, useState } from "react";

type Unit = { id:string; unitNo:string; rentAmount?:number; currency?:string; status?:string; published?:boolean; image?:string; images?:string[] };
type Building = {
  id:string; buildingNo:string; address:string; createdAt:string; updatedAt:string;
  units:Unit[]; published?:boolean; images?:string[]; coverIndex?:number; archived?:boolean;
};

function resolveSrc(name?:string){
  if(!name) return "";
  if(/^https?:\/\//.test(name) || name.startsWith("data:")) return name;
  if(name.startsWith("/")) return name;
  // Ì› —÷ ÊÃÊœ «·„·›«   Õ  public/uploads
  return `/uploads/${name}`;
}

function UnitThumb({u}:{u:Unit}){
  const src = resolveSrc(u.image || (u.images?.[0]));
  return src ? <InstantImage src={src} className="w-8 h-8 object-cover rounded" alt=""  loading="lazy" width={32} height={32}/> : <div className="w-8 h-8 rounded bg-gray-200" />;
}

function BuildingThumb({b}:{b:Building}){
  const imgs=b.images||[]; const i=typeof b.coverIndex==="number"? b.coverIndex:0;
  const src = resolveSrc(imgs[i]||imgs[0]);
  return src ? <InstantImage src={src} className="w-10 h-10 object-cover rounded" alt=""  loading="lazy" width={400} height={300}/> : <div className="w-10 h-10 rounded bg-gray-200" />;
}

export default function AdminPropertiesList(){
  const [items,setItems]=useState<Building[]>([]);
  const [loading,setLoading]=useState(true);
  const [showArchived,setShowArchived]=useState(false);
  const [fNo,setFNo]=useState(""); const [fAddr,setFAddr]=useState("");

  async function refresh(){
    setLoading(true);
    const r = await fetch("/api/buildings");
    const d = r.ok? await r.json() : { items: [] };
    setItems(Array.isArray(d?.items)? d.items : []);
    setLoading(false);
  }
  useEffect(()=>{ refresh(); },[]);

  async function toggleBuildingPublish(id:string, val:boolean){
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, {
      method:"PATCH", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ op:"publishBuilding", published: val })
    });
    if(r.ok) refresh();
  }
  // «” ⁄„· unitNo · ›«œÌ  ﬂ—«— «·„⁄—›« 
  async function toggleUnitPublish(bid:string, unitNo:string, val:boolean){
    const r = await fetch(`/api/buildings/${encodeURIComponent(bid)}`, {
      method:"PATCH", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ op:"publishUnitByNo", unitNo, published: val })
    });
    if(r.ok) refresh();
  }
  async function archiveBuilding(id:string){
    if(!confirm("√—‘›… «·„»‰Ïø")) return;
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, {
      method:"PATCH", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ op:"archive", archived: true })
    });
    if(r.ok) refresh();
  }
  async function unarchiveBuilding(id:string){
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, {
      method:"PATCH", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ op:"archive", archived: false })
    });
    if(r.ok) refresh();
  }

  const filtered = useMemo(()=> items.filter(b=>{
    if(!showArchived && b.archived) return false;
    if(fNo && !b.buildingNo?.includes(fNo)) return false;
    if(fAddr && !b.address?.includes(fAddr)) return false;
    return true;
  }),[items,showArchived,fNo,fAddr]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>≈œ«—… «·⁄ﬁ«—« </title></Head>
      
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">«·⁄ﬁ«—« </h1>
          <InstantLink href="/properties/new" className="btn btn-primary">≈œŒ«· „»‰Ï</InstantLink>
        </div>

        <div className="border rounded-2xl p-3 grid sm:grid-cols-6 gap-2">
          <input className="form-input" placeholder="—ﬁ„ «·„»‰Ï" value={fNo} onChange={e=>setFNo(e.target.value)} />
          <input className="form-input sm:col-span-2" placeholder="«·⁄‰Ê«‰" value={fAddr} onChange={e=>setFAddr(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} />
            ⁄—÷ «·„»«‰Ì «·„ƒ—‘›…
          </label>
        </div>

        {loading? <div>Ã«—Ú «· Õ„Ì·Ö</div> : (
          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">«·„»‰Ï</th>
                  <th className="p-2 text-left">«·⁄‰Ê«‰</th>
                  <th className="p-2 text-left">«·ÊÕœ« </th>
                  <th className="p-2 text-left">≈Ã—«¡« </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b=>(
                  <tr key={b.id} className="border-b align-top">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <BuildingThumb b={b}/>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">„»‰Ï {b.buildingNo}</div>
                            <label className="text-xs inline-flex items-center gap-1">
                              <input type="checkbox" checked={!!b.published} onChange={e=>toggleBuildingPublish(b.id,e.target.checked)} />
                              ‰‘—
                            </label>
                            {b.archived && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">„ƒ—‘›</span>}
                          </div>
                          <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-2">{b.address}</td>

                    <td className="p-2">
                      {b.units.map(u=>(
                        <div key={`${b.id}-${u.unitNo}`} className="flex items-center justify-between gap-2 border-b last:border-b-0 py-1">
                          <div className="flex items-center gap-2">
                            <UnitThumb u={u}/>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span>ÊÕœ… {u.unitNo}</span>
                                <label className="text-xs inline-flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={!!u.published}
                                    onChange={e=>toggleUnitPublish(b.id,u.unitNo,e.target.checked)}
                                  />
                                  ‰‘— «·ÊÕœ…
                                </label>
                              </div>
                              <div className="text-xs text-gray-500">
                                {u.rentAmount||0} {u.currency||"OMR"} ï {u.status==="leased"?"„ƒÃ—":u.status==="reserved"?"„ÕÃÊ“":"‘«€—"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <InstantLink className="btn btn-outline btn-sm" href={`/admin/rent/${encodeURIComponent(b.id)}/${encodeURIComponent(u.id)}`}>≈œ«—… «· √ÃÌ—</InstantLink>
                            <InstantLink className="btn btn-outline btn-sm" href={`/admin/buildings/edit/${encodeURIComponent(b.id)}`}> ⁄œÌ· «·»Ì«‰« </InstantLink>
                          </div>
                        </div>
                      ))}
                    </td>

                    <td className="p-2">
                      <div className="flex flex-col gap-2">
                        <InstantLink className="btn btn-outline btn-sm" href={`/admin/buildings/edit/${encodeURIComponent(b.id)}`}> ⁄œÌ· «·„»‰Ï</InstantLink>
                        {!b.archived ? (
                          <button className="btn btn-outline btn-sm" onClick={()=>archiveBuilding(b.id)}>√—‘›… «·„»‰Ï</button>
                        ) : (
                          <button className="btn btn-outline btn-sm" onClick={()=>unarchiveBuilding(b.id)}>≈·€«¡ «·√—‘›…</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td className="p-3 text-center text-gray-600" colSpan={4}>·«  ÊÃœ ”Ã·« .</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
      
    </div>
  );
}

