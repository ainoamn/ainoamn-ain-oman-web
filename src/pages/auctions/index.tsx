import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/context/ThemeContext";

// التحميل الديناميكي للخرائط
const LoadScript = dynamic(() => import("@react-google-maps/api").then(m => m.LoadScript), { ssr: false });
const GoogleMap = dynamic(() => import("@react-google-maps/api").then(m => m.GoogleMap), { ssr: false });
const Marker = dynamic(() => import("@react-google-maps/api").then(m => m.Marker), { ssr: false });

// أنماط الخريطة المظلمة
const darkMapStyle: any[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

// دالة المساعدة للجلسة
function getSession() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("ain_auth") : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return { role: "guest", plan: null, features: [] };
}

function hasFeature(feature: string, session: any) {
  return session.features?.includes(feature);
}

function SubscriptionBanner({ needFeature }: { needFeature?: string }) {
  const { t, dir } = useI18n();
  const session = getSession();
  const allowed = needFeature ? hasFeature(needFeature, session) : !!session.plan;
  
  if (allowed) return null;
  
  return (
    <div dir={dir} className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="text-sm">{t("subs.view.paywall")} — {t("subs.required")}</div>
      <Link href="/subscriptions" className="btn btn-primary text-sm">
        {t("subs.upgrade")}
      </Link>
    </div>
  );
}

// أنواع البيانات
type Auction = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  currentBid: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  startTime: number;
  endTime: number;
  image: string;
  features: string[];
  auctionType: string;
  coords: { lat: number; lng: number };
  featured?: boolean;
  status: 'active' | 'upcoming' | 'ended';
};

// أنواع الفلاتر
interface FilterOptions {
  searchTerm: string;
  propertyType: string;
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  minArea: number | null;
  auctionStatus: string;
  sortBy: string;
}

export default function AuctionsPage() {
  const { t, dir } = useI18n();
  const { theme, isDark } = useTheme();
  const session = getSession();
  const canCreate = hasFeature("CREATE_AUCTION", session);
  const isManager = session.role === "admin" || session.role === "owner";

  const [loading, setLoading] = useState(true);
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: "",
    propertyType: "all",
    location: "all",
    minPrice: null,
    maxPrice: null,
    minBedrooms: null,
    minArea: null,
    auctionStatus: "all",
    sortBy: "featured",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const defaultCenter = { lat: 23.5880, lng: 58.3829 };

  // استخراج المواقع الفريدة للفلتر
  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(allAuctions.map(a => a.location)));
    return uniqueLocations.sort();
  }, [allAuctions]);

  useEffect(() => {
    const now = Date.now();
    const mock: Auction[] = [
      { 
        id: "auction1", 
        title: "فيلا فاخرة في حي السفارات", 
        description: "فيلا فاخرة بمساحة 450 م² مع مسبح وحديقة.", 
        location: "مسقط، الخوض", 
        price: 250000, 
        currentBid: 225000, 
        area: 450, 
        bedrooms: 5, 
        bathrooms: 4, 
        startTime: now + 24*3600*1000, // يبدأ بعد يوم
        endTime: now + 72*3600*1000,   // ينتهي بعد 3 أيام
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1470&q=80", 
        features: ["مسبح","حديقة","مواقف"], 
        auctionType: "مزاد علني", 
        coords: { lat: 23.6005, lng: 58.1606 },
        featured: true,
        status: 'upcoming'
      },
      { 
        id: "auction2", 
        title: "شقة راقية بإطلالة بحرية", 
        description: "شقة 180 م² بإطلالة مباشرة على البحر.", 
        location: "مسقط، شاطئ القرم", 
        price: 120000, 
        currentBid: 98000, 
        area: 180, 
        bedrooms: 3, 
        bathrooms: 2, 
        startTime: now - 24*3600*1000, // بدأ منذ يوم
        endTime: now + 24*3600*1000,   // ينتهي بعد يوم
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1470&q=80", 
        features: ["إطلالة بحرية","صالة رياضية"], 
        auctionType: "مزاد إلكتروني", 
        coords: { lat: 23.6139, lng: 58.5334 },
        featured: true,
        status: 'active'
      },
      { 
        id: "auction3", 
        title: "أرض سكنية مميزة", 
        description: "أرض 800 م² على شارع رئيسي.", 
        location: "بركاء", 
        price: 90000, 
        currentBid: 72000, 
        area: 800, 
        bedrooms: 0, 
        bathrooms: 0, 
        startTime: now - 48*3600*1000, // بدأ منذ يومين
        endTime: now + 48*3600*1000,   // ينتهي بعد يومين
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1475&q=80", 
        features: ["موقع مميز","قريبة من الخدمات"], 
        auctionType: "مزاد علني", 
        coords: { lat: 23.6800, lng: 57.9000 },
        status: 'active'
      },
      { 
        id: "auction4", 
        title: "شقة دوبلكس فاخرة", 
        description: "دوبلكس 220 م² بإطلالة بانورامية.", 
        location: "مسقط، مدينة السلطان قابوس", 
        price: 160000, 
        currentBid: 130000, 
        area: 220, 
        bedrooms: 4, 
        bathrooms: 3, 
        startTime: now + 48*3600*1000, // يبدأ بعد يومين
        endTime: now + 120*3600*1000,  // ينتهي بعد 5 أيام
        image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1470&q=80", 
        features: ["دوبلكس","مواقف مغلقة"], 
        auctionType: "مزاد إلكتروني", 
        coords: { lat: 23.5950, lng: 58.4200 },
        status: 'upcoming'
      },
      { 
        id: "auction5", 
        title: "قصر فخم", 
        description: "قصر بمساحة 1200 م² وحدائق خاصة.", 
        location: "نزوى", 
        price: 950000, 
        currentBid: 850000, 
        area: 1200, 
        bedrooms: 8, 
        bathrooms: 6, 
        startTime: now - 120*3600*1000, // بدأ منذ 5 أيام
        endTime: now - 24*3600*1000,    // انتهى منذ يوم
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1453&q=80", 
        features: ["قصر","حدائق","ملاعب"], 
        auctionType: "مزاد علني", 
        coords: { lat: 22.9333, lng: 57.5333 },
        featured: true,
        status: 'ended'
      },
      { 
        id: "auction6", 
        title: "بيت شاطئي", 
        description: "بيت شاطئي 680 م² بإطلالة مباشرة.", 
        location: "صور", 
        price: 450000, 
        currentBid: 420000, 
        area: 680, 
        bedrooms: 6, 
        bathrooms: 5, 
        startTime: now - 96*3600*1000, // بدأ منذ 4 أيام
        endTime: now - 48*3600*1000,   // انتهى منذ يومين
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1470&q=80", 
        features: ["شاطئ خاص","ديكور فاخر"], 
        auctionType: "مزاد علني", 
        coords: { lat: 22.5667, lng: 59.5289 },
        status: 'ended'
      },
      { 
        id: "auction7", 
        title: "شقة فندقية فاخرة", 
        description: "شقة فندقية 120 م² بمرافق متكاملة.", 
        location: "صلالة", 
        price: 180000, 
        currentBid: 160000, 
        area: 120, 
        bedrooms: 2, 
        bathrooms: 2, 
        startTime: now - 12*3600*1000, // بدأ منذ 12 ساعة
        endTime: now + 36*3600*1000,   // ينتهي بعد يوم ونصف
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1470&q=80", 
        features: ["فندقية","خدمات متكاملة"], 
        auctionType: "مزاد إلكتروني", 
        coords: { lat: 17.0151, lng: 54.0924 },
        featured: true,
        status: 'active'
      },
      { 
        id: "auction8", 
        title: "مزرعة حديثة", 
        description: "مزرعة 2000 م² بنظام ري متكامل.", 
        location: "البريمي", 
        price: 320000, 
        currentBid: 285000, 
        area: 2000, 
        bedrooms: 4, 
        bathrooms: 3, 
        startTime: now + 72*3600*1000, // يبدأ بعد 3 أيام
        endTime: now + 240*3600*1000,  // ينتهي بعد 10 أيام
        image: "https://images.unsplash.com/photo-1589923188937-cb64779b46a0?auto=format&fit=crop&w=1471&q=80", 
        features: ["مزرعة","نظام ري"], 
        auctionType: "مزاد علني", 
        coords: { lat: 24.2509, lng: 55.7931 },
        status: 'upcoming'
      },
    ];
    setAllAuctions(mock);
    setLoading(false);
  }, []);

  // تصنيف المزادات حسب الحالة والمميزة
  const { featuredActive, active, upcoming, featuredEnded, ended } = useMemo(() => {
    const now = Date.now();
    return {
      featuredActive: allAuctions.filter(a => a.featured && a.status === 'active'),
      active: allAuctions.filter(a => !a.featured && a.status === 'active'),
      upcoming: allAuctions.filter(a => a.status === 'upcoming'),
      featuredEnded: allAuctions.filter(a => a.featured && a.status === 'ended'),
      ended: allAuctions.filter(a => !a.featured && a.status === 'ended')
    };
  }, [allAuctions]);

  // تطبيق الفلاتر والبحث
  const filteredAuctions = useMemo(() => {
    let result = [...allAuctions];
    
    // تطبيق البحث
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term) || 
        a.location.toLowerCase().includes(term)
      );
    }
    
    // تطبيق فلتر نوع العقار
    if (filterOptions.propertyType !== "all") {
      if (filterOptions.propertyType === "villas") {
        result = result.filter(a => a.bedrooms >= 4);
      } else if (filterOptions.propertyType === "apartments") {
        result = result.filter(a => a.bedrooms >= 1 && a.bedrooms <= 3);
      } else if (filterOptions.propertyType === "lands") {
        result = result.filter(a => a.bedrooms === 0);
      }
    }
    
    // تطبيق فلتر الموقع
    if (filterOptions.location !== "all") {
      result = result.filter(a => a.location === filterOptions.location);
    }
    
    // تطبيق فلتر السعر
    if (filterOptions.minPrice !== null) {
      result = result.filter(a => a.currentBid >= filterOptions.minPrice!);
    }
    if (filterOptions.maxPrice !== null) {
      result = result.filter(a => a.currentBid <= filterOptions.maxPrice!);
    }
    
    // تطبيق فلتر عدد الغرف
    if (filterOptions.minBedrooms !== null) {
      result = result.filter(a => a.bedrooms >= filterOptions.minBedrooms!);
    }
    
    // تطبيق فلتر المساحة
    if (filterOptions.minArea !== null) {
      result = result.filter(a => a.area >= filterOptions.minArea!);
    }
    
    // تطبيق فلتر حالة المزاد
    const now = Date.now();
    if (filterOptions.auctionStatus !== "all") {
      if (filterOptions.auctionStatus === "active") {
        result = result.filter(a => a.status === 'active');
      } else if (filterOptions.auctionStatus === "upcoming") {
        result = result.filter(a => a.status === 'upcoming');
      } else if (filterOptions.auctionStatus === "ended") {
        result = result.filter(a => a.status === 'ended');
      }
    }
    
    // تطبيق الترتيب
    if (filterOptions.sortBy === "price-low") {
      result.sort((a, b) => a.currentBid - b.currentBid);
    } else if (filterOptions.sortBy === "price-high") {
      result.sort((a, b) => b.currentBid - a.currentBid);
    } else if (filterOptions.sortBy === "ending") {
      result.sort((a, b) => a.endTime - b.endTime);
    } else if (filterOptions.sortBy === "featured") {
      result.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.endTime - a.endTime;
      });
    }
    
    return result;
  }, [allAuctions, filterOptions]);

  // تصنيف النتائج بعد التصفية
  const { filteredFeaturedActive, filteredActive, filteredUpcoming, filteredFeaturedEnded, filteredEnded } = useMemo(() => {
    return {
      filteredFeaturedActive: filteredAuctions.filter(a => a.featured && a.status === 'active'),
      filteredActive: filteredAuctions.filter(a => !a.featured && a.status === 'active'),
      filteredUpcoming: filteredAuctions.filter(a => a.status === 'upcoming'),
      filteredFeaturedEnded: filteredAuctions.filter(a => a.featured && a.status === 'ended'),
      filteredEnded: filteredAuctions.filter(a => !a.featured && a.status === 'ended')
    };
  }, [filteredAuctions]);

  const formatPrice = (n: number) => new Intl.NumberFormat("ar-OM").format(n) + " ر.ع";
  const mapContainerStyle = { width: "100%", height: "500px", borderRadius: "12px" } as const;

  const onMapLoad = useCallback((map: any) => {
    setMapInstance(map);
    setMapLoaded(true);
  }, []);

  const onMapUnmount = useCallback(() => setMapInstance(null), []);

  useEffect(() => {
    if (!mapLoaded || !mapInstance || filteredAuctions.length === 0 || !(window as any).google) return;
    try {
      const bounds = new (window as any).google.maps.LatLngBounds();
      filteredAuctions.forEach(p => bounds.extend(p.coords));
      mapInstance.fitBounds(bounds);
    } catch (e) {
      console.error(e);
      setMapError(true);
    }
  }, [filteredAuctions, mapLoaded, mapInstance]);

  const hasMapsKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const resetFilters = () => {
    setFilterOptions({
      searchTerm: "",
      propertyType: "all",
      location: "all",
      minPrice: null,
      maxPrice: null,
      minBedrooms: null,
      minArea: null,
      auctionStatus: "all",
      sortBy: "featured",
    });
  };

  const getTimeRemaining = (endTime: number) => {
    const diff = endTime - Date.now();
    if (diff <= 0) return "منتهي";
    
    const days = Math.max(0, Math.floor(diff / 86400000));
    const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
    const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
    
    return `${days} يوم ${hours} ساعة ${minutes} دقيقة`;
  };

  const getStatusBadge = (status: string, featured?: boolean) => {
    if (status === 'ended') return "منتهي";
    if (status === 'upcoming') return "قادم";
    return featured ? "مميز" : "نشط";
  };

  const getStatusColor = (status: string, featured?: boolean) => {
    if (status === 'ended') return "bg-gray-500";
    if (status === 'upcoming') return "bg-blue-500";
    return featured ? "bg-yellow-500" : "bg-red-500";
  };

  return (
    <main dir={dir} className={isDark ? "bg-gray-900 min-h-screen flex flex-col" : "bg-gray-50 min-h-screen flex flex-col"}>
      <Head><title>{t("auctions.title")} | Ain Oman</title></Head>
      <Header />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <SubscriptionBanner />

          <div className="mb-4 flex gap-3 justify-end">
            {isManager && (
              <Link href="/dashboard/auctions" className="btn btn-primary text-sm">
                إدارة المزادات
              </Link>
            )}
            {canCreate ? (
              <Link href="/auctions/sell" className="btn btn-primary text-sm">
                بيع عبر المزاد
              </Link>
            ) : (
              <Link href="/subscriptions" className="btn btn-primary text-sm">
                بيع عبر المزاد — ترقية الباقة
              </Link>
            )}
          </div>

          <div className="mb-8 rounded-2xl p-8 text-center text-white brand-bg">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t("auctions.title")}</h1>
            <p className="text-lg opacity-90 mb-6">{t("auctions.subtitle")}</p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <input
                type="text"
                placeholder={t("auctions.search")}
                className="w-full md:w-2/3 p-4 rounded-full text-gray-800 focus:outline-none shadow-lg"
                value={filterOptions.searchTerm}
                onChange={(e) => setFilterOptions({...filterOptions, searchTerm: e.target.value})}
              />
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-4 rounded-full bg-white text-gray-800 focus:outline-none shadow-lg"
              >
                {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
              </button>
            </div>
          </div>

          {/* الفلاتر المتقدمة */}
          {showFilters && (
            <div className={`mb-8 p-6 rounded-2xl shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نوع العقار</label>
                  <select 
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.propertyType}
                    onChange={(e) => setFilterOptions({...filterOptions, propertyType: e.target.value})}
                  >
                    <option value="all">جميع الأنواع</option>
                    <option value="villas">فيلات</option>
                    <option value="apartments">شقق</option>
                    <option value="lands">أراضي</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">المحافظة</label>
                  <select 
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.location}
                    onChange={(e) => setFilterOptions({...filterOptions, location: e.target.value})}
                  >
                    <option value="all">جميع المحافظات</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">حالة المزاد</label>
                  <select 
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.auctionStatus}
                    onChange={(e) => setFilterOptions({...filterOptions, auctionStatus: e.target.value})}
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="active">نشطة</option>
                    <option value="upcoming">قادمة</option>
                    <option value="ended">منتهية</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">الترتيب حسب</label>
                  <select 
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.sortBy}
                    onChange={(e) => setFilterOptions({...filterOptions, sortBy: e.target.value})}
                  >
                    <option value="featured">المميزة أولاً</option>
                    <option value="price-low">السعر (منخفض إلى مرتفع)</option>
                    <option value="price-high">السعر (مرتفع إلى منخفض)</option>
                    <option value="ending">تنتهي قريباً</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">أقل سعر (ر.ع)</label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.minPrice || ""}
                    onChange={(e) => setFilterOptions({...filterOptions, minPrice: e.target.value ? Number(e.target.value) : null})}
                    placeholder="أقل سعر"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">أعلى سعر (ر.ع)</label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.maxPrice || ""}
                    onChange={(e) => setFilterOptions({...filterOptions, maxPrice: e.target.value ? Number(e.target.value) : null})}
                    placeholder="أعلى سعر"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">أقل عدد غرف</label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.minBedrooms || ""}
                    onChange={(e) => setFilterOptions({...filterOptions, minBedrooms: e.target.value ? Number(e.target.value) : null})}
                    placeholder="أقل عدد غرف"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">أقل مساحة (م²)</label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-lg border"
                    value={filterOptions.minArea || ""}
                    onChange={(e) => setFilterOptions({...filterOptions, minArea: e.target.value ? Number(e.target.value) : null})}
                    placeholder="أقل مساحة"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
                >
                  إعادة الضبط
                </button>
                <div className="text-sm text-gray-500">
                  {filteredAuctions.length} نتيجة
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className={`min-h-[200px] flex items-center justify-center ${isDark ? "text-white" : "text-gray-800"}`}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-6"></div>
                <p className="text-xl">جاري تحميل العقارات...</p>
              </div>
            </div>
          ) : (
            <>
              {/* المزادات المميزة النشطة */}
              {filteredFeaturedActive.length > 0 && (
                <section className="mb-12">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>المزادات المميزة النشطة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredFeaturedActive.map((p) => {
                      const diff = p.endTime - Date.now();
                      const days = Math.max(0, Math.floor(diff / 86400000));
                      const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
                      const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
                      return (
                        <article key={p.id} className={`rounded-xl overflow-hidden shadow-xl transition hover:scale-[1.02] ${isDark ? "bg-gray-800" : "bg-white"}`}>
                          <div className="relative">
                            <img src={p.image} alt={p.title} className="w-full h-56 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              مميز
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className={`p-3 rounded-lg backdrop-blur-sm ${isDark ? "bg-black/30 text-white" : "bg-white/90 text-gray-800"}`}>
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">الوقت المتبقي</div>
                                  <div className="flex gap-3 text-sm">
                                    <span className="text-center"><b>{days}</b> يوم</span>
                                    <span className="text-center"><b>{hours}</b> ساعة</span>
                                    <span className="text-center"><b>{minutes}</b> دقيقة</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>{p.title}</h3>
                                <div className="text-sm text-gray-500">{p.location}</div>
                              </div>
                            </div>
                            <div className={`p-4 rounded-lg mb-4 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs text-gray-500">السعر الابتدائي</div>
                                  <div className={isDark ? "text-blue-300 font-semibold" : "text-blue-600 font-semibold"}>{formatPrice(p.price)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">المزايدة الحالية</div>
                                  <div className={isDark ? "text-green-300 font-semibold" : "text-green-600 font-semibold"}>{formatPrice(p.currentBid)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Link href={`/auctions/${p.id}`} className="btn btn-primary flex-1 font-medium text-center">
                                عرض التفاصيل
                              </Link>
                              <Link href={`/auctions/${p.id}`} className="btn font-medium text-center px-4">
                                قدّم مزايدة
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* المزادات النشطة العادية */}
              {filteredActive.length > 0 && (
                <section className="mb-12">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>المزادات النشطة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredActive.map((p) => {
                      const diff = p.endTime - Date.now();
                      const days = Math.max(0, Math.floor(diff / 86400000));
                      const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
                      const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
                      return (
                        <article key={p.id} className={`rounded-xl overflow-hidden shadow-xl transition hover:scale-[1.02] ${isDark ? "bg-gray-800" : "bg-white"}`}>
                          <div className="relative">
                            <img src={p.image} alt={p.title} className="w-full h-56 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {p.auctionType}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className={`p-3 rounded-lg backdrop-blur-sm ${isDark ? "bg-black/30 text-white" : "bg-white/90 text-gray-800"}`}>
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">الوقت المتبقي</div>
                                  <div className="flex gap-3 text-sm">
                                    <span className="text-center"><b>{days}</b> يوم</span>
                                    <span className="text-center"><b>{hours}</b> ساعة</span>
                                    <span className="text-center"><b>{minutes}</b> دقيقة</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>{p.title}</h3>
                                <div className="text-sm text-gray-500">{p.location}</div>
                              </div>
                            </div>
                            <div className={`p-4 rounded-lg mb-4 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs text-gray-500">السعر الابتدائي</div>
                                  <div className={isDark ? "text-blue-300 font-semibold" : "text-blue-600 font-semibold"}>{formatPrice(p.price)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">المزايدة الحالية</div>
                                  <div className={isDark ? "text-green-300 font-semibold" : "text-green-600 font-semibold"}>{formatPrice(p.currentBid)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Link href={`/auctions/${p.id}`} className="btn btn-primary flex-1 font-medium text-center">
                                عرض التفاصيل
                              </Link>
                              <Link href={`/auctions/${p.id}`} className="btn font-medium text-center px-4">
                                قدّم مزايدة
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* المزادات القادمة */}
              {filteredUpcoming.length > 0 && (
                <section className="mb-12">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>المزادات القادمة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredUpcoming.map((p) => {
                      const startDiff = p.startTime - Date.now();
                      const startDays = Math.max(0, Math.floor(startDiff / 86400000));
                      const startHours = Math.max(0, Math.floor((startDiff % 86400000) / 3600000));
                      return (
                        <article key={p.id} className={`rounded-xl overflow-hidden shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                          <div className="relative">
                            <img src={p.image} alt={p.title} className="w-full h-56 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              قادم
                            </div>
                            {p.featured && (
                              <div className="absolute top-14 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                مميز
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>{p.title}</h3>
                                <div className="text-sm text-gray-500">{p.location}</div>
                              </div>
                            </div>
                            <div className={`p-4 rounded-lg mb-4 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs text-gray-500">السعر الابتدائي</div>
                                  <div className={isDark ? "text-blue-300 font-semibold" : "text-blue-600 font-semibold"}>{formatPrice(p.price)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">يبدأ بعد</div>
                                  <div className={isDark ? "text-purple-300 font-semibold" : "text-purple-600 font-semibold"}>
                                    {startDays} يوم {startHours} ساعة
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Link href={`/auctions/${p.id}`} className="btn btn-primary flex-1 font-medium text-center">
                                عرض التفاصيل
                              </Link>
                              <button className="btn font-medium text-center px-4" disabled>
                                قريباً
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* المزادات المنتهية المميزة */}
              {filteredFeaturedEnded.length > 0 && (
                <section className="mb-12">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>المزادات المنتهية المميزة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredFeaturedEnded.map((p) => (
                      <article key={p.id} className={`rounded-xl overflow-hidden shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <div className="relative">
                          <img src={p.image} alt={p.title} className="w-full h-56 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            مميز منتهي
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>{p.title}</h3>
                              <div className="text-sm text-gray-500">{p.location}</div>
                            </div>
                          </div>
                          <div className={`p-4 rounded-lg mb-4 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-500">السعر الابتدائي</div>
                                <div className={isDark ? "text-blue-300 font-semibold" : "text-blue-600 font-semibold"}>{formatPrice(p.price)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">السعر النهائي</div>
                                <div className={isDark ? "text-green-300 font-semibold" : "text-green-600 font-semibold"}>{formatPrice(p.currentBid)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Link href={`/auctions/${p.id}`} className="btn btn-primary flex-1 font-medium text-center">
                              عرض التفاصيل
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* المزادات المنتهية العادية */}
              {filteredEnded.length > 0 && (
                <section className="mb-12">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>المزادات المنتهية</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEnded.map((p) => (
                      <article key={p.id} className={`rounded-xl overflow-hidden shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <div className="relative">
                          <img src={p.image} alt={p.title} className="w-full h-56 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            منتهي
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>{p.title}</h3>
                              <div className="text-sm text-gray-500">{p.location}</div>
                            </div>
                          </div>
                          <div className={`p-4 rounded-lg mb-4 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-500">السعر الابتدائي</div>
                                <div className={isDark ? "text-blue-300 font-semibold" : "text-blue-600 font-semibold"}>{formatPrice(p.price)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">السعر النهائي</div>
                                <div className={isDark ? "text-green-300 font-semibold" : "text-green-600 font-semibold"}>{formatPrice(p.currentBid)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Link href={`/auctions/${p.id}`} className="btn btn-primary flex-1 font-medium text-center">
                              عرض التفاصيل
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {filteredAuctions.length === 0 && (
                <div className={`text-center py-12 rounded-xl ${isDark ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600"} shadow-lg`}>
                  لا توجد عقارات تطابق بحثك
                </div>
              )}

              {/* خريطة المواقع */}
              <section className="mb-12">
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>مواقع المزايدات</h2>
                <div className="rounded-xl overflow-hidden shadow-xl">
                  {!hasMapsKey ? (
                    <div className={`p-12 text-center ${isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-600"}`}>
                      لم يتم ضبط مفتاح Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
                    </div>
                  ) : mapError ? (
                    <div className={`p-12 text-center ${isDark ? "bg-gray-800 text-red-400" : "bg-white text-red-600"}`}>
                      تعذّر تحميل خرائط Google
                    </div>
                  ) : (
                    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string} onError={() => setMapError(true)} onLoad={() => setMapLoaded(true)}>
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={defaultCenter}
                        zoom={8}
                        onLoad={onMapLoad}
                        onUnmount={onMapUnmount}
                        options={{
                          styles: isDark ? (darkMapStyle as any) : [],
                          streetViewControl: false,
                          mapTypeControl: false,
                          fullscreenControl: false,
                        }}
                      >
                        {filteredAuctions.map((p) => (
                          <Marker
                            key={p.id}
                            position={p.coords}
                            title={p.title}
                            onClick={() => { if (mapInstance) { mapInstance.setCenter(p.coords); mapInstance.setZoom(14); } }}
                          />
                        ))}
                      </GoogleMap>
                    </LoadScript>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}