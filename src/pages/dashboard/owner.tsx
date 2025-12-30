// root: src/pages/dashboard/owner.tsx
import { useState, useEffect, useMemo } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import InstantLink from "@/components/InstantLink";
import { FaPlus, FaCog, FaSpinner, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
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
  // بيانات الإدارة الداخلية
  const [services, setServices] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [overdueServices, setOverdueServices] = useState<any[]>([]);
  const [expiringDocuments, setExpiringDocuments] = useState<any[]>([]);
  const [tenantsCount, setTenantsCount] = useState(0);
  
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

  // تحميل بيانات الإدارة الداخلية عند فتح تبويباتها
  useEffect(() => {
    if (!session?.user?.id) return;
    const ownerId = session.user.id as string;

    const loadServices = async () => {
      try {
        const res = await fetch(`/api/property-services?ownerId=${encodeURIComponent(ownerId)}`);
        if (res.ok) {
          const data = await res.json();
          setServices(Array.isArray(data.services) ? data.services : []);
        }
      } catch {}
    };

    const loadDocuments = async () => {
      try {
        const res = await fetch(`/api/property-documents?ownerId=${encodeURIComponent(ownerId)}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(Array.isArray(data.documents) ? data.documents : []);
        }
      } catch {}
    };

    const loadExpenses = async () => {
      try {
        const res = await fetch(`/api/property-expenses?ownerId=${encodeURIComponent(ownerId)}`);
        if (res.ok) {
          const data = await res.json();
          setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
        }
      } catch {}
    };

    const loadOverdue = async () => {
      try {
        const sRes = await fetch(`/api/property-services?ownerId=${encodeURIComponent(ownerId)}&overdue=true`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setOverdueServices(Array.isArray(sData.services) ? sData.services : []);
        }
        const dRes = await fetch(`/api/property-documents?ownerId=${encodeURIComponent(ownerId)}&expiring=true`);
        if (dRes.ok) {
          const dData = await dRes.json();
          setExpiringDocuments(Array.isArray(dData.documents) ? dData.documents : []);
        }
      } catch {}
    };

    if (activeTab === 'services') loadServices();
    if (activeTab === 'documents') loadDocuments();
    if (activeTab === 'expenses') loadExpenses();
    if (activeTab === 'overdue') loadOverdue();
    if (activeTab === 'management') {
      // حمّل ملخصات أساسية
      loadServices(); loadDocuments(); loadExpenses();
    }
  }, [activeTab, session]);

  // دالة للحصول على userId من مصادر متعددة
  const getUserId = (): string | null => {
    // من session
    if (session?.user?.id) return session.user.id;
    
    // من localStorage
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("ao_uid") || localStorage.getItem("uid");
      if (uid) return uid;
      
      // من cookies
      const cookies = document.cookie.split(';');
      const uidCookie = cookies.find(c => c.trim().startsWith('uid='));
      if (uidCookie) {
        return decodeURIComponent(uidCookie.split('=')[1]);
      }
    }
    
    return null;
  };

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      console.log('🔍 Owner userId:', userId);
      
      // إضافة userId إلى query parameters
      const rentalsUrl = userId 
        ? `/api/rentals?mine=true&userId=${encodeURIComponent(userId)}`
        : "/api/rentals?mine=true";
      const propertiesUrl = userId
        ? `/api/properties?mine=true&userId=${encodeURIComponent(userId)}`
        : "/api/properties?mine=true";
      
      console.log('📡 Fetching:', { rentalsUrl, propertiesUrl });
      
      const [propertiesRes, rentalsRes, usersRes] = await Promise.all([
        fetch(propertiesUrl),
        fetch(rentalsUrl),
        fetch("/api/users")
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
        console.log('✅ Owner rentals loaded:', items.length, 'rentals');
      } else {
        console.error('❌ Failed to load rentals:', rentalsRes.status);
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // API يُرجع { users: [...], pagination: {}, stats: {} }
        const allUsers = Array.isArray(usersData.users) ? usersData.users : (Array.isArray(usersData) ? usersData : []);
        const tenantsOnly = allUsers.filter(u => u.role === 'tenant');
        setTenantsCount(tenantsOnly.length);
        console.log('✅ Dashboard loaded tenants count:', tenantsOnly.length);
      }
    } catch (error) {
      console.error('Error fetching owner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProperties: properties.length,
    activeRentals: rentals.filter(r => {
      const state = (r as any).signatureWorkflow || r.state;
      return ["paid", "docs_submitted", "docs_verified", "active", "owner_signed", "tenant_signed"].includes(state);
    }).length,
    completedRentals: rentals.filter(r => {
      const state = (r as any).signatureWorkflow || r.state;
      return state === "handover_completed" || state === "active";
    }).length,
    pendingActions: rentals.filter(r => {
      const state = (r as any).signatureWorkflow || r.state;
      return ["reserved", "paid", "pending_owner_signature", "pending_tenant_signature", "pending_admin_approval"].includes(state);
    }).length
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
                { id: "unit-rentals", name: "تأجير الوحدات", count: 0 },
                { id: "tenants", name: "المستأجرين", count: tenantsCount },
                { id: "contracts", name: "إدارة العقود", count: 0 },
                { id: "management", name: "إدارة الخدمات والمستندات", count: 0 },
                { id: "services", name: "الخدمات والمرافق", count: services.length },
                { id: "documents", name: "المستندات", count: documents.length },
                { id: "expenses", name: "المصاريف", count: expenses.length },
                { id: "overdue", name: "المتأخرات", count: (overdueServices.length + expiringDocuments.length) },
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
                <div className="mb-6 flex justify-between items-center">
                  <InstantLink
                    href="/properties/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="ml-2" />
                    إضافة عقار جديد
                  </InstantLink>
                  <InstantLink
                    href="/properties/unified-management"
                    className="inline-flex items-center px-4 py-2 border-2 border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                  >
                    <FaCog className="ml-2" />
                    الإدارة الموحدة
                  </InstantLink>
                </div>
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
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">عقود الإيجار</h3>
                  <InstantLink
                    href="/rentals/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="ml-2" />
                    إنشاء عقد جديد
                  </InstantLink>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم العقد</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العقار/الوحدة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستأجر</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإيجار الشهري</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rentals.map((rental) => {
                        const property = properties.find(p => p.id === rental.propertyId);
                        // تحديد الحالة الفعلية (من state أو signatureWorkflow)
                        const actualState = (rental as any).signatureWorkflow || rental.state;
                        return (
                          <tr key={rental.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`h-3 w-3 rounded-full ml-2 ${
                                  actualState === "active" || actualState === "handover_completed" ? "bg-green-400" :
                                  actualState === "paid" || actualState === "owner_signed" ? "bg-blue-400" :
                                  actualState === "reserved" ? "bg-yellow-400" : 
                                  actualState === "pending_owner_signature" || actualState === "pending_tenant_signature" ? "bg-orange-400" :
                                  "bg-gray-400"
                                }`}></div>
                                <div className="text-sm font-medium text-gray-900">
                                  #{rental.id || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">
                                  {property?.buildingNumber ? `مبنى ${property.buildingNumber}` : 'غير محدد'}
                                </div>
                                {rental.unitId && <div className="text-xs text-gray-500">وحدة: {rental.unitId}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {rental.tenantName || rental.tenantId || 'غير محدد'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rental.startDate ? new Date(rental.startDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rental.endDate ? new Date(rental.endDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {rental.monthlyRent || rental.amount || 0} {rental.currency || 'OMR'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                actualState === "active" || actualState === "handover_completed" ? "bg-green-100 text-green-800" :
                                actualState === "paid" || actualState === "owner_signed" ? "bg-blue-100 text-blue-800" :
                                actualState === "reserved" ? "bg-yellow-100 text-yellow-800" :
                                actualState === "pending_owner_signature" || actualState === "pending_tenant_signature" ? "bg-orange-100 text-orange-800" :
                                actualState === "rejected" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {getStateLabel(actualState)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <InstantLink
                                href={`/contracts/rental/${rental.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                عرض التفاصيل
                              </InstantLink>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
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

            {activeTab === "unit-rentals" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow overflow-hidden sm:rounded-md"
              >
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">تأجير الوحدات</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    إدارة تأجير الوحدات الفردية في العقارات متعددة الوحدات
                  </p>
                </div>
                
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {properties.filter(p => p.buildingType === 'multi').map((property) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{text(property.titleAr)}</h4>
                          <p className="text-sm text-gray-500 mb-4">{property.address}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>إجمالي الوحدات:</span>
                              <span className="font-medium">{property.totalUnits || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>الوحدات المؤجرة:</span>
                              <span className="font-medium text-green-600">0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>الوحدات المتاحة:</span>
                              <span className="font-medium text-blue-600">{property.totalUnits || 0}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <InstantLink
                              href={`/properties/${property.id}`}
                              className="flex-1 text-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                            >
                              عرض الوحدات
                            </InstantLink>
                            <InstantLink
                              href={`/rentals/new?propertyId=${property.id}`}
                              className="flex-1 text-center px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                            >
                              تأجير وحدة
                            </InstantLink>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {properties.filter(p => p.buildingType === 'multi').length === 0 && (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2-12h2m-2 0h-2m2 6h2m-2 0h-2m2 6h2m-2 0h-2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عقارات متعددة الوحدات</h3>
                        <p className="mt-1 text-sm text-gray-500">أضف عقاراً متعدد الوحدات لبدء تأجير الوحدات الفردية.</p>
                        <div className="mt-6">
                          <InstantLink
                            href="/properties/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          >
                            إضافة عقار جديد
                          </InstantLink>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "tenants" && (
              <TenantsTab />
            )}

            {activeTab === "contracts" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow overflow-hidden sm:rounded-md"
              >
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">إدارة العقود</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        إنشاء وإدارة عقود الإيجار والمستندات القانونية
                      </p>
                    </div>
                    <InstantLink
                      href="/contracts/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaPlus className="ml-2" />
                      إنشاء عقد جديد
                    </InstantLink>
                  </div>
                </div>
                
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="border border-gray-200 rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="mt-2 text-lg font-medium text-gray-900">عقود الإيجار</h4>
                        <p className="mt-1 text-sm text-gray-500">إنشاء وإدارة عقود إيجار الوحدات</p>
                        <InstantLink
                          href="/contracts/rental"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          إدارة العقود
                        </InstantLink>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h4 className="mt-2 text-lg font-medium text-gray-900">قوالب العقود</h4>
                        <p className="mt-1 text-sm text-gray-500">استخدام قوالب جاهزة للعقود</p>
                        <InstantLink
                          href="/contracts/templates"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          عرض القوالب
                        </InstantLink>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="mt-2 text-lg font-medium text-gray-900">التوقيع الإلكتروني</h4>
                        <p className="mt-1 text-sm text-gray-500">توقيع العقود إلكترونياً</p>
                        <InstantLink
                          href="/contracts/sign"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                        >
                          التوقيع الإلكتروني
                        </InstantLink>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          {activeTab === "management" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">إدارة الخدمات والمستندات والمصاريف</h3>
                <p className="mt-1 text-sm text-gray-500">اختر عقاراً لإدارة الخدمات (الكهرباء والماء والإنترنت) والمستندات والمصاريف الداخلية.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-medium text-gray-900 mb-1">{text(property.titleAr)}</h4>
                    <p className="text-sm text-gray-500 mb-4">{property.address}</p>

                    <div className="grid grid-cols-1 gap-2">
                      <InstantLink
                        href={`/property-management/${property.id}?tab=services`}
                        className="text-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                      >
                        إدارة الخدمات
                      </InstantLink>
                      <InstantLink
                        href={`/property-management/${property.id}?tab=documents`}
                        className="text-center px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100"
                      >
                        إدارة المستندات
                      </InstantLink>
                      <InstantLink
                        href={`/property-management/${property.id}?tab=expenses`}
                        className="text-center px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                      >
                        إدارة المصاريف
                      </InstantLink>
                      <InstantLink
                        href={`/property-management/${property.id}/reports`}
                        className="text-center px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                      >
                        التقارير المالية
                      </InstantLink>
                    </div>
                  </div>
                ))}
              </div>

              {properties.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2-12h2m-2 0h-2m2 6h2m-2 0h-2m2 6h2m-2 0h-2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عقارات</h3>
                  <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة عقارك الأول لإدارة خدماته.</p>
                  <div className="mt-6">
                    <InstantLink
                      href="/properties/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      إضافة عقار جديد
                    </InstantLink>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "services" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">الخدمات والمرافق</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع الخدمات المرتبطة بعقاراتك</p>
                </div>
                <InstantLink
                  href="/property-management/overdue#add-service"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="ml-2" />
                  إضافة خدمة جديدة
                </InstantLink>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحساب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المزود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ الشهري</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاستحقاق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{s.serviceName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{s.accountNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{s.provider}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{(s.monthlyAmount || 0).toLocaleString()} {s.currency || 'OMR'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${s.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {s.isOverdue ? 'متأخر' : 'مستحق'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <InstantLink
                              href={`/property-management/${s.propertyId}/services/${s.id}/edit`}
                              className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                            >
                              تعديل
                            </InstantLink>
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
                                  fetch(`/api/property-services/${s.id}`, { method: 'DELETE' })
                                    .then(() => { setServices(services.filter(ser => ser.id !== s.id)); })
                                    .catch(err => alert('فشل حذف الخدمة'));
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">لا توجد خدمات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">المستندات</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع المستندات المرتبطة بعقاراتك</p>
                </div>
                <InstantLink
                  href="/property-management/overdue#add-document"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  <FaPlus className="ml-2" />
                  إضافة مستند جديد
                </InstantLink>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-6">
                {documents.map((d) => (
                  <div key={d.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{d.documentName}</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${d.status === 'valid' ? 'bg-green-100 text-green-800' : d.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{d.status === 'valid' ? 'صالح' : d.status === 'expired' ? 'منتهي' : 'معلّق'}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{d.title}</div>
                    <div className="flex gap-2 mt-2">
                      <InstantLink
                        href={`/property-management/${d.propertyId}/documents/${d.id}/edit`}
                        className="flex-1 text-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        تعديل
                      </InstantLink>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
                            fetch(`/api/property-documents/${d.id}`, { method: 'DELETE' })
                              .then(() => { setDocuments(documents.filter(doc => doc.id !== d.id)); })
                              .catch(err => alert('فشل حذف المستند'));
                          }
                        }}
                        className="flex-1 text-center px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-10">لا توجد مستندات</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "expenses" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">المصاريف</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">عرض جميع المصاريف المرتبطة بعقاراتك</p>
                </div>
                <InstantLink
                  href="/property-management/overdue#add-expense"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <FaPlus className="ml-2" />
                  إضافة مصروف جديد
                </InstantLink>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{e.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{e.expenseCategory || e.expenseType}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{(e.amount || 0).toLocaleString()} {e.currency || 'OMR'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{new Date(e.date).toLocaleDateString('ar')}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${e.status === 'paid' ? 'bg-green-100 text-green-800' : e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{e.status === 'paid' ? 'مدفوع' : e.status === 'pending' ? 'معلق' : 'متأخر'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <InstantLink
                              href={`/property-management/${e.propertyId}/expenses/${e.id}/edit`}
                              className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                            >
                              تعديل
                            </InstantLink>
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                                  fetch(`/api/property-expenses/${e.id}`, { method: 'DELETE' })
                                    .then(() => { setExpenses(expenses.filter(exp => exp.id !== e.id)); })
                                    .catch(err => alert('فشل حذف المصروف'));
                                }
                              }}
                              className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">لا توجد مصاريف</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "overdue" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">الخدمات المتأخرة</h3>
                {overdueServices.length === 0 ? (
                  <div className="text-gray-500">لا توجد خدمات متأخرة</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحساب</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاستحقاق</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overdueServices.map((s) => (
                          <tr key={s.id}>
                            <td className="px-6 py-4 text-sm text-gray-900">{s.serviceName}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{s.accountNumber}</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">متأخر</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">المستندات التي تنتهي قريباً</h3>
                {expiringDocuments.length === 0 ? (
                  <div className="text-gray-500">لا توجد مستندات منتهية قريباً</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expiringDocuments.map((d) => (
                      <div key={d.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{d.documentName}</div>
                          <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">ينتهي قريباً</span>
                        </div>
                        <div className="text-sm text-gray-600">{d.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
    "handover_completed": "تم التسليم",
    // حالات التوقيع الإلكتروني
    "draft": "مسودة",
    "sent_for_signatures": "تم الإرسال للتوقيع",
    "pending_tenant_signature": "في انتظار توقيع المستأجر",
    "pending_owner_signature": "في انتظار توقيعك",
    "pending_admin_approval": "في انتظار موافقة الإدارة",
    "active": "مفعّل",
    "rejected": "مرفوض"
  };
  
  return states[state] || state;
}

// Component لعرض المستأجرين
function TenantsTab() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // API يُرجع { users: [...], pagination: {}, stats: {} }
        const allUsers = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
        const tenantsOnly = allUsers.filter(user => user.role === 'tenant');
        setTenants(tenantsOnly);
        console.log('✅ TenantsTab loaded:', tenantsOnly.length, 'tenants');
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="mr-3 text-gray-600">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow overflow-hidden sm:rounded-md"
    >
      <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">إدارة المستأجرين</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            عرض وإدارة معلومات المستأجرين وعقودهم ({tenants.length} مستأجر)
          </p>
        </div>
        <InstantLink
          href="/rentals/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <FaPlus className="ml-2" />
          إضافة عقد جديد
        </InstantLink>
      </div>
      
      <div className="border-t border-gray-200">
        {tenants.length === 0 ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد مستأجرين حالياً</h3>
              <p className="mt-1 text-sm text-gray-500">عندما يتم إضافة مستأجرين، ستظهر معلوماتهم هنا.</p>
              <div className="mt-6">
                <InstantLink
                  href="/rentals/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  <FaPlus className="ml-2" />
                  إضافة عقد جديد
                </InstantLink>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
                      <p className="text-xs text-gray-500">{tenant.id}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="w-4 h-4 text-purple-500" />
                      <span>{tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="w-4 h-4 text-purple-500" />
                      <span>{tenant.phone}</span>
                    </div>
                    {tenant.tenantDetails?.type && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          tenant.tenantDetails.type === 'individual_omani' ? 'bg-green-100 text-green-800' :
                          tenant.tenantDetails.type === 'individual_foreign' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {tenant.tenantDetails.type === 'individual_omani' ? '🇴🇲 عماني' :
                           tenant.tenantDetails.type === 'individual_foreign' ? '🌍 وافد' :
                           '🏢 شركة'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      تاريخ التسجيل: {new Date(tenant.createdAt).toLocaleDateString('ar', { timeZone: 'UTC' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default OwnerDashboard;
