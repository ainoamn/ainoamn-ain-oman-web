import React, { useState } from "react";
import { useTSafe } from "@/lib/i18n-safe";
import { DocumentStatus } from "@/components/common/DocumentStatus";
import { FiDownload, FiEye, FiTrash2, FiUpload, FiAlertTriangle } from "react-icons/fi";
import { daysUntil } from "@/utils/date";

interface Document {
  id: string;
  title: string;
  type: string;
  expiry?: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface DocumentManagerProps {
  documents: Document[];
  onUpload: (file: File, type: string, expiryDate?: string) => Promise<void>;
  onDelete: (id: string) => void;
  onView: (doc: Document) => void;
  allowedTypes?: string[];
  maxSize?: number; // بالميجابايت
}

export default function DocumentManager({
  documents,
  onUpload,
  onDelete,
  onView,
  allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  maxSize = 10
}: DocumentManagerProps) {
  const { t, dir } = useTSafe();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newDocument, setNewDocument] = useState({
    file: null as File | null,
    type: "",
    expiryDate: ""
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadError(null);

    if (!file) {
      setNewDocument(prev => ({ ...prev, file: null }));
      return;
    }

    // التحقق من حجم الملف
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(t("documentManager.fileTooLarge", `حجم الملف يجب أن يكون أقل من ${maxSize}MB`));
      return;
    }

    // التحقق من نوع الملف
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.includes(`.${extension}`)) {
      setUploadError(t("documentManager.invalidFileType", `نوع الملف غير مسموح. المسموح: ${allowedTypes.join(', ')}`));
      return;
    }

    setNewDocument(prev => ({ ...prev, file }));
  };

  const handleUpload = async () => {
    if (!newDocument.file) {
      setUploadError(t("documentManager.noFileSelected", "لم يتم اختيار ملف"));
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      await onUpload(newDocument.file, newDocument.type, newDocument.expiryDate);
      setNewDocument({ file: null, type: "", expiryDate: "" });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : t("documentManager.uploadFailed", "فشل رفع الملف"));
    } finally {
      setUploading(false);
    }
  };

  const expiringDocuments = documents.filter(doc => {
    if (!doc.expiry) return false;
    const days = daysUntil(doc.expiry);
    return days <= 30 && days >= 0;
  });

  const expiredDocuments = documents.filter(doc => {
    if (!doc.expiry) return false;
    return daysUntil(doc.expiry) < 0;
  });

  return (
    <div dir={dir} className="space-y-6">
      {/* تنبيهات المستندات المنتهية أو القريبة من الانتهاء */}
      {(expiredDocuments.length > 0 || expiringDocuments.length > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="text-yellow-600" size={20} />
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              {t("documentManager.documentsAlert", "تنبيهات المستندات")}
            </h3>
          </div>
          
          {expiredDocuments.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-red-600 dark:text-red-400 text-sm mb-2">
                {t("documentManager.expiredDocuments", "مستندات منتهية الصلاحية")} ({expiredDocuments.length})
              </h4>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                {expiredDocuments.slice(0, 3).map(doc => (
                  <li key={doc.id}>• {doc.title}</li>
                ))}
              </ul>
            </div>
          )}
          
          {expiringDocuments.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-600 dark:text-yellow-400 text-sm mb-2">
                {t("documentManager.expiringSoon", "مستندات تنتهي قريبًا")} ({expiringDocuments.length})
              </h4>
              <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                {expiringDocuments.slice(0, 3).map(doc => (
                  <li key={doc.id}>• {doc.title} ({daysUntil(doc.expiry!)} {t("documentManager.daysLeft", "أيام")})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* نموذج رفع مستند جديد */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          {t("documentManager.uploadNew", "رفع مستند جديد")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documentManager.selectFile", "اختر الملف")} *
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={allowedTypes.join(',')}
                />
                <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {newDocument.file ? newDocument.file.name : t("documentManager.chooseFile", "اختر ملف...")}
                </div>
              </label>
              
              {newDocument.file && (
                <button
                  onClick={() => setNewDocument(prev => ({ ...prev, file: null }))}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title={t("documentManager.removeFile", "إزالة الملف")}
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documentManager.documentType", "نوع المستند")}
            </label>
            <select
              value={newDocument.type}
              onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">{t("documentManager.selectType", "اختر النوع")}</option>
              <option value="contract">{t("documentManager.contract", "عقد")}</option>
              <option value="insurance">{t("documentManager.insurance", "تأمين")}</option>
              <option value="license">{t("documentManager.license", "رخصة")}</option>
              <option value="certificate">{t("documentManager.certificate", "شهادة")}</option>
              <option value="other">{t("documentManager.other", "أخرى")}</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("documentManager.expiryDate", "تاريخ الانتهاء (اختياري)")}
            </label>
            <input
              type="date"
              value={newDocument.expiryDate}
              onChange={(e) => setNewDocument(prev => ({ ...prev, expiryDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleUpload}
              disabled={uploading || !newDocument.file}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("uploading", "جاري الرفع...")}
                </>
              ) : (
                <>
                  <FiUpload size={16} />
                  {t("documentManager.upload", "رفع المستند")}
                </>
              )}
            </button>
          </div>
        </div>
        
        {uploadError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t("documentManager.allowedTypes", `الأنواع المسموحة: ${allowedTypes.join(', ')}`)} • 
          {t("documentManager.maxSize", ` أقصى حجم: ${maxSize}MB`)}
        </p>
      </div>

      {/* قائمة المستندات */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {t("documentManager.documentsList", "قائمة المستندات")} ({documents.length})
          </h3>
        </div>
        
        {documents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>{t("documentManager.noDocuments", "لا توجد مستندات بعد")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {doc.title}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    {doc.type && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                        {doc.type}
                      </span>
                    )}
                    
                    <span>
                      {t("documentManager.uploadedBy", "تم الرفع بواسطة")} {doc.uploadedBy}
                    </span>
                    
                    <span>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <DocumentStatus expiry={doc.expiry} />
                  
                  {doc.url && (
                    <>
                      <button
                        onClick={() => onView(doc)}
                        className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title={t("view", "عرض")}
                      >
                        <FiEye size={18} />
                      </button>
                      
                      <a
                        href={doc.url}
                        download
                        className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title={t("download", "تحميل")}
                      >
                        <FiDownload size={18} />
                      </a>
                    </>
                  )}
                  
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title={t("delete", "حذف")}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}