// src/lib/theme-colors.ts - نظام الألوان الموحد للموقع
/**
 * نظام الألوان الموحد
 * جميع صفحات الموقع تستخدم هذه الألوان لضمان التناسق
 */

export const THEME_COLORS = {
  // الألوان الرئيسية
  primary: {
    main: 'blue-600',
    light: 'blue-500',
    dark: 'blue-700',
    bg: 'blue-50',
    border: 'blue-200',
    text: 'blue-900',
    gradient: 'from-blue-600 to-indigo-600'
  },
  
  // الألوان الثانوية
  secondary: {
    main: 'indigo-600',
    light: 'indigo-500',
    dark: 'indigo-700',
    bg: 'indigo-50',
    border: 'indigo-200',
    text: 'indigo-900'
  },
  
  // النجاح والإيجابي
  success: {
    main: 'green-600',
    light: 'green-500',
    dark: 'green-700',
    bg: 'green-50',
    border: 'green-200',
    text: 'green-900'
  },
  
  // التحذيرات
  warning: {
    main: 'orange-600',
    light: 'orange-500',
    dark: 'orange-700',
    bg: 'orange-50',
    border: 'orange-200',
    text: 'orange-900'
  },
  
  // الأخطاء والسلبي
  danger: {
    main: 'red-600',
    light: 'red-500',
    dark: 'red-700',
    bg: 'red-50',
    border: 'red-200',
    text: 'red-900'
  },
  
  // المعلومات
  info: {
    main: 'blue-600',
    light: 'blue-500',
    dark: 'blue-700',
    bg: 'blue-50',
    border: 'blue-200',
    text: 'blue-900'
  },
  
  // محايد
  neutral: {
    main: 'gray-600',
    light: 'gray-500',
    dark: 'gray-700',
    bg: 'gray-50',
    border: 'gray-200',
    text: 'gray-900'
  }
};

// أسماء الفئات CSS الجاهزة
export const getButtonClass = (variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' = 'primary') => {
  const variants = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white`,
    success: `bg-green-600 hover:bg-green-700 text-white`,
    warning: `bg-orange-600 hover:bg-orange-700 text-white`,
    danger: `bg-red-600 hover:bg-red-700 text-white`,
    neutral: `bg-gray-600 hover:bg-gray-700 text-white`
  };
  return `${variants[variant]} px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all`;
};

export const getCardClass = (variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' = 'neutral') => {
  const variants = {
    primary: `bg-blue-50 border-blue-200`,
    success: `bg-green-50 border-green-200`,
    warning: `bg-orange-50 border-orange-200`,
    danger: `bg-red-50 border-red-200`,
    neutral: `bg-white border-gray-200`
  };
  return `${variants[variant]} border-2 rounded-xl shadow-sm p-6`;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // حالات عامة
    'active': 'bg-green-100 text-green-800 border-green-300',
    'inactive': 'bg-gray-100 text-gray-800 border-gray-300',
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'approved': 'bg-green-100 text-green-800 border-green-300',
    'rejected': 'bg-red-100 text-red-800 border-red-300',
    
    // حالات الفواتير
    'draft': 'bg-gray-100 text-gray-800 border-gray-300',
    'sent': 'bg-blue-100 text-blue-800 border-blue-300',
    'viewed': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'paid': 'bg-green-100 text-green-800 border-green-300',
    'partial': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'overdue': 'bg-red-100 text-red-800 border-red-300',
    'cancelled': 'bg-gray-100 text-gray-600 border-gray-300',
    
    // حالات عروض الأسعار
    'accepted': 'bg-green-100 text-green-800 border-green-300',
    'expired': 'bg-orange-100 text-orange-800 border-orange-300',
    'converted': 'bg-blue-100 text-blue-800 border-blue-300'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    'active': 'نشط',
    'inactive': 'غير نشط',
    'pending': 'قيد الانتظار',
    'approved': 'موافق عليه',
    'rejected': 'مرفوض',
    'draft': 'مسودة',
    'sent': 'مرسلة',
    'viewed': 'تم عرضها',
    'paid': 'مدفوعة',
    'partial': 'مدفوعة جزئياً',
    'overdue': 'متأخرة',
    'cancelled': 'ملغاة',
    'accepted': 'مقبول',
    'expired': 'منتهي',
    'converted': 'تم تحويله'
  };
  
  return statusTexts[status] || status;
};

// التدرجات الموحدة
export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  success: 'bg-gradient-to-r from-green-600 to-emerald-600',
  warning: 'bg-gradient-to-r from-orange-600 to-amber-600',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600',
  neutral: 'bg-gradient-to-r from-gray-600 to-slate-600',
  
  // تدرجات الخلفية
  bgPrimary: 'bg-gradient-to-br from-gray-50 to-blue-50',
  bgSuccess: 'bg-gradient-to-br from-gray-50 to-green-50',
  bgWarning: 'bg-gradient-to-br from-gray-50 to-orange-50',
  bgNeutral: 'bg-gradient-to-br from-gray-50 to-slate-50'
};

// الصفحات وألوانها الموحدة
export const PAGE_THEMES = {
  financial: {
    primary: 'blue',
    gradient: GRADIENTS.primary,
    bg: GRADIENTS.bgPrimary
  },
  sales: {
    primary: 'blue',
    gradient: GRADIENTS.primary,
    bg: GRADIENTS.bgPrimary
  },
  purchases: {
    primary: 'blue',
    gradient: GRADIENTS.primary,
    bg: GRADIENTS.bgPrimary
  },
  payroll: {
    primary: 'blue',
    gradient: GRADIENTS.primary,
    bg: GRADIENTS.bgPrimary
  },
  inventory: {
    primary: 'blue',
    gradient: GRADIENTS.primary,
    bg: GRADIENTS.bgPrimary
  },
  reports: {
    primary: 'blue',
    gradient: GRADIENTS.primary,
    bg: GRADIENTS.bgPrimary
  }
};

