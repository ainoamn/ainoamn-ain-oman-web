import type { NextApiRequest, NextApiResponse } from "next";

type Success = {
  id: string;
  name: string;
  role: string;
  features: string[];
};
type Err = { error: string };

const DEV_PHONE = "95655200";
const DEV_OTP = "1989";

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Success | Err>) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const phone = onlyDigits(String(body?.phone || ""));
    const code = onlyDigits(String(body?.code || ""));
    const name = String(body?.name || phone);
    const role = String(body?.role || "individual_tenant");

    // وضع تجريبي ثابت
    if (phone === DEV_PHONE && code === DEV_OTP) {
      return res.status(200).json({
        id: `u-${DEV_PHONE}`,
        name: name || "مستخدم تجريبي",
        role,
        features: ["DASHBOARD_ACCESS", "CREATE_AUCTION"],
      });
    }

    // تحقق فعلي (اختياري): قارن بالكود المخزن لديك
    // إذا لم تكن بنية التحقق متوفرة، ارفض
    return res.status(401).json({ error: "INVALID_OTP" });
  } catch (e: any) {
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
