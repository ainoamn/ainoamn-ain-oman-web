// src/pages/admin/buildings/new.tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Visibility = "private" | "public" | "tenant";
type ExtraRow = { label: string; value: string; image?: string; visibility: Visibility };

type License = {
  id: string;
  kind: string;
  number: string;
  expiry: string;
  attachment?: string;
};
type PersonDoc = {
  id: string;
  docType: string;
  docNumber: string;
  attachment?: string;
  expiry?: string;
};
type Party = {
  category: "فرد" | "شركة";
  nationalIdOrCR: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  address: string;
  docs: PersonDoc[];
  agencyNumber?: string;
  agencyExpiry?: string;
  agencyAttachment?: string;
};

type Unit = {
  id: string;
  unitNo: string;
  serialNo?: string;
  type?: string;
  area?: number;
  rentAmount?: number;
  currency?: string;
  status?: "vacant" | "reserved" | "leased";
  published?: boolean;
  image?: string;
  powerMeter?: string;
  waterMeter?: string;
  images?: string[];
  features?: string[];
};

function uid(p = "ID") {
  return `${p}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}
function resolveSrc(name?: string) {
  if (!name) return "";
  if (/^https?:\/\//.test(name) || name.startsWith("data:") || name.startsWith("/")) return name;
  return `/api/upload?name=${encodeURIComponent(name)}`;
}

export default function NewBuildingPage() {
  const { push } = useRouter();

  // توجيه ما بعد الحفظ
  const [afterSave, setAfterSave] = useState<"edit" | "list" | "stay">("edit");

  // نشر وأرشفة
  const [published, setPublished] = useState(false);
  const [archived, setArchived] = useState(false);

  // بيانات أساسية للمبنى
  const [buildingNo, setBuildingNo] = useState("");
  const [address, setAddress] = useState("");

  // عدد الوحدات
  const [unitsCount, setUnitsCount] = useState<number>(1);

  // بيانات موقعية وبلدية
  const [landNo, setLandNo] = useState("");
  const [mapNo, setMapNo] = useState("");
  const [landUse, setLandUse] = useState("");
  const [blockNo, setBlockNo] = useState("");
  const [buildingSerial, setBuildingSerial] = useState("");
  const [roadNo, setRoadNo] = useState("");
  const [province, setProvince] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [village, setVillage] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [buildingArea, setBuildingArea] = useState<number | "">("");

  // تراخيص
  const [licenses, setLicenses] = useState<License[]>([]);

  // خدمات المبنى وعداداته
  const [bPower, setBPower] = useState("");
  const [bPowerImg, setBPowerImg] = useState<string>("");
  const [bPowerVis, setBPowerVis] = useState<Visibility>("private");
  const [bWater, setBWater] = useState("");
  const [bWaterImg, setBWaterImg] = useState<string>("");
  const [bWaterVis, setBWaterVis] = useState<Visibility>("private");
  const [bPhone, setBPhone] = useState("");
  const [bPhoneImg, setBPhoneImg] = useState<string>("");
  const [bPhoneVis, setBPhoneVis] = useState<Visibility>("private");
  const [extras, setExtras] = useState<ExtraRow[]>([]);

  // بيانات المالك والوكيل
  const emptyParty = (): Party => ({
    category: "فرد",
    nationalIdOrCR: "",
    nameAr: "",
    nameEn: "",
    email: "",
    phone: "",
    address: "",
    docs: [],
  });
  const [owner, setOwner] = useState<Party>(emptyParty());
  const [agent, setAgent] = useState<Party>({ ...emptyParty(), agencyNumber: "", agencyExpiry: "", agencyAttachment: "" });

  // الوحدات
  const [units, setUnits] = useState<Unit[]>([
    { id: uid("U"), unitNo: "1", serialNo: "", type: "شقة", area: 0, rentAmount: 0, currency: "OMR", status: "vacant", published: false, images: [], features: [] },
  ]);

  // تزامن عدد الوحدات مع القائمة
  useEffect(() => {
    setUnits((prev) => {
      const next = [...prev];
      if (unitsCount > prev.length) {
        const toAdd = unitsCount - prev.length;
        for (let i = 0; i < toAdd; i++) {
          const idx = next.length + 1;
          next.push({
            id: uid("U"),
            unitNo: String(idx),
            serialNo: "",
            type: "شقة",
            area: 0,
            rentAmount: 0,
            currency: "OMR",
            status: "vacant",
            published: false,
            images: [],
            features: [],
          });
        }
      } else if (unitsCount < prev.length) {
        next.length = unitsCount;
      }
      return next.map((u, i) => ({ ...u, unitNo: String(i + 1) }));
    });
  }, [unitsCount]);

  function setUnit(i: number, patch: Partial<Unit>) {
    setUnits((prev) => prev.map((u, idx) => (idx === i ? { ...u, ...patch } : u)));
  }

  // نسخ بيانات وحدة
  function copyUnitToNext(i: number) {
    if (i >= units.length - 1) return;
    const src = units[i];
    const copied: Partial<Unit> = {
      type: src.type,
      area: src.area,
      rentAmount: src.rentAmount,
      currency: src.currency,
      status: src.status,
      published: src.published,
      image: src.image,
      images: src.images ? [...src.images] : [],
      features: src.features ? [...src.features] : [],
    };
    setUnit(i + 1, copied);
  }
  function copyUnitToAll(i: number) {
    const src = units[i];
    setUnits((prev) =>
      prev.map((u, idx) =>
        idx === i
          ? u
          : {
              ...u,
              type: src.type,
              area: src.area,
              rentAmount: src.rentAmount,
              currency: src.currency,
              status: src.status,
              published: src.published,
              image: src.image,
              images: src.images ? [...src.images] : [],
              features: src.features ? [...src.features] : [],
            }
      )
    );
  }

  // وسائط ومعاينات ورفع فعلي
  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  function onPickImages(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files);
    setLocalFiles((p) => [...p, ...list]);
  }

  async function uploadPicked() {
    if (localFiles.length === 0) {
      alert("اختر صورًا أولاً.");
      return;
    }
    const payload = await Promise.all(
      localFiles.map(
        (f) =>
          new Promise<any>((resolve) => {
            const fr = new FileReader();
            fr.onload = () => resolve({ name: f.name, type: f.type, data: String(fr.result).split(",")[1] || "" });
            fr.readAsDataURL(f);
          })
      )
    );
    const r = await fetch("/api/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ files: payload }) });
    if (!r.ok) {
      alert("فشل رفع الصور");
      return;
    }
    const d = await r.json();
    const names: string[] = Array.isArray(d?.names) ? d.names : [];
    setImages((prev) => [...prev, ...names]);
    setLocalFiles([]);
    if (coverIndex >= images.length + names.length) setCoverIndex(0);
  }

  // مرفقات التراخيص والمستندات
  async function uploadSingleFile(file: File, onDone: (storedName: string) => void) {
    const fr = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    });
    const data = fr.split(",")[1] || "";
    const resp = await fetch("/api/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ files: [{ name: file.name, type: file.type, data }] }),
    });
    if (!resp.ok) {
      alert("فشل رفع الملف");
      return;
    }
    const dj = await resp.json();
    const name = Array.isArray(dj?.names) ? dj.names[0] : "";
    if (name) onDone(name);
  }

  async function save() {
    if (!bWater && !confirm("لم يتم إدخال رقم عداد الماء. هل تريد المتابعة؟")) return;
    if (published && images.length < 4) {
      alert("النشر يتطلب 4 صور على الأقل. ارفع الصور ثم أعد المحاولة.");
      return;
    }

    const payload = {
      buildingNo,
      address,
      images,
      coverIndex,
      published,
      archived,
      geo: {
        landNo,
        mapNo,
        landUse,
        blockNo,
        buildingSerial,
        roadNo,
        province,
        state,
        city,
        village,
        municipality,
        buildingArea,
      },
      licenses,
      services: {
        powerMeter: bPower,
        powerImage: bPowerImg,
        powerVisibility: bPowerVis,
        waterMeter: bWater,
        waterImage: bWaterImg,
        waterVisibility: bWaterVis,
        phoneMeter: bPhone,
        phoneImage: bPhoneImg,
        phoneVisibility: bPhoneVis,
        others: extras,
      },
      owner,
      agent,
      units,
    };

    const r = await fetch(`/api/buildings`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (r.ok) {
      const d = await r.json();
      alert("تم الحفظ");
      if (afterSave === "edit" && d?.item?.id) {
        location.assign(`/admin/buildings/edit/${encodeURIComponent(d.item.id)}`);
      } else if (afterSave === "list") {
        push("/admin/properties");
      } else {
        // stay
      }
    } else {
      alert("فشل الحفظ");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>إدخال مبنى</title>
      </Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">إدخال بيانات مبنى</h1>
          <div className="flex items-center gap-2">
            <select className="form-input" value={afterSave} onChange={(e) => setAfterSave(e.target.value as any)} title="ماذا يحدث بعد الحفظ؟">
              <option value="edit">افتح صفحة التعديل</option>
              <option value="list">اذهب لقائمة العقارات</option>
              <option value="stay">ابق في نفس الصفحة</option>
            </select>
            <Link href="/admin/properties" className="btn">
              رجوع
            </Link>
            <button className="btn btn-primary" onClick={save}>
              حفظ
            </button>
          </div>
        </div>

        {/* البيانات الأساسية + عدد الوحدات */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">البيانات الأساسية</div>
          <div className="grid sm:grid-cols-3 gap-2">
            <input className="form-input" placeholder="رقم المبنى" value={buildingNo} onChange={(e) => setBuildingNo(e.target.value)} />
            <input className="form-input sm:col-span-2" placeholder="العنوان" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input
              className="form-input"
              type="number"
              min={1}
              placeholder="عدد الوحدات"
              value={unitsCount}
              onChange={(e) => setUnitsCount(Math.max(1, Number(e.target.value || 1)))}
            />
          </div>

          {/* موقع وبلدية */}
          <div className="grid sm:grid-cols-3 gap-2">
            <input className="form-input" placeholder="رقم الأرض" value={landNo} onChange={(e) => setLandNo(e.target.value)} />
            <input className="form-input" placeholder="رقم الكروكي" value={mapNo} onChange={(e) => setMapNo(e.target.value)} />
            <input className="form-input" placeholder="نوع استخدام الأرض" value={landUse} onChange={(e) => setLandUse(e.target.value)} />
            <input className="form-input" placeholder="رقم المجمع" value={blockNo} onChange={(e) => setBlockNo(e.target.value)} />
            <input className="form-input" placeholder="رقم المبنى" value={buildingSerial} onChange={(e) => setBuildingSerial(e.target.value)} />
            <input className="form-input" placeholder="رقم الطريق" value={roadNo} onChange={(e) => setRoadNo(e.target.value)} />
            <input className="form-input" placeholder="المحافظة" value={province} onChange={(e) => setProvince(e.target.value)} />
            <input className="form-input" placeholder="الولاية" value={state} onChange={(e) => setState(e.target.value)} />
            <input className="form-input" placeholder="المدينة" value={city} onChange={(e) => setCity(e.target.value)} />
            <input className="form-input" placeholder="القرية" value={village} onChange={(e) => setVillage(e.target.value)} />
            <input className="form-input" placeholder="البلدية" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
            <input
              className="form-input"
              type="number"
              placeholder="مساحة المبنى (م²)"
              value={buildingArea}
              onChange={(e) => setBuildingArea(e.target.value ? +e.target.value : "")}
            />
          </div>
        </section>

        {/* الوسائط: معاينات ورفع فعلي */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">الوسائط</div>
          <div className="flex items-center gap-2">
            <input className="form-input" type="file" multiple accept="image/*" onChange={(e) => onPickImages(e.target.files)} />
            <button className="btn btn-outline" onClick={uploadPicked}>
              رفع الصور
            </button>
          </div>

          {!!images.length && (
            <>
              <div className="text-sm font-medium">الصور المرفوعة</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {images.map((n, i) => (
                  <div key={`up-${i}`} className={`border rounded overflow-hidden relative ${i === coverIndex ? "ring-2 ring-emerald-500" : ""}`}>
                    <img src={resolveSrc(n)} className="h-24 w-full object-cover" alt="" />
                    <button onClick={() => setCoverIndex(i)} className="absolute top-1 right-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                      {i === coverIndex ? "الغلاف" : "تعيين غلاف"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {!!localFiles.length && (
            <>
              <div className="text-sm font-medium">معاينات قبل الرفع</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {localFiles.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <div key={`pre-${i}`} className="border rounded overflow-hidden relative">
                      <img src={url} className="h-24 w-full object-cover" alt="" />
                      <div className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/40 text-white px-1">لم تُرفع بعد</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="grid sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              نشر المبنى
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
              أرشفة المبنى
            </label>
          </div>
        </section>

        {/* تراخيص المبنى */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">التراخيص</div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setLicenses((x) => [...x, { id: uid("LIC"), kind: "ترخيص بناء", number: "", expiry: "", attachment: "" }])}
            >
              + ترخيص
            </button>
          </div>
          {licenses.map((l, idx) => (
            <div key={l.id} className="grid sm:grid-cols-5 gap-2">
              <input className="form-input" placeholder="نوع الترخيص" value={l.kind} onChange={(e) => setLicenses((prev) => prev.map((r, i) => (i === idx ? { ...r, kind: e.target.value } : r)))} />
              <input className="form-input" placeholder="رقم الترخيص" value={l.number} onChange={(e) => setLicenses((prev) => prev.map((r, i) => (i === idx ? { ...r, number: e.target.value } : r)))} />
              <input className="form-input" type="date" placeholder="تاريخ الانتهاء" value={l.expiry} onChange={(e) => setLicenses((prev) => prev.map((r, i) => (i === idx ? { ...r, expiry: e.target.value } : r)))} />
              <input
                className="form-input"
                placeholder="مرفق الترخيص (اسم ملف)"
                value={l.attachment || ""}
                onChange={(e) => setLicenses((prev) => prev.map((r, i) => (i === idx ? { ...r, attachment: e.target.value } : r)))}
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  className="form-input"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    await uploadSingleFile(f, (name) => setLicenses((prev) => prev.map((r, i) => (i === idx ? { ...r, attachment: name } : r))));
                  }}
                />
                <button className="btn btn-outline btn-sm" onClick={() => setLicenses((prev) => prev.filter((_, i) => i !== idx))}>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* بيانات المالك والوكيل */}
        <PartySection title="بيانات المالك" party={owner} setParty={setOwner} includeAgency={false} uploadSingleFile={uploadSingleFile} />
        <PartySection title="بيانات الوكيل" party={agent} setParty={setAgent} includeAgency={true} uploadSingleFile={uploadSingleFile} />

        {/* عدادات وخدمات المبنى */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">عدادات وخدمات المبنى</div>
          <div className="grid sm:grid-cols-3 gap-2">
            <input className="form-input" placeholder="عداد الكهرباء" value={bPower} onChange={(e) => setBPower(e.target.value)} />
            <input className="form-input" placeholder="صورة الكهرباء (اسم ملف)" value={bPowerImg} onChange={(e) => setBPowerImg(e.target.value)} />
            <select className="form-input" value={bPowerVis} onChange={(e) => setBPowerVis(e.target.value as Visibility)}>
              <option value="private">خاص</option>
              <option value="public">مرئي للجميع</option>
              <option value="tenant">مرئي للمستأجر</option>
            </select>

            <input className="form-input" placeholder="عداد الماء" value={bWater} onChange={(e) => setBWater(e.target.value)} />
            <input className="form-input" placeholder="صورة الماء (اسم ملف)" value={bWaterImg} onChange={(e) => setBWaterImg(e.target.value)} />
            <select className="form-input" value={bWaterVis} onChange={(e) => setBWaterVis(e.target.value as Visibility)}>
              <option value="private">خاص</option>
              <option value="public">مرئي للجميع</option>
              <option value="tenant">مرئي للمستأجر</option>
            </select>

            <input className="form-input" placeholder="الهاتف/الإنترنت" value={bPhone} onChange={(e) => setBPhone(e.target.value)} />
            <input className="form-input" placeholder="صورة الهاتف (اسم ملف)" value={bPhoneImg} onChange={(e) => setBPhoneImg(e.target.value)} />
            <select className="form-input" value={bPhoneVis} onChange={(e) => setBPhoneVis(e.target.value as Visibility)}>
              <option value="private">خاص</option>
              <option value="public">مرئي للجميع</option>
              <option value="tenant">مرئي للمستأجر</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="font-semibold">بيانات أخرى</div>
            <button className="btn btn-outline" onClick={() => setExtras((x) => [...x, { label: "وصف", value: "", visibility: "private" }])}>
              + إضافة بيان
            </button>
            {extras.map((row, idx) => (
              <div key={idx} className="grid sm:grid-cols-4 gap-2">
                <input className="form-input" placeholder="العنوان" value={row.label} onChange={(e) => setExtras((prev) => prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)))} />
                <input className="form-input" placeholder="القيمة" value={row.value} onChange={(e) => setExtras((prev) => prev.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r)))} />
                <input className="form-input" placeholder="صورة (اسم ملف)" value={row.image || ""} onChange={(e) => setExtras((prev) => prev.map((r, i) => (i === idx ? { ...r, image: e.target.value } : r)))} />
                <select className="form-input" value={row.visibility} onChange={(e) => setExtras((prev) => prev.map((r, i) => (i === idx ? { ...r, visibility: e.target.value as Visibility } : r)))}>
                  <option value="private">خاص</option>
                  <option value="public">مرئي للجميع</option>
                  <option value="tenant">مرئي للمستأجر</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* الوحدات */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">الوحدات</div>
          {units.map((u, idx) => (
            <div key={u.id} className="border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">وحدة {u.unitNo}</div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => copyUnitToNext(idx)} disabled={idx === units.length - 1}>
                    نسخ للوحدة التالية
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => copyUnitToAll(idx)}>
                    نسخ لكل الوحدات
                  </button>
                  <label className="text-sm inline-flex items-center gap-2">
                    <input type="checkbox" checked={!!u.published} onChange={(e) => setUnit(idx, { published: e.target.checked })} /> نشر
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-2">
                <input className="form-input" placeholder="رقم الوحدة" value={u.unitNo} onChange={(e) => setUnit(idx, { unitNo: e.target.value })} />
                <input className="form-input" placeholder="رقم الوحدة التسلسلي" value={u.serialNo || ""} onChange={(e) => setUnit(idx, { serialNo: e.target.value })} />
                <select className="form-input" value={u.type || "شقة"} onChange={(e) => setUnit(idx, { type: e.target.value })}>
                  <option>شقة</option>
                  <option>فيلا</option>
                  <option>محل</option>
                  <option>مكتب</option>
                  <option>أرض</option>
                </select>
                <input className="form-input" type="number" placeholder="المساحة (م²)" value={u.area || 0} onChange={(e) => setUnit(idx, { area: Number(e.target.value || 0) })} />

                <input className="form-input" placeholder="عداد الكهرباء" value={u.powerMeter || ""} onChange={(e) => setUnit(idx, { powerMeter: e.target.value })} />
                <input className="form-input" placeholder="عداد الماء" value={u.waterMeter || ""} onChange={(e) => setUnit(idx, { waterMeter: e.target.value })} />
                <input className="form-input" placeholder="رابط صورة رئيسية أو اسم ملف مرفوع" value={u.image || ""} onChange={(e) => setUnit(idx, { image: e.target.value })} />
                <input
                  className="form-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    const payload = await Promise.all(
                      files.map(
                        (f) =>
                          new Promise<any>((resolve) => {
                            const fr = new FileReader();
                            fr.onload = () => resolve({ name: f.name, type: f.type, data: String(fr.result).split(",")[1] || "" });
                            fr.readAsDataURL(f);
                          })
                      )
                    );
                    const r = await fetch("/api/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ files: payload }) });
                    const d = await r.json();
                    const names: string[] = Array.isArray(d?.names) ? d.names : [];
                    setUnit(idx, { images: [...(u.images || []), ...names] });
                  }}
                />

                <input
                  className="form-input sm:col-span-4"
                  placeholder="مزايا مفصولة بفواصل"
                  value={(u.features || []).join(", ")}
                  onChange={(e) => setUnit(idx, { features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                />
              </div>

              {!!u.images?.length && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {u.images.map((n, i) => (
                    <div key={i} className="h-20 bg-gray-50 border rounded overflow-hidden">
                      <img src={resolveSrc(n)} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function PartySection({
  title,
  party,
  setParty,
  includeAgency,
  uploadSingleFile,
}: {
  title: string;
  party: Party;
  setParty: (p: Party) => void;
  includeAgency: boolean;
  uploadSingleFile: (f: File, cb: (n: string) => void) => Promise<void>;
}) {
  return (
    <section className="border rounded-2xl p-3 space-y-3">
      <div className="font-semibold">{title}</div>
      <div className="grid sm:grid-cols-3 gap-2">
        <select className="form-input" value={party.category} onChange={(e) => setParty({ ...party, category: e.target.value as Party["category"] })}>
          <option>فرد</option>
          <option>شركة</option>
        </select>
        <input className="form-input" placeholder="رقم الهوية/السجل التجاري" value={party.nationalIdOrCR} onChange={(e) => setParty({ ...party, nationalIdOrCR: e.target.value })} />
        <input className="form-input" placeholder="الاسم (عربي)" value={party.nameAr} onChange={(e) => setParty({ ...party, nameAr: e.target.value })} />
        <input className="form-input" placeholder="الاسم (إنجليزي)" value={party.nameEn} onChange={(e) => setParty({ ...party, nameEn: e.target.value })} />
        <input className="form-input" type="email" placeholder="البريد الإلكتروني" value={party.email} onChange={(e) => setParty({ ...party, email: e.target.value })} />
        <input className="form-input" placeholder="رقم الهاتف" value={party.phone} onChange={(e) => setParty({ ...party, phone: e.target.value })} />
        <input className="form-input sm:col-span-3" placeholder="العنوان" value={party.address} onChange={(e) => setParty({ ...party, address: e.target.value })} />
      </div>

      <div className="flex items-center justify-between">
        <div className="font-medium">مستندات الطرف</div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setParty({ ...party, docs: [...(party.docs || []), { id: uid("DOC"), docType: "بطاقة", docNumber: "", attachment: "", expiry: "" }] })}
        >
          + إضافة مستند
        </button>
      </div>
      {(party.docs || []).map((d, idx) => (
        <div key={d.id} className="grid sm:grid-cols-5 gap-2">
          <input
            className="form-input"
            placeholder="نوع المستند"
            value={d.docType}
            onChange={(e) => {
              const next = [...party.docs];
              next[idx] = { ...d, docType: e.target.value };
              setParty({ ...party, docs: next });
            }}
          />
          <input
            className="form-input"
            placeholder="رقم المستند"
            value={d.docNumber}
            onChange={(e) => {
              const next = [...party.docs];
              next[idx] = { ...d, docNumber: e.target.value };
              setParty({ ...party, docs: next });
            }}
          />
          <input
            className="form-input"
            type="date"
            placeholder="تاريخ الانتهاء"
            value={d.expiry || ""}
            onChange={(e) => {
              const next = [...party.docs];
              next[idx] = { ...d, expiry: e.target.value };
              setParty({ ...party, docs: next });
            }}
          />
          <input
            className="form-input"
            placeholder="مرفق (اسم ملف)"
            value={d.attachment || ""}
            onChange={(e) => {
              const next = [...party.docs];
              next[idx] = { ...d, attachment: e.target.value };
              setParty({ ...party, docs: next });
            }}
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="form-input"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                await uploadSingleFile(f, (name) => {
                  const next = [...party.docs];
                  next[idx] = { ...d, attachment: name };
                  setParty({ ...party, docs: next });
                });
              }}
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                const next = [...party.docs];
                next.splice(idx, 1);
                setParty({ ...party, docs: next });
              }}
            >
              حذف
            </button>
          </div>
        </div>
      ))}

      {includeAgency && (
        <>
          <div className="font-medium">بيانات الوكالة</div>
          <div className="grid sm:grid-cols-3 gap-2">
            <input className="form-input" placeholder="رقم الوكالة" value={party.agencyNumber || ""} onChange={(e) => setParty({ ...party, agencyNumber: e.target.value })} />
            <input className="form-input" type="date" placeholder="تاريخ الانتهاء" value={party.agencyExpiry || ""} onChange={(e) => setParty({ ...party, agencyExpiry: e.target.value })} />
            <div className="flex items-center gap-2">
              <input className="form-input" placeholder="مرفق (اسم ملف)" value={party.agencyAttachment || ""} onChange={(e) => setParty({ ...party, agencyAttachment: e.target.value })} />
              <input
                type="file"
                className="form-input"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  await uploadSingleFile(f, (name) => setParty({ ...party, agencyAttachment: name }));
                }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
