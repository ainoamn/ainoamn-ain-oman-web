import type { NextApiRequest, NextApiResponse } from "next";

type AnyRec = Record<string, any>;

function cleanSingleItemArrays(obj: AnyRec): AnyRec {
  const out: AnyRec = { ...obj };
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v) && v.length === 1) {
      out[k] = v[0];
    } else if (Array.isArray(v) && v.length > 1) {
      out[k] = v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function loadStore() {
  try {
    const mod: AnyRec = await import("@/server/properties/store");
    return {
      getById: (mod.getById ?? (() => null)) as (id: string | number) => any,
      getAll: (mod.getAll ?? mod.list ?? (() => [])) as () => any[],
    };
  } catch {
    return { getById: (_: any) => null, getAll: () => [] };
  }
}

function resolvePropertyByAnyId(all: AnyRec[], rawId: string) {
  const target = String(rawId);
  
  // البحث المباشر
  const byExact = all.find((p) => String(p?.id) === target);
  if (byExact) return byExact;
  
  // البحث بـ referenceNo
  const byRef = all.find((p) => String(p?.referenceNo) === target);
  if (byRef) return byRef;
  
  // البحث بـ ID كرقم
  const byNumeric = all.find((p) => String(p?.id) === String(Number(target)));
  if (byNumeric) return byNumeric;
  
  // البحث في المصفوفات
  const byArray = all.find((p) => {
    if (Array.isArray(p?.referenceNo) && p.referenceNo.includes(target)) {
      return true;
    }
    return false;
  });
  if (byArray) return byArray;
  
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = req.query.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  if (!id) {
    res.status(400).json({ ok: false, error: "missing_id" });
    return;
  }

  if (req.method === "GET") {
    // جلب العقار
    const { getById, getAll } = await loadStore();

    let item = getById(String(id));
    if (!item) {
      const all = getAll();
      item = resolvePropertyByAnyId(all, String(id));
    }

    if (!item) {
      res.status(404).json({
        ok: false,
        error: "not_found",
        message: "العقار المطلوب غير موجود أو تم حذفه",
      });
      return;
    }

    const cleaned = cleanSingleItemArrays(item);
    
    // إصلاح مسارات الصور (لا نعدل base64!)
    if (cleaned.images && Array.isArray(cleaned.images)) {
      cleaned.images = cleaned.images.map((img: string) => {
        // إذا كانت base64 أو URL كامل، لا تعدّلها
        if (img && (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/uploads/'))) {
          return img;
        }
        // إذا كان اسم ملف فقط، أضف المسار الكامل
        if (img) {
          return `/uploads/properties/${cleaned.id}/${img}`;
        }
        return img;
      });
    } else if (cleaned.images && typeof cleaned.images === 'string') {
      // إذا كانت base64 أو URL، لا تعدّلها
      if (cleaned.images && !cleaned.images.startsWith('data:') && !cleaned.images.startsWith('/uploads/') && !cleaned.images.startsWith('http')) {
        cleaned.images = `/uploads/properties/${cleaned.id}/${cleaned.images}`;
      }
    }
    
    // إصلاح صورة الغلاف (لا نعدل base64!)
    if (cleaned.coverImage) {
      if (!cleaned.coverImage.startsWith('data:') && !cleaned.coverImage.startsWith('/uploads/') && !cleaned.coverImage.startsWith('http')) {
        cleaned.coverImage = `/uploads/properties/${cleaned.id}/${cleaned.coverImage}`;
      }
    }
    
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json({ ok: true, item: cleaned });
    return;
  }

  if (req.method === "PUT") {
    // تحديث العقار
    try {
      const { upsert } = await import("@/server/properties/store");
      
      // قراءة البيانات من FormData أو JSON
      let body: any = {};
      
      if (req.headers['content-type']?.includes('multipart/form-data') || req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        // معالجة FormData
        try {
          const formidable = require('formidable');
          const form = formidable({ 
            multiples: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            keepExtensions: true
          });
          
          const [fields, files] = await form.parse(req);
          
          console.log('FormData fields:', fields);
          console.log('FormData files:', files);
          
          // تحويل الحقول إلى كائن
          for (const [key, value] of Object.entries(fields)) {
            if (Array.isArray(value) && value.length === 1) {
              body[key] = value[0];
            } else if (Array.isArray(value)) {
              body[key] = value;
            } else {
              body[key] = value;
            }
          }
          
          // معالجة الملفات المرفوعة
          const uploadedImages: string[] = [];
          if (files.images) {
            const images = Array.isArray(files.images) ? files.images : [files.images];
            
            const fs = require('fs');
            const path = require('path');
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties', id);
            
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            for (const file of images) {
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalFilename || 'image.jpg'}`;
              const filePath = path.join(uploadDir, fileName);
              
              fs.copyFileSync(file.filepath, filePath);
              uploadedImages.push(`/uploads/properties/${id}/${fileName}`);
            }
          }
          
          // معالجة الصور Base64 من الحقول
          if (body.images) {
            const existingImages = Array.isArray(body.images) ? body.images : [body.images];
            const fs = require('fs');
            const path = require('path');
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties', id);
            
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            for (const img of existingImages) {
              if (typeof img === 'string' && img.startsWith('data:image/')) {
                // حفظ Base64 كملف
                const matches = img.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
                if (matches) {
                  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                  const base64Data = matches[2];
                  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                  const filePath = path.join(uploadDir, fileName);
                  
                  const buffer = Buffer.from(base64Data, 'base64');
                  fs.writeFileSync(filePath, buffer);
                  uploadedImages.push(`/uploads/properties/${id}/${fileName}`);
                }
              } else if (typeof img === 'string' && (img.startsWith('/uploads/') || img.startsWith('http'))) {
                // الاحتفاظ بالصور الموجودة
                uploadedImages.push(img);
              }
            }
          }
          
          // تحديث مصفوفة الصور
          if (uploadedImages.length > 0) {
            body.images = uploadedImages;
          }
          
          // معالجة الحقول الخاصة
          if (body.amenities && typeof body.amenities === 'string') {
            try {
              body.amenities = JSON.parse(body.amenities);
            } catch (e) {
              body.amenities = [];
            }
          }
          
          if (body.customAmenities && typeof body.customAmenities === 'string') {
            try {
              body.customAmenities = JSON.parse(body.customAmenities);
            } catch (e) {
              body.customAmenities = [];
            }
          }
          
          if (body.units && typeof body.units === 'string') {
            try {
              body.units = JSON.parse(body.units);
            } catch (e) {
              body.units = [];
            }
          }
          
          // تحويل القيم المنطقية
          if (body.published === 'true') body.published = true;
          if (body.published === 'false') body.published = false;
          if (body.useUserContact === 'true') body.useUserContact = true;
          if (body.useUserContact === 'false') body.useUserContact = false;
          
        } catch (formError) {
          console.error('FormData parsing error:', formError);
          res.status(400).json({ ok: false, error: "form_parse_error", message: "خطأ في معالجة البيانات المرسلة: " + formError.message });
          return;
        }
      } else {
        // معالجة JSON
        try {
          body = req.body;
          if (typeof body === 'string') {
            body = JSON.parse(body);
          }
          
          // معالجة الصور Base64 في JSON
          if (body.images && Array.isArray(body.images)) {
            const fs = require('fs');
            const path = require('path');
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties', id);
            
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const processedImages: string[] = [];
            
            for (const img of body.images) {
              if (typeof img === 'string' && img.startsWith('data:image/')) {
                // حفظ Base64 كملف
                const matches = img.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
                if (matches) {
                  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                  const base64Data = matches[2];
                  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                  const filePath = path.join(uploadDir, fileName);
                  
                  const buffer = Buffer.from(base64Data, 'base64');
                  fs.writeFileSync(filePath, buffer);
                  processedImages.push(`/uploads/properties/${id}/${fileName}`);
                }
              } else if (typeof img === 'string' && (img.startsWith('/uploads/') || img.startsWith('http'))) {
                // الاحتفاظ بالصور الموجودة
                processedImages.push(img);
              }
            }
            
            if (processedImages.length > 0) {
              body.images = processedImages;
            }
          }
          
          // معالجة صورة الغلاف Base64
          if (body.coverImage && typeof body.coverImage === 'string' && body.coverImage.startsWith('data:image/')) {
            const fs = require('fs');
            const path = require('path');
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties', id);
            
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const matches = body.coverImage.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
            if (matches) {
              const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
              const base64Data = matches[2];
              const fileName = `cover-${Date.now()}.${ext}`;
              const filePath = path.join(uploadDir, fileName);
              
              const buffer = Buffer.from(base64Data, 'base64');
              fs.writeFileSync(filePath, buffer);
              body.coverImage = `/uploads/properties/${id}/${fileName}`;
            }
          }
          
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          res.status(400).json({ ok: false, error: "json_parse_error", message: "خطأ في تحليل البيانات المرسلة" });
          return;
        }
      }
      
      // إضافة ID للعقار
      body.id = id;
      body.updatedAt = new Date().toISOString();
      
      // حفظ العقار
      try {
        const updatedProperty = upsert(body);
        res.status(200).json({ ok: true, item: updatedProperty });
      } catch (upsertError) {
        console.error('Upsert error:', upsertError);
        res.status(500).json({ ok: false, error: "upsert_error", message: "خطأ في حفظ العقار: " + upsertError.message });
        return;
      }
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ ok: false, error: "internal_error", message: "حدث خطأ أثناء تحديث العقار" });
    }
    return;
  }

  if (req.method === "DELETE") {
    // حذف العقار
    try {
      const { remove } = await import("@/server/properties/store");
      
      if (typeof remove === 'function') {
        await remove(String(id));
        res.status(200).json({ ok: true, message: "تم حذف العقار بنجاح" });
      } else {
        res.status(500).json({ ok: false, error: "delete_not_supported" });
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ ok: false, error: "delete_error", message: "حدث خطأ أثناء حذف العقار" });
    }
    return;
  }

  // إذا لم يكن GET أو PUT أو DELETE
  res.setHeader("Allow", "GET, PUT, DELETE");
  res.status(405).json({ ok: false, error: "method_not_allowed" });
  return;
}
