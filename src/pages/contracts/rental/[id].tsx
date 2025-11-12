import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InstantLink from "@/components/InstantLink";
import { 
  FaFileContract, FaBuilding, FaUser, FaCalendarAlt, FaMoneyBillWave,
  FaArrowLeft, FaDownload, FaPrint, FaEdit, FaCheckCircle, FaClock,
  FaHome, FaPhone, FaEnvelope, FaIdCard, FaMapMarkerAlt
} from "react-icons/fa";

const RentalContractDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [rental, setRental] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRentalDetails();
    }
  }, [id]);

  const loadRentalDetails = async () => {
    try {
      // جلب بيانات العقد
      const rentalRes = await fetch(`/api/rentals/${id}`);
      if (rentalRes.ok) {
        const rentalData = await rentalRes.json();
        setRental(rentalData.rental || rentalData);
        
        // جلب بيانات العقار
        if (rentalData.rental?.propertyId || rentalData.propertyId) {
          const propertyId = rentalData.rental?.propertyId || rentalData.propertyId;
          const propertyRes = await fetch(`/api/properties/${propertyId}`);
          if (propertyRes.ok) {
            const propertyData = await propertyRes.json();
            setProperty(propertyData.property || propertyData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading rental details:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      'reserved': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'paid': 'bg-blue-100 text-blue-800 border-blue-200',
      'docs_submitted': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'docs_verified': 'bg-purple-100 text-purple-800 border-purple-200',
      'handover_completed': 'bg-green-100 text-green-800 border-green-200',
      'active': 'bg-green-100 text-green-800 border-green-200',
      'expired': 'bg-gray-100 text-gray-800 border-gray-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[state] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">العقد غير موجود</h1>
          <InstantLink href="/contracts/rental" className="px-4 py-2 bg-blue-600 text-white rounded-md">
            العودة للعقود
          </InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>تفاصيل العقد #{rental.id} | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <InstantLink
                  href="/contracts/rental"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </InstantLink>
                <div>
                  <h1 className="text-2xl font-bold">تفاصيل عقد الإيجار</h1>
                  <p className="text-blue-100">العقد #{rental.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {rental.state === 'reserved' && (
                  <InstantLink
                    href={`/contracts/sign?contractId=${rental.id}`}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    توقيع العقد
                  </InstantLink>
                )}
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                  <FaPrint className="w-4 h-4" />
                  طباعة
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                  <FaDownload className="w-4 h-4" />
                  تحميل
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* الحالة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStateColor(rental.state)}`}>
              <div className={`h-3 w-3 rounded-full ${
                rental.state === "active" || rental.state === "handover_completed" ? "bg-green-500" :
                rental.state === "paid" ? "bg-blue-500" :
                rental.state === "reserved" ? "bg-yellow-500" : "bg-gray-500"
              }`}></div>
              <span className="font-semibold">{getStateLabel(rental.state)}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* العمود الأيمن - المعلومات الأساسية */}
            <div className="lg:col-span-2 space-y-6">
              {/* معلومات العقار */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBuilding className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">معلومات العقار</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">رقم المبنى</p>
                    <p className="text-base font-medium text-gray-900">{property?.buildingNumber || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الوحدة</p>
                    <p className="text-base font-medium text-gray-900">{rental.unitId || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">العنوان</p>
                    <p className="text-base font-medium text-gray-900">{property?.address || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المساحة</p>
                    <p className="text-base font-medium text-gray-900">{property?.area || 'غير محدد'} م²</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">النوع</p>
                    <p className="text-base font-medium text-gray-900">{property?.category || 'غير محدد'}</p>
                  </div>
                </div>
              </motion.div>

              {/* معلومات المستأجر */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">معلومات المستأجر</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">الاسم</p>
                    <p className="text-base font-medium text-gray-900">{rental.tenantName || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الهوية</p>
                    <p className="text-base font-medium text-gray-900">{rental.tenantId || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                    <p className="text-base font-medium text-gray-900">{rental.tenantPhone || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="text-base font-medium text-gray-900">{rental.tenantEmail || 'غير محدد'}</p>
                  </div>
                </div>
              </motion.div>

              {/* تفاصيل العقد */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaFileContract className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">تفاصيل العقد</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">تاريخ البدء</p>
                    <p className="text-base font-medium text-gray-900">
                      {rental.startDate ? new Date(rental.startDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
                    <p className="text-base font-medium text-gray-900">
                      {rental.endDate ? new Date(rental.endDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">مدة العقد</p>
                    <p className="text-base font-medium text-gray-900">{rental.duration || 0} شهر</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">العملة</p>
                    <p className="text-base font-medium text-gray-900">{rental.currency || 'OMR'}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* العمود الأيسر - المعلومات المالية */}
            <div className="space-y-6">
              {/* المبالغ المالية */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaMoneyBillWave className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">المبالغ المالية</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">الإيجار الشهري</span>
                    <span className="text-lg font-bold text-gray-900">
                      {rental.monthlyRent || rental.amount || 0} {rental.currency || 'OMR'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">مبلغ الضمان</span>
                    <span className="text-base font-medium text-gray-900">
                      {rental.deposit || 0} {rental.currency || 'OMR'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">إجمالي العقد</span>
                    <span className="text-base font-medium text-gray-900">
                      {((rental.monthlyRent || rental.amount || 0) * (rental.duration || 0))} {rental.currency || 'OMR'}
                    </span>
                  </div>
                  {rental.gracePeriodDays > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500">فترة السماح</span>
                      <span className="text-base font-medium text-gray-900">
                        {rental.gracePeriodDays} يوم
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* الإجراءات السريعة */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">الإجراءات</h3>
                <div className="space-y-2">
                  {rental.state === 'reserved' && (
                    <InstantLink
                      href={`/contracts/sign?contractId=${rental.id}`}
                      className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      توقيع العقد
                    </InstantLink>
                  )}
                  <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FaPrint className="w-4 h-4" />
                    طباعة العقد
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FaDownload className="w-4 h-4" />
                    تحميل PDF
                  </button>
                  <InstantLink
                    href={`/rentals/edit/${rental.id}`}
                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    تعديل العقد
                  </InstantLink>
                </div>
              </motion.div>

              {/* معلومات إضافية */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاريخ الإنشاء</span>
                    <span className="font-medium text-gray-900">
                      {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </span>
                  </div>
                  {rental.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">آخر تحديث</span>
                      <span className="font-medium text-gray-900">
                        {new Date(rental.updatedAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">نوع العقد</span>
                    <span className="font-medium text-gray-900">
                      {rental.contractType === 'residential' ? 'سكني' : rental.contractType === 'commercial' ? 'تجاري' : 'غير محدد'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RentalContractDetailPage;

