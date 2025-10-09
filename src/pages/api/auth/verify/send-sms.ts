import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, userId } = req.body;

  if (!phone || !userId) {
    return res.status(400).json({ error: "رقم الهاتف ومعرف المستخدم مطلوبان" });
  }

  try {
    // توليد كود عشوائي مكون من 6 أرقام
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // في الإنتاج: حفظ الكود في قاعدة البيانات
    // await saveVerificationCode(userId, code, "phone", expiresAt);

    // في الإنتاج: إرسال SMS/WhatsApp باستخدام خدمة مثل Twilio
    // await sendWhatsApp({
    //   to: phone,
    //   message: `كود التحقق الخاص بك هو: ${code}`
    // });

    console.log(`Verification code for ${phone}: ${code}`);

    return res.status(200).json({
      success: true,
      message: "تم إرسال كود التحقق عبر واتساب",
      demoCode: code // في الإنتاج: لا ترسل الكود في الاستجابة!
    });
  } catch (error) {
    console.error("Send SMS verification error:", error);
    return res.status(500).json({ error: "فشل إرسال كود التحقق" });
  }
}

