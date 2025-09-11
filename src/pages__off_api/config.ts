import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "config.json");

const fallback = {
  plan: "pro",
  features: {
    aiAssistant: true, maps: true, analytics: true, media: true, attachments: true,
    paymentPlans: true, units: true, webhooks: true, externalLinks: true, theming: true
  },
  brand: { colors: { brand600:"#0d9488", brand700:"#0f766e", brand800:"#115e59", pageBg:"#FAF9F6" } },
  webhooks: []
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
      fs.writeFileSync(DATA_PATH, JSON.stringify(fallback, null, 2), "utf-8");
    }
    const config = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8") || "{}");
    return res.status(200).json({ ok: true, config });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
