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
  FaChevronDown, FaChevronUp, FaListAlt, FaUsers,
  FaCloudUploadAlt, FaFileUpload, FaPassport, FaTrash,
  FaGlobe, FaFlag, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import InstantLink from '@/components/InstantLink';
import AddTenantModal from '@/components/tenants/AddTenantModal';

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
  
  // رسوم البلدية (محسوبة تلقائياً)
  municipalityFees: number;
  
  // طرق الدفع
  rentPaymentMethod: 'cash' | 'check' | 'bank_transfer' | 'electronic_payment';
  depositPaymentMethod: 'cash' | 'check' | 'bank_transfer' | 'electronic_payment';
  
  // أرقام الإيصالات والشيكات
  cashReceiptNumber: string; // رقم إيصال الضمان النقدي
  depositCheckNumber: string; // رقم شيك الضمان
  municipalityFormNumber: string; // رقم استمارة عقد الإيجار للبلدية
  municipalityContractNumber: string; // رقم عقد الإيجار المعتمد من البلدية
  
  // فترة السماح
  gracePeriodDays: number;
  gracePeriodAmount: number; // محسوب تلقائياً
  
  // قراءات العدادات
  electricityMeterReading: string;
  waterMeterReading: string;
  
  // رسوم الإنترنت
  internetIncluded: boolean;
  internetFees: number;
  
  // رسوم أخرى
  hasOtherFees: boolean;
  otherFeesDescription: string;
  otherFeesAmount: number;
  
  // الضريبة المضافة
  includesVAT: boolean;
  
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
    municipalityFees: 0,
    rentPaymentMethod: 'cash',
    depositPaymentMethod: 'cash',
    cashReceiptNumber: '',
    depositCheckNumber: '',
    municipalityFormNumber: '',
    municipalityContractNumber: '',
    gracePeriodDays: 0,
    gracePeriodAmount: 0,
    electricityMeterReading: '',
    waterMeterReading: '',
    internetIncluded: false,
    internetFees: 0,
    hasOtherFees: false,
    otherFeesDescription: '',
    otherFeesAmount: 0,
    includesVAT: false,
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
  
  // حالة المستأجرين
  const [tenants, setTenants] = useState<any[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  
  // التحقق من البيانات الإضافية
  const [showAdditionalDataWarning, setShowAdditionalDataWarning] = useState(false);
  const [additionalDataStatus, setAdditionalDataStatus] = useState<any>(null);
  const [newTenant, setNewTenant] = useState({
    // نوع المستأجر
    type: 'individual_omani' as 'individual_omani' | 'individual_foreign' | 'company',
    nationality: 'omani' as 'omani' | 'foreign',
    
    // بيانات عماني
    fullName: '', // الاسم الثلاثي
    tribe: '', // القبيلة
    nationalId: '', // رقم البطاقة الشخصية
    nationalIdExpiry: '', // تاريخ انتهاء البطاقة
    nationalIdFile: null as File | null,
    
    // بيانات غير عماني
    residenceId: '', // رقم بطاقة الإقامة
    residenceIdExpiry: '',
    residenceIdFile: null as File | null,
    passportNumber: '', // رقم الجواز
    passportExpiry: '',
    passportFile: null as File | null,
    
    // بيانات مشتركة
    email: '',
    phone1: '',
    phone2: '',
    employer: '', // جهة العمل
    employerPhone: '', // رقم جهة العمل (للوافدين)
    address: '',
    
    // بيانات الشركة
    companyName: '',
    commercialRegister: '', // رقم السجل التجاري
    commercialRegisterExpiry: '',
    commercialRegisterFile: null as File | null,
    establishmentDate: '', // تاريخ التأسيس
    headquarters: '', // المقر الرئيسي
    companyPhone: '',
    emergencyContacts: [{ name: '', phone: '' }],
    
    // المفوضون بالتوقيع
    authorizedSignatories: [{
      name: '',
      nationalId: '',
      nationalIdExpiry: '',
      nationalIdFile: null as File | null,
      isOmani: true,
      passportNumber: '',
      passportExpiry: '',
      passportFile: null as File | null
    }]
  });
  
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
    fetchTenants();
  }, []);
  
  // إعادة تحميل المستأجرين عند الدخول للمرحلة 3
  useEffect(() => {
    if (currentStep === 3) {
      fetchTenants();
    }
  }, [currentStep]);
  
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
  
  // حساب رسوم البلدية تلقائياً: (الإيجار الشهري × المدة) × 3%
  useEffect(() => {
    if (formData.monthlyRent && formData.duration) {
      const totalRent = formData.monthlyRent * formData.duration;
      const municipalityFees = totalRent * 0.03; // 3%
      setFormData(prev => ({
        ...prev,
        municipalityFees: Math.round(municipalityFees * 1000) / 1000 // تقريب لـ 3 منازل عشرية
      }));
    }
  }, [formData.monthlyRent, formData.duration]);
  
  // حساب مبلغ السماح تلقائياً
  useEffect(() => {
    if (formData.monthlyRent && formData.gracePeriodDays) {
      // حساب: (الإيجار الشهري / 30) × عدد أيام السماح
      const dailyRent = formData.monthlyRent / 30;
      const gracePeriodAmount = dailyRent * formData.gracePeriodDays;
      setFormData(prev => ({
        ...prev,
        gracePeriodAmount: Math.round(gracePeriodAmount * 1000) / 1000 // تقريب لـ 3 منازل عشرية
      }));
    }
  }, [formData.monthlyRent, formData.gracePeriodDays]);
  
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
        
        // فلترة العقارات: فقط التي لديها بيانات كافية
        const validProperties = allProperties.filter((p: Property) => {
          return p.titleAr && 
                 p.titleAr.trim() !== '' &&
                 p.titleAr !== 'عقار جديد' &&
                 (p.buildingNumber || p.id);
        });
        
        console.log('✅ Total properties:', allProperties.length);
        console.log('✅ Valid properties:', validProperties.length);
        console.log('❌ Filtered out:', allProperties.length - validProperties.length);
        
        setProperties(validProperties);
        setFilteredProperties(validProperties);
        
        // تحضير بيانات القوائم المنسدلة الذكية
        prepareDropdownData(validProperties);
        
        // إذا كان هناك propertyId في URL، ابحث عنه مباشرة
        if (initialPropertyId) {
          const prop = validProperties.find((p: Property) => p.id === initialPropertyId);
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
    
    // استخراج أرقام المباني الفريدة من البيانات الحقيقية فقط
    const uniqueBuildingNumbers = [...new Set(
      allProperties
        .map(p => p.buildingNumber || p.id)
        .filter(Boolean)
    )].sort();
    setBuildingNumbers(uniqueBuildingNumbers);
    console.log('✅ Building numbers:', uniqueBuildingNumbers.length);
    
    // استخراج معرفات الملاك الفريدة
    const uniqueOwnerIds = [...new Set(
      allProperties
        .map(p => p.ownerId)
        .filter(Boolean)
    )].sort();
    setOwnerIds(uniqueOwnerIds);
    console.log('✅ Owner IDs:', uniqueOwnerIds.length);
    
    // استخراج الأرقام المتسلسلة الفريدة
    const uniqueSerialNumbers = [...new Set(
      allProperties
        .map(p => p.serialNumber || p.id)
        .filter(Boolean)
    )].sort();
    setSerialNumbers(uniqueSerialNumbers);
    console.log('✅ Serial numbers:', uniqueSerialNumbers.length);
    
    // استخراج معرفات العقارات مع العناوين
    const uniquePropertyIds = allProperties.map(p => ({
      id: p.id,
      title: p.titleAr || 'عقار بدون عنوان',
      address: p.address || 'عنوان غير محدد'
    }));
    setPropertyIds(uniquePropertyIds);
    console.log('Property IDs:', uniquePropertyIds);
  };
  
  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // API يُرجع { users: [...], pagination: {}, stats: {} }
        const allUsers = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
        // تصفية المستأجرين فقط
        const tenantsOnly = allUsers.filter(user => user.role === 'tenant');
        setTenants(tenantsOnly);
        setFilteredTenants(tenantsOnly);
        console.log('✅ Fetched tenants:', tenantsOnly.length, tenantsOnly.map(t => t.name));
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };
  
  const searchTenants = (query: string) => {
    setTenantSearchQuery(query);
    if (!query.trim()) {
      setFilteredTenants(tenants);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(lowerQuery) ||
      tenant.email.toLowerCase().includes(lowerQuery) ||
      tenant.phone.includes(query) ||
      (tenant.id && tenant.id.toLowerCase().includes(lowerQuery))
    );
    setFilteredTenants(filtered);
  };
  
  const selectTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setTenantSearchQuery(tenant.name);
    setFormData(prev => ({
      ...prev,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      tenantPhone: tenant.phone,
      tenantId: tenant.id
    }));
    setShowTenantDropdown(false);
  };
  
  const addNewTenant = async (tenantData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // إنشاء FormData لرفع الملفات
      const formDataToSend = new FormData();
      
      // إضافة البيانات الأساسية
      formDataToSend.append('type', tenantData.type);
      
      // حسب نوع المستأجر
      if (tenantData.type === 'individual_omani') {
        formDataToSend.append('fullName', tenantData.fullName || '');
        formDataToSend.append('tribe', tenantData.tribe || '');
        formDataToSend.append('nationalId', tenantData.nationalId || '');
        formDataToSend.append('nationalIdExpiry', tenantData.nationalIdExpiry || '');
        if (tenantData.nationalIdFile) {
          formDataToSend.append('nationalIdFile', tenantData.nationalIdFile);
        }
      } else if (tenantData.type === 'individual_foreign') {
        formDataToSend.append('fullName', tenantData.fullName || '');
        formDataToSend.append('residenceId', tenantData.residenceId || '');
        formDataToSend.append('residenceIdExpiry', tenantData.residenceIdExpiry || '');
        if (tenantData.residenceIdFile) {
          formDataToSend.append('residenceIdFile', tenantData.residenceIdFile);
        }
        formDataToSend.append('passportNumber', tenantData.passportNumber || '');
        formDataToSend.append('passportExpiry', tenantData.passportExpiry || '');
        if (tenantData.passportFile) {
          formDataToSend.append('passportFile', tenantData.passportFile);
        }
        formDataToSend.append('employerPhone', tenantData.employerPhone || '');
      } else if (tenantData.type === 'company') {
        formDataToSend.append('companyName', tenantData.companyName || '');
        formDataToSend.append('commercialRegister', tenantData.commercialRegister || '');
        formDataToSend.append('commercialRegisterExpiry', tenantData.commercialRegisterExpiry || '');
        formDataToSend.append('establishmentDate', tenantData.establishmentDate || '');
        if (tenantData.commercialRegisterFile) {
          formDataToSend.append('commercialRegisterFile', tenantData.commercialRegisterFile);
        }
        formDataToSend.append('headquarters', tenantData.headquarters || '');
        formDataToSend.append('companyPhone', tenantData.companyPhone || '');
      }
      
      // البيانات المشتركة
      formDataToSend.append('email', tenantData.email || '');
      formDataToSend.append('phone1', tenantData.phone1 || '');
      formDataToSend.append('phone2', tenantData.phone2 || '');
      formDataToSend.append('employer', tenantData.employer || '');
      formDataToSend.append('address', tenantData.address || '');
      
      const response = await fetch('/api/users/add-tenant', {
        method: 'POST',
        body: formDataToSend
      });
      
      if (response.ok) {
        const createdTenant = await response.json();
        // إعادة تحميل المستأجرين من السيرفر للتأكد من التحديث
        await fetchTenants();
        // اختيار المستأجر الجديد
        selectTenant(createdTenant);
        // إغلاق Modal
        setShowAddTenantModal(false);
        setSuccess('تم إضافة المستأجر بنجاح');
        // إظهار القائمة مباشرة
        setShowTenantDropdown(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في إضافة المستأجر');
      }
    } catch (error) {
      console.error('Error adding tenant:', error);
      setError('حدث خطأ أثناء إضافة المستأجر');
    } finally {
      setLoading(false);
    }
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
    
    // اختيار العقار مباشرة إذا كان في القائمة
    const foundProperty = properties.find(p => 
      p.id === searchValue || 
      p.buildingNumber === searchValue ||
      p.ownerId === searchValue ||
      p.serialNumber === searchValue
    );
    
    if (foundProperty) {
      console.log('✅ Property found and selected:', foundProperty.titleAr);
      selectProperty(foundProperty);
    } else {
      // البحث الفوري عند الاختيار
      setTimeout(() => {
        searchProperties();
      }, 100);
    }
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
  
  // التحقق من البيانات الإضافية للعقار
  const checkAdditionalData = async (propertyId: string) => {
    try {
      console.log('📋 Checking additional data for property:', propertyId);
      
      // جلب البيانات من API بدلاً من localStorage
      const response = await fetch(`/api/properties/${propertyId}/additional`);
      
      if (!response.ok) {
        console.log('❌ No additional data found in API');
        return {
          complete: false,
          missing: ['جميع البيانات الإضافية مفقودة']
        };
      }
      
      const data = await response.json();
      console.log('📊 Additional data from API:', data);
      const missing: string[] = [];
      
      // التحقق من بيانات المالك
      if (!data.ownerData || !data.ownerData.fullName) {
        missing.push('بيانات المالك (الاسم الكامل)');
      }
      if (!data.ownerData || !data.ownerData.nationalId) {
        missing.push('بيانات المالك (رقم البطاقة المدنية)');
      }
      if (!data.ownerData || !data.ownerData.nationalIdExpiry) {
        missing.push('بيانات المالك (تاريخ انتهاء البطاقة)');
      }
      if (!data.ownerData || !data.ownerData.nationalIdFile) {
        missing.push('بيانات المالك (نسخة من البطاقة الشخصية)');
      }
      if (!data.ownerData || !data.ownerData.phone) {
        missing.push('بيانات المالك (رقم الهاتف)');
      }
      if (!data.ownerData || !data.ownerData.email) {
        missing.push('بيانات المالك (البريد الإلكتروني)');
      }
      
      // التحقق من حسابات الخدمات (كهرباء ومياه - بالتفصيل)
      const electricityAccount = data.serviceAccounts?.find((s: any) => s.type === 'electricity');
      const waterAccount = data.serviceAccounts?.find((s: any) => s.type === 'water');
      
      if (!electricityAccount) {
        missing.push('حساب الكهرباء');
      } else {
        if (!electricityAccount.accountNumber?.trim()) {
          missing.push('رقم حساب الكهرباء');
        }
        if (!electricityAccount.meterImage?.trim()) {
          missing.push('صورة عداد الكهرباء');
        }
        if (!electricityAccount.paymentType?.trim()) {
          missing.push('نوع الدفع للكهرباء');
        }
      }
      
      if (!waterAccount) {
        missing.push('حساب المياه');
      } else {
        if (!waterAccount.accountNumber?.trim()) {
          missing.push('رقم حساب المياه');
        }
        if (!waterAccount.meterImage?.trim()) {
          missing.push('صورة عداد المياه');
        }
        if (!waterAccount.paymentType?.trim()) {
          missing.push('نوع الدفع للمياه');
        }
      }
      
      // التحقق من بيانات الموظفين
      if (!data.staffData?.maintenanceOfficerName?.trim()) {
        missing.push('اسم مسؤول الصيانة');
      }
      if (!data.staffData?.maintenanceOfficerPhone?.trim()) {
        missing.push('رقم هاتف مسؤول الصيانة');
      }
      
      // التحقق من بيانات العقار
      if (!data.propertyData?.buildingNumber?.trim()) {
        missing.push('رقم المبنى');
      }
      if (!data.propertyData?.landUseType?.trim()) {
        missing.push('نوع استعمال الأرض');
      }
      if (!data.propertyData?.area?.trim()) {
        missing.push('المنطقة');
      }
      if (!data.propertyData?.surveyNumber?.trim()) {
        missing.push('رقم الرسم المساحي');
      }
      if (!data.propertyData?.plotNumber?.trim()) {
        missing.push('رقم القطعة');
      }
      
      // التحقق من المستندات
      const hasOwnershipDeed = data.documents?.some((d: any) => d.type === 'ownership_deed' && d.fileUrl?.trim());
      const hasSurveyDrawing = data.documents?.some((d: any) => d.type === 'survey_drawing' && d.fileUrl?.trim());
      
      if (!hasOwnershipDeed) {
        missing.push('ملكية العقار (مستند)');
      }
      if (!hasSurveyDrawing) {
        missing.push('الرسم المساحي (مستند)');
      }
      
      console.log(`📊 Missing items: ${missing.length}`, missing);
      
      return {
        complete: missing.length === 0,
        missing,
        data
      };
    } catch (error) {
      console.error('❌ Error checking additional data:', error);
      return {
        complete: false,
        missing: ['حدث خطأ في قراءة البيانات']
      };
    }
  };
  
  // محاولة الانتقال للخطوة التالية مع التحقق
  const attemptNextStep = async (fromStep: number) => {
    console.log('🔍 Attempting next step from:', fromStep);
    console.log('Selected property:', selectedProperty?.id);
    
    if (fromStep === 2 && selectedProperty) {
      // التحقق من البيانات الإضافية
      console.log('Checking additional data for property:', selectedProperty.id);
      const status = await checkAdditionalData(selectedProperty.id);
      console.log('Additional data status:', status);
      setAdditionalDataStatus(status);
      
      if (!status.complete) {
        console.log('⚠️ Additional data incomplete, showing warning');
        setShowAdditionalDataWarning(true);
        return;
      }
      
      console.log('✅ Additional data complete, proceeding to step 3');
    }
    
    // الانتقال للخطوة التالية
    console.log('Moving to step:', fromStep + 1);
    setCurrentStep(fromStep + 1);
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
                onClick={async () => {
                  console.log('🔘 Next button clicked from step 2');
                  console.log('Selected unit:', selectedUnit);
                  if (selectedUnit) {
                    await attemptNextStep(2);
                  } else {
                    console.log('❌ No unit selected');
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white shadow-lg rounded-xl p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">معلومات المستأجر</h3>
                    <p className="text-gray-600">اختر مستأجر من القائمة أو أضف جديد</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <FaPlus className="w-4 h-4" />
                  إضافة مستأجر جديد
                </button>
              </div>
              
              {/* نظام البحث */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <FaSearch className="inline ml-2" />
                    بحث عن مستأجر (الاسم، البريد، الهاتف، أو الرقم)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFilteredTenants(tenants);
                      setShowTenantDropdown(!showTenantDropdown);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    <FaUsers className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {showTenantDropdown ? 'إخفاء' : 'إظهار'} جميع المستأجرين ({tenants.length})
                    </span>
                    {showTenantDropdown ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={tenantSearchQuery}
                    onChange={(e) => {
                      searchTenants(e.target.value);
                      setShowTenantDropdown(true);
                    }}
                    onFocus={() => setShowTenantDropdown(true)}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="ابحث عن مستأجر..."
                  />
                  <FaSearch className="absolute left-4 top-4 text-gray-400" />
                  
                  {/* القائمة المنسدلة */}
                  {showTenantDropdown && filteredTenants.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredTenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          onClick={() => selectTenant(tenant)}
                          className="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <FaUser className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{tenant.name}</h5>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <FaEnvelope className="w-3 h-3" />
                                  {tenant.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaPhone className="w-3 h-3" />
                                  {tenant.phone}
                                </span>
                              </div>
                            </div>
                            {selectedTenant?.id === tenant.id && (
                              <FaCheck className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* رسالة عدم وجود نتائج */}
                  {showTenantDropdown && tenantSearchQuery && filteredTenants.length === 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-lg p-4 text-center">
                      <p className="text-gray-600 mb-3">لم يتم العثور على مستأجر بهذا الاسم</p>
                      <button
                        type="button"
                        onClick={() => setShowAddTenantModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <FaPlus className="w-4 h-4" />
                        إضافة مستأجر جديد
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* معلومات المستأجر المختار */}
              {selectedTenant && (
                <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <FaCheck className="w-5 h-5 text-green-600" />
                    المستأجر المختار
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-purple-600">الاسم:</span>
                      <p className="font-semibold text-purple-900">{selectedTenant.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-purple-600">البريد:</span>
                      <p className="font-semibold text-purple-900">{selectedTenant.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-purple-600">الهاتف:</span>
                      <p className="font-semibold text-purple-900">{selectedTenant.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-purple-600">الرقم التعريفي:</span>
                      <p className="font-semibold text-purple-900">{selectedTenant.id}</p>
                    </div>
                  </div>
                </div>
              )}
            
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
                  disabled={!selectedTenant}
                >
                  التالي
                  <FaArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
            
            {/* Modal إضافة مستأجر جديد */}
            <AddTenantModal
              isOpen={showAddTenantModal}
              onClose={() => {
                setShowAddTenantModal(false);
                setError(null);
              }}
              onSubmit={addNewTenant}
              loading={loading}
              error={error}
            />
          </>
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
            
            {/* القسم 1: التواريخ والمدة */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendar className="text-orange-600" />
                التواريخ والمدة
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>
            </div>
            
            {/* القسم 2: المبالغ المالية */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                المبالغ المالية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMoneyBillWave className="inline ml-2" />
                    رسوم البلدية (3% من إجمالي العقد)
                  </label>
                  <input
                    type="number"
                    value={formData.municipalityFees}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 cursor-not-allowed font-bold text-green-700"
                    readOnly
                    suppressHydrationWarning
                  />
                  <div className="absolute top-11 left-3 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                    محسوب تلقائياً ✓
                  </div>
                </div>
              </div>
            </div>
            
            {/* القسم 3: طرق الدفع */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-blue-600" />
                طرق الدفع
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة دفع الإيجار
                  </label>
                  <select
                    value={formData.rentPaymentMethod}
                    onChange={(e) => handleInputChange('rentPaymentMethod', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="cash">نقداً</option>
                    <option value="check">شيك</option>
                    <option value="bank_transfer">تحويل في الحساب</option>
                    <option value="electronic_payment">دفع إلكتروني</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة دفع الضمان
                  </label>
                  <select
                    value={formData.depositPaymentMethod}
                    onChange={(e) => handleInputChange('depositPaymentMethod', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="cash">نقداً</option>
                    <option value="check">شيك</option>
                    <option value="bank_transfer">تحويل في الحساب</option>
                    <option value="electronic_payment">دفع إلكتروني</option>
                  </select>
                </div>
                
                {formData.depositPaymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الإيصال لمبلغ الضمان النقدي
                    </label>
                    <input
                      type="text"
                      value={formData.cashReceiptNumber}
                      onChange={(e) => handleInputChange('cashReceiptNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="أدخل رقم الإيصال"
                    />
                  </div>
                )}
                
                {formData.depositPaymentMethod === 'check' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الشيك للضمان
                    </label>
                    <input
                      type="text"
                      value={formData.depositCheckNumber}
                      onChange={(e) => handleInputChange('depositCheckNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="أدخل رقم الشيك"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* القسم 4: أرقام المستندات */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFileAlt className="text-purple-600" />
                أرقام المستندات الرسمية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم استمارة عقد الإيجار للبلدية
                  </label>
                  <input
                    type="text"
                    value={formData.municipalityFormNumber}
                    onChange={(e) => handleInputChange('municipalityFormNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="أدخل رقم الاستمارة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم عقد الإيجار المعتمد من البلدية
                  </label>
                  <input
                    type="text"
                    value={formData.municipalityContractNumber}
                    onChange={(e) => handleInputChange('municipalityContractNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="أدخل رقم العقد المعتمد"
                  />
                </div>
              </div>
            </div>
            
            {/* القسم 5: فترة السماح */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-indigo-600" />
                فترة السماح
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد أيام السماح
                  </label>
                  <input
                    type="number"
                    value={formData.gracePeriodDays}
                    onChange={(e) => handleInputChange('gracePeriodDays', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    max="30"
                    placeholder="0"
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مبلغ السماح ({formData.currency})
                  </label>
                  <input
                    type="number"
                    value={formData.gracePeriodAmount}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 cursor-not-allowed font-bold text-green-700"
                    readOnly
                    suppressHydrationWarning
                  />
                  <div className="absolute top-11 left-3 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                    محسوب تلقائياً ✓
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 <strong>ملاحظة:</strong> يتم حساب مبلغ السماح بناءً على: (الإيجار الشهري ÷ 30) × عدد أيام السماح
              </div>
            </div>
            
            {/* القسم 6: قراءات العدادات */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-yellow-600" />
                قراءات العدادات أثناء الاستئجار
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قراءة عداد الكهرباء
                  </label>
                  <input
                    type="text"
                    value={formData.electricityMeterReading}
                    onChange={(e) => handleInputChange('electricityMeterReading', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="أدخل القراءة الحالية للكهرباء"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قراءة عداد الماء
                  </label>
                  <input
                    type="text"
                    value={formData.waterMeterReading}
                    onChange={(e) => handleInputChange('waterMeterReading', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="أدخل القراءة الحالية للماء"
                  />
                </div>
              </div>
            </div>
            
            {/* القسم 7: رسوم الإنترنت */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaGlobe className="text-cyan-600" />
                رسوم الإنترنت
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل الإنترنت مشمول في الإيجار؟
                  </label>
                  <select
                    value={formData.internetIncluded ? 'yes' : 'no'}
                    onChange={(e) => {
                      const included = e.target.value === 'yes';
                      handleInputChange('internetIncluded', included);
                      if (!included) {
                        handleInputChange('internetFees', 0);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="no">لا (مجاني أو على المستأجر)</option>
                    <option value="yes">نعم (مشمول في الإيجار)</option>
                  </select>
                </div>
                
                {formData.internetIncluded && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مقدار رسوم الإنترنت ({formData.currency})
                    </label>
                    <input
                      type="number"
                      value={formData.internetFees}
                      onChange={(e) => handleInputChange('internetFees', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* القسم 8: رسوم أخرى */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-red-600" />
                رسوم أخرى
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل هناك رسوم أخرى؟
                  </label>
                  <select
                    value={formData.hasOtherFees ? 'yes' : 'no'}
                    onChange={(e) => {
                      const hasFees = e.target.value === 'yes';
                      handleInputChange('hasOtherFees', hasFees);
                      if (!hasFees) {
                        handleInputChange('otherFeesDescription', '');
                        handleInputChange('otherFeesAmount', 0);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم</option>
                  </select>
                </div>
                
                {formData.hasOtherFees && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف الرسوم الأخرى
                      </label>
                      <input
                        type="text"
                        value={formData.otherFeesDescription}
                        onChange={(e) => handleInputChange('otherFeesDescription', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="مثال: رسوم الصيانة، رسوم التأمين، إلخ"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مقدار الرسوم الأخرى ({formData.currency})
                      </label>
                      <input
                        type="number"
                        value={formData.otherFeesAmount}
                        onChange={(e) => handleInputChange('otherFeesAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* القسم 9: الضريبة المضافة */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaDollarSign className="text-orange-600" />
                الضريبة المضافة (VAT)
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل الإيجار مشمول بالضريبة المضافة؟
                  </label>
                  <select
                    value={formData.includesVAT ? 'yes' : 'no'}
                    onChange={(e) => handleInputChange('includesVAT', e.target.value === 'yes')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم</option>
                  </select>
                </div>
                
                {formData.includesVAT && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-900 mb-1">ملاحظة مهمة</p>
                        <p className="text-sm text-yellow-800">
                          سيتم إضافة الضريبة المضافة (5%) على إجمالي المبلغ في الفاتورة النهائية.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* القسم 10: الشروط والأحكام الإضافية */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFileAlt className="text-gray-600" />
                الشروط والأحكام الإضافية
              </h4>
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
      
      {/* Modal تحذير البيانات الإضافية - خارج الـ form */}
      {showAdditionalDataWarning && selectedProperty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header - مضغوط */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaFileAlt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">⚠️ بيانات العقار الإضافية مطلوبة</h3>
                  <p className="text-xs opacity-90">يجب إكمال البيانات قبل المتابعة</p>
                </div>
              </div>
            </div>
            
            {/* Body - قابل للتمرير */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900 text-sm mb-1">لا يمكن المتابعة</p>
                    <p className="text-xs text-yellow-800">
                      البيانات الإضافية ضرورية لعقد قانوني صحيح
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">{additionalDataStatus?.missing?.length || 0}</span>
                  </div>
                  البيانات الناقصة:
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {additionalDataStatus?.missing?.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-red-800 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-blue-800">
                    <p className="font-semibold mb-1">البيانات المطلوبة:</p>
                    <ul className="list-disc list-inside space-y-0.5 mr-3">
                      <li>بيانات المالك</li>
                      <li>حساب الكهرباء</li>
                      <li>حساب المياه</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer - مضغوط */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAdditionalDataWarning(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                  >
                    إلغاء
                  </button>
                  <InstantLink
                    href={`/properties/${selectedProperty.id}/additional?returnUrl=${encodeURIComponent('/rentals/new')}&step=2`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <FaFileAlt className="w-4 h-4" />
                    إكمال البيانات
                  </InstantLink>
                </div>
                
                <button
                  onClick={() => {
                    setShowAdditionalDataWarning(false);
                    setCurrentStep(3);
                  }}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <FaExclamationTriangle className="w-4 h-4" />
                  المتابعة بدون البيانات
                </button>
                <p className="text-xs text-center text-gray-500">
                  ⚠️ غير موصى به
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

                    إلغاء
                  </button>
                  <InstantLink
                    href={`/properties/${selectedProperty.id}/additional?returnUrl=${encodeURIComponent('/rentals/new')}&step=2`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <FaFileAlt className="w-4 h-4" />
                    إكمال البيانات
                  </InstantLink>
                </div>
                
                <button
                  onClick={() => {
                    setShowAdditionalDataWarning(false);
                    setCurrentStep(3);
                  }}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <FaExclamationTriangle className="w-4 h-4" />
                  المتابعة بدون البيانات
                </button>
                <p className="text-xs text-center text-gray-500">
                  ⚠️ غير موصى به
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
