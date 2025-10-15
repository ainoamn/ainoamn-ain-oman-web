// src/lib/export.ts - تصدير البيانات إلى PDF, Excel, CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  // استخراج الرؤوس من أول صف
  const headers = Object.keys(data[0]);
  
  // بناء CSV
  let csv = headers.join(',') + '\n';
  
  data.forEach((row) => {
    const values = headers.map(header => {
      const value = row[header];
      // التعامل مع القيم التي تحتوي على فواصل أو اقتباسات
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csv += values.join(',') + '\n';
  });

  // إنشاء وتحميل الملف
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM للعربي
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], filename: string) {
  // تحويل إلى HTML table ثم Excel
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const headers = Object.keys(data[0]);
  
  let html = '<table><thead><tr>';
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      html += `<td>${row[header] ?? ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(elementId: string, filename: string) {
  // استخدام window.print أو مكتبة jspdf
  const element = document.getElementById(elementId);
  if (!element) {
    alert('العنصر غير موجود');
    return;
  }

  // فتح نافذة الطباعة
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f3f4f6; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

// دالة شاملة لتصدير البيانات بأي صيغة
export function exportData(data: any[], format: 'csv' | 'excel' | 'json', filename: string) {
  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename);
      break;
    case 'json':
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      break;
    default:
      console.error('Unsupported format');
  }
}

