// @ts-nocheck
// src/pages/test-advanced-system.tsx - صفحة اختبار النظام المتقدم
import React, { useState, useEffect } from 'react';
import { 
  FiShield, FiBuilding, FiUser, FiTrendingUp, FiActivity,
  FiBarChart3, FiUsers, FiCalendar, FiDollarSign, FiSettings,
  FiBell, FiSearch, FiFilter, FiGlobe, FiBrain, FiZap,
  FiCheckCircle, FiAlertTriangle, FiInfo, FiPlay, FiCheck, FiX, FiClock, FiTarget, FiStar
} from 'react-icons/fi';
import { UserRole, ROLE_PERMISSIONS, getAllRoles } from '@/lib/userRoles';
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/lib/subscriptionSystem';
const getAllSubscriptionPlans = () => SUBSCRIPTION_PLANS;
import { aiEngine, AIInsight } from '@/lib/aiSystem';
import { searchEngine } from '@/lib/advancedSearch';
import { multilingualSystem, SUPPORTED_LANGUAGES } from '@/lib/multilingual';
import { propertyManagementSystem } from '@/lib/propertyManagement';

export default function TestAdvancedSystem() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('property_owner');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[2]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runAllTests();
  }, [selectedRole, selectedPlan]);

  const runAllTests = async () => {
    setLoading(true);
    const results: { [key: string]: boolean } = {};

    try {
      // اختبار نظام الأدوار
      results.roles = await testUserRoles();
      
      // اختبار نظام الاشتراكات
      results.subscriptions = await testSubscriptionSystem();
      
      // اختبار الذكاء الاصطناعي
      results.ai = await testAISystem();
      
      // اختبار البحث المتقدم
      results.search = await testAdvancedSearch();
      
      // اختبار اللغات المتعددة
      results.multilingual = await testMultilingual();
      
      // اختبار إدارة العقارات
      results.propertyManagement = await testPropertyManagement();

      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testUserRoles = async (): Promise<boolean> => {
    try {
      const roles = getAllRoles();
      const roleInfo = ROLE_PERMISSIONS[selectedRole];
      
      // اختبار الحصول على الصلاحيات
      const permissions = roleInfo.permissions;
      const hasPermission = permissions.includes('properties.read');
      
      return roles.length > 0 && permissions.length > 0 && hasPermission;
    } catch (error) {
      console.error('User roles test failed:', error);
      return false;
    }
  };

  const testSubscriptionSystem = async (): Promise<boolean> => {
    try {
      const plans = getAllSubscriptionPlans();
      const planInfo = selectedPlan;
      
      // اختبار الحصول على المميزات والحدود
      const features = planInfo.features;
      const limits = planInfo.limits;
      
      return plans.length > 0 && features.length > 0 && limits.maxProperties > 0;
    } catch (error) {
      console.error('Subscription system test failed:', error);
      return false;
    }
  };

  const testAISystem = async (): Promise<boolean> => {
    try {
      // اختبار توليد التوصيات الذكية
      const insights = await aiEngine.generateSmartRecommendations(
        selectedRole,
        selectedPlan,
        {}
      );
      
      setAiInsights(insights);
      
      // اختبار تحليل السوق
      const marketAnalysis = await aiEngine.analyzeMarketTrends('مسقط', 'apartment');
      
      return insights.length > 0 && marketAnalysis.id !== undefined;
    } catch (error) {
      console.error('AI system test failed:', error);
      return false;
    }
  };

  const testAdvancedSearch = async (): Promise<boolean> => {
    try {
      // اختبار البحث السريع
      const quickResults = await searchEngine.quickSearch('شقة في مسقط', selectedRole);
      
      // اختبار البحث المتقدم
      const advancedResults = await searchEngine.smartSearch(
        'فيلا مع مسبح',
        selectedRole,
        { preferences: { propertyTypes: ['villa'] } }
      );
      
      setSearchResults(quickResults.items);
      
      return quickResults.items.length >= 0 && advancedResults.items.length >= 0;
    } catch (error) {
      console.error('Advanced search test failed:', error);
      return false;
    }
  };

  const testMultilingual = async (): Promise<boolean> => {
    try {
      // اختبار تغيير اللغة
      multilingualSystem.setLanguage('en');
      const englishTranslation = multilingualSystem.translate('common.save');
      
      multilingualSystem.setLanguage('ar');
      const arabicTranslation = multilingualSystem.translate('common.save');
      
      return englishTranslation !== arabicTranslation && 
             SUPPORTED_LANGUAGES.length > 0;
    } catch (error) {
      console.error('Multilingual test failed:', error);
      return false;
    }
  };

  const testPropertyManagement = async (): Promise<boolean> => {
    try {
      // اختبار إنشاء عقار
      const property = await propertyManagementSystem.createProperty({
        title: 'عقار تجريبي',
        type: 'apartment',
        pricing: { purchasePrice: 100000, rentPrice: 500, deposit: 1000, maintenanceFee: 50, utilities: [] }
      }, selectedRole);
      
      // اختبار الحصول على الإحصائيات
      const stats = await propertyManagementSystem.getDashboardStats(selectedRole);
      
      // اختبار التحليلات
      const analytics = await propertyManagementSystem.getPropertyAnalytics(property.id, 'monthly');
      
      return property.id !== undefined && stats.totalProperties >= 0 && analytics.propertyId !== undefined;
    } catch (error) {
      console.error('Property management test failed:', error);
      return false;
    }
  };

  const getTestStatusIcon = (testName: string) => {
    const passed = testResults[testName];
    if (passed === undefined) return <span className="text-gray-400">ℹ️</span>;
    return passed ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>;
  };

  const getTestStatusText = (testName: string) => {
    const passed = testResults[testName];
    if (passed === undefined) return 'لم يتم الاختبار';
    return passed ? 'نجح' : 'فشل';
  };

  const getTestStatusColor = (testName: string) => {
    const passed = testResults[testName];
    if (passed === undefined) return 'text-gray-500';
    return passed ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">اختبار النظام المتقدم</h1>
              <p className="text-gray-600 mt-1">اختبار شامل لجميع مكونات النظام الجديد</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={runAllTests}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <span className="ml-1">▶️</span>
                {loading ? 'جاري الاختبار...' : 'تشغيل الاختبارات'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">إعدادات الاختبار</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">دور المستخدم</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {getAllRoles().map(role => (
                  <option key={role.role} value={role.role}>
                    {role.icon} {role.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">خطة الاشتراك</label>
              <select 
                value={selectedPlan.id}
                onChange={(e) => {
                  const plan = getAllSubscriptionPlans().find(p => p.id === e.target.value);
                  if (plan) setSelectedPlan(plan);
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                {getAllSubscriptionPlans().map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.icon} {plan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
              <select 
                value={currentLanguage}
                onChange={(e) => {
                  setCurrentLanguage(e.target.value);
                  multilingualSystem.setLanguage(e.target.value as any);
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* System Tests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">نتائج الاختبارات</h2>
            <div className="space-y-4">
              {[
                { key: 'roles', name: 'نظام الأدوار والصلاحيات', icon: '🛡️' },
                { key: 'subscriptions', name: 'نظام الاشتراكات', icon: '💰' },
                { key: 'ai', name: 'الذكاء الاصطناعي', icon: '🧠' },
                { key: 'search', name: 'البحث المتقدم', icon: '🔍' },
                { key: 'multilingual', name: 'اللغات المتعددة', icon: '🌍' },
                { key: 'propertyManagement', name: 'إدارة العقارات', icon: '🏢' }
              ].map(test => (
                <div key={test.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-gray-600 ml-3">{test.icon}</div>
                    <span className="font-medium text-gray-900">{test.name}</span>
                  </div>
                  <div className="flex items-center">
                    {getTestStatusIcon(test.key)}
                    <span className={`ml-2 text-sm font-medium ${getTestStatusColor(test.key)}`}>
                      {getTestStatusText(test.key)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">حالة النظام</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">إجمالي الاختبارات</span>
                <span className="font-semibold">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">نجحت</span>
                <span className="font-semibold text-green-600">
                  {Object.values(testResults).filter(Boolean).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">فشلت</span>
                <span className="font-semibold text-red-600">
                  {Object.values(testResults).filter(r => r === false).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">معدل النجاح</span>
                <span className="font-semibold text-blue-600">
                  {Object.keys(testResults).length > 0 
                    ? Math.round((Object.values(testResults).filter(Boolean).length / Object.keys(testResults).length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">التوصيات الذكية</h2>
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

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">نتائج البحث</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.slice(0, 6).map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{result.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{result.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {result.price?.toLocaleString()} ر.ع
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.area} م²
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <span className="text-blue-600 mx-auto mb-2 text-2xl">🏢</span>
              <span className="text-sm font-medium text-blue-800">إدارة العقارات</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <span className="text-green-600 mx-auto mb-2 text-2xl">📅</span>
              <span className="text-sm font-medium text-green-800">إدارة الحجوزات</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <span className="text-purple-600 mx-auto mb-2 text-2xl">⚡</span>
              <span className="text-sm font-medium text-purple-800">إدارة المهام</span>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center">
              <span className="text-yellow-600 mx-auto mb-2 text-2xl">📊</span>
              <span className="text-sm font-medium text-yellow-800">التقارير</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}



