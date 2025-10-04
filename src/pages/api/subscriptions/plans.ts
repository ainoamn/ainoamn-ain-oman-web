// src/pages/api/subscriptions/plans.ts - API خطط الاشتراك
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  features: {
    id: string;
    name: string;
    description: string;
    included: boolean;
    limit?: number;
    unlimited?: boolean;
  }[];
  limits: {
    properties: number;
    auctions: number;
    customers: number;
    storage: number; // in GB
    apiCalls: number;
    users: number;
    reports: number;
    support: 'email' | 'phone' | 'priority' | 'dedicated';
  };
  restrictions: {
    canCreateProperties: boolean;
    canCreateAuctions: boolean;
    canManageCustomers: boolean;
    canAccessAnalytics: boolean;
    canExportData: boolean;
    canUseAPI: boolean;
    canCustomizeBranding: boolean;
    canWhiteLabel: boolean;
  };
  benefits: string[];
  popular: boolean;
  recommended: boolean;
  discount?: {
    percentage: number;
    validUntil: string;
    description: string;
  };
  trialPeriod: number; // in days
  setupFee?: number;
  cancellationPolicy: string;
  terms: string[];
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const PLANS_FILE = path.join(DATA_DIR, 'subscription-plans.json');

// قراءة الخطط
const readPlans = (): SubscriptionPlan[] => {
  try {
    if (fs.existsSync(PLANS_FILE)) {
      const data = fs.readFileSync(PLANS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading subscription plans:', error);
  }
  return [];
};

// كتابة الخطط
const writePlans = (plans: SubscriptionPlan[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2));
  } catch (error) {
    console.error('Error writing subscription plans:', error);
    throw error;
  }
};

// إنشاء خطة جديدة
const createPlan = (planData: Partial<SubscriptionPlan>): SubscriptionPlan => {
  const now = new Date().toISOString();
  const id = `PLAN-${Date.now()}`;
  
  return {
    id,
    name: planData.name || '',
    description: planData.description || '',
    price: planData.price || 0,
    currency: planData.currency || 'OMR',
    billingCycle: planData.billingCycle || 'monthly',
    features: planData.features || [],
    limits: planData.limits || {
      properties: 0,
      auctions: 0,
      customers: 0,
      storage: 0,
      apiCalls: 0,
      users: 0,
      reports: 0,
      support: 'email'
    },
    restrictions: planData.restrictions || {
      canCreateProperties: false,
      canCreateAuctions: false,
      canManageCustomers: false,
      canAccessAnalytics: false,
      canExportData: false,
      canUseAPI: false,
      canCustomizeBranding: false,
      canWhiteLabel: false
    },
    benefits: planData.benefits || [],
    popular: planData.popular || false,
    recommended: planData.recommended || false,
    discount: planData.discount,
    trialPeriod: planData.trialPeriod || 0,
    setupFee: planData.setupFee,
    cancellationPolicy: planData.cancellationPolicy || '',
    terms: planData.terms || [],
    status: planData.status || 'active',
    createdAt: planData.createdAt || now,
    updatedAt: planData.updatedAt || now,
    createdBy: planData.createdBy || 'ADMIN',
    updatedBy: planData.updatedBy || 'ADMIN'
  };
};

// إنشاء بيانات تجريبية للخطط
const createSamplePlans = (): SubscriptionPlan[] => {
  const now = new Date();
  const samplePlans: SubscriptionPlan[] = [
    {
      id: 'PLAN-001',
      name: 'الخطة الأساسية',
      description: 'خطة مثالية للمبتدئين في إدارة العقارات',
      price: 25,
      currency: 'OMR',
      billingCycle: 'monthly',
      features: [
        {
          id: 'FEAT-001',
          name: 'إدارة العقارات',
          description: 'إضافة وإدارة العقارات',
          included: true,
          limit: 10
        },
        {
          id: 'FEAT-002',
          name: 'إدارة العملاء',
          description: 'إدارة قاعدة بيانات العملاء',
          included: true,
          limit: 50
        },
        {
          id: 'FEAT-003',
          name: 'التقارير الأساسية',
          description: 'تقارير أساسية عن العقارات والعملاء',
          included: true,
          limit: 5
        },
        {
          id: 'FEAT-004',
          name: 'الدعم الفني',
          description: 'دعم فني عبر البريد الإلكتروني',
          included: true
        }
      ],
      limits: {
        properties: 10,
        auctions: 0,
        customers: 50,
        storage: 1,
        apiCalls: 1000,
        users: 2,
        reports: 5,
        support: 'email'
      },
      restrictions: {
        canCreateProperties: true,
        canCreateAuctions: false,
        canManageCustomers: true,
        canAccessAnalytics: false,
        canExportData: false,
        canUseAPI: false,
        canCustomizeBranding: false,
        canWhiteLabel: false
      },
      benefits: [
        'إدارة العقارات الأساسية',
        'إدارة العملاء',
        'التقارير الأساسية',
        'الدعم الفني عبر البريد الإلكتروني'
      ],
      popular: false,
      recommended: false,
      trialPeriod: 14,
      cancellationPolicy: 'يمكن الإلغاء في أي وقت',
      terms: [
        'الدفع مقدماً شهرياً',
        'لا يمكن استرداد المبلغ المدفوع',
        'يتم تجديد الاشتراك تلقائياً'
      ],
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    },
    {
      id: 'PLAN-002',
      name: 'الخطة المتقدمة',
      description: 'خطة شاملة للمطورين العقاريين والشركات',
      price: 75,
      currency: 'OMR',
      billingCycle: 'monthly',
      features: [
        {
          id: 'FEAT-005',
          name: 'إدارة العقارات المتقدمة',
          description: 'إضافة وإدارة العقارات مع ميزات متقدمة',
          included: true,
          limit: 100
        },
        {
          id: 'FEAT-006',
          name: 'إدارة المزادات',
          description: 'إنشاء وإدارة المزادات العقارية',
          included: true,
          limit: 20
        },
        {
          id: 'FEAT-007',
          name: 'إدارة العملاء المتقدمة',
          description: 'إدارة قاعدة بيانات العملاء مع ميزات متقدمة',
          included: true,
          limit: 500
        },
        {
          id: 'FEAT-008',
          name: 'التقارير المتقدمة',
          description: 'تقارير متقدمة وتحليلات مفصلة',
          included: true,
          limit: 50
        },
        {
          id: 'FEAT-009',
          name: 'الدعم الفني المتقدم',
          description: 'دعم فني عبر الهاتف والبريد الإلكتروني',
          included: true
        },
        {
          id: 'FEAT-010',
          name: 'تصدير البيانات',
          description: 'تصدير البيانات والتقارير',
          included: true
        }
      ],
      limits: {
        properties: 100,
        auctions: 20,
        customers: 500,
        storage: 10,
        apiCalls: 10000,
        users: 10,
        reports: 50,
        support: 'phone'
      },
      restrictions: {
        canCreateProperties: true,
        canCreateAuctions: true,
        canManageCustomers: true,
        canAccessAnalytics: true,
        canExportData: true,
        canUseAPI: false,
        canCustomizeBranding: false,
        canWhiteLabel: false
      },
      benefits: [
        'إدارة العقارات المتقدمة',
        'إدارة المزادات',
        'إدارة العملاء المتقدمة',
        'التقارير المتقدمة',
        'الدعم الفني المتقدم',
        'تصدير البيانات'
      ],
      popular: true,
      recommended: true,
      discount: {
        percentage: 20,
        validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'خصم 20% للاشتراك السنوي'
      },
      trialPeriod: 30,
      cancellationPolicy: 'يمكن الإلغاء في أي وقت',
      terms: [
        'الدفع مقدماً شهرياً',
        'لا يمكن استرداد المبلغ المدفوع',
        'يتم تجديد الاشتراك تلقائياً'
      ],
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    },
    {
      id: 'PLAN-003',
      name: 'الخطة الاحترافية',
      description: 'خطة شاملة للشركات الكبيرة والمؤسسات',
      price: 150,
      currency: 'OMR',
      billingCycle: 'monthly',
      features: [
        {
          id: 'FEAT-011',
          name: 'إدارة العقارات الاحترافية',
          description: 'إضافة وإدارة العقارات مع ميزات احترافية',
          included: true,
          unlimited: true
        },
        {
          id: 'FEAT-012',
          name: 'إدارة المزادات الاحترافية',
          description: 'إنشاء وإدارة المزادات العقارية مع ميزات احترافية',
          included: true,
          limit: 100
        },
        {
          id: 'FEAT-013',
          name: 'إدارة العملاء الاحترافية',
          description: 'إدارة قاعدة بيانات العملاء مع ميزات احترافية',
          included: true,
          unlimited: true
        },
        {
          id: 'FEAT-014',
          name: 'التقارير الاحترافية',
          description: 'تقارير احترافية وتحليلات مفصلة',
          included: true,
          unlimited: true
        },
        {
          id: 'FEAT-015',
          name: 'الدعم الفني الاحترافي',
          description: 'دعم فني مخصص ومتقدم',
          included: true
        },
        {
          id: 'FEAT-016',
          name: 'تصدير البيانات المتقدم',
          description: 'تصدير البيانات والتقارير مع تخصيص',
          included: true
        },
        {
          id: 'FEAT-017',
          name: 'واجهة برمجة التطبيقات',
          description: 'وصول كامل لواجهة برمجة التطبيقات',
          included: true
        },
        {
          id: 'FEAT-018',
          name: 'تخصيص العلامة التجارية',
          description: 'تخصيص العلامة التجارية والشعار',
          included: true
        }
      ],
      limits: {
        properties: -1, // unlimited
        auctions: 100,
        customers: -1, // unlimited
        storage: 100,
        apiCalls: 100000,
        users: 50,
        reports: -1, // unlimited
        support: 'dedicated'
      },
      restrictions: {
        canCreateProperties: true,
        canCreateAuctions: true,
        canManageCustomers: true,
        canAccessAnalytics: true,
        canExportData: true,
        canUseAPI: true,
        canCustomizeBranding: true,
        canWhiteLabel: false
      },
      benefits: [
        'إدارة العقارات الاحترافية',
        'إدارة المزادات الاحترافية',
        'إدارة العملاء الاحترافية',
        'التقارير الاحترافية',
        'الدعم الفني الاحترافي',
        'تصدير البيانات المتقدم',
        'واجهة برمجة التطبيقات',
        'تخصيص العلامة التجارية'
      ],
      popular: false,
      recommended: false,
      trialPeriod: 30,
      setupFee: 100,
      cancellationPolicy: 'يمكن الإلغاء في أي وقت مع رسوم إلغاء',
      terms: [
        'الدفع مقدماً شهرياً',
        'رسوم إعداد 100 ريال عماني',
        'لا يمكن استرداد المبلغ المدفوع',
        'يتم تجديد الاشتراك تلقائياً'
      ],
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    },
    {
      id: 'PLAN-004',
      name: 'الخطة المؤسسية',
      description: 'خطة شاملة للمؤسسات الكبيرة مع دعم مخصص',
      price: 300,
      currency: 'OMR',
      billingCycle: 'monthly',
      features: [
        {
          id: 'FEAT-019',
          name: 'إدارة العقارات المؤسسية',
          description: 'إضافة وإدارة العقارات مع ميزات مؤسسية',
          included: true,
          unlimited: true
        },
        {
          id: 'FEAT-020',
          name: 'إدارة المزادات المؤسسية',
          description: 'إنشاء وإدارة المزادات العقارية مع ميزات مؤسسية',
          included: true,
          unlimited: true
        },
        {
          id: 'FEAT-021',
          name: 'إدارة العملاء المؤسسية',
          description: 'إدارة قاعدة بيانات العملاء مع ميزات مؤسسية',
          included: true,
          unlimited: true
        },
        {
          id: 'FEAT-022',
          name: 'التقارير المؤسسية',
          description: 'تقارير مؤسسية وتحليلات مفصلة',
          included: true,
          unlimited: true
        },
        {
          id: 'FEAT-023',
          name: 'الدعم الفني المؤسسي',
          description: 'دعم فني مخصص ومتقدم للمؤسسات',
          included: true
        },
        {
          id: 'FEAT-024',
          name: 'تصدير البيانات المؤسسي',
          description: 'تصدير البيانات والتقارير مع تخصيص كامل',
          included: true
        },
        {
          id: 'FEAT-025',
          name: 'واجهة برمجة التطبيقات المتقدمة',
          description: 'وصول كامل لواجهة برمجة التطبيقات مع دعم مخصص',
          included: true
        },
        {
          id: 'FEAT-026',
          name: 'تخصيص العلامة التجارية المتقدم',
          description: 'تخصيص العلامة التجارية والشعار مع دعم مخصص',
          included: true
        },
        {
          id: 'FEAT-027',
          name: 'العلامة البيضاء',
          description: 'إمكانية استخدام العلامة البيضاء',
          included: true
        }
      ],
      limits: {
        properties: -1, // unlimited
        auctions: -1, // unlimited
        customers: -1, // unlimited
        storage: 1000,
        apiCalls: 1000000,
        users: 200,
        reports: -1, // unlimited
        support: 'dedicated'
      },
      restrictions: {
        canCreateProperties: true,
        canCreateAuctions: true,
        canManageCustomers: true,
        canAccessAnalytics: true,
        canExportData: true,
        canUseAPI: true,
        canCustomizeBranding: true,
        canWhiteLabel: true
      },
      benefits: [
        'إدارة العقارات المؤسسية',
        'إدارة المزادات المؤسسية',
        'إدارة العملاء المؤسسية',
        'التقارير المؤسسية',
        'الدعم الفني المؤسسي',
        'تصدير البيانات المؤسسي',
        'واجهة برمجة التطبيقات المتقدمة',
        'تخصيص العلامة التجارية المتقدم',
        'العلامة البيضاء'
      ],
      popular: false,
      recommended: false,
      trialPeriod: 30,
      setupFee: 500,
      cancellationPolicy: 'يمكن الإلغاء في أي وقت مع رسوم إلغاء',
      terms: [
        'الدفع مقدماً شهرياً',
        'رسوم إعداد 500 ريال عماني',
        'لا يمكن استرداد المبلغ المدفوع',
        'يتم تجديد الاشتراك تلقائياً'
      ],
      status: 'active',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    }
  ];

  return samplePlans;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة الخطط
        let plans = readPlans();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (plans.length === 0) {
          plans = createSamplePlans();
          writePlans(plans);
        }

        const { 
          status = 'active', 
          popular, 
          recommended, 
          billingCycle,
          sortBy = 'price', 
          sortOrder = 'asc'
        } = req.query;

        // تطبيق الفلاتر
        let filteredPlans = [...plans];

        if (status && status !== 'all') {
          filteredPlans = filteredPlans.filter(p => p.status === status);
        }

        if (popular === 'true') {
          filteredPlans = filteredPlans.filter(p => p.popular);
        }

        if (recommended === 'true') {
          filteredPlans = filteredPlans.filter(p => p.recommended);
        }

        if (billingCycle && billingCycle !== 'all') {
          filteredPlans = filteredPlans.filter(p => p.billingCycle === billingCycle);
        }

        // ترتيب النتائج
        filteredPlans.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'price':
              aValue = a.price;
              bValue = b.price;
              break;
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            default:
              aValue = a.price;
              bValue = b.price;
          }

          if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });

        res.status(200).json({
          plans: filteredPlans,
          total: filteredPlans.length,
          filters: {
            status,
            popular,
            recommended,
            billingCycle,
            sortBy,
            sortOrder
          }
        });
        break;

      case 'POST':
        // إنشاء خطة جديدة
        const {
          name,
          description,
          price,
          currency,
          billingCycle: newBillingCycle,
          features,
          limits,
          restrictions,
          benefits,
          popular: newPopular,
          recommended: newRecommended,
          discount,
          trialPeriod,
          setupFee,
          cancellationPolicy,
          terms,
          status: newStatus,
          createdBy,
          updatedBy
        } = req.body;

        if (!name || !description || !price || !currency) {
          return res.status(400).json({
            error: 'Missing required fields: name, description, price, currency'
          });
        }

        const newPlan = createPlan({
          name,
          description,
          price: Number(price),
          currency,
          billingCycle: newBillingCycle,
          features,
          limits,
          restrictions,
          benefits,
          popular: newPopular,
          recommended: newRecommended,
          discount,
          trialPeriod,
          setupFee,
          cancellationPolicy,
          terms,
          status: newStatus,
          createdBy,
          updatedBy
        });

        const existingPlans = readPlans();
        const updatedPlans = [...existingPlans, newPlan];
        writePlans(updatedPlans);

        res.status(201).json({
          message: 'Plan created successfully',
          plan: newPlan
        });
        break;

      case 'PUT':
        // تحديث خطة
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Plan ID is required' });
        }

        const allPlans = readPlans();
        const planIndex = allPlans.findIndex(p => p.id === id);

        if (planIndex === -1) {
          return res.status(404).json({ error: 'Plan not found' });
        }

        const updatedPlan = {
          ...allPlans[planIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
          updatedBy: updateData.updatedBy || allPlans[planIndex].updatedBy
        };

        allPlans[planIndex] = updatedPlan;
        writePlans(allPlans);

        res.status(200).json({
          message: 'Plan updated successfully',
          plan: updatedPlan
        });
        break;

      case 'DELETE':
        // حذف خطة
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Plan ID is required' });
        }

        const plansToDelete = readPlans();
        const deleteIndex = plansToDelete.findIndex(p => p.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Plan not found' });
        }

        plansToDelete.splice(deleteIndex, 1);
        writePlans(plansToDelete);

        res.status(200).json({
          message: 'Plan removed successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in subscription plans API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}