// src/pages/api/admin/checks/index.ts - API إدارة الشيكات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Check {
  id: string;
  checkNumber: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  purpose: 'rent' | 'deposit' | 'maintenance' | 'penalty' | 'other';
  description: string;
  receivedDate: string;
  clearedDate?: string;
  bouncedReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const CHECKS_FILE = path.join(process.cwd(), 'data', 'checks.json');

function readChecks(): Check[] {
  try {
    if (fs.existsSync(CHECKS_FILE)) {
      const data = fs.readFileSync(CHECKS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading checks:', error);
  }
  return [];
}

function writeChecks(checks: Check[]): void {
  try {
    const dir = path.dirname(CHECKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CHECKS_FILE, JSON.stringify(checks, null, 2));
  } catch (error) {
    console.error('Error writing checks:', error);
  }
}

function generateCheckId(): string {
  return `CHK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
  const { status, bank, search } = req.query;
  
  let checks = readChecks();
  
  if (status) {
    checks = checks.filter(check => check.status === status);
  }
  
  if (bank) {
    checks = checks.filter(check => check.bankName === bank);
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    checks = checks.filter(check => 
      check.checkNumber.toLowerCase().includes(searchTerm) ||
      check.tenantName.toLowerCase().includes(searchTerm) ||
      check.bankName.toLowerCase().includes(searchTerm)
    );
  }

  return res.status(200).json({
    success: true,
    checks,
    total: checks.length
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    checkNumber,
    bankName,
    accountNumber,
    amount,
    currency = 'OMR',
    issueDate,
    dueDate,
    status = 'pending',
    tenantId,
    tenantName,
    unitId,
    unitNumber,
    buildingId,
    buildingName,
    purpose,
    description,
    notes
  } = req.body;

  if (!checkNumber || !bankName || !amount || !tenantId) {
    return res.status(400).json({
      error: 'Missing required fields: checkNumber, bankName, amount, tenantId'
    });
  }

  const existingChecks = readChecks();
  const duplicateCheck = existingChecks.find(
    check => check.checkNumber === checkNumber && check.bankName === bankName
  );
  
  if (duplicateCheck) {
    return res.status(400).json({ error: 'Check number already exists in this bank' });
  }

  const newCheck: Check = {
    id: generateCheckId(),
    checkNumber,
    bankName,
    accountNumber: accountNumber || '',
    amount: parseFloat(amount),
    currency,
    issueDate,
    dueDate,
    status,
    tenantId,
    tenantName,
    unitId,
    unitNumber,
    buildingId,
    buildingName,
    purpose: purpose || 'rent',
    description: description || '',
    receivedDate: new Date().toISOString(),
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedChecks = [...existingChecks, newCheck];
  writeChecks(updatedChecks);

  return res.status(201).json({
    success: true,
    check: newCheck,
    message: 'Check created successfully'
  });
}
