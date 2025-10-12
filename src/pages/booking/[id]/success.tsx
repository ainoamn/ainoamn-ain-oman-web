// src/pages/booking/[id]/success.tsx
// صفحة تأكيد الدفع الناجح

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { toSafeText } from '@/components/SafeText';
import { FaCheckCircle, FaDownload, FaPrint, FaWhatsapp, FaHome } from 'react-icons/fa';

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

export default function BookingSuccessPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Failed to load booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    const message = `تم تأكيد حجزك بنجاح! 🎉\nرقم الحجز: ${booking?.bookingNumber}\nالعقار: ${toSafeText(booking?.propertyTitle, 'ar')}\nالمبلغ: ${booking?.totalRent} ريال`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
  const tenantName = booking.tenant?.name || booking.customerInfo?.name || 'المستأجر';
  const durationMonths = booking.durationMonths || booking.duration || 1;
  const totalAmount = booking.totalRent || booking.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <Head>
        <title>تم الحجز بنجاح! | Ain Oman</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <FaCheckCircle className="text-6xl text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            تم الحجز بنجاح! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            تم تأكيد دفعتك وحجزك بنجاح
          </p>

          {/* Booking Details */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              تفاصيل الحجز
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">رقم الحجز</span>
                <span className="font-bold text-green-600 text-xl">{booking.bookingNumber}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">العقار</span>
                <span className="font-medium text-gray-900">{safePropertyTitle}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">المستأجر</span>
                <span className="font-medium text-gray-900">{tenantName}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">تاريخ البدء</span>
                <span className="font-medium text-gray-900">{booking.startDate}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">المدة</span>
                <span className="font-medium text-gray-900">{durationMonths} شهر</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-medium text-lg">المبلغ المدفوع</span>
                <span className="font-bold text-green-600 text-2xl">{totalAmount} ريال</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 text-right">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">الخطوات التالية</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>سيتم إرسال تأكيد الحجز إلى بريدك الإلكتروني</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>سيتواصل معك فريقنا خلال 24 ساعة لترتيب معاينة العقار</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>يمكنك تتبع حالة حجزك من لوحة التحكم</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>سيتم إرسال تفاصيل العقد قريباً للتوقيع الإلكتروني</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-3 bg-gray-800 text-white py-4 rounded-xl hover:bg-gray-900 transition-colors font-medium"
            >
              <FaPrint />
              طباعة التفاصيل
            </button>

            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-3 bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              <FaWhatsapp />
              مشاركة عبر واتساب
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <InstantLink
              href="/dashboard/owner"
              className="flex-1 flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors font-bold text-lg"
            >
              <FaHome />
              لوحة التحكم
            </InstantLink>

            <InstantLink
              href={`/properties/${booking.propertyId}`}
              className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg"
            >
              العودة إلى العقار
            </InstantLink>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">لديك أسئلة؟ نحن هنا للمساعدة!</p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="tel:+96800000000" className="text-green-600 hover:text-green-700 font-medium">
                📞 اتصل بنا
              </a>
              <a href="mailto:support@ainoman.om" className="text-green-600 hover:text-green-700 font-medium">
                📧 راسلنا
              </a>
              <InstantLink href="/contact" className="text-green-600 hover:text-green-700 font-medium">
                💬 دعم فني
              </InstantLink>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>شكراً لاختيارك عين عُمان 💚</p>
          <p className="mt-2">منصة العقارات الذكية في سلطنة عُمان</p>
        </div>
      </div>
    </div>
  );
}

