import Head from "next/head";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import InstantLink from "@/components/InstantLink";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaHome } from 'react-icons/fa';

type Form = { name: string; email: string; phone: string; subject: string; message: string };

export default function ContactPage() {
  const { t, dir } = useI18n();
  const [form, setForm] = useState<Form>({ 
    name: "", 
    email: "", 
    phone: "",
    subject: "",
    message: "" 
  });
  const [sent, setSent] = useState<null | "ok" | "err">(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSent(null);
    
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(r.ok ? "ok" : "err");
      if (r.ok) {
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setTimeout(() => setSent(null), 5000);
      }
    } catch {
      setSent("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir={dir} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <Head>
        <title>تواصل معنا | Ain Oman</title>
        <meta name="description" content="تواصل مع فريق Ain Oman - نحن هنا لمساعدتك على مدار الساعة" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <FaEnvelope className="text-4xl" />
          </div>
          <h1 className="text-5xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            نحن هنا لمساعدتك! تواصل معنا في أي وقت وسنكون سعداء بالرد على استفساراتك
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">أرسل لنا رسالة</h2>
                <p className="text-gray-600">املأ النموذج أدناه وسنتواصل معك في أقرب وقت</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
            <input
              required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="أحمد محمد"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
            <input
              required
              type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف (اختياري)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+968 9XXX XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموضوع *
          </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="">اختر الموضوع</option>
                      <option value="general">استفسار عام</option>
                      <option value="property">عن العقارات</option>
                      <option value="booking">عن الحجوزات</option>
                      <option value="payment">عن الدفع</option>
                      <option value="technical">مشكلة تقنية</option>
                      <option value="complaint">شكوى</option>
                      <option value="suggestion">اقتراح</option>
                      <option value="partnership">شراكة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رسالتك *
                  </label>
            <textarea
              required
              rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Success/Error Messages */}
                {sent === "ok" && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-2xl text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">تم إرسال رسالتك بنجاح!</p>
                        <p className="text-sm text-green-700">سنتواصل معك في أقرب وقت ممكن</p>
                      </div>
                    </div>
                  </div>
                )}

                {sent === "err" && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4">
          <div className="flex items-center gap-3">
                      <FaExclamationCircle className="text-2xl text-red-600" />
                      <div>
                        <p className="font-semibold text-red-900">فشل إرسال الرسالة</p>
                        <p className="text-sm text-red-700">يرجى المحاولة مرة أخرى أو التواصل عبر الهاتف</p>
                      </div>
                    </div>
                  </div>
                )}

            <button
                  type="submit"
              disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      إرسال الرسالة
                    </>
                  )}
            </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">معلومات الاتصال</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">الهاتف</p>
                    <a href="tel:+96824000000" className="text-green-600 hover:text-green-700" dir="ltr">
                      +968 24 000 000
                    </a>
                    <p className="text-xs text-gray-600 mt-1">السبت - الخميس: 8 ص - 5 م</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaWhatsapp className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">واتساب</p>
                    <a href="https://wa.me/96890000000" className="text-blue-600 hover:text-blue-700" dir="ltr">
                      +968 90 000 000
                    </a>
                    <p className="text-xs text-gray-600 mt-1">متاح 24/7</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">البريد الإلكتروني</p>
                    <a href="mailto:info@ainoman.om" className="text-purple-600 hover:text-purple-700">
                      info@ainoman.om
                    </a>
                    <p className="text-xs text-gray-600 mt-1">سنرد خلال 24 ساعة</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">العنوان</p>
                    <p className="text-gray-700">
                      مسقط، سلطنة عُمان
                    </p>
                    <p className="text-xs text-gray-600 mt-1">الموقع الرئيسي</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <FaClock className="text-3xl" />
                <h3 className="text-2xl font-bold">ساعات العمل</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="font-medium">السبت - الخميس</span>
                  <span className="text-green-100">8:00 ص - 5:00 م</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="font-medium">الجمعة</span>
                  <span className="text-green-100">مغلق</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">الطوارئ</span>
                  <span className="text-green-100">24/7</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">تابعنا على</h3>
              <div className="flex gap-3 flex-wrap">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <FaFacebook className="text-xl" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-all shadow-md hover:shadow-lg"
                >
                  <FaTwitter className="text-xl" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all shadow-md"
                >
                  <FaInstagram className="text-xl" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-all shadow-md hover:shadow-lg"
                >
                  <FaLinkedin className="text-xl" />
                </a>
                <a
                  href="https://wa.me/96890000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
                >
                  <FaWhatsapp className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">موقعنا على الخريطة</h3>
            <p className="text-gray-600">قم بزيارتنا في مقرنا الرئيسي في مسقط</p>
          </div>
          <div className="h-96 bg-gray-200 relative">
            {/* Placeholder for Google Maps */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">خريطة الموقع</p>
                <p className="text-sm text-gray-500 mt-2">مسقط، سلطنة عُمان</p>
              </div>
            </div>
            {/* في الإنتاج: يمكن إضافة Google Maps هنا */}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap gap-4 justify-center">
            <InstantLink
              href="/"
              className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 shadow-md transition-all"
            >
              <FaHome />
              الصفحة الرئيسية
            </InstantLink>
            <InstantLink
              href="/policies/privacy"
              className="inline-flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-blue-700 shadow-md transition-all"
            >
              سياسة الخصوصية
            </InstantLink>
            <InstantLink
              href="/policies/terms"
              className="inline-flex items-center gap-2 bg-green-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-green-700 shadow-md transition-all"
            >
              الشروط والأحكام
            </InstantLink>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-8 text-center text-white">
        <p className="text-lg font-semibold mb-2">نحن هنا لمساعدتك</p>
        <p className="text-green-100">فريق Ain Oman متواجد دائماً للإجابة على استفساراتك</p>
      </div>
    </main>
  );
}
