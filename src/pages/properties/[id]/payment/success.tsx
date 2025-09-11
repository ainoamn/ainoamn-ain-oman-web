// src/pages/properties/[id]/payment/success.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { FaCheckCircle, FaPrint, FaDownload, FaCalendarAlt, FaUser, FaHome } from "react-icons/fa";

type BookingInfo = {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalAmount: number;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
};

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { id, bookingId, bookingNumber } = router.query;
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId && !bookingNumber) return;
    
    // جلب بيانات الحجز
    const fetchBooking = async () => {
      try {
        // محاكاة بيانات الحجز (في الواقع سيتم جلبها من API)
        const mockBooking: BookingInfo = {
          id: bookingId as string,
          bookingNumber: bookingNumber as string,
          propertyId: id as string,
          propertyTitle: "شقة فاخرة في القرم",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          duration: 12,
          totalAmount: 12000,
          customerInfo: {
            name: "أحمد السعيدي",
            phone: "+96812345678",
            email: "ahmed@example.com"
          },
          createdAt: new Date().toISOString()
        };
        
        setBooking(mockBooking);
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, bookingNumber, id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // محاكاة تحميل الإيصال كPDF
    alert("سيتم تحميل الإيصال كملف PDF");
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-10">جاري التحميل...</div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-10 text-red-600">الحجز غير موجود</div>
          <Link href="/properties" className="text-blue-600 hover:underline">
            العودة إلى قائمة العقارات
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>تمت عملية الدفع بنجاح | عين عمان</title>
      </Head>
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-8">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">تمت عملية الدفع بنجاح</h1>
            <p className="text-gray-600">تم حجز العقار بنجاح وسيتم التواصل معك خلال 24 ساعة لإكمال الإجراءات وتوقيع العقد.</p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">إيصال الدفع</h2>
                <p className="text-gray-500">رقم الحجز: {booking.bookingNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">تاريخ الإصدار: {new Date(booking.createdAt).toLocaleDateString('ar-OM')}</p>
                <p className="text-gray-500">حالة الدفع: مكتمل</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FaHome className="ml-2" /> معلومات العقار
                </h3>
                <p className="text-gray-700">{booking.propertyTitle}</p>
                <p className="text-gray-600">رقم المرجع: {id}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FaUser className="ml-2" /> معلومات المستأجر
                </h3>
                <p className="text-gray-700">{booking.customerInfo.name}</p>
                <p className="text-gray-600">{booking.customerInfo.phone}</p>
                <p className="text-gray-600">{booking.customerInfo.email}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <FaCalendarAlt className="ml-2" /> معلومات الحجز
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600">تاريخ البدء</p>
                  <p className="font-semibold">{new Date(booking.startDate).toLocaleDateString('ar-OM')}</p>
                </div>
                <div>
                  <p className="text-gray-600">مدة الحجز</p>
                  <p className="font-semibold">{booking.duration} أشهر</p>
                </div>
                <div>
                  <p className="text-gray-600">المبلغ الإجمالي</p>
                  <p className="font-semibold">{booking.totalAmount.toFixed(3)} ر.ع</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">المجموع النهائي</span>
                <span className="text-lg font-semibold">{booking.totalAmount.toFixed(3)} ر.ع</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FaPrint className="ml-2" />
                طباعة الإيصال
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <FaDownload className="ml-2" />
                تحميل PDF
              </button>
            </div>
            
            <div className="flex gap-3">
              <Link 
                href="/profile/bookings" 
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                عرض الحجوزات
              </Link>
              <Link 
                href="/properties" 
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                استعراض المزيد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}