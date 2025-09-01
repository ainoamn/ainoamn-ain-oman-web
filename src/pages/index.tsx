import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCurrency } from '@/context/CurrencyContext';
import PropertyMap from '@/components/maps/PropertyMap';
import SmartSearch from '@/components/search/SmartSearch';
import PartnerCard from '@/components/partners/PartnerCard';
import { FaBed, FaBath, FaRulerCombined, FaStar, FaBolt, FaMapMarkerAlt, FaHeart, FaEye } from 'react-icons/fa';

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
};

export default function HomePage() {
  const router = useRouter();
  const { format } = useCurrency();
  
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    // جلب البيانات من API الخاصة بالعقارات، المزادات، والشركاء
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featRes, propsRes, auctionsRes, partnersRes] = await Promise.all([
          fetch('/api/properties/featured'),
          fetch('/api/properties'),
          fetch('/api/auctions'),
          fetch('/api/partners')
        ]);

        if (featRes.ok) {
          const featData = await featRes.json();
          setFeaturedProperties(featData);
        }

        if (propsRes.ok) {
          const propsData = await propsRes.json();
          setAllProperties(propsData);
        }

        if (auctionsRes.ok) {
          const auctionsData = await auctionsRes.json();
          setAuctions(auctionsData);
        }

        if (partnersRes.ok) {
          const partnersData = await partnersRes.json();
          setPartners(partnersData);
        }

        // إذا لم تتوفر بيانات من السيرفر، نعرض بيانات تجريبية كما كان
        if (!featRes.ok) {
          setFeaturedProperties(prev => prev.length ? prev : [
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
            }
          ]);
        }

        if (!propsRes.ok) {
          setAllProperties(prev => prev.length ? prev : []);
        }

        if (!auctionsRes.ok) {
          setAuctions(prev => prev.length ? prev : []);
        }

        if (!partnersRes.ok) {
          setPartners(prev => prev.length ? prev : [
            { id: 1, name: 'شركة العقارية الأولى', image: '/partners/partner1.png', category: 'تطوير عقاري' },
            { id: 2, name: 'شركة الوساطة الثانية', image: '/partners/partner2.png', category: 'وساطة عقارية' },
            { id: 3, name: 'مكتب الاستثمار الثالث', image: '/partners/partner3.png', category: 'استثمار عقاري' },
            { id: 4, name: 'شركة التطوير الرابعة', image: '/partners/partner4.png', category: 'تطوير وتخطيط' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        // fallback data
        setFeaturedProperties([
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
          }
        ]);
        setPartners([
          { id: 1, name: 'شركة العقارية الأولى', image: '/partners/partner1.png', category: 'تطوير عقاري' },
          { id: 2, name: 'شركة الوساطة الثانية', image: '/partners/partner2.png', category: 'وساطة عقارية' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroStyles = {
    backgroundImage: "url('/images/banner1.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  // إعلانات بنرات (يمكن تعديل الروابط والصور لاحقاً)
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
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>عين عمان - بوابة العقارات الأولى في سلطنة عمان</title>
        <meta name="description" content="اكتشف أفضل العقارات في سلطنة عمان. ابحث عن شقق، فلل، مكاتب، وأراضي للبيع والإيجار." />
      </Head>

      {/* الهيدر العام الذي يتم توليده تلقائياً */}
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32" style={heroStyles}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              ابحث عن عقارك المثالي في عمان
            </h1>
            <p className="text-xl mb-8">
              أكثر من 1000 عقار متاح للبيع والإيجار في مختلف محافظات السلطنة
            </p>
            
            {/* شريط البحث الذي يتم توليده تلقائياً */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <SmartSearch />
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
                <img src={b.image} alt={b.alt} className="w-full h-40 object-cover" />
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
              العقارات المميزة
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
                <PropertyCard key={property.id} property={property} format={format} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              href="/properties" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              عرض جميع العقارات
            </Link>
          </div>
        </div>
      </section>

      {/* Auctions Section (imported from /api/auctions) */}
      {auctions && auctions.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">المزادات الحالية</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">شارك الآن في المزادات واكتشف فرص استثمارية مميزة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {auctions.map(a => (
                <AuctionCard key={a.id} auction={a} format={format} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/auctions" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                عرض جميع المزادات
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              استكشف العقارات على الخريطة
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ابحث عن العقارات في مواقعها الفعلية على الخريطة التفاعلية
            </p>
          </div>
          
          <div className="h-96 rounded-lg overflow-hidden shadow-lg">
            <PropertyMap 
              properties={featuredProperties} 
              height="100%"
              zoom={10}
            />
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/properties?view=map" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              استكشف على الخريطة
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              شركاؤنا
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نحن نتعاون مع أفضل الشركات والوكالات العقارية في السلطنة
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map(partner => (
              <PartnerCard 
                key={partner.id}
                name={partner.name}
                image={partner.image}
                category={partner.category}
              />
            ))}
          </div>
        </div>
      </section>

      {/* الفوتر العام الذي يتم توليده تلقائياً */}
      <Footer />
    </div>
  );
}

// PropertyCard component for displaying property information
function PropertyCard({ property, format }: { property: Property; format: (v:number)=>string }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={property.image || '/images/placeholder-service.svg'} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
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
            {format(property.priceOMR || 0)}
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
function AuctionCard({ auction, format }: { auction: Auction; format: (v:number)=>string }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img src={auction.image || '/images/placeholder-service.svg'} alt={auction.title} className="w-full h-44 object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{auction.title}</h3>
        <div className="text-sm text-gray-600 mb-2">{auction.location}</div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-blue-600 font-bold">
            {auction.currentBid ? format(auction.currentBid) : auction.startPrice ? format(auction.startPrice) : '-'}
          </div>
          {auction.endsAt && (
            <div className="text-sm text-gray-500">ينتهي: {new Date(auction.endsAt).toLocaleDateString()}</div>
          )}
        </div>
        <button className="w-full mt-4 bg-amber-500 text-white py-2 rounded hover:bg-amber-600 transition-colors" onClick={() => router.push(`/auctions/${auction.id}`)}>
          شارك في المزاد
        </button>
      </div>
    </div>
  );
}
