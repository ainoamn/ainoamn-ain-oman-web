// src/pages/api/admin/maintenance/index.ts - API إدارة الصيانة
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  type: 'plumbing' | 'electrical' | 'hvac' | 'cleaning' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  title: string;
  description: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  assignedTo?: string;
  assignedToName?: string;
  images: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const MAINTENANCE_FILE = path.join(process.cwd(), 'data', 'maintenance.json');

function readMaintenanceRequests(): MaintenanceRequest[] {
  try {
    if (fs.existsSync(MAINTENANCE_FILE)) {
      const data = fs.readFileSync(MAINTENANCE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading maintenance requests:', error);
  }
  return [];
}

function writeMaintenanceRequests(requests: MaintenanceRequest[]): void {
  try {
    const dir = path.dirname(MAINTENANCE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(requests, null, 2));
  } catch (error) {
    console.error('Error writing maintenance requests:', error);
  }
}

function generateRequestId(): string {
  return `MNT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { status, type, priority, search } = req.query;
  
  let requests = readMaintenanceRequests();
  
  if (status) {
    requests = requests.filter(request => request.status === status);
  }
  
  if (type) {
    requests = requests.filter(request => request.type === type);
  }
  
  if (priority) {
    requests = requests.filter(request => request.priority === priority);
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    requests = requests.filter(request => 
      request.requestNumber.toLowerCase().includes(searchTerm) ||
      request.title.toLowerCase().includes(searchTerm) ||
      request.tenantName.toLowerCase().includes(searchTerm)
    );
  }

  return res.status(200).json({
    success: true,
    requests,
    total: requests.length
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    type,
    priority = 'medium',
    status = 'pending',
    tenantId,
    tenantName,
    unitId,
    unitNumber,
    buildingId,
    buildingName,
    title,
    description,
    estimatedCost = 0,
    images = [],
    notes
  } = req.body;

  if (!type || !title || !tenantId) {
    return res.status(400).json({
      error: 'Missing required fields: type, title, tenantId'
    });
  }

  const existingRequests = readMaintenanceRequests();
  const requestNumber = `MNT-${String(existingRequests.length + 1).padStart(4, '0')}`;

  const newRequest: MaintenanceRequest = {
    id: generateRequestId(),
    requestNumber,
    type,
    priority,
    status,
    tenantId,
    tenantName,
    unitId,
    unitNumber,
    buildingId,
    buildingName,
    title,
    description: description || '',
    reportedDate: new Date().toISOString(),
    estimatedCost: parseFloat(estimatedCost),
    images: Array.isArray(images) ? images : [],
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedRequests = [...existingRequests, newRequest];
  writeMaintenanceRequests(updatedRequests);

  return res.status(201).json({
    success: true,
    request: newRequest,
    message: 'Maintenance request created successfully'
  });
}
