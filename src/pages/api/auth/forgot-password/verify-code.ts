import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "البريد الإلكتروني والكود مطلوبان" });
  }

  try {
    // في الإنتاج: التحقق من الكود في قاعدة البيانات
    // const storedCode = await getResetCode(email);
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

    return res.status(200).json({
      success: true,
      message: "تم التحقق من الكود بنجاح"
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return res.status(500).json({ error: "فشل التحقق من الكود" });
  }
}

