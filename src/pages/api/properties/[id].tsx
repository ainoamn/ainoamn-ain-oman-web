import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File as FormFile } from "formidable";
import path from "path";
import fs from "fs";

// ✅ تعطيل bodyParser لاستخدام formidable
export const config = {
  api: {
    bodyParser: false, // يجب تعطيله لاستخدام formidable
  },
};

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
      
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // معالجة FormData باستخدام formidable
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties', String(id));
          
          // إنشاء المجلد إذا لم يكن موجوداً
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          // ✅ استخدام formidable - نفس طريقة index.ts
          const form = formidable({
            multiples: true,
            maxFileSize: 50 * 1024 * 1024, // 50MB
            keepExtensions: true,
            uploadDir: uploadDir,
          });
          
          const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
              if (err) reject(err);
              else resolve([fields, files]);
            });
          });
          
          console.log('✅ FormData parsed successfully');
          console.log('📝 Fields keys:', Object.keys(fields));
          console.log('📁 Files keys:', Object.keys(files));
          
          // تحويل الحقول إلى كائن (formidable يعيد arrays دائماً)
          for (const [key, value] of Object.entries(fields)) {
            if (Array.isArray(value)) {
              // إذا array بعنصر واحد، استخرجه
              body[key] = value.length === 1 ? value[0] : value;
            } else {
              body[key] = value;
            }
          }
          
          // ✅ معالجة الصور: الموجودة + الجديدة
          const finalImages: string[] = [];
          
          // أولاً: إضافة الصور الموجودة (URLs)
          if (body.existingImages) {
            try {
              const existing = typeof body.existingImages === 'string' 
                ? JSON.parse(body.existingImages) 
                : body.existingImages;
              if (Array.isArray(existing)) {
                finalImages.push(...existing);
                console.log('📸 Restored existing images:', existing.length);
              }
            } catch (e) {
              console.error('Error parsing existingImages:', e);
            }
          }
          
          // ثانياً: معالجة الملفات الجديدة (formidable بالفعل حفظها في uploadDir)
          if (files.images) {
            const images = Array.isArray(files.images) ? files.images : [files.images];
            const newImageUrls = images.map((file: any) => {
              // formidable بالفعل حفظ الملف في uploadDir
              const fileName = path.basename(file.filepath);
              return `/uploads/properties/${id}/${fileName}`;
            });
            finalImages.push(...newImageUrls);
            console.log('🆕 Added new images:', newImageUrls.length);
          }
          
          body.images = finalImages;
          console.log('📊 Total images in body:', body.images.length);
          
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
          
          // ✅ تحويل القيم المنطقية والأرقام
          if (body.published === 'true') body.published = true;
          if (body.published === 'false') body.published = false;
          if (body.useUserContact === 'true') body.useUserContact = true;
          if (body.useUserContact === 'false') body.useUserContact = false;
          
          // تحويل الأرقام
          const numericFields = ['priceOMR', 'rentalPrice', 'area', 'beds', 'baths', 'floors', 'coverIndex', 'totalUnits', 'totalArea'];
          for (const field of numericFields) {
            if (body[field] !== undefined && body[field] !== '') {
              const num = Number(body[field]);
              if (!isNaN(num)) body[field] = num;
            }
          }
          
        } catch (formError) {
          console.error('FormData parsing error:', formError);
          res.status(400).json({ ok: false, error: "form_parse_error", message: "خطأ في معالجة البيانات المرسلة: " + formError.message });
          return;
        }
      } else {
        // معالجة JSON - قراءة body يدوياً لأن bodyParser معطل
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          body = rawBody ? JSON.parse(rawBody) : {};
          console.log('📝 Parsed JSON body, keys:', Object.keys(body));
        } catch (jsonError: any) {
          console.error('JSON parsing error:', jsonError);
          res.status(400).json({ ok: false, error: "json_parse_error", message: "خطأ في تحليل البيانات المرسلة: " + jsonError.message });
          return;
        }
      }
      
      // إضافة ID للعقار
      body.id = id;
      body.updatedAt = new Date().toISOString();
      
      // ✅ تشخيص: طباعة الصور قبل الحفظ
      console.log('🖼️ Images before upsert:', body.images);
      console.log('📝 Full body keys:', Object.keys(body));
      
      // حفظ العقار
      try {
        const updatedProperty = upsert(body);
        console.log('✅ Property updated, images:', updatedProperty.images);
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
