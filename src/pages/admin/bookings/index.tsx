import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import { useEffect, useState, useMemo } from "react";
// Header is now handled by MainLayout in _app.tsx

import AdvancedFilterSystem from "@/components/admin/AdvancedFilterSystem";
import AdvancedDataTable from "@/components/admin/AdvancedDataTable";
import SmartAnalytics from "@/components/admin/SmartAnalytics";
import { useBookings } from "@/context/BookingsContext";

type BookingStatus = "pending" | "reserved" | "leased" | "cancelled" | "accounting";
type Booking = {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate: string;
  duration: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
  ownerDecision?: { approved?: boolean; reason?: string; decidedAt?: string } | null;
};

function fmtOMR(n:number){ return new Intl.NumberFormat("ar-OM",{style:"currency",currency:"OMR",maximumFractionDigits:3}).format(n); }
function statusLabel(s: BookingStatus){
  if (s==="reserved") return "محجوز";
  if (s==="leased") return "مؤجّر";
  if (s==="cancelled") return "ملغى";
  if (s==="accounting") return "محاسبي";
  return "قيد المراجعة";
}

interface FilterState {
  searchTerm: string;
  dateRange: { from: string; to: string };
  propertyFilter: string;
  customerFilter: string;
  amountRange: { from: number | null; to: number | null };
  statusFilter: string;
  smartSuggestions: string[];
  aiInsights: any[];
}

export default function AdminBookingsListPage(){
  // ✅ استخدام Context الموحد بدلاً من fetch محلي
  const { bookings: items, loading, error: err, lastUpdate } = useBookings();
  
  console.log('🔍 Admin Bookings: items count =', items.length);
  console.log('📊 Admin Bookings: loading =', loading);
  console.log('❌ Admin Bookings: error =', err);
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateRange: { from: '', to: '' },
    propertyFilter: '',
    customerFilter: '',
    amountRange: { from: null, to: null },
    statusFilter: 'all',
    smartSuggestions: [],
    aiInsights: []
  });

  // فلترة وترتيب البيانات
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // فلترة البحث العام
      const matchesSearch = !filters.searchTerm || 
        item.bookingNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.customerInfo?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.propertyTitle?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.propertyReference?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // فلترة التاريخ
      const itemDate = new Date(item.createdAt);
      const matchesDateFrom = !filters.dateRange.from || itemDate >= new Date(filters.dateRange.from);
      const matchesDateTo = !filters.dateRange.to || itemDate <= new Date(filters.dateRange.to + "T23:59:59");
      
      // فلترة العقار
      const matchesProperty = !filters.propertyFilter || 
        item.propertyId?.toLowerCase().includes(filters.propertyFilter.toLowerCase()) ||
        item.propertyReference?.toLowerCase().includes(filters.propertyFilter.toLowerCase()) ||
        item.propertyTitle?.toLowerCase().includes(filters.propertyFilter.toLowerCase());
      
      // فلترة العميل
      const matchesCustomer = !filters.customerFilter || 
        item.customerInfo?.name?.toLowerCase().includes(filters.customerFilter.toLowerCase()) ||
        item.customerInfo?.phone?.includes(filters.customerFilter);
      
      // فلترة المبلغ
      const itemAmount = item.totalAmount || 0;
      const matchesAmountFrom = !filters.amountRange.from || itemAmount >= filters.amountRange.from;
      const matchesAmountTo = !filters.amountRange.to || itemAmount <= filters.amountRange.to;
      
      // فلترة الحالة
      const matchesStatus = filters.statusFilter === "all" || item.status === filters.statusFilter;
      
      return matchesSearch && matchesDateFrom && matchesDateTo && 
             matchesProperty && matchesCustomer && matchesAmountFrom && 
             matchesAmountTo && matchesStatus;
    });
  }, [items, filters]);

  // دالة تحديث الفلاتر
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head><title>الحجوزات | Ain Oman</title></Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            إدارة الحجوزات
          </h1>
          <p className="text-gray-600 text-lg">
            نظام إدارة متطور للحجوزات مع ذكاء اصطناعي
          </p>
        </div>

        {/* نظام الفلترة المتطور */}
        <AdvancedFilterSystem
          onFiltersChange={handleFiltersChange}
          totalItems={items.length}
          filteredCount={filteredItems.length}
          items={items}
        />

        {/* التحليلات الذكية */}
        {!loading && !err && items.length > 0 && (
          <SmartAnalytics data={items} />
        )}

        {/* جدول البيانات المتطور */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : err ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">خطأ في تحميل البيانات</div>
            <p className="text-red-500">{err}</p>
          </div>
        ) : (
          <AdvancedDataTable data={filteredItems} loading={loading} />
        )}
      </div>
    </div>
  );
}
