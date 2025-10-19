import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaExclamationTriangle, FaChartLine, FaArrowUp, FaArrowDown, FaClock, FaCheckCircle, FaArrowRight, FaSync, FaFilter, FaSearch, FaStar, FaThumbsUp, FaThumbsDown, FaShare, FaBookmark, FaEye, FaCogs, FaRocket, FaBullseye, FaAward } from 'react-icons/fa';

// Aliases for trending icons
const FaTrendingUp = FaArrowUp;
const FaTrendingDown = FaArrowDown;

interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'prediction' | 'optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  estimatedImpact: string;
  category: string;
  confidence: number;
  createdAt: string;
  tags?: string[];
  relatedMetrics?: string[];
  actionSteps?: string[];
  estimatedTimeToImplement?: string;
  costBenefit?: {
    cost: string;
    benefit: string;
    roi: string;
  };
}

interface AIInsightsTabProps {
  insights: AIInsight[];
}

export default function AIInsightsTab({ insights }: AIInsightsTabProps) {
  const [filteredInsights, setFilteredInsights] = useState<AIInsight[]>(insights);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<Record<string, 'helpful' | 'not-helpful' | null>>({});

  useEffect(() => {
    filterInsights();
  }, [insights, selectedCategory, selectedPriority, selectedType, searchTerm, sortBy]);

  const filterInsights = () => {
    let filtered = [...insights];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(insight => insight.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === selectedPriority);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(insight => insight.type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(insight =>
        insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort insights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'confidence':
          return b.confidence - a.confidence;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'impact':
          return a.estimatedImpact.localeCompare(b.estimatedImpact);
        default:
          return 0;
      }
    });

    setFilteredInsights(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      case 'suggestion': return <FaLightbulb className="h-5 w-5 text-yellow-500" />;
      case 'prediction': return <FaChartLine className="h-5 w-5 text-blue-500" />;
      case 'optimization': return <FaRocket className="h-5 w-5 text-green-500" />;
      default: return <FaRobot className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-red-200 bg-red-50';
      case 'suggestion': return 'border-yellow-200 bg-yellow-50';
      case 'prediction': return 'border-blue-200 bg-blue-50';
      case 'optimization': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return priority;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'warning': return 'تحذير';
      case 'suggestion': return 'اقتراح';
      case 'prediction': return 'تنبؤ';
      case 'optimization': return 'تحسين';
      default: return type;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'tasks': return 'المهام';
      case 'revenue': return 'الإيرادات';
      case 'financial': return 'المالية';
      case 'maintenance': return 'الصيانة';
      case 'contracts': return 'العقود';
      case 'legal': return 'القانونية';
      case 'efficiency': return 'الكفاءة';
      case 'optimization': return 'التحسين';
      default: return category;
    }
  };

  const handleFeedback = (insightId: string, feedback: 'helpful' | 'not-helpful') => {
    setUserFeedback(prev => ({
      ...prev,
      [insightId]: feedback
    }));
    // في التطبيق الحقيقي، سيتم إرسال التقييم إلى الخادم
  };

  const categories = [...new Set(insights.map(insight => insight.category))];
  const types = [...new Set(insights.map(insight => insight.type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <FaRobot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">نصائح الذكاء الاصطناعي</h2>
            <p className="text-sm text-gray-500">تحليلات ذكية وتوصيات مخصصة لعقارك</p>
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <FaSync className="h-4 w-4 ml-2" />
          تحديث النصائح
        </button>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaRobot className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ملخص التحليل الذكي</h3>
            <p className="text-gray-600 mb-4">
              قام نظام الذكاء الاصطناعي بتحليل {insights.length} مؤشر مختلف لعقارك وقدم {filteredInsights.length} توصية مخصصة لتحسين الأداء.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.filter(i => i.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">نصائح عالية الأولوية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {insights.filter(i => i.type === 'optimization').length}
                </div>
                <div className="text-sm text-gray-600">فرص تحسين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {insights.filter(i => i.type === 'suggestion').length}
                </div>
                <div className="text-sm text-gray-600">اقتراحات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {insights.filter(i => i.type === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">تحذيرات</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="البحث في النصائح..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الفئات</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryText(category)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الأولويات</option>
            <option value="high">عالي</option>
            <option value="medium">متوسط</option>
            <option value="low">منخفض</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الأنواع</option>
            {types.map(type => (
              <option key={type} value={type}>
                {getTypeText(type)}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="priority">الأولوية</option>
            <option value="confidence">مستوى الثقة</option>
            <option value="date">التاريخ</option>
            <option value="impact">التأثير</option>
          </select>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <FaRobot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نصائح</h3>
            <p className="text-gray-500">لم يتم العثور على نصائح تطابق المعايير المحددة</p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${getTypeColor(insight.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(insight.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                        {getPriorityText(insight.priority)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getTypeText(insight.type)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryText(insight.category)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    
                    <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <FaBullseye className="h-4 w-4 ml-1" />
                        <span>التأثير المتوقع: {insight.estimatedImpact}</span>
                      </div>
                      <div className="flex items-center">
                        <FaAward className="h-4 w-4 ml-1" />
                        <span>مستوى الثقة: {Math.round(insight.confidence * 100)}%</span>
                      </div>
                      {insight.estimatedTimeToImplement && (
                        <div className="flex items-center">
                          <FaClock className="h-4 w-4 ml-1" />
                          <span>الوقت المطلوب: {insight.estimatedTimeToImplement}</span>
                        </div>
                      )}
                    </div>
                    
                    {insight.tags && insight.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {insight.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {expandedInsight === insight.id && (
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        {insight.actionSteps && insight.actionSteps.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">خطوات التنفيذ:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                              {insight.actionSteps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {insight.costBenefit && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <div className="text-sm text-gray-600">التكلفة</div>
                              <div className="font-semibold text-red-600">{insight.costBenefit.cost}</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-sm text-gray-600">المنفعة</div>
                              <div className="font-semibold text-green-600">{insight.costBenefit.benefit}</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-sm text-gray-600">العائد على الاستثمار</div>
                              <div className="font-semibold text-blue-600">{insight.costBenefit.roi}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaEye className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <button
                      onClick={() => handleFeedback(insight.id, 'helpful')}
                      className={`p-2 rounded-lg transition-colors ${
                        userFeedback[insight.id] === 'helpful'
                          ? 'text-green-600 bg-green-100'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <FaThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(insight.id, 'not-helpful')}
                      className={`p-2 rounded-lg transition-colors ${
                        userFeedback[insight.id] === 'not-helpful'
                          ? 'text-red-600 bg-red-100'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <FaThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <FaBookmark className="h-4 w-4" />
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <FaShare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
