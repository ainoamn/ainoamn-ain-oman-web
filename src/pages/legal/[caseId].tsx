import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Layout handled by _app.tsx
import { FaEdit, FaTrash, FaShare, FaDownload, FaPrint, FaFileAlt, FaCalendarAlt, FaUser, FaUserTie, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaTelegram, FaTwitter, FaFacebook, FaLinkedin, FaCopy, FaEye, FaClock, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaBrain, FaChartLine, FaHistory, FaComments, FaMoneyBillWave, FaFileContract, FaGavel, FaBalanceScale, FaPlus, FaUpload, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaQrcode, FaShieldAlt, FaLock, FaUnlock, FaKey, FaFingerprint, FaIdCard, FaCertificate, FaAward, FaTrophy, FaMedal, FaStar, FaHeart, FaThumbsUp, FaThumbsDown, FaReply, FaForward, FaBackward, FaPlay, FaPause, FaStop, FaMicrophone, FaVideo, FaCamera, FaImage, FaImages, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileInvoice, FaFileInvoiceDollar, FaFileMedical, FaFilePrescription, FaFileSignature, FaFileUpload, FaFileDownload, FaFileExport, FaFileImport, FaClipboard, FaClipboardList, FaClipboardCheck } from 'react-icons/fa';

type Tab = "overview"|"timeline"|"documents"|"updates"|"expenses"|"analytics"|"ai-insights";

interface Case {
  id: string;
  title: string;
  description?: string;
  status: "OPEN"|"ON_HOLD"|"CLOSED"|"IN_PROGRESS"|"RESOLVED";
  stage: string;
  type?: string;
  priority?: string;
  clientId: string;
  primaryLawyerId: string;
  propertyReference?: {
    propertyId: string;
    propertyTitle: string;
    buildingNumber?: string;
    address?: string;
    landNumber?: string;
    governorate?: string;
    region?: string;
    town?: string;
  };
  plaintiff?: string;
  defendant?: string;
  courtNumber?: string;
  registrationDate?: string;
  hearingDate?: string;
  caseSummary?: string;
  legalBasis?: string;
  requestedRelief?: string;
  evidence?: string;
  witnesses?: string;
  estimatedValue?: number;
  expectedOutcome?: string;
  expenses?: number;
  fees?: number;
  notes?: string;
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Person {
  id: string;
  name: string;
  subscriptionNo: string;
  phone?: string;
  email?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  rating?: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Update {
  id: string;
  content: string;
  type: 'update'|'comment'|'status_change'|'document_added'|'expense_added';
  createdAt: string;
  createdBy: string;
  attachments?: string[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  type: 'legal_fee'|'court_fee'|'document_fee'|'travel'|'other';
  date: string;
  status: 'pending'|'paid'|'rejected';
  receipt?: string;
  createdBy: string;
}

export default function CasePage() {
  const router = useRouter();
  const { caseId } = router.query;
  
  const [case_, setCase] = useState<Case | null>(null);
  const [lawyers, setLawyers] = useState<Person[]>([]);
  const [clients, setClients] = useState<Person[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    type: 'legal_fee' as const,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      const [caseRes, lawyersRes, clientsRes, documentsRes, updatesRes, expensesRes] = await Promise.all([
        fetch(`/api/legal/cases/${caseId}`, {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch('/api/legal/directory?kind=LAWYER', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch('/api/legal/directory?kind=CLIENT', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch(`/api/legal/documents?caseId=${caseId}`, {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch(`/api/legal/messages?caseId=${caseId}`, {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch(`/api/legal/expenses?caseId=${caseId}`, {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        })
      ]);

      const caseData = await caseRes.json();
      const lawyersData = await lawyersRes.json();
      const clientsData = await clientsRes.json();
      const documentsData = await documentsRes.json();
      const updatesData = await updatesRes.json();
      const expensesData = await expensesRes.json();

      setCase(caseData);
      setLawyers(lawyersData || []);
      setClients(clientsData || []);
      setDocuments(documentsData || []);
      setUpdates(updatesData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error loading case data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <FaPlay className="text-green-600" />;
      case 'IN_PROGRESS': return <FaClock className="text-blue-600" />;
      case 'ON_HOLD': return <FaPause className="text-yellow-600" />;
      case 'CLOSED': return <FaCheckCircle className="text-gray-600" />;
      case 'RESOLVED': return <FaCheckCircle className="text-green-600" />;
      default: return <FaExclamationTriangle className="text-red-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'OPEN': 'مفتوحة',
      'IN_PROGRESS': 'قيد العمل',
      'ON_HOLD': 'معلقة',
      'CLOSED': 'مغلقة',
      'RESOLVED': 'محلولة'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'URGENT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'HIGH': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'RENTAL_DISPUTE': 'نزاع إيجار',
      'PAYMENT_DISPUTE': 'نزاع دفع',
      'CONTRACT_BREACH': 'خرق عقد',
      'PROPERTY_DAMAGE': 'تلف عقار',
      'EVICTION': 'إخلاء',
      'MAINTENANCE': 'صيانة',
      'INSURANCE': 'تأمين',
      'CRIMINAL': 'جنائي',
      'CIVIL': 'مدني',
      'ADMINISTRATIVE': 'إداري',
      'OTHER': 'أخرى'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'OMR'
    }).format(amount);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = case_?.title || 'قضية قانونية';
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط!');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    try {
      const response = await fetch(`/api/legal/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'TENANT-1',
          'x-user-id': 'U1',
          'x-roles': 'LAWYER'
        },
        body: JSON.stringify({
          caseId,
          content: newUpdate,
          type: 'update'
        })
      });

      if (response.ok) {
        setNewUpdate('');
        loadCaseData();
      }
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;

    try {
      const response = await fetch(`/api/legal/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'TENANT-1',
          'x-user-id': 'U1',
          'x-roles': 'LAWYER'
        },
        body: JSON.stringify({
          caseId,
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        })
      });

      if (response.ok) {
        setNewExpense({
          description: '',
          amount: '',
          type: 'legal_fee',
          date: new Date().toISOString().split('T')[0]
        });
        loadCaseData();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات القضية...</p>
          </div>
        </div>
      </>
    );
  }

  if (!case_) {
    return (
      <>
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">القضية غير موجودة</h3>
          <p className="text-gray-500">لم يتم العثور على القضية المطلوبة</p>
        </div>
      </>
    );
  }

  const lawyer = lawyers.find(l => l.id === case_.primaryLawyerId);
  const client = clients.find(c => c.id === case_.clientId);

  return (
    <>
      <Head>
        <title>{case_.title} - نظام إدارة القضايا</title>
      </Head>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{case_.title}</h1>
              <p className="text-blue-100">رقم القضية: {case_.id}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(case_.status)}
                  <span>{getStatusLabel(case_.status)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(case_.priority || 'MEDIUM')}`}>
                  {getTypeLabel(case_.type || 'OTHER')}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQRCode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <FaQrcode />
                QR Code
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <FaShare />
                مشاركة
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <FaDownload />
                تصدير
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <FaPrint />
                طباعة
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: FaEye },
                { id: 'timeline', label: 'الجدول الزمني', icon: FaHistory },
                { id: 'documents', label: 'المستندات', icon: FaFileAlt },
                { id: 'updates', label: 'التحديثات', icon: FaComments },
                { id: 'expenses', label: 'المصاريف', icon: FaMoneyBillWave },
                { id: 'analytics', label: 'التحليلات', icon: FaChartLine },
                { id: 'ai-insights', label: 'الذكاء الاصطناعي', icon: FaBrain }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap min-w-fit ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="text-sm" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Case Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaGavel className="text-blue-600" />
                تفاصيل القضية
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">المعلومات الأساسية</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>رقم القضية:</strong> {case_.id}</p>
                    <p><strong>النوع:</strong> {getTypeLabel(case_.type || 'OTHER')}</p>
                    <p><strong>الأولوية:</strong> {case_.priority}</p>
                    <p><strong>الحالة:</strong> {getStatusLabel(case_.status)}</p>
                    <p><strong>المرحلة:</strong> {case_.stage}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">الأطراف</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>العميل:</strong> {client?.name || 'غير محدد'}</p>
                    <p><strong>المحامي:</strong> {lawyer?.name || 'غير محدد'}</p>
                    {case_.plaintiff && <p><strong>المدعي:</strong> {case_.plaintiff}</p>}
                    {case_.defendant && <p><strong>المدعى عليه:</strong> {case_.defendant}</p>}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">التواريخ</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>تاريخ الإنشاء:</strong> {formatDate(case_.createdAt)}</p>
                    <p><strong>آخر تحديث:</strong> {formatDate(case_.updatedAt)}</p>
                    {case_.registrationDate && <p><strong>تاريخ القيد:</strong> {formatDate(case_.registrationDate)}</p>}
                    {case_.hearingDate && <p><strong>تاريخ الجلسة:</strong> {formatDate(case_.hearingDate)}</p>}
                  </div>
                </div>
              </div>

              {case_.description && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">وصف القضية</h4>
                  <p className="text-gray-700">{case_.description}</p>
                </div>
              )}

              {case_.caseSummary && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">ملخص القضية</h4>
                  <p className="text-gray-700">{case_.caseSummary}</p>
                </div>
              )}

              {case_.legalBasis && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">الأساس القانوني</h4>
                  <p className="text-gray-700">{case_.legalBasis}</p>
                </div>
              )}
            </div>

            {/* Property Reference */}
            {case_.propertyReference && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FaBuilding className="text-green-600" />
                  العقار المرتبط
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">تفاصيل العقار</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>العنوان:</strong> {case_.propertyReference.propertyTitle}</p>
                      {case_.propertyReference.buildingNumber && <p><strong>رقم المبنى:</strong> {case_.propertyReference.buildingNumber}</p>}
                      {case_.propertyReference.landNumber && <p><strong>رقم الأرض:</strong> {case_.propertyReference.landNumber}</p>}
                      {case_.propertyReference.governorate && <p><strong>المحافظة:</strong> {case_.propertyReference.governorate}</p>}
                      {case_.propertyReference.region && <p><strong>المنطقة:</strong> {case_.propertyReference.region}</p>}
                      {case_.propertyReference.town && <p><strong>البلدة:</strong> {case_.propertyReference.town}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">العنوان</h4>
                    <div className="flex items-start gap-2 text-sm">
                      <FaMapMarkerAlt className="text-gray-400 mt-1" />
                      <p className="text-gray-700">{case_.propertyReference.address || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Information */}
            {(case_.estimatedValue || case_.expenses || case_.fees) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-600" />
                  المعلومات المالية
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {case_.estimatedValue && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">القيمة المقدرة</h4>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(case_.estimatedValue)}</p>
                    </div>
                  )}
                  
                  {case_.fees && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">الرسوم القانونية</h4>
                      <p className="text-2xl font-bold text-blue-700">{formatCurrency(case_.fees)}</p>
                    </div>
                  )}
                  
                  {case_.expenses && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2">المصاريف</h4>
                      <p className="text-2xl font-bold text-orange-700">{formatCurrency(case_.expenses)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            {/* Add Update */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaComments className="text-blue-600" />
                إضافة تحديث
              </h2>
              
              <div className="space-y-4">
                <textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اكتب تحديث جديد..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddUpdate}
                    disabled={!newUpdate.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    إضافة التحديث
                  </button>
                </div>
              </div>
            </div>

            {/* Updates List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">التحديثات</h2>
              
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium text-gray-900">{update.createdBy}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(update.createdAt)}</span>
                    </div>
                    <p className="text-gray-700">{update.content}</p>
                  </div>
                ))}
                
                {updates.length === 0 && (
                  <div className="text-center py-8">
                    <FaComments className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">لا توجد تحديثات بعد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Add Expense */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                إضافة مصروف
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="وصف المصروف"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                  <select
                    value={newExpense.type}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="legal_fee">رسوم قانونية</option>
                    <option value="court_fee">رسوم محكمة</option>
                    <option value="document_fee">رسوم مستندات</option>
                    <option value="travel">سفر</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddExpense}
                  disabled={!newExpense.description.trim() || !newExpense.amount}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  إضافة المصروف
                </button>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">المصاريف</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-medium text-gray-900">الوصف</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">النوع</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">المبلغ</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">التاريخ</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{expense.description}</td>
                        <td className="py-3 px-4">{expense.type}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(expense.amount)}</td>
                        <td className="py-3 px-4">{formatDate(expense.date)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            expense.status === 'paid' ? 'bg-green-100 text-green-800' :
                            expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {expense.status === 'paid' ? 'مدفوع' :
                             expense.status === 'pending' ? 'معلق' : 'مرفوض'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {expenses.length === 0 && (
                  <div className="text-center py-8">
                    <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">لا توجد مصاريف مسجلة</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaFileAlt className="text-blue-600" />
              المستندات
            </h2>
            
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(doc.uploadedAt)} - {doc.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                      <FaEye />
                    </button>
                    <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                      <FaDownload />
                    </button>
                  </div>
                </div>
              ))}
              
              {documents.length === 0 && (
                <div className="text-center py-8">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">لا توجد مستندات مرفوعة</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaBrain className="text-purple-600" />
              تحليل الذكاء الاصطناعي
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">توقع النتيجة</h4>
                <p className="text-2xl font-bold text-purple-700">85%</p>
                <p className="text-sm text-purple-600">احتمالية النجاح</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">المدة المتوقعة</h4>
                <p className="text-2xl font-bold text-blue-700">3-6 أشهر</p>
                <p className="text-sm text-blue-600">حتى الحكم النهائي</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">التوصيات</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>جمع المزيد من الأدلة الداعمة للقضية</li>
                <li>التواصل مع الشهود المحتملين</li>
                <li>إعداد المستندات القانونية المطلوبة</li>
                <li>متابعة الجدول الزمني للمحكمة</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">مشاركة القضية</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('copy')}
                  className="flex-1 p-3 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <FaCopy />
                  نسخ الرابط
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-3 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center gap-2"
                >
                  <FaWhatsapp />
                  واتساب
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center gap-2"
                >
                  <FaTelegram />
                  تليجرام
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-3 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center gap-2"
                >
                  <FaTwitter />
                  تويتر
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center gap-2"
                >
                  <FaFacebook />
                  فيسبوك
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 text-center">
            <h3 className="text-lg font-semibold mb-4">QR Code للقضية</h3>
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <div className="w-32 h-32 mx-auto bg-gray-300 rounded-lg flex items-center justify-center">
                <FaQrcode className="text-4xl text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              امسح الكود لعرض تفاصيل القضية
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQRCode(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إغلاق
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                تحميل
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}