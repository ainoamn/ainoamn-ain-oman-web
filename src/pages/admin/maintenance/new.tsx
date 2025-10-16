// src/pages/admin/maintenance/new.tsx - إضافة طلب صيانة جديد (ذكي ✨)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Unit {
  id: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  currentTenant?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    contractNumber?: string;
  };
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  currentUnit?: {
    unitId: string;
    unitNumber: string;
    buildingId: string;
    buildingName: string;
    contractNumber: string;
  };
}

export default function NewMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'normal',
    tenantId: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    unitId: '',
    unitNumber: '',
    buildingName: '',
    contractNumber: '',
    estimatedCost: '',
    scheduledDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل الوحدات مع المستأجرين
      const unitsRes = await fetch('/api/admin/units');
      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(unitsData.units || []);
      }

      // تحميل المستأجرين
      const tenantsRes = await fetch('/api/admin/tenants');
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData.tenants || []);
      }
    } catch (error) {

    }
  };

  // ⚡ عند اختيار الوحدة → يتم ملء بيانات المستأجر تلقائياً
  const handleUnitSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = e.target.value;
    const unit = units.find(u => u.id === unitId);
    
    if (unit) {
      if (unit.currentTenant) {
        setFormData({
          ...formData,
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          buildingName: unit.buildingName,
          tenantId: unit.currentTenant.id,
          tenantName: unit.currentTenant.name,
          tenantPhone: unit.currentTenant.phone,
          tenantEmail: unit.currentTenant.email || '',
          contractNumber: unit.currentTenant.contractNumber || ''
        });
      } else {
        setFormData({
          ...formData,
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          buildingName: unit.buildingName,
          tenantId: '',
          tenantName: '',
          tenantPhone: '',
          tenantEmail: '',
          contractNumber: ''
        });
      }
    }
  };

  // ⚡ عند اختيار المستأجر → يتم ملء بيانات الوحدة تلقائياً
  const handleTenantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = e.target.value;
    const tenant = tenants.find(t => t.id === tenantId);
    
    if (tenant) {
      if (tenant.currentUnit) {
        setFormData({
          ...formData,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantPhone: tenant.phone,
          tenantEmail: tenant.email || '',
          unitId: tenant.currentUnit.unitId,
          unitNumber: tenant.currentUnit.unitNumber,
          buildingName: tenant.currentUnit.buildingName,
          contractNumber: tenant.currentUnit.contractNumber
        });
      } else {
        setFormData({
          ...formData,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantPhone: tenant.phone,
          tenantEmail: tenant.email || '',
          unitId: '',
          unitNumber: '',
          buildingName: '',
          contractNumber: ''
        });
      }
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
              <p className="text-sm text-gray-500 mt-1">اختر الوحدة أو المستأجر - سيتم ملء البيانات تلقائياً ✨</p>
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
            
            {/* 🌟 اختيار ذكي */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5">
              <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center">
                <span className="text-2xl ml-2">⚡</span>
                ملء ذكي تلقائي - اختر الوحدة أو المستأجر
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🏢 اختر الوحدة</label>
                  <select
                    value={formData.unitId}
                    onChange={handleUnitSelect}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="">اختر وحدة...</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNumber} - {unit.buildingName} 
                        {unit.currentTenant ? ` (${unit.currentTenant.name})` : ' (فارغة)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">✨ سيتم ملء بيانات المستأجر تلقائياً</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">👤 أو اختر المستأجر</label>
                  <select
                    value={formData.tenantId}
                    onChange={handleTenantSelect}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="">اختر مستأجر...</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.phone}
                        {tenant.currentUnit ? ` (${tenant.currentUnit.unitNumber})` : ' (بدون وحدة)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">✨ سيتم ملء بيانات الوحدة تلقائياً</p>
                </div>
              </div>
            </div>

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
                  placeholder="مثال: تسرب في الحمام"
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

            {/* بيانات المستأجر - تُملأ تلقائياً */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 بيانات المستأجر</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                  <input
                    type="text"
                    value={formData.tenantName}
                    readOnly={!!formData.unitId || !!formData.tenantId}
                    onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${(formData.unitId || formData.tenantId) ? 'bg-green-50 font-medium' : ''}`}
                    placeholder="أحمد محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.tenantPhone}
                    readOnly={!!formData.unitId || !!formData.tenantId}
                    onChange={(e) => setFormData({...formData, tenantPhone: e.target.value})}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${(formData.unitId || formData.tenantId) ? 'bg-green-50 font-medium' : ''}`}
                    placeholder="96812345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.tenantEmail}
                    readOnly={!!formData.unitId || !!formData.tenantId}
                    onChange={(e) => setFormData({...formData, tenantEmail: e.target.value})}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${(formData.unitId || formData.tenantId) ? 'bg-green-50' : ''}`}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* الوحدة - تُملأ تلقائياً */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 الوحدة والمبنى</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الوحدة</label>
                  <input
                    type="text"
                    value={formData.unitNumber}
                    readOnly={!!formData.unitId || !!formData.tenantId}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${(formData.unitId || formData.tenantId) ? 'bg-green-50 font-medium' : ''}`}
                    placeholder="A-101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المبنى</label>
                  <input
                    type="text"
                    value={formData.buildingName}
                    readOnly={!!formData.unitId || !!formData.tenantId}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${(formData.unitId || formData.tenantId) ? 'bg-green-50 font-medium' : ''}`}
                    placeholder="برج المجد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم العقد</label>
                  <input
                    type="text"
                    value={formData.contractNumber}
                    readOnly={!!formData.unitId || !!formData.tenantId}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${(formData.unitId || formData.tenantId) ? 'bg-green-50 font-medium' : ''}`}
                    placeholder="C-2025-001"
                  />
                </div>
              </div>
              {(formData.unitId || formData.tenantId) && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <span className="ml-2">✅</span>
                  تم ملء البيانات تلقائياً من النظام
                </p>
              )}
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
              <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl p-5 border-2 border-orange-200">
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                  <span className="text-2xl ml-2">🔧</span>
                  معاينة طلب الصيانة
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">العنوان:</span>
                    <span className="font-bold text-gray-900">{formData.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">الفئة:</span>
                    <span className="font-medium text-gray-900">{formData.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">الأولوية:</span>
                    <span className="font-medium text-gray-900">{formData.priority}</span>
                  </div>
                  {formData.tenantName && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">المستأجر:</span>
                      <span className="font-medium text-gray-900">{formData.tenantName}</span>
                    </div>
                  )}
                  {formData.unitNumber && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">الوحدة:</span>
                      <span className="font-medium text-gray-900">{formData.unitNumber} - {formData.buildingName}</span>
                    </div>
                  )}
                  {formData.estimatedCost && (
                    <div className="flex justify-between py-3 border-t-2 border-orange-300 mt-3">
                      <span className="text-lg font-bold text-gray-900">التكلفة المتوقعة:</span>
                      <span className="text-2xl font-bold text-orange-600">{formData.estimatedCost} ر.ع</span>
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
