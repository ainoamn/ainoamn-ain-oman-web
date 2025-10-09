import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, userId } = req.body;

  if (!email || !userId) {
    return res.status(400).json({ error: "البريد الإلكتروني ومعرف المستخدم مطلوبان" });
  }

  try {
    // توليد كود عشوائي مكون من 6 أرقام
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // في الإنتاج: حفظ الكود في قاعدة البيانات مع تاريخ انتهاء (مثلاً 10 دقائق)
    // await saveVerificationCode(userId, code, "email", expiresAt);

    // في الإنتاج: إرسال البريد الإلكتروني باستخدام خدمة مثل SendGrid أو AWS SES
    // await sendEmail({
    //   to: email,
    //   subject: "كود التحقق - Ain Oman",
    //   html: `كود التحقق الخاص بك هو: <strong>${code}</strong>`
    // });

    console.log(`Verification code for ${email}: ${code}`);

    return res.status(200).json({
      success: true,
      message: "تم إرسال كود التحقق",
      demoCode: code // في الإنتاج: لا ترسل الكود في الاستجابة!
    });
  } catch (error) {
    console.error("Send email verification error:", error);
    return res.status(500).json({ error: "فشل إرسال كود التحقق" });
  }
}

