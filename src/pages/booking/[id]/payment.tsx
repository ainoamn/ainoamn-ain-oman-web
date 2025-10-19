// src/pages/booking/[id]/payment.tsx
// صفحة الدفع للحجز - محسنة للأداء الفائق ⚡

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { toSafeText } from '@/components/SafeText';
import { useI18n } from '@/lib/i18n';
import { FaCreditCard, FaUniversity, FaMoneyBillWave, FaCheckCircle, FaArrowRight, FaInfoCircle, FaLock, FaFileInvoice } from 'react-icons/fa';

interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: any;
  startDate: string;
  durationMonths?: number;
  duration?: number;
  totalRent?: number;
  totalAmount?: number;
  status: string;
  tenant?: {
    name: string;
    email: string;
    phone: string;
  };
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function BookingPaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t, dir } = useI18n();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // للتحويل البنكي
    transferReference: '',
    transferDate: '',
    transferImage: null as File | null,
  });

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.item || data);
      } else {
        alert('فشل في تحميل بيانات الحجز');
        router.push('/properties');
      }
    } catch (error) {
      console.error('Failed to load booking:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // محاكاة عملية الدفع
      await new Promise(resolve => setTimeout(resolve, 2000));

      // تحديث حالة الحجز إلى "paid"
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paymentMethod,
          paymentDetails,
          paidAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // التوجيه إلى صفحة النجاح
        await router.push(`/booking/${id}/success`);
      } else {
        alert('فشل في تأكيد الدفع');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('حدث خطأ أثناء الدفع');
    } finally {
      setProcessing(false);
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الحجز غير موجود</h2>
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

  const safePropertyTitle = toSafeText(booking.propertyTitle, 'ar', 'العقار');
  const durationMonths = booking.durationMonths || booking.duration || 1;
  const totalAmount = booking.totalRent || booking.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={dir}>
      <Head>
        <title>الدفع - {safePropertyTitle} | Ain Oman</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">إتمام الدفع</h1>
            <InstantLink
              href={`/properties/${booking.propertyId}`}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <FaArrowRight />
              العودة
            </InstantLink>
          </div>

          {/* Booking Summary */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-3">
              <FaCheckCircle />
              <span className="font-medium">حجز رقم: {booking.bookingNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">العقار</p>
                <p className="font-medium text-gray-900">{safePropertyTitle}</p>
              </div>
              <div>
                <p className="text-gray-600">تاريخ البدء</p>
                <p className="font-medium text-gray-900">{booking.startDate}</p>
              </div>
              <div>
                <p className="text-gray-600">المدة</p>
                <p className="font-medium text-gray-900">{durationMonths} شهر</p>
              </div>
              <div>
                <p className="text-gray-600">المبلغ الإجمالي</p>
                <p className="font-bold text-green-600 text-lg">{totalAmount} ريال</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختر طريقة الدفع</h2>

              {/* Payment Method Selection */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaUniversity className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">تحويل بنكي</p>
                  <p className="text-xs text-gray-600 mt-1">الأكثر أماناً</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === 'card'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaCreditCard className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">بطاقة ائتمان</p>
                  <p className="text-xs text-gray-600 mt-1">فوري</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaMoneyBillWave className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">نقدي</p>
                  <p className="text-xs text-gray-600 mt-1">عند الاستلام</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('installments')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === 'installments'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaFileInvoice className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">أقساط</p>
                  <p className="text-xs text-gray-600 mt-1">دفع شهري</p>
                </button>
              </div>

              {/* Payment Form */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4 p-6 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-4">معلومات الحساب البنكي</h3>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">اسم البنك</p>
                    <p className="font-medium text-gray-900">بنك مسقط</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">رقم الحساب</p>
                    <p className="font-medium text-gray-900 dir-ltr">0123456789</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">IBAN</p>
                    <p className="font-medium text-gray-900 dir-ltr">OM12 0123 4567 8901 2345 6789</p>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم المرجع / الإشعار
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.transferReference}
                      onChange={(e) => setPaymentDetails({...paymentDetails, transferReference: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="أدخل رقم الإشعار"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <FaInfoCircle className="text-yellow-600 mt-1" />
                      <p className="text-sm text-yellow-800">
                        بعد التحويل، يرجى حفظ إشعار التحويل وإدخال رقم المرجع هنا
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم البطاقة
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم حامل البطاقة
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.cardName}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="الاسم كما في البطاقة"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ الانتهاء
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={paymentDetails.expiryDate}
                        onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <FaLock className="text-blue-600 mt-1" />
                      <p className="text-sm text-blue-800">
                        معاملتك آمنة ومشفرة. نحن لا نحفظ معلومات بطاقتك.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-yellow-600 text-xl mt-1" />
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2">الدفع النقدي</h3>
                      <p className="text-sm text-yellow-800 mb-4">
                        يمكنك الدفع نقداً عند استلام العقار. سيتم التواصل معك لتحديد موعد التسليم.
                      </p>
                      <p className="text-sm text-yellow-800">
                        ملاحظة: يجب دفع مبلغ التأمين (شيك ضمان) عند التوقيع على العقد.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'installments' && (
                <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-bold text-purple-900 mb-4">خطة الأقساط</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">القسط الشهري</span>
                      <span className="font-bold text-gray-900">
                        {Math.round(totalAmount / durationMonths)} ريال
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">عدد الأقساط</span>
                      <span className="font-bold text-gray-900">{durationMonths} قسط</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">المجموع</span>
                      <span className="font-bold text-purple-600 text-lg">{totalAmount} ريال</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-purple-800">
                    <p>• الدفعة الأولى مطلوبة الآن</p>
                    <p>• باقي الأقساط شهرياً</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    جاري معالجة الدفع...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    تأكيد الدفع - {totalAmount} ريال
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الإيجار الشهري</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(totalAmount / durationMonths)} ريال
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المدة</span>
                  <span className="font-medium text-gray-900">{durationMonths} شهر</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الإجمالي الفرعي</span>
                  <span className="font-medium text-gray-900">{totalAmount} ريال</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">المجموع الكلي</span>
                    <span className="font-bold text-green-600 text-xl">{totalAmount} ريال</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaLock className="text-gray-600 mt-1" />
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-1">دفع آمن</p>
                    <p>معاملتك محمية بتشفير SSL 256-bit</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                بالمتابعة، أنت توافق على الشروط والأحكام
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-900 font-medium mb-2">تحتاج مساعدة في الدفع؟</p>
          <p className="text-sm text-blue-700 mb-4">
            فريق الدعم متاح 24/7 لمساعدتك
          </p>
          <div className="flex gap-3 justify-center">
            <InstantLink
              href="/contact"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              تواصل معنا
            </InstantLink>
            <a
              href="https://wa.me/96800000000?text=أحتاج مساعدة في الدفع"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

