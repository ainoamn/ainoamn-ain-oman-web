import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { phoneNumbers } = req.body;

  if (!id || !phoneNumbers || !Array.isArray(phoneNumbers)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // محاكاة إرسال الرسائل النصية
    const results = [];
    
    for (const phone of phoneNumbers) {
      // توليد كلمة مرور مؤقتة
      const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // محاكاة إرسال رسالة نصية
      const smsMessage = `مرحباً! تم دعوتك لمتابعة مهمة ${id} في نظام إدارة المهام. رابط المهمة: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/tasks/${id} كلمة المرور المؤقتة: ${tempPassword} (صالحة لمدة 24 ساعة)`;
      
      // هنا يمكنك إضافة خدمة إرسال الرسائل النصية الحقيقية
      // مثل Twilio, AWS SNS, أو أي خدمة أخرى
      console.log(`SMS to ${phone}: ${smsMessage}`);
      
      results.push({
        phone,
        tempPassword,
        status: 'sent',
        message: smsMessage
      });
    }

    // حفظ كلمات المرور المؤقتة في قاعدة البيانات
    // يمكنك إضافة هذا في ملف منفصل لإدارة المصادقة المؤقتة
    
    return res.status(200).json({
      success: true,
      message: 'تم إرسال الدعوات عبر الهاتف بنجاح',
      results,
      taskId: id
    });

  } catch (error) {
    console.error('Error sending phone invites:', error);
    return res.status(500).json({ 
      error: 'فشل في إرسال الدعوات عبر الهاتف',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
