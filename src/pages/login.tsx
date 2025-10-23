import Head from "next/head";
import InstantLink from "@/components/InstantLink";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";
import { 
  FaGoogle, FaFacebook, FaTwitter, FaLinkedin, FaApple,
  FaEnvelope, FaPhone, FaUser, FaLock, FaCheckCircle,
  FaShieldAlt, FaExclamationCircle
} from "react-icons/fa";

type AinAuth = { 
  id: string; 
  name: string; 
  email?: string;
  phone?: string;
  role: string; 
  isVerified?: boolean;
  permissions?: string[];
  features?: string[]; 
  subscription?: any;
  picture?: string;
};

function setSession(u: AinAuth) {
  localStorage.setItem("ain_auth", JSON.stringify(u));
  localStorage.setItem("auth_token", JSON.stringify(u));
  try { window.dispatchEvent(new CustomEvent("ain_auth:change")); } catch {}
}

function getReturn(router: ReturnType<typeof useRouter>) {
  const ret = (router.query.return as string) || "";
  return ret && ret.startsWith("/") ? ret : "/dashboard";
}

type LoginMethod = "email" | "phone" | "social";

function LoginPage() {
  const { dir, t } = useI18n();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<LoginMethod>("email");
  const [oauthError, setOauthError] = useState<string | null>(null);

  // التحقق من أخطاء OAuth في URL
  useEffect(() => {
    const { error } = router.query;
    if (error) {
      const errorMessages: Record<string, string> = {
        'invalid_provider': 'مزود الخدمة غير صحيح',
        'no_code': 'لم يتم استلام كود التحقق',
        'fetch_failed': 'فشل جلب البيانات من مزود الخدمة',
        'auth_failed': 'فشل تسجيل الدخول',
        'invalid_data': 'بيانات غير صحيحة'
      };
      setOauthError(errorMessages[error as string] || 'حدث خطأ غير متوقع');
      
      // إزالة الخطأ من URL
      const newUrl = router.pathname;
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [router.query]);
  
  // Email Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  
  // Phone Login
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  
  // Common
  const [busy, setBusy] = useState(false);

  // Email/Password Login
  async function handleEmailLogin() {
    if (!email || !password) return alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
    
    setBusy(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup 
        ? { email, password, name: name || email.split('@')[0] }
        : { email, password };

      const r = await fetch(endpoint, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل تسجيل الدخول");
      
      // استخدام البيانات من d.user (API response structure)
      const userData = d.user || d;
      
      setSession({ 
        id: userData.id || email, 
        name: userData.name || name || email.split('@')[0], 
        email: email,
        role: userData.role || "user",
        isVerified: userData.isVerified || false,
        permissions: userData.permissions || [],
        subscription: userData.subscription || null,
        picture: userData.picture,
        phone: userData.phone,
        features: userData.features || ["DASHBOARD_ACCESS"]
      });

      // العودة للصفحة الأصلية أو الداشبورد
      const returnUrl = getReturn(router);
      
      // إذا لم يكن موثق، اذهب إلى صفحة التوثيق مع حفظ return URL
      if (!d.isVerified) {
        router.replace(`/auth/verify?return=${encodeURIComponent(returnUrl)}`);
      } else {
        router.replace(returnUrl);
      }
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Phone OTP Login
  async function sendOtp() {
    if (!phone) return alert("الرجاء إدخال رقم الهاتف");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/request-otp", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ phone }) 
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل إرسال الكود");
      
      setOtpSent(true);
      if (d?.demoCode) console.log("OTP:", d.demoCode);
      alert("تم إرسال الكود عبر واتساب");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    if (!code) return alert("الرجاء إدخال الكود");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify-otp", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ phone, code, name: name || phone }) 
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل التحقق");
      
      // استخدام البيانات من d.user (API response structure)
      const userData = d.user || d;
      
      setSession({ 
        id: userData.id || phone, 
        name: userData.name || name || phone, 
        phone: phone,
        role: userData.role || "user",
        isVerified: userData.isVerified || false,
        permissions: userData.permissions || [],
        subscription: userData.subscription || null,
        picture: userData.picture,
        features: userData.features || ["DASHBOARD_ACCESS"]
      });

      // العودة للصفحة الأصلية
      const returnUrl = getReturn(router);
      
      // إذا لم يكن موثق، اذهب إلى صفحة التوثيق مع حفظ return URL
      if (!d.isVerified) {
        router.replace(`/auth/verify?return=${encodeURIComponent(returnUrl)}`);
      } else {
        router.replace(returnUrl);
      }
    } finally {
      setBusy(false);
    }
  }

  // Social Login - OAuth Flow
  function handleSocialLogin(provider: string) {
    setBusy(true);
    // حفظ return URL في localStorage قبل OAuth redirect
    const returnUrl = getReturn(router);
    localStorage.setItem('oauth_return_url', returnUrl);
    
    // إعادة توجيه إلى OAuth authorization endpoint
    const authUrl = `/api/auth/oauth/${provider}/authorize`;
    window.location.href = authUrl;
  }

  return (
    <main dir={dir} className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Head>
        <title>تسجيل الدخول | Ain Oman</title>
      </Head>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <FaShieldAlt className="text-4xl text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-4">Ain Oman</h1>
              <p className="text-xl text-green-100">منصة العقارات الذكية</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">أمان عالي المستوى</h3>
                  <p className="text-green-100 text-sm">حماية متقدمة لبياناتك وخصوصيتك</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">سهولة في الاستخدام</h3>
                  <p className="text-green-100 text-sm">واجهة بسيطة وسريعة</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">دعم متعدد الطرق</h3>
                  <p className="text-green-100 text-sm">سجل دخول بالطريقة التي تناسبك</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">مرحباً بك</h2>
            <p className="text-green-100">سجل دخول للوصول إلى حسابك</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "email"
                  ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaEnvelope className="inline-block ml-2" />
              البريد الإلكتروني
            </button>
            <button
              onClick={() => setActiveTab("phone")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "phone"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaPhone className="inline-block ml-2" />
              رقم الهاتف
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "social"
                  ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaGoogle className="inline-block ml-2" />
              وسائل التواصل
            </button>
          </div>

          <div className="p-8">
            {/* OAuth Error Alert */}
            {oauthError && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaExclamationCircle className="text-2xl text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">فشل تسجيل الدخول</p>
                    <p className="text-sm text-red-700">{oauthError}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOauthError(null)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  إغلاق
                </button>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline-block ml-2" />
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@ainoman.om"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaLock className="inline-block ml-2" />
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline-block ml-2" />
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أحمد محمد"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                <button
                  onClick={handleEmailLogin}
                  disabled={busy || !email || !password}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {busy ? "جاري التحميل..." : isSignup ? "إنشاء حساب" : "تسجيل الدخول"}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    {isSignup ? "لديك حساب؟ سجل دخول" : "ليس لديك حساب؟ سجل الآن"}
                  </button>
                </div>

                <div className="text-center">
                  <InstantLink
                    href="/auth/forgot-password"
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    نسيت كلمة المرور؟
                  </InstantLink>
                </div>
              </div>
            )}

            {/* Phone Tab */}
            {activeTab === "phone" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline-block ml-2" />
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+968 9XXX XXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    dir="ltr"
                  />
                </div>

            {!otpSent ? (
                  <button
                    onClick={sendOtp}
                    disabled={busy || !phone}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {busy ? "جاري الإرسال..." : "إرسال كود التحقق"}
                  </button>
            ) : (
              <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كود التحقق
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                        dir="ltr"
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        تم إرسال الكود إلى {phone} عبر واتساب
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaUser className="inline-block ml-2" />
                        الاسم (اختياري)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أحمد محمد"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <button
                      onClick={verifyOtp}
                      disabled={busy || !code}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {busy ? "جاري التحقق..." : "تحقق من الكود"}
                    </button>

                    <div className="text-center">
                      <button
                        onClick={() => setOtpSent(false)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        إعادة إرسال الكود
                      </button>
                </div>
              </>
            )}
              </div>
            )}

            {/* Social Tab */}
            {activeTab === "social" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-center text-sm text-blue-800">
                    <strong>وضع التطوير:</strong> الأزرار أدناه تحاكي OAuth flow.
                    في الإنتاج، سيتم توجيهك إلى صفحة تسجيل الدخول الحقيقية لكل منصة.
                  </p>
          </div>

                <p className="text-center text-sm text-gray-600 mb-6">
                  اختر طريقة تسجيل الدخول المفضلة لديك
                </p>

            <div className="space-y-3">
                  <button
                    onClick={() => handleSocialLogin("google")}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-3 px-6 rounded-xl font-semibold hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaGoogle className="text-xl" />
                    تسجيل الدخول عبر Google
                  </button>

                  <button
                    onClick={() => handleSocialLogin("facebook")}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-3 px-6 rounded-xl font-semibold hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaFacebook className="text-xl" />
                    تسجيل الدخول عبر Facebook
                  </button>

                  <button
                    onClick={() => handleSocialLogin("twitter")}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-3 px-6 rounded-xl font-semibold hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaTwitter className="text-xl" />
                    تسجيل الدخول عبر Twitter
                  </button>

                  <button
                    onClick={() => handleSocialLogin("linkedin")}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-3 px-6 rounded-xl font-semibold hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaLinkedin className="text-xl" />
                    تسجيل الدخول عبر LinkedIn
                  </button>

                  <button
                    onClick={() => handleSocialLogin("apple")}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaApple className="text-xl" />
                    تسجيل الدخول عبر Apple
                  </button>
              </div>
            </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
              <p>
                بتسجيل الدخول، أنت توافق على{" "}
                <InstantLink href="/policies/terms" className="text-green-600 hover:text-green-700 font-medium">
                  الشروط والأحكام
                </InstantLink>{" "}
                و{" "}
                <InstantLink href="/policies/privacy" className="text-green-600 hover:text-green-700 font-medium">
                  سياسة الخصوصية
                </InstantLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

(LoginPage as any).noChrome = true;
export default LoginPage;
