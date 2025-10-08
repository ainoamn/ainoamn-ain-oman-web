import React from 'react';
import { FaRobot, FaLightbulb, FaExclamationTriangle, FaChartLine, FaTrendingUp } from 'react-icons/fa';

interface SimpleAIInsightsTabProps {
  insights?: any[];
}

export default function SimpleAIInsightsTab({ insights }: SimpleAIInsightsTabProps) {
  const mockInsights = [
    {
      id: '1',
      type: 'suggestion',
      title: 'تحسين معدل الإشغال',
      description: 'يُنصح بتخفيض الإيجار بنسبة 5% لزيادة الطلب على العقار',
      priority: 'medium',
      impact: 'زيادة الإيرادات بنسبة 15%'
    },
    {
      id: '2',
      type: 'warning',
      title: 'مهام صيانة متأخرة',
      description: 'لديك 3 مهام صيانة متأخرة تحتاج إلى متابعة فورية',
      priority: 'high',
      impact: 'تجنب التكاليف الإضافية'
    },
    {
      id: '3',
      type: 'optimization',
      title: 'تحسين كفاءة الطاقة',
      description: 'استخدام أجهزة توفير الطاقة يمكن أن يقلل التكاليف بنسبة 20%',
      priority: 'low',
      impact: 'توفير 500 ريال شهرياً'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      case 'suggestion': return <FaLightbulb className="h-5 w-5 text-yellow-500" />;
      case 'optimization': return <FaTrendingUp className="h-5 w-5 text-green-500" />;
      default: return <FaRobot className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-red-200 bg-red-50';
      case 'suggestion': return 'border-yellow-200 bg-yellow-50';
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
          تحديث النصائح
        </button>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaChartLine className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ملخص التحليل الذكي</h3>
            <p className="text-gray-600 mb-4">
              قام نظام الذكاء الاصطناعي بتحليل 15 مؤشر مختلف لعقارك وقدم {mockInsights.length} توصية مخصصة لتحسين الأداء.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">نصائح عالية الأولوية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-gray-600">فرص تحسين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">اقتراحات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-gray-600">تحذيرات</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {mockInsights.map((insight) => (
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
                  </div>
                  
                  <p className="text-gray-600 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaChartLine className="h-4 w-4 ml-1" />
                      <span>التأثير المتوقع: {insight.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات المقترحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-right">
            <h4 className="font-medium text-gray-900 mb-2">تطبيق جميع النصائح</h4>
            <p className="text-sm text-gray-600">تطبيق جميع التوصيات المقترحة</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-right">
            <h4 className="font-medium text-gray-900 mb-2">إنشاء خطة عمل</h4>
            <p className="text-sm text-gray-600">وضع خطة زمنية لتنفيذ النصائح</p>
          </button>
        </div>
      </div>
    </div>
  );
}
