import { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InstantLink from "@/components/InstantLink";

const ElectronicSignPage: NextPage = () => {
  const router = useRouter();
  const { contractId } = router.query as { contractId?: string };
  
  const [rental, setRental] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (contractId) {
      loadContractData();
    } else {
      setLoading(false);
    }
  }, [contractId]);

  const loadContractData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 جلب بيانات العقد للتوقيع: ${contractId}`);
      
      const rentalRes = await fetch(`/api/rentals/${contractId}`);
      if (rentalRes.ok) {
        const data = await rentalRes.json();
        console.log('📦 البيانات المستلمة:', data);
        
        // تعيين بيانات العقد
        const rentalData = data.rental || data;
        setRental(rentalData);
        console.log('✅ تم تعيين بيانات العقد:', rentalData);
        
        // تعيين بيانات العقار (إذا كانت موجودة في الرد)
        if (data.property) {
          setProperty(data.property);
          console.log('✅ تم تعيين بيانات العقار:', data.property);
        } else if (rentalData.propertyId) {
          // إذا لم تكن موجودة، جلبها من API منفصل
          const propertyRes = await fetch(`/api/properties/${rentalData.propertyId}`);
          if (propertyRes.ok) {
            const propertyData = await propertyRes.json();
            setProperty(propertyData.property || propertyData);
            console.log('✅ تم جلب بيانات العقار من API منفصل');
          }
        }
      } else {
        console.error('❌ فشل جلب بيانات العقد:', rentalRes.status);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات العقد:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForSign = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: ربط خدمة التوقيع الإلكتروني لاحقاً
    setStatus("تم إرسال العقد للتوقيع الإلكتروني بنجاح (تجريبي)");
  };

  return (
    <>
      <Head>
        <title>التوقيع الإلكتروني | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">التوقيع الإلكتروني</h1>
            <p className="text-gray-600">أرسل العقد للتوقيع من المالك والمستأجر</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : rental ? (
            <div className="space-y-6">
              {/* ملخص العقد */}
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص العقد</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">رقم العقد</p>
                    <p className="text-base font-medium text-gray-900">#{rental.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">العقار</p>
                    <p className="text-base font-medium text-gray-900">
                      مبنى {property?.buildingNumber || rental.propertyId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المؤجر (المالك)</p>
                    <p className="text-base font-medium text-gray-900">
                      {property?.ownerName || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المستأجر</p>
                    <p className="text-base font-medium text-gray-900">
                      {rental.tenantName || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ البدء</p>
                    <p className="text-base font-medium text-gray-900">
                      {rental.startDate ? new Date(rental.startDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
                    <p className="text-base font-medium text-gray-900">
                      {rental.endDate ? new Date(rental.endDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الإيجار الشهري</p>
                    <p className="text-base font-medium text-gray-900">
                      {rental.monthlyRent || rental.amount || 0} {rental.currency || 'OMR'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">مدة العقد</p>
                    <p className="text-base font-medium text-gray-900">
                      {rental.duration || 0} شهر
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendForSign} className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">إرسال للتوقيع الإلكتروني</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      سيتم إرسال العقد للمؤجر والمستأجر للتوقيع الإلكتروني
                    </p>
                    <div className="flex items-center gap-3">
                      <button 
                        type="submit" 
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        📝 إرسال للتوقيع
                      </button>
                      <InstantLink
                        href={`/contracts/rental/${rental.id}`}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                      >
                        عرض التفاصيل
                      </InstantLink>
                    </div>
                  </div>
                  {status && (
                    <div className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-sm">
                      {status}
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendForSign} className="bg-white shadow sm:rounded-lg p-6 space-y-4">
              <div className="text-center py-8 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">⚠️ لم يتم تحديد رقم العقد</p>
                <p className="text-sm text-yellow-600 mt-2">الرجاء استخدام الرابط من صفحة العقود</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم العقد (اختياري)</label>
                <input 
                  type="text" 
                  className="w-full border-gray-300 rounded-md" 
                  placeholder="مثال: rental-1234567890"
                  onChange={(e) => router.push(`/contracts/sign?contractId=${e.target.value}`)}
                />
              </div>
              <InstantLink
                href="/contracts/rental"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                العودة إلى قائمة العقود
              </InstantLink>
            </form>
          )}
        </main>
      </div>
    </>
  );
};

export default ElectronicSignPage;


