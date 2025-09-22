// src/pages/admin/buildings/edit/[id].tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

type Visibility = "private"|"public"|"tenant";
type ExtraRow = { label:string; value:string; image?:string; visibility:Visibility };
type Unit = {
  id:string; unitNo:string; rentAmount?:number; currency?:string;
  status?:"vacant"|"reserved"|"leased"; published?:boolean; image?:string;
  powerMeter?:string; waterMeter?:string; images?:string[]; features?:string[];
};

export default function EditBuildingPage(){
  const { query, push } = useRouter();
  const id = String(query.id||"");

  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  const [buildingNo,setBuildingNo]=useState("");
  const [address,setAddress]=useState("");
  const [images,setImages]=useState<string[]>([]);
  const [coverIndex,setCoverIndex]=useState(0);
  const [published,setPublished]=useState(false);
  const [archived,setArchived]=useState(false);

  const [bPower,setBPower]=useState(""); const [bPowerImg,setBPowerImg]=useState<string>("");
  const [bPowerVis,setBPowerVis]=useState<Visibility>("private");
  const [bWater,setBWater]=useState(""); const [bWaterImg,setBWaterImg]=useState<string>("");
  const [bWaterVis,setBWaterVis]=useState<Visibility>("private");
  const [bPhone,setBPhone]=useState(""); const [bPhoneImg,setBPhoneImg]=useState<string>("");
  const [bPhoneVis,setBPhoneVis]=useState<Visibility>("private");
  const [extras,setExtras]=useState<ExtraRow[]>([]);

  const [units,setUnits]=useState<Unit[]>([]);

  useEffect(()=>{ if(!id) return;
    (async()=>{
      try{
        const r=await fetch(`/api/buildings/${encodeURIComponent(id)}`);
        const d= r.ok? await r.json():null;
        const b=d?.item;
        if(!b) throw new Error("غير موجود");
        setBuildingNo(b.buildingNo||""); setAddress(b.address||"");
        setImages(b.images||[]); setCoverIndex(b.coverIndex||0);
        setPublished(!!b.published); setArchived(!!b.archived);
        setBPower(b.services?.powerMeter||""); setBPowerImg(b.services?.powerImage||""); setBPowerVis(b.services?.powerVisibility||"private");
        setBWater(b.services?.waterMeter||""); setBWaterImg(b.services?.waterImage||""); setBWaterVis(b.services?.waterVisibility||"private");
        setBPhone(b.services?.phoneMeter||""); setBPhoneImg(b.services?.phoneImage||""); setBPhoneVis(b.services?.phoneVisibility||"private");
        setExtras(b.services?.others||[]);
        setUnits(Array.isArray(b.units)? b.units : []);
      }catch{ setError("تعذّر الجلب"); } finally{ setLoading(false); }
    })();
  },[id]);

  function addUnit(){
    const n = { id:`U-${Date.now()}`, unitNo:`${(units.length+1)}`, rentAmount:0, currency:"OMR", status:"vacant", published:false, images:[], features:[] } as Unit;
    setUnits(s=>[...s,n]);
  }
  function setUnit(i:number, patch:Partial<Unit>){
    setUnits(prev=> prev.map((u,idx)=> idx===i? { ...u, ...patch }: u));
  }
  function removeUnit(i:number){
    if(!confirm("حذف الوحدة؟")) return;
    setUnits(prev=> prev.filter((_,idx)=> idx!==i));
  }

  async function save(){
    const payload = {
      buildingNo, address, images, coverIndex, published, archived,
      services:{
        powerMeter:bPower, powerImage:bPowerImg, powerVisibility:bPowerVis,
        waterMeter:bWater, waterImage:bWaterImg, waterVisibility:bWaterVis,
        phoneMeter:bPhone, phoneImage:bPhoneImg, phoneVisibility:bPhoneVis, others:extras
      },
      units
    };
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify(payload) });
    if(r.ok){ alert("تم الحفظ"); push("/admin/properties"); } else alert("فشل الحفظ");
  }

  if(loading) return shell(<div>جارٍ التحميل…</div>);
  if(error) return shell(<div className="text-red-600">{error}</div>);

  return shell(
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">تعديل مبنى {buildingNo}</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/properties" className="btn">رجوع</Link>
          <button className="btn btn-primary" onClick={save}>حفظ</button>
        </div>
      </div>

      {/* بيانات المبنى */}
      <section className="border rounded-2xl p-3 space-y-3">
        <div className="font-semibold">بيانات المبنى</div>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="form-input" placeholder="رقم المبنى" value={buildingNo} onChange={e=>setBuildingNo(e.target.value)} />
          <input className="form-input" placeholder="العنوان" value={address} onChange={e=>setAddress(e.target.value)} />
        </div>

        {/* الصور */}
        <div className="space-y-2">
          <div className="font-semibold">الوسائط</div>
          <div className="flex items-center gap-2">
            <input className="form-input" type="file" multiple accept="image/*" onChange={(e)=>{
              const names = e.target.files? Array.from(e.target.files).map(f=>f.name):[];
              setImages(prev=>[...prev, ...names]);
            }} />
            <button className="btn btn-outline" onClick={()=>alert("تمت إضافة الأسماء. اربط نظام الرفع الفعلي في الخادم لحفظ الملفات.")}>رفع الصور</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.map((n,i)=>(
              <div key={i} className={`border rounded overflow-hidden relative ${i===coverIndex?'ring-2 ring-emerald-500':''}`}>
                <div className="h-24 flex items-center justify-center bg-gray-50 text-xs">{n}</div>
                <button onClick={()=>setCoverIndex(i)} className="absolute top-1 right-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                  {i===coverIndex? "الغلاف" : "تعيين غلاف"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* نشر وأرشفة */}
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)} />نشر المبنى</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={archived} onChange={e=>setArchived(e.target.checked)} />أرشفة المبنى</label>
        </div>
      </section>

      {/* عدادات وخدمات المبنى */}
      <section className="border rounded-2xl p-3 space-y-3">
        <div className="font-semibold">عدادات وخدمات المبنى</div>
        <div className="grid sm:grid-cols-3 gap-2">
          <input className="form-input" placeholder="عداد الكهرباء" value={bPower} onChange={e=>setBPower(e.target.value)} />
          <input className="form-input" placeholder="صورة الكهرباء" value={bPowerImg} onChange={e=>setBPowerImg(e.target.value)} />
          <select className="form-input" value={bPowerVis} onChange={e=>setBPowerVis(e.target.value as Visibility)}>
            <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
          </select>

          <input className="form-input" placeholder="عداد الماء" value={bWater} onChange={e=>setBWater(e.target.value)} />
          <input className="form-input" placeholder="صورة الماء" value={bWaterImg} onChange={e=>setBWaterImg(e.target.value)} />
          <select className="form-input" value={bWaterVis} onChange={e=>setBWaterVis(e.target.value as Visibility)}>
            <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
          </select>

          <input className="form-input" placeholder="الهاتف/الإنترنت" value={bPhone} onChange={e=>setBPhone(e.target.value)} />
          <input className="form-input" placeholder="صورة الهاتف" value={bPhoneImg} onChange={e=>setBPhoneImg(e.target.value)} />
          <select className="form-input" value={bPhoneVis} onChange={e=>setBPhoneVis(e.target.value as Visibility)}>
            <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="font-semibold">بيانات أخرى</div>
          <button className="btn btn-outline" onClick={()=>setExtras(x=>[...x,{label:"وصف",value:"",visibility:"private"}])}>+ إضافة بيان</button>
          {extras.map((row,idx)=>(
            <div key={idx} className="grid sm:grid-cols-4 gap-2">
              <input className="form-input" placeholder="العنوان" value={row.label} onChange={e=>setExtras(prev=> prev.map((r,i)=> i===idx?{...r,label:e.target.value}:r))}/>
              <input className="form-input" placeholder="القيمة" value={row.value} onChange={e=>setExtras(prev=> prev.map((r,i)=> i===idx?{...r,value:e.target.value}:r))}/>
              <input className="form-input" placeholder="صورة" value={row.image||""} onChange={e=>setExtras(prev=> prev.map((r,i)=> i===idx?{...r,image:e.target.value}:r))}/>
              <select className="form-input" value={row.visibility} onChange={e=>setExtras(prev=> prev.map((r,i)=> i===idx?{...r,visibility:e.target.value as Visibility}:r))}>
                <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* الوحدات: نفس صفحة الإدخال مع جلب القيم للترميم */}
      <section className="border rounded-2xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">الوحدات</div>
          <button className="btn btn-outline" onClick={addUnit}>+ إضافة وحدة</button>
        </div>

        {units.map((u,idx)=>(
          <div key={u.id} className="border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">وحدة {u.unitNo}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!u.published} onChange={e=>setUnit(idx,{published:e.target.checked})}/> نشر
                </label>
                <button className="btn btn-outline btn-sm" onClick={()=>removeUnit(idx)}>حذف</button>
              </div>
            </div>

            <div className="grid sm:grid-cols-4 gap-2">
              <input className="form-input" placeholder="رقم الوحدة" value={u.unitNo} onChange={e=>setUnit(idx,{unitNo:e.target.value})}/>
              <input className="form-input" type="number" placeholder="الإيجار الشهري" value={u.rentAmount||0} onChange={e=>setUnit(idx,{rentAmount:Number(e.target.value||0)})}/>
              <input className="form-input" placeholder="العملة" value={u.currency||"OMR"} onChange={e=>setUnit(idx,{currency:e.target.value})}/>
              <select className="form-input" value={u.status||"vacant"} onChange={e=>setUnit(idx,{status:e.target.value as any})}>
                <option value="vacant">شاغر</option><option value="reserved">محجوز</option><option value="leased">مؤجر</option>
              </select>

              <input className="form-input" placeholder="عداد الكهرباء" value={u.powerMeter||""} onChange={e=>setUnit(idx,{powerMeter:e.target.value})}/>
              <input className="form-input" placeholder="عداد الماء" value={u.waterMeter||""} onChange={e=>setUnit(idx,{waterMeter:e.target.value})}/>
              <input className="form-input" placeholder="رابط صورة رئيسية" value={u.image||""} onChange={e=>setUnit(idx,{image:e.target.value})}/>
              <input className="form-input" type="file" multiple accept="image/*" onChange={(e)=>{
                const names = e.target.files? Array.from(e.target.files).map(f=>f.name):[];
                setUnit(idx,{ images:[...(u.images||[]), ...names] });
              }}/>

              <input className="form-input sm:col-span-4" placeholder="مزايا مفصولة بفواصل" value={(u.features||[]).join(", ")} onChange={(e)=>setUnit(idx,{features:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}/>
            </div>

            {!!u.images?.length && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {u.images.map((n,i)=>(
                  <div key={i} className="h-20 bg-gray-50 border rounded flex items-center justify-center text-xs">{n}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );

  function shell(children:JSX.Element){
    return (
      <div className="min-h-screen flex flex-col">
        <Head><title>تعديل مبنى</title></Head>
        <Header />
        <main className="container mx-auto p-4 flex-1">{children}</main>
        <Footer />
      </div>
    );
  }
}
