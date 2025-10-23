// src/pages/api/messages.ts
// API endpoint للرسائل والدردشة

import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data store
let messagesStore: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    if (method === 'GET') {
      // الحصول على الرسائل
      const { propertyId } = req.query;
      
      const messages = messagesStore.filter(m => 
        !propertyId || m.propertyId === propertyId
      );

      return res.status(200).json({ messages });
    }

    if (method === 'POST') {
      // إرسال رسالة جديدة
      const { propertyId, message, type } = req.body;

      const newMessage = {
        id: `MSG-${Date.now()}`,
        propertyId,
        senderId: 'user_123', // من الجلسة
        senderName: 'أنت',
        senderType: 'user',
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
      };

      messagesStore.push(newMessage);

      // رد تلقائي من النظام
      setTimeout(() => {
        const autoReply = {
          id: `MSG-${Date.now()}-auto`,
          propertyId,
          senderId: 'system',
          senderName: 'نظام عين عُمان',
          senderType: 'system',
          message: 'شكراً لتواصلك معنا! سيقوم فريق الإدارة بالرد عليك في أقرب وقت ممكن.',
          timestamp: new Date().toISOString(),
          read: false,
        };
        messagesStore.push(autoReply);
      }, 1000);

      return res.status(200).json({ success: true, message: newMessage });
    }

    if (method === 'PUT') {
      // تحديث حالة قراءة الرسالة
      const { messageId } = req.body;
      
      const message = messagesStore.find(m => m.id === messageId);
      if (message) {
        message.read = true;
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error('Messages API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

