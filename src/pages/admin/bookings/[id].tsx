// src/pages/admin/bookings/[id].tsx
// صفحة تفاصيل الحجز - تصميم حديث ومتكامل ⚡

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import InstantImage from '@/components/InstantImage';
import { useBooking } from '@/context/BookingsContext';
import { toSafeText } from '@/components/SafeText';
import { FaArrowRight, FaHome, FaUser, FaPhone, FaEnvelope, FaIdCard, FaCalendar, FaClock, FaMoneyBillWave, FaFileContract, FaMapMarkerAlt, FaBuilding, FaRuler, FaBed, FaBath, FaCheck, FaTimes, FaPrint, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaFileAlt, FaDollarSign, FaCreditCard, FaReceipt, FaChartLine, FaHistory, FaImage, FaDownload } from 'react-icons/fa';

interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: any;
  propertyReference?: string;
  unitId?: string;
  buildingId?: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  durationMonths?: number;
  totalAmount?: number;
  totalRent?: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  contractSigned?: boolean;
  customerInfo?: any;
  tenant?: any;
  ownerDecision?: any;
  paymentMethod?: string;
  paidAt?: string;
  deposit?: number;
  depositPaid?: boolean;
  cheque?: any;
  cheques?: any[];
  guaranteeCheques?: any[];
  municipalityFee3pct?: number;
  meters?: any;
  notes?: string;
}

interface Property {
  id: string;
  title?: any;
  description?: any;
  referenceNo?: string;
  images?: string[];
  coverImage?: string;
  coverIndex?: number;
  priceOMR?: number;
  province?: string;
  state?: string;
  village?: string;
  neighborhood?: string;
  street?: string;
  buildingNo?: string;
  type?: any;
  purpose?: string;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnished?: boolean;
  amenities?: string[];
  features?: any;
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  [key: string]: any;
}

export default function AdminBookingDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const bid = String(id || '');
  
  const { booking: contextBooking, updateBooking } = useBooking(bid);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!bid) return;
    loadData();
  }, [bid, contextBooking]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب الحجز
      let bookingData: Booking | null = null;
      if (contextBooking) {
        bookingData = contextBooking as any;
      } else {
        const res = await fetch(`/api/bookings/${bid}`);
        if (res.ok) {
          const data = await res.json();
          bookingData = data.item || data;
        }
      }

      if (!bookingData) {
        setError('الحجز غير موجود');
        return;
      }

      setBooking(bookingData);

      // جلب بيانات العقار
      if (bookingData.propertyId) {
        const propRes = await fetch(`/api/properties/${bookingData.propertyId}`);
        if (propRes.ok) {
          const propData = await propRes.json();
          setProperty(propData.item || propData);
        }
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!booking) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'reserved',
          ownerDecision: {
            approved: true,
            decidedAt: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBooking(data.item || data);
        updateBooking(booking.id, data.item || data);
        alert('تم قبول الحجز بنجاح');
      }
    } catch (err) {
      alert('فشل في تحديث الحجز');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!booking) return;
    
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'cancelled',
          ownerDecision: {
            approved: false,
            reason,
            decidedAt: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBooking(data.item || data);
        updateBooking(booking.id, data.item || data);
        alert('تم رفض الحجز');
      }
    } catch (err) {
      alert('فشل في تحديث الحجز');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'leased': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'قيد المراجعة',
      reserved: 'محجوز',
      paid: 'تم الدفع',
      leased: 'مؤجّر',
      cancelled: 'ملغى',
      accounting: 'محاسبي',
      management: 'إداري'
    };
    return labels[status] || status;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar', {
      calendar: 'gregory', // ✅ التقويم الميلادي
      numberingSystem: 'latn', // ✅ الأرقام اللاتينية
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ</h2>
          <p className="text-gray-600 mb-6">{error || 'الحجز غير موجود'}</p>
          <InstantLink
            href="/admin/bookings"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            العودة إلى الحجوزات
          </InstantLink>
        </div>
      </div>
    );
  }

  const tenant = booking.tenant || booking.customerInfo || {};
  const totalAmount = booking.totalAmount || booking.totalRent || 0;
  const duration = booking.durationMonths || booking.duration || 0;
  const propertyTitle = toSafeText(property?.title || booking.propertyTitle, 'ar', 'عقار غير محدد');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8" dir="rtl">
      <Head>
        <title>تفاصيل الحجز {booking.bookingNumber} | Ain Oman</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <InstantLink
            href="/admin/bookings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowRight />
            <span>العودة إلى الحجوزات</span>
          </InstantLink>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  حجز رقم: {booking.bookingNumber}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <FaClock />
                    {formatDate(booking.createdAt)}
                  </span>
                  {booking.updatedAt && (
                    <span className="flex items-center gap-2">
                      <FaHistory />
                      آخر تحديث: {formatDate(booking.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className={`px-6 py-3 rounded-xl border-2 font-bold text-lg ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </div>
            </div>

            {/* Quick Actions */}
            {booking.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FaCheckCircle />
                  قبول الحجز
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <FaTimesCircle />
                  رفض الحجز
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaPrint />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'details', label: 'التفاصيل', icon: FaInfoCircle },
              { id: 'property', label: 'العقار', icon: FaHome },
              { id: 'tenant', label: 'المستأجر', icon: FaUser },
              { id: 'payment', label: 'الدفع', icon: FaDollarSign },
              { id: 'documents', label: 'المستندات', icon: FaFileAlt }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* التفاصيل */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaInfoCircle className="text-green-600" />
                  تفاصيل الحجز
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">رقم الحجز</label>
                      <p className="text-lg font-bold text-gray-900">{booking.bookingNumber}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">تاريخ البدء</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaCalendar className="text-green-600" />
                        {formatDate(booking.startDate)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">تاريخ الانتهاء</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaCalendar className="text-red-600" />
                        {booking.endDate ? formatDate(booking.endDate) : 'غير محدد'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">المدة</label>
                      <p className="text-lg font-bold text-green-600">{duration} شهر</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">المبلغ الإجمالي</label>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">الإيجار الشهري</label>
                      <p className="text-lg text-gray-900">{formatCurrency(totalAmount / duration)}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">التأمين</label>
                      <p className="text-lg text-gray-900">{formatCurrency(booking.deposit || 0)}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">رسوم البلدية (3%)</label>
                      <p className="text-lg text-gray-900">{formatCurrency(booking.municipalityFee3pct || 0)}</p>
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="text-sm text-blue-800 font-medium mb-2 block">ملاحظات</label>
                    <p className="text-blue-900">{booking.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* العقار */}
            {activeTab === 'property' && property && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaHome className="text-green-600" />
                  تفاصيل العقار
                </h2>

                {/* صور العقار */}
                {property.images && property.images.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-4 gap-3">
                      {property.images.slice(0, 4).map((img, idx) => (
                        <InstantImage
                          key={idx}
                          src={img}
                          alt={`${propertyTitle} - ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">العنوان</label>
                      <p className="text-lg font-bold text-gray-900">{propertyTitle}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">الرقم المرجعي</label>
                      <p className="text-lg text-gray-900">{property.referenceNo || 'غير محدد'}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">الموقع</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-600" />
                        {[property.province, property.state, property.village].filter(Boolean).join(' - ')}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">النوع</label>
                      <p className="text-lg text-gray-900">{toSafeText(property.type, 'ar', 'غير محدد')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">المساحة</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaRuler className="text-blue-600" />
                        {property.area || 0} م²
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">الغرف</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaBed className="text-purple-600" />
                        {property.bedrooms || 0} غرفة
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">الحمامات</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaBath className="text-blue-600" />
                        {property.bathrooms || 0} حمام
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">مفروش</label>
                      <p className="text-lg text-gray-900">
                        {property.furnished ? (
                          <span className="text-green-600 flex items-center gap-2">
                            <FaCheck /> نعم
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-2">
                            <FaTimes /> لا
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm text-gray-600 font-medium mb-3 block">المرافق والخدمات</label>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <InstantLink
                    href={`/properties/${property.id}`}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaHome />
                    عرض العقار الكامل
                  </InstantLink>
                </div>
              </div>
            )}

            {/* المستأجر */}
            {activeTab === 'tenant' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaUser className="text-green-600" />
                  بيانات المستأجر
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">الاسم الكامل</label>
                      <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FaUser className="text-green-600" />
                        {tenant.name || 'غير محدد'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">رقم الهاتف</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaPhone className="text-blue-600" />
                        {tenant.phone || 'غير محدد'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">البريد الإلكتروني</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaEnvelope className="text-purple-600" />
                        {tenant.email || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">رقم الهوية</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaIdCard className="text-orange-600" />
                        {tenant.idNumber || tenant.nationalId || 'غير محدد'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">العنوان</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-600" />
                        {tenant.address || 'غير محدد'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">الجنسية</label>
                      <p className="text-lg text-gray-900">
                        {tenant.kind === 'omani' ? 'عماني' : tenant.kind === 'gcc' ? 'خليجي' : 'أجنبي'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* الدفع */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaDollarSign className="text-green-600" />
                  تفاصيل الدفع
                </h2>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">طريقة الدفع</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <FaCreditCard className="text-blue-600" />
                        {booking.paymentMethod === 'cash' ? 'نقدي' :
                         booking.paymentMethod === 'cheque' ? 'شيك' :
                         booking.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'غير محدد'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium">حالة الدفع</label>
                      <p className="text-lg">
                        {booking.paidAt ? (
                          <span className="text-green-600 flex items-center gap-2">
                            <FaCheckCircle /> تم الدفع في {formatDate(booking.paidAt)}
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-2">
                            <FaClock /> في انتظار الدفع
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* الشيكات */}
                  {booking.cheques && booking.cheques.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-600 font-medium mb-3 block">الشيكات</label>
                      <div className="space-y-3">
                        {booking.cheques.map((cheque, idx) => (
                          <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">رقم الشيك:</span>
                                <span className="font-bold text-gray-900 mr-2">{cheque.chequeNo}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">التاريخ:</span>
                                <span className="font-bold text-gray-900 mr-2">
                                  {formatDate(cheque.chequeDate)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">المبلغ:</span>
                                <span className="font-bold text-green-600 mr-2">
                                  {formatCurrency(cheque.amount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* التأمين */}
                  {booking.deposit && booking.deposit > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm text-yellow-800 font-medium block mb-1">
                            مبلغ التأمين
                          </label>
                          <p className="text-2xl font-bold text-yellow-900">
                            {formatCurrency(booking.deposit)}
                          </p>
                        </div>
                        <div>
                          {booking.depositPaid ? (
                            <span className="flex items-center gap-2 text-green-600 font-medium">
                              <FaCheckCircle /> تم الدفع
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-red-600 font-medium">
                              <FaTimesCircle /> لم يُدفع
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* المستندات */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaFileAlt className="text-green-600" />
                  المستندات والعقود
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">عقد الإيجار</p>
                        <p className="text-sm text-gray-600">
                          {booking.contractSigned ? 'تم التوقيع' : 'في انتظار التوقيع'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <FaDownload />
                          تحميل
                        </button>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          <FaPrint />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">نسخة الهوية</p>
                        <p className="text-sm text-gray-600">هوية المستأجر</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <FaImage />
                        عرض
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ملخص سريع */}
            <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">ملخص سريع</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-100">الإجمالي:</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">الشهري:</span>
                  <span className="text-xl font-bold">{formatCurrency(totalAmount / duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">المدة:</span>
                  <span className="text-xl font-bold">{duration} شهر</span>
                </div>
              </div>
            </div>

            {/* قرار المالك */}
            {booking.ownerDecision && (
              <div className={`rounded-2xl shadow-lg p-6 ${
                booking.ownerDecision.approved
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-red-50 border-2 border-red-300'
              }`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {booking.ownerDecision.approved ? (
                    <>
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-green-900">تم القبول</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-600" />
                      <span className="text-red-900">تم الرفض</span>
                    </>
                  )}
                </h3>
                {booking.ownerDecision.reason && (
                  <p className={booking.ownerDecision.approved ? 'text-green-800' : 'text-red-800'}>
                    {booking.ownerDecision.reason}
                  </p>
                )}
                {booking.ownerDecision.decidedAt && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formatDate(booking.ownerDecision.decidedAt)}
                  </p>
                )}
              </div>
            )}

            {/* روابط سريعة */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">روابط سريعة</h3>
              <div className="space-y-3">
                <InstantLink
                  href={`/properties/${booking.propertyId}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FaHome className="text-blue-600" />
                  <span className="text-blue-900 font-medium">عرض العقار</span>
                </InstantLink>
                
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaPrint className="text-gray-600" />
                  <span className="text-gray-900 font-medium">طباعة التفاصيل</span>
                </button>

                <InstantLink
                  href={`/admin/bookings/${booking.id}/edit`}
                  className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <FaEdit className="text-yellow-600" />
                  <span className="text-yellow-900 font-medium">تعديل الحجز</span>
                </InstantLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
