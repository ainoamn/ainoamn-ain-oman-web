// scripts/init-roles-config.js
// تهيئة الأدوار الافتراضية في localStorage

console.log('🚀 Initializing roles configuration...\n');

const DEFAULT_ROLES = [
  {
    id: 'company_admin',
    name: { ar: 'مدير الشركة', en: 'Company Admin' },
    description: { ar: 'صلاحيات كاملة لإدارة النظام', en: 'Full system administration' },
    permissions: ['*'],
    color: 'red',
    icon: '🏢',
    isActive: true
  },
  {
    id: 'property_owner',
    name: { ar: 'مالك عقار', en: 'Property Owner' },
    description: { ar: 'مالك عقار يدير عقاراته الخاصة', en: 'Property owner managing own properties' },
    permissions: ['view_properties', 'add_property', 'edit_property', 'manage_units', 'view_financial', 'create_invoice', 'edit_invoice', 'view_maintenance', 'create_maintenance', 'manage_tasks', 'view_basic_reports'],
    color: 'green',
    icon: '👑',
    isActive: true
  },
  {
    id: 'property_manager',
    name: { ar: 'مدير عقار', en: 'Property Manager' },
    description: { ar: 'مدير مفوض لإدارة العقارات', en: 'Authorized manager for properties' },
    permissions: ['view_properties', 'edit_property', 'manage_units', 'view_maintenance', 'create_maintenance', 'assign_maintenance', 'manage_tasks'],
    color: 'purple',
    icon: '🎯',
    isActive: true
  },
  {
    id: 'accountant',
    name: { ar: 'محاسب', en: 'Accountant' },
    description: { ar: 'محاسب يدير المالية والفواتير', en: 'Accountant managing finances and invoices' },
    permissions: ['view_financial', 'create_invoice', 'edit_invoice', 'delete_invoice', 'manage_checks', 'view_reports', 'view_advanced_reports', 'export_reports'],
    color: 'yellow',
    icon: '💰',
    isActive: true
  },
  {
    id: 'legal_advisor',
    name: { ar: 'مستشار قانوني', en: 'Legal Advisor' },
    description: { ar: 'مستشار قانوني للقضايا والعقود', en: 'Legal advisor for cases and contracts' },
    permissions: ['view_legal', 'create_legal_case', 'edit_legal_case'],
    color: 'red',
    icon: '⚖️',
    isActive: true
  },
  {
    id: 'sales_agent',
    name: { ar: 'مندوب مبيعات', en: 'Sales Agent' },
    description: { ar: 'مندوب مبيعات للتسويق والعقارات', en: 'Sales agent for marketing and properties' },
    permissions: ['view_properties', 'add_property', 'view_maintenance', 'manage_tasks'],
    color: 'cyan',
    icon: '📊',
    isActive: true
  },
  {
    id: 'maintenance_staff',
    name: { ar: 'فني صيانة', en: 'Maintenance Staff' },
    description: { ar: 'فني صيانة للعقارات', en: 'Maintenance staff for properties' },
    permissions: ['view_maintenance', 'manage_tasks'],
    color: 'gray',
    icon: '🔧',
    isActive: true
  },
  {
    id: 'tenant',
    name: { ar: 'مستأجر', en: 'Tenant' },
    description: { ar: 'مستأجر يستخدم الوحدات', en: 'Tenant using units' },
    permissions: ['view_properties', 'view_maintenance', 'create_maintenance'],
    color: 'teal',
    icon: '👤',
    isActive: true
  },
  {
    id: 'investor',
    name: { ar: 'مستثمر', en: 'Investor' },
    description: { ar: 'مستثمر يتابع العقارات والتقارير', en: 'Investor tracking properties and reports' },
    permissions: ['view_properties', 'view_financial', 'view_reports', 'view_analytics'],
    color: 'pink',
    icon: '💼',
    isActive: true
  },
  {
    id: 'customer_viewer',
    name: { ar: 'عميل متصفح', en: 'Customer Viewer' },
    description: { ar: 'عميل يتصفح العقارات فقط', en: 'Customer browsing properties only' },
    permissions: ['view_properties'],
    color: 'gray',
    icon: '👁️',
    isActive: true
  }
];

console.log(`✅ Default roles: ${DEFAULT_ROLES.length} roles`);
console.log('📝 Roles:', DEFAULT_ROLES.map(r => r.name.ar).join(', '));
console.log('\n💾 Writing to: public/roles-config.json...');

const fs = require('fs');
const path = require('path');

// حفظ في ملف JSON
const outputPath = path.join(process.cwd(), 'public', 'roles-config.json');
fs.writeFileSync(outputPath, JSON.stringify(DEFAULT_ROLES, null, 2), 'utf8');

console.log('✅ Roles configuration saved successfully!');
console.log('📍 Location:', outputPath);
console.log('\n🎯 Next steps:');
console.log('1. افتح: http://localhost:3000/admin/roles-permissions');
console.log('2. ستقوم الصفحة بتحميل الأدوار تلقائياً');
console.log('3. ستُحفظ في localStorage تلقائياً');
console.log('\n✅ Done!');

