// src/pages/api/messages/index.ts
// API endpoint للرسائل

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const MESSAGES_FILE = path.join(process.cwd(), '.data', 'messages.json');

// تأكد من وجود المجلد
const ensureDataDir = () => {
  const dir = path.dirname(MESSAGES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// قراءة الرسائل
const readMessages = () => {
  ensureDataDir();
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// حفظ الرسائل
const writeMessages = (messages: any[]) => {
  ensureDataDir();
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // جلب الرسائل
    const { propertyId } = req.query;
    const allMessages = readMessages();
    
    const filtered = propertyId
      ? allMessages.filter((m: any) => m.propertyId === propertyId)
      : allMessages;

    return res.status(200).json({ messages: filtered });
  }

  if (req.method === 'POST') {
    // إضافة رسالة جديدة
    const { propertyId, message, type } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'الرسالة مطلوبة' });
    }

    const allMessages = readMessages();
    
    const newMessage = {
      id: `MSG-${Date.now()}`,
      propertyId: propertyId || 'GENERAL',
      senderId: 'user_123', // من الجلسة
      senderName: 'مستخدم', // نص عادي - ليس object
      senderType: 'user',
      message: String(message).trim(), // نص عادي
      timestamp: new Date().toISOString(),
      read: false,
      type: type || 'general',
    };

    allMessages.push(newMessage);
    writeMessages(allMessages);

    // رد تلقائي من الإدارة (بعد 2 ثانية)
    setTimeout(() => {
      const autoReply = {
        id: `MSG-${Date.now()}-AUTO`,
        propertyId: propertyId || 'GENERAL',
        senderId: 'admin_1',
        senderName: 'فريق الدعم', // نص عادي
        senderType: 'admin',
        message: 'شكراً لرسالتك! سنقوم بالرد عليك في أقرب وقت ممكن.', // نص عادي
        timestamp: new Date().toISOString(),
        read: false,
        type: 'auto-reply',
      };

      const updated = readMessages();
      updated.push(autoReply);
      writeMessages(updated);
    }, 2000);

    return res.status(201).json({ message: newMessage, success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
