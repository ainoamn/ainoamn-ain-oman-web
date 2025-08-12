// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

// أثناء التطوير مع Next.js قد يُعاد تحميل الموديولات
// لذلك نستخدم متغيّرًا عامًا لمنع إنشاء أكثر من PrismaClient
export const prisma =
  global.__prisma__ ||
  new PrismaClient({
    log: ["warn", "error"], // يمكنك إضافة "query" أثناء التصحيح
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma;
}
