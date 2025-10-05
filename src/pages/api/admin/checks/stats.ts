// src/pages/api/admin/checks/stats.ts - إحصائيات الشيكات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CHECKS_FILE = path.join(process.cwd(), 'data', 'checks.json');

function readChecks(): any[] {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const checks = readChecks();
    
    const stats = {
      totalChecks: checks.length,
      totalAmount: checks.reduce((sum, check) => sum + (check.amount || 0), 0),
      pendingAmount: checks
        .filter(check => check.status === 'pending')
        .reduce((sum, check) => sum + (check.amount || 0), 0),
      clearedAmount: checks
        .filter(check => check.status === 'cleared')
        .reduce((sum, check) => sum + (check.amount || 0), 0),
      bouncedAmount: checks
        .filter(check => check.status === 'bounced')
        .reduce((sum, check) => sum + (check.amount || 0), 0),
      thisMonthChecks: checks.filter(check => {
        const checkDate = new Date(check.issueDate);
        const now = new Date();
        return checkDate.getMonth() === now.getMonth() && checkDate.getFullYear() === now.getFullYear();
      }).length,
      thisMonthAmount: checks
        .filter(check => {
          const checkDate = new Date(check.issueDate);
          const now = new Date();
          return checkDate.getMonth() === now.getMonth() && checkDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, check) => sum + (check.amount || 0), 0)
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
