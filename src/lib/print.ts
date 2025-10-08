// src/lib/print.ts - نظام الطباعة والتحميل الذكي
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PrintOptions {
  format?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  filename?: string;
  watermark?: boolean;
  header?: string;
  footer?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filename?: string;
  includeImages?: boolean;
  includeQR?: boolean;
}

export class PrintManager {
  private defaultOptions: PrintOptions = {
    format: 'A4',
    orientation: 'portrait',
    margin: 20,
    watermark: true
  };

  // طباعة صفحة كـ PDF
  async printToPDF(
    elementId: string, 
    options: PrintOptions = {}
  ): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // إنشاء canvas من العنصر
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // إنشاء PDF
      const pdf = new jsPDF({
        orientation: opts.orientation,
        unit: 'mm',
        format: opts.format
      });

      const imgWidth = pdf.internal.pageSize.getWidth() - (opts.margin! * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = imgHeight;
      let position = opts.margin!;

      // إضافة الصورة للـ PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', opts.margin!, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // إضافة صفحات إضافية إذا لزم الأمر
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + opts.margin!;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', opts.margin!, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // إضافة العلامة المائية
      if (opts.watermark) {
        this.addWatermarkToPDF(pdf);
      }

      // إضافة الهيدر والفوتر
      if (opts.header) {
        this.addHeaderToPDF(pdf, opts.header);
      }
      if (opts.footer) {
        this.addFooterToPDF(pdf, opts.footer);
      }

      // حفظ أو طباعة الـ PDF
      const filename = opts.filename || `document-${Date.now()}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error printing to PDF:', error);
      throw error;
    }
  }

  // طباعة مباشرة
  async printDirect(elementId: string): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // إنشاء نافذة طباعة جديدة
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      // إضافة محتوى الصفحة
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>طباعة</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              direction: rtl;
              text-align: right;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .print-footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px solid #333;
              padding-top: 10px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>عين عُمان - إدارة العقارات</h1>
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' })}</p>
          </div>
          ${element.innerHTML}
          <div class="print-footer">
            <p>تم إنشاء هذا التقرير بواسطة نظام عين عُمان</p>
            <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      
      // انتظار تحميل المحتوى ثم الطباعة
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error printing directly:', error);
      throw error;
    }
  }

  // تصدير البيانات
  async exportData(
    data: any[], 
    options: ExportOptions
  ): Promise<void> {
    try {
      const filename = options.filename || `export-${Date.now()}`;
      
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(data, filename);
          break;
        case 'excel':
          await this.exportToExcel(data, filename);
          break;
        case 'csv':
          await this.exportToCSV(data, filename);
          break;
        case 'json':
          await this.exportToJSON(data, filename);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // تصدير إلى PDF
  private async exportToPDF(data: any[], filename: string): Promise<void> {
    const pdf = new jsPDF();
    let yPosition = 20;
    
    // إضافة عنوان
    pdf.setFontSize(16);
    pdf.text('تقرير البيانات', 20, yPosition);
    yPosition += 20;
    
    // إضافة البيانات
    pdf.setFontSize(12);
    data.forEach((item, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`${index + 1}. ${JSON.stringify(item)}`, 20, yPosition);
      yPosition += 10;
    });
    
    pdf.save(`${filename}.pdf`);
  }

  // تصدير إلى Excel
  private async exportToExcel(data: any[], filename: string): Promise<void> {
    // محاكاة تصدير Excel بسيط
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // تصدير إلى CSV
  private async exportToCSV(data: any[], filename: string): Promise<void> {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // تصدير إلى JSON
  private async exportToJSON(data: any[], filename: string): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // تحويل البيانات إلى CSV
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // إضافة علامة مائية للـ PDF
  private addWatermarkToPDF(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // حفظ الإعدادات الحالية
      pdf.saveGraphicsState();
      
      // إعداد العلامة المائية
      pdf.setGState(new pdf.GState({ opacity: 0.1 }));
      pdf.setFontSize(50);
      pdf.setTextColor(200, 200, 200);
      
      // رسم العلامة المائية
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.text('عين عُمان', pageWidth / 2, pageHeight / 2, {
        angle: 45,
        align: 'center'
      });
      
      // استعادة الإعدادات
      pdf.restoreGraphicsState();
    }
  }

  // إضافة هيدر للـ PDF
  private addHeaderToPDF(pdf: jsPDF, header: string): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(header, 20, 15);
    }
  }

  // إضافة فوتر للـ PDF
  private addFooterToPDF(pdf: jsPDF, footer: string): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(footer, 20, pageHeight - 10);
      pdf.text(`صفحة ${i} من ${pageCount}`, 150, pageHeight - 10);
    }
  }
}

// دوال مساعدة
export async function printElement(elementId: string, options?: PrintOptions): Promise<void> {
  const printManager = new PrintManager();
  return await printManager.printToPDF(elementId, options);
}

export async function printDirectly(elementId: string): Promise<void> {
  const printManager = new PrintManager();
  return await printManager.printDirect(elementId);
}

export async function exportData(data: any[], options: ExportOptions): Promise<void> {
  const printManager = new PrintManager();
  return await printManager.exportData(data, options);
}
