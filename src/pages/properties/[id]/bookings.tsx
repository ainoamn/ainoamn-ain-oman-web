import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaFileContract, FaEye } from "react-icons/fa";

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

export default function PropertyBookingsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    // جلب بيانات العقار
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${encodeURIComponent(String(id))}`);
        if (response.ok) {
          const data = await response.json();
          setProperty(data.item);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      }
    };

    // جلب حجوزات العقار
    const fetchBookings = () => {
      try {
        // جلب الحجوزات من localStorage
        const storedBookings = JSON.parse(localStorage.getItem('propertyBookings') || '[]');
        // تصفية الحجوزات الخاصة بالعقار المحدد
        const propertyBookings = storedBookings.filter((booking: Booking) => booking.propertyId === id);
        setBookings(propertyBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    fetchBookings();
  }, [id]);

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      // تحديث حالة الحجز في localStorage
      const storedBookings = JSON.parse(localStorage.getItem('propertyBookings') || '[]');
      const updatedBookings = storedBookings.map((booking: Booking) => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      localStorage.setItem('propertyBookings', JSON.stringify(updatedBookings));
      
      // تحديث الواجهة
      setBookings(updatedBookings.filter((booking: Booking) => booking.propertyId === id));
      
      // إذا تم تغيير الحالة إلى 'leased'، قم بتحديث حالة العقار أيضًا
      if (newStatus === 'leased') {
        const existingProperties = JSON.parse(localStorage.getItem('properties') || '[]');
        const updatedProperties = existingProperties.map((p: any) => 
          p.id === id ? { ...p, status: 'leased' } : p
        );
        localStorage.setItem('properties', JSON.stringify(updatedProperties));
      }
      
      alert('تم تحديث حالة الحجز بنجاح');
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert('فشل في تحديث حالة الحجز');
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
        <title>حجوزات العقار | عين عمان</title>
      </Head>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">حجوزات العقار</h1>
            {property && (
              <p className="text-gray-600">
                {typeof property.title === 'object' ? property.title.ar || property.title.en : property.title}
                {property.referenceNo && ` - الرقم المرجعي: ${property.referenceNo}`}
              </p>
            )}
          </div>
          <Link 
            href={`/properties/${id}`}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center"
          >
            <FaEye className="ml-2" />
            عرض العقار
          </Link>
        </div>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد حجوزات</h2>
            <p className="text-gray-600">لم يتم حجز هذا العقار حتى الآن.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">الحجز رقم: {booking.bookingNumber}</h2>
                      <p className="text-gray-600">المستأجر: {booking.customerInfo.name}</p>
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
                    <div className="flex gap-2">
                      {booking.status === 'reserved' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'leased')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                          >
                            <FaFileContract className="ml-2" />
                            تأكيد التأجير
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            إلغاء الحجز
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'leased' && (
                        <span className="text-green-600 flex items-center">
                          <FaCheckCircle className="ml-2" />
                          تم تأجير العقار
                        </span>
                      )}
                      
                      {booking.status === 'cancelled' && (
                        <span className="text-red-600 flex items-center">
                          <FaTimesCircle className="ml-2" />
                          تم إلغاء الحجز
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      href={`/profile/bookings/${booking.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      عرض تفاصيل الحجز
                    </Link>
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