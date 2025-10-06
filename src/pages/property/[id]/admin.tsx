import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import {
  FaChartLine,
  FaTasks,
  FaFileInvoiceDollar,
  FaTools,
  FaBalanceScale,
  FaHandHoldingUsd,
  FaMoneyCheckAlt,
  FaBell,
  FaComments,
  FaBrain,
  FaChevronRight,
  FaCalendarAlt,
  FaHome,
  FaCog,
  FaUserShield,
  FaFileAlt,
  FaQrcode,
  FaBuilding,
  FaMapMarkerAlt,
  FaIdCard,
  FaClipboardList,
  FaUserCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaFileContract,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaShareAlt,
  FaPrint,
  FaDownload,
} from 'react-icons/fa';

type ListResponse<T> = { items: T[] };

type TaskItem = {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

type InvoiceItem = {
  id: string;
  serial?: string;
  propertyId: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'canceled';
  issuedAt?: string;
  dueAt?: string;
};

type RentalItem = {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  currency: string;
  state: string;
  createdAt: number;
  updatedAt: number;
};

type ReservationItem = {
  id: string;
  propertyId: string;
  status?: string;
  createdAt?: string | number;
};

type ReviewItem = {
  id: string;
  propertyId: string;
  rating: number;
  userName?: string;
  comment?: string;
  date?: string;
};

type KpiResponse = {
  ok?: boolean;
  items?: { id: string; title: string; value: number | string; trend?: number; unit?: string }[];
};

type AiValuation = {
  ok?: boolean;
  value?: number;
  pricePerSqm?: number;
  confidence?: number;
  notes?: string[];
};

type PropertyDetails = {
  id: string;
  referenceNo?: string;
  title?: { ar?: string; en?: string } | string;
  buildingNumber?: string;
  landNumber?: string;
  province?: string;
  state?: string;
  village?: string;
  address?: string;
  coordinates?: { lat?: number; lng?: number };
  ownerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  qrCode?: string;
};

const numberFmt = (n: number | string | undefined) => {
  const v = typeof n === 'string' ? parseFloat(n) : (n ?? 0);
  if (!isFinite(v)) return '0';
  return v.toLocaleString();
};

function SectionCard(props: { title: string; icon: React.ReactNode; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            {props.icon}
          </div>
          <h3 className="font-bold text-gray-900">{props.title}</h3>
        </div>
        {props.action}
      </div>
      <div className="p-4">{props.children}</div>
    </div>
  );
}

export default function PropertyAdminPage() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState('overview');

  const hdrs = { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [valuation, setValuation] = useState<AiValuation | null>(null);
  const [legalCases, setLegalCases] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const qs = `propertyId=${encodeURIComponent(String(id))}`;

        // جلب بيانات العقار الأساسية
        const propertyRes = await fetch(`/api/properties/${id}`);
        if (propertyRes.ok) {
          const propertyData = await propertyRes.json();
          setProperty(propertyData.item || propertyData);
        }

        const [
          tasksRes, invoicesRes, rentalsRes, reservationsRes, reviewsRes, 
          kpisRes, valRes, legalRes, contractsRes, requestsRes, 
          notificationsRes, calendarRes
        ] = await Promise.all([
          fetch(`/api/tasks?${qs}`),
          fetch(`/api/invoices?${qs}`),
          fetch(`/api/rentals?${qs}`),
          fetch(`/api/reservations?${qs}`),
          fetch(`/api/reviews?${qs}`),
          fetch(`/api/admin/kpis?${qs}`),
          fetch(`/api/ai/valuation?${qs}`),
          fetch(`/api/legal/cases?propertyId=${id}`, { headers: hdrs }),
          fetch(`/api/contracts?${qs}`),
          fetch(`/api/requests?${qs}`),
          fetch(`/api/notifications?${qs}`),
          fetch(`/api/calendar/events?${qs}`),
        ]);

        if (cancelled) return;

        const tasksJson: ListResponse<TaskItem> = await tasksRes.json();
        const invoicesJson: ListResponse<InvoiceItem> = await invoicesRes.json();
        const rentalsJson: { items: RentalItem[] } = await rentalsRes.json();
        const reservationsJson: { items: ReservationItem[] } = await reservationsRes.json();
        const reviewsJson: { items: ReviewItem[] } = await reviewsRes.json();
        const kpisJson: KpiResponse = await kpisRes.json();
        const valJson: AiValuation = await valRes.json();
        const legalJson = await legalRes.json();
        const contractsJson = await contractsRes.json();
        const requestsJson = await requestsRes.json();
        const notificationsJson = await notificationsRes.json();
        const calendarJson = await calendarRes.json();

        setTasks(Array.isArray(tasksJson.items) ? tasksJson.items : []);
        setInvoices(Array.isArray(invoicesJson.items) ? invoicesJson.items : []);
        setRentals(Array.isArray(rentalsJson.items) ? rentalsJson.items : []);
        setReservations(Array.isArray(reservationsJson.items) ? reservationsJson.items : []);
        setReviews(Array.isArray(reviewsJson.items) ? reviewsJson.items : []);
        setKpis(kpisJson || null);
        setValuation(valJson || null);
        setLegalCases(Array.isArray(legalJson) ? legalJson : []);
        setContracts(Array.isArray(contractsJson.items) ? contractsJson.items : []);
        setRequests(Array.isArray(requestsJson.items) ? requestsJson.items : []);
        setNotifications(Array.isArray(notificationsJson.items) ? notificationsJson.items : []);
        setCalendarEvents(Array.isArray(calendarJson.events) ? calendarJson.events : []);
      } catch (e: any) {
        setError(e?.message || 'Load error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const stats = useMemo(() => {
    const unpaid = invoices.filter(i => i.status === 'unpaid');
    const paid = invoices.filter(i => i.status === 'paid');
    const overdue = invoices.filter(i => i.status === 'unpaid' && i.dueAt && new Date(i.dueAt) < new Date());
    const openTasks = tasks.filter(t => (t.status || 'open') !== 'done' && (t.status || '') !== 'canceled');
    const maintenanceTasks = tasks.filter(t => (t.category || '').toLowerCase().includes('maintenance'));
    const legalTasks = tasks.filter(t => (t.category || '').toLowerCase().includes('legal'));
    const avgRating = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length) : 0;
    
    // Legal cases statistics
    const openLegalCases = legalCases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const closedLegalCases = legalCases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED');
    const urgentLegalCases = legalCases.filter(c => c.priority === 'URGENT' || c.priority === 'CRITICAL');
    const rentalDisputes = legalCases.filter(c => c.type === 'RENTAL_DISPUTE');
    
    return {
      invoices: { total: invoices.length, unpaid: unpaid.length, paid: paid.length, overdue: overdue.length },
      tasks: { total: tasks.length, open: openTasks.length, maintenance: maintenanceTasks.length, legal: legalTasks.length },
      rentals: { total: rentals.length },
      reservations: { total: reservations.length },
      reviews: { total: reviews.length, avgRating },
      legal: { 
        total: legalCases.length, 
        open: openLegalCases.length, 
        closed: closedLegalCases.length, 
        urgent: urgentLegalCases.length,
        rentalDisputes: rentalDisputes.length
      },
    };
  }, [invoices, tasks, rentals, reservations, reviews, legalCases]);

  const TABS: { id: string; label: string; icon: any }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: FaChartLine },
    { id: 'tasks', label: 'المهام', icon: FaTasks },
    { id: 'rentals', label: 'عقود الإيجار', icon: FaHandHoldingUsd },
    { id: 'invoices', label: 'الفواتير والمدفوعات', icon: FaFileInvoiceDollar },
    { id: 'maintenance', label: 'الصيانة', icon: FaTools },
    { id: 'legal', label: 'الشؤون القانونية', icon: FaBalanceScale },
    { id: 'contracts', label: 'العقود', icon: FaFileContract },
    { id: 'requests', label: 'الطلبات', icon: FaClipboardList },
    { id: 'calendar', label: 'التقويم', icon: FaCalendarAlt },
    { id: 'alerts', label: 'التنبيهات', icon: FaBell },
    { id: 'reviews', label: 'التقييمات', icon: FaComments },
    { id: 'ai', label: 'التنبؤات والذكاء', icon: FaBrain },
  ];

  const getPropertyTitle = () => {
    if (!property) return String(id);
    if (typeof property.title === 'string') return property.title;
    if (property.title?.ar) return property.title.ar;
    if (property.title?.en) return property.title.en;
    return property.referenceNo || String(id);
  };

  const getPropertyLocation = () => {
    if (!property) return '';
    const parts = [property.province, property.state, property.village].filter(Boolean);
    return parts.join(' - ');
  };

  return (
    <Layout>
      <Head>
        <title>إدارة العقار | {id}</title>
      </Head>

      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Link href="/" className="hover:underline flex items-center gap-1">
                  <FaHome /> الرئيسية
                </Link>
                <FaChevronRight className="opacity-60" />
                <Link href={`/properties/${id}`} className="hover:underline">العقار {String(id)}</Link>
                <FaChevronRight className="opacity-60" />
                <span className="font-semibold">إدارة العقار</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">لوحة تحكم إدارة العقار</h1>
              <p className="text-white/80">متابعة شاملة للمهام، العقود، الفواتير، الصيانة، القانونية، والتنبيهات مع تحليلات ذكية.</p>
              
              {/* معلومات العقار */}
              {property && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <FaIdCard />
                      <span>رقم العقار:</span>
                    </div>
                    <div className="font-semibold text-white">{property.referenceNo || String(id)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <FaBuilding />
                      <span>رقم المبنى:</span>
                    </div>
                    <div className="font-semibold text-white">{property.buildingNumber || 'غير محدد'}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <FaMapMarkerAlt />
                      <span>رقم الأرض:</span>
                    </div>
                    <div className="font-semibold text-white">{property.landNumber || 'غير محدد'}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <FaQrcode />
                      <span>الباركود:</span>
                    </div>
                    <button 
                      onClick={() => setShowQRCode(!showQRCode)}
                      className="font-semibold text-white hover:text-yellow-300 transition-colors"
                    >
                      {showQRCode ? 'إخفاء' : 'عرض'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* عنوان العقار والموقع */}
              {property && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                      <FaFileAlt />
                      <span>عنوان العقار:</span>
                    </div>
                    <div className="font-semibold text-white">{getPropertyTitle()}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                      <FaMapMarkerAlt />
                      <span>الموقع:</span>
                    </div>
                    <div className="font-semibold text-white">{getPropertyLocation() || 'غير محدد'}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/properties/${id}/edit`} className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <FaCog /> إعدادات العقار
              </Link>
              <Link href={`/properties/${id}`} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <FaFileAlt /> صفحة العرض
        </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <nav className="flex gap-2 overflow-x-auto px-4">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`py-3 px-3 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap min-w-fit ${active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
                >
                  <Icon className="text-sm" /> {t.label}
        </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-600">جاري تحميل البيانات...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">حدث خطأ: {error}</div>
        ) : (
          <div className="mt-6 space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KPIs */}
                <div className="lg:col-span-2 space-y-6">
                  <SectionCard title="المؤشرات الرئيسية" icon={<FaChartLine />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">فواتير غير مدفوعة</div>
                        <div className="text-2xl font-extrabold text-blue-700">{stats.invoices.unpaid}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">المهام المفتوحة</div>
                        <div className="text-2xl font-extrabold text-green-700">{stats.tasks.open}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">العقود</div>
                        <div className="text-2xl font-extrabold text-purple-700">{stats.rentals.total}</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">حجوزات</div>
                        <div className="text-2xl font-extrabold text-yellow-700">{stats.reservations.total}</div>
                      </div>
                      <div className="bg-rose-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">متأخرات</div>
                        <div className="text-2xl font-extrabold text-rose-700">{stats.invoices.overdue}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">متوسط التقييم</div>
                        <div className="text-2xl font-extrabold text-indigo-700">{stats.reviews.avgRating.toFixed(1)}</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">القضايا القانونية</div>
                        <div className="text-2xl font-extrabold text-red-700">{stats.legal.total}</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">قضايا عاجلة</div>
                        <div className="text-2xl font-extrabold text-orange-700">{stats.legal.urgent}</div>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">نزاعات إيجار</div>
                        <div className="text-2xl font-extrabold text-teal-700">{stats.legal.rentalDisputes}</div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="المهام الأخيرة" icon={<FaTasks />} action={<Link href={`/admin/tasks?propertyId=${id}`} className="text-blue-700 hover:underline">عرض كل المهام</Link>}>
                    {tasks.length === 0 ? (
                      <div className="text-gray-500">لا توجد مهام حاليا</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="py-2 text-right">العنوان</th>
                              <th className="py-2 text-right">الحالة</th>
                              <th className="py-2 text-right">الأولوية</th>
                              <th className="py-2 text-right">الفئة</th>
                              <th className="py-2 text-right">تحديث</th>
                              <th className="py-2 text-right">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tasks.slice(0, 6).map(t => (
                              <tr key={t.id} className="border-t">
                                <td className="py-2 font-medium text-gray-900">{t.title}</td>
                                <td className="py-2">{t.status || 'open'}</td>
                                <td className="py-2">{t.priority || '-'}</td>
                                <td className="py-2">{t.category || '-'}</td>
                                <td className="py-2 text-gray-500">{t.updatedAt || t.createdAt || '-'}</td>
                                <td className="py-2">
                                  <Link href={`/admin/tasks/${encodeURIComponent(t.id)}`} className="text-blue-600 hover:underline">فتح</Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="القضايا القانونية" icon={<FaBalanceScale />} action={<Link href={`/legal?propertyId=${id}`} className="text-blue-700 hover:underline">عرض كل القضايا</Link>}>
                    {legalCases.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-gray-500 mb-3">لا توجد قضايا قانونية</div>
                        <Link href={`/legal/new?propertyId=${id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <FaBalanceScale />
                          إضافة قضية جديدة
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {legalCases.slice(0, 5).map((case_: any) => (
                          <div key={case_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{case_.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  case_.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                  case_.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                  case_.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {case_.status === 'OPEN' ? 'مفتوحة' :
                                   case_.status === 'IN_PROGRESS' ? 'قيد العمل' :
                                   case_.status === 'CLOSED' ? 'مغلقة' : case_.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  case_.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                  case_.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                  case_.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {case_.priority === 'URGENT' ? 'عاجلة' :
                                   case_.priority === 'HIGH' ? 'عالية' :
                                   case_.priority === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {case_.type === 'RENTAL_DISPUTE' ? 'نزاع إيجار' : 
                                 case_.type === 'PAYMENT_DISPUTE' ? 'نزاع دفع' :
                                 case_.type === 'CONTRACT_BREACH' ? 'خرق عقد' :
                                 case_.type === 'PROPERTY_DAMAGE' ? 'تلف عقار' :
                                 case_.type === 'EVICTION' ? 'إخلاء' :
                                 case_.type === 'MAINTENANCE' ? 'صيانة' :
                                 case_.type === 'INSURANCE' ? 'تأمين' : 'أخرى'}
                                - {case_.stage}
                              </p>
                              {case_.aiInsights && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                                  <FaBrain />
                                  <span>تحليل ذكي متاح</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/legal/${case_.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                فتح
                              </Link>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t">
                          <Link href={`/legal/new?propertyId=${id}`} className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
                            <FaBalanceScale />
                            إضافة قضية جديدة
                          </Link>
                        </div>
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="الفواتير" icon={<FaFileInvoiceDollar />} action={<Link href={`/properties/${id}`} className="text-blue-700 hover:underline">عرض العقار</Link>}>
                    {invoices.length === 0 ? (
                      <div className="text-gray-500">لا توجد فواتير</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="py-2 text-right">الرقم</th>
                              <th className="py-2 text-right">الحالة</th>
                              <th className="py-2 text-right">القيمة</th>
                              <th className="py-2 text-right">تاريخ الإصدار</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.slice(0, 6).map(inv => (
                              <tr key={inv.id} className="border-t">
                                <td className="py-2 font-medium text-gray-900">{inv.serial || inv.id}</td>
                                <td className="py-2">{inv.status}</td>
                                <td className="py-2">{numberFmt(inv.amount)} ريال</td>
                                <td className="py-2 text-gray-500">{inv.issuedAt || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>
      </div>

                {/* AI + Shortcuts */}
                <div className="space-y-6">
                  <SectionCard title="تقييم السوق بالذكاء الاصطناعي" icon={<FaBrain />}>
                    {valuation && (valuation.value || valuation.pricePerSqm) ? (
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">القيمة التقديرية:</span><span className="font-bold text-blue-700">{numberFmt(valuation.value)} ريال</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">سعر المتر:</span><span className="font-bold text-green-700">{numberFmt(valuation.pricePerSqm)} ريال/م²</span></div>
                        {valuation.confidence !== undefined && (
                          <div className="text-sm text-gray-600">الثقة: {(valuation.confidence * 100).toFixed(0)}%</div>
                        )}
                        {Array.isArray(valuation.notes) && valuation.notes.length > 0 && (
                          <ul className="list-disc pr-5 text-sm text-gray-600">
                            {valuation.notes.map((n, i) => <li key={i}>{n}</li>)}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500">لا تتوفر بيانات كافية للتقييم الآن</div>
                    )}
                  </SectionCard>

                  <SectionCard title="اختصارات سريعة" icon={<FaCalendarAlt />}>
                    <div className="grid grid-cols-1 gap-2">
                      <Link href={`/properties/${id}/edit`} className="px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium flex items-center gap-2"><FaCog /> تعديل بيانات العقار</Link>
                      <Link href={`/properties/${id}`} className="px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium flex items-center gap-2"><FaFileAlt /> صفحة عرض العقار</Link>
                               <Link href={`/tasks/new?propertyId=${id}`} className="px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium flex items-center gap-2"><FaCalendarAlt /> إنشاء مهمة متابعة</Link>
                      <Link href={`/booking/new?propertyId=${id}`} className="px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-700 font-medium flex items-center gap-2"><FaHandHoldingUsd /> إنشاء حجز/عقد</Link>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <SectionCard title="إدارة المهام" icon={<FaTasks />}
                action={<Link href={`/properties/${id}`} className="text-blue-700 hover:underline">عودة للعقار</Link>}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-600">إجمالي: {tasks.length} • مفتوحة: {stats.tasks.open} • صيانة: {stats.tasks.maintenance} • قانونية: {stats.tasks.legal}</div>
                  <Link href={`/tasks/new?propertyId=${id}`} className="text-sm text-blue-700 hover:underline">إنشاء مهمة متابعة</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2 text-right">العنوان</th>
                        <th className="py-2 text-right">الحالة</th>
                        <th className="py-2 text-right">الفئة</th>
                        <th className="py-2 text-right">تحديث</th>
                        <th className="py-2 text-right">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(t => (
                        <tr key={t.id} className="border-t">
                          <td className="py-2 font-medium text-gray-900">{t.title}</td>
                          <td className="py-2">{t.status || 'open'}</td>
                          <td className="py-2">{t.category || '-'}</td>
                          <td className="py-2 text-gray-500">{t.updatedAt || t.createdAt || '-'}</td>
                          <td className="py-2">
                            <Link href={`/admin/tasks/${encodeURIComponent(t.id)}`} className="text-blue-600 hover:underline">فتح</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            {activeTab === 'rentals' && (
              <SectionCard title="عقود الإيجار والحجوزات" icon={<FaHandHoldingUsd />}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold mb-2">عقود الإيجار</div>
                    {rentals.length === 0 ? (
                      <div className="text-gray-500">لا توجد عقود</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="py-2 text-right">المستأجر</th>
                              <th className="py-2 text-right">القيمة</th>
                              <th className="py-2 text-right">الحالة</th>
                              <th className="py-2 text-right">تاريخ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rentals.map(r => (
                              <tr key={r.id} className="border-t">
                                <td className="py-2">{r.tenantId}</td>
                                <td className="py-2">{numberFmt(r.amount)} {r.currency}</td>
                                <td className="py-2">{r.state}</td>
                                <td className="py-2 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold mb-2">الحجوزات</div>
                    {reservations.length === 0 ? (
                      <div className="text-gray-500">لا توجد حجوزات</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="py-2 text-right">الرقم</th>
                              <th className="py-2 text-right">الحالة</th>
                              <th className="py-2 text-right">تاريخ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reservations.map(r => (
                              <tr key={r.id} className="border-t">
                                <td className="py-2">{r.id}</td>
                                <td className="py-2">{r.status || '-'}</td>
                                <td className="py-2 text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
      </div>
    </div>
              </SectionCard>
            )}

            {activeTab === 'invoices' && (
              <SectionCard title="الفواتير والمدفوعات" icon={<FaFileInvoiceDollar />}>
                {invoices.length === 0 ? (
                  <div className="text-gray-500">لا توجد فواتير</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-2 text-right">الرقم</th>
                          <th className="py-2 text-right">الحالة</th>
                          <th className="py-2 text-right">القيمة</th>
                          <th className="py-2 text-right">إصدار</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map(inv => (
                          <tr key={inv.id} className="border-t">
                            <td className="py-2 font-medium text-gray-900">{inv.serial || inv.id}</td>
                            <td className="py-2">{inv.status}</td>
                            <td className="py-2">{numberFmt(inv.amount)} ريال</td>
                            <td className="py-2 text-gray-500">{inv.issuedAt || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            )}

            {activeTab === 'maintenance' && (
              <SectionCard title="طلبات الصيانة" icon={<FaTools />}>
                {tasks.filter(t => (t.category || '').toLowerCase().includes('maintenance')).length === 0 ? (
                  <div className="text-gray-500">لا توجد مهام صيانة</div>
                ) : (
                  <ul className="space-y-2">
                    {tasks.filter(t => (t.category || '').toLowerCase().includes('maintenance')).map(t => (
                      <li key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{t.title}</div>
                        <div className="text-sm text-gray-600">{t.status || 'open'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-6">
                <SectionCard title="القضايا القانونية" icon={<FaBalanceScale />} action={<Link href={`/legal?propertyId=${id}`} className="text-blue-700 hover:underline">عرض جميع القضايا</Link>}>
                  {legalCases.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-4">لا توجد قضايا قانونية لهذا العقار</div>
                      <Link href={`/legal/new?propertyId=${id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <FaBalanceScale />
                        إضافة قضية جديدة
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {legalCases.map((case_: any) => (
                        <div key={case_.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2">{case_.title}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  case_.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                  case_.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                  case_.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {case_.status === 'OPEN' ? 'مفتوحة' :
                                   case_.status === 'IN_PROGRESS' ? 'قيد العمل' :
                                   case_.status === 'CLOSED' ? 'مغلقة' : case_.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  case_.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                  case_.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                  case_.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {case_.priority === 'URGENT' ? 'عاجلة' :
                                   case_.priority === 'HIGH' ? 'عالية' :
                                   case_.priority === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {case_.type === 'RENTAL_DISPUTE' ? 'نزاع إيجار' : 
                                   case_.type === 'PAYMENT_DISPUTE' ? 'نزاع دفع' :
                                   case_.type === 'CONTRACT_BREACH' ? 'خرق عقد' :
                                   case_.type === 'PROPERTY_DAMAGE' ? 'تلف عقار' :
                                   case_.type === 'EVICTION' ? 'إخلاء' :
                                   case_.type === 'MAINTENANCE' ? 'صيانة' :
                                   case_.type === 'INSURANCE' ? 'تأمين' : 'أخرى'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                المرحلة: {case_.stage} • تاريخ الإنشاء: {new Date(case_.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                              {case_.description && (
                                <p className="text-sm text-gray-700 mb-3">{case_.description}</p>
                              )}
                              {case_.aiInsights && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                                  <FaBrain />
                                  <span>تحليل ذكي متاح - احتمالية النجاح: {case_.aiInsights.successProbability}%</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/legal/${case_.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                فتح القضية
                              </Link>
                            </div>
                          </div>
                          {case_.propertyReference && (
                            <div className="border-t pt-3 mt-3">
                              <div className="text-sm text-gray-600">
                                <strong>العقار المرتبط:</strong> {case_.propertyReference.propertyTitle || case_.propertyReference.propertyId}
                                {case_.propertyReference.address && (
                                  <span className="ml-2">• {case_.propertyReference.address}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="إحصائيات القضايا" icon={<FaChartLine />}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{stats.legal.total}</div>
                      <div className="text-sm text-gray-600">إجمالي القضايا</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{stats.legal.open}</div>
                      <div className="text-sm text-gray-600">قضايا مفتوحة</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-700">{stats.legal.urgent}</div>
                      <div className="text-sm text-gray-600">قضايا عاجلة</div>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-teal-700">{stats.legal.rentalDisputes}</div>
                      <div className="text-sm text-gray-600">نزاعات إيجار</div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'alerts' && (
              <SectionCard title="التنبيهات" icon={<FaBell />}>
                <div className="text-gray-500">سيتم عرض تنبيهات الفواتير المستحقة والمهام المتأخرة هنا.</div>
              </SectionCard>
            )}

            {activeTab === 'reviews' && (
              <SectionCard title="التقييمات" icon={<FaComments />}>
                {reviews.length === 0 ? (
                  <div className="text-gray-500">لا توجد تقييمات</div>
                ) : (
      <ul className="space-y-2">
                    {reviews.map(r => (
                      <li key={r.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">{r.userName || 'مستخدم'}</div>
                          <div className="text-yellow-600 font-semibold">{r.rating} / 5</div>
                        </div>
                        {r.comment && <div className="text-sm text-gray-700 mt-1">{r.comment}</div>}
          </li>
        ))}
      </ul>
                )}
              </SectionCard>
            )}

            {activeTab === 'contracts' && (
              <SectionCard title="العقود" icon={<FaFileContract />} action={<Link href={`/contracts?propertyId=${id}`} className="text-blue-700 hover:underline">عرض جميع العقود</Link>}>
                {contracts.length === 0 ? (
                  <div className="text-gray-500">لا توجد عقود</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-2 text-right">رقم العقد</th>
                          <th className="py-2 text-right">النوع</th>
                          <th className="py-2 text-right">الحالة</th>
                          <th className="py-2 text-right">تاريخ الإنشاء</th>
                          <th className="py-2 text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map(contract => (
                          <tr key={contract.id} className="border-t">
                            <td className="py-2 font-medium text-gray-900">{contract.id}</td>
                            <td className="py-2">{contract.type || 'إيجار'}</td>
                            <td className="py-2">{contract.status || 'نشط'}</td>
                            <td className="py-2 text-gray-500">{contract.createdAt || '-'}</td>
                            <td className="py-2">
                              <Link href={`/contracts/${contract.id}`} className="text-blue-600 hover:underline">عرض</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            )}

            {activeTab === 'requests' && (
              <SectionCard title="الطلبات" icon={<FaClipboardList />} action={<Link href={`/manage-requests?propertyId=${id}`} className="text-blue-700 hover:underline">عرض جميع الطلبات</Link>}>
                {requests.length === 0 ? (
                  <div className="text-gray-500">لا توجد طلبات</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-2 text-right">رقم الطلب</th>
                          <th className="py-2 text-right">النوع</th>
                          <th className="py-2 text-right">العميل</th>
                          <th className="py-2 text-right">الحالة</th>
                          <th className="py-2 text-right">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(request => (
                          <tr key={request.id} className="border-t">
                            <td className="py-2 font-medium text-gray-900">{request.id}</td>
                            <td className="py-2">{request.type === 'viewing' ? 'معاينة' : 'حجز'}</td>
                            <td className="py-2">{request.name}</td>
                            <td className="py-2">{request.status}</td>
                            <td className="py-2 text-gray-500">{request.createdAt || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            )}

            {activeTab === 'calendar' && (
              <SectionCard title="التقويم والأحداث" icon={<FaCalendarAlt />} action={<Link href={`/calendar?propertyId=${id}`} className="text-blue-700 hover:underline">عرض التقويم الكامل</Link>}>
                {calendarEvents.length === 0 ? (
                  <div className="text-gray-500">لا توجد أحداث مجدولة</div>
                ) : (
                  <div className="space-y-3">
                    {calendarEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.type === 'booking' ? 'bg-blue-500' :
                            event.type === 'maintenance' ? 'bg-yellow-500' :
                            event.type === 'inspection' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-600">{event.description}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.startDate).toLocaleDateString('ar-OM')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {activeTab === 'ai' && (
              <SectionCard title="التنبؤات والذكاء الاصطناعي" icon={<FaBrain />}>
                {valuation ? (
                  <div className="space-y-2">
                    <div>القيمة المتوقعة: <span className="font-bold text-blue-700">{numberFmt(valuation.value)} ريال</span></div>
                    <div>سعر المتر المتوقع: <span className="font-bold text-green-700">{numberFmt(valuation.pricePerSqm)} ريال/م²</span></div>
                    {valuation.notes && valuation.notes.length > 0 && (
                      <ul className="list-disc pr-5 text-sm text-gray-600">
                        {valuation.notes.map((n, i) => <li key={i}>{n}</li>)}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">لا تتوفر بيانات كافية</div>
                )}
              </SectionCard>
            )}
          </div>
        )}
      </div>

      {/* نافذة الباركود */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">باركود العقار</h3>
              <button 
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <div className="text-6xl mb-2">📱</div>
                <div className="text-sm text-gray-600">باركود العقار</div>
                <div className="font-mono text-lg font-bold mt-2">{property?.referenceNo || String(id)}</div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                عند مسح هذا الباركود سيتم تحميل ملف PDF للعقار مع جميع التفاصيل
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  <FaDownload className="inline ml-2" />
                  تحميل PDF
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">
                  <FaShareAlt className="inline ml-2" />
                  مشاركة
                </button>
              </div>
            </div>
          </div>
    </div>
      )}
    </Layout>
  );
}
