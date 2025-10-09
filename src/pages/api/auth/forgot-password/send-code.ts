import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
  }

  // التحقق من صحة البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
  }

  try {
    // في الإنتاج: التحقق من وجود المستخدم في قاعدة البيانات
    // const user = await findUserByEmail(email);
    // if (!user) {
    //   return res.status(404).json({ error: "البريد الإلكتروني غير مسجل" });
    // }

    // توليد كود عشوائي مكون من 6 أرقام
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // في الإنتاج: حفظ الكود في قاعدة البيانات مع تاريخ انتهاء (مثلاً 15 دقيقة)
    // await saveResetCode(email, code, expiresAt);

    // في الإنتاج: إرسال البريد الإلكتروني
    // await sendEmail({
    //   to: email,
    //   subject: "إعادة تعيين كلمة المرور - Ain Oman",
    //   html: `كود إعادة تعيين كلمة المرور: <strong>${code}</strong><br>
    //          الكود صالح لمدة 15 دقيقة.`
    // });

    console.log(`Password reset code for ${email}: ${code}`);

    return res.status(200).json({
      success: true,
      message: "تم إرسال كود إعادة التعيين",
      demoCode: code // في الإنتاج: لا ترسل الكود في الاستجابة!
    });
  } catch (error) {
    console.error("Send reset code error:", error);
    return res.status(500).json({ error: "فشل إرسال كود إعادة التعيين" });
  }
}

