// src/lib/bookingSyncEngine.ts - محرك مزامنة الحجوزات مع الذكاء الاصطناعي
import { EventEmitter } from 'events';

export interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate: string;
  endDate?: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'reserved' | 'leased' | 'cancelled' | 'accounting';
  createdAt: string;
  updatedAt?: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
  ownerDecision?: { approved?: boolean; reason?: string; decidedAt?: string } | null;
}

export interface SyncEvent {
  type: 'booking_created' | 'booking_updated' | 'booking_deleted' | 'sync_completed' | 'sync_failed';
  booking?: Booking;
  error?: string;
  timestamp: string;
  source: 'local' | 'server' | 'ai';
}

export interface AIInsight {
  type: 'anomaly' | 'trend' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

class BookingSyncEngine extends EventEmitter {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncQueue: Booking[] = [];
  private lastSyncTime: string | null = null;
  private conflictResolution: 'server_wins' | 'client_wins' | 'ai_resolve' = 'ai_resolve';
  private aiInsights: AIInsight[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor() {
    super();
    this.initializeEventListeners();
    this.startPeriodicSync();
  }

  private initializeEventListeners(): void {
    // التحقق من وجود window (متصفح) قبل إضافة المستمعين
    if (typeof window !== 'undefined') {
      // مراقبة حالة الاتصال
      window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('sync_event', {
        type: 'sync_completed',
        timestamp: new Date().toISOString(),
        source: 'ai'
      });
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('sync_event', {
        type: 'sync_failed',
        error: 'No internet connection',
        timestamp: new Date().toISOString(),
        source: 'ai'
      });
    });

    // مراقبة تغييرات localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === 'propertyBookings' && e.newValue) {
        this.handleLocalStorageChange(e.newValue);
      }
    });

    // مراقبة BroadcastChannel للتحديثات
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('booking_sync');
      channel.addEventListener('message', (event) => {
        this.handleBroadcastMessage(event.data);
      });
    }
    }
  }

  private startPeriodicSync(): void {
    // مزامنة كل 30 ثانية
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000);
  }

  private async handleLocalStorageChange(newValue: string): Promise<void> {
    try {
      const localBookings: Booking[] = JSON.parse(newValue);
      const serverBookings = await this.fetchServerBookings();
      
      // تحليل الاختلافات باستخدام الذكاء الاصطناعي
      const differences = this.analyzeDifferences(localBookings, serverBookings);
      
      if (differences.length > 0) {
        await this.resolveConflicts(differences);
      }
    } catch (error) {
      console.error('Error handling localStorage change:', error);
    }
  }

  private handleBroadcastMessage(data: any): void {
    if (data.type === 'booking_update') {
      this.emit('sync_event', {
        type: 'booking_updated',
        booking: data.booking,
        timestamp: new Date().toISOString(),
        source: 'server'
      });
    }
  }

  private analyzeDifferences(local: Booking[], server: Booking[]): any[] {
    const differences: any[] = [];
    const localMap = new Map(local.map(b => [b.id, b]));
    const serverMap = new Map(server.map(b => [b.id, b]));

    // العثور على الحجوزات الجديدة محلياً
    for (const [id, localBooking] of localMap) {
      if (!serverMap.has(id)) {
        differences.push({
          type: 'missing_on_server',
          booking: localBooking,
          action: 'upload'
        });
      }
    }

    // العثور على الحجوزات المحدثة
    for (const [id, localBooking] of localMap) {
      const serverBooking = serverMap.get(id);
      if (serverBooking && this.hasChanges(localBooking, serverBooking)) {
        differences.push({
          type: 'conflict',
          local: localBooking,
          server: serverBooking,
          action: 'resolve'
        });
      }
    }

    // العثور على الحجوزات المحذوفة محلياً
    for (const [id, serverBooking] of serverMap) {
      if (!localMap.has(id)) {
        differences.push({
          type: 'missing_locally',
          booking: serverBooking,
          action: 'download'
        });
      }
    }

    return differences;
  }

  private hasChanges(local: Booking, server: Booking): boolean {
    const fieldsToCompare = ['status', 'totalAmount', 'contractSigned', 'customerInfo'];
    
    for (const field of fieldsToCompare) {
      if (JSON.stringify(local[field as keyof Booking]) !== JSON.stringify(server[field as keyof Booking])) {
        return true;
      }
    }
    
    return false;
  }

  private async resolveConflicts(differences: any[]): Promise<void> {
    for (const diff of differences) {
      switch (diff.type) {
        case 'missing_on_server':
          await this.uploadBooking(diff.booking);
          break;
        case 'missing_locally':
          await this.downloadBooking(diff.booking);
          break;
        case 'conflict':
          await this.resolveConflict(diff.local, diff.server);
          break;
      }
    }
  }

  private async resolveConflict(local: Booking, server: Booking): Promise<void> {
    // استخدام الذكاء الاصطناعي لحل التعارضات
    const aiDecision = await this.getAIResolution(local, server);
    
    switch (aiDecision) {
      case 'use_local':
        await this.uploadBooking(local);
        break;
      case 'use_server':
        await this.downloadBooking(server);
        break;
      case 'merge':
        const merged = this.mergeBookings(local, server);
        await this.uploadBooking(merged);
        break;
    }
  }

  private async getAIResolution(local: Booking, server: Booking): Promise<'use_local' | 'use_server' | 'merge'> {
    // محاكاة قرار الذكاء الاصطناعي
    const localTimestamp = new Date(local.updatedAt || local.createdAt).getTime();
    const serverTimestamp = new Date(server.updatedAt || server.createdAt).getTime();
    
    // إذا كان التحديث المحلي أحدث
    if (localTimestamp > serverTimestamp) {
      return 'use_local';
    }
    
    // إذا كان التحديث على الخادم أحدث
    if (serverTimestamp > localTimestamp) {
      return 'use_server';
    }
    
    // في حالة التعادل، دمج البيانات
    return 'merge';
  }

  private mergeBookings(local: Booking, server: Booking): Booking {
    return {
      ...local,
      ...server,
      updatedAt: new Date().toISOString(),
      // دمج معلومات العميل
      customerInfo: {
        ...server.customerInfo,
        ...local.customerInfo
      }
    };
  }

  private async uploadBooking(booking: Booking): Promise<boolean> {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });

      if (response.ok) {
        this.emit('sync_event', {
          type: 'booking_created',
          booking,
          timestamp: new Date().toISOString(),
          source: 'local'
        });
        
        this.broadcastUpdate(booking);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error uploading booking:', error);
      return false;
    }
  }

  private async downloadBooking(booking: Booking): Promise<boolean> {
    try {
      const localBookings = this.getLocalBookings();
      const existingIndex = localBookings.findIndex(b => b.id === booking.id);
      
      if (existingIndex >= 0) {
        localBookings[existingIndex] = booking;
      } else {
        localBookings.push(booking);
      }
      
      localStorage.setItem('propertyBookings', JSON.stringify(localBookings));
      
      this.emit('sync_event', {
        type: 'booking_updated',
        booking,
        timestamp: new Date().toISOString(),
        source: 'server'
      });
      
      return true;
    } catch (error) {
      console.error('Error downloading booking:', error);
      return false;
    }
  }

  private async fetchServerBookings(): Promise<Booking[]> {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data.items) ? data.items : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching server bookings:', error);
      return [];
    }
  }

  private getLocalBookings(): Booking[] {
    try {
      const stored = localStorage.getItem('propertyBookings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting local bookings:', error);
      return [];
    }
  }

  private broadcastUpdate(booking: Booking): void {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('booking_sync');
      channel.postMessage({
        type: 'booking_update',
        booking,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const booking of queue) {
      try {
        await this.uploadBooking(booking);
        this.retryCount = 0;
      } catch (error) {
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
          this.syncQueue.push(booking);
        } else {
          this.emit('sync_event', {
            type: 'sync_failed',
            error: `Failed to sync booking ${booking.id} after ${this.maxRetries} retries`,
            timestamp: new Date().toISOString(),
            source: 'ai'
          });
        }
      }
    }
  }

  // واجهة عامة
  public async syncBooking(booking: Booking): Promise<boolean> {
    if (this.isOnline) {
      return await this.uploadBooking(booking);
    } else {
      this.syncQueue.push(booking);
      return false;
    }
  }

  public async forceSync(): Promise<void> {
    const localBookings = this.getLocalBookings();
    const serverBookings = await this.fetchServerBookings();
    
    const differences = this.analyzeDifferences(localBookings, serverBookings);
    await this.resolveConflicts(differences);
    
    this.lastSyncTime = new Date().toISOString();
  }

  public getAIInsights(): AIInsight[] {
    return this.aiInsights;
  }

  public getSyncStatus(): {
    isOnline: boolean;
    queueLength: number;
    lastSyncTime: string | null;
    retryCount: number;
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      retryCount: this.retryCount
    };
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.removeAllListeners();
  }
}

// إنشاء مثيل واحد للمحرك
export const bookingSyncEngine = new BookingSyncEngine();





