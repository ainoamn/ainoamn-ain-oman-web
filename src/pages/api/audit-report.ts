// src/pages/api/audit-report.ts - API لقراءة التقرير
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'COMPLETE_SITE_AUDIT_REPORT.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    return res.status(200).json({ content });
  } catch (error) {
    console.error('Error reading report:', error);
    return res.status(500).json({ error: 'Failed to read report' });
  }
}
