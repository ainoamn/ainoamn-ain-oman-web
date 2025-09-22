// src/server/ids/serialNumbers.ts
import { readDb, writeDb } from "@/server/db/jsonDb";


function pad(n: number, width = 6) {
return String(n).padStart(width, "0");
}


export function nextSerial(prefix: "AO-P" | "AO-B" | "AO-C" | "AO-R") {
const db = readDb();
const current = db.counters[prefix] ?? 0;
const next = current + 1;
db.counters[prefix] = next;
writeDb(db);
return `${prefix}-${pad(next)}`;
}