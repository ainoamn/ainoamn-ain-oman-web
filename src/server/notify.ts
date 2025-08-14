// src/server/notify.ts
import nodemailer from "nodemailer";

type EmailInput = { to: string; subject: string; text: string };
type WAInput = { to: string; body: string };

function hasSmtp() {
  return !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS && !!process.env.SMTP_FROM;
}
function hasWhatsapp() {
  return !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_ID;
}

export async function sendEmail({ to, subject, text }: EmailInput) {
  if (!hasSmtp()) {
    console.log("[notify] SMTP not configured. Skipping email to:", to, subject);
    return { ok: false, skipped: true };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject,
    text,
  });

  return { ok: true };
}

export async function sendWhatsapp({ to, body }: WAInput) {
  if (!hasWhatsapp()) {
    console.log("[notify] WhatsApp not configured. Skipping WA to:", to, body);
    return { ok: false, skipped: true };
  }
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_ID!;
  const r = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: true, body },
    }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    console.warn("[notify] WhatsApp error:", r.status, t);
    return { ok: false };
  }
  return { ok: true };
}
