// src/pages/properties/[id]/additional.tsx
// صفحة البيانات الإضافية للعقار - أرقام الحسابات والخدمات والمستندات

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import InstantLink from '@/components/InstantLink';
import {
  FaArrowLeft, FaSave, FaPlus, FaTrash, FaEdit, FaFileAlt,
  FaBolt, FaTint, FaWifi, FaPhone, FaGasPump, FaReceipt,
  FaBuilding, FaCreditCard, FaUniversity, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaUpload, FaDownload, FaEye,
  FaFileContract, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel,
  FaClock, FaCalendar, FaInfoCircle, FaChevronDown, FaChevronUp,
  FaUser
} from 'react-icons/fa';

interface ServiceAccount {
  id: string;
  type: 'electricity' | 'water' | 'internet' | 'gas' | 'phone' | 'municipality' | 'other';
  accountNumber: string;
  accountName?: string;
  provider?: string;
  notes?: string;
  active: boolean;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'deed' | 'permit' | 'certificate' | 'invoice' | 'photo' | 'other';
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
  phone: string;
  email: string;
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
  electricityAccountNumber?: string;
  electricityMeterNumber?: string;
  electricityMeterImage?: string;
  waterAccountNumber?: string;
  waterMeterNumber?: string;
  waterMeterImage?: string;
  accountType?: 'prepaid' | 'postpaid';
  floor?: string;
  unitType?: string;
}

export default function PropertyAdditionalData() {
  const router = useRouter();
  const { id } = router.query;
  
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
    type: 'contract'
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
  
  // Property Data
  const [propertyData, setPropertyData] = useState<PropertyData>({});
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['owner', 'propertyData', 'services', 'documents', 'banks']));

  useEffect(() => {
    if (id) {
      loadPropertyData();
    }
  }, [id]);

  const loadPropertyData = async () => {
    try {
      // Load property
      const propRes = await fetch(`/api/properties/${id}`);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProperty(propData.property || propData);
      }
      
      // Load additional data from localStorage or API
      const storedData = localStorage.getItem(`property-${id}-additional`);
      if (storedData) {
        const data = JSON.parse(storedData);
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
        setPropertyData(data.propertyData || {});
      }
    } catch (error) {
      console.error('Error loading property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const data = {
        ownerData,
        propertyData,
        serviceAccounts,
        documents,
        bankAccounts,
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage (or API in the future)
      localStorage.setItem(`property-${id}-additional`, JSON.stringify(data));
      
      alert('✅ تم حفظ جميع البيانات بنجاح!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
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
      active: newService.active || true
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
    'contract': { label: 'عقد', icon: FaFileContract, color: 'text-blue-600' },
    'deed': { label: 'صك ملكية', icon: FaFileAlt, color: 'text-green-600' },
    'permit': { label: 'ترخيص', icon: FaFileAlt, color: 'text-purple-600' },
    'certificate': { label: 'شهادة', icon: FaFileAlt, color: 'text-orange-600' },
    'invoice': { label: 'فاتورة', icon: FaReceipt, color: 'text-red-600' },
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <InstantLink
                  href="/properties/unified-management"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
                >
                  <FaArrowLeft />
                  <span>العودة للعقارات</span>
                </InstantLink>
                <InstantLink
                  href={`/properties/${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
                >
                  <FaBuilding />
                  <span>صفحة العقار</span>
                </InstantLink>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaFileAlt className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">البيانات الإضافية</h1>
                  <p className="text-xl text-white/90 mb-2">{property.titleAr || property.title}</p>
                  <p className="text-white/80">{property.address}</p>
                </div>
                <button
                  onClick={saveData}
                  disabled={saving}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-lg flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-5 h-5" />
                      حفظ جميع التغييرات
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      value={ownerData.fullName}
                      onChange={(e) => setOwnerData({ ...ownerData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="الاسم الثلاثي واللقب"
                    />
                  </div>

                  {/* رقم البطاقة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم البطاقة الشخصية *
                    </label>
                    <input
                      type="text"
                      value={ownerData.nationalId}
                      onChange={(e) => setOwnerData({ ...ownerData, nationalId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="XX-XXXXXXXX"
                    />
                  </div>

                  {/* تاريخ انتهاء البطاقة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ انتهاء البطاقة *
                    </label>
                    <input
                      type="date"
                      value={ownerData.nationalIdExpiry}
                      onChange={(e) => setOwnerData({ ...ownerData, nationalIdExpiry: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      value={ownerData.phone}
                      onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="+968 XXXXXXXX"
                    />
                  </div>

                  {/* البريد الإلكتروني */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      value={ownerData.email}
                      onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="owner@example.com"
                    />
                  </div>

                  {/* حارس المبنى */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم حارس المبنى
                    </label>
                    <input
                      type="text"
                      value={ownerData.buildingGuardName || ''}
                      onChange={(e) => setOwnerData({ ...ownerData, buildingGuardName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                      value={ownerData.buildingGuardPhone || ''}
                      onChange={(e) => setOwnerData({ ...ownerData, buildingGuardPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="+968 XXXXXXXX"
                    />
                  </div>

                  {/* مسؤول الصيانة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم مسؤول الصيانة
                    </label>
                    <input
                      type="text"
                      value={ownerData.maintenanceOfficerName || ''}
                      onChange={(e) => setOwnerData({ ...ownerData, maintenanceOfficerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="اسم مسؤول الصيانة"
                    />
                  </div>

                  {/* رقم هاتف مسؤول الصيانة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم هاتف مسؤول الصيانة
                    </label>
                    <input
                      type="tel"
                      value={ownerData.maintenanceOfficerPhone || ''}
                      onChange={(e) => setOwnerData({ ...ownerData, maintenanceOfficerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="+968 XXXXXXXX"
                    />
                  </div>

                  {/* المسؤول الإداري */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المسؤول الإداري
                    </label>
                    <input
                      type="text"
                      value={ownerData.administrativeOfficerName || ''}
                      onChange={(e) => setOwnerData({ ...ownerData, administrativeOfficerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                      value={ownerData.administrativeOfficerPhone || ''}
                      onChange={(e) => setOwnerData({ ...ownerData, administrativeOfficerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم القطعة
                    </label>
                    <input
                      type="text"
                      value={propertyData.plotNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, plotNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المنطقة
                    </label>
                    <input
                      type="text"
                      value={propertyData.area || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, area: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الرسم المساحي
                    </label>
                    <input
                      type="text"
                      value={propertyData.surveyNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, surveyNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* رقم المبنى */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم المبنى
                    </label>
                    <input
                      type="text"
                      value={propertyData.buildingNumber || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, buildingNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع استعمال الأرض
                    </label>
                    <input
                      type="text"
                      value={propertyData.landUseType || ''}
                      onChange={(e) => setPropertyData({ ...propertyData, landUseType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="سكني، تجاري، صناعي..."
                    />
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

                {/* قسم الكهرباء */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
                    <FaBolt className="w-5 h-5" />
                    بيانات الكهرباء
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم حساب الكهرباء
                      </label>
                      <input
                        type="text"
                        value={propertyData.electricityAccountNumber || ''}
                        onChange={(e) => setPropertyData({ ...propertyData, electricityAccountNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم عداد الكهرباء
                      </label>
                      <input
                        type="text"
                        value={propertyData.electricityMeterNumber || ''}
                        onChange={(e) => setPropertyData({ ...propertyData, electricityMeterNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        صورة عداد الكهرباء
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Handle file upload (future implementation)
                            setPropertyData({ ...propertyData, electricityMeterImage: file.name });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      />
                      {propertyData.electricityMeterImage && (
                        <p className="mt-2 text-sm text-green-600">✓ {propertyData.electricityMeterImage}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* قسم المياه */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <FaTint className="w-5 h-5" />
                    بيانات المياه
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم حساب المياه
                      </label>
                      <input
                        type="text"
                        value={propertyData.waterAccountNumber || ''}
                        onChange={(e) => setPropertyData({ ...propertyData, waterAccountNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم عداد المياه
                      </label>
                      <input
                        type="text"
                        value={propertyData.waterMeterNumber || ''}
                        onChange={(e) => setPropertyData({ ...propertyData, waterMeterNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        صورة عداد المياه
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPropertyData({ ...propertyData, waterMeterImage: file.name });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {propertyData.waterMeterImage && (
                        <p className="mt-2 text-sm text-green-600">✓ {propertyData.waterMeterImage}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* نوع الحساب */}
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h3 className="text-lg font-bold text-indigo-900 mb-4">نوع الحساب</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="prepaid"
                        checked={propertyData.accountType === 'prepaid'}
                        onChange={(e) => setPropertyData({ ...propertyData, accountType: e.target.value as 'prepaid' | 'postpaid' })}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-gray-700">مسبق الدفع</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="postpaid"
                        checked={propertyData.accountType === 'postpaid'}
                        onChange={(e) => setPropertyData({ ...propertyData, accountType: e.target.value as 'prepaid' | 'postpaid' })}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-gray-700">آجل الدفع</span>
                    </label>
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
                                {service.notes && <p className="text-gray-600"><span className="font-medium">ملاحظات:</span> {service.notes}</p>}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeServiceAccount(service.id)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الحساب *</label>
                        <input
                          type="text"
                          value={newService.accountNumber || ''}
                          onChange={(e) => setNewService({...newService, accountNumber: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="أدخل رقم الحساب"
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
                  <h2 className="text-xl font-bold text-gray-900">المستندات المرفقة</h2>
                  <p className="text-sm text-gray-600">عقود، صكوك، تراخيص، وثائق</p>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الملف</label>
                        <input
                          type="text"
                          value={newDocument.fileUrl || ''}
                          onChange={(e) => setNewDocument({...newDocument, fileUrl: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء</label>
                        <input
                          type="date"
                          value={newDocument.expiryDate || ''}
                          onChange={(e) => setNewDocument({...newDocument, expiryDate: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                        <textarea
                          value={newDocument.notes || ''}
                          onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          rows={2}
                          placeholder="ملاحظات إضافية..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => {
                          setShowAddDocument(false);
                          setNewDocument({ type: 'contract' });
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
    </>
  );
}

