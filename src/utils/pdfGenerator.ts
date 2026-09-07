import { jsPDF } from 'jspdf';
import { Customer, Transaction } from '../types';

/**
 * Generate and download an official PDF receipt for a transaction in Elegant Dark / Clean Corporate style
 */
export function generateTransactionReceipt(
  transaction: Transaction,
  customerName: string,
  accountNumber: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark Header Bar matching theme (#111827 / #0F1115)
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('APEXCORE BANKING', 15, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text('Electronic Transaction Verification Receipt', 15, 18);
  doc.text('Central Tech City | IFSC: SABK0001001', 15, 23);

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - 34, 10, 20, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SETTLED', pageWidth - 30, 14.5);

  // Amount Showcase
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction Amount', 15, 40);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const isCredit = transaction.debitOrCredit === 'CREDIT';
  if (isCredit) {
    doc.setTextColor(5, 150, 105);
    doc.text(`+ Rs. ${transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 15, 49);
  } else {
    doc.setTextColor(220, 38, 38);
    doc.text(`- Rs. ${transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 15, 49);
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(15, 55, pageWidth - 15, 55);

  // Details Grid
  doc.setFontSize(8.5);
  let y = 65;
  const col1 = 15;
  const col2 = 55;

  const rows: [string, string][] = [
    ['Transaction Ref:', transaction.transactionId || transaction.id],
    ['Operation Type:', transaction.type],
    ['Settlement Date:', new Date(transaction.timestamp).toLocaleString()],
    ['Status:', transaction.status],
    ['Account Holder:', customerName || 'Valued Customer'],
    ['Account Number:', maskAccountNumber(accountNumber || transaction.accountNumber)],
    ['Source / Sender:', transaction.sender || 'Direct Transfer'],
    ['Target / Receiver:', transaction.receiver || 'Account Holder'],
    ['Reference Details:', transaction.description || 'Banking Settlement'],
    ['Closing Balance:', `Rs. ${transaction.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
  ];

  rows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(label, col1, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(val), col2, y);
    y += 7;
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y + 4, pageWidth - 15, y + 4);

  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('This is an authenticated system electronic receipt. No physical signature required.', 15, y + 10);
  doc.text('ApexCore Enterprise Banking Network | 24x7 Customer Support: 1800-APEX-CORE', 15, y + 15);

  doc.save(`Receipt_${transaction.transactionId || 'TXN'}.pdf`);
}

/**
 * Generate and download an Official Bank Statement PDF
 */
export function generateBankStatement(
  customer: Customer,
  transactions: Transaction[],
  startDate?: string,
  endDate?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark Header
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('APEXCORE BANKING', 15, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text('Official Certified Account Statement of Transactions', 15, 20);
  doc.text(`Branch: ${customer.branch || 'Central Tech City'} | IFSC: ${customer.ifsc || 'SABK0001001'}`, 15, 26);

  // Customer Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 38, pageWidth - 30, 30, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);

  // Col 1
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Name:', 20, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.fullName, 55, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Customer ID:', 20, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.customerId, 55, 53);

  doc.setFont('helvetica', 'bold');
  doc.text('Account Number:', 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.accountNumber, 55, 60);

  // Col 2
  doc.setFont('helvetica', 'bold');
  doc.text('Account Type:', 110, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.accountType, 140, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Statement Period:', 110, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(`${startDate || 'All Time'} - ${endDate || 'Present'}`, 140, 53);

  doc.setFont('helvetica', 'bold');
  doc.text('Ledger Balance:', 110, 60);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Rs. ${customer.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 140, 60);

  // Transactions Header
  let y = 78;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, pageWidth - 30, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DATE', 18, y + 5.5);
  doc.text('TXN ID', 45, y + 5.5);
  doc.text('PARTICULARS', 78, y + 5.5);
  doc.text('DEBIT (Rs)', 132, y + 5.5);
  doc.text('CREDIT (Rs)', 158, y + 5.5);
  doc.text('BALANCE (Rs)', 182, y + 5.5);

  y += 11;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  transactions.forEach((tx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const dateStr = new Date(tx.timestamp).toLocaleDateString();
    const isDebit = tx.debitOrCredit === 'DEBIT';

    doc.setTextColor(15, 23, 42);
    doc.text(dateStr, 18, y);
    doc.text(String(tx.transactionId || tx.id).slice(0, 10), 45, y);

    const desc = (tx.description || tx.type || '').slice(0, 28);
    doc.text(desc, 78, y);

    if (isDebit) {
      doc.setTextColor(220, 38, 38);
      doc.text(tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 132, y);
      doc.setTextColor(100, 116, 139);
      doc.text('-', 162, y);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('-', 136, y);
      doc.setTextColor(5, 150, 105);
      doc.text(tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 158, y);
    }

    doc.setTextColor(15, 23, 42);
    doc.text(tx.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 182, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(15, y + 2, pageWidth - 15, y + 2);

    y += 6.5;
  });

  if (transactions.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.text('No transactions recorded for the selected period.', pageWidth / 2, y + 8, { align: 'center' });
  }

  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('End of Certified Account Statement | ApexCore Systems v4.2.0', 15, 286);

  doc.save(`Statement_${customer.accountNumber}_${Date.now()}.pdf`);
}

function maskAccountNumber(acc?: string): string {
  if (!acc) return 'XXXX-XXXX-XXXX';
  const s = String(acc);
  if (s.length < 5) return s;
  return `XXXX-XXXX-${s.slice(-4)}`;
}
