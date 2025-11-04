// src/pages/properties/[propertyId]/units/[unitId]/additional.tsx
// صفحة البيانات الإضافية للوحدة - أرقام الحسابات والخدمات والمستندات

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
  FaHome
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

export default function UnitAdditionalData() {
  const router = useRouter();
  const { propertyId, unitId } = router.query;
  
  const [property, setProperty] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
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
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['services', 'documents', 'banks']));

  useEffect(() => {
    if (propertyId && unitId) {
      loadUnitData();
    }
  }, [propertyId, unitId]);

  const loadUnitData = async () => {
    try {
      // Load property
      const propRes = await fetch(`/api/properties/${propertyId}`);
      if (propRes.ok) {
        const propData = await propRes.json();
        const prop = propData.property || propData;
        setProperty(prop);
        
        // Find unit
        if (prop.units) {
          const foundUnit = prop.units.find((u: any) => u.id === unitId);
          setUnit(foundUnit);
          
          // Load unit's additional data
          if (foundUnit?.additionalData) {
            setServiceAccounts(foundUnit.additionalData.serviceAccounts || []);
            setDocuments(foundUnit.additionalData.documents || []);
            setBankAccounts(foundUnit.additionalData.bankAccounts || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading unit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const additionalData = {
        serviceAccounts,
        documents,
        bankAccounts,
        updatedAt: new Date().toISOString()
      };
      
      // Update unit with additional data
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const propData = await response.json();
        const prop = propData.property || propData;
        
        // Update unit
        const updatedUnits = prop.units?.map((u: any) => 
          u.id === unitId 
            ? { ...u, additionalData }
            : u
        );
        
        // Save updated property
        const updateResponse = await fetch(`/api/properties/${propertyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ units: updatedUnits })
        });
        
        if (updateResponse.ok) {
          alert('✅ تم حفظ البيانات بنجاح!');
        } else {
          throw new Error('Failed to save');
        }
      }
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

  if (!property || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الوحدة غير موجودة</h1>
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
        <title>البيانات الإضافية | الوحدة {unit.unitNo || unit.unitNumber} | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white relative overflow-hidden">
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
                  href={`/properties/${propertyId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
                >
                  <FaBuilding />
                  <span>صفحة العقار</span>
                </InstantLink>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaHome className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">البيانات الإضافية للوحدة</h1>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-bold text-lg">
                      وحدة {unit.unitNo || unit.unitNumber}
                    </span>
                  </div>
                  <p className="text-xl text-white/90 mb-2">{property.titleAr || property.title}</p>
                  <div className="flex items-center gap-4 text-white/80">
                    <span>{unit.type}</span>
                    <span>•</span>
                    <span>{unit.area} م²</span>
                    <span>•</span>
                    <span>الطابق {unit.floor || 'الأرضي'}</span>
                  </div>
                </div>
                <button
                  onClick={saveData}
                  disabled={saving}
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold shadow-lg flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
                  <p className="text-sm text-gray-600">كهرباء، مياه، إنترنت - خاصة بهذه الوحدة</p>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                  {serviceAccounts.length}
                </span>
              </div>
              {expandedSections.has('services') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('services') && (
              <div className="p-6">
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

          {/* Documents Section - نفس التصميم */}
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
                  <p className="text-sm text-gray-600">عقود، تراخيص، وثائق خاصة بالوحدة</p>
                </div>
                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                  {documents.length}
                </span>
              </div>
              {expandedSections.has('documents') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('documents') && (
              <div className="p-6">
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
                          suppressHydrationWarning
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

          {/* Bank Accounts Section - نفس التصميم */}
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
                  <p className="text-sm text-gray-600">حسابات استلام إيجارات الوحدة</p>
                </div>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
                  {bankAccounts.length}
                </span>
              </div>
              {expandedSections.has('banks') ? <FaChevronUp className="w-5 h-5 text-gray-400" /> : <FaChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedSections.has('banks') && (
              <div className="p-6">
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
                          placeholder="استلام إيجارات الوحدة"
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
            className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">ملاحظة مهمة</h3>
                <p className="text-gray-700 leading-relaxed">
                  هذه البيانات خاصة بهذه الوحدة فقط. سيتم استخدامها مستقبلاً وربطها بعقود الإيجار والمستندات الأخرى. 
                  البيانات لن تظهر في صفحة العقارات العامة، وستكون متاحة فقط للمالك والمؤجر والمستأجر.
                  جميع البيانات محفوظة بشكل آمن ضمن بيانات الوحدة.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}

