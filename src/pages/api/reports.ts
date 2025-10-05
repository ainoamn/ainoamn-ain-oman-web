// src/pages/api/reports.ts - API التقارير
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'property' | 'customer' | 'auction' | 'subscription' | 'analytics' | 'custom';
  category: 'summary' | 'detailed' | 'comparative' | 'trend' | 'forecast';
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'archived';
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  data: any;
  filters: {
    dateFrom?: string;
    dateTo?: string;
    propertyType?: string;
    location?: string;
    status?: string;
    userId?: string;
    planId?: string;
    [key: string]: any;
  };
  parameters: {
    [key: string]: any;
  };
  generatedBy: string;
  generatedAt: string;
  expiresAt?: string;
  filePath?: string;
  fileSize?: number;
  downloadCount: number;
  isPublic: boolean;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

// قراءة التقارير
const readReports = (): Report[] => {
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading reports:', error);
  }
  return [];
};

// كتابة التقارير
const writeReports = (reports: Report[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  } catch (error) {
    console.error('Error writing reports:', error);
    throw error;
  }
};

// إنشاء تقرير جديد
const createReport = (reportData: Partial<Report>): Report => {
  const now = new Date().toISOString();
  const id = `REPORT-${Date.now()}`;
  
  return {
    id,
    title: reportData.title || '',
    description: reportData.description || '',
    type: reportData.type || 'custom',
    category: reportData.category || 'summary',
    status: reportData.status || 'draft',
    format: reportData.format || 'pdf',
    data: reportData.data || {},
    filters: reportData.filters || {},
    parameters: reportData.parameters || {},
    generatedBy: reportData.generatedBy || '',
    generatedAt: reportData.generatedAt || now,
    expiresAt: reportData.expiresAt,
    filePath: reportData.filePath,
    fileSize: reportData.fileSize,
    downloadCount: reportData.downloadCount || 0,
    isPublic: reportData.isPublic || false,
    tags: reportData.tags || [],
    notes: reportData.notes,
    createdAt: reportData.createdAt || now,
    updatedAt: reportData.updatedAt || now,
    createdBy: reportData.createdBy || 'USER',
    updatedBy: reportData.updatedBy || 'USER'
  };
};

// إنشاء بيانات تجريبية للتقارير
const createSampleReports = (): Report[] => {
  const now = new Date();
  const sampleReports: Report[] = [
    {
      id: 'REPORT-001',
      title: 'تقرير العقارات الشهري',
      description: 'تقرير شامل عن العقارات المضافة والمباعة خلال الشهر الماضي',
      type: 'property',
      category: 'summary',
      status: 'completed',
      format: 'pdf',
      data: {
        totalProperties: 150,
        newProperties: 25,
        soldProperties: 12,
        rentedProperties: 18,
        averagePrice: 125000,
        totalValue: 18750000,
        byType: {
          'شقة': 45,
          'فيلا': 30,
          'مكتب': 25,
          'محل': 20,
          'أرض': 30
        },
        byLocation: {
          'مسقط': 60,
          'صلالة': 25,
          'نزوى': 20,
          'صحار': 15,
          'أخرى': 30
        }
      },
      filters: {
        dateFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: now.toISOString()
      },
      parameters: {
        includeImages: true,
        includePrices: true,
        includeLocation: true
      },
      generatedBy: 'SYSTEM',
      generatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/reports/property-monthly-report.pdf',
      fileSize: 2048576,
      downloadCount: 15,
      isPublic: false,
      tags: ['عقارات', 'شهري', 'ملخص'],
      notes: 'تقرير تلقائي شهري',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM'
    },
    {
      id: 'REPORT-002',
      title: 'تقرير المزادات الأسبوعي',
      description: 'تقرير عن المزادات المنعقدة والنتائج خلال الأسبوع الماضي',
      type: 'auction',
      category: 'detailed',
      status: 'completed',
      format: 'excel',
      data: {
        totalAuctions: 8,
        completedAuctions: 6,
        activeAuctions: 2,
        totalBids: 45,
        totalValue: 850000,
        averageBid: 18889,
        byStatus: {
          'مكتمل': 6,
          'نشط': 2,
          'ملغي': 0
        },
        topBidders: [
          { name: 'أحمد محمد', bids: 8, total: 125000 },
          { name: 'فاطمة علي', bids: 6, total: 95000 },
          { name: 'خالد سالم', bids: 5, total: 75000 }
        ]
      },
      filters: {
        dateFrom: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: now.toISOString()
      },
      parameters: {
        includeBidders: true,
        includePrices: true,
        includeStatus: true
      },
      generatedBy: 'USER-001',
      generatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/reports/auction-weekly-report.xlsx',
      fileSize: 1024768,
      downloadCount: 8,
      isPublic: false,
      tags: ['مزادات', 'أسبوعي', 'تفصيلي'],
      notes: 'تقرير أسبوعي للمزادات',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      createdBy: 'USER-001',
      updatedBy: 'USER-001'
    },
    {
      id: 'REPORT-003',
      title: 'تقرير العملاء الشهري',
      description: 'تقرير عن العملاء الجدد والنشطين خلال الشهر الماضي',
      type: 'customer',
      category: 'trend',
      status: 'completed',
      format: 'pdf',
      data: {
        totalCustomers: 250,
        newCustomers: 35,
        activeCustomers: 180,
        inactiveCustomers: 35,
        averageActivity: 85,
        byType: {
          'فرد': 180,
          'شركة': 70
        },
        byLocation: {
          'مسقط': 120,
          'صلالة': 45,
          'نزوى': 30,
          'صحار': 25,
          'أخرى': 30
        },
        topCustomers: [
          { name: 'أحمد محمد العبري', properties: 5, value: 250000 },
          { name: 'فاطمة علي الشنفري', properties: 3, value: 180000 },
          { name: 'خالد سالم النزوي', properties: 4, value: 220000 }
        ]
      },
      filters: {
        dateFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: now.toISOString()
      },
      parameters: {
        includeActivity: true,
        includeLocation: true,
        includeType: true
      },
      generatedBy: 'USER-002',
      generatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/reports/customer-monthly-report.pdf',
      fileSize: 1536000,
      downloadCount: 12,
      isPublic: false,
      tags: ['عملاء', 'شهري', 'اتجاه'],
      notes: 'تقرير شهري للعملاء',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      createdBy: 'USER-002',
      updatedBy: 'USER-002'
    },
    {
      id: 'REPORT-004',
      title: 'تقرير الاشتراكات الربعي',
      description: 'تقرير شامل عن الاشتراكات والإيرادات خلال الربع الماضي',
      type: 'subscription',
      category: 'financial',
      status: 'completed',
      format: 'excel',
      data: {
        totalSubscriptions: 45,
        activeSubscriptions: 38,
        trialSubscriptions: 5,
        cancelledSubscriptions: 2,
        totalRevenue: 11250,
        averageRevenue: 250,
        byPlan: {
          'الخطة الأساسية': 15,
          'الخطة المتقدمة': 20,
          'الخطة الاحترافية': 8,
          'الخطة المؤسسية': 2
        },
        byStatus: {
          'نشط': 38,
          'تجربة': 5,
          'ملغي': 2
        },
        revenueByPlan: {
          'الخطة الأساسية': 375,
          'الخطة المتقدمة': 1500,
          'الخطة الاحترافية': 1200,
          'الخطة المؤسسية': 600
        }
      },
      filters: {
        dateFrom: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: now.toISOString()
      },
      parameters: {
        includeRevenue: true,
        includePlans: true,
        includeStatus: true
      },
      generatedBy: 'ADMIN',
      generatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/reports/subscription-quarterly-report.xlsx',
      fileSize: 2048000,
      downloadCount: 5,
      isPublic: false,
      tags: ['اشتراكات', 'ربعي', 'مالي'],
      notes: 'تقرير رباعي للاشتراكات',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    },
    {
      id: 'REPORT-005',
      title: 'تقرير التحليلات السنوي',
      description: 'تقرير شامل عن الأداء والاتجاهات خلال السنة الماضية',
      type: 'analytics',
      category: 'forecast',
      status: 'generating',
      format: 'pdf',
      data: {},
      filters: {
        dateFrom: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: now.toISOString()
      },
      parameters: {
        includeForecast: true,
        includeTrends: true,
        includeComparisons: true
      },
      generatedBy: 'SYSTEM',
      generatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      downloadCount: 0,
      isPublic: false,
      tags: ['تحليلات', 'سنوي', 'تنبؤ'],
      notes: 'تقرير سنوي شامل',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM'
    },
    {
      id: 'REPORT-006',
      title: 'تقرير مخصص - العقارات في مسقط',
      description: 'تقرير مخصص عن العقارات المتاحة في مسقط',
      type: 'custom',
      category: 'detailed',
      status: 'completed',
      format: 'csv',
      data: {
        totalProperties: 45,
        availableProperties: 32,
        reservedProperties: 8,
        rentedProperties: 5,
        averagePrice: 95000,
        priceRange: {
          min: 25000,
          max: 250000
        },
        byType: {
          'شقة': 20,
          'فيلا': 15,
          'مكتب': 7,
          'محل': 3
        }
      },
      filters: {
        location: 'مسقط',
        status: 'available'
      },
      parameters: {
        includePrices: true,
        includeImages: false,
        includeDescription: true
      },
      generatedBy: 'USER-003',
      generatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/reports/custom-muscat-properties.csv',
      fileSize: 512000,
      downloadCount: 3,
      isPublic: true,
      tags: ['مخصص', 'مسقط', 'عقارات'],
      notes: 'تقرير مخصص للعقارات في مسقط',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      createdBy: 'USER-003',
      updatedBy: 'USER-003'
    }
  ];

  return sampleReports;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة التقارير
        let reports = readReports();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (reports.length === 0) {
          reports = createSampleReports();
          writeReports(reports);
        }

        const { 
          type, 
          category, 
          status, 
          format, 
          userId,
          isPublic,
          sortBy = 'generatedAt', 
          sortOrder = 'desc',
          page = '1',
          limit = '20'
        } = req.query;

        // تطبيق الفلاتر
        let filteredReports = [...reports];

        if (type && type !== 'all') {
          filteredReports = filteredReports.filter(r => r.type === type);
        }

        if (category && category !== 'all') {
          filteredReports = filteredReports.filter(r => r.category === category);
        }

        if (status && status !== 'all') {
          filteredReports = filteredReports.filter(r => r.status === status);
        }

        if (format && format !== 'all') {
          filteredReports = filteredReports.filter(r => r.format === format);
        }

        if (userId) {
          filteredReports = filteredReports.filter(r => r.createdBy === userId);
        }

        if (isPublic === 'true') {
          filteredReports = filteredReports.filter(r => r.isPublic);
        } else if (isPublic === 'false') {
          filteredReports = filteredReports.filter(r => !r.isPublic);
        }

        // ترتيب النتائج
        filteredReports.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'generatedAt':
              aValue = new Date(a.generatedAt);
              bValue = new Date(b.generatedAt);
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            case 'title':
              aValue = a.title;
              bValue = b.title;
              break;
            case 'downloadCount':
              aValue = a.downloadCount;
              bValue = b.downloadCount;
              break;
            default:
              aValue = new Date(a.generatedAt);
              bValue = new Date(b.generatedAt);
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
        const paginatedReports = filteredReports.slice(startIndex, endIndex);

        res.status(200).json({
          reports: paginatedReports,
          total: filteredReports.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredReports.length / limitNum),
          filters: {
            type,
            category,
            status,
            format,
            userId,
            isPublic,
            sortBy,
            sortOrder
          }
        });
        break;

      case 'POST':
        // إنشاء تقرير جديد
        const {
          title,
          description,
          type: newType,
          category,
          format,
          data,
          filters,
          parameters,
          generatedBy,
          expiresAt,
          isPublic: newIsPublic,
          tags,
          notes,
          createdBy,
          updatedBy
        } = req.body;

        if (!title || !newType || !format) {
          return res.status(400).json({
            error: 'Missing required fields: title, type, format'
          });
        }

        const newReport = createReport({
          title,
          description,
          type: newType,
          category,
          format,
          data,
          filters,
          parameters,
          generatedBy,
          expiresAt,
          isPublic: newIsPublic,
          tags,
          notes,
          createdBy,
          updatedBy
        });

        const existingReports = readReports();
        const updatedReports = [...existingReports, newReport];
        writeReports(updatedReports);

        res.status(201).json({
          message: 'Report created successfully',
          report: newReport
        });
        break;

      case 'PUT':
        // تحديث تقرير
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Report ID is required' });
        }

        const allReports = readReports();
        const reportIndex = allReports.findIndex(r => r.id === id);

        if (reportIndex === -1) {
          return res.status(404).json({ error: 'Report not found' });
        }

        const updatedReport = {
          ...allReports[reportIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
          updatedBy: updateData.updatedBy || allReports[reportIndex].updatedBy
        };

        allReports[reportIndex] = updatedReport;
        writeReports(allReports);

        res.status(200).json({
          message: 'Report updated successfully',
          report: updatedReport
        });
        break;

      case 'DELETE':
        // حذف تقرير
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Report ID is required' });
        }

        const reportsToDelete = readReports();
        const deleteIndex = reportsToDelete.findIndex(r => r.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Report not found' });
        }

        reportsToDelete.splice(deleteIndex, 1);
        writeReports(reportsToDelete);

        res.status(200).json({
          message: 'Report removed successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in reports API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}