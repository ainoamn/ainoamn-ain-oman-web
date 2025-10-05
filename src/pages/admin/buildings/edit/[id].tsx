// src/pages/admin/buildings/edit/[id].tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Visibility = "private" | "public" | "tenant";
type ExtraRow = { label: string; value: string; image?: string; visibility: Visibility };
type Unit = {
  id: string;
  unitNo: string;
  serialNo?: string;
  type?: string;
  area?: number;
  rentAmount?: number;
  status?: "vacant" | "reserved" | "leased";
  published?: boolean;
  image?: string;
  images?: string[];
  powerMeter?: string;
  waterMeter?: string;
  features?: string[];
};
type Building = {
  id: string;
  buildingNo: string;
  address: string;
  published?: boolean;
  archived?: boolean;
  images?: string[];
  coverIndex?: number;
  geo?: any;
  services?: any;
  units?: Unit[];
};

function resolveSrc(name?: string) {
  if (!name) return "";
  if (name.startsWith("http") || name.startsWith("data:") || name.startsWith("/")) return name;
  return `/api/upload?name=${encodeURIComponent(name)}`;
}
function uid(p = "ID") {
  return `${p}-${Date.now()}-${Math.floor(Math.random()*1e5)}`;
}

export default function EditBuildingPage() {
  const { query, push } = useRouter();
  const id = String(Array.isArray(query.id)? query.id[0]: query.id || "");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [b, setB] = useState<Building | null>(null);
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  function onPick(files: FileList | null) {
    if (!files) return;
    setLocalFiles(p=>[...p, ...Array.from(files)]);
  }

  async function uploadPicked() {
    if (localFiles.length===0) return alert("اختر صورًا أولًا");
    const payload = await Promise.all(localFiles.map(f => new Promise<any>(res => {
      const fr = new FileReader(); fr.onload = ()=>res({ name:f.name, type:f.type, data:String(fr.result).split(",")[1]||"" }); fr.readAsDataURL(f);
    })));
    const r = await fetch("/api/upload",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ files: payload })});
    if (!r.ok) return alert("فشل رفع الصور");
    const d = await r.json(); const names: string[] = d?.names || [];
    setB(prev => prev ? { ...prev, images: [ ...(prev.images||[]), ...names ] } : prev);
    setLocalFiles([]);
  }

  useEffect(()=> {
    if (!id) return;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`);
        const d = await r.json();
        if (!r.ok) throw new Error();
        setB(d.item as Building);
      } catch {
        setErr("تعذّر جلب بيانات المبنى");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function save() {
    if (!b) return;
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "updateBuilding", data: b }),
    });
    if (r.ok) { 
      alert("تم حفظ التعديلات بنجاح"); 
    } else {
      alert("فشل في حفظ التعديلات");
    }
  }

  async function togglePublishUnit(unitNo: string, published: boolean) {
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "publishUnitByNo", unitNo, published }),
    });
    if (r.ok) {
      const d = await r.json();
      setB(d.item);
    } else alert("فشل في تحديث حالة النشر للوحدة");
  }

  async function togglePublishBuilding(published: boolean) {
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "publishBuilding", published }),
    });
    if (r.ok) {
      const d = await r.json();
      setB(d.item);
    } else alert("فشل في تحديث حالة النشر للمبنى");
  }

  async function toggleArchive(archived: boolean) {
    const r = await fetch(`/api/buildings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "archiveBuilding", archived }),
    });
    if (r.ok) {
      const d = await r.json();
      setB(d.item);
    } else alert("فشل في عملية الأرشفة");
  }

  const coverSrc = useMemo(()=> resolveSrc(b?.images?.[b?.coverIndex ?? 0] || b?.images?.[0]), [b?.images, b?.coverIndex]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>تعديل بيانات المبنى</title>
      </Head>
      <Header />
      
      <main className="flex-1 container mx-auto p-4 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تعديل بيانات المبنى</h1>
              <p className="text-gray-600 mt-1">رقم المبنى: {b?.buildingNo}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/admin/properties" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 px-4 py-2.5 rounded-lg font-medium text-center">
                رجوع للقائمة
              </Link>
              
              <button 
                className={`btn px-4 py-2.5 rounded-lg font-medium ${
                  b?.archived 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
                onClick={()=>toggleArchive(!b?.archived)}
              >
                {b?.archived ? "إلغاء الأرشفة" : "أرشفة المبنى"}
              </button>
              
              <label className="inline-flex items-center gap-2 text-sm bg-blue-50 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-blue-100">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={!!b?.published} 
                  onChange={e=>togglePublishBuilding(e.target.checked)} 
                />
                <span className="font-medium text-gray-700">نشر المبنى</span>
              </label>
              
              <button 
                className="btn btn-primary bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
                onClick={save}
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">جارٍ تحميل بيانات المبنى...</p>
          </div>
        ) : err ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في التحميل</h3>
            <p className="text-gray-600">{err}</p>
            <button 
              className="btn bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg mt-4"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : !b ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">المبنى غير موجود</h3>
            <p className="text-gray-600">لم يتم العثور على المبنى المطلوب</p>
            <Link href="/admin/properties" className="btn bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg mt-4 inline-block">
              العودة للقائمة
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* البيانات الأساسية */}
            <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <h2 className="text-lg font-semibold text-gray-900">البيانات الأساسية</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم المبنى</label>
                    <input 
                      className="form-input w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={b.buildingNo} 
                      onChange={e=>setB({...b, buildingNo: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المبنى</label>
                    <input 
                      className="form-input w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={b.address} 
                      onChange={e=>setB({...b, address: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* الوسائط */}
            <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🖼️</span>
                  <h2 className="text-lg font-semibold text-gray-900">وسائط المبنى</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="form-input flex-1 rounded-lg border-gray-300"
                    onChange={e=>onPick(e.target.files)} 
                  />
                  <button 
                    className="btn bg-green-600 text-white hover:bg-green-700 px-4 py-2.5 rounded-lg font-medium"
                    onClick={uploadPicked}
                  >
                    رفع الصور المحددة
                  </button>
                </div>

                {b.images && b.images.length > 0 && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">الصور الحالية للمبنى</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {b.images.map((n, i)=>(
                          <div 
                            key={i} 
                            className={`relative rounded-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 ${
                              i === (b.coverIndex ?? 0) ? "ring-3 ring-blue-500 ring-offset-2" : "border border-gray-200"
                            }`}
                          >
                            <img src={resolveSrc(n)} className="h-24 w-full object-cover" alt="" />
                            <button 
                              className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium transition-all bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                              onClick={()=>setB(prev => prev ? { ...prev, coverIndex: i } : prev)}
                            >
                              {i === (b.coverIndex ?? 0) ? "🖼️ غلاف" : "تعيين غلاف"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {coverSrc && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border-2 border-blue-300">
                          <img src={coverSrc} className="w-full h-full object-cover" alt="صورة الغلاف" />
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">صورة الغلاف الحالية</div>
                          <div className="text-sm text-blue-700">سيتم استخدام هذه الصورة كصورة رئيسية للمبنى</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* الوحدات */}
            <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏠</span>
                  <h2 className="text-lg font-semibold text-gray-900">وحدات المبنى</h2>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {b.units?.length || 0} وحدة
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(b.units || []).map((u, idx)=>(
                    <div key={u.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              وحدة {u.unitNo}
                            </span>
                            {u.type && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">{u.type}</span>}
                            {u.area && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">{u.area} م²</span>}
                            {u.rentAmount && (
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm">
                                {new Intl.NumberFormat("ar-OM",{minimumFractionDigits:3,maximumFractionDigits:3}).format(u.rentAmount)} ر.ع
                              </span>
                            )}
                          </div>
                          
                          <label className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              checked={!!u.published} 
                              onChange={e=>togglePublishUnit(u.unitNo, e.target.checked)} 
                            />
                            <span className="text-sm font-medium text-gray-700">نشر الوحدة</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الوحدة</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              value={u.unitNo} 
                              onChange={e=>{
                                const v = e.target.value;
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, unitNo: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الرقم التسلسلي</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              value={u.serialNo || ""} 
                              onChange={e=>{
                                const v = e.target.value;
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, serialNo: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوحدة</label>
                            <select 
                              className="form-input w-full rounded-lg border-gray-300"
                              value={u.type || "شقة"} 
                              onChange={e=>{
                                const v = e.target.value;
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, type: v } : uu)} : prev);
                              }}
                            >
                              <option>شقة</option>
                              <option>فيلا</option>
                              <option>محل</option>
                              <option>مكتب</option>
                              <option>أرض</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المساحة (م²)</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              type="number" 
                              value={u.area || 0} 
                              onChange={e=>{
                                const v = Number(e.target.value||0);
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, area: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الإيجار الشهري</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              type="number" 
                              value={u.rentAmount ?? ""} 
                              onChange={e=>{
                                const v = e.target.value===""? undefined: Number(e.target.value);
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, rentAmount: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">عداد الكهرباء</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              value={u.powerMeter || ""} 
                              onChange={e=>{
                                const v = e.target.value;
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, powerMeter: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">عداد الماء</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              value={u.waterMeter || ""} 
                              onChange={e=>{
                                const v = e.target.value;
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, waterMeter: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">صورة رئيسية</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              value={u.image || ""} 
                              onChange={e=>{
                                const v = e.target.value;
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, image: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                          
                          <div className="md:col-span-2 lg:col-span-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">مزايا الوحدة</label>
                            <input 
                              className="form-input w-full rounded-lg border-gray-300"
                              placeholder="أدخل مزايا الوحدة مفصولة بفواصل"
                              value={(u.features||[]).join(", ")} 
                              onChange={e=>{
                                const v = e.target.value.split(",").map(s=>s.trim()).filter(Boolean);
                                setB(prev => prev ? { ...prev, units: prev.units!.map((uu,i)=> i===idx ? { ...uu, features: v } : uu)} : prev);
                              }} 
                            />
                          </div>
                        </div>

                        {u.images && u.images.length > 0 && (
                          <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">صور الوحدة</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {u.images.map((n, i)=>(
                                <div key={i} className="h-20 bg-gray-50 border rounded-lg overflow-hidden">
                                  <img src={resolveSrc(n)} className="w-full h-full object-cover" alt="" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}