// API لأحداث التقويم
import { NextApiRequest, NextApiResponse } from 'next';
import { subscriptionManager } from '@/lib/subscriptionSystem';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'booking' | 'maintenance' | 'inspection' | 'meeting' | 'other';
  propertyId?: string;
  propertyTitle?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// محاكاة قاعدة البيانات
let events: CalendarEvent[] = [
  {
    id: 'event_1',
    title: 'فحص عقار جديد',
    description: 'فحص شامل للعقار قبل التأجير',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    type: 'inspection',
    propertyId: 'P-20250911120430',
    propertyTitle: 'شقة في مسقط',
    status: 'scheduled',
    color: 'bg-green-100 text-green-800',
    userId: 'user_123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'event_2',
    title: 'صيانة دورية',
    description: 'صيانة دورية لنظام التكييف',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    type: 'maintenance',
    propertyId: 'P-20250911120430',
    propertyTitle: 'شقة في مسقط',
    status: 'confirmed',
    color: 'bg-yellow-100 text-yellow-800',
    userId: 'user_123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'event_3',
    title: 'اجتماع مع العميل',
    description: 'مناقشة شروط العقد الجديد',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    type: 'meeting',
    status: 'scheduled',
    color: 'bg-purple-100 text-purple-800',
    userId: 'user_123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  if (req.method === 'GET') {
    // التحقق من الصلاحيات
    if (!subscriptionManager.hasPermission(userId, 'calendar_read')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // الحصول على أحداث المستخدم
    const userEvents = events.filter(event => event.userId === userId);
    
    return res.status(200).json({
      success: true,
      events: userEvents
    });
  }

  if (req.method === 'POST') {
    // التحقق من الصلاحيات
    if (!subscriptionManager.hasPermission(userId, 'calendar_write')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    const { title, description, startDate, endDate, type, propertyId, propertyTitle } = req.body;

    if (!title || !startDate || !endDate || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, startDate, endDate, type'
      });
    }

    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      type,
      propertyId,
      propertyTitle,
      status: 'scheduled',
      color: getEventColor(type),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    events.push(newEvent);

    return res.status(201).json({
      success: true,
      event: newEvent
    });
  }

  if (req.method === 'PUT') {
    // التحقق من الصلاحيات
    if (!subscriptionManager.hasPermission(userId, 'calendar_write')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    const { eventId, ...updateData } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    const eventIndex = events.findIndex(event => event.id === eventId && event.userId === userId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      event: events[eventIndex]
    });
  }

  if (req.method === 'DELETE') {
    // التحقق من الصلاحيات
    if (!subscriptionManager.hasPermission(userId, 'calendar_admin')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    const { eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    const eventIndex = events.findIndex(event => event.id === eventId && event.userId === userId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    events.splice(eventIndex, 1);

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}

function getEventColor(type: string): string {
  switch (type) {
    case 'booking': return 'bg-blue-100 text-blue-800';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800';
    case 'inspection': return 'bg-green-100 text-green-800';
    case 'meeting': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}