import type { NextApiRequest, NextApiResponse } from "next";

// دالة محاكاة لجلب بيانات المستخدم من OAuth provider
async function fetchUserFromProvider(provider: string, code: string) {
  // في الإنتاج: هنا يتم تبادل الكود بـ access token
  // ثم جلب بيانات المستخدم من API المزود
  
  // للتطوير: إرجاع بيانات تجريبية
  const mockUsers: Record<string, any> = {
    google: {
      id: `google_${Date.now()}`,
      email: `user@gmail.com`,
      name: "Google User",
      picture: "https://via.placeholder.com/150",
      verified: true
    },
    facebook: {
      id: `facebook_${Date.now()}`,
      email: `user@facebook.com`,
      name: "Facebook User",
      picture: "https://via.placeholder.com/150"
    },
    twitter: {
      id: `twitter_${Date.now()}`,
      username: "twitter_user",
      name: "Twitter User"
    },
    linkedin: {
      id: `linkedin_${Date.now()}`,
      email: `user@linkedin.com`,
      name: "LinkedIn User",
      company: "Tech Company"
    },
    apple: {
      id: `apple_${Date.now()}`,
      email: `user@icloud.com`,
      name: "Apple User"
    }
  };

  return mockUsers[provider] || null;
}

// دالة لتحديد نوع الحساب من بيانات OAuth
function determineRole(provider: string, userData: any): string {
  // LinkedIn + شركة = حساب شركة
  if (provider === 'linkedin' && userData.company) {
    return 'company';
  }
  
  // افتراضياً: مستخدم عادي
  return 'user';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query;
  const { code, state } = req.query;

  if (!provider || typeof provider !== "string") {
    return res.redirect('/login?error=invalid_provider');
  }

  if (!code) {
    return res.redirect('/login?error=no_code');
  }

  try {
    // جلب بيانات المستخدم من المزود
    const userData = await fetchUserFromProvider(provider, code as string);
    
    if (!userData) {
      return res.redirect('/login?error=fetch_failed');
    }

    // تحديد نوع الحساب
    const role = determineRole(provider, userData);

    // إنشاء/تحديث المستخدم في قاعدة البيانات
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email || `${userData.id}@${provider}.oauth`,
      role,
      provider,
      isVerified: userData.verified || true, // OAuth users usually verified
      picture: userData.picture,
      createdAt: new Date().toISOString(),
      features: ["DASHBOARD_ACCESS"]
    };

    // حفظ في Session/Database
    // في الإنتاج: استخدام NextAuth أو Session middleware
    
    // إعادة التوجيه مع بيانات المستخدم في query
    const userDataEncoded = encodeURIComponent(JSON.stringify(user));
    return res.redirect(`/auth/oauth-success?user=${userDataEncoded}`);
    
  } catch (error) {
    console.error(`OAuth callback error for ${provider}:`, error);
    return res.redirect('/login?error=auth_failed');
  }
}

