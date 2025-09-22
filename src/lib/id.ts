// src/lib/id.ts
// Simple sequential ID helper backed by .data/sequences.json
import fs from "fs";
import path from "path";

type Namespace =
  | "users" | "companies" | "auctions" | "properties" | "contracts"
  | "badges" | "ads" | "tasks" | "reviews" | "hoa" | "investments";

const PREFIX: Record<Namespace, string> = {
  users: "USR",
  companies: "COM",
  auctions: "AUC",
  properties: "PRP",
  contracts: "CTR",
  badges: "BDG",
  ads: "ADS",
  tasks: "TSK",
  reviews: "REV",
  hoa: "HOA",
  investments: "INV"
};

const seqFile = path.join(process.cwd(), ".data", "sequences.json");

function readSeqs() {
  if (!fs.existsSync(seqFile)) {
    fs.mkdirSync(path.dirname(seqFile), { recursive: true });
    fs.writeFileSync(seqFile, JSON.stringify({
      users:0, companies:0, auctions:0, properties:0, contracts:0,
      badges:0, ads:0, tasks:0, reviews:0, hoa:0, investments:0
    }, null, 2));
  }
  const raw = fs.readFileSync(seqFile, "utf-8");
  return JSON.parse(raw) as Record<Namespace, number>;
}

function writeSeqs(seqs: Record<Namespace, number>) {
  fs.writeFileSync(seqFile, JSON.stringify(seqs, null, 2));
}

export function getNextId(ns: Namespace): string {
  const seqs = readSeqs();
  const n = (seqs[ns] ?? 0) + 1;
  seqs[ns] = n;
  writeSeqs(seqs);
  const prefix = PREFIX[ns];
  return `${prefix}-${n.toString().padStart(8, "0")}`;
}