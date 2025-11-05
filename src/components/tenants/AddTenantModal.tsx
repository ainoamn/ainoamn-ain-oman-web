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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const validateDate = (dateString: string, fieldName: string): string | null => {
    if (!dateString) {
      return `${fieldName}: لم يتم إدخال التاريخ`;
    }
    
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (expiryDate < today) {
      return `${fieldName}: التاريخ منتهي الصلاحية`;
    }
    
    if (expiryDate < thirtyDaysFromNow) {
      return `${fieldName}: يجب أن تكون الوثيقة صالحة لمدة لا تقل عن 30 يوماً`;
    }
    
    return null;
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (tenantType === 'individual_omani') {
      // التحقق من الحقول الإجبارية
      if (!formData.fullName.trim()) {
        errors.push('الاسم الثلاثي: حقل إجباري');
      }
      if (!formData.tribe.trim()) {
        errors.push('القبيلة: حقل إجباري');
      }
      if (!formData.nationalId.trim()) {
        errors.push('رقم البطاقة الشخصية: حقل إجباري');
      }
      
      // التحقق من تاريخ انتهاء البطاقة
      const idDateError = validateDate(formData.nationalIdExpiry, 'تاريخ انتهاء البطاقة الشخصية');
      if (idDateError) errors.push(idDateError);
      
      // التحقق من المرفق
      if (!formData.nationalIdFile) {
        errors.push('مرفق البطاقة الشخصية: إجباري');
      }
      
      if (!formData.email.trim()) {
        errors.push('البريد الإلكتروني: حقل إجباري');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('البريد الإلكتروني: صيغة غير صحيحة');
      }
      
      if (!formData.phone1.trim()) {
        errors.push('رقم الهاتف الأول: حقل إجباري');
      }
      
      if (!formData.employer.trim()) {
        errors.push('جهة العمل: حقل إجباري');
      }
      
      if (!formData.address.trim()) {
        errors.push('العنوان: حقل إجباري');
      }
      
    } else if (tenantType === 'individual_foreign') {
      // التحقق من الحقول الإجبارية للوافد
      if (!formData.fullName.trim()) {
        errors.push('الاسم الكامل: حقل إجباري');
      }
      
      if (!formData.residenceId.trim()) {
        errors.push('رقم بطاقة الإقامة: حقل إجباري');
      }
      
      const residenceIdDateError = validateDate(formData.residenceIdExpiry, 'تاريخ انتهاء بطاقة الإقامة');
      if (residenceIdDateError) errors.push(residenceIdDateError);
      
      if (!formData.residenceIdFile) {
        errors.push('مرفق بطاقة الإقامة: إجباري');
      }
      
      if (!formData.passportNumber.trim()) {
        errors.push('رقم جواز السفر: حقل إجباري');
      }
      
      const passportDateError = validateDate(formData.passportExpiry, 'تاريخ انتهاء جواز السفر');
      if (passportDateError) errors.push(passportDateError);
      
      if (!formData.passportFile) {
        errors.push('مرفق جواز السفر: إجباري');
      }
      
      if (!formData.email.trim()) {
        errors.push('البريد الإلكتروني: حقل إجباري');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('البريد الإلكتروني: صيغة غير صحيحة');
      }
      
      if (!formData.phone1.trim()) {
        errors.push('رقم الهاتف الأول: حقل إجباري');
      }
      
      if (!formData.employer.trim()) {
        errors.push('جهة العمل: حقل إجباري');
      }
      
      if (!formData.address.trim()) {
        errors.push('العنوان: حقل إجباري');
      }
      
    } else if (tenantType === 'company') {
      // التحقق من الحقول الإجبارية للشركة
      if (!formData.companyName.trim()) {
        errors.push('اسم الشركة: حقل إجباري');
      }
      
      if (!formData.commercialRegister.trim()) {
        errors.push('رقم السجل التجاري: حقل إجباري');
      }
      
      const crDateError = validateDate(formData.commercialRegisterExpiry, 'تاريخ انتهاء السجل التجاري');
      if (crDateError) errors.push(crDateError);
      
      if (!formData.establishmentDate) {
        errors.push('تاريخ التأسيس: حقل إجباري');
      }
      
      if (!formData.commercialRegisterFile) {
        errors.push('مرفق السجل التجاري: إجباري');
      }
      
      if (!formData.headquarters.trim()) {
        errors.push('المقر الرئيسي: حقل إجباري');
      }
      
      if (!formData.companyPhone.trim()) {
        errors.push('رقم هاتف الشركة: حقل إجباري');
      }
      
      if (!formData.email.trim()) {
        errors.push('البريد الإلكتروني: حقل إجباري');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('البريد الإلكتروني: صيغة غير صحيحة');
      }
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    // التحقق من صحة البيانات
    const errors = validateForm();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }
    
    // إذا كانت البيانات صحيحة، نرسلها
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

      {/* Modal النواقص */}
      {showValidationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
          >
            {/* Header */}
            <div className="bg-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">يوجد نواقص في البيانات</h3>
                  <p className="text-sm opacity-90">يرجى إكمال جميع الحقول المطلوبة</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-red-800 text-sm flex-1">{error}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">ملاحظة هامة:</p>
                    <p>• يجب أن تكون جميع الوثائق صالحة لمدة لا تقل عن 30 يوماً</p>
                    <p>• رفع المرفقات إجباري لجميع الوثائق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowValidationModal(false)}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                حسناً، سأقوم بإكمال البيانات
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

