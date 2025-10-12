// src/pages/admin/maintenance/new.tsx - إضافة طلب صيانة جديد (ذكي)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Property {
  id: string;
  title: string | { ar?: string; en?: string };
}

interface Building {
  id: string;
  buildingNo: string;
  address?: string;
}

interface Booking {
  id: string;
  propertyId: string;
  customerInfo: {
    name: string;
    phone: string;
  };
}

export default function NewMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyId: '',
    propertyTitle: '',
    buildingId: '',
    buildingNo: '',
    unitNumber: '',
    category: 'plumbing',
    priority: 'normal',
    tenantName: '',
    tenantPhone: '',
    estimatedCost: '',
    scheduledDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل العقارات
      const propsRes = await fetch('/api/properties');
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        const propsArray = Array.isArray(propsData) ? propsData : propsData.items || [];
        setProperties(propsArray);
      }

      // تحميل المباني
      const buildingsRes = await fetch('/api/admin/buildings');
      if (buildingsRes.ok) {
        const buildingsData = await buildingsRes.json();
        const buildingsArray = Array.isArray(buildingsData) ? buildingsData : buildingsData.items || buildingsData.buildings || [];
        setBuildings(buildingsArray);
      }

      // تحميل الحجوزات للمستأجرين
      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.items || [];
        setBookings(bookingsArray);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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

  const handleBuildingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const buildingId = e.target.value;
    const building = buildings.find(b => b.id === buildingId);
    
    if (building) {
      setFormData({
        ...formData,
        buildingId: buildingId,
        buildingNo: building.buildingNo
      });
    }
  };

  const handleTenantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookingId = e.target.value;
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
      setFormData({
        ...formData,
        tenantName: booking.customerInfo?.name || '',
        tenantPhone: booking.customerInfo?.phone || '',
        propertyId: booking.propertyId || formData.propertyId
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : 0,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('✅ تم إضافة طلب الصيانة بنجاح');
        router.push('/admin/maintenance');
      } else {
        alert('❌ حدث خطأ');
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
        <title>إضافة طلب صيانة جديد - عين عُمان</title>
      </Head>

      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إضافة طلب صيانة جديد</h1>
              <p className="text-sm text-gray-500 mt-1">اختر العقار والمستأجر من القوائم</p>
            </div>
            <Link href="/admin/maintenance" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              ← العودة
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* معلومات الطلب */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 معلومات الطلب</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الطلب *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="تسرب في الحمام"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="plumbing">🚰 سباكة</option>
                    <option value="electrical">⚡ كهرباء</option>
                    <option value="ac">❄️ تكييف</option>
                    <option value="painting">🎨 دهان</option>
                    <option value="carpentry">🔨 نجارة</option>
                    <option value="cleaning">🧹 تنظيف</option>
                    <option value="general">⚙️ عام</option>
                    <option value="other">📦 أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية *</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 عادي</option>
                    <option value="normal">🟡 متوسط</option>
                    <option value="high">🟠 عالي</option>
                    <option value="urgent">🔴 عاجل</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف التفصيلي *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف تفصيلي للمشكلة..."
                />
              </div>
            </div>

            {/* الموقع */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 الموقع</h3>
              
              {properties.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">العقار</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {buildings.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المبنى</label>
                    <select
                      value={formData.buildingId}
                      onChange={handleBuildingSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">اختر مبنى...</option>
                      {buildings.map(building => (
                        <option key={building.id} value={building.id}>
                          مبنى رقم {building.buildingNo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الوحدة</label>
                  <input
                    type="text"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="A-101"
                  />
                </div>
              </div>
            </div>

            {/* المستأجر */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 المستأجر</h3>
              
              {bookings.length > 0 && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <label className="block text-sm font-bold text-blue-900 mb-2">⚡ اختيار سريع</label>
                  <select
                    onChange={handleTenantSelect}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">اختر مستأجر من الحجوزات...</option>
                    {bookings.map(booking => (
                      <option key={booking.id} value={booking.id}>
                        {booking.customerInfo?.name} - {booking.customerInfo?.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستأجر</label>
                  <input
                    type="text"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="أحمد محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.tenantPhone}
                    onChange={(e) => setFormData({...formData, tenantPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="96812345678"
                  />
                </div>
              </div>
            </div>

            {/* التكلفة والموعد */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 التكلفة والموعد</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التكلفة المتوقعة (ر.ع)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الموعد المقترح</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* معاينة */}
            {formData.title && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">🔧 معاينة الطلب</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">العنوان:</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الفئة:</span>
                    <span className="font-medium">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الأولوية:</span>
                    <span className="font-medium">{formData.priority}</span>
                  </div>
                  {formData.propertyTitle && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">العقار:</span>
                      <span className="font-medium">{formData.propertyTitle}</span>
                    </div>
                  )}
                  {formData.tenantName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المستأجر:</span>
                      <span className="font-medium">{formData.tenantName}</span>
                    </div>
                  )}
                  {formData.estimatedCost && (
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                      <span>التكلفة المتوقعة:</span>
                      <span className="text-orange-600">{formData.estimatedCost} ر.ع</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Link
                href="/admin/maintenance"
                className="flex-1 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : '🔧 حفظ طلب الصيانة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
