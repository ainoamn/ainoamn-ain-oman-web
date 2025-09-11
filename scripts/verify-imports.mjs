import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const tsLike = [".ts", ".tsx", ".d.ts"];
const alias = "@/";

function* walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(name)) yield p;
  }
}

// exists with case sensitivity
function existsCaseSensitive(absFile) {
  const parts = absFile.split(path.sep);
  let cur = parts[0] || path.sep;
  for (let i = 1; i < parts.length; i++) {
    const seg = parts[i];
    const list = fs.readdirSync(cur, { withFileTypes: true }).map(d => d.name);
    if (!list.includes(seg)) return false;
    cur = path.join(cur, seg);
  }
  return fs.existsSync(cur);
}

let failed = false;

for (const file of walk(SRC)) {
  const text = fs.readFileSync(file, "utf8");
  const imports = [...text.matchAll(/from\s+["']([^"']+)["']/g)].map(m => m[1]);
  for (const imp of imports) {
    if (imp.startsWith(alias)) {
      const rel = imp.slice(alias.length);
      const base = path.join(SRC, rel);
      const candidates = [
        base,
        ...tsLike.map(ext => base + ext),
        path.join(base, "index.ts"),
        path.join(base, "index.tsx"),
      ];
      const hit = candidates.find(p => existsCaseSensitive(p));
      if (!hit) {
        console.error(`Missing or wrong-case import: ${imp} in ${path.relative(ROOT, file)}`);
        failed = true;
      }
    } else if (imp.startsWith(".") || imp.startsWith("/")) {
      const base = path.resolve(path.dirname(file), imp);
      const candidates = [
        base,
        ...tsLike.map(ext => base + ext),
        path.join(base, "index.ts"),
        path.join(base, "index.tsx"),
      ];
      const hit = candidates.find(p => existsCaseSensitive(p));
      if (!hit) {
        console.error(`Missing or wrong-case import: ${imp} in ${path.relative(ROOT, file)}`);
        failed = true;
      }
    }
  }
}

if (failed) {
  console.error("verify-imports: failed");
  process.exit(1);
} else {
  console.log("verify-imports: ok");
}
