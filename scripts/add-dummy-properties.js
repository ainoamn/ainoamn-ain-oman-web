const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.data', 'db.json');
const seedPath = path.join(__dirname, '..', '.data', 'seed-dummy-properties.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const newProps = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const existingIds = new Set((db.properties || []).map(p => p.id));
let added = 0;
for (const p of newProps) {
  if (!existingIds.has(p.id)) {
    db.properties.push(p);
    existingIds.add(p.id);
    added++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Added', added, 'dummy properties. Total properties:', db.properties.length);
