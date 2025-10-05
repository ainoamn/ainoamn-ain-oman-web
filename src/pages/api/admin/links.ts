// =============================================
// src/pages/api/admin/links.ts
// =============================================

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";

type Link = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  group?: string; // optional grouping label
  createdAt: string;
};

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "admin-links.json");

function readLinks(): Link[] {
  try {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLinks(links: Link[]) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(links, null, 2), "utf8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ links: readLinks() });
  }

  if (req.method === "POST") {
    const { label, href, icon, group } = req.body || {};
    if (!label || !href) return res.status(400).json({ error: "label and href are required" });
    const links = readLinks();
    const link: Link = {
      id: crypto.randomUUID(),
      label: String(label),
      href: String(href),
      icon: icon ? String(icon) : undefined,
      group: group ? String(group) : undefined,
      createdAt: new Date().toISOString(),
    };
    links.unshift(link);
    writeLinks(links);
    return res.status(201).json({ link });
  }

  if (req.method === "DELETE") {
    const id = (req.query?.id as string) || (req.body?.id as string);
    if (!id) return res.status(400).json({ error: "id is required" });
    const links = readLinks().filter((l) => l.id !== id);
    writeLinks(links);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
