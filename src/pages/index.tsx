import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FaBed, FaBath, FaRulerCombined, FaStar, FaBolt, FaMapMarkerAlt, FaHeart, FaEye } from 'react-icons/fa';

// ---- i18n fallback ----
let useI18n: any;
try { useI18n = require("@/lib/i18n").useI18n; } catch {
  useI18n = () => ({
    t: (k: string) => ({
      "home.hero.title": "منصة عين عمان الرائدة في العقارات",
      "home.hero.subtitle": "اكتشف أفضل الفرص العقارية في سلطنة عمان",
      "home.hero.search": "ابحث عن عقار أو موقع...",
      "home.featured.properties": "عقارات مميزة",
      "home.active.auctions": "مزادات نشطة",
      "home.partners": "شركاؤنا",
      "home.developers": "المطورون العقاريون",
      "home.view.all": "عرض الكل",
      "common.loading": "جاري التحميل...",
      "common.view.details": "عرض التفاصيل",
      "common.bid": "قدّم مزايدة",
      "common.location": "الموقع",
      "common.initial_price": "السعر الابتدائي",
      "common.current_bid": "المزايدة الحالية",
      "common.remaining": "الوقت المتبقي",
    } as Record<string, string>)[k] || k,
    lang: "ar",
    dir: "rtl",
  });
}

let useTheme: any;
try { useTheme = require("@/context/ThemeContext").useTheme; } catch { useTheme = () => ({ theme: "light" }); }

// نوع البيانات الأساسي للعقار
type Property = {
  id: string | number;
  title: string;
  image: string;
  priceOMR: number;
  province: string;
  state: string;
  village?: string;
  location?: string;
  rating?: number;
  beds?: number;
  baths?: number;
  area?: number;
  type?: string;
  purpose?: string;
  promoted?: boolean;
  referenceNo?: string;
  views?: number;
  likes?: number;
};

type Auction = {
  id: string | number;
  title: string;
  image?: string;
  startPrice?: number;
  currentBid?: number;
  endsAt?: string;
  location?: string;
  status?: string;
  endTime?: number;
  auctionType?: string;
};

type Partner = {
  id: string | number;
  name: string;
  logo: string;
  description: string;
  category?: string;
};

type Developer = {
  id: string | number;
  name: string;
  logo: string;
  projectsCount: number;
  specialty: string;
};

export default function HomePage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);

  useEffect(() => {
    // جلب البيانات من API الخاصة بالعقارات، المزادات، والشركاء
    const fetchData = async () => {
      setLoading(true);
      try {
        // محاكاة جلب البيانات من واجهات برمجة التطبيقات
        // في التطبيق الحقيقي، استبدل هذه مع استدعاءات API فعلية
        const now = Date.now();
        
        // بيانات العقارات المميزة
        const propertiesData: Property[] = [
          {
            id: 1,
            title: 'فيلا فاخرة في القرم',
            image: '/images/villa1.jpg',
            priceOMR: 350000,
            province: 'مسقط',
            state: 'القرم',
            rating: 4.8,
            beds: 4,
            baths: 3,
            area: 300,
            type: 'villa',
            purpose: 'sale',
            promoted: true,
            referenceNo: 'PR-2023-0001',
            views: 1250,
            likes: 89
          },
          {
            id: 2,
            title: 'شقة بإطلالة بحرية',
            image: '/images/apartment1.jpg',
            priceOMR: 120000,
            province: 'مسقط',
            state: 'القرم',
            rating: 4.5,
            beds: 3,
            baths: 2,
            area: 180,
            type: 'apartment',
            purpose: 'sale',
            promoted: true,
            referenceNo: 'PR-2023-0002',
            views: 980,
            likes: 67
          },
          {
            id: 3,
            title: 'أرض سكنية مميزة',
            image: '/images/land1.jpg',
            priceOMR: 90000,
            province: 'بركاء',
            state: 'بركاء',
            area: 800,
            type: 'land',
            purpose: 'sale',
            promoted: true,
            referenceNo: 'PR-2023-0003',
            views: 750,
            likes: 45
          }
        ];

        // بيانات المزادات
        const auctionsData: Auction[] = [
          {
            id: "auction1",
            title: "فيلا فاخرة في حي السفارات",
            image: "/images/villa1.jpg",
            startPrice: 250000,
            currentBid: 225000,
            endTime: now + 48*3600*1000,
            location: "مسقط، الخوض",
            auctionType: "مزاد علني"
          },
          {
            id: "auction2",
            title: "شقة راقية بإطلالة بحرية",
            image: "/images/apartment1.jpg",
            startPrice: 120000,
            currentBid: 98000,
            endTime: now + 24*3600*1000,
            location: "مسقط، شاطئ القرم",
            auctionType: "مزاد إلكتروني"
          }
        ];

        // بيانات الشركاء
        const partnersData: Partner[] = [
          {
            id: 1,
            name: 'بنك مسقط',
            logo: '/partners/bank-muscat.png',
            description: 'أحد أكبر البنوك في سلطنة عمان',
            category: 'شريك مالي'
          },
          {
            id: 2,
            name: 'البنك الوطني العماني',
            logo: '/partners/nbo.png',
            description: 'مزود رائد للخدمات المالية',
            category: 'شريك مالي'
          },
          {
            id: 3,
            name: 'هيئة المناطق الاقتصادية',
            logo: '/partners/economic-zones.png',
            description: 'مطور المناطق الاقتصادية في عمان',
            category: 'شريك حكومي'
          },
          {
            id: 4,
            name: 'شركة العقارية الأولى',
            logo: '/partners/partner1.png',
            description: 'شركة رائدة في مجال التطوير العقاري',
            category: 'شريك عقاري'
          }
        ];

        // بيانات المطورين
        const developersData: Developer[] = [
          {
            id: 1,
            name: 'عمران',
            logo: '/developers/omran.png',
            projectsCount: 24,
            specialty: 'المجمعات السكنية'
          },
          {
            id: 2,
            name: 'النهضة',
            logo: '/developers/al-nahda.png',
            projectsCount: 18,
            specialty: 'المشاريع التجارية'
          },
          {
            id: 3,
            name: 'الرواس',
            logo: '/developers/al-rawas.png',
            projectsCount: 32,
            specialty: 'الفنادق والمنتجعات'
          }
        ];

        setFeaturedProperties(propertiesData);
        setAuctions(auctionsData);
        setPartners(partnersData);
        setDevelopers(developersData);
        
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (n: number) => new Intl.NumberFormat("ar-OM").format(n) + " ر.ع";
  
  const formatRemainingTime = (endTime: number) => {
    const diff = endTime - Date.now();
    const days = Math.max(0, Math.floor(diff / 86400000));
    const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
    return `${days} يوم و ${hours} ساعة`;
  };

  const heroStyles = {
    backgroundImage: "url('/images/banner1.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  // إعلانات بنرات
  const banners = [
    { id: 1, image: '/banners/ad1.jpg', link: '/contact', alt: 'اعلان 1' },
    { id: 2, image: '/banners/ad2.jpg', link: '/properties?promoted=true', alt: 'اعلان 2' },
  ];

  // فئات العقارات
  const propertyCategories = [
    { id: 1, name: 'سكني', count: 450, icon: '🏠' },
    { id: 2, name: 'تجاري', count: 230, icon: '🏢' },
    { id: 3, name: 'أراضي', count: 180, icon: '📌' },
    { id: 4, name: 'استثماري', count: 120, icon: '📈' },
  ];

  // خدمات الموقع
  const services = [
    { id: 1, title: 'شراء عقار', description: 'ابحث عن عقارك المثالي من بين آلاف العروض', icon: '🔍' },
    { id: 2, title: 'بيع عقار', description: 'بيع عقارك بسرعة وسهولة مع وسيط موثوق', icon: '💰' },
    { id: 3, title: 'تأجير عقار', description: 'ابحث عن عقار للإيجار أو اعرض عقارك للتأجير', icon: '🔑' },
    { id: 4, title: 'استثمار عقاري', description: 'استثمر في العقارات واجني أرباحاً مضمونة', icon: '📊' },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <Head>
        <title>عين عمان - بوابة العقارات الأولى في سلطنة عمان</title>
        <meta name="description" content="اكتشف أفضل العقارات في سلطنة عمان. ابحث عن شقق، فلل، مكاتب، وأراضي للبيع والإيجار." />
      </Head>

      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32" style={heroStyles}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-xl mb-8">
              {t("home.hero.subtitle")}
            </p>
            
            {/* شريط البحث المبسط */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder={t("home.hero.search")}
                  className="flex-1 p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  بحث
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner ads below hero */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(b => (
              <Link key={b.id} href={b.link} className="block overflow-hidden rounded-lg shadow-md">
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">{b.alt}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {propertyCategories.map(category => (
              <div key={category.id} className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                <p className="text-gray-600">{category.count} عقار</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t("home.featured.properties")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اكتشف أفضل الفرص العقارية المختارة بعناية من قبل فريقنا
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} formatPrice={formatPrice} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              href="/properties" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t("home.view.all")}
            </Link>
          </div>
        </div>
      </section>

      {/* Auctions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t("home.active.auctions")}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">شارك الآن في المزادات واكتشف فرص استثمارية مميزة</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {auctions.map(auction => (
                <AuctionCard key={auction.id} auction={auction} formatPrice={formatPrice} formatRemainingTime={formatRemainingTime} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/auctions" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200">
              {t("home.view.all")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">1,250+</div>
              <div className="text-blue-100">عقار متاح</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">عميل راضٍ</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">11</div>
              <div className="text-blue-100">محافظة</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">شريك</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">خدماتنا</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">نقدم مجموعة متكاملة من الخدمات العقارية لتلبية جميع احتياجاتك</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(service => (
              <div key={service.id} className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t("home.developers")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نتعاون مع أفضل المطورين العقاريين في السلطنة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {developers.map(developer => (
              <div key={developer.id} className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full shadow-md flex items-center justify-center p-4 mb-4">
                  <div className="text-gray-400 text-sm">شعار</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{developer.name}</h3>
                <p className="text-gray-500 mb-3">{developer.specialty}</p>
                <div className="px-4 py-2 rounded-full text-sm font-medium inline-block bg-teal-100 text-teal-800">
                  {developer.projectsCount} مشروع
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t("home.partners")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نحن نتعاون مع أفضل الشركات والوكالات العقارية في السلطنة
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map(partner => (
              <div key={partner.id} className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full shadow-md flex items-center justify-center p-4 mb-4">
                  <div className="text-gray-400 text-sm">شعار</div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{partner.name}</h3>
                <p className="text-gray-500 text-center text-sm">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// PropertyCard component for displaying property information
function PropertyCard({ property, formatPrice }: { property: Property; formatPrice: (v:number)=>string }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">صورة العقار</span>
        </div>
        {property.promoted && (
          <span className="absolute top-2 right-2 text-xs bg-amber-500 text-white px-2 py-1 rounded inline-flex items-center gap-1">
            <FaBolt /> مميز
          </span>
        )}
        {property.referenceNo && (
          <span className="absolute top-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
            {property.referenceNo}
          </span>
        )}
        <div className="absolute bottom-2 left-2 flex space-x-2">
          {property.views !== undefined && (
            <span className="text-xs bg-black/70 text-white px-2 py-1 rounded inline-flex items-center gap-1">
              <FaEye /> {property.views}
            </span>
          )}
          {property.likes !== undefined && (
            <span className="text-xs bg-black/70 text-white px-2 py-1 rounded inline-flex items-center gap-1">
              <FaHeart /> {property.likes}
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{property.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FaMapMarkerAlt className="ml-1" />
          <span className="line-clamp-1">
            {property.location || `${property.province} - ${property.state}${property.village ? ` - ${property.village}` : ''}`}
          </span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-blue-600 font-bold text-lg">
            {formatPrice(property.priceOMR || 0)}
          </span>
          {property.rating && (
            <span className="text-sm text-yellow-600 inline-flex items-center gap-1">
              <FaStar /> {property.rating}
            </span>
          )}
        </div>
        <div className="flex justify-between text-sm text-gray-700 border-t pt-3">
          {property.beds !== undefined && (
            <div className="inline-flex items-center gap-1">
              <FaBed /> {property.beds}
            </div>
          )}
          {property.baths !== undefined && (
            <div className="inline-flex items-center gap-1">
              <FaBath /> {property.baths}
            </div>
          )}
          {property.area !== undefined && (
            <div className="inline-flex items-center gap-1">
              <FaRulerCombined /> {property.area} م²
            </div>
          )}
        </div>
        <button 
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={() => router.push(`/property/${property.id}`)}
        >
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}

// AuctionCard component for displaying auction items
function AuctionCard({ auction, formatPrice, formatRemainingTime }: { 
  auction: Auction; 
  formatPrice: (v:number)=>string;
  formatRemainingTime: (v:number)=>string;
}) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="w-full h-44 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">صورة المزاد</span>
        </div>
        {auction.auctionType && (
          <span className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
            {auction.auctionType}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{auction.title}</h3>
        <div className="text-sm text-gray-600 mb-2">{auction.location}</div>
        
        {auction.endTime && (
          <div className="text-sm text-gray-500 mb-3">
            <span className="font-medium">الوقت المتبقي: </span>
            {formatRemainingTime(auction.endTime)}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xs text-gray-500">السعر الابتدائي</div>
            <div className="text-blue-600 font-bold">
              {auction.startPrice ? formatPrice(auction.startPrice) : '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">المزايدة الحالية</div>
            <div className="text-green-600 font-bold">
              {auction.currentBid ? formatPrice(auction.currentBid) : 'لا توجد مزايدات بعد'}
            </div>
          </div>
        </div>
        
        <button 
          className="w-full mt-4 bg-amber-500 text-white py-2 rounded hover:bg-amber-600 transition-colors" 
          onClick={() => router.push(`/auctions/${auction.id}`)}
        >
          شارك في المزاد
        </button>
      </div>
    </div>
  );
}
