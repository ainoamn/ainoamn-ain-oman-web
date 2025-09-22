// src/lib/serialNumbers.ts
import { prisma } from "./prisma";

// أنواع الكيانات المدعومة الآن — يمكنك التوسعة لاحقًا
export type EntityKey =
  | "PROPERTY"
  | "AUCTION"
  | "CONTRACT"
  | "INVOICE"
  | "PAYMENT"
  | "TASK"
  | "TICKET";

// خرائط البادئة (Prefix) لكل نوع
const PREFIX_MAP: Record<EntityKey, string> = {
  PROPERTY: "PR",
  AUCTION: "AU",
  CONTRACT: "CN",
  INVOICE: "IN",
  PAYMENT: "PM",
  TASK: "TS",
  TICKET: "TK",
};

// خيارات توليد الرقم
export type IssueOptions = {
  year?: number; // افتراضي: السنة الحالية
  width?: number; // عدد خانات الترقيم — افتراضي 6 => 000001
  prefixOverride?: string; // إن أردت تجاوز البادئة
  resetPolicy?: "yearly" | "never"; // افتراضي yearly
  // معلومات للاحتفاظ بها في سجل التدقيق
  audit?: {
    actorId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    resourceIdHint?: string | null; // إن كان لديك معرّف مؤقت
    detailsJson?: Record<string, unknown> | null;
  };
};

function getCurrentYear(): number {
  const now = new Date();
  return now.getFullYear();
}

function leftPad(num: number, width = 6): string {
  const s = String(num);
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

function buildSerial(prefix: string, year: number, counter: number, width = 6) {
  return `${prefix}-${year}-${leftPad(counter, width)}`;
}

/**
 * يُصدر رقمًا متسلسلاً بشكل ذري (ذو معاملة واحدة) لمنع التصادم حتى مع اتصالات متوازية.
 *
 * السلوك:
 * - إن لم يوجد صف لـ (entity, year) يتم إنشاؤه بـ counter=1
 * - إن وجد، نزيد counter بمقدار 1 بإجراء update في معاملة.
 */
export async function issueNextSerial(
  entity: EntityKey,
  opts: IssueOptions = {}
): Promise<{
  ok: true;
  entity: EntityKey;
  year: number;
  counter: number;
  serial: string;
}> {
  const year =
    opts.resetPolicy === "never"
      ? 0 // سياسة عدم إعادة التعيين — نضع السنة 0 كمجموعة واحدة
      : typeof opts.year === "number"
      ? opts.year
      : getCurrentYear();

  const prefix =
    (opts.prefixOverride && opts.prefixOverride.trim()) || PREFIX_MAP[entity];
  const width = opts.width ?? 6;

  // نجعل العملية ذرية عبر معاملة
  const result = await prisma.$transaction(async (tx) => {
    // نحاول إيجاد صف موجود
    const existing = await tx.serialCounter.findUnique({
      where: { entity_year: { entity, year } },
    });

    if (!existing) {
      // إنشاء جديد لأول مرة لهذا النوع والسنة
      const created = await tx.serialCounter.create({
        data: { entity, year, counter: 1 },
      });

      const serial = buildSerial(prefix, year === 0 ? getCurrentYear() : year, 1, width);

      // سجل تدقيق اختياري
      await writeAudit(tx, {
        eventType: "SERIAL_ISSUED",
        actorId: opts.audit?.actorId ?? null,
        resource: entity,
        resourceId: opts.audit?.resourceIdHint ?? null,
        ip: opts.audit?.ip ?? null,
        userAgent: opts.audit?.userAgent ?? null,
        details: {
          serial,
          entity,
          year,
          counter: 1,
          resetPolicy: opts.resetPolicy ?? "yearly",
        },
      });

      return { counter: created.counter, serial };
    } else {
      // تحديث ذري للعداد
      const updated = await tx.serialCounter.update({
        where: { entity_year: { entity, year } },
        data: { counter: { increment: 1 } },
      });

      const serial = buildSerial(
        prefix,
        year === 0 ? getCurrentYear() : year,
        updated.counter,
        width
      );

      await writeAudit(tx, {
        eventType: "SERIAL_ISSUED",
        actorId: opts.audit?.actorId ?? null,
        resource: entity,
        resourceId: opts.audit?.resourceIdHint ?? null,
        ip: opts.audit?.ip ?? null,
        userAgent: opts.audit?.userAgent ?? null,
        details: {
          serial,
          entity,
          year,
          counter: updated.counter,
          resetPolicy: opts.resetPolicy ?? "yearly",
        },
      });

      return { counter: updated.counter, serial };
    }
  });

  return {
    ok: true,
    entity,
    year,
    counter: result.counter,
    serial: result.serial,
  };
}

// كتابة سجل تدقيق بسيط
async function writeAudit(
  tx: typeof prisma,
  params: {
    eventType: string;
    actorId: string | null;
    resource: string | null;
    resourceId: string | null;
    ip: string | null;
    userAgent: string | null;
    details: Record<string, unknown>;
  }
) {
  try {
    await tx.auditLog.create({
      data: {
        eventType: params.eventType,
        actorId: params.actorId ?? undefined,
        resource: params.resource ?? undefined,
        resourceId: params.resourceId ?? undefined,
        ip: params.ip ?? undefined,
        userAgent: params.userAgent ?? undefined,
        details: JSON.stringify(params.details),
      },
    });
  } catch {
    // لا توقف العملية إن فشل التدقيق
  }
}
