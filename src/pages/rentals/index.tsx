// src/pages/rentals/index.tsx - صفحة عرض جميع عقود الإيجار
import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import InstantLink from "@/components/InstantLink";
import { FaFileContract, FaPlus, FaSearch, FaFilter } from "react-icons/fa";

const RentalsPage: NextPage = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [rentalsRes, propertiesRes] = await Promise.all([
          fetch("/api/rentals"),
          fetch("/api/properties")
        ]);
        
        if (rentalsRes.ok) {
          const data = await rentalsRes.json();
          setRentals(Array.isArray(data?.items) ? data.items : []);
        }
        
        if (propertiesRes.ok) {
          const data = await propertiesRes.json();
          setProperties(Array.isArray(data?.items) ? data.items : []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStateLabel = (state: string) => {
    const labels: Record<string, string> = {
      'reserved': 'تم الحجز',
      'paid': 'تم الدفع',
      'docs_submitted': 'تم تقديم المستندات',
      'docs_verified': 'تم التحقق من المستندات',
      'handover_completed': 'اكتمل التسليم',
      'active': 'نشط',
      'expired': 'منتهي',
      'cancelled': 'ملغي'
    };
    return labels[state] || state;
  };

  const getTitleFromProperty = (property: any) => {
    if (property?.titleAr) return property.titleAr;
    if (property?.titleEn) return property.titleEn;
    if (property?.title) {
      if (typeof property.title === 'string') return property.title;
      if (typeof property.title === 'object') return property.title.ar || property.title.en || '';
    }
    return property?.buildingNumber ? `مبنى ${property.buildingNumber}` : `العقار ${property?.id || ''}`;
  };

  const filteredRentals = rentals.filter(rental => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const property = properties.find(p => p.id === rental.propertyId);
    const propertyTitle = getTitleFromProperty(property || {});
    return (
      rental.id?.toLowerCase().includes(search) ||
      rental.tenantName?.toLowerCase().includes(search) ||
      rental.tenantId?.toLowerCase().includes(search) ||
      propertyTitle?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Head>
        <title>عقود الإيجار - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FaFileContract className="text-blue-600" />
                  عقود الإيجار
                </h1>
                <p className="mt-1 text-sm text-gray-500">عرض وإدارة جميع عقود الإيجار</p>
              </div>
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="ml-2" />
                عقد إيجار جديد
              </InstantLink>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث برقم العقد، اسم المستأجر، أو العقار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
            ) : filteredRentals.length === 0 ? (
              <div className="p-10 text-center">
                <FaFileContract className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900">لا توجد عقود إيجار</h3>
                <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء أول عقد إيجار.</p>
                <div className="mt-6">
                  <InstantLink
                    href="/rentals/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus className="ml-2" />
                    عقد إيجار جديد
                  </InstantLink>
                </div>
              </div>
            ) : (
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
                    {filteredRentals.map((rental) => {
                      const property = properties.find(p => p.id === rental.propertyId);
                      const actualState = (rental as any).signatureWorkflow || rental.state;
                      return (
                        <tr key={rental.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-3 w-3 rounded-full ml-2 ${
                                actualState === "active" ? "bg-green-400" :
                                actualState === "pending_owner_signature" || actualState === "pending_tenant_signature" ? "bg-orange-400" :
                                "bg-gray-400"
                              }`}></div>
                              <div className="text-sm font-medium text-gray-900">#{rental.id?.split('-')[1]?.substring(0, 8) || rental.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {getTitleFromProperty(property || {}) || 'غير محدد'}
                            {rental.unitId && (
                              <div className="text-xs text-gray-500">وحدة: {rental.unitId}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {rental.tenantName || rental.tenantId || 'غير محدد'}
                            {rental.tenantEmail && (
                              <div className="text-xs text-gray-500">{rental.tenantEmail}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rental.startDate ? new Date(rental.startDate).toLocaleDateString('ar-EG') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rental.endDate ? new Date(rental.endDate).toLocaleDateString('ar-EG') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rental.monthlyRent || rental.amount || 0} {rental.currency || 'OMR'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              actualState === "active" ? "bg-green-100 text-green-800" :
                              actualState === "paid" ? "bg-blue-100 text-blue-800" :
                              actualState === "reserved" ? "bg-yellow-100 text-yellow-800" : 
                              actualState === "cancelled" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {getStateLabel(actualState)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <InstantLink
                                href={`/contracts/rental/${rental.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                عرض
                              </InstantLink>
                              <InstantLink
                                href={`/rentals/edit/${rental.id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                تعديل
                              </InstantLink>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default RentalsPage;
