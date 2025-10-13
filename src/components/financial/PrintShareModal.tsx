// src/components/financial/PrintShareModal.tsx - نظام الطباعة والمشاركة المتقدم
import React, { useState } from 'react';
import {
  FiPrinter, FiMail, FiDownload, FiShare2, FiLink, FiX,
  FiFileText, FiFile
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

interface PrintShareModalProps {
  documentType: string;
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

export default function PrintShareModal({
  documentType,
  documentId,
  documentTitle,
  onClose
}: PrintShareModalProps) {
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [shareLink, setShareLink] = useState('');

  const handlePrint = () => {
    window.print();
    alert('جاري الطباعة...');
  };

  const handleDownloadPDF = () => {
    alert('جاري تحميل ملف PDF...');
  };

  const handleDownloadExcel = () => {
    alert('جاري تحميل ملف Excel...');
  };

  const handleSendEmail = () => {
    if (!email) {
      alert('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    alert(`سيتم إرسال ${documentTitle} إلى: ${email}`);
  };

  const handleSendWhatsApp = () => {
    if (!whatsappNumber) {
      alert('الرجاء إدخال رقم الواتساب');
      return;
    }
    const message = `مرحباً، إليك ${documentTitle}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/shared/${documentType}/${documentId}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    alert('تم نسخ الرابط!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FiShare2 />
              طباعة ومشاركة
            </h2>
            <p className="text-blue-100 text-sm mt-1">{documentTitle}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Print Options */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiPrinter className="text-blue-600" />
              طباعة
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <FiPrinter className="w-6 h-6 text-blue-600" />
                <div className="text-right flex-1">
                  <p className="font-bold text-gray-900">طباعة مباشرة</p>
                  <p className="text-xs text-gray-600">طباعة المستند على الطابعة</p>
                </div>
              </button>
            </div>
          </div>

          {/* Download Options */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiDownload className="text-green-600" />
              تحميل
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <FiFileText className="w-8 h-8 text-red-600" />
                <p className="font-bold text-gray-900">PDF</p>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <FiFile className="w-8 h-8 text-green-600" />
                <p className="font-bold text-gray-900">Excel</p>
              </button>
            </div>
          </div>

          {/* Email Share */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiMail className="text-purple-600" />
              إرسال عبر البريد الإلكتروني
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل البريد الإلكتروني"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleSendEmail}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                إرسال
              </button>
            </div>
          </div>

          {/* WhatsApp Share */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaWhatsapp className="text-green-600" />
              مشاركة عبر واتساب
            </h3>
            <div className="flex gap-2">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="مثال: 96891234567"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleSendWhatsApp}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                إرسال
              </button>
            </div>
          </div>

          {/* Generate Link */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiLink className="text-indigo-600" />
              إنشاء رابط مشاركة
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleGenerateLink}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <FiLink />
                إنشاء رابط
              </button>
              {shareLink && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-600 mb-2">رابط المشاركة:</p>
                  <p className="text-sm font-mono text-blue-600 break-all">{shareLink}</p>
                  <p className="text-xs text-green-600 mt-2">✓ تم نسخ الرابط إلى الحافظة</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

