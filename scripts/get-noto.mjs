// scripts/get-noto.mjs
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const RELEASE = process.env.NOTO_MONTHLY || "noto-monthly-release-2025.05.01";
const BASE = `https://raw.githubusercontent.com/notofonts/notofonts.github.io/${RELEASE}/fonts/NotoNaskhArabic/hinted/ttf`;
const FILES = ["NotoNaskhArabic-Regular.ttf", "NotoNaskhArabic-Bold.ttf"];
const OUTDIR = path.resolve("src/server/fonts");
fs.mkdirSync(OUTDIR, { recursive: true });

function dl(url, dst) {
  return new Promise((resolve, reject) => {
    const f = fs.createWriteStream(dst);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      res.pipe(f);
      f.on("finish", () => f.close(() => resolve(dst)));
    }).on("error", reject);
  });
}

for (const f of FILES) {
  const url = `${BASE}/${f}`;
  const dst = path.join(OUTDIR, f);
  // eslint-disable-next-line no-console
  console.log("Downloading", url);
  // eslint-disable-next-line no-await-in-loop
  await dl(url, dst);
  console.log("Saved", dst);
}
console.log("Done.");
