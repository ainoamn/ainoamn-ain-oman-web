export type AuctionType = 'public' | 'electronic';
export type PropertyType = 'villa' | 'apartment' | 'land' | 'commercial';
export type AuctionStatus = 'draft' | 'active' | 'closed' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high';
export type MarketTrend = 'rising' | 'stable' | 'declining';

export interface Location {
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Bid {
  id: string;
  bidder: string;
  bidderId: string;
  amount: number;
  time: Date;
  isAutoBid: boolean;
}

export interface AIAnalysis {
  fairValue: number;
  risk: RiskLevel;
  marketTrend: MarketTrend;
  predictedFinalPrice: number;
  confidence: number;
  comparableProperties: string[];
  nextStepRecommendation: string;
  updatedAt: Date;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  currentBid: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: Location;
  features: string[];
  images: string[];
  auctionEnd: Date;
  status: AuctionStatus;
  auctionType: AuctionType;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  bids: Bid[];
  aiAnalysis?: AIAnalysis;
  externalPlatforms?: {
    [platform: string]: {
      listed: boolean;
      listingId?: string;
      url?: string;
    }
  };
}

export interface AuctionFilters {
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  location?: string;
  auctionType?: AuctionType;
  features?: string[];
}

export interface AuctionStats {
  totalViews: number;
  totalBids: number;
  averageBidAmount: number;
  uniqueBidders: number;
  popularityScore: number;
}