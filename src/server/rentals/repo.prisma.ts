// src/server/rentals/repo.prisma.ts
// اختياري لاحقًا: نفّذ هذه الواجهة لو نقلت لقاعدة بيانات
import type { RentalRepository, Rental } from "./repo";
export class PrismaRentalRepo implements RentalRepository {
  constructor(private db: any){/* prisma client */}
  async load(id: string){ return this.db.rental.findUnique({ where:{ id } }); }
  async save(r: Rental){ r.updatedAt=Date.now(); return this.db.rental.upsert({ where:{id:r.id}, update:r as any, create:r as any }); }
  async listByProperty(propertyId: string){ return this.db.rental.findMany({ where:{ propertyId }, orderBy:{ createdAt:"desc" }}); }
  async listMine(userId: string){ return this.db.rental.findMany({ where:{ OR:[{ tenantId:userId },{ history:{ some:{ by:userId }}}]}}); }
  async listAll(){ return this.db.rental.findMany({ orderBy:{ createdAt:"desc" }}); }
}
