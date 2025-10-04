// src/lib/qrcode.ts - نظام الباركود والكود QR الذكي
import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface BarcodeData {
  id: string;
  type: 'property' | 'contract' | 'invoice' | 'maintenance' | 'check';
  title: string;
  description?: string;
  url?: string;
  data: any;
  createdAt: string;
}

export class QRCodeGenerator {
  private defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  // إنشاء QR Code للعقار
  async generatePropertyQR(propertyId: string, propertyData: any): Promise<string> {
    const data: BarcodeData = {
      id: propertyId,
      type: 'property',
      title: propertyData.title || 'عقار',
      description: propertyData.description,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/property/${propertyId}`,
      data: {
        propertyId,
        title: propertyData.title,
        price: propertyData.price,
        location: propertyData.location,
        type: propertyData.type
      },
      createdAt: new Date().toISOString()
    };

    return await this.generateQRCode(JSON.stringify(data));
  }

  // إنشاء QR Code للعقد
  async generateContractQR(contractId: string, contractData: any): Promise<string> {
    const data: BarcodeData = {
      id: contractId,
      type: 'contract',
      title: `عقد إيجار - ${contractData.tenantName || 'مستأجر'}`,
      description: `عقد إيجار للوحدة ${contractData.unitNumber}`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contracts/${contractId}`,
      data: {
        contractId,
        tenantName: contractData.tenantName,
        unitNumber: contractData.unitNumber,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        monthlyRent: contractData.monthlyRent
      },
      createdAt: new Date().toISOString()
    };

    return await this.generateQRCode(JSON.stringify(data));
  }

  // إنشاء QR Code للفاتورة
  async generateInvoiceQR(invoiceId: string, invoiceData: any): Promise<string> {
    const data: BarcodeData = {
      id: invoiceId,
      type: 'invoice',
      title: `فاتورة ${invoiceData.invoiceNumber}`,
      description: `فاتورة ${invoiceData.type} - ${invoiceData.tenantName}`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invoices/${invoiceId}`,
      data: {
        invoiceId,
        invoiceNumber: invoiceData.invoiceNumber,
        amount: invoiceData.amount,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status
      },
      createdAt: new Date().toISOString()
    };

    return await this.generateQRCode(JSON.stringify(data));
  }

  // إنشاء QR Code لطلب الصيانة
  async generateMaintenanceQR(requestId: string, requestData: any): Promise<string> {
    const data: BarcodeData = {
      id: requestId,
      type: 'maintenance',
      title: `طلب صيانة ${requestData.requestNumber}`,
      description: requestData.title,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/maintenance/${requestId}`,
      data: {
        requestId,
        requestNumber: requestData.requestNumber,
        type: requestData.type,
        priority: requestData.priority,
        status: requestData.status
      },
      createdAt: new Date().toISOString()
    };

    return await this.generateQRCode(JSON.stringify(data));
  }

  // إنشاء QR Code للشيك
  async generateCheckQR(checkId: string, checkData: any): Promise<string> {
    const data: BarcodeData = {
      id: checkId,
      type: 'check',
      title: `شيك ${checkData.checkNumber}`,
      description: `شيك من ${checkData.bankName} - ${checkData.tenantName}`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checks/${checkId}`,
      data: {
        checkId,
        checkNumber: checkData.checkNumber,
        bankName: checkData.bankName,
        amount: checkData.amount,
        dueDate: checkData.dueDate,
        status: checkData.status
      },
      createdAt: new Date().toISOString()
    };

    return await this.generateQRCode(JSON.stringify(data));
  }

  // إنشاء QR Code عام
  async generateQRCode(data: string, options?: QRCodeOptions): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      return await QRCode.toDataURL(data, {
        width: opts.width,
        margin: opts.margin,
        color: opts.color,
        errorCorrectionLevel: opts.errorCorrectionLevel
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // إنشاء QR Code كـ SVG
  async generateQRCodeSVG(data: string, options?: QRCodeOptions): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      return await QRCode.toString(data, {
        type: 'svg',
        width: opts.width,
        margin: opts.margin,
        color: opts.color,
        errorCorrectionLevel: opts.errorCorrectionLevel
      });
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw error;
    }
  }

  // فحص صحة QR Code
  validateQRCode(qrData: string): { valid: boolean; data?: BarcodeData; error?: string } {
    try {
      const parsed = JSON.parse(qrData);
      
      // التحقق من البنية الأساسية
      if (!parsed.id || !parsed.type || !parsed.title) {
        return { valid: false, error: 'Invalid QR code structure' };
      }

      // التحقق من نوع البيانات
      const validTypes = ['property', 'contract', 'invoice', 'maintenance', 'check'];
      if (!validTypes.includes(parsed.type)) {
        return { valid: false, error: 'Invalid data type' };
      }

      return { valid: true, data: parsed };
    } catch (error) {
      return { valid: false, error: 'Invalid JSON format' };
    }
  }

  // إنشاء باركود نصي (للاستخدام في التقارير)
  generateTextBarcode(data: string, type: 'CODE128' | 'CODE39' = 'CODE128'): string {
    // محاكاة باركود نصي بسيط
    const barcode = data.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(0x2588).repeat(Math.floor(code / 10) + 1);
    }).join('│');
    
    return `╔${'═'.repeat(data.length + 2)}╗\n║ ${data} ║\n╚${'═'.repeat(data.length + 2)}╝\n${barcode}`;
  }
}

// دالة مساعدة لإنشاء QR Code للعقار
export async function createPropertyQR(propertyId: string, propertyData: any): Promise<string> {
  const generator = new QRCodeGenerator();
  return await generator.generatePropertyQR(propertyId, propertyData);
}

// دالة مساعدة لإنشاء QR Code للعقد
export async function createContractQR(contractId: string, contractData: any): Promise<string> {
  const generator = new QRCodeGenerator();
  return await generator.generateContractQR(contractId, contractData);
}

// دالة مساعدة لإنشاء QR Code للفاتورة
export async function createInvoiceQR(invoiceId: string, invoiceData: any): Promise<string> {
  const generator = new QRCodeGenerator();
  return await generator.generateInvoiceQR(invoiceId, invoiceData);
}

// دالة مساعدة لفحص QR Code
export function validateQR(qrData: string): { valid: boolean; data?: BarcodeData; error?: string } {
  const generator = new QRCodeGenerator();
  return generator.validateQRCode(qrData);
}
