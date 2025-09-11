import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/context/ThemeContext";

// التحميل الديناميكي للخرائط
const LoadScript = dynamic(
  () => import("@react-google-maps/api").then((m) => m.LoadScript),
  { ssr: false }
);

const GoogleMap = dynamic(
  () => import("@react-google-maps/api").then((m) => m.GoogleMap),
  { ssr: false }
);

const Marker = dynamic(
  () => import("@react-google-maps/api").then((m) => m.Marker),
  { ssr: false }
);

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
    <div
      dir={dir}
      className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 flex items-center justify-between"
    >
      <div className="text-sm">
        {t("subs.view.paywall")} — {t("subs.required")}
      </div>
      <Link
        href="/subscriptions"
        className="btn btn-primary text-sm"
      >
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
  endTime: number;
  image: string;
  features: string[];
  auctionType: string;
  coords: { lat: number; lng: number };
};

// البيانات الوهمية - تأكد من وجود auction2
const DATA: Auction[] = [
  {
    id: "auction1",
    title: "فيلا فاخرة في حي السفارات",
    description: "فيلا فاخرة بمساحة 450 م² في موقع مميز.",
    location: "مسقط، الخوض",
    price: 250000,
    currentBid: 225000,
    area: 450,
    bedrooms: 5,
    bathrooms: 4,
    endTime: Date.now() + 48 * 3600 * 1000,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1470&q=80",
    features: ["مسبح", "جاكوزي", "حديقة خاصة", "مواقف سيارات"],
    auctionType: "مزاد علني",
    coords: { lat: 23.6005, lng: 58.1606 },
  },
  {
    id: "auction2",
    title: "شقة راقية بإطلالة بحرية",
    description: "شقة 180 م² بإطلالة على البحر.",
    location: "مسقط، شاطئ القرم",
    price: 120000,
    currentBid: 98000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    endTime: Date.now() + 24 * 3600 * 1000,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1470&q=80",
    features: ["إطلالة على البحر", "نظام أمن", "صالة رياضية"],
    auctionType: "مزاد إلكتروني",
    coords: { lat: 23.6139, lng: 58.5334 },
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
    endTime: Date.now() + 72 * 3600 * 1000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1475&q=80",
    features: ["موقع مميز", "شبكة طرق ممتازة", "قريب من الخدمات"],
    auctionType: "مزاد علني",
    coords: { lat: 23.68, lng: 57.9 },
  },
];

// تحليل الذكاء الاصطناعي
function AuctionInsights({
  price,
  currentBid,
  area,
  bedrooms,
  bathrooms,
  features,
}: {
  price: number;
  currentBid: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
}) {
  const { t } = useI18n();

  const fair = useMemo(() => {
    const base = price * 0.96;
    const areaAdj = (area || 0) * 15;
    const roomAdj = (bedrooms + bathrooms) * 1200;
    const featAdj = (features?.length || 0) * 800;
    return Math.round(base + areaAdj + roomAdj + featAdj);
  }, [price, area, bedrooms, bathrooms, features]);

  const risk = useMemo(() => {
    const ratio = currentBid / Math.max(1, fair);
    if (ratio < 0.92) return "منخفض";
    if (ratio < 1.02) return "متوسط";
    return "مرتفع";
  }, [currentBid, fair]);

  const next = useMemo(() => {
    if (risk === "منخفض") return "ضع مزايدة تدريجية (+500 إلى +1,000) قبل آخر ساعة";
    if (risk === "متوسط")
      return "راقب حركة المزايدات واضبط سقفك وفقًا للقيمة العادلة";
    return "تجنّب رفع المزايدة كثيرًا؛ السعر يقترب من/يتجاوز القيمة العادلة";
  }, [risk]);

  const fmt = (n: number) => new Intl.NumberFormat("ar-OM").format(n) + " ر.ع";

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{t("ai.analysis")}</h3>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">القيمة العادلة</div>
          <div className="text-lg font-semibold">{fmt(fair)}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">المخاطر</div>
          <div
            className={`text-lg font-semibold ${
              risk === "مرتفع"
                ? "text-rose-600"
                : risk === "متوسط"
                ? "text-amber-600"
                : "text-emerald-600"
            }`}
          >
            {risk}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">الخطوة التالية</div>
          <div className="text-sm text-slate-700">{next}</div>
        </div>
      </div>
    </div>
  );
}

// تنسيق السعر
const formatPrice = (n: number) =>
  new Intl.NumberFormat("ar-OM").format(n) + " ر.ع";

// الصفحة الرئيسية
export default function AuctionDetailsPage() {
  const { t, dir } = useI18n();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [property, setProperty] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bids, setBids] = useState<
    { id: number; bidder: string; amount: number; time: string }[]
  >([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        
        // محاكاة جلب البيانات من API
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        if (!mounted) return;
        
        // البحث في البيانات الوهمية
        const found = DATA.find((x) => x.id === id);
        
        if (!mounted) return;
        
        if (found) {
          setProperty(found);
          setBids([
            {
              id: 1,
              bidder: "عمر أحمد",
              amount: Math.max(0, found.currentBid - 5000),
              time: "منذ 30 دقيقة",
            },
            {
              id: 2,
              bidder: "سارة محمد",
              amount: Math.max(0, found.currentBid - 10000),
              time: "منذ ساعة",
            },
          ]);
          setBidAmount(String(found.currentBid + 1000));
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error("Error fetching auction data:", error);
        setProperty(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    if (id) {
      fetchAuctionData();
    } else {
      setLoading(false);
      setProperty(null);
    }
    
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!property) return;
    
    const timer = setInterval(() => {
      const diff = property.endTime - Date.now();
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [property]);

  // صلاحيات العرض
  const session = getSession();
  const canView = hasFeature("VIEW_AUCTIONS", session);

  if (loading) {
    return (
      <main dir={dir} className={isDark ? "bg-gray-900 min-h-screen" : "bg-gray-50 min-h-screen"}>
        <Head>
          <title>Ain Oman | {t("auctions.loading")}</title>
        </Head>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-6"></div>
            <p className={`text-xl ${isDark ? "text-white" : "text-gray-800"}`}>
              {t("auctions.loading")}
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!property) {
    return (
      <main dir={dir} className={isDark ? "bg-gray-900 min-h-screen" : "bg-gray-50 min-h-screen"}>
        <Head>
          <title>Ain Oman | {t("auctions.notfound")}</title>
        </Head>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-center">
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
              {t("auctions.notfound")}
            </h2>
            <Link href="/auctions" className="btn btn-primary px-6 py-3">
              {t("auctions.details.back")}
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main dir={dir} className={isDark ? "bg-gray-900 min-h-screen py-8" : "bg-gray-50 min-h-screen py-8"}>
      <Head>
        <title>{property.title} | Ain Oman</title>
      </Head>
      <Header />
      
      <div className="container mx-auto px-4">
        <Link href="/auctions" className={`${isDark ? "text-gray-300" : "text-gray-700"} inline-block mb-6`}>
          ← {t("auctions.details.back")}
        </Link>

        {!canView && <SubscriptionBanner needFeature="VIEW_AUCTIONS" />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* العمود الأيسر: معرض الصور والتفاصيل */}
          <div>
            <div className="rounded-xl overflow-hidden shadow-lg mb-6">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className={`rounded-xl p-6 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex justify-between items-start mb-4">
                <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                  {property.title}
                </h1>
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {t("common.active")}
                </div>
              </div>

              <div className="mb-4 text-gray-500">{property.location}</div>
              <p className={`${isDark ? "text-gray-300" : "text-gray-700"} mb-6`}>
                {property.description}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`${isDark ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg text-center`}>
                  <div className="font-medium">{property.bedrooms} غرف</div>
                </div>
                <div className={`${isDark ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg text-center`}>
                  <div className="font-medium">{property.bathrooms} حمامات</div>
                </div>
                <div className={`${isDark ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg text-center`}>
                  <div className="font-medium">{property.area} م²</div>
                </div>
              </div>

              <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-800"}`}>
                {t("auctions.features")}
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {property.features.map((f, i) => (
                  <span
                    key={i}
                    className={`${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"} px-3 py-2 rounded-lg text-sm`}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-800"}`}>
                {t("auctions.location")}
              </h3>
              <div className="rounded-xl overflow-hidden shadow-lg mb-8">
                <LoadScript
                  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
                  onError={() => setMapError(true)}
                  onLoad={() => setMapLoaded(true)}
                >
                  {mapError ? (
                    <div className={`h-96 flex items-center justify-center ${isDark ? "bg-gray-800 text-red-400" : "bg-white text-red-600"}`}>
                      حدث خطأ أثناء تحميل الخريطة
                    </div>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={{
                        width: "100%",
                        height: "400px",
                        borderRadius: "12px",
                      }}
                      center={property.coords}
                      zoom={15}
                      options={{
                        styles: isDark ? (darkMapStyle as any) : [],
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      <Marker position={property.coords} title={property.title} />
                    </GoogleMap>
                  )}
                </LoadScript>
              </div>

              <AuctionInsights
                price={property.price}
                currentBid={property.currentBid}
                area={property.area}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                features={property.features}
              />
            </div>
          </div>

          {/* العمود الأيمن: المزايدة وتاريخ المزايدات */}
          <div>
            <div className={`rounded-xl p-6 shadow-lg mb-8 ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                  {t("auctions.bid.current")}
                </h2>
                <div className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
                  {t("common.active")}
                </div>
              </div>

              <div className={`${isDark ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg mb-6`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500">{t("auctions.bid.start")}</div>
                    <div className={`${isDark ? "text-blue-300" : "text-blue-600"} font-bold`}>
                      {formatPrice(property.price)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t("auctions.bid.current")}</div>
                    <div className={`${isDark ? "text-green-300" : "text-green-600"} font-bold`}>
                      {formatPrice(property.currentBid)}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${isDark ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg mb-6`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{t("common.remaining")}</div>
                  <div className="flex gap-3">
                    <div className="text-center">
                      <div className="text-xl font-bold">{time.days}</div>
                      <div className="text-xs">أيام</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{time.hours}</div>
                      <div className="text-xs">ساعات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{time.minutes}</div>
                      <div className="text-xs">دقائق</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{time.seconds}</div>
                      <div className="text-xs">ثواني</div>
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const amount = Number(String(bidAmount).replace(/[^\d.]/g, ""));
                  if (!amount || amount <= property.currentBid) {
                    alert("يجب أن تكون المزايدة أعلى من المزايدة الحالية");
                    return;
                  }
                  const newBid = {
                    id: bids.length + 1,
                    bidder: "أنت",
                    amount,
                    time: "الآن",
                  };
                  setBids([newBid, ...bids]);
                  setProperty({ ...property, currentBid: amount });
                  setBidAmount(String(amount + 1000));
                }}
              >
                <label className={`${isDark ? "text-gray-300" : "text-gray-700"} block mb-2`}>
                  قيمة المزايدة (ر.ع)
                </label>
                <div className="relative mb-6">
                  <input
                    type="text"
                    className={`w-full p-4 rounded-lg border ${isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                    }`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ر.ع
                  </span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full py-4 rounded-lg font-bold text-lg"
                >
                  {t("auctions.bid.submit")}
                </button>
              </form>
            </div>

            <div className={`rounded-xl p-6 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>
                {t("auctions.history")}
              </h2>
              <div className="space-y-4">
                {bids.map((b) => (
                  <div
                    key={b.id}
                    className={`${isDark ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg ${b.bidder === "أنت" ? "border-2 border-teal-500" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`${isDark ? "text-white" : "text-gray-800"} font-medium`}>
                        {b.bidder}
                      </span>
                      <span className={`${isDark ? "text-green-300" : "text-green-600"} font-bold`}>
                        {formatPrice(b.amount)}
                      </span>
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-1">{b.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}