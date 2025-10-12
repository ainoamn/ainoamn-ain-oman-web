import type { NextApiRequest, NextApiResponse } from "next";

// دالة لتحديد نوع الحساب تلقائياً بناءً على البريد الإلكتروني أو البيانات الأخرى
function determineUserRole(email: string, name?: string): string {
  // يمكن تطوير هذه الدالة لتحديد النوع بناءً على معايير مختلفة
  // مثلاً: البريد التجاري، المجال، البيانات المدخلة، إلخ
  
  // افتراضياً: جميع المستخدمين يبدأون كمستخدمين عاديين
  // ويمكنهم تحديث نوع حسابهم لاحقاً من الإعدادات
  return "user";
  
  // في المستقبل يمكن إضافة منطق مثل:
  // if (email.includes('@company.com')) return 'company';
  // if (email.includes('@broker.')) return 'broker';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
  }

  // التحقق من صحة البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
  }

  // التحقق من قوة كلمة المرور
  if (password.length < 8) {
    return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }

  try {
    // في الإنتاج، يجب حفظ في قاعدة البيانات مع تشفير كلمة المرور
    // هنا نقوم بإنشاء مستخدم تجريبي
    const userId = `USER-${Date.now()}`;
    const userName = name || email.split('@')[0];
    
    // تحديد نوع الحساب تلقائياً
    const userRole = determineUserRole(email, userName);
    
    const newUser = {
      id: userId,
      email,
      name: userName,
      role: userRole, // يتم تحديده تلقائياً
      isVerified: false, // غير موثق حتى يتم التحقق
      createdAt: new Date().toISOString(),
      features: ["DASHBOARD_ACCESS"]
    };

    // في الإنتاج: حفظ في قاعدة البيانات
    // await saveUser(newUser, hashedPassword);

    return res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      ...newUser
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحساب" });
  }
}

