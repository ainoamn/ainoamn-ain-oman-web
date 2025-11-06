// src/components/owners/AddOwnerModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaTimes, FaSave, FaExclamationTriangle } from 'react-icons/fa';

interface AddOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
  error?: string | null;
}

export default function AddOwnerModal({ isOpen, onClose, onSubmit, loading, error }: AddOwnerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    nationalIdExpiry: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('الاسم الكامل مطلوب');
    }
    
    if (!formData.nationalId.trim()) {
      errors.push('الرقم المدني مطلوب');
    } else if (!/^\d{8,}$/.test(formData.nationalId.replace(/[^0-9]/g, ''))) {
      errors.push('الرقم المدني يجب أن يكون 8 أرقام على الأقل');
    }
    
    if (!formData.email.trim()) {
      errors.push('البريد الإلكتروني مطلوب');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }
    
    if (!formData.phone.trim()) {
      errors.push('رقم الهاتف مطلوب');
    }
    
    if (!formData.nationalIdExpiry) {
      errors.push('تاريخ انتهاء البطاقة مطلوب');
    } else {
      const expiryDate = new Date(formData.nationalIdExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        errors.push('تاريخ انتهاء البطاقة منتهي');
      }
      
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (expiryDate < thirtyDaysFromNow) {
        errors.push('البطاقة يجب أن تكون صالحة لمدة 30 يوماً على الأقل');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
              <FaUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">إضافة مالك جديد</h3>
              <p className="text-xs opacity-90">سيتم توليد اسم مستخدم ورقم سري تلقائياً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white bg-opacity-20 rounded-full hover:bg-white hover:bg-opacity-30 transition-all flex items-center justify-center"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* الاسم الكامل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="مثال: محمد بن علي الحارثي"
              />
            </div>

            {/* الرقم المدني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الرقم المدني *
              </label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="12345678"
              />
            </div>

            {/* تاريخ انتهاء البطاقة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ انتهاء البطاقة *
              </label>
              <input
                type="date"
                value={formData.nationalIdExpiry}
                onChange={(e) => setFormData({ ...formData, nationalIdExpiry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="owner@example.com"
              />
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="+968 XXXXXXXX"
              />
            </div>

            {/* ملاحظة */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FaIdCard className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-blue-800">
                  <p className="font-semibold mb-1">ملاحظة:</p>
                  <p>• سيتم توليد اسم المستخدم: O-XX12345678</p>
                  <p>• سيتم توليد رقم سري قوي تلقائياً</p>
                  <p>• يمكنك تغييرهما لاحقاً</p>
                </div>
              </div>
            </div>

            {/* أخطاء التحقق */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 text-sm mb-2">يوجد أخطاء:</p>
                    <ul className="space-y-1">
                      {validationErrors.map((err, index) => (
                        <li key={index} className="text-xs text-red-800">• {err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* خطأ من الخادم */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  حفظ المالك
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

