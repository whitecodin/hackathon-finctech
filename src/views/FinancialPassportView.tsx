import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { NavPath, Merchant } from '../types.ts';
import { DebtRepaymentTrendChart } from '../components/DebtRepaymentTrendChart.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { VyaparLogo } from '../components/VyaparLogo.tsx';

interface FinancialPassportViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath) => void;
  onTriggerDownload: () => void;
}

export const FinancialPassportView: React.FC<FinancialPassportViewProps> = ({
  merchant,
  onNavigate,
  onTriggerDownload,
}) => {
  const { t, language } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [cardQrUrl, setCardQrUrl] = useState<string>('');

  useEffect(() => {
    const passportUid = merchant?.passportUid || 'VY-IND-2026-004821';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vyapartrust.in';
    const secureUrl = `${baseUrl}/passport/verify/${passportUid}?mode=underwriter&scope=full_audit&zkp=sha256_7f8c92a104b2c89d`;
    QRCode.toDataURL(secureUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#004f36', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then(setCardQrUrl)
      .catch((err) => console.error('Card QR error:', err));
  }, [merchant?.passportUid]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyPassportUrl = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Page Header & Sovereign Trust Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[#006948] text-[12px] uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{t('sovereignTierVerified', 'Account Aggregator Telemetry • Tier-1 Verified')}</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">
            {t('passportTitle', 'Your Verified Financial Passport')}
          </h1>
          <p className="text-[14px] text-[#3d4a42]">
            {t('passportSubtitle', 'A portable, explainable financial identity for retail merchants, recognized across MSME banking ecosystems.')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#85f8c4] text-[#002114] text-[12px] font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
            {t('activeStatus', 'AA CONSENT ACTIVE')}
          </span>
          <span className="text-[11px] text-[#3d4a42]">{t('syncStatus', 'Sync: 14 Jan 2026, 08:30 IST')}</span>
        </div>
      </div>

      {/* Section 1: The Signature Digital Passport Credential */}
      <div className="relative overflow-hidden rounded-xl bg-white shadow-xl border border-[#bccac0]/30">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#85f8c4]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#89f5e7]/25 blur-3xl pointer-events-none"></div>

        {/* Top Header Ribbon */}
        <div className="relative bg-gradient-to-r from-[#006948] via-[#00855d] to-[#006a61] px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2.5">
            <VyaparLogo size="sm" showText={false} />
            <span className="text-[12px] tracking-widest uppercase font-bold text-[#ffdcc3]">
              VyaparTrust Sovereign MSME Credential
            </span>
            <span className="text-[#85f8c4] text-[11px]">•</span>
            <span className="text-[11px] text-[#85f8c4] font-mono font-semibold">
              STANDARDIZED PROTOCOL v2.4
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md">
              <span className="material-symbols-outlined text-[13px] text-[#85f8c4]">lock</span>
              <span>Zero-Knowledge Verification</span>
            </span>
            <span className="text-[11px] font-mono tracking-wider opacity-90">
              AA-CONSENT-9481-OK
            </span>
          </div>
        </div>

        {/* Credential Main Canvas */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative">
          {/* Left Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 shadow-md">
                <img
                  src={merchant?.profilePhotoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBfqWPu6jZ1EwpUu6B6iT2DDyrwAs_hw6Udj_J0_OQOT4qXl-FfjXD5sm2iR83oebcdDRbnWJCeH8XZcajqYT0viBC8P4XJdJxBJ8OsheUxSn2oJ9YrqjQ6_Il9UDkjIHxoAqmdUPtO-_5nwtM_46_ebjsUv0oAm8ZHfPrwu5OrYTH_uJpXWiu6ZPdMw8H_Bf27QRhuIKk8JC7Xn_y1oP7IdxZtUrv0PFDYAsRBASjIzRiea8gv1npjcg"}
                  alt="Merchant Passport Photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-[#006948]/90 text-center py-0.5 text-white text-[9px] uppercase font-bold tracking-widest">
                  Biometric KYC
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-[#006948] font-bold">
                  Registered Commercial Unit
                </span>
                <h2 className="text-[18px] font-bold text-[#131b2e] truncate tracking-tight uppercase">
                  {merchant?.storeName || 'RAMESH GENERAL STORE'}
                </h2>
                <p className="text-[13px] text-[#3d4a42]">
                  Proprietor: <span className="font-semibold text-[#131b2e]">{merchant?.ownerName || 'Ramesh Kumar'}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6d7a72]">
                  <span className="material-symbols-outlined text-[15px]">category</span>
                  <span className="truncate">Retail Grocery & Daily FMCG</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f2f3ff] rounded-lg p-3.5 flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between items-center text-[#3d4a42]">
                <span>Passport Unique UID:</span>
                <span className="font-mono font-bold text-[#131b2e]">{merchant?.passportUid || 'VY-IND-2026-004821'}</span>
              </div>
              <div className="flex justify-between items-center text-[#3d4a42]">
                <span>Jurisdiction:</span>
                <span className="text-[#131b2e] font-medium">{merchant?.location || `${merchant?.city || 'Udaipur'}, ${merchant?.state || 'Rajasthan'} • PIN ${merchant?.pinCode || '313001'}`}</span>
              </div>
              <div className="flex justify-between items-center text-[#3d4a42]">
                <span>Validity Period:</span>
                <span className="text-[#131b2e] font-medium">14 Jan 2026 — 14 Jul 2026</span>
              </div>
              <div className="flex justify-between items-center text-[#3d4a42]">
                <span>Data Foundation:</span>
                <span className="text-[#006948] font-semibold">90 Days AA & UPI Telemetry</span>
              </div>
            </div>
          </div>

          {/* Center Column: Radial Gauge (5 cols) with Interactive Hover Tooltips */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-b from-[#f2f3ff] to-white shadow-xs text-center border border-[#bccac0]/20 relative group/gauge">
            <div className="relative w-48 h-48 flex items-center justify-center my-2 cursor-pointer">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  className="text-[#eaedff]"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="66"
                  stroke="currentColor"
                  strokeWidth="12"
                ></circle>
                {/* Score Ring (78%) */}
                <circle
                  className="text-[#006948] transition-all duration-700 ease-out hover:stroke-[#00855d] hover:stroke-width-[14]"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="66"
                  stroke="currentColor"
                  strokeDasharray="414.69"
                  strokeDashoffset="91.23"
                  strokeLinecap="round"
                  strokeWidth="12"
                ></circle>
                {/* Secondary Median ring (62%) */}
                <circle
                  className="text-[#bccac0] opacity-80 hover:opacity-100 transition-opacity"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="54"
                  stroke="currentColor"
                  strokeDasharray="339.29"
                  strokeDashoffset="128.93"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></circle>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] uppercase tracking-widest text-[#6d7a72] font-extrabold flex items-center gap-1">
                  VyaparTrust Score
                  <span className="material-symbols-outlined text-[14px] text-[#006948]">info</span>
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[44px] font-black text-[#131b2e] leading-none">
                    {merchant?.healthScore || 78}
                  </span>
                  <span className="text-[16px] text-[#6d7a72] font-bold">/100</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-black shadow-xs">
                  Grade A- • Good Standing
                </span>
              </div>

              {/* Radial Gauge Hover Explainer Tooltip */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-72 p-3.5 bg-[#131b2e] text-white text-left rounded-2xl shadow-2xl z-30 opacity-0 group-hover/gauge:opacity-100 pointer-events-none transition-all duration-200 border border-white/15">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/20 mb-2">
                  <span className="font-extrabold text-[12px] text-[#85f8c4]">VyaparTrust Scoring Metric</span>
                  <span className="text-[10px] text-white/70 font-mono">Algorithm v2.4</span>
                </div>
                <p className="text-[11px] text-white/90 leading-relaxed">
                  <strong>Score Calculation:</strong> Weighted aggregate of 90-day Cashflow Regularity (30%), Mandate Honoring (25%), OpEx Liquidity Buffer (20%), and Transaction Cleanliness (25%).
                </p>
                <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center justify-between text-[10px] text-[#85f8c4]">
                  <span>Approval Probability: &gt;94%</span>
                  <span>Pre-approved: ₹1.0 Lakh</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-[12px] text-[#3d4a42] mt-1">
              {/* Ramesh Score Data Point */}
              <div className="relative group/score flex items-center gap-1.5 cursor-pointer py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                <span>Ramesh Score: <strong className="text-[#006948]">78</strong></span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-[#131b2e] text-white text-left rounded-xl shadow-xl z-20 opacity-0 group-hover/score:opacity-100 pointer-events-none transition-all text-[11px]">
                  <p className="font-bold text-[#85f8c4]">Ramesh General Store (78/100)</p>
                  <p className="text-white/80 mt-1 leading-snug">
                    Pristine daily UPI settlement pacing (+45 pts) and zero mandate bounce track (+22 pts).
                  </p>
                </div>
              </div>

              {/* FMCG Median Data Point */}
              <div className="relative group/median flex items-center gap-1.5 cursor-pointer py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bccac0]"></span>
                <span>Udaipur Kirana Median: <strong>62</strong></span>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-[#131b2e] text-white text-left rounded-xl shadow-xl z-20 opacity-0 group-hover/median:opacity-100 pointer-events-none transition-all text-[11px]">
                  <p className="font-bold text-[#ffdcc3]">Peer Benchmark (62/100)</p>
                  <p className="text-white/80 mt-1 leading-snug">
                    Median of 1,240+ retail grocery MSMEs across Udaipur. Ramesh outperforms peers by <strong>+16 pts</strong>.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#6d7a72] mt-2 italic">
              Calculated automatically across 248 verified financial events
            </p>
          </div>

          {/* Right Column: QR & Actions (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between h-full gap-4">
            <div className="flex flex-col items-center sm:items-start lg:items-end text-center sm:text-left lg:text-right">
              {/* Dynamic Underwriter QR Pattern */}
              <div
                onClick={onTriggerDownload}
                title="Click to open Underwriter Verification QR Modal"
                className="p-2.5 rounded-xl bg-white shadow-xs border border-[#bccac0]/40 flex flex-col items-center cursor-pointer hover:border-[#006948] transition-all group"
              >
                {cardQrUrl ? (
                  <img
                    src={cardQrUrl}
                    alt="Underwriter Verification QR Code"
                    className="w-24 h-24 object-contain rounded-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-[#eaedff] flex items-center justify-center text-[#006948] text-[11px] font-bold">
                    QR Active
                  </div>
                )}
                <span className="font-mono text-[9px] text-[#006948] font-bold mt-1 group-hover:underline flex items-center gap-0.5">
                  SCAN TO AUDIT
                  <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                </span>
              </div>
              <span className="text-[11px] text-[#6d7a72] font-mono mt-1">SHA-256: 7f8c...3a29</span>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-[#006948] text-white font-semibold text-[14px] hover:bg-[#00855d] shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share with Lender</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onTriggerDownload}
                  className="flex items-center justify-center gap-1.5 h-10 px-2 rounded-lg bg-[#e2e7ff] text-[#131b2e] font-semibold text-[12px] hover:bg-[#dae2fd] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">download</span>
                  <span>Encrypted PDF</span>
                </button>
                <button
                  onClick={() => alert('Audit Trail: 248 cryptographic hash logs anchored to Account Aggregator consented timestamp.')}
                  className="flex items-center justify-center gap-1.5 h-10 px-2 rounded-lg bg-[#f2f3ff] text-[#131b2e] font-semibold text-[12px] hover:bg-[#e2e7ff] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">history</span>
                  <span>Audit Trail</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Micro Metadata Footer */}
        <div className="bg-[#f2f3ff] px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-[#3d4a42] border-t border-[#bccac0]/20">
          <div className="flex items-center gap-4">
            <span>GSTN: <strong className="text-[#131b2e]">{merchant?.gstin || '08AAACR4092K1Z9'}</strong></span>
            <span>Udyam: <strong className="text-[#131b2e]">{merchant?.udyamId || 'UDYAM-RJ-14-002819'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#006948]">
            <span className="material-symbols-outlined text-[14px]">format_image_left</span>
            <span className="font-semibold">RBI-Regulated Account Aggregator Framework Verified</span>
          </div>
        </div>
      </div>

      {/* Section 2: Six Pillar Underwriting Dimension Breakdown */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-[20px] font-bold text-[#131b2e] tracking-tight">Profile Breakdown Dimensions</h3>
            <p className="text-[14px] text-[#3d4a42]">Quantitative telemetry evaluating Ramesh General Store across 6 risk vectors.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#e2e7ff] text-[11px] text-[#131b2e] font-semibold">
            90-Day Telemetry Window
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#bccac0]/20 flex flex-col justify-between gap-4 hover:shadow-md transition-all relative group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#85f8c4]/50 flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[22px]">calendar_today</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[16px] font-bold text-[#131b2e]">Income Consistency</h4>
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">info</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">Daily operational inflow rate</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-bold text-[#006948]">88</span>
                <span className="text-[11px] text-[#6d7a72]">/100</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006948] h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="text-[#131b2e] font-semibold">92% active daily sales</span>
                <span className="text-[#006948] font-bold">Very High</span>
              </div>
            </div>

            {/* Pillar Hover Explainer Tooltip */}
            <div className="absolute top-full left-0 right-0 mt-1 p-3.5 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-2xl z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all border border-white/15">
              <p className="font-extrabold text-[#85f8c4] mb-1">Income Consistency (Weight: 25%)</p>
              <p className="text-white/90 leading-relaxed">
                <strong>What it measures:</strong> Pacing of daily QR collections. 92% of business days recorded &gt;₹4,000 receipts, demonstrating resilient neighborhood footfall.
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-white/15 text-[10px] text-white/70 flex justify-between">
                <span>Source: PhonePe & BharatPe QR</span>
                <span className="text-[#85f8c4] font-bold">+28 Pts Underwriting</span>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#bccac0]/20 flex flex-col justify-between gap-4 hover:shadow-md transition-all relative group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#85f8c4]/50 flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[16px] font-bold text-[#131b2e]">Cash Flow Stability</h4>
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">info</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">Inflow velocity & seasonality</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-bold text-[#006948]">82</span>
                <span className="text-[11px] text-[#6d7a72]">/100</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006948] h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="text-[#131b2e] font-semibold">Stable weekday QR receipts</span>
                <span className="text-[#006948] font-bold">Strong Velocity</span>
              </div>
            </div>

            {/* Pillar Hover Explainer Tooltip */}
            <div className="absolute top-full left-0 right-0 mt-1 p-3.5 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-2xl z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all border border-white/15">
              <p className="font-extrabold text-[#85f8c4] mb-1">Cash Flow Stability (Weight: 20%)</p>
              <p className="text-white/90 leading-relaxed">
                <strong>What it measures:</strong> Low standard deviation in weekly revenue (₹1.60L avg monthly turnover ±8.2% variance), ensuring predictable EMI repayment capacity.
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-white/15 text-[10px] text-white/70 flex justify-between">
                <span>Source: HDFC Bank Current A/C</span>
                <span className="text-[#85f8c4] font-bold">+22 Pts Underwriting</span>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#bccac0]/20 flex flex-col justify-between gap-4 hover:shadow-md transition-all relative group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#85f8c4]/50 flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[22px]">store</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[16px] font-bold text-[#131b2e]">Business Activity</h4>
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">info</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">Footfall & transaction density</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-bold text-[#006948]">85</span>
                <span className="text-[11px] text-[#6d7a72]">/100</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006948] h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="text-[#131b2e] font-semibold">248 transactions analyzed</span>
                <span className="text-[#006948] font-bold">Frequent</span>
              </div>
            </div>

            {/* Pillar Hover Explainer Tooltip */}
            <div className="absolute top-full left-0 right-0 mt-1 p-3.5 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-2xl z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all border border-white/15">
              <p className="font-extrabold text-[#85f8c4] mb-1">Business Activity (Weight: 15%)</p>
              <p className="text-white/90 leading-relaxed">
                <strong>What it measures:</strong> Density of customer micropayments and trade ticket counts. Proves active commercial operations vs shell accounts.
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-white/15 text-[10px] text-white/70 flex justify-between">
                <span>Source: 90-Day Telemetry Logs</span>
                <span className="text-[#85f8c4] font-bold">+18 Pts Underwriting</span>
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#bccac0]/20 flex flex-col justify-between gap-4 hover:shadow-md transition-all relative group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ffdcc3] flex items-center justify-center text-[#8d4b00]">
                  <span className="material-symbols-outlined text-[22px]">savings</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[16px] font-bold text-[#131b2e]">Liquidity & Buffer</h4>
                    <span className="material-symbols-outlined text-[15px] text-[#8d4b00]">info</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">OpEx shock runway</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-bold text-[#8d4b00]">64</span>
                <span className="text-[11px] text-[#6d7a72]">/100</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#b15f00] h-full rounded-full" style={{ width: '64%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="text-[#131b2e] font-semibold">18 days operating reserve</span>
                <span className="text-[#8d4b00] font-bold">Moderate</span>
              </div>
            </div>

            {/* Pillar Hover Explainer Tooltip */}
            <div className="absolute top-full left-0 right-0 mt-1 p-3.5 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-2xl z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all border border-white/15">
              <p className="font-extrabold text-[#ffdcc3] mb-1">Liquidity & Buffer (Weight: 15%)</p>
              <p className="text-white/90 leading-relaxed">
                <strong>What it measures:</strong> Liquid cash balance / daily operating burn (₹4,800/day). Current buffer is 18 days. Reaching 30 days yields +7 score points.
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-white/15 text-[10px] text-white/70 flex justify-between">
                <span>Target: 30-Day Emergency Buffer</span>
                <span className="text-[#ffdcc3] font-bold">Needs Attention</span>
              </div>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#bccac0]/20 flex flex-col justify-between gap-4 hover:shadow-md transition-all relative group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#85f8c4]/50 flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[22px]">gpp_good</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[16px] font-bold text-[#131b2e]">Transaction Safety</h4>
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">info</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">Anomalies & dispute flags</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-bold text-[#006948]">89</span>
                <span className="text-[11px] text-[#6d7a72]">/100</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006948] h-full rounded-full" style={{ width: '89%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="text-[#131b2e] font-semibold">2 non-recurring flags</span>
                <span className="text-[#006948] font-bold">Low Risk</span>
              </div>
            </div>

            {/* Pillar Hover Explainer Tooltip */}
            <div className="absolute top-full left-0 right-0 mt-1 p-3.5 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-2xl z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all border border-white/15">
              <p className="font-extrabold text-[#85f8c4] mb-1">Transaction Safety (Weight: 15%)</p>
              <p className="text-white/90 leading-relaxed">
                <strong>What it measures:</strong> ML anomaly scoring for odd-hour high-value debits. Self-attesting the 2 pending flags restores +4 score points instantly.
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-white/15 text-[10px] text-white/70 flex justify-between">
                <span>Source: Anomaly Detection Engine</span>
                <span className="text-[#85f8c4] font-bold">89 / 100 Safety</span>
              </div>
            </div>
          </div>

          {/* Pillar 6 */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#bccac0]/20 flex flex-col justify-between gap-4 hover:shadow-md transition-all relative group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#85f8c4]/50 flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[16px] font-bold text-[#131b2e]">Repayment Behaviour</h4>
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">info</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">Mandate honors & clearances</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-bold text-[#006948]">80</span>
                <span className="text-[11px] text-[#6d7a72]">/100</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006948] h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[11px]">
                <span className="text-[#131b2e] font-semibold">0 distributor ECS dishonors</span>
                <span className="text-[#006948] font-bold">Punctual</span>
              </div>
            </div>

            {/* Pillar Hover Explainer Tooltip */}
            <div className="absolute top-full left-0 right-0 mt-1 p-3.5 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-2xl z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all border border-white/15">
              <p className="font-extrabold text-[#85f8c4] mb-1">Repayment Behaviour (Weight: 10%)</p>
              <p className="text-white/90 leading-relaxed">
                <strong>What it measures:</strong> Zero NACH or distributor mandate dishonors in 180 days. Grants banks instant confidence for unsecured credit pre-approval.
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-white/15 text-[10px] text-white/70 flex justify-between">
                <span>Source: RBI Mandate Ledger</span>
                <span className="text-[#85f8c4] font-bold">100% Punctual</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2.5: Historical Debt Repayment & Credit Utilization Trends (Recharts) */}
      <DebtRepaymentTrendChart storeName={merchant?.storeName} />

      {/* Section 3: Explainability Core */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-[#006948] text-[12px] font-semibold">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            <span>Radical Explainability Engine</span>
          </div>
          <h3 className="text-[20px] font-bold text-[#131b2e] tracking-tight">
            Why is {merchant?.storeName || 'Ramesh General Store'}'s score 78?
          </h3>
          <p className="text-[14px] text-[#3d4a42]">
            We never present an ungrounded black-box figure. Here are the exact mathematical drivers detected in your 90-day transaction stream.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Strengths */}
          <div className="rounded-xl bg-white p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#bccac0]/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006948] text-[22px]">check_circle</span>
                  <h4 className="text-[16px] font-bold text-[#131b2e]">Strengths</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                  +38 Pts Value
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006948] text-[18px] shrink-0 mt-0.5">trending_up</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#131b2e]">Stable business inflows</p>
                    <p className="text-[12px] text-[#3d4a42]">₹1,60,000 monthly average volume with remarkably low standard deviation week-over-week.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006948] text-[18px] shrink-0 mt-0.5">point_of_sale</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#131b2e]">High transaction frequency</p>
                    <p className="text-[12px] text-[#3d4a42]">Consistent 18+ daily customer settlements indicating active neighborhood retail footfall.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006948] text-[18px] shrink-0 mt-0.5">task_alt</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#131b2e]">Flawless mandate fulfillment</p>
                    <p className="text-[12px] text-[#3d4a42]">Clean utility payments and FMCG wholesaler NACH debits with zero returns over 180 days.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-2 flex items-center justify-between text-[11px] text-[#006948] font-semibold border-t border-[#bccac0]/20">
              <span>Validated via HDFC & SBI Bank AA</span>
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
          </div>

          {/* Needs Attention */}
          <div className="rounded-xl bg-white p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#bccac0]/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8d4b00] text-[22px]">warning</span>
                  <h4 className="text-[16px] font-bold text-[#131b2e]">Needs Attention</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold">
                  -14 Pts Drag
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#8d4b00] text-[18px] shrink-0 mt-0.5">hourglass_empty</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#131b2e]">Moderate cash reserve buffer</p>
                    <p className="text-[12px] text-[#3d4a42]">Current liquid buffer stands at 18 days vs. standard 30-day resilience benchmark for grocery retail.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#8d4b00] text-[18px] shrink-0 mt-0.5">pie_chart</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#131b2e]">Supplier concentration risk</p>
                    <p className="text-[12px] text-[#3d4a42]">38% of all procurement outflow is directed to a single distributor ("Udaipur Agro Wholesale").</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#8d4b00] text-[18px] shrink-0 mt-0.5">balance</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#131b2e]">End-of-month balance dips</p>
                    <p className="text-[12px] text-[#3d4a42]">Account dropped below ₹10,000 on two occasions between the 26th and 29th of the month.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-2 flex items-center justify-between text-[11px] text-[#8d4b00] font-semibold border-t border-[#bccac0]/20">
              <button 
                onClick={() => onNavigate('credit-readiness')}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Actionable roadmap available</span>
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              </button>
            </div>
          </div>

          {/* Under Review */}
          <div className="rounded-xl bg-white p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#bccac0]/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8d4b00] text-[22px]">pending_actions</span>
                  <h4 className="text-[16px] font-bold text-[#131b2e]">Under Review</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-[11px] font-bold">
                  2 Flags
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-lg bg-[#f2f3ff] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-[#131b2e]">UPI Outflow: ₹45,000</span>
                    <span className="text-[#8d4b00] font-semibold text-[11px]">03 Jan 2026</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">Large single debit to private VPA. Tag as "Commercial Inventory" or "Personal Draw".</p>
                  <button 
                    onClick={() => onNavigate('transaction-safety')}
                    className="self-start text-[#006948] text-[11px] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Self-Attest Category</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[#f2f3ff] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-[#131b2e]">Inward RTGS: ₹1,20,000</span>
                    <span className="text-[#8d4b00] font-semibold text-[11px]">28 Dec 2025</span>
                  </div>
                  <p className="text-[11px] text-[#3d4a42]">Non-customer bulk deposit. Upload invoice or tag as capital infusion to count toward turnover.</p>
                  <button 
                    onClick={() => onNavigate('transaction-safety')}
                    className="self-start text-[#006948] text-[11px] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Upload Proof / Clarify</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-2 flex items-center justify-between text-[11px] text-[#3d4a42] border-t border-[#bccac0]/20">
              <span>Resolving flags can boost score to <strong>82+</strong></span>
              <span className="material-symbols-outlined text-[16px] text-[#006948]">stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Target Roadmap & Interactive FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Roadmap to 85+ (7 Cols) */}
        <div className="lg:col-span-7 rounded-xl bg-white p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] text-[24px]">flag</span>
              <h3 className="text-[16px] font-bold text-[#131b2e]">Target Roadmap: Reach Score 85+ (Tier-1 MSME)</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">+7 Target</span>
          </div>
          <p className="text-[14px] text-[#3d4a42]">Reaching 85+ unlocks lower interest rates (up to 1.75% lower APR) across partner public sector and private micro-credit banks.</p>

          <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#006948] text-white font-bold text-[14px] flex items-center justify-center shrink-0">1</div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#131b2e] text-[15px]">Maintain Minimum ₹25,000 Balance for 45 Days</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-bold">+3 Pts</span>
                </div>
                <p className="text-[12px] text-[#3d4a42]">Buffers your operational runway from 18 to 28 days, lowering the perceived cash-flow emergency risk.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#006948] text-white font-bold text-[14px] flex items-center justify-center shrink-0">2</div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#131b2e] text-[15px]">Attest Pending 2 Transaction Flags</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-bold">+2 Pts</span>
                </div>
                <p className="text-[12px] text-[#3d4a42]">Classify the ₹45,000 debit and ₹1,20,000 credit in Transaction Safety to remove anomaly penalty.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#006948] text-white font-bold text-[14px] flex items-center justify-center shrink-0">3</div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#131b2e] text-[15px]">Distribute Wholesaler Payments Across Secondary Vendors</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-bold">+2 Pts</span>
                </div>
                <p className="text-[12px] text-[#3d4a42]">Lower primary supplier concentration below 30% to demonstrate supply chain resilience.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs (5 Cols) */}
        <div className="lg:col-span-5 rounded-xl bg-white p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] text-[24px]">help_center</span>
            <h3 className="text-[16px] font-bold text-[#131b2e]">Frequently Asked Questions</h3>
          </div>

          <details className="group bg-[#f2f3ff] rounded-lg p-3.5 open:bg-[#eaedff] transition-colors cursor-pointer">
            <summary className="text-[14px] font-bold text-[#131b2e] flex items-center justify-between list-none">
              <span>How is this score calculated?</span>
              <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180 text-[#6d7a72]">expand_more</span>
            </summary>
            <p className="text-[12px] text-[#3d4a42] mt-2 leading-relaxed">
              VyaparTrust scores MSMEs through a weighted algorithmic engine analyzing 90+ days of live banking Account Aggregator feeds, UPI settlement logs, and supplier mandate patterns. There is zero manual or subjective bias.
            </p>
          </details>

          <details className="group bg-[#f2f3ff] rounded-lg p-3.5 open:bg-[#eaedff] transition-colors cursor-pointer">
            <summary className="text-[14px] font-bold text-[#131b2e] flex items-center justify-between list-none">
              <span>Who can see my Financial Passport?</span>
              <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180 text-[#6d7a72]">expand_more</span>
            </summary>
            <p className="text-[12px] text-[#3d4a42] mt-2 leading-relaxed">
              Only institutions you explicitly authorize. You maintain granular control over time-bound access tokens. You can revoke partner permissions at any time from your Consent & Privacy dashboard.
            </p>
          </details>

          <details className="group bg-[#f2f3ff] rounded-lg p-3.5 open:bg-[#eaedff] transition-colors cursor-pointer">
            <summary className="text-[14px] font-bold text-[#131b2e] flex items-center justify-between list-none">
              <span>Is this an official CIBIL credit score?</span>
              <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180 text-[#6d7a72]">expand_more</span>
            </summary>
            <p className="text-[12px] text-[#3d4a42] mt-2 leading-relaxed">
              No. Bureau scores look backward at debt history. VyaparTrust is an operational cash-flow identity that proves your ongoing capacity to earn, handle working capital, and honor supplier obligations in real time.
            </p>
          </details>

          <div className="mt-2 p-3 rounded-lg bg-[#eaedff] flex items-center gap-2 text-[11px] text-[#3d4a42]">
            <span className="material-symbols-outlined text-[#006948] text-[20px] shrink-0">lock_reset</span>
            <span>Every passport export contains an immutable cryptographic signature verifiable on the VyaparTrust Sovereign Public Node.</span>
          </div>
        </div>
      </div>

      {/* Section 5: Institutional Disclaimer */}
      <div className="rounded-lg bg-[#f2f3ff] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6d7a72] border border-[#bccac0]/20">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="material-symbols-outlined text-[20px] text-[#8d4b00] shrink-0">info</span>
          <span>
            <strong>Sandbox Underwriting Notice:</strong> This Financial Passport is generated using synthetic demonstration data for <strong>{merchant?.storeName || 'Ramesh General Store'}</strong>. VyaparTrust is a technology infrastructure provider, not a regulated lender, and does not directly approve or disburse credit facilities.
          </span>
        </div>
        <button
          onClick={() => onNavigate('consent-privacy')}
          className="shrink-0 font-bold text-[#006948] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Review Regulatory Disclosures</span>
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        </button>
      </div>

      {/* Share with Lender Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bccac0]/40">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-[24px]">share</span>
                <h3 className="text-[18px] font-bold text-[#131b2e]">Share Financial Passport</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#3d4a42] hover:bg-[#eaedff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[13px] text-[#3d4a42] my-4">
              Generate a secure, time-bound verification link for State Bank of India, HDFC Bank, or partner NBFC credit desks.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#bccac0]/30 flex items-center justify-between">
                <span className="text-[12px] font-mono text-[#131b2e] truncate">
                  https://vyapartrust.in/passport/verify/{merchant?.passportUid || 'VY-IND-2026-004821'}
                </span>
                <button
                  onClick={copyPassportUrl}
                  className="px-3 py-1 rounded bg-[#006948] text-white text-[11px] font-bold shrink-0 ml-2 cursor-pointer hover:bg-[#00855d]"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#85f8c4]/30 text-[11px] text-[#002114]">
                <p className="font-bold">DPDP Act 2023 Compliant Token</p>
                <p>Link expires in 72 hours. You can revoke access at any second from Consent & Privacy.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-lg bg-[#eaedff] text-[#131b2e] font-semibold text-[13px] cursor-pointer hover:bg-[#dae2fd]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
