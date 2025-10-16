// src/context/BookingsContext.tsx
// نظام موحد لإدارة الحجوزات في كل الصفحات ⚡

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string | { ar?: string; en?: string };
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
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    idNumber?: string;
  };
  tenant?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  ownerDecision?: {
    approved?: boolean;
    reason?: string;
    decidedAt?: string;
  } | null;
  paymentMethod?: string;
  paidAt?: string;
  [key: string]: any;
}

interface BookingsContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  getBookingById: (id: string) => Booking | undefined;
  filterByUser: (userId: string) => Booking[];
  filterByProperty: (propertyId: string) => Booking[];
  filterByStatus: (status: string) => Booking[];
}

const BookingsContext = createContext<BookingsContextType | null>(null);

interface BookingsProviderProps {
  children: ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function BookingsProvider({ 
  children, 
  autoRefresh = true,
  refreshInterval = 30000 
}: BookingsProviderProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // جلب البيانات من API
  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      

      const response = await fetch('/api/bookings', {
        cache: 'no-store',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();

        
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

        
        // تطبيع البيانات
        const normalized = items.map((item: any) => normalizeBooking(item));


        
        setBookings(normalized);
        setLastUpdate(new Date());
      } else {

        setError(`فشل في جلب البيانات: ${response.status}`);
      }
    } catch (err: any) {

      setError(err.message || 'فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  // تطبيع بيانات الحجز (للتعامل مع صيغ مختلفة من API)
  const normalizeBooking = (item: any): Booking => {
    return {
      id: String(item.id || item.bookingId || ''),
      bookingNumber: item.bookingNumber || item.id || '',
      propertyId: item.propertyId || item.unitId || item.buildingId || '',
      propertyTitle: item.propertyTitle || '',
      propertyReference: item.propertyReference || '',
      unitId: item.unitId,
      buildingId: item.buildingId,
      startDate: item.startDate || item.createdAt || '',
      endDate: item.endDate || '',
      duration: item.duration || item.durationMonths || 0,
      durationMonths: item.durationMonths || item.duration || 0,
      totalAmount: item.totalAmount || item.totalRent || item.total || item.amount || 0,
      totalRent: item.totalRent || item.totalAmount || 0,
      status: item.status || item.state || 'pending',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt,
      contractSigned: item.contractSigned || false,
      customerInfo: item.customerInfo || item.tenant || {},
      tenant: item.tenant || item.customerInfo,
      ownerDecision: item.ownerDecision || null,
      paymentMethod: item.paymentMethod,
      paidAt: item.paidAt,
      ...item,
    };
  };

  // تحميل البيانات عند التهيئة
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // تحديث تلقائي
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchBookings();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchBookings]);

  // إضافة حجز جديد (تحديث فوري)
  const addBooking = useCallback((booking: Booking) => {
    const normalized = normalizeBooking(booking);
    setBookings(prev => {
      // تجنب التكرار
      if (prev.some(b => b.id === normalized.id)) {
        return prev.map(b => b.id === normalized.id ? normalized : b);
      }
      return [normalized, ...prev];
    });
    setLastUpdate(new Date());
  }, []);

  // تحديث حجز موجود
  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)
    );
    setLastUpdate(new Date());
  }, []);

  // حذف حجز
  const deleteBooking = useCallback((id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    setLastUpdate(new Date());
  }, []);

  // الحصول على حجز بالـ ID
  const getBookingById = useCallback((id: string) => {
    return bookings.find(b => b.id === id);
  }, [bookings]);

  // فلترة حسب المستخدم
  const filterByUser = useCallback((userId: string) => {
    return bookings.filter(b => 
      b.customerInfo?.phone === userId ||
      b.customerInfo?.email === userId ||
      b.tenant?.phone === userId ||
      b.tenant?.email === userId
    );
  }, [bookings]);

  // فلترة حسب العقار
  const filterByProperty = useCallback((propertyId: string) => {
    return bookings.filter(b => 
      b.propertyId === propertyId ||
      b.unitId === propertyId ||
      b.buildingId === propertyId
    );
  }, [bookings]);

  // فلترة حسب الحالة
  const filterByStatus = useCallback((status: string) => {
    return bookings.filter(b => b.status === status);
  }, [bookings]);

  const value: BookingsContextType = {
    bookings,
    loading,
    error,
    lastUpdate,
    refresh: fetchBookings,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    filterByUser,
    filterByProperty,
    filterByStatus,
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
}

// Hook للاستخدام في المكونات
export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within BookingsProvider');
  }
  return context;
}

// Hook للحصول على حجوزات مستخدم محدد
export function useUserBookings(userId?: string) {
  const { bookings, loading, error } = useBookings();
  
  const userBookings = userId ? bookings.filter(b => 
    b.customerInfo?.phone === userId ||
    b.customerInfo?.email === userId ||
    b.tenant?.phone === userId ||
    b.tenant?.email === userId
  ) : bookings;
  
  return { bookings: userBookings, loading, error };
}

// Hook للحصول على حجوزات عقار محدد
export function usePropertyBookings(propertyId?: string) {
  const { bookings, loading, error } = useBookings();
  
  const propertyBookings = propertyId ? bookings.filter(b => 
    b.propertyId === propertyId ||
    b.unitId === propertyId ||
    b.buildingId === propertyId
  ) : bookings;
  
  return { bookings: propertyBookings, loading, error };
}

// Hook للحصول على حجز واحد بالـ ID
export function useBooking(bookingId?: string) {
  const { bookings, loading, error, updateBooking } = useBookings();
  


  
  const booking = bookingId ? bookings.find(b => {
    const match = b.id === bookingId;
    if (match) console.log('✅ useBooking: Found booking!', b);
    return match;
  }) : null;
  
  if (!booking && bookingId) {

    console.log('📋 Available IDs:', bookings.map(b => b.id).slice(0, 5));
  }
  
  return { booking, loading, error, updateBooking };
}

export default BookingsContext;

