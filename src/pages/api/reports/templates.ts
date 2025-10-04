// src/pages/api/reports/templates.ts - API قوالب التقارير
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'property' | 'customer' | 'auction' | 'subscription' | 'analytics' | 'custom';
  category: 'summary' | 'detailed' | 'comparative' | 'trend' | 'forecast';
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  template: {
    sections: {
      id: string;
      title: string;
      type: 'text' | 'table' | 'chart' | 'image' | 'summary';
      content: any;
      order: number;
    }[];
    styling: {
      theme: 'default' | 'dark' | 'light' | 'corporate';
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
      };
      fonts: {
        title: string;
        body: string;
        header: string;
      };
      layout: {
        orientation: 'portrait' | 'landscape';
        margins: {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
        spacing: number;
      };
    };
    branding: {
      logo?: string;
      companyName?: string;
      contactInfo?: {
        phone?: string;
        email?: string;
        address?: string;
      };
    };
  };
  filters: {
    id: string;
    name: string;
    type: 'date' | 'text' | 'select' | 'multiselect' | 'number' | 'boolean';
    required: boolean;
    options?: any[];
    defaultValue?: any;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }[];
  parameters: {
    id: string;
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: any[];
  }[];
  dataSource: {
    type: 'api' | 'database' | 'file' | 'manual';
    endpoint?: string;
    query?: string;
    file?: string;
    fields: {
      id: string;
      name: string;
      type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
      required: boolean;
      description?: string;
    }[];
  };
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
    canShare: string[];
  };
  isPublic: boolean;
  isDefault: boolean;
  tags: string[];
  version: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'report-templates.json');

// قراءة القوالب
const readTemplates = (): ReportTemplate[] => {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading report templates:', error);
  }
  return [];
};

// كتابة القوالب
const writeTemplates = (templates: ReportTemplate[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
  } catch (error) {
    console.error('Error writing report templates:', error);
    throw error;
  }
};

// إنشاء قالب جديد
const createTemplate = (templateData: Partial<ReportTemplate>): ReportTemplate => {
  const now = new Date().toISOString();
  const id = `TEMPLATE-${Date.now()}`;
  
  return {
    id,
    name: templateData.name || '',
    description: templateData.description || '',
    type: templateData.type || 'custom',
    category: templateData.category || 'summary',
    format: templateData.format || 'pdf',
    template: templateData.template || {
      sections: [],
      styling: {
        theme: 'default',
        colors: {
          primary: '#0d9488',
          secondary: '#14b8a6',
          accent: '#f59e0b',
          background: '#ffffff',
          text: '#000000'
        },
        fonts: {
          title: 'Arial',
          body: 'Arial',
          header: 'Arial'
        },
        layout: {
          orientation: 'portrait',
          margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          },
          spacing: 10
        }
      },
      branding: {}
    },
    filters: templateData.filters || [],
    parameters: templateData.parameters || [],
    dataSource: templateData.dataSource || {
      type: 'api',
      fields: []
    },
    permissions: templateData.permissions || {
      canView: [],
      canEdit: [],
      canDelete: [],
      canShare: []
    },
    isPublic: templateData.isPublic || false,
    isDefault: templateData.isDefault || false,
    tags: templateData.tags || [],
    version: templateData.version || '1.0.0',
    status: templateData.status || 'active',
    createdAt: templateData.createdAt || now,
    updatedAt: templateData.updatedAt || now,
    createdBy: templateData.createdBy || 'USER',
    updatedBy: templateData.updatedBy || 'USER'
  };
};

// إنشاء بيانات تجريبية للقوالب
const createSampleTemplates = (): ReportTemplate[] => {
  const now = new Date();
  const sampleTemplates: ReportTemplate[] = [
    {
      id: 'TEMPLATE-001',
      name: 'تقرير العقارات الشهري',
      description: 'قالب تقرير شهري شامل عن العقارات',
      type: 'property',
      category: 'summary',
      format: 'pdf',
      template: {
        sections: [
          {
            id: 'header',
            title: 'تقرير العقارات الشهري',
            type: 'text',
            content: {
              text: 'تقرير العقارات الشهري',
              style: 'title'
            },
            order: 1
          },
          {
            id: 'summary',
            title: 'ملخص عام',
            type: 'summary',
            content: {
              fields: [
                { name: 'إجمالي العقارات', value: '{{totalProperties}}' },
                { name: 'عقارات جديدة', value: '{{newProperties}}' },
                { name: 'عقارات مباعة', value: '{{soldProperties}}' },
                { name: 'عقارات مستأجرة', value: '{{rentedProperties}}' },
                { name: 'متوسط السعر', value: '{{averagePrice}}' },
                { name: 'إجمالي القيمة', value: '{{totalValue}}' }
              ]
            },
            order: 2
          },
          {
            id: 'byType',
            title: 'العقارات حسب النوع',
            type: 'chart',
            content: {
              type: 'pie',
              data: '{{byType}}',
              title: 'توزيع العقارات حسب النوع'
            },
            order: 3
          },
          {
            id: 'byLocation',
            title: 'العقارات حسب الموقع',
            type: 'chart',
            content: {
              type: 'bar',
              data: '{{byLocation}}',
              title: 'توزيع العقارات حسب الموقع'
            },
            order: 4
          }
        ],
        styling: {
          theme: 'default',
          colors: {
            primary: '#0d9488',
            secondary: '#14b8a6',
            accent: '#f59e0b',
            background: '#ffffff',
            text: '#000000'
          },
          fonts: {
            title: 'Arial',
            body: 'Arial',
            header: 'Arial'
          },
          layout: {
            orientation: 'portrait',
            margins: {
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            },
            spacing: 10
          }
        },
        branding: {
          logo: '/logo.png',
          companyName: 'عين عُمان',
          contactInfo: {
            phone: '+968 1234 5678',
            email: 'info@ainoman.com',
            address: 'مسقط، سلطنة عُمان'
          }
        }
      },
      filters: [
        {
          id: 'dateFrom',
          name: 'من تاريخ',
          type: 'date',
          required: true,
          defaultValue: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'dateTo',
          name: 'إلى تاريخ',
          type: 'date',
          required: true,
          defaultValue: now.toISOString()
        },
        {
          id: 'propertyType',
          name: 'نوع العقار',
          type: 'multiselect',
          required: false,
          options: [
            { value: 'شقة', label: 'شقة' },
            { value: 'فيلا', label: 'فيلا' },
            { value: 'مكتب', label: 'مكتب' },
            { value: 'محل', label: 'محل' },
            { value: 'أرض', label: 'أرض' }
          ]
        },
        {
          id: 'location',
          name: 'الموقع',
          type: 'multiselect',
          required: false,
          options: [
            { value: 'مسقط', label: 'مسقط' },
            { value: 'صلالة', label: 'صلالة' },
            { value: 'نزوى', label: 'نزوى' },
            { value: 'صحار', label: 'صحار' }
          ]
        }
      ],
      parameters: [
        {
          id: 'includeImages',
          name: 'تضمين الصور',
          type: 'boolean',
          required: false,
          defaultValue: true
        },
        {
          id: 'includePrices',
          name: 'تضمين الأسعار',
          type: 'boolean',
          required: false,
          defaultValue: true
        },
        {
          id: 'includeLocation',
          name: 'تضمين الموقع',
          type: 'boolean',
          required: false,
          defaultValue: true
        }
      ],
      dataSource: {
        type: 'api',
        endpoint: '/api/properties/stats',
        fields: [
          { id: 'totalProperties', name: 'إجمالي العقارات', type: 'number', required: true },
          { id: 'newProperties', name: 'عقارات جديدة', type: 'number', required: true },
          { id: 'soldProperties', name: 'عقارات مباعة', type: 'number', required: true },
          { id: 'rentedProperties', name: 'عقارات مستأجرة', type: 'number', required: true },
          { id: 'averagePrice', name: 'متوسط السعر', type: 'number', required: true },
          { id: 'totalValue', name: 'إجمالي القيمة', type: 'number', required: true },
          { id: 'byType', name: 'حسب النوع', type: 'object', required: true },
          { id: 'byLocation', name: 'حسب الموقع', type: 'object', required: true }
        ]
      },
      permissions: {
        canView: ['USER', 'ADMIN'],
        canEdit: ['ADMIN'],
        canDelete: ['ADMIN'],
        canShare: ['USER', 'ADMIN']
      },
      isPublic: false,
      isDefault: true,
      tags: ['عقارات', 'شهري', 'ملخص'],
      version: '1.0.0',
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    },
    {
      id: 'TEMPLATE-002',
      name: 'تقرير المزادات الأسبوعي',
      description: 'قالب تقرير أسبوعي عن المزادات',
      type: 'auction',
      category: 'detailed',
      format: 'excel',
      template: {
        sections: [
          {
            id: 'header',
            title: 'تقرير المزادات الأسبوعي',
            type: 'text',
            content: {
              text: 'تقرير المزادات الأسبوعي',
              style: 'title'
            },
            order: 1
          },
          {
            id: 'summary',
            title: 'ملخص المزادات',
            type: 'summary',
            content: {
              fields: [
                { name: 'إجمالي المزادات', value: '{{totalAuctions}}' },
                { name: 'مزادات مكتملة', value: '{{completedAuctions}}' },
                { name: 'مزادات نشطة', value: '{{activeAuctions}}' },
                { name: 'إجمالي المزايدات', value: '{{totalBids}}' },
                { name: 'إجمالي القيمة', value: '{{totalValue}}' },
                { name: 'متوسط المزايدة', value: '{{averageBid}}' }
              ]
            },
            order: 2
          },
          {
            id: 'auctionsTable',
            title: 'جدول المزادات',
            type: 'table',
            content: {
              headers: ['اسم المزاد', 'النوع', 'السعر الابتدائي', 'المزايدة الحالية', 'الحالة', 'تاريخ الانتهاء'],
              data: '{{auctions}}',
              style: 'striped'
            },
            order: 3
          },
          {
            id: 'topBidders',
            title: 'أفضل المزايدين',
            type: 'table',
            content: {
              headers: ['اسم المزايد', 'عدد المزايدات', 'إجمالي المبلغ'],
              data: '{{topBidders}}',
              style: 'highlighted'
            },
            order: 4
          }
        ],
        styling: {
          theme: 'default',
          colors: {
            primary: '#0d9488',
            secondary: '#14b8a6',
            accent: '#f59e0b',
            background: '#ffffff',
            text: '#000000'
          },
          fonts: {
            title: 'Arial',
            body: 'Arial',
            header: 'Arial'
          },
          layout: {
            orientation: 'landscape',
            margins: {
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            },
            spacing: 10
          }
        },
        branding: {
          logo: '/logo.png',
          companyName: 'عين عُمان',
          contactInfo: {
            phone: '+968 1234 5678',
            email: 'info@ainoman.com',
            address: 'مسقط، سلطنة عُمان'
          }
        }
      },
      filters: [
        {
          id: 'dateFrom',
          name: 'من تاريخ',
          type: 'date',
          required: true,
          defaultValue: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'dateTo',
          name: 'إلى تاريخ',
          type: 'date',
          required: true,
          defaultValue: now.toISOString()
        },
        {
          id: 'status',
          name: 'حالة المزاد',
          type: 'multiselect',
          required: false,
          options: [
            { value: 'upcoming', label: 'قادم' },
            { value: 'live', label: 'نشط' },
            { value: 'ended', label: 'منتهي' },
            { value: 'cancelled', label: 'ملغي' }
          ]
        }
      ],
      parameters: [
        {
          id: 'includeBidders',
          name: 'تضمين المزايدين',
          type: 'boolean',
          required: false,
          defaultValue: true
        },
        {
          id: 'includePrices',
          name: 'تضمين الأسعار',
          type: 'boolean',
          required: false,
          defaultValue: true
        },
        {
          id: 'includeStatus',
          name: 'تضمين الحالة',
          type: 'boolean',
          required: false,
          defaultValue: true
        }
      ],
      dataSource: {
        type: 'api',
        endpoint: '/api/auctions/stats',
        fields: [
          { id: 'totalAuctions', name: 'إجمالي المزادات', type: 'number', required: true },
          { id: 'completedAuctions', name: 'مزادات مكتملة', type: 'number', required: true },
          { id: 'activeAuctions', name: 'مزادات نشطة', type: 'number', required: true },
          { id: 'totalBids', name: 'إجمالي المزايدات', type: 'number', required: true },
          { id: 'totalValue', name: 'إجمالي القيمة', type: 'number', required: true },
          { id: 'averageBid', name: 'متوسط المزايدة', type: 'number', required: true },
          { id: 'auctions', name: 'المزادات', type: 'array', required: true },
          { id: 'topBidders', name: 'أفضل المزايدين', type: 'array', required: true }
        ]
      },
      permissions: {
        canView: ['USER', 'ADMIN'],
        canEdit: ['ADMIN'],
        canDelete: ['ADMIN'],
        canShare: ['USER', 'ADMIN']
      },
      isPublic: false,
      isDefault: true,
      tags: ['مزادات', 'أسبوعي', 'تفصيلي'],
      version: '1.0.0',
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    },
    {
      id: 'TEMPLATE-003',
      name: 'تقرير العملاء الشهري',
      description: 'قالب تقرير شهري عن العملاء',
      type: 'customer',
      category: 'trend',
      format: 'pdf',
      template: {
        sections: [
          {
            id: 'header',
            title: 'تقرير العملاء الشهري',
            type: 'text',
            content: {
              text: 'تقرير العملاء الشهري',
              style: 'title'
            },
            order: 1
          },
          {
            id: 'summary',
            title: 'ملخص العملاء',
            type: 'summary',
            content: {
              fields: [
                { name: 'إجمالي العملاء', value: '{{totalCustomers}}' },
                { name: 'عملاء جدد', value: '{{newCustomers}}' },
                { name: 'عملاء نشطين', value: '{{activeCustomers}}' },
                { name: 'عملاء غير نشطين', value: '{{inactiveCustomers}}' },
                { name: 'متوسط النشاط', value: '{{averageActivity}}%' }
              ]
            },
            order: 2
          },
          {
            id: 'byType',
            title: 'العملاء حسب النوع',
            type: 'chart',
            content: {
              type: 'pie',
              data: '{{byType}}',
              title: 'توزيع العملاء حسب النوع'
            },
            order: 3
          },
          {
            id: 'byLocation',
            title: 'العملاء حسب الموقع',
            type: 'chart',
            content: {
              type: 'bar',
              data: '{{byLocation}}',
              title: 'توزيع العملاء حسب الموقع'
            },
            order: 4
          },
          {
            id: 'topCustomers',
            title: 'أفضل العملاء',
            type: 'table',
            content: {
              headers: ['اسم العميل', 'عدد العقارات', 'إجمالي القيمة'],
              data: '{{topCustomers}}',
              style: 'highlighted'
            },
            order: 5
          }
        ],
        styling: {
          theme: 'default',
          colors: {
            primary: '#0d9488',
            secondary: '#14b8a6',
            accent: '#f59e0b',
            background: '#ffffff',
            text: '#000000'
          },
          fonts: {
            title: 'Arial',
            body: 'Arial',
            header: 'Arial'
          },
          layout: {
            orientation: 'portrait',
            margins: {
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            },
            spacing: 10
          }
        },
        branding: {
          logo: '/logo.png',
          companyName: 'عين عُمان',
          contactInfo: {
            phone: '+968 1234 5678',
            email: 'info@ainoman.com',
            address: 'مسقط، سلطنة عُمان'
          }
        }
      },
      filters: [
        {
          id: 'dateFrom',
          name: 'من تاريخ',
          type: 'date',
          required: true,
          defaultValue: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'dateTo',
          name: 'إلى تاريخ',
          type: 'date',
          required: true,
          defaultValue: now.toISOString()
        },
        {
          id: 'customerType',
          name: 'نوع العميل',
          type: 'multiselect',
          required: false,
          options: [
            { value: 'individual', label: 'فرد' },
            { value: 'company', label: 'شركة' }
          ]
        },
        {
          id: 'location',
          name: 'الموقع',
          type: 'multiselect',
          required: false,
          options: [
            { value: 'مسقط', label: 'مسقط' },
            { value: 'صلالة', label: 'صلالة' },
            { value: 'نزوى', label: 'نزوى' },
            { value: 'صحار', label: 'صحار' }
          ]
        }
      ],
      parameters: [
        {
          id: 'includeActivity',
          name: 'تضمين النشاط',
          type: 'boolean',
          required: false,
          defaultValue: true
        },
        {
          id: 'includeLocation',
          name: 'تضمين الموقع',
          type: 'boolean',
          required: false,
          defaultValue: true
        },
        {
          id: 'includeType',
          name: 'تضمين النوع',
          type: 'boolean',
          required: false,
          defaultValue: true
        }
      ],
      dataSource: {
        type: 'api',
        endpoint: '/api/customers/stats',
        fields: [
          { id: 'totalCustomers', name: 'إجمالي العملاء', type: 'number', required: true },
          { id: 'newCustomers', name: 'عملاء جدد', type: 'number', required: true },
          { id: 'activeCustomers', name: 'عملاء نشطين', type: 'number', required: true },
          { id: 'inactiveCustomers', name: 'عملاء غير نشطين', type: 'number', required: true },
          { id: 'averageActivity', name: 'متوسط النشاط', type: 'number', required: true },
          { id: 'byType', name: 'حسب النوع', type: 'object', required: true },
          { id: 'byLocation', name: 'حسب الموقع', type: 'object', required: true },
          { id: 'topCustomers', name: 'أفضل العملاء', type: 'array', required: true }
        ]
      },
      permissions: {
        canView: ['USER', 'ADMIN'],
        canEdit: ['ADMIN'],
        canDelete: ['ADMIN'],
        canShare: ['USER', 'ADMIN']
      },
      isPublic: false,
      isDefault: true,
      tags: ['عملاء', 'شهري', 'اتجاه'],
      version: '1.0.0',
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    }
  ];

  return sampleTemplates;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة القوالب
        let templates = readTemplates();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (templates.length === 0) {
          templates = createSampleTemplates();
          writeTemplates(templates);
        }

        const { 
          type, 
          category, 
          format, 
          isPublic,
          isDefault,
          status = 'active',
          sortBy = 'name', 
          sortOrder = 'asc'
        } = req.query;

        // تطبيق الفلاتر
        let filteredTemplates = [...templates];

        if (type && type !== 'all') {
          filteredTemplates = filteredTemplates.filter(t => t.type === type);
        }

        if (category && category !== 'all') {
          filteredTemplates = filteredTemplates.filter(t => t.category === category);
        }

        if (format && format !== 'all') {
          filteredTemplates = filteredTemplates.filter(t => t.format === format);
        }

        if (isPublic === 'true') {
          filteredTemplates = filteredTemplates.filter(t => t.isPublic);
        } else if (isPublic === 'false') {
          filteredTemplates = filteredTemplates.filter(t => !t.isPublic);
        }

        if (isDefault === 'true') {
          filteredTemplates = filteredTemplates.filter(t => t.isDefault);
        } else if (isDefault === 'false') {
          filteredTemplates = filteredTemplates.filter(t => !t.isDefault);
        }

        if (status && status !== 'all') {
          filteredTemplates = filteredTemplates.filter(t => t.status === status);
        }

        // ترتيب النتائج
        filteredTemplates.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            case 'updatedAt':
              aValue = new Date(a.updatedAt);
              bValue = new Date(b.updatedAt);
              break;
            case 'version':
              aValue = a.version;
              bValue = b.version;
              break;
            default:
              aValue = a.name;
              bValue = b.name;
          }

          if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });

        res.status(200).json({
          templates: filteredTemplates,
          total: filteredTemplates.length,
          filters: {
            type,
            category,
            format,
            isPublic,
            isDefault,
            status,
            sortBy,
            sortOrder
          }
        });
        break;

      case 'POST':
        // إنشاء قالب جديد
        const {
          name,
          description,
          type: newType,
          category,
          format,
          template,
          filters,
          parameters,
          dataSource,
          permissions,
          isPublic: newIsPublic,
          isDefault,
          tags,
          version,
          status: newStatus,
          createdBy,
          updatedBy
        } = req.body;

        if (!name || !newType || !format) {
          return res.status(400).json({
            error: 'Missing required fields: name, type, format'
          });
        }

        const newTemplate = createTemplate({
          name,
          description,
          type: newType,
          category,
          format,
          template,
          filters,
          parameters,
          dataSource,
          permissions,
          isPublic: newIsPublic,
          isDefault,
          tags,
          version,
          status: newStatus,
          createdBy,
          updatedBy
        });

        const existingTemplates = readTemplates();
        const updatedTemplates = [...existingTemplates, newTemplate];
        writeTemplates(updatedTemplates);

        res.status(201).json({
          message: 'Template created successfully',
          template: newTemplate
        });
        break;

      case 'PUT':
        // تحديث قالب
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Template ID is required' });
        }

        const allTemplates = readTemplates();
        const templateIndex = allTemplates.findIndex(t => t.id === id);

        if (templateIndex === -1) {
          return res.status(404).json({ error: 'Template not found' });
        }

        const updatedTemplate = {
          ...allTemplates[templateIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
          updatedBy: updateData.updatedBy || allTemplates[templateIndex].updatedBy
        };

        allTemplates[templateIndex] = updatedTemplate;
        writeTemplates(allTemplates);

        res.status(200).json({
          message: 'Template updated successfully',
          template: updatedTemplate
        });
        break;

      case 'DELETE':
        // حذف قالب
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Template ID is required' });
        }

        const templatesToDelete = readTemplates();
        const deleteIndex = templatesToDelete.findIndex(t => t.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Template not found' });
        }

        templatesToDelete.splice(deleteIndex, 1);
        writeTemplates(templatesToDelete);

        res.status(200).json({
          message: 'Template removed successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in report templates API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}