// src/components/tenants/AddTenantModal.tsx - نموذج إضافة مستأجر شامل
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt,
  FaBuilding, FaCloudUploadAlt, FaPassport, FaTrash,
  FaPlus, FaSave, FaSpinner, FaFlag, FaGlobe
} from 'react-icons/fa';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenantData: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AddTenantModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error
}: AddTenantModalProps) {
  const [tenantType, setTenantType] = useState<'individual_omani' | 'individual_foreign' | 'company'>('individual_omani');
  
  const [formData, setFormData] = useState({
    // بيانات عماني
    fullName: '',
    tribe: '',
    nationalId: '',
    nationalIdExpiry: '',
    nationalIdFile: null as File | null,
    
    // بيانات وافد
    residenceId: '',
    residenceIdExpiry: '',
    residenceIdFile: null as File | null,
    passportNumber: '',
    passportExpiry: '',
    passportFile: null as File | null,
    
    // بيانات مشتركة
    email: '',
    phone1: '',
    phone2: '',
    employer: '',
    employerPhone: '',
    address: '',
    
    // بيانات الشركة
    companyName: '',
    commercialRegister: '',
    commercialRegisterExpiry: '',
    commercialRegisterFile: null as File | null,
    establishmentDate: '',
    headquarters: '',
    companyPhone: '',
    emergencyContacts: [{ name: '', phone: '' }],
    
    // المفوضون
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
    await onSubmit({ ...formData, type: tenantType });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaUser className="w-6 h-6 text-purple-600" />
            إضافة مستأجر جديد
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* اختيار نوع المستأجر */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع المستأجر <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTenantType('individual_omani')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tenantType === 'individual_omani'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaFlag className="w-6 h-6 mx-auto mb-2" />
                <span className="font-semibold">شخصي - عماني</span>
              </button>
              
              <button
                type="button"
                onClick={() => setTenantType('individual_foreign')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tenantType === 'individual_foreign'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaGlobe className="w-6 h-6 mx-auto mb-2" />
                <span className="font-semibold">شخصي - وافد</span>
              </button>
              
              <button
                type="button"
                onClick={() => setTenantType('company')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tenantType === 'company'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaBuilding className="w-6 h-6 mx-auto mb-2" />
                <span className="font-semibold">شركة</span>
              </button>
            </div>
          </div>

          {/* نموذج شخصي عماني */}
          {tenantType === 'individual_omani' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-700 mb-4">بيانات المستأجر العماني</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline ml-2" />
                    الاسم الثلاثي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="الاسم الثلاثي"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القبيلة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tribe}
                    onChange={(e) => setFormData(prev => ({ ...prev, tribe: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="القبيلة"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaIdCard className="inline ml-2" />
                    رقم البطاقة الشخصية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="رقم البطاقة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.nationalIdExpiry}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalIdExpiry: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCloudUploadAlt className="inline ml-2" />
                    مرفق البطاقة الشخصية <span className="text-red-500">* إجباري</span>
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                    <div className="text-center">
                      <FaCloudUploadAlt className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.nationalIdFile ? formData.nationalIdFile.name : 'اضغط لرفع نسخة من البطاقة'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('nationalIdFile', e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline ml-2" />
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    جهة العمل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="جهة العمل"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline ml-2" />
                    رقم الهاتف الأول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone1}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone1: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline ml-2" />
                    رقم الهاتف الثاني
                  </label>
                  <input
                    type="tel"
                    value={formData.phone2}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone2: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline ml-2" />
                  العنوان <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="العنوان الكامل"
                />
              </div>
            </div>
          )}

          {/* نموذج شخصي وافد */}
          {tenantType === 'individual_foreign' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-4">بيانات المستأجر الوافد</h4>
              
              {/* Similar structure but with residence ID and passport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline ml-2" />
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الاسم الكامل"
                />
              </div>

              {/* Residence ID Section */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h5 className="font-semibold text-gray-900">بطاقة الإقامة</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم بطاقة الإقامة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.residenceId}
                      onChange={(e) => setFormData(prev => ({ ...prev, residenceId: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="رقم البطاقة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الانتهاء <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.residenceIdExpiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, residenceIdExpiry: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCloudUploadAlt className="inline ml-2" />
                    مرفق بطاقة الإقامة <span className="text-red-500">* إجباري</span>
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="text-center">
                      <FaCloudUploadAlt className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.residenceIdFile ? formData.residenceIdFile.name : 'اضغط لرفع نسخة من البطاقة'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('residenceIdFile', e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* Passport Section */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h5 className="font-semibold text-gray-900">جواز السفر</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPassport className="inline ml-2" />
                      رقم الجواز <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="رقم الجواز"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الانتهاء <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.passportExpiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, passportExpiry: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCloudUploadAlt className="inline ml-2" />
                    مرفق جواز السفر <span className="text-red-500">* إجباري</span>
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="text-center">
                      <FaCloudUploadAlt className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.passportFile ? formData.passportFile.name : 'اضغط لرفع نسخة من الجواز'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('passportFile', e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* Rest of the fields (email, phones, employer, address) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline ml-2" />
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    جهة العمل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="جهة العمل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline ml-2" />
                    رقم الاتصال لجهة العمل
                  </label>
                  <input
                    type="tel"
                    value={formData.employerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, employerPhone: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline ml-2" />
                    رقم الهاتف الأول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone1}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone1: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline ml-2" />
                    رقم الهاتف الثاني
                  </label>
                  <input
                    type="tel"
                    value={formData.phone2}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone2: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+968 XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline ml-2" />
                  العنوان <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="العنوان الكامل"
                />
              </div>
            </div>
          )}

          {/* نموذج شركة */}
          {tenantType === 'company' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-purple-700 mb-4">بيانات الشركة</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline ml-2" />
                  اسم الشركة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="اسم الشركة"
                />
              </div>

              {/* Commercial Register */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h5 className="font-semibold text-gray-900">السجل التجاري</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم السجل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.commercialRegister}
                      onChange={(e) => setFormData(prev => ({ ...prev, commercialRegister: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="رقم السجل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الانتهاء <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.commercialRegisterExpiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, commercialRegisterExpiry: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ التأسيس <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.establishmentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, establishmentDate: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCloudUploadAlt className="inline ml-2" />
                    مرفق السجل التجاري <span className="text-red-500">* إجباري</span>
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <div className="text-center">
                      <FaCloudUploadAlt className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.commercialRegisterFile ? formData.commercialRegisterFile.name : 'اضغط لرفع نسخة من السجل'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('commercialRegisterFile', e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* الباقي سيكون طويل جداً - سأكمل في الرد التالي */}
              <p className="text-sm text-gray-500 italic">... المفوضون بالتوقيع وأرقام الطوارئ (سيتم إضافتها)</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                حفظ المستأجر
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

