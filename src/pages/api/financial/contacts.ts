// src/pages/api/financial/contacts.ts - API لإدارة جهات الاتصال (عملاء/موردين/موظفين)
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const CONTACTS_FILE = path.join(DATA_DIR, 'customers.json');

// قراءة جهات الاتصال
const readContacts = (): any[] => {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      const data = fs.readFileSync(CONTACTS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      
      // إذا كان الملف يحتوي على مصفوفة مباشرة
      if (Array.isArray(parsed)) {
        return parsed;
      }
      
      // إذا كان object يحتوي على خاصية customers
      if (parsed.customers && Array.isArray(parsed.customers)) {
        return parsed.customers;
      }
      
      return [];
    }
  } catch (error) {
    console.error('Error reading contacts:', error);
  }
  return [];
};

// كتابة جهات الاتصال
const writeContacts = (contacts: any[]): void => {
  try {
    // التأكد من وجود المجلد
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const data = {
      customers: contacts,
      lastId: contacts.length
    };
    
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing contacts:', error);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة جميع جهات الاتصال
        const contacts = readContacts();
        return res.status(200).json({ contacts });

      case 'POST':
        // إضافة جهة اتصال جديدة
        const newContact = req.body;
        const allContacts = readContacts();
        
        // إنشاء ID جديد
        const newId = `contact_${Date.now()}`;
        const contactToAdd = {
          id: newId,
          ...newContact,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        allContacts.push(contactToAdd);
        writeContacts(allContacts);
        
        return res.status(201).json({ contact: contactToAdd });

      case 'PUT':
      case 'PATCH':
        // تحديث جهة اتصال
        const { id, ...updates } = req.body;
        const contactsList = readContacts();
        const index = contactsList.findIndex(c => c.id === id);
        
        if (index === -1) {
          return res.status(404).json({ error: 'Contact not found' });
        }
        
        contactsList[index] = {
          ...contactsList[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        writeContacts(contactsList);
        return res.status(200).json({ contact: contactsList[index] });

      case 'DELETE':
        // حذف جهة اتصال
        const deleteId = req.query.id || req.body.id;
        const contactsToKeep = readContacts().filter(c => c.id !== deleteId);
        writeContacts(contactsToKeep);
        
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in contacts API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

