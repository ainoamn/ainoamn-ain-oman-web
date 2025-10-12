import type { NextApiRequest, NextApiResponse } from "next";

// بيانات OAuth لكل مزود (في الإنتاج: يجب تخزينها في متغيرات البيئة)
const oauthConfig: Record<string, any> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.GOOGLE_CLIENT_ID || 'DEMO_CLIENT_ID',
    scope: 'openid email profile',
    responseType: 'code'
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    clientId: process.env.FACEBOOK_CLIENT_ID || 'DEMO_CLIENT_ID',
    scope: 'email public_profile',
    responseType: 'code'
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: process.env.TWITTER_CLIENT_ID || 'DEMO_CLIENT_ID',
    scope: 'tweet.read users.read',
    responseType: 'code'
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    clientId: process.env.LINKEDIN_CLIENT_ID || 'DEMO_CLIENT_ID',
    scope: 'r_liteprofile r_emailaddress',
    responseType: 'code'
  },
  apple: {
    authUrl: 'https://appleid.apple.com/auth/authorize',
    clientId: process.env.APPLE_CLIENT_ID || 'DEMO_CLIENT_ID',
    scope: 'name email',
    responseType: 'code'
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query;

  if (!provider || typeof provider !== "string") {
    return res.status(400).json({ error: "مزود الخدمة غير صحيح" });
  }

  const config = oauthConfig[provider.toLowerCase()];
  
  if (!config) {
    return res.status(400).json({ error: "مزود الخدمة غير مدعوم" });
  }

  // للتطوير: إعادة توجيه مباشرة إلى callback مع كود تجريبي
  if (config.clientId === 'DEMO_CLIENT_ID') {
    const demoCode = `DEMO_${provider.toUpperCase()}_${Date.now()}`;
    const callbackUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/oauth/${provider}/callback`;
    return res.redirect(`${callbackUrl}?code=${demoCode}&state=demo`);
  }

  // للإنتاج: إعادة توجيه إلى OAuth provider
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const callbackUrl = `${baseUrl}/api/auth/oauth/${provider}/callback`;
  const state = Math.random().toString(36).substring(7); // State for CSRF protection

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    scope: config.scope,
    response_type: config.responseType,
    state
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;
  
  return res.redirect(authUrl);
}

