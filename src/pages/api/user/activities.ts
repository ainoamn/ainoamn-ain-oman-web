// src/pages/api/user/activities.ts - أنشطة المستخدم
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const ACTIVITIES_FILE = path.join(process.cwd(), 'data', 'activities.json');

function readActivities(): any[] {
  try {
    if (fs.existsSync(ACTIVITIES_FILE)) {
      const data = fs.readFileSync(ACTIVITIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading activities:', error);
  }
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let activities = readActivities();
    
    // تصفية الأنشطة حسب المستخدم
    activities = activities.filter(activity => activity.userId === userId);
    
    // ترتيب حسب التاريخ (الأحدث أولاً)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // تحديد العدد المطلوب
    const limitNum = parseInt(limit as string);
    activities = activities.slice(0, limitNum);

    return res.status(200).json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Error fetching user activities:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
