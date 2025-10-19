import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'legal-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 10,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing files' });
      }

      const fileList = Array.isArray(files.documents) ? files.documents : [files.documents];
      const uploadedFiles = fileList.map(file => ({
        originalName: file.originalFilename,
        fileName: file.newFilename,
        filePath: file.filepath,
        size: file.size,
        mimeType: file.mimetype,
      }));

      res.status(200).json({ success: true, files: uploadedFiles });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
