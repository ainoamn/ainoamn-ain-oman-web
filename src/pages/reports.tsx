// src/pages/reports.tsx - التقارير والإحصائيات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { 
  FiBarChart3, FiPieChart, FiTrendingUp, FiTrendingDown, FiDownload,
  FiPrinter, FiShare2, FiFilter, FiCalendar, FiDollarSign, FiUsers,
  FiHome, FiFileText, FiEye, FiEdit, FiPlus, FiRefreshCw
} from 'react-icons/fi';
// Layout handled by _app.tsx

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'properties' | 'customers' | 'maintenance' | 'custom';
  category: string;
  data: any;
  filters: {
    dateRange: {
      start: string;
      end: string;
    };
    properties?: string[];
    customers?: string[];
    status?: string[];
  };
  generatedAt: string;
  generatedBy: string;
  status: 'draft' | 'generated' | 'published';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  size: string;
  downloadCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  icon: string;
  color: string;
  fields: string[];
  defaultFilters: any;
  isPopular: boolean;
  isRecommended: boolean;
}

interface DashboardStats {
  totalProperties: number;
  totalCustomers: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  averageRent: number;
  pendingPayments: number;
  overduePayments: number;
  maintenanceRequests: number;
  completedTasks: number;
  activeAuctions: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل التقارير
      const reportsResponse = await fetch('/api/reports');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
      }

      // تحميل قوالب التقارير
      const templatesResponse = await fetch('/api/reports/templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates || []);
      }

      // تحميل إحصائيات لوحة التحكم
      const statsResponse = await fetch('/api/reports/dashboard-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'bg-green-100 text-green-800 border-green-200';
      case 'properties': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customers': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'custom': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <FiDollarSign className="w-4 h-4" />;
      case 'properties': return <FiHome className="w-4 h-4" />;
      case 'customers': return <FiUsers className="w-4 h-4" />;
      case 'maintenance': return <FiFileText className="w-4 h-4" />;
      case 'custom': return <FiBarChart3 className="w-4 h-4" />;
      default: return <FiFileText className="w-4 h-4" />;
    }
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'financial': return 'مالي';
      case 'properties': return 'عقاري';
      case 'customers': return 'عملاء';
      case 'maintenance': return 'صيانة';
      case 'custom': return 'مخصص';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'generated': return 'مولد';
      case 'published': return 'منشور';
      default: return status;
    }
  };

  const getTemplateIcon = (icon: string) => {
    switch (icon) {
      case 'financial': return <FiDollarSign className="w-6 h-6" />;
      case 'properties': return <FiHome className="w-6 h-6" />;
      case 'customers': return <FiUsers className="w-6 h-6" />;
      case 'maintenance': return <FiFileText className="w-6 h-6" />;
      case 'analytics': return <FiBarChart3 className="w-6 h-6" />;
      default: return <FiFileText className="w-6 h-6" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const generateReport = async (templateId: string) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          filters: {
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            }
          }
        }),
      });

      if (response.ok) {
        const newReport = await response.json();
        setReports(prev => [newReport.report, ...prev]);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>التقارير والإحصائيات - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات</h1>
                <p className="mt-1 text-sm text-gray-500">
                  تحليل شامل لأداء العقارات والأعمال
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <FiRefreshCw className="w-4 h-4 ml-2" />
                  تحديث البيانات
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <FiPlus className="w-4 h-4 ml-2" />
                  تقرير جديد
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* إحصائيات سريعة */}
          {dashboardStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiHome className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">إجمالي العقارات</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProperties}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiDollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FiTrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">معدل الإشغال</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.occupancyRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* فلاتر البحث */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع التقرير</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="financial">مالي</option>
                  <option value="properties">عقاري</option>
                  <option value="customers">عملاء</option>
                  <option value="maintenance">صيانة</option>
                  <option value="custom">مخصص</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="draft">مسودة</option>
                  <option value="generated">مولد</option>
                  <option value="published">منشور</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفترة</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">هذا الأسبوع</option>
                  <option value="month">هذا الشهر</option>
                  <option value="quarter">هذا الربع</option>
                  <option value="year">هذا العام</option>
                  <option value="all">جميع الفترات</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  <FiFilter className="w-4 h-4 ml-2 inline" />
                  تطبيق الفلاتر
                </button>
              </div>
            </div>
          </div>

          {/* قوالب التقارير */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">قوالب التقارير</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => generateReport(template.id)}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${template.color}`}>
                      {getTemplateIcon(template.icon)}
                    </div>
                    <div className="mr-4">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      {template.isPopular && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          شائع
                        </span>
                      )}
                      {template.isRecommended && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          موصى به
                        </span>
                      )}
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      إنشاء تقرير
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* قائمة التقارير */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">التقارير المولدة</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التقرير
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التحميلات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReportTypeColor(report.type)}`}>
                          {getReportTypeIcon(report.type)}
                          <span className="mr-1">{getReportTypeText(report.type)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(report.generatedAt)}</div>
                        <div className="text-sm text-gray-500">بواسطة {report.generatedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.downloadCount}</div>
                        <div className="text-sm text-gray-500">{report.size}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => downloadReport(report.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="تحميل"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1" title="عرض">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1" title="طباعة">
                            <FiPrinter className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1" title="مشاركة">
                            <FiShare2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد تقارير</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    ابدأ بإنشاء تقرير جديد باستخدام القوالب المتاحة.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
