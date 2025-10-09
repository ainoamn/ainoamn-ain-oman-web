import Head from "next/head";
import InstantImage from '@/components/InstantImage';
import InstantLink from "@/components/InstantLink";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";
import { 
  FaEnvelope, FaPhone, FaCheckCircle, FaIdCard, FaCamera,
  FaShieldAlt, FaClock, FaExclamationTriangle
} from "react-icons/fa";

type VerificationMethod = "email" | "phone" | "document";

function VerifyPage() {
  const { dir } = useI18n();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activeMethod, setActiveMethod] = useState<VerificationMethod>("email");
  const [busy, setBusy] = useState(false);
  
  // Email Verification
  const [emailCode, setEmailCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  // Phone Verification
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  
  // Document Verification
  const [documentType, setDocumentType] = useState("national_id");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    const authData = localStorage.getItem("ain_auth");
    if (!authData) {
      router.replace("/login");
      return;
    }
    
    const userData = JSON.parse(authData);
    setUser(userData);

    // إذا كان موثق بالفعل، العودة للصفحة الأصلية أو الداشبورد
    if (userData.isVerified) {
      const returnUrl = (router.query.return as string) || '/dashboard';
      router.replace(returnUrl);
    }
  }, [router.query]);

  // إرسال كود التحقق عبر البريد
  async function sendEmailCode() {
    if (!user?.email) return alert("لا يوجد بريد إلكتروني مسجل");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, userId: user.id })
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل إرسال الكود");
      
      setEmailSent(true);
      if (d?.demoCode) console.log("Email Code:", d.demoCode);
      alert("تم إرسال كود التحقق إلى بريدك الإلكتروني");
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // التحقق من كود البريد
  async function verifyEmailCode() {
    if (!emailCode) return alert("الرجاء إدخال الكود");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: emailCode, userId: user.id })
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "كود غير صحيح");
      
      // تحديث بيانات المستخدم
      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem("ain_auth", JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent("ain_auth:change"));
      
      // العودة للصفحة الأصلية أو الداشبورد
      const returnUrl = (router.query.return as string) || '/dashboard';
      
      alert("✅ تم توثيق حسابك بنجاح!");
      router.replace(returnUrl);
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // إرسال كود التحقق عبر الهاتف
  async function sendPhoneCode() {
    if (!user?.phone) return alert("لا يوجد رقم هاتف مسجل");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone, userId: user.id })
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل إرسال الكود");
      
      setPhoneSent(true);
      if (d?.demoCode) console.log("Phone Code:", d.demoCode);
      alert("تم إرسال كود التحقق إلى هاتفك عبر واتساب");
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // التحقق من كود الهاتف
  async function verifyPhoneCode() {
    if (!phoneCode) return alert("الرجاء إدخال الكود");
    
    setBusy(true);
    try {
      const r = await fetch("/api/auth/verify/check-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: phoneCode, userId: user.id })
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "كود غير صحيح");
      
      // تحديث بيانات المستخدم
      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem("ain_auth", JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent("ain_auth:change"));
      
      // العودة للصفحة الأصلية أو الداشبورد
      const returnUrl = (router.query.return as string) || '/dashboard';
      
      alert("✅ تم توثيق حسابك بنجاح!");
      router.replace(returnUrl);
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // التعامل مع اختيار الملف
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      return alert("الرجاء اختيار صورة");
    }
    
    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return alert("حجم الملف يجب أن لا يتجاوز 5 ميجابايت");
    }
    
    setDocumentFile(file);
    
    // عرض معاينة
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // رفع المستند
  async function uploadDocument() {
    if (!documentNumber) return alert("الرجاء إدخال رقم الوثيقة");
    if (!documentFile) return alert("الرجاء اختيار صورة الوثيقة");
    
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("documentNumber", documentNumber);
      formData.append("file", documentFile);
      formData.append("userId", user.id);
      
      const r = await fetch("/api/auth/verify/upload-document", {
        method: "POST",
        body: formData
      });
      const d = await r.json();
      
      if (!r.ok) return alert(d?.error || "فشل رفع الوثيقة");
      
      alert("✅ تم رفع الوثيقة بنجاح! سيتم مراجعتها خلال 24 ساعة");
      
      // العودة للصفحة الأصلية أو الداشبورد
      const returnUrl = (router.query.return as string) || '/dashboard';
      router.replace(`${returnUrl}?verification=pending`);
    } catch (error) {
      alert("حدث خطأ: " + (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <main dir={dir} className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <Head>
        <title>توثيق الحساب | Ain Oman</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaShieldAlt className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">توثيق حسابك</h1>
          <p className="text-gray-600 text-lg">للحصول على الميزات الكاملة، يرجى توثيق حسابك</p>
        </div>

        {/* Alert */}
        <div className="bg-yellow-50 border-r-4 border-yellow-400 p-6 rounded-xl mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <FaExclamationTriangle className="text-2xl text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">حسابك غير موثق</h3>
              <p className="text-yellow-700 text-sm">
                يرجى توثيق حسابك للوصول إلى جميع الميزات والخدمات. اختر أي طريقة من الطرق التالية.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveMethod("email")}
              disabled={!user.email}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeMethod === "email"
                  ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <FaEnvelope className="inline-block ml-2" />
              البريد الإلكتروني
            </button>
            <button
              onClick={() => setActiveMethod("phone")}
              disabled={!user.phone}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeMethod === "phone"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <FaPhone className="inline-block ml-2" />
              رقم الهاتف
            </button>
            <button
              onClick={() => setActiveMethod("document")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeMethod === "document"
                  ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaIdCard className="inline-block ml-2" />
              الوثائق الرسمية
            </button>
          </div>

          <div className="p-8">
            {/* Email Verification */}
            {activeMethod === "email" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FaEnvelope className="text-2xl text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">التحقق عبر البريد الإلكتروني</h3>
                  </div>
                  <p className="text-gray-700">
                    سيتم إرسال كود تحقق مكون من 6 أرقام إلى بريدك الإلكتروني:{" "}
                    <span className="font-semibold text-green-700">{user.email}</span>
                  </p>
                </div>

                {!emailSent ? (
                  <button
                    onClick={sendEmailCode}
                    disabled={busy}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    <FaEnvelope className="inline-block ml-2" />
                    {busy ? "جاري الإرسال..." : "إرسال كود التحقق"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أدخل كود التحقق
                      </label>
                      <input
                        type="text"
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value)}
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-3xl tracking-widest font-mono"
                        dir="ltr"
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        <FaClock className="inline-block ml-1" />
                        تحقق من بريدك الإلكتروني (قد يستغرق دقيقة)
                      </p>
                    </div>

                    <button
                      onClick={verifyEmailCode}
                      disabled={busy || !emailCode || emailCode.length !== 6}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      <FaCheckCircle className="inline-block ml-2" />
                      {busy ? "جاري التحقق..." : "تأكيد التوثيق"}
                    </button>

                    <div className="text-center">
                      <button
                        onClick={() => setEmailSent(false)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        لم يصلك الكود؟ إعادة إرسال
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phone Verification */}
            {activeMethod === "phone" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FaPhone className="text-2xl text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">التحقق عبر رقم الهاتف</h3>
                  </div>
                  <p className="text-gray-700">
                    سيتم إرسال كود تحقق مكون من 6 أرقام إلى هاتفك:{" "}
                    <span className="font-semibold text-blue-700">{user.phone}</span>
                  </p>
                </div>

                {!phoneSent ? (
                  <button
                    onClick={sendPhoneCode}
                    disabled={busy}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    <FaPhone className="inline-block ml-2" />
                    {busy ? "جاري الإرسال..." : "إرسال كود التحقق عبر واتساب"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أدخل كود التحقق
                      </label>
                      <input
                        type="text"
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-3xl tracking-widest font-mono"
                        dir="ltr"
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        <FaClock className="inline-block ml-1" />
                        تم إرسال الكود عبر واتساب إلى {user.phone}
                      </p>
                    </div>

                    <button
                      onClick={verifyPhoneCode}
                      disabled={busy || !phoneCode || phoneCode.length !== 6}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      <FaCheckCircle className="inline-block ml-2" />
                      {busy ? "جاري التحقق..." : "تأكيد التوثيق"}
                    </button>

                    <div className="text-center">
                      <button
                        onClick={() => setPhoneSent(false)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        لم يصلك الكود؟ إعادة إرسال
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Document Verification */}
            {activeMethod === "document" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FaIdCard className="text-2xl text-purple-600" />
                    <h3 className="text-xl font-semibold text-gray-900">التحقق عبر الوثائق الرسمية</h3>
                  </div>
                  <p className="text-gray-700">
                    قم بتحميل صورة واضحة من وثيقتك الرسمية. سيتم مراجعتها خلال 24 ساعة.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الوثيقة
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="national_id">البطاقة الشخصية</option>
                    <option value="passport">جواز السفر</option>
                    <option value="residence">الإقامة</option>
                    <option value="driving_license">رخصة القيادة</option>
                    <option value="commercial_register">السجل التجاري</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الوثيقة
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="أدخل رقم الوثيقة"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الوثيقة
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      {documentPreview ? (
                        <div className="space-y-4">
                          <InstantImage src={documentPreview}
                            alt="معاينة"
                            className="max-h-64 mx-auto rounded-lg shadow-lg"
                           loading="lazy" width={400} height={300}/>
                          <button
                            type="button"
                            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                          >
                            تغيير الصورة
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FaCamera className="text-5xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium mb-1">اضغط لاختيار صورة</p>
                          <p className="text-sm text-gray-500">PNG, JPG حتى 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  onClick={uploadDocument}
                  disabled={busy || !documentNumber || !documentFile}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  <FaCheckCircle className="inline-block ml-2" />
                  {busy ? "جاري الرفع..." : "إرسال الوثيقة للمراجعة"}
                </button>

                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">💡 نصائح لصورة أفضل:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>تأكد من وضوح جميع التفاصيل في الصورة</li>
                    <li>تجنب الظلال والانعكاسات</li>
                    <li>التقط الصورة في مكان جيد الإضاءة</li>
                    <li>تأكد من ظهور الوثيقة كاملة في الصورة</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-600">
            هل تريد إتمام ذلك لاحقاً؟{" "}
            <InstantLink 
              href={(router.query.return as string) || "/dashboard"} 
              className="text-green-600 hover:text-green-700 font-medium"
            >
              {(router.query.return as string) ? "العودة للصفحة السابقة" : "الانتقال إلى الداشبورد"}
            </InstantLink>
          </p>
          <p className="text-sm text-gray-500">
            بعض الميزات قد تكون محدودة حتى يتم توثيق حسابك
          </p>
        </div>
      </div>
    </main>
  );
}

export default VerifyPage;

