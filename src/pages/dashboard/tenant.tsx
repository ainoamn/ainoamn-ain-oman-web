// src/pages/dashboard/tenant.tsx
import React, { useState, useEffect } from "react";
import InstantLink from '@/components/InstantLink';
import { motion } from "framer-motion";
import { FaFileContract, FaCalendarAlt, FaMoneyBillWave, FaClock } from "react-icons/fa";

// دالة للحصول على userId من localStorage أو session
function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  
  // من localStorage
  const uid = localStorage.getItem("ao_uid") || localStorage.getItem("uid");
  if (uid) return uid;
  
  // من cookies
  const cookies = document.cookie.split(';');
  const uidCookie = cookies.find(c => c.trim().startsWith('uid='));
  if (uidCookie) {
    return decodeURIComponent(uidCookie.split('=')[1]);
  }
  
  return null;
}

export default function Page() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contracts");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("مستأجر");

  useEffect(() => {
    // الحصول على userId
    const uid = getUserId();
    setUserId(uid);
    
    // الحصول على اسم المستخدم
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("ao_name") || localStorage.getItem("uname") || "مستأجر";
      setUserName(name);
    }
    
    fetchTenantData(uid);
  }, []);

  const fetchTenantData = async (uid: string | null) => {
    try {
      setLoading(true);
      const rentalsUrl = uid 
        ? `/api/rentals?mine=true&userId=${encodeURIComponent(uid)}`
        : "/api/rentals?mine=true";
      
      const [rentalsRes, propertiesRes] = await Promise.all([
        fetch(rentalsUrl),
        fetch("/api/properties")
      ]);

      if (rentalsRes.ok) {
        const rentalsData = await rentalsRes.json();
        const items = Array.isArray(rentalsData?.items) ? rentalsData.items : [];
        setRentals(items);
        console.log('✅ Tenant rentals loaded:', items.length);
      } else {
        console.error('❌ Failed to load rentals:', rentalsRes.status);
      }

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        const items = Array.isArray(propertiesData?.items) ? propertiesData.items : [];
        setProperties(items);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string): number | null => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStateLabel = (state: string): string => {
    const labels: Record<string, string> = {
      "reserved": "محجوز",
      "paid": "مدفوع",
      "active": "نشط",
      "handover_completed": "مكتمل",
      "pending_tenant_signature": "في انتظار توقيعك",
      "pending_owner_signature": "في انتظار توقيع المالك",
      "pending_admin_approval": "في انتظار موافقة الإدارة",
      "sent_for_signatures": "تم الإرسال للتوقيع",
      "active": "مفعّل"
    };
    return labels[state] || state;
  };

  const getStateColor = (state: string): string => {
    if (state === "active") return "bg-green-100 text-green-800";
    if (state === "paid") return "bg-blue-100 text-blue-800";
    if (state === "reserved") return "bg-yellow-100 text-yellow-800";
    if (state.includes("pending")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المستأجر</h1>
              <p className="mt-1 text-sm text-gray-500">مرحباً {userName}</p>
            </div>
            <InstantLink href="/dashboard" className="text-teal-700 hover:underline">رجوع</InstantLink>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("contracts")}
              className={`${
                activeTab === "contracts"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaFileContract className="inline ml-2" />
              عقود الإيجار ({rentals.length})
            </button>
          </nav>
        </div>

        {/* Contracts Tab */}
        {activeTab === "contracts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow overflow-hidden sm:rounded-md"
          >
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">عقود الإيجار الخاصة بي</h3>
            </div>
            
            {rentals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم العقد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العقار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإيجار الشهري</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأيام المتبقية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rentals.map((rental) => {
                      const property = properties.find(p => p.id === rental.propertyId);
                      const daysRemaining = getDaysRemaining(rental.endDate);
                      // تحديد الحالة الفعلية (من state أو signatureWorkflow)
                      const actualState = (rental as any).signatureWorkflow || rental.state;
                      return (
                        <tr key={rental.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{rental.id?.split('-')[1]?.substring(0, 8) || rental.id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {property?.buildingNumber ? `مبنى ${property.buildingNumber}` : property?.title || 'غير محدد'}
                            </div>
                            {rental.unitId && (
                              <div className="text-xs text-gray-500">وحدة: {rental.unitId}</div>
                            )}
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
                            {daysRemaining !== null ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                daysRemaining < 30 ? 'bg-red-100 text-red-800' : 
                                daysRemaining < 90 ? 'bg-orange-100 text-orange-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                <FaClock className="ml-1" />
                                {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(actualState)}`}>
                              {getStateLabel(actualState)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <InstantLink
                              href={`/contracts/rental/${rental.id}`}
                              className="text-teal-600 hover:text-teal-900"
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
            ) : (
              <div className="text-center py-12">
                <FaFileContract className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عقود إيجار</h3>
                <p className="mt-1 text-sm text-gray-500">لم يتم العثور على أي عقود إيجار مرتبطة بحسابك.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
