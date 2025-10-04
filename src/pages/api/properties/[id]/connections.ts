// API endpoint لإدارة اتصالات العقارات بالعملاء
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Connection {
  id: string;
  propertyId: string;
  customerId: string;
  connectionType: 'owner' | 'tenant' | 'buyer' | 'investor' | 'manager';
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  notes?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

const CONNECTIONS_FILE = path.join(process.cwd(), 'data', 'property-connections.json');

// قراءة الاتصالات من الملف
function readConnections(): Connection[] {
  try {
    if (fs.existsSync(CONNECTIONS_FILE)) {
      const data = fs.readFileSync(CONNECTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading connections:', error);
  }
  return [];
}

// كتابة الاتصالات إلى الملف
function writeConnections(connections: Connection[]): void {
  try {
    // إنشاء المجلد إذا لم يكن موجوداً
    const dir = path.dirname(CONNECTIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(connections, null, 2));
  } catch (error) {
    console.error('Error writing connections:', error);
  }
}

// إنشاء معرف فريد
function generateId(): string {
  return `CONN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'POST':
      return handlePost(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// جلب جميع الاتصالات لعقار معين
async function handleGet(req: NextApiRequest, res: NextApiResponse, propertyId: string) {
  try {
    const connections = readConnections();
    const propertyConnections = connections.filter(conn => conn.propertyId === propertyId);
    
    res.status(200).json({
      connections: propertyConnections,
      total: propertyConnections.length
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// إنشاء اتصال جديد
async function handlePost(req: NextApiRequest, res: NextApiResponse, propertyId: string) {
  try {
    const {
      customerId,
      connectionType,
      startDate,
      endDate,
      notes,
      status = 'active'
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!customerId || !connectionType || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: customerId, connectionType, startDate'
      });
    }

    // التحقق من صحة نوع الاتصال
    const validTypes = ['owner', 'tenant', 'buyer', 'investor', 'manager'];
    if (!validTypes.includes(connectionType)) {
      return res.status(400).json({
        error: 'Invalid connection type'
      });
    }

    // التحقق من صحة الحالة
    const validStatuses = ['active', 'inactive', 'pending', 'terminated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status'
      });
    }

    // التحقق من عدم وجود اتصال نشط من نفس النوع
    const connections = readConnections();
    const existingConnection = connections.find(conn => 
      conn.propertyId === propertyId &&
      conn.customerId === customerId &&
      conn.connectionType === connectionType &&
      conn.status === 'active'
    );

    if (existingConnection) {
      return res.status(400).json({
        error: 'Active connection already exists for this customer and property'
      });
    }

    // إنشاء الاتصال الجديد
    const newConnection: Connection = {
      id: generateId(),
      propertyId,
      customerId,
      connectionType,
      startDate,
      endDate: endDate || null,
      status,
      notes: notes || null,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // إضافة الاتصال الجديد
    connections.push(newConnection);
    writeConnections(connections);

    res.status(201).json({
      connection: newConnection,
      message: 'Connection created successfully'
    });
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
