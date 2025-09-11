// src/pages/properties/new.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
// ❗ استيراد ديناميكي للخريطة ليتعطل SSR
const MapPicker = dynamic(() => import("../../components/maps/MapPicker"), { ssr: false });

import Layout from "../../components/layout/Layout";
import Toggle from "../../components/forms/Toggle";
import { OMAN_PROVINCES, getStates, getVillages } from "../../lib/om-locations";
import {
  FaPhotoVideo, FaCloudUploadAlt, FaTrash, FaPlus, FaRegIdCard, FaHome,
  FaMoneyBillWave, FaMapMarkerAlt, FaInfoCircle, FaBuilding, FaTags,
  FaListUl, FaVideo, FaCopy, FaTimes, FaStar, FaBed, FaBath, FaRulerCombined, FaPrint
} from "react-icons/fa";

/** ============ أنواع عامة ============ */
type Langs = "ar"|"en";
type Furnishing = "furnished"|"unfurnished"|"semi";
type Purpose = "sale"|"rent"|"investment";
type RentalType = ""|"daily"|"monthly"|"yearly";
type InvestmentType = ""|"full"|"partial";
type Category = "residential"|"commercial"|"industrial"|"agricultural"|"multi"|"existing";
type YesNo = "yes"|"no";
type Point = { lat:number; lng:number };

/** مفاتيح وحدات المبنى */
type Unit = {
  name: string;
  floor: string;
  beds: string;
  baths: string;
  area: string;
  priceOMR: string;
  images: File[];
};

const MAX_IMAGES = 20;
const REQUIRED_IMAGES = 4; // غلاف + 3 صور
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/webm";

const BED_OPTIONS = ["استوديو","1","2","3","4","5","6","7+"];
const BATH_OPTIONS = ["1","2","3","4","5","6","7+"];

const FLOOR_CHOICES = ["طابق تحت الأرض","طابق أرضي","1","2","3","4","5","6","7+","طابق سطح"];
const AGE_OPTIONS = ["قيد الإنشاء","0-12 شهر","1-5 سنوات","6-10 سنوات","10+"];

const ORIENTATIONS = [
  "شمالية","جنوبية","شرقية","غربية",
  "شمالية شرقية","شمالية غربية","جنوبية شرقية","جنوبية غربية"
];

const PAYMENT_METHODS = ["كاش","شيك","تحويل بنكي","دفع أونلاين","تقسيط"];

const LS_KEY = "ao_new_property_autosave_v3";
const DEV_SAVED_KEY = "ao_saved_preview_list_v1";

/** اقتراحات المزايا */
const MAIN_FEATURES_BASE = ["تكييف مركزي","شرفة/بلكونة","غرفة خادمة","مطبخ جاهز"];
const MAIN_FEATURES_MORE = [
  "مكيفات","تدفئة","غرفة غسيل","خزائن حائط","مسبح خاص","سخان شمسي","سخان مركزي",
  "موقف سيارات","مصعد","حراسة/أمن","مخزن","جلسة خارجية","سطح","مولد كهرباء",
  "خدمات ذوي الإعاقة","قرب مسجد","مدرسة","سوبر ماركت","مول تجاري","مستشفى","حديقة عامة","بنك/صراف آلي","صالة رياضية"
];

/** إعدادات العلامة المائية */
const WATERMARK_TEXT = "عين عُمان";
const WATERMARK_LOGO_SRC = ""; // اختياري: ضع مسار شعار PNG شفاف إن توفر

/** --- المكوّن الرئيسي --- */
export default function NewPropertyPage(){
  const router = useRouter();

  /** وسائط */
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkedUrls, setWatermarkedUrls] = useState<string[]>([]); // صور بعد العلامة المائية
  const [videoFile, setVideoFile] = useState<File|null>(null);
  const [coverIndex, setCoverIndex] = useState(0);

  const addImages = async (fl: FileList|null) => {
    if (!fl) return;
    const arr = Array.from(fl).slice(0, MAX_IMAGES - files.length);
    if (!arr.length) return;
    setFiles(prev => [...prev, ...arr]);
    const wm = await Promise.all(arr.map(f => watermarkFile(f)));
    setWatermarkedUrls(prev => [...prev, ...wm.filter(Boolean) as string[]]);
  };
  const removeImage = (idx: number) => {
    setFiles(prev => prev.filter((_,i)=>i!==idx));
    setWatermarkedUrls(prev => prev.filter((_,i)=>i!==idx));
    if (coverIndex === idx) setCoverIndex(0);
    if (coverIndex > idx) setCoverIndex(c => c-1);
  };

  /** نصوص متعددة اللغات + توليد تلقائي */
  const [title, setTitle] = useState<Record<Langs,string>>({ ar: "", en: "" });
  const [desc, setDesc]   = useState<Record<Langs,string>>({ ar: "", en: "" });
  const [descLocked, setDescLocked] = useState<{ar:boolean; en:boolean}>({ ar: true, en: true }); // true = اسمح بالتوليد التلقائي

  /** التصنيف */
  const [category, setCategory] = useState<Category>("residential");
  const [buildingForm, setBuildingForm] = useState<"single"|"multi">("single");
  useEffect(()=>{ if (buildingForm === "multi") setCategory("multi"); }, [buildingForm]);

  const [purpose, setPurpose] = useState<Purpose>("sale");
  const [rentalType, setRentalType] = useState<RentalType>("");
  const [investmentType, setInvestmentType] = useState<InvestmentType>("");

  /** الموقع الإداري */
  const [province, setProvince] = useState("");
  const [state, setState] = useState("");
  const [village, setVillage] = useState("");
  const states = useMemo(() => getStates(province), [province]);
  const villages = useMemo(() => getVillages(province, state), [province, state]);
  useEffect(() => { setState(""); setVillage(""); }, [province]);
  useEffect(() => { setVillage(""); }, [state]);

  /** تفاصيل أساسية */
  const [promoted, setPromoted] = useState(false);
  const [hasPremiumSubscription, setHasPremiumSubscription] = useState(false);
  const [paidFeaturedFee, setPaidFeaturedFee] = useState(false);

  const [beds, setBeds] = useState(BED_OPTIONS[0]);
  const [baths, setBaths] = useState(BATH_OPTIONS[0]);
  const [builtArea, setBuiltArea] = useState("");
  const [floors, setFloors] = useState<string[]>([]);
  const [age, setAge] = useState(AGE_OPTIONS[0]);
  const [furnishing, setFurnishing] = useState<Furnishing>("unfurnished");
  const [mainFeatures, setMainFeatures] = useState<string[]>([]);
  const [extraFeatures, setExtraFeatures] = useState<string[]>([]);
  const [nearby, setNearby] = useState<string[]>([]);
  const [mortgaged, setMortgaged] = useState<YesNo>("no");
  const [orientation, setOrientation] = useState(ORIENTATIONS[0]);

  /** السعر وطرق الدفع */
  const [priceOMR, setPriceOMR] = useState("");
  const [payments, setPayments] = useState<string[]>([]);

  /** معلومات تواصل بديلة + OTP وهمي */
  const [altContactName, setAltContactName] = useState("");
  const [altContactPhone, setAltContactPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  /** نقاط الإحداثيات */
  const [points, setPoints] = useState<Point[]>([]);
  const [latInput, setLatInput] = useState<string>("");
  const [lngInput, setLngInput] = useState<string>("");
  const addPoint = () => {
    const lat = Number(latInput), lng = Number(lngInput);
    if (!isFinite(lat) || !isFinite(lng)) { alert("إحداثيات غير صالحة"); return; }
    setPoints(prev => [...prev, { lat, lng }]);
    setLatInput(""); setLngInput("");
  };
  const removePoint = (i:number) => setPoints(prev => prev.filter((_,idx)=>idx!==i));

  /** وحدات مبنى متعدد */
  const [units, setUnits] = useState<Unit[]>([]);
  const addUnit = () => setUnits(prev => [...prev, { name: "", floor: "", beds: "", baths: "", area: "", priceOMR: "", images: [] }]);
  const copyLastUnit = () => {
    if (!units.length) return addUnit();
    const last = units[units.length - 1];
    setUnits(prev => [...prev, { ...last, name: "", images: [...last.images] }]);
  };
  const removeUnit = (i: number) => setUnits(prev => prev.filter((_,idx)=>idx!==i));
  const editUnit = (i:number, key:keyof Unit, val:any) => setUnits(prev => prev.map((u,idx)=> idx===i ? {...u,[key]:val} : u));
  const addUnitImages = async (i:number, fl:FileList|null) => {
    if (!fl) return;
    const arr = Array.from(fl);
    setUnits(prev => prev.map((u,idx)=> idx===i ? {...u, images:[...u.images, ...arr]} : u));
  };
  const removeUnitImage = (i:number, imgIdx:number) => {
    setUnits(prev => prev.map((u,idx)=> idx===i ? {...u, images: u.images.filter((_,j)=>j!==imgIdx)} : u));
  };

  /** حفظ مسودة تلقائي */
  const allStateRef = useRef<any>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setFiles([]); setCoverIndex(s.coverIndex ?? 0);
        setTitle(s.title ?? { ar:"", en:"" }); setDesc(s.desc ?? { ar:"", en:"" });
        setDescLocked(s.descLocked ?? { ar:true, en:true });
        setCategory(s.category ?? "residential");
        setBuildingForm(s.category === "multi" ? "multi" : "single");
        setPurpose(s.purpose ?? "sale");
        setRentalType(s.rentalType ?? ""); setInvestmentType(s.investmentType ?? "");
        setProvince(s.province ?? ""); setState(s.state ?? ""); setVillage(s.village ?? "");
        setPromoted(!!s.promoted);
        setBeds(s.beds ?? BED_OPTIONS[0]); setBaths(s.baths ?? BATH_OPTIONS[0]);
        setBuiltArea(s.builtArea ?? ""); setFloors(s.floors ?? []);
        setAge(s.age ?? AGE_OPTIONS[0]); setFurnishing(s.furnishing ?? "unfurnished");
        setMainFeatures(s.mainFeatures ?? []); setExtraFeatures(s.extraFeatures ?? []); setNearby(s.nearby ?? []);
        setMortgaged(s.mortgaged ?? "no"); setOrientation(s.orientation ?? ORIENTATIONS[0]);
        setPriceOMR(s.priceOMR ?? ""); setPayments(s.payments ?? []);
        setAltContactName(s.altContactName ?? ""); setAltContactPhone(s.altContactPhone ?? "");
        setOtpVerified(!!s.otpVerified);
        setPoints(s.points ?? []);
        setUnits((s.units ?? []).map((u:any)=> ({...u, images: []})));
        setWatermarkedUrls([]); // سنعيد توليدها عند إضافة صور

        // صور محفوظة من الجسر/التحرير
        if (Array.isArray(s.images) && s.images.length) {
          setWatermarkedUrls(s.images);
          setUploadedUrls(s.images);
        }
      }
    } catch {}
  }, []);
  useEffect(() => {
    const s = {
      coverIndex, title, desc, descLocked, category, purpose, rentalType, investmentType,
      province, state, village, promoted, beds, baths, builtArea, floors, age, furnishing,
      mainFeatures, extraFeatures, nearby, mortgaged, orientation, priceOMR, payments,
      altContactName, altContactPhone, otpVerified, points, units
    };
    allStateRef.current = s;
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
  }, [coverIndex,title,desc,descLocked,category,purpose,rentalType,investmentType,province,state,village,promoted,beds,baths,builtArea,floors,age,furnishing,mainFeatures,extraFeatures,nearby,mortgaged,orientation,priceOMR,payments,altContactName,altContactPhone,otpVerified,points,units]);

  /** حفظ محلي تجريبي لعرض العناصر فورًا */
  const [devSaved, setDevSaved] = useState<any[]>([]);
  useEffect(()=>{ try{ const raw = localStorage.getItem(DEV_SAVED_KEY); setDevSaved(raw?JSON.parse(raw):[]);}catch{} },[]);
  const pushDevSaved = (item:any)=>{ try{ const list = [item, ...devSaved].slice(0,10); localStorage.setItem(DEV_SAVED_KEY, JSON.stringify(list)); setDevSaved(list);}catch{} };

  /** تجهيز صور/فيديو */
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const uploadAll = async () => {
    if (files.length < REQUIRED_IMAGES && watermarkedUrls.length < REQUIRED_IMAGES) {
      alert(`يجب إرفاق ${REQUIRED_IMAGES} صور على الأقل (غلاف + 3).`);
      return;
    }
    setUploading(true);
    try {
      const urls = watermarkedUrls.length ? watermarkedUrls : await Promise.all(files.map(f => watermarkFile(f))).then(a => a.filter(Boolean) as string[]);
      setWatermarkedUrls(urls);
      setUploadedUrls(urls);
      if (videoFile) setVideoUrl(URL.createObjectURL(videoFile));
      alert("تم تجهيز الصور مع علامة مائية (للـ Preview/Print).");
    } finally { setUploading(false); }
  };

  /** توليد تلقائي للوصف */
  useEffect(() => {
    const h = setTimeout(() => {
      const loc = [province, state, village].filter(Boolean).join("، ");
      const featsA = [...mainFeatures, ...extraFeatures].slice(0,6).join("، ");
      const nearA = nearby.slice(0,4).join("، ");
      const promo = promoted ? "إعلان مميّز. " : "";
      const tAr = title.ar || `عقار ${categoryLabelAr(category)} ${loc ? `في ${loc}` : ""}`.trim();
      const dAr =
        `${promo}${categoryLabelAr(category)} ${purposeLabelAr(purpose)}${purpose==="rent" && rentalType ? ` (${rentalTypeLabelAr(rentalType)})` : ""}${purpose==="investment" && investmentType ? ` (${investmentLabelAr(investmentType)})` : ""}` +
        `${loc ? ` في ${loc}` : ""}. ` +
        `${builtArea ? `مساحة البناء ${builtArea} م²، ` : ""}` +
        `غرف: ${beds}، حمّامات: ${baths}. ` +
        `${featsA ? `المزايا: ${featsA}. ` : ""}` +
        `${nearA ? `قريب من: ${nearA}. ` : ""}`;

      const tEn = title.en || englishTitleFallback(category, province, state, village);
      const dEn =
        `${categoryLabelEn(category)} ${purposeLabelEn(purpose)} ${rentalType?`(${rentalTypeLabelEn(rentalType)})`:""} ` +
        `${investmentType?`(${investmentLabelEn(investmentType)})`:""} ` +
        `- area ${builtArea || "n/a"} sqm, beds ${bedBathToNumber(beds)}, baths ${bedBathToNumber(baths)}.`;
      if (descLocked.ar) setDesc(prev=>({...prev, ar: dAr}));
      if (descLocked.en) setDesc(prev=>({...prev, en: dEn}));
      if (!title.en) setTitle(prev=>({...prev, en: tEn}));
      if (!title.ar) setTitle(prev=>({...prev, ar: tAr}));
    }, 300);
    return () => clearTimeout(h);
  }, [title.ar, category, purpose, rentalType, investmentType, province, state, village, promoted, beds, baths, builtArea, mainFeatures, extraFeatures, nearby]);

  /** معاينة */
  const [previewOpen, setPreviewOpen] = useState(false);
  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  /** دعم وضع التحرير */
  const editIdRef = useRef<string | null>(null);
  const [loadedFromEdit, setLoadedFromEdit] = useState(false);

  function applyApiItemToForm(item: any) {
    setTitle({ ar: item?.title?.ar || "", en: item?.title?.en || "" });
    setDesc({ ar: item?.description?.ar || "", en: item?.description?.en || "" });
    setDescLocked({ ar: false, en: false });

    setCategory(item.category || "residential");
    setBuildingForm(item.category === "multi" ? "multi" : "single");

    setPurpose(item.purpose || "sale");
    setRentalType(item.rentalType || "");
    setInvestmentType(item.investmentType || "");

    setProvince(item.province || "");
    setState(item.state || "");
    setVillage(item.village || "");

    setPromoted(!!item.promoted);
    setBeds(item.beds != null ? String(item.beds) : BED_OPTIONS[0]);
    setBaths(item.baths != null ? String(item.baths) : BATH_OPTIONS[0]);
    setBuiltArea(item.area ? String(item.area) : "");
    setFloors(Array.isArray(item.floors) ? item.floors : []);
    setAge(item.age || AGE_OPTIONS[0]);
    setFurnishing((item.furnishing as any) || "unfurnished");

    setMainFeatures(Array.isArray(item.amenities) ? item.amenities : []);
    setExtraFeatures([]);
    setNearby(Array.isArray(item.attractions) ? item.attractions : []);

    setMortgaged(item.mortgaged ? "yes" : "no");
    setOrientation(item.orientation || ORIENTATIONS[0]);

    setPriceOMR(item.priceOMR != null ? String(item.priceOMR) : "");
    setPayments([]);

    setAltContactName(item?.altContact?.name || "");
    setAltContactPhone(item?.altContact?.phone || "");
    setOtpVerified(!!item?.altContact);

    const pts = Array.isArray(item.points) ? item.points : (item.lat && item.lng ? [{ lat: item.lat, lng: item.lng }] : []);
    setPoints(pts);

    setUnits(Array.isArray(item.units)
      ? item.units.map((u: any) => ({
          name: u.name || "",
          floor: u.floor || "",
          beds: String(u.beds ?? ""),
          baths: String(u.baths ?? ""),
          area: String(u.area ?? ""),
          priceOMR: String(u.priceOMR ?? ""),
          images: [],
        }))
      : []);

    const imgs = Array.isArray(item.images) ? item.images : [];
    setWatermarkedUrls(imgs);
    setUploadedUrls(imgs);
    setCoverIndex(item.coverIndex ?? 0);

    setReferenceNo(item.referenceNo || null);
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const eid = q.get("edit");
    if (!eid) return;
    editIdRef.current = eid;
    (async () => {
      try {
        const r = await fetch(`/api/properties/${encodeURIComponent(eid)}`);
        if (!r.ok) return;
        const { item } = await r.json();
        if (item) { applyApiItemToForm(item); setLoadedFromEdit(true); }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** إرسال */
  const [sending, setSending] = useState(false);
  const [referenceNo, setReferenceNo] = useState<string | null>(null);

  const validate = () => {
    if (!title.ar.trim()) { alert("أدخل عنوانًا عربيًا"); return false; }
    if (!priceOMR || Number(priceOMR) <= 0) { alert("أدخل سعرًا صحيحًا"); return false; }
    if (promoted && !(hasPremiumSubscription || paidFeaturedFee)) {
      alert("هذا إعلان مميّز: يجب أن يكون لدى العميل اشتراك مميّز أو دفع رسوم الإعلان المميّز.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      const imgs =
        uploadedUrls.length ? uploadedUrls :
        (watermarkedUrls.length ? watermarkedUrls :
          await Promise.all(files.map(f => watermarkFile(f))).then(a => a.filter(Boolean) as string[]));
      const cover = imgs[coverIndex] || imgs[0];

      const unitsClean = await Promise.all(
        units
          .filter(u => u.name || u.area || u.priceOMR)
          .map(async (u) => ({
            ...u,
            priceOMR: Number(u.priceOMR || 0),
            images: (u.images?.length ? awaitAll(u.images.map(f=>watermarkFile(f))) : imgs)
          }))
      );

      const payload = {
        title: { ...title },
        description: { ...desc },
        category,
        type: categoryToType(category),
        purpose,
        rentalType: purpose==="rent" ? rentalType || undefined : undefined,
        investmentType: purpose==="investment" ? investmentType || undefined : undefined,
        promoted,
        province, state, village: village || undefined,
        priceOMR: Number(priceOMR || 0),
        beds: bedBathToNumber(beds), baths: bedBathToNumber(baths),
        area: Number(builtArea || 0),
        floors,
        age, furnishing,
        amenities: [...mainFeatures, ...extraFeatures],
        attractions: nearby,
        mortgaged: mortgaged==="yes",
        orientation,
        images: imgs,
        coverIndex,
        coverImage: cover,
        video: videoUrl || undefined,
        points,
        lat: points[0]?.lat, lng: points[0]?.lng,
        ownerTarget: otpVerified ? "alt_contact" : "owner",
        altContact: otpVerified ? { name: altContactName, phone: altContactPhone } : undefined,
        units: (category==="multi" || buildingForm==="multi") ? unitsClean : undefined,
        referenceNo: referenceNo || undefined
      };

      const editId = editIdRef.current;
      if (editId) {
        const r = await fetch(`/api/properties/${encodeURIComponent(editId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editId }),
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d?.error || "Bad Request");
        }
        try { localStorage.removeItem(LS_KEY); } catch {}
        router.push(`/properties/${encodeURIComponent(editId)}`);
        return;
      }

      // إضافة جديدة: حجز مرجع قبل الإرسال
      if (!referenceNo) {
        try {
          const seqRes = await fetch("/api/seq/next", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity: "PROPERTY" }),
          });
          if (seqRes.ok) {
            const js = await seqRes.json();
            const refNo = js?.referenceNo ?? null;
            if (refNo) setReferenceNo(refNo);
            (payload as any).referenceNo = refNo || undefined;
          }
        } catch {}
      }

      const r = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d?.error || "Bad Request");
      }
      try { localStorage.removeItem(LS_KEY); } catch {}
      router.push("/manage-properties");
    } catch (e:any) {
      alert("فشل الحفظ: " + (e?.message || e));
    } finally {
      setSending(false);
    }
  };

  /** طباعة عبر iframe + انتظار الصور */
  const openPrintView = () => {
    const imgs = (uploadedUrls.length ? uploadedUrls : (watermarkedUrls.length ? watermarkedUrls : files.map(f => URL.createObjectURL(f))));
    const cover = imgs[coverIndex] || imgs[0];

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8"/>
        <title>ملف العقار</title>
        <style>
          body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Tahoma; background:#fff; color:#111; margin:24px;}
          .head{display:flex; align-items:center; gap:16px; margin-bottom:16px;}
          .cover{width:120px; height:90px; object-fit:cover; border-radius:8px; border:1px solid #eee}
          h1{margin:0; font-size:22px}
          .grid{display:grid; grid-template-columns: repeat(3,1fr); gap:12px; margin:12px 0}
          .kv{border:1px solid #eee; border-radius:8px; padding:10px}
          .kv .k{font-size:12px; color:#666}
          .kv .v{font-weight:600}
          .sec{margin-top:18px}
          .chips{display:flex; gap:6px; flex-wrap:wrap}
          .chip{border:1px solid #eee; border-radius:999px; padding:4px 8px; font-size:12px}
          .desc{line-height:1.9; white-space:pre-wrap; border:1px dashed #ddd; padding:12px; border-radius:8px}
          .footer{margin-top:24px; font-size:12px; color:#666}
          @media print { body{margin:0; padding:16px} }
        </style>
      </head>
      <body>
        <div class="head">
          ${cover ? `<img class="cover" src="${cover}" />` : ""}
          <div>
            <h1>🏠 ${escapeHtml(title.ar || "—")}</h1>
            <div style="color:#666; font-size:12px">${escapeHtml(title.en || "")}</div>
          </div>
        </div>

        <div class="grid">
          <div class="kv"><div class="k">السعر</div><div class="v">${priceOMR || "—"} ر.ع</div></div>
          <div class="kv"><div class="k">الغرض</div><div class="v">${purposeLabelAr(purpose)}</div></div>
          <div class="kv"><div class="k">النوع</div><div class="v">${categoryLabelAr(category)}</div></div>
          <div class="kv"><div class="k">الموقع</div><div class="v">${[province,state,village].filter(Boolean).join(" - ") || "—"}</div></div>
          <div class="kv"><div class="k">الغرف</div><div class="v">${beds}</div></div>
          <div class="kv"><div class="k">الحمّامات</div><div class="v">${baths}</div></div>
        </div>

        <div class="sec"><strong>✨ المزايا الرئيسية/الإضافية</strong>
          <div class="chips">
            ${[...mainFeatures, ...extraFeatures].map(x=>`<span class="chip">${featureEmoji(x)} ${escapeHtml(x)}</span>`).join("") || "—"}
          </div>
        </div>

        <div class="sec"><strong>📍 أماكن قريبة</strong>
          <div class="chips">
            ${nearby.map(x=>`<span class="chip">📌 ${escapeHtml(x)}</span>`).join("") || "—"}
          </div>
        </div>

        <div class="sec"><strong>📝 الوصف (AR)</strong><div class="desc">${escapeHtml(desc.ar || "")}</div></div>
        <div class="sec"><strong>📝 Description (EN)</strong><div class="desc">${escapeHtml(desc.en || "")}</div></div>

        <div class="footer">تم إنشاء هذا المستند من عين عُمان • ${new Date().toLocaleString()}</div>
        <script>
          function waitImages(){ const arr = Array.from(document.images); return Promise.all(arr.map(img=>img.complete?Promise.resolve():new Promise(res=>{img.onload=img.onerror=res;}))); }
          window.addEventListener('load', () => {
            waitImages().then(()=>{ setTimeout(()=>{ window.focus(); window.print(); }, 150); });
          });
        </script>
      </body></html>
    `);
    doc.close();

    const removeLater = () => { setTimeout(() => { if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 500); };
    iframe.onload = () => { (iframe.contentWindow as any).onafterprint = removeLater; };
  };

  return (
    <Layout>
      <Head><title>إضافة/تحرير عقار</title></Head>

      {/* 1) الوسائط */}
      <section className="border rounded-lg p-4 bg-white space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><FaPhotoVideo/> الوسائط</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="text-sm text-gray-600 mb-1">صور العقار (حتى {MAX_IMAGES})</div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer">
                <FaCloudUploadAlt/> إضافة صور
                <input type="file" accept={IMAGE_ACCEPT} multiple className="hidden" onChange={(e)=>addImages(e.target.files)} />
              </label>
              { (files.length>0 || watermarkedUrls.length>0) && (
                <button onClick={()=>{ setFiles([]); setWatermarkedUrls([]); }} className="px-3 py-2 border rounded inline-flex items-center gap-2 text-red-600"><FaTrash/> إزالة الكل</button>
              ) }
            </div>

            {(files.length>0 || watermarkedUrls.length>0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {(watermarkedUrls.length?watermarkedUrls:files.map(f=>URL.createObjectURL(f))).map((url,i)=>(
                  <div key={i} className={`rounded overflow-hidden border relative ${i===coverIndex?'ring-2 ring-emerald-500':''}`}>
                    <img src={url} className="w-full h-28 object-cover" alt={`img${i}`} />
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button onClick={()=>setCoverIndex(i)} className="text-xs bg-black/60 text-white px-2 py-0.5 rounded">{i===coverIndex?'الغلاف':'تعيين غلاف'}</button>
                      <button onClick={()=>removeImage(i)} className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <button disabled={uploading} onClick={uploadAll} className="px-3 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">
                {uploading ? "جاري التحضير..." : "تجهيز/رفع الوسائط (مع علامة مائية)"}
              </button>
              <span className="text-xs text-gray-500 ms-2">نطبّق علامة مائية على الصور لاستخدامها في المعاينة والطباعة والإرسال.</span>
            </div>
          </div>

          {/* فيديو */}
          <div>
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaVideo/> فيديو (اختياري)</div>
            <input type="file" accept={VIDEO_ACCEPT} onChange={(e)=>setVideoFile(e.target.files?.[0] ?? null)} />
            {videoFile && <div className="mt-2 text-xs text-gray-600">{videoFile.name}</div>}
          </div>
        </div>
      </section>

      {/* 2) تصنيف العقار وموقعه */}
      <section className="border rounded-lg p-4 bg-white mt-4 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><FaHome/> تصنيف العقار وموقعه</h2>
        <div className="grid md:grid-cols-5 gap-3 text-sm">
          <SelectField label="نوع العقار" value={category} onChange={v=>setCategory(v as Category)} options={[
            ["residential","سكني"],["commercial","تجاري"],["industrial","صناعي"],["agricultural","زراعي"],["multi","مبنى متعدد الطوابق"],["existing","مبنى قائم"]
          ]}/>
          <SelectField label="هيكل المبنى" value={buildingForm} onChange={(v)=>setBuildingForm(v as any)} options={[
            ["single","عقار واحد"],["multi","متعدد الطوابق"]
          ]}/>
          <SelectField label="الغرض" value={purpose} onChange={v=>setPurpose(v as Purpose)} options={[
            ["sale","بيع"],["rent","تأجير"],["investment","استثمار"]
          ]}/>
          <SelectField label="نوع الإيجار" value={rentalType} onChange={v=>setRentalType(v as RentalType)} options={[
            ["","—"],["daily","يومي"],["monthly","شهري"],["yearly","سنوي"]
          ]} disabled={purpose!=="rent"}/>
          <SelectField label="نوع الاستثمار" value={investmentType} onChange={v=>setInvestmentType(v as InvestmentType)} options={[
            ["","—"],["full","كامل"],["partial","جزئي"]
          ]} disabled={purpose!=="investment"}/>
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <SelectField
            label="المحافظة"
            value={province}
            onChange={setProvince}
            options={OMAN_PROVINCES.map(p => [p.name, p.name])}
          />
          <SelectField label="الولاية" value={state} onChange={setState} options={states.map(s=>[s,s])} disabled={!province}/>
          <SelectField label="القرية/المنطقة" value={village} onChange={setVillage} options={villages.map(v=>[v,v])} disabled={!state}/>
        </div>
      </section>

      {/* 3) المواصفات */}
      <section className="border rounded-lg p-4 bg-white mt-4 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><FaInfoCircle/> المواصفات</h2>
        <div className="grid md:grid-cols-4 gap-3 text-sm">
          <SelectField label="الغرف" value={beds} onChange={setBeds} options={BED_OPTIONS.map(b=>[b,b])}/>
          <SelectField label="الحمّامات" value={baths} onChange={setBaths} options={BATH_OPTIONS.map(b=>[b,b])}/>
          <Field label="مساحة البناء (م²)" value={builtArea} onChange={setBuiltArea}/>
          <TagPickerPlus
            title="الطوابق"
            baseOptions={FLOOR_CHOICES.slice(0,4)}
            moreOptions={FLOOR_CHOICES.slice(4)}
            value={floors}
            onChange={setFloors}
            placeholder="أضف طابقًا مخصصًا"
          />
          <SelectField label="عمر العقار" value={age} onChange={setAge} options={AGE_OPTIONS.map(a=>[a,a])}/>
          <div>
            <div className="mb-1 text-gray-600">التأثيث</div>
            <div className="flex gap-3">
              <label className="inline-flex items-center gap-1"><input type="radio" name="furn" checked={furnishing==="furnished"} onChange={()=>setFurnishing("furnished")} /> مفروش</label>
              <label className="inline-flex items-center gap-1"><input type="radio" name="furn" checked={furnishing==="semi"} onChange={()=>setFurnishing("semi")} /> مفروش جزئي</label>
              <label className="inline-flex items-center gap-1"><input type="radio" name="furn" checked={furnishing==="unfurnished"} onChange={()=>setFurnishing("unfurnished")} /> غير مفروش</label>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <TagPickerPlus
            title="المزايا الرئيسية"
            baseOptions={MAIN_FEATURES_BASE}
            moreOptions={MAIN_FEATURES_MORE}
            value={mainFeatures}
            onChange={setMainFeatures}
            placeholder="أضف ميزة…"
          />
          <TagPickerPlus
            title="المزايا الإضافية"
            baseOptions={[]}
            moreOptions={MAIN_FEATURES_MORE}
            value={extraFeatures}
            onChange={setExtraFeatures}
            placeholder="أضف مزية أخرى…"
          />
          <TagPickerPlus
            title="أماكن قريبة"
            baseOptions={["مسجد","مدرسة","سوبر ماركت","مول تجاري"]}
            moreOptions={["مستشفى","حديقة عامة","بنك/صراف آلي","صالة رياضية"]}
            value={nearby}
            onChange={setNearby}
            placeholder="أضف مكانًا…"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="mb-1 text-gray-600">الإعلان المميّز</div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={promoted} onChange={()=>setPromoted(v=>!v)} /> إعلان مميّز
            </label>
            <div className="mt-2 text-xs text-gray-600">
              يجب وجود اشتراك مميّز أو دفع رسوم الإعلان قبل النشر كمميّز.
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" checked={hasPremiumSubscription} onChange={()=>setHasPremiumSubscription(v=>!v)} /> لدي اشتراك مميّز
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" checked={paidFeaturedFee} onChange={()=>setPaidFeaturedFee(v=>!v)} /> دفعت رسوم الإعلان المميّز
              </label>
            </div>
          </div>

          <div>
            <div className="mb-1 text-gray-600">الواجهة</div>
            <SelectField label="" hideLabel value={orientation} onChange={setOrientation} options={ORIENTATIONS.map(o=>[o,o])}/>
          </div>

          <div>
            <div className="mb-1 text-gray-600">طرق الدفع</div>
            <TagPickerPlus
              baseOptions={PAYMENT_METHODS.slice(0,3)}
              moreOptions={PAYMENT_METHODS.slice(3)}
              value={payments}
              onChange={setPayments}
              placeholder="أضف طريقة دفع"
            />
          </div>
        </div>
      </section>

      {/* 4) السعر وطرق الدفع */}
      <section className="border rounded-lg p-4 bg-white mt-4 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><FaMoneyBillWave/> السعر وطرق الدفع</h2>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <Field label="السعر (ر.ع)" value={priceOMR} onChange={setPriceOMR} placeholder="مثال: 50000" />
        </div>
      </section>

      {/* 5) وحدات المبنى */}
      {(category==="multi" || buildingForm==="multi") && (
        <section className="border rounded-lg p-4 bg-white mt-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><FaBuilding/> وحدات المبنى (اختياري)</h2>
          <div className="flex gap-2">
            <button onClick={addUnit} className="inline-flex items-center gap-2 px-3 py-2 rounded border"><FaPlus/> إضافة وحدة</button>
            <button onClick={copyLastUnit} className="inline-flex items-center gap-2 px-3 py-2 rounded border"><FaCopy/> نسخ آخر وحدة</button>
          </div>

          <div className="space-y-3">
            {units.map((u, i) => (
              <div key={i} className="border rounded p-3">
                <div className="grid md:grid-cols-6 gap-2 text-sm">
                  <Field small label="اسم/رقم الوحدة" value={u.name} onChange={v=>editUnit(i,"name",v)}/>
                  <Field small label="الطابق" value={u.floor} onChange={v=>editUnit(i,"floor",v)}/>
                  <Field small label="الغرف" value={u.beds} onChange={v=>editUnit(i,"beds",v)}/>
                  <Field small label="الحمّامات" value={u.baths} onChange={v=>editUnit(i,"baths",v)}/>
                  <Field small label="المساحة (م²)" value={u.area} onChange={v=>editUnit(i,"area",v)}/>
                  <Field small label="السعر (ر.ع)" value={u.priceOMR} onChange={v=>editUnit(i,"priceOMR",v)}/>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-600 mb-1">صور الوحدة (اختياري) — إن لم تُرفع سيتم استخدام صور العقار</div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer">
                    <FaCloudUploadAlt /> إضافة صور للوحدة
                    <input type="file" accept={IMAGE_ACCEPT} multiple className="hidden" onChange={(e)=>addUnitImages(i, e.target.files)} />
                  </label>
                  {u.images.length>0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {u.images.map((f,idx)=> {
                        const url = URL.createObjectURL(f);
                        return (
                          <div key={idx} className="border rounded overflow-hidden relative">
                            <img src={url} className="w-full h-24 object-cover" alt={`u${i}_${idx}`} />
                            <button onClick={()=>removeUnitImage(i,idx)} className="absolute top-1 right-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">حذف</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6) تحديد الموقع على الخريطة */}
      <section className="border rounded-lg p-4 bg-white mt-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><FaMapMarkerAlt/> تحديد الموقع</h2>
        <MapPicker
          onAddPoint={(lat:number,lng:number)=>setPoints(prev=>[...prev,{lat,lng}])}
          onRemovePoint={(idx:number)=>setPoints(prev=>prev.filter((_,i)=>i!==idx))}
          points={points}
          center={points[0]}
          height={360}
        />
      </section>

      {/* 8) العنوان والوصف */}
      <section className="border rounded-lg p-4 bg-white mt-4 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><FaTags/> العنوان والوصف</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="عنوان الإعلان (AR)" value={title.ar} onChange={(v)=>setTitle({...title, ar:v})}/>
          <Field label="Ad Title (EN)" value={title.en} onChange={(v)=>setTitle({...title, en:v})}/>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Textarea label="وصف (AR)" rows={6} value={desc.ar} onChange={(v)=>{ setDesc(prev=>({...prev, ar:v})); setDescLocked(prev=>({...prev, ar:false})); }}/>
          <Textarea label="Description (EN)" rows={6} value={desc.en} onChange={(v)=>{ setDesc(prev=>({...prev, en:v})); setDescLocked(prev=>({...prev, en:false})); }}/>
        </div>
        <div className="text-xs text-gray-600">✍️ يتم توليد الوصف بالعربية والإنجليزية تلقائيًا ما لم تقم بتعديله يدويًا.</div>
      </section>

      {/* 9) معلومات التواصل البديلة */}
      <section className="border rounded-lg p-4 bg-white mt-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><FaRegIdCard/> معلومات التواصل البديلة</h2>
        <div className="text-xs text-gray-600">لو أردت أن يتواصل المشترون مع شخص غير المعلن — تأكيد رقم الواتساب إلزامي (وهميًا الآن).</div>
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="اسم الشخص" value={altContactName} onChange={setAltContactName}/>
          <Field label="رقم واتساب" value={altContactPhone} onChange={setAltContactPhone} placeholder="+9689xxxxxxxx"/>
          <div className="flex items-end gap-2">
            {!otpSent && <button onClick={sendOtp} className="px-3 py-2 rounded border">إرسال OTP</button>}
            {otpSent && !otpVerified && (
              <>
                <input className="border rounded p-2 w-32" placeholder="OTP" value={otpCode} onChange={(e)=>setOtpCode(e.target.value)} />
                <button onClick={verifyOtp} className="px-3 py-2 rounded bg-green-700 hover:bg-green-600 text-white">تحقق</button>
              </>
            )}
            {otpVerified && <span className="text-green-700 text-sm">تم التحقق ✅</span>}
          </div>
        </div>
      </section>

      {/* أزرار أسفل الصفحة */}
      <div className="my-6 flex flex-wrap gap-3">
        <button disabled={sending} onClick={submit} className="px-6 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">
          {sending ? "جاري النشر..." : (loadedFromEdit ? "حفظ التعديلات" : "حفظ ونشر")}
        </button>
        <button onClick={()=>setPreviewOpen(true)} className="px-6 py-2 rounded border inline-flex items-center gap-2">
          <FaListUl/> معاينة كما ستظهر
        </button>
        <button onClick={openPrintView} className="px-6 py-2 rounded border inline-flex items-center gap-2">
          <FaPrint/> طباعة (PDF)
        </button>
        <span className="text-xs text-gray-500">🧠 الصفحة تحفظ مسودتك تلقائيًا وتولّد وصفًا تلقائيًا.</span>
      </div>

      {/* قائمة محلية للعناصر المحفوظة */}
      <section className="border rounded-lg p-4 bg-white mt-2">
        <h3 className="font-semibold mb-2">العناصر المحفوظة (محليًا للتجربة)</h3>
        {devSaved.length===0 ? (
          <div className="text-sm text-gray-500">لا يوجد عناصر بعد.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {devSaved.map((p,i)=> (
              <div key={i} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{p.title?.ar || "—"}</div>
                  <div className="text-xs text-gray-600">{p.priceOMR || "—"} ر.ع</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">📍 {p.location || "—"}</div>
                {p.images?.[p.coverIndex] && <img src={p.images[p.coverIndex]} className="mt-2 h-28 w-full object-cover rounded" />}
                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  {(p.features||[]).slice(0,6).map((f:string,idx:number)=>(
                    <span key={idx} className="border rounded px-2 py-0.5">{featureEmoji(f)} {f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* مودال المعاينة */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4" onClick={()=>setPreviewOpen(false)}>
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">معاينة الإعلان</div>
              <button onClick={()=>setPreviewOpen(false)} className="text-gray-600 hover:text-black"><FaTimes/></button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">🏠 {title.ar || "—"}</h3>
                  <div className="text-xs text-gray-600">{title.en || "—"}</div>
                  <div className="text-sm text-gray-600 mt-1">📍 {[province,state,village].filter(Boolean).join(" - ") || "—"}</div>
                </div>
                <div className="text-2xl font-extrabold text-[var(--brand-800)]">{priceOMR || "—"} <span className="text-base">ر.ع</span></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(uploadedUrls.length?uploadedUrls:(watermarkedUrls.length?watermarkedUrls:files.map(f=>URL.createObjectURL(f)))).slice(0,6).map((u,i)=>(
                  <img key={i} src={u} className="w-full h-36 object-cover rounded" alt={`p${i}`} />
                ))}
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                <PreviewChip icon={<FaBed/>} label="الغرف" value={beds}/>
                <PreviewChip icon={<FaBath/>} label="الحمّامات" value={baths}/>
                <PreviewChip icon={<FaRulerCombined/>} label="المساحة" value={builtArea?`${builtArea} م²`:"—"}/>
                <PreviewChip icon={<FaStar/>} label="التأثيث" value={furnishing==="furnished"?"مفروش":furnishing==="semi"?"مفروش جزئي":"غير مفروش"}/>
                <PreviewChip icon="🧭" label="الواجهة" value={orientation}/>
                <PreviewChip icon="🔒" label="مرهون" value={mortgaged==="yes"?"نعم":"لا"}/>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold mb-1">✨ المزايا</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[...mainFeatures,...extraFeatures].map((x,i)=><span key={i} className="border rounded px-2 py-1">{featureEmoji(x)} {x}</span>)}
                    {![...mainFeatures,...extraFeatures].length && <span className="text-gray-500">—</span>}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">📌 أماكن قريبة</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {nearby.map((x,i)=><span key={i} className="border rounded px-2 py-1">📍 {x}</span>)}
                    {!nearby.length && <span className="text-gray-500">—</span>}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="font-semibold mb-1">📝 الوصف (AR)</div>
                  <div className="border rounded p-3 whitespace-pre-wrap text-sm">{desc.ar || "—"}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">📝 Description (EN)</div>
                  <div className="border rounded p-3 whitespace-pre-wrap text-sm">{desc.en || "—"}</div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t p-3 flex justify-end gap-2">
                <button onClick={()=>setPreviewOpen(false)} className="px-3 py-2 rounded border">إغلاق</button>
                <button onClick={openPrintView} className="px-3 py-2 rounded border"><FaPrint/> طباعة</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

/** Field */
function Field({ label, value, onChange, placeholder, small }:{
  label?: string; value: string; onChange: (v:string)=>void; placeholder?: string; small?: boolean;
}){
  return (
    <label className={small?"text-xs":"text-sm"}>
      {label && <div className="mb-1 text-gray-600">{label}</div>}
      <input className="border rounded p-2 w-full" value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/>
    </label>
  );
}

/** Textarea */
function Textarea({ label, value, onChange, rows=4 }:{
  label?: string; value: string; onChange: (v:string)=>void; rows?: number;
}){
  return (
    <label className="text-sm">
      {label && <div className="mb-1 text-gray-600">{label}</div>}
      <textarea className="border rounded p-2 w-full" rows={rows} value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  );
}

/** SelectField */
function SelectField({ label, value, onChange, options, disabled=false, hideLabel=false }:{
  label?: string; value: string; onChange: (v:string)=>void; options: [string,string][]; disabled?: boolean; hideLabel?: boolean;
}){
  return (
    <label className="text-sm">
      {!hideLabel && <div className="mb-1 text-gray-600">{label}</div>}
      <select disabled={disabled} className="border rounded p-2 w-full bg-white disabled:opacity-60" value={value} onChange={(e)=>onChange(e.target.value)}>
        {options.map(([v,t])=><option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

/** معاينة Chip */
function PreviewChip({ icon, label, value }:{ icon: any; label:string; value:any }){
  return (
    <div className="border rounded px-2 py-2 flex items-center gap-2">
      <span className="text-gray-700">{typeof icon==="string" ? icon : icon}</span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold">{value || "—"}</div>
      </div>
    </div>
  );
}

/** TagPickerPlus */
function TagPickerPlus({
  title,
  baseOptions = [],
  moreOptions = [],
  value,
  onChange,
  placeholder,
  mode = "list"
}:{
  title?: string;
  baseOptions?: string[];
  moreOptions?: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  mode?: "list" | "chips";
}){
  const [showMore, setShowMore] = useState(false);
  const [query, setQuery] = useState("");
  const [openSuggest, setOpenSuggest] = useState(false);

  const all = useMemo(()=> [...baseOptions, ...moreOptions].filter(o=>!value.includes(o)), [baseOptions, moreOptions, value]);

  const add = (x:string) => {
    const v = x.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setQuery("");
  };
  const remove = (x:string) => onChange(value.filter(v=>v!==x));

  const filteredSuggest = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 10);
    return all.filter(o => o.toLowerCase().includes(q)).slice(0, 10);
  }, [all, query]);

  return (
    <div>
      {title && <div className="mb-1 text-gray-600">{title}</div>}

      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(v => (
          <span key={v} className="inline-flex items-center gap-1 border rounded px-2 py-1">
            {v} <button onClick={()=>remove(v)} className="text-red-600"><FaTrash/></button>
          </span>
        ))}
        {value.length===0 && <span className="text-xs text-gray-500">لا توجد عناصر محددة بعد.</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {baseOptions.filter(o=>!value.includes(o)).slice(0,4).map(o=>(
          <button key={o} onClick={()=>add(o)} className="px-2 py-1 border rounded text-sm hover:bg-gray-50">{o}</button>
        ))}
        <button onClick={()=>setShowMore(s=>!s)} className="px-2 py-1 border rounded text-sm hover:bg-gray-50">
          {showMore ? "إخفاء مزايا أخرى" : "مزايا أخرى"}
        </button>
      </div>

      {showMore && (
        <div className="flex flex-wrap gap-2 mb-2">
          {moreOptions.filter(o=>!value.includes(o)).map(o=>(
            <button key={o} onClick={()=>add(o)} className="px-2 py-1 border rounded text-sm hover:bg-gray-50">{o}</button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          className="border rounded p-2 text-sm w-full"
          placeholder={placeholder || "أضف عنصرًا"}
          value={query}
          onChange={(e)=>{ setQuery(e.target.value); setOpenSuggest(true); }}
          onFocus={()=>setOpenSuggest(true)}
          onBlur={()=>setTimeout(()=>setOpenSuggest(false), 150)}
          onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); add(query);} }}
        />
        {openSuggest && (
          <div className="absolute z-10 bg-white border rounded mt-1 w-full max-h-48 overflow-auto shadow">
            {filteredSuggest.length===0 && <div className="px-3 py-2 text-sm text-gray-500">لا اقتراحات</div>}
            {filteredSuggest.map(s=>(
              <div key={s} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onMouseDown={()=>add(s)}>
                {s}
              </div>
            ))}
            {query.trim() && (
              <div className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" onMouseDown={()=>add(query)}>
                إضافة: <b>{query}</b>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** ============ مساعدات ============ */
function categoryLabelAr(c:Category){
  return c==="residential"?"عقار سكني":c==="commercial"?"عقار تجاري":c==="industrial"?"عقار صناعي":c==="agricultural"?"عقار زراعي":c==="multi"?"مبنى متعدد الطوابق":"مبنى قائم";
}
function categoryLabelEn(c:Category){
  return c==="residential"?"Residential":c==="commercial"?"Commercial":c==="industrial"?"Industrial":c==="agricultural"?"Agricultural":c==="multi"?"Multi-storey Building":"Existing Building";
}
function englishTitleFallback(c:Category, p?:string, s?:string, v?:string){
  const loc = englishLoc(p,s,v);
  return `${categoryLabelEn(c)} ${loc ? `in ${loc}`:""}`.trim();
}
function englishLoc(p?:string,s?:string,v?:string){ return [v,s,p].filter(Boolean).join(", "); }
function purposeLabelAr(p:Purpose){ return p==="sale"?"للبيع":p==="rent"?"للإيجار":"للاستثمار"; }
function purposeLabelEn(p:Purpose){ return p==="sale"?"for sale":p==="rent"?"for rent":"for investment"; }
function rentalTypeLabelAr(r:RentalType){ return r==="daily"?"يومي":r==="monthly"?"شهري":r==="yearly"?"سنوي":""; }
function rentalTypeLabelEn(r:RentalType){ return r==="daily"?"daily":r==="monthly"?"monthly":r==="yearly"?"yearly":""; }
function investmentLabelAr(i:InvestmentType){ return i==="full"?"كامل":i==="partial"?"جزئي":""; }
function investmentLabelEn(i:InvestmentType){ return i==="full"?"full":i==="partial"?"partial":""; }
function bedBathToNumber(v:string){ if (v==="استوديو") return 0; if (v==="7+") return 7; const n=Number(v); return Number.isFinite(n)?n:0; }
function categoryToType(c:Category): "apartment"|"villa"|"land"|"office"|"shop" {
  if (c==="commercial") return "office";
  if (c==="agricultural" || c==="industrial") return "land";
  return "apartment";
}
const FEATURE_ICON: Record<string,string> = {
  "موقف سيارات":"🚗","مصعد":"🛗","تكييف مركزي":"❄️","مكيفات":"❄️",
  "مسبح خاص":"🏊","شرفة/بلكونة":"🛋️","حراسة/أمن":"🛡️","غرفة خادمة":"🧹",
  "مطبخ جاهز":"🍳","مخزن":"📦","درج":"🪜","خدمات ذوي الإعاقة":"♿",
  "جلسة خارجية":"🏞️","سطح":"🧱","مولد كهرباء":"⚡","قرب مسجد":"🕌",
  "مسجد":"🕌","مدرسة":"🏫","سوبر ماركت":"🛒","مول تجاري":"🏬",
  "مستشفى":"🏥","حديقة عامة":"🌳","بنك/صراف آلي":"🏦","صالة رياضية":"💪"
};
function featureEmoji(x:string){ return FEATURE_ICON[x] ?? "•"; }
function escapeHtml(s:string){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m] as string)); }

async function watermarkFile(file: File): Promise<string | null> {
  try {
    const img = await fileToImage(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    if (WATERMARK_LOGO_SRC) {
      try {
        const logo = await loadImage(WATERMARK_LOGO_SRC);
        const w = Math.round(canvas.width * 0.18);
        const ratio = logo.naturalWidth ? w / logo.naturalWidth : 1;
        const h = Math.round(logo.naturalHeight * ratio);
        const pad = Math.round(w * 0.08);
        ctx.globalAlpha = 0.28;
        ctx.drawImage(logo, canvas.width - w - pad, canvas.height - h - pad, w, h);
        ctx.globalAlpha = 1;
      } catch {}
    } else {
      const fontSize = Math.max(18, Math.round(canvas.width * 0.03));
      ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Tahoma`;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      const pad = Math.round(fontSize * 0.8);
      ctx.fillText(WATERMARK_TEXT, canvas.width - pad, canvas.height - pad);
    }

    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return null;
  }
}
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = (e) => rej(e);
    img.src = url;
  });
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = (e) => rej(e);
    img.src = src;
  });
}
async function awaitAll<T>(arr: Promise<T>[] | T[]): Promise<T[]> {
  const all = await Promise.all(arr as any);
  return all as T[];
}

/** OTP وهمي */
function sendOtp(){ alert("تم إرسال OTP (وهميًا)"); }
function verifyOtp(){ alert("تم التحقق (وهميًا)"); }
