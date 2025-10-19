import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Layout handled by _app.tsx
import { FaSave, FaTimes, FaUser, FaUserTie, FaBuilding, FaCalendarAlt, FaFileAlt, FaMoneyBillWave, FaGavel, FaBalanceScale, FaPlus, FaSearch, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaSpinner, FaEdit } from 'react-icons/fa';

interface Person {
  id: string;
  name: string;
  subscriptionNo: string;
  phone?: string;
  email?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  rating?: number;
}

interface Property {
  id: string;
  title: string;
  titleAr?: string;
  buildingNumber?: string;
  address?: string;
  landNumber?: string;
  governorate?: string;
  region?: string;
  town?: string;
  ownerName?: string;
  owner?: string;
  tenantName?: string;
  tenant?: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const { propertyId } = router.query;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'RENTAL_DISPUTE',
    priority: 'MEDIUM',
    clientId: '',
    primaryLawyerId: '',
    propertyReference: propertyId ? { propertyId: propertyId as string } : null,
    plaintiffs: [''],
    defendants: [''],
    courtNumber: '',
    registrationDate: '',
    hearingDate: '',
    caseSummary: '',
    legalBasis: '',
    requestedRelief: '',
    evidence: '',
    witnesses: '',
    estimatedValue: '',
    expectedOutcome: '',
    expenses: '',
    fees: '',
    notes: ''
  });

  const [lawyers, setLawyers] = useState<Person[]>([]);
  const [clients, setClients] = useState<Person[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPropertySearch, setShowPropertySearch] = useState(false);
  const [propertySearchTerm, setPropertySearchTerm] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails(propertyId as string);
    }
  }, [propertyId]);

  const loadInitialData = async () => {
    try {
      const [lawyersRes, clientsRes] = await Promise.all([
        fetch('/api/legal/directory?kind=LAWYER', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch('/api/legal/directory?kind=CLIENT', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        })
      ]);

      const lawyersData = await lawyersRes.json();
      const clientsData = await clientsRes.json();

      setLawyers(lawyersData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadPropertyDetails = async (propId: string) => {
    try {
      const response = await fetch(`/api/properties/${propId}`, {
        headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
      });
      
      if (response.ok) {
        const property = await response.json();
        setSelectedProperty(property);
        
        // تعيين المدعي كمالك العقار والمدعى عليه كمستأجر
        const ownerName = property.ownerName || property.owner || 'مالك العقار';
        const tenantName = property.tenantName || property.tenant || 'المستأجر';
        
        setFormData(prev => ({
          ...prev,
          propertyReference: {
            propertyId: propId,
            propertyTitle: property.title || property.titleAr || 'عقار',
            buildingNumber: property.buildingNumber,
            address: property.address,
            landNumber: property.landNumber,
            governorate: property.governorate,
            region: property.region,
            town: property.town
          },
          plaintiffs: [ownerName],
          defendants: [tenantName],
          title: `نزاع إيجار - ${property.title || property.titleAr || 'عقار'}`
        }));
      }
    } catch (error) {
      console.error('Error loading property details:', error);
    }
  };

  const searchProperties = async (term: string) => {
    if (!term.trim()) {
      setProperties([]);
      return;
    }

    try {
      const response = await fetch(`/api/properties?search=${encodeURIComponent(term)}`, {
        headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addPlaintiff = () => {
    setFormData(prev => ({
      ...prev,
      plaintiffs: [...prev.plaintiffs, '']
    }));
  };

  const removePlaintiff = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plaintiffs: prev.plaintiffs.filter((_, i) => i !== index)
    }));
  };

  const updatePlaintiff = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      plaintiffs: prev.plaintiffs.map((p, i) => i === index ? value : p)
    }));
  };

  const addDefendant = () => {
    setFormData(prev => ({
      ...prev,
      defendants: [...prev.defendants, '']
    }));
  };

  const removeDefendant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      defendants: prev.defendants.filter((_, i) => i !== index)
    }));
  };

  const updateDefendant = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      defendants: prev.defendants.map((d, i) => i === index ? value : d)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان القضية مطلوب';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'العميل مطلوب';
    }

    if (!formData.primaryLawyerId) {
      newErrors.primaryLawyerId = 'المحامي الأساسي مطلوب';
    }

    if (!formData.type) {
      newErrors.type = 'نوع القضية مطلوب';
    }

    if (!formData.priority) {
      newErrors.priority = 'أولوية القضية مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/legal/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'TENANT-1',
          'x-user-id': 'U1',
          'x-roles': 'LAWYER'
        },
        body: JSON.stringify({
          ...formData,
          plaintiff: formData.plaintiffs.filter(p => p.trim()).join(', '),
          defendant: formData.defendants.filter(d => d.trim()).join(', '),
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
          expenses: formData.expenses ? parseFloat(formData.expenses) : undefined,
          fees: formData.fees ? parseFloat(formData.fees) : undefined
        })
      });

      if (response.ok) {
        const newCase = await response.json();
        alert('تم إنشاء القضية بنجاح!');
        router.push(`/legal/${newCase.id}`);
      } else {
        const error = await response.json();
        alert('حدث خطأ: ' + (error.message || 'فشل في إنشاء القضية'));
      }
    } catch (error) {
      console.error('Error creating case:', error);
      alert('حدث خطأ في إنشاء القضية');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    
    // تعيين المدعي كمالك العقار والمدعى عليه كمستأجر
    const ownerName = property.ownerName || property.owner || 'مالك العقار';
    const tenantName = property.tenantName || property.tenant || 'المستأجر';
    
    setFormData(prev => ({
      ...prev,
      propertyReference: {
        propertyId: property.id,
        propertyTitle: property.title,
        buildingNumber: property.buildingNumber,
        address: property.address,
        landNumber: property.landNumber,
        governorate: property.governorate,
        region: property.region,
        town: property.town
      },
      plaintiffs: [ownerName],
      defendants: [tenantName],
      title: `نزاع إيجار - ${property.title}`
    }));
    setShowPropertySearch(false);
    setPropertySearchTerm('');
  };

  const removePropertyReference = () => {
    setSelectedProperty(null);
    setFormData(prev => ({ ...prev, propertyReference: null }));
  };

  return (
    <>
      <Head>
        <title>إنشاء قضية جديدة - نظام إدارة القضايا</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">إنشاء قضية جديدة</h1>
          <p className="text-blue-100">أدخل تفاصيل القضية القانونية الجديدة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaGavel className="text-blue-600" />
              المعلومات الأساسية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان القضية *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخل عنوان القضية"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع القضية *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="RENTAL_DISPUTE">نزاع إيجار</option>
                  <option value="PAYMENT_DISPUTE">نزاع دفع</option>
                  <option value="CONTRACT_BREACH">خرق عقد</option>
                  <option value="PROPERTY_DAMAGE">تلف عقار</option>
                  <option value="EVICTION">إخلاء</option>
                  <option value="MAINTENANCE">صيانة</option>
                  <option value="INSURANCE">تأمين</option>
                  <option value="CRIMINAL">جنائي</option>
                  <option value="CIVIL">مدني</option>
                  <option value="ADMINISTRATIVE">إداري</option>
                  <option value="OTHER">أخرى</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs" />
                    {errors.type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأولوية *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="LOW">منخفضة</option>
                  <option value="MEDIUM">متوسطة</option>
                  <option value="HIGH">عالية</option>
                  <option value="URGENT">عاجلة</option>
                  <option value="CRITICAL">حرجة</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs" />
                    {errors.priority}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف القضية
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل وصف مفصل للقضية"
                />
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaUser className="text-green-600" />
              الأطراف
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العميل *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر العميل</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.subscriptionNo}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs" />
                    {errors.clientId}
                  </p>
                )}
              </div>

        <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحامي الأساسي *
                </label>
                <select
                  value={formData.primaryLawyerId}
                  onChange={(e) => handleInputChange('primaryLawyerId', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.primaryLawyerId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر المحامي</option>
                  {lawyers.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.name} - {lawyer.subscriptionNo}
                    </option>
                  ))}
          </select>
                {errors.primaryLawyerId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs" />
                    {errors.primaryLawyerId}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدعين
                </label>
                <div className="space-y-2">
                  {formData.plaintiffs.map((plaintiff, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={plaintiff}
                        onChange={(e) => updatePlaintiff(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`اسم المدعي ${index + 1}`}
                      />
                      {formData.plaintiffs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlaintiff(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPlaintiff}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaPlus />
                    إضافة مدعي
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدعى عليهم
                </label>
                <div className="space-y-2">
                  {formData.defendants.map((defendant, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={defendant}
                        onChange={(e) => updateDefendant(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`اسم المدعى عليه ${index + 1}`}
                      />
                      {formData.defendants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDefendant(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDefendant}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaPlus />
                    إضافة مدعى عليه
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Property Reference */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaBuilding className="text-orange-600" />
              العقار المرتبط
            </h2>
            
            {selectedProperty ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 mb-2">{selectedProperty.title}</h4>
                    <div className="space-y-1 text-sm text-green-700">
                      {selectedProperty.buildingNumber && <p><strong>رقم المبنى:</strong> {selectedProperty.buildingNumber}</p>}
                      {selectedProperty.landNumber && <p><strong>رقم الأرض:</strong> {selectedProperty.landNumber}</p>}
                      {selectedProperty.governorate && <p><strong>المحافظة:</strong> {selectedProperty.governorate}</p>}
                      {selectedProperty.region && <p><strong>المنطقة:</strong> {selectedProperty.region}</p>}
                      {selectedProperty.town && <p><strong>البلدة:</strong> {selectedProperty.town}</p>}
                      {selectedProperty.address && <p><strong>العنوان:</strong> {selectedProperty.address}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPropertySearch(true)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تغيير العقار"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      onClick={removePropertyReference}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="إزالة العقار"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
                
                {/* معلومات إضافية للعقار */}
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h5 className="font-medium text-gray-900 mb-2">معلومات إضافية</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">مالك العقار</label>
                      <input
                        type="text"
                        value={formData.plaintiffs[0] || ''}
                        onChange={(e) => updatePlaintiff(0, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم مالك العقار"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">المستأجر</label>
                      <input
                        type="text"
                        value={formData.defendants[0] || ''}
                        onChange={(e) => updateDefendant(0, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم المستأجر"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={propertySearchTerm}
                    onChange={(e) => {
                      setPropertySearchTerm(e.target.value);
                      searchProperties(e.target.value);
                    }}
                    onFocus={() => setShowPropertySearch(true)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ابحث عن العقار..."
                  />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {showPropertySearch && (
                  <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => handlePropertySelect(property)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <div className="text-sm text-gray-600">
                          {property.buildingNumber && <span>رقم المبنى: {property.buildingNumber}</span>}
                          {property.governorate && <span> - {property.governorate}</span>}
                        </div>
                      </div>
                    ))}
                    
                    {properties.length === 0 && propertySearchTerm && (
                      <div className="p-3 text-gray-500 text-center">
                        لا توجد نتائج
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Court Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaBalanceScale className="text-purple-600" />
              معلومات المحكمة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم المحكمة
                </label>
                <input
                  type="text"
                  value={formData.courtNumber}
                  onChange={(e) => handleInputChange('courtNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم المحكمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ القيد
                </label>
                <input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الجلسة
                </label>
                <input
                  type="date"
                  value={formData.hearingDate}
                  onChange={(e) => handleInputChange('hearingDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Legal Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaFileAlt className="text-indigo-600" />
              التفاصيل القانونية
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملخص القضية
                </label>
                <textarea
                  value={formData.caseSummary}
                  onChange={(e) => handleInputChange('caseSummary', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ملخص مفصل للقضية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأساس القانوني
                </label>
                <textarea
                  value={formData.legalBasis}
                  onChange={(e) => handleInputChange('legalBasis', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="الأساس القانوني للقضية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإغاثة المطلوبة
                </label>
                <textarea
                  value={formData.requestedRelief}
                  onChange={(e) => handleInputChange('requestedRelief', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="الإغاثة أو التعويض المطلوب"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأدلة
                </label>
                <textarea
                  value={formData.evidence}
                  onChange={(e) => handleInputChange('evidence', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="الأدلة المتاحة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشهود
                </label>
                <textarea
                  value={formData.witnesses}
                  onChange={(e) => handleInputChange('witnesses', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أسماء الشهود"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              المعلومات المالية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القيمة المقدرة (ريال عماني)
                </label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.000"
                  step="0.001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسوم القانونية (ريال عماني)
                </label>
                <input
                  type="number"
                  value={formData.fees}
                  onChange={(e) => handleInputChange('fees', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.000"
                  step="0.001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المصاريف (ريال عماني)
                </label>
                <input
                  type="number"
                  value={formData.expenses}
                  onChange={(e) => handleInputChange('expenses', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.000"
                  step="0.001"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النتيجة المتوقعة
              </label>
              <textarea
                value={formData.expectedOutcome}
                onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="النتيجة المتوقعة للقضية"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaFileAlt className="text-gray-600" />
              ملاحظات إضافية
            </h2>
            
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أي ملاحظات إضافية أو معلومات مهمة"
            />
        </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaTimes />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FaSave />
                  حفظ القضية
                </>
              )}
            </button>
        </div>
        </form>
      </div>
    </>
  );
}
