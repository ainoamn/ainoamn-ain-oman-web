// src/pages/api/reports/dashboard-stats.ts - إحصائيات لوحة التحكم
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

const readData = (filename: string): any[] => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
  }
  return [];
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const now = new Date();
    
    const properties = readData('properties.json');
    const auctions = readData('auctions.json');
    const customers = readData('customers.json');
    const subscriptions = readData('user-subscriptions.json');
    const bookings = readData('bookings.json');
    const tasks = readData('tasks.json');

    const overview = {
      totalProperties: properties.length,
      totalAuctions: auctions.length,
      totalCustomers: customers.length,
      totalSubscriptions: subscriptions.length,
      totalRevenue: subscriptions.reduce((sum, sub) => sum + (sub.totalPaid || 0), 0),
      totalUsers: new Set(subscriptions.map(sub => sub.userId)).size,
      totalBookings: bookings.length,
      totalTasks: tasks.length
    };

    const stats = {
      overview,
      generatedAt: now.toISOString()
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in dashboard stats API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
