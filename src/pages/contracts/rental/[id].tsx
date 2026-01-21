// src/pages/contracts/rental/[id].tsx - صفحة تفاصيل العقد الإيجاري - عرض شامل
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InstantLink from "@/components/InstantLink";
import { 
  FaFileContract, FaBuilding, FaUser, FaCalendarAlt, FaMoneyBillWave,
  FaArrowLeft, FaDownload, FaPrint, FaEdit, FaDollarSign,
  FaMapMarkerAlt, FaFileAlt, FaCheck
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
      console.log(`🔍 جلب تفاصيل العقد: ${id}`);
      const rentalRes = await fetch(`/api/rentals/${id}`);
      if (rentalRes.ok) {
        const data = await rentalRes.json();
        console.log('📦 البيانات المستلمة:', data);
        
        const rentalData = data.rental || data;
        setRental(rentalData);
        console.log('✅ تم تعيين بيانات العقد:', rentalData);
        
        if (data.property) {
          setProperty(data.property);
          console.log('✅ تم تعيين بيانات العقار:', data.property);
        } else if (rentalData.propertyId) {
          const propertyRes = await fetch(`/api/properties/${rentalData.propertyId}`);
          if (propertyRes.ok) {
            const propertyData = await propertyRes.json();
            setProperty(propertyData.property || propertyData);
            console.log('✅ تم جلب بيانات العقار من API منفصل:', propertyData);
          }
        }
      } else {
        console.error('❌ فشل جلب بيانات العقد:', rentalRes.status);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب تفاصيل العقد:', error);
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
      'cancelled': 'ملغي',
      'draft': 'مسودة'
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
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'draft': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[state] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // دالة مساعدة لتنسيق الأرقام بأمان
  const safeToFixed = (value: number | undefined | null, decimals: number = 3): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.000';
    }
    return Number(value).toFixed(decimals);
  };

  // دالة مساعدة للحصول على قيمة آمنة
  const safeNumber = (value: number | undefined | null, defaultValue: number = 0): number => {
    if (value === undefined || value === null || isNaN(value)) {
      return defaultValue;
    }
    return Number(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const originalTitle = document.title;
      document.title = `عقد-إيجار-${id}`;
      window.print();
      document.title = originalTitle;
    } catch (error) {
      console.error('خطأ في التحميل:', error);
      alert('حدث خطأ أثناء التحميل');
    }
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
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            .print-break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <InstantLink
                  href="/contracts/rental"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors no-print"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </InstantLink>
                <div>
                  <h1 className="text-2xl font-bold">تفاصيل عقد الإيجار</h1>
                  <p className="text-blue-100">العقد #{rental.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 no-print">
                {rental.state === 'reserved' && (
                  <InstantLink
                    href={`/contracts/sign?contractId=${rental.id}`}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    توقيع العقد
                  </InstantLink>
                )}
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaPrint className="w-4 h-4" />
                  طباعة
                </button>
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  تحميل PDF
                </button>
                <InstantLink
                  href={`/rentals/edit/${rental.id}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  تعديل
                </InstantLink>
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
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStateColor(rental.state || rental.status)}`}>
              <div className={`h-3 w-3 rounded-full ${
                rental.state === "active" || rental.state === "handover_completed" ? "bg-green-500" :
                rental.state === "paid" ? "bg-blue-500" :
                rental.state === "reserved" ? "bg-yellow-500" : "bg-gray-500"
              }`}></div>
              <span className="font-semibold">{getStateLabel(rental.state || rental.status)}</span>
            </div>
          </motion.div>

          {/* عرض شامل لجميع البيانات - نفس الخطوة 5 */}
          <div className="space-y-6">
            
            {/* نوع العقد */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-300"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaFileContract className="text-purple-600" />
                نوع العقد
              </h4>
              <p className="text-xl font-bold">
                {rental.contractType === 'residential' ? '🏠 عقد سكني' : '🏢 عقد تجاري'}
              </p>
            </motion.div>

            {/* معلومات المؤجر (المالك) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300"
            >
              <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <FaUser className="w-5 h-5" />
                معلومات المؤجر (المالك)
              </h5>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">اسم المالك:</span> <span className="text-gray-900">{property?.ownerName || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الهاتف:</span> <span className="text-gray-900">{property?.ownerPhone || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">البريد:</span> <span className="text-gray-900">{property?.ownerEmail || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">معرف المالك:</span> <span className="text-gray-900">{property?.ownerId || 'غير محدد'}</span></p>
              </div>
            </motion.div>

            {/* معلومات العقار الأساسية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300"
            >
              <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FaBuilding className="w-5 h-5" />
                معلومات العقار
              </h5>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">العقار:</span> <span className="text-gray-900">{property?.titleAr || property?.title || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الوحدة:</span> <span className="text-gray-900">الوحدة {rental.unitId || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-700">النوع:</span> <span className="text-gray-900">{property?.buildingType === 'single' ? 'عقار مفرد' : 'عقار متعدد الوحدات'}</span></p>
                <p><span className="font-medium text-gray-700">المساحة:</span> <span className="text-gray-900">{property?.area || '554'} م²</span></p>
                <p><span className="font-medium text-gray-700">رقم المبنى:</span> <span className="text-gray-900">{property?.buildingNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الرقم المتسلسل:</span> <span className="text-gray-900">{property?.serialNumber || 'غير محدد'}</span></p>
              </div>
            </motion.div>

            {/* البيانات الإضافية للعقار */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-teal-50 rounded-lg p-6 border-2 border-teal-300"
            >
              <h5 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="w-5 h-5" />
                البيانات الإضافية للعقار
              </h5>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">المجمع:</span> <span className="text-gray-900">{property?.complexName || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم المجمع:</span> <span className="text-gray-900">{property?.complexNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">السكة:</span> <span className="text-gray-900">{property?.streetName || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم الطريق:</span> <span className="text-gray-900">{property?.roadNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">الرقم المساحي:</span> <span className="text-gray-900">{property?.surveyNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم القطعة:</span> <span className="text-gray-900">{property?.plotNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم المربع:</span> <span className="text-gray-900">{property?.squareNumber || 'غير محدد'}</span></p>
                <p><span className="font-medium text-gray-700">رقم البلوك:</span> <span className="text-gray-900">{property?.blockNumber || 'غير محدد'}</span></p>
              </div>
            </motion.div>

            {/* معلومات المستأجر */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-green-50 rounded-lg p-6 border-2 border-green-300"
            >
              <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <FaUser className="w-5 h-5" />
                معلومات المستأجر
              </h5>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">الاسم:</span> <span className="text-gray-900">{rental.tenantName}</span></p>
                <p><span className="font-medium text-gray-700">الهاتف:</span> <span className="text-gray-900">{rental.tenantPhone}</span></p>
                <p><span className="font-medium text-gray-700">البريد:</span> <span className="text-gray-900">{rental.tenantEmail}</span></p>
                {rental.tenantId && <p><span className="font-medium text-gray-700">الهوية:</span> <span className="text-gray-900">{rental.tenantId}</span></p>}
              </div>
            </motion.div>

            {/* التواريخ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-orange-50 rounded-lg p-6 border-2 border-orange-300"
            >
              <h5 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="w-5 h-5" />
                التواريخ المهمة
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {rental.actualRentalDate && <p><span className="font-medium text-gray-700">تاريخ الاستئجار الفعلي:</span> <span className="text-gray-900">{new Date(rental.actualRentalDate).toLocaleDateString('en-GB')}</span></p>}
                {rental.unitHandoverDate && <p><span className="font-medium text-gray-700">تاريخ استلام الوحدة:</span> <span className="text-gray-900">{new Date(rental.unitHandoverDate).toLocaleDateString('en-GB')}</span></p>}
                <p><span className="font-medium text-gray-700">تاريخ بدء العقد الرسمي:</span> <span className="text-gray-900">{new Date(rental.startDate).toLocaleDateString('en-GB')}</span></p>
                <p><span className="font-medium text-gray-700">تاريخ انتهاء العقد:</span> <span className="text-gray-900">{new Date(rental.endDate).toLocaleDateString('en-GB')}</span></p>
                <p><span className="font-medium text-gray-700">المدة:</span> <span className="text-gray-900">{rental.duration} شهر</span></p>
                {rental.rentDueDay && <p><span className="font-medium text-gray-700">يوم استحقاق الإيجار:</span> <span className="text-gray-900">اليوم {rental.rentDueDay} من كل شهر</span></p>}
                  </div>
            </motion.div>

            {/* المبالغ المالية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-green-50 rounded-lg p-6 border-2 border-green-300"
            >
              <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <FaMoneyBillWave className="w-5 h-5" />
                المبالغ المالية
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  {rental.calculateByArea && (
                    <>
                      <p className="font-semibold text-indigo-700">📐 محسوب بالمتر:</p>
                      <p><span className="font-medium text-gray-700">المساحة:</span> <span className="text-gray-900">{rental.rentArea} م²</span></p>
                      <p><span className="font-medium text-gray-700">السعر للمتر:</span> <span className="text-gray-900">{rental.pricePerMeter} {rental.currency}</span></p>
                    </>
                  )}
                  <p><span className="font-medium text-gray-700">الإيجار الشهري:</span> <span className="text-gray-900 font-bold">{safeToFixed(rental.monthlyRent)} {rental.currency || 'OMR'}</span></p>
                  <p><span className="font-medium text-gray-700">مبلغ الضمان:</span> <span className="text-gray-900">{safeToFixed(rental.deposit)} {rental.currency || 'OMR'}</span></p>
                  {rental.gracePeriodDays > 0 && (
                    <p><span className="font-medium text-gray-700">فترة السماح:</span> <span className="text-gray-900">{rental.gracePeriodDays} يوم ({safeToFixed(rental.gracePeriodAmount)} {rental.currency || 'OMR'})</span></p>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {rental.includesVAT && (
                    <p><span className="font-medium text-gray-700">ضريبة القيمة المضافة:</span> <span className="text-gray-900">{safeNumber(rental.vatRate) * 100}% ({safeToFixed(rental.totalVATAmount)} {rental.currency || 'OMR'})</span></p>
                  )}
                  {rental.hasOtherTaxes && (
                    <p><span className="font-medium text-gray-700">{rental.otherTaxName}:</span> <span className="text-gray-900">{safeNumber(rental.otherTaxRate) * 100}% ({safeToFixed(rental.totalOtherTaxAmount)} {rental.currency || 'OMR'})</span></p>
                  )}
                  <p className="font-bold text-green-900"><span className="font-medium text-gray-700">إجمالي العقد:</span> {safeToFixed(safeNumber(rental.monthlyRent) * safeNumber(rental.duration))} {rental.currency || 'OMR'}</p>
                  </div>
                  </div>
            </motion.div>

            {/* طرق الدفع */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300"
            >
              <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <FaDollarSign className="w-5 h-5" />
                طرق الدفع
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                  <p className="font-semibold text-gray-900 mb-2">دفع الإيجار:</p>
                  <p>
                    <span className="font-medium text-gray-700">الطريقة:</span>{' '}
                    {rental.rentPaymentMethod === 'cash' && '💵 نقداً'}
                    {rental.rentPaymentMethod === 'check' && '📝 شيك'}
                    {rental.rentPaymentMethod === 'bank_transfer' && '🏦 تحويل بنكي'}
                    {rental.rentPaymentMethod === 'electronic_payment' && '💳 دفع إلكتروني'}
                  </p>
                  {rental.rentPaymentMethod === 'check' && rental.rentChecks && (
                    <p><span className="font-medium text-gray-700">عدد الشيكات:</span> {rental.rentChecks.length}</p>
                  )}
                  {rental.rentReceiptNumber && (
                    <p><span className="font-medium text-gray-700">رقم الإيصال:</span> {rental.rentReceiptNumber}</p>
                  )}
                  </div>
                  <div>
                  <p className="font-semibold text-gray-900 mb-2">دفع الضمان:</p>
                  <p>
                    <span className="font-medium text-gray-700">الطريقة:</span>{' '}
                    {rental.depositPaymentMethod === 'cash' && '💵 نقداً'}
                    {rental.depositPaymentMethod === 'check' && '📝 شيك'}
                    {rental.depositPaymentMethod === 'cash_and_check' && '💵📝 نقدي + شيك'}
                    {rental.depositPaymentMethod === 'bank_transfer' && '🏦 تحويل بنكي'}
                    {rental.depositPaymentMethod === 'electronic_payment' && '💳 دفع إلكتروني'}
                  </p>
                  {rental.depositPaymentMethod === 'cash_and_check' && (
                    <>
                      <p><span className="font-medium text-gray-700">المبلغ النقدي:</span> {safeToFixed(rental.depositCashAmount)} {rental.currency || 'OMR'}</p>
                      <p><span className="font-medium text-gray-700">عدد الشيكات:</span> {rental.depositChecks?.length || 0}</p>
                    </>
                  )}
                  </div>
                </div>
              </motion.div>

            {/* تفاصيل الشيكات */}
            {rental.rentChecks && rental.rentChecks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300"
              >
                <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  شيكات الإيجار
                </h5>
                <div className="mb-4 bg-white rounded-lg p-4">
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">البنك:</span> {rental.rentChecksBankName}</p>
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">الفرع:</span> {rental.rentChecksBankBranch}</p>
                  <p className="text-sm"><span className="font-medium text-gray-700">رقم الحساب:</span> {rental.rentChecksBankAccount}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rental.rentChecks.map((check: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="font-semibold text-gray-900 mb-1">الشيك #{index + 1}</p>
                      <p className="text-xs"><span className="text-gray-600">رقم:</span> {check.checkNumber}</p>
                      <p className="text-xs"><span className="text-gray-600">المبلغ:</span> {check.amount} {rental.currency}</p>
                      <p className="text-xs"><span className="text-gray-600">التاريخ:</span> {new Date(check.date).toLocaleDateString('en-GB')}</p>
                  </div>
                  ))}
                  </div>
                <div className="mt-4 bg-white rounded-lg p-3">
                  <p className="text-sm font-bold text-green-700">
                    إجمالي شيكات الإيجار: {safeToFixed(rental.rentChecks.reduce((sum: number, c: any) => sum + safeNumber(c.amount), 0))} {rental.currency || 'OMR'}
                  </p>
                  <p className="text-xs text-gray-600">عدد الشيكات: {rental.rentChecks.length} / {safeNumber(rental.duration)}</p>
                </div>
              </motion.div>
            )}

            {/* شيكات الضمان */}
            {rental.depositChecks && rental.depositChecks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300"
              >
                <h5 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  شيكات الضمان
                </h5>
                <div className="mb-4 bg-white rounded-lg p-4">
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">البنك:</span> {rental.depositChecksBankName}</p>
                  <p className="text-sm mb-2"><span className="font-medium text-gray-700">الفرع:</span> {rental.depositChecksBankBranch}</p>
                  <p className="text-sm"><span className="font-medium text-gray-700">رقم الحساب:</span> {rental.depositChecksBankAccount}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rental.depositChecks.map((check: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="font-semibold text-gray-900 mb-1">الشيك #{index + 1}</p>
                      <p className="text-xs"><span className="text-gray-600">رقم:</span> {check.checkNumber}</p>
                      <p className="text-xs"><span className="text-gray-600">المبلغ:</span> {check.amount} {rental.currency}</p>
                      <p className="text-xs"><span className="text-gray-600">التاريخ:</span> {check.hasDate === false ? 'شيك بدون تاريخ' : new Date(check.date).toLocaleDateString('en-GB')}</p>
                  </div>
                  ))}
                </div>
                <div className="mt-4 bg-white rounded-lg p-3">
                  <p className="text-sm font-bold text-purple-700">
                    إجمالي شيكات الضمان: {safeToFixed(rental.depositChecks.reduce((sum: number, c: any) => sum + safeNumber(c.amount), 0))} {rental.currency || 'OMR'}
                  </p>
                  {rental.depositPaymentMethod === 'cash_and_check' && (
                    <p className="text-sm mt-1 text-gray-700">
                      إجمالي الضمان: {safeToFixed(safeNumber(rental.depositCashAmount) + rental.depositChecks.reduce((sum: number, c: any) => sum + safeNumber(c.amount), 0))} {rental.currency || 'OMR'} (نقدي: {safeNumber(rental.depositCashAmount)} + شيكات: {safeToFixed(rental.depositChecks.reduce((sum: number, c: any) => sum + safeNumber(c.amount), 0))})
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* المستندات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300"
            >
              <h5 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <FaFileAlt className="w-5 h-5" />
                المستندات الرسمية
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium text-gray-700">رقم استمارة البلدية:</span> <span className="text-gray-900">{rental.municipalityFormNumber}</span></p>
                {rental.municipalityContractNumber && (
                  <p><span className="font-medium text-gray-700">رقم العقد المعتمد:</span> <span className="text-gray-900">{rental.municipalityContractNumber}</span></p>
                )}
                <p><span className="font-medium text-gray-700">رسوم التسجيل:</span> <span className="text-gray-900">{rental.municipalityRegistrationFee} {rental.currency}</span></p>
                <p><span className="font-medium text-gray-700">رسوم البلدية (3%):</span> <span className="text-gray-900">{safeToFixed(rental.municipalityFees)} {rental.currency || 'OMR'}</span></p>
                  </div>
            </motion.div>

            {/* قراءات العدادات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-300"
            >
              <h5 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <FaFileAlt className="w-5 h-5" />
                قراءات العدادات
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                  <p className="font-semibold text-gray-900 mb-1">⚡ الكهرباء:</p>
                  <p><span className="font-medium text-gray-700">القراءة:</span> {rental.electricityMeterReading}</p>
                  {rental.electricityBillAmount > 0 && (
                    <p><span className="font-medium text-gray-700">مبلغ الفاتورة:</span> {safeToFixed(rental.electricityBillAmount)} {rental.currency || 'OMR'}</p>
                  )}
                  </div>
                  <div>
                  <p className="font-semibold text-gray-900 mb-1">💧 الماء:</p>
                  <p><span className="font-medium text-gray-700">القراءة:</span> {rental.waterMeterReading}</p>
                  {rental.waterBillAmount > 0 && (
                    <p><span className="font-medium text-gray-700">مبلغ الفاتورة:</span> {safeToFixed(rental.waterBillAmount)} {rental.currency || 'OMR'}</p>
                  )}
                  </div>
                  </div>
            </motion.div>

            {/* رسوم الإنترنت */}
            {rental.internetIncluded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-cyan-50 rounded-lg p-6 border-2 border-cyan-300"
              >
                <h5 className="font-bold text-cyan-900 mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="w-5 h-5" />
                  رسوم الإنترنت
                </h5>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">مشمول في الإيجار:</span> <span className="text-gray-900">{rental.internetIncluded ? 'نعم' : 'لا'}</span></p>
                  {rental.internetFees > 0 && (
                    <>
                      <p><span className="font-medium text-gray-700">نوع الاشتراك:</span> <span className="text-gray-900">{rental.internetPaymentType === 'annually' ? 'سنوي' : 'شهري'}</span></p>
                      <p><span className="font-medium text-gray-700">المبلغ:</span> <span className="text-gray-900">{safeToFixed(rental.internetFees)} {rental.currency || 'OMR'}</span></p>
                      {rental.internetPaymentType === 'annually' && (
                        <p className="text-xs text-cyan-700">إجمالي رسوم الإنترنت: {safeToFixed(rental.internetFees)} {rental.currency || 'OMR'} (دفعة واحدة)</p>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* رسوم أخرى */}
            {rental.hasOtherFees && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-pink-50 rounded-lg p-6 border-2 border-pink-300"
              >
                <h5 className="font-bold text-pink-900 mb-3">رسوم أخرى</h5>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">الوصف:</span> <span className="text-gray-900">{rental.otherFeesDescription}</span></p>
                  <p><span className="font-medium text-gray-700">المبلغ:</span> <span className="text-gray-900">{safeToFixed(rental.otherFeesAmount)} {rental.currency || 'OMR'}</span></p>
            </div>
              </motion.div>
            )}

            {/* الإيجارات الشهرية المخصصة */}
            {rental.useCustomMonthlyRents && rental.customMonthlyRents && rental.customMonthlyRents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300"
              >
                <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="w-5 h-5" />
                  جدول الإيجارات الشهرية المخصصة
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {rental.customMonthlyRents.map((amount: number, index: number) => {
                    const monthDate = new Date(rental.startDate);
                    monthDate.setMonth(monthDate.getMonth() + index);
                    return (
                      <div key={index} className="bg-white rounded-lg p-3 border border-indigo-200">
                        <p className="font-semibold text-gray-900 text-sm">الشهر {index + 1}</p>
                        <p className="text-xs text-gray-600">{monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                        <p className="text-sm font-bold text-indigo-700 mt-1">{safeToFixed(amount)} {rental.currency || 'OMR'}</p>
                  </div>
                    );
                  })}
                </div>
                <div className="mt-4 bg-white rounded-lg p-3">
                  <p className="text-sm font-bold text-indigo-700">
                    إجمالي الإيجارات: {safeToFixed(rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + safeNumber(amount), 0))} {rental.currency || 'OMR'}
                  </p>
                  <p className="text-xs text-gray-600">متوسط الإيجار الشهري: {rental.customMonthlyRents.length > 0 ? safeToFixed(rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + safeNumber(amount), 0) / rental.customMonthlyRents.length) : '0.000'} {rental.currency || 'OMR'}</p>
                </div>
              </motion.div>
            )}

            {/* الشروط الإضافية */}
            {rental.customTerms && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300"
              >
                <h5 className="font-medium text-gray-900 mb-2">الشروط الإضافية</h5>
                <p className="text-sm text-gray-600 bg-white p-3 rounded border">{rental.customTerms}</p>
              </motion.div>
            )}

            {/* الملخص المالي الشامل */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300"
            >
              <h5 className="font-bold text-green-900 mb-4 text-lg">💰 ملخص الحسابات النهائية</h5>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <h6 className="font-semibold text-gray-900 mb-3">مستحقات المستأجر</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">الإيجار الأساسي الكامل:</span>
                    <span className="font-medium">{safeToFixed(safeNumber(rental.monthlyRent) * safeNumber(rental.duration))} {rental.currency || 'OMR'}</span>
                  </div>
                  
                  {(rental.gracePeriodDays > 0 || rental.useCustomMonthlyRents) && (
                    <>
                      <div className="border-t pt-2">
                        <p className="text-xs font-semibold text-orange-600 mb-1">🎁 التخفيضات الممنوحة:</p>
                      </div>
                      {rental.useCustomMonthlyRents && rental.customMonthlyRents && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">• تخفيض الإيجار المخصص:</span>
                          <span className="text-orange-600">-{safeToFixed((safeNumber(rental.monthlyRent) * safeNumber(rental.duration)) - rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + safeNumber(amount), 0))} {rental.currency || 'OMR'}</span>
                        </div>
                      )}
                      {rental.gracePeriodDays > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">• تخفيض فترة السماح ({rental.gracePeriodDays} يوم):</span>
                          <span className="text-orange-600">-{safeToFixed(rental.gracePeriodAmount)} {rental.currency || 'OMR'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-semibold border-t pt-2">
                        <span className="text-gray-700">إجمالي التخفيضات:</span>
                        <span className="text-orange-600">-{safeToFixed(
                          (rental.useCustomMonthlyRents ? ((safeNumber(rental.monthlyRent) * safeNumber(rental.duration)) - rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + safeNumber(amount), 0)) : 0) + 
                          (rental.gracePeriodDays > 0 ? safeNumber(rental.gracePeriodAmount) : 0)
                        )} {rental.currency || 'OMR'}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span className="text-gray-900">الإيجار الفعلي المطلوب:</span>
                    <span className="text-green-700">{safeToFixed(
                      rental.useCustomMonthlyRents && rental.customMonthlyRents
                        ? rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + safeNumber(amount), 0)
                        : (safeNumber(rental.monthlyRent) * safeNumber(rental.duration))
                    )} {rental.currency || 'OMR'}</span>
                  </div>
                  
                  {rental.includesVAT && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">ضريبة القيمة المضافة ({safeNumber(rental.vatRate) * 100}%):</span>
                      <span className="text-gray-900">+{safeToFixed(rental.totalVATAmount)} {rental.currency || 'OMR'}</span>
                    </div>
                  )}
                  {rental.hasOtherTaxes && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">{rental.otherTaxName} ({safeNumber(rental.otherTaxRate) * 100}%):</span>
                      <span className="text-gray-900">+{safeToFixed(rental.totalOtherTaxAmount)} {rental.currency || 'OMR'}</span>
                    </div>
                  )}
                  {rental.deposit > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">مبلغ الضمان:</span>
                      <span className="text-gray-900">{safeToFixed(rental.deposit)} {rental.currency || 'OMR'}</span>
                    </div>
                  )}
                  {rental.internetIncluded && rental.internetFees > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">رسوم الإنترنت ({rental.internetPaymentType === 'annually' ? 'سنوي' : 'شهري'}):</span>
                      <span className="text-gray-900">{safeToFixed(rental.internetFees)} {rental.currency || 'OMR'}</span>
                    </div>
                  )}
                  {rental.hasOtherFees && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">{rental.otherFeesDescription}:</span>
                      <span className="text-gray-900">{safeToFixed(rental.otherFeesAmount)} {rental.currency || 'OMR'}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg border-t-2 pt-3 mt-3 text-green-900">
                    <span>إجمالي مستحقات المستأجر:</span>
                    <span>{safeToFixed(
                      (rental.useCustomMonthlyRents && rental.customMonthlyRents
                        ? rental.customMonthlyRents.reduce((sum: number, amount: number) => sum + safeNumber(amount), 0)
                        : (safeNumber(rental.monthlyRent) * safeNumber(rental.duration))) +
                      (rental.includesVAT ? safeNumber(rental.totalVATAmount) : 0) +
                      (rental.hasOtherTaxes ? safeNumber(rental.totalOtherTaxAmount) : 0) +
                      safeNumber(rental.deposit) +
                      (rental.internetIncluded ? safeNumber(rental.internetFees) : 0) +
                      (rental.hasOtherFees ? safeNumber(rental.otherFeesAmount) : 0)
                    )} {rental.currency || 'OMR'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-100 rounded-lg p-4 mt-4">
                <h6 className="font-semibold text-orange-900 mb-3">🏛️ مستحقات المالك للبلدية <span className="text-xs font-normal">(لا يدفعها المستأجر)</span></h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">رسوم البلدية (3%):</span>
                    <span className="font-medium">{safeToFixed(rental.municipalityFees)} {rental.currency || 'OMR'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">رسوم التسجيل:</span>
                    <span className="font-medium">{safeNumber(rental.municipalityRegistrationFee)} {rental.currency || 'OMR'}</span>
                  </div>
                  {rental.electricityBillAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">فاتورة الكهرباء الحالية:</span>
                      <span className="font-medium">{safeToFixed(rental.electricityBillAmount)} {rental.currency || 'OMR'}</span>
                    </div>
                  )}
                  {rental.waterBillAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">فاتورة الماء الحالية:</span>
                      <span className="font-medium">{safeToFixed(rental.waterBillAmount)} {rental.currency || 'OMR'}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span className="text-orange-900">إجمالي مستحقات المالك:</span>
                    <span className="text-orange-900">{safeToFixed(
                      safeNumber(rental.municipalityFees) +
                      safeNumber(rental.municipalityRegistrationFee) +
                      safeNumber(rental.electricityBillAmount) +
                      safeNumber(rental.waterBillAmount)
                    )} {rental.currency || 'OMR'}</span>
                  </div>
                  <p className="text-xs text-gray-600 bg-white p-2 rounded mt-2">
                    ℹ️ هذه الرسوم والفواتير يدفعها المالك ولا تُحسب على المستأجر
                  </p>
                </div>
                </div>
              </motion.div>

              {/* معلومات إضافية */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
              <div className="space-y-4">
                {/* معلومات النظام */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h6 className="font-semibold text-gray-900 mb-3">معلومات النظام</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">معرف العقد</span>
                      <span className="font-mono text-xs text-gray-900">{rental.id}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاريخ الإنشاء</span>
                    <span className="font-medium text-gray-900">
                        {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('en-GB') + ' - ' + new Date(rental.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}
                    </span>
                  </div>
                  {rental.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">آخر تحديث</span>
                      <span className="font-medium text-gray-900">
                          {new Date(rental.updatedAt).toLocaleDateString('en-GB') + ' - ' + new Date(rental.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* مدخل العقد */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h6 className="font-semibold text-gray-900 mb-3">مدخل العقد</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">اسم المدخل</span>
                      <span className="font-medium text-gray-900">{rental.createdBy || rental.history?.[0]?.by || 'demo-user'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">تاريخ الإدخال</span>
                      <span className="font-medium text-gray-900">
                        {rental.createdAt ? new Date(rental.createdAt).toLocaleDateString('en-GB') : 'غير محدد'}
                      </span>
                    </div>
                  <div className="flex justify-between">
                      <span className="text-gray-500">وقت الإدخال</span>
                    <span className="font-medium text-gray-900">
                        {rental.createdAt ? new Date(rental.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'غير محدد'}
                    </span>
                    </div>
                  </div>
                </div>

                {/* الموقعون على العقد */}
                {rental.signatures && rental.signatures.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h6 className="font-semibold text-gray-900 mb-3">الموقعون على العقد</h6>
                    <div className="space-y-3">
                      {rental.signatures.map((sig: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">الموقع #{index + 1}</span>
                              <span className="font-medium text-gray-900">{sig.signerName || sig.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">الصفة</span>
                              <span className="text-gray-700">{sig.type === 'owner' ? 'المالك' : sig.type === 'tenant' ? 'المستأجر' : sig.type === 'admin' ? 'إدارة العقار' : sig.role || sig.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">تاريخ التوقيع</span>
                              <span className="text-gray-900">{new Date(sig.signedAt).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">وقت التوقيع</span>
                              <span className="text-gray-900">{new Date(sig.signedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ملاحظة في حالة عدم وجود توقيعات */}
                {(!rental.signatures || rental.signatures.length === 0) && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-800">⚠️ لم يتم توقيع العقد بعد</p>
                  </div>
                )}
                </div>
              </motion.div>

          </div>
        </main>
      </div>
    </>
  );
};

export default RentalContractDetailPage;
