// src/pages/admin/buildings/new.tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useMemo, useState } from "react";
import Link from "next/link";

type Visibility = "private"|"public"|"tenant";
type ExtraRow = { label:string; value:string; image?:string; visibility:Visibility };

type Unit = {
  unitNo:string;
  type:"apartment"|"villa"|"house"|"shop"|"other";
  rentAmount?:number; currency?:string;
  powerMeter?:string; powerImage?:string;
  waterMeter?:string; waterImage?:string;
  hasInternet?:boolean; hasParking?:boolean; parkingCount?:number;
  area?:number; rooms?:number; baths?:number; hall?:number;
  amenities?: string[];
  image?: string;
  allowedPeriods?: ("daily"|"weekly"|"monthly"|"quarterly"|"semiannual"|"annual")[];
};

export default function NewBuildingPage(){
  const [buildingNo,setBuildingNo]=useState("");
  const [address,setAddress]=useState("");
  const [unitsCount,setUnitsCount]=useState<number>(1);

  // وسائط المبنى
  const [imageFiles,setImageFiles]=useState<FileList|null>(null);
  const [images,setImages]=useState<string[]>([]);
  const [coverIndex,setCoverIndex]=useState<number>(0);
  const [video,setVideo]=useState<string>("");

  const [uploading,setUploading]=useState(false);

  // خدمات المبنى
  const [bPower,setBPower]=useState(""); const [bPowerImg,setBPowerImg]=useState<string>("");
  const [bPowerVis,setBPowerVis]=useState<Visibility>("private");
  const [bWater,setBWater]=useState(""); const [bWaterImg,setBWaterImg]=useState<string>("");
  const [bWaterVis,setBWaterVis]=useState<Visibility>("private");
  const [bPhone,setBPhone]=useState(""); const [bPhoneImg,setBPhoneImg]=useState<string>("");
  const [bPhoneVis,setBPhoneVis]=useState<Visibility>("private");
  const [extras,setExtras]=useState<ExtraRow[]>([]);

  const [units,setUnits]=useState<Unit[]>([blankUnit(1)]);

  function blankUnit(i:number): Unit {
    return {
      unitNo: String(i),
      type: "apartment",
      currency:"OMR",
      amenities: [],
      allowedPeriods:["daily","weekly","monthly","quarterly","semiannual","annual"]
    };
  }
  function regen(n:number){ const arr: Unit[]=[]; for(let i=0;i<n;i++) arr.push(blankUnit(i+1)); setUnits(arr); }

  function onPickImages(fl: FileList | null){ if(!fl||!fl.length) return; setImageFiles(fl); }
  async function doUpload(){
    if(!imageFiles || imageFiles.length<4){ alert("اختر 4 صور على الأقل"); return; }
    setUploading(true);
    try{
      const names = Array.from(imageFiles).map(f=>f.name);
      setImages(names);
      if(coverIndex>=names.length) setCoverIndex(0);
      alert("تم تسجيل الصور محليًا. احرص على رفعها فعليًا إلى /public/uploads/");
    } finally{ setUploading(false); }
  }
  const previews = useMemo(()=> {
    if(!imageFiles) return [];
    return Array.from(imageFiles).map(f=> URL.createObjectURL(f));
  },[imageFiles]);

  function addExtra(){ setExtras(x=>[...x,{label:"",value:"",visibility:"private"}]); }
  function setExtra(i:number, patch: Partial<ExtraRow>){ setExtras(prev=>prev.map((e,idx)=> idx===i?{...e,...patch}:e)); }
  function removeExtra(i:number){ setExtras(prev=>prev.filter((_,idx)=>idx!==i)); }

  function togglePeriod(idx:number, val: Required<Unit>["allowedPeriods"][number]){
    setUnits(prev=>{ const out=[...prev]; const u={...out[idx]}; const s=new Set(u.allowedPeriods||[]); s.has(val)?s.delete(val):s.add(val); u.allowedPeriods=Array.from(s); out[idx]=u; return out; });
  }
  function copyUnitFromFirst(toIndex:number){
    if (toIndex<=0 || !units[0]) return;
    setUnits(prev=>{
      const base=prev[0], target=prev[toIndex];
      const cloned:Unit={...target, powerMeter:target.powerMeter||"", waterMeter:target.waterMeter||"", powerImage:"", waterImage:"",
        type:base.type, rentAmount:base.rentAmount, currency:base.currency, hasInternet:base.hasInternet, hasParking:base.hasParking, parkingCount:base.parkingCount,
        area:base.area, rooms:base.rooms, baths:base.baths, hall:base.hall, amenities:base.amenities?[...base.amenities]:[], image:base.image, allowedPeriods:base.allowedPeriods?[...base.allowedPeriods]:target.allowedPeriods};
      const out=[...prev]; out[toIndex]=cloned; return out;
    });
  }

  async function save(){
    if(!buildingNo || !address) return alert("أدخل رقم وعنوان المبنى");
    if(!images.length) return alert("اضغط زر رفع الوسائط بعد اختيار الصور");
    if(images.length<4) return alert("يجب 4 صور على الأقل");

    if(!bWater){
      const ok = confirm("لم تُدخل رقم عداد الماء. هل تريد المتابعة؟");
      if(!ok) return;
    }
    for(const u of units){ if(!u.powerMeter || !u.waterMeter) return alert("عداد الكهرباء والماء للوحدات إلزامي."); }

    const body = {
      buildingNo, address, unitsCount,
      images, coverIndex, video,
      services:{ powerMeter:bPower, powerImage:bPowerImg, powerVisibility:bPowerVis,
        waterMeter:bWater, waterImage:bWaterImg, waterVisibility:bWaterVis,
        phoneMeter:bPhone, phoneImage:bPhoneImg, phoneVisibility:bPhoneVis, others:extras },
      units
    };
    const r = await fetch("/api/buildings",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if(r.ok){ window.location.href="/admin/properties"; } else alert(d?.error||"فشل الحفظ");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>إدخال بيانات مبنى</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">إدخال بيانات مبنى</h1>
          <Link href="/admin/properties" className="btn">رجوع</Link>
        </div>

        {/* صور وفيديو + زر الرفع + الغلاف + معاينة فورية */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">صور وفيديو المبنى</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="text-sm">اختر 4 صور على الأقل</label>
              <input className="form-input" type="file" multiple accept="image/*" onChange={e=>onPickImages(e.target.files)} />
              <div className="text-xs mt-1">{imageFiles?.length||0} صورة مختارة</div>
              <button className="btn btn-primary mt-2" onClick={doUpload} disabled={uploading}>{uploading?"جارٍ الرفع…":"رفع الوسائط"}</button>

              {/* معاينة فورية من FileList */}
              {!!previews.length && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {previews.map((src,i)=>(
                    <div key={i} className={`border rounded overflow-hidden relative ${i===coverIndex?'ring-2 ring-emerald-500':''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-24 w-full object-cover" />
                      <button onClick={()=>setCoverIndex(i)} className="absolute top-1 right-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                        {i===coverIndex? "الغلاف" : "تعيين غلاف"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm">فيديو المبنى (اختياري)</label>
              <input className="form-input" type="file" accept="video/*" onChange={e=>setVideo(e.target.files?.[0]?.name||"")} />
              {video && <div className="text-xs mt-1">{video}</div>}
            </div>
          </div>
        </section>

        {/* عدادات وخدمات المبنى */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">عدادات وخدمات المبنى</div>

          <div className="grid sm:grid-cols-[1fr_1fr_160px] gap-2">
            <input className="form-input" placeholder="عداد الكهرباء (للمبنى)" value={bPower} onChange={e=>setBPower(e.target.value)} />
            <input className="form-input" type="file" accept="image/*" onChange={e=>setBPowerImg(e.target.files?.[0]?.name||"")} />
            <select className="form-input" value={bPowerVis} onChange={e=>setBPowerVis(e.target.value as Visibility)}>
              <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-[1fr_1fr_160px] gap-2">
            <input className="form-input" placeholder="عداد الماء (اختياري)" value={bWater} onChange={e=>setBWater(e.target.value)} />
            <input className="form-input" type="file" accept="image/*" onChange={e=>setBWaterImg(e.target.files?.[0]?.name||"")} />
            <select className="form-input" value={bWaterVis} onChange={e=>setBWaterVis(e.target.value as Visibility)}>
              <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-[1fr_1fr_160px] gap-2">
            <input className="form-input" placeholder="الهاتف/الإنترنت (اختياري)" value={bPhone} onChange={e=>setBPhone(e.target.value)} />
            <input className="form-input" type="file" accept="image/*" onChange={e=>setBPhoneImg(e.target.files?.[0]?.name||"")} />
            <select className="form-input" value={bPhoneVis} onChange={e=>setBPhoneVis(e.target.value as Visibility)}>
              <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="font-semibold">بيانات أخرى</div>
            <button className="btn btn-outline btn-sm" onClick={addExtra}>إضافة بيان</button>
            {extras.map((row,idx)=>(
              <div key={idx} className="grid sm:grid-cols-5 gap-2 items-center">
                <input className="form-input" placeholder="العنوان" value={row.label} onChange={e=>setExtra(idx,{label:e.target.value})}/>
                <input className="form-input sm:col-span-2" placeholder="الوصف" value={row.value} onChange={e=>setExtra(idx,{value:e.target.value})}/>
                <input className="form-input" type="file" accept="image/*" onChange={e=>setExtra(idx,{image: e.target.files?.[0]?.name})}/>
                <select className="form-input" value={row.visibility} onChange={e=>setExtra(idx,{visibility: e.target.value as Visibility})}>
                  <option value="private">خاص</option><option value="public">مرئي للجميع</option><option value="tenant">مرئي للمستأجر</option>
                </select>
                <button className="btn btn-outline btn-sm" onClick={()=>removeExtra(idx)}>حذف</button>
              </div>
            ))}
          </div>
        </section>

        {/* أساسيات + عدد وحدات */}
        <div className="grid sm:grid-cols-3 gap-2">
          <input className="form-input" placeholder="رقم المبنى" value={buildingNo} onChange={e=>setBuildingNo(e.target.value)} />
          <input className="form-input sm:col-span-2" placeholder="عنوان المبنى" value={address} onChange={e=>setAddress(e.target.value)} />
          <div className="sm:col-span-3">
            <label className="text-sm">كم عدد الوحدات في المبنى؟</label>
            <input className="form-input" type="number" min={1} value={unitsCount} onChange={e=>{ const v=Math.max(1, Number(e.target.value||1)); setUnitsCount(v); regen(v); }} />
          </div>
        </div>

        {/* وحدات */}
        {units.map((u,idx)=>(
          <div key={idx} className="border rounded-2xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">الوحدة #{u.unitNo}</div>
              {idx>0 && (
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm" onClick={()=>copyUnitFromFirst(idx)}>نسخ بيانات #1</button>
                  <button className="btn btn-outline btn-sm" onClick={()=>{ if (idx<units.length-1) document.getElementById(`unit-${idx+2}`)?.scrollIntoView({behavior:"smooth"})}}>التالي →</button>
                </div>
              )}
            </div>
            <div id={`unit-${idx+1}`} />

            {/* رقم الوحدة + النوع + الإيجار + فترات */}
            <div className="grid sm:grid-cols-4 gap-2">
              <input className="form-input" placeholder="رقم الوحدة" value={u.unitNo} onChange={e=>update(idx,{unitNo:e.target.value})}/>
              <select className="form-input" value={u.type} onChange={e=>update(idx,{type:e.target.value as Unit["type"]})}>
                <option value="apartment">شقة</option><option value="villa">فيلا</option><option value="house">منزل</option><option value="shop">محل</option><option value="other">أخرى</option>
              </select>
              <input className="form-input" type="number" placeholder="القيمة الإيجارية الشهرية" value={u.rentAmount||""} onChange={e=>update(idx,{rentAmount:num(e.target.value)})}/>
              <div className="flex items-center gap-2">
                {(["daily","weekly","monthly","quarterly","semiannual","annual"] as const).map(p=>(
                  <label key={p} className="text-xs inline-flex items-center gap-1">
                    <input type="checkbox" checked={u.allowedPeriods?.includes(p)||false} onChange={()=>togglePeriod(idx,p)} />{labelPeriod(p)}
                  </label>
                ))}
              </div>
            </div>

            {/* عدادات وصورها */}
            <div className="grid sm:grid-cols-4 gap-2">
              <input className="form-input" placeholder="عداد الكهرباء (إلزامي)" value={u.powerMeter||""} onChange={e=>update(idx,{powerMeter:e.target.value})}/>
              <input className="form-input" type="file" accept="image/*" onChange={e=>update(idx,{powerImage: e.target.files?.[0]?.name})}/>
              <input className="form-input" placeholder="عداد الماء (إلزامي)" value={u.waterMeter||""} onChange={e=>update(idx,{waterMeter:e.target.value})}/>
              <input className="form-input" type="file" accept="image/*" onChange={e=>update(idx,{waterImage: e.target.files?.[0]?.name})}/>
            </div>
            <div className="text-xs text-gray-600">صور العدادات اختيارية هنا. تصبح إلزامية عند التأجير.</div>

            {/* مواصفات */}
            <div className="grid sm:grid-cols-4 gap-2">
              <input className="form-input" type="number" placeholder="المساحة" value={u.area||""} onChange={e=>update(idx,{area:num(e.target.value)})}/>
              <input className="form-input" type="number" placeholder="الغرف" value={u.rooms||""} onChange={e=>update(idx,{rooms:num(e.target.value)})}/>
              <input className="form-input" type="number" placeholder="الحمامات" value={u.baths||""} onChange={e=>update(idx,{baths:num(e.target.value)})}/>
              <input className="form-input" type="number" placeholder="الصالـة" value={u.hall||""} onChange={e=>update(idx,{hall:num(e.target.value)})}/>
            </div>
            <div className="grid sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!u.hasInternet} onChange={e=>update(idx,{hasInternet:e.target.checked})}/>إنترنت</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!u.hasParking} onChange={e=>update(idx,{hasParking:e.target.checked})}/>موقف خاص</label>
              <input className="form-input" type="number" placeholder="عدد المواقف" value={u.parkingCount||""} onChange={e=>update(idx,{parkingCount:num(e.target.value)})}/>
              <input className="form-input" type="file" accept="image/*" onChange={e=>update(idx,{image: e.target.files?.[0]?.name})}/>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold">مميزات وخدمات أخرى</div>
              <Tags value={u.amenities||[]} onChange={(arr)=>update(idx,{amenities:arr})}/>
            </div>
          </div>
        ))}

        <button className="btn btn-primary" onClick={save}>حفظ المبنى ووحداته</button>
      </main>
      <Footer />
    </div>
  );

  function num(v:any){ const n=Number(v||0); return Number.isFinite(n)? n: 0; }
  function update(i:number, patch: Partial<Unit>){ setUnits(prev=> prev.map((u,idx)=> idx===i? { ...u, ...patch }: u)); }
  function labelPeriod(p:Required<Unit>["allowedPeriods"][number]){ switch(p){ case "daily":return"يومي"; case "weekly":return"أسبوعي"; case "monthly":return"شهري"; case "quarterly":return"ربع سنوي"; case "semiannual":return"6 أشهر"; case "annual":return"سنوي"; } }
}

function Tags({value,onChange}:{value:string[]; onChange:(v:string[])=>void}){
  const [txt,setTxt]=useState("");
  function add(){ if(!txt.trim()) return; onChange([...(value||[]), txt.trim()]); setTxt(""); }
  function remove(i:number){ const cp=[...value]; cp.splice(i,1); onChange(cp); }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input className="form-input flex-1" placeholder="أدخل اسم الخدمة/الميزة ثم أضف" value={txt} onChange={e=>setTxt(e.target.value)} />
        <button className="btn btn-outline" onClick={add}>أضف</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value?.map((t,i)=>(
          <span key={i} className="inline-flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm">
            {t} <button className="text-red-600" onClick={()=>remove(i)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
