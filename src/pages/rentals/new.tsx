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
  FaGlobe, FaFlag, FaExclamationTriangle, FaInfoCircle, FaKey, FaTimes, FaFilter, FaRuler
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
  // معلومات المالك
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  // البيانات الإضافية للعقار
  complexName?: string;
  complexNumber?: string;
  streetName?: string;
  roadNumber?: string;
  surveyNumber?: string;
  plotNumber?: string;
  squareNumber?: string;
  blockNumber?: string;
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
  contractType: 'residential' | 'commercial'; // نوع العقد
  actualRentalDate: string; // تاريخ الاستئجار الفعلي
  unitHandoverDate: string; // تاريخ استلام الوحدة
  startDate: string; // تاريخ بدء العقد
  endDate: string;
  duration: number; // بالأشهر
  
  // حساب الإيجار
  calculateByArea: boolean; // حساب الإيجار بالمتر أو مباشرة
  rentArea: number; // المساحة (متر مربع)
  pricePerMeter: number; // السعر للمتر
  monthlyRent: number; // محسوب تلقائياً إذا calculateByArea = true
  
  deposit: number;
  currency: string;
  
  // رسوم البلدية (محسوبة تلقائياً)
  municipalityFees: number;
  
  // طرق الدفع
  rentPaymentMethod: 'cash' | 'check' | 'bank_transfer' | 'electronic_payment';
  depositPaymentMethod: 'cash' | 'check' | 'bank_transfer' | 'electronic_payment' | 'cash_and_check';
  
  // أرقام الإيصالات
  rentReceiptNumber: string; // رقم إيصال الإيجار
  depositReceiptNumber: string; // رقم إيصال الضمان
  
  // المبلغ النقدي للضمان (في حالة نقدي + شيك)
  depositCashAmount: number;
  depositCashDate: string;
  depositCashReceiptNumber: string;
  
  // شيكات الإيجار (متعددة)
  rentChecks: Array<{
    checkNumber: string;
    amount: number;
    date: string;
  }>;
  
  // معلومات مالك شيكات الإيجار (مرة واحدة لجميع الشيكات)
  rentChecksOwnerType: 'tenant' | 'other_individual' | 'company';
  rentChecksOwnerName: string;
  // معلومات البنك
  rentChecksBankName: string;
  rentChecksBankBranch: string;
  rentChecksBankAccount: string;
  // للأفراد
  rentChecksNationalId: string;
  rentChecksNationalIdExpiry: string;
  rentChecksNationalIdFile: string;
  rentChecksIsOmani: boolean;
  rentChecksPassportNumber: string;
  rentChecksPassportExpiry: string;
  rentChecksPassportFile: string;
  // للشركات
  rentChecksCommercialRegister: string;
  rentChecksCommercialRegisterFile: string;
  rentChecksAuthorizedPersonName: string;
  rentChecksAuthorizedPersonId: string;
  rentChecksAuthorizedPersonIdExpiry: string;
  rentChecksAuthorizedPersonIdFile: string;
  rentChecksAuthorizedPersonIsOmani: boolean;
  rentChecksAuthorizedPersonPassport: string;
  rentChecksAuthorizedPersonPassportExpiry: string;
  rentChecksAuthorizedPersonPassportFile: string;
  
  // شيكات الضمان (متعددة - قد تكون بدون تاريخ)
  depositChecks: Array<{
    checkNumber: string;
    amount: number;
    date: string;
    hasDate: boolean;
  }>;
  
  // معلومات مالك شيكات الضمان (مرة واحدة لجميع الشيكات)
  depositChecksOwnerType: 'tenant' | 'other_individual' | 'company';
  depositChecksOwnerName: string;
  // معلومات البنك
  depositChecksBankName: string;
  depositChecksBankBranch: string;
  depositChecksBankAccount: string;
  // للأفراد
  depositChecksNationalId: string;
  depositChecksNationalIdExpiry: string;
  depositChecksNationalIdFile: string;
  depositChecksIsOmani: boolean;
  depositChecksPassportNumber: string;
  depositChecksPassportExpiry: string;
  depositChecksPassportFile: string;
  // للشركات
  depositChecksCommercialRegister: string;
  depositChecksCommercialRegisterFile: string;
  depositChecksAuthorizedPersonName: string;
  depositChecksAuthorizedPersonId: string;
  depositChecksAuthorizedPersonIdExpiry: string;
  depositChecksAuthorizedPersonIdFile: string;
  depositChecksAuthorizedPersonIsOmani: boolean;
  depositChecksAuthorizedPersonPassport: string;
  depositChecksAuthorizedPersonPassportExpiry: string;
  depositChecksAuthorizedPersonPassportFile: string;
  
  // أرقام المستندات
  municipalityFormNumber: string; // رقم استمارة عقد الإيجار للبلدية
  municipalityFormFile: string; // نسخة ورقية من الاستمارة
  municipalityContractNumber: string; // رقم عقد الإيجار المعتمد من البلدية
  municipalityContractFile: string; // نسخة ورقية من العقد المعتمد
  municipalityRegistrationFee: number; // رسوم تسجيل العقد (1 ريال عادة)
  
  // فترة السماح
  gracePeriodDays: number;
  gracePeriodAmount: number; // محسوب تلقائياً
  
  // قراءات العدادات
  electricityMeterReading: string;
  electricityBillAmount: number; // مبلغ فاتورة الكهرباء
  electricityMeterImage: string; // صورة عداد الكهرباء
  electricityBillImage: string; // صورة فاتورة الكهرباء
  waterMeterReading: string;
  waterBillAmount: number; // مبلغ فاتورة الماء
  waterMeterImage: string; // صورة عداد الماء
  waterBillImage: string; // صورة فاتورة الماء
  
  // رسوم الإنترنت
  internetIncluded: boolean; // true = يدفعها المستأجر للمالك، false = على مسؤولية المستأجر
  internetPaymentType: 'monthly' | 'annually'; // شهري أو سنوي
  internetFees: number;
  
  // تاريخ استحقاق الإيجار
  rentDueDay: number; // اليوم من الشهر (1-31)
  
  // رسوم أخرى
  hasOtherFees: boolean;
  otherFeesDescription: string;
  otherFeesAmount: number;
  
  // الضريبة المضافة
  includesVAT: boolean;
  vatRate: number; // نسبة الضريبة (5% = 0.05)
  monthlyVATAmount: number; // قيمة الضريبة الشهرية
  totalVATAmount: number; // إجمالي الضريبة
  
  // ضرائب أخرى
  hasOtherTaxes: boolean;
  otherTaxName: string; // مسمى الضريبة
  otherTaxRate: number; // نسبة الضريبة
  monthlyOtherTaxAmount: number; // قيمة الضريبة الشهرية
  totalOtherTaxAmount: number; // إجمالي الضريبة
  
  // إيجارات شهرية مخصصة (للسماح بتعديل كل شهر)
  useCustomMonthlyRents: boolean;
  customMonthlyRents: number[]; // مصفوفة بطول duration
  
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
    contractType: 'residential',
    actualRentalDate: '',
    unitHandoverDate: '',
    startDate: '', // سيتم تعيينه في useEffect
    endDate: '',
    duration: 12,
    calculateByArea: false,
    rentArea: 0,
    pricePerMeter: 0,
    monthlyRent: 0,
    deposit: 0,
    currency: 'OMR',
    municipalityFees: 0,
    rentPaymentMethod: 'cash',
    depositPaymentMethod: 'cash',
    rentReceiptNumber: '',
    depositReceiptNumber: '',
    depositCashAmount: 0,
    depositCashDate: '',
    depositCashReceiptNumber: '',
    rentChecks: [],
    rentChecksOwnerType: 'tenant',
    rentChecksOwnerName: '',
    rentChecksBankName: '',
    rentChecksBankBranch: '',
    rentChecksBankAccount: '',
    rentChecksNationalId: '',
    rentChecksNationalIdExpiry: '',
    rentChecksNationalIdFile: '',
    rentChecksIsOmani: true,
    rentChecksPassportNumber: '',
    rentChecksPassportExpiry: '',
    rentChecksPassportFile: '',
    rentChecksCommercialRegister: '',
    rentChecksCommercialRegisterFile: '',
    rentChecksAuthorizedPersonName: '',
    rentChecksAuthorizedPersonId: '',
    rentChecksAuthorizedPersonIdExpiry: '',
    rentChecksAuthorizedPersonIdFile: '',
    rentChecksAuthorizedPersonIsOmani: true,
    rentChecksAuthorizedPersonPassport: '',
    rentChecksAuthorizedPersonPassportExpiry: '',
    rentChecksAuthorizedPersonPassportFile: '',
    depositChecks: [],
    depositChecksOwnerType: 'tenant',
    depositChecksOwnerName: '',
    depositChecksBankName: '',
    depositChecksBankBranch: '',
    depositChecksBankAccount: '',
    depositChecksNationalId: '',
    depositChecksNationalIdExpiry: '',
    depositChecksNationalIdFile: '',
    depositChecksIsOmani: true,
    depositChecksPassportNumber: '',
    depositChecksPassportExpiry: '',
    depositChecksPassportFile: '',
    depositChecksCommercialRegister: '',
    depositChecksCommercialRegisterFile: '',
    depositChecksAuthorizedPersonName: '',
    depositChecksAuthorizedPersonId: '',
    depositChecksAuthorizedPersonIdExpiry: '',
    depositChecksAuthorizedPersonIdFile: '',
    depositChecksAuthorizedPersonIsOmani: true,
    depositChecksAuthorizedPersonPassport: '',
    depositChecksAuthorizedPersonPassportExpiry: '',
    depositChecksAuthorizedPersonPassportFile: '',
    municipalityFormNumber: '',
    municipalityFormFile: '',
    municipalityContractNumber: '',
    municipalityContractFile: '',
    municipalityRegistrationFee: 1, // رسوم التسجيل 1 ريال
    gracePeriodDays: 0,
    gracePeriodAmount: 0,
    electricityMeterReading: '',
    electricityBillAmount: 0,
    electricityMeterImage: '',
    electricityBillImage: '',
    waterMeterReading: '',
    waterBillAmount: 0,
    waterMeterImage: '',
    waterBillImage: '',
    internetIncluded: false,
    internetPaymentType: 'monthly',
    internetFees: 0,
    rentDueDay: 1, // أول يوم من الشهر افتراضياً
    hasOtherFees: false,
    otherFeesDescription: '',
    otherFeesAmount: 0,
    includesVAT: false,
    vatRate: 0.05, // 5% افتراضياً
    monthlyVATAmount: 0,
    totalVATAmount: 0,
    hasOtherTaxes: false,
    otherTaxName: '',
    otherTaxRate: 0,
    monthlyOtherTaxAmount: 0,
    totalOtherTaxAmount: 0,
    useCustomMonthlyRents: false,
    customMonthlyRents: [],
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
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [existingContract, setExistingContract] = useState<any | null>(null);
  const [showExistingContractModal, setShowExistingContractModal] = useState(false);
  
  // فلاتر البحث المتقدم
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [propertyFilterType, setPropertyFilterType] = useState<string>('');
  const [propertyFilterProvince, setPropertyFilterProvince] = useState<string>('');
  const [propertyFilterState, setPropertyFilterState] = useState<string>('');
  const [propertyFilterCity, setPropertyFilterCity] = useState<string>('');
  const [propertyFilterOwner, setPropertyFilterOwner] = useState<string>('');
  const [propertyFilterStatus, setPropertyFilterStatus] = useState<string>('');
  const [propertyFilterSerialNumber, setPropertyFilterSerialNumber] = useState<string>('');
  const [propertyFilterPropertyId, setPropertyFilterPropertyId] = useState<string>('');
  const [propertyFilterPlotNumber, setPropertyFilterPlotNumber] = useState<string>('');
  
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
  
  // تعيين hasMounted و startDate بعد تحميل الصفحة + استرجاع المسودة
  useEffect(() => {
    setHasMounted(true);
    
    // محاولة استرجاع المسودة من localStorage
    try {
      const savedDraft = localStorage.getItem('rentalContractDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        console.log('📄 تم استرجاع المسودة المحفوظة');
        setFormData(prev => ({ ...prev, ...draft }));
      } else {
        setFormData(prev => ({
          ...prev,
          startDate: new Date().toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('خطأ في استرجاع المسودة:', error);
      setFormData(prev => ({
        ...prev,
        startDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, []);
  
  // حفظ تلقائي للمسودة عند أي تغيير
  useEffect(() => {
    if (hasMounted) {
      try {
        localStorage.setItem('rentalContractDraft', JSON.stringify(formData));
        console.log('💾 تم حفظ المسودة تلقائياً');
      } catch (error) {
        console.error('خطأ في حفظ المسودة:', error);
      }
    }
  }, [formData, hasMounted]);
  
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
      // طرح يوم واحد لأن العقد ينتهي قبل يوم من إكمال المدة
      // مثال: بداية 01/12/2025 + 12 شهر = 30/11/2026 (وليس 01/12/2026)
      endDate.setDate(endDate.getDate() - 1);
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, formData.duration]);
  
  // حساب الإيجار الشهري تلقائياً إذا كان الحساب بالمتر
  useEffect(() => {
    if (formData.calculateByArea && formData.rentArea && formData.pricePerMeter) {
      const calculatedRent = formData.rentArea * formData.pricePerMeter;
      setFormData(prev => ({
        ...prev,
        monthlyRent: Math.round(calculatedRent * 1000) / 1000
      }));
    }
  }, [formData.calculateByArea, formData.rentArea, formData.pricePerMeter]);
  
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
  
  // حساب الضريبة المضافة تلقائياً
  useEffect(() => {
    if (formData.includesVAT && formData.monthlyRent) {
      const monthlyVAT = formData.monthlyRent * formData.vatRate;
      const totalVAT = monthlyVAT * formData.duration;
      setFormData(prev => ({
        ...prev,
        monthlyVATAmount: Math.round(monthlyVAT * 1000) / 1000,
        totalVATAmount: Math.round(totalVAT * 1000) / 1000
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        monthlyVATAmount: 0,
        totalVATAmount: 0
      }));
    }
  }, [formData.includesVAT, formData.monthlyRent, formData.duration, formData.vatRate]);
  
  // حساب الضرائب الأخرى تلقائياً
  useEffect(() => {
    if (formData.hasOtherTaxes && formData.monthlyRent && formData.otherTaxRate) {
      const monthlyTax = formData.monthlyRent * formData.otherTaxRate;
      const totalTax = monthlyTax * formData.duration;
      setFormData(prev => ({
        ...prev,
        monthlyOtherTaxAmount: Math.round(monthlyTax * 1000) / 1000,
        totalOtherTaxAmount: Math.round(totalTax * 1000) / 1000
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        monthlyOtherTaxAmount: 0,
        totalOtherTaxAmount: 0
      }));
    }
  }, [formData.hasOtherTaxes, formData.monthlyRent, formData.duration, formData.otherTaxRate]);
  
  // تحديث مصفوفة الإيجارات المخصصة عند تغيير المدة أو الإيجار الشهري
  useEffect(() => {
    if (formData.duration > 0 && formData.monthlyRent > 0) {
      const currentLength = formData.customMonthlyRents.length;
      if (currentLength !== formData.duration) {
        const newRents = Array(formData.duration).fill(formData.monthlyRent);
        // إذا كانت هناك قيم مخصصة سابقة، احتفظ بها
        for (let i = 0; i < Math.min(currentLength, formData.duration); i++) {
          if (formData.customMonthlyRents[i]) {
            newRents[i] = formData.customMonthlyRents[i];
          }
        }
        setFormData(prev => ({
          ...prev,
          customMonthlyRents: newRents
        }));
      }
    }
  }, [formData.duration, formData.monthlyRent]);
  
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
  
  const searchProperties = async (query?: string, searchType?: typeof formData.searchType) => {
    const searchQuery = (query || formData.searchQuery).trim();
    const currentSearchType = searchType || formData.searchType;
    
    if (!searchQuery) {
      setFilteredProperties([]);
      setHasSearched(false);
      return;
    }
    
    setSearching(true);
    setError(null);
    setHasSearched(true);
    
    try {
      let searchResults: Property[] = [];
      const lowerQuery = searchQuery.toLowerCase();
      
      switch (currentSearchType) {
        case 'buildingNumber':
          searchResults = properties.filter(p => {
            const buildingNum = (p.buildingNumber || '').toString().toLowerCase();
            const propId = (p.id || '').toString().toLowerCase();
            return buildingNum.includes(lowerQuery) || propId.includes(lowerQuery);
          });
          break;
          
        case 'ownerId':
          searchResults = properties.filter(p => {
            const owner = (p.ownerId || '').toString().toLowerCase();
            const propId = (p.id || '').toString().toLowerCase();
            return owner.includes(lowerQuery) || propId.includes(lowerQuery);
          });
          break;
          
        case 'serialNumber':
          searchResults = properties.filter(p => {
            const serial = (p.serialNumber || '').toString().toLowerCase();
            const propId = (p.id || '').toString().toLowerCase();
            return serial.includes(lowerQuery) || propId.includes(lowerQuery);
          });
          break;
          
        case 'propertyId':
          searchResults = properties.filter(p => {
            const propId = (p.id || '').toString().toLowerCase();
            const titleAr = (p.titleAr || '').toString().toLowerCase();
            const address = (p.address || '').toString().toLowerCase();
            return propId.includes(lowerQuery) || titleAr.includes(lowerQuery) || address.includes(lowerQuery);
          });
          break;
          
        default:
          searchResults = properties.filter(p => {
            const propId = (p.id || '').toString().toLowerCase();
            const titleAr = (p.titleAr || '').toString().toLowerCase();
            const address = (p.address || '').toString().toLowerCase();
            const buildingNum = (p.buildingNumber || '').toString().toLowerCase();
            return propId.includes(lowerQuery) || titleAr.includes(lowerQuery) || address.includes(lowerQuery) || buildingNum.includes(lowerQuery);
          });
      }
      
      setFilteredProperties(searchResults);
      
      if (searchResults.length === 0) {
        setError('لم يتم العثور على عقارات تطابق معايير البحث');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      setError('حدث خطأ أثناء البحث');
    } finally {
      setSearching(false);
    }
  };
  
  const selectProperty = async (property: Property) => {
    setError(null);
    setExistingContract(null);
    
    // التحقق من وجود عقد سابق للعقار
    try {
      console.log('🔍 التحقق من وجود عقد سابق للعقار:', property.id);
      const rentalsResponse = await fetch('/api/rentals');
      
      if (rentalsResponse.ok) {
        const rentalsData = await rentalsResponse.json();
        const allRentals = Array.isArray(rentalsData?.items) ? rentalsData.items : [];
        
        // البحث عن عقد نشط أو محجوز أو مؤجر لهذا العقار
        // ملاحظة: عند اختيار العقار فقط، نتحقق من العقود التي لا تحتوي على unitId (عقارات مفردة)
        // أما عند اختيار وحدة معينة، سيتم التحقق في selectUnit
        const existing = allRentals.find((rental: any) => {
          const matchesProperty = rental.propertyId === property.id;
          const activeState = rental.state && 
            ['active', 'reserved', 'paid', 'docs_submitted', 'docs_verified', 'handover_completed'].includes(rental.state) &&
            rental.state !== 'cancelled' &&
            rental.state !== 'expired';
          // للعقارات المفردة (لا تحتوي على وحدات)، نتحقق من العقود بدون unitId
          const isSingleProperty = property.buildingType === 'single';
          return matchesProperty && activeState && (isSingleProperty ? !rental.unitId : true);
        });
        
        if (existing) {
          console.log('⚠️ تم العثور على عقد سابق:', existing);
          setExistingContract(existing);
          setShowExistingContractModal(true);
          return; // إيقاف عملية الاختيار حتى يتم إلغاء العقد أو إغلاق النافذة
        } else {
          console.log('✅ لا يوجد عقد سابق نشط للعقار');
        }
      }
    } catch (err) {
      console.error('❌ خطأ في التحقق من العقود السابقة:', err);
      // نواصل العملية حتى لو فشل التحقق
    }
    
    setSelectedProperty(property);
    setFormData(prev => ({ ...prev, propertyId: property.id }));
    
    // جلب البيانات الإضافية للعقار
    try {
      console.log('🔍 جلب البيانات الإضافية للعقار:', property.id);
      const additionalResponse = await fetch(`/api/properties/${property.id}/additional`);
      
      if (additionalResponse.ok) {
        const additionalData = await additionalResponse.json();
        console.log('✅ تم جلب البيانات الإضافية:', additionalData);
        
        // استخراج البيانات من البنية المتداخلة
        const ownerData = additionalData.ownerData || {};
        const propertyData = additionalData.propertyData || {};
        
        console.log('📦 بيانات المالك:', ownerData);
        console.log('📦 بيانات العقار:', propertyData);
        
        // دمج البيانات الإضافية مع بيانات العقار
        // ملاحظة: الأسماء في additional.tsx هي: fullName, nationalId, phone, email
        const enhancedProperty = {
          ...property,
          // بيانات المالك (من OwnerData في additional.tsx)
          ownerName: ownerData.fullName || property.ownerName,
          ownerPhone: ownerData.phone || property.ownerPhone,
          ownerEmail: ownerData.email || property.ownerEmail,
          ownerId: ownerData.nationalId || property.ownerId,
          // البيانات الإضافية للعقار (من PropertyData في additional.tsx)
          complexName: propertyData.complexName, // قد لا يكون موجوداً
          complexNumber: propertyData.complexNumber,
          streetName: propertyData.streetName,
          roadNumber: propertyData.roadNumber,
          surveyNumber: propertyData.surveyNumber,
          plotNumber: propertyData.plotNumber,
          squareNumber: propertyData.squareNumber,
          blockNumber: propertyData.blockNumber, // قد لا يكون موجوداً
          buildingNumber: propertyData.buildingNumber,
          serialNumber: property.serialNumber || propertyData.buildingNumber, // من البيانات الأساسية
        };
        
        setSelectedProperty(enhancedProperty);
        console.log('🎉 تم تحديث بيانات العقار بالبيانات الإضافية:', enhancedProperty);
      } else {
        console.log('⚠️ لم يتم العثور على بيانات إضافية للعقار');
      }
    } catch (err) {
      console.error('❌ خطأ في جلب البيانات الإضافية:', err);
      // نواصل حتى لو فشل جلب البيانات الإضافية
    }
    
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
  
  const selectUnit = async (unit: Unit) => {
    setError(null);
    setExistingContract(null);
    
    // التحقق من وجود عقد سابق للوحدة
    if (!selectedProperty) return;
    
    try {
      console.log('🔍 التحقق من وجود عقد سابق للوحدة:', unit.id);
      const rentalsResponse = await fetch('/api/rentals');
      
      if (rentalsResponse.ok) {
        const rentalsData = await rentalsResponse.json();
        const allRentals = Array.isArray(rentalsData?.items) ? rentalsData.items : [];
        
        // البحث عن عقد نشط أو محجوز أو مؤجر لهذه الوحدة
        const existing = allRentals.find((rental: any) => {
          // التحقق من مطابقة الوحدة
          const matchesUnit = rental.unitId === unit.id;
          // التحقق من مطابقة العقار
          const matchesProperty = rental.propertyId === selectedProperty.id;
          // التحقق من الحالة
          const activeState = rental.state && 
            ['active', 'reserved', 'paid', 'docs_submitted', 'docs_verified', 'handover_completed'].includes(rental.state) &&
            rental.state !== 'cancelled' &&
            rental.state !== 'expired';
          
          return (matchesUnit || (matchesProperty && !rental.unitId)) && activeState;
        });
        
        if (existing) {
          console.log('⚠️ تم العثور على عقد سابق للوحدة:', existing);
          setExistingContract(existing);
          setShowExistingContractModal(true);
          return; // إيقاف عملية الاختيار حتى يتم إلغاء العقد أو إغلاق النافذة
        } else {
          console.log('✅ لا يوجد عقد سابق نشط للوحدة');
        }
      }
    } catch (err) {
      console.error('❌ خطأ في التحقق من العقود السابقة للوحدة:', err);
      // نواصل العملية حتى لو فشل التحقق
    }
    
    setSelectedUnit(unit);
    setFormData(prev => ({ 
      ...prev, 
      unitId: unit.id,
      monthlyRent: parseFloat(unit.rentalPrice || unit.price || '0')
    }));
  };
  
  // دالة للحصول على عنوان العقار
  const getTitleFromProperty = (property: Property): string => {
    if (property.titleAr) return property.titleAr;
    if (property.titleEn) return property.titleEn;
    if (property.title) {
      if (typeof property.title === 'string') return property.title;
      if (typeof property.title === 'object' && property.title) {
        return property.title.ar || property.title.en || '';
      }
    }
    return `العقار ${property.id}`;
  };

  // فلترة العقارات حسب الفلاتر المتقدمة
  const getFilteredPropertiesAdvanced = (): Property[] => {
    try {
      if (!properties || properties.length === 0) {
        return [];
      }
      
      let filtered = [...properties];
      
      // فلترة حسب البحث النصي
      if (propertySearchQuery && typeof propertySearchQuery === 'string' && propertySearchQuery.trim()) {
        const query = propertySearchQuery.toLowerCase();
        filtered = filtered.filter(p => {
          try {
            const title = getTitleFromProperty(p).toLowerCase();
            const address = (p.address || '').toLowerCase();
            const buildingNum = (p.buildingNumber || '').toString().toLowerCase();
            const propId = (p.id || '').toString().toLowerCase();
            const ownerId = (p.ownerId || '').toString().toLowerCase();
            const serial = (p.serialNumber || '').toString().toLowerCase();
            const plotNum = (p.plotNumber || '').toString().toLowerCase();
            const province = (p.province || '').toLowerCase();
            const state = (p.state || '').toLowerCase();
            const city = (p.city || '').toLowerCase();
            
            return title.includes(query) ||
                   address.includes(query) ||
                   buildingNum.includes(query) ||
                   propId.includes(query) ||
                   ownerId.includes(query) ||
                   serial.includes(query) ||
                   plotNum.includes(query) ||
                   province.includes(query) ||
                   state.includes(query) ||
                   city.includes(query);
          } catch (err) {
            console.error('Error filtering property:', err, p);
            return false;
          }
        });
      }
      
      // فلترة حسب نوع العقار
      if (propertyFilterType && propertyFilterType.trim()) {
        filtered = filtered.filter(p => p.type === propertyFilterType);
      }
      
      // فلترة حسب الموقع (محافظة → ولاية → مدينة/حي)
      if (propertyFilterProvince && propertyFilterProvince.trim()) {
        filtered = filtered.filter(p => {
          try {
            const provinceMatch = p.province && p.province.toLowerCase() === propertyFilterProvince.toLowerCase();
            if (!provinceMatch) return false;
            
            // إذا تم اختيار ولاية محددة
            if (propertyFilterState && propertyFilterState.trim() && propertyFilterState !== 'all') {
              const stateMatch = p.state && p.state.toLowerCase() === propertyFilterState.toLowerCase();
              if (!stateMatch) return false;
              
              // إذا تم اختيار مدينة/حي محددة
              if (propertyFilterCity && propertyFilterCity.trim() && propertyFilterCity !== 'all') {
                const cityMatch = p.city && p.city.toLowerCase() === propertyFilterCity.toLowerCase();
                return cityMatch;
              }
              return true; // تم اختيار المحافظة والولاية فقط
            }
            return true; // تم اختيار المحافظة فقط
          } catch (err) {
            return false;
          }
        });
      }
      
      // فلترة حسب المالك
      if (propertyFilterOwner && propertyFilterOwner.trim()) {
        filtered = filtered.filter(p => 
          (p.ownerId || '').toString().toLowerCase().includes(propertyFilterOwner.toLowerCase())
        );
      }
      
      // فلترة حسب الحالة
      if (propertyFilterStatus && propertyFilterStatus.trim()) {
        filtered = filtered.filter(p => p.status === propertyFilterStatus);
      }
      
      // فلترة حسب الرقم المتسلسل
      if (propertyFilterSerialNumber && propertyFilterSerialNumber.trim()) {
        filtered = filtered.filter(p => 
          (p.serialNumber || '').toString().toLowerCase().includes(propertyFilterSerialNumber.toLowerCase())
        );
      }
      
      // فلترة حسب رقم العقار (ID)
      if (propertyFilterPropertyId && propertyFilterPropertyId.trim()) {
        filtered = filtered.filter(p => 
          (p.id || '').toString().toLowerCase().includes(propertyFilterPropertyId.toLowerCase())
        );
      }
      
      // فلترة حسب رقم الأرض
      if (propertyFilterPlotNumber && propertyFilterPlotNumber.trim()) {
        filtered = filtered.filter(p => 
          (p.plotNumber || '').toString().toLowerCase().includes(propertyFilterPlotNumber.toLowerCase())
        );
      }
      
      return filtered;
    } catch (error) {
      console.error('Error in getFilteredPropertiesAdvanced:', error);
      return properties || [];
    }
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
  
  // دالة مساعدة لتحديد ألوان الحقول الإلزامية
  const getRequiredFieldClasses = (value: any, baseClasses: string = '') => {
    // التحقق من القيم الفارغة بدقة
    let isEmpty = false;
    
    if (value === null || value === undefined) {
      isEmpty = true;
    } else if (typeof value === 'string') {
      isEmpty = value.trim() === '';
    } else if (typeof value === 'number') {
      // نسمح بجميع الأرقام بما فيها الصفر والكسور (0، 0.2، 0.5، 500.800، إلخ)
      // فقط نرفض NaN
      isEmpty = isNaN(value);
    } else if (Array.isArray(value)) {
      isEmpty = value.length === 0;
    }
    
    if (isEmpty) {
      // أحمر شفاف مع إطار أحمر للحقول الفارغة
      return `${baseClasses} bg-red-50 border-2 border-red-300 focus:border-red-500 focus:ring-red-500`;
    } else {
      // أخضر شفاف مع إطار أخضر للحقول المملوءة
      return `${baseClasses} bg-green-50 border-2 border-green-300 focus:border-green-500 focus:ring-green-500`;
    }
  };
  
  // دالة للتحقق من جميع الحقول المطلوبة في Step 4
  const validateStep4 = () => {
    const missingFields: Array<{ field: string; element?: string }> = [];
    
    // التحقق من الحقول الأساسية
    if (!formData.actualRentalDate) missingFields.push({ field: 'تاريخ الاستئجار الفعلي', element: 'actualRentalDate' });
    if (!formData.unitHandoverDate) missingFields.push({ field: 'تاريخ استلام الوحدة', element: 'unitHandoverDate' });
    if (!formData.startDate) missingFields.push({ field: 'تاريخ بدء العقد', element: 'startDate' });
    if (!formData.duration || formData.duration <= 0) missingFields.push({ field: 'مدة الإيجار', element: 'duration' });
    
    // التحقق من الإيجار (حسب طريقة الحساب)
    if (formData.calculateByArea) {
      if (!formData.rentArea || formData.rentArea <= 0) missingFields.push({ field: 'المساحة (متر مربع)', element: 'rentArea' });
      if (!formData.pricePerMeter || formData.pricePerMeter <= 0) missingFields.push({ field: 'السعر للمتر', element: 'pricePerMeter' });
    } else {
      if (formData.monthlyRent === null || formData.monthlyRent === undefined || formData.monthlyRent <= 0) {
        missingFields.push({ field: 'الإيجار الشهري', element: 'monthlyRent' });
      }
    }
    
    if (formData.deposit === null || formData.deposit === undefined || formData.deposit < 0) {
      missingFields.push({ field: 'مبلغ الضمان', element: 'deposit' });
    }
    if (!formData.rentDueDay || formData.rentDueDay <= 0) missingFields.push({ field: 'تاريخ استحقاق الإيجار', element: 'rentDueDay' });
    if (!formData.gracePeriodDays || formData.gracePeriodDays <= 0) missingFields.push({ field: 'فترة السماح (بالأيام)', element: 'gracePeriodDays' });
    
    // التحقق من طريقة دفع الإيجار
    if (!formData.rentPaymentMethod) missingFields.push({ field: 'طريقة دفع الإيجار', element: 'rentPaymentMethod' });
    if (formData.rentPaymentMethod === 'check') {
      if (formData.rentChecks.length === 0) missingFields.push({ field: 'شيكات الإيجار', element: 'rentChecks' });
      if (!formData.rentChecksBankName) missingFields.push({ field: 'اسم البنك (شيكات الإيجار)', element: 'rentChecksBankName' });
      if (!formData.rentChecksBankBranch) missingFields.push({ field: 'فرع البنك (شيكات الإيجار)', element: 'rentChecksBankBranch' });
      if (!formData.rentChecksBankAccount) missingFields.push({ field: 'رقم حساب البنك (شيكات الإيجار)', element: 'rentChecksBankAccount' });
      
      // التحقق من معلومات مالك الشيك
      if (formData.rentChecksOwnerType !== 'tenant') {
        if (!formData.rentChecksOwnerName) missingFields.push({ field: 'اسم مالك شيكات الإيجار', element: 'rentChecksOwnerName' });
        if (formData.rentChecksOwnerType === 'other_individual') {
          if (!formData.rentChecksNationalId) missingFields.push({ field: 'رقم البطاقة المدنية (شيكات الإيجار)', element: 'rentChecksNationalId' });
          if (!formData.rentChecksNationalIdFile) missingFields.push({ field: 'نسخة من البطاقة المدنية (شيكات الإيجار)' });
        } else if (formData.rentChecksOwnerType === 'company') {
          if (!formData.rentChecksCommercialRegister) missingFields.push({ field: 'رقم السجل التجاري (شيكات الإيجار)', element: 'rentChecksCommercialRegister' });
          if (!formData.rentChecksCommercialRegisterFile) missingFields.push({ field: 'نسخة من السجل التجاري (شيكات الإيجار)' });
        }
      }
    } else if (formData.rentPaymentMethod !== 'check') {
      if (!formData.rentReceiptNumber) missingFields.push({ field: 'رقم إيصال دفع الإيجار', element: 'rentReceiptNumber' });
    }
    
    // التحقق من طريقة دفع الضمان
    if (!formData.depositPaymentMethod) missingFields.push({ field: 'طريقة دفع الضمان', element: 'depositPaymentMethod' });
    if (formData.depositPaymentMethod === 'check' || formData.depositPaymentMethod === 'cash_and_check') {
      if (formData.depositChecks.length === 0) missingFields.push({ field: 'شيكات الضمان', element: 'depositChecks' });
      if (!formData.depositChecksBankName) missingFields.push({ field: 'اسم البنك (شيكات الضمان)', element: 'depositChecksBankName' });
      if (!formData.depositChecksBankBranch) missingFields.push({ field: 'فرع البنك (شيكات الضمان)', element: 'depositChecksBankBranch' });
      if (!formData.depositChecksBankAccount) missingFields.push({ field: 'رقم حساب البنك (شيكات الضمان)', element: 'depositChecksBankAccount' });
      
      // التحقق من معلومات مالك شيكات الضمان
      if (formData.depositChecksOwnerType !== 'tenant') {
        if (!formData.depositChecksOwnerName) missingFields.push({ field: 'اسم مالك شيكات الضمان', element: 'depositChecksOwnerName' });
        if (formData.depositChecksOwnerType === 'other_individual') {
          if (!formData.depositChecksNationalId) missingFields.push({ field: 'رقم البطاقة المدنية (شيكات الضمان)', element: 'depositChecksNationalId' });
          if (!formData.depositChecksNationalIdFile) missingFields.push({ field: 'نسخة من البطاقة المدنية (شيكات الضمان)' });
        } else if (formData.depositChecksOwnerType === 'company') {
          if (!formData.depositChecksCommercialRegister) missingFields.push({ field: 'رقم السجل التجاري (شيكات الضمان)', element: 'depositChecksCommercialRegister' });
          if (!formData.depositChecksCommercialRegisterFile) missingFields.push({ field: 'نسخة من السجل التجاري (شيكات الضمان)' });
        }
      }
    }
    if (formData.depositPaymentMethod === 'cash_and_check') {
      if (!formData.depositCashAmount || formData.depositCashAmount === 0) missingFields.push({ field: 'المبلغ النقدي للضمان', element: 'depositCashAmount' });
      if (!formData.depositCashReceiptNumber) missingFields.push({ field: 'رقم الإيصال النقدي للضمان', element: 'depositCashReceiptNumber' });
    }
    if (formData.depositPaymentMethod !== 'check' && formData.depositPaymentMethod !== 'cash_and_check') {
      if (!formData.depositReceiptNumber) missingFields.push({ field: 'رقم إيصال دفع الضمان', element: 'depositReceiptNumber' });
    }
    
    // التحقق من أرقام المستندات والمرفقات الإلزامية
    if (!formData.municipalityFormNumber) missingFields.push({ field: 'رقم استمارة عقد الإيجار للبلدية', element: 'municipalityFormNumber' });
    if (!formData.municipalityFormFile) missingFields.push({ field: '📎 نسخة ورقية من استمارة البلدية (مرفق إلزامي)' });
    if (!formData.municipalityRegistrationFee || formData.municipalityRegistrationFee === 0) {
      missingFields.push({ field: 'رسوم تسجيل العقد في البلدية', element: 'municipalityRegistrationFee' });
    }
    
    // التحقق من قراءات العدادات
    if (!formData.electricityMeterReading) missingFields.push({ field: 'قراءة عداد الكهرباء', element: 'electricityMeterReading' });
    if (!formData.waterMeterReading) missingFields.push({ field: 'قراءة عداد الماء', element: 'waterMeterReading' });
    
    return missingFields;
  };
  
  const handleInputChange = (field: keyof RentalFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'searchQuery') {
      // إظهار القائمة المنسدلة تلقائياً عند الكتابة
      setShowDropdown(value.length > 0);
      
      // البحث الفوري أثناء الكتابة باستخدام القيمة الجديدة مباشرة
      if (value && value.trim().length > 0) {
        // البحث الفوري في العقارات
        setTimeout(() => {
          searchProperties(value);
        }, 300);
      } else {
        setFilteredProperties([]);
        setHasSearched(false);
        setError(null);
      }
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
          contractType: formData.contractType, // سكني أو تجاري
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
      // التحقق من وجود عقد سابق قبل الحفظ (تحقق إضافي)
      if (formData.propertyId && formData.unitId) {
        try {
          const checkResponse = await fetch('/api/rentals');
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            const allRentals = Array.isArray(checkData?.items) ? checkData.items : [];
            
            // البحث عن عقد نشط لنفس العقار والوحدة
            const existing = allRentals.find((rental: any) => {
              const matchesProperty = rental.propertyId === formData.propertyId;
              const matchesUnit = rental.unitId === formData.unitId;
              const activeState = rental.state && 
                ['active', 'reserved', 'paid', 'docs_submitted', 'docs_verified', 'handover_completed'].includes(rental.state) &&
                rental.state !== 'cancelled' &&
                rental.state !== 'expired';
              
              return matchesProperty && matchesUnit && activeState;
            });
            
            if (existing) {
              setError(`⚠️ يوجد عقد نشط لهذه الوحدة بالفعل (${existing.id}). يجب إلغاء العقد السابق أولاً.`);
              setLoading(false);
              return;
            }
          }
        } catch (checkError) {
          console.error('خطأ في التحقق من العقود السابقة:', checkError);
          // نواصل العملية حتى لو فشل التحقق
        }
      }
      
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
            
            {/* زر إظهار القائمة */}
            <div className="mb-6">
              <button 
                type="button"
                onClick={() => {
                  setShowPropertiesModal(true);
                  // تحميل جميع العقارات عند فتح القائمة
                  if (filteredProperties.length === 0) {
                    setFilteredProperties(properties);
                    setHasSearched(true);
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium text-lg"
              >
                <FaListAlt className="w-6 h-6" />
                <span>إظهار قائمة العقارات</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  ({properties.length} عقار)
                </span>
              </button>
              {selectedProperty && (
                <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                  <p className="text-sm text-green-800">
                    <FaCheck className="inline ml-2" />
                    تم اختيار: <strong>{getTitleFromProperty(selectedProperty)}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Modal التنبيه بوجود عقد سابق */}
            {showExistingContractModal && existingContract && (
              <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowExistingContractModal(false)}>
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  {/* خلفية معتمة */}
                  <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                  
                  {/* النافذة المنبثقة */}
                  <div 
                    className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaExclamationTriangle className="w-6 h-6 ml-3" />
                          <div>
                            <h2 className="text-xl font-bold">تنبيه: عقد سابق موجود</h2>
                            <p className="text-sm text-orange-100">يوجد عقد إيجار مرتبط بهذا العقار</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowExistingContractModal(false)}
                          className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                        >
                          <FaTimes className="text-xl" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white p-6">
                      <div className="mb-6">
                        <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded-lg mb-4">
                          <p className="text-amber-800 font-medium mb-2">
                            ⚠️ لا يمكن إنشاء عقد إيجار جديد لهذا العقار
                          </p>
                          <p className="text-amber-700 text-sm">
                            يوجد عقد إيجار نشط أو محجوز لهذا العقار. يجب إلغاء العقد السابق أولاً قبل إنشاء عقد جديد.
                          </p>
                        </div>
                        
                        {/* معلومات العقد السابق */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FaFileContract className="text-blue-600" />
                            معلومات العقد السابق
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">رقم العقد:</span>
                              <span className="font-medium text-gray-900 mr-2">#{existingContract.id?.split('-')[1]?.substring(0, 8) || existingContract.id}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">الحالة:</span>
                              <span className={`font-medium mr-2 ${
                                existingContract.state === 'active' ? 'text-green-600' :
                                existingContract.state === 'reserved' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`}>
                                {existingContract.state === 'active' ? 'نشط' :
                                 existingContract.state === 'reserved' ? 'محجوز' :
                                 existingContract.state === 'paid' ? 'تم الدفع' :
                                 existingContract.state === 'docs_submitted' ? 'تم تقديم المستندات' :
                                 existingContract.state === 'docs_verified' ? 'تم التحقق' :
                                 existingContract.state === 'handover_completed' ? 'اكتمل التسليم' :
                                 existingContract.state}
                              </span>
                            </div>
                            {existingContract.tenantName && (
                              <div className="col-span-2">
                                <span className="text-gray-600">المستأجر:</span>
                                <span className="font-medium text-gray-900 mr-2">{existingContract.tenantName}</span>
                              </div>
                            )}
                            {existingContract.startDate && (
                              <div>
                                <span className="text-gray-600">تاريخ البدء:</span>
                                <span className="font-medium text-gray-900 mr-2">
                                  {new Date(existingContract.startDate).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                            )}
                            {existingContract.endDate && (
                              <div>
                                <span className="text-gray-600">تاريخ الانتهاء:</span>
                                <span className="font-medium text-gray-900 mr-2">
                                  {new Date(existingContract.endDate).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* ملاحظة */}
                        <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-lg mb-4">
                          <p className="text-blue-800 text-sm">
                            <strong>ملاحظة:</strong> إذا كنت ترغب في إنشاء عقد إيجار جديد لهذا العقار، يجب إلغاء العقد السابق أولاً من صفحة إلغاء العقد.
                          </p>
                        </div>
                        
                        {/* الأزرار */}
                        <div className="flex items-center justify-between gap-3">
                          <InstantLink
                            href={`/contracts/rental/${existingContract.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                          >
                            <FaFileAlt className="w-4 h-4" />
                            الاطلاع على بيانات العقد
                          </InstantLink>
                          
                          <InstantLink
                            href={`/rentals/edit/${existingContract.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                          >
                            <FaTrash className="w-4 h-4" />
                            إلغاء العقد السابق
                          </InstantLink>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-3 flex justify-end">
                      <button
                        onClick={() => setShowExistingContractModal(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        إغلاق
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal البحث المتقدم */}
            {showPropertiesModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowPropertiesModal(false)}>
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  {/* خلفية معتمة */}
                  <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                  
                  {/* النافذة المنبثقة */}
                  <div 
                    className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaBuilding className="w-6 h-6 ml-3" />
                          <div>
                            <h2 className="text-xl font-bold">بحث واختيار العقار</h2>
                            <p className="text-sm text-blue-100">ابحث وفلتر العقارات المتاحة</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPropertiesModal(false)}
                          className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                        >
                          <FaTimes className="text-xl" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white p-6 max-h-[75vh] overflow-y-auto">
                      {/* الفلاتر */}
                      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FaFilter className="ml-2 text-blue-600" />
                          الفلاتر والبحث
                        </h3>
                        
                        {/* البحث النصي */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaSearch className="inline ml-2" />
                            البحث العام (جميع الحقول)
                          </label>
                          <input
                            type="text"
                            value={propertySearchQuery}
                            onChange={(e) => setPropertySearchQuery(e.target.value)}
                            placeholder="ابحث في جميع الحقول (اسم، عنوان، رقم، مالك، مكان، رقم متسلسل، رقم عقار، رقم أرض)..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* الفلاتر */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          {/* نوع العقار */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <FaHome className="inline ml-1 text-xs" />
                              نوع العقار
                            </label>
                            <select
                              value={propertyFilterType}
                              onChange={(e) => setPropertyFilterType(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">جميع الأنواع</option>
                              {Array.from(new Set(properties.map(p => p.type).filter(Boolean))).map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* الموقع - المحافظة */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <FaMapMarkerAlt className="inline ml-1 text-xs" />
                              المحافظة
                            </label>
                            <select
                              value={propertyFilterProvince}
                              onChange={(e) => {
                                setPropertyFilterProvince(e.target.value);
                                // إعادة تعيين الولاية والمدينة عند تغيير المحافظة
                                setPropertyFilterState('');
                                setPropertyFilterCity('');
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">جميع المحافظات</option>
                              {Array.from(new Set(properties.map(p => p.province).filter(Boolean))).sort().map(province => (
                                <option key={province} value={province}>{province}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* الموقع - الولاية */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <FaMapMarkerAlt className="inline ml-1 text-xs" />
                              الولاية
                            </label>
                            <select
                              value={propertyFilterState}
                              onChange={(e) => {
                                setPropertyFilterState(e.target.value);
                                // إعادة تعيين المدينة عند تغيير الولاية
                                setPropertyFilterCity('');
                              }}
                              disabled={!propertyFilterProvince}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                !propertyFilterProvince ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
                              }`}
                            >
                              <option value="">
                                {propertyFilterProvince ? 'كل الولايات' : 'اختر المحافظة أولاً'}
                              </option>
                              {propertyFilterProvince && Array.from(new Set(
                                properties
                                  .filter(p => p.province && p.province.toLowerCase() === propertyFilterProvince.toLowerCase())
                                  .map(p => p.state)
                                  .filter(Boolean)
                              )).sort().map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* الموقع - المدينة/الحي/القرية */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <FaMapMarkerAlt className="inline ml-1 text-xs" />
                              المدينة/الحي/القرية
                            </label>
                            <select
                              value={propertyFilterCity}
                              onChange={(e) => setPropertyFilterCity(e.target.value)}
                              disabled={!propertyFilterProvince || (!propertyFilterState || propertyFilterState === '')}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                (!propertyFilterProvince || (!propertyFilterState || propertyFilterState === '')) 
                                  ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
                              }`}
                            >
                              <option value="">
                                {(propertyFilterProvince && propertyFilterState) 
                                  ? 'كل الأحياء والقراء' 
                                  : propertyFilterProvince 
                                    ? 'اختر الولاية أولاً'
                                    : 'اختر المحافظة أولاً'}
                              </option>
                              {propertyFilterProvince && propertyFilterState && propertyFilterState !== 'all' && Array.from(new Set(
                                properties
                                  .filter(p => 
                                    p.province && p.province.toLowerCase() === propertyFilterProvince.toLowerCase() &&
                                    p.state && p.state.toLowerCase() === propertyFilterState.toLowerCase() &&
                                    p.city
                                  )
                                  .map(p => p.city)
                                  .filter(Boolean)
                              )).sort().map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* الحالة */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <FaCheck className="inline ml-1 text-xs" />
                              الحالة
                            </label>
                            <select
                              value={propertyFilterStatus}
                              onChange={(e) => setPropertyFilterStatus(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">جميع الحالات</option>
                              <option value="vacant">شاغر</option>
                              <option value="leased">مؤجر</option>
                              <option value="reserved">محجوز</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* فلاتر إضافية - أرقام محددة */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">بحث بالأرقام</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* الرقم المتسلسل */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaIdCard className="inline ml-1 text-xs" />
                                الرقم المتسلسل
                              </label>
                              <input
                                type="text"
                                value={propertyFilterSerialNumber}
                                onChange={(e) => setPropertyFilterSerialNumber(e.target.value)}
                                placeholder="ابحث بالرقم المتسلسل"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            {/* رقم العقار */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaHome className="inline ml-1 text-xs" />
                                رقم العقار (ID)
                              </label>
                              <input
                                type="text"
                                value={propertyFilterPropertyId}
                                onChange={(e) => setPropertyFilterPropertyId(e.target.value)}
                                placeholder="ابحث برقم العقار"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            {/* رقم الأرض */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaMapMarkerAlt className="inline ml-1 text-xs" />
                                رقم الأرض
                              </label>
                              <input
                                type="text"
                                value={propertyFilterPlotNumber}
                                onChange={(e) => setPropertyFilterPlotNumber(e.target.value)}
                                placeholder="ابحث برقم الأرض"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            {/* المالك */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaUser className="inline ml-1 text-xs" />
                                المالك (معرف/رقم)
                              </label>
                              <input
                                type="text"
                                value={propertyFilterOwner}
                                onChange={(e) => setPropertyFilterOwner(e.target.value)}
                                placeholder="ابحث بمعرف/رقم المالك"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* زر إعادة تعيين الفلاتر */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => {
                              setPropertySearchQuery('');
                              setPropertyFilterType('');
                              setPropertyFilterProvince('');
                              setPropertyFilterState('');
                              setPropertyFilterCity('');
                              setPropertyFilterOwner('');
                              setPropertyFilterStatus('');
                              setPropertyFilterSerialNumber('');
                              setPropertyFilterPropertyId('');
                              setPropertyFilterPlotNumber('');
                            }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            إعادة تعيين الفلاتر
                          </button>
                        </div>
                      </div>
                      
                      {/* قائمة العقارات */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            النتائج ({getFilteredPropertiesAdvanced().length} عقار)
                          </h3>
                        </div>
                        
                        {getFilteredPropertiesAdvanced().length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {getFilteredPropertiesAdvanced().map((property) => (
                              <div
                                key={property.id}
                                onClick={() => {
                                  selectProperty(property);
                                  setShowPropertiesModal(false);
                                  setHasSearched(true);
                                  setFilteredProperties([property]);
                                }}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                  selectedProperty?.id === property.id
                                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-bold text-lg text-gray-900 mb-2">
                                      {getTitleFromProperty(property)}
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                                      {property.address && (
                                        <p className="flex items-center gap-2">
                                          <FaMapMarkerAlt className="text-blue-500" />
                                          {property.address}
                                        </p>
                                      )}
                                      {property.type && (
                                        <p className="flex items-center gap-2">
                                          <FaHome className="text-green-500" />
                                          النوع: {property.type}
                                        </p>
                                      )}
                                      {property.area && (
                                        <p className="flex items-center gap-2">
                                          <FaRuler className="text-indigo-500" />
                                          المساحة: {property.area} م²
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* قسم الأرقام */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                                      {property.id && (
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 font-medium mb-1">رقم العقار:</span>
                                          <span className="text-gray-900 font-bold">{property.id}</span>
                                        </div>
                                      )}
                                      {property.serialNumber && (
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 font-medium mb-1">الرقم المتسلسل:</span>
                                          <span className="text-gray-900 font-bold">{property.serialNumber}</span>
                                        </div>
                                      )}
                                      {property.plotNumber && (
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 font-medium mb-1">رقم الأرض:</span>
                                          <span className="text-gray-900 font-bold">{property.plotNumber}</span>
                                        </div>
                                      )}
                                      {property.buildingNumber && (
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 font-medium mb-1">رقم المبنى:</span>
                                          <span className="text-gray-900 font-bold">{property.buildingNumber}</span>
                                        </div>
                                      )}
                                      {property.ownerId && (
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 font-medium mb-1">المالك:</span>
                                          <span className="text-gray-900 font-bold">{property.ownerId}</span>
                                        </div>
                                      )}
                                      {(property.province || property.state) && (
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 font-medium mb-1">الموقع:</span>
                                          <span className="text-gray-900 font-bold">
                                            {[property.province, property.state, property.city].filter(Boolean).join(' - ')}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {property.priceOMR && (
                                      <p className="mt-2 text-lg font-bold text-blue-600">
                                        {property.priceOMR} ر.ع
                                      </p>
                                    )}
                                  </div>
                                  {selectedProperty?.id === property.id && (
                                    <FaCheck className="w-6 h-6 text-blue-600 ml-4 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <FaSearch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">لا توجد عقارات تطابق معايير البحث</p>
                            <p className="text-sm text-gray-500 mt-2">جرب تعديل الفلاتر أو البحث</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                      <button
                        onClick={() => setShowPropertiesModal(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        إغلاق
                      </button>
                      <div className="text-sm text-gray-600">
                        عرض {getFilteredPropertiesAdvanced().length} من {properties.length} عقار
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
            
            {/* القسم 0: نوع العقد */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFileContract className="text-purple-600" />
                نوع العقد
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('contractType', 'residential')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.contractType === 'residential'
                      ? 'bg-blue-50 border-blue-500 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      formData.contractType === 'residential' ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      <FaHome className={`w-8 h-8 ${formData.contractType === 'residential' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="text-right flex-1">
                      <h5 className="font-bold text-gray-900 mb-1">🏠 عقد سكني</h5>
                      <p className="text-sm text-gray-600">شقق، فيلات، منازل</p>
                    </div>
                    {formData.contractType === 'residential' && (
                      <FaCheck className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('contractType', 'commercial')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.contractType === 'commercial'
                      ? 'bg-green-50 border-green-500 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      formData.contractType === 'commercial' ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <FaBuilding className={`w-8 h-8 ${formData.contractType === 'commercial' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="text-right flex-1">
                      <h5 className="font-bold text-gray-900 mb-1">🏢 عقد تجاري</h5>
                      <p className="text-sm text-gray-600">مكاتب، محلات، معارض</p>
                    </div>
                    {formData.contractType === 'commercial' && (
                      <FaCheck className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
            
            {/* القسم 1: التواريخ والمدة */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendar className="text-orange-600" />
                التواريخ والمدة
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline ml-2" />
                    تاريخ الاستئجار الفعلي *
                  </label>
                  <input
                    type="date"
                    name="actualRentalDate"
                    value={formData.actualRentalDate}
                    onChange={(e) => handleInputChange('actualRentalDate', e.target.value)}
                    className={getRequiredFieldClasses(formData.actualRentalDate, "w-full px-4 py-3 rounded-lg")}
                    required
                    suppressHydrationWarning
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 تاريخ بداية الاستئجار الفعلي
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaKey className="inline ml-2" />
                    تاريخ استلام الوحدة *
                  </label>
                  <input
                    type="date"
                    name="unitHandoverDate"
                    value={formData.unitHandoverDate}
                    onChange={(e) => handleInputChange('unitHandoverDate', e.target.value)}
                    className={getRequiredFieldClasses(formData.unitHandoverDate, "w-full px-4 py-3 rounded-lg")}
                    required
                    suppressHydrationWarning
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 تاريخ تسليم مفاتيح الوحدة للمستأجر
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline ml-2" />
                    تاريخ بدء العقد الرسمي *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={getRequiredFieldClasses(formData.startDate, "w-full px-4 py-3 rounded-lg")}
                    required
                    suppressHydrationWarning
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 قد يكون بعد فترة السماح
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaClock className="inline ml-2" />
                    مدة الإيجار (بالأشهر)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className={getRequiredFieldClasses(formData.duration, "w-full px-4 py-3 rounded-lg")}
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
              </div>
              
              {/* خيار الحساب بالمتر */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200 hover:bg-indigo-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.calculateByArea}
                    onChange={(e) => {
                      handleInputChange('calculateByArea', e.target.checked);
                      if (!e.target.checked) {
                        // إذا تم إلغاء الحساب بالمتر، نحتفظ بقيمة الإيجار الحالية
                      }
                    }}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">📐 حساب الإيجار بالمتر المربع</span>
                    <p className="text-xs text-gray-600 mt-1">
                      مناسب للمكاتب والمحلات التجارية - يُحسب الإيجار تلقائياً: المساحة × السعر للمتر
                    </p>
                  </div>
                </label>
              </div>
              
              {formData.calculateByArea ? (
                // حساب بالمتر
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-indigo-50 p-6 rounded-lg border-2 border-indigo-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📏 المساحة (متر مربع) *
                    </label>
                    <input
                      type="number"
                      name="rentArea"
                      value={formData.rentArea || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange('rentArea', val === '' ? 0 : Number(val));
                      }}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        handleInputChange('rentArea', isNaN(val) ? 0 : val);
                      }}
                      className={getRequiredFieldClasses(formData.rentArea, "w-full px-4 py-3 rounded-lg")}
                      min="0"
                      step="any"
                      lang="en"
                      inputMode="decimal"
                      placeholder="مثال: 30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💰 السعر للمتر ({formData.currency}) *
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerMeter || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange('pricePerMeter', val === '' ? 0 : Number(val));
                      }}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        handleInputChange('pricePerMeter', isNaN(val) ? 0 : val);
                      }}
                      className={getRequiredFieldClasses(formData.pricePerMeter, "w-full px-4 py-3 rounded-lg")}
                      min="0"
                      step="any"
                      lang="en"
                      inputMode="decimal"
                      placeholder="مثال: 10.500"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMoneyBillWave className="inline ml-2" />
                      الإيجار الشهري ({formData.currency})
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyRent}
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 cursor-not-allowed font-bold text-green-700"
                      readOnly
                      suppressHydrationWarning
                    />
                    <div className="absolute top-11 left-3 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                      محسوب تلقائياً ✓
                    </div>
                    <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                      {formData.rentArea} م² × {formData.pricePerMeter} {formData.currency} = {formData.monthlyRent.toFixed(3)} {formData.currency}
                    </p>
                  </div>
                </div>
              ) : (
                // إدخال مباشر
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMoneyBillWave className="inline ml-2" />
                      الإيجار الشهري
                    </label>
                    <input
                      type="number"
                      name="monthlyRent"
                      value={formData.monthlyRent || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        // نحفظ القيمة كما هي بدون parseFloat للسماح بكتابة النقطة
                        if (val === '') {
                          handleInputChange('monthlyRent', 0);
                        } else {
                          handleInputChange('monthlyRent', Number(val));
                        }
                      }}
                      onBlur={(e) => {
                        // عند الخروج من الحقل نتأكد من صحة القيمة
                        const val = parseFloat(e.target.value);
                        handleInputChange('monthlyRent', isNaN(val) ? 0 : val);
                      }}
                      className={getRequiredFieldClasses(formData.monthlyRent, "w-full px-4 py-3 rounded-lg")}
                      min="0"
                      step="any"
                      lang="en"
                      inputMode="decimal"
                      placeholder="مثال: 500.800"
                      required
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      💡 استخدم النقطة (.) للكسور العشرية - مثال: 500.800 أو 1.250 أو 0.200
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMoneyBillWave className="inline ml-2" />
                    مبلغ الضمان *
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        handleInputChange('deposit', 0);
                      } else {
                        handleInputChange('deposit', Number(val));
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      handleInputChange('deposit', isNaN(val) ? 0 : val);
                    }}
                    className={getRequiredFieldClasses(formData.deposit, "w-full px-4 py-3 rounded-lg")}
                    min="0"
                    step="any"
                    lang="en"
                    inputMode="decimal"
                    placeholder="مثال: 1.200 أو 0.500"
                    required
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
            
            {/* القسم 3: تاريخ الاستحقاق وفترة السماح */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-indigo-600" />
                تاريخ الاستحقاق وفترة السماح
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ استحقاق الإيجار (اليوم من الشهر) *
                  </label>
                  <input
                    type="number"
                    value={formData.rentDueDay}
                    onChange={(e) => handleInputChange('rentDueDay', parseInt(e.target.value) || 1)}
                    className={getRequiredFieldClasses(formData.rentDueDay, "w-full px-4 py-3 rounded-lg")}
                    min="1"
                    max="31"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 اليوم الذي يجب دفع الإيجار فيه كل شهر (يُستخدم في تواريخ الشيكات)
                  </p>
                </div>
                
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
            
            {/* القسم 4: طرق الدفع */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-blue-600" />
                طرق الدفع
              </h4>
              
              {/* دفع الإيجار */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h5 className="font-semibold text-blue-900 mb-4">💰 دفع الإيجار</h5>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      طريقة دفع الإيجار *
                    </label>
                    <select
                      value={formData.rentPaymentMethod}
                      onChange={(e) => {
                        const method = e.target.value;
                        handleInputChange('rentPaymentMethod', method);
                        // إعادة تعيين البيانات عند تغيير الطريقة
                        if (method === 'check') {
                          handleInputChange('rentReceiptNumber', '');
                          // لا ننشئ شيكات تلقائياً - المستخدم سيضغط الزر
                        } else {
                          handleInputChange('rentChecks', []);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="cash">نقداً</option>
                      <option value="check">شيك</option>
                      <option value="bank_transfer">تحويل في الحساب</option>
                      <option value="electronic_payment">دفع إلكتروني</option>
                    </select>
                  </div>
                  
                  {/* رقم الإيصال لغير الشيكات */}
                  {formData.rentPaymentMethod !== 'check' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الإيصال *
                      </label>
                      <input
                        type="text"
                        value={formData.rentReceiptNumber}
                        onChange={(e) => handleInputChange('rentReceiptNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل رقم الإيصال"
                        required
                      />
                    </div>
                  )}
                  
                  {/* شيكات الإيجار */}
                  {formData.rentPaymentMethod === 'check' && (
                    <>
                      {/* معلومات مالك شيكات الإيجار - مرة واحدة */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200 mb-6">
                        <h6 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                          <FaUser className="w-5 h-5" />
                          👤 معلومات مالك الشيكات (تُطبق على جميع شيكات الإيجار)
                        </h6>
                        
                        <div className="grid grid-cols-1 gap-6">
                          {/* نوع المالك */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              الشيكات باسم *
                            </label>
                            <select
                              value={formData.rentChecksOwnerType}
                              onChange={(e) => handleInputChange('rentChecksOwnerType', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              required
                            >
                              <option value="tenant">المستأجر</option>
                              <option value="other_individual">شخص آخر</option>
                              <option value="company">شركة</option>
                            </select>
                          </div>
                          
                          {/* معلومات البنك - دائماً تظهر */}
                          <div className="bg-white rounded-lg p-4 border border-indigo-200">
                            <p className="font-semibold text-gray-900 mb-3 text-sm">🏦 معلومات البنك</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  اسم البنك *
                                </label>
                                <input
                                  type="text"
                                  value={formData.rentChecksBankName}
                                  onChange={(e) => handleInputChange('rentChecksBankName', e.target.value)}
                                  className={getRequiredFieldClasses(formData.rentChecksBankName, "w-full px-3 py-2 rounded text-sm")}
                                  placeholder="مثال: بنك مسقط"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  الفرع *
                                </label>
                                <input
                                  type="text"
                                  value={formData.rentChecksBankBranch}
                                  onChange={(e) => handleInputChange('rentChecksBankBranch', e.target.value)}
                                  className={getRequiredFieldClasses(formData.rentChecksBankBranch, "w-full px-3 py-2 rounded text-sm")}
                                  placeholder="مثال: الخوير"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  رقم الحساب *
                                </label>
                                <input
                                  type="text"
                                  value={formData.rentChecksBankAccount}
                                  onChange={(e) => handleInputChange('rentChecksBankAccount', e.target.value)}
                                  className={getRequiredFieldClasses(formData.rentChecksBankAccount, "w-full px-3 py-2 rounded text-sm")}
                                  placeholder="رقم الحساب البنكي"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* إذا كان شخص آخر */}
                          {formData.rentChecksOwnerType === 'other_individual' && (
                            <div className="bg-white rounded-lg p-4 border border-indigo-200">
                              <p className="font-semibold text-gray-900 mb-3 text-sm">📋 بيانات مالك الشيك</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">اسم المالك *</label>
                                  <input
                                    type="text"
                                    value={formData.rentChecksOwnerName}
                                    onChange={(e) => handleInputChange('rentChecksOwnerName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">الجنسية *</label>
                                  <select
                                    value={formData.rentChecksIsOmani ? 'omani' : 'foreign'}
                                    onChange={(e) => handleInputChange('rentChecksIsOmani', e.target.value === 'omani')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  >
                                    <option value="omani">عماني</option>
                                    <option value="foreign">وافد</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم البطاقة المدنية *</label>
                                  <input
                                    type="text"
                                    value={formData.rentChecksNationalId}
                                    onChange={(e) => handleInputChange('rentChecksNationalId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء البطاقة *</label>
                                  <input
                                    type="date"
                                    value={formData.rentChecksNationalIdExpiry}
                                    onChange={(e) => handleInputChange('rentChecksNationalIdExpiry', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                    suppressHydrationWarning
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من البطاقة *</label>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleInputChange('rentChecksNationalIdFile', file.name);
                                    }}
                                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
                                    required
                                  />
                                </div>
                                {!formData.rentChecksIsOmani && (
                                  <>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">رقم الجواز *</label>
                                      <input
                                        type="text"
                                        value={formData.rentChecksPassportNumber}
                                        onChange={(e) => handleInputChange('rentChecksPassportNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء الجواز *</label>
                                      <input
                                        type="date"
                                        value={formData.rentChecksPassportExpiry}
                                        onChange={(e) => handleInputChange('rentChecksPassportExpiry', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                        required
                                        suppressHydrationWarning
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من الجواز *</label>
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleInputChange('rentChecksPassportFile', file.name);
                                        }}
                                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
                                        required
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* إذا كان شركة */}
                          {formData.rentChecksOwnerType === 'company' && (
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                              <p className="font-semibold text-gray-900 mb-3 text-sm">🏢 بيانات الشركة</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">اسم الشركة *</label>
                                  <input
                                    type="text"
                                    value={formData.rentChecksOwnerName}
                                    onChange={(e) => handleInputChange('rentChecksOwnerName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم السجل التجاري *</label>
                                  <input
                                    type="text"
                                    value={formData.rentChecksCommercialRegister}
                                    onChange={(e) => handleInputChange('rentChecksCommercialRegister', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من السجل التجاري *</label>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleInputChange('rentChecksCommercialRegisterFile', file.name);
                                    }}
                                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-600 file:text-white"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="border-t pt-3">
                                <p className="font-semibold text-gray-900 mb-3 text-sm">✍️ بيانات المفوض بالتوقيع</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">اسم المفوض *</label>
                                    <input
                                      type="text"
                                      value={formData.rentChecksAuthorizedPersonName}
                                      onChange={(e) => handleInputChange('rentChecksAuthorizedPersonName', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">جنسية المفوض *</label>
                                    <select
                                      value={formData.rentChecksAuthorizedPersonIsOmani ? 'omani' : 'foreign'}
                                      onChange={(e) => handleInputChange('rentChecksAuthorizedPersonIsOmani', e.target.value === 'omani')}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                    >
                                      <option value="omani">عماني</option>
                                      <option value="foreign">وافد</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">رقم بطاقة المفوض *</label>
                                    <input
                                      type="text"
                                      value={formData.rentChecksAuthorizedPersonId}
                                      onChange={(e) => handleInputChange('rentChecksAuthorizedPersonId', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء البطاقة *</label>
                                    <input
                                      type="date"
                                      value={formData.rentChecksAuthorizedPersonIdExpiry}
                                      onChange={(e) => handleInputChange('rentChecksAuthorizedPersonIdExpiry', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                      suppressHydrationWarning
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من بطاقة المفوض *</label>
                                    <input
                                      type="file"
                                      accept="image/*,.pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleInputChange('rentChecksAuthorizedPersonIdFile', file.name);
                                      }}
                                      className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-600 file:text-white"
                                      required
                                    />
                                  </div>
                                  {!formData.rentChecksAuthorizedPersonIsOmani && (
                                    <>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">رقم جواز المفوض *</label>
                                        <input
                                          type="text"
                                          value={formData.rentChecksAuthorizedPersonPassport}
                                          onChange={(e) => handleInputChange('rentChecksAuthorizedPersonPassport', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء الجواز *</label>
                                        <input
                                          type="date"
                                          value={formData.rentChecksAuthorizedPersonPassportExpiry}
                                          onChange={(e) => handleInputChange('rentChecksAuthorizedPersonPassportExpiry', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                          required
                                          suppressHydrationWarning
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من جواز المفوض *</label>
                                        <input
                                          type="file"
                                          accept="image/*,.pdf"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleInputChange('rentChecksAuthorizedPersonPassportFile', file.name);
                                          }}
                                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-600 file:text-white"
                                          required
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* قائمة الشيكات - مبسطة */}
                      <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="font-semibold text-gray-900">📝 شيكات الإيجار</h6>
                        <div className="flex gap-2">
                          {formData.rentChecks.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                // إنشاء شيكات بعدد أشهر العقد
                                const checks = [];
                                for (let i = 0; i < formData.duration; i++) {
                                  const checkDate = new Date(formData.startDate);
                                  checkDate.setMonth(checkDate.getMonth() + i);
                                  checkDate.setDate(formData.rentDueDay);
                                  
                                  checks.push({
                                    checkNumber: '',
                                    amount: formData.monthlyRent,
                                    date: checkDate.toISOString().split('T')[0]
                                  });
                                }
                                handleInputChange('rentChecks', checks);
                              }}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <FaPlus className="w-3 h-3" />
                              إنشاء {formData.duration} شيك تلقائياً
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const lastCheck = formData.rentChecks[formData.rentChecks.length - 1];
                              const lastDate = lastCheck ? new Date(lastCheck.date) : new Date(formData.startDate);
                              lastDate.setMonth(lastDate.getMonth() + 1);
                              lastDate.setDate(formData.rentDueDay);
                              
                              const lastCheckNum = lastCheck?.checkNumber ? parseInt(lastCheck.checkNumber) : 0;
                              
                              const newCheck = {
                                checkNumber: lastCheckNum > 0 ? String(lastCheckNum + 1) : '',
                                amount: lastCheck?.amount || formData.monthlyRent,
                                date: lastDate.toISOString().split('T')[0]
                              };
                              handleInputChange('rentChecks', [...formData.rentChecks, newCheck]);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                          >
                            <FaPlus className="w-3 h-3" />
                            إضافة شيك
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {formData.rentChecks.map((check, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-900">الشيك #{index + 1}</span>
                              {formData.rentChecks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newChecks = formData.rentChecks.filter((_, i) => i !== index);
                                    handleInputChange('rentChecks', newChecks);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {/* معلومات الشيك الأساسية */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  رقم الشيك *
                                </label>
                                <input
                                  type="text"
                                  value={check.checkNumber}
                                  onChange={(e) => {
                                    const newChecks = [...formData.rentChecks];
                                    newChecks[index].checkNumber = e.target.value;
                                    
                                    // إذا كان الشيك الأول وتم إدخال رقم، املأ باقي الشيكات تلقائياً بالتسلسل
                                    if (index === 0 && e.target.value && !isNaN(parseInt(e.target.value))) {
                                      const firstCheckNum = parseInt(e.target.value);
                                      for (let i = 1; i < newChecks.length; i++) {
                                        // املأ جميع الشيكات بالتسلسل (8001 → 8002 → 8003)
                                        newChecks[i].checkNumber = String(firstCheckNum + i);
                                      }
                                    }
                                    
                                    handleInputChange('rentChecks', newChecks);
                                  }}
                                  className={getRequiredFieldClasses(check.checkNumber, "w-full px-3 py-2 rounded text-sm")}
                                  placeholder={index === 0 ? "أدخل رقم الشيك الأول" : "رقم الشيك"}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  المبلغ ({formData.currency}) *
                                </label>
                                <input
                                  type="number"
                                  value={check.amount}
                                  onChange={(e) => {
                                    const newChecks = [...formData.rentChecks];
                                    newChecks[index].amount = parseFloat(e.target.value) || 0;
                                    handleInputChange('rentChecks', newChecks);
                                  }}
                                  className={getRequiredFieldClasses(check.amount, "w-full px-3 py-2 rounded text-sm")}
                                  min="0"
                                  step="any"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  تاريخ الشيك *
                                </label>
                                <input
                                  type="date"
                                  value={check.date}
                                  onChange={(e) => {
                                    const newChecks = [...formData.rentChecks];
                                    newChecks[index].date = e.target.value;
                                    handleInputChange('rentChecks', newChecks);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                  required
                                  suppressHydrationWarning
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <p className="text-sm text-blue-900" suppressHydrationWarning>
                            <strong>إجمالي شيكات الإيجار:</strong> {formData.rentChecks.reduce((sum, check) => sum + check.amount, 0).toFixed(3)} {formData.currency}
                          </p>
                          <p className="text-xs text-blue-700 mt-1" suppressHydrationWarning>
                            عدد الشيكات: {formData.rentChecks.length} / {formData.duration}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-purple-900 mb-2">💡 كيفية الاستخدام:</p>
                          <ul className="text-xs text-purple-700 space-y-1">
                            <li>1️⃣ املأ معلومات مالك الشيك أعلاه (مرة واحدة)</li>
                            <li>2️⃣ اضغط "إنشاء {formData.duration} شيك تلقائياً"</li>
                            <li>3️⃣ أدخل رقم الشيك الأول (مثال: 10001)</li>
                            <li>4️⃣ باقي الأرقام تملأ تلقائياً (10002، 10003...)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* دفع الضمان */}
              <div className="bg-green-50 rounded-lg p-6">
                <h5 className="font-semibold text-green-900 mb-4">🛡️ دفع الضمان</h5>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      طريقة دفع الضمان *
                    </label>
                    <select
                      value={formData.depositPaymentMethod}
                      onChange={(e) => {
                        const method = e.target.value;
                        handleInputChange('depositPaymentMethod', method);
                        // إعادة تعيين البيانات عند تغيير الطريقة
                        if (method === 'check' || method === 'cash_and_check') {
                          handleInputChange('depositReceiptNumber', '');
                          // لا ننشئ شيكات تلقائياً - المستخدم يملأها
                        } else {
                          handleInputChange('depositChecks', []);
                        }
                        
                        if (method === 'cash_and_check') {
                          // تهيئة القيم للمبلغ النقدي - استخدام مبلغ الضمان الكامل
                          handleInputChange('depositCashAmount', formData.deposit);
                          handleInputChange('depositCashDate', formData.startDate);
                        } else {
                          handleInputChange('depositCashAmount', 0);
                          handleInputChange('depositCashDate', '');
                          handleInputChange('depositCashReceiptNumber', '');
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="cash">نقداً</option>
                      <option value="check">شيك</option>
                      <option value="cash_and_check">نقدي + شيك</option>
                      <option value="bank_transfer">تحويل في الحساب</option>
                      <option value="electronic_payment">دفع إلكتروني</option>
                    </select>
                  </div>
                  
                  {/* رقم الإيصال لغير الشيكات */}
                  {formData.depositPaymentMethod !== 'check' && formData.depositPaymentMethod !== 'cash_and_check' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الإيصال *
                      </label>
                      <input
                        type="text"
                        value={formData.depositReceiptNumber}
                        onChange={(e) => handleInputChange('depositReceiptNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="أدخل رقم الإيصال"
                        required
                      />
                    </div>
                  )}
                  
                  {/* المبلغ النقدي (في حالة نقدي + شيك) */}
                  {formData.depositPaymentMethod === 'cash_and_check' && (
                    <div className="bg-white rounded-lg p-6 border-2 border-orange-200 mb-4">
                      <h6 className="font-semibold text-gray-900 mb-4">💵 المبلغ النقدي</h6>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            المبلغ النقدي ({formData.currency}) *
                          </label>
                          <input
                            type="number"
                            value={formData.depositCashAmount}
                            onChange={(e) => handleInputChange('depositCashAmount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                            min="0"
                            step="any"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            تاريخ الدفع *
                          </label>
                          <input
                            type="date"
                            value={formData.depositCashDate}
                            onChange={(e) => handleInputChange('depositCashDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                            required
                            suppressHydrationWarning
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            رقم الإيصال النقدي *
                          </label>
                          <input
                            type="text"
                            value={formData.depositCashReceiptNumber}
                            onChange={(e) => handleInputChange('depositCashReceiptNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                            placeholder="رقم الإيصال"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* شيكات الضمان */}
                  {(formData.depositPaymentMethod === 'check' || formData.depositPaymentMethod === 'cash_and_check') && (
                    <>
                      {/* معلومات مالك شيكات الضمان + زر النسخ */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="font-semibold text-green-900 flex items-center gap-2">
                            <FaUser className="w-5 h-5" />
                            👤 معلومات مالك شيكات الضمان
                          </h6>
                          {formData.rentPaymentMethod === 'check' && (
                            <button
                              type="button"
                              onClick={() => {
                                // نسخ بيانات شيكات الإيجار
                                handleInputChange('depositChecksOwnerType', formData.rentChecksOwnerType);
                                handleInputChange('depositChecksOwnerName', formData.rentChecksOwnerName);
                                handleInputChange('depositChecksBankName', formData.rentChecksBankName);
                                handleInputChange('depositChecksBankBranch', formData.rentChecksBankBranch);
                                handleInputChange('depositChecksBankAccount', formData.rentChecksBankAccount);
                                handleInputChange('depositChecksNationalId', formData.rentChecksNationalId);
                                handleInputChange('depositChecksNationalIdExpiry', formData.rentChecksNationalIdExpiry);
                                handleInputChange('depositChecksNationalIdFile', formData.rentChecksNationalIdFile);
                                handleInputChange('depositChecksIsOmani', formData.rentChecksIsOmani);
                                handleInputChange('depositChecksPassportNumber', formData.rentChecksPassportNumber);
                                handleInputChange('depositChecksPassportExpiry', formData.rentChecksPassportExpiry);
                                handleInputChange('depositChecksPassportFile', formData.rentChecksPassportFile);
                                handleInputChange('depositChecksCommercialRegister', formData.rentChecksCommercialRegister);
                                handleInputChange('depositChecksCommercialRegisterFile', formData.rentChecksCommercialRegisterFile);
                                handleInputChange('depositChecksAuthorizedPersonName', formData.rentChecksAuthorizedPersonName);
                                handleInputChange('depositChecksAuthorizedPersonId', formData.rentChecksAuthorizedPersonId);
                                handleInputChange('depositChecksAuthorizedPersonIdExpiry', formData.rentChecksAuthorizedPersonIdExpiry);
                                handleInputChange('depositChecksAuthorizedPersonIdFile', formData.rentChecksAuthorizedPersonIdFile);
                                handleInputChange('depositChecksAuthorizedPersonIsOmani', formData.rentChecksAuthorizedPersonIsOmani);
                                handleInputChange('depositChecksAuthorizedPersonPassport', formData.rentChecksAuthorizedPersonPassport);
                                handleInputChange('depositChecksAuthorizedPersonPassportExpiry', formData.rentChecksAuthorizedPersonPassportExpiry);
                                handleInputChange('depositChecksAuthorizedPersonPassportFile', formData.rentChecksAuthorizedPersonPassportFile);
                                alert('✅ تم نسخ بيانات شيكات الإيجار بنجاح!');
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <FaCheck className="w-3 h-3" />
                              نسخ من شيكات الإيجار
                            </button>
                          )}
                        </div>
                        
                        {/* نفس الواجهة لشيكات الضمان */}
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              الشيكات باسم *
                            </label>
                            <select
                              value={formData.depositChecksOwnerType}
                              onChange={(e) => handleInputChange('depositChecksOwnerType', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              required
                            >
                              <option value="tenant">المستأجر</option>
                              <option value="other_individual">شخص آخر</option>
                              <option value="company">شركة</option>
                            </select>
                          </div>
                          
                          {/* معلومات البنك */}
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="font-semibold text-gray-900 mb-3 text-sm">🏦 معلومات البنك</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">اسم البنك *</label>
                                <input
                                  type="text"
                                  value={formData.depositChecksBankName}
                                  onChange={(e) => handleInputChange('depositChecksBankName', e.target.value)}
                                  className={getRequiredFieldClasses(formData.depositChecksBankName, "w-full px-3 py-2 rounded text-sm")}
                                  placeholder="مثال: بنك مسقط"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">الفرع *</label>
                                <input
                                  type="text"
                                  value={formData.depositChecksBankBranch}
                                  onChange={(e) => handleInputChange('depositChecksBankBranch', e.target.value)}
                                  className={getRequiredFieldClasses(formData.depositChecksBankBranch, "w-full px-3 py-2 rounded text-sm")}
                                  placeholder="مثال: الخوير"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">رقم الحساب *</label>
                                <input
                                  type="text"
                                  value={formData.depositChecksBankAccount}
                                  onChange={(e) => handleInputChange('depositChecksBankAccount', e.target.value)}
                                  className={getRequiredFieldClasses(formData.depositChecksBankAccount, "w-full px-3 py-2 rounded text-sm")}
                                  placeholder="رقم الحساب البنكي"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* إذا كان شخص آخر - نفس التصميم */}
                          {formData.depositChecksOwnerType === 'other_individual' && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <p className="font-semibold text-gray-900 mb-3 text-sm">📋 بيانات مالك الشيك</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">اسم المالك *</label>
                                  <input
                                    type="text"
                                    value={formData.depositChecksOwnerName}
                                    onChange={(e) => handleInputChange('depositChecksOwnerName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">الجنسية *</label>
                                  <select
                                    value={formData.depositChecksIsOmani ? 'omani' : 'foreign'}
                                    onChange={(e) => handleInputChange('depositChecksIsOmani', e.target.value === 'omani')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  >
                                    <option value="omani">عماني</option>
                                    <option value="foreign">وافد</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم البطاقة المدنية *</label>
                                  <input
                                    type="text"
                                    value={formData.depositChecksNationalId}
                                    onChange={(e) => handleInputChange('depositChecksNationalId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء البطاقة *</label>
                                  <input
                                    type="date"
                                    value={formData.depositChecksNationalIdExpiry}
                                    onChange={(e) => handleInputChange('depositChecksNationalIdExpiry', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                    suppressHydrationWarning
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من البطاقة *</label>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleInputChange('depositChecksNationalIdFile', file.name);
                                    }}
                                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-600 file:text-white"
                                    required
                                  />
                                </div>
                                {!formData.depositChecksIsOmani && (
                                  <>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">رقم الجواز *</label>
                                      <input
                                        type="text"
                                        value={formData.depositChecksPassportNumber}
                                        onChange={(e) => handleInputChange('depositChecksPassportNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء الجواز *</label>
                                      <input
                                        type="date"
                                        value={formData.depositChecksPassportExpiry}
                                        onChange={(e) => handleInputChange('depositChecksPassportExpiry', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                        required
                                        suppressHydrationWarning
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من الجواز *</label>
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleInputChange('depositChecksPassportFile', file.name);
                                        }}
                                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-600 file:text-white"
                                        required
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* إذا كان شركة - نفس التصميم */}
                          {formData.depositChecksOwnerType === 'company' && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <p className="font-semibold text-gray-900 mb-3 text-sm">🏢 بيانات الشركة</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">اسم الشركة *</label>
                                  <input
                                    type="text"
                                    value={formData.depositChecksOwnerName}
                                    onChange={(e) => handleInputChange('depositChecksOwnerName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم السجل التجاري *</label>
                                  <input
                                    type="text"
                                    value={formData.depositChecksCommercialRegister}
                                    onChange={(e) => handleInputChange('depositChecksCommercialRegister', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    required
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من السجل التجاري *</label>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleInputChange('depositChecksCommercialRegisterFile', file.name);
                                    }}
                                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-600 file:text-white"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="border-t pt-3">
                                <p className="font-semibold text-gray-900 mb-3 text-sm">✍️ بيانات المفوض بالتوقيع</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">اسم المفوض *</label>
                                    <input
                                      type="text"
                                      value={formData.depositChecksAuthorizedPersonName}
                                      onChange={(e) => handleInputChange('depositChecksAuthorizedPersonName', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">جنسية المفوض *</label>
                                    <select
                                      value={formData.depositChecksAuthorizedPersonIsOmani ? 'omani' : 'foreign'}
                                      onChange={(e) => handleInputChange('depositChecksAuthorizedPersonIsOmani', e.target.value === 'omani')}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                    >
                                      <option value="omani">عماني</option>
                                      <option value="foreign">وافد</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">رقم بطاقة المفوض *</label>
                                    <input
                                      type="text"
                                      value={formData.depositChecksAuthorizedPersonId}
                                      onChange={(e) => handleInputChange('depositChecksAuthorizedPersonId', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء البطاقة *</label>
                                    <input
                                      type="date"
                                      value={formData.depositChecksAuthorizedPersonIdExpiry}
                                      onChange={(e) => handleInputChange('depositChecksAuthorizedPersonIdExpiry', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                      required
                                      suppressHydrationWarning
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من بطاقة المفوض *</label>
                                    <input
                                      type="file"
                                      accept="image/*,.pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleInputChange('depositChecksAuthorizedPersonIdFile', file.name);
                                      }}
                                      className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-600 file:text-white"
                                      required
                                    />
                                  </div>
                                  {!formData.depositChecksAuthorizedPersonIsOmani && (
                                    <>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">رقم جواز المفوض *</label>
                                        <input
                                          type="text"
                                          value={formData.depositChecksAuthorizedPersonPassport}
                                          onChange={(e) => handleInputChange('depositChecksAuthorizedPersonPassport', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ انتهاء الجواز *</label>
                                        <input
                                          type="date"
                                          value={formData.depositChecksAuthorizedPersonPassportExpiry}
                                          onChange={(e) => handleInputChange('depositChecksAuthorizedPersonPassportExpiry', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                          required
                                          suppressHydrationWarning
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">نسخة من جواز المفوض *</label>
                                        <input
                                          type="file"
                                          accept="image/*,.pdf"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleInputChange('depositChecksAuthorizedPersonPassportFile', file.name);
                                          }}
                                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-600 file:text-white"
                                          required
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* قائمة شيكات الضمان - مبسطة */}
                      <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="font-semibold text-gray-900">📝 شيكات الضمان</h6>
                          <button
                            type="button"
                            onClick={() => {
                              const newCheck = {
                                checkNumber: '',
                                amount: formData.depositPaymentMethod === 'cash_and_check' 
                                  ? (formData.deposit - formData.depositCashAmount) 
                                  : formData.deposit,
                                date: '',
                                hasDate: false
                              };
                              handleInputChange('depositChecks', [...formData.depositChecks, newCheck]);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                          >
                            <FaPlus className="w-3 h-3" />
                            إضافة شيك
                          </button>
                        </div>
                        
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {formData.depositChecks.map((check, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-900">الشيك #{index + 1}</span>
                                {formData.depositChecks.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newChecks = formData.depositChecks.filter((_, i) => i !== index);
                                      handleInputChange('depositChecks', newChecks);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    رقم الشيك *
                                  </label>
                                  <input
                                    type="text"
                                    value={check.checkNumber}
                                    onChange={(e) => {
                                      const newChecks = [...formData.depositChecks];
                                      newChecks[index].checkNumber = e.target.value;
                                      handleInputChange('depositChecks', newChecks);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                                    placeholder="رقم الشيك"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    المبلغ ({formData.currency}) *
                                  </label>
                                  <input
                                    type="number"
                                    value={check.amount}
                                    onChange={(e) => {
                                      const newChecks = [...formData.depositChecks];
                                      newChecks[index].amount = parseFloat(e.target.value) || 0;
                                      handleInputChange('depositChecks', newChecks);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                                    min="0"
                                    step="any"
                                    required
                                  />
                                </div>
                                <div>
                                  <div className="mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!check.hasDate}
                                        onChange={(e) => {
                                          const newChecks = [...formData.depositChecks];
                                          newChecks[index].hasDate = !e.target.checked;
                                          if (e.target.checked) {
                                            newChecks[index].date = '';
                                          }
                                          handleInputChange('depositChecks', newChecks);
                                        }}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                      />
                                      <span className="text-xs text-gray-700">شيك بدون تاريخ</span>
                                    </label>
                                  </div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    تاريخ الشيك {check.hasDate ? '*' : '(اختياري)'}
                                  </label>
                                  <input
                                    type="date"
                                    value={check.date}
                                    onChange={(e) => {
                                      const newChecks = [...formData.depositChecks];
                                      newChecks[index].date = e.target.value;
                                      handleInputChange('depositChecks', newChecks);
                                    }}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 ${!check.hasDate ? 'bg-gray-100' : ''}`}
                                    required={check.hasDate}
                                    disabled={!check.hasDate}
                                    suppressHydrationWarning
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 bg-green-100 rounded-lg p-3">
                          <p className="text-sm text-green-900" suppressHydrationWarning>
                            <strong>إجمالي شيكات الضمان:</strong> {formData.depositChecks.reduce((sum, check) => sum + check.amount, 0).toFixed(3)} {formData.currency}
                          </p>
                          {formData.depositPaymentMethod === 'cash_and_check' && (
                            <p className="text-sm text-green-900 mt-1" suppressHydrationWarning>
                              <strong>إجمالي الضمان:</strong> {(formData.depositCashAmount + formData.depositChecks.reduce((sum, check) => sum + check.amount, 0)).toFixed(3)} {formData.currency}
                              <span className="text-xs ml-2">(نقدي: {formData.depositCashAmount} + شيكات: {formData.depositChecks.reduce((sum, check) => sum + check.amount, 0).toFixed(3)})</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* القسم 4: أرقام المستندات ورسوم البلدية */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFileAlt className="text-purple-600" />
                أرقام المستندات الرسمية ورسوم البلدية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم استمارة عقد الإيجار للبلدية *
                  </label>
                  <input
                    type="text"
                    name="municipalityFormNumber"
                    value={formData.municipalityFormNumber}
                    onChange={(e) => handleInputChange('municipalityFormNumber', e.target.value)}
                    className={getRequiredFieldClasses(formData.municipalityFormNumber, "w-full px-4 py-3 rounded-lg mb-3")}
                    placeholder="أدخل رقم الاستمارة"
                    required
                  />
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    نسخة ورقية من الاستمارة *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleInputChange('municipalityFormFile', file.name);
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    required
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم عقد الإيجار المعتمد من البلدية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.municipalityContractNumber}
                    onChange={(e) => handleInputChange('municipalityContractNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3"
                    placeholder="أدخل رقم العقد المعتمد (إن وُجد)"
                  />
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    نسخة ورقية من العقد المعتمد (اختياري)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleInputChange('municipalityContractFile', file.name);
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-600 file:text-white hover:file:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رسوم تسجيل العقد في البلدية ({formData.currency}) *
                  </label>
                  <input
                    type="number"
                    value={formData.municipalityRegistrationFee}
                    onChange={(e) => handleInputChange('municipalityRegistrationFee', parseFloat(e.target.value) || 1)}
                    className={getRequiredFieldClasses(formData.municipalityRegistrationFee, "w-full px-4 py-3 rounded-lg")}
                    min="0"
                    step="any"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 عادةً 1 ريال - يدفعها المالك
                  </p>
                </div>
              </div>
              
              {/* توضيح رسوم البلدية */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900 mb-1">ملاحظة مهمة - رسوم البلدية</p>
                    <p className="text-sm text-yellow-800">
                      • رسوم البلدية (3% من إجمالي العقد) + رسوم التسجيل <strong>يدفعها المالك</strong>
                    </p>
                    <p className="text-sm text-yellow-800">
                      • تظهر في البيانات للمعلومية فقط ولن تُحسب على المستأجر
                    </p>
                    <p className="text-sm text-yellow-800" suppressHydrationWarning>
                      • إجمالي رسوم المالك للبلدية: {(formData.municipalityFees + formData.municipalityRegistrationFee).toFixed(3)} {formData.currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* القسم 5: قراءات العدادات */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-yellow-600" />
                قراءات العدادات والفواتير أثناء الاستئجار
              </h4>
              
              {/* عداد الكهرباء */}
              <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                <h5 className="font-semibold text-yellow-900 mb-4">⚡ عداد الكهرباء</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      قراءة عداد الكهرباء *
                    </label>
                    <input
                      type="text"
                      value={formData.electricityMeterReading}
                      onChange={(e) => handleInputChange('electricityMeterReading', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="أدخل القراءة الحالية"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مبلغ الفاتورة ({formData.currency}) *
                    </label>
                    <input
                      type="number"
                      value={formData.electricityBillAmount}
                      onChange={(e) => handleInputChange('electricityBillAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="مبلغ الفاتورة"
                      min="0"
                      step="any"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة العداد *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange('electricityMeterImage', file.name);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة الفاتورة *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange('electricityBillImage', file.name);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* عداد الماء */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h5 className="font-semibold text-blue-900 mb-4">💧 عداد الماء</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      قراءة عداد الماء *
                    </label>
                    <input
                      type="text"
                      value={formData.waterMeterReading}
                      onChange={(e) => handleInputChange('waterMeterReading', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="أدخل القراءة الحالية"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مبلغ الفاتورة ({formData.currency}) *
                    </label>
                    <input
                      type="number"
                      value={formData.waterBillAmount}
                      onChange={(e) => handleInputChange('waterBillAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="مبلغ الفاتورة"
                      min="0"
                      step="any"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة العداد *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange('waterMeterImage', file.name);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة الفاتورة *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange('waterBillImage', file.name);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* القسم 6: رسوم الإنترنت */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaGlobe className="text-cyan-600" />
                رسوم الإنترنت
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل المستأجر يدفع رسوم الإنترنت للمالك؟ *
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="no">لا (على مسؤولية المستأجر)</option>
                    <option value="yes">نعم (يدفعها للمالك)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 إذا كان "لا": المستأجر مسؤول عن اشتراك الإنترنت بنفسه
                  </p>
                  <p className="text-xs text-gray-500">
                    💡 إذا كان "نعم": المستأجر يدفع للمالك حسب الاشتراك
                  </p>
                </div>
                
                {formData.internetIncluded && (
                  <div className="bg-cyan-50 rounded-lg p-6 border-2 border-cyan-200">
                    <h6 className="font-semibold text-cyan-900 mb-4">📶 تفاصيل اشتراك الإنترنت</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نوع الاشتراك *
                        </label>
                        <select
                          value={formData.internetPaymentType}
                          onChange={(e) => handleInputChange('internetPaymentType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          required
                        >
                          <option value="monthly">اشتراك شهري</option>
                          <option value="annually">اشتراك سنوي (مرة واحدة)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          مقدار الرسوم ({formData.currency}) *
                        </label>
                        <input
                          type="number"
                          value={formData.internetFees}
                          onChange={(e) => handleInputChange('internetFees', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          min="0"
                          step="any"
                          placeholder="0.00"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                          {formData.internetPaymentType === 'monthly' 
                            ? '💡 المبلغ الشهري' 
                            : '💡 المبلغ السنوي (يُدفع مرة واحدة)'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-white rounded-lg p-3 border border-cyan-200">
                      <p className="text-sm text-cyan-900" suppressHydrationWarning>
                        <strong>إجمالي رسوم الإنترنت:</strong>{' '}
                        {formData.internetPaymentType === 'monthly' 
                          ? `${(formData.internetFees * formData.duration).toFixed(3)} ${formData.currency} (${formData.internetFees} × ${formData.duration} شهر)`
                          : `${formData.internetFees.toFixed(3)} ${formData.currency} (دفعة واحدة)`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* القسم 7: رسوم أخرى */}
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
                        وصف الرسوم الأخرى *
                      </label>
                      <input
                        type="text"
                        value={formData.otherFeesDescription}
                        onChange={(e) => handleInputChange('otherFeesDescription', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="مثال: رسوم الصيانة، رسوم التأمين، إلخ"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مقدار الرسوم الأخرى ({formData.currency}) *
                      </label>
                      <input
                        type="number"
                        value={formData.otherFeesAmount}
                        onChange={(e) => handleInputChange('otherFeesAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* القسم 8: الضريبة المضافة */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaDollarSign className="text-orange-600" />
                الضريبة المضافة (VAT)
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل الإيجار مشمول بالضريبة المضافة؟ *
                  </label>
                  <select
                    value={formData.includesVAT ? 'yes' : 'no'}
                    onChange={(e) => handleInputChange('includesVAT', e.target.value === 'yes')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم</option>
                  </select>
                </div>
                
                {formData.includesVAT && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نسبة الضريبة (%) *
                        </label>
                        <input
                          type="number"
                          value={formData.vatRate * 100}
                          onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value) / 100 || 0.05)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الضريبة الشهرية ({formData.currency})
                        </label>
                        <input
                          type="number"
                          value={formData.monthlyVATAmount}
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 cursor-not-allowed font-bold text-green-700"
                          readOnly
                          suppressHydrationWarning
                        />
                        <div className="absolute top-11 left-3 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                          محسوب تلقائياً ✓
                        </div>
                      </div>
                      
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          إجمالي الضريبة ({formData.currency})
                        </label>
                        <input
                          type="number"
                          value={formData.totalVATAmount}
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 cursor-not-allowed font-bold text-green-700"
                          readOnly
                          suppressHydrationWarning
                        />
                        <div className="absolute top-11 left-3 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                          محسوب تلقائياً ✓
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FaCheck className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 mb-1">حسابات الضريبة</p>
                          <div className="text-sm text-green-800 space-y-1">
                            <p suppressHydrationWarning>• الإيجار الشهري: {formData.monthlyRent} {formData.currency}</p>
                            <p suppressHydrationWarning>• الضريبة الشهرية: {formData.monthlyVATAmount} {formData.currency} ({formData.vatRate * 100}%)</p>
                            <p suppressHydrationWarning>• الإيجار الشهري شامل الضريبة: {(formData.monthlyRent + formData.monthlyVATAmount).toFixed(3)} {formData.currency}</p>
                            <p suppressHydrationWarning>• إجمالي الضريبة للعقد: {formData.totalVATAmount} {formData.currency}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* القسم 8.5: ضرائب أخرى */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaDollarSign className="text-red-600" />
                ضرائب أخرى
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل هناك ضرائب أخرى؟ *
                  </label>
                  <select
                    value={formData.hasOtherTaxes ? 'yes' : 'no'}
                    onChange={(e) => {
                      const hasTaxes = e.target.value === 'yes';
                      handleInputChange('hasOtherTaxes', hasTaxes);
                      if (!hasTaxes) {
                        handleInputChange('otherTaxName', '');
                        handleInputChange('otherTaxRate', 0);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم</option>
                  </select>
                </div>
                
                {formData.hasOtherTaxes && (
                  <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                    <h6 className="font-semibold text-red-900 mb-4">📋 تفاصيل الضريبة الأخرى</h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          مسمى الضريبة *
                        </label>
                        <input
                          type="text"
                          value={formData.otherTaxName}
                          onChange={(e) => handleInputChange('otherTaxName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="مثال: ضريبة الدخل، ضريبة الأملاك"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نسبة الضريبة (%) *
                        </label>
                        <input
                          type="number"
                          value={formData.otherTaxRate * 100}
                          onChange={(e) => handleInputChange('otherTaxRate', parseFloat(e.target.value) / 100 || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الضريبة الشهرية ({formData.currency})
                        </label>
                        <input
                          type="number"
                          value={formData.monthlyOtherTaxAmount}
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 cursor-not-allowed font-bold text-green-700"
                          readOnly
                          suppressHydrationWarning
                        />
                        <div className="absolute top-11 left-3 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                          محسوب تلقائياً ✓
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-white rounded-lg p-4 border border-red-200">
                      <p className="font-semibold text-red-900 mb-2">حسابات الضريبة</p>
                      <div className="text-sm text-red-800 space-y-1">
                        <p suppressHydrationWarning>• الإيجار الشهري: {formData.monthlyRent} {formData.currency}</p>
                        <p suppressHydrationWarning>• الضريبة الشهرية ({formData.otherTaxName || 'ضريبة أخرى'}): {formData.monthlyOtherTaxAmount} {formData.currency} ({formData.otherTaxRate * 100}%)</p>
                        <p suppressHydrationWarning>• إجمالي الضريبة للعقد: {formData.totalOtherTaxAmount} {formData.currency}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* القسم 9: الإيجارات الشهرية المخصصة */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-purple-600" />
                الإيجارات الشهرية المخصصة
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل تريد تخصيص الإيجار لكل شهر؟
                  </label>
                  <select
                    value={formData.useCustomMonthlyRents ? 'yes' : 'no'}
                    onChange={(e) => {
                      const useCustom = e.target.value === 'yes';
                      handleInputChange('useCustomMonthlyRents', useCustom);
                      if (useCustom && formData.customMonthlyRents.length === 0) {
                        // تهيئة المصفوفة بالقيمة الافتراضية
                        const rents = Array(formData.duration).fill(formData.monthlyRent);
                        handleInputChange('customMonthlyRents', rents);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="no">لا (نفس المبلغ لكل الأشهر)</option>
                    <option value="yes">نعم (أريد تخصيص المبلغ لكل شهر)</option>
                  </select>
                </div>
                
                {formData.useCustomMonthlyRents && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                    <div className="mb-4">
                      <p className="font-semibold text-purple-900 mb-2">جدول الإيجارات الشهرية</p>
                      <p className="text-sm text-purple-700">يمكنك تعديل قيمة الإيجار لكل شهر على حدة - تم ملء جميع الشهور بالقيمة الافتراضية</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                      {formData.customMonthlyRents.map((rent, index) => {
                        // حساب تاريخ كل شهر بالإنجليزي
                        const monthDate = new Date(formData.startDate);
                        monthDate.setMonth(monthDate.getMonth() + index);
                        const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        const dueDate = new Date(monthDate);
                        dueDate.setDate(formData.rentDueDay);
                        const dueDateStr = dueDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
                        
                        return (
                          <div key={index} className="bg-white rounded-lg p-3 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-2">
                              <p className="text-xs font-bold text-purple-900">الشهر {index + 1}</p>
                              <p className="text-[10px] text-purple-600" suppressHydrationWarning>{monthName}</p>
                              <p className="text-[10px] text-gray-500" suppressHydrationWarning>
                                📅 الاستحقاق: {dueDateStr}
                              </p>
                            </div>
                            <input
                              type="number"
                              value={rent}
                              onChange={(e) => {
                                const newRents = [...formData.customMonthlyRents];
                                newRents[index] = parseFloat(e.target.value) || 0;
                                handleInputChange('customMonthlyRents', newRents);
                              }}
                              className="w-full px-2 py-2 border border-purple-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent font-bold"
                              min="0"
                              step="any"
                              placeholder="0.00"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                              {formData.currency}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 bg-white rounded-lg p-4 border-2 border-purple-300">
                      <p className="font-semibold text-purple-900 mb-2">ملخص الإيجارات المخصصة</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">إجمالي الإيجارات:</span>
                          <p className="font-bold text-purple-900" suppressHydrationWarning>
                            {formData.customMonthlyRents.reduce((sum, rent) => sum + rent, 0).toFixed(3)} {formData.currency}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">متوسط الإيجار الشهري:</span>
                          <p className="font-bold text-purple-900" suppressHydrationWarning>
                            {(formData.customMonthlyRents.reduce((sum, rent) => sum + rent, 0) / formData.duration).toFixed(3)} {formData.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* القسم 10: ملخص الحسابات النهائية */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                ملخص الحسابات النهائية
              </h4>
              <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-300 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* مستحقات المستأجر */}
                  <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                    <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      💰 مستحقات المستأجر
                    </h5>
                    <div className="space-y-2 text-sm">
                      {/* حساب الإيجار الأساسي الكامل والتخفيضات */}
                      {(() => {
                        // الإيجار الأساسي الكامل (قبل أي تخفيضات)
                        const fullRent = formData.monthlyRent * formData.duration;
                        
                        // حساب التخفيض من الإيجارات المخصصة
                        const customRentDiscount = formData.useCustomMonthlyRents 
                          ? fullRent - formData.customMonthlyRents.reduce((sum, rent) => sum + rent, 0)
                          : 0;
                        
                        // حساب التخفيض من فترة السماح
                        const gracePeriodDiscount = formData.gracePeriodDays && formData.gracePeriodDays > 0
                          ? (formData.monthlyRent / 30) * formData.gracePeriodDays
                          : 0;
                        
                        // إجمالي التخفيضات
                        const totalDiscounts = customRentDiscount + gracePeriodDiscount;
                        
                        // الإيجار الفعلي بعد التخفيضات
                        const actualRent = fullRent - totalDiscounts;
                        
                        // إعادة حساب الضرائب على الإيجار الفعلي
                        const actualVAT = formData.includesVAT ? actualRent * formData.vatRate : 0;
                        const actualOtherTax = formData.hasOtherTaxes ? actualRent * formData.otherTaxRate : 0;
                        
                        return (
                          <>
                            {/* الإيجار الأساسي الكامل */}
                            <div className="flex justify-between">
                              <span className="text-gray-600">الإيجار الأساسي الكامل:</span>
                              <span className="font-bold" suppressHydrationWarning>
                                {fullRent.toFixed(3)} {formData.currency}
                              </span>
                            </div>
                            
                            {/* التخفيضات الممنوحة */}
                            {totalDiscounts > 0 && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 my-2">
                                <p className="font-semibold text-blue-900 text-xs mb-2">🎁 التخفيضات الممنوحة:</p>
                                <div className="space-y-1">
                                  {customRentDiscount > 0 && (
                                    <div className="flex justify-between text-xs text-blue-700">
                                      <span>• تخفيض الإيجار المخصص:</span>
                                      <span className="font-bold" suppressHydrationWarning>
                                        -{customRentDiscount.toFixed(3)} {formData.currency}
                                      </span>
                                    </div>
                                  )}
                                  {gracePeriodDiscount > 0 && (
                                    <div className="flex justify-between text-xs text-blue-700">
                                      <span>• تخفيض فترة السماح ({formData.gracePeriodDays} يوم):</span>
                                      <span className="font-bold" suppressHydrationWarning>
                                        -{gracePeriodDiscount.toFixed(3)} {formData.currency}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-xs font-bold text-blue-900 pt-1 border-t border-blue-300">
                                    <span>إجمالي التخفيضات:</span>
                                    <span suppressHydrationWarning>
                                      -{totalDiscounts.toFixed(3)} {formData.currency}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* الإيجار الفعلي */}
                            <div className="flex justify-between font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                              <span>الإيجار الفعلي المطلوب:</span>
                              <span suppressHydrationWarning>
                                {actualRent.toFixed(3)} {formData.currency}
                              </span>
                            </div>
                            
                            {/* الضرائب على الإيجار الفعلي */}
                            {formData.includesVAT && (
                              <div className="flex justify-between text-orange-600">
                                <span>ضريبة القيمة المضافة ({formData.vatRate * 100}%):</span>
                                <span className="font-bold" suppressHydrationWarning>
                                  +{actualVAT.toFixed(3)} {formData.currency}
                                </span>
                              </div>
                            )}
                            {formData.hasOtherTaxes && (
                              <div className="flex justify-between text-red-600">
                                <span>{formData.otherTaxName} ({formData.otherTaxRate * 100}%):</span>
                                <span className="font-bold" suppressHydrationWarning>
                                  +{actualOtherTax.toFixed(3)} {formData.currency}
                                </span>
                              </div>
                            )}
                            
                            {/* باقي المستحقات */}
                            <div className="flex justify-between">
                              <span className="text-gray-600">مبلغ الضمان:</span>
                              <span className="font-bold" suppressHydrationWarning>
                                {formData.deposit} {formData.currency}
                              </span>
                            </div>
                            {formData.internetIncluded && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  رسوم الإنترنت ({formData.internetPaymentType === 'monthly' ? 'شهري' : 'سنوي'}):
                                </span>
                                <span className="font-bold" suppressHydrationWarning>
                                  {formData.internetPaymentType === 'monthly' 
                                    ? `${(formData.internetFees * formData.duration).toFixed(3)}`
                                    : formData.internetFees.toFixed(3)
                                  } {formData.currency}
                                </span>
                              </div>
                            )}
                            {formData.hasOtherFees && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">{formData.otherFeesDescription}:</span>
                                <span className="font-bold" suppressHydrationWarning>
                                  {formData.otherFeesAmount} {formData.currency}
                                </span>
                              </div>
                            )}
                            
                            {/* الإجمالي النهائي */}
                            <div className="flex justify-between pt-2 border-t-2 border-green-300 font-bold text-green-900">
                              <span>إجمالي مستحقات المستأجر:</span>
                              <span className="text-lg" suppressHydrationWarning>
                                {(
                                  actualRent +
                                  actualVAT +
                                  actualOtherTax +
                                  formData.deposit +
                                  (formData.internetIncluded 
                                    ? (formData.internetPaymentType === 'monthly' 
                                        ? formData.internetFees * formData.duration 
                                        : formData.internetFees)
                                    : 0) +
                                  (formData.hasOtherFees ? formData.otherFeesAmount : 0)
                                ).toFixed(3)} {formData.currency}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* مستحقات المالك للبلدية */}
                  <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
                    <h5 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      🏛️ مستحقات المالك للبلدية
                      <span className="text-xs bg-yellow-100 px-2 py-1 rounded">لا يدفعها المستأجر</span>
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">رسوم البلدية (3%):</span>
                        <span className="font-bold" suppressHydrationWarning>
                          {formData.municipalityFees} {formData.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">رسوم التسجيل:</span>
                        <span className="font-bold" suppressHydrationWarning>
                          {formData.municipalityRegistrationFee} {formData.currency}
                        </span>
                      </div>
                      {formData.electricityBillAmount > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>فاتورة الكهرباء الحالية:</span>
                          <span className="font-bold" suppressHydrationWarning>
                            {formData.electricityBillAmount.toFixed(3)} {formData.currency}
                          </span>
                        </div>
                      )}
                      {formData.waterBillAmount > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>فاتورة الماء الحالية:</span>
                          <span className="font-bold" suppressHydrationWarning>
                            {formData.waterBillAmount.toFixed(3)} {formData.currency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t-2 border-yellow-300 font-bold text-yellow-900">
                        <span>إجمالي مستحقات المالك:</span>
                        <span className="text-lg" suppressHydrationWarning>
                          {(
                            formData.municipalityFees + 
                            formData.municipalityRegistrationFee +
                            (formData.electricityBillAmount || 0) +
                            (formData.waterBillAmount || 0)
                          ).toFixed(3)} {formData.currency}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        ℹ️ هذه الرسوم والفواتير يدفعها المالك ولا تُحسب على المستأجر
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        • رسوم البلدية والتسجيل: للجهات الحكومية
                      </p>
                      <p className="text-xs text-yellow-700">
                        • فواتير الكهرباء والماء: إذا كان المستأجر جديد (على المالك)
                      </p>
                    </div>
                  </div>
                  
                  {/* الإجمالي الكلي للمستأجر */}
                  <div className="md:col-span-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">💎 الإجمالي الكلي الذي يدفعه المستأجر</p>
                        <p className="text-xs opacity-75">(شامل الإيجار + الضريبة + الضمان + الرسوم الأخرى)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold" suppressHydrationWarning>
                          {(
                            (formData.useCustomMonthlyRents 
                              ? formData.customMonthlyRents.reduce((sum, rent) => sum + rent, 0)
                              : formData.monthlyRent * formData.duration
                            ) +
                            formData.totalVATAmount +
                            formData.totalOtherTaxAmount +
                            formData.deposit +
                            (formData.internetIncluded 
                              ? (formData.internetPaymentType === 'monthly' 
                                  ? formData.internetFees * formData.duration 
                                  : formData.internetFees)
                              : 0) +
                            (formData.hasOtherFees ? formData.otherFeesAmount : 0)
                          ).toFixed(3)}
                        </p>
                        <p className="text-sm opacity-90">{formData.currency}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* القسم 11: الشروط والأحكام الإضافية */}
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
                onClick={() => {
                  const missingFields = validateStep4();
                  if (missingFields.length > 0) {
                    // عرض رسالة مفصلة بالحقول الناقصة
                    const message = `⚠️ يرجى إكمال الحقول التالية:\n\n${missingFields.map((item, i) => `${i + 1}. ${item.field}`).join('\n')}\n\nسيتم الانتقال إلى أول حقل ناقص عند الضغط على "موافق".`;
                    
                    if (confirm(message)) {
                      // الانتقال إلى أول حقل ناقص
                      const firstMissing = missingFields[0];
                      if (firstMissing.element) {
                        // محاولة التركيز على الحقل
                        setTimeout(() => {
                          const element = document.querySelector(`[name="${firstMissing.element}"]`) as HTMLElement;
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.focus();
                            // إضافة تأثير بصري
                            element.classList.add('ring-4', 'ring-red-500', 'ring-opacity-50');
                            setTimeout(() => {
                              element.classList.remove('ring-4', 'ring-red-500', 'ring-opacity-50');
                            }, 2000);
                          }
                        }, 100);
                      }
                    }
                    return;
                  }
                  setCurrentStep(5);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
            
            {/* ملخص العقد الشامل */}
            <div className="space-y-6 mb-6">
              {/* نوع العقد */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-300">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaFileContract className="text-purple-600" />
                  نوع العقد
                </h4>
                <p className="text-xl font-bold" suppressHydrationWarning>
                  {formData.contractType === 'residential' ? '🏠 عقد سكني' : '🏢 عقد تجاري'}
                </p>
              </div>
              
              {/* معلومات المؤجر (المالك) */}
              <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300">
                <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <FaUser className="w-5 h-5" />
                  معلومات المؤجر (المالك)
                </h5>
                <div className="space-y-2 text-sm">
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">اسم المالك:</span> <span className="text-gray-900">{selectedProperty?.ownerName || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">الهاتف:</span> <span className="text-gray-900">{selectedProperty?.ownerPhone || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">البريد:</span> <span className="text-gray-900">{selectedProperty?.ownerEmail || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">معرف المالك:</span> <span className="text-gray-900">{selectedProperty?.ownerId || 'غير محدد'}</span></p>
                </div>
              </div>
              
              {/* معلومات العقار الأساسية */}
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
                <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <FaBuilding className="w-5 h-5" />
                  معلومات العقار
                </h5>
                <div className="space-y-2 text-sm">
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">العقار:</span> <span className="text-gray-900">{selectedProperty?.titleAr}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">الوحدة:</span> <span className="text-gray-900">الوحدة {selectedUnit?.unitNo || 'N/A'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">النوع:</span> <span className="text-gray-900">{selectedProperty?.buildingType === 'single' ? 'عقار مفرد' : 'عقار متعدد الوحدات'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">المساحة:</span> <span className="text-gray-900">{selectedUnit?.area || selectedProperty?.area} م²</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم المبنى:</span> <span className="text-gray-900">{selectedProperty?.buildingNumber || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">الرقم المتسلسل:</span> <span className="text-gray-900">{selectedProperty?.serialNumber || 'غير محدد'}</span></p>
                </div>
              </div>
              
              {/* البيانات الإضافية للعقار */}
              <div className="bg-teal-50 rounded-lg p-6 border-2 border-teal-300">
                <h5 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-5 h-5" />
                  البيانات الإضافية للعقار
                </h5>
                <div className="space-y-2 text-sm">
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">المجمع:</span> <span className="text-gray-900">{selectedProperty?.complexName || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم المجمع:</span> <span className="text-gray-900">{selectedProperty?.complexNumber || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">السكة:</span> <span className="text-gray-900">{selectedProperty?.streetName || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم الطريق:</span> <span className="text-gray-900">{selectedProperty?.roadNumber || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">الرقم المساحي:</span> <span className="text-gray-900">{selectedProperty?.surveyNumber || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم القطعة:</span> <span className="text-gray-900">{selectedProperty?.plotNumber || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم المربع:</span> <span className="text-gray-900">{selectedProperty?.squareNumber || 'غير محدد'}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم البلوك:</span> <span className="text-gray-900">{selectedProperty?.blockNumber || 'غير محدد'}</span></p>
                </div>
              </div>
              
              {/* معلومات المستأجر */}
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
                <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <FaUser className="w-5 h-5" />
                  معلومات المستأجر
                </h5>
                <div className="space-y-2 text-sm">
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">الاسم:</span> <span className="text-gray-900">{formData.tenantName}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">الهاتف:</span> <span className="text-gray-900">{formData.tenantPhone}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">البريد:</span> <span className="text-gray-900">{formData.tenantEmail}</span></p>
                  {formData.tenantId && <p suppressHydrationWarning><span className="font-medium text-gray-700">الهوية:</span> <span className="text-gray-900">{formData.tenantId}</span></p>}
                </div>
              </div>
              
              {/* التواريخ */}
              <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-300">
                <h5 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <FaCalendar className="w-5 h-5" />
                  التواريخ المهمة
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">تاريخ الاستئجار الفعلي:</span> <span className="text-gray-900">{formData.actualRentalDate}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">تاريخ استلام الوحدة:</span> <span className="text-gray-900">{formData.unitHandoverDate}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">تاريخ بدء العقد الرسمي:</span> <span className="text-gray-900">{formData.startDate}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">تاريخ انتهاء العقد:</span> <span className="text-gray-900">{formData.endDate}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">المدة:</span> <span className="text-gray-900">{formData.duration} شهر</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">يوم استحقاق الإيجار:</span> <span className="text-gray-900">اليوم {formData.rentDueDay} من كل شهر</span></p>
                </div>
              </div>
              
              {/* المبالغ المالية */}
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
                <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="w-5 h-5" />
                  المبالغ المالية
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    {formData.calculateByArea && (
                      <>
                        <p className="font-semibold text-indigo-700">📐 محسوب بالمتر:</p>
                        <p suppressHydrationWarning><span className="font-medium text-gray-700">المساحة:</span> <span className="text-gray-900">{formData.rentArea} م²</span></p>
                        <p suppressHydrationWarning><span className="font-medium text-gray-700">السعر للمتر:</span> <span className="text-gray-900">{formData.pricePerMeter} {formData.currency}</span></p>
                      </>
                    )}
                    <p suppressHydrationWarning><span className="font-medium text-gray-700">الإيجار الشهري:</span> <span className="text-gray-900 font-bold">{formData.monthlyRent.toFixed(3)} {formData.currency}</span></p>
                    <p suppressHydrationWarning><span className="font-medium text-gray-700">مبلغ الضمان:</span> <span className="text-gray-900">{formData.deposit.toFixed(3)} {formData.currency}</span></p>
                    {formData.gracePeriodDays > 0 && (
                      <p suppressHydrationWarning><span className="font-medium text-gray-700">فترة السماح:</span> <span className="text-gray-900">{formData.gracePeriodDays} يوم ({formData.gracePeriodAmount.toFixed(3)} {formData.currency})</span></p>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {formData.includesVAT && (
                      <p suppressHydrationWarning><span className="font-medium text-gray-700">ضريبة القيمة المضافة:</span> <span className="text-gray-900">{formData.vatRate * 100}% ({formData.totalVATAmount.toFixed(3)} {formData.currency})</span></p>
                    )}
                    {formData.hasOtherTaxes && (
                      <p suppressHydrationWarning><span className="font-medium text-gray-700">{formData.otherTaxName}:</span> <span className="text-gray-900">{formData.otherTaxRate * 100}% ({formData.totalOtherTaxAmount.toFixed(3)} {formData.currency})</span></p>
                    )}
                    <p suppressHydrationWarning className="font-bold text-green-900"><span className="font-medium text-gray-700">إجمالي العقد:</span> {(formData.monthlyRent * formData.duration).toFixed(3)} {formData.currency}</p>
                  </div>
                </div>
              </div>
              
              {/* طرق الدفع */}
              <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-300">
                <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <FaDollarSign className="w-5 h-5" />
                  طرق الدفع
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">دفع الإيجار:</p>
                    <p suppressHydrationWarning>
                      <span className="font-medium text-gray-700">الطريقة:</span>{' '}
                      {formData.rentPaymentMethod === 'cash' && '💵 نقداً'}
                      {formData.rentPaymentMethod === 'check' && '📝 شيك'}
                      {formData.rentPaymentMethod === 'bank_transfer' && '🏦 تحويل بنكي'}
                      {formData.rentPaymentMethod === 'electronic_payment' && '💳 دفع إلكتروني'}
                    </p>
                    {formData.rentPaymentMethod === 'check' && (
                      <p suppressHydrationWarning><span className="font-medium text-gray-700">عدد الشيكات:</span> {formData.rentChecks.length}</p>
                    )}
                    {formData.rentReceiptNumber && (
                      <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم الإيصال:</span> {formData.rentReceiptNumber}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">دفع الضمان:</p>
                    <p suppressHydrationWarning>
                      <span className="font-medium text-gray-700">الطريقة:</span>{' '}
                      {formData.depositPaymentMethod === 'cash' && '💵 نقداً'}
                      {formData.depositPaymentMethod === 'check' && '📝 شيك'}
                      {formData.depositPaymentMethod === 'cash_and_check' && '💵📝 نقدي + شيك'}
                      {formData.depositPaymentMethod === 'bank_transfer' && '🏦 تحويل بنكي'}
                      {formData.depositPaymentMethod === 'electronic_payment' && '💳 دفع إلكتروني'}
                    </p>
                    {formData.depositPaymentMethod === 'cash_and_check' && (
                      <>
                        <p suppressHydrationWarning><span className="font-medium text-gray-700">المبلغ النقدي:</span> {formData.depositCashAmount.toFixed(3)} {formData.currency}</p>
                        <p suppressHydrationWarning><span className="font-medium text-gray-700">عدد الشيكات:</span> {formData.depositChecks.length}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* المستندات */}
              <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-300">
                <h5 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  المستندات الرسمية
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم استمارة البلدية:</span> <span className="text-gray-900">{formData.municipalityFormNumber}</span></p>
                  {formData.municipalityContractNumber && (
                    <p suppressHydrationWarning><span className="font-medium text-gray-700">رقم العقد المعتمد:</span> <span className="text-gray-900">{formData.municipalityContractNumber}</span></p>
                  )}
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رسوم التسجيل:</span> <span className="text-gray-900">{formData.municipalityRegistrationFee} {formData.currency}</span></p>
                  <p suppressHydrationWarning><span className="font-medium text-gray-700">رسوم البلدية (3%):</span> <span className="text-gray-900">{formData.municipalityFees.toFixed(3)} {formData.currency}</span></p>
                </div>
              </div>
              
              {/* قراءات العدادات */}
              <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-300">
                <h5 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  قراءات العدادات
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">⚡ الكهرباء:</p>
                    <p suppressHydrationWarning><span className="font-medium text-gray-700">القراءة:</span> {formData.electricityMeterReading}</p>
                    {formData.electricityBillAmount > 0 && (
                      <p suppressHydrationWarning><span className="font-medium text-gray-700">مبلغ الفاتورة:</span> {formData.electricityBillAmount.toFixed(3)} {formData.currency}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">💧 الماء:</p>
                    <p suppressHydrationWarning><span className="font-medium text-gray-700">القراءة:</span> {formData.waterMeterReading}</p>
                    {formData.waterBillAmount > 0 && (
                      <p suppressHydrationWarning><span className="font-medium text-gray-700">مبلغ الفاتورة:</span> {formData.waterBillAmount.toFixed(3)} {formData.currency}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {formData.customTerms && (
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
                  <h5 className="font-medium text-gray-900 mb-2">الشروط الإضافية</h5>
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
                          طلب تسجيل عقد جديد
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
            
            {/* زر اختيار القالب */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaFileContract className="w-5 h-5 text-blue-600" />
                    اختر قالب العقد الاحترافي
                  </h5>
                  <p className="text-sm text-gray-600">
                    اختر من مكتبة القوالب الاحترافية - سيتم ملء القالب تلقائياً بجميع البيانات
                  </p>
                </div>
                <InstantLink
                  href={`/contracts/templates?contractType=${formData.contractType}&returnUrl=${encodeURIComponent('/rentals/new')}&step=5`}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <FaFileContract className="w-4 h-4" />
                  مكتبة القوالب
                </InstantLink>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-2xl mb-1">📋</p>
                  <p className="text-xs text-gray-600">قوالب جاهزة</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-2xl mb-1">⚡</p>
                  <p className="text-xs text-gray-600">ملء تلقائي</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-2xl mb-1">✅</p>
                  <p className="text-xs text-gray-600">جاهز للطباعة</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                السابق
              </button>
              
              <div className="flex flex-col md:flex-row gap-3">
                {/* زر الأرشفة */}
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('هل تريد أرشفة هذا العقد؟\n\nسيتم حفظ العقد في الأرشيف بدون إرساله للتوقيع.')) {
                      setLoading(true);
                      try {
                        const response = await fetch('/api/rentals/archive', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...formData,
                            propertyId: selectedProperty?.id,
                            unitId: selectedUnit?.id,
                            status: 'archived'
                          })
                        });
                        
                        if (response.ok) {
                          setSuccess('✅ تم أرشفة العقد بنجاح!');
                          setTimeout(() => router.push('/dashboard/owner'), 2000);
                        } else {
                          setError('فشل أرشفة العقد');
                        }
                      } catch (err) {
                        setError('حدث خطأ في الأرشفة');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <FaFileAlt className="w-4 h-4" />
                  أرشفة العقد
                </button>
                
                {/* زر حفظ ومتابعة */}
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/rentals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...formData,
                          propertyId: selectedProperty?.id,
                          unitId: selectedUnit?.id,
                          status: 'draft'
                        })
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        setSuccess('✅ تم حفظ العقد بنجاح!');
                        // الانتقال إلى صفحة العقد للمتابعة
                        setTimeout(() => router.push(`/rentals/${data.id}`), 1500);
                      } else {
                        setError('فشل حفظ العقد');
                      }
                    } catch (err) {
                      console.error('Error saving rental:', err);
                      setError('حدث خطأ في الحفظ');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
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
                      حفظ ومتابعة
                    </>
                  )}
                </button>
                
                {/* زر الحفظ النهائي */}
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4" />
                      حفظ نهائي
                    </>
                  )}
                </button>
              </div>
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
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentStep(step.id)}
                          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all mb-2 cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg ring-4 ring-blue-100'
                              : isCompleted
                              ? 'bg-green-500 text-white shadow-md hover:shadow-lg'
                              : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
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
                        <p 
                          onClick={() => setCurrentStep(step.id)}
                          className={`text-xs font-medium text-center transition-colors cursor-pointer ${
                            isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
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
