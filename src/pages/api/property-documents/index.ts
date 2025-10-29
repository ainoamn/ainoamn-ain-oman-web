// src/pages/api/property-documents/index.ts - API لإدارة مستندات العقارات
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface PropertyDocument {
  id: string;
  propertyId: string;
  unitId?: string | null;
  ownerId: string;
  tenantId?: string | null;
  documentType: string;
  documentName: string;
  title: string;
  filePath: string;
  fileSize: number;
  issueDate: string;
  expiryDate?: string | null;
  status: 'valid' | 'expired' | 'pending';
  isConfidential: boolean;
  accessLevel: 'owner' | 'tenant' | 'management' | 'owner_tenant' | 'owner_management' | 'owner_tenant_management';
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const dataFilePath = path.join(process.cwd(), '.data', 'property-documents.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // قراءة البيانات من الملف
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    let documents: PropertyDocument[] = data.documents || [];

    if (req.method === 'GET') {
      const { propertyId, unitId, ownerId, tenantId, documentType, status, expiring } = req.query;

      // فلترة المستندات حسب المعايير
      let filteredDocuments = documents;

      if (propertyId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.propertyId === propertyId);
      }

      if (unitId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.unitId === unitId);
      }

      if (ownerId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.ownerId === ownerId);
      }

      if (tenantId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.tenantId === tenantId);
      }

      if (documentType) {
        filteredDocuments = filteredDocuments.filter(doc => doc.documentType === documentType);
      }

      if (status) {
        filteredDocuments = filteredDocuments.filter(doc => doc.status === status);
      }

      if (expiring === 'true') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        filteredDocuments = filteredDocuments.filter(doc => {
          if (!doc.expiryDate) return false;
          const expiryDate = new Date(doc.expiryDate);
          return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
        });
      }

      return res.status(200).json({
        success: true,
        documents: filteredDocuments,
        total: filteredDocuments.length
      });
    }

    if (req.method === 'POST') {
      const newDocument: PropertyDocument = {
        id: `DOC-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      documents.push(newDocument);

      // حفظ البيانات
      fs.writeFileSync(dataFilePath, JSON.stringify({ documents }, null, 2));

      return res.status(201).json({
        success: true,
        document: newDocument,
        message: 'تم إضافة المستند بنجاح'
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in property-documents API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
