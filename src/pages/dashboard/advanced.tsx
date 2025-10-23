// src/pages/dashboard/advanced.tsx - لوحة التحكم المتقدمة
import React, { useState, useEffect } from 'react';
import { 
  FiShield, FiBuilding, FiUser, FiTrendingUp, FiActivity,
  FiBarChart3, FiUsers, FiCalendar, FiDollarSign, FiSettings,
  FiBell, FiSearch, FiFilter, FiGlobe, FiBrain, FiZap
} from 'react-icons/fi';
import { UserRole, ROLE_PERMISSIONS } from '@/lib/userRoles';
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/lib/subscriptionSystem';
import { aiEngine, AIInsight } from '@/lib/aiSystem';
import { searchEngine } from '@/lib/advancedSearch';
import { multilingualSystem, SUPPORTED_LANGUAGES } from '@/lib/multilingual';

export default function AdvancedDashboard() {
  const [userRole, setUserRole] = useState<UserRole>('property_owner');
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[2]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // تحميل رؤى الذكاء الاصطناعي
      const insights = await aiEngine.generateSmartRecommendations(
        userRole, 
        subscriptionPlan, 
        {}
      );
      setAiInsights(insights);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const roleInfo = ROLE_PERMISSIONS[userRole];
  const planInfo = subscriptionPlan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم المتقدمة</h1>
              <p className="text-gray-600 mt-1">نظام إدارة عقارات متطور مع الذكاء الاصطناعي</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select 
                value={currentLanguage}
                onChange={(e) => {
                  setCurrentLanguage(e.target.value);
                  multilingualSystem.setLanguage(e.target.value as any);
                }}
                className="border rounded-lg px-3 py-2"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
              
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FiBell size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Role & Subscription Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full bg-${roleInfo.color}-100 flex items-center justify-center`}>
                <span className="text-2xl">{roleInfo.icon}</span>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">{roleInfo.description}</h3>
                <p className="text-sm text-gray-600">{roleInfo.features.length} مميزة متاحة</p>
              </div>
            </div>
            <div className="space-y-2">
              {roleInfo.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full bg-${roleInfo.color}-500 ml-2`}></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full bg-${planInfo.color}-100 flex items-center justify-center`}>
                <span className="text-2xl">{planInfo.icon}</span>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">{planInfo.name}</h3>
                <p className="text-sm text-gray-600">{planInfo.price.monthly} ر.ع/شهر</p>
              </div>
            </div>
            <div className="space-y-2">
              {planInfo.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full bg-${planInfo.color}-500 ml-2`}></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FiBrain size={24} className="text-purple-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-900">الذكاء الاصطناعي</h3>
                <p className="text-sm text-gray-600">{aiInsights.length} توصية ذكية</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-purple-500 ml-2"></div>
                تحليل السوق
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-purple-500 ml-2"></div>
                توقع الأسعار
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-purple-500 ml-2"></div>
                توصيات مخصصة
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">التوصيات الذكية</h2>
              <div className="flex items-center text-sm text-gray-600">
                <FiZap size={16} className="ml-1" />
                مدعوم بالذكاء الاصطناعي
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                  insight.impact === 'high' ? 'border-red-500 bg-red-50' :
                  insight.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.impact === 'high' ? 'عالي' :
                       insight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {insight.confidence}% ثقة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <FiBuilding size={24} className="text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-800">العقارات</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <FiCalendar size={24} className="text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-800">الحجوزات</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <FiActivity size={24} className="text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-purple-800">المهام</span>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center">
              <FiDollarSign size={24} className="text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-yellow-800">المالية</span>
            </button>
            <button className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-center">
              <FiUsers size={24} className="text-red-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-red-800">العملاء</span>
            </button>
            <button className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-center">
              <FiBarChart3 size={24} className="text-indigo-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-indigo-800">التقارير</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">حالة النظام</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الخادم</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-sm text-green-600">يعمل بشكل طبيعي</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">قاعدة البيانات</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-sm text-green-600">متصل</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الذكاء الاصطناعي</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-sm text-green-600">نشط</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">المزامنة</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-sm text-green-600">محدث</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">الإحصائيات السريعة</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">عقار نشط</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-600">حجز هذا الشهر</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-gray-600">معدل الإشغال</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">45,000</div>
                <div className="text-sm text-gray-600">إيرادات (ر.ع)</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



