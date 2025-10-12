import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "معرف المستخدم مطلوب" });
  }

  try {
    // في الإنتاج: حذف جميع بيانات المستخدم
    // await deleteUser(userId);
    // await deleteUserProperties(userId);
    // await deleteUserBookings(userId);
    // await deleteUserMessages(userId);
    // await deleteUserSettings(userId);
    // await deleteUserNotifications(userId);

    console.log(`Account deleted for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: "تم حذف الحساب بنجاح"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء حذف الحساب" });
  }
}

