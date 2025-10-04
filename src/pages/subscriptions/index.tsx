// صفحة الاشتراكات المتكاملة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  SUBSCRIPTION_PLANS, 
  subscriptionManager, 
  PERMISSION_CATEGORIES,
  type SubscriptionPlan,
  type UserSubscription 
} from '@/lib/subscriptionSystem';

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // محاكاة جلب اشتراك المستخدم
    const mockUserId = 'user_123';
    const stats = subscriptionManager.getSubscriptionStats(mockUserId);
    if (stats) {
      setUserSubscription(stats.subscription);
    }
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  const handlePayment = async () => {
    // محاكاة عملية الدفع
    try {
      const mockUserId = 'user_123';
      const subscription = subscriptionManager.createSubscription(mockUserId, selectedPlan, 'credit_card');
      setUserSubscription(subscription);
      setShowPaymentModal(false);
      alert('تم تفعيل الاشتراك بنجاح!');
    } catch (error) {
      alert('حدث خطأ في عملية الدفع');
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ر.ع`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // غير محدود
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <>
      <Head>
        <title>خطط الاشتراك - عين عُمان</title>
        <meta name="description" content="اختر الخطة المناسبة لاحتياجاتك في إدارة العقارات" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">خطط الاشتراك</h1>
              <p className="text-xl opacity-90">
                اختر الخطة المناسبة لاحتياجاتك في إدارة العقارات
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Current Subscription */}
          {userSubscription && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">اشتراكك الحالي</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${userSubscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {userSubscription.status === 'active' ? 'نشط' : 'منتهي'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">الخطة الحالية</h3>
                  <p className="text-gray-600">
                    {SUBSCRIPTION_PLANS.find(p => p.id === userSubscription.planId)?.nameAr}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">الأيام المتبقية</h3>
                  <p className="text-gray-600">{userSubscription.remainingDays} يوم</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">المبلغ المدفوع</h3>
                  <p className="text-gray-600">{formatCurrency(userSubscription.totalPaid)}</p>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">إحصائيات الاستخدام</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(userSubscription.usage).map(([key, used]) => {
                    const limit = userSubscription.limits[key as keyof typeof userSubscription.limits];
                    const percentage = getUsagePercentage(used, limit);
                    const isUnlimited = limit === -1;
                    
                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            {key === 'properties' ? 'العقارات' :
                             key === 'units' ? 'الوحدات' :
                             key === 'bookings' ? 'الحجوزات' :
                             key === 'users' ? 'المستخدمون' : 'التخزين'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {used} / {isUnlimited ? '∞' : limit}
                          </span>
                        </div>
                        {!isUnlimited && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-xl shadow-sm p-6 relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      الأكثر شعبية
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl text-white">
                      {plan.priority === 'basic' ? '🏠' :
                       plan.priority === 'standard' ? '🏢' :
                       plan.priority === 'premium' ? '⭐' : '👑'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.nameAr}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.descriptionAr}</p>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(plan.price)}
                  </div>
                  <p className="text-gray-500 text-sm">/ شهر</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.featuresAr.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✅</span>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {userSubscription ? (
                    userSubscription.planId === plan.id ? (
                      <button 
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
                      >
                        الخطة الحالية
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpgrade(plan.id)}
                        className={`w-full ${plan.color} hover:opacity-90 text-white py-3 rounded-lg font-medium transition-colors`}
                      >
                        ترقية
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full ${plan.color} hover:opacity-90 text-white py-3 rounded-lg font-medium transition-colors`}
                    >
                      اختر الخطة
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">مقارنة الميزات</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الميزة</th>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                        {plan.nameAr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">عدد العقارات</td>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4 text-gray-600">
                        {plan.maxProperties === -1 ? 'غير محدود' : plan.maxProperties}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">عدد الوحدات</td>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4 text-gray-600">
                        {plan.maxUnits === -1 ? 'غير محدود' : plan.maxUnits}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">إدارة التقويم</td>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.permissions.some(p => p.category === 'calendar') ? (
                          <span className="text-green-500">✅</span>
                        ) : (
                          <span className="text-red-500">❌</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">إدارة المهام</td>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.permissions.some(p => p.category === 'tasks') ? (
                          <span className="text-green-500">✅</span>
                        ) : (
                          <span className="text-red-500">❌</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">التحليلات المتقدمة</td>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.permissions.some(p => p.category === 'analytics') ? (
                          <span className="text-green-500">✅</span>
                        ) : (
                          <span className="text-red-500">❌</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">تأكيد الدفع</h3>
              <p className="text-gray-600 mb-6">
                هل تريد الاشتراك في الخطة {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.nameAr}؟
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handlePayment}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"
                >
                  تأكيد الدفع
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">ترقية الاشتراك</h3>
              <p className="text-gray-600 mb-6">
                هل تريد الترقية إلى الخطة {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.nameAr}؟
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium"
                >
                  ترقية الآن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}