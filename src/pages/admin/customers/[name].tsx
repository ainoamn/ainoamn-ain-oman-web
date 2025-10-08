// src/pages/admin/customers/[name].tsx - صفحة بيانات العميل
import Head from "next/head";
// Header and Footer handled by MainLayout in _app.tsx
import Link from "next/link";
import InstantLink from "@/components/InstantLink";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Customer = {
  name: string;
  phone: string;
  email?: string;
  bookings: any[];
  totalBookings: number;
  totalAmount: number;
  lastBooking?: string;
};

export default function CustomerDetailsPage() {
  const router = useRouter();
  const { name } = router.query;
  const customerName = Array.isArray(name) ? name[0] : name;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerName) return;

    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب جميع الحجوزات
        const response = await fetch("/api/bookings");
        if (!response.ok) throw new Error("فشل في جلب البيانات");

        const data = await response.json();
        const bookings = Array.isArray(data.items) ? data.items : [];

        // فلترة الحجوزات للعميل المحدد
        const customerBookings = bookings.filter((booking: any) => 
          booking.customerInfo?.name === customerName
        );

        if (customerBookings.length === 0) {
          setError("لا توجد حجوزات لهذا العميل");
          return;
        }

        // حساب الإحصائيات
        const totalAmount = customerBookings.reduce((sum: number, booking: any) => 
          sum + (booking.totalAmount || 0), 0
        );

        const lastBooking = customerBookings
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        const customerData: Customer = {
          name: customerName,
          phone: lastBooking?.customerInfo?.phone || "غير محدد",
          email: lastBooking?.customerInfo?.email || "غير محدد",
          bookings: customerBookings,
          totalBookings: customerBookings.length,
          totalAmount,
          lastBooking: lastBooking?.createdAt
        };

        setCustomer(customerData);
      } catch (err: any) {
        setError(err.message || "حدث خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerName]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', {
      calendar: 'gregory', // ✅ التقويم الميلادي
      numberingSystem: 'latn', // ✅ الأرقام اللاتينية
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-OM", {
      style: "currency",
      currency: "OMR",
      maximumFractionDigits: 3
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'leased': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'accounting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'reserved': return 'محجوز';
      case 'leased': return 'مؤجّر';
      case 'cancelled': return 'ملغى';
      case 'accounting': return 'محاسبي';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Head><title>بيانات العميل</title></Head>
        {/* Header and Footer handled by MainLayout */}
        <main className="container mx-auto p-4 flex-1">
          <div className="text-center py-8">جارٍ التحميل...</div>
        </main>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Head><title>بيانات العميل</title></Head>
        {/* Header and Footer handled by MainLayout */}
        <main className="container mx-auto p-4 flex-1">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error || "العميل غير موجود"}</div>
            <Link href="/admin/bookings" className="btn btn-outline">
              العودة إلى قائمة الحجوزات
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>بيانات العميل - {customer.name}</title></Head>
      {/* Header handled by MainLayout */}

      <main className="container mx-auto p-4 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">بيانات العميل</h1>
          <Link href="/admin/bookings" className="btn btn-outline">
            العودة إلى قائمة الحجوزات
          </Link>
        </div>

        {/* معلومات العميل الأساسية */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">الاسم</label>
              <p className="mt-1 text-lg">{customer.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
              <p className="mt-1 text-lg">{customer.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <p className="mt-1 text-lg">{customer.email}</p>
            </div>
          </div>
        </div>

        {/* إحصائيات العميل */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">إجمالي الحجوزات</h3>
            <p className="text-2xl font-bold text-blue-900">{customer.totalBookings}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">إجمالي المبالغ</h3>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(customer.totalAmount)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800">آخر حجز</h3>
            <p className="text-lg font-bold text-purple-900">
              {customer.lastBooking ? formatDate(customer.lastBooking) : "لا يوجد"}
            </p>
          </div>
        </div>

        {/* قائمة حجوزات العميل */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">حجوزات العميل</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">رقم الحجز</th>
                  <th className="p-3 text-left">العقار</th>
                  <th className="p-3 text-left">تاريخ الحجز</th>
                  <th className="p-3 text-left">المبلغ</th>
                  <th className="p-3 text-left">الحالة</th>
                  <th className="p-3 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {customer.bookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono">{booking.bookingNumber}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{booking.propertyTitle || "غير محدد"}</div>
                        <div className="text-xs text-gray-600">{booking.propertyReference || "غير محدد"}</div>
                      </div>
                    </td>
                    <td className="p-3">{formatDate(booking.createdAt)}</td>
                    <td className="p-3">{formatCurrency(booking.totalAmount || 0)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link 
                        href={`/admin/bookings/${encodeURIComponent(booking.id)}`}
                        className="btn btn-outline text-xs"
                      >
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer handled by MainLayout */}
    </div>
  );
}
