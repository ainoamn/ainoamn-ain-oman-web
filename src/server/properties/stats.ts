// @ts-nocheck
import { getAllTasks } from '@/server/tasks';
import { getAllInvoices } from '@/server/invoices';
import { getAllReservations } from '@/server/reservations';
import { getAllContracts } from '@/server/contracts';

export interface PropertyStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
  maintenanceCosts: number;
  legalIssues: number;
  documents: number;
}

export async function getPropertyStats(propertyId: string): Promise<PropertyStats> {
  try {
    // جلب المهام
    const tasks = await getAllTasks();
    const propertyTasks = tasks.filter(task => task.propertyId === propertyId);
    
    // جلب الفواتير
    const invoices = await getAllInvoices();
    const propertyInvoices = invoices.filter(invoice => invoice.propertyId === propertyId);
    
    // جلب الحجوزات
    const reservations = await getAllReservations();
    const propertyReservations = reservations.filter(reservation => reservation.propertyId === propertyId);
    
    // جلب العقود
    const contracts = await getAllContracts();
    const propertyContracts = contracts.filter(contract => contract.propertyId === propertyId);

    // حساب الإحصائيات
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats: PropertyStats = {
      // إحصائيات المهام
      totalTasks: propertyTasks.length,
      completedTasks: propertyTasks.filter(task => task.status === 'completed').length,
      pendingTasks: propertyTasks.filter(task => task.status === 'open' || task.status === 'in_progress').length,
      overdueTasks: propertyTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
      ).length,

      // إحصائيات الفواتير
      totalInvoices: propertyInvoices.length,
      paidInvoices: propertyInvoices.filter(invoice => invoice.status === 'paid').length,
      pendingInvoices: propertyInvoices.filter(invoice => invoice.status === 'pending').length,
      overdueInvoices: propertyInvoices.filter(invoice => 
        invoice.dueAt && new Date(invoice.dueAt) < now && invoice.status !== 'paid'
      ).length,

      // إحصائيات العقود
      totalContracts: propertyContracts.length,
      activeContracts: propertyContracts.filter(contract => 
        contract.status === 'active' && 
        contract.endDate && new Date(contract.endDate) > now
      ).length,
      expiredContracts: propertyContracts.filter(contract => 
        contract.endDate && new Date(contract.endDate) < now
      ).length,

      // إحصائيات الحجوزات
      totalReservations: propertyReservations.length,
      activeReservations: propertyReservations.filter(reservation => 
        reservation.status === 'active' || reservation.status === 'confirmed'
      ).length,
      completedReservations: propertyReservations.filter(reservation => 
        reservation.status === 'completed'
      ).length,

      // الإيرادات
      totalRevenue: propertyInvoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
      
      monthlyRevenue: propertyInvoices
        .filter(invoice => {
          if (invoice.status !== 'paid' || !invoice.issuedAt) return false;
          const invoiceDate = new Date(invoice.issuedAt);
          return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
        })
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),

      // معدل الإشغال (مبسط)
      occupancyRate: propertyContracts.length > 0 
        ? Math.round((propertyContracts.filter(contract => 
            contract.status === 'active' && 
            contract.endDate && new Date(contract.endDate) > now
          ).length / propertyContracts.length) * 100)
        : 0,

      // تكاليف الصيانة (تقدير)
      maintenanceCosts: propertyTasks
        .filter(task => task.category === 'maintenance' && task.status === 'completed')
        .reduce((sum, task) => sum + (task.estimatedCost || 0), 0),

      // القضايا القانونية
      legalIssues: propertyTasks.filter(task => task.category === 'legal').length,

      // المستندات
      documents: propertyTasks.reduce((sum, task) => sum + (task.attachments?.length || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Error calculating property stats:', error);
    // إرجاع إحصائيات افتراضية في حالة الخطأ
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      totalInvoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalContracts: 0,
      activeContracts: 0,
      expiredContracts: 0,
      totalReservations: 0,
      activeReservations: 0,
      completedReservations: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      maintenanceCosts: 0,
      legalIssues: 0,
      documents: 0
    };
  }
}

// Helper functions for data fetching
async function getAllTasks() {
  try {
    const fs = require('fs');
    const path = require('path');
    const tasksPath = path.join(process.cwd(), 'data', 'tasks.json');
    const tasksData = fs.readFileSync(tasksPath, 'utf8');
    return JSON.parse(tasksData);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

async function getAllInvoices() {
  try {
    const fs = require('fs');
    const path = require('path');
    const invoicesPath = path.join(process.cwd(), 'data', 'invoices.json');
    const invoicesData = fs.readFileSync(invoicesPath, 'utf8');
    return JSON.parse(invoicesData);
  } catch (error) {
    console.error('Error reading invoices:', error);
    return [];
  }
}

async function getAllReservations() {
  try {
    const fs = require('fs');
    const path = require('path');
    const reservationsPath = path.join(process.cwd(), 'data', 'reservations.json');
    const reservationsData = fs.readFileSync(reservationsPath, 'utf8');
    return JSON.parse(reservationsData);
  } catch (error) {
    console.error('Error reading reservations:', error);
    return [];
  }
}

async function getAllContracts() {
  try {
    const fs = require('fs');
    const path = require('path');
    const contractsPath = path.join(process.cwd(), 'data', 'contracts.json');
    if (fs.existsSync(contractsPath)) {
      const contractsData = fs.readFileSync(contractsPath, 'utf8');
      return JSON.parse(contractsData);
    }
    return [];
  } catch (error) {
    console.error('Error reading contracts:', error);
    return [];
  }
}
