import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024 // 5MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const documentType = Array.isArray(fields.documentType) ? fields.documentType[0] : fields.documentType;
    const documentNumber = Array.isArray(fields.documentNumber) ? fields.documentNumber[0] : fields.documentNumber;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!userId || !documentType || !documentNumber || !file) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    // في الإنتاج: حفظ معلومات الوثيقة في قاعدة البيانات
    const document = {
      userId,
      documentType,
      documentNumber,
      filePath: file.filepath,
      fileName: file.originalFilename || file.newFilename,
      status: "pending", // pending, approved, rejected
      uploadedAt: new Date().toISOString()
    };

    // await saveDocument(document);

    console.log("Document uploaded:", document);

    return res.status(200).json({
      success: true,
      message: "تم رفع الوثيقة بنجاح",
      documentId: `DOC-${Date.now()}`
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return res.status(500).json({ error: "فشل رفع الوثيقة" });
  }
}

