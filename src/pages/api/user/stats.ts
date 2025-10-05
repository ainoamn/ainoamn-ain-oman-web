// src/pages/api/user/stats.ts - إحصائيات المستخدم
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');
const PROPERTIES_FILE = path.join(process.cwd(), 'data', 'properties.json');
const RATINGS_FILE = path.join(process.cwd(), 'data', 'ratings.json');

function readUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading users:', error);
  }
  return [];
}

function readBookings(): any[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading bookings:', error);
  }
  return [];
}

function readProperties(): any[] {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const data = fs.readFileSync(PROPERTIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading properties:', error);
  }
  return [];
}

function readRatings(): any[] {
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      const data = fs.readFileSync(RATINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading ratings:', error);
  }
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const users = readUsers();
    const bookings = readBookings();
    const properties = readProperties();
    const ratings = readRatings();

    // العثور على المستخدم
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // حساب الإحصائيات
    const userBookings = bookings.filter(b => b.userId === userId);
    const userProperties = properties.filter(p => p.ownerId === userId);
    const userRatings = ratings.filter(r => r.userId === userId);

    const stats = {
      totalProperties: userProperties.length,
      activeBookings: userBookings.filter(b => b.status === 'active').length,
      totalSpent: userBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      pendingPayments: userBookings
        .filter(b => b.status === 'pending_payment')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      rating: userRatings.length > 0 
        ? userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length
        : 0,
      reviews: userRatings.length,
      level: Math.floor(userRatings.length / 10) + 1,
      points: userRatings.length * 10 + userProperties.length * 5,
      badges: generateBadges(user, userRatings, userProperties, userBookings)
    };

    return res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error calculating user stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateBadges(user: any, ratings: any[], properties: any[], bookings: any[]): string[] {
  const badges: string[] = [];

  // شارات الإنجاز
  if (ratings.length >= 1) badges.push('مراجع جديد');
  if (ratings.length >= 10) badges.push('مراجع نشط');
  if (ratings.length >= 50) badges.push('خبير التقييم');
  if (properties.length >= 1) badges.push('مالك عقار');
  if (properties.length >= 5) badges.push('مستثمر عقاري');
  if (bookings.length >= 1) badges.push('مستأجر');
  if (bookings.length >= 10) badges.push('عميل مخلص');

  // شارات الحالة
  if (user.verified) badges.push('مستخدم موثق');
  if (user.premium) badges.push('عضو مميز');

  // شارات خاصة
  const joinDate = new Date(user.createdAt);
  const now = new Date();
  const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceJoin <= 30) badges.push('مبكر في التبني');
  if (daysSinceJoin >= 365) badges.push('عضو قديم');

  return badges;
}
