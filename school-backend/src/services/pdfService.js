const PDFDocument = require('pdfkit');
const SchoolSetting = require('../models/SchoolSetting');

class PDFService {
  async generateBillPDF(bill, student, res) {
    const doc = new PDFDocument({ margin: 50 });
    const settings = await SchoolSetting.findOne() || { name: 'St. Michel School', address: 'School Address' };

    // Register headers for streaming to response
    doc.pipe(res);

    // School Header
    doc.fontSize(20).text(settings.name, { align: 'center' });
    doc.fontSize(10).text(settings.address, { align: 'center' });
    doc.text(`Contact: ${settings.contactNumber} | Email: ${settings.email}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, 120).lineTo(550, 120).stroke();

    // Bill Info
    doc.moveDown();
    doc.fontSize(14).text('DEMAND BILL', { align: 'center', underline: true });
    doc.moveDown();

    const top = 160;
    doc.fontSize(10);
    doc.text(`Bill Number: ${bill.billNumber}`, 50, top);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 50, top + 15);
    doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, 50, top + 30);

    doc.text(`Student: ${student.firstName} ${student.lastName}`, 350, top);
    doc.text(`Admission No: ${student.admissionNumber}`, 350, top + 15);
    doc.text(`Class/Section: ${student.class.name} / ${student.section.name}`, 350, top + 30);

    // Table Header
    doc.moveDown(4);
    const tableTop = 230;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Quantity', 300, tableTop, { width: 50, align: 'right' });
    doc.text('Unit Price', 400, tableTop, { width: 70, align: 'right' });
    doc.text('Total', 500, tableTop, { width: 50, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.font('Helvetica');

    // Table Items
    let currentY = tableTop + 25;
    bill.items.forEach(item => {
      doc.text(item.description, 50, currentY);
      doc.text(item.quantity.toString(), 300, currentY, { width: 50, align: 'right' });
      doc.text(`₹${(item.amount / 100).toFixed(2)}`, 400, currentY, { width: 70, align: 'right' });
      doc.text(`₹${((item.amount * item.quantity) / 100).toFixed(2)}`, 500, currentY, { width: 50, align: 'right' });
      currentY += 20;
    });

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();

    // Summary
    currentY += 15;
    doc.text('Subtotal:', 400, currentY, { width: 70, align: 'right' });
    doc.text(`₹${(bill.totalAmount / 100).toFixed(2)}`, 500, currentY, { width: 50, align: 'right' });

    currentY += 15;
    doc.text('Discount:', 400, currentY, { width: 70, align: 'right' });
    doc.text(`- ₹${(bill.discount / 100).toFixed(2)}`, 500, currentY, { width: 50, align: 'right' });

    currentY += 15;
    doc.text('Late Fee:', 400, currentY, { width: 70, align: 'right' });
    doc.text(`+ ₹${(bill.lateFee / 100).toFixed(2)}`, 500, currentY, { width: 50, align: 'right' });

    currentY += 20;
    doc.font('Helvetica-Bold');
    doc.text('Total Payable:', 400, currentY, { width: 70, align: 'right' });
    doc.text(`₹${(bill.payableAmount / 100).toFixed(2)}`, 500, currentY, { width: 50, align: 'right' });

    currentY += 15;
    doc.text('Paid Amount:', 400, currentY, { width: 70, align: 'right' });
    doc.text(`₹${(bill.paidAmount / 100).toFixed(2)}`, 500, currentY, { width: 50, align: 'right' });

    currentY += 15;
    doc.fillColor('red').text('Balance Due:', 400, currentY, { width: 70, align: 'right' });
    doc.text(`₹${(bill.dueAmount / 100).toFixed(2)}`, 500, currentY, { width: 50, align: 'right' });

    // Footer
    doc.fillColor('black').fontSize(8).text('This is a computer-generated document.', 50, 700, { align: 'center' });

    doc.end();
  }

  async generateReceiptPDF(payment, bill, student, res) {
    const doc = new PDFDocument({ margin: 50 });
    const settings = await SchoolSetting.findOne() || { name: 'St. Michel School', address: 'School Address' };

    doc.pipe(res);

    // School Header
    doc.fontSize(20).text(settings.name, { align: 'center' });
    doc.fontSize(10).text(settings.address, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    doc.moveDown();
    doc.fontSize(14).text('PAYMENT RECEIPT', { align: 'center', underline: true });
    doc.moveDown();

    const top = 150;
    doc.fontSize(10);
    doc.text(`Receipt No: ${payment.paymentNumber}`, 50, top);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 50, top + 15);
    doc.text(`Mode: ${payment.paymentMode}`, 50, top + 30);
    if(payment.transactionId) doc.text(`Transaction ID: ${payment.transactionId}`, 50, top + 45);

    doc.text(`Student: ${student.firstName} ${student.lastName}`, 350, top);
    doc.text(`Admission No: ${student.admissionNumber}`, 350, top + 15);
    doc.text(`Bill Ref: ${bill.billNumber}`, 350, top + 30);

    doc.moveDown(4);
    doc.rect(50, 230, 500, 100).stroke();
    doc.fontSize(12).text(`Received with thanks a sum of ₹${(payment.amount / 100).toFixed(2)}`, 70, 250);
    doc.fontSize(10).text(`Towards: ${bill.billType} Fees / Charges`, 70, 275);
    doc.text(`Current Outstanding Balance: ₹${(bill.dueAmount / 100).toFixed(2)}`, 70, 300);

    doc.fontSize(10).text('Authorized Signatory', 400, 380, { align: 'center' });
    doc.moveTo(380, 375).lineTo(520, 375).stroke();

    doc.fontSize(8).text('Thank you for your payment.', 50, 700, { align: 'center' });

    doc.end();
  }
}

module.exports = new PDFService();
