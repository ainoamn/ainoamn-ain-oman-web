// API endpoint لتحديث وحذف اتصالات العقارات
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, connectionId } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  if (!connectionId || typeof connectionId !== 'string') {
    return res.status(400).json({ error: 'Connection ID is required' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id, connectionId);
    case 'PATCH':
      return handlePatch(req, res, id, connectionId);
    case 'DELETE':
      return handleDelete(req, res, id, connectionId);
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// جلب اتصال معين
async function handleGet(req: NextApiRequest, res: NextApiResponse, propertyId: string, connectionId: string) {
  try {
    const connections = readConnections();
    const connection = connections.find(conn => 
      conn.id === connectionId && conn.propertyId === propertyId
    );

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    res.status(200).json({ connection });
  } catch (error) {
    console.error('Error fetching connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// تحديث اتصال
async function handlePatch(req: NextApiRequest, res: NextApiResponse, propertyId: string, connectionId: string) {
  try {
    const connections = readConnections();
    const connectionIndex = connections.findIndex(conn => 
      conn.id === connectionId && conn.propertyId === propertyId
    );

    if (connectionIndex === -1) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const connection = connections[connectionIndex];
    const updates = req.body;

    // التحقق من صحة الحالة إذا تم تحديثها
    if (updates.status) {
      const validStatuses = ['active', 'inactive', 'pending', 'terminated'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          error: 'Invalid status'
        });
      }
    }

    // التحقق من صحة نوع الاتصال إذا تم تحديثه
    if (updates.connectionType) {
      const validTypes = ['owner', 'tenant', 'buyer', 'investor', 'manager'];
      if (!validTypes.includes(updates.connectionType)) {
        return res.status(400).json({
          error: 'Invalid connection type'
        });
      }
    }

    // التحقق من عدم وجود اتصال نشط من نفس النوع إذا تم تغيير النوع أو العميل
    if (updates.connectionType || updates.customerId) {
      const newType = updates.connectionType || connection.connectionType;
      const newCustomerId = updates.customerId || connection.customerId;
      
      const existingConnection = connections.find(conn => 
        conn.id !== connectionId &&
        conn.propertyId === propertyId &&
        conn.customerId === newCustomerId &&
        conn.connectionType === newType &&
        conn.status === 'active'
      );

      if (existingConnection) {
        return res.status(400).json({
          error: 'Active connection already exists for this customer and property'
        });
      }
    }

    // تحديث الاتصال
    const updatedConnection: Connection = {
      ...connection,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    connections[connectionIndex] = updatedConnection;
    writeConnections(connections);

    res.status(200).json({
      connection: updatedConnection,
      message: 'Connection updated successfully'
    });
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// حذف اتصال
async function handleDelete(req: NextApiRequest, res: NextApiResponse, propertyId: string, connectionId: string) {
  try {
    const connections = readConnections();
    const connectionIndex = connections.findIndex(conn => 
      conn.id === connectionId && conn.propertyId === propertyId
    );

    if (connectionIndex === -1) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // حذف الاتصال
    connections.splice(connectionIndex, 1);
    writeConnections(connections);

    res.status(200).json({
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
