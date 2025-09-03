import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

function Card({ title, href, children }: { title: string; href: string; children?: any }) {
  return (
    <Link href={href} className="block border rounded-2xl p-5 hover:shadow transition bg-white">
      <div className="text-lg font-semibold mb-1">{title}</div>
      <div className="text-slate-600 text-sm">{children}</div>
    </Link>
  );
}

export default function Dashboard() {
  const { dir } = useI18n();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
        <Head><title>لوحة التحكم</title></Head>
        <Header />
        <div className="container mx-auto px-4 py-10 flex-1">
          <div className="bg-white rounded-2xl p-8 shadow text-center">
            <div className="text-xl font-bold mb-2">يجب تسجيل الدخول</div>
            <Link href="/login" className="px-4 py-2 rounded bg-slate-800 text-white inline-block">الذهاب لصفحة الدخول</Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const r = user.role;

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>لوحة التحكم</title></Head>
      <Header />
      <div className="container mx-auto px-4 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-2xl font-bold">لوحتك</div>
            <div className="text-slate-600 text-sm">{user.name} — {r}</div>
          </div>
          <button onClick={logout} className="px-3 py-2 rounded border">خروج</button>
        </div>

        {/* شبكات الوحدات حسب الدور */}
        <div className="grid md:grid-cols-3 gap-6">
          {(r==="individual_tenant" || r==="corporate_tenant") && (
            <>
              <Card title="عقودي" href="/contracts">عرض وإدارة عقد الإيجار</Card>
              <Card title="فواتيري" href="/billing">دفع الفواتير والإيجارات</Card>
              <Card title="طلبات الصيانة" href="/maintenance">إرسال ومتابعة الصيانة</Card>
              {r==="corporate_tenant" && (
                <>
                  <Card title="مستخدمون فرعيون" href="/tenant/users">إدارة المستخدمين</Card>
                  <Card title="وحدات متعددة" href="/tenant/units">إدارة الوحدات</Card>
                </>
              )}
              <Card title="الاشتراكات" href="/subscriptions">باقات وخدمات</Card>
            </>
          )}

          {(r==="basic_individual_landlord" || r==="property_owner_individual_landlord" || r==="corporate_landlord") && (
            <>
              <Card title="عقاراتي" href="/landlord/properties">إدارة العقارات</Card>
              <Card title="العقود والمستأجرون" href="/landlord/contracts">العقود والمستأجرون</Card>
              <Card title="المدفوعات والعوائد" href="/landlord/finance">تتبّع المدفوعات</Card>
              <Card title="الصيانة" href="/landlord/maintenance">طلبات وتوجيه</Card>
              <Card title="تنبيهات" href="/landlord/notifications">الإشعارات</Card>
              <Card title="إعلانات ومزادات" href="/admin/ads">أنواع وإدارة</Card>
              {r==="corporate_landlord" && (
                <>
                  <Card title="موظفون وصلاحيات" href="/landlord/employees">تعيين موظفين</Card>
                  <Card title="تقارير وأداء" href="/reports">تقارير مالية</Card>
                </>
              )}
            </>
          )}

          {r==="individual_property_manager" && (
            <>
              <Card title="محفظة مُدارة" href="/manager/portfolio">إدارة عقارات عدة ملاك</Card>
              <Card title="إنشاء العقود" href="/manager/contracts">العقود والإيجارات</Card>
              <Card title="الصيانة" href="/manager/maintenance">الجدولة والمتابعة</Card>
              <Card title="التقارير" href="/reports">تقارير الأداء</Card>
            </>
          )}

          {r==="service_provider" && (
            <>
              <Card title="طلبات الأعمال" href="/service/orders">طلبات واردة</Card>
              <Card title="سجل المهام" href="/service/history">السجل</Card>
            </>
          )}

          {r==="admin_staff" && (
            <>
              <Card title="لوحة الإدارة" href="/admin/subscriptions">إدارة الاشتراكات</Card>
              <Card title="إعلانات" href="/admin/ads">إعلانات مدفوعة</Card>
              <Card title="أكواد خصم" href="/admin/coupons">خصومات</Card>
              <Card title="مهام" href="/tasks">لوحة المهام</Card>
            </>
          )}

          {r==="broker" && (
            <>
              <Card title="رفع عقار" href="/broker/listings">رفع وجدولة زيارات</Card>
              <Card title="عمولاتي" href="/broker/commissions">تتبّع الصفقات</Card>
            </>
          )}

          {r==="investor" && (
            <>
              <Card title="تقاريري" href="/reports">التقارير المالية والعوائد</Card>
            </>
          )}

          {r==="sub_user" && (
            <>
              <Card title="مهامي" href="/tasks">الوصول الممنوح</Card>
            </>
          )}

          {r==="super_admin" && (
            <>
              <Card title="إدارة كاملة" href="/admin/subscriptions">الاشتراكات</Card>
              <Card title="الإعلانات" href="/admin/ads">الإعلانات</Card>
              <Card title="الخصومات" href="/admin/coupons">الأكواد</Card>
              <Card title="المستخدمون" href="/admin/users/u-demo">مثال صفحة مستخدم</Card>
              <Card title="التقارير" href="/reports">التقارير</Card>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
