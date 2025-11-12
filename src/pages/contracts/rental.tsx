import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import InstantLink from "@/components/InstantLink";

const RentalContractsPage: NextPage = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rentalsRes, propertiesRes] = await Promise.all([
          fetch("/api/rentals?mine=true"),
          fetch("/api/properties?mine=true")
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
      }
      setLoading(false);
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

  return (
    <>
      <Head>
        <title>عقود الإيجار | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">عقود الإيجار</h1>
                <p className="text-gray-600">إدارة وإنشاء عقود الإيجار</p>
              </div>
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                إنشاء عقد جديد
              </InstantLink>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
            ) : rentals.length === 0 ? (
              <div className="p-10 text-center">
                <h3 className="text-sm font-medium text-gray-900">لا توجد عقود إيجار</h3>
                <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء أول عقد إيجار لك.</p>
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
                    {rentals.map((rental) => {
                      const property = properties.find(p => p.id === rental.propertyId);
                      return (
                        <tr key={rental.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-3 w-3 rounded-full ml-2 ${
                                rental.state === "handover_completed" || rental.state === "active" ? "bg-green-400" :
                                rental.state === "paid" ? "bg-blue-400" :
                                rental.state === "reserved" ? "bg-yellow-400" : "bg-gray-400"
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
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{rental.tenantName || 'غير محدد'}</div>
                              {rental.tenantPhone && <div className="text-xs text-gray-500">{rental.tenantPhone}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rental.startDate ? new Date(rental.startDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rental.endDate ? new Date(rental.endDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {rental.monthlyRent || rental.amount || 0} {rental.currency || 'OMR'}
                            </div>
                            {rental.duration && (
                              <div className="text-xs text-gray-500">المدة: {rental.duration} شهر</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rental.state === "handover_completed" || rental.state === "active" ? "bg-green-100 text-green-800" :
                              rental.state === "paid" ? "bg-blue-100 text-blue-800" :
                              rental.state === "reserved" ? "bg-yellow-100 text-yellow-800" : 
                              rental.state === "cancelled" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {getStateLabel(rental.state)}
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
                              {rental.state === 'reserved' && (
                                <InstantLink
                                  href={`/contracts/sign?contractId=${rental.id}`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  توقيع
                                </InstantLink>
                              )}
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

export default RentalContractsPage;


