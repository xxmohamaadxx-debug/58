import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateAR } from './dateUtils';
import { CURRENCIES } from './constants';

// تحويل الصورة إلى base64
const getImageAsBase64 = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

// إنشاء PDF للفاتورة (وارد أو صادر)
export const generateInvoicePDF = async (invoice, type, tenantName, logoPath = '/logo.png') => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // تحميل الشعار
  let logoBase64 = null;
  try {
    logoBase64 = await getImageAsBase64(logoPath);
  } catch (error) {
    console.error('Logo not found, continuing without logo');
  }

  // إضافة الشعار كعلامة مائية في الخلفية
  if (logoBase64) {
    // شفافية للعلامة المائية
    doc.setGState(doc.GState({ opacity: 0.1 }));
    const logoWidth = 80;
    const logoHeight = 80;
    const centerX = (pageWidth - logoWidth) / 2;
    const centerY = (pageHeight - logoHeight) / 2;
    doc.addImage(logoBase64, 'PNG', centerX, centerY, logoWidth, logoHeight);
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  // العنوان
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(
    type === 'in' ? 'فاتورة وارد' : 'فاتورة صادر',
    pageWidth / 2,
    20,
    { align: 'center' }
  );

  // معلومات المتجر
  if (tenantName) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(tenantName, pageWidth / 2, 30, { align: 'center' });
  }

  // الشعار في الأعلى (إذا كان موجوداً)
  if (logoBase64) {
    try {
      doc.setGState(doc.GState({ opacity: 1 }));
      doc.addImage(logoBase64, 'PNG', pageWidth - 35, 10, 25, 25);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // التاريخ
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateText = invoice.date 
    ? formatDateAR(invoice.date, { year: 'numeric', month: 'long', day: 'numeric' })
    : formatDateAR(new Date(), { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`التاريخ: ${dateText}`, 20, 45);

  // رقم الفاتورة
  if (invoice.id) {
    doc.text(`رقم الفاتورة: ${invoice.id.substring(0, 8)}`, pageWidth - 20, 45, { align: 'right' });
  }

  // تفاصيل الفاتورة
  const startY = 60;
  let currentY = startY;

  // البيان
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('البيان:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const descriptionLines = doc.splitTextToSize(invoice.description || '-', pageWidth - 60);
  doc.text(descriptionLines, 20, currentY + 7);
  currentY += descriptionLines.length * 6 + 10;

  // العملة والمبلغ
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const currencyInfo = CURRENCIES[invoice.currency] || { symbol: invoice.currency, code: invoice.currency };
  const amountText = `${currencyInfo.symbol} ${parseFloat(invoice.amount || 0).toLocaleString('ar-EG')}`;
  doc.text(`المبلغ: ${amountText}`, 20, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 10;

  // التصنيف
  if (invoice.category) {
    doc.text(`التصنيف: ${invoice.category}`, 20, currentY);
    currentY += 8;
  }

  // الشريك (عميل/مورد)
  if (invoice.partner_name) {
    doc.text(
      `ال${type === 'in' ? 'مورد' : 'عميل'}: ${invoice.partner_name}`,
      20,
      currentY
    );
    currentY += 8;
  }

  // الحالة
  if (invoice.status) {
    doc.text(`الحالة: ${invoice.status}`, 20, currentY);
    currentY += 8;
  }

  // الخط السفلي
  currentY += 10;
  doc.setLineWidth(0.5);
  doc.line(20, currentY, pageWidth - 20, currentY);

  // التوقيع
  currentY += 20;
  doc.setFontSize(10);
  doc.text('التوقيع: _______________', 20, currentY);
  doc.text('الختم: _______________', pageWidth - 20, currentY, { align: 'right' });

  // التذييل
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'تم إنشاء هذه الفاتورة تلقائياً من نظام إبراهيم للمحاسبة',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};

// إنشاء PDF للتقرير
export const generateReportPDF = async (title, data, columns, tenantName, logoPath = '/logo.png') => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape للتقارير
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // تحميل الشعار
  let logoBase64 = null;
  try {
    logoBase64 = await getImageAsBase64(logoPath);
  } catch (error) {
    console.error('Logo not found');
  }

  // علامة مائية
  if (logoBase64) {
    doc.setGState(doc.GState({ opacity: 0.08 }));
    const logoWidth = 100;
    const logoHeight = 100;
    const centerX = (pageWidth - logoWidth) / 2;
    const centerY = (pageHeight - logoHeight) / 2;
    doc.addImage(logoBase64, 'PNG', centerX, centerY, logoWidth, logoHeight);
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  // العنوان
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 15, { align: 'center' });

  // اسم المتجر
  if (tenantName) {
    doc.setFontSize(12);
    doc.text(tenantName, pageWidth / 2, 22, { align: 'center' });
  }

  // الشعار
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', pageWidth - 30, 8, 20, 20);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // التاريخ
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `تاريخ التقرير: ${formatDateAR(new Date(), { year: 'numeric', month: 'long', day: 'numeric' })}`,
    15,
    28
  );

  // الجدول
  autoTable(doc, {
    startY: 35,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => {
      const value = col.accessor(row);
      if (typeof value === 'number') {
        return value.toLocaleString('ar-EG');
      }
      return value || '-';
    })),
    theme: 'striped',
    headStyles: { fillColor: [255, 140, 0], textColor: 255, fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 9 },
    margin: { left: 15, right: 15 },
    didDrawPage: function (data) {
      // إضافة علامة مائية في كل صفحة
      if (logoBase64 && data.pageNumber > 1) {
        doc.setGState(doc.GState({ opacity: 0.08 }));
        const logoWidth = 100;
        const logoHeight = 100;
        const centerX = (pageWidth - logoWidth) / 2;
        const centerY = (pageHeight - logoHeight) / 2;
        doc.addImage(logoBase64, 'PNG', centerX, centerY, logoWidth, logoHeight);
        doc.setGState(doc.GState({ opacity: 1 }));
      }
    }
  });

  // التذييل
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'تم إنشاء هذا التقرير تلقائياً من نظام إبراهيم للمحاسبة',
    pageWidth / 2,
    finalY,
    { align: 'center' }
  );

  return doc;
};

// طباعة مباشرة
export const printInvoice = async (invoice, type, tenantName, logoPath) => {
  const doc = await generateInvoicePDF(invoice, type, tenantName, logoPath);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

// تصدير PDF
export const exportInvoicePDF = async (invoice, type, tenantName, logoPath) => {
  const doc = await generateInvoicePDF(invoice, type, tenantName, logoPath);
  const fileName = `${type === 'in' ? 'invoice_in' : 'invoice_out'}_${invoice.id?.substring(0, 8) || Date.now()}.pdf`;
  doc.save(fileName);
};

// تصدير تقرير PDF
export const exportReportPDF = async (title, data, columns, tenantName, logoPath) => {
  const doc = await generateReportPDF(title, data, columns, tenantName, logoPath);
  const fileName = `report_${Date.now()}.pdf`;
  doc.save(fileName);
};

