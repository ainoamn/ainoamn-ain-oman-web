import Head from "next/head";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaFileContract, FaHome } from "react-icons/fa";

type Booking = {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle: string;
  propertyReference: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'reserved' | 'leased' | 'cancelled';
  createdAt: string;
  contractSigned: boolean;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
};

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = () => {
      try {
        // جلب الحجوزات من localStorage
        const storedBookings = JSON.parse(localStorage.getItem('propertyBookings') || '[]');
        // في الواقع، يجب تصفية الحجوزات الخاصة بالمستخدم الحالي
        // ولكن للتبسيط سنعرض جميع الحجوزات
        setBookings(storedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const signContract = async (bookingId: string) => {
    try {
      // محاكاة توقيع العقد
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // تحديث حالة الحجز إلى مؤجر
      const storedBookings = JSON.parse(localStorage.getItem('propertyBookings') || '[]');
      const updatedBookings = storedBookings.map((booking: Booking) => 
        booking.id === bookingId ? { ...booking, status: 'leased', contractSigned: true } : booking
      );
      localStorage.setItem('propertyBookings', JSON.stringify(updatedBookings));
      
      // تحديث حالة العقار إلى مؤجر
      const booking = storedBookings.find((b: Booking) => b.id === bookingId);
      if (booking) {
        const existingProperties = JSON.parse(localStorage.getItem('properties') || '[]');
        const updatedProperties = existingProperties.map((p: any) => 
          p.id === booking.propertyId ? { ...p, status: 'leased' } : p
        );
        localStorage.setItem('properties', JSON.stringify(updatedProperties));
      }
      
      // تحديث الواجهة
      setBookings(updatedBookings);
      
      alert('تم توقيع العقد بنجاح وتغيير حالة العقار إلى مؤجر');
    } catch (error) {
      alert('فشل في توقيع العقد: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-10">جاري تحميل الحجوزات...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>حجوزاتي | عين عمان</title>
      </Head>
      
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">حجوزاتي</h1>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد حجوزات</h2>
            <p className="text-gray-600 mb-4">لم تقم بحجز أي عقار حتى الآن.</p>
            <Link 
              href="/properties" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              استعرض العقارات
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/4 bg-gray-200 flex items-center justify-center">
                    <FaHome className="text-4xl text-gray-400" />
                  </div>
                  
                  <div className="p-6 md:w-3/4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">{booking.propertyTitle}</h2>
                        <p className="text-gray-600">رقم الحجز: {booking.bookingNumber}</p>
                        <p className="text-gray-600">الرقم المرجعي: {booking.propertyReference}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'leased' ? 'bg-green-100 text-green-800' :
                        booking.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'leased' ? 'مؤجر' :
                         booking.status === 'reserved' ? 'محجوز' :
                         booking.status === 'pending' ? 'قيد المراجعة' : 'ملغي'}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600 flex items-center">
                          <FaCalendarAlt className="ml-2" />
                          تاريخ البدء: {new Date(booking.startDate).toLocaleDateString('ar-OM')}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <FaCalendarAlt className="ml-2" />
                          تاريخ الانتهاء: {new Date(new Date(booking.startDate).setMonth(new Date(booking.startDate).getMonth() + booking.duration)).toLocaleDateString('ar-OM')}
                        </p>
                        <p className="text-gray-600">المدة: {booking.duration} أشهر</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">المبلغ الإجمالي: {booking.totalAmount.toFixed(3)} ر.ع</p>
                        <p className="text-gray-600 flex items-center">
                          <FaClock className="ml-2" />
                          تاريخ الحجز: {new Date(booking.createdAt).toLocaleDateString('ar-OM')}
                        </p>
                        <p className="text-gray-600">البريد الإلكتروني: {booking.customerInfo.email}</p>
                        <p className="text-gray-600">الهاتف: {booking.customerInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link 
                        href={`/properties/${booking.propertyId}`}
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <FaHome className="ml-2" />
                        عرض العقار
                      </Link>
                      
                      {booking.status === 'reserved' && !booking.contractSigned && (
                        <button
                          onClick={() => signContract(booking.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <FaFileContract className="ml-2" />
                          توقيع العقد
                        </button>
                      )}
                      
                      {booking.contractSigned && (
                        <span className="text-green-600 flex items-center">
                          <FaCheckCircle className="ml-2" />
                          تم توقيع العقد
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}