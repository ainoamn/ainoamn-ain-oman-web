// src/server/rentals/repo.file.ts
import fs from "fs"; import path from "path";
import type { Rental, RentalRepository } from "./repo";

const ROOT = path.resolve(process.cwd(), ".data/rentals");
const ensure = () => fs.mkdirSync(ROOT, { recursive: true });
const fpath = (id: string) => (ensure(), path.join(ROOT, `${id}.json`));

function readAll(): Rental[] {
  ensure();
  return fs.readdirSync(ROOT).filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")) as Rental);
}

export class FileRentalRepo implements RentalRepository {
  async load(id: string) { const p = fpath(id); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; }
  async save(r: Rental) { r.updatedAt = Date.now(); fs.writeFileSync(fpath(r.id), JSON.stringify(r, null, 2), "utf8"); return r; }
  async listByProperty(propertyId: string) { return readAll().filter(r => r.propertyId === propertyId); }
  async listMine(userId: string) { return readAll().filter(r => r.tenantId === userId || r.history.some(h => h.by === userId)); }
  async listAll() { return readAll(); }
}
