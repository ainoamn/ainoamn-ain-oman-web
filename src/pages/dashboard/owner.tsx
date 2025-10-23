// root: src/pages/dashboard/owner.tsx
import { useState, useEffect, useMemo } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import InstantLink from "@/components/InstantLink";
import { FaPlus, FaCog } from "react-icons/fa";
import PropertyCard from "@/components/properties/PropertyCard";
import RentalStatusChart from "@/components/dashboard/RentalStatusChart";
import StatsOverview from "@/components/dashboard/StatsOverview";
import { useBookings } from "@/context/BookingsContext";

/** ======== FIX: sanitize {ar,en} objects to plain strings ======== */
type Localized = { ar?: string; en?: string; [k: string]: unknown };
const isLocalized = (v: any): v is Localized =>
  v && typeof v === "object" && ("ar" in v || "en" in v);

const pickLoc = (v: any, prefer: "ar" | "en" = "ar") =>
  isLocalized(v) ? (v[prefer] ?? v.ar ?? v.en ?? "") : v;

function sanitizeDeep<T = any>(val: any, prefer: "ar" | "en" = "ar"): T {
  if (val == null) return val;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return val as T;
  if (Array.isArray(val)) return val.map((x) => sanitizeDeep(x, prefer)) as T;
  if (isLocalized(val)) return pickLoc(val, prefer) as T;
  if (typeof val === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) out[k] = sanitizeDeep(v, prefer);
    return out as T;
  }
  return val as T;
}
const text = (v: any) => pickLoc(v, "ar");
/** =============================================================== */

const OwnerDashboard: NextPage = () => {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  
  // استخدام Context للحجوزات
  const { bookings: allBookings, loading: bookingsLoading } = useBookings();
  

  
  // تصفية الحجوزات الخاصة بالمالك
  const ownerBookings = useMemo(() => {
    const userId = session?.user?.id;

    
    if (!userId) return [];
    
    const filtered = allBookings.filter(b => 
      properties.some(p => p.id === b.propertyId && p.ownerId === userId)
    );
    

    
    // للتطوير: إذا لم يكن هناك تطابق، نعرض جميع الحجوزات
    if (filtered.length === 0) {
      return allBookings;
    }
    
    return filtered;
  }, [allBookings, properties, session]);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, rentalsRes] = await Promise.all([
        fetch("/api/properties?mine=true"),
        fetch("/api/rentals?mine=true")
      ]);

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        // FIX: sanitize API items to eliminate {ar,en} children
        const items = Array.isArray(propertiesData?.items) ? sanitizeDeep<any[]>(propertiesData.items, "ar") : [];
        setProperties(items);
      }

      if (rentalsRes.ok) {
        const rentalsData = await rentalsRes.json();
        // FIX: sanitize rentals too
        const items = Array.isArray(rentalsData?.items) ? sanitizeDeep<any[]>(rentalsData.items, "ar") : [];
        setRentals(items);
      }
    } catch (error) {
      console.error('Error fetching owner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProperties: properties.length,
    activeRentals: rentals.filter(r => ["paid", "docs_submitted", "docs_verified"].includes(r.state)).length,
    completedRentals: rentals.filter(r => r.state === "handover_completed").length,
    pendingActions: rentals.filter(r => ["reserved", "paid"].includes(r.state)).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>لوحة تحكم المالك | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المالك</h1>
            <p className="text-gray-600">مرحباً {text(session?.user?.name)}</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* بطاقات الإحصائيات */}
          <StatsOverview stats={stats} />

          {/* مخطط حالة الإيجارات */}
          <div className="mt-8">
            <RentalStatusChart rentals={rentals} />
          </div>

          {/* التبويبات الرئيسية */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "properties", name: "العقارات", count: properties.length },
                { id: "rentals", name: "عقود الإيجار", count: rentals.length },
                { id: "analytics", name: "التحليلات", count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 py-0.5 px-2 text-xs bg-gray-100 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* محتوى التبويبات */}
          <div className="mt-6">
            {activeTab === "properties" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                
                {properties.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2-12h2m-2 0h-2m2 6h2m-2 0h-2m2 6h2m-2 0h-2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عقارات</h3>
                    <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة عقارك الأول.</p>
                    <div className="mt-6 flex gap-3">
                      <InstantLink
                        href="/properties/new"
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
                      >
                        <FaPlus className="ml-2" />
                        إضافة عقار جديد
                      </InstantLink>
                      <InstantLink
                        href="/properties/unified-management"
                        className="inline-flex items-center px-6 py-3 border-2 border-blue-600 rounded-xl shadow-lg text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 transition-all"
                      >
                        <FaCog className="ml-2" />
                        الإدارة الموحدة
                      </InstantLink>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "rentals" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow overflow-hidden sm:rounded-md"
              >
                <ul className="divide-y divide-gray-200">
                  {rentals.map((rental) => (
                    <li key={rental.id}>
                      <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`h-3 w-3 rounded-full ${
                              rental.state === "handover_completed" ? "bg-green-400" :
                              rental.state === "paid" ? "bg-blue-400" :
                              rental.state === "reserved" ? "bg-yellow-400" : "bg-gray-400"
                            }`}></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              عقد #{rental.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(rental.createdAt).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' })}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rental.amount} {rental.currency}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getStateLabel(rental.state)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {rentals.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عقود إيجار</h3>
                    <p className="mt-1 text-sm text-gray-500">عندما يحجز أحد المستأجرين عقاراً، ستظهر التفاصيل هنا.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

function getStateLabel(state: string): string {
  const states: Record<string, string> = {
    "reserved": "تم الحجز",
    "paid": "تم الدفع",
    "docs_submitted": "تم رفع المستندات",
    "docs_verified": "تم التحقق",
    "contract_generated": "تم إنشاء العقد",
    "tenant_signed": "تم توقيع المستأجر",
    "owner_signed": "تم توقيع المالك",
    "accountant_checked": "تم المراجعة المالية",
    "admin_approved": "اعتمد المشرف العام",
    "handover_ready": "جاهز للتسليم",
    "handover_completed": "تم التسليم"
  };
  
  return states[state] || state;
}

export default OwnerDashboard;
