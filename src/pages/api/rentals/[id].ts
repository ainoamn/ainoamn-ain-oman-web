// src/pages/api/rentals/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { repo } from "@/server/rentals/workflow";
import { getById } from "@/server/properties/store";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  
  if (!id) {
    return res.status(400).json({ error: 'Missing rental ID' });
  }

  if (req.method === "GET") {
    try {
      console.log(`🔍 جلب بيانات العقد: ${id}`);
      const rental = await repo.load(id);
      
      if (!rental) {
        console.error(`❌ العقد غير موجود: ${id}`);
        return res.status(404).json({ error: 'Rental not found' });
      }
      
      console.log(`✅ تم جلب بيانات العقد:`, {
        id: rental.id,
        propertyId: rental.propertyId,
        tenantName: rental.tenantName,
        startDate: rental.startDate,
        endDate: rental.endDate,
        monthlyRent: rental.monthlyRent
      });
      
      // جلب بيانات العقار إذا كان propertyId موجوداً
      let property = null;
      if (rental.propertyId) {
        try {
          console.log(`🔍 جلب بيانات العقار: ${rental.propertyId}`);
          
          // المحاولة الأولى: من db.json
          property = getById(rental.propertyId);
          
          // المحاولة الثانية: من ملفات .data/properties/
          if (!property) {
            const propertiesPath = path.resolve(process.cwd(), ".data", "properties");
            if (fs.existsSync(propertiesPath)) {
              const propertyFiles = fs.readdirSync(propertiesPath).filter(f => f.endsWith(".json"));
              
              for (const file of propertyFiles) {
                try {
                  const filePath = path.join(propertiesPath, file);
                  const propertyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
                  
                  // البحث بـ ID أو referenceNo
                  if (propertyData.id === rental.propertyId || 
                      propertyData.referenceNo === rental.propertyId ||
                      file.replace('.json', '') === rental.propertyId) {
                    property = propertyData;
                    console.log(`✅ تم جلب بيانات العقار من ملف: ${file}`);
                    break;
                  }
                } catch (err) {
                  // تجاهل الأخطاء في قراءة ملف واحد
                }
              }
            }
          }
          
          if (property) {
            console.log(`✅ تم جلب بيانات العقار:`, {
              id: property.id,
              buildingNumber: property.buildingNumber,
              address: property.address || property.title
            });
          } else {
            console.warn(`⚠️ العقار غير موجود: ${rental.propertyId}`);
          }
        } catch (err) {
          console.error('❌ خطأ في جلب بيانات العقار:', err);
        }
      }
      
      return res.status(200).json({ rental, property });
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات العقد:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === "PATCH") {
    try {
      const updates = req.body;
      const rental = await repo.load(id);
      
      if (!rental) {
        return res.status(404).json({ error: 'Rental not found' });
      }
      
      const updatedRental = {
        ...rental,
        ...updates,
        updatedAt: Date.now()
      };
      
      await repo.save(updatedRental);
      
      return res.status(200).json({ rental: updatedRental });
    } catch (error) {
      console.error('Error updating rental:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === "DELETE") {
    try {
      // حذف العقد (إذا كان النظام يدعم ذلك)
      // يمكن إضافة منطق الحذف هنا
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting rental:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

