// src/server/notify.ts
// يعمل حتى لو لم تُثبت nodemailer. يرسل فعليًا إن كانت مثبّتة ومهيّأة.

type EmailInput = { to: string; subject: string; text: string };
type WAInput = { to: string; body: string };

let cachedTransport: any | null = null;

// تعطيل تلقائي على edge runtime
const RUNTIME_EDGE = String(process.env.NEXT_RUNTIME || "").toLowerCase() === "edge";

async function getTransport() {
  if (RUNTIME_EDGE) return false;            // nodemailer لا يعمل على edge
  if (cachedTransport !== null) return cachedTransport;

  try {
    // استيراد ديناميكي لتجنب خطأ البناء إذا الحزمة غير مثبّتة
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dyn = new Function("m", "return import(m)");
    const nm: any = await (dyn as any)("nodemailer");

    cachedTransport = nm.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } catch {
    cachedTransport = false; // معطّل
  }
  return cachedTransport;
}

export async function sendEmail(input: EmailInput) {
  const transport = await getTransport();
  if (!transport) {
    console.warn("[notify] email disabled (nodemailer not available or edge runtime)");
    return { ok: false, disabled: true };
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || "no-reply@localhost",
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
  return { ok: true };
}

export async function sendWhatsApp(_input: WAInput) {
  // ضع تكامل واتساب الفعلي لاحقًا
  console.info("[notify] WA stub called");
  return { ok: true, stub: true };
}
