// src/server/db/jsonDb.ts
import fs from "fs";
import path from "path";
import type { DbShape } from "@/types/domain";


const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");


function ensure() {
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) {
const initial: DbShape = {
properties: [],
bookings: [],
payments: [],
contracts: [],
tenantDocs: [],
counters: { "AO-P": 0, "AO-B": 0, "AO-C": 0, "AO-R": 0 },
};
fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
}
}


export function readDb(): DbShape {
ensure();
const raw = fs.readFileSync(DB_FILE, "utf-8");
return JSON.parse(raw) as DbShape;
}


export function writeDb(db: DbShape) {
ensure();
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}