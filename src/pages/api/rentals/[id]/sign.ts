// src/pages/api/rentals/[id]/sign.ts
// API endpoint للتوقيع الإلكتروني على العقود
import type { NextApiRequest, NextApiResponse } from "next";
import { repo } from "@/server/rentals/workflow";
import fs from "fs/promises";
import path from "path";

// أنواع التوقيعات
type SignatureType = 'tenant' | 'owner' | 'admin';

// حالات سير العمل
type WorkflowState = 
  | 'draft'                       // مسودة
  | 'sent_for_signatures'         // تم الإرسال للتوقيع
  | 'pending_tenant_signature'    // في انتظار توقيع المستأجر
  | 'pending_owner_signature'     // في انتظار توقيع المالك
  | 'pending_admin_approval'      // في انتظار موافقة الإدارة
  | 'active'                      // مفعّل (تم توقيعه من الجميع)
  | 'rejected';                   // مرفوض

interface Signature {
  type: SignatureType;
  name: string;
  email?: string;
  signedAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  
  if (!id) {
    return res.status(400).json({ error: 'Missing contract ID' });
  }

  // GET: جلب حالة التوقيعات الحالية
  if (req.method === "GET") {
    try {
      const rental = await repo.load(id);
      
      if (!rental) {
        return res.status(404).json({ error: 'Contract not found' });
      }
      
      return res.status(200).json({
        contractId: rental.id,
        workflowState: rental.signatureWorkflow || 'draft',
        signatures: rental.signatures || [],
        createdBy: rental.createdBy,
        tenantName: rental.tenantName,
        tenantEmail: rental.tenantEmail
      });
    } catch (error) {
      console.error('Error fetching signature status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST: إرسال العقد للتوقيع أو توقيع العقد
  if (req.method === "POST") {
    try {
      const { action, signatureType, signerName, signerEmail } = req.body;
      const rental = await repo.load(id);
      
      if (!rental) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      // الحصول على IP address
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Action 1: إرسال للتوقيع
      if (action === 'send_for_signatures') {
        rental.signatureWorkflow = 'sent_for_signatures';
        rental.signatures = rental.signatures || [];
        rental.sentForSignaturesAt = Date.now();
        rental.sentForSignaturesBy = req.body.sentBy || 'admin';
        
        // حفظ التحديثات
        await repo.save(rental);
        
        console.log(`✅ تم إرسال العقد ${id} للتوقيع`);
        
        // TODO: إرسال إشعارات للمستأجر والمالك عبر البريد الإلكتروني أو الواتساب
        
        return res.status(200).json({
          success: true,
          message: 'تم إرسال العقد للتوقيع بنجاح',
          workflowState: rental.signatureWorkflow,
          nextStep: 'pending_tenant_signature'
        });
      }

      // Action 2: توقيع العقد
      if (action === 'sign') {
        if (!signatureType || !signerName) {
          return res.status(400).json({ error: 'Missing signature details' });
        }

        const signatures: Signature[] = rental.signatures || [];
        const existingSignature = signatures.find(s => s.type === signatureType);
        
        if (existingSignature) {
          return res.status(400).json({ error: 'This party has already signed' });
        }

        // إضافة التوقيع الجديد
        const newSignature: Signature = {
          type: signatureType,
          name: signerName,
          email: signerEmail,
          signedAt: Date.now(),
          ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress?.[0] || 'unknown',
          userAgent: typeof userAgent === 'string' ? userAgent : 'unknown'
        };

        signatures.push(newSignature);
        rental.signatures = signatures;

        // تحديث حالة سير العمل بناءً على التوقيعات الموجودة
        const hasTenantSign = signatures.some(s => s.type === 'tenant');
        const hasOwnerSign = signatures.some(s => s.type === 'owner');
        const hasAdminSign = signatures.some(s => s.type === 'admin');

        if (signatureType === 'tenant' && !hasOwnerSign && !hasAdminSign) {
          rental.signatureWorkflow = 'pending_owner_signature';
        } else if (signatureType === 'owner' && hasTenantSign && !hasAdminSign) {
          rental.signatureWorkflow = 'pending_admin_approval';
        } else if (signatureType === 'admin' && hasTenantSign && hasOwnerSign) {
          rental.signatureWorkflow = 'active';
          rental.state = 'active';  // تحديث حالة العقد
          rental.activatedAt = Date.now();
          
          // تحديث حالة العقار في db.json إلى "leased"
          await updatePropertyStatus(rental.propertyId, 'leased');
        }

        // حفظ التحديثات
        await repo.save(rental);
        
        console.log(`✅ تم توقيع العقد ${id} من قبل ${signatureType}: ${signerName}`);
        console.log(`📊 الحالة الجديدة: ${rental.signatureWorkflow}`);
        
        return res.status(200).json({
          success: true,
          message: `تم التوقيع بنجاح من قبل ${getSignerLabel(signatureType)}`,
          workflowState: rental.signatureWorkflow,
          signatures: rental.signatures,
          nextStep: getNextStep(rental.signatureWorkflow)
        });
      }

      // Action 3: رفض العقد
      if (action === 'reject') {
        rental.signatureWorkflow = 'rejected';
        rental.rejectedAt = Date.now();
        rental.rejectedBy = req.body.rejectedBy || signatureType;
        rental.rejectionReason = req.body.reason || '';
        
        await repo.save(rental);
        
        console.log(`❌ تم رفض العقد ${id}`);
        
        return res.status(200).json({
          success: true,
          message: 'تم رفض العقد',
          workflowState: rental.signatureWorkflow
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error processing signature:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// دالة مساعدة لتحديث حالة العقار في db.json
async function updatePropertyStatus(propertyId: string, status: string) {
  try {
    const dbPath = path.resolve(process.cwd(), '.data', 'db.json');
    const dbContent = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    if (db.properties && Array.isArray(db.properties)) {
      const propertyIndex = db.properties.findIndex((p: any) => p.id === propertyId);
      if (propertyIndex !== -1) {
        db.properties[propertyIndex].status = status;
        db.properties[propertyIndex].updatedAt = new Date().toISOString();
        
        // إلغاء نشر العقار تلقائياً عند التأجير (leased)
        if (status === 'leased') {
          db.properties[propertyIndex].published = false;
          console.log(`🔒 تم إلغاء نشر العقار ${propertyId} تلقائياً بعد التأجير`);
        }
        
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
        console.log(`✅ تم تحديث حالة العقار ${propertyId} إلى "${status}"`);
      }
    }
  } catch (error) {
    console.error('⚠️ خطأ في تحديث حالة العقار:', error);
  }
}

// دالة مساعدة للحصول على تسمية الموقع
function getSignerLabel(type: SignatureType): string {
  switch (type) {
    case 'tenant': return 'المستأجر';
    case 'owner': return 'المالك';
    case 'admin': return 'إدارة العقار';
    default: return type;
  }
}

// دالة مساعدة للحصول على الخطوة التالية
function getNextStep(workflowState: WorkflowState): string {
  switch (workflowState) {
    case 'sent_for_signatures':
    case 'pending_tenant_signature':
      return 'يجب على المستأجر التوقيع';
    case 'pending_owner_signature':
      return 'يجب على المالك التوقيع';
    case 'pending_admin_approval':
      return 'يجب على إدارة العقار الموافقة والتوقيع';
    case 'active':
      return 'تم اكتمال جميع التوقيعات - العقد مفعّل';
    case 'rejected':
      return 'العقد مرفوض';
    default:
      return 'غير محدد';
  }
}

