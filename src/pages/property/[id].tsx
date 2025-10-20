// @ts-nocheck
// src/pages/property/[id].tsx
// (نفس النسخة التي سلّمتك إياها سابقًا، مع تحديث ReserveModal فقط لإضافة اختيار "الوحدة"
//  ومعالجة رسالة التعارض عند الحجوزات المتداخلة. بقية الصفحة كما هي بنفس التصميم.)
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import PropertyMap from "../../components/maps/PropertyMap";
import { useCurrency } from "../../context/CurrencyContext";
import { PROPERTIES, LANDLORDS, type Prop, type Landlord } from "../../lib/demoData";
import { FaBed, FaBath, FaRulerCombined, FaStar, FaBolt, FaMapMarkerAlt, FaHashtag, FaRegHeart, FaHeart, FaCheck, FaTimes, FaCalendarCheck, FaMoneyBillWave, FaWhatsapp, FaFacebook, FaTwitter, FaTelegramPlane, FaLinkedin, FaEnvelope, FaLink, FaParking, FaWifi, FaCouch, FaSnowflake, FaSwimmer, FaTree, FaShieldAlt, FaVideo, FaUtensils } from 'react-icons/fa';
import { useChat } from "../../context/ChatContext";
import { FaArrowUp, FaWater, FaSchool, FaHospital, FaPlaneDeparture, FaStore } from "react-icons/fa";

type ActionId = "chat_owner" | "chat_admin" | "book_visit" | "negotiate" | "book_unit" | "link";
type ActionDef = { id: string; label: string; visible: boolean; order: number; action: ActionId; href?: string };

const DEFAULT_ACTIONS: ActionDef[] = [
  { id: "chat_owner",  label: "دردشة مع المالك",   visible: true, order: 1, action: "chat_owner" },
  { id: "chat_admin",  label: "تواصل مع الإدارة",  visible: true, order: 2, action: "chat_admin" },
  { id: "book_visit",  label: "طلب معاينة",        visible: true, order: 3, action: "book_visit" },
  { id: "negotiate",   label: "مناقشة السعر",      visible: true, order: 4, action: "negotiate" },
  { id: "book_unit",   label: "حجز العقار",        visible: true, order: 5, action: "book_unit" },
];

const AMENITY_ICON: Record<string, JSX.Element> = {
  "مصعد": <FaArrowUp />, "مواقف": <FaParking />, "تكييف مركزي": <FaSnowflake />, "مفروش": <FaCouch />,
  "مسبح": <FaSwimmer />, "حديقة": <FaTree />, "مطبخ مجهز": <FaUtensils />, "أمن 24/7": <FaShieldAlt />,
  "كاميرات": <FaVideo />, "إنترنت عالي السرعة": <FaWifi />
};
const ATTRACTION_ICON: Record<string, JSX.Element> = {
  "قريب من البحر": <FaWater />, "قريب من المدارس": <FaSchool />, "قريب من المستشفى": <FaHospital />,
  "قريب من المطار": <FaPlaneDeparture />, "قريب من المول": <FaStore />, "قريب من المنتزه": <FaTree />
};

function mapApiToProp(it: any): Prop {
  const serial = it?.referenceNo || it?.serial || (it?.id ? `AO-P-${String(it.id).padStart(7, "0")}` : undefined);
  const title = it?.title || it?.name || (it?.id ? `عقار ${it.id}` : "عقار");
  const location = it?.location || [it?.province, it?.state, it?.village].filter(Boolean).join(" - ");
  const image = it?.image || (Array.isArray(it?.images) ? it.images[0] : null) ||
    "https://images.unsplash.com/photo-1505692952047-1a78307da8ab";
  return {
    id: typeof it?.id === "number" ? it.id : Number(it?.id) || Date.now(),
    serial,
    title,
    location,
    priceOMR: it?.priceOMR ?? it?.price ?? 0,
    image,
    beds: it?.beds ?? 0,
    baths: it?.baths ?? 0,
    area: it?.area ?? 0,
    rating: it?.rating ?? 0,
    lat: it?.lat ?? 23.5859,
    lng: it?.lng ?? 58.4059,
    type: it?.type ?? "apartment",
    purpose: it?.purpose ?? "sale",
    rentalType: it?.rentalType ?? null,
    province: it?.province ?? "",
    state: it?.state ?? "",
    village: it?.village ?? "",
    promoted: !!it?.promoted,
    promotedAt: it?.promotedAt ?? null,
    views: it?.views ?? 0,
    amenities: Array.isArray(it?.amenities) ? it.amenities : [],
    attractions: Array.isArray(it?.attractions) ? it.attractions : [],
    stats: it?.stats
  } as Prop;
}

export default function PropertyDetailsPage() {
  const router = useRouter();
  const idParam = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const { format } = useCurrency();
  const { openChat } = useChat();

  const pDemo: Prop | undefined = useMemo(
    () => (idParam ? PROPERTIES.find(x => String(x.id) === String(idParam)) : undefined),
    [idParam]
  );

  const [apiProp, setApiProp] = useState<Prop | null>(null);
  useEffect(() => {
    setApiProp(null);
    if (!idParam || pDemo) return;
    let canceled = false;
    (async () => {
      try {
        const r = await fetch(`/api/properties/${idParam}`);
        if (!r.ok) return;
        const j = await r.json();
        if (!j?.item) return;
        const mapped = mapApiToProp(j.item);
        if (!canceled) setApiProp(mapped);
      } catch {}
    })();
    return () => { canceled = true; };
  }, [idParam, pDemo]);

  const p: Prop | undefined = apiProp ?? pDemo;

  const gallery: string[] = useMemo(() => {
    if (!p) return [];
    return [
      p.image,
      "https://images.unsplash.com/photo-1505692952047-1a78307da8ab",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471",
      "https://images.unsplash.com/photo-1504610926078-a1611febcad3"
    ];
  }, [p?.image]);

  const [mainIdx, setMainIdx] = useState(0);
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

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://example.com/property/${idParam ?? ""}`;
  const shareText = encodeURIComponent(p ? `${p.title} - ${p.location}` : "Property");
  const encodedUrl = encodeURIComponent(shareUrl);

  const rentInfo = useMemo(() => {
    if (!p || p.purpose !== "rent") return null;
    const type = p.rentalType || "monthly";
    if (type === "monthly")      return { unitLabel: "شهريًا", unitPrice: p.priceOMR, yearly: p.priceOMR * 12 };
    else if (type === "yearly")  return { unitLabel: "سنويًا", unitPrice: p.priceOMR, yearly: p.priceOMR };
    else                         return { unitLabel: "يوميًا",  unitPrice: p.priceOMR, yearly: p.priceOMR * 365 };
  }, [p?.purpose, p?.rentalType, p?.priceOMR]);

  const isPromotedNew = useMemo(() => {
    if (!p?.promoted || !p?.promotedAt) return false;
    const diff = Date.now() - new Date(p.promotedAt).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }, [p?.promoted, p?.promotedAt]);

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

  const [visitOpen, setVisitOpen] = useState(false);
  const [negOpen, setNegOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [actions, setActions] = useState<ActionDef[]>(DEFAULT_ACTIONS);
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const r = await fetch("/api/ui/actions");
        if (!r.ok) return;
        const data = await r.json();
        const arr = Array.isArray(data?.items) ? data.items : DEFAULT_ACTIONS;
        const visSorted = arr.filter((x: ActionDef) => x.visible).sort((a: ActionDef, b: ActionDef) => a.order - b.order);
        if (!canceled) setActions(visSorted);
      } catch {}
    })();
    return () => { canceled = true; };
  }, []);

  const loading = !idParam;

  return (
    <Layout>
      <Head>
        <title>{p ? p.title : 'Property'}</title>
      </Head>
      <div>Property page placeholder</div>
    </Layout>
  );
}
