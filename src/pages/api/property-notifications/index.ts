// src/pages/api/property-notifications/index.ts - API لإدارة تنبيهات العقارات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface PropertyNotification {
  id: string;
  propertyId: string;
  unitId?: string | null;
  ownerId: string;
  tenantId?: string | null;
  type: 'service_overdue' | 'document_expiring' | 'expense_reimbursement' | 'maintenance_due' | 'contract_expiring';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'dismissed';
  relatedId: string;
  relatedType: 'service' | 'document' | 'expense' | 'contract';
  dueDate?: string;
  overdueDays?: number;
  daysUntilExpiry?: number;
  amount?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

const dataFilePath = path.join(process.cwd(), '.data', 'property-notifications.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // قراءة البيانات من الملف
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    let notifications: PropertyNotification[] = data.notifications || [];

    if (req.method === 'GET') {
      const { propertyId, unitId, ownerId, tenantId, type, priority, status, unread } = req.query;

      // فلترة التنبيهات حسب المعايير
      let filteredNotifications = notifications;

      if (propertyId) {
        filteredNotifications = filteredNotifications.filter(notif => notif.propertyId === propertyId);
      }

      if (unitId) {
        filteredNotifications = filteredNotifications.filter(notif => notif.unitId === unitId);
      }

      if (ownerId) {
        filteredNotifications = filteredNotifications.filter(notif => notif.ownerId === ownerId);
      }

      if (tenantId) {
        filteredNotifications = filteredNotifications.filter(notif => notif.tenantId === tenantId);
      }

      if (type) {
        filteredNotifications = filteredNotifications.filter(notif => notif.type === type);
      }

      if (priority) {
        filteredNotifications = filteredNotifications.filter(notif => notif.priority === priority);
      }

      if (status) {
        filteredNotifications = filteredNotifications.filter(notif => notif.status === status);
      }

      if (unread === 'true') {
        filteredNotifications = filteredNotifications.filter(notif => notif.status === 'unread');
      }

      // ترتيب حسب الأولوية والتاريخ
      filteredNotifications.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return res.status(200).json({
        success: true,
        notifications: filteredNotifications,
        total: filteredNotifications.length,
        unreadCount: filteredNotifications.filter(n => n.status === 'unread').length
      });
    }

    if (req.method === 'POST') {
      const newNotification: PropertyNotification = {
        id: `NOTIF-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      notifications.push(newNotification);

      // حفظ البيانات
      fs.writeFileSync(dataFilePath, JSON.stringify({ notifications }, null, 2));

      return res.status(201).json({
        success: true,
        notification: newNotification,
        message: 'تم إضافة التنبيه بنجاح'
      });
    }

    if (req.method === 'PUT') {
      const { notificationIds, status } = req.body;

      if (Array.isArray(notificationIds) && status) {
        // تحديث حالة عدة تنبيهات
        notifications = notifications.map(notif => 
          notificationIds.includes(notif.id) 
            ? { ...notif, status, updatedAt: new Date().toISOString() }
            : notif
        );

        // حفظ البيانات
        fs.writeFileSync(dataFilePath, JSON.stringify({ notifications }, null, 2));

        return res.status(200).json({
          success: true,
          message: `تم تحديث ${notificationIds.length} تنبيه بنجاح`
        });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in property-notifications API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
