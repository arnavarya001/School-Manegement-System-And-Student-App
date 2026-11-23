import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const generateBillHtml = (bill, student, settings = {}) => {
  const schoolName = settings.name || 'ST. MICHEL HIGHER SECONDARY SCHOOL';
  const schoolAddress = settings.address || '41 St. Michel Road, City Center - 110001';
  const schoolContact = settings.contactNumber || '+91 98765 43210';
  const schoolEmail = settings.email || 'accounts@stmichel.com';
  const upiId = settings.upiId || 'stmichel@upi';

  const sName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : 'Student';
  const admNo = (student && student.admissionNumber) || bill.student?.admissionNumber || 'N/A';
  const rollNo = (student && student.rollNumber) || bill.student?.rollNumber || '01';
  const className = (student && student.class && (student.class.name || student.class)) || 'General';
  const secName = (student && student.section && (student.section.name || student.section)) || 'A';
  const session = bill.academicSession || (student && student.academicSession) || '2026-2027';

  const billNumber = bill.billNumber || `BILL-${Date.now()}`;
  const billType = (bill.billType || 'Tuition & Fees').toUpperCase();
  const billDate = new Date(bill.createdAt || Date.now()).toLocaleDateString('en-GB');
  const dueDate = new Date(bill.dueDate || Date.now() + 15 * 86400000).toLocaleDateString('en-GB');

  const totalChargesRs = ((bill.totalAmount || 0) / 100).toFixed(2);
  const totalPaidRs = ((bill.paidAmount || 0) / 100).toFixed(2);
  const balanceDueRs = ((bill.dueAmount || 0) / 100).toFixed(2);
  const status = (bill.status || (Number(balanceDueRs) === 0 ? 'Paid' : 'Unpaid')).toUpperCase();

  const items = bill.items && bill.items.length > 0 ? bill.items : [
    { description: `${bill.billType || 'School'} Fee`, amount: bill.totalAmount || 0, quantity: 1 }
  ];

  const itemsRows = items.map((item, idx) => {
    const itemChargesRs = (((item.amount || 0) * (item.quantity || 1)) / 100).toFixed(2);
    const itemDesc = item.quantity > 1 ? `${item.description} (x${item.quantity})` : item.description;
    return `
      <tr>
        <td style="padding: 9px 12px; border: 1px solid #111; font-size: 11px; text-align: center;">${billDate}</td>
        <td style="padding: 9px 12px; border: 1px solid #111; font-size: 11px; font-weight: 600;">${itemDesc}</td>
        <td style="padding: 9px 12px; border: 1px solid #111; font-size: 11px; text-align: right; font-family: monospace;">₹${Number(itemChargesRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 9px 12px; border: 1px solid #111; font-size: 11px; text-align: right; font-family: monospace;">-</td>
        <td style="padding: 9px 12px; border: 1px solid #111; font-size: 11px; text-align: right; font-family: monospace;">₹${Number(itemChargesRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Notice - ${billNumber}</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .notice-box {
      border: 2px solid #000;
      border-collapse: collapse;
      width: 100%;
    }
    .notice-box th, .notice-box td {
      border: 1px solid #000;
      padding: 6px 10px;
      font-size: 10px;
    }
    .notice-box th {
      background: #f1f5f9;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .notice-box td {
      font-weight: 700;
      text-align: center;
      font-size: 11px;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 900;
      font-size: 11px;
      letter-spacing: 0.5px;
      color: #fff;
      background: ${status === 'PAID' ? '#16a34a' : status === 'PARTIALLY PAID' ? '#ca8a04' : '#dc2626'};
    }
    .barcode-line {
      font-family: monospace;
      letter-spacing: 4px;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      margin: 18px 0;
      padding: 6px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      border: 2px solid #000;
    }
    .data-table th {
      background: #f8fafc;
      border: 1px solid #000;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .message-box {
      border: 1px solid #000;
      padding: 12px 16px;
      margin-top: 24px;
      background: #fafafa;
    }
    .footer-signatures {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
  </style>
</head>
<body>

  <!-- Top Header Table -->
  <table class="header-table">
    <tr>
      <td style="width: 55%; vertical-align: top; padding-right: 15px;">
        <div style="font-size: 22px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px; line-height: 1.1;">
          ${schoolName}
        </div>
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">
          Office of the Bursar / Finance & Accounts Operations
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          ${schoolAddress}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Tel: ${schoolContact} | Email: ${schoolEmail}
        </div>
      </td>
      <td style="width: 45%; vertical-align: top;">
        <table class="notice-box">
          <tr>
            <th colspan="2" style="font-size: 12px; background: #1e3a8a; color: #fff; padding: 7px;">
              ${billType} PAYMENT INVOICE
            </th>
          </tr>
          <tr>
            <th>STUDENT ID</th>
            <th>STUDENT NAME</th>
          </tr>
          <tr>
            <td>${admNo}</td>
            <td>${sName}</td>
          </tr>
          <tr>
            <th>TERM / SESSION</th>
            <th>PAYMENT DUE DATE</th>
          </tr>
          <tr>
            <td>${session}</td>
            <td>${dueDate}</td>
          </tr>
          <tr>
            <th>TOTAL BILL</th>
            <th>BALANCE DUE</th>
          </tr>
          <tr>
            <td style="font-size: 13px; font-weight: 900;">₹${Number(totalChargesRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="font-size: 14px; font-weight: 900; color: #dc2626;">₹${Number(balanceDueRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
        <div style="text-align: right; margin-top: 6px;">
          <span class="status-badge">${status}</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- Barcode / Reference Strip -->
  <div class="barcode-line">
    *${billNumber}* | CLS: ${className}-${secName} | ROLL: ${rollNo}
  </div>

  <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
    To ensure proper credit to student account, keep this invoice copy for official school verification.
  </div>

  <!-- Itemized Transaction Table -->
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%; text-align: center;">DATE</th>
        <th style="width: 45%; text-align: left;">DESCRIPTION OF TRANSACTION</th>
        <th style="width: 15%; text-align: right;">CHARGES</th>
        <th style="width: 12%; text-align: right;">CREDITS</th>
        <th style="width: 13%; text-align: right;">BALANCE</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
      <tr style="background: #f8fafc; font-weight: 900;">
        <td colspan="2" style="padding: 10px 12px; border: 1px solid #000; text-align: right; font-size: 12px;">TOTAL CHARGES:</td>
        <td style="padding: 10px 12px; border: 1px solid #000; text-align: right; font-size: 13px; font-family: monospace;">₹${Number(totalChargesRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 12px; border: 1px solid #000; text-align: right; font-size: 13px; font-family: monospace;">-</td>
        <td style="padding: 10px 12px; border: 1px solid #000; text-align: right; font-size: 13px; font-family: monospace;">₹${Number(totalChargesRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      ${Number(totalPaidRs) > 0 ? `
      <tr style="background: #f0fdf4; font-weight: bold; color: #15803d;">
        <td colspan="3" style="padding: 9px 12px; border: 1px solid #000; text-align: right; font-size: 11px;">PAID / CREDITED AMOUNT:</td>
        <td style="padding: 9px 12px; border: 1px solid #000; text-align: right; font-size: 12px; font-family: monospace;">₹${Number(totalPaidRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 9px 12px; border: 1px solid #000; text-align: right; font-size: 12px; font-family: monospace;">-</td>
      </tr>
      ` : ''}
      <tr style="background: #fff; font-weight: 900;">
        <td colspan="4" style="padding: 12px; border: 2px solid #000; text-align: right; font-size: 13px; text-transform: uppercase;">
          BALANCE DUE BY ${dueDate}:
        </td>
        <td style="padding: 12px; border: 2px solid #000; text-align: right; font-size: 15px; color: ${Number(balanceDueRs) === 0 ? '#16a34a' : '#dc2626'}; font-family: monospace;">
          ₹${Number(balanceDueRs).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Important Message Box -->
  <div class="message-box">
    <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">
      IMPORTANT NOTICE & PAYMENT GUIDELINES:
    </div>
    <div style="font-size: 10px; color: #334155; line-height: 1.5;">
      • Payments can be remitted via Cash at the school accounts counter or via UPI Scan using ID: <strong>${upiId}</strong>.<br>
      • Invoices must be cleared on or before the due date (${dueDate}) to prevent late administrative charges.<br>
      • For discrepancies regarding fee concessions or issued inventory materials, contact the bursar's desk immediately.
    </div>
  </div>

  <!-- Signatures -->
  <table style="width: 100%; margin-top: 45px; border-collapse: collapse;">
    <tr>
      <td style="width: 50%; text-align: left; vertical-align: bottom;">
        <div style="font-size: 10px; font-weight: bold; color: #64748b;">Computer Generated Tax Invoice</div>
        <div style="font-size: 9px; color: #94a3b8;">Printed on ${new Date().toLocaleString()}</div>
      </td>
      <td style="width: 50%; text-align: right; vertical-align: bottom;">
        <div style="display: inline-block; text-align: center; border-top: 1.5px solid #000; padding-top: 6px; width: 190px;">
          <div style="font-size: 11px; font-weight: 900; color: #1e3a8a;">ST. MICHEL SCHOOL</div>
          <div style="font-size: 10px; font-weight: 700; color: #475569;">Authorized Signatory / Bursar</div>
        </div>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

// Print Bill directly using native printer
export const printBill = async (bill, student, settings) => {
  try {
    const html = generateBillHtml(bill, student, settings);
    await Print.printAsync({ html });
  } catch (err) {
    console.log('Error printing bill:', err.message);
    Alert.alert('Print Error', err.message || 'Could not print bill');
  }
};

// Download / Share Bill as real PDF
export const downloadBillPdf = async (bill, student, settings) => {
  try {
    const html = generateBillHtml(bill, student, settings);
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Download Bill #${bill.billNumber || 'INVOICE'}`
      });
    } else {
      Alert.alert('PDF Generated', `Saved at: ${uri}`);
    }
  } catch (err) {
    console.log('Error downloading PDF:', err.message);
    Alert.alert('Download Error', err.message || 'Could not generate PDF');
  }
};
