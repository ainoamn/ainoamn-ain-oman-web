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
};