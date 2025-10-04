// src/pages/api/admin/buildings/index.ts - API إدارة المباني
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  totalUnits: number;
  availableUnits: number;
  rentedUnits: number;
  maintenanceUnits: number;
  floors: number;
  yearBuilt: number;
  buildingType: 'residential' | 'commercial' | 'mixed';
  amenities: string[];
  images: string[];
  description: string;
  ownerId?: string;
  ownerName?: string;
  managementCompany?: string;
  createdAt: string;
  updatedAt: string;
}

const BUILDINGS_FILE = path.join(process.cwd(), 'data', 'buildings.json');

// قراءة المباني من الملف
function readBuildings(): Building[] {
  try {
    if (fs.existsSync(BUILDINGS_FILE)) {
      const data = fs.readFileSync(BUILDINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading buildings:', error);
  }
  return [];
}

// كتابة المباني إلى الملف
function writeBuildings(buildings: Building[]): void {
  try {
    const dir = path.dirname(BUILDINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BUILDINGS_FILE, JSON.stringify(buildings, null, 2));
  } catch (error) {
    console.error('Error writing buildings:', error);
  }
}

// إنشاء معرف فريد
function generateBuildingId(): string {
  return `BLD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
  const { city, district, type, search } = req.query;
  
  let buildings = readBuildings();
  
  // تطبيق الفلاتر
  if (city) {
    buildings = buildings.filter(building => building.city === city);
  }
  
  if (district) {
    buildings = buildings.filter(building => building.district === district);
  }
  
  if (type) {
    buildings = buildings.filter(building => building.buildingType === type);
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    buildings = buildings.filter(building => 
      building.name.toLowerCase().includes(searchTerm) ||
      building.address.toLowerCase().includes(searchTerm) ||
      building.city.toLowerCase().includes(searchTerm) ||
      building.district.toLowerCase().includes(searchTerm)
    );
  }

  return res.status(200).json({
    success: true,
    buildings,
    total: buildings.length
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    address,
    city,
    district,
    floors,
    yearBuilt,
    buildingType,
    amenities = [],
    images = [],
    description,
    ownerId,
    ownerName,
    managementCompany
  } = req.body;

  // التحقق من البيانات المطلوبة
  if (!name || !address || !city || !district) {
    return res.status(400).json({
      error: 'Missing required fields: name, address, city, district'
    });
  }

  // التحقق من عدم تكرار اسم المبنى في نفس المدينة
  const existingBuildings = readBuildings();
  const duplicateBuilding = existingBuildings.find(
    building => building.name === name && building.city === city
  );
  
  if (duplicateBuilding) {
    return res.status(400).json({ error: 'Building name already exists in this city' });
  }

  // إنشاء المبنى الجديد
  const newBuilding: Building = {
    id: generateBuildingId(),
    name,
    address,
    city,
    district,
    totalUnits: 0,
    availableUnits: 0,
    rentedUnits: 0,
    maintenanceUnits: 0,
    floors: parseInt(floors) || 1,
    yearBuilt: parseInt(yearBuilt) || new Date().getFullYear(),
    buildingType: buildingType || 'residential',
    amenities: Array.isArray(amenities) ? amenities : [],
    images: Array.isArray(images) ? images : [],
    description: description || '',
    ownerId,
    ownerName,
    managementCompany,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // حفظ المبنى
  const updatedBuildings = [...existingBuildings, newBuilding];
  writeBuildings(updatedBuildings);

  return res.status(201).json({
    success: true,
    building: newBuilding,
    message: 'Building created successfully'
  });
}
