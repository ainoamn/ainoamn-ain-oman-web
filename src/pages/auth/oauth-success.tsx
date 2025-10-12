import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const { user } = router.query;
    
    if (user && typeof user === 'string') {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        
        // حفظ في localStorage
        localStorage.setItem("ain_auth", JSON.stringify(userData));
        localStorage.setItem("auth_token", JSON.stringify(userData));
        
        // إطلاق حدث للتحديث
        try {
          window.dispatchEvent(new CustomEvent("ain_auth:change"));
        } catch {}
        
        // الانتقال بعد ثانيتين
        setTimeout(() => {
          // قراءة return URL من localStorage
          const returnUrl = localStorage.getItem('oauth_return_url') || '/dashboard';
          localStorage.removeItem('oauth_return_url'); // تنظيف
          
          // إذا كان غير موثق، اذهب للتوثيق مع حفظ return URL
          if (!userData.isVerified) {
            router.replace(`/auth/verify?return=${encodeURIComponent(returnUrl)}`);
          } else {
            router.replace(returnUrl);
          }
        }, 2000);
        
      } catch (error) {
        console.error("Error processing OAuth data:", error);
        router.replace("/login?error=invalid_data");
      }
    } else if (!user) {
      // إذا لم يكن هناك بيانات، العودة للـ login
      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    }
  }, [router.query]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Head>
        <title>جاري تسجيل الدخول... | Ain Oman</title>
      </Head>

      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          {processing ? (
            <FaSpinner className="text-4xl text-white animate-spin" />
          ) : (
            <FaCheckCircle className="text-4xl text-white" />
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {processing ? "جاري تسجيل الدخول..." : "تم بنجاح!"}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {processing 
            ? "يرجى الانتظار بينما نقوم بإعداد حسابك"
            : "سيتم توجيهك إلى الداشبورد..."
          }
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </main>
  );
}

(OAuthSuccessPage as any).noChrome = true;

