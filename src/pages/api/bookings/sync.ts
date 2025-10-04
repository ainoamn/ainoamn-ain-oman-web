// src/pages/api/bookings/sync.ts - API endpoint للمزامنة الذكية
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), ".data", "db.json");
const BOOKINGS_PATH = path.resolve(process.cwd(), ".data", "bookings.json");

function readDb(): any {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2), "utf8");
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8") || "{}");
  } catch { return {}; }
}

function writeDb(db: any) {
  if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db ?? {}, null, 2), "utf8");
}

function readBookingsFile(): any[] {
  try {
    if (!fs.existsSync(BOOKINGS_PATH)) fs.writeFileSync(BOOKINGS_PATH, JSON.stringify([], null, 2), "utf8");
    return JSON.parse(fs.readFileSync(BOOKINGS_PATH, "utf8") || "[]");
  } catch { return []; }
}

function writeBookingsFile(bookings: any[]) {
  if (!fs.existsSync(path.dirname(BOOKINGS_PATH))) fs.mkdirSync(path.dirname(BOOKINGS_PATH), { recursive: true });
  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(bookings, null, 2), "utf8");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (req.method === "POST") {
      const { action, booking, bookings } = req.body;

      switch (action) {
        case "sync_booking":
          return await syncSingleBooking(req, res, booking);
        
        case "sync_all":
          return await syncAllBookings(req, res, bookings);
        
        case "resolve_conflict":
          return await resolveConflict(req, res);
        
        case "get_sync_status":
          return await getSyncStatus(req, res);
        
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    }

    if (req.method === "GET") {
      return await getSyncStatus(req, res);
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error: any) {
    console.error("Sync API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}

async function syncSingleBooking(req: NextApiRequest, res: NextApiResponse, booking: any) {
  try {
    if (!booking || !booking.id) {
      return res.status(400).json({ error: "Booking data is required" });
    }

    const db = readDb();
    const bookingsFile = readBookingsFile();

    // البحث عن الحجز في كلا المصدرين
    const dbIndex = db.bookings?.findIndex((b: any) => b.id === booking.id) ?? -1;
    const fileIndex = bookingsFile.findIndex((b: any) => b.id === booking.id);

    // تحديث أو إضافة الحجز
    const updatedBooking = {
      ...booking,
      updatedAt: new Date().toISOString()
    };

    if (dbIndex >= 0) {
      db.bookings[dbIndex] = updatedBooking;
    } else {
      if (!db.bookings) db.bookings = [];
      db.bookings.push(updatedBooking);
    }

    if (fileIndex >= 0) {
      bookingsFile[fileIndex] = updatedBooking;
    } else {
      bookingsFile.push(updatedBooking);
    }

    // حفظ التغييرات
    writeDb(db);
    writeBookingsFile(bookingsFile);

    // إرسال إشعار للمتصفحات الأخرى
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('booking_sync');
      channel.postMessage({
        type: 'booking_synced',
        booking: updatedBooking,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      booking: updatedBooking,
      message: "Booking synced successfully"
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to sync booking",
      message: error.message
    });
  }
}

async function syncAllBookings(req: NextApiRequest, res: NextApiResponse, clientBookings: any[]) {
  try {
    const db = readDb();
    const serverBookings = db.bookings || [];
    const bookingsFile = readBookingsFile();

    const conflicts = [];
    const newBookings = [];
    const updatedBookings = [];

    // تحليل الاختلافات
    for (const clientBooking of clientBookings) {
      const serverBooking = serverBookings.find((b: any) => b.id === clientBooking.id);
      const fileBooking = bookingsFile.find((b: any) => b.id === clientBooking.id);

      if (!serverBooking && !fileBooking) {
        // حجز جديد
        newBookings.push(clientBooking);
      } else if (serverBooking && this.hasChanges(clientBooking, serverBooking)) {
        // تعارض
        conflicts.push({
          id: clientBooking.id,
          client: clientBooking,
          server: serverBooking
        });
      } else {
        // تحديث عادي
        updatedBookings.push(clientBooking);
      }
    }

    // تطبيق التغييرات
    for (const booking of [...newBookings, ...updatedBookings]) {
      const updatedBooking = {
        ...booking,
        updatedAt: new Date().toISOString()
      };

      // تحديث في db.json
      const dbIndex = db.bookings?.findIndex((b: any) => b.id === booking.id) ?? -1;
      if (dbIndex >= 0) {
        db.bookings[dbIndex] = updatedBooking;
      } else {
        if (!db.bookings) db.bookings = [];
        db.bookings.push(updatedBooking);
      }

      // تحديث في bookings.json
      const fileIndex = bookingsFile.findIndex((b: any) => b.id === booking.id);
      if (fileIndex >= 0) {
        bookingsFile[fileIndex] = updatedBooking;
      } else {
        bookingsFile.push(updatedBooking);
      }
    }

    // حفظ التغييرات
    writeDb(db);
    writeBookingsFile(bookingsFile);

    return res.status(200).json({
      success: true,
      synced: newBookings.length + updatedBookings.length,
      conflicts: conflicts.length,
      conflicts_data: conflicts,
      message: `Synced ${newBookings.length + updatedBookings.length} bookings`
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to sync all bookings",
      message: error.message
    });
  }
}

async function resolveConflict(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { bookingId, resolution } = req.body;

    if (!bookingId || !resolution) {
      return res.status(400).json({ error: "Booking ID and resolution are required" });
    }

    const db = readDb();
    const bookingsFile = readBookingsFile();

    // العثور على الحجز
    const dbBooking = db.bookings?.find((b: any) => b.id === bookingId);
    const fileBooking = bookingsFile.find((b: any) => b.id === bookingId);

    if (!dbBooking && !fileBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // تطبيق القرار
    const resolvedBooking = {
      ...(resolution === 'client' ? req.body.clientBooking : req.body.serverBooking),
      updatedAt: new Date().toISOString(),
      conflictResolved: true
    };

    // تحديث في كلا المصدرين
    if (dbBooking) {
      const dbIndex = db.bookings.findIndex((b: any) => b.id === bookingId);
      db.bookings[dbIndex] = resolvedBooking;
    }

    if (fileBooking) {
      const fileIndex = bookingsFile.findIndex((b: any) => b.id === bookingId);
      bookingsFile[fileIndex] = resolvedBooking;
    }

    // حفظ التغييرات
    writeDb(db);
    writeBookingsFile(bookingsFile);

    return res.status(200).json({
      success: true,
      booking: resolvedBooking,
      message: "Conflict resolved successfully"
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to resolve conflict",
      message: error.message
    });
  }
}

async function getSyncStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = readDb();
    const bookingsFile = readBookingsFile();

    const dbBookings = db.bookings || [];
    const fileBookings = bookingsFile || [];

    // إحصائيات المزامنة
    const stats = {
      total_db: dbBookings.length,
      total_file: fileBookings.length,
      last_sync: new Date().toISOString(),
      conflicts: 0,
      pending_sync: 0
    };

    // البحث عن التعارضات
    for (const dbBooking of dbBookings) {
      const fileBooking = fileBookings.find((b: any) => b.id === dbBooking.id);
      if (fileBooking && this.hasChanges(dbBooking, fileBooking)) {
        stats.conflicts++;
      }
    }

    return res.status(200).json({
      success: true,
      stats,
      message: "Sync status retrieved successfully"
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to get sync status",
      message: error.message
    });
  }
}

// دالة مساعدة للتحقق من التغييرات
function hasChanges(booking1: any, booking2: any): boolean {
  const fieldsToCompare = ['status', 'totalAmount', 'contractSigned', 'customerInfo'];
  
  for (const field of fieldsToCompare) {
    if (JSON.stringify(booking1[field]) !== JSON.stringify(booking2[field])) {
      return true;
    }
  }
  
  return false;
}



