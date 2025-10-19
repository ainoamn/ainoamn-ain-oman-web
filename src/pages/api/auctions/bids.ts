// @ts-nocheck
// src/pages/api/auctions/bids.ts - API المزايدات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
  status: 'active' | 'outbid' | 'winning' | 'cancelled';
  notes?: string;
  contactInfo?: {
    phone: string;
    email: string;
  };
  paymentMethod?: string;
  deliveryPreference?: string;
  additionalInfo?: string;
}

interface Auction {
  id: string;
  title: string;
  startingPrice: number;
  currentBid: number;
  reservePrice?: number;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  startDate: string;
  endDate: string;
  bids: Bid[];
  participants: string[];
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

// كتابة المزادات
const writeAuctions = (auctions: Auction[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUCTIONS_FILE, JSON.stringify(auctions, null, 2));
  } catch (error) {
    console.error('Error writing auctions:', error);
    throw error;
  }
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

// كتابة المزايدات
const writeBids = (bids: Bid[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BIDS_FILE, JSON.stringify(bids, null, 2));
  } catch (error) {
    console.error('Error writing bids:', error);
    throw error;
  }
};

// إنشاء مزايدة جديدة
const createBid = (bidData: Partial<Bid>): Bid => {
  const now = new Date().toISOString();
  const id = `BID-${Date.now()}`;
  
  return {
    id,
    auctionId: bidData.auctionId || '',
    bidderId: bidData.bidderId || '',
    bidderName: bidData.bidderName || '',
    amount: bidData.amount || 0,
    timestamp: bidData.timestamp || now,
    isWinning: bidData.isWinning || false,
    status: bidData.status || 'active',
    notes: bidData.notes,
    contactInfo: bidData.contactInfo,
    paymentMethod: bidData.paymentMethod,
    deliveryPreference: bidData.deliveryPreference,
    additionalInfo: bidData.additionalInfo
  };
};

// تحديث المزاد بعد إضافة مزايدة
const updateAuctionAfterBid = (auctionId: string, newBid: Bid): void => {
  const auctions = readAuctions();
  const auctionIndex = auctions.findIndex(a => a.id === auctionId);
  
  if (auctionIndex === -1) {
    throw new Error('Auction not found');
  }

  const auction = auctions[auctionIndex];
  
  // تحديث المزايدة الحالية
  auction.currentBid = newBid.amount;
  
  // إضافة المزايدة الجديدة
  auction.bids.push(newBid);
  
  // تحديث حالة المزايدات السابقة
  auction.bids.forEach(bid => {
    if (bid.id === newBid.id) {
      bid.isWinning = true;
      bid.status = 'winning';
    } else {
      bid.isWinning = false;
      bid.status = 'outbid';
    }
  });
  
  // إضافة المزايد إلى قائمة المشاركين
  if (!auction.participants.includes(newBid.bidderId)) {
    auction.participants.push(newBid.bidderId);
  }
  
  // تحديث تاريخ التحديث
  auction.updatedAt = new Date().toISOString();
  
  auctions[auctionIndex] = auction;
  writeAuctions(auctions);
};

// التحقق من صحة المزايدة
const validateBid = (auctionId: string, amount: number): { valid: boolean; error?: string } => {
  const auctions = readAuctions();
  const auction = auctions.find(a => a.id === auctionId);
  
  if (!auction) {
    return { valid: false, error: 'Auction not found' };
  }
  
  if (auction.status !== 'live') {
    return { valid: false, error: 'Auction is not live' };
  }
  
  const now = new Date();
  const startDate = new Date(auction.startDate);
  const endDate = new Date(auction.endDate);
  
  if (now < startDate) {
    return { valid: false, error: 'Auction has not started yet' };
  }
  
  if (now > endDate) {
    return { valid: false, error: 'Auction has ended' };
  }
  
  if (amount <= auction.currentBid) {
    return { valid: false, error: 'Bid amount must be higher than current bid' };
  }
  
  if (amount < auction.startingPrice) {
    return { valid: false, error: 'Bid amount must be at least the starting price' };
  }
  
  return { valid: true };
};

// إنشاء بيانات تجريبية للمزايدات
const createSampleBids = (): Bid[] => {
  const now = new Date();
  const sampleBids: Bid[] = [
    {
      id: 'BID-001',
      auctionId: 'AUCTION-001',
      bidderId: 'BIDDER-001',
      bidderName: 'أحمد محمد',
      amount: 180000,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isWinning: false,
      status: 'outbid',
      notes: 'مزايدة أولى',
      contactInfo: {
        phone: '+968 1234 5678',
        email: 'ahmed@email.com'
      },
      paymentMethod: 'تحويل بنكي',
      deliveryPreference: 'تسليم فوري',
      additionalInfo: 'أرغب في استكمال المعاملة بسرعة'
    },
    {
      id: 'BID-002',
      auctionId: 'AUCTION-001',
      bidderId: 'BIDDER-002',
      bidderName: 'فاطمة علي',
      amount: 185000,
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      status: 'winning',
      notes: 'مزايدة ثانية',
      contactInfo: {
        phone: '+968 9876 5432',
        email: 'fatima@email.com'
      },
      paymentMethod: 'نقداً',
      deliveryPreference: 'تسليم خلال أسبوع',
      additionalInfo: 'أرغب في فحص العقار قبل التسليم'
    },
    {
      id: 'BID-003',
      auctionId: 'AUCTION-003',
      bidderId: 'BIDDER-004',
      bidderName: 'سالم أحمد',
      amount: 65000,
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      status: 'winning',
      notes: 'مزايدة على المحل التجاري',
      contactInfo: {
        phone: '+968 5555 1234',
        email: 'salem@email.com'
      },
      paymentMethod: 'تحويل بنكي',
      deliveryPreference: 'تسليم فوري',
      additionalInfo: 'أرغب في بدء النشاط التجاري فوراً'
    },
    {
      id: 'BID-004',
      auctionId: 'AUCTION-005',
      bidderId: 'BIDDER-006',
      bidderName: 'خالد محمد',
      amount: 95000,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      isWinning: true,
      status: 'winning',
      notes: 'مزايدة على المكتب التجاري',
      contactInfo: {
        phone: '+968 9999 0000',
        email: 'khalid@email.com'
      },
      paymentMethod: 'نقداً',
      deliveryPreference: 'تسليم خلال أسبوع',
      additionalInfo: 'أرغب في فحص المكتب قبل التسليم'
    }
  ];

  return sampleBids;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة المزايدات
        let bids = readBids();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (bids.length === 0) {
          bids = createSampleBids();
          writeBids(bids);
        }

        const { 
          auctionId, 
          bidderId, 
          status, 
          sortBy = 'timestamp', 
          sortOrder = 'desc',
          page = '1',
          limit = '20'
        } = req.query;

        // تطبيق الفلاتر
        let filteredBids = [...bids];

        if (auctionId) {
          filteredBids = filteredBids.filter(b => b.auctionId === auctionId);
        }

        if (bidderId) {
          filteredBids = filteredBids.filter(b => b.bidderId === bidderId);
        }

        if (status && status !== 'all') {
          filteredBids = filteredBids.filter(b => b.status === status);
        }

        // ترتيب النتائج
        filteredBids.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'timestamp':
              aValue = new Date(a.timestamp);
              bValue = new Date(b.timestamp);
              break;
            case 'amount':
              aValue = a.amount;
              bValue = b.amount;
              break;
            case 'bidderName':
              aValue = a.bidderName;
              bValue = b.bidderName;
              break;
            default:
              aValue = new Date(a.timestamp);
              bValue = new Date(b.timestamp);
          }

          if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });

        // تطبيق الصفحات
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedBids = filteredBids.slice(startIndex, endIndex);

        res.status(200).json({
          bids: paginatedBids,
          total: filteredBids.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredBids.length / limitNum),
          filters: {
            auctionId,
            bidderId,
            status,
            sortBy,
            sortOrder
          }
        });
        break;

      case 'POST':
        // إنشاء مزايدة جديدة
        const {
          auctionId: newAuctionId,
          bidderId,
          bidderName,
          amount,
          notes,
          contactInfo,
          paymentMethod,
          deliveryPreference,
          additionalInfo
        } = req.body;

        if (!newAuctionId || !bidderId || !bidderName || !amount) {
          return res.status(400).json({
            error: 'Missing required fields: auctionId, bidderId, bidderName, amount'
          });
        }

        // التحقق من صحة المزايدة
        const validation = validateBid(newAuctionId, Number(amount));
        if (!validation.valid) {
          return res.status(400).json({
            error: validation.error
          });
        }

        // إنشاء المزايدة الجديدة
        const newBid = createBid({
          auctionId: newAuctionId,
          bidderId,
          bidderName,
          amount: Number(amount),
          notes,
          contactInfo,
          paymentMethod,
          deliveryPreference,
          additionalInfo
        });

        // تحديث المزاد
        updateAuctionAfterBid(newAuctionId, newBid);

        // إضافة المزايدة إلى ملف المزايدات
        const existingBids = readBids();
        const updatedBids = [...existingBids, newBid];
        writeBids(updatedBids);

        res.status(201).json({
          message: 'Bid placed successfully',
          bid: newBid
        });
        break;

      case 'PUT':
        // تحديث مزايدة
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Bid ID is required' });
        }

        const allBids = readBids();
        const bidIndex = allBids.findIndex(b => b.id === id);

        if (bidIndex === -1) {
          return res.status(404).json({ error: 'Bid not found' });
        }

        const updatedBid = {
          ...allBids[bidIndex],
          ...updateData,
          timestamp: allBids[bidIndex].timestamp // الحفاظ على وقت المزايدة الأصلي
        };

        allBids[bidIndex] = updatedBid;
        writeBids(allBids);

        res.status(200).json({
          message: 'Bid updated successfully',
          bid: updatedBid
        });
        break;

      case 'DELETE':
        // حذف مزايدة
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Bid ID is required' });
        }

        const bidsToDelete = readBids();
        const deleteIndex = bidsToDelete.findIndex(b => b.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Bid not found' });
        }

        bidsToDelete.splice(deleteIndex, 1);
        writeBids(bidsToDelete);

        res.status(200).json({
          message: 'Bid removed successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in bids API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
