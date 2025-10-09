// src/components/booking/SmartSyncIndicator.tsx - مؤشر المزامنة الذكي
import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Brain,
  Zap,
  Activity
} from 'lucide-react';
// import { bookingSyncEngine, SyncEvent, AIInsight } from '@/lib/bookingSyncEngine';

// Mock types for now
interface SyncEvent {
  type: string;
  timestamp: string;
}

interface AIInsight {
  description: string;
}

// Mock bookingSyncEngine
const bookingSyncEngine = {
  getSyncStatus: () => ({
    isOnline: true,
    queueLength: 0,
    lastSyncTime: new Date().toISOString(),
    retryCount: 0
  }),
  on: (_event: string, _handler: (...args: any[]) => void) => {},
  off: (_event: string, _handler: (...args: any[]) => void) => {},
  forceSync: async () => {}
};

interface SyncStatus {
  isOnline: boolean;
  queueLength: number;
  lastSyncTime: string | null;
  retryCount: number;
}

export default function SmartSyncIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    queueLength: 0,
    lastSyncTime: null,
    retryCount: 0
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastEvent, setLastEvent] = useState<SyncEvent | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // تحديث حالة المزامنة
    const updateSyncStatus = () => {
      setSyncStatus(bookingSyncEngine.getSyncStatus());
    };

    // مراقبة أحداث المزامنة
    const handleSyncEvent = (event: SyncEvent) => {
      setLastEvent(event);
      updateSyncStatus();
      
      if (event.type === 'sync_completed') {
        setIsSyncing(false);
      } else if (event.type === 'sync_failed') {
        setIsSyncing(false);
      }
    };

    // مراقبة تغييرات الحالة
    const handleOnlineStatusChange = () => {
      updateSyncStatus();
    };

    // تسجيل المستمعين
    bookingSyncEngine.on('sync_event', handleSyncEvent);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // تحديث دوري
    const interval = setInterval(updateSyncStatus, 5000);

    // تحديث أولي
    updateSyncStatus();

    return () => {
      bookingSyncEngine.off('sync_event', handleSyncEvent);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await bookingSyncEngine.forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500';
    if (syncStatus.queueLength > 0) return 'text-yellow-500';
    if (syncStatus.retryCount > 0) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return <WifiOff className="w-4 h-4" />;
    if (isSyncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (syncStatus.queueLength > 0) return <Clock className="w-4 h-4" />;
    if (syncStatus.retryCount > 0) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'غير متصل';
    if (isSyncing) return 'جاري المزامنة...';
    if (syncStatus.queueLength > 0) return `${syncStatus.queueLength} في الانتظار`;
    if (syncStatus.retryCount > 0) return 'إعادة المحاولة';
    return 'مزامن';
  };

  const formatLastSyncTime = (timestamp: string | null) => {
    if (!timestamp) return 'لم يتم المزامنة';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffMins < 1440) return `منذ ${Math.floor(diffMins / 60)} ساعة`;
    return date.toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  return (
    <div className="relative">
      {/* المؤشر الرئيسي */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg transition-all duration-200 ${
          showDetails 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {syncStatus.queueLength > 0 && (
          <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
            {syncStatus.queueLength}
          </span>
        )}
      </button>

      {/* تفاصيل المزامنة */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="w-5 h-5 ml-2 text-blue-600" />
                حالة المزامنة الذكية
              </h3>
              <button
                onClick={handleForceSync}
                disabled={isSyncing || !syncStatus.isOnline}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* حالة الاتصال */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {syncStatus.isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">الاتصال</span>
                </div>
                <span className={`text-sm ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {syncStatus.isOnline ? 'متصل' : 'غير متصل'}
                </span>
              </div>

              {/* طابور المزامنة */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">في الانتظار</span>
                </div>
                <span className="text-sm text-gray-600">{syncStatus.queueLength}</span>
              </div>

              {/* آخر مزامنة */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">آخر مزامنة</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatLastSyncTime(syncStatus.lastSyncTime)}
                </span>
              </div>

              {/* عدد المحاولات */}
              {syncStatus.retryCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">محاولات فاشلة</span>
                  </div>
                  <span className="text-sm text-orange-600">{syncStatus.retryCount}</span>
                </div>
              )}
            </div>

            {/* آخر حدث */}
            {lastEvent && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">آخر نشاط</span>
                </div>
                <p className="text-sm text-blue-700">
                  {lastEvent.type === 'booking_created' && 'تم إنشاء حجز جديد'}
                  {lastEvent.type === 'booking_updated' && 'تم تحديث حجز'}
                  {lastEvent.type === 'booking_deleted' && 'تم حذف حجز'}
                  {lastEvent.type === 'sync_completed' && 'تمت المزامنة بنجاح'}
                  {lastEvent.type === 'sync_failed' && 'فشلت المزامنة'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {formatLastSyncTime(lastEvent.timestamp)}
                </p>
              </div>
            )}

            {/* نصائح ذكية */}
            {aiInsights.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Brain className="w-4 h-4 ml-2 text-purple-600" />
                  نصائح ذكية
                </h4>
                <div className="space-y-2">
                  {aiInsights.slice(0, 2).map((insight, index) => (
                    <div key={index} className="p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-800">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



