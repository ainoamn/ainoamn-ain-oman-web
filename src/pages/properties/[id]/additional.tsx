// src/pages/properties/[id]/additional.tsx
// صفحة البيانات الإضافية للعقار - أرقام الحسابات والخدمات والمستندات

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import InstantLink from '@/components/InstantLink';
import RequiredLabel, { REQUIRED_INPUT_CLASSES, REQUIRED_SELECT_CLASSES, OPTIONAL_INPUT_CLASSES } from '@/components/RequiredLabel';
import {
  FaArrowLeft, FaSave, FaPlus, FaTrash, FaEdit, FaFileAlt,
  FaBolt, FaTint, FaWifi, FaPhone, FaGasPump, FaReceipt,
  FaBuilding, FaCreditCard, FaUniversity, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaUpload, FaDownload, FaEye,
  FaFileContract, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel,
  FaClock, FaCalendar, FaInfoCircle, FaChevronDown, FaChevronUp,
  FaUser, FaUsers
} from 'react-icons/fa';

interface MeterHistory {
  id: string;
  oldMeterNumber: string;
  oldMeterImage: string;
  oldMeterReading: string;
  newMeterNumber: string;
  newMeterImage: string;
  replacementDate: string;
  replacementReason?: string;
  replacementNotes?: string;
  createdAt: string;
}

interface ServiceAccount {
  id: string;
  type: 'electricity' | 'water' | 'internet' | 'gas' | 'phone' | 'municipality' | 'other';
  accountNumber: string;
  accountName?: string;
  provider?: string;
  notes?: string;
  active: boolean;
  // خاص بالكهرباء والمياه
  meterNumber?: string;
  meterImage?: string;
  paymentType?: 'prepaid' | 'postpaid';
  // تاريخ العدادات (لا يمكن حذفه)
  meterHistory?: MeterHistory[];
}

interface Document {
  id: string;
  name: string;
  type: 'ownership_deed' | 'survey_drawing' | 'contract' | 'deed' | 'permit' | 'certificate' | 'invoice' | 'photo' | 'other';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt: string;
  expiryDate?: string;
  notes?: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  iban?: string;
  swift?: string;
  currency: string;
  purpose: string;
  active: boolean;
}

interface OwnerData {
  fullName: string;
  nationalId: string;
  nationalIdExpiry: string;
  nationalIdFile?: string;
  phone: string;
  email: string;
}

interface StaffData {
  buildingGuardName?: string;
  buildingGuardPhone?: string;
  maintenanceOfficerName?: string;
  maintenanceOfficerPhone?: string;
  administrativeOfficerName?: string;
  administrativeOfficerPhone?: string;
}

interface PropertyData {
  complexNumber?: string;
  plotNumber?: string;
  streetName?: string;
  area?: string;
  squareNumber?: string;
  surveyNumber?: string;
  buildingNumber?: string;
  roadNumber?: string;
  landUseType?: string;
  floor?: string;
  unitType?: string;
}

export default function PropertyAdditionalData() {
  const router = useRouter();
  const { id, returnUrl } = router.query;
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Service Accounts
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState<Partial<ServiceAccount>>({
    type: 'electricity',
    active: true
  });
  
  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    type: 'ownership_deed'
  });
  
  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState<Partial<BankAccount>>({
    currency: 'OMR',
    active: true
  });
  
  // Owner Data
  const [ownerData, setOwnerData] = useState<OwnerData>({
    fullName: '',
    nationalId: '',
    nationalIdExpiry: '',
    phone: '',
    email: ''
  });
  
  // Staff Data
  const [staffData, setStaffData] = useState<StaffData>({});
  
  // Property Data
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  
  // Meter Replacement States
  const [showMeterReplacement, setShowMeterReplacement] = useState(false);
  const [selectedServiceForMeterChange, setSelectedServiceForMeterChange] = useState<ServiceAccount | null>(null);
  const [meterReplacementData, setMeterReplacementData] = useState({
    oldMeterReading: '',
    oldMeterImage: null as File | null,
    newMeterNumber: '',
    newMeterImage: null as File | null,
    replacementDate: new Date().toISOString().split('T')[0],
    replacementReason: '',
    replacementNotes: ''
  });
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['owner', 'staff', 'propertyData', 'services', 'documents', 'banks']));

  useEffect(() => {
    if (id) {
      loadPropertyData();
    }
  }, [id]);

  const loadPropertyData = async () => {
    try {
      // Load property basic data
      const propRes = await fetch(`/api/properties/${id}`);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProperty(propData.property || propData);
      }
      
      // Load additional data from API
      const additionalRes = await fetch(`/api/properties/${id}/additional`);
      if (additionalRes.ok) {
        const data = await additionalRes.json();
        console.log('📥 تم تحميل البيانات الإضافية:', data);
        
        setServiceAccounts(data.serviceAccounts || []);
        setDocuments(data.documents || []);
        setBankAccounts(data.bankAccounts || []);
        setOwnerData(data.ownerData || {
          fullName: '',
          nationalId: '',
          nationalIdExpiry: '',
          phone: '',
          email: ''
        });
        setStaffData(data.staffData || {});
        setPropertyData(data.propertyData || {});
      } else {
        console.log('⚠️ لا توجد بيانات إضافية محفوظة');
      }
    } catch (error) {
      console.error('Error loading property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateRequiredData = () => {
    const missing: string[] = [];
    
    // التحقق من بيانات المالك الإجبارية
    if (!ownerData.fullName || ownerData.fullName.trim() === '') {
      missing.push('الاسم الكامل للمالك');
    }
    if (!ownerData.nationalId || ownerData.nationalId.trim() === '') {
      missing.push('رقم البطاقة المدنية للمالك');
    }
    if (!ownerData.nationalIdExpiry || ownerData.nationalIdExpiry.trim() === '') {
      missing.push('تاريخ انتهاء البطاقة المدنية');
    }
    if (!ownerData.nationalIdFile || ownerData.nationalIdFile.trim() === '') {
      missing.push('نسخة من البطاقة الشخصية (ملف)');
    }
    if (!ownerData.phone || ownerData.phone.trim() === '') {
      missing.push('رقم هاتف المالك');
    }
    if (!ownerData.email || ownerData.email.trim() === '') {
      missing.push('البريد الإلكتروني للمالك');
    }
    
    // التحقق من بيانات الموظفين الإجبارية
    if (!staffData.maintenanceOfficerName || staffData.maintenanceOfficerName.trim() === '') {
      missing.push('اسم مسؤول الصيانة');
    }
    if (!staffData.maintenanceOfficerPhone || staffData.maintenanceOfficerPhone.trim() === '') {
      missing.push('رقم هاتف مسؤول الصيانة');
    }
    
    // التحقق من بيانات العقار الإجبارية
    if (!propertyData.buildingNumber || propertyData.buildingNumber.trim() === '') {
      missing.push('رقم المبنى (بيانات العقار)');
    }
    if (!propertyData.landUseType || propertyData.landUseType.trim() === '') {
      missing.push('نوع استعمال الأرض');
    }
    if (!propertyData.area || propertyData.area.trim() === '') {
      missing.push('المنطقة (بيانات العقار)');
    }
    if (!propertyData.surveyNumber || propertyData.surveyNumber.trim() === '') {
      missing.push('رقم الرسم المساحي');
    }
    if (!propertyData.plotNumber || propertyData.plotNumber.trim() === '') {
      missing.push('رقم القطعة');
    }
    
    // التحقق من حسابات الخدمات الضرورية (كهرباء ومياه)
    const electricityAccount = serviceAccounts.find(s => s.type === 'electricity');
    const waterAccount = serviceAccounts.find(s => s.type === 'water');
    
    if (!electricityAccount) {
      missing.push('حساب الكهرباء');
    } else {
      if (!electricityAccount.accountNumber || electricityAccount.accountNumber.trim() === '') {
        missing.push('رقم حساب الكهرباء');
      }
      if (!electricityAccount.meterImage || electricityAccount.meterImage.trim() === '') {
        missing.push('صورة عداد الكهرباء');
      }
      if (!electricityAccount.paymentType || electricityAccount.paymentType.trim() === '') {
        missing.push('نوع الدفع (كهرباء) - يجب اختيار مسبق أو آجل');
      }
    }
    
    if (!waterAccount) {
      missing.push('حساب المياه');
    } else {
      if (!waterAccount.accountNumber || waterAccount.accountNumber.trim() === '') {
        missing.push('رقم حساب المياه');
      }
      if (!waterAccount.meterImage || waterAccount.meterImage.trim() === '') {
        missing.push('صورة عداد المياه');
      }
      if (!waterAccount.paymentType || waterAccount.paymentType.trim() === '') {
        missing.push('نوع الدفع (مياه) - يجب اختيار مسبق أو آجل');
      }
    }
    
    // التحقق من المستندات الإجبارية
    const hasOwnershipDeed = documents.some(d => d.type === 'ownership_deed' && d.fileUrl?.trim());
    const hasSurveyDrawing = documents.some(d => d.type === 'survey_drawing' && d.fileUrl?.trim());
    
    if (!hasOwnershipDeed) {
      missing.push('ملكية العقار (مستند إجباري)');
    }
    if (!hasSurveyDrawing) {
      missing.push('الرسم المساحي (مستند إجباري)');
    }
    
    return missing;
  };

  const saveData = async () => {
    // التحقق من البيانات المطلوبة قبل الحفظ
    console.log('🔍 بدء التحقق من البيانات...');
    console.log('📋 ownerData:', ownerData);
    console.log('📋 staffData:', staffData);
    console.log('📋 propertyData:', propertyData);
    console.log('📋 serviceAccounts:', serviceAccounts);
    console.log('📋 documents:', documents);
    
    const missingData = validateRequiredData();
    console.log('⚠️ البيانات الناقصة:', missingData);
    
    if (missingData.length > 0) {
      const missingList = missingData.map((item, i) => `${i + 1}. ${item}`).join('\n');
      alert(`❌ لا يمكن الحفظ! البيانات التالية مطلوبة:\n\n${missingList}\n\n(عدد الحقول الناقصة: ${missingData.length})`);
      return;
    }
    
    setSaving(true);
    try {
      const data = {
        ownerData,
        staffData,
        propertyData,
        serviceAccounts,
        documents,
        bankAccounts,
        updatedAt: new Date().toISOString()
      };
      
      console.log('💾 جاري حفظ البيانات الإضافية للعقار:', id, data);
      
      // Save to API (which saves to properties.json)
      const response = await fetch(`/api/properties/${id}/additional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل الحفظ');
      }

      const result = await response.json();
      console.log('✅ تم حفظ البيانات بنجاح:', result);
      
      alert('✅ تم حفظ جميع البيانات بنجاح في قاعدة البيانات!');
      
      // Optional: Also save to localStorage as backup
      localStorage.setItem(`property-${id}-additional`, JSON.stringify(data));
      
      // العودة للصفحة السابقة إذا كان هناك returnUrl
      if (returnUrl && typeof returnUrl === 'string') {
        console.log('🔙 العودة إلى:', returnUrl);
        setTimeout(() => {
          router.push(returnUrl);
        }, 1000); // انتظار ثانية واحدة ليرى المستخدم رسالة النجاح
      }
    } catch (error) {
      console.error('❌ خطأ في حفظ البيانات:', error);
      alert(`❌ حدث خطأ أثناء الحفظ: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Service Accounts Functions
  const addServiceAccount = () => {
    if (!newService.accountNumber) {
      alert('يرجى إدخال رقم الحساب');
      return;
    }
    
    const service: ServiceAccount = {
      id: `service-${Date.now()}`,
      type: newService.type as any,
      accountNumber: newService.accountNumber!,
      accountName: newService.accountName,
      provider: newService.provider,
      notes: newService.notes,
      active: newService.active || true,
      // حقول إضافية للكهرباء والمياه
      meterNumber: newService.meterNumber,
      meterImage: newService.meterImage,
      paymentType: newService.paymentType
    };
    
    setServiceAccounts([...serviceAccounts, service]);
    setNewService({ type: 'electricity', active: true });
    setShowAddService(false);
  };

  const removeServiceAccount = (serviceId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      setServiceAccounts(serviceAccounts.filter(s => s.id !== serviceId));
    }
  };

  // Documents Functions
  const addDocument = () => {
    if (!newDocument.name) {
      alert('يرجى إدخال اسم المستند');
      return;
    }
    
    const doc: Document = {
      id: `doc-${Date.now()}`,
      name: newDocument.name!,
      type: newDocument.type as any,
      fileUrl: newDocument.fileUrl,
      fileName: newDocument.fileName,
      fileSize: newDocument.fileSize,
      uploadedAt: new Date().toISOString(),
      expiryDate: newDocument.expiryDate,
      notes: newDocument.notes
    };
    
    setDocuments([...documents, doc]);
    setNewDocument({ type: 'contract' });
    setShowAddDocument(false);
  };

  const removeDocument = (docId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      setDocuments(documents.filter(d => d.id !== docId));
    }
  };

  // Bank Accounts Functions
  const addBankAccount = () => {
    if (!newBank.accountNumber || !newBank.bankName) {
      alert('يرجى إدخال بيانات الحساب البنكي');
      return;
    }
    
    const bank: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBank.bankName!,
      accountNumber: newBank.accountNumber!,
      accountName: newBank.accountName || '',
      iban: newBank.iban,
      swift: newBank.swift,
      currency: newBank.currency || 'OMR',
      purpose: newBank.purpose || '',
      active: newBank.active || true
    };
    
    setBankAccounts([...bankAccounts, bank]);
    setNewBank({ currency: 'OMR', active: true });
    setShowAddBank(false);
  };

  const removeBankAccount = (bankId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب البنكي؟')) {
      setBankAccounts(bankAccounts.filter(b => b.id !== bankId));
    }
  };

  const serviceTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
    'electricity': { label: 'الكهرباء', icon: FaBolt, color: 'from-yellow-500 to-yellow-600' },
    'water': { label: 'المياه', icon: FaTint, color: 'from-blue-500 to-blue-600' },
    'internet': { label: 'الإنترنت', icon: FaWifi, color: 'from-purple-500 to-purple-600' },
    'gas': { label: 'الغاز', icon: FaGasPump, color: 'from-red-500 to-red-600' },
    'phone': { label: 'الهاتف', icon: FaPhone, color: 'from-green-500 to-green-600' },
    'municipality': { label: 'البلدية', icon: FaBuilding, color: 'from-gray-500 to-gray-600' },
    'other': { label: 'أخرى', icon: FaReceipt, color: 'from-orange-500 to-orange-600' }
  };

  const documentTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
    'ownership_deed': { label: '🔴 ملكية العقار (إجباري)', icon: FaFileContract, color: 'text-red-600' },
    'survey_drawing': { label: '🔴 الرسم المساحي (إجباري)', icon: FaFileImage, color: 'text-red-600' },
    'contract': { label: 'عقد', icon: FaFileContract, color: 'text-blue-600' },
    'deed': { label: 'صك ملكية', icon: FaFileAlt, color: 'text-green-600' },
    'permit': { label: 'ترخيص', icon: FaFileAlt, color: 'text-purple-600' },
    'certificate': { label: 'شهادة', icon: FaFileAlt, color: 'text-orange-600' },
    'invoice': { label: 'فاتورة', icon: FaReceipt, color: 'text-cyan-600' },
    'photo': { label: 'صورة', icon: FaFileImage, color: 'text-pink-600' },
    'other': { label: 'أخرى', icon: FaFileAlt, color: 'text-gray-600' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">العقار غير موجود</h1>
          <InstantLink
            href="/properties/unified-management"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            <FaArrowLeft />
            العودة للعقارات
          </InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>البيانات الإضافية | {property.titleAr || property.title} | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <InstantLink
                    href="/properties/unified-management"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all text-sm"
                  >
                    <FaArrowLeft className="w-3 h-3" />
                    <span>العودة</span>
                  </InstantLink>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <FaFileAlt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">البيانات الإضافية</h1>
                      <p className="text-sm text-white/80">{property.titleAr || property.title}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={saveData}
                  disabled={saving}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg flex items-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      حفظ
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ملاحظة هامة - الحقول الإجبارية */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-2 border-red-300 rounded-xl p-3 mb-4 shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 font-bold text-lg">*</span>
                  <h3 className="text-base font-bold text-red-900">تنبيه: البيانات الإجبارية</h3>
                </div>
                <p className="text-xs text-red-800">
                  الحقول ذات النجمة الحمراء <span className="text-red-600 font-bold">*</span> والخلفية الحمراء 
                  <span className="inline-block w-12 h-3 bg-red-50 border border-red-300 rounded mx-1"></span>
                  <strong>إجبارية</strong> (22 حقل) - لن يتم الحفظ بدونها
                </p>
              </div>
            </div>
          </motion.div>

          {/* Owner Data Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('owner')}
              className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FaUser className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">بيانات المالك</h2>
                  <p className="text-sm text-gray-600">المعلومات الشخصية وجهات الاتصال</p>
                </div>
              </div>
              {expandedSections.has('owner') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('owner') && (
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* الاسم الكامل */}
                  <div>
                    <RequiredLabel>الاسم الكامل</RequiredLabel>
                    <input
                      type="text"
                      value={ownerData.fullName}
                      onChange={(e) => setOwnerData({ ...ownerData, fullName: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="الاسم الثلاثي واللقب"
                      required
                    />
                  </div>

                  {/* رقم البطاقة */}
                  <div>
                    <RequiredLabel>رقم البطاقة الشخصية</RequiredLabel>
                    <input
                      type="text"
                      value={ownerData.nationalId}
                      onChange={(e) => setOwnerData({ ...ownerData, nationalId: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="XX-XXXXXXXX"
                      required
                    />
                  </div>

                  {/* تاريخ انتهاء البطاقة */}
                  <div>
                    <RequiredLabel>تاريخ انتهاء البطاقة</RequiredLabel>
                    <input
                      type="date"
                      value={ownerData.nationalIdExpiry}
                      onChange={(e) => setOwnerData({ ...ownerData, nationalIdExpiry: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      required
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <RequiredLabel>رقم الهاتف</RequiredLabel>
                    <input
                      type="tel"
                      value={ownerData.phone}
                      onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="+968 XXXXXXXX"
                      required
                    />
                  </div>

                  {/* البريد الإلكتروني */}
                  <div>
                    <RequiredLabel>البريد الإلكتروني</RequiredLabel>
                    <input
                      type="email"
                      value={ownerData.email}
                      onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="owner@example.com"
                      required
                    />
                  </div>

                  {/* نسخة من البطاقة الشخصية */}
                  <div>
                    <RequiredLabel>نسخة من البطاقة الشخصية</RequiredLabel>
                    <div className="space-y-2">
                      <div className="w-full px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 bg-opacity-30">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('📎 تم رفع ملف البطاقة:', file.name, `${(file.size / 1024).toFixed(2)} KB`);
                              setOwnerData({ ...ownerData, nationalIdFile: file.name });
                            }
                          }}
                          className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                        />
                      </div>
                      {ownerData.nationalIdFile && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                          <FaCheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">{ownerData.nationalIdFile}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        📌 يقبل: صور (JPG, PNG) أو PDF
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Staff Data Section - قسم جديد منفصل */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('staff')}
              className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">بيانات الموظفين والإدارة</h2>
                  <p className="text-sm text-gray-600">الحارس، الصيانة، الإدارة</p>
                </div>
              </div>
              {expandedSections.has('staff') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('staff') && (
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* حارس المبنى */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم حارس المبنى
                    </label>
                    <input
                      type="text"
                      value={staffData.buildingGuardName || ''}
                      onChange={(e) => setStaffData({ ...staffData, buildingGuardName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="اسم الحارس"
                    />
                  </div>

                  {/* رقم هاتف الحارس */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم هاتف الحارس
                    </label>
                    <input
                      type="tel"
                      value={staffData.buildingGuardPhone || ''}
                      onChange={(e) => setStaffData({ ...staffData, buildingGuardPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="+968 XXXXXXXX"
                    />
                  </div>

                  {/* مسؤول الصيانة */}
                  <div>
                    <RequiredLabel>اسم مسؤول الصيانة</RequiredLabel>
                    <input
                      type="text"
                      value={staffData.maintenanceOfficerName || ''}
                      onChange={(e) => setStaffData({ ...staffData, maintenanceOfficerName: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="اسم مسؤول الصيانة"
                      required
                    />
                  </div>

                  {/* رقم هاتف مسؤول الصيانة */}
                  <div>
                    <RequiredLabel>رقم هاتف مسؤول الصيانة</RequiredLabel>
                    <input
                      type="tel"
                      value={staffData.maintenanceOfficerPhone || ''}
                      onChange={(e) => setStaffData({ ...staffData, maintenanceOfficerPhone: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="+968 XXXXXXXX"
                      required
                    />
                  </div>

                  {/* المسؤول الإداري */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المسؤول الإداري
                    </label>
                    <input
                      type="text"
                      value={staffData.administrativeOfficerName || ''}
                      onChange={(e) => setStaffData({ ...staffData, administrativeOfficerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="اسم المسؤول الإداري"
                    />
                  </div>

                  {/* رقم هاتف المسؤول الإداري */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم هاتف المسؤول الإداري
                    </label>
                    <input
                      type="tel"
                      value={staffData.administrativeOfficerPhone || ''}
                      onChange={(e) => setStaffData({ ...staffData, administrativeOfficerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="+968 XXXXXXXX"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Property Detailed Data Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('propertyData')}
              className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FaBuilding className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">بيانات العقار التفصيلية</h2>
                  <p className="text-sm text-gray-600">معلومات الموقع والخدمات</p>
                </div>
              </div>
              {expandedSections.has('propertyData') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('propertyData') && (
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* رقم المجمع */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم المجمع
                    </label>
                    <input
                      type="text"
                      value={propertyData.complexNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, complexNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* رقم القطعة */}
                  <div>
                    <RequiredLabel>رقم القطعة</RequiredLabel>
                    <input
                      type="text"
                      value={propertyData.plotNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, plotNumber: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="رقم القطعة"
                      required
                    />
                  </div>

                  {/* اسم الشارع */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الشارع
                    </label>
                    <input
                      type="text"
                      value={propertyData.streetName || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, streetName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* المنطقة */}
                  <div>
                    <RequiredLabel>المنطقة</RequiredLabel>
                    <input
                      type="text"
                      value={propertyData.area || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, area: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="المنطقة"
                      required
                    />
                  </div>

                  {/* رقم المربع */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم المربع (وفقاً للملكية)
                    </label>
                    <input
                      type="text"
                      value={propertyData.squareNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, squareNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* رقم الرسم المساحي */}
                  <div>
                    <RequiredLabel>رقم الرسم المساحي</RequiredLabel>
                    <input
                      type="text"
                      value={propertyData.surveyNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, surveyNumber: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="رقم الرسم المساحي"
                      required
                    />
                  </div>

                  {/* رقم المبنى */}
                  <div>
                    <RequiredLabel>رقم المبنى</RequiredLabel>
                    <input
                      type="text"
                      value={propertyData.buildingNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, buildingNumber: e.target.value })}
                      className={REQUIRED_INPUT_CLASSES}
                      placeholder="رقم المبنى"
                      required
                    />
                  </div>

                  {/* رقم السكة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم السكة
                    </label>
                    <input
                      type="text"
                      value={propertyData.roadNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, roadNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* نوع استعمال الأرض */}
                  <div>
                    <RequiredLabel>نوع استعمال الأرض</RequiredLabel>
                    <select
                      value={propertyData.landUseType || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, landUseType: e.target.value })}
                      className={REQUIRED_SELECT_CLASSES}
                      required
                    >
                      <option value="">-- اختر نوع الاستعمال --</option>
                      <option value="residential">سكني</option>
                      <option value="commercial">تجاري</option>
                      <option value="residential_commercial">سكني تجاري</option>
                      <option value="industrial">صناعي</option>
                      <option value="tourism">سياحي</option>
                      <option value="agricultural">زراعي</option>
                    </select>
                  </div>

                  {/* الطابق */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الطابق
                    </label>
                    <input
                      type="text"
                      value={propertyData.floor || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, floor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* نوع الوحدة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الوحدة
                    </label>
                    <input
                      type="text"
                      value={propertyData.unitType || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, unitType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="شقة، فيلا، مكتب..."
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Service Accounts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('services')}
              className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaBolt className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">أرقام حسابات الخدمات</h2>
                  <p className="text-sm text-gray-600">كهرباء، مياه، إنترنت، وغيرها</p>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                  {serviceAccounts.length}
                </span>
              </div>
              {expandedSections.has('services') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('services') && (
              <div className="p-6">
                {/* Service Accounts List */}
                <div className="space-y-3 mb-4">
                  {serviceAccounts.map((service) => {
                    const typeInfo = serviceTypeLabels[service.type];
                    const Icon = typeInfo.icon;
                    
                    return (
                      <div key={service.id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 bg-gradient-to-r ${typeInfo.color} rounded-xl flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">{typeInfo.label}</h4>
                                {service.active ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">نشط</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">غير نشط</span>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-700">
                                <p><span className="font-medium">رقم الحساب:</span> {service.accountNumber}</p>
                                {service.accountName && <p><span className="font-medium">اسم الحساب:</span> {service.accountName}</p>}
                                {service.provider && <p><span className="font-medium">المزود:</span> {service.provider}</p>}
                                {/* خيارات إضافية للكهرباء والمياه */}
                                {(service.type === 'electricity' || service.type === 'water') && (
                                  <>
                                    {service.meterNumber && <p><span className="font-medium">رقم العداد:</span> {service.meterNumber}</p>}
                                    {service.paymentType && (
                                      <p>
                                        <span className="font-medium">نوع الدفع:</span> 
                                        <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                                          service.paymentType === 'prepaid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                          {service.paymentType === 'prepaid' ? 'مسبق الدفع' : 'آجل الدفع'}
                                        </span>
                                      </p>
                                    )}
                                    {service.meterImage && (
                                      <p className="flex items-center gap-2">
                                        <span className="font-medium">صورة العداد:</span>
                                        <a href={`/uploads/${service.meterImage}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                          <FaEye className="w-3 h-3" />
                                          عرض
                                        </a>
                                      </p>
                                    )}
                                  </>
                                )}
                                {service.notes && <p className="text-gray-600"><span className="font-medium">ملاحظات:</span> {service.notes}</p>}
                                
                                {/* عرض تاريخ العدادات */}
                                {(service.type === 'electricity' || service.type === 'water') && service.meterHistory && service.meterHistory.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                      <FaClock className="w-4 h-4 text-orange-600" />
                                      تاريخ العدادات ({service.meterHistory.length})
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {service.meterHistory.map((history, index) => (
                                        <div key={history.id} className="text-xs bg-gray-100 p-2 rounded">
                                          <p className="font-medium text-gray-700">
                                            استبدال #{service.meterHistory!.length - index} - {new Date(history.replacementDate).toLocaleDateString('ar-EG')}
                                          </p>
                                          <p className="text-gray-600">
                                            من: {history.oldMeterNumber} (قراءة: {history.oldMeterReading}) → إلى: {history.newMeterNumber}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {/* زر استبدال العداد - للكهرباء والمياه فقط */}
                            {(service.type === 'electricity' || service.type === 'water') && (
                              <button
                                onClick={() => {
                                  setSelectedServiceForMeterChange(service);
                                  setShowMeterReplacement(true);
                                }}
                                className="text-orange-600 hover:text-orange-700 p-2 hover:bg-orange-50 rounded-lg transition-all flex items-center gap-2"
                                title="استبدال العداد"
                              >
                                <FaEdit className="w-4 h-4" />
                                <span className="text-xs">استبدال العداد</span>
                              </button>
                            )}
                            <button
                              onClick={() => removeServiceAccount(service.id)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Service */}
                {!showAddService ? (
                  <button
                    onClick={() => setShowAddService(true)}
                    className="w-full px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <FaPlus className="w-5 h-5" />
                    إضافة حساب خدمة جديد
                  </button>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">إضافة حساب خدمة جديد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخدمة</label>
                        <select
                          value={newService.type}
                          onChange={(e) => setNewService({...newService, type: e.target.value as any})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(serviceTypeLabels).map(([key, info]) => (
                            <option key={key} value={key}>{info.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <RequiredLabel>رقم الحساب</RequiredLabel>
                        <input
                          type="text"
                          value={newService.accountNumber || ''}
                          onChange={(e) => setNewService({...newService, accountNumber: e.target.value})}
                          className={REQUIRED_INPUT_CLASSES}
                          placeholder="أدخل رقم الحساب"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم الحساب</label>
                        <input
                          type="text"
                          value={newService.accountName || ''}
                          onChange={(e) => setNewService({...newService, accountName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="اسم صاحب الحساب"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">المزود</label>
                        <input
                          type="text"
                          value={newService.provider || ''}
                          onChange={(e) => setNewService({...newService, provider: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="اسم الشركة المزودة"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                        <textarea
                          value={newService.notes || ''}
                          onChange={(e) => setNewService({...newService, notes: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="ملاحظات إضافية..."
                        />
                      </div>
                      
                      {/* خيارات إضافية للكهرباء والمياه */}
                      {(newService.type === 'electricity' || newService.type === 'water') && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              رقم العداد <span className="text-gray-400 text-xs">(اختياري)</span>
                            </label>
                            <input
                              type="text"
                              value={newService.meterNumber || ''}
                              onChange={(e) => setNewService({...newService, meterNumber: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="رقم العداد"
                            />
                          </div>
                          
                          <div>
                            <RequiredLabel>نوع الدفع</RequiredLabel>
                            <select
                              value={newService.paymentType || ''}
                              onChange={(e) => setNewService({...newService, paymentType: e.target.value as 'prepaid' | 'postpaid'})}
                              className={REQUIRED_SELECT_CLASSES}
                              required
                            >
                              <option value="">-- اختر نوع الدفع --</option>
                              <option value="prepaid">مسبق الدفع</option>
                              <option value="postpaid">آجل الدفع</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-2">
                            <RequiredLabel>صورة العداد</RequiredLabel>
                            <div className="space-y-2">
                              <div className="w-full px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 bg-opacity-30">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      console.log('📸 تم اختيار ملف:', file.name, file.size);
                                      setNewService({...newService, meterImage: file.name});
                                    }
                                  }}
                                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                                />
                              </div>
                              {newService.meterImage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                                  <span className="text-sm text-green-700 font-medium">{newService.meterImage}</span>
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                📌 يقبل: JPG, PNG, JPEG
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => {
                          setShowAddService(false);
                          setNewService({ type: 'electricity', active: true });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={addServiceAccount}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        إضافة
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('documents')}
              className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaFileContract className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    المستندات المرفقة
                    <span className="text-red-600 text-2xl">*</span>
                  </h2>
                  <p className="text-sm text-gray-600">
                    إجباري: ملكية العقار + الرسم المساحي | اختياري: عقود، تراخيص، وثائق
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                  {documents.length}
                </span>
              </div>
              {expandedSections.has('documents') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('documents') && (
              <div className="p-6">
                {/* Documents List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {documents.map((doc) => {
                    const typeInfo = documentTypeLabels[doc.type];
                    const Icon = typeInfo.icon;
                    
                    return (
                      <div key={doc.id} className="bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-8 h-8 ${typeInfo.color}`} />
                            <div>
                              <h4 className="font-bold text-gray-900">{doc.name}</h4>
                              <p className="text-sm text-gray-600">{typeInfo.label}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                        {doc.fileName && (
                          <div className="text-sm text-gray-600 mb-2">
                            📎 {doc.fileName} {doc.fileSize && `(${doc.fileSize})`}
                          </div>
                        )}
                        {doc.expiryDate && (
                          <div className="text-sm text-orange-600 mb-2" suppressHydrationWarning>
                            <FaClock className="inline w-3 h-3 ml-1" />
                            ينتهي: {new Date(doc.expiryDate).toLocaleDateString('ar-SA', { timeZone: 'UTC' })}
                          </div>
                        )}
                        {doc.notes && (
                          <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                            {doc.notes}
                          </div>
                        )}
                        {doc.fileUrl && (
                          <div className="mt-3 flex gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                            >
                              <FaEye className="w-4 h-4" />
                              عرض
                            </a>
                            <a
                              href={doc.fileUrl}
                              download
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <FaDownload className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add New Document */}
                {!showAddDocument ? (
                  <button
                    onClick={() => setShowAddDocument(true)}
                    className="w-full px-6 py-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <FaPlus className="w-5 h-5" />
                    إضافة مستند جديد
                  </button>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">إضافة مستند جديد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">نوع المستند</label>
                        <select
                          value={newDocument.type}
                          onChange={(e) => setNewDocument({...newDocument, type: e.target.value as any})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          {Object.entries(documentTypeLabels).map(([key, info]) => (
                            <option key={key} value={key}>{info.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستند *</label>
                        <input
                          type="text"
                          value={newDocument.name || ''}
                          onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="أدخل اسم المستند"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <RequiredLabel>رفع الملف</RequiredLabel>
                        <div className="space-y-2">
                          <div className="w-full px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 bg-opacity-30">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  console.log('📄 تم رفع مستند:', file.name, `${(file.size / 1024).toFixed(2)} KB`);
                                  setNewDocument({
                                    ...newDocument, 
                                    fileUrl: file.name,
                                    fileName: file.name,
                                    fileSize: `${(file.size / 1024).toFixed(2)} KB`
                                  });
                                }
                              }}
                              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                            />
                          </div>
                          {newDocument.fileUrl && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                              <FaCheckCircle className="w-5 h-5 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm text-green-700 font-medium">{newDocument.fileName}</p>
                                <p className="text-xs text-green-600">{newDocument.fileSize}</p>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            📌 يقبل: PDF, JPG, PNG, DOC, DOCX
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تاريخ الانتهاء <span className="text-gray-400 text-xs">(اختياري)</span>
                        </label>
                        <input
                          type="date"
                          value={newDocument.expiryDate || ''}
                          onChange={(e) => setNewDocument({...newDocument, expiryDate: e.target.value})}
                          className={OPTIONAL_INPUT_CLASSES}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ملاحظات <span className="text-gray-400 text-xs">(اختياري)</span>
                        </label>
                        <textarea
                          value={newDocument.notes || ''}
                          onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                          className={OPTIONAL_INPUT_CLASSES}
                          rows={2}
                          placeholder="ملاحظات إضافية..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => {
                          setShowAddDocument(false);
                          setNewDocument({ type: 'ownership_deed' });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={addDocument}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        إضافة
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Bank Accounts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('banks')}
              className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FaUniversity className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">الحسابات البنكية</h2>
                  <p className="text-sm text-gray-600">حسابات استلام وتحويل المبالغ</p>
                </div>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
                  {bankAccounts.length}
                </span>
              </div>
              {expandedSections.has('banks') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('banks') && (
              <div className="p-6">
                {/* Bank Accounts List */}
                <div className="space-y-3 mb-4">
                  {bankAccounts.map((bank) => (
                    <div key={bank.id} className="bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                            <FaUniversity className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900">{bank.bankName}</h4>
                              {bank.active ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">نشط</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">غير نشط</span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                              <p><span className="font-medium">رقم الحساب:</span> {bank.accountNumber}</p>
                              {bank.accountName && <p><span className="font-medium">اسم الحساب:</span> {bank.accountName}</p>}
                              {bank.iban && <p><span className="font-medium">IBAN:</span> {bank.iban}</p>}
                              {bank.swift && <p><span className="font-medium">SWIFT:</span> {bank.swift}</p>}
                              <p><span className="font-medium">العملة:</span> {bank.currency}</p>
                              {bank.purpose && <p><span className="font-medium">الغرض:</span> {bank.purpose}</p>}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeBankAccount(bank.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Bank Account */}
                {!showAddBank ? (
                  <button
                    onClick={() => setShowAddBank(true)}
                    className="w-full px-6 py-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <FaPlus className="w-5 h-5" />
                    إضافة حساب بنكي جديد
                  </button>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">إضافة حساب بنكي جديد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم البنك *</label>
                        <input
                          type="text"
                          value={newBank.bankName || ''}
                          onChange={(e) => setNewBank({...newBank, bankName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="البنك الوطني العماني"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الحساب *</label>
                        <input
                          type="text"
                          value={newBank.accountNumber || ''}
                          onChange={(e) => setNewBank({...newBank, accountNumber: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم الحساب</label>
                        <input
                          type="text"
                          value={newBank.accountName || ''}
                          onChange={(e) => setNewBank({...newBank, accountName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="اسم صاحب الحساب"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                        <input
                          type="text"
                          value={newBank.iban || ''}
                          onChange={(e) => setNewBank({...newBank, iban: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="OM12 3456 7890 1234 5678 9012"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT Code</label>
                        <input
                          type="text"
                          value={newBank.swift || ''}
                          onChange={(e) => setNewBank({...newBank, swift: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="NBOAOMRXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                        <select
                          value={newBank.currency}
                          onChange={(e) => setNewBank({...newBank, currency: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="OMR">ريال عماني (OMR)</option>
                          <option value="USD">دولار أمريكي (USD)</option>
                          <option value="EUR">يورو (EUR)</option>
                          <option value="AED">درهم إماراتي (AED)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الغرض من الحساب</label>
                        <input
                          type="text"
                          value={newBank.purpose || ''}
                          onChange={(e) => setNewBank({...newBank, purpose: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="استلام إيجارات، مدفوعات الصيانة، إلخ"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => {
                          setShowAddBank(false);
                          setNewBank({ currency: 'OMR', active: true });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={addBankAccount}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        إضافة
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Info Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">ملاحظة مهمة</h3>
                <p className="text-gray-700 leading-relaxed">
                  هذه البيانات خاصة بالعقار ولن تظهر للزوار. يمكنك استخدامها لحفظ أرقام الحسابات والمستندات المهمة للرجوع إليها لاحقاً. جميع البيانات محفوظة بشكل آمن.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* نافذة استبدال العداد */}
      {showMeterReplacement && selectedServiceForMeterChange && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                  <FaEdit className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">استبدال العداد</h3>
                  <p className="text-white text-opacity-90">
                    {selectedServiceForMeterChange.type === 'electricity' ? 'عداد الكهرباء' : 'عداد المياه'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-bold mb-1">⚠️ ملاحظة هامة:</p>
                    <p>سيتم الاحتفاظ بجميع بيانات العداد القديم ولا يمكن حذفها. هذا لحماية حقوقك من أي تلاعب في القراءات.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* بيانات العداد القديم */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaClock className="w-5 h-5 text-gray-600" />
                    بيانات العداد القديم (للأرشفة)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم العداد القديم (حالي)
                      </label>
                      <input
                        type="text"
                        value={selectedServiceForMeterChange.meterNumber || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                    <div>
                      <RequiredLabel>القراءة الأخيرة للعداد القديم</RequiredLabel>
                      <input
                        type="text"
                        value={meterReplacementData.oldMeterReading}
                        onChange={(e) => setMeterReplacementData({...meterReplacementData, oldMeterReading: e.target.value})}
                        className={REQUIRED_INPUT_CLASSES}
                        placeholder="مثال: 12345 kWh"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <RequiredLabel>صورة العداد القديم</RequiredLabel>
                      <div className="space-y-2">
                        <div className="w-full px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 bg-opacity-30">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                console.log('📸 تم رفع صورة العداد القديم:', file.name, `${(file.size / 1024).toFixed(2)} KB`);
                                setMeterReplacementData({...meterReplacementData, oldMeterImage: file});
                              }
                            }}
                            className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                          />
                        </div>
                        {meterReplacementData.oldMeterImage && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                            <FaCheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {meterReplacementData.oldMeterImage.name} ({(meterReplacementData.oldMeterImage.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          📌 صورة واضحة للعداد + القراءة
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* بيانات العداد الجديد */}
                <div className="md:col-span-2 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaBolt className="w-5 h-5 text-green-600" />
                    بيانات العداد الجديد
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <RequiredLabel>رقم العداد الجديد</RequiredLabel>
                      <input
                        type="text"
                        value={meterReplacementData.newMeterNumber}
                        onChange={(e) => setMeterReplacementData({...meterReplacementData, newMeterNumber: e.target.value})}
                        className={REQUIRED_INPUT_CLASSES}
                        placeholder="رقم العداد الجديد"
                        required
                      />
                    </div>
                    <div>
                      <RequiredLabel>تاريخ الاستبدال</RequiredLabel>
                      <input
                        type="date"
                        value={meterReplacementData.replacementDate}
                        onChange={(e) => setMeterReplacementData({...meterReplacementData, replacementDate: e.target.value})}
                        className={REQUIRED_INPUT_CLASSES}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <RequiredLabel>صورة العداد الجديد</RequiredLabel>
                      <div className="space-y-2">
                        <div className="w-full px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 bg-opacity-30">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                console.log('📸 تم رفع صورة العداد الجديد:', file.name, `${(file.size / 1024).toFixed(2)} KB`);
                                setMeterReplacementData({...meterReplacementData, newMeterImage: file});
                              }
                            }}
                            className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                          />
                        </div>
                        {meterReplacementData.newMeterImage && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                            <FaCheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {meterReplacementData.newMeterImage.name} ({(meterReplacementData.newMeterImage.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          📌 صورة واضحة للعداد الجديد
                        </p>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        سبب الاستبدال <span className="text-gray-400 text-xs">(اختياري)</span>
                      </label>
                      <input
                        type="text"
                        value={meterReplacementData.replacementReason}
                        onChange={(e) => setMeterReplacementData({...meterReplacementData, replacementReason: e.target.value})}
                        className={OPTIONAL_INPUT_CLASSES}
                        placeholder="مثال: عطل، انتهاء صلاحية، طلب الشركة..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ملاحظات إضافية <span className="text-gray-400 text-xs">(اختياري)</span>
                      </label>
                      <textarea
                        value={meterReplacementData.replacementNotes}
                        onChange={(e) => setMeterReplacementData({...meterReplacementData, replacementNotes: e.target.value})}
                        className={OPTIONAL_INPUT_CLASSES}
                        rows={3}
                        placeholder="أي ملاحظات إضافية..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMeterReplacement(false);
                    setSelectedServiceForMeterChange(null);
                    setMeterReplacementData({
                      oldMeterReading: '',
                      oldMeterImage: null,
                      newMeterNumber: '',
                      newMeterImage: null,
                      replacementDate: new Date().toISOString().split('T')[0],
                      replacementReason: '',
                      replacementNotes: ''
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    // التحقق من البيانات المطلوبة
                    if (!meterReplacementData.oldMeterReading || !meterReplacementData.oldMeterImage || !meterReplacementData.newMeterNumber || !meterReplacementData.newMeterImage) {
                      alert('❌ الرجاء إكمال جميع البيانات الإجبارية لاستبدال العداد');
                      return;
                    }
                    
                    // إنشاء سجل تاريخ جديد
                    const historyEntry: MeterHistory = {
                      id: `METER-${Date.now()}`,
                      oldMeterNumber: selectedServiceForMeterChange.meterNumber || '',
                      oldMeterImage: meterReplacementData.oldMeterImage.name,
                      oldMeterReading: meterReplacementData.oldMeterReading,
                      newMeterNumber: meterReplacementData.newMeterNumber,
                      newMeterImage: meterReplacementData.newMeterImage.name,
                      replacementDate: meterReplacementData.replacementDate,
                      replacementReason: meterReplacementData.replacementReason,
                      replacementNotes: meterReplacementData.replacementNotes,
                      createdAt: new Date().toISOString()
                    };
                    
                    // تحديث الخدمة
                    const updatedAccounts = serviceAccounts.map(s => {
                      if (s.id === selectedServiceForMeterChange.id) {
                        return {
                          ...s,
                          meterNumber: meterReplacementData.newMeterNumber,
                          meterImage: meterReplacementData.newMeterImage.name,
                          meterHistory: [...(s.meterHistory || []), historyEntry]
                        };
                      }
                      return s;
                    });
                    
                    setServiceAccounts(updatedAccounts);
                    setShowMeterReplacement(false);
                    setSelectedServiceForMeterChange(null);
                    setMeterReplacementData({
                      oldMeterReading: '',
                      oldMeterImage: null,
                      newMeterNumber: '',
                      newMeterImage: null,
                      replacementDate: new Date().toISOString().split('T')[0],
                      replacementReason: '',
                      replacementNotes: ''
                    });
                    
                    alert('✅ تم تسجيل استبدال العداد بنجاح! البيانات القديمة محفوظة في الأرشيف.');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  <FaSave className="w-5 h-5" />
                  حفظ الاستبدال
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

