// src/components/tenants/EditTenantModal.tsx - نموذج تعديل بيانات المستأجر الشامل
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt,
  FaBuilding, FaCloudUploadAlt, FaPassport, FaTrash,
  FaPlus, FaSave, FaSpinner, FaFlag, FaGlobe, FaTimes
} from 'react-icons/fa';

interface EditTenantModalProps {
  tenant: any;
  onClose: () => void;
  onSave: () => void;
}

export default function EditTenantModal({ tenant, onClose, onSave }: EditTenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantType, setTenantType] = useState<'individual_omani' | 'individual_foreign' | 'company'>(
    tenant.tenantDetails?.type || 'individual_omani'
  );
  
  const [formData, setFormData] = useState({
    // بيانات أساسية
    name: tenant.name || '',
    email: tenant.email || '',
    phone: tenant.phone || '',
    status: tenant.status || 'active',
    
    // بيانات عماني
    fullName: tenant.tenantDetails?.fullName || tenant.name || '',
    tribe: tenant.tenantDetails?.tribe || '',
    nationalId: tenant.tenantDetails?.nationalId || '',
    nationalIdExpiry: tenant.tenantDetails?.nationalIdExpiry || '',
    nationalIdFile: null as File | null,
    
    // بيانات وافد
    residenceId: tenant.tenantDetails?.residenceId || '',
    residenceIdExpiry: tenant.tenantDetails?.residenceIdExpiry || '',
    residenceIdFile: null as File | null,
    passportNumber: tenant.tenantDetails?.passportNumber || '',
    passportExpiry: tenant.tenantDetails?.passportExpiry || '',
    passportFile: null as File | null,
    
    // بيانات مشتركة
    phone1: tenant.tenantDetails?.phone1 || tenant.phone || '',
    phone2: tenant.tenantDetails?.phone2 || '',
    employer: tenant.tenantDetails?.employer || '',
    employerPhone: tenant.tenantDetails?.employerPhone || '',
    address: tenant.tenantDetails?.address || '',
    
    // بيانات الشركة
    companyName: tenant.tenantDetails?.companyName || '',
    commercialRegister: tenant.tenantDetails?.commercialRegister || '',
    commercialRegisterExpiry: tenant.tenantDetails?.commercialRegisterExpiry || '',
    commercialRegisterFile: null as File | null,
    establishmentDate: tenant.tenantDetails?.establishmentDate || '',
    headquarters: tenant.tenantDetails?.headquarters || '',
    companyPhone: tenant.tenantDetails?.companyPhone || '',
    emergencyContacts: tenant.tenantDetails?.emergencyContacts || [{ name: '', phone: '' }],
    
    // المفوضون
    authorizedSignatories: tenant.tenantDetails?.authorizedSignatories || [{
      name: '',
      nationalId: '',
      nationalIdExpiry: '',
      nationalIdFile: null,
      isOmani: true,
      passportNumber: '',
      passportExpiry: '',
      passportFile: null
    }]
  });

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '' }]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const addSignatory = () => {
    setFormData(prev => ({
      ...prev,
      authorizedSignatories: [...prev.authorizedSignatories, {
        name: '',
        nationalId: '',
        nationalIdExpiry: '',
        nationalIdFile: null,
        isOmani: true,
        passportNumber: '',
        passportExpiry: '',
        passportFile: null
      }]
    }));
  };

  const removeSignatory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authorizedSignatories: prev.authorizedSignatories.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      
      // بيانات أساسية
      formDataToSend.append('id', tenant.id);
      formDataToSend.append('name', formData.fullName || formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone1 || formData.phone);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('tenantType', tenantType);
      
      // بيانات حسب النوع
      if (tenantType === 'individual_omani') {
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('tribe', formData.tribe);
        formDataToSend.append('nationalId', formData.nationalId);
        formDataToSend.append('nationalIdExpiry', formData.nationalIdExpiry);
        if (formData.nationalIdFile) formDataToSend.append('nationalIdFile', formData.nationalIdFile);
        formDataToSend.append('phone1', formData.phone1);
        formDataToSend.append('phone2', formData.phone2);
        formDataToSend.append('employer', formData.employer);
        formDataToSend.append('address', formData.address);
      } else if (tenantType === 'individual_foreign') {
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('residenceId', formData.residenceId);
        formDataToSend.append('residenceIdExpiry', formData.residenceIdExpiry);
        if (formData.residenceIdFile) formDataToSend.append('residenceIdFile', formData.residenceIdFile);
        formDataToSend.append('passportNumber', formData.passportNumber);
        formDataToSend.append('passportExpiry', formData.passportExpiry);
        if (formData.passportFile) formDataToSend.append('passportFile', formData.passportFile);
        formDataToSend.append('phone1', formData.phone1);
        formDataToSend.append('phone2', formData.phone2);
        formDataToSend.append('employer', formData.employer);
        formDataToSend.append('employerPhone', formData.employerPhone);
        formDataToSend.append('address', formData.address);
      } else if (tenantType === 'company') {
        formDataToSend.append('companyName', formData.companyName);
        formDataToSend.append('commercialRegister', formData.commercialRegister);
        formDataToSend.append('commercialRegisterExpiry', formData.commercialRegisterExpiry);
        formDataToSend.append('establishmentDate', formData.establishmentDate);
        if (formData.commercialRegisterFile) formDataToSend.append('commercialRegisterFile', formData.commercialRegisterFile);
        formDataToSend.append('headquarters', formData.headquarters);
        formDataToSend.append('companyPhone', formData.companyPhone);
        formDataToSend.append('emergencyContacts', JSON.stringify(formData.emergencyContacts));
        formDataToSend.append('authorizedSignatories', JSON.stringify(formData.authorizedSignatories));
        
        // ملفات المفوضين
        formData.authorizedSignatories.forEach((sig, index) => {
          if (sig.nationalIdFile) formDataToSend.append(`signatory_${index}_nationalIdFile`, sig.nationalIdFile);
          if (sig.passportFile) formDataToSend.append(`signatory_${index}_passportFile`, sig.passportFile);
        });
      }

      const response = await fetch(`/api/users/update-tenant`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في تحديث المستأجر');
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      setError('حدث خطأ أثناء تحديث المستأجر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">تعديل بيانات المستأجر</h3>
              <p className="text-sm opacity-90 mt-1">{tenant.name} - {tenant.id}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* نوع المستأجر */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع المستأجر
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTenantType('individual_omani')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tenantType === 'individual_omani'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <FaFlag className={`w-6 h-6 mx-auto mb-2 ${tenantType === 'individual_omani' ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">عماني</div>
              </button>
              <button
                type="button"
                onClick={() => setTenantType('individual_foreign')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tenantType === 'individual_foreign'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <FaGlobe className={`w-6 h-6 mx-auto mb-2 ${tenantType === 'individual_foreign' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">وافد</div>
              </button>
              <button
                type="button"
                onClick={() => setTenantType('company')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tenantType === 'company'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <FaBuilding className={`w-6 h-6 mx-auto mb-2 ${tenantType === 'company' ? 'text-purple-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">شركة</div>
              </button>
            </div>
          </div>

          {/* حقول حسب النوع */}
          {tenantType === 'individual_omani' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الثلاثي والقبيلة *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="محمد بن سعيد الحارثي"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القبيلة
                  </label>
                  <input
                    type="text"
                    value={formData.tribe}
                    onChange={(e) => setFormData({ ...formData, tribe: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="الحارثي"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم البطاقة الشخصية *
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="XX-XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ انتهاء البطاقة *
                  </label>
                  <input
                    type="date"
                    value={formData.nationalIdExpiry}
                    onChange={(e) => setFormData({ ...formData, nationalIdExpiry: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة البطاقة الشخصية {tenant.tenantDetails?.nationalIdAttachment && '(موجودة ✓)'}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('nationalIdFile', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف الأول *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone1}
                    onChange={(e) => setFormData({ ...formData, phone1: e.target.value, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف الثاني
                  </label>
                  <input
                    type="tel"
                    value={formData.phone2}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    جهة العمل *
                  </label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="الشركة أو الجهة"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="العنوان الكامل"
                />
              </div>
            </div>
          )}

          {tenantType === 'individual_foreign' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم بطاقة الإقامة *
                  </label>
                  <input
                    type="text"
                    value={formData.residenceId}
                    onChange={(e) => setFormData({ ...formData, residenceId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ انتهاء الإقامة *
                  </label>
                  <input
                    type="date"
                    value={formData.residenceIdExpiry}
                    onChange={(e) => setFormData({ ...formData, residenceIdExpiry: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة بطاقة الإقامة {tenant.tenantDetails?.residenceIdAttachment && '(موجودة ✓)'}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('residenceIdFile', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجواز *
                  </label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ انتهاء الجواز *
                  </label>
                  <input
                    type="date"
                    value={formData.passportExpiry}
                    onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة الجواز {tenant.tenantDetails?.passportAttachment && '(موجودة ✓)'}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('passportFile', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف الأول *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone1}
                    onChange={(e) => setFormData({ ...formData, phone1: e.target.value, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف الثاني
                  </label>
                  <input
                    type="tel"
                    value={formData.phone2}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    جهة العمل *
                  </label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم هاتف جهة العمل
                </label>
                <input
                  type="tel"
                  value={formData.employerPhone}
                  onChange={(e) => setFormData({ ...formData, employerPhone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+968 XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
          )}

          {tenantType === 'company' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الشركة *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم السجل التجاري *
                  </label>
                  <input
                    type="text"
                    value={formData.commercialRegister}
                    onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء *
                  </label>
                  <input
                    type="date"
                    value={formData.commercialRegisterExpiry}
                    onChange={(e) => setFormData({ ...formData, commercialRegisterExpiry: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ التأسيس *
                  </label>
                  <input
                    type="date"
                    value={formData.establishmentDate}
                    onChange={(e) => setFormData({ ...formData, establishmentDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السجل التجاري {tenant.tenantDetails?.commercialRegisterAttachment && '(موجود ✓)'}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('commercialRegisterFile', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المقر الرئيسي *
                  </label>
                  <input
                    type="text"
                    value={formData.headquarters}
                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم هاتف الشركة *
                  </label>
                  <input
                    type="tel"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* المفوضون بالتوقيع */}
              <div className="border-t-2 border-purple-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    المفوضون بالتوقيع *
                  </label>
                  <button
                    type="button"
                    onClick={addSignatory}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <FaPlus className="w-3 h-3" />
                    إضافة مفوض
                  </button>
                </div>

                {formData.authorizedSignatories.map((signatory, index) => (
                  <div key={index} className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-purple-900">مفوض {index + 1}</h4>
                      {formData.authorizedSignatories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSignatory(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={signatory.name}
                        onChange={(e) => {
                          const updated = [...formData.authorizedSignatories];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, authorizedSignatories: updated });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="الاسم الكامل *"
                      />

                      <div className="flex items-center gap-3 mb-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={signatory.isOmani === true}
                            onChange={() => {
                              const updated = [...formData.authorizedSignatories];
                              updated[index].isOmani = true;
                              setFormData({ ...formData, authorizedSignatories: updated });
                            }}
                            className="text-purple-600"
                          />
                          <span className="text-sm">عماني</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={signatory.isOmani === false}
                            onChange={() => {
                              const updated = [...formData.authorizedSignatories];
                              updated[index].isOmani = false;
                              setFormData({ ...formData, authorizedSignatories: updated });
                            }}
                            className="text-purple-600"
                          />
                          <span className="text-sm">غير عماني</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={signatory.nationalId}
                          onChange={(e) => {
                            const updated = [...formData.authorizedSignatories];
                            updated[index].nationalId = e.target.value;
                            setFormData({ ...formData, authorizedSignatories: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="رقم البطاقة *"
                        />
                        <input
                          type="date"
                          value={signatory.nationalIdExpiry}
                          onChange={(e) => {
                            const updated = [...formData.authorizedSignatories];
                            updated[index].nationalIdExpiry = e.target.value;
                            setFormData({ ...formData, authorizedSignatories: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      {!signatory.isOmani && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={signatory.passportNumber || ''}
                            onChange={(e) => {
                              const updated = [...formData.authorizedSignatories];
                              updated[index].passportNumber = e.target.value;
                              setFormData({ ...formData, authorizedSignatories: updated });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="رقم الجواز *"
                          />
                          <input
                            type="date"
                            value={signatory.passportExpiry || ''}
                            onChange={(e) => {
                              const updated = [...formData.authorizedSignatories];
                              updated[index].passportExpiry = e.target.value;
                              setFormData({ ...formData, authorizedSignatories: updated });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* أرقام الطوارئ */}
              <div className="border-t-2 border-purple-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    أرقام الطوارئ
                  </label>
                  <button
                    type="button"
                    onClick={addEmergencyContact}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <FaPlus className="w-3 h-3" />
                    إضافة رقم
                  </button>
                </div>

                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => {
                        const updated = [...formData.emergencyContacts];
                        updated[index].name = e.target.value;
                        setFormData({ ...formData, emergencyContacts: updated });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="الاسم"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => {
                        const updated = [...formData.emergencyContacts];
                        updated[index].phone = e.target.value;
                        setFormData({ ...formData, emergencyContacts: updated });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="الهاتف"
                    />
                    {formData.emergencyContacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmergencyContact(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* حالة المستأجر */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة الحساب
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">موقوف</option>
              <option value="pending_approval">بانتظار الاعتماد</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <FaSave className="w-5 h-5" />
                حفظ التعديلات
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

