// Role-Based Access Control (RBAC) System
// نظام التحكم في الوصول حسب الدور

// Re-use the canonical UserRole union from user-roles.ts so all modules share the
// same role definitions (includes 'individual_tenant', 'corporate_tenant', etc.).
// Use a wide string type for RBAC roles to remain compatible with
// multiple role enumerations used across the codebase (legacy and new).
export type UserRole = string;
export type Role = UserRole; // backward-compatible alias

export interface UserContext {
  id: string;
  role: UserRole;
  email?: string;
  phone?: string;
  name?: string;
  subscription?: any;
}

/**
 * فلترة العقارات حسب دور المستخدم
 */
export function filterPropertiesByRole(properties: any[], user: UserContext): any[] {
  if (!user) return [];

  switch (user.role) {
    case 'admin':
      // المدير يرى كل شيء
      return properties;

    case 'property_owner':
      // مالك العقار يرى عقاراته فقط
      return properties.filter(p => 
        p.ownerId === user.id || 
        p.createdBy === user.id || 
        p.userId === user.id
      );

    case 'property_manager':
      // مدير العقار يرى العقارات المسندة له
      return properties.filter(p => 
        p.managerId === user.id ||
        p.managers?.includes(user.id) ||
        p.assignedTo === user.id
      );

    case 'tenant':
      // المستأجر يرى فقط العقارات التي استأجرها
      return properties.filter(p => 
        p.tenantId === user.id ||
        p.units?.some((u: any) => u.tenantId === user.id)
      );

    case 'user':
    default:
      // المستخدم العادي يرى العقارات المنشورة فقط
      return properties.filter(p => p.published === true && p.status !== 'hidden');
  }
}

/**
 * فلترة الوحدات حسب دور المستخدم
 */
export function filterUnitsByRole(units: any[], user: UserContext): any[] {
  if (!user) return [];

  switch (user.role) {
    case 'admin':
      // المدير يرى كل الوحدات
      return units;

    case 'property_owner':
      // مالك العقار يرى وحدات عقاراته فقط
      return units.filter(u => 
        u.ownerId === user.id || 
        u.propertyOwnerId === user.id
      );

    case 'property_manager':
      // مدير العقار يرى الوحدات المسندة له
      return units.filter(u => 
        u.managerId === user.id ||
        u.propertyManagerId === user.id
      );

    case 'tenant':
      // المستأجر يرى وحداته المستأجرة فقط
      return units.filter(u => u.tenantId === user.id);

    case 'user':
    default:
      // المستخدم العادي يرى الوحدات المتاحة فقط
      return units.filter(u => u.status === 'available');
  }
}

/**
 * فلترة المهام حسب دور المستخدم
 */
export function filterTasksByRole(tasks: any[], user: UserContext): any[] {
  if (!user) return [];

  switch (user.role) {
    case 'admin':
      return tasks;

    case 'property_owner':
    case 'property_manager':
      // المالك/المدير يرى مهام عقاراته
      return tasks.filter(t => 
        t.assignedTo === user.id ||
        t.createdBy === user.id ||
        t.ownerId === user.id
      );

    case 'tenant':
      // المستأجر يرى مهامه فقط (طلبات الصيانة، إلخ)
      return tasks.filter(t => 
        t.assignedTo === user.id ||
        t.requestedBy === user.id ||
        t.tenantId === user.id
      );

    default:
      return tasks.filter(t => t.assignedTo === user.id);
  }
}

/**
 * فلترة الفواتير حسب دور المستخدم
 */
export function filterInvoicesByRole(invoices: any[], user: UserContext): any[] {
  if (!user) return [];

  switch (user.role) {
    case 'admin':
      return invoices;

    case 'property_owner':
    case 'property_manager':
      // المالك يرى فواتير عقاراته
      return invoices.filter(i => 
        i.ownerId === user.id ||
        i.propertyOwnerId === user.id
      );

    case 'tenant':
      // المستأجر يرى فواتيره فقط
      return invoices.filter(i => 
        i.tenantId === user.id ||
        i.customerId === user.id ||
        i.userId === user.id
      );

    default:
      return invoices.filter(i => i.userId === user.id);
  }
}

/**
 * فلترة الحجوزات حسب دور المستخدم
 */
export function filterBookingsByRole(bookings: any[], user: UserContext): any[] {
  if (!user) return [];

  switch (user.role) {
    case 'admin':
      return bookings;

    case 'property_owner':
    case 'property_manager':
      // المالك يرى حجوزات عقاراته
      return bookings.filter(b => 
        b.ownerId === user.id ||
        b.propertyOwnerId === user.id
      );

    case 'tenant':
    case 'user':
      // المستخدم يرى حجوزاته فقط
      return bookings.filter(b => 
        b.customerId === user.id ||
        b.userId === user.id ||
        b.tenantId === user.id ||
        b.phone === user.phone ||
        b.email === user.email
      );

    default:
      return bookings.filter(b => b.userId === user.id);
  }
}

/**
 * فلترة القضايا القانونية حسب دور المستخدم
 */
export function filterLegalCasesByRole(cases: any[], user: UserContext): any[] {
  if (!user) return [];

  switch (user.role) {
    case 'admin':
      return cases;

    case 'property_owner':
      // المالك يرى قضايا عقاراته
      return cases.filter(c => 
        c.ownerId === user.id ||
        c.propertyOwnerId === user.id ||
        c.createdBy === user.id
      );

    case 'tenant':
      // المستأجر يرى قضاياه فقط
      return cases.filter(c => 
        c.tenantId === user.id ||
        c.defendantId === user.id ||
        c.plaintiffId === user.id
      );

    default:
      return cases.filter(c => c.userId === user.id || c.createdBy === user.id);
  }
}

/**
 * التحقق من صلاحية الوصول لعقار
 */
export function canAccessProperty(property: any, user: UserContext): boolean {
  if (!user || !property) return false;

  // المدير يصل لكل شيء
  if (user.role === 'admin') return true;

  // المالك يصل لعقاراته
  if (property.ownerId === user.id || property.createdBy === user.id) return true;

  // المدير المعيّن
  if (property.managerId === user.id || property.managers?.includes(user.id)) return true;

  // المستأجر يصل للعقارات المستأجرة
  if (property.tenantId === user.id) return true;
  if (property.units?.some((u: any) => u.tenantId === user.id)) return true;

  // منشور للجميع
  if (property.published && property.status !== 'hidden') return true;

  return false;
}

/**
 * التحقق من صلاحية التعديل
 */
export function canEditProperty(property: any, user: UserContext): boolean {
  if (!user || !property) return false;

  // المدير يعدل كل شيء
  if (user.role === 'admin') return true;

  // المالك يعدل عقاراته
  if (property.ownerId === user.id || property.createdBy === user.id) return true;

  // المدير المعيّن (بصلاحيات)
  if (property.managerId === user.id && property.managerPermissions?.includes('edit')) return true;

  return false;
}

/**
 * التحقق من صلاحية الحذف
 */
export function canDeleteProperty(property: any, user: UserContext): boolean {
  if (!user || !property) return false;

  // المدير يحذف كل شيء
  if (user.role === 'admin') return true;

  // المالك فقط يحذف عقاراته
  if (property.ownerId === user.id || property.createdBy === user.id) return true;

  return false;
}

/**
 * الحصول على المستخدم من localStorage
 */
export function getCurrentUser(): UserContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      const userData = JSON.parse(authData);
      return {
        id: userData.id,
        role: userData.role || 'user',
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        subscription: userData.subscription
      };
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  return null;
}

// Re-export permission helper for backward compatibility
export { can } from './authz/permissions';
