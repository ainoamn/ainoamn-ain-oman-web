// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // في بيئة التطوير، نحاكي المستخدم من localStorage في الـ client
    // هذا الـ endpoint يُرجع بيانات المستخدم بناءً على الـ session/cookie
    
    // في الإنتاج، ستتحقق من JWT token أو session
    // لكن الآن في التطوير، نرجع استجابة تقول "استخدم localStorage"
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided',
        user: null
      });
    }

    // في التطوير، نقبل أي token ونُرجع بيانات وهمية
    // في الإنتاج، ستفك تشفير JWT وتتحقق من صلاحيته
    
    try {
      const token = authHeader.split(' ')[1];
      const userData = JSON.parse(token);
      
      return res.status(200).json({
        success: true,
        user: userData
      });
    } catch (parseError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token parsing failed',
        user: null
      });
    }

  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      user: null 
    });
  }
}

