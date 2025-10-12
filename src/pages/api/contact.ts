// src/pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Msg = { 
  name: string; 
  email: string; 
  phone?: string;
  subject?: string;
  message: string; 
  at: string; 
  ua?: string; 
  ip?: string;
  status?: string;
};

const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "contact-messages.json");

function read(): Msg[] {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return []; }
}
function write(list: Msg[]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, phone, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "الاسم والبريد الإلكتروني والرسالة مطلوبة" });
  }

  // التحقق من صحة البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
  }

  const item: Msg = {
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    phone: phone ? String(phone).slice(0, 20) : undefined,
    subject: subject ? String(subject).slice(0, 200) : "استفسار عام",
    message: String(message).slice(0, 5000),
    at: new Date().toISOString(),
    status: "new", // new, replied, archived
    ua: req.headers["user-agent"] as string,
    ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "") as string,
  };

  const list = read();
  list.unshift(item);
  write(list);

  // في الإنتاج: إرسال بريد إلكتروني للإدارة
  // await sendEmail({
  //   to: 'info@ainoman.om',
  //   subject: `رسالة جديدة من ${name} - ${subject}`,
  //   html: `
  //     <h2>رسالة جديدة من نموذج الاتصال</h2>
  //     <p><strong>الاسم:</strong> ${name}</p>
  //     <p><strong>البريد:</strong> ${email}</p>
  //     <p><strong>الهاتف:</strong> ${phone || 'غير متوفر'}</p>
  //     <p><strong>الموضوع:</strong> ${subject}</p>
  //     <p><strong>الرسالة:</strong></p>
  //     <p>${message}</p>
  //   `
  // });

  // إرسال بريد تأكيد للمستخدم
  // await sendEmail({
  //   to: email,
  //   subject: 'تم استلام رسالتك - Ain Oman',
  //   html: `
  //     <p>عزيزي ${name},</p>
  //     <p>شكراً لتواصلك معنا. تم استلام رسالتك بنجاح وسنرد عليك في أقرب وقت ممكن.</p>
  //     <p>مع تحيات فريق Ain Oman</p>
  //   `
  // });

  console.log(`New contact message from ${name} (${email}) - Subject: ${subject}`);

  return res.status(200).json({ 
    ok: true,
    message: "تم إرسال رسالتك بنجاح"
  });
}
