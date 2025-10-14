// src/pages/api/roles/save.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'Invalid roles data' });
    }

    // حفظ في ملف JSON
    const filePath = path.join(process.cwd(), '.data', 'roles-config.json');
    fs.writeFileSync(filePath, JSON.stringify(roles, null, 2), 'utf8');

    console.log('✅ Roles saved to .data/roles-config.json');

    return res.status(200).json({ 
      success: true, 
      message: 'تم حفظ الأدوار بنجاح',
      rolesCount: roles.length
    });

  } catch (error) {
    console.error('Error saving roles:', error);
    return res.status(500).json({ error: 'فشل حفظ الأدوار' });
  }
}

