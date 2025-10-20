// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import SimpleTasksTab from '@/components/property/SimpleTasksTab';
import SimpleFinancialTab from '@/components/property/SimpleFinancialTab';
import SimpleAIInsightsTab from '@/components/property/SimpleAIInsightsTab';
import { FaBuilding, FaHome, FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaSort, FaChevronDown, FaChevronUp, FaExpand, FaArchive, FaGlobe, FaEyeSlash, FaChartLine, FaRobot, FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaTag, FaCalendar, FaUser, FaPhone, FaEnvelope, FaCog, FaDownload, FaPrint, FaShare, FaHeart, FaStar, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle, FaLightbulb, FaArrowUp, FaArrowDown, FaEquals, FaClock, FaHistory, FaFileInvoice, FaTasks, FaGavel, FaFileContract, FaReceipt, FaBell, FaCalendarAlt, FaUsers, FaChartBar, FaShieldAlt, FaCogs, FaDatabase, FaCloudUploadAltAlt, FaQrcode, FaMapPin, FaMoneyBillWave, FaClipboardList, FaHandshake, FaExclamationCircle, FaCheckCircle, FaClock as FaClockIcon, FaDollarSign, FaPercent, FaCalculator, FaFileAlt, FaImage, FaVideo, FaMicrophone, FaComments, FaThumbsUp, FaThumbsDown, FaBookmark, FaFlag, FaLock, FaUnlock, FaEye as FaEyeIcon, FaEyeSlash as FaEyeSlashIcon, FaEdit as FaEditIcon, FaTrash as FaTrashIcon, FaCopy, FaExternalLinkAlt, FaArrowLeft, FaArrowRight, FaSync, FaSave, FaUpload, FaDownload as FaDownloadIcon, FaPrint as FaPrintIcon, FaShare as FaShareIcon, FaHeart as FaHeartIcon, FaStar as FaStarIcon, FaBookmark as FaBookmarkIcon, FaFlag as FaFlagIcon, FaLock as FaLockIcon, FaUnlock as FaUnlockIcon } from 'react-icons/fa';

// Alias for trending icon
const FaTrendingUp = FaArrowUp;

interface Property {
  id: string;
  referenceNo?: string;
  title?: string | { ar?: string; en?: string };
  type?: string;
  usageType?: string;
  purpose?: string;
  buildingType?: 'single' | 'multi';
  priceOMR?: number;
  rentalPrice?: number;
  province?: string;
  state?: string;
  city?: string;
  address?: string;
  beds?: number | string;
  baths?: number | string;
  area?: number | string;
  floors?: number | string;
  totalUnits?: number | string;
  totalArea?: number | string;
  status?: 'vacant' | 'reserved' | 'leased' | 'hidden' | 'draft';
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
  units?: any[];
  images?: string[];
  coverImage?: string;
  coverIndex?: number;
  amenities?: string[];
  customAmenities?: string[];
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  notes?: string;
  surveyNumber?: string;
  landNumber?: string;
  latitude?: string;
  longitude?: string;
  mapAddress?: string;
}

interface PropertyStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
  maintenanceCosts: number;
  legalIssues: number;
  documents: number;
}

interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'prediction' | 'optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  estimatedImpact: string;
  category: string;
}

export default function PropertyAdminNew() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    if (id) {
      fetchPropertyData();
    }
  }, [id]);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      // جلب بيانات العقار
      const propertyResponse = await fetch(`/api/properties/${id}`);
      const propertyData = await propertyResponse.json();
      setProperty(propertyData);

      // جلب الإحصائيات
      const statsResponse = await fetch(`/api/properties/${id}/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);

      // جلب نصائح الذكاء الاصطناعي
      const aiResponse = await fetch(`/api/properties/${id}/ai-insights`);
      const aiData = await aiResponse.json();
      setAiInsights(aiData);

    } catch (error) {
      console.error('Error fetching property data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTitle = () => {
    if (!property) return 'العقار';
    if (typeof property.title === 'string') return property.title;
    if (typeof property.title === 'object' && property.title?.ar) return property.title.ar;
    if (typeof property.title === 'object' && property.title?.en) return property.title.en;
    return property.referenceNo || property.id;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vacant': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'leased': return 'bg-blue-100 text-blue-800';
      case 'hidden': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'vacant': return 'شاغر';
      case 'reserved': return 'محجوز';
      case 'leased': return 'مؤجر';
      case 'hidden': return 'مخفي';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جارٍ تحميل بيانات العقار...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">العقار غير موجود</h2>
            <p className="text-gray-600 mb-4">لا يمكن العثور على العقار المطلوب</p>
            <Link href="/properties" className="text-blue-600 hover:text-blue-800">
              العودة إلى قائمة العقارات
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>إدارة العقار - {getPropertyTitle()} | Ain Oman</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Link 
                  href="/properties" 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    إدارة العقار: {getPropertyTitle()}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {property.referenceNo && `المرجع: ${property.referenceNo}`}
                    {property.address && ` • ${property.address}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Link
                  href={`/property/${id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaEye className="h-4 w-4 ml-2" />
                  عرض العقار
                </Link>
                <Link
                  href={`/property/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="h-4 w-4 ml-2" />
                  تعديل العقار
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 rtl:space-x-reverse">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: FaChartBar },
                { id: 'tasks', label: 'المهام', icon: FaTasks },
                { id: 'financial', label: 'المالية', icon: FaMoneyBillWave },
                { id: 'contracts', label: 'العقود', icon: FaFileContract },
                { id: 'reservations', label: 'الحجوزات', icon: FaCalendarAlt },
                { id: 'legal', label: 'القانونية', icon: FaGavel },
                { id: 'documents', label: 'المستندات', icon: FaFileAlt },
                { id: 'analytics', label: 'التحليلات', icon: FaTrendingUp },
                { id: 'ai-insights', label: 'نصائح الذكاء الاصطناعي', icon: FaRobot }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 ml-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <OverviewTab property={property} stats={stats} aiInsights={aiInsights} />
          )}
          {activeTab === 'tasks' && (
            <SimpleTasksTab propertyId={id as string} />
          )}
          {activeTab === 'financial' && (
            <SimpleFinancialTab propertyId={id as string} stats={stats} />
          )}
          {activeTab === 'contracts' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">العقود</h3>
              <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
            </div>
          )}
          {activeTab === 'reservations' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الحجوزات</h3>
              <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
            </div>
          )}
          {activeTab === 'legal' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">القضايا القانونية</h3>
              <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
            </div>
          )}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المستندات</h3>
              <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">التحليلات والإحصائيات</h3>
              <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
            </div>
          )}
          {activeTab === 'ai-insights' && (
            <SimpleAIInsightsTab insights={aiInsights} />
          )}
        </div>
      </div>
    </Layout>
  );
}

// Overview Tab Component
function OverviewTab({ property, stats, aiInsights }: { property: Property; stats: PropertyStats | null; aiInsights: AIInsight[] }) {
  return (
    <div className="space-y-6">
      {/* Property Info Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaBuilding className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {typeof property.title === 'string' ? property.title : property.title?.ar || property.title?.en}
                </h2>
                <p className="text-sm text-gray-500">
                  {property.type} • {property.purpose} • {property.province}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FaBed className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm text-gray-500">غرف النوم</p>
                <p className="font-semibold">{property.beds || 'غير محدد'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FaBath className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm text-gray-500">الحمامات</p>
                <p className="font-semibold">{property.baths || 'غير محدد'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FaRuler className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm text-gray-500">المساحة</p>
                <p className="font-semibold">{property.area || 'غير محدد'} م²</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FaTag className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm text-gray-500">السعر</p>
                <p className="font-semibold">{property.priceOMR || property.rentalPrice || 'غير محدد'} ريال</p>
              </div>
            </div>
          </div>
          
          <div className="text-left rtl:text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status || 'draft')}`}>
              {getStatusText(property.status || 'draft')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المهام</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                <p className="text-sm text-green-600">
                  {stats.completedTasks} مكتملة ({Math.round((stats.completedTasks / stats.totalTasks) * 100)}%)
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaTasks className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} ريال</p>
                <p className="text-sm text-blue-600">
                  {stats.monthlyRevenue.toLocaleString()} ريال هذا الشهر
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل الإشغال</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                <p className="text-sm text-purple-600">
                  {stats.activeContracts} عقد نشط
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المهام المتأخرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                <p className="text-sm text-orange-600">
                  {stats.overdueInvoices} فاتورة متأخرة
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <FaRobot className="h-5 w-5 text-blue-600 ml-2" />
            <h3 className="text-lg font-semibold text-gray-900">نصائح الذكاء الاصطناعي</h3>
          </div>
          <div className="space-y-3">
            {aiInsights.slice(0, 3).map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'warning' ? 'border-red-500 bg-red-50' :
                insight.type === 'suggestion' ? 'border-blue-500 bg-blue-50' :
                insight.type === 'prediction' ? 'border-purple-500 bg-purple-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <p className="text-xs text-gray-500 mt-2">التأثير المتوقع: {insight.estimatedImpact}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority === 'high' ? 'عالي' : insight.priority === 'medium' ? 'متوسط' : 'منخفض'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Placeholder components for other tabs
function TasksTab({ propertyId }: { propertyId: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">المهام المرتبطة بالعقار</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

function FinancialTab({ propertyId, stats }: { propertyId: string; stats: PropertyStats | null }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات المالية</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

function ContractsTab({ propertyId }: { propertyId: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">العقود</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

function ReservationsTab({ propertyId }: { propertyId: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">الحجوزات</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

function LegalTab({ propertyId }: { propertyId: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">القضايا القانونية</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

function DocumentsTab({ propertyId }: { propertyId: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">المستندات</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

function AnalyticsTab({ propertyId, stats }: { propertyId: string; stats: PropertyStats | null }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">التحليلات والإحصائيات</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

function AIInsightsTab({ insights }: { insights: AIInsight[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">نصائح الذكاء الاصطناعي</h3>
      <p className="text-gray-500">سيتم تطوير هذا القسم قريباً...</p>
    </div>
  );
}

// Helper functions
function getStatusColor(status: string) {
  switch (status) {
    case 'vacant': return 'bg-green-100 text-green-800';
    case 'reserved': return 'bg-yellow-100 text-yellow-800';
    case 'leased': return 'bg-blue-100 text-blue-800';
    case 'hidden': return 'bg-gray-100 text-gray-800';
    case 'draft': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'vacant': return 'شاغر';
    case 'reserved': return 'محجوز';
    case 'leased': return 'مؤجر';
    case 'hidden': return 'مخفي';
    case 'draft': return 'مسودة';
    default: return status;
  }
}
