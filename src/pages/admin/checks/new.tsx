// src/pages/admin/checks/new.tsx - إضافة شيك جديد (ذكي ✨)
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
    monthlyRent?: number;
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
    monthlyRent: number;
  };
}

export default function NewCheckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
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
    tenantEmail: '',
    unitId: '',
    unitNumber: '',
    buildingName: '',
    contractNumber: '',
    purpose: 'rent',
    description: ''
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
      console.error('Error loading data:', error);
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
          contractNumber: unit.currentTenant.contractNumber || '',
          amount: unit.currentTenant.monthlyRent?.toString() || formData.amount
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
          contractNumber: tenant.currentUnit.contractNumber,
          amount: tenant.currentUnit.monthlyRent.toString()
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
              <p className="text-sm text-gray-500 mt-1">اختر الوحدة أو المستأجر - سيتم ملء البيانات تلقائياً ✨</p>
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
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${(formData.unitId || formData.tenantId) ? 'bg-green-50 font-medium' : ''}`}
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

            {/* بيانات المستأجر - تُملأ تلقائياً */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 بيانات المستأجر</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
                  <input
                    type="text"
                    required
                    value={formData.tenantName}
                    readOnly={!!formData.unitId || !!formData.tenantId}
                    onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${(formData.unitId || formData.tenantId) ? 'bg-green-50 font-medium' : ''}`}
                    placeholder="أحمد محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
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
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                  <span className="text-2xl ml-2">💳</span>
                  معاينة الشيك
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">رقم الشيك:</span>
                    <span className="font-bold text-gray-900">{formData.checkNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">البنك:</span>
                    <span className="font-medium text-gray-900">{formData.bankName || 'غير محدد'}</span>
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
                  <div className="flex justify-between py-3 border-t-2 border-blue-300 mt-3">
                    <span className="text-lg font-bold text-gray-900">المبلغ:</span>
                    <span className="text-2xl font-bold text-green-600">{formData.amount} ر.ع</span>
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
