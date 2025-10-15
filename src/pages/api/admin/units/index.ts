// src/pages/api/admin/units/index.ts - API إدارة الوحدات العقارية
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Unit {
  id: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: 'apartment' | 'villa' | 'office' | 'shop' | 'warehouse';
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  monthlyRent: number;
  deposit: number;
  tenantId?: string;
  tenantName?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  amenities: string[];
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

const UNITS_FILE = path.join(process.cwd(), '.data', 'units.json');
const BUILDINGS_FILE = path.join(process.cwd(), '.data', 'buildings.json');

// قراءة الوحدات من الملف
function readUnits(): Unit[] {
  try {
    if (fs.existsSync(UNITS_FILE)) {
      const data = fs.readFileSync(UNITS_FILE, 'utf8');
      if (!data || data.trim() === '') {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Error reading units:', error);
  }
  return [];
}

// كتابة الوحدات إلى الملف
function writeUnits(units: Unit[]): void {
  try {
    const dir = path.dirname(UNITS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(UNITS_FILE, JSON.stringify(units, null, 2));
  } catch (error) {
    console.error('Error writing units:', error);
  }
}

// قراءة المباني
function readBuildings(): any[] {
  try {
    if (fs.existsSync(BUILDINGS_FILE)) {
      const data = fs.readFileSync(BUILDINGS_FILE, 'utf8');
      if (!data || data.trim() === '') {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Error reading buildings:', error);
  }
  return [];
}

// إنشاء معرف فريد
function generateUnitId(): string {
  return `UNIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
  const { buildingId, status, type, search } = req.query;
  
  let units = readUnits();
  
  // تطبيق الفلاتر
  if (buildingId) {
    units = units.filter(unit => unit.buildingId === buildingId);
  }
  
  if (status) {
    units = units.filter(unit => unit.status === status);
  }
  
  if (type) {
    units = units.filter(unit => unit.type === type);
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    units = units.filter(unit => 
      unit.unitNumber.toLowerCase().includes(searchTerm) ||
      unit.buildingName.toLowerCase().includes(searchTerm) ||
      unit.tenantName?.toLowerCase().includes(searchTerm)
    );
  }

  // إضافة معلومات المبنى
  const buildings = readBuildings();
  units = units.map(unit => {
    const building = buildings.find(b => b.id === unit.buildingId);
    return {
      ...unit,
      buildingName: building?.name || unit.buildingName
    };
  });

  return res.status(200).json({
    success: true,
    units,
    total: units.length
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    unitNumber,
    buildingId,
    floor,
    area,
    bedrooms,
    bathrooms,
    type,
    status = 'available',
    monthlyRent,
    deposit,
    amenities = [],
    images = [],
    description
  } = req.body;

  // التحقق من البيانات المطلوبة
  if (!unitNumber || !buildingId || !floor || !area || !monthlyRent) {
    return res.status(400).json({
      error: 'Missing required fields: unitNumber, buildingId, floor, area, monthlyRent'
    });
  }

  // التحقق من وجود المبنى
  const buildings = readBuildings();
  const building = buildings.find(b => b.id === buildingId);
  if (!building) {
    return res.status(400).json({ error: 'Building not found' });
  }

  // التحقق من عدم تكرار رقم الوحدة في نفس المبنى
  const existingUnits = readUnits();
  const duplicateUnit = existingUnits.find(
    unit => unit.unitNumber === unitNumber && unit.buildingId === buildingId
  );
  
  if (duplicateUnit) {
    return res.status(400).json({ error: 'Unit number already exists in this building' });
  }

  // إنشاء الوحدة الجديدة
  const newUnit: Unit = {
    id: generateUnitId(),
    unitNumber,
    buildingId,
    buildingName: building.name,
    floor: parseInt(floor),
    area: parseFloat(area),
    bedrooms: parseInt(bedrooms) || 0,
    bathrooms: parseInt(bathrooms) || 0,
    type,
    status,
    monthlyRent: parseFloat(monthlyRent),
    deposit: parseFloat(deposit) || 0,
    amenities: Array.isArray(amenities) ? amenities : [],
    images: Array.isArray(images) ? images : [],
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // حفظ الوحدة
  const updatedUnits = [...existingUnits, newUnit];
  writeUnits(updatedUnits);

  // تحديث إحصائيات المبنى
  const updatedBuildings = buildings.map(b => {
    if (b.id === buildingId) {
      return {
        ...b,
        totalUnits: (b.totalUnits || 0) + 1,
        availableUnits: status === 'available' ? (b.availableUnits || 0) + 1 : (b.availableUnits || 0),
        updatedAt: new Date().toISOString()
      };
    }
    return b;
  });

  try {
    fs.writeFileSync(BUILDINGS_FILE, JSON.stringify(updatedBuildings, null, 2));
  } catch (error) {
    console.error('Error updating buildings:', error);
  }

  return res.status(201).json({
    success: true,
    unit: newUnit,
    message: 'Unit created successfully'
  });
}
