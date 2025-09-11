// src/pages/subscriptions.tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";
import useMounted from "@/hooks/useMounted";
import {
  CheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

type Period = "/mo" | "/yr";
type Plan = {
  id: string;
  name: string;
  priceOMR: number;
  period: Period;
  annualDiscountPercent?: number;
  highlight?: boolean;
  description?: string;
  icon?: string;
  features: string[];
  recommended?: boolean;
  popular?: boolean;
  capabilities?: Record<string, any>;
};
type PriceView = "monthly" | "yearly";
const DEFAULT_ANNUAL = 10;

/* ربط مع صفحة الأدمن */
const LS_FEATURES = "ain.features.registry";  // قائمة الميزات القادمة من /admin/dashboard/widgets
const LS_PLANS = "ain.subscriptions.plans";   // تمكين الميزات لكل باقة من /admin/subscriptions

type FeatureReg = {
  key: string;               // مثل widget.stats أو link.123
  label: string;             // الاسم الظاهر
  iconKey?: string;
  source: "widget" | "adminLink";
  meta?: Record<string, any>;
};

function annualPrice(monthly: number, disc?: number) {
  const d = Number.isFinite(disc) ? Number(disc) : DEFAULT_ANNUAL;
  return Number((monthly * 12 * (1 - d / 100)).toFixed(3));
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readLSUser() {
  try {
    const s = localStorage.getItem("ain_auth") || localStorage.getItem("auth_token");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

// دالة مساعدة لعرض الأيقونات بنفس الطريقة في كلا الصفحتين
const renderPlanIcon = (icon: string | undefined, planName: string) => {
  if (!icon) {
    if (planName.includes("أساسي") || planName.toLowerCase().includes("basic")) return "📊";
    if (planName.includes("محترف") || planName.toLowerCase().includes("professional") || planName.toLowerCase().includes("pro")) return "🚀";
    if (planName.includes("متميز") || planName.toLowerCase().includes("enterprise") || planName.toLowerCase().includes("elite")) return "🏆";
    return "📦";
  }
  if (icon.startsWith("http")) {
    return <img src={icon} alt="" className="w-10 h-10 rounded-full" />;
  }
  return <span className="text-3xl">{icon}</span>;
};

function SubscriptionsPage() {
  const mounted = useMounted();
  const { dir } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const returnTo = (router.query.return as string) || "/dashboard";
  const need = (router.query.need as string) || undefined;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [featuresReg, setFeaturesReg] = useState<FeatureReg[]>([]);
  const [priceView, setPriceView] = useState<PriceView>("yearly");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<"online" | "bank" | "admin">("online");
  const [busy, setBusy] = useState<string | null>(null);
  const [recommendedPlan, setRecommendedPlan] = useState<string>("professional");

  // تحويل مفاتيح الميزات إلى عناوين بشرية
  const humanizeFeature = (token: string) => {
    const f = featuresReg.find((x) => x.key === token);
    return f ? f.label : token;
  };

  useEffect(() => {
    // تحميل الميزات من سجل الأدمن دائمًا
    const feats = readLS<FeatureReg[]>(LS_FEATURES, []);
    setFeaturesReg(Array.isArray(feats) ? feats : []);

    // الاستماع لتغيّرات سجل الميزات من الأدمن
    const onFeaturesChange = () => setFeaturesReg(readLS<FeatureReg[]>(LS_FEATURES, []));
    if (typeof window !== "undefined") {
      window.addEventListener("ain:features:change", onFeaturesChange);
    }

    // تحميل الباقات من localStorage أولاً
    const savedPlans = readLS<Plan[]>(LS_PLANS, []);
    if (savedPlans.length > 0) {
      setPlans(savedPlans);
      setRecommendedPlanBasedOnUser(savedPlans, user);
      return;
    }

    // إذا لم توجد بيانات محفوظة، جلب من الخادم
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        const base: Plan[] = (data.items || []) as Plan[];
        const overlay = readLS<{ id: string; name: string; price?: string; features: string[] }[]>(LS_PLANS, []);

        const enhancedPlans = base.map((plan) => {
          // ميزات افتراضية قديمة كاحتياطي فقط إذا لا توجد ميزات من الخادم ولا من الأدمن
          let fallbackFeatures: string[] = [];
          const pid = plan.id.toLowerCase();
          const pname = plan.name.toLowerCase();
          if (pid.includes("basic") || pname.includes("أساسي")) {
            fallbackFeatures = ["عرض 10 عقارات", "دعم أساسي", "إشعارات البريد الإلكتروني"];
          } else if (pid.includes("pro") || pid.includes("professional") || pname.includes("محترف")) {
            fallbackFeatures = ["عرض 50 عقار", "دعم سريع", "إشعارات فورية", "تقارير أداء"];
          } else if (pid.includes("enterprise") || pid.includes("elite") || pname.includes("متميز")) {
            fallbackFeatures = ["عرض غير محدود", "دعم مميز 24/7", "إشعارات فورية", "تقارير متقدمة"];
          }

          // تطبيق تراكب الأدمن: إذا وجد plan.id في LS_PLANS نأخذ ميزاته كما هي (مفاتيح)
          const ov = overlay.find((p) => p.id === plan.id);
          const mergedFeatures =
            ov?.features && ov.features.length > 0
              ? ov.features
              : plan.features && plan.features.length > 0
              ? plan.features
              : fallbackFeatures;

          return {
            ...plan,
            features: mergedFeatures,
            popular: plan.popular || plan.id.toLowerCase().includes("pro"),
            recommended: plan.recommended || plan.id.toLowerCase().includes("enterprise")
          };
        });

        setPlans(enhancedPlans);
        setRecommendedPlanBasedOnUser(enhancedPlans, user);
      })
      .catch(() => {
        // في حال الفشل نظل نعرض ما يمكن عرضه بدون كسر الصفحة
        setPlans([]);
      });

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ain:features:change", onFeaturesChange);
      }
    };
  }, [user]);

  const setRecommendedPlanBasedOnUser = (plans: Plan[], user: any) => {
    if (!user) return;
    
    if (user?.userType === "agent") {
      setRecommendedPlan("enterprise");
    } else if ((user as any)?.propertiesCount > 5) {
      setRecommendedPlan("professional");
    } else {
      setRecommendedPlan("basic");
    }
  };

  // استماع لتحديثات الباقات من localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedPlans = readLS<Plan[]>(LS_PLANS, []);
      if (updatedPlans.length > 0) {
        setPlans(updatedPlans);
        setRecommendedPlanBasedOnUser(updatedPlans, user);
      }
    };

    const handlePlansUpdate = (event: any) => {
      if (event.detail) {
        setPlans(event.detail);
        setRecommendedPlanBasedOnUser(event.detail, user);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('plansUpdated', handlePlansUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('plansUpdated', handlePlansUpdate as EventListener);
    };
  }, [user]);

  const prices = useMemo(() => {
    const map: Record<string, { monthly: number; yearly: number }> = {};
    for (const p of plans) {
      map[p.id] = {
        monthly: p.priceOMR,
        yearly: annualPrice(p.priceOMR, p.annualDiscountPercent)
      };
    }
    return map;
  }, [plans]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const response = await fetch(`/api/coupons/validate?code=${coupon}`);
      const data = await response.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discountPercent);
        setCouponError("");
      } else {
        setCouponError("كود الخصم غير صالح أو منتهي الصلاحية");
        setCouponApplied(false);
      }
    } catch {
      setCouponError("حدث خطأ أثناء التحقق من الكوبون");
      setCouponApplied(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCoupon("");
    setCouponDiscount(0);
    setCouponError("");
  };

  const calculateFinalPrice = (plan: Plan) => {
    const basePrice =
      priceView === "monthly"
        ? prices[plan.id]?.monthly ?? plan.priceOMR
        : prices[plan.id]?.yearly ?? annualPrice(plan.priceOMR, plan.annualDiscountPercent);
    return couponApplied ? basePrice * (1 - couponDiscount / 100) : basePrice;
  };

  const { user: authUser } = useAuth();
  const router2 = useRouter();

  const buy = async (plan: Plan) => {
    const u = authUser || readLSUser();
    if (!u) {
      alert("سجّل الدخول أولًا");
      router2.push(`/login?return=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    setBusy(plan.id);
    try {
      const billingPeriod: Period = priceView === "yearly" ? "/yr" : "/mo";
      const finalPrice = calculateFinalPrice(plan);
      const r = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          billingPeriod,
          couponCode: coupon.trim() || undefined,
          finalPrice,
          payment: { method: payMethod, status: payMethod === "online" ? "paid" : "pending" }
        })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        alert(d?.error ? `فشل: ${d.error}` : "فشل الطلب");
        return;
      }
      alert(payMethod === "online" ? "تم تفعيل الاشتراك فورًا" : "تم إرسال الطلب للمراجعة");
      router2.replace(returnTo);
    } finally {
      setBusy(null);
    }
  };

  if (!mounted) {
    return (
      <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
        <Head><title>الاشتراكات</title></Head>
        <Header />
        <div className="container mx-auto px-4 py-10 flex-1" />
        <Footer />
      </main>
    );
  }

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head>
        <title>الاشتراكات - عين عمان</title>
        <meta name="description" content="اختر الباقة المناسبة لك واستمتع بمزايا حصرية على منصة عين عمان" />
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-10 flex-1">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">باقات العضوية المميزة</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اختر الباقة المناسبة لاحتياجاتك واستمتع بمزايا حصرية تساعدك في تحقيق أقصى استفادة من منصتنا
          </p>
        </div>

        {/* مفتاح التبديل بين الأسعار */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-md flex">
            <button
              onClick={() => setPriceView("monthly")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${priceView === "monthly" ? "bg-teal-600 text-white" : "text-gray-700"}`}
            >
              الدفع الشهري
            </button>
            <button
              onClick={() => setPriceView("yearly")}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center ${priceView === "yearly" ? "bg-teal-600 text-white" : "text-gray-700"}`}
            >
              الدفع السنوي
              <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full mr-2">موفر</span>
            </button>
          </div>
        </div>

        {/* نظام التوصية الذكي */}
        {user && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-10 border border-blue-200">
            <div className="flex items-center">
              <SparklesIcon className="w-10 h-10 text-blue-600 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">توصيتنا لك</h3>
                <p className="text-gray-600">
                  بناءً على {user?.userType === "agent" ? "نشاطك كوسيط عقاري" : "عدد عقاراتك"}, نوصي بباقة{" "}
                  {recommendedPlan === "enterprise" ? "المتميزة" : recommendedPlan === "professional" ? "المحترفة" : "الأساسية"} للحصول على أفضل النتائج.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* شبكة الباقات */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => {
            const isRecommended = plan.id.toLowerCase().includes(recommendedPlan);
            const finalPrice = calculateFinalPrice(plan);
            const monthlyEquivalent = priceView === "yearly" ? (finalPrice / 12).toFixed(3) : finalPrice;
            const yearlySaving = plan.annualDiscountPercent
              ? plan.priceOMR * 12 - annualPrice(plan.priceOMR, plan.annualDiscountPercent)
              : 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col h-full transition-all duration-300 
                  ${isRecommended ? "ring-4 ring-teal-500 ring-opacity-50" : "border border-gray-200"} 
                  ${plan.popular ? "bg-gradient-to-b from-white to-teal-50" : "bg-white"}
                  hover:shadow-lg`}
              >
                {/* شارة الباقة الموصى بها */}
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    موصى به لك
                  </div>
                )}

                {/* شارة الأكثر شيوعاً */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    الأكثر شيوعاً
                  </div>
                )}

                {/* رأس الباقة */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="flex justify-center items-center w-16 h-16 bg-teal-100 rounded-full text-teal-700">
                      {renderPlanIcon(plan.icon, plan.name)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2 text-sm">{plan.description}</p>
                </div>

                {/* السعر */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {typeof finalPrice === "number" ? finalPrice.toFixed(3) : Number(finalPrice).toFixed(3)}{" "}
                    <span className="text-lg font-medium">ر.ع</span>
                  </div>
                  <div className="text-gray-600 mt-2 text-sm">{priceView === "yearly" ? "سنوياً" : "شهرياً"}</div>

                  {priceView === "yearly" && yearlySaving > 0 && (
                    <div className="text-green-600 text-xs mt-2">توفير {yearlySaving.toFixed(3)} ر.ع سنوياً</div>
                  )}

                  {priceView === "yearly" && <div className="text-gray-500 text-xs mt-1">({monthlyEquivalent} ر.ع شهرياً)</div>}
                </div>

                {/* قائمة الميزات — تُعرض بالعناوين البشرية إن كانت مفاتيح */}
                <div className="mb-6 flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">الميزات المتضمنة:</h4>
                  <ul className="space-y-2">
                    {(plan.features || []).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-4 h-4 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{humanizeFeature(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* زر الاشتراك */}
                <button
                  disabled={busy === plan.id}
                  onClick={() => buy(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all text-sm
                    ${isRecommended || plan.popular ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                >
                  {busy === plan.id ? (
                    <span className="flex items-center justify-center">
                      <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                      جارٍ المعالجة...
                    </span>
                  ) : (
                    "اشترك الآن"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* قسم الكوبون وطريقة الدفع */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">خيارات الدفع والخصومات</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* حقل الكوبون */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كود الخصم</label>
              <div className="flex">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="أدخل كود الخصم"
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  disabled={couponApplied}
                />
                {couponApplied ? (
                  <button
                    onClick={removeCoupon}
                    className="bg-gray-500 text-white px-3 py-2 rounded-r-lg hover:bg-gray-600 flex items-center text-sm"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={applyCoupon}
                    className="bg-teal-600 text-white px-3 py-2 rounded-r-lg hover:bg-teal-700 disabled:bg-teal-300 text-sm"
                  >
                    تطبيق
                  </button>
                )}
              </div>
              {couponError && <p className="text-red-600 text-xs mt-2">{couponError}</p>}
              {couponApplied && <p className="text-green-600 text-xs mt-2">تم تطبيق خصم {couponDiscount}% بنجاح!</p>}
            </div>

            {/* طريقة الدفع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              >
                <option value="online">دفع إلكتروني</option>
                <option value="bank">تحويل بنكي</option>
                <option value="admin">اعتماد إداري</option>
              </select>
            </div>
          </div>

          {/* معلومات الدفع */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">معلومات مهمة:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• يمكنك الترقية إلى باقة أعلى في أي وقت مع خصم على المدة المتبقية</li>
              <li>• جميع الباقات تشمل ضمان استعادة الأموال خلال 14 يوم</li>
              <li>• للاستفسارات، يرجى التواصل مع دعم العملاء</li>
            </ul>
          </div>
        </div>

        {/* الأسئلة الشائعة */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">الأسئلة الشائعة</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">هل يمكنني تغيير باقتي لاحقاً؟</h4>
              <p className="text-gray-600 mt-1 text-sm">نعم، يمكنك الترقية إلى باقة أعلى في أي وقت مع خصم على المدة المتبقية من باقتك الحالية.</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 text-sm">كيف يمكنني إلغاء اشتراكي؟</h4>
              <p className="text-gray-600 mt-1 text-sm">يمكنك إلغاء اشتراكك في أي وقت من خلال صفحة إدارة الاشتراكات في لوحة التحكم، وسيستمر اشتراكك حتى نهاية الفترة المدفوعة.</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 text-sm">هل يوجد عقد ملزم لفترة معينة؟</h4>
              <p className="text-gray-600 mt-1 text-sm">لا يوجد عقد ملزم، يمكنك إلغاء اشتراكك في أي وقت دون رسوم إلغاء.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

(SubscriptionsPage as any).noChrome = true;
export default SubscriptionsPage;