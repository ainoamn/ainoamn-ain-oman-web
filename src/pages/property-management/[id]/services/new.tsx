// src/pages/property-management/[id]/services/new.tsx - صفحة إضافة خدمة جديدة
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import InstantLink from '@/components/InstantLink';

interface Property {
  id: string;
  titleAr: string;
  address: string;
  buildingType: 'single' | 'multi';
  units?: any[];
}

interface ServiceFormData {
  serviceType: string;
  serviceName: string;
  accountNumber: string;
  provider: string;
  providerContact: string;
  startDate: string;
  endDate: string;
  monthlyAmount: string;
  currency: string;
  unitId?: string;
  tenantId?: string;
  isReimbursable: boolean;
  notes: string;
}

export default function NewService() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ServiceFormData>({
    serviceType: '',
    serviceName: '',
    accountNumber: '',
    provider: '',
    providerContact: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlyAmount: '',
    currency: 'OMR',
    unitId: '',
    tenantId: '',
    isReimbursable: true,
    notes: ''
  });

  const serviceTypes = [
    { value: 'electricity', label: 'كهرباء', icon: '⚡' },
    { value: 'water', label: 'ماء', icon: '💧' },
    { value: 'internet', label: 'إنترنت', icon: '🌐' },
    { value: 'gas', label: 'غاز', icon: '🔥' },
    { value: 'maintenance', label: 'صيانة', icon: '🔧' },
    { value: 'cleaning', label: 'تنظيف', icon: '🧹' },
    { value: 'security', label: 'أمن', icon: '🔒' },
    { value: 'other', label: 'أخرى', icon: '⚙️' }
  ];

  useEffect(() => {
    if (id) {
      fetchPropertyData();
    }
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data.property);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/property-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          propertyId: id,
          ownerId: 'khalid.alabri@ainoman.om', // TODO: Get from auth
          monthlyAmount: parseFloat(formData.monthlyAmount),
          status: 'active',
          isOverdue: false,
          overdueAmount: 0,
          lastPaymentDate: formData.startDate,
          nextDueDate: formData.startDate
        }),
      });

      if (response.ok) {
        router.push(`/property-management/${id}?tab=services`);
      } else {
        console.error('Error creating service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات العقار...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">العقار غير موجود</h1>
          <InstantLink href="/dashboard/property-owner" className="text-blue-600 hover:underline">
            العودة للوحة التحكم
          </InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>إضافة خدمة جديدة - {property.titleAr}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* الشريط العلوي */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <InstantLink 
                  href={`/property-management/${id}?tab=services`} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl">←</span>
                </InstantLink>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إضافة خدمة جديدة</h1>
                  <p className="text-sm text-gray-500">{property.titleAr} - {property.address}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* النموذج */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* نوع الخدمة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الخدمة *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {serviceTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        handleInputChange('serviceType', type.value);
                        if (!formData.serviceName) {
                          handleInputChange('serviceName', type.label);
                        }
                      }}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        formData.serviceType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-2xl block mb-2">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* اسم الخدمة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الخدمة *
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => handleInputChange('serviceName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: كهرباء المبنى الرئيسي"
                  required
                />
              </div>

              {/* رقم الحساب */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الحساب *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="رقم الحساب لدى المزود"
                  required
                />
              </div>

              {/* المزود */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المزود *
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => handleInputChange('provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: شركة كهرباء مسقط"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم التواصل
                  </label>
                  <input
                    type="text"
                    value={formData.providerContact}
                    onChange={(e) => handleInputChange('providerContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="رقم الهاتف أو البريد الإلكتروني"
                  />
                </div>
              </div>

              {/* التواريخ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البداية *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* المبلغ والعملة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المبلغ الشهري *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyAmount}
                    onChange={(e) => handleInputChange('monthlyAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العملة
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="OMR">ريال عماني (OMR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EUR">يورو (EUR)</option>
                  </select>
                </div>
              </div>

              {/* الوحدة (إذا كان المبنى متعدد الوحدات) */}
              {property.buildingType === 'multi' && property.units && property.units.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوحدة (اختياري)
                  </label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => handleInputChange('unitId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">جميع الوحدات</option>
                    {property.units.map((unit: any) => (
                      <option key={unit.id} value={unit.id}>
                        الوحدة {unit.unitNo || unit.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* قابل للاسترداد */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isReimbursable"
                  checked={formData.isReimbursable}
                  onChange={(e) => handleInputChange('isReimbursable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isReimbursable" className="mr-2 block text-sm text-gray-700">
                  قابل للاسترداد من المستأجر
                </label>
              </div>

              {/* الملاحظات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أي ملاحظات إضافية حول الخدمة..."
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <InstantLink
                  href={`/property-management/${id}?tab=services`}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </InstantLink>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الحفظ...
                    </span>
                  ) : (
                    'حفظ الخدمة'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  );
}
