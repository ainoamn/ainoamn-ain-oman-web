import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  // التحقق من قوة كلمة المرور
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }

  try {
    // في الإنتاج: التحقق من الكود مرة أخرى
    // const storedCode = await getResetCode(email);
    // if (!storedCode || storedCode.code !== code) {
    //   return res.status(400).json({ error: "كود غير صحيح" });
    // }
    // if (storedCode.expiresAt < new Date()) {
    //   return res.status(400).json({ error: "انتهت صلاحية الكود" });
    // }

    // في الإنتاج: تشفير كلمة المرور وتحديثها في قاعدة البيانات
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await updateUserPassword(email, hashedPassword);
    // await deleteResetCode(email);

    console.log(`Password reset for ${email}`);

    return res.status(200).json({
      success: true,
      message: "تم إعادة تعيين كلمة المرور بنجاح"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "فشل إعادة تعيين كلمة المرور" });
  }
}

