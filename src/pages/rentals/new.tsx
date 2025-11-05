// src/pages/rentals/new.tsx - صفحة إنشاء عقد إيجار جديد مع نظام بحث محسن
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  FaSave, FaArrowLeft, FaSearch, FaBuilding, FaUser, 
  FaCalendar, FaMoneyBillWave, FaFileContract, FaCheck,
  FaSpinner, FaHome, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaIdCard, FaClock, FaDollarSign, FaFileAlt, FaPlus,
  FaChevronDown, FaChevronUp, FaListAlt
} from 'react-icons/fa';
import InstantLink from '@/components/InstantLink';

interface Property {
  id: string;
  titleAr: string;
  address: string;
  buildingType: 'single' | 'multi';
  units?: Unit[];
  ownerId?: string;
  buildingNumber?: string;
  serialNumber?: string;
  area?: string;
  rentalPrice?: string;
  priceOMR?: string;
}

interface Unit {
  id: string;
  unitNo: string;
  type: string;
  area: string;
  rentalPrice?: string;
  price?: string;
  beds?: number;
  baths?: number;
  floor?: number;
}

interface RentalFormData {
  // معلومات العقار
  propertyId: string;
  unitId: string;
  searchQuery: string;
  searchType: 'buildingNumber' | 'ownerId' | 'serialNumber' | 'propertyId';
  
  // معلومات المستأجر
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  tenantId: string;
  
  // تفاصيل العقد
  startDate: string;
  endDate: string;
  duration: number; // بالأشهر
  monthlyRent: number;
  deposit: number;
  currency: string;
  
  // شروط إضافية
  terms: string[];
  customTerms: string;
  
  // حالة العقد
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export default function NewRentalContract() {
  const router = useRouter();
  const { propertyId: initialPropertyId } = router.query;
  const [hasMounted, setHasMounted] = useState(false);
  
  const [formData, setFormData] = useState<RentalFormData>({
    propertyId: initialPropertyId as string || '',
    unitId: '',
    searchQuery: '',
    searchType: 'buildingNumber',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantId: '',
    startDate: '', // سيتم تعيينه في useEffect
    endDate: '',
    duration: 12,
    monthlyRent: 0,
    deposit: 0,
    currency: 'OMR',
    terms: [],
    customTerms: '',
    status: 'draft'
  });
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // القالب المملوء
  const [filledTemplate, setFilledTemplate] = useState<any | null>(null);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  
  // بيانات القوائم المنسدلة الذكية
  const [buildingNumbers, setBuildingNumbers] = useState<string[]>([]);
  const [ownerIds, setOwnerIds] = useState<string[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [propertyIds, setPropertyIds] = useState<{id: string, title: string, address: string}[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // حالة الشغور والعقود النشطة
  const [occupancyStatus, setOccupancyStatus] = useState<Record<string, {occupied: boolean, activeContracts: number}>>({});
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [showOccupiedWarning, setShowOccupiedWarning] = useState<string | null>(null);
  
  // تعيين hasMounted و startDate بعد تحميل الصفحة
  useEffect(() => {
    setHasMounted(true);
    setFormData(prev => ({
      ...prev,
      startDate: new Date().toISOString().split('T')[0]
    }));
  }, []);
  
  // جلب العقارات عند تحميل الصفحة
  useEffect(() => {
    fetchAllProperties();
  }, []);
  
  // حساب تاريخ الانتهاء عند تغيير تاريخ البداية أو المدة
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + formData.duration);
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, formData.duration]);
  
  // توليد القالب المملوء تلقائياً عند الانتقال للخطوة 5
  useEffect(() => {
    if (currentStep === 5 && !filledTemplate && !generatingTemplate) {
      generateFilledTemplate();
    }
  }, [currentStep]);
  
  const fetchAllProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties?mine=true');
      if (response.ok) {
        const data = await response.json();
        const allProperties = Array.isArray(data?.items) ? data.items : [];
        setProperties(allProperties);
        setFilteredProperties(allProperties);
        
        // تحضير بيانات القوائم المنسدلة الذكية
        prepareDropdownData(allProperties);
        
        // إذا كان هناك propertyId في URL، ابحث عنه مباشرة
        if (initialPropertyId) {
          const prop = allProperties.find((p: Property) => p.id === initialPropertyId);
          if (prop) {
            setSelectedProperty(prop);
            setFormData(prev => ({ ...prev, propertyId: prop.id }));
            if (prop.buildingType === 'multi' && prop.units) {
              setUnits(prop.units);
            } else if (prop.buildingType === 'single') {
              // للعقارات المفردة، إنشاء وحدة افتراضية
              setUnits([{
                id: prop.id,
                unitNo: 'N/A',
                type: 'عقار مفرد',
                area: prop.area || '0',
                rentalPrice: prop.rentalPrice || prop.priceOMR || '0'
              }]);
            }
          }
        }
      } else {
        setError('فشل في جلب العقارات');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('حدث خطأ أثناء جلب العقارات');
    } finally {
      setLoading(false);
    }
  };
  
  const prepareDropdownData = (allProperties: Property[]) => {
    console.log('Preparing dropdown data for properties:', allProperties.length);
    
    // إضافة بيانات تجريبية للاختبار
    const testBuildingNumbers = ['BLD-001', 'BLD-002', 'BLD-003', 'P-20251022085429', 'P-20251022094422'];
    const testOwnerIds = ['OWNER-001', 'OWNER-002', 'khalid.alabri@ainoman.om', 'P-20251022085429'];
    const testSerialNumbers = ['SER-001', 'SER-002', 'SER-003', 'P-20251022085429'];
    
    // استخراج أرقام المباني الفريدة (استخدام ID كرقم مبنى + بيانات تجريبية)
    const uniqueBuildingNumbers = [...new Set([
      ...allProperties.map(p => p.id),
      ...testBuildingNumbers
    ])].filter(Boolean).sort();
    setBuildingNumbers(uniqueBuildingNumbers);
    console.log('Building numbers:', uniqueBuildingNumbers);
    
    // استخراج معرفات الملاك الفريدة (استخدام ID كمثال + بيانات تجريبية)
    const uniqueOwnerIds = [...new Set([
      ...allProperties.map(p => p.id),
      ...testOwnerIds
    ])].filter(Boolean).sort();
    setOwnerIds(uniqueOwnerIds);
    console.log('Owner IDs:', uniqueOwnerIds);
    
    // استخراج الأرقام المتسلسلة الفريدة (استخدام ID كرقم متسلسل + بيانات تجريبية)
    const uniqueSerialNumbers = [...new Set([
      ...allProperties.map(p => p.id),
      ...testSerialNumbers
    ])].filter(Boolean).sort();
    setSerialNumbers(uniqueSerialNumbers);
    console.log('Serial numbers:', uniqueSerialNumbers);
    
    // استخراج معرفات العقارات مع العناوين
    const uniquePropertyIds = allProperties.map(p => ({
      id: p.id,
      title: p.titleAr,
      address: p.address
    }));
    setPropertyIds(uniquePropertyIds);
    console.log('Property IDs:', uniquePropertyIds);
  };
  
  const searchProperties = async () => {
    if (!formData.searchQuery.trim()) {
      setFilteredProperties([]);
      setHasSearched(false);
      return;
    }
    
    setSearching(true);
    setError(null);
    setHasSearched(true);
    
    try {
      let searchResults: Property[] = [];
      
      switch (formData.searchType) {
        case 'buildingNumber':
          searchResults = properties.filter(p => 
            p.buildingNumber?.includes(formData.searchQuery) ||
            p.id?.includes(formData.searchQuery)
          );
          break;
          
        case 'ownerId':
          searchResults = properties.filter(p => 
            p.ownerId?.includes(formData.searchQuery) ||
            p.id?.includes(formData.searchQuery)
          );
          break;
          
        case 'serialNumber':
          searchResults = properties.filter(p => 
            p.serialNumber?.includes(formData.searchQuery) ||
            p.id?.includes(formData.searchQuery)
          );
          break;
          
        case 'propertyId':
          searchResults = properties.filter(p => 
            p.id?.includes(formData.searchQuery) ||
            p.titleAr?.includes(formData.searchQuery) ||
            p.address?.includes(formData.searchQuery)
          );
          break;
          
        default:
          searchResults = properties.filter(p => 
            p.id?.includes(formData.searchQuery) ||
            p.titleAr?.includes(formData.searchQuery) ||
            p.address?.includes(formData.searchQuery) ||
            p.buildingNumber?.includes(formData.searchQuery)
          );
      }
      
      setFilteredProperties(searchResults);
      
      if (searchResults.length === 0) {
        setError('لم يتم العثور على عقارات تطابق معايير البحث');
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      setError('حدث خطأ أثناء البحث');
    } finally {
      setSearching(false);
    }
  };
  
  const selectProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData(prev => ({ ...prev, propertyId: property.id }));
    setError(null);
    
    if (property.buildingType === 'multi' && property.units && property.units.length > 0) {
      setUnits(property.units);
      setSelectedUnit(null);
      setFormData(prev => ({ ...prev, unitId: '' }));
    } else if (property.buildingType === 'single') {
      // للعقارات المفردة، إنشاء وحدة افتراضية
      const singleUnit: Unit = {
        id: property.id,
        unitNo: 'N/A',
        type: 'عقار مفرد',
        area: property.area || '0',
        rentalPrice: property.rentalPrice || property.priceOMR || '0',
        beds: 0,
        baths: 0,
        floor: 0
      };
      setUnits([singleUnit]);
      setSelectedUnit(singleUnit);
      setFormData(prev => ({ 
        ...prev, 
        unitId: singleUnit.id,
        monthlyRent: parseFloat(singleUnit.rentalPrice || '0')
      }));
    } else {
      setUnits([]);
      setSelectedUnit(null);
      setFormData(prev => ({ ...prev, unitId: '' }));
    }
  };
  
  const selectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData(prev => ({ 
      ...prev, 
      unitId: unit.id,
      monthlyRent: parseFloat(unit.rentalPrice || unit.price || '0')
    }));
  };
  
  const getDropdownOptions = (): (string | {id: string, title: string, address: string})[] => {
    console.log('Getting dropdown options for search type:', formData.searchType);
    console.log('Search query:', formData.searchQuery);
    console.log('Building numbers:', buildingNumbers);
    console.log('Owner IDs:', ownerIds);
    console.log('Serial numbers:', serialNumbers);
    console.log('Property IDs:', propertyIds);
    
    switch (formData.searchType) {
      case 'buildingNumber':
        const buildingResults = buildingNumbers.filter(num => 
          num.toLowerCase().includes(formData.searchQuery.toLowerCase())
        );
        console.log('Building number results:', buildingResults);
        return buildingResults;
      case 'ownerId':
        const ownerResults = ownerIds.filter(id => 
          id.toLowerCase().includes(formData.searchQuery.toLowerCase())
        );
        console.log('Owner ID results:', ownerResults);
        return ownerResults;
      case 'serialNumber':
        const serialResults = serialNumbers.filter(serial => 
          serial.toLowerCase().includes(formData.searchQuery.toLowerCase())
        );
        console.log('Serial number results:', serialResults);
        return serialResults;
      case 'propertyId':
        const propertyResults = propertyIds.filter(prop => 
          prop.id.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
          prop.title.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
          prop.address.toLowerCase().includes(formData.searchQuery.toLowerCase())
        );
        console.log('Property ID results:', propertyResults);
        return propertyResults;
      default:
        return [];
    }
  };
  
  const handleDropdownSelect = (value: string | {id: string, title: string, address: string}) => {
    const searchValue = typeof value === 'string' ? value : value.id;
    setFormData(prev => ({ ...prev, searchQuery: searchValue }));
    setShowDropdown(false);
    setHasSearched(true); // تأكيد أن البحث تم
    
    // البحث الفوري عند الاختيار
    setTimeout(() => {
      searchProperties();
    }, 100);
  };
  
  const handleInputChange = (field: keyof RentalFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'searchQuery') {
      setShowDropdown(value.length > 0);
      
      // البحث الفوري أثناء الكتابة
      setTimeout(() => {
        if (value.trim()) {
          searchProperties();
        } else {
          setFilteredProperties([]);
          setHasSearched(false);
        }
      }, 300);
    }
    
    if (field === 'searchType') {
      // إعادة تعيين البحث عند تغيير نوع البحث
      setFormData(prev => ({ ...prev, searchQuery: '' }));
      setShowDropdown(false);
      setFilteredProperties([]);
      setHasSearched(false);
    }
  };
  
  // توليد القالب المملوء تلقائياً
  const generateFilledTemplate = async () => {
    if (!selectedProperty || !formData.startDate || !formData.monthlyRent) {
      console.log('Missing required data for template generation');
      return null;
    }
    
    setGeneratingTemplate(true);
    try {
      const response = await fetch('/api/contracts/generate-filled-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          unitId: formData.unitId || undefined,
          tenantData: {
            name: formData.tenantName,
            phone: formData.tenantPhone,
            email: formData.tenantEmail,
            idNumber: formData.tenantId,
            address: ''
          },
          contractData: {
            startDate: formData.startDate,
            endDate: formData.endDate,
            duration: formData.duration,
            monthlyRent: formData.monthlyRent,
            deposit: formData.deposit,
            currency: formData.currency,
            customTerms: formData.customTerms
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFilledTemplate(result.template);
        console.log('Template generated successfully:', result.template);
        return result.template;
      } else {
        const error = await response.json();
        console.error('Failed to generate template:', error);
        return null;
      }
    } catch (error) {
      console.error('Error generating template:', error);
      return null;
    } finally {
      setGeneratingTemplate(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // توليد القالب المملوء قبل الحفظ
      if (!filledTemplate) {
        await generateFilledTemplate();
      }
      
      const rentalData = {
        id: `rental-${Date.now()}`,
        propertyId: formData.propertyId,
        unitId: formData.unitId,
        tenantId: formData.tenantId,
        tenantName: formData.tenantName,
        tenantPhone: formData.tenantPhone,
        tenantEmail: formData.tenantEmail,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        monthlyRent: formData.monthlyRent,
        deposit: formData.deposit,
        currency: formData.currency,
        terms: formData.terms,
        customTerms: formData.customTerms,
        status: formData.status,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // إضافة القالب المملوء
        contractTemplate: filledTemplate ? {
          templateId: filledTemplate.id,
          templateName: filledTemplate.name,
          filledAt: filledTemplate.filledAt,
          content: filledTemplate.content
        } : undefined
      };
      
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalData)
      });
      
      if (response.ok) {
        setSuccess('تم إنشاء عقد الإيجار بنجاح!');
        setTimeout(() => {
          router.push('/dashboard/owner?tab=rentals');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في إنشاء عقد الإيجار');
      }
    } catch (error) {
      console.error('Error creating rental contract:', error);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };
  
  const steps = [
    { id: 1, name: 'البحث عن العقار', icon: FaSearch },
    { id: 2, name: 'اختيار الوحدة', icon: FaBuilding },
    { id: 3, name: 'معلومات المستأجر', icon: FaUser },
    { id: 4, name: 'تفاصيل العقد', icon: FaFileContract },
    { id: 5, name: 'المراجعة والحفظ', icon: FaSave }
  ];
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow-lg rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaSearch className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">البحث عن العقار</h3>
                <p className="text-gray-600">ابحث عن العقار باستخدام رقم المبنى أو معرف المالك أو الرقم المتسلسل</p>
              </div>
            </div>
            
            {/* نوع البحث */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">نوع البحث</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'buildingNumber', label: 'رقم المبنى', icon: FaBuilding },
                  { value: 'ownerId', label: 'معرف المالك', icon: FaUser },
                  { value: 'serialNumber', label: 'الرقم المتسلسل', icon: FaIdCard },
                  { value: 'propertyId', label: 'معرف العقار', icon: FaHome }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('searchType', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.searchType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* حقل البحث الذكي */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.searchType === 'buildingNumber' && 'اختر أو ابحث عن رقم المبنى'}
                {formData.searchType === 'ownerId' && 'اختر أو ابحث عن معرف المالك'}
                {formData.searchType === 'serialNumber' && 'أدخل الرقم المتسلسل'}
                {formData.searchType === 'propertyId' && 'اختر أو ابحث عن العقار'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.searchQuery}
                  onChange={(e) => handleInputChange('searchQuery', e.target.value)}
                  onFocus={() => setShowDropdown(formData.searchQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    formData.searchType === 'buildingNumber' ? 'ابحث عن رقم المبنى...' :
                    formData.searchType === 'ownerId' ? 'ابحث عن معرف المالك...' :
                    formData.searchType === 'serialNumber' ? 'أدخل الرقم المتسلسل...' :
                    'ابحث عن العقار...'
                  }
                />
                <button
                  type="button"
                  onClick={searchProperties}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  disabled={searching}
                >
                  {searching ? <FaSpinner className="w-5 h-5 animate-spin" /> : <FaSearch className="w-5 h-5" />}
                </button>
                
                {/* القائمة المنسدلة الذكية */}
                {showDropdown && getDropdownOptions().length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b" suppressHydrationWarning>
                      اختر من القائمة ({getDropdownOptions().length} خيار)
                    </div>
                    {getDropdownOptions().map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleDropdownSelect(option)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        {formData.searchType === 'propertyId' && typeof option === 'object' ? (
                          <div>
                            <div className="font-medium text-gray-900">{option.title}</div>
                            <div className="text-sm text-gray-600">{option.address}</div>
                            <div className="text-xs text-gray-500">ID: {option.id}</div>
                          </div>
                        ) : (
                          <div className="font-medium text-gray-900">{option}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* رسالة إذا لم توجد خيارات */}
                {showDropdown && getDropdownOptions().length === 0 && formData.searchQuery.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <div className="text-center text-gray-500">
                      <p>لا توجد خيارات تطابق "{formData.searchQuery}"</p>
                      <p className="text-xs mt-1">جرب كتابة نص مختلف</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* معلومات إضافية حسب نوع البحث */}
              <div className="mt-2 text-sm text-gray-500">
                {formData.searchType === 'buildingNumber' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">💡 يمكنك الاختيار من القائمة أو الكتابة للبحث</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowDropdown(!showDropdown);
                        // عرض جميع العقارات عند إظهار القائمة
                        if (!showDropdown) {
                          setFilteredProperties(properties);
                          setHasSearched(true);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      <FaListAlt className="w-5 h-5" />
                      <span suppressHydrationWarning>{showDropdown ? 'إخفاء' : 'إظهار'} القائمة ({buildingNumbers.length} رقم مبنى)</span>
                      {showDropdown ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                {formData.searchType === 'ownerId' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">💡 يمكنك الاختيار من قائمة الملاك أو الكتابة للبحث</p>
                    <button 
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      <FaUser className="w-5 h-5" />
                      <span suppressHydrationWarning>{showDropdown ? 'إخفاء' : 'إظهار'} قائمة الملاك ({ownerIds.length} مالك)</span>
                      {showDropdown ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                {formData.searchType === 'serialNumber' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">💡 أدخل الرقم المتسلسل الدقيق للعقار</p>
                    <button 
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      <FaIdCard className="w-5 h-5" />
                      <span suppressHydrationWarning>{showDropdown ? 'إخفاء' : 'إظهار'} القائمة ({serialNumbers.length} رقم)</span>
                      {showDropdown ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                {formData.searchType === 'propertyId' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">💡 يمكنك البحث بالمعرف أو العنوان أو اسم العقار</p>
                    <button 
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      <FaHome className="w-5 h-5" />
                      <span suppressHydrationWarning>{showDropdown ? 'إخفاء' : 'إظهار'} قائمة العقارات ({propertyIds.length} عقار)</span>
                      {showDropdown ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* نتائج البحث */}
            {(hasSearched || selectedProperty) && filteredProperties.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaBuilding className="w-5 h-5 text-blue-600" />
                  العقارات المتاحة
                  {selectedProperty && (
                    <span className="text-sm font-normal text-green-600">
                      (تم اختيار عقار ✓)
                    </span>
                  )}
                </h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => selectProperty(property)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedProperty?.id === property.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{property.titleAr}</h5>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {property.address}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaBuilding className="w-3 h-3" />
                              {property.buildingType === 'multi' ? 'متعدد الوحدات' : 'وحدة واحدة'}
                            </span>
                            {property.buildingNumber && (
                              <span>رقم المبنى: {property.buildingNumber}</span>
                            )}
                            {property.area && (
                              <span>المساحة: {property.area} م²</span>
                            )}
                          </div>
                        </div>
                        {selectedProperty?.id === property.id && (
                          <FaCheck className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={!selectedProperty}
              >
                التالي
                <FaArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow-lg rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaBuilding className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">اختيار الوحدة</h3>
                <p className="text-gray-600">اختر الوحدة المراد تأجيرها</p>
              </div>
            </div>
            
            {/* معلومات العقار المختار */}
            {selectedProperty && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">العقار المختار</h4>
                <p className="text-blue-800">{selectedProperty.titleAr}</p>
                <p className="text-sm text-blue-600">{selectedProperty.address}</p>
              </div>
            )}
            
            {/* اختيار الوحدة */}
            {units.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">الوحدات المتاحة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => selectUnit(unit)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedUnit?.id === unit.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">
                            الوحدة {unit.unitNo}
                          </h5>
                          <p className="text-sm text-gray-600">{unit.type}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {unit.area && <span>المساحة: {unit.area} م²</span>}
                            {unit.beds && <span>الغرف: {unit.beds}</span>}
                            {unit.baths && <span>الحمامات: {unit.baths}</span>}
                            {unit.floor && <span>الطابق: {unit.floor}</span>}
                          </div>
                          {unit.rentalPrice && (
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              الإيجار: {unit.rentalPrice} ريال
                            </p>
                          )}
                        </div>
                        {selectedUnit?.id === unit.id && (
                          <FaCheck className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBuilding className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">لا توجد وحدات متاحة لهذا العقار</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={!selectedUnit}
              >
                التالي
                <FaArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow-lg rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaUser className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">معلومات المستأجر</h3>
                <p className="text-gray-600">أدخل تفاصيل المستأجر</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline ml-2" />
                  اسم المستأجر الكامل
                </label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="اسم المستأجر"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaIdCard className="inline ml-2" />
                  رقم الهوية
                </label>
                <input
                  type="text"
                  value={formData.tenantId}
                  onChange={(e) => handleInputChange('tenantId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="رقم الهوية"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline ml-2" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.tenantPhone}
                  onChange={(e) => handleInputChange('tenantPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="رقم الهاتف"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline ml-2" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="البريد الإلكتروني"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={!formData.tenantName || !formData.tenantPhone || !formData.tenantEmail}
              >
                التالي
                <FaArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow-lg rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FaFileContract className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">تفاصيل العقد</h3>
                <p className="text-gray-600">حدد شروط وأحكام عقد الإيجار</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendar className="inline ml-2" />
                  تاريخ بدء العقد
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  suppressHydrationWarning
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline ml-2" />
                  مدة الإيجار (بالأشهر)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  max="60"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendar className="inline ml-2" />
                  تاريخ انتهاء العقد
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  readOnly
                  suppressHydrationWarning
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaDollarSign className="inline ml-2" />
                  العملة
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="OMR">ريال عماني (OMR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMoneyBillWave className="inline ml-2" />
                  الإيجار الشهري
                </label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => handleInputChange('monthlyRent', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMoneyBillWave className="inline ml-2" />
                  مبلغ الضمان
                </label>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFileAlt className="inline ml-2" />
                الشروط والأحكام الإضافية
              </label>
              <textarea
                value={formData.customTerms}
                onChange={(e) => handleInputChange('customTerms', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="أدخل أي شروط وأحكام إضافية هنا..."
              />
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={!formData.startDate || !formData.duration || !formData.monthlyRent}
              >
                التالي
                <FaArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
        
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow-lg rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaSave className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">المراجعة والحفظ</h3>
                <p className="text-gray-600">راجع تفاصيل العقد قبل الحفظ</p>
              </div>
            </div>
            
            {/* ملخص العقد */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">ملخص العقد</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">معلومات العقار</h5>
                  <div className="space-y-1 text-sm">
                    <p suppressHydrationWarning><span className="font-medium">العقار:</span> {selectedProperty?.titleAr}</p>
                    <p suppressHydrationWarning><span className="font-medium">الوحدة:</span> الوحدة {selectedUnit?.unitNo}</p>
                    <p suppressHydrationWarning><span className="font-medium">النوع:</span> {selectedUnit?.type}</p>
                    <p suppressHydrationWarning><span className="font-medium">المساحة:</span> {selectedUnit?.area} م²</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">معلومات المستأجر</h5>
                  <div className="space-y-1 text-sm">
                    <p suppressHydrationWarning><span className="font-medium">الاسم:</span> {formData.tenantName}</p>
                    <p suppressHydrationWarning><span className="font-medium">الهاتف:</span> {formData.tenantPhone}</p>
                    <p suppressHydrationWarning><span className="font-medium">البريد:</span> {formData.tenantEmail}</p>
                    {formData.tenantId && <p suppressHydrationWarning><span className="font-medium">الهوية:</span> {formData.tenantId}</p>}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">تفاصيل العقد</h5>
                  <div className="space-y-1 text-sm">
                    <p suppressHydrationWarning><span className="font-medium">تاريخ البدء:</span> {formData.startDate}</p>
                    <p suppressHydrationWarning><span className="font-medium">تاريخ الانتهاء:</span> {formData.endDate}</p>
                    <p suppressHydrationWarning><span className="font-medium">المدة:</span> {formData.duration} شهر</p>
                    <p suppressHydrationWarning><span className="font-medium">العملة:</span> {formData.currency}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">المبالغ المالية</h5>
                  <div className="space-y-1 text-sm">
                    <p suppressHydrationWarning><span className="font-medium">الإيجار الشهري:</span> {formData.monthlyRent} {formData.currency}</p>
                    <p suppressHydrationWarning><span className="font-medium">مبلغ الضمان:</span> {formData.deposit} {formData.currency}</p>
                    <p suppressHydrationWarning><span className="font-medium">إجمالي العقد:</span> {formData.monthlyRent * formData.duration} {formData.currency}</p>
                  </div>
                </div>
              </div>
              
              {formData.customTerms && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">الشروط الإضافية</h5>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded border">{formData.customTerms}</p>
                </div>
              )}
            </div>
            
            {/* معاينة القالب المملوء - محسّن */}
            {generatingTemplate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-6 shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 relative">
                    <FaSpinner className="w-10 h-10 text-white animate-spin" />
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-blue-400"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">جاري تحضير وثيقة العقد...</h4>
                  <p className="text-gray-600">يتم ملء القالب تلقائياً بجميع البيانات</p>
                </div>
              </motion.div>
            )}
            
            {filledTemplate && !generatingTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <FaFileContract className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold mb-1">
                          {typeof filledTemplate.name === 'object' ? filledTemplate.name.ar : filledTemplate.name}
                        </h4>
                        <p className="text-green-100">تم إنشاء وثيقة العقد تلقائياً ✓</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold flex items-center gap-2">
                        <FaCheck className="w-4 h-4" />
                        جاهز للحفظ
                      </span>
                      <span className="text-sm text-green-100" suppressHydrationWarning>
                        {filledTemplate.content?.sections?.length || 0} أقسام • {
                          filledTemplate.content?.sections?.reduce((sum: number, s: any) => sum + (s.clauses?.length || 0), 0) || 0
                        } بند
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Card */}
                <div className="bg-white border-x-2 border-green-200 rounded-b-2xl shadow-lg overflow-hidden">
                  {/* Quick Preview */}
                  <div className="p-6 border-b border-gray-200">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaFileAlt className="text-blue-600" />
                      معاينة محتوى العقد
                    </h5>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 max-h-80 overflow-y-auto">
                      <div className="space-y-4">
                        {filledTemplate.content?.sections?.slice(0, 4).map((section: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">{idx + 1}</span>
                              </div>
                              <h6 className="font-bold text-gray-900 flex-1">
                                {typeof section.title === 'object' ? section.title.ar : section.title}
                              </h6>
                            </div>
                            <div className="space-y-2 mr-11">
                              {section.clauses?.slice(0, 3).map((clause: any, cIdx: number) => (
                                <div key={cIdx} className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold mt-1">•</span>
                                  <p className="text-sm text-gray-700 leading-relaxed flex-1">
                                    {typeof clause === 'object' ? clause.ar : clause}
                                  </p>
                                </div>
                              ))}
                              {section.clauses?.length > 3 && (
                                <p className="text-xs text-gray-500 italic mr-4" suppressHydrationWarning>
                                  ... و {section.clauses.length - 3} بند إضافي
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        {filledTemplate.content?.sections?.length > 4 && (
                          <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-full">
                              <FaPlus className="w-4 h-4" />
                              <span className="font-medium" suppressHydrationWarning>
                                ... و {filledTemplate.content.sections.length - 4} أقسام إضافية
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaCheck className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h6 className="font-bold text-gray-900 mb-2">جاهز للحفظ والتوقيع</h6>
                        <p className="text-sm text-gray-700 mb-3">
                          تم ملء جميع بنود العقد تلقائياً ببيانات العقار والمالك والمستأجر. 
                          يمكنك الآن حفظ العقد وإرساله للتوقيع الإلكتروني.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">بيانات المالك</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">بيانات المستأجر</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">بيانات العقار</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">المبالغ المالية</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">التواريخ</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">الشروط</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700">{success}</p>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                السابق
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    حفظ العقد
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      <Head>
        <title>إنشاء عقد إيجار جديد | عين عُمان</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Back Button */}
              <div className="mb-6">
                <InstantLink
                  href="/dashboard/owner"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
                >
                  <FaArrowLeft />
                  <span>العودة للوحة التحكم</span>
                </InstantLink>
              </div>

              {/* Title & Description */}
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaFileContract className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">إنشاء عقد إيجار جديد</h1>
                  <p className="text-xl text-white/90 mb-4">نظام متقدم لإنشاء عقود الإيجار - يتم ملء القالب تلقائياً</p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                      <FaClock className="w-4 h-4" />
                      <span className="text-sm">5 خطوات فقط</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                      <FaFileContract className="w-4 h-4" />
                      <span className="text-sm">قالب تلقائي</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                      <FaCheck className="w-4 h-4" />
                      <span className="text-sm">جاهز للتوقيع</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* خطوات التقدم - Stepper محسّن */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">خطوات إنشاء العقد</h3>
                <div className="text-sm text-gray-500" suppressHydrationWarning>
                  الخطوة <span className="font-bold text-blue-600">{currentStep}</span> من <span className="font-bold">{steps.length}</span>
                </div>
              </div>
              
              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-6 right-0 left-0 h-1 bg-gray-200 rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex items-center justify-between">
                  {steps.map((step, stepIdx) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center flex-1">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all mb-2 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg ring-4 ring-blue-100'
                              : isCompleted
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <FaCheck className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-blue-400"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                        <p className={`text-xs font-medium text-center transition-colors ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
          
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </main>
      </div>
    </>
  );
}