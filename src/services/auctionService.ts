import { Auction, AuctionFilters, Bid, AIAnalysis } from '@/types/auction';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const auctionService = {
  // الحصول على المزادات
  async getAuctions(filters?: AuctionFilters): Promise<Auction[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE}/auctions?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch auctions');
    }
    return response.json();
  },

  // الحصول على مزاد محدد
  async getAuction(id: string): Promise<Auction> {
    const response = await fetch(`${API_BASE}/auctions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch auction');
    }
    return response.json();
  },

  // إنشاء مزاد جديد
  async createAuction(auctionData: Partial<Auction>): Promise<Auction> {
    const response = await fetch(`${API_BASE}/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auctionData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create auction');
    }
    return response.json();
  },

  // تقديم مزايدة
  async placeBid(auctionId: string, amount: number): Promise<Bid> {
    const response = await fetch(`${API_BASE}/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to place bid');
    }
    return response.json();
  },

  // الحصول على تحليل الذكاء الاصطناعي
  async getAIAnalysis(auctionId: string): Promise<AIAnalysis> {
    const response = await fetch(`${API_BASE}/auctions/${auctionId}/ai-analysis`);
    if (!response.ok) {
      throw new Error('Failed to fetch AI analysis');
    }
    return response.json();
  },

  // مزامنة مع منصة خارجية
  async syncWithPlatform(auctionId: string, platform: string): Promise<{ success: boolean; url?: string }> {
    const response = await fetch(`${API_BASE}/auctions/${auctionId}/sync/${platform}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync with ${platform}`);
    }
    return response.json();
  },

  // الحصول على مزادات المستخدم
  async getUserAuctions(status?: string): Promise<Auction[]> {
    try {
      const url = status 
        ? `/api/auctions?status=${status}`
        : '/api/auctions';
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching user auctions:', error);
      return [];
    }
  },

  // الحصول على إحصائيات لوحة التحكم
  async getDashboardStats(): Promise<{
    total: number;
    active: number;
    scheduled: number;
    completed: number;
    pending: number;
    revenue: number;
  }> {
    try {
      const response = await fetch('/api/auctions');
      if (!response.ok) {
        return { total: 0, active: 0, scheduled: 0, completed: 0, pending: 0, revenue: 0 };
      }
      const data = await response.json();
      const auctions = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      
      return {
        total: auctions.length,
        active: auctions.filter((a: Auction) => a.status === 'active').length,
        scheduled: auctions.filter((a: Auction) => a.status === 'scheduled').length,
        completed: auctions.filter((a: Auction) => a.status === 'completed').length,
        pending: auctions.filter((a: Auction) => a.status === 'pending').length,
        revenue: auctions.reduce((sum: number, a: Auction) => sum + (a.currentBid || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { total: 0, active: 0, scheduled: 0, completed: 0, pending: 0, revenue: 0 };
    }
  },

  // الموافقة على مزاد
  async approveAuction(auctionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to approve auction');
      }
    } catch (error) {
      console.error('Error approving auction:', error);
      throw error;
    }
  },

  // رفض مزاد
  async rejectAuction(auctionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/reject`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reject auction');
      }
    } catch (error) {
      console.error('Error rejecting auction:', error);
      throw error;
    }
  },

  // ترقية مزاد
  async promoteAuction(auctionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/promote`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to promote auction');
      }
    } catch (error) {
      console.error('Error promoting auction:', error);
      throw error;
    }
  },

  // حذف مزاد
  async deleteAuction(auctionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/auctions/${auctionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete auction');
      }
    } catch (error) {
      console.error('Error deleting auction:', error);
      throw error;
    }
  },
};
