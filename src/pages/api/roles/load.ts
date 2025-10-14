// src/pages/api/roles/load.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), '.data', 'roles-config.json');
    
    // إذا لم يوجد الملف، استخدم الأدوار الافتراضية
    if (!fs.existsSync(filePath)) {
      // قراءة من public/roles-config.json
      const publicPath = path.join(process.cwd(), 'public', 'roles-config.json');
      if (fs.existsSync(publicPath)) {
        const data = fs.readFileSync(publicPath, 'utf8');
        const roles = JSON.parse(data);
        
        // حفظ في .data للمرة القادمة
        fs.writeFileSync(filePath, JSON.stringify(roles, null, 2), 'utf8');
        
        return res.status(200).json({ roles, source: 'initialized' });
      } else {
        return res.status(404).json({ error: 'No roles configuration found' });
      }
    }

    // قراءة من .data
    const data = fs.readFileSync(filePath, 'utf8');
    const roles = JSON.parse(data);

    console.log('✅ Roles loaded from .data/roles-config.json:', roles.length, 'roles');

    return res.status(200).json({ 
      roles,
      source: 'database',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error loading roles:', error);
    return res.status(500).json({ error: 'فشل تحميل الأدوار' });
  }
}

