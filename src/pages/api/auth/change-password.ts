import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  // التحقق من قوة كلمة المرور الجديدة
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }

  try {
    // في الإنتاج: التحقق من كلمة المرور الحالية
    // const user = await findUser(userId);
    // const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    // if (!isValid) {
    //   return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
    // }

    // في الإنتاج: تشفير وحفظ كلمة المرور الجديدة
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await updateUserPassword(userId, hashedPassword);

    console.log(`Password changed for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح"
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء تغيير كلمة المرور" });
  }
}

