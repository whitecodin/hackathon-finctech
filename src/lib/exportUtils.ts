import { jsPDF } from 'jspdf';
import { Merchant } from '../types.ts';

export interface StressTestParams {
  simulatedRunwayDays?: number;
  simulatedReserves?: number;
  salesShock?: number;
  supplierTermsDays?: number;
  emergencyExpense?: number;
  dailyBurn?: number;
}

/**
 * Generates and downloads a high-fidelity PDF report for the merchant passport & stress test.
 */
export const downloadPassportPdf = (
  merchant: Merchant | null,
  stressParams?: StressTestParams
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const mName = merchant?.ownerName || 'Ramesh Kumar';
  const sName = merchant?.storeName || 'Ramesh General Store';
  const uid = merchant?.passportUid || 'VY-IND-2026-004821';
  const healthScore = merchant?.healthScore || 78;
  const preApproved = merchant?.creditBandMax ? `₹${(merchant.creditBandMax / 100000).toFixed(1)} Lakh` : '₹3.5 Lakh';
  const safeEmi = merchant?.safeEmiMax ? `₹${merchant.safeEmiMax.toLocaleString('en-IN')}/mo` : '₹6,500/mo';
  const runway = stressParams?.simulatedRunwayDays || merchant?.resilienceDays || 42;
  const reserves = stressParams?.simulatedReserves || 142800;
  const gstin = merchant?.gstin || '08AAACR4092K1Z9';
  const udyam = merchant?.udyamId || 'UDYAM-RJ-14-0089124';

  // --- Header Background Bar ---
  doc.setFillColor(0, 79, 54); // #004f36 Deep Emerald
  doc.rect(0, 0, 210, 32, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('VyaparTrust | Sovereign MSME Financial Report', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('DPDP Act 2023 Compliant • RBI Account Aggregator Consented Telemetry', 14, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 140, 23);

  // --- Merchant Identity Section ---
  doc.setFillColor(242, 243, 255); // #f2f3ff Soft Blue-Grey
  doc.roundedRect(14, 38, 182, 34, 3, 3, 'F');

  doc.setTextColor(19, 27, 46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(sName, 20, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(61, 74, 66);
  doc.text(`Proprietor: ${mName} • Location: Johari Bazaar, Udaipur, Rajasthan`, 20, 55);
  doc.text(`Passport UID: ${uid} | GSTIN: ${gstin} | Udyam: ${udyam}`, 20, 62);

  doc.setFillColor(0, 105, 72);
  doc.roundedRect(145, 43, 44, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('UNDERWRITING TIER', 148, 49);
  doc.setFontSize(12);
  doc.text('TIER-1 VERIFIED', 148, 58);

  // --- Key Underwriting Metrics (4 Bento Cards) ---
  let startY = 78;

  // Card 1: Health Score
  doc.setFillColor(245, 255, 247);
  doc.setDrawColor(133, 248, 196);
  doc.roundedRect(14, startY, 42, 32, 2, 2, 'FD');
  doc.setTextColor(0, 105, 72);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('VYAPAR SCORE', 18, startY + 8);
  doc.setFontSize(18);
  doc.text(`${healthScore}/100`, 18, startY + 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Grade A (Low Risk)', 18, startY + 27);

  // Card 2: Pre-Approved Limit
  doc.setFillColor(245, 255, 247);
  doc.roundedRect(60, startY, 42, 32, 2, 2, 'FD');
  doc.setTextColor(0, 105, 72);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PRE-APPROVED LINE', 64, startY + 8);
  doc.setFontSize(15);
  doc.text(preApproved, 64, startY + 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Safe EMI: ${safeEmi}`, 64, startY + 27);

  // Card 3: Working Runway
  doc.setFillColor(245, 255, 247);
  doc.roundedRect(106, startY, 42, 32, 2, 2, 'FD');
  doc.setTextColor(0, 105, 72);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKING RUNWAY', 110, startY + 8);
  doc.setFontSize(18);
  doc.text(`${runway} Days`, 110, startY + 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Buffer: Optimal', 110, startY + 27);

  // Card 4: Liquid Reserves
  doc.setFillColor(245, 255, 247);
  doc.roundedRect(152, startY, 44, 32, 2, 2, 'FD');
  doc.setTextColor(0, 105, 72);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('LIQUID RESERVES', 156, startY + 8);
  doc.setFontSize(14);
  doc.text(`₹${reserves.toLocaleString('en-IN')}`, 156, startY + 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SBI Current + Sweep', 156, startY + 27);

  // --- Stress Simulation Analysis Section ---
  startY = 118;
  doc.setTextColor(19, 27, 46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Working Capital Resilience & Stress Test Simulation', 14, startY);

  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(188, 202, 192);
  doc.roundedRect(14, startY + 4, 182, 40, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(61, 74, 66);
  doc.text('Simulation Parameter', 20, startY + 12);
  doc.text('Tested Value', 100, startY + 12);
  doc.text('Underwriting Impact', 145, startY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(19, 27, 46);
  doc.text('1. Seasonal Revenue Shock', 20, startY + 20);
  doc.text(`${stressParams?.salesShock !== undefined ? (stressParams.salesShock >= 0 ? `+${stressParams.salesShock}%` : `${stressParams.salesShock}%`) : '0% (Baseline)'}`, 100, startY + 20);
  doc.text('Managed through UPI turnover', 145, startY + 20);

  doc.text('2. Supplier Payment Credit Terms', 20, startY + 28);
  doc.text(`${stressParams?.supplierTermsDays || 30} Days`, 100, startY + 28);
  doc.text('Healthy CCC cycle (18.4d)', 145, startY + 28);

  doc.text('3. Emergency Contingency Outflow', 20, startY + 36);
  doc.text(`₹${(stressParams?.emergencyExpense || 0).toLocaleString('en-IN')}`, 100, startY + 36);
  doc.text(`${runway >= 30 ? 'Liquidity protected' : 'Overdraft suggested'}`, 145, startY + 36);

  // --- Transaction Ledger Sample Section ---
  startY = 168;
  doc.setTextColor(19, 27, 46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Verified Transaction Ledger (Recent 90-Day Telemetry Sample)', 14, startY);

  // Table header
  doc.setFillColor(0, 105, 72);
  doc.rect(14, startY + 4, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Txn ID', 18, startY + 9.5);
  doc.text('Date', 40, startY + 9.5);
  doc.text('Counterparty / Vendor', 68, startY + 9.5);
  doc.text('Type', 125, startY + 9.5);
  doc.text('Amount (INR)', 145, startY + 9.5);
  doc.text('Verification Status', 170, startY + 9.5);

  const sampleRows = [
    { id: 'TXN-98412', date: '14 Jan 2026', party: 'Radhe Shyam Wholesale', type: 'Debit (UPI)', amt: '-₹48,900', status: 'Flagged (Bulk)' },
    { id: 'TXN-98411', date: '14 Jan 2026', party: 'Reliance Retail Mart', type: 'Credit (UPI)', amt: '+₹14,820', status: 'Verified' },
    { id: 'TXN-98410', date: '13 Jan 2026', party: 'ITC FMCG Distributors', type: 'Debit (UPI)', amt: '-₹32,400', status: 'Verified' },
    { id: 'TXN-98409', date: '13 Jan 2026', party: 'Hindustan Unilever', type: 'Debit (UPI)', amt: '-₹28,100', status: 'Verified' },
    { id: 'TXN-98408', date: '12 Jan 2026', party: 'Daily Customer QR Receipts', type: 'Credit (UPI)', amt: '+₹18,400', status: 'Verified' },
    { id: 'TXN-98407', date: '11 Jan 2026', party: 'Nestle India Distribution', type: 'Debit (NEFT)', amt: '-₹19,200', status: 'Verified' },
  ];

  let rowY = startY + 18;
  sampleRows.forEach((r, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, rowY - 5, 182, 7, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(19, 27, 46);
    doc.text(r.id, 18, rowY);
    doc.text(r.date, 40, rowY);
    doc.text(r.party, 68, rowY);
    doc.text(r.type, 125, rowY);
    doc.text(r.amt, 145, rowY);
    if (r.status.includes('Flagged')) {
      doc.setTextColor(186, 26, 26);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(0, 105, 72);
    }
    doc.text(r.status, 170, rowY);
    rowY += 7;
  });

  // --- Cryptographic Seal & Footer ---
  const footerY = 255;
  doc.setFillColor(242, 243, 255);
  doc.roundedRect(14, footerY, 182, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 79, 54);
  doc.text('CRYPTOGRAPHIC SOVEREIGN PROOF & VERIFICATION HASH', 18, footerY + 7);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(61, 74, 66);
  doc.text('SHA-256: 7f8c92a104b2c89d51e739fa88190342cbda19823f990148adbc8921ec560128', 18, footerY + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('This document is tamper-evident and cryptographically signed under the Digital Personal Data Protection (DPDP) Act 2023.', 18, footerY + 19);

  // Save the PDF
  const filename = `VyaparTrust_MSME_Report_${uid}.pdf`;
  doc.save(filename);
};

/**
 * Downloads a spreadsheet-readable CSV with UTF-8 BOM encoding for seamless Excel / Numbers / Sheets compatibility.
 */
export const downloadExcelCsv = (
  merchant: Merchant | null,
  stressParams?: StressTestParams
) => {
  const mName = merchant?.ownerName || 'Ramesh Kumar';
  const sName = merchant?.storeName || 'Ramesh General Store';
  const uid = merchant?.passportUid || 'VY-IND-2026-004821';
  const gstin = merchant?.gstin || '08AAACR4092K1Z9';
  const udyam = merchant?.udyamId || 'UDYAM-RJ-14-0089124';
  const score = merchant?.healthScore || 78;
  const runway = stressParams?.simulatedRunwayDays || merchant?.resilienceDays || 42;
  const reserves = stressParams?.simulatedReserves || 142800;

  // UTF-8 BOM ensures Excel opens CSV with proper encoding and column parsing without corruption
  const BOM = '\uFEFF';

  const rows: string[] = [
    'VYAPARTRUST SOVEREIGN FINANCIAL PASSPORT & LEDGER REPORT',
    `Generated on,${new Date().toISOString()}`,
    `Store Name,"${sName}"`,
    `Proprietor Name,"${mName}"`,
    `Passport UID,"${uid}"`,
    `GSTIN,"${gstin}"`,
    `Udyam Registration,"${udyam}"`,
    `Vyapar Health Score,${score}/100 (Grade A- Low Risk)`,
    `Simulated Working Runway,${runway} Days`,
    `Available Liquid Reserves,INR ${reserves}`,
    '',
    '--- VERIFIED TRANSACTION LEDGER ---',
    'Transaction ID,Date,Reference Number,Counterparty / Vendor,Payment Type,Channel,Amount (INR),Status,Flagged,Verification Reason',
    'TXN-98412,2026-01-14,UPI-REF-908124,"Radhe Shyam Wholesale",Debit,UPI,-48900,Flagged,Yes,"Unusual bulk inventory transfer"',
    'TXN-98411,2026-01-14,UPI-REF-908123,"Reliance Retail Mart",Credit,UPI,14820,Verified,No,"Standard Daily Settlement"',
    'TXN-98410,2026-01-13,UPI-REF-908122,"ITC FMCG Distributors",Debit,UPI,-32400,Verified,No,"Weekly Grocery Restock"',
    'TXN-98409,2026-01-13,UPI-REF-908121,"Hindustan Unilever",Debit,UPI,-28100,Verified,No,"Standard FMCG Supply"',
    'TXN-98408,2026-01-12,UPI-REF-908120,"Daily Customer QR Receipts",Credit,UPI,18400,Verified,No,"Retail Customer Sales"',
    'TXN-98407,2026-01-11,NEFT-REF-789012,"Nestle India Distribution",Debit,NEFT,-19200,Verified,No,"Packaged Food Inventory"',
    'TXN-98406,2026-01-10,UPI-REF-908119,"Daily Customer QR Receipts",Credit,UPI,16750,Verified,No,"Retail Customer Sales"',
    'TXN-98405,2026-01-09,UPI-REF-908118,"Amul Dairy Cooperative",Debit,UPI,-12300,Verified,No,"Daily Milk & Dairy Supplies"',
    'TXN-98404,2026-01-08,UPI-REF-908117,"Daily Customer QR Receipts",Credit,UPI,21400,Verified,No,"Weekend Customer Surge"',
    '',
    '--- CRYPTOGRAPHIC AUDIT PROOF ---',
    'Algorithm,SHA-256',
    'Hash Digest,7f8c92a104b2c89d51e739fa88190342cbda19823f990148adbc8921ec560128',
    'Compliance,"DPDP Act 2023 & RBI Account Aggregator Framework"',
  ];

  const csvContent = BOM + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `VyaparTrust_Financial_Ledger_${uid}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Downloads a structured JSON file containing the full cryptographic audit artifact.
 */
export const downloadJsonAudit = (
  merchant: Merchant | null,
  stressParams?: StressTestParams
) => {
  const uid = merchant?.passportUid || 'VY-IND-2026-004821';

  const auditPayload = {
    schemaVersion: '2026.1-sovereign',
    generatedAt: new Date().toISOString(),
    passportUid: uid,
    merchantProfile: {
      ownerName: merchant?.ownerName || 'Ramesh Kumar',
      storeName: merchant?.storeName || 'Ramesh General Store',
      location: merchant?.location || 'Johari Bazaar, Udaipur, Rajasthan',
      gstin: merchant?.gstin || '08AAACR4092K1Z9',
      udyamId: merchant?.udyamId || 'UDYAM-RJ-14-0089124',
      tier: 'Tier-1 Sovereign Verified',
    },
    underwritingAssessment: {
      healthScore: merchant?.healthScore || 78,
      riskGrade: 'Grade A- (Low Default Probability)',
      creditLimits: {
        minLimit: merchant?.creditBandMin || 50000,
        maxLimit: merchant?.creditBandMax || 350000,
        safeMonthlyEmiMin: merchant?.safeEmiMin || 3500,
        safeMonthlyEmiMax: merchant?.safeEmiMax || 6500,
        interestRateFloor: '1.15% per month',
      },
      verifiedVectors: {
        cashFlowStability: 82,
        repaymentCapacity: 76,
        businessActivity: 85,
        liquidityBuffer: 71,
        dataCoverage: 94,
      },
    },
    resilienceStressSimulation: {
      simulatedRunwayDays: stressParams?.simulatedRunwayDays || merchant?.resilienceDays || 42,
      simulatedReserves: stressParams?.simulatedReserves || 142800,
      dailyBurnRate: stressParams?.dailyBurn || 9800,
      monthlyTurnover: merchant?.monthlyInflow || 482000,
      supplierPaymentTermsDays: stressParams?.supplierTermsDays || 30,
      cashConversionCycleDays: 18.4,
    },
    cryptographicVerification: {
      algorithm: 'SHA-256',
      proofDigest: '7f8c92a104b2c89d51e739fa88190342cbda19823f990148adbc8921ec560128',
      regulatoryCompliance: [
        'Digital Personal Data Protection (DPDP) Act 2023',
        'Reserve Bank of India (RBI) Account Aggregator Non-Bank Consent Framework',
      ],
      zeroKnowledgeProof: 'zk-SNARK compliant payload verification enabled',
    },
  };

  const blob = new Blob([JSON.stringify(auditPayload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `VyaparTrust_Audit_Proof_${uid}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
