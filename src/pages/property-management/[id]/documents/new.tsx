// src/pages/property-management/[id]/documents/new.tsx - صفحة إضافة مستند جديد
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

interface DocumentFormData {
  documentType: string;
  documentName: string;
  title: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  isConfidential: boolean;
  accessLevel: string;
  unitId?: string;
  tenantId?: string;
  tags: string[];
  notes: string;
}

export default function NewDocument() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: '',
    documentName: '',
    title: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isConfidential: false,
    accessLevel: 'owner_management',
    unitId: '',
    tenantId: '',
    tags: [],
    notes: ''
  });

  const documentTypes = [
    { value: 'deed', label: 'سند الملكية', icon: '📜' },
    { value: 'permit', label: 'تصريح البناء', icon: '📋' },
    { value: 'insurance', label: 'تأمين', icon: '🛡️' },
    { value: 'contract', label: 'عقد إيجار', icon: '📝' },
    { value: 'maintenance', label: 'صيانة', icon: '🔧' },
    { value: 'legal', label: 'قانوني', icon: '⚖️' },
    { value: 'financial', label: 'مالي', icon: '💰' },
    { value: 'other', label: 'أخرى', icon: '📄' }
  ];

  const accessLevels = [
    { value: 'owner', label: 'المالك فقط' },
    { value: 'tenant', label: 'المستأجر فقط' },
    { value: 'management', label: 'الإدارة فقط' },
    { value: 'owner_tenant', label: 'المالك والمستأجر' },
    { value: 'owner_management', label: 'المالك والإدارة' },
    { value: 'owner_tenant_management', label: 'الجميع' }
  ];

  const commonTags = [
    'مهم', 'رسمي', 'سنوي', 'شهري', 'عاجل', 'سري', 'عام', 'خاص'
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

  const handleInputChange = (field: keyof DocumentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // إنشاء FormData لرفع الملف
      const formDataToSend = new FormData();
      formDataToSend.append('documentType', formData.documentType);
      formDataToSend.append('documentName', formData.documentName);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('issueDate', formData.issueDate);
      formDataToSend.append('expiryDate', formData.expiryDate);
      formDataToSend.append('isConfidential', formData.isConfidential.toString());
      formDataToSend.append('accessLevel', formData.accessLevel);
      formDataToSend.append('unitId', formData.unitId || '');
      formDataToSend.append('tenantId', formData.tenantId || '');
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('propertyId', id as string);
      formDataToSend.append('ownerId', 'khalid.alabri@ainoman.om'); // TODO: Get from auth
      
      if (file) {
        formDataToSend.append('file', file);
      }

      const response = await fetch('/api/property-documents', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        router.push(`/property-management/${id}?tab=documents`);
      } else {
        console.error('Error creating document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
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
        <title>إضافة مستند جديد - {property.titleAr}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* الشريط العلوي */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <InstantLink 
                  href={`/property-management/${id}?tab=documents`} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl">←</span>
                </InstantLink>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إضافة مستند جديد</h1>
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
              {/* نوع المستند */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المستند *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {documentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        handleInputChange('documentType', type.value);
                        if (!formData.documentName) {
                          handleInputChange('documentName', type.label);
                        }
                      }}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        formData.documentType === type.value
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

              {/* اسم المستند */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستند *
                </label>
                <input
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => handleInputChange('documentName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: سند ملكية العقار الأصلي"
                  required
                />
              </div>

              {/* عنوان المستند */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان المستند *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="عنوان مختصر للمستند"
                  required
                />
              </div>

              {/* وصف المستند */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المستند
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="وصف تفصيلي للمستند..."
                />
              </div>

              {/* التواريخ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الإصدار *
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
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
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* رفع الملف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رفع الملف *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>رفع ملف</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pr-1">أو اسحب الملف هنا</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG حتى 10MB</p>
                  </div>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    تم اختيار الملف: {file.name}
                  </p>
                )}
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

              {/* مستوى الوصول */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى الوصول
                </label>
                <select
                  value={formData.accessLevel}
                  onChange={(e) => handleInputChange('accessLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {accessLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* سري */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isConfidential"
                  checked={formData.isConfidential}
                  onChange={(e) => handleInputChange('isConfidential', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isConfidential" className="mr-2 block text-sm text-gray-700">
                  مستند سري
                </label>
              </div>

              {/* العلامات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العلامات
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="mr-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonTags
                    .filter(tag => !formData.tags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagAdd(tag)}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
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
                  placeholder="أي ملاحظات إضافية حول المستند..."
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <InstantLink
                  href={`/property-management/${id}?tab=documents`}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </InstantLink>
                <button
                  type="submit"
                  disabled={saving || !file}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الحفظ...
                    </span>
                  ) : (
                    'حفظ المستند'
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
