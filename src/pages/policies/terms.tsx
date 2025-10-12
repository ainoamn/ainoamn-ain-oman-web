import Head from "next/head";
import InstantLink from "@/components/InstantLink";
import { useI18n } from "@/lib/i18n";
import { FaFileContract, FaCheckCircle, FaExclamationTriangle, FaHome } from "react-icons/fa";

export default function TermsPage() {
  const { dir } = useI18n();

  return (
    <main dir={dir} className="min-h-screen bg-gray-50 py-12 px-4">
      <Head>
        <title>الشروط والأحكام | Ain Oman</title>
        <meta name="description" content="الشروط والأحكام الخاصة باستخدام منصة Ain Oman للعقارات في سلطنة عُمان" />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <FaFileContract className="text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">الشروط والأحكام</h1>
              <p className="text-green-100 text-lg">Terms and Conditions</p>
            </div>
          </div>
          <p className="text-green-100">
            آخر تحديث: 8 أكتوبر 2025
          </p>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-xl mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <FaExclamationTriangle className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">مهم جداً</h3>
              <p className="text-blue-800 text-sm">
                يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة Ain Oman. باستخدامك للمنصة، فإنك توافق على الالتزام بجميع الشروط والأحكام المذكورة أدناه.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">1</span>
              التعريفات
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p><strong>"المنصة"</strong> تعني منصة Ain Oman الإلكترونية لإدارة العقارات والخدمات ذات الصلة.</p>
              <p><strong>"المستخدم"</strong> يشمل أي شخص طبيعي أو اعتباري يستخدم المنصة.</p>
              <p><strong>"العقار"</strong> يعني أي وحدة سكنية أو تجارية أو أرض معروضة على المنصة.</p>
              <p><strong>"المعلن"</strong> يعني الشخص أو الجهة التي تقوم بعرض العقارات على المنصة.</p>
              <p><strong>"الباحث"</strong> يعني الشخص الذي يبحث عن عقار للإيجار أو الشراء.</p>
              <p><strong>"الخدمات"</strong> تشمل جميع الخدمات المقدمة عبر المنصة.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">2</span>
              قبول الشروط
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>باستخدامك لمنصة Ain Oman، فإنك تقر وتوافق على:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>قراءة وفهم جميع الشروط والأحكام المذكورة هنا</li>
                <li>الالتزام بجميع القوانين واللوائح المعمول بها في سلطنة عُمان</li>
                <li>تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
                <li>الحفاظ على سرية بيانات حسابك</li>
                <li>عدم استخدام المنصة لأي أغراض غير قانونية</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">3</span>
              التسجيل والحساب
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <h3 className="font-semibold text-lg text-gray-900">3.1 إنشاء الحساب</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>يجب أن يكون عمرك 18 عاماً على الأقل لإنشاء حساب</li>
                <li>يجب تقديم معلومات صحيحة ودقيقة ومحدثة</li>
                <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك</li>
                <li>يحق لنا تعليق أو إلغاء حسابك في حالة انتهاك الشروط</li>
              </ul>

              <h3 className="font-semibold text-lg text-gray-900 mt-6">3.2 أنواع الحسابات</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-600 mb-2">حساب فردي</h4>
                  <p className="text-sm">للأفراد الباحثين عن عقارات للإيجار أو الشراء</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-600 mb-2">حساب معلن</h4>
                  <p className="text-sm">لمالكي العقارات والوسطاء العقاريين</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-600 mb-2">حساب شركة</h4>
                  <p className="text-sm">للشركات وإدارة العقارات المتعددة</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-600 mb-2">حساب مطور</h4>
                  <p className="text-sm">للمطورين العقاريين والمشاريع الكبرى</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">4</span>
              الخدمات المقدمة
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>تقدم منصة Ain Oman الخدمات التالية:</p>
              
              <h3 className="font-semibold text-lg text-gray-900 mt-6">4.1 خدمات الإعلان</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>نشر إعلانات العقارات (للبيع أو الإيجار)</li>
                <li>إدارة قوائم العقارات</li>
                <li>رفع صور ومقاطع فيديو للعقارات</li>
                <li>الجولات الافتراضية</li>
              </ul>

              <h3 className="font-semibold text-lg text-gray-900 mt-6">4.2 خدمات البحث</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>البحث عن العقارات بمعايير متعددة</li>
                <li>الفلترة المتقدمة حسب الموقع والسعر والمساحة</li>
                <li>حفظ عمليات البحث والإشعارات</li>
                <li>المقارنة بين العقارات</li>
              </ul>

              <h3 className="font-semibold text-lg text-gray-900 mt-6">4.3 خدمات الحجز والدفع</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>حجز المعاينات</li>
                <li>إدارة العقود الإلكترونية</li>
                <li>الدفع الإلكتروني الآمن</li>
                <li>تتبع المدفوعات والفواتير</li>
              </ul>

              <h3 className="font-semibold text-lg text-gray-900 mt-6">4.4 خدمات إضافية</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>نظام التقييمات والمراجعات</li>
                <li>الدردشة المباشرة</li>
                <li>تحليلات وإحصائيات السوق</li>
                <li>الذكاء الاصطناعي للتقييم العقاري</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">5</span>
              التزامات المستخدم
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>يلتزم المستخدم بما يلي:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>تقديم معلومات صحيحة وكاملة عن العقارات المعروضة</li>
                <li>عدم نشر محتوى مخالف للقوانين أو الآداب العامة</li>
                <li>احترام حقوق الملكية الفكرية</li>
                <li>عدم إساءة استخدام المنصة أو محاولة اختراقها</li>
                <li>عدم انتحال شخصيات أخرى</li>
                <li>الالتزام بمواعيد المعاينات والمقابلات</li>
                <li>دفع الرسوم المستحقة في موعدها</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">6</span>
              الرسوم والدفع
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <h3 className="font-semibold text-lg text-gray-900">6.1 خطط الاشتراك</h3>
              <p>تقدم المنصة عدة خطط اشتراك بأسعار مختلفة حسب الخدمات المطلوبة.</p>
              
              <h3 className="font-semibold text-lg text-gray-900 mt-6">6.2 طرق الدفع</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>البطاقات الائتمانية (Visa, Mastercard)</li>
                <li>البطاقات المدفوعة مسبقاً</li>
                <li>التحويل البنكي</li>
                <li>المحافظ الإلكترونية</li>
              </ul>

              <h3 className="font-semibold text-lg text-gray-900 mt-6">6.3 سياسة الاسترجاع</h3>
              <p>يحق للمستخدم طلب استرجاع المبالغ المدفوعة خلال 14 يوماً من تاريخ الدفع في حالة عدم استخدام الخدمة، مع مراعاة ما يلي:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>تقديم طلب الاسترجاع كتابياً</li>
                <li>عدم استخدام الخدمة بشكل فعلي</li>
                <li>يتم الاسترجاع خلال 7-14 يوم عمل</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">7</span>
              حقوق الملكية الفكرية
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>جميع الحقوق محفوظة لمنصة Ain Oman، بما في ذلك على سبيل المثال لا الحصر:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>تصميم الموقع والواجهات</li>
                <li>الشعار والعلامة التجارية</li>
                <li>المحتوى والنصوص</li>
                <li>البرمجيات والأكواد</li>
                <li>قواعد البيانات</li>
              </ul>
              <p className="mt-4">يحظر نسخ أو استخدام أو توزيع أي محتوى من المنصة دون إذن كتابي مسبق.</p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">8</span>
              حدود المسؤولية
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>منصة Ain Oman تعمل كوسيط بين المعلنين والباحثين، وبالتالي:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>لا نتحمل مسؤولية دقة المعلومات المقدمة من المعلنين</li>
                <li>لا نضمن إتمام الصفقات بين الأطراف</li>
                <li>لا نتحمل مسؤولية النزاعات الناشئة بين المستخدمين</li>
                <li>نوصي بالتحقق من جميع المعلومات قبل اتخاذ أي قرار</li>
                <li>ننصح بالاستعانة بمستشار قانوني عند الضرورة</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">9</span>
              إنهاء الخدمة
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>يحق لنا تعليق أو إنهاء حسابك في الحالات التالية:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>انتهاك أي من هذه الشروط والأحكام</li>
                <li>تقديم معلومات كاذبة أو مضللة</li>
                <li>إساءة استخدام المنصة</li>
                <li>عدم دفع الرسوم المستحقة</li>
                <li>السلوك غير اللائق تجاه المستخدمين الآخرين</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">10</span>
              القانون الحاكم
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>تخضع هذه الشروط والأحكام لقوانين سلطنة عُمان. أي نزاع ينشأ عن استخدام المنصة يتم حله وفقاً للإجراءات القانونية في عُمان.</p>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">11</span>
              التعديلات
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>البريد الإلكتروني المسجل</li>
                <li>إشعار على المنصة</li>
                <li>تحديث تاريخ "آخر تحديث" أعلى هذه الصفحة</li>
              </ul>
              <p className="mt-4">استمرارك في استخدام المنصة بعد التعديلات يعني قبولك للشروط المعدلة.</p>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">12</span>
              الاتصال بنا
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>للاستفسارات أو الشكاوى المتعلقة بهذه الشروط والأحكام، يمكنك التواصل معنا عبر:</p>
              <div className="bg-gray-50 p-6 rounded-xl mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">البريد الإلكتروني:</p>
                    <p className="text-green-600">legal@ainoman.om</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">الهاتف:</p>
                    <p className="text-green-600">+968 2XXX XXXX</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">العنوان:</p>
                    <p>مسقط، سلطنة عُمان</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">ساعات العمل:</p>
                    <p>الأحد - الخميس: 8:00 ص - 5:00 م</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptance */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mt-8">
            <div className="flex items-start gap-4">
              <FaCheckCircle className="text-3xl text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-green-900 text-lg mb-2">إقرار واعتراف</h3>
                <p className="text-green-800">
                  باستخدامك لمنصة Ain Oman، فإنك تقر بأنك قد قرأت وفهمت ووافقت على جميع الشروط والأحكام المذكورة أعلاه.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <InstantLink
            href="/"
            className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 shadow-md transition-all"
          >
            <FaHome />
            الصفحة الرئيسية
          </InstantLink>
          <InstantLink
            href="/policies/privacy"
            className="inline-flex items-center gap-2 bg-green-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-green-700 shadow-md transition-all"
          >
            سياسة الخصوصية
          </InstantLink>
          <InstantLink
            href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-blue-700 shadow-md transition-all"
          >
            اتصل بنا
          </InstantLink>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2025 Ain Oman. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </main>
  );
}
