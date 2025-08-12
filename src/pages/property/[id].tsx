// src/pages/property/[id].tsx
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import PropertyMap from "../../components/maps/PropertyMap";
import { useCurrency } from "../../context/CurrencyContext";
import { PROPERTIES, LANDLORDS, type Prop, type Landlord } from "../../lib/demoData";
import {
  FaBed, FaBath, FaRulerCombined, FaStar, FaBolt, FaMapMarkerAlt, FaHashtag,
  FaRegHeart, FaHeart, FaCheck, FaTimes,
  FaCalendarCheck, FaMoneyBillWave,
  FaWhatsapp, FaFacebook, FaTwitter, FaTelegramPlane,
  FaLinkedin, FaEnvelope, FaLink, FaParking, FaWifi, FaCouch, FaSnowflake, FaSwimmer,
  FaTree, FaShieldAlt, FaVideo, FaUtensils, FaArrowUp, FaWater, FaSchool, FaHospital,
  FaPlaneDeparture, FaStore
} from "react-icons/fa";
import { useChat } from "../../context/ChatContext";

// أيقونات ثابتة للمرافق / أماكن الجذب
const AMENITY_ICON: Record<string, JSX.Element> = {
  "مصعد": <FaArrowUp />, "مواقف": <FaParking />, "تكييف مركزي": <FaSnowflake />, "مفروش": <FaCouch />,
  "مسبح": <FaSwimmer />, "حديقة": <FaTree />, "مطبخ مجهز": <FaUtensils />, "أمن 24/7": <FaShieldAlt />,
  "كاميرات": <FaVideo />, "إنترنت عالي السرعة": <FaWifi />
};
const ATTRACTION_ICON: Record<string, JSX.Element> = {
  "قريب من البحر": <FaWater />, "قريب من المدارس": <FaSchool />, "قريب من المستشفى": <FaHospital />,
  "قريب من المطار": <FaPlaneDeparture />, "قريب من المول": <FaStore />, "قريب من المنتزه": <FaTree />
};

export default function PropertyDetailsPage() {
  const router = useRouter();
  const idParam = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const { format } = useCurrency();
  const { openChat } = useChat();

  // ابحث عن العقار (هوك يُستدعى دائمًا)
  const p: Prop | undefined = useMemo(
    () => (idParam ? PROPERTIES.find(x => String(x.id) === String(idParam)) : undefined),
    [idParam]
  );

  // معرض الصور (يُستدعى دائمًا — يعيد مصفوفة فارغة عند عدم توفر p)
  const gallery: string[] = useMemo(() => {
    if (!p) return [];
    return [
      p.image,
      "https://images.unsplash.com/photo-1505692952047-1a78307da8ab",
      "https://images.unsplash.com/photo-1504610926078-a1611febcad3",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471"
    ];
  }, [p?.image]);

  const [mainIdx, setMainIdx] = useState(0);

  // مفضلة محلية
  const LS_FAVS = "ao_favs";
  const [fav, setFav] = useState(false);
  useEffect(() => {
    if (!p) return;
    try {
      const raw = localStorage.getItem(LS_FAVS);
      const ids: number[] = raw ? JSON.parse(raw) : [];
      setFav(ids.includes(p.id));
    } catch {}
  }, [p?.id]);
  const toggleFav = () => {
    if (!p) return;
    try {
      const raw = localStorage.getItem(LS_FAVS);
      const ids: number[] = raw ? JSON.parse(raw) : [];
      const set = new Set(ids);
      fav ? set.delete(p.id) : set.add(p.id);
      localStorage.setItem(LS_FAVS, JSON.stringify(Array.from(set)));
      setFav(!fav);
    } catch {}
  };

  // مشاركة
  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://example.com/property/${idParam ?? ""}`;
  const shareText = encodeURIComponent(p ? `${p.title} - ${p.location}` : "Property");
  const encodedUrl = encodeURIComponent(shareUrl);

  // حاسبة تمويل — اجعل القيم قابلة للمزامنة عند توفر p
  const [priceOMR, setPriceOMR] = useState<number>(p?.priceOMR ?? 0);
  const [downPct, setDownPct] = useState<number>(20);
  const [years, setYears] = useState<number>(20);
  const [rate, setRate] = useState<number>(5);
  useEffect(() => { if (p) setPriceOMR(p.priceOMR); }, [p?.priceOMR]);

  const monthlyPayment = useMemo(() => {
    const principal = priceOMR * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    if (!principal || !n) return 0;
    if (r === 0) return principal / n;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [priceOMR, downPct, years, rate]);

  // جديد/مميز
  const isPromotedNew = useMemo(() => {
    if (!p?.promoted || !p?.promotedAt) return false;
    const diff = Date.now() - new Date(p.promotedAt).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }, [p?.promoted, p?.promotedAt]);

  // مقترحات مشابهة + مؤجرون
  const similarProps = useMemo(() => {
    if (!p) return [];
    const sameProvinceType = PROPERTIES.filter(x => x.id !== p.id && x.province === p.province && x.type === p.type);
    if (sameProvinceType.length) return sameProvinceType.slice(0, 6);
    const sameProvince = PROPERTIES.filter(x => x.id !== p.id && x.province === p.province);
    if (sameProvince.length) return sameProvince.slice(0, 6);
    return [...PROPERTIES].filter(x => x.id !== p.id).sort((a,b)=>b.rating-a.rating).slice(0, 6);
  }, [p?.id, p?.province, p?.type]);

  const suggestedLandlords: Landlord[] = useMemo(() => {
    if (!p) return [];
    const byProvince = LANDLORDS.filter(l => l.province === p.province);
    const top = [...LANDLORDS].sort((a,b)=>b.rating-a.rating || b.deals-a.deals);
    return (byProvince.length ? byProvince.slice(0,3) : top.slice(0,3));
  }, [p?.province]);

  // JSON-LD
  const jsonLd = useMemo(() => !p ? null : ({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": p.title,
    "description": "قائمة عقارية على منصة عين عُمان.",
    "url": shareUrl,
    "identifier": p.serial,
    "address": { "@type": "PostalAddress", "addressLocality": p.location, "addressRegion": p.province, "addressCountry": "OM" },
    "geo": { "@type": "GeoCoordinates", "latitude": p.lat, "longitude": p.lng },
    "offers": { "@type": "Offer", "priceCurrency": "OMR", "price": p.priceOMR }
  }), [p, shareUrl]);

  // حالة العرض: تحميل / غير موجود
  const loading = !idParam;                 // لم تُحدد الـ id بعد
  const notFound = !!idParam && !p;        // يوجد id ولكن لا يوجد عقار

  // حالات نوافذ
  const [visitOpen, setVisitOpen] = useState(false);
  const [negOpen, setNegOpen] = useState(false);

  return (
    <Layout>
      <Head>
        <title>{p ? `${p.title} | عين عُمان` : notFound ? "غير موجود | عين عُمان" : "جارٍ التحميل | عين عُمان"}</title>
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      </Head>

      {/* فتات الخبز */}
      <nav className="text-sm text-gray-600 my-3">
        <Link href="/" className="underline">الرئيسية</Link> <span className="mx-1">/</span>
        <Link href="/properties" className="underline">العقارات</Link>
        {p && <>
          <span className="mx-1">/</span>
          <Link href={`/properties?province=${encodeURIComponent(p.province)}`} className="underline">{p.province}</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-800">{p.title}</span>
        </>}
      </nav>

      {/* حالات: تحميل / غير موجود */}
      {loading && (
        <div className="py-16 text-center text-gray-600">جارٍ التحميل…</div>
      )}

      {notFound && (
        <div className="py-16 text-center">
          العقار غير موجود.
          <div className="mt-3">
            <Link href="/properties" className="underline text-[var(--brand-700)]">عودة لقائمة العقارات</Link>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي عند توفر p */}
      {p && (
        <>
          {/* العنوان والوسوم */}
          <section className="my-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold">{p.title}</h1>
                <div className="text-sm text-gray-600 flex flex-wrap items-center gap-4 mt-1">
                  <span className="inline-flex items-center gap-2"><FaMapMarkerAlt /> {p.location}</span>
                  <span className="inline-flex items-center gap-2"><FaHashtag /> الرقم المتسلسل: <b>{p.serial}</b></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.promoted && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-1 rounded">
                    <FaBolt /> إعلان مميز
                  </span>
                )}
                <button
                  onClick={toggleFav}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
                  title={fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
                >
                  {fav ? <FaHeart /> : <FaRegHeart />} {fav ? "في المفضلة" : "حفظ"}
                </button>
              </div>
            </div>
          </section>

          {/* المحتوى */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="md:col-span-2">
              {/* معرض صور */}
              <div className="rounded-lg overflow-hidden border">
                <img src={gallery[mainIdx]} alt={`${p.title} - صورة ${mainIdx+1}`} className="w-full h-80 object-cover" />
                <div className="flex gap-2 p-2 overflow-auto">
                  {gallery.map((src, i) => (
                    <button key={i} onClick={() => setMainIdx(i)} className={`border rounded overflow-hidden ${i===mainIdx ? "ring-2 ring-[var(--brand-700)]" : ""}`}>
                      <img src={src} alt={`thumb-${i}`} className="w-24 h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* مواصفات */}
              <div className="grid grid-cols-2 sm:grid-cols-4 text-sm text-gray-700 mt-3">
                <div className="flex items-center gap-2"><FaBed /> غرف: {p.beds}</div>
                <div className="flex items-center gap-2"><FaBath /> دورات المياه: {p.baths}</div>
                <div className="flex items-center gap-2"><FaRulerCombined /> المساحة: {p.area} م²</div>
                <div className="flex items-center gap-2 text-yellow-600"><FaStar /> التقييم: {p.rating}</div>
              </div>

              {/* وصف */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">الوصف</h3>
                <p className="text-gray-700 leading-7">وصف تجريبي للعقار…</p>
              </div>

              {/* المرافق بأيقونات */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">المرافق</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  {(p.amenities ?? []).map((a) => (
                    <span key={a} className="px-2 py-1 rounded bg-gray-100 inline-flex items-center gap-2">
                      <span className="text-[var(--brand-700)]">{AMENITY_ICON[a] ?? <FaCheck />}</span>
                      <span>{a}</span>
                    </span>
                  ))}
                  {(p.amenities ?? []).length === 0 && <span className="text-gray-500 text-sm">لا توجد معلومات</span>}
                </div>
              </div>

              {/* أماكن جذب قريبة بأيقونات */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">أماكن جذب قريبة</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  {(p.attractions ?? []).map((a) => (
                    <span key={a} className="px-2 py-1 rounded bg-gray-100 inline-flex items-center gap-2">
                      <span className="text-[var(--brand-700)]">{ATTRACTION_ICON[a] ?? <FaTree />}</span>
                      <span>{a}</span>
                    </span>
                  ))}
                  {(p.attractions ?? []).length === 0 && <span className="text-gray-500 text-sm">لا توجد معلومات</span>}
                </div>
              </div>

              {/* خريطة */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">الخريطة</h3>
                <PropertyMap properties={[{ id: p.id, title: p.title, image: p.image, lat: p.lat, lng: p.lng, location: p.location }]} />
              </div>

              {/* مقترحات مشابهة */}
              <div className="mt-10">
                <h3 className="text-lg font-bold mb-3">مقترحات مشابهة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarProps.map(sp => <SmallCard key={sp.id} p={sp} />)}
                </div>
              </div>
            </div>

            {/* العمود الجانبي */}
            <aside className="md:col-span-1 space-y-4">
              <div className="border rounded-lg p-4 shadow">
                <div className="text-sm text-gray-600">السعر</div>
                <div className="text-2xl font-bold text-[var(--brand-700)]">{format(p.priceOMR)}</div>
                {p.purpose === "rent" && p.rentalType && (
                  <div className="text-xs text-gray-600 mt-1">نوع الإيجار: {p.rentalType === "monthly" ? "شهري" : p.rentalType === "yearly" ? "سنوي" : "يومي"}</div>
                )}
              </div>

              {/* أزرار داكنة */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openChat({ target: "owner", propertyId: p.id, subject: p.title })}
                  className="inline-flex items-center justify-center gap-2 rounded-lg py-2 bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
                >
                  دردشة المالك
                </button>
                <button
                  onClick={() => openChat({ target: "admin", subject: `استفسار حول ${p.title}` })}
                  className="inline-flex items-center justify-center gap-2 rounded-lg py-2 bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
                >
                  تواصل الإدارة
                </button>
                <button
                  onClick={() => setVisitOpen(true)}
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg py-2 bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
                >
                  <FaCalendarCheck /> حجز معاينة
                </button>
                <button
                  onClick={() => setNegOpen(true)}
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg py-2 bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
                >
                  <FaMoneyBillWave /> طلب مناقشة السعر
                </button>
              </div>

              {/* مشاركة */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">مشاركة</h4>
                <div className="flex flex-wrap gap-2">
                  <a className="inline-flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50" target="_blank" rel="noreferrer"
                    href={`https://wa.me/?text=${shareText}%20${encodedUrl}`}><FaWhatsapp /> واتساب</a>
                  <a className="inline-flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50" target="_blank" rel="noreferrer"
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}><FaTwitter /> تويتر</a>
                  <a className="inline-flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50" target="_blank" rel="noreferrer"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}><FaFacebook /> فيسبوك</a>
                  <a className="inline-flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50" target="_blank" rel="noreferrer"
                    href={`https://t.me/share/url?url=${encodedUrl}&text=${shareText}`}><FaTelegramPlane /> تيليجرام</a>
                  <a className="inline-flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50" target="_blank" rel="noreferrer"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}><FaLinkedin /> لينكدإن</a>
                  <a className="inline-flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50"
                    href={`mailto:?subject=${shareText}&body=${encodedUrl}`}><FaEnvelope /> بريد</a>
                  <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="inline-flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50"><FaLink /> نسخ الرابط</button>
                </div>
              </div>

              {/* حاسبة تمويل */}
              {p.purpose === "sale" && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">حاسبة التمويل</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">السعر (ر.ع)</label>
                      <input type="number" className="w-full border rounded p-2" value={priceOMR} onChange={e => setPriceOMR(+e.target.value || 0)} />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">الدفعة الأولى %</label>
                      <input type="number" className="w-full border rounded p-2" value={downPct} onChange={e => setDownPct(+e.target.value || 0)} />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">المدة (سنوات)</label>
                      <input type="number" className="w-full border rounded p-2" value={years} onChange={e => setYears(+e.target.value || 0)} />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">فائدة سنوية %</label>
                      <input type="number" className="w-full border rounded p-2" value={rate} onChange={e => setRate(+e.target.value || 0)} />
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    <div className="text-gray-600">القسط الشهري التقريبي:</div>
                    <div className="text-lg font-bold">{format(monthlyPayment)}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">الحساب تقريبي لأغراض إرشادية فقط.</p>
                </div>
              )}
            </aside>
          </section>

          {/* النوافذ */}
          <VisitModal open={visitOpen} onClose={() => setVisitOpen(false)} propertyId={p.id} />
          <NegotiateModal open={negOpen} onClose={() => setNegOpen(false)} propertyId={p.id} />
        </>
      )}
    </Layout>
  );
}

/** بطاقة صغيرة */
function SmallCard({ p }: { p: Prop }) {
  return (
    <Link href={`/property/${p.id}`} className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden block">
      <img src={p.image} alt={p.title} className="w-full h-36 object-cover" />
      <div className="p-3">
        <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
        <div className="text-xs text-gray-600 line-clamp-1">{p.location}</div>
        <div className="mt-1 text-xs text-yellow-600 inline-flex items-center gap-1">
          <FaStar /> {p.rating}
        </div>
      </div>
    </Link>
  );
}

/** حجز معاينة */
function VisitModal({ open, onClose, propertyId }: { open: boolean; onClose: () => void; propertyId: number }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [date, setDate] = useState(""); const [time, setTime] = useState("");
  const [sent, setSent] = useState(false);
  if (!open) return null;
  const submit = async (e: any) => {
    e.preventDefault();
    await fetch(`/api/property/${propertyId}/visit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, date, time }) });
    setSent(true);
  };
  return (
    <div className="fixed inset-0 z-[58] bg-black/40 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md p-4">
        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">حجز معاينة</h3><button onClick={onClose} className="text-red-600"><FaTimes /></button></div>
        {sent ? <div className="p-4 text-green-700 bg-green-50 rounded">تم تسجيل الموعد.</div> :
          <form onSubmit={submit} className="grid gap-2">
            <input className="border rounded p-2" placeholder="الاسم" value={name} onChange={e=>setName(e.target.value)} required />
            <input className="border rounded p-2" placeholder="رقم الهاتف" value={phone} onChange={e=>setPhone(e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="border rounded p-2" value={date} onChange={e=>setDate(e.target.value)} required />
              <input type="time" className="border rounded p-2" value={time} onChange={e=>setTime(e.target.value)} required />
            </div>
            <button className="mt-1 px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">تأكيد</button>
          </form>}
      </div>
    </div>
  );
}

/** مناقشة السعر */
function NegotiateModal({ open, onClose, propertyId }: { open: boolean; onClose: () => void; propertyId: number }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [offer, setOffer] = useState<number | "">(""); const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  if (!open) return null;
  const submit = async (e: any) => {
    e.preventDefault();
    await fetch(`/api/property/${propertyId}/negotiate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, offer, note }) });
    setSent(true);
  };
  return (
    <div className="fixed inset-0 z-[58] bg-black/40 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md p-4">
        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">طلب مناقشة السعر</h3><button onClick={onClose} className="text-red-600"><FaTimes /></button></div>
        {sent ? <div className="p-4 text-green-700 bg-green-50 rounded">تم إرسال الطلب.</div> :
          <form onSubmit={submit} className="grid gap-2">
            <input className="border rounded p-2" placeholder="الاسم" value={name} onChange={e=>setName(e.target.value)} required />
            <input className="border rounded p-2" placeholder="رقم الهاتف" value={phone} onChange={e=>setPhone(e.target.value)} required />
            <input type="number" className="border rounded p-2" placeholder="العرض المقترح (ر.ع)" value={offer} onChange={e=>setOffer(e.target.value ? +e.target.value : "")} />
            <textarea className="border rounded p-2" rows={3} placeholder="ملاحظات (اختياري)" value={note} onChange={e=>setNote(e.target.value)} />
            <button className="mt-1 px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">إرسال</button>
          </form>}
      </div>
    </div>
  );
}
