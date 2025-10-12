// src/pages/admin/checks/new.tsx - إضافة شيك جديد (ذكي)
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
  };
}

interface Building {
  id: string;
  buildingNo: string;
}

export default function NewCheckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  
  const [formData, setFormData] = useState({
    checkNumber: '',
    bankName: '',
    accountNumber: '',
    amount: '',
    issueDate: '',
    dueDate: '',
    tenantId: '',
    tenantName: '',
    tenantPhone: '',
    unitNumber: '',
    buildingId: '',
    buildingName: '',
    purpose: 'rent',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل الحجوزات للحصول على المستأجرين
      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.items || [];
        setBookings(bookingsArray);
      }

      // تحميل المباني
      const buildingsRes = await fetch('/api/admin/buildings');
      if (buildingsRes.ok) {
        const buildingsData = await buildingsRes.json();
        const buildingsArray = Array.isArray(buildingsData) ? buildingsData : buildingsData.items || buildingsData.buildings || [];
        setBuildings(buildingsArray);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleTenantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookingId = e.target.value;
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
      setFormData({
        ...formData,
        tenantId: booking.id,
        tenantName: booking.customerInfo?.name || '',
        tenantPhone: booking.customerInfo?.phone || ''
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
        buildingName: `مبنى رقم ${building.buildingNo}`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          status: 'pending',
          currency: 'OMR',
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('✅ تم إضافة الشيك بنجاح');
        router.push('/admin/checks');
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
        <title>إضافة شيك جديد - عين عُمان</title>
      </Head>

      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إضافة شيك جديد</h1>
              <p className="text-sm text-gray-500 mt-1">اختر المستأجر والمبنى من القوائم</p>
            </div>
            <Link href="/admin/checks" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              ← العودة
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* بيانات الشيك */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 بيانات الشيك</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الشيك *</label>
                  <input
                    type="text"
                    required
                    value={formData.checkNumber}
                    onChange={(e) => setFormData({...formData, checkNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123456"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الغرض *</label>
                  <select
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rent">إيجار</option>
                    <option value="deposit">تأمين</option>
                    <option value="maintenance">صيانة</option>
                    <option value="penalty">غرامة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم البنك *</label>
                  <select
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر البنك...</option>
                    <option value="بنك مسقط">بنك مسقط</option>
                    <option value="البنك الوطني العماني">البنك الوطني العماني</option>
                    <option value="بنك ظفار">بنك ظفار</option>
                    <option value="بنك صحار الدولي">بنك صحار الدولي</option>
                    <option value="بنك نزوى">بنك نزوى</option>
                    <option value="HSBC عمان">HSBC عمان</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الحساب</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإصدار *</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستأجر *</label>
                  <input
                    type="text"
                    required
                    value={formData.tenantName}
                    onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="أحمد محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={formData.tenantPhone}
                    onChange={(e) => setFormData({...formData, tenantPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="96812345678"
                  />
                </div>
              </div>
            </div>

            {/* المبنى والوحدة */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 المبنى والوحدة</h3>
              
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
                          مبنى رقم {building.buildingNo} - {building.id}
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

            {/* ملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ملاحظات إضافية..."
              />
            </div>

            {/* معاينة */}
            {formData.checkNumber && formData.amount && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">💳 معاينة الشيك</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الشيك:</span>
                    <span className="font-medium">{formData.checkNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">البنك:</span>
                    <span className="font-medium">{formData.bankName || 'غير محدد'}</span>
                  </div>
                  {formData.tenantName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المستأجر:</span>
                      <span className="font-medium">{formData.tenantName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>المبلغ:</span>
                    <span className="text-green-600">{formData.amount} ر.ع</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Link
                href="/admin/checks"
                className="flex-1 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : '💳 حفظ الشيك'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
