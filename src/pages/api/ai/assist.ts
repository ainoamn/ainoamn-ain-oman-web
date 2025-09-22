import type { NextApiRequest, NextApiResponse } from "next";

/** مساعد بسيط بدون اتصال خارجي — يقدّم نصائح عامة بالاعتماد على بيانات المشروع */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const q: string = (body?.question || "").toLowerCase();
    const p = body?.project || {};
    const name = p?.title || "المشروع";

    let answer = `تحليل سريع لـ "${name}":\n`;
    if (q.includes("تسويق") || q.includes("marketing")) {
      answer += "- ابدأ بحملة توعية محلية (Google/Meta) على نصف القطر 10–20 كم.\n";
      answer += "- أنشئ جولة افتراضية للغرف والنماذج.\n";
      answer += "- قدم خطة دفع جذابة (10% مقدم + أقساط مرنة).\n";
    } else if (q.includes("تسعير") || q.includes("pricing")) {
      answer += "- قارِن سعر المتر مع 3 مشاريع منافسة.\n";
      answer += "- خصم حجز مبكر 2–3% لأول 10 عملاء.\n";
    } else if (q.includes("مخاطر") || q.includes("risk")) {
      answer += "- زيادات مواد البناء: أضف بند تصاعد 3–5%.\n";
      answer += "- تأخر المقاول: عقود SLA مع غرامات تأخير.\n";
    } else {
      answer += "- حدّد شرائح العملاء الرئيسية واعكسها في الرسائل التسويقية.\n";
      answer += "- تأكد من ربط CRM لاستقبال الاستفسارات.\n";
    }

    return res.status(200).json({ ok: true, answer });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
