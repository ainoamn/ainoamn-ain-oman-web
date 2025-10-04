// src/pages/api/auctions.ts - API المزادات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentBid: number;
  reservePrice?: number;
  location: string;
  type: 'property' | 'vehicle' | 'art' | 'antique' | 'other';
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  startDate: string;
  endDate: string;
  images: string[];
  category: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  seller: {
    id: string;
    name: string;
    type: 'individual' | 'company';
    rating: number;
    verified: boolean;
  };
  bids: {
    id: string;
    bidderId: string;
    bidderName: string;
    amount: number;
    timestamp: string;
    isWinning: boolean;
  }[];
  participants: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  features: string[];
  documents: string[];
  inspectionDate?: string;
  inspectionLocation?: string;
  terms: string[];
  paymentTerms: string;
  deliveryTerms: string;
  warranty?: string;
  returnPolicy?: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  analytics: {
    views: number;
    bids: number;
    watchers: number;
    shares: number;
  };
}

const DATA_DIR = path.join(process.cwd(), '.data');
const AUCTIONS_FILE = path.join(DATA_DIR, 'auctions.json');

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

// إنشاء مزاد جديد
const createAuction = (auctionData: Partial<Auction>): Auction => {
  const now = new Date().toISOString();
  const id = `AUCTION-${Date.now()}`;
  
  return {
    id,
    title: auctionData.title || '',
    description: auctionData.description || '',
    startingPrice: auctionData.startingPrice || 0,
    currentBid: auctionData.currentBid || auctionData.startingPrice || 0,
    reservePrice: auctionData.reservePrice,
    location: auctionData.location || '',
    type: auctionData.type || 'property',
    status: auctionData.status || 'upcoming',
    startDate: auctionData.startDate || now,
    endDate: auctionData.endDate || now,
    images: auctionData.images || [],
    category: auctionData.category || '',
    condition: auctionData.condition || 'good',
    seller: auctionData.seller || {
      id: 'SELLER-001',
      name: 'بائع غير محدد',
      type: 'individual',
      rating: 0,
      verified: false
    },
    bids: auctionData.bids || [],
    participants: auctionData.participants || [],
    viewCount: auctionData.viewCount || 0,
    createdAt: auctionData.createdAt || now,
    updatedAt: auctionData.updatedAt || now,
    tags: auctionData.tags || [],
    features: auctionData.features || [],
    documents: auctionData.documents || [],
    inspectionDate: auctionData.inspectionDate,
    inspectionLocation: auctionData.inspectionLocation,
    terms: auctionData.terms || [],
    paymentTerms: auctionData.paymentTerms || '',
    deliveryTerms: auctionData.deliveryTerms || '',
    warranty: auctionData.warranty,
    returnPolicy: auctionData.returnPolicy,
    contactInfo: auctionData.contactInfo || {
      phone: '',
      email: '',
      address: ''
    },
    socialMedia: auctionData.socialMedia || {},
    seo: auctionData.seo || {
      metaTitle: auctionData.title || '',
      metaDescription: auctionData.description || '',
      keywords: []
    },
    analytics: auctionData.analytics || {
      views: 0,
      bids: 0,
      watchers: 0,
      shares: 0
    }
  };
};

// إنشاء بيانات تجريبية للمزادات
const createSampleAuctions = (): Auction[] => {
  const now = new Date();
  const sampleAuctions: Auction[] = [
    {
      id: 'AUCTION-001',
      title: 'مزاد فيلا فاخرة في صلالة',
      description: 'فيلا فاخرة بمساحة 500 متر مربع مع حديقة خاصة وحمام سباحة في موقع مميز بصلالة',
      startingPrice: 175000,
      currentBid: 185000,
      reservePrice: 200000,
      location: 'صلالة، محافظة ظفار',
      type: 'property',
      status: 'live',
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      images: ['/images/villa-1.jpg', '/images/villa-2.jpg', '/images/villa-3.jpg'],
      category: 'فيلا',
      condition: 'excellent',
      seller: {
        id: 'SELLER-001',
        name: 'شركة التطوير العقاري',
        type: 'company',
        rating: 4.8,
        verified: true
      },
      bids: [
        {
          id: 'BID-001',
          bidderId: 'BIDDER-001',
          bidderName: 'أحمد محمد',
          amount: 180000,
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isWinning: false
        },
        {
          id: 'BID-002',
          bidderId: 'BIDDER-002',
          bidderName: 'فاطمة علي',
          amount: 185000,
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
          isWinning: true
        }
      ],
      participants: ['BIDDER-001', 'BIDDER-002', 'BIDDER-003'],
      viewCount: 1250,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      tags: ['فاخرة', 'حديقة', 'حمام سباحة', 'صلالة'],
      features: ['حديقة خاصة', 'حمام سباحة', 'موقف سيارات', 'نظام أمان'],
      documents: ['/documents/villa-deed.pdf', '/documents/villa-survey.pdf'],
      inspectionDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      inspectionLocation: 'صلالة، محافظة ظفار',
      terms: [
        'المزايدة مفتوحة للجميع',
        'الدفع خلال 30 يوم من انتهاء المزاد',
        'رسوم المزاد 2% من قيمة المزايدة الفائزة'
      ],
      paymentTerms: 'الدفع نقداً أو بتحويل بنكي خلال 30 يوم',
      deliveryTerms: 'تسليم المفاتيح بعد استكمال الدفع',
      warranty: 'ضمان سنة واحدة على البنية التحتية',
      returnPolicy: 'لا يمكن إرجاع المزاد بعد انتهائه',
      contactInfo: {
        phone: '+968 1234 5678',
        email: 'info@realestate.com',
        address: 'صلالة، محافظة ظفار'
      },
      socialMedia: {
        facebook: 'https://facebook.com/realestate',
        instagram: 'https://instagram.com/realestate'
      },
      seo: {
        metaTitle: 'مزاد فيلا فاخرة في صلالة - عين عُمان',
        metaDescription: 'فيلا فاخرة بمساحة 500 متر مربع مع حديقة خاصة وحمام سباحة في موقع مميز بصلالة',
        keywords: ['مزاد', 'فيلا', 'صلالة', 'عقار', 'فاخر']
      },
      analytics: {
        views: 1250,
        bids: 2,
        watchers: 15,
        shares: 8
      }
    },
    {
      id: 'AUCTION-002',
      title: 'مزاد شقة حديثة في مسقط',
      description: 'شقة حديثة بمساحة 120 متر مربع في موقع مميز بمسقط مع إطلالة على البحر',
      startingPrice: 80000,
      currentBid: 80000,
      reservePrice: 95000,
      location: 'مسقط، محافظة مسقط',
      type: 'property',
      status: 'upcoming',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      images: ['/images/apartment-1.jpg', '/images/apartment-2.jpg'],
      category: 'شقة',
      condition: 'excellent',
      seller: {
        id: 'SELLER-002',
        name: 'محمد أحمد الشنفري',
        type: 'individual',
        rating: 4.5,
        verified: true
      },
      bids: [],
      participants: [],
      viewCount: 450,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['حديثة', 'إطلالة بحر', 'مسقط', 'شقة'],
      features: ['إطلالة بحر', 'موقف سيارات', 'مصعد', 'نظام أمان'],
      documents: ['/documents/apartment-deed.pdf'],
      inspectionDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      inspectionLocation: 'مسقط، محافظة مسقط',
      terms: [
        'المزايدة مفتوحة للجميع',
        'الدفع خلال 30 يوم من انتهاء المزاد',
        'رسوم المزاد 2% من قيمة المزايدة الفائزة'
      ],
      paymentTerms: 'الدفع نقداً أو بتحويل بنكي خلال 30 يوم',
      deliveryTerms: 'تسليم المفاتيح بعد استكمال الدفع',
      warranty: 'ضمان سنة واحدة على البنية التحتية',
      returnPolicy: 'لا يمكن إرجاع المزاد بعد انتهائه',
      contactInfo: {
        phone: '+968 9876 5432',
        email: 'mohammed@email.com',
        address: 'مسقط، محافظة مسقط'
      },
      socialMedia: {},
      seo: {
        metaTitle: 'مزاد شقة حديثة في مسقط - عين عُمان',
        metaDescription: 'شقة حديثة بمساحة 120 متر مربع في موقع مميز بمسقط مع إطلالة على البحر',
        keywords: ['مزاد', 'شقة', 'مسقط', 'عقار', 'حديث']
      },
      analytics: {
        views: 450,
        bids: 0,
        watchers: 8,
        shares: 3
      }
    },
    {
      id: 'AUCTION-003',
      title: 'مزاد محل تجاري في صحار',
      description: 'محل تجاري بمساحة 80 متر مربع في شارع رئيسي بصحار، مناسب للتجارة',
      startingPrice: 60000,
      currentBid: 65000,
      reservePrice: 70000,
      location: 'صحار، محافظة شمال الباطنة',
      type: 'property',
      status: 'live',
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      images: ['/images/shop-1.jpg', '/images/shop-2.jpg'],
      category: 'محل تجاري',
      condition: 'good',
      seller: {
        id: 'SELLER-003',
        name: 'شركة التجارة والاستثمار',
        type: 'company',
        rating: 4.2,
        verified: true
      },
      bids: [
        {
          id: 'BID-003',
          bidderId: 'BIDDER-004',
          bidderName: 'سالم أحمد',
          amount: 65000,
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          isWinning: true
        }
      ],
      participants: ['BIDDER-004', 'BIDDER-005'],
      viewCount: 780,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      tags: ['تجاري', 'محل', 'صحار', 'شارع رئيسي'],
      features: ['شارع رئيسي', 'موقف سيارات', 'نظام أمان', 'تكييف'],
      documents: ['/documents/shop-deed.pdf', '/documents/shop-license.pdf'],
      inspectionDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      inspectionLocation: 'صحار، محافظة شمال الباطنة',
      terms: [
        'المزايدة مفتوحة للجميع',
        'الدفع خلال 30 يوم من انتهاء المزاد',
        'رسوم المزاد 2% من قيمة المزايدة الفائزة'
      ],
      paymentTerms: 'الدفع نقداً أو بتحويل بنكي خلال 30 يوم',
      deliveryTerms: 'تسليم المفاتيح بعد استكمال الدفع',
      warranty: 'ضمان سنة واحدة على البنية التحتية',
      returnPolicy: 'لا يمكن إرجاع المزاد بعد انتهائه',
      contactInfo: {
        phone: '+968 5555 1234',
        email: 'info@trade.com',
        address: 'صحار، محافظة شمال الباطنة'
      },
      socialMedia: {
        facebook: 'https://facebook.com/trade',
        twitter: 'https://twitter.com/trade'
      },
      seo: {
        metaTitle: 'مزاد محل تجاري في صحار - عين عُمان',
        metaDescription: 'محل تجاري بمساحة 80 متر مربع في شارع رئيسي بصحار، مناسب للتجارة',
        keywords: ['مزاد', 'محل تجاري', 'صحار', 'عقار', 'تجاري']
      },
      analytics: {
        views: 780,
        bids: 1,
        watchers: 12,
        shares: 5
      }
    },
    {
      id: 'AUCTION-004',
      title: 'مزاد فيلا في نزوى',
      description: 'فيلا بمساحة 400 متر مربع مع حديقة واسعة في نزوى',
      startingPrice: 120000,
      currentBid: 120000,
      reservePrice: 140000,
      location: 'نزوى، محافظة الداخلية',
      type: 'property',
      status: 'upcoming',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      images: ['/images/villa-3.jpg', '/images/villa-4.jpg'],
      category: 'فيلا',
      condition: 'good',
      seller: {
        id: 'SELLER-004',
        name: 'علي محمد النزوي',
        type: 'individual',
        rating: 4.0,
        verified: false
      },
      bids: [],
      participants: [],
      viewCount: 320,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['فيلا', 'حديقة', 'نزوى', 'واسعة'],
      features: ['حديقة واسعة', 'موقف سيارات', 'نظام أمان', 'تكييف'],
      documents: ['/documents/villa-deed-2.pdf'],
      inspectionDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      inspectionLocation: 'نزوى، محافظة الداخلية',
      terms: [
        'المزايدة مفتوحة للجميع',
        'الدفع خلال 30 يوم من انتهاء المزاد',
        'رسوم المزاد 2% من قيمة المزايدة الفائزة'
      ],
      paymentTerms: 'الدفع نقداً أو بتحويل بنكي خلال 30 يوم',
      deliveryTerms: 'تسليم المفاتيح بعد استكمال الدفع',
      warranty: 'ضمان سنة واحدة على البنية التحتية',
      returnPolicy: 'لا يمكن إرجاع المزاد بعد انتهائه',
      contactInfo: {
        phone: '+968 7777 8888',
        email: 'ali@email.com',
        address: 'نزوى، محافظة الداخلية'
      },
      socialMedia: {},
      seo: {
        metaTitle: 'مزاد فيلا في نزوى - عين عُمان',
        metaDescription: 'فيلا بمساحة 400 متر مربع مع حديقة واسعة في نزوى',
        keywords: ['مزاد', 'فيلا', 'نزوى', 'عقار', 'حديقة']
      },
      analytics: {
        views: 320,
        bids: 0,
        watchers: 6,
        shares: 2
      }
    },
    {
      id: 'AUCTION-005',
      title: 'مزاد مكتب تجاري في مسقط',
      description: 'مكتب تجاري بمساحة 150 متر مربع في منطقة الأعمال بمسقط',
      startingPrice: 90000,
      currentBid: 95000,
      reservePrice: 110000,
      location: 'مسقط، محافظة مسقط',
      type: 'property',
      status: 'live',
      startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      images: ['/images/office-1.jpg', '/images/office-2.jpg'],
      category: 'مكتب تجاري',
      condition: 'excellent',
      seller: {
        id: 'SELLER-005',
        name: 'شركة الأعمال العقارية',
        type: 'company',
        rating: 4.9,
        verified: true
      },
      bids: [
        {
          id: 'BID-004',
          bidderId: 'BIDDER-006',
          bidderName: 'خالد محمد',
          amount: 95000,
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          isWinning: true
        }
      ],
      participants: ['BIDDER-006', 'BIDDER-007', 'BIDDER-008'],
      viewCount: 1100,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['مكتب', 'تجاري', 'مسقط', 'أعمال'],
      features: ['منطقة أعمال', 'موقف سيارات', 'مصعد', 'نظام أمان', 'تكييف مركزي'],
      documents: ['/documents/office-deed.pdf', '/documents/office-license.pdf'],
      inspectionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      inspectionLocation: 'مسقط، محافظة مسقط',
      terms: [
        'المزايدة مفتوحة للجميع',
        'الدفع خلال 30 يوم من انتهاء المزاد',
        'رسوم المزاد 2% من قيمة المزايدة الفائزة'
      ],
      paymentTerms: 'الدفع نقداً أو بتحويل بنكي خلال 30 يوم',
      deliveryTerms: 'تسليم المفاتيح بعد استكمال الدفع',
      warranty: 'ضمان سنة واحدة على البنية التحتية',
      returnPolicy: 'لا يمكن إرجاع المزاد بعد انتهائه',
      contactInfo: {
        phone: '+968 9999 0000',
        email: 'info@business.com',
        address: 'مسقط، محافظة مسقط'
      },
      socialMedia: {
        facebook: 'https://facebook.com/business',
        instagram: 'https://instagram.com/business',
        twitter: 'https://twitter.com/business'
      },
      seo: {
        metaTitle: 'مزاد مكتب تجاري في مسقط - عين عُمان',
        metaDescription: 'مكتب تجاري بمساحة 150 متر مربع في منطقة الأعمال بمسقط',
        keywords: ['مزاد', 'مكتب تجاري', 'مسقط', 'عقار', 'أعمال']
      },
      analytics: {
        views: 1100,
        bids: 1,
        watchers: 18,
        shares: 7
      }
    }
  ];

  return sampleAuctions;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة المزادات
        let auctions = readAuctions();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (auctions.length === 0) {
          auctions = createSampleAuctions();
          writeAuctions(auctions);
        }

        const { 
          status, 
          type, 
          location, 
          minPrice, 
          maxPrice, 
          sortBy = 'startDate', 
          sortOrder = 'asc',
          page = '1',
          limit = '20'
        } = req.query;

        // تطبيق الفلاتر
        let filteredAuctions = [...auctions];

        if (status && status !== 'all') {
          filteredAuctions = filteredAuctions.filter(a => a.status === status);
        }

        if (type && type !== 'all') {
          filteredAuctions = filteredAuctions.filter(a => a.type === type);
        }

        if (location) {
          filteredAuctions = filteredAuctions.filter(a => 
            a.location.toLowerCase().includes((location as string).toLowerCase())
          );
        }

        if (minPrice) {
          filteredAuctions = filteredAuctions.filter(a => 
            a.startingPrice >= Number(minPrice)
          );
        }

        if (maxPrice) {
          filteredAuctions = filteredAuctions.filter(a => 
            a.startingPrice <= Number(maxPrice)
          );
        }

        // ترتيب النتائج
        filteredAuctions.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'startDate':
              aValue = new Date(a.startDate);
              bValue = new Date(b.startDate);
              break;
            case 'endDate':
              aValue = new Date(a.endDate);
              bValue = new Date(b.endDate);
              break;
            case 'startingPrice':
              aValue = a.startingPrice;
              bValue = b.startingPrice;
              break;
            case 'currentBid':
              aValue = a.currentBid;
              bValue = b.currentBid;
              break;
            case 'viewCount':
              aValue = a.viewCount;
              bValue = b.viewCount;
              break;
            default:
              aValue = new Date(a.startDate);
              bValue = new Date(b.startDate);
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
        const paginatedAuctions = filteredAuctions.slice(startIndex, endIndex);

        res.status(200).json({
          auctions: paginatedAuctions,
          total: filteredAuctions.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredAuctions.length / limitNum),
          filters: {
            status,
            type,
            location,
            minPrice,
            maxPrice,
            sortBy,
            sortOrder
          }
        });
        break;

      case 'POST':
        // إنشاء مزاد جديد
        const {
          title,
          description,
          startingPrice,
          reservePrice,
          location: auctionLocation,
          type,
          startDate,
          endDate,
          images,
          category,
          condition,
          seller,
          tags,
          features,
          documents,
          inspectionDate,
          inspectionLocation,
          terms,
          paymentTerms,
          deliveryTerms,
          warranty,
          returnPolicy,
          contactInfo,
          socialMedia,
          seo
        } = req.body;

        if (!title || !description || !startingPrice || !auctionLocation || !type) {
          return res.status(400).json({
            error: 'Missing required fields: title, description, startingPrice, location, type'
          });
        }

        const newAuction = createAuction({
          title,
          description,
          startingPrice: Number(startingPrice),
          reservePrice: reservePrice ? Number(reservePrice) : undefined,
          location: auctionLocation,
          type,
          startDate,
          endDate,
          images,
          category,
          condition,
          seller,
          tags,
          features,
          documents,
          inspectionDate,
          inspectionLocation,
          terms,
          paymentTerms,
          deliveryTerms,
          warranty,
          returnPolicy,
          contactInfo,
          socialMedia,
          seo
        });

        const existingAuctions = readAuctions();
        const updatedAuctions = [...existingAuctions, newAuction];
        writeAuctions(updatedAuctions);

        res.status(201).json({
          message: 'Auction created successfully',
          auction: newAuction
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in auctions API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}