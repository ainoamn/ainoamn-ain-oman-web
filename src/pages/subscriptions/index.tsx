// src/pages/subscriptions/index.tsx - صفحة اختيار الباقات الاحترافية
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiCheck, FiX, FiCreditCard, FiZap, FiStar, FiTrendingUp, FiShield,
  FiAward, FiHeart, FiGift
} from 'react-icons/fi';
import { 
  SUBSCRIPTION_PLANS, 
  subscriptionManager, 
  type SubscriptionPlan,
  type UserSubscription 
} from '@/lib/subscriptionSystem';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  
  // الباقات (من API أو الافتراضي)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  
  // الصلاحيات لكل باقة (من localStorage)
  const [plansFeatures, setPlansFeatures] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ain_auth:change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ain_auth:change', handleStorageChange);
    };
  }, []);

  const loadData = async () => {
    if (typeof window === 'undefined') return;
    try {
      let loadedPlans: SubscriptionPlan[] = [];
      let loadedFeatures: Record<string, string[]> = {};

      // 1. تحميل الباقات من localStorage
      const customPlansStr = window.localStorage.getItem('custom_plans');
      if (customPlansStr) {
        try {
          const customPlans = JSON.parse(customPlansStr);
          if (Array.isArray(customPlans) && customPlans.length > 0) {
            loadedPlans = customPlans;
            console.log('✅ تم تحميل الباقات من localStorage:', loadedPlans.length);
          }
        } catch (e) {
          console.error('خطأ في قراءة الباقات:', e);
        }
      }

      // 2. تحميل الصلاحيات من localStorage
      const customFeaturesStr = window.localStorage.getItem('custom_plan_features');
      if (customFeaturesStr) {
        try {
          const customFeatures = JSON.parse(customFeaturesStr);
          loadedFeatures = customFeatures;
          console.log('✅ تم تحميل الصلاحيات من localStorage:', Object.keys(loadedFeatures).length);
        } catch (e) {
          console.error('خطأ في قراءة الصلاحيات:', e);
        }
      }

      // 3. إذا لم توجد باقات، استخدم الافتراضية
      if (loadedPlans.length === 0) {
        loadedPlans = [...SUBSCRIPTION_PLANS];
        console.log('ℹ️ استخدام الباقات الافتراضية:', loadedPlans.length);
      }

      // 4. التأكد من وجود featuresAr و permissions
      const plansWithFeatures = loadedPlans.map((plan: SubscriptionPlan) => ({
        ...plan,
        features: plan.features || [],
        featuresAr: plan.featuresAr || plan.features || [
          `حتى ${plan.maxProperties === -1 ? '∞' : plan.maxProperties} عقار`,
          `حتى ${plan.maxUnits === -1 ? '∞' : plan.maxUnits} وحدة`,
          `حتى ${plan.maxBookings === -1 ? '∞' : plan.maxBookings} حجز`,
          `${plan.maxUsers === -1 ? '∞' : plan.maxUsers} مستخدم`,
          `${plan.storageGB} جيجابايت تخزين`
        ],
        permissions: plan.permissions || []
      }));
      
      setPlans(plansWithFeatures);
      setPlansFeatures(loadedFeatures);
      console.log('📦 إجمالي الباقات:', plansWithFeatures.length, '| الصلاحيات:', Object.keys(loadedFeatures).length);

      // 5. تحميل بيانات المستخدم
      const authData = window.localStorage.getItem('ain_auth');
      if (authData) {
        const userData = JSON.parse(authData);
        setCurrentUser(userData);
        if (userData.subscription) {
          setUserSubscription(userData.subscription);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPlans([...SUBSCRIPTION_PLANS]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (!currentUser) {
      alert('يرجى تسجيل الدخول أولاً');
      router.push('/login');
      return;
    }

    setSelectedPlanId(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (typeof window === 'undefined') return;
    try {
      const authData = window.localStorage.getItem('ain_auth');
      if (!authData) {
        alert('يرجى تسجيل الدخول');
        router.push('/login');
        return;
      }

      const userData = JSON.parse(authData);
      const subscription = subscriptionManager.createSubscription(
        userData.id,
        selectedPlanId,
        'credit_card'
      );

      userData.subscription = subscription;
      window.localStorage.setItem('ain_auth', JSON.stringify(userData));
      
      setUserSubscription(subscription);
      setShowPaymentModal(false);
      
      alert('🎉 تم تفعيل الاشتراك بنجاح!');
      
      // التوجيه إلى صفحة البروفايل
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      alert('❌ حدث خطأ في عملية الدفع');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 * 0.8; // خصم 20% على الاشتراك السنوي
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Head>
        <title>باقات الاشتراك - عين عُمان</title>
        <meta name="description" content="اختر الباقة المثالية لاحتياجاتك في إدارة العقارات" />
      </Head>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="mb-6">
            <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-lg rounded-full text-sm font-bold border border-white/30 mb-6">
              🎁 عرض خاص - خصم 20% على الاشتراك السنوي
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            اختر الباقة المثالية
          </h1>
          <p className="text-2xl opacity-95 max-w-3xl mx-auto leading-relaxed">
            باقات مرنة ومتنوعة تناسب جميع احتياجاتك في إدارة العقارات
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-white/60'}`}>
              شهرياً
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-16 h-8 rounded-full transition-all ${
                billingCycle === 'yearly' ? 'bg-green-500' : 'bg-white/30'
              }`}
            >
              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${
                billingCycle === 'yearly' ? 'right-1' : 'right-9'
              }`} />
            </button>
            <span className={`font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-white/60'}`}>
              سنوياً
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold animate-pulse">
                وفّر 20%
              </span>
            )}
            </div>
          </div>
        </div>

          {/* Current Subscription */}
          {userSubscription && (
        <div className="max-w-7xl mx-auto px-6 -mt-10 mb-8 relative z-10">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <FiShield className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm opacity-90 mb-1">اشتراكك الحالي</div>
                  <div className="text-2xl font-bold">
                    {plans.find(p => p.id === userSubscription.planId)?.nameAr || 'باقة غير معروفة'}
                </div>
                  <div className="text-sm opacity-90 mt-1">
                    {userSubscription.status === 'active' 
                      ? `✓ نشط - ${userSubscription.remainingDays} يوم متبقي` 
                      : '⚠️ منتهي'}
                </div>
              </div>
                        </div>
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-gray-50 font-bold shadow-lg transform hover:scale-105 transition-all"
              >
                عرض لوحة التحكم
              </button>
                </div>
              </div>
            </div>
          )}

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => {
            const isCurrentPlan = userSubscription?.planId === plan.id;
            const price = billingCycle === 'yearly' ? getYearlyPrice(plan.price) : plan.price;
            const priceLabel = billingCycle === 'yearly' ? 'سنوياً' : 'شهرياً';

            return (
              <div 
                key={plan.id} 
                className={`relative rounded-3xl shadow-2xl transition-all transform hover:scale-105 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-110 z-10' 
                    : 'bg-white hover:shadow-3xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <FiStar className="w-4 h-4" />
                      الأكثر شعبية
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                      ✓ باقتك الحالية
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className={`text-5xl mb-4 ${plan.popular ? '' : 'grayscale-0'}`}>
                      {idx === 0 ? '🌱' : idx === 1 ? '🚀' : idx === 2 ? '💎' : '👑'}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.nameAr}
                    </h3>
                    <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      {plan.descriptionAr}
                    </p>
                </div>

                  <div className="text-center mb-8">
                    <div className={`text-5xl font-extrabold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(price)}
                    </div>
                    <div className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      {priceLabel}
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className={`text-xs mt-2 ${plan.popular ? 'text-white/70' : 'text-gray-500'}`}>
                        <span className="line-through">{formatCurrency(plan.price * 12)}</span>
                        <span className="text-green-600 font-bold mr-2">وفّر {formatCurrency(plan.price * 12 * 0.2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    {(plan.featuresAr || plan.features || []).map((feature: any, fidx: number) => {
                      // معالجة آمنة للميزات (قد تكون string أو object)
                      let featureText = '';
                      
                      if (typeof feature === 'string') {
                        featureText = feature;
                      } else if (feature && typeof feature === 'object') {
                        featureText = feature.nameAr || feature.name || feature.description || 'ميزة';
                      } else {
                        featureText = 'ميزة';
                      }
                      
                      return (
                        <div key={fidx} className="flex items-start gap-3">
                          <FiCheck className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-green-300' : 'text-green-600'}`} />
                          <span className={`text-sm ${plan.popular ? 'text-white/90' : 'text-gray-700'}`}>
                            {featureText}
                          </span>
                  </div>
                      );
                    })}
                </div>

                  <div className={`grid grid-cols-2 gap-3 mb-8 pb-8 border-b ${plan.popular ? 'border-white/20' : 'border-gray-200'}`}>
                    <div className={`text-center p-3 rounded-lg ${plan.popular ? 'bg-white/10' : 'bg-gray-50'}`}>
                      <div className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                        {plan.maxProperties === -1 ? '∞' : plan.maxProperties}
                      </div>
                      <div className={`text-xs ${plan.popular ? 'text-white/70' : 'text-gray-600'}`}>عقار</div>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${plan.popular ? 'bg-white/10' : 'bg-gray-50'}`}>
                      <div className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                        {plan.maxBookings === -1 ? '∞' : plan.maxBookings}
                      </div>
                      <div className={`text-xs ${plan.popular ? 'text-white/70' : 'text-gray-600'}`}>حجز</div>
                    </div>
                </div>

                    <button 
                      onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                      plan.popular
                        ? 'bg-white text-purple-600 hover:bg-gray-50'
                        : isCurrentPlan
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl'
                    }`}
                  >
                    {isCurrentPlan ? '✓ باقتك الحالية' : 'اشترك الآن'}
                    </button>
                </div>
              </div>
            );
          })}
          </div>

          {/* Features Comparison */}
        <div className="mt-20 bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            مقارنة شاملة للباقات
          </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-700">الميزة</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center px-6 py-4">
                      <div className={`inline-block px-4 py-2 ${plan.color || 'bg-gray-500'} text-white rounded-lg font-bold`}>
                        {plan.nameAr}
                      </div>
                    </th>
                    ))}
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { label: '🏢 عدد العقارات', key: 'maxProperties' },
                  { label: '🏠 عدد الوحدات', key: 'maxUnits' },
                  { label: '📅 عدد الحجوزات', key: 'maxBookings' },
                  { label: '👥 عدد المستخدمين', key: 'maxUsers' },
                  { label: '💾 مساحة التخزين', key: 'storageGB', suffix: 'GB' },
                ].map((row, ridx) => (
                  <tr key={ridx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{row.label}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center px-6 py-4">
                        <span className="font-bold text-gray-900">
                          {(plan as any)[row.key] === -1 ? '∞' : (plan as any)[row.key]}
                          {row.suffix && (plan as any)[row.key] !== -1 ? ` ${row.suffix}` : ''}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">🔐 عدد الصلاحيات</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center px-6 py-4">
                      <span className="font-bold text-blue-600">
                        {plansFeatures[plan.id]?.length || 0}
                      </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        {/* FAQ or Features */}
        <div className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">لماذا عين عُمان؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: '🚀', title: 'سريع وسهل', desc: 'واجهة بسيطة وسلسة' },
              { icon: '🔒', title: 'آمن ومحمي', desc: 'أمان عالي لبياناتك' },
              { icon: '🤖', title: 'ذكاء اصطناعي', desc: 'توصيات وتحليلات ذكية' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all">
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              إتمام عملية الدفع
            </h3>

            {selectedPlanId && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">الباقة المختارة</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {plans.find(p => p.id === selectedPlanId)?.nameAr}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(
                        billingCycle === 'yearly'
                          ? getYearlyPrice(plans.find(p => p.id === selectedPlanId)?.price || 0)
                          : plans.find(p => p.id === selectedPlanId)?.price || 0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{billingCycle === 'yearly' ? 'سنوياً' : 'شهرياً'}</div>
              </div>
            </div>
          </div>
        )}

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'credit', label: 'بطاقة ائتمان', icon: '💳' },
                  { id: 'bank', label: 'تحويل بنكي', icon: '🏦' },
                  { id: 'cash', label: 'نقداً', icon: '💵' },
                ].map((method) => (
                  <button
                    key={method.id}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
                  >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
                <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPlanId('');
                }}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-lg transition-all"
              >
                <FiX className="inline-block w-5 h-5 ml-2" />
                  إلغاء
                </button>
                <button 
                onClick={handlePayment}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105 transition-all"
              >
                <FiCreditCard className="inline-block w-5 h-5 ml-2" />
                إتمام الدفع
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
