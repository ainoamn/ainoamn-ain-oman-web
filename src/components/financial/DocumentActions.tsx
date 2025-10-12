// src/components/financial/DocumentActions.tsx - إجراءات المستندات المتقدمة
import React, { useState } from 'react';
import {
  FiPrinter, FiDownload, FiMail, FiShare2, FiCopy, FiX,
  FiFileText, FiFile
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaFacebookMessenger } from 'react-icons/fa';

interface DocumentActionsProps {
  documentType: string;
  documentId: string;
  documentNumber: string;
  documentTitle: string;
}

export default function DocumentActions({
  documentType,
  documentId,
  documentNumber,
  documentTitle
}: DocumentActionsProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // في الإنتاج: تحويل إلى PDF
    alert(`جاري تحميل ${documentNumber}.pdf`);
  };

  const handleDownloadExcel = () => {
    alert(`جاري تحميل ${documentNumber}.xlsx`);
  };

  const handleDownloadWord = () => {
    alert(`جاري تحميل ${documentNumber}.docx`);
  };

  const handleSendEmail = () => {
    if (!email) {
      alert('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    alert(`سيتم إرسال ${documentTitle} إلى: ${email}`);
    setEmail('');
  };

  const handleSendWhatsApp = () => {
    if (!phone) {
      alert('الرجاء إدخال رقم الواتساب');
      return;
    }
    const message = encodeURIComponent(`${documentTitle} - رقم: ${documentNumber}\n\nالرجاء مراجعة المرفق.`);
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleSendTelegram = () => {
    if (!phone) {
      alert('الرجاء إدخال المعرف');
      return;
    }
    alert(`سيتم إرسال ${documentTitle} عبر Telegram`);
  };

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/shared/${documentType}/${documentId}/${documentNumber}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="طباعة"
      >
        <FiPrinter className="w-5 h-5 text-gray-700" />
      </button>

      {/* Download Dropdown */}
      <div className="relative group">
        <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
          <FiDownload className="w-5 h-5 text-blue-700" />
        </button>
        
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <button
            onClick={handleDownloadPDF}
            className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-center gap-3 border-b"
          >
            <FiFileText className="w-4 h-4 text-red-600" />
            <span className="text-sm">PDF</span>
          </button>
          <button
            onClick={handleDownloadExcel}
            className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-center gap-3 border-b"
          >
            <FiFile className="w-4 h-4 text-green-600" />
            <span className="text-sm">Excel</span>
          </button>
          <button
            onClick={handleDownloadWord}
            className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-center gap-3"
          >
            <FiFile className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Word</span>
          </button>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={() => setShowShareModal(true)}
        className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
        title="مشاركة"
      >
        <FiShare2 className="w-5 h-5 text-green-700" />
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FiShare2 />
                  مشاركة المستند
                </h2>
                <p className="text-green-100 text-sm mt-1">{documentTitle} - {documentNumber}</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Email */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiMail className="text-blue-600" />
                  إرسال عبر البريد الإلكتروني
                </h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendEmail}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    إرسال
                  </button>
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaWhatsapp className="text-green-600" />
                  مشاركة عبر واتساب
                </h3>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="96891234567"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleSendWhatsApp}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    إرسال
                  </button>
                </div>
              </div>

              {/* Telegram */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaTelegram className="text-blue-500" />
                  مشاركة عبر Telegram
                </h3>
                <button
                  onClick={handleSendTelegram}
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  فتح في Telegram
                </button>
              </div>

              {/* Generate Link */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiCopy className="text-indigo-600" />
                  إنشاء رابط مشاركة
                </h3>
                <button
                  onClick={handleGenerateLink}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 mb-3"
                >
                  إنشاء رابط
                </button>
                
                {shareLink && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-600">رابط المشاركة:</p>
                      <button
                        onClick={() => handleCopyToClipboard(shareLink)}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <FiCopy className="w-3 h-3" />
                        نسخ
                      </button>
                    </div>
                    <p className="text-sm font-mono text-blue-600 break-all bg-white p-2 rounded border">
                      {shareLink}
                    </p>
                    {copied && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <FiCopy className="w-3 h-3" />
                        تم النسخ!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Share Buttons */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">مشاركة سريعة:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleSendWhatsApp}
                    className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <FaWhatsapp />
                    واتساب
                  </button>
                  <button
                    onClick={handleSendTelegram}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <FaTelegram />
                    تلجرام
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <FiMail />
                    بريد
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 border-t flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

