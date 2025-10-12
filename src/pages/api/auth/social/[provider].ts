import type { NextApiRequest, NextApiResponse } from "next";

// دالة لتحديد نوع الحساب من بيانات OAuth
function determineRoleFromOAuth(provider: string, email?: string, profile?: any): string {
  // يمكن تحديد النوع بناءً على معلومات من المزود
  // مثلاً: LinkedIn قد يوفر معلومات عن الشركة
  
  if (provider === 'linkedin' && profile?.company) {
    return 'company';
  }
  
  // افتراضياً: مستخدم عادي
  return 'user';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { provider } = req.query;

  if (!provider || typeof provider !== "string") {
    return res.status(400).json({ error: "مزود الخدمة غير صحيح" });
  }

  const allowedProviders = ["google", "facebook", "twitter", "linkedin", "apple"];
  if (!allowedProviders.includes(provider.toLowerCase())) {
    return res.status(400).json({ error: "مزود الخدمة غير مدعوم" });
  }

  try {
    // في الإنتاج: يجب تنفيذ OAuth flow الكامل
    // 1. إعادة توجيه المستخدم إلى صفحة الموافقة
    // 2. استلام الكود
    // 3. تبادل الكود بـ access token
    // 4. جلب بيانات المستخدم من مزود الخدمة
    // 5. إنشاء/تحديث حساب المستخدم

    // للتطوير: إنشاء مستخدم تجريبي
    const userId = `${provider.toUpperCase()}-${Date.now()}`;
    const email = `demo@${provider}.com`;
    const userName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    
    // تحديد النوع تلقائياً
    const userRole = determineRoleFromOAuth(provider, email);
    
    const user = {
      id: userId,
      name: userName,
      email,
      role: userRole, // يتم تحديده تلقائياً
      provider,
      isVerified: true, // المستخدمين من OAuth عادة يكونون موثقين من المزود
      createdAt: new Date().toISOString(),
      features: ["DASHBOARD_ACCESS"]
    };

    // في الإنتاج: حفظ/تحديث المستخدم في قاعدة البيانات
    // await upsertUser(user);

    return res.status(200).json({
      success: true,
      message: `تم تسجيل الدخول عبر ${provider} بنجاح`,
      ...user
    });
  } catch (error) {
    console.error(`${provider} login error:`, error);
    return res.status(500).json({ error: `فشل تسجيل الدخول عبر ${provider}` });
  }
}

