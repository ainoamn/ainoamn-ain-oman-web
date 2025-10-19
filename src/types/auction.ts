export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName?: string;
  amount: number;
  timestamp: string;
  isWinning?: boolean;
  status?: 'active' | 'outbid' | 'winning' | 'cancelled';
  [key: string]: any;
}

export interface Auction {
  id: string;
  title?: string;
  startingPrice: number;
  currentBid: number;
  reservePrice?: number;
  status?: 'upcoming' | 'live' | 'ended' | 'cancelled';
  startDate?: string;
  endDate?: string;
  bids?: Bid[];
  participants?: string[];
  [key: string]: any;
}

export interface AuctionFilters {
  status?: string;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface AIAnalysis {
  fairValue: number;
  risk: string;
  marketTrend: string;
  predictedFinalPrice: number;
  nextStepRecommendation: string;
  comparableProperties: any[];
  updatedAt: string; // أضف هذا السطر
  recommendation?: string;
  confidence?: number;
  pricePrediction?: number;
  estimatedValue?: number;
}
