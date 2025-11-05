// src/lib/messaging.ts - نظام إرسال الرسائل التلقائي (الواتساب + البريد)

interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  phoneNumberId: string;
}

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

// ========== إرسال الواتساب التلقائي ==========
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // تنظيف رقم الهاتف
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // TODO: ربط WhatsApp Business API
    // const config: WhatsAppConfig = {
    //   apiUrl: process.env.WHATSAPP_API_URL || '',
    //   apiKey: process.env.WHATSAPP_API_KEY || '',
    //   phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    // };
    
    // const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${config.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: cleanPhone,
    //     type: 'text',
    //     text: { body: message }
    //   })
    // });
    
    // if (response.ok) {
    //   const data = await response.json();
    //   return { success: true, messageId: data.messages[0].id };
    // }
    
    // للتطوير: محاكاة إرسال ناجح
    console.log('📱 [WhatsApp API] Sending to:', cleanPhone);
    console.log('💬 Message:', message);
    console.log('✅ [SIMULATED] Message sent successfully');
    
    return { 
      success: true, 
      messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ========== إرسال البريد التلقائي ==========
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // TODO: ربط SendGrid أو Mailgun
    // const config: EmailConfig = {
    //   apiKey: process.env.SENDGRID_API_KEY || process.env.MAILGUN_API_KEY || '',
    //   fromEmail: process.env.EMAIL_FROM || 'noreply@ainoman.om',
    //   fromName: process.env.EMAIL_FROM_NAME || 'عين عُمان'
    // };
    
    // SendGrid Example:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${config.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: config.fromEmail, name: config.fromName },
    //     subject,
    //     content: [
    //       { type: 'text/html', value: htmlContent },
    //       { type: 'text/plain', value: textContent || htmlContent.replace(/<[^>]*>/g, '') }
    //     ]
    //   })
    // });
    
    // if (response.ok) {
    //   return { success: true, messageId: response.headers.get('x-message-id') || undefined };
    // }
    
    // للتطوير: محاكاة إرسال ناجح
    console.log('📧 [Email API] Sending to:', to);
    console.log('📝 Subject:', subject);
    console.log('📄 Content:', htmlContent.substring(0, 100) + '...');
    console.log('✅ [SIMULATED] Email sent successfully');
    
    return { 
      success: true, 
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ========== إرسال بيانات الدخول للمستأجر ==========
export async function sendTenantCredentials(
  tenantName: string,
  tenantEmail: string,
  tenantPhone: string,
  username: string,
  password: string
): Promise<{
  whatsapp: { success: boolean; messageId?: string; error?: string };
  email: { success: boolean; messageId?: string; error?: string };
}> {
  // رسالة الواتساب
  const whatsappMessage = `
🎉 *مرحباً ${tenantName}*

تم اعتماد حسابك في منصة *عين عُمان*! ✅

*بيانات الدخول:*
• اسم المستخدم: \`${username}\`
• الرقم السري: \`${password}\`

🔗 *رابط الدخول:*
https://ainoman.om/login

⚠️ *ملاحظة هامة:*
يرجى تغيير كلمة المرور بعد أول تسجيل دخول

_مع تحيات فريق عين عُمان_ 🏢
  `.trim();

  // محتوى البريد الإلكتروني (HTML)
  const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 30px; }
    .credentials { background: #f3f4f6; border-right: 4px solid #7c3aed; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 مرحباً ${tenantName}</h1>
      <p>تم اعتماد حسابك في منصة عين عُمان!</p>
    </div>
    
    <div class="content">
      <h2>بيانات الدخول:</h2>
      <div class="credentials">
        <p><strong>اسم المستخدم:</strong> <code>${username}</code></p>
        <p><strong>الرقم السري:</strong> <code>${password}</code></p>
      </div>
      
      <p>يمكنك الآن تسجيل الدخول إلى حسابك:</p>
      <a href="https://ainoman.om/login" class="button">تسجيل الدخول الآن</a>
      
      <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 8px;">
        <p style="margin: 0; color: #92400e;"><strong>⚠️ ملاحظة هامة:</strong></p>
        <p style="margin: 5px 0 0 0; color: #92400e;">يرجى تغيير كلمة المرور بعد أول تسجيل دخول لحماية حسابك.</p>
      </div>
    </div>
    
    <div class="footer">
      <p>مع تحيات فريق عين عُمان 🏢</p>
      <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // محتوى البريد النصي (Plain text)
  const emailText = `
مرحباً ${tenantName},

تم اعتماد حسابك في منصة عين عُمان!

بيانات الدخول:
اسم المستخدم: ${username}
الرقم السري: ${password}

رابط الدخول: https://ainoman.om/login

⚠️ ملاحظة هامة:
يرجى تغيير كلمة المرور بعد أول تسجيل دخول.

مع تحيات،
فريق عين عُمان
  `.trim();

  // إرسال الواتساب والبريد بالتوازي
  const [whatsappResult, emailResult] = await Promise.all([
    sendWhatsAppMessage(tenantPhone, whatsappMessage),
    sendEmail(tenantEmail, 'بيانات الدخول - منصة عين عُمان', emailHtml, emailText)
  ]);

  return {
    whatsapp: whatsappResult,
    email: emailResult
  };
}

// ========== تجهيز بيئة الإنتاج ==========
export function getMessagingStatus() {
  return {
    whatsapp: {
      configured: !!process.env.WHATSAPP_API_KEY,
      mode: process.env.WHATSAPP_API_KEY ? 'production' : 'development'
    },
    email: {
      configured: !!(process.env.SENDGRID_API_KEY || process.env.MAILGUN_API_KEY),
      mode: (process.env.SENDGRID_API_KEY || process.env.MAILGUN_API_KEY) ? 'production' : 'development'
    }
  };
}

