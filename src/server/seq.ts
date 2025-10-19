// src/server/seq.ts
import fs from "fs";
import fsp from "fs/promises";
import path from "path";


const dataDir = path.join(process.cwd(), ".data");
const countersFile = path.join(dataDir, "counters.json");


async function ensure() {
if (!fs.existsSync(dataDir)) await fsp.mkdir(dataDir, { recursive: true });
if (!fs.existsSync(countersFile)) await fsp.writeFile(countersFile, JSON.stringify({}, null, 2), "utf8");
}


function format(prefix: string, n: number) {
return `${prefix}-${String(n).padStart(6, "0")}`;
}


export async function nextSeq(entity: "PROPERTY" | "TASK" = "PROPERTY") {
await ensure();
const raw = await fsp.readFile(countersFile, "utf8");
const js = raw ? JSON.parse(raw) : {};
const map = { PROPERTY: "AO-P", TASK: "AO-T" } as const;
const key = entity;
const cur = Number(js[key] || 0) + 1;
js[key] = cur;
await fsp.writeFile(countersFile, JSON.stringify(js, null, 2), "utf8");
return { seq: cur, referenceNo: format(map[key], cur) };
}
