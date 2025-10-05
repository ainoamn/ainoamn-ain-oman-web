import type { NextApiRequest, NextApiResponse } from "next";

type Ok = { ok: true; demo?: boolean; demoCode?: string };
type Err = { error: string };

const DEV_PHONE = "95655200";
const DEV_OTP = "1989";

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  try {
    const { phone } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const p = onlyDigits(String(phone || ""));
    if (!p) return res.status(400).json({ error: "PHONE_REQUIRED" });

    // وضع تجريبي ثابت: الرقم 95655200 يطلق OTP = 1989
    if (p === DEV_PHONE) {
      return res.status(200).json({ ok: true, demo: true, demoCode: DEV_OTP });
    }

    // إنتاج فعلي (اختياري): هنا ترسل OTP عبر مزود حقيقي
    // سنعيد نجاحًا عامًا دون كشف الكود
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
