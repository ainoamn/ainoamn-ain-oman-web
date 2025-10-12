import React, { useState, useEffect } from 'react';
import {
  FaChartLine, FaChartBar, FaChartPie, FaArrowUp, FaArrowDown,
  FaCalendar, FaFilter, FaDownload, FaPrint,
  FaEye, FaEyeSlash, FaEquals,
  FaDollarSign, FaUsers, FaBuilding, FaClock, FaCheckCircle,
  FaExclamationTriangle, FaInfoCircle, FaQuestionCircle
} from 'react-icons/fa';

// Aliases for trending icons
const FaTrendingUp = FaArrowUp;
const FaTrendingDown = FaArrowDown;

interface AnalyticsData {
  propertyId: string;
  timeRange: string;
  metrics: {
    occupancy: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
    revenue: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
    expenses: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
    maintenance: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
    customerSatisfaction: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
    };
  };
  charts: {
    revenueOverTime: Array<{
      date: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
    occupancyTrends: Array<{
      date: string;
      occupancy: number;
      available: number;
    }>;
    expenseBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    performanceComparison: Array<{
      metric: string;
      current: number;
      target: number;
      industry: number;
    }>;
  };
  insights: Array<{
    id: string;
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    impact: string;
  }>;
}

interface AnalyticsTabProps {
  propertyId: string;
  stats: any;
}

export default function AnalyticsTab({ propertyId, stats }: AnalyticsTabProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [propertyId, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <FaTrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <FaTrendingDown className="h-4 w-4 text-red-500" />;
      default: return <FaEquals className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جارٍ تحميل التحليلات...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <FaChartLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات تحليلية</h3>
        <p className="text-gray-500">لم يتم العثور على بيانات كافية لإنتاج التحليلات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <FaChartLine className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">التحليلات والإحصائيات</h2>
            <p className="text-sm text-gray-500">تحليل شامل لأداء العقار</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
            <option value="1y">آخر سنة</option>
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FaDownload className="h-4 w-4 ml-2" />
            تصدير
          </button>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FaPrint className="h-4 w-4 ml-2" />
            طباعة
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">معدل الإشغال</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(analyticsData.metrics.occupancy.current)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(analyticsData.metrics.occupancy.trend)}
                <span className={`text-sm ml-1 ${getTrendColor(analyticsData.metrics.occupancy.trend)}`}>
                  {formatPercentage(Math.abs(analyticsData.metrics.occupancy.change))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaBuilding className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.metrics.revenue.current)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(analyticsData.metrics.revenue.trend)}
                <span className={`text-sm ml-1 ${getTrendColor(analyticsData.metrics.revenue.trend)}`}>
                  {formatPercentage(Math.abs(analyticsData.metrics.revenue.change))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaDollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المصروفات</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.metrics.expenses.current)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(analyticsData.metrics.expenses.trend)}
                <span className={`text-sm ml-1 ${getTrendColor(analyticsData.metrics.expenses.trend)}`}>
                  {formatPercentage(Math.abs(analyticsData.metrics.expenses.change))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FaChartBar className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الصيانة</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.metrics.maintenance.current)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(analyticsData.metrics.maintenance.trend)}
                <span className={`text-sm ml-1 ${getTrendColor(analyticsData.metrics.maintenance.trend)}`}>
                  {formatPercentage(Math.abs(analyticsData.metrics.maintenance.change))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">رضا العملاء</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(analyticsData.metrics.customerSatisfaction.current)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(analyticsData.metrics.customerSatisfaction.trend)}
                <span className={`text-sm ml-1 ${getTrendColor(analyticsData.metrics.customerSatisfaction.trend)}`}>
                  {formatPercentage(Math.abs(analyticsData.metrics.customerSatisfaction.change))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">الإيرادات والمصروفات</h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setSelectedChart('revenue')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedChart === 'revenue'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                الإيرادات
              </button>
              <button
                onClick={() => setSelectedChart('profit')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedChart === 'profit'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                الأرباح
              </button>
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <FaChartLine className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">رسم بياني للإيرادات والمصروفات</p>
              <p className="text-sm text-gray-400">سيتم تطوير هذا الرسم البياني قريباً</p>
            </div>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">معدل الإشغال</h3>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FaFilter className="h-4 w-4" />
            </button>
          </div>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <FaChartBar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">رسم بياني لمعدل الإشغال</p>
              <p className="text-sm text-gray-400">سيتم تطوير هذا الرسم البياني قريباً</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">مقارنة الأداء</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {showDetails ? <FaEyeSlash className="h-4 w-4 ml-1" /> : <FaEye className="h-4 w-4 ml-1" />}
            {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المؤشر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  القيمة الحالية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الهدف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  متوسط الصناعة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.charts.performanceComparison.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.metric}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof item.current === 'number' ? 
                      (item.current > 1000 ? formatCurrency(item.current) : formatPercentage(item.current)) :
                      item.current
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof item.target === 'number' ? 
                      (item.target > 1000 ? formatCurrency(item.target) : formatPercentage(item.target)) :
                      item.target
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof item.industry === 'number' ? 
                      (item.industry > 1000 ? formatCurrency(item.industry) : formatPercentage(item.industry)) :
                      item.industry
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.current >= item.target 
                        ? 'bg-green-100 text-green-800'
                        : item.current >= item.industry
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.current >= item.target ? 'ممتاز' : 
                       item.current >= item.industry ? 'جيد' : 'يحتاج تحسين'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      {analyticsData.insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">رؤى التحليل</h3>
          <div className="space-y-3">
            {analyticsData.insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'positive' ? 'border-green-500 bg-green-50' :
                  insight.type === 'negative' ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <p className="text-xs text-gray-500 mt-2">التأثير: {insight.impact}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {insight.type === 'positive' ? (
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    ) : insight.type === 'negative' ? (
                      <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <FaInfoCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
