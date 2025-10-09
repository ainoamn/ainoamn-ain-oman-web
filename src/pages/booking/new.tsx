// src/pages/booking/new.tsx
// صفحة حجز العقار - محسنة للأداء الفائق ⚡

import { useState, useEffect } from 'react';
import InstantImage from '@/components/InstantImage';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { toSafeText } from '@/components/SafeText';
import { useBookings } from '@/context/BookingsContext';
import { 
  FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaCreditCard,
  FaCheckCircle, FaInfoCircle, FaArrowRight, FaArrowLeft
} from 'react-icons/fa';

interface Property {
  id: string;
  title: any; // قد يكون string أو {ar, en}
  priceOMR: number;
  type: any; // قد يكون string أو {ar, en}
  images?: string[];
}

export default function NewBookingPage() {
  const router = useRouter();
  const { propertyId } = router.query;
  const { addBooking } = useBookings(); // ✅ استخدام Context للتحديث الفوري
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // بيانات المستأجر
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    
    // بيانات الحجز
    startDate: '',
    duration: '12', // بالأشهر
    paymentMethod: 'bank_transfer',
    
    // ملاحظات
    notes: '',
    
    // موافقات
    agreedToTerms: false,
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data.item || data);
      }
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: propertyId, // استخدام propertyId كـ unitId
          buildingId: propertyId, // للتوافق
          startDate: formData.startDate,
          durationMonths: parseInt(formData.duration),
          paymentMethod: formData.paymentMethod,
          tenant: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            idNumber: formData.idNumber,
          },
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const booking = data.item || data;
        const bookingId = booking?.id;
        
        if (bookingId) {
          // ✅ إضافة الحجز إلى Context فوراً (تحديث جميع الصفحات!)
          addBooking(booking);
          
          // التوجيه إلى صفحة الدفع مباشرة ⚡
          await router.push(`/booking/${bookingId}/payment`);
        } else {
          alert('تم إنشاء الحجز لكن لم نتمكن من الحصول على رقم الحجز');
          await router.push(`/properties/${propertyId}`);
        }
      } else {
        const errorData = await response.json();
        alert('فشل في إنشاء الحجز: ' + (errorData.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('حدث خطأ أثناء الحجز: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">العقار غير موجود</h2>
          <InstantLink 
            href="/properties"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            العودة إلى العقارات
          </InstantLink>
        </div>
      </div>
    );
  }

  const totalMonths = parseInt(formData.duration);
  const totalAmount = property.priceOMR * totalMonths;
  
  // تحويل البيانات إلى نص آمن
  const safeTitle = toSafeText(property.title, 'ar');
  const safeType = toSafeText(property.type, 'ar');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Head>
        <title>حجز {safeTitle} | Ain Oman</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">حجز العقار</h1>
            <InstantLink
              href={`/properties/${propertyId}`}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <FaArrowRight />
              العودة إلى العقار
            </InstantLink>
          </div>

          {/* Property Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {property.images && property.images[0] && (
              <InstantImage src={property.images[0]}
                alt={safeTitle}
                className="w-24 h-24 object-cover rounded-lg"
               loading="lazy"/>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{safeTitle}</h2>
              <p className="text-gray-600">{safeType}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {property.priceOMR} ريال / شهر
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'البيانات الشخصية' },
              { num: 2, label: 'تفاصيل الحجز' },
              { num: 3, label: 'المراجعة والتأكيد' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s.num}
                </div>
                <div className="ml-3 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      step >= s.num ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
                {i < 2 && (
                  <div
                    className={`h-1 w-full mx-4 ${
                      step > s.num ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">البيانات الشخصية</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+968 9XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهوية / الإقامة *
                </label>
                <input
                  type="text"
                  required
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="رقم الهوية"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email || !formData.phone || !formData.idNumber}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
                <FaArrowLeft />
              </button>
            </div>
          )}

          {/* Step 2: Booking Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">تفاصيل الحجز</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  تاريخ البدء *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مدة الإيجار (بالأشهر) *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="3">3 أشهر</option>
                  <option value="6">6 أشهر</option>
                  <option value="12">سنة واحدة</option>
                  <option value="24">سنتان</option>
                  <option value="36">3 سنوات</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCreditCard className="inline mr-2" />
                  طريقة الدفع *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="card">بطاقة ائتمان</option>
                  <option value="cheque">شيك</option>
                  <option value="cash">نقدي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="أي ملاحظات أو طلبات خاصة..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-blue-900">ملخص التكلفة</p>
                    <p className="text-sm text-blue-700 mt-1">
                      الإيجار الشهري: {property.priceOMR} ريال × {formData.duration} شهر
                    </p>
                    <p className="text-lg font-bold text-blue-900 mt-2">
                      المجموع: {totalAmount} ريال
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaArrowRight />
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.startDate}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                  <FaArrowLeft />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">المراجعة والتأكيد</h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">بيانات الحجز</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">الاسم</p>
                    <p className="font-medium text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="font-medium text-gray-900">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رقم الهوية</p>
                    <p className="font-medium text-gray-900">{formData.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ البدء</p>
                    <p className="font-medium text-gray-900">{formData.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">المدة</p>
                    <p className="font-medium text-gray-900">{formData.duration} شهر</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 text-lg mb-4">ملخص الفاتورة</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">الإيجار الشهري</span>
                    <span className="font-medium">{property.priceOMR} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">المدة</span>
                    <span className="font-medium">{formData.duration} شهر</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-900">المجموع الكلي</span>
                    <span className="font-bold text-green-600 text-xl">{totalAmount} ريال</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  أوافق على{' '}
                  <InstantLink href="/terms" className="text-green-600 hover:underline">
                    الشروط والأحكام
                  </InstantLink>
                  {' '}و{' '}
                  <InstantLink href="/privacy" className="text-green-600 hover:underline">
                    سياسة الخصوصية
                  </InstantLink>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaArrowRight />
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.agreedToTerms || submitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      جاري الحجز...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      تأكيد الحجز والانتقال للدفع
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-900 font-medium mb-2">تحتاج مساعدة؟</p>
          <p className="text-sm text-blue-700 mb-4">
            فريقنا متاح على مدار الساعة لمساعدتك في إكمال الحجز
          </p>
          <div className="flex gap-3 justify-center">
            <InstantLink
              href="/contact"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              تواصل معنا
            </InstantLink>
            <a
              href={`https://wa.me/96800000000?text=${encodeURIComponent('أحتاج مساعدة في الحجز')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <FaPhone />
              اتصل بنا
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


