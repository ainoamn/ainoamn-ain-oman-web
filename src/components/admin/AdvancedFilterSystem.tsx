// src/components/admin/AdvancedFilterSystem.tsx - نظام فلترة متطور مع الذكاء الاصطناعي
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Building, 
  User, 
  DollarSign, 
  Tag, 
  X, 
  ChevronDown,
  Sparkles,
  TrendingUp,
  BarChart3,
  Zap,
  Brain,
  Target,
  RefreshCw
} from 'lucide-react';

interface FilterState {
  searchTerm: string;
  dateRange: { from: string; to: string };
  propertyFilter: string;
  customerFilter: string;
  amountRange: { from: number | null; to: number | null };
  statusFilter: string;
  smartSuggestions: string[];
  aiInsights: any[];
}

interface AdvancedFilterSystemProps {
  onFiltersChange: (filters: FilterState) => void;
  totalItems: number;
  filteredCount: number;
  items: any[];
}

export default function AdvancedFilterSystem({ 
  onFiltersChange, 
  totalItems, 
  filteredCount, 
  items 
}: AdvancedFilterSystemProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateRange: { from: '', to: '' },
    propertyFilter: '',
    customerFilter: '',
    amountRange: { from: null, to: null },
    statusFilter: 'all',
    smartSuggestions: [],
    aiInsights: []
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('smart');
  const [isLoading, setIsLoading] = useState(false);

  // ذكاء اصطناعي للاقتراحات الذكية
  const generateSmartSuggestions = useMemo(() => {
    const suggestions = [];
    
    // تحليل البيانات لإنتاج اقتراحات ذكية
    const recentBookings = items.filter(item => {
      const daysDiff = (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const highValueBookings = items.filter(item => (item.totalAmount || 0) > 10000);
    const pendingBookings = items.filter(item => item.status === 'pending');

    if (recentBookings.length > 0) {
      suggestions.push({
        label: `حجوزات الأسبوع الماضي (${recentBookings.length})`,
        action: () => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          setFilters(prev => ({
            ...prev,
            dateRange: { 
              from: weekAgo.toISOString().split('T')[0], 
              to: new Date().toISOString().split('T')[0] 
            }
          }));
        },
        icon: Calendar,
        color: 'blue'
      });
    }

    if (highValueBookings.length > 0) {
      suggestions.push({
        label: `حجوزات عالية القيمة (${highValueBookings.length})`,
        action: () => {
          setFilters(prev => ({
            ...prev,
            amountRange: { from: 10000, to: null }
          }));
        },
        icon: DollarSign,
        color: 'green'
      });
    }

    if (pendingBookings.length > 0) {
      suggestions.push({
        label: `حجوزات تحتاج مراجعة (${pendingBookings.length})`,
        action: () => {
          setFilters(prev => ({
            ...prev,
            statusFilter: 'pending'
          }));
        },
        icon: Target,
        color: 'orange'
      });
    }

    return suggestions;
  }, [items]);

  // تحليلات ذكية
  const aiInsights = useMemo(() => {
    const insights = [];
    
    // تحليل الاتجاهات
    const statusCounts = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const avgBookingValue = totalRevenue / items.length;

    insights.push({
      type: 'trend',
      title: 'اتجاه الحجوزات',
      value: `${Object.keys(statusCounts).length} حالة مختلفة`,
      description: `إجمالي الإيرادات: ${new Intl.NumberFormat('ar-OM', { style: 'currency', currency: 'OMR' }).format(totalRevenue)}`,
      icon: TrendingUp,
      color: 'blue'
    });

    insights.push({
      type: 'performance',
      title: 'متوسط قيمة الحجز',
      value: new Intl.NumberFormat('ar-OM', { style: 'currency', currency: 'OMR' }).format(avgBookingValue),
      description: `من إجمالي ${items.length} حجز`,
      icon: BarChart3,
      color: 'green'
    });

    return insights;
  }, [items]);

  // تحديث الفلاتر
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      dateRange: { from: '', to: '' },
      propertyFilter: '',
      customerFilter: '',
      amountRange: { from: null, to: null },
      statusFilter: 'all',
      smartSuggestions: [],
      aiInsights: []
    });
  };

  const applySmartFilter = (suggestion: any) => {
    suggestion.action();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
      {/* Header مع تأثيرات بصرية */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  نظام الفلترة الذكي
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredCount} من {totalItems} حجز
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 bg-white/80 hover:bg-white rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* تبويبات الفلترة */}
      <div className="px-6 pb-4">
        <div className="flex space-x-1 rtl:space-x-reverse bg-white/60 rounded-xl p-1">
          {[
            { id: 'smart', label: 'ذكي', icon: Sparkles },
            { id: 'advanced', label: 'متقدم', icon: Filter },
            { id: 'insights', label: 'تحليلات', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* محتوى الفلترة */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {/* الفلترة الذكية */}
          {activeTab === 'smart' && (
            <div className="space-y-6">
              {/* البحث الذكي */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ابحث بذكاء... (رقم الحجز، اسم العميل، العقار)"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full pl-4 pr-10 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
              </div>

              {/* الاقتراحات الذكية */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Zap className="w-4 h-4 ml-2" />
                  اقتراحات ذكية
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {generateSmartSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySmartFilter(suggestion)}
                      disabled={isLoading}
                      className={`p-4 bg-white/80 hover:bg-white rounded-xl border border-gray-200 hover:border-${suggestion.color}-300 transition-all duration-200 hover:shadow-md group`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`p-2 bg-${suggestion.color}-100 rounded-lg group-hover:bg-${suggestion.color}-200 transition-colors`}>
                          <suggestion.icon className={`w-4 h-4 text-${suggestion.color}-600`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {suggestion.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* الفلترة المتقدمة */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* فلترة التاريخ */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Calendar className="w-4 h-4 ml-2" />
                    نطاق التاريخ
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, from: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, to: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* فلترة العقار */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Building className="w-4 h-4 ml-2" />
                    العقار
                  </label>
                  <input
                    type="text"
                    placeholder="رقم العقار أو العنوان..."
                    value={filters.propertyFilter}
                    onChange={(e) => setFilters(prev => ({ ...prev, propertyFilter: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* فلترة العميل */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 ml-2" />
                    العميل
                  </label>
                  <input
                    type="text"
                    placeholder="اسم العميل أو رقم الهاتف..."
                    value={filters.customerFilter}
                    onChange={(e) => setFilters(prev => ({ ...prev, customerFilter: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* فلترة المبلغ */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <DollarSign className="w-4 h-4 ml-2" />
                    نطاق المبلغ
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="من (ر.ع)"
                      value={filters.amountRange.from || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        amountRange: { ...prev.amountRange, from: e.target.value ? Number(e.target.value) : null }
                      }))}
                      className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="إلى (ر.ع)"
                      value={filters.amountRange.to || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        amountRange: { ...prev.amountRange, to: e.target.value ? Number(e.target.value) : null }
                      }))}
                      className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* فلترة الحالة */}
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Tag className="w-4 h-4 ml-2" />
                    الحالة
                  </label>
                  <select
                    value={filters.statusFilter}
                    onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="reserved">محجوز</option>
                    <option value="leased">مؤجّر</option>
                    <option value="cancelled">ملغى</option>
                    <option value="accounting">محاسبي</option>
                  </select>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <X className="w-4 h-4" />
                  <span>مسح الكل</span>
                </button>
                <button
                  onClick={() => setIsLoading(true)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>تطبيق الفلاتر</span>
                </button>
              </div>
            </div>
          )}

          {/* التحليلات الذكية */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-6 bg-white/80 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                      <div className={`p-2 bg-${insight.color}-100 rounded-lg`}>
                        <insight.icon className={`w-5 h-5 text-${insight.color}-600`} />
                      </div>
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</p>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}





