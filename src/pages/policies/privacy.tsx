import Head from "next/head";
import InstantLink from "@/components/InstantLink";
    import { useI18n } from "@/lib/i18n";
import { FaShieldAlt, FaLock, FaUserShield, FaExclamationTriangle, FaHome } from "react-icons/fa";

export default function PrivacyPage() {
  const { dir } = useI18n();

  return (
    <main dir={dir} className="min-h-screen bg-gray-50 py-12 px-4">
      <Head>
        <title>سياسة الخصوصية | Ain Oman</title>
        <meta name="description" content="سياسة الخصوصية وحماية البيانات الشخصية في منصة Ain Oman" />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <FaShieldAlt className="text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">سياسة الخصوصية</h1>
              <p className="text-blue-100 text-lg">Privacy Policy</p>
            </div>
          </div>
          <p className="text-blue-100">
            آخر تحديث: 8 أكتوبر 2025
          </p>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-xl mb-8 shadow-sm">
          <div className="flex items-start gap-4">
            <FaLock className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">حماية خصوصيتك أولويتنا</h3>
              <p className="text-blue-800 text-sm">
                نحن في Ain Oman ملتزمون بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</span>
              المعلومات التي نجمعها
            </h2>
            <div className="pr-12 space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">1.1 المعلومات الشخصية</h3>
                <p className="mb-2">نقوم بجمع المعلومات التالية عند التسجيل أو استخدام الخدمات:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>المعلومات الأساسية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف</li>
                  <li><strong>معلومات الحساب:</strong> اسم المستخدم، كلمة المرور المشفرة</li>
                  <li><strong>المعلومات المالية:</strong> تفاصيل الدفع (مشفرة)</li>
                  <li><strong>معلومات التوثيق:</strong> نسخ من الوثائق الرسمية (إذا طلبت التوثيق)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">1.2 المعلومات التقنية</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>عنوان IP:</strong> لأغراض الأمان وتحليل الاستخدام</li>
                  <li><strong>نوع المتصفح والجهاز:</strong> لتحسين تجربة المستخدم</li>
                  <li><strong>موقع جغرافي تقريبي:</strong> لعرض عقارات قريبة منك</li>
                  <li><strong>Cookies:</strong> لتحسين الأداء وحفظ التفضيلات</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">1.3 معلومات الاستخدام</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>الصفحات التي تزورها</li>
                  <li>العقارات التي تبحث عنها</li>
                  <li>العقارات المفضلة</li>
                  <li>سجل المعاملات والحجوزات</li>
                  <li>التفاعلات مع المعلنين</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</span>
              كيفية استخدام المعلومات
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <FaUserShield className="text-xl" />
                    تقديم الخدمات
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• إنشاء وإدارة حسابك</li>
                    <li>• معالجة الحجوزات والمدفوعات</li>
                    <li>• التواصل معك</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-700 mb-2">تحسين الخدمات</h4>
                  <ul className="text-sm space-y-1">
                    <li>• تحليل أنماط الاستخدام</li>
                    <li>• تطوير ميزات جديدة</li>
                    <li>• تحسين تجربة المستخدم</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-700 mb-2">التسويق والإعلان</h4>
                  <ul className="text-sm space-y-1">
                    <li>• إرسال عروض مخصصة</li>
                    <li>• إشعارات بعقارات جديدة</li>
                    <li>• نشرات إخبارية</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-700 mb-2">الأمان والامتثال</h4>
                  <ul className="text-sm space-y-1">
                    <li>• منع الاحتيال</li>
                    <li>• حماية الأمن السيبراني</li>
                    <li>• الامتثال للقوانين</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</span>
              مشاركة المعلومات
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p className="font-semibold text-lg text-gray-900">نحن لا نبيع معلوماتك الشخصية مطلقاً.</p>
              <p>قد نشارك معلوماتك في الحالات التالية فقط:</p>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3 mt-6">3.1 مع مقدمي الخدمات</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>معالجات الدفع:</strong> لإتمام المعاملات المالية</li>
                  <li><strong>خدمات الاستضافة:</strong> لتخزين البيانات بشكل آمن</li>
                  <li><strong>خدمات البريد الإلكتروني:</strong> لإرسال الإشعارات</li>
                  <li><strong>خدمات التحليلات:</strong> لتحسين الأداء</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">* جميع مقدمي الخدمات ملزمون بحماية بياناتك</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3 mt-6">3.2 مع المعلنين والباحثين</h3>
                <p>عند حجز معاينة أو التواصل مع معلن، قد نشارك:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>اسمك</li>
                  <li>رقم هاتفك</li>
                  <li>بريدك الإلكتروني</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3 mt-6">3.3 الالتزامات القانونية</h3>
                <p>قد نشارك المعلومات إذا:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>طُلب ذلك بموجب أمر قضائي</li>
                  <li>كان ضرورياً للامتثال للقوانين</li>
                  <li>كان لحماية حقوقنا أو سلامة المستخدمين</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">4</span>
              أمان البيانات
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>نتخذ تدابير أمنية صارمة لحماية بياناتك:</p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mt-4 border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <FaLock className="text-xl" />
                  التدابير الأمنية المطبقة
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>تشفير SSL/TLS لجميع البيانات المنقولة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>تشفير كلمات المرور باستخدام bcrypt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>جدران نارية متقدمة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>مراقبة أمنية على مدار الساعة</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>نسخ احتياطي منتظم</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>التحقق الثنائي (2FA) متاح</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>فحص أمني دوري للأنظمة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>تحديثات أمنية منتظمة</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">5</span>
              حقوقك
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:</p>

              <div className="space-y-4 mt-4">
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <span className="text-2xl">👁️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">الحق في الوصول</h4>
                    <p className="text-sm mt-1">يمكنك طلب نسخة من جميع بياناتك الشخصية المخزنة لدينا</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <span className="text-2xl">✏️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">الحق في التصحيح</h4>
                    <p className="text-sm mt-1">يمكنك تحديث أو تصحيح معلوماتك غير الدقيقة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <span className="text-2xl">🗑️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">الحق في الحذف</h4>
                    <p className="text-sm mt-1">يمكنك طلب حذف بياناتك في ظروف معينة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <span className="text-2xl">🚫</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">الحق في الاعتراض</h4>
                    <p className="text-sm mt-1">يمكنك الاعتراض على استخدام بياناتك لأغراض تسويقية</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <span className="text-2xl">📤</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">الحق في نقل البيانات</h4>
                    <p className="text-sm mt-1">يمكنك طلب نقل بياناتك إلى خدمة أخرى</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <span className="text-2xl">⏸️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">الحق في تقييد المعالجة</h4>
                    <p className="text-sm mt-1">يمكنك طلب تقييد معالجة بياناتك في حالات معينة</p>
                  </div>
                </div>
              </div>

              <p className="mt-6 bg-blue-50 p-4 rounded-xl text-sm">
                <strong>ملاحظة:</strong> لممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر privacy@ainoman.om
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">6</span>
              Cookies وتقنيات التتبع
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>نستخدم Cookies لتحسين تجربتك على المنصة:</p>

              <div className="space-y-3 mt-4">
                <div className="border-r-4 border-green-500 bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-900">Cookies ضرورية</h4>
                  <p className="text-sm mt-1">مطلوبة لتشغيل الموقع (تسجيل الدخول، الأمان)</p>
                </div>

                <div className="border-r-4 border-blue-500 bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-900">Cookies وظيفية</h4>
                  <p className="text-sm mt-1">تحفظ تفضيلاتك (اللغة، الموقع الجغرافي)</p>
                </div>

                <div className="border-r-4 border-yellow-500 bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-900">Cookies تحليلية</h4>
                  <p className="text-sm mt-1">تساعدنا في فهم كيفية استخدام الموقع (Google Analytics)</p>
                </div>

                <div className="border-r-4 border-purple-500 bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-900">Cookies تسويقية</h4>
                  <p className="text-sm mt-1">لعرض إعلانات ذات صلة (يمكنك رفضها)</p>
                </div>
              </div>

              <p className="mt-4 text-sm">
                يمكنك التحكم في Cookies من خلال إعدادات المتصفح. لكن تعطيل بعضها قد يؤثر على وظائف الموقع.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">7</span>
              الاحتفاظ بالبيانات
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>نحتفظ ببياناتك الشخصية للمدة اللازمة لتحقيق الأغراض المذكورة، ما لم:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>تطلب حذفها</li>
                <li>تلغي حسابك</li>
                <li>تنتهي الحاجة لها</li>
              </ul>

              <div className="bg-gray-50 p-6 rounded-xl mt-4">
                <h4 className="font-semibold text-gray-900 mb-3">فترات الاحتفاظ</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>بيانات الحساب:</strong> طالما الحساب نشط + 3 سنوات بعد الإغلاق</li>
                  <li>• <strong>سجل المعاملات:</strong> 7 سنوات (للامتثال الضريبي)</li>
                  <li>• <strong>البيانات التسويقية:</strong> حتى تطلب إيقافها</li>
                  <li>• <strong>السجلات الأمنية:</strong> سنة واحدة</li>
        </ul>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">8</span>
              خصوصية الأطفال
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <div className="bg-red-50 border-2 border-red-300 p-6 rounded-xl">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-2xl text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">تحذير مهم</h4>
                    <p className="text-red-800">
                      منصتنا غير مخصصة للأشخاص دون سن 18 عاماً. لا نجمع معلومات من الأطفال عن قصد.
                      إذا اكتشفنا أن طفلاً قدم معلومات شخصية، سنحذفها فوراً.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">9</span>
              التحديثات على هذه السياسة
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنُعلمك بأي تغييرات جوهرية عبر:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>إشعار بارز على المنصة</li>
                <li>بريد إلكتروني إلى عنوانك المسجل</li>
                <li>تحديث تاريخ "آخر تحديث" أعلى الصفحة</li>
              </ul>
              <p className="mt-4 bg-yellow-50 p-4 rounded-xl text-sm">
                <strong>ننصحك</strong> بمراجعة سياسة الخصوصية بشكل دوري للبقاء على اطلاع بكيفية حماية معلوماتك.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">10</span>
              الاتصال بنا
            </h2>
            <div className="pr-12 space-y-4 text-gray-700">
              <p>إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، تواصل معنا:</p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mt-4 border-2 border-blue-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">قسم الخصوصية</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>البريد:</strong> <span className="text-blue-600">privacy@ainoman.om</span></p>
                      <p><strong>الهاتف:</strong> <span className="text-blue-600">+968 2XXX XXXX</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">مسؤول حماية البيانات</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>البريد:</strong> <span className="text-blue-600">dpo@ainoman.om</span></p>
                      <p><strong>العنوان:</strong> مسقط، سلطنة عُمان</p>
                    </div>
                  </div>
                </div>
              </div>
      </div>
    </section>

          {/* Commitment */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-6 mt-8">
            <div className="flex items-start gap-4">
              <FaShieldAlt className="text-3xl text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 text-lg mb-2">التزامنا تجاهك</h3>
                <p className="text-blue-800">
                  نحن ملتزمون بحماية خصوصيتك وأمان بياناتك. نستخدم أحدث التقنيات والممارسات لضمان سلامة معلوماتك الشخصية.
                  ثقتك هي أهم ما نملك، ونعمل جاهدين للحفاظ عليها.
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
            href="/policies/terms"
            className="inline-flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-blue-700 shadow-md transition-all"
          >
            الشروط والأحكام
          </InstantLink>
          <InstantLink
            href="/contact"
            className="inline-flex items-center gap-2 bg-purple-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-purple-700 shadow-md transition-all"
          >
            اتصل بنا
          </InstantLink>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2025 Ain Oman. جميع الحقوق محفوظة.</p>
          <p className="mt-2">نحن ملتزمون بحماية خصوصيتك وأمان بياناتك</p>
        </div>
          </div>
        </main>
      );
    }
