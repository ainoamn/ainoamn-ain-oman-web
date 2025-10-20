// scripts/prune-uploads.js
// Remove heavy user-uploaded assets during CI builds to avoid deployment upload issues.
// Safe to run locally too; it only runs on Vercel CI or when PRUNE_UPLOADS=1.

const fs = require('fs');
const path = require('path');

const isCI = process.env.VERCEL === '1' || process.env.CI === '1' || process.env.PRUNE_UPLOADS === '1';
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p)) {
    const fp = path.join(p, entry);
    const stat = fs.lstatSync(fp);
    if (stat.isDirectory()) rmrf(fp); else fs.unlinkSync(fp);
  }
  fs.rmdirSync(p);
}

try {
  if (isCI) {
    if (fs.existsSync(uploadsDir)) {
      console.log(`[prune-uploads] Removing ${uploadsDir} to keep deployment light...`);
      rmrf(uploadsDir);
    } else {
      console.log('[prune-uploads] No uploads dir to prune.');
    }
  } else {
    console.log('[prune-uploads] Skipped (not CI). Set PRUNE_UPLOADS=1 to force.');
  }
} catch (err) {
  console.warn('[prune-uploads] Non-fatal error:', err.message);
}
