import Head from "next/head";
import InstantLink from "@/components/InstantLink";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";
import { FaEnvelope, FaLock, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

function ForgotPasswordPage() {
  const { dir } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // إرسال كود إعادة التعيين
  async function sendResetCode() {
    if (!email) return alert("الرجاء إدخال البريد الإلكتروني");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/forgot-password/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل إرسال الكود");
      
      if (d?.demoCode) console.log("Reset Code:", d.demoCode);
      alert("تم إرسال كود إعادة التعيين إلى بريدك الإلكتروني");
      setStep("code");
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // التحقق من الكود
  async function verifyCode() {
    if (!code) return alert("الرجاء إدخال الكود");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/forgot-password/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "كود غير صحيح");
      
      setStep("reset");
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // إعادة تعيين كلمة المرور
  async function resetPassword() {
    if (!newPassword || !confirmPassword) {
      return alert("الرجاء إدخال كلمة المرور الجديدة وتأكيدها");
    }
    
    if (newPassword !== confirmPassword) {
      return alert("كلمة المرور وتأكيدها غير متطابقتين");
    }
    
    if (newPassword.length < 8) {
      return alert("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword })
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل إعادة تعيين كلمة المرور");
      
      alert("✅ تم إعادة تعيين كلمة المرور بنجاح!");
      router.replace("/login");
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir={dir} className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Head>
        <title>استرجاع كلمة المرور | Ain Oman</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-3xl" />
            </div>
            <h2 className="text-3xl font-bold mb-2">استرجاع كلمة المرور</h2>
            <p className="text-green-100">
              {step === "email" && "أدخل بريدك الإلكتروني لإرسال كود الاسترجاع"}
              {step === "code" && "أدخل الكود المرسل إلى بريدك"}
              {step === "reset" && "أدخل كلمة المرور الجديدة"}
            </p>
          </div>

          <div className="p-8">
            {/* Step 1: Email */}
            {step === "email" && (
              <div className="space-y-6">
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

                <button
                  onClick={sendResetCode}
                  disabled={busy || !email}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {busy ? "جاري الإرسال..." : "إرسال كود الاسترجاع"}
                </button>

                <div className="text-center">
                  <InstantLink
                    href="/login"
                    className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-2"
                  >
                    <FaArrowLeft />
                    العودة لتسجيل الدخول
                  </InstantLink>
                </div>
              </div>
            )}

            {/* Step 2: Code */}
            {step === "code" && (
              <div className="space-y-6">
                <div className="bg-green-50 rounded-xl p-4 text-sm text-gray-700 mb-6">
                  <p>
                    تم إرسال كود الاسترجاع إلى:{" "}
                    <span className="font-semibold text-green-700">{email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كود الاسترجاع
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-3xl tracking-widest font-mono"
                    dir="ltr"
                  />
                </div>

                <button
                  onClick={verifyCode}
                  disabled={busy || !code || code.length !== 6}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {busy ? "جاري التحقق..." : "تحقق من الكود"}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setStep("email")}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    لم يصلك الكود؟ إعادة إرسال
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
              <div className="space-y-6">
                <div className="bg-green-50 rounded-xl p-4 text-center mb-6">
                  <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">
                    تم التحقق بنجاح! الآن يمكنك تعيين كلمة مرور جديدة
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaLock className="inline-block ml-2" />
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يجب أن تكون 8 أحرف على الأقل
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaLock className="inline-block ml-2" />
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  onClick={resetPassword}
                  disabled={busy || !newPassword || !confirmPassword}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {busy ? "جاري الحفظ..." : "تعيين كلمة المرور"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            تذكرت كلمة المرور؟{" "}
            <InstantLink href="/login" className="text-green-600 hover:text-green-700 font-medium">
              سجل دخول الآن
            </InstantLink>
          </p>
        </div>
      </div>
    </main>
  );
}

(ForgotPasswordPage as any).noChrome = true;
export default ForgotPasswordPage;

