// src/pages/api/admin/maintenance/stats.ts - إحصائيات الصيانة
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const MAINTENANCE_FILE = path.join(process.cwd(), 'data', 'maintenance.json');

function readMaintenanceRequests(): any[] {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requests = readMaintenanceRequests();
    
    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(req => req.status === 'pending').length,
      inProgressRequests: requests.filter(req => req.status === 'in_progress').length,
      completedRequests: requests.filter(req => req.status === 'completed').length,
      totalCost: requests.reduce((sum, req) => sum + (req.estimatedCost || 0), 0),
      thisMonthRequests: requests.filter(req => {
        const reqDate = new Date(req.reportedDate);
        const now = new Date();
        return reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear();
      }).length,
      thisMonthCost: requests
        .filter(req => {
          const reqDate = new Date(req.reportedDate);
          const now = new Date();
          return reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, req) => sum + (req.estimatedCost || 0), 0)
    };

    return res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error calculating stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
