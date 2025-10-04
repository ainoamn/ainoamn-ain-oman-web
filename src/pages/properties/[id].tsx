import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  FaArrowRight, FaBolt, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined,
  FaStar, FaShareAlt, FaCopy, FaPrint, FaVideo, FaRegIdCard,
  FaWhatsapp, FaCalendarAlt, FaClock, FaPaperPlane, FaTimes, FaCheck, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { useCurrency } from "@/context/CurrencyContext";

/* ===== Types ===== */
type PItem = {
  id: string;
  referenceNo?: string;
  title?: string | { ar?: string; en?: string };
  description?: string | { ar?: string; en?: string };
  category?: string;
  type?: "apartment"|"villa"|"land"|"office"|"shop"|string;
  purpose?: "sale"|"rent"|"investment"|string;
  rentalType?: "daily"|"monthly"|"yearly"|null|string;
  investmentType?: string|null;

  promoted?: boolean;
  promotedAt?: string|null;
  createdAt?: string|null;
  updatedAt?: string|null;

  province?: string; state?: string; village?: string;
  priceOMR?: number;
  beds?: number;
  baths?: number;
  area?: number;
  floors?: string[];
  age?: string;
  furnishing?: string;

  amenities?: string[];
  attractions?: string[];

  mortgaged?: boolean;
  orientation?: string;

  images?: string[];
  coverIndex?: number;
  coverImage?: string;
  video?: string|null;

  points?: {lat:number; lng:number}[];
  lat?: number;
  lng?: number;

  ownerTarget?: "owner"|"alt_contact";
  altContact?: { name?: string; phone?: string } | null;

  rating?: number;
  subRatings?: Partial<Record<"comfort"|"cleanliness"|"location"|"value"|"facilities"|"staff", number>>;
  status?: "vacant"|"reserved"|"hidden"|"draft";
  published?: boolean;
};

function titleToText(t?: PItem["title"]) { return typeof t === "string" ? t : (t?.ar || t?.en || ""); }
function descToText(d?: PItem["description"]) { return typeof d === "string" ? d : (d?.ar || d?.en || ""); }
function firstDefined<T>(...xs: (T|undefined|null)[]) { for (const x of xs) if (x !== undefined && x !== null) return x as T; return undefined as any; }
function getCover(item: PItem) {
  if (item.coverImage) return item.coverImage;
  if (item.images?.length) {
    const idx = typeof item.coverIndex === "number" ? item.coverIndex : 0;
    return item.images[idx] || item.images[0];
  }
  return "";
}
function fmtDate(s?: string|null) { if (!s) return ""; try { return new Date(s).toLocaleString(); } catch { return s || ""; } }

/** الإيجار شهري/سنوي */
function computeRent(priceOMR?: number, rentalType?: string) {
  const price = Number(priceOMR || 0);
  if (!price) return { monthly: 0, yearly: 0, basis: "unknown" as const };
  if (rentalType === "monthly" || rentalType === "yearly") { // ← تصحيح منطقي
    const monthly = price;
    const yearly = monthly * 12;
    return { monthly, yearly, basis: "monthly" as const };
  }
  if (rentalType === "daily") return { monthly: 0, yearly: 0, basis: "daily" as const };
  return { monthly: price, yearly: price * 12, basis: "monthly" as const };
}

/** خريطة */
function getMapIframe(item: PItem) {
  const lat = firstDefined(item.lat, item.points?.[0]?.lat) as number|undefined;
  const lng = firstDefined(item.lng, item.points?.[0]?.lng) as number|undefined;
  if (!isFinite(lat as any) || !isFinite(lng as any)) return null;
  const bbox = [(lng!-0.01).toFixed(6),(lat!-0.01).toFixed(6),(lng!+0.01).toFixed(6),(lat!+0.01).toFixed(6)].join("%2C");
  const marker = `${lat!.toFixed(6)}%2C${lng!.toFixed(6)}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  return <iframe src={src} className="w-full h-64" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
}

/** أيقونات مزايا */
const AMENITY_ICON: Record<string, string> = {
  "مصعد":"🛗","مواقف":"🚗","تكييف مركزي":"❄️","مفروش":"🛋️","مسبح":"🏊",
  "حديقة":"🌳","مطبخ مجهز":"🍳","أمن 24/7":"🛡️","كاميرات":"📷","إنترنت عالي السرعة":"📶",
  "شرفة/بلكونة":"🪟","غرفة خادمة":"🧹","خزائن":"🗄️","غرفة غسيل":"🧺","سطح":"🧱",
};

/* ===== Page ===== */
export default function PropertyDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const pid = Array.isArray(id) ? id[0] : id;
  const { format } = useCurrency();

  const [item, setItem] = useState<PItem|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // محادثة/حجز/معاينة
  const [chatOpen, setChatOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  // مشابه
  const [similar, setSimilar] = useState<PItem[]>([]);

  useEffect(() => {
    if (!pid) return;
    setLoading(true);
    setErr(null);
    fetch(`/api/properties/${encodeURIComponent(String(pid))}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(d => {
        const it: PItem|undefined = d?.item;
        setItem(it || null);
        if (it) {
          const hasCover = getCover(it);
          const idx = typeof it.coverIndex === "number" ? it.coverIndex : 0;
          setActiveIdx(hasCover ? Math.max(0, Math.min(idx, (it.images?.length||1)-1)) : 0);
        }
      })
      .catch(() => setErr("تعذّر جلب البيانات"))
      .finally(() => setLoading(false));
  }, [pid]);

  useEffect(() => {
    fetch("/api/properties").then(r=>r.json()).then(d=>{
      const items: PItem[] = Array.isArray(d?.items)? d.items: [];
      if (!items?.length || !item) return;
      const base = items
        .filter(x => String(x.id)!==String(item.id))
        .filter(x => x.type===item.type || x.province===item.province || x.state===item.state)
        .filter(x => x.published && (x.status? x.status==="vacant" : true));
      base.sort((a,b)=>{
        const da = Math.abs((a.priceOMR||0) - (item?.priceOMR||0));
        const db = Math.abs((b.priceOMR||0) - (item?.priceOMR||0));
        if (da!==db) return da-db;
        const ta = a.createdAt? new Date(a.createdAt).getTime():0;
        const tb = b.createdAt? new Date(b.createdAt).getTime():0;
        return tb-ta;
      });
      setSimilar(base.slice(0,6));
    }).catch(()=>{});
  }, [item]);

  const titleAR = useMemo(() => titleToText(item?.title), [item]);
  const descAR  = useMemo(() => descToText(item?.description), [item]);
  const cover   = useMemo(() => item ? getCover(item) : "", [item]);

  const gallery = useMemo(() => {
    if (!item) return [];
    const arr = item.images?.length ? item.images : (cover ? [cover] : []);
    return arr || [];
  }, [item, cover]);

  const locStr = useMemo(() => {
    if (!item) return "";
    return [item.province, item.state, item.village].filter(Boolean).join(" - ");
  }, [item]);

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = titleAR || `#${item?.id}`;
    try {
      if (navigator.share) await navigator.share({ title: text, text, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); alert("تم نسخ الرابط"); }
      else alert(url);
    } catch {}
  };
  const copyRef = async () => {
    const ref = item?.referenceNo; if (!ref) return;
    try {
      if (navigator.clipboard) { await navigator.clipboard.writeText(ref); alert(`نُسخ: ${ref}`); }
      else alert(ref);
    } catch { alert(ref); }
  };
  const onPrint = () => window.print();

  if (loading) {
    return (
      <Layout>
        <Head><title>تفاصيل العقار</title></Head>
        <div className="max-w-6xl mx-auto px-4 py-10 text-gray-600">جارِ التحميل…</div>
      </Layout>
    );
  }
  if (err || !item) {
    return (
      <Layout>
        <Head><title>تفاصيل العقار</title></Head>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-4">
            <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
              <FaArrowRight/> عودة إلى القائمة
            </Link>
          </div>
          <div className="text-red-600">{err || "العنصر غير موجود"}</div>
        </div>
      </Layout>
    );
  }

  const price = firstDefined(item.priceOMR, 0) as number;
  const baseRating = Math.min(5, Math.max(1, Math.round(firstDefined(item.rating, 4) as number)));
  const { monthly, yearly, basis } = computeRent(item.priceOMR, item.rentalType);
  const defaultSubs = {
    comfort: Math.min(5, baseRating + 0.2),
    cleanliness: Math.max(3.5, baseRating - 0.1),
    location: Math.min(5, baseRating + 0.1),
    value: Math.max(3.5, baseRating - 0.2),
    facilities: Math.max(3.5, baseRating - 0.1),
    staff: Math.min(5, baseRating + 0.1),
  };
  const subs = { ...defaultSubs, ...(item.subRatings||{}) };

  return (
    <Layout>
      <Head>
        <title>{titleAR ? `${titleAR} | عين عُمان` : "تفاصيل العقار | عين عُمان"}</title>
      </Head>

      {/* شريط علوي */}
      <div className="bg-white/70 backdrop-blur sticky top-0 z-[5] border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/properties" className="text-gray-600 hover:text-black">العقارات</Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold">{titleAR || `#${item.id}`}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.referenceNo && (
              <button onClick={copyRef} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border">
                <FaRegIdCard/> {item.referenceNo}
              </button>
            )}
            <button onClick={onShare} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border">
              <FaShareAlt/> مشاركة
            </button>
            <button onClick={onPrint} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border">
              <FaPrint/> طباعة
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* رأس الصفحة */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {item.promoted && <span className="inline-flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-1 rounded"><FaBolt/> مميّز</span>}
            <span className="inline-flex items-center gap-1 text-xs text-gray-600"><FaMapMarkerAlt/> {locStr || "—"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{titleAR || `#${item.id}`}</h1>

          {/* السعر / منطق الإيجار */}
          <div className="flex flex-wrap items-center gap-4">
            {item.purpose === "rent" ? (
              <div className="flex flex-wrap items-center gap-3">
                {(basis==="monthly" || item.rentalType==="monthly" || item.rentalType==="yearly") && (
                  <div className="text-[var(--brand-800)] font-extrabold text-2xl">
                    {format(monthly)} <span className="text-sm text-gray-600">/ شهري</span>
                  </div>
                )}
                {(basis==="monthly" || item.rentalType==="monthly" || item.rentalType==="yearly") && (
                  <div className="text-[var(--brand-800)] font-extrabold text-xl">
                    {format(yearly)} <span className="text-sm text-gray-600">/ سنوي</span>
                  </div>
                )}
                {item.rentalType==="daily" && (
                  <div className="text-[var(--brand-800)] font-extrabold text-2xl">
                    {format(price)} <span className="text-sm text-gray-600">/ يومي</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[var(--brand-800)] font-extrabold text-2xl">{format(price || 0)}</div>
            )}

            <div className="inline-flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-gray-600">الغرض:</span>
              <b>{item.purpose === "sale" ? "بيع" : item.purpose === "rent" ? "إيجار" : item.purpose === "investment" ? "استثمار" : "—"}</b>
              {item.purpose === "rent" && item.rentalType && <span className="text-gray-500">({item.rentalType === "daily" ? "يومي" : item.rentalType === "monthly" ? "شهري" : "سنوي"})</span>}
            </div>
            <div className="inline-flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-gray-600">النوع:</span>
              <b>
                {item.type === "apartment" ? "شقة" :
                 item.type === "villa" ? "فيلا" :
                 item.type === "land" ? "أرض" :
                 item.type === "office" ? "مكتب" :
                 item.type === "shop" ? "محل" : (item.type || "—")}
              </b>
            </div>
            {item.createdAt && <div className="text-xs text-gray-500">تاريخ الإدراج: {fmtDate(item.createdAt)}</div>}
          </div>
        </header>

        {/* المعرض + معلومات + تواصل */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4">
          {/* المعرض */}
          <div className="bg-white border rounded-2xl overflow-hidden">
            {gallery.length > 0 ? (
              <div className="relative">
                <img src={gallery[activeIdx] || gallery[0]} className="w-full h-[340px] md:h-[420px] object-cover" alt={`img-${activeIdx}`} />
                {gallery.length > 1 && (
                  <div className="p-2 grid grid-cols-4 md:grid-cols-6 gap-2 bg-white/70 backdrop-blur border-t">
                    {gallery.slice(0, 12).map((u, i) => (
                      <button key={i} className={`h-16 rounded overflow-hidden border ${i===activeIdx?"ring-2 ring-[var(--brand-700)]":""}`} onClick={() => setActiveIdx(i)} title={`صورة ${i+1}`}>
                        <img src={u} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">لا توجد صور</div>
            )}
          </div>

          {/* الشريط الجانبي */}
          <aside className="bg-white border rounded-2xl p-4 space-y-4 h-fit">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Stat icon={<FaBed/>}   label="الغرف" value={item.beds ?? 0} />
              <Stat icon={<FaBath/>}  label="الحمّامات" value={item.baths ?? 0} />
              <Stat icon={<FaRulerCombined/>} label="المساحة" value={item.area ? `${item.area} م²` : "—"} />
            </div>

            <RatingsPanel overall={baseRating} subs={subs} />

            {item.video && (
              <div>
                <div className="text-sm text-gray-600 mb-1 inline-flex items-center gap-2"><FaVideo/> فيديو</div>
                <video src={item.video} controls className="w-full rounded-lg border" />
              </div>
            )}

            {item.referenceNo && (
              <div className="text-xs text-gray-600">
                رقم مرجعي: <button onClick={copyRef} className="underline inline-flex items-center gap-1"><FaCopy/>{item.referenceNo}</button>
              </div>
            )}

            {/* تواصل وحجوزات */}
            <div className="space-y-2">
              <button onClick={()=>setChatOpen(true)} className="w-full px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 inline-flex items-center justify-center gap-2">
                <FaPaperPlane/> مراسلة عبر النظام
              </button>
              <a
                href={item.altContact?.phone ? `https://wa.me/${item.altContact.phone.replace(/[^\d+]/g,"")}` : "#"}
                target="_blank"
                className={`w-full px-3 py-2 rounded-xl inline-flex items-center justify-center gap-2 ${item.altContact?.phone ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-200 text-gray-500 pointer-events-none"}`}
              >
                <FaWhatsapp/> واتساب
              </a>

              {/* التعديل الوحيد: الربط المباشر لصفحة المواعيد */}
              <Link
                href={`/properties/${encodeURIComponent(String(item.id))}/appointments?new=1`}
                className="w-full px-3 py-2 rounded-xl border inline-flex items-center justify-center gap-2"
              >
                <FaCalendarAlt/> طلب موعد للمعاينة
              </Link>

              <Link 
                 href={`/properties/${encodeURIComponent(String(item.id))}/payment`}
                 className="w-full px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center gap-2"
>
                <FaCheck/> حجز العقار
              </Link>
            </div>

            <ContactCard item={item}/>
          </aside>
        </section>

        {/* الوصف + المزايا + الموقع + التعليقات */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4">
          <div className="space-y-4">
            <Block title="الوصف">
              <div className="whitespace-pre-wrap leading-8 text-[15px]">{descAR || "—"}</div>
            </Block>

            <Block title="المزايا">
              <AmenitiesGrid items={Array.isArray(item.amenities) ? item.amenities : []}/>
            </Block>

            <Block title="أماكن قريبة">
              <Chips items={Array.isArray(item.attractions) ? item.attractions : []} empty="لا توجد أماكن قريبة مضافة." prefix="📍 " />
            </Block>

            <ReviewsSection propertyId={item.id}/>
          </div>

          <div className="space-y-4">
            <Block title="الموقع على الخريطة">
              {getMapIframe(item) ? <div className="rounded-xl overflow-hidden border">{getMapIframe(item)}</div> : <div className="text-sm text-gray-500">لم تتم إضافة إحداثيات.</div>}
            </Block>

            <Block title="معلومات إضافية">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">الواجهة</dt><dd className="font-semibold">{item.orientation || "—"}</dd>
                <dt className="text-gray-500">العمر</dt><dd className="font-semibold">{item.age || "—"}</dd>
                <dt className="text-gray-500">التأثيث</dt><dd className="font-semibold">{item.furnishing || "—"}</dd>
                <dt className="text-gray-500">مرهون</dt><dd className="font-semibold">{item.mortgaged ? "نعم" : "لا"}</dd>
                <dt className="text-gray-500">أُضيف في</dt><dd className="font-semibold">{fmtDate(item.createdAt) || "—"}</dd>
                <dt className="text-gray-500">حالة النشر</dt><dd className="font-semibold">{item.published ? "منشور" : "غير منشور"}</dd>
                <dt className="text-gray-500">حالة العقار</dt><dd className="font-semibold">{item.status==="vacant"?"شاغر":item.status==="reserved"?"محجوز":item.status==="hidden"?"مخفي":"مسودة"}</dd>
              </dl>
            </Block>

            {/* شروط التأجير */}
            <Block title="شروط التأجير">
              <RentalTerms propertyId={item.id}/>
            </Block>
          </div>
        </section>

        {/* مشابه */}
        {similar.length > 0 && (
          <section className="space-y-3">
            <div className="text-lg font-semibold">عقارات مشابهة</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similar.map(s => {
                const img = s.coverImage || s.images?.[s.coverIndex||0] || s.images?.[0] || "";
                return (
                  <Link href={`/properties/${encodeURIComponent(String(s.id))}`} key={s.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition block">
                    {img ? <img src={img} className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-gray-100" />}
                    <div className="p-3">
                      <div className="font-semibold line-clamp-1">{titleToText(s.title) || `#${s.id}`}</div>
                      <div className="text-xs text-gray-600 line-clamp-1">{[s.province, s.state, s.village].filter(Boolean).join(" - ")}</div>
                      <div className="mt-1 text-[var(--brand-800)] font-bold">{format(s.priceOMR||0)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="pt-2">
          <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
            <FaArrowRight/> عودة إلى جميع العقارات
          </Link>
        </div>
      </main>

      {/* Modals */}
      {chatOpen && (
        <Modal title="مراسلة عبر النظام" onClose={()=>setChatOpen(false)}>
          <ChatWidget propertyId={item.id} targetName={item.altContact?.name || "مالك العقار"} />
        </Modal>
      )}
      {viewOpen && (
        <Modal title="طلب موعد للمعاينة" onClose={()=>setViewOpen(false)}>
          <ViewingForm propertyId={item.id} onDone={()=>setViewOpen(false)} />
        </Modal>
      )}
      {bookOpen && (
        <Modal title="حجز العقار" onClose={()=>setBookOpen(false)}>
          <BookingForm propertyId={item.id} rentMode={item.purpose==="rent"} onDone={()=>setBookOpen(false)} />
        </Modal>
      )}

      <style jsx global>{`
        @media print { header, .sticky, nav, footer, .no-print { display: none !important; } main { padding: 0 !important; } }
      `}</style>
    </Layout>
  );
}

/* ===== Sub-components ===== */

function Stat({ icon, label, value }: { icon:any; label:string; value:any }) {
  return (
    <div className="border rounded-xl px-3 py-3 flex items-center gap-2">
      <span className="text-gray-700">{icon}</span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function Block({ title, children }:{ title:string; children:any }) {
  return (
    <section className="bg-white border rounded-2xl p-4">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </section>
  );
}

function Chips({ items, empty, prefix="" }:{ items:string[]; empty?:string; prefix?:string }) {
  if (!items?.length) return <div className="text-sm text-gray-500">{empty || "—"}</div>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x,i)=>(
        <span key={i} className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm">
          <span>{AMENITY_ICON[x] || "•"}</span><span className="truncate">{x}</span>
        </span>
      ))}
    </div>
  );
}

/* تقييمات */
function RatingsPanel({ overall, subs }:{ overall:number; subs: Record<string, number|undefined> }) {
  const keys: Array<[keyof typeof subs, string]> = [
    ["cleanliness","النظافة"],["comfort","الراحة"],["location","الموقع"],
    ["value","القيمة"],["facilities","المرافق"],["staff","الخدمة"],
  ];
  return (
    <div className="rounded-2xl border p-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-[var(--brand-800)] text-white font-bold text-xl flex items-center justify-center">
          {overall.toFixed(1)}
        </div>
        <div className="font-semibold">التقييم الإجمالي</div>
      </div>
      <div className="space-y-2">
        {keys.map(([k, label]) => {
          const v = Number(subs[k] ?? overall);
          const pct = Math.max(0, Math.min(100, (v/5)*100));
          return (
            <div key={String(k)} className="grid grid-cols-[110px_1fr_44px] items-center gap-2 text-sm">
              <div className="text-gray-600">{label}</div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #16a34a, #0ea5e9)" }} />
              </div>
              <div className="text-right font-semibold">{v.toFixed(1)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* مزايا مدمجة ومضبوطة */
function AmenitiesGrid({ items }: { items: string[] }) {
  if (!items?.length) return <div className="text-sm text-gray-500">لا توجد مزايا مضافة.</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {items.map((a, i) => (
        <span key={i} className="inline-flex items-center gap-2 border rounded-lg px-3 py-1 text-sm">
          <span>{AMENITY_ICON[a] || "•"}</span><span className="truncate">{a}</span>
        </span>
      ))}
    </div>
  );
}

/* بطاقة تواصل */
function ContactCard({ item }:{ item:PItem }) {
  const hasAlt = item.ownerTarget === "alt_contact" && (item.altContact?.name || item.altContact?.phone);
  return (
    <div className="rounded-xl border p-3 bg-gray-50">
      <div className="font-semibold mb-1">التواصل</div>
      {hasAlt ? (
        <div className="text-sm space-y-1">
          <div><span className="text-gray-600">الاسم:</span> <b>{item.altContact?.name || "—"}</b></div>
          <div><span className="text-gray-600">واتساب:</span> <b>{item.altContact?.phone || "—"}</b></div>
        </div>
      ) : (
        <div className="text-sm text-gray-600">التواصل داخل النظام متاح عبر المراسلات المدمجة.</div>
      )}
    </div>
  );
}

/* تعليقات مع توسيع */
type Review = { name:string; rating:number; date?:string; comment?:string };
function ReviewsSection({ propertyId }:{ propertyId:string }) {
  const [list, setList] = useState<Review[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(()=>{
    try {
      const raw = localStorage.getItem(`ao_reviews_${propertyId}`);
      if (raw) setList(JSON.parse(raw));
      else setList([
        { name:"عميل موثّق", rating:4.8, date:new Date().toISOString(), comment:"تجربة ممتازة وموقع مميز." },
        { name:"أحمد", rating:4.5, date:new Date(Date.now()-86400000).toISOString(), comment:"نظيف وهادئ والسعر مناسب." },
        { name:"سالم", rating:4.3, date:new Date(Date.now()-86400000*2).toISOString(), comment:"إطلالة رائعة وخدمات جيدة." },
      ]);
    } catch {}
  }, [propertyId]);

  const shown = expanded ? list : list.slice(0,2);
  const avg = list.length ? (list.reduce((a,c)=>a+c.rating,0)/list.length) : 0;

  return (
    <Block title="تعليقات العملاء">
      {list.length===0 ? (
        <div className="text-sm text-gray-500">لا توجد تعليقات بعد.</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-800)] text-white font-bold text-lg flex items-center justify-center">
              {avg.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">{list.length} تقييم</div>
          </div>
          <div className="space-y-3">
            {shown.map((r,i)=>(
              <div key={i} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.date ? new Date(r.date).toLocaleDateString() : ""}</div>
                </div>
                <div className="text-yellow-600 text-sm flex items-center gap-1 mt-1"><FaStar/>{r.rating.toFixed(1)}</div>
                <div className="text-sm mt-1">{r.comment || ""}</div>
              </div>
            ))}
          </div>
          {list.length > 2 && (
            <button onClick={()=>setExpanded(e=>!e)} className="inline-flex items-center gap-2 text-sm text-[var(--brand-800)]">
              {expanded ? <>إخفاء <FaChevronUp/></> : <>عرض المزيد <FaChevronDown/></>}
            </button>
          )}
        </div>
      )}
    </Block>
  );
}

/* مودال */
function Modal({ title, children, onClose }:{ title:string; children:any; onClose:()=>void }) {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-gray-600 hover:text-black"><FaTimes/></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* محادثة — تُخزن محليًا ويمكن ربطها بلوحة التحكم لاحقًا */
function ChatWidget({ propertyId, targetName }:{ propertyId:string; targetName:string }) {
  const key = `ao_chat_${propertyId}`;
  const [msgs, setMsgs] = useState<{me:boolean; text:string; ts:number}[]>([]);
  const [txt, setTxt] = useState("");

  useEffect(()=>{
    try{ const raw = localStorage.getItem(key); if (raw) setMsgs(JSON.parse(raw)); else setMsgs([{ me:false, text:`مرحبًا، أنا ${targetName}. كيف أساعدك؟`, ts: Date.now()-60000 }]); }catch{}
  },[key, targetName]);

  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(msgs)); }catch{} }, [key, msgs]);

  const send = async () => {
    const t = txt.trim(); if (!t) return;
    setMsgs(prev => [...prev, { me:true, text:t, ts: Date.now() }]);
    setTxt("");
  };

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex-1 overflow-y-auto space-y-2 border rounded-xl p-3">
        {msgs.map((m,i)=>(
          <div key={i} className={`max-w-[80%] px-3 py-2 rounded-xl ${m.me ? "bg-emerald-600 text-white ms-auto" : "bg-gray-100"}`}>
            <div className="text-sm whitespace-pre-wrap">{m.text}</div>
            <div className="text-[10px] opacity-70 mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input value={txt} onChange={e=>setTxt(e.target.value)} className="border rounded-lg p-2 flex-1" placeholder="اكتب رسالتك…" />
        <button onClick={send} className="px-3 py-2 rounded-lg bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"><FaPaperPlane/></button>
      </div>
      <div className="text-[11px] text-gray-500 mt-2">* تُحفَظ المراسلات مؤقتًا محليًا. اربطها لاحقًا بصفحات لوحة التحكم الخاصة بالطرفين.</div>
    </div>
  );
}

/* نموذج المعاينة — يتصل بالـAPI */
function ViewingForm({ propertyId, onDone }:{ propertyId:string; onDone:()=>void }) {
  const router = useRouter();
  const [name, setName] = useState("");  // يُملأ تلقائيًا بعد ربط جلسة المستخدم
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(()=>{ /* TODO: جلب بيانات المستخدم من الجلسة/الكوكيز وملؤها */ },[]);

  const submit = async () => {
    if (!name || !phone || !date || !time) { alert("يرجى تعبئة الحقول المطلوبة"); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/properties/${encodeURIComponent(String(propertyId))}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, date, time, note }),
      });
      const ct = r.headers.get("content-type") || "";
      const txt = await r.text();
      const j = ct.includes("application/json") ? JSON.parse(txt) : { error: "non_json", detail: txt.slice(0,200) };
      if (!r.ok) throw new Error(j.detail || j.error || `HTTP ${r.status}`);

      alert("تم إرسال طلب المعاينة. بانتظار موافقة المالك/المدير.");
      onDone();
      router.push(`/properties/${encodeURIComponent(String(propertyId))}/appointments?new=1`);
    } catch (e:any) {
      alert(e?.message || "فشل إنشاء الموعد");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="الاسم" value={name} onChange={setName} />
        <Field label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="+9689xxxxxxx" />
        <Field label="التاريخ" value={date} onChange={setDate} type="date" icon={<FaCalendarAlt/>} />
        <Field label="الوقت" value={time} onChange={setTime} type="time" icon={<FaClock/>} />
      </div>
      <Textarea label="ملاحظات" value={note} onChange={setNote} rows={4}/>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="px-4 py-2 rounded-xl bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white disabled:opacity-50">{busy?"جارٍ الإرسال":"إرسال الطلب"}</button>
      </div>
      <div className="text-[11px] text-gray-500">* يتم الحفظ عبر API وليس localStorage.</div>
    </div>
  );
}

/* نموذج الحجز — يتطلب حسابًا موثّقًا + دفع عربون */
function BookingForm({ propertyId, rentMode, onDone }:{ propertyId:string; rentMode:boolean; onDone:()=>void }) {
  const [name, setName] = useState("");  // يُملأ من حساب العميل
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState("");
  const [months, setMonths] = useState<number>(rentMode ? 12 : 1);
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name || !phone || !start || (rentMode && !months)) { alert("يرجى تعبئة الحقول المطلوبة"); return; }
    if (!agree) { alert("الرجاء الموافقة على الشروط"); return; }
    setBusy(true);
    try {
      const key = `ao_bookings_${propertyId}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({ name, phone, start, months, note, ts: Date.now(), status:"pending", deposit:"TBD" });
      localStorage.setItem(key, JSON.stringify(list));
      alert("تم إرسال طلب الحجز. سيُطلب دفع العربون المحدد من المؤجر لاحقًا.");
      onDone();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="الاسم" value={name} onChange={setName} />
        <Field label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="+9689xxxxxxx" />
        <Field label="تاريخ البدء" value={start} onChange={setStart} type="date" icon={<FaCalendarAlt/>} />
        {rentMode && <Field label="مدة الحجز (بالأشهر)" value={String(months)} onChange={(v)=>setMonths(Math.max(1, Number(v)||1))} type="number" />}
      </div>
      <Textarea label="ملاحظات" value={note} onChange={setNote} rows={4}/>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={agree} onChange={()=>setAgree(v=>!v)} />
        أوافق على شروط التأجير الخاصة بالمؤجر
      </label>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="px-4 py-2 rounded-xl bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white disabled:opacity-50">{busy?"جارٍ الإرسال":"تأكيد الحجز"}</button>
      </div>
      <div className="text:[11px] text-gray-500">* يتطلب حسابًا مُفعلًا وموثّقًا. اربط الدفع ببوابة إلكترونية وحدد العربون من حساب المؤجر.</div>
    </div>
  );
}

/* عناصر نموذج عامة */
function Field({ label, value, onChange, placeholder, type="text", icon }:{
  label?: string; value: string; onChange: (v:string)=>void; placeholder?: string; type?: string; icon?: any;
}){
  return (
    <label className="text-sm">
      {label && <div className="mb-1 text-gray-600">{label}</div>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
        <input className={`border rounded-lg p-2 w-full ${icon?"ps-9":""}`} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} type={type} />
      </div>
    </label>
  );
}
function Textarea({ label, value, onChange, rows=4 }:{
  label?: string; value: string; onChange: (v:string)=>void; rows?: number;
}){
  return (
    <label className="text-sm">
      {label && <div className="mb-1 text-gray-600">{label}</div>}
      <textarea className="border rounded-lg p-2 w-full" rows={rows} value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  );
}

/* شروط التأجير — تُعرَض من تخزين محلي كنموذج أولي مع زر إظهار */
function RentalTerms({ propertyId }:{ propertyId:string }) {
  const key = `ao_terms_${propertyId}`;
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState<string>("");

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(key);
      setTerms(raw || "• مدة الإيجار 12 شهرًا كحد أدنى.\n• دفع عربون شهرين مقدمًا.\n• يُمنع التدخين داخل الوحدة.\n• يتحمل المستأجر تكاليف المرافق.");
    }catch{}
  },[key]);

  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg">
        {open ? "إخفاء الشروط" : "عرض الشروط"}
      </button>
      {open && <pre className="mt-3 whitespace-pre-wrap text-sm border rounded-lg p-3">{terms}</pre>}
    </div>
  );
}
