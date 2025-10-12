// src/pages/admin/invoices/new.tsx - إضافة فاتورة جديدة (ذكية)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Booking {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  totalAmount?: number;
}

interface Property {
  id: string;
  title: string | { ar?: string; en?: string };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    propertyId: '',
    propertyTitle: '',
    amount: '',
    dueDate: '',
    description: '',
    type: 'rent'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل الحجوزات
      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.items || [];
        setBookings(bookingsArray);
      }

      // تحميل العقارات
      const propsRes = await fetch('/api/properties');
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        const propsArray = Array.isArray(propsData) ? propsData : propsData.items || [];
        setProperties(propsArray);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleBookingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookingId = e.target.value;
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
      setSelectedBooking(booking);
      const propertyTitle = typeof booking.propertyTitle === 'string' 
        ? booking.propertyTitle 
        : (booking.propertyTitle as any)?.ar || (booking.propertyTitle as any)?.en || booking.propertyId;
      
      setFormData({
        ...formData,
        customerName: booking.customerInfo?.name || '',
        customerPhone: booking.customerInfo?.phone || '',
        customerEmail: booking.customerInfo?.email || '',
        propertyId: booking.propertyId || '',
        propertyTitle: propertyTitle,
        amount: booking.totalAmount?.toString() || ''
      });
    }
  };

  const handlePropertySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    const property = properties.find(p => p.id === propertyId);
    
    if (property) {
      const title = typeof property.title === 'string' 
        ? property.title 
        : property.title?.ar || property.title?.en || propertyId;
      
      setFormData({
        ...formData,
        propertyId: propertyId,
        propertyTitle: title
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          status: 'unpaid',
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('✅ تم إنشاء الفاتورة بنجاح');
        router.push('/admin/invoices');
      } else {
        alert('❌ حدث خطأ في إنشاء الفاتورة');
      }
    } catch (error) {
      alert('❌ حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>إضافة فاتورة جديدة - عين عُمان</title>
      </Head>

      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إضافة فاتورة جديدة</h1>
              <p className="text-sm text-gray-500 mt-1">اختر من الحجوزات أو أدخل البيانات يدوياً</p>
            </div>
            <Link href="/admin/invoices" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              ← العودة
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* اختيار سريع من الحجوزات */}
            {bookings.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-bold text-blue-900 mb-2">⚡ ملء سريع من الحجوزات</label>
                <select
                  onChange={handleBookingSelect}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">اختر حجز لملء البيانات تلقائياً...</option>
                  {bookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.id} - {booking.customerInfo?.name} - {booking.propertyId}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الفاتورة *</label>
                <input
                  type="text"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="INV-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ (ر.ع) *</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="100.000"
                />
              </div>
            </div>

            {/* بيانات العميل */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 بيانات العميل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="أحمد محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="96812345678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* العقار */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 العقار</h3>
              {properties.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">اختيار العقار</label>
                  <select
                    value={formData.propertyId}
                    onChange={handlePropertySelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر عقار...</option>
                    {properties.map(property => {
                      const title = typeof property.title === 'string' 
                        ? property.title 
                        : property.title?.ar || property.title?.en || property.id;
                      return (
                        <option key={property.id} value={property.id}>
                          {property.id} - {title}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم العقار</label>
                <input
                  type="text"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="P-20251005183036"
                />
              </div>
            </div>

            {/* تفاصيل الفاتورة */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 تفاصيل الفاتورة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع الفاتورة *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rent">إيجار</option>
                    <option value="deposit">تأمين</option>
                    <option value="maintenance">صيانة</option>
                    <option value="penalty">غرامة</option>
                    <option value="utilities">مرافق</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الاستحقاق *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="تفاصيل الفاتورة..."
                />
              </div>
            </div>

            {/* معاينة */}
            {(formData.customerName || formData.amount) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">📋 معاينة الفاتورة</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الفاتورة:</span>
                    <span className="font-medium">{formData.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">العميل:</span>
                    <span className="font-medium">{formData.customerName}</span>
                  </div>
                  {formData.propertyTitle && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">العقار:</span>
                      <span className="font-medium">{formData.propertyTitle}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>المبلغ الإجمالي:</span>
                    <span className="text-blue-600">{formData.amount} ر.ع</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Link
                href="/admin/invoices"
                className="flex-1 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : '💾 حفظ الفاتورة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
