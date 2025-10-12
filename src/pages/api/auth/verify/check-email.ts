import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, userId } = req.body;

  if (!code || !userId) {
    return res.status(400).json({ error: "الكود ومعرف المستخدم مطلوبان" });
  }

  try {
    // في الإنتاج: التحقق من الكود في قاعدة البيانات
    // const storedCode = await getVerificationCode(userId, "email");
    // if (!storedCode || storedCode.code !== code) {
    //   return res.status(400).json({ error: "كود غير صحيح" });
    // }
    // if (storedCode.expiresAt < new Date()) {
    //   return res.status(400).json({ error: "انتهت صلاحية الكود" });
    // }

    // للتطوير: قبول أي كود مكون من 6 أرقام
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return res.status(400).json({ error: "كود غير صحيح" });
    }

    // في الإنتاج: تحديث حالة المستخدم في قاعدة البيانات
    // await updateUser(userId, { isVerified: true });
    // await deleteVerificationCode(userId, "email");

    return res.status(200).json({
      success: true,
      message: "تم التوثيق بنجاح",
      isVerified: true
    });
  } catch (error) {
    console.error("Check email verification error:", error);
    return res.status(500).json({ error: "فشل التحقق من الكود" });
  }
}

