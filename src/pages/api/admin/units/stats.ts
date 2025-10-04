// src/pages/api/admin/units/stats.ts - إحصائيات الوحدات العقارية
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const UNITS_FILE = path.join(process.cwd(), 'data', 'units.json');

function readUnits(): any[] {
  try {
    if (fs.existsSync(UNITS_FILE)) {
      const data = fs.readFileSync(UNITS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading units:', error);
  }
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const units = readUnits();
    
    // حساب الإحصائيات
    const stats = {
      totalUnits: units.length,
      availableUnits: units.filter(unit => unit.status === 'available').length,
      rentedUnits: units.filter(unit => unit.status === 'rented').length,
      maintenanceUnits: units.filter(unit => unit.status === 'maintenance').length,
      reservedUnits: units.filter(unit => unit.status === 'reserved').length,
      totalRevenue: units
        .filter(unit => unit.status === 'rented')
        .reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0),
      occupancyRate: units.length > 0 
        ? Math.round((units.filter(unit => unit.status === 'rented').length / units.length) * 100)
        : 0,
      averageRent: units.length > 0
        ? Math.round(units.reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0) / units.length)
        : 0,
      totalArea: units.reduce((sum, unit) => sum + (unit.area || 0), 0),
      averageArea: units.length > 0
        ? Math.round(units.reduce((sum, unit) => sum + (unit.area || 0), 0) / units.length)
        : 0
    };

    // إحصائيات حسب النوع
    const typeStats = {
      apartment: units.filter(unit => unit.type === 'apartment').length,
      villa: units.filter(unit => unit.type === 'villa').length,
      office: units.filter(unit => unit.type === 'office').length,
      shop: units.filter(unit => unit.type === 'shop').length,
      warehouse: units.filter(unit => unit.type === 'warehouse').length
    };

    // إحصائيات حسب الحالة
    const statusStats = {
      available: units.filter(unit => unit.status === 'available').length,
      rented: units.filter(unit => unit.status === 'rented').length,
      maintenance: units.filter(unit => unit.status === 'maintenance').length,
      reserved: units.filter(unit => unit.status === 'reserved').length
    };

    // إحصائيات الإيرادات الشهرية
    const monthlyRevenue = units
      .filter(unit => unit.status === 'rented')
      .reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0);

    // إحصائيات الإيرادات السنوية
    const yearlyRevenue = monthlyRevenue * 12;

    return res.status(200).json({
      success: true,
      stats: {
        ...stats,
        typeStats,
        statusStats,
        monthlyRevenue,
        yearlyRevenue
      }
    });

  } catch (error) {
    console.error('Error calculating stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
