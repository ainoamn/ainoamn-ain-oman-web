// src/pages/api/auctions/stats.ts - إحصائيات المزادات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Auction {
  id: string;
  title: string;
  startingPrice: number;
  currentBid: number;
  reservePrice?: number;
  location: string;
  type: 'property' | 'vehicle' | 'art' | 'antique' | 'other';
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  startDate: string;
  endDate: string;
  bids: any[];
  participants: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  analytics: {
    views: number;
    bids: number;
    watchers: number;
    shares: number;
  };
  [key: string]: any;
}

interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
  status: 'active' | 'outbid' | 'winning' | 'cancelled';
  [key: string]: any;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const AUCTIONS_FILE = path.join(DATA_DIR, 'auctions.json');
const BIDS_FILE = path.join(DATA_DIR, 'bids.json');

// قراءة المزادات
const readAuctions = (): Auction[] => {
  try {
    if (fs.existsSync(AUCTIONS_FILE)) {
      const data = fs.readFileSync(AUCTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading auctions:', error);
  }
  return [];
};

// قراءة المزايدات
const readBids = (): Bid[] => {
  try {
    if (fs.existsSync(BIDS_FILE)) {
      const data = fs.readFileSync(BIDS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading bids:', error);
  }
  return [];
};

// حساب إحصائيات المزادات
const calculateAuctionStats = (auctions: Auction[], bids: Bid[]) => {
  const now = new Date();
  const total = auctions.length;
  
  // إحصائيات حسب الحالة
  const byStatus = auctions.reduce((acc, auction) => {
    acc[auction.status] = (acc[auction.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب النوع
  const byType = auctions.reduce((acc, auction) => {
    acc[auction.type] = (acc[auction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب الموقع
  const byLocation = auctions.reduce((acc, auction) => {
    acc[auction.location] = (acc[auction.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات الأسعار
  const withPrice = auctions.filter(a => a.startingPrice > 0);
  const totalValue = withPrice.reduce((sum, a) => sum + a.startingPrice, 0);
  const averagePrice = withPrice.length > 0 ? totalValue / withPrice.length : 0;
  const minPrice = withPrice.length > 0 ? Math.min(...withPrice.map(a => a.startingPrice)) : 0;
  const maxPrice = withPrice.length > 0 ? Math.max(...withPrice.map(a => a.startingPrice)) : 0;

  // إحصائيات المزايدات
  const totalBids = bids.length;
  const totalBidders = new Set(bids.map(b => b.bidderId)).size;
  const averageBidsPerAuction = total > 0 ? totalBids / total : 0;

  // إحصائيات المشاهدات
  const totalViews = auctions.reduce((sum, a) => sum + a.viewCount, 0);
  const averageViews = total > 0 ? totalViews / total : 0;

  // إحصائيات المشاركين
  const totalParticipants = auctions.reduce((sum, a) => sum + a.participants.length, 0);
  const averageParticipants = total > 0 ? totalParticipants / total : 0;

  // إحصائيات الوقت
  const upcomingAuctions = auctions.filter(a => {
    const startDate = new Date(a.startDate);
    return startDate > now;
  }).length;

  const liveAuctions = auctions.filter(a => {
    const startDate = new Date(a.startDate);
    const endDate = new Date(a.endDate);
    return startDate <= now && endDate > now;
  }).length;

  const endedAuctions = auctions.filter(a => {
    const endDate = new Date(a.endDate);
    return endDate <= now;
  }).length;

  // إحصائيات الشارات
  const allTags = auctions.flatMap(a => a.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // إحصائيات البائعين
  const sellerCounts = auctions.reduce((acc, auction) => {
    const sellerId = auction.seller?.id || 'unknown';
    acc[sellerId] = (acc[sellerId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSellers = Object.entries(sellerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([sellerId, count]) => ({ sellerId, count }));

  // إحصائيات المزايدين
  const bidderCounts = bids.reduce((acc, bid) => {
    acc[bid.bidderId] = (acc[bid.bidderId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBidders = Object.entries(bidderCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([bidderId, count]) => ({ bidderId, count }));

  // إحصائيات الأداء
  const performanceStats = {
    conversionRate: total > 0 ? (endedAuctions / total) * 100 : 0,
    averageBidIncrease: totalBids > 0 ? 
      bids.reduce((sum, bid) => {
        const auction = auctions.find(a => a.id === bid.auctionId);
        if (auction) {
          return sum + (bid.amount - auction.startingPrice);
        }
        return sum;
      }, 0) / totalBids : 0,
    engagementRate: total > 0 ? (totalParticipants / total) * 100 : 0
  };

  // إحصائيات الوقت
  const timeStats = {
    upcomingAuctions,
    liveAuctions,
    endedAuctions,
    cancelledAuctions: byStatus.cancelled || 0
  };

  // إحصائيات الأسعار
  const priceStats = {
    totalValue,
    averagePrice,
    minPrice,
    maxPrice,
    withPrice: withPrice.length
  };

  // إحصائيات المشاركة
  const participationStats = {
    totalBids,
    totalBidders,
    totalParticipants,
    averageBidsPerAuction,
    averageParticipants
  };

  // إحصائيات المشاهدات
  const viewStats = {
    totalViews,
    averageViews,
    totalWatchers: auctions.reduce((sum, a) => sum + (a.analytics?.watchers || 0), 0),
    totalShares: auctions.reduce((sum, a) => sum + (a.analytics?.shares || 0), 0)
  };

  return {
    total,
    byStatus,
    byType,
    byLocation,
    priceStats,
    participationStats,
    viewStats,
    timeStats,
    performanceStats,
    topTags,
    topSellers,
    topBidders
  };
};

// حساب إحصائيات المزايدات
const calculateBidStats = (bids: Bid[], auctions: Auction[]) => {
  const now = new Date();
  const total = bids.length;
  
  if (total === 0) {
    return {
      total: 0,
      byStatus: {},
      byAuction: {},
      byBidder: {},
      timeStats: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      amountStats: {
        totalAmount: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0
      }
    };
  }

  // إحصائيات حسب الحالة
  const byStatus = bids.reduce((acc, bid) => {
    acc[bid.status] = (acc[bid.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب المزاد
  const byAuction = bids.reduce((acc, bid) => {
    acc[bid.auctionId] = (acc[bid.auctionId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب المزايد
  const byBidder = bids.reduce((acc, bid) => {
    acc[bid.bidderId] = (acc[bid.bidderId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات الوقت
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const timeStats = {
    today: bids.filter(b => new Date(b.timestamp) >= today).length,
    thisWeek: bids.filter(b => new Date(b.timestamp) >= weekAgo).length,
    thisMonth: bids.filter(b => new Date(b.timestamp) >= monthAgo).length
  };

  // إحصائيات المبالغ
  const amounts = bids.map(b => b.amount);
  const amountStats = {
    totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
    averageAmount: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length,
    minAmount: Math.min(...amounts),
    maxAmount: Math.max(...amounts)
  };

  return {
    total,
    byStatus,
    byAuction,
    byBidder,
    timeStats,
    amountStats
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const { type = 'all' } = req.query;
    const auctions = readAuctions();
    const bids = readBids();

    if (type === 'auctions') {
      const stats = calculateAuctionStats(auctions, bids);
      res.status(200).json({
        stats,
        generatedAt: new Date().toISOString()
      });
    } else if (type === 'bids') {
      const stats = calculateBidStats(bids, auctions);
      res.status(200).json({
        stats,
        generatedAt: new Date().toISOString()
      });
    } else {
      const auctionStats = calculateAuctionStats(auctions, bids);
      const bidStats = calculateBidStats(bids, auctions);
      
      res.status(200).json({
        auctions: auctionStats,
        bids: bidStats,
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in auctions stats API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
