import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { FaLock, FaCreditCard, FaCalendarAlt, FaUser } from "react-icons/fa";

type PropertyInfo = {
  id: string;
  title?: string | { ar?: string; en?: string };
  priceOMR?: number;
  referenceNo?: string;
  location?: {
    province?: string;
    state?: string;
    village?: string;
  };
};

export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [bookingInfo, setBookingInfo] = useState({
    startDate: "",
    duration: 12,
    name: "",
    phone: "",
    email: "",
  });

  // بيانات بطاقة الدفع الافتراضية (وهمية)
  const [cardInfo, setCardInfo] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/25",
    cvv: "123",
    name: "Ahmed Al-Saidi"
  });

  useEffect(() => {
    if (!id) return;
    
    // جلب بيانات العقار
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${encodeURIComponent(String(id))}`);
        if (response.ok) {
          const data = await response.json();
          setProperty(data.item);
        } else {
          console.error("Failed to fetch property");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // التحقق من رقم الهاتف
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(bookingInfo.phone)) {
      newErrors.phone = "رقم الهاتف يجب أن يكون 8 أرقام";
    }
    
    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingInfo.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }
    
    // التحقق من الحقول المطلوبة
    if (!bookingInfo.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }
    
    if (!bookingInfo.startDate) {
      newErrors.startDate = "تاريخ البدء مطلوب";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setProcessing(true);
    
    // محاكاة عملية الدفع (في الواقع ستكون عملية حقيقية مع بوابة الدفع)
    try {
      // 1. توليد رقم الحجز من النظام
      const bookingNumberResponse = await fetch('/api/generate-booking-number');
      if (!bookingNumberResponse.ok) {
        throw new Error('فشل في توليد رقم الحجز');
      }
      
      const { bookingNumber } = await bookingNumberResponse.json();
      
      // 2. معالجة الدفع (وهمي)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. إنشاء الحجز
      const bookingData = {
        propertyId: id,
        startDate: bookingInfo.startDate,
        duration: bookingInfo.duration,
        customerInfo: {
          name: bookingInfo.name,
          phone: bookingInfo.phone,
          email: bookingInfo.email
        },
        totalAmount: property?.priceOMR ? property.priceOMR * bookingInfo.duration : 0,
        status: 'reserved', // محجوز بعد الدفع
        bookingNumber,
        propertyTitle: typeof property?.title === 'object' ? property.title.ar || property.title.en : property?.title,
        propertyReference: property?.referenceNo
      };
      
      // حفظ الحجز في localStorage (مؤقت)
      const existingBookings = JSON.parse(localStorage.getItem('propertyBookings') || '[]');
      const newBooking = {
        ...bookingData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      existingBookings.push(newBooking);
      localStorage.setItem('propertyBookings', JSON.stringify(existingBookings));
      
      // 4. تحديث حالة العقار إلى محجوز
      const existingProperties = JSON.parse(localStorage.getItem('properties') || '[]');
      const updatedProperties = existingProperties.map((p: any) => 
        p.id === id ? { ...p, status: 'reserved' } : p
      );
      localStorage.setItem('properties', JSON.stringify(updatedProperties));
      
      // 5. التوجيه إلى صفحة التأكيد
      router.push(`/properties/${encodeURIComponent(String(id))}/payment/success?bookingId=${newBooking.id}&bookingNumber=${bookingNumber}`);
    } catch (error) {
      alert('فشلت عملية الدفع: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
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

  if (!property) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-10 text-red-600">العقار غير موجود</div>
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
        <title>دفع وحجز العقار | عين عمان</title>
      </Head>
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link href={`/properties/${id}`} className="text-blue-600 hover:underline flex items-center">
            &larr; العودة إلى العقار
          </Link>
          <h1 className="text-2xl font-bold mx-auto">إكمال عملية الحجز والدفع</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCreditCard className="ml-2" /> معلومات الدفع
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم البطاقة</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="1234 5678 9012 3456"
                    value={cardInfo.number}
                    onChange={(e) => setCardInfo({...cardInfo, number: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="123"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم صاحب البطاقة</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ahmed Al-Saidi"
                    value={cardInfo.name}
                    onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUser className="ml-2" /> معلومات الحجز
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                    <input
                      type="date"
                      className={`w-full p-3 border rounded-lg ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                      value={bookingInfo.startDate}
                      onChange={(e) => setBookingInfo({...bookingInfo, startDate: e.target.value})}
                      required
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مدة الحجز (أشهر)</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      value={bookingInfo.duration}
                      onChange={(e) => setBookingInfo({...bookingInfo, duration: parseInt(e.target.value)})}
                    >
                      <option value={1}>1 شهر</option>
                      <option value={6}>6 أشهر</option>
                      <option value={12}>12 شهر</option>
                      <option value={24}>24 شهر</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="أحمد السعيدي"
                    value={bookingInfo.name}
                    onChange={(e) => setBookingInfo({...bookingInfo, name: e.target.value})}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="91234567"
                      value={bookingInfo.phone}
                      onChange={(e) => setBookingInfo({...bookingInfo, phone: e.target.value})}
                      required
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="example@email.com"
                      value={bookingInfo.email}
                      onChange={(e) => setBookingInfo({...bookingInfo, email: e.target.value})}
                      required
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-medium">العقار</h3>
                <p className="text-gray-600">{typeof property.title === 'object' ? property.title.ar || property.title.en : property.title}</p>
                <p className="text-sm text-gray-500">الرقم المرجعي: {property.referenceNo}</p>
                {property.location && (
                  <p className="text-sm text-gray-500">
                    الموقع: {[property.location.province, property.location.state, property.location.village].filter(Boolean).join(' - ')}
                  </p>
                )}
              </div>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>سعر الشهر</span>
                  <span>{property.priceOMR?.toFixed(3)} ر.ع</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>مدة الحجز</span>
                  <span>{bookingInfo.duration} أشهر</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>المجموع</span>
                  <span>{(property.priceOMR ? property.priceOMR * bookingInfo.duration : 0).toFixed(3)} ر.ع</span>
                </div>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>جاري المعالجة...</>
                ) : (
                  <>
                    <FaLock className="ml-2" />
                    دفع الآن
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                بيانات الدفع هذه وهمية لأغراض الاختبار فقط. لن يتم خصم أي مبالغ حقيقية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}