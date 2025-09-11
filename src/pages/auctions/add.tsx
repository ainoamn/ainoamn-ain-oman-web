// src/pages/auctions/add.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/context/ThemeContext";

// دالة المساعدة للجلسة
function getSession() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("ain_auth") : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return { role: "guest", plan: null, features: [] };
}

function hasFeature(feature: string, session: any) {
  return session.features?.includes(feature);
}

function SubscriptionBanner({ needFeature }: { needFeature?: string }) {
  const { t, dir } = useI18n();
  const session = getSession();
  const allowed = needFeature ? hasFeature(needFeature, session) : !!session.plan;

  if (allowed) return null;

  return (
    <div dir={dir} className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="text-sm">{t("subs.view.paywall")} — {t("subs.required")}</div>
      <Link
        href="/subscriptions?return=/auctions/add&need=CREATE_AUCTION"
        className="btn btn-primary text-sm"
      >
        {t("subs.upgrade")}
      </Link>
    </div>
  );
}

export default function AddAuctionPage() {
  const { t, dir } = useI18n();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const session = getSession();

  // التحقق من الصلاحية: إعادة توجيه مع return + need
  useEffect(() => {
    if (session.role === "guest" || !hasFeature("CREATE_AUCTION", session)) {
      router.push("/subscriptions?return=/auctions/add&need=CREATE_AUCTION");
    }
  }, [session, router]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    startDate: "",
    endDate: "",
    auctionType: "public",
    propertyType: "villa",
    features: [] as string[],
    images: [] as string[],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const propertyTypes = [
    { value: "villa", label: "فيلا" },
    { value: "apartment", label: "شقة" },
    { value: "land", label: "أرض" },
    { value: "commercial", label: "تجاري" },
  ];

  const availableFeatures = [
    "مسبح", "حديقة", "مواقف سيارات", "نظام أمن",
    "صالة رياضية", "إطلالة بحرية", "تشطيب فاخر",
    "مسبح داخلي", "جاكوزي", "ساونا", "مساحات خضراء",
    "غرفة سينما", "غرفة ضيوف", "شرفة", "تراس"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      if (prev.features.includes(feature)) {
        return {
          ...prev,
          features: prev.features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...prev.features, feature]
        };
      }
    });
  };

  const handleImageAdd = (url: string) => {
    if (url && !formData.images.includes(url)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      setImageUrls([...imageUrls, url]);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "العنوان مطلوب";
      if (!formData.description.trim()) newErrors.description = "الوصف مطلوب";
      if (!formData.location.trim()) newErrors.location = "الموقع مطلوب";
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = "السعر يجب أن يكون أكبر من صفر";
    }

    if (step === 2) {
      if (!formData.area || Number(formData.area) <= 0) newErrors.area = "المساحة مطلوبة";
      if (!formData.bedrooms || Number(formData.bedrooms) < 0) newErrors.bedrooms = "عدد الغرف غير صحيح";
      if (!formData.bathrooms || Number(formData.bathrooms) < 0) newErrors.bathrooms = "عدد الحمامات غير صحيح";
    }

    if (step === 3) {
      const now = new Date();
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (!formData.startDate) newErrors.startDate = "تاريخ البداية مطلوب";
      if (!formData.endDate) newErrors.endDate = "تاريخ النهاية مطلوب";
      if (formData.startDate && startDate <= now) newErrors.startDate = "يجب أن يكون تاريخ البداية في المستقبل";
      if (formData.startDate && formData.endDate && endDate <= startDate) newErrors.endDate = "يجب أن يكون تاريخ النهاية بعد تاريخ البداية";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // إرسال فعلي إلى API عند توفره
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("بيانات المزاد:", {
        ...formData,
        price: Number(formData.price),
        area: Number(formData.area),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        startTime: new Date(formData.startDate).getTime(),
        endTime: new Date(formData.endDate).getTime(),
      });

      alert("تم إضافة المزاد بنجاح وسيتم مراجعته من قبل الإدارة");
      router.push("/auctions");
    } catch (error) {
      console.error("فشل في إضافة المزاد:", error);
      alert("حدث خطأ أثناء إضافة المزاد. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session.role === "guest" || !hasFeature("CREATE_AUCTION", session)) {
    return (
      <main dir={dir} className={isDark ? "bg-gray-900 min-h-screen" : "bg-gray-50 min-h-screen"}>
        <Head><title>إضافة مزاد | Ain Oman</title></Head>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-6"></div>
            <p className={`text-xl ${isDark ? "text-white" : "text-gray-800"}`}>جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main dir={dir} className={isDark ? "bg-gray-900 min-h-screen py-8" : "bg-gray-50 min-h-screen py-8"}>
      <Head>
        <title>إضافة مزاد جديد | Ain Oman</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full mr-4 ${isDark ? "bg-gray-700 text-white" : "bg-white text-gray-700"} shadow-md`}
          >
            ←
          </button>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>إضافة مزاد جديد</h1>
        </div>

        {/* شريط التقدم */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">خطوة {currentStep} من 3</span>
            <span className="text-sm font-medium">{Math.round((currentStep / 3) * 100)}% مكتمل</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-teal-600 h-2.5 rounded-full"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`rounded-xl p-6 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
          {currentStep === 1 && (
            <div>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>المعلومات الأساسية</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>نوع العقار</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.propertyType ? "border-red-500" : ""}`}
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
                </div>

                <div>
                  <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>نوع المزاد</label>
                  <select
                    name="auctionType"
                    value={formData.auctionType}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.auctionType ? "border-red-500" : ""}`}
                  >
                    <option value="public">مزاد علني</option>
                    <option value="electronic">مزاد إلكتروني</option>
                  </select>
                  {errors.auctionType && <p className="text-red-500 text-sm mt-1">{errors.auctionType}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>عنوان العقار</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.title ? "border-red-500" : ""}`}
                  placeholder="أدخل عنوان العقار"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="mb-6">
                <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>وصف العقار</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.description ? "border-red-500" : ""}`}
                  placeholder="أدخل وصفاً مفصلاً للعقار"
                ></textarea>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="mb-6">
                <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>الموقع</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.location ? "border-red-500" : ""}`}
                  placeholder="أدخل موقع العقار"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div className="mb-6">
                <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>السعر الابتدائي (ر.ع)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.price ? "border-red-500" : ""}`}
                  placeholder="أدخل السعر الابتدائي"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>التفاصيل الفنية</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>المساحة (م²)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.area ? "border-red-500" : ""}`}
                    placeholder="المساحة بالمتر المربع"
                    min="0"
                  />
                  {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                </div>

                <div>
                  <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>عدد الغرف</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.bedrooms ? "border-red-500" : ""}`}
                    placeholder="عدد الغرف"
                    min="0"
                  />
                  {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
                </div>

                <div>
                  <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>عدد الحمامات</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.bathrooms ? "border-red-500" : ""}`}
                    placeholder="عدد الحمامات"
                    min="0"
                  />
                  {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>المميزات</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFeatures.map(feature => (
                    <div key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`feature-${feature}`}
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <label htmlFor={`feature-${feature}`} className="mr-2 text-sm font-medium">
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>إضافة صور (روابط)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="أدخل رابط الصورة"
                    className={`flex-1 p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleImageAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="أدخل رابط الصورة"]') as HTMLInputElement;
                      if (input && input.value) {
                        handleImageAdd(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    إضافة
                  </button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img src={image} alt={`عقار ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>مواعيد المزاد</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>تاريخ ووقت البداية</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.startDate ? "border-red-500" : ""}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className={`block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>تاريخ ووقت النهاية</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"} ${errors.endDate ? "border-red-500" : ""}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                <h3 className={`font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>ملخص المزاد</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className={isDark ? "text-gray-300" : "text-gray-600"}>العنوان:</div>
                  <div className={isDark ? "text-white" : "text-gray-800"}>{formData.title || "غير محدد"}</div>

                  <div className={isDark ? "text-gray-300" : "text-gray-600"}>السعر:</div>
                  <div className={isDark ? "text-white" : "text-gray-800"}>{formData.price ? `${formData.price} ر.ع` : "غير محدد"}</div>

                  <div className={isDark ? "text-gray-300" : "text-gray-600"}>المساحة:</div>
                  <div className={isDark ? "text-white" : "text-gray-800"}>{formData.area ? `${formData.area} م²` : "غير محدد"}</div>

                  <div className={isDark ? "text-gray-300" : "text-gray-600"}>الغرف:</div>
                  <div className={isDark ? "text-white" : "text-gray-800"}>{formData.bedrooms || "غير محدد"}</div>

                  <div className={isDark ? "text-gray-300" : "text-gray-600"}>مدة المزاد:</div>
                  <div className={isDark ? "text-white" : "text-gray-800"}>
                    {formData.startDate && formData.endDate
                      ? `${new Date(formData.startDate).toLocaleString('ar-OM')} - ${new Date(formData.endDate).toLocaleString('ar-OM')}`
                      : "غير محدد"
                    }
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                    required
                  />
                  <label htmlFor="terms" className="mr-2 text-sm font-medium">
                    أوافق على الشروط والأحكام وأتحمل المسؤولية الكاملة عن صحة المعلومات المقدمة
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                السابق
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
              >
                التالي
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {isSubmitting ? "جاري الإضافة..." : "إضافة المزاد"}
              </button>
            )}
          </div>
        </form>

        <div className={`mt-6 rounded-xl p-6 ${isDark ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600"} shadow-lg`}>
          <h3 className="font-bold mb-2">ملاحظات مهمة:</h3>
          <ul className="list-disc pr-5 space-y-2 text-sm">
            <li>سيتم مراجعة المزاد من قبل الإدارة قبل نشره</li>
            <li>تأكد من صحة جميع المعلومات المقدمة</li>
            <li>يجب أن تكون الصور حقيقية وواضحة للعقار</li>
            <li>سيتم خصم رسوم إدراج المزاد من رصيدك بعد الموافقة عليه</li>
          </ul>
        </div>
      </div>

      <Footer />
    </main>
  );
}
