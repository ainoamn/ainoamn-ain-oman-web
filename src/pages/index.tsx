// src/pages/index.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/layout/Layout";
import SmartSearch from "../components/search/SmartSearch";
import PropertyMap from "../components/maps/PropertyMap";
import { FaBuilding, FaStar, FaUserTie, FaHandshake, FaMedal, FaChartBar, FaArrowRight } from "react-icons/fa";

type HomeConfig = {
  showSearch: boolean;
  showTopBanner: boolean;
  showFeatured: boolean;
  showMiddleBanner: boolean;
  showTopRated: boolean;
  showCompanies: boolean;
  showLandlords: boolean;
  showPartners: boolean;
  showBadges: boolean;
  showMap: boolean;
  showStats: boolean;
  showSideAds: boolean;
};

export default function HomePage() {
  const [cfg, setCfg] = useState<HomeConfig | null>(null);
  const [showLeftAd, setShowLeftAd] = useState(true);
  const [showRightAd, setShowRightAd] = useState(true);

  useEffect(() => {
    fetch("/api/homepage-config").then(r => r.json()).then(setCfg);
  }, []);

  // بيانات عرض
  const featured = [
    { id: 1, title: "شقة فاخرة في الخوير", location: "مسقط - بوشر", price: "60,000 ر.ع", image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae", beds: 3, baths: 2, area: 150, rating: 4.7, lat: 23.592, lng: 58.420 },
    { id: 2, title: "فيلا بإطلالة بحرية", location: "ظفار - صلالة", price: "120,000 ر.ع", image: "https://images.unsplash.com/photo-1572120360610-d971b9b78825", beds: 5, baths: 4, area: 320, rating: 4.9, lat: 17.019, lng: 54.089 },
    { id: 3, title: "شقة عملية قرب الخدمات", location: "نزوى - فرق", price: "350 ر.ع / شهر", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", beds: 2, baths: 2, area: 110, rating: 4.3, lat: 22.933, lng: 57.529 }
  ];
  const topRated = [
    { id: 4, title: "مكتب تجاري راقٍ", location: "مسقط - القرم", price: "650 ر.ع / شهر", image: "https://images.unsplash.com/photo-1590642918417-6c07d8f64c3a", beds: 0, baths: 1, area: 95, rating: 4.6, lat: 23.613, lng: 58.517 },
    { id: 5, title: "محل تجاري في موقع نابض", location: "صحار - الهمبار", price: "350 ر.ع / شهر", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", beds: 0, baths: 1, area: 65, rating: 4.5, lat: 24.341, lng: 56.731 },
    { id: 6, title: "فيلا حديثة بحديقة واسعة", location: "مسقط - السيب", price: "100,000 ر.ع", image: "https://images.unsplash.com/photo-1600585153837-2a3e5e4e1c45", beds: 6, baths: 5, area: 360, rating: 5.0, lat: 23.614, lng: 58.545 }
  ];
  const partners = [
    { id: 1, name: "شريك 1", logo: "https://picsum.photos/300/120?random=11" },
    { id: 2, name: "شريك 2", logo: "https://picsum.photos/300/120?random=12" },
    { id: 3, name: "شريك 3", logo: "https://picsum.photos/300/120?random=13" }
  ];
  const badges = [
    { id: 1, name: "أحمد", avatar: "https://picsum.photos/120/120?random=21" },
    { id: 2, name: "فاطمة", avatar: "https://picsum.photos/120/120?random=22" },
    { id: 3, name: "علي", avatar: "https://picsum.photos/120/120?random=23" }
  ];
  const stats = [
    { id: 1, label: "عدد العقارات", value: "1200+", icon: <FaBuilding /> },
    { id: 2, label: "الشركات المسجلة", value: "300+", icon: <FaHandshake /> },
    { id: 3, label: "المستخدمون النشطون", value: "5,000+", icon: <FaUserTie /> },
    { id: 4, label: "المعاملات الناجحة", value: "2,500+", icon: <FaChartBar /> },
  ];

  if (!cfg) return <Layout><Head><title>عين عُمان</title></Head><div className="py-10 text-center">جار التحميل…</div></Layout>;

  const MoreBtn = ({ href }: { href: string }) => (
    <div className="text-center mt-4">
      <Link href={href} className="inline-flex items-center gap-2 bg-[var(--brand-600)] text-white px-4 py-2 rounded hover:bg-[var(--brand-700)] transition">
        عرض المزيد <FaArrowRight />
      </Link>
    </div>
  );

  const Card = ({ p }: { p: any }) => (
    <Link href={`/property/${p.id}`} className="block border rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold">{p.title}</h3>
        <p className="text-sm text-gray-600">{p.location}</p>
        <div className="flex items-center gap-1 text-yellow-500 mt-1"><FaStar /> {p.rating}</div>
        <p className="text-[var(--brand-700)] font-bold mt-2">{p.price}</p>
      </div>
    </Link>
  );

  return (
    <Layout>
      <Head><title>عين عُمان</title></Head>

      {/* إعلانات جانبية مصغّرة قابلة للإغلاق */}
      {cfg.showSideAds && (
        <>
          {showRightAd && (
            <div className="fixed top-24 right-2 z-50 bg-white shadow-lg rounded-lg p-2">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f" alt="Ad Right" className="w-28 h-40 object-cover rounded" />
              <button onClick={() => setShowRightAd(false)} className="absolute top-0 right-0 bg-red-500 text-white px-1">×</button>
            </div>
          )}
          {showLeftAd && (
            <div className="fixed top-24 left-2 z-50 bg-white shadow-lg rounded-lg p-2">
              <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2" alt="Ad Left" className="w-28 h-40 object-cover rounded" />
              <button onClick={() => setShowLeftAd(false)} className="absolute top-0 right-0 bg-red-500 text-white px-1">×</button>
            </div>
          )}
        </>
      )}

      {/* شريط البحث */}
      {cfg.showSearch && (
        <section className="my-6">
          <SmartSearch />
        </section>
      )}

      {/* بنر علوي (صغير) */}
      {cfg.showTopBanner && (
        <section className="my-4">
          <img src="https://images.unsplash.com/photo-1502673530728-f79b4cab31b1" alt="Top Banner" className="w-full h-44 object-cover rounded-lg shadow" />
        </section>
      )}

      {/* عقارات مميزة */}
      {cfg.showFeatured && (
        <section className="my-8">
          <h2 className="text-xl font-bold mb-4">عقارات مميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map(p => <Card key={p.id} p={p} />)}
          </div>
          <MoreBtn href="/properties/featured" />
        </section>
      )}

      {/* بنر بين الأقسام */}
      {cfg.showMiddleBanner && (
        <section className="my-6">
          <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb" alt="Mid Banner" className="w-full h-40 object-cover rounded-lg shadow" />
        </section>
      )}

      {/* الأعلى تقييماً */}
      {cfg.showTopRated && (
        <section className="my-8">
          <h2 className="text-xl font-bold mb-4">العقارات الأعلى تقييماً</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRated.map(p => <Card key={p.id} p={p} />)}
          </div>
          <MoreBtn href="/properties/top-rated" />
        </section>
      )}

      {/* الشركات */}
      {cfg.showCompanies && (
        <section className="my-8">
          <h2 className="text-xl font-bold mb-4">الشركات الأعلى تقييماً</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="border rounded-lg p-4 shadow text-center">
                <img src={`https://picsum.photos/300/120?random=${30+i}`} alt={`Company ${i}`} className="mx-auto rounded mb-2" />
                <div className="font-semibold">شركة {i}</div>
                <div className="text-sm">4.{9-i} ★</div>
              </div>
            ))}
          </div>
          <MoreBtn href="/companies" />
        </section>
      )}

      {/* المؤجرون */}
      {cfg.showLandlords && (
        <section className="my-8">
          <h2 className="text-xl font-bold mb-4">المؤجرون الأفراد الأعلى تقييماً</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="border rounded-lg p-4 shadow text-center">
                <img src={`https://picsum.photos/120/120?random=${40+i}`} alt={`Landlord ${i}`} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                <div className="font-semibold">مؤجر {i}</div>
                <div className="text-sm">4.{9-i} ★</div>
              </div>
            ))}
          </div>
          <MoreBtn href="/landlords" />
        </section>
      )}

      {/* شركاؤنا */}
      {cfg.showPartners && (
        <section className="my-8">
          <h2 className="text-xl font-bold mb-4">شركاؤنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {partners.map(p => (
              <div key={p.id} className="border rounded-lg p-4 shadow text-center">
                <img src={p.logo} alt={p.name} className="w-full h-20 object-cover rounded mb-2" />
                <div>{p.name}</div>
              </div>
            ))}
          </div>
          <MoreBtn href="/partners" />
        </section>
      )}

      {/* أصحاب الشارات */}
      {cfg.showBadges && (
        <section className="my-8">
          <h2 className="text-xl font-bold mb-4">أصحاب الشارات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {badges.map(b => (
              <div key={b.id} className="border rounded-lg p-4 shadow text-center">
                <img src={b.avatar} alt={b.name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                <div>{b.name}</div>
                <div className="inline-flex items-center gap-1 text-[var(--brand-700)] mt-1"><FaMedal /> موثّق</div>
              </div>
            ))}
          </div>
          <MoreBtn href="/badges" />
        </section>
      )}

      {/* الخريطة */}
      {cfg.showMap && (
        <section className="my-8">
          <h2 className="text-xl font-bold mb-4">خريطة العقارات</h2>
          <PropertyMap properties={[...featured, ...topRated]} />
        </section>
      )}

      {/* الإحصائيات */}
      {cfg.showStats && (
        <section className="my-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.id} className="bg-white dark:bg-gray-800 shadow rounded p-4 flex flex-col items-center text-center">
              <div className="text-3xl text-[var(--brand-600)] mb-2">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-gray-600 dark:text-gray-300">{s.label}</div>
            </div>
          ))}
        </section>
      )}
    </Layout>
  );
}
