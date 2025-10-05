// src/lib/propertyManagement.ts - نظام إدارة العقارات المتكامل
import { UserRole } from './userRoles';
import { SubscriptionPlan } from './subscriptionSystem';

export type PropertyType = 
  | 'apartment' | 'villa' | 'house' | 'land' | 'office' 
  | 'shop' | 'warehouse' | 'building' | 'commercial';

export type PropertyStatus = 
  | 'available' | 'rented' | 'sold' | 'reserved' | 'maintenance' | 'inactive';

export type FinancialStatus = 
  | 'profitable' | 'break_even' | 'loss' | 'pending';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  location: {
    address: string;
    city: string;
    governorate: string;
    coordinates: { lat: number; lng: number };
    landmarks: string[];
  };
  specifications: {
    area: number; // m²
    bedrooms: number;
    bathrooms: number;
    floors: number;
    yearBuilt: number;
    furnished: boolean;
    parking: number;
  };
  pricing: {
    purchasePrice: number;
    rentPrice: number;
    deposit: number;
    maintenanceFee: number;
    utilities: string[];
  };
  amenities: string[];
  images: string[];
  documents: string[];
  financial: {
    monthlyIncome: number;
    monthlyExpenses: number;
    netIncome: number;
    roi: number;
    status: FinancialStatus;
  };
  management: {
    ownerId: string;
    managerId?: string;
    maintenanceSchedule: MaintenanceTask[];
    contracts: Contract[];
    tenants: Tenant[];
  };
  analytics: {
    views: number;
    inquiries: number;
    bookings: number;
    conversionRate: number;
    averageRating: number;
    reviews: Review[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceTask {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  notes: string[];
  images: string[];
}

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  type: 'rental' | 'purchase' | 'maintenance';
  startDate: Date;
  endDate: Date;
  amount: number;
  terms: string[];
  status: 'active' | 'expired' | 'terminated';
  documents: string[];
  payments: Payment[];
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  contractId: string;
  moveInDate: Date;
  moveOutDate?: Date;
  status: 'active' | 'inactive' | 'pending';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    communicationMethod: 'email' | 'sms' | 'phone';
    language: string;
    notifications: boolean;
  };
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  type: 'rent' | 'deposit' | 'maintenance' | 'penalty';
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  method: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  reference: string;
  notes: string;
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
}

export interface PropertyAnalytics {
  propertyId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    views: number;
    inquiries: number;
    bookings: number;
    revenue: number;
    expenses: number;
    netIncome: number;
    occupancyRate: number;
    averageRating: number;
  };
  trends: {
    views: { current: number; previous: number; change: number };
    revenue: { current: number; previous: number; change: number };
    occupancy: { current: number; previous: number; change: number };
  };
  insights: string[];
  recommendations: string[];
}

// نظام إدارة العقارات المتقدم
export class PropertyManagementSystem {
  private properties: Map<string, Property> = new Map();
  private maintenanceTasks: Map<string, MaintenanceTask> = new Map();
  private contracts: Map<string, Contract> = new Map();
  private tenants: Map<string, Tenant> = new Map();

  // إدارة العقارات
  async createProperty(propertyData: Partial<Property>, userRole: UserRole): Promise<Property> {
    if (!this.canManageProperties(userRole)) {
      throw new Error('غير مخول لإدارة العقارات');
    }

    const property: Property = {
      id: `prop_${Date.now()}`,
      title: propertyData.title || 'عقار جديد',
      description: propertyData.description || '',
      type: propertyData.type || 'apartment',
      status: 'available',
      location: propertyData.location || {
        address: '',
        city: '',
        governorate: '',
        coordinates: { lat: 0, lng: 0 },
        landmarks: []
      },
      specifications: propertyData.specifications || {
        area: 0,
        bedrooms: 0,
        bathrooms: 0,
        floors: 1,
        yearBuilt: new Date().getFullYear(),
        furnished: false,
        parking: 0
      },
      pricing: propertyData.pricing || {
        purchasePrice: 0,
        rentPrice: 0,
        deposit: 0,
        maintenanceFee: 0,
        utilities: []
      },
      amenities: propertyData.amenities || [],
      images: propertyData.images || [],
      documents: propertyData.documents || [],
      financial: {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        netIncome: 0,
        roi: 0,
        status: 'pending'
      },
      management: {
        ownerId: propertyData.management?.ownerId || '',
        managerId: propertyData.management?.managerId,
        maintenanceSchedule: [],
        contracts: [],
        tenants: []
      },
      analytics: {
        views: 0,
        inquiries: 0,
        bookings: 0,
        conversionRate: 0,
        averageRating: 0,
        reviews: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.properties.set(property.id, property);
    return property;
  }

  async updateProperty(propertyId: string, updates: Partial<Property>, userRole: UserRole): Promise<Property> {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error('العقار غير موجود');
    }

    if (!this.canEditProperty(property, userRole)) {
      throw new Error('غير مخول لتعديل هذا العقار');
    }

    const updatedProperty = {
      ...property,
      ...updates,
      updatedAt: new Date()
    };

    this.properties.set(propertyId, updatedProperty);
    return updatedProperty;
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    return this.properties.get(propertyId) || null;
  }

  async getProperties(filters?: {
    ownerId?: string;
    status?: PropertyStatus;
    type?: PropertyType;
    city?: string;
  }): Promise<Property[]> {
    let properties = Array.from(this.properties.values());

    if (filters) {
      if (filters.ownerId) {
        properties = properties.filter(p => p.management.ownerId === filters.ownerId);
      }
      if (filters.status) {
        properties = properties.filter(p => p.status === filters.status);
      }
      if (filters.type) {
        properties = properties.filter(p => p.type === filters.type);
      }
      if (filters.city) {
        properties = properties.filter(p => p.location.city === filters.city);
      }
    }

    return properties;
  }

  // إدارة المهام
  async createMaintenanceTask(taskData: Partial<MaintenanceTask>, userRole: UserRole): Promise<MaintenanceTask> {
    if (!this.canManageMaintenance(userRole)) {
      throw new Error('غير مخول لإدارة المهام');
    }

    const task: MaintenanceTask = {
      id: `task_${Date.now()}`,
      propertyId: taskData.propertyId || '',
      title: taskData.title || 'مهمة صيانة جديدة',
      description: taskData.description || '',
      type: taskData.type || 'routine',
      priority: taskData.priority || 'medium',
      status: 'pending',
      assignedTo: taskData.assignedTo || '',
      scheduledDate: taskData.scheduledDate || new Date(),
      cost: taskData.cost || 0,
      notes: taskData.notes || [],
      images: taskData.images || []
    };

    this.maintenanceTasks.set(task.id, task);
    
    // إضافة المهمة إلى جدول الصيانة للعقار
    const property = this.properties.get(task.propertyId);
    if (property) {
      property.management.maintenanceSchedule.push(task);
      this.properties.set(task.propertyId, property);
    }

    return task;
  }

  async updateMaintenanceTask(taskId: string, updates: Partial<MaintenanceTask>, userRole: UserRole): Promise<MaintenanceTask> {
    const task = this.maintenanceTasks.get(taskId);
    if (!task) {
      throw new Error('المهمة غير موجودة');
    }

    if (!this.canManageMaintenance(userRole)) {
      throw new Error('غير مخول لإدارة المهام');
    }

    const updatedTask = { ...task, ...updates };
    this.maintenanceTasks.set(taskId, updatedTask);
    return updatedTask;
  }

  // إدارة العقود
  async createContract(contractData: Partial<Contract>, userRole: UserRole): Promise<Contract> {
    if (!this.canManageContracts(userRole)) {
      throw new Error('غير مخول لإدارة العقود');
    }

    const contract: Contract = {
      id: `contract_${Date.now()}`,
      propertyId: contractData.propertyId || '',
      tenantId: contractData.tenantId || '',
      type: contractData.type || 'rental',
      startDate: contractData.startDate || new Date(),
      endDate: contractData.endDate || new Date(),
      amount: contractData.amount || 0,
      terms: contractData.terms || [],
      status: 'active',
      documents: contractData.documents || [],
      payments: []
    };

    this.contracts.set(contract.id, contract);
    
    // إضافة العقد إلى العقار
    const property = this.properties.get(contract.propertyId);
    if (property) {
      property.management.contracts.push(contract);
      this.properties.set(contract.propertyId, property);
    }

    return contract;
  }

  // إدارة المستأجرين
  async addTenant(tenantData: Partial<Tenant>, userRole: UserRole): Promise<Tenant> {
    if (!this.canManageTenants(userRole)) {
      throw new Error('غير مخول لإدارة المستأجرين');
    }

    const tenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: tenantData.name || '',
      email: tenantData.email || '',
      phone: tenantData.phone || '',
      idNumber: tenantData.idNumber || '',
      contractId: tenantData.contractId || '',
      moveInDate: tenantData.moveInDate || new Date(),
      status: 'active',
      emergencyContact: tenantData.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      preferences: tenantData.preferences || {
        communicationMethod: 'email',
        language: 'ar',
        notifications: true
      }
    };

    this.tenants.set(tenant.id, tenant);
    
    // إضافة المستأجر إلى العقار
    const contract = this.contracts.get(tenant.contractId);
    if (contract) {
      const property = this.properties.get(contract.propertyId);
      if (property) {
        property.management.tenants.push(tenant);
        this.properties.set(contract.propertyId, property);
      }
    }

    return tenant;
  }

  // التحليلات المالية
  async getPropertyAnalytics(propertyId: string, period: 'monthly' | 'yearly'): Promise<PropertyAnalytics> {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error('العقار غير موجود');
    }

    // محاكاة التحليلات
    const analytics: PropertyAnalytics = {
      propertyId,
      period,
      metrics: {
        views: Math.floor(Math.random() * 1000) + 100,
        inquiries: Math.floor(Math.random() * 100) + 10,
        bookings: Math.floor(Math.random() * 50) + 5,
        revenue: property.pricing.rentPrice * (Math.random() * 0.8 + 0.2),
        expenses: property.pricing.maintenanceFee + (Math.random() * 500),
        netIncome: 0,
        occupancyRate: Math.random() * 0.3 + 0.7, // 70-100%
        averageRating: Math.random() * 2 + 3 // 3-5
      },
      trends: {
        views: {
          current: Math.floor(Math.random() * 100) + 50,
          previous: Math.floor(Math.random() * 100) + 30,
          change: Math.floor(Math.random() * 40) - 20
        },
        revenue: {
          current: property.pricing.rentPrice,
          previous: property.pricing.rentPrice * (Math.random() * 0.2 + 0.9),
          change: Math.floor(Math.random() * 20) - 10
        },
        occupancy: {
          current: Math.random() * 0.3 + 0.7,
          previous: Math.random() * 0.3 + 0.6,
          change: Math.floor(Math.random() * 20) - 10
        }
      },
      insights: [
        'العقار يحقق أداءً جيداً في السوق',
        'معدل الإشغال مرتفع',
        'التقييمات إيجابية'
      ],
      recommendations: [
        'تحسين التسويق لزيادة المشاهدات',
        'مراجعة الأسعار لتحسين الإيرادات',
        'تحسين المرافق لزيادة التقييمات'
      ]
    };

    analytics.metrics.netIncome = analytics.metrics.revenue - analytics.metrics.expenses;
    return analytics;
  }

  // التحقق من الصلاحيات
  private canManageProperties(userRole: UserRole): boolean {
    return ['super_admin', 'admin', 'property_manager', 'property_owner', 'developer'].includes(userRole);
  }

  private canEditProperty(property: Property, userRole: UserRole): boolean {
    if (['super_admin', 'admin', 'property_manager'].includes(userRole)) {
      return true;
    }
    if (userRole === 'property_owner' && property.management.ownerId) {
      return true; // يجب التحقق من ownerId مع المستخدم الحالي
    }
    return false;
  }

  private canManageMaintenance(userRole: UserRole): boolean {
    return ['super_admin', 'admin', 'property_manager', 'property_owner'].includes(userRole);
  }

  private canManageContracts(userRole: UserRole): boolean {
    return ['super_admin', 'admin', 'property_manager', 'property_owner', 'agent'].includes(userRole);
  }

  private canManageTenants(userRole: UserRole): boolean {
    return ['super_admin', 'admin', 'property_manager', 'property_owner'].includes(userRole);
  }

  // الحصول على الإحصائيات
  async getDashboardStats(userRole: UserRole, userId?: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    occupancyRate: number;
    pendingMaintenance: number;
    activeContracts: number;
  }> {
    let properties = Array.from(this.properties.values());
    
    if (userRole === 'property_owner' && userId) {
      properties = properties.filter(p => p.management.ownerId === userId);
    }

    const stats = {
      totalProperties: properties.length,
      activeProperties: properties.filter(p => p.status === 'available' || p.status === 'rented').length,
      totalRevenue: properties.reduce((sum, p) => sum + p.financial.monthlyIncome, 0),
      totalExpenses: properties.reduce((sum, p) => sum + p.financial.monthlyExpenses, 0),
      netIncome: 0,
      occupancyRate: 0,
      pendingMaintenance: Array.from(this.maintenanceTasks.values()).filter(t => t.status === 'pending').length,
      activeContracts: Array.from(this.contracts.values()).filter(c => c.status === 'active').length
    };

    stats.netIncome = stats.totalRevenue - stats.totalExpenses;
    stats.occupancyRate = stats.totalProperties > 0 ? stats.activeProperties / stats.totalProperties : 0;

    return stats;
  }
}

// إنشاء مثيل واحد من نظام إدارة العقارات
export const propertyManagementSystem = new PropertyManagementSystem();



