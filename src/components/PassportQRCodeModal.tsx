import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Merchant } from '../types.ts';
import { VyaparLogo } from './VyaparLogo.tsx';

interface PassportQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant | null;
  onExecuteDownload: (format: 'pdf' | 'json' | 'csv') => void;
  onOpenVerificationPortal?: () => void;
}

export const PassportQRCodeModal: React.FC<PassportQRCodeModalProps> = ({
  isOpen,
  onClose,
  merchant,
  onExecuteDownload,
  onOpenVerificationPortal,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [securityLevel, setSecurityLevel] = useState<'full' | 'zkp'>('full');
  const [showUnderwriterPreview, setShowUnderwriterPreview] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  const passportUid = merchant?.passportUid || 'VY-IND-2026-004821';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vyapartrust.in';

  // Construct secure URL for underwriters
  const verificationUrl = securityLevel === 'full'
    ? `${baseUrl}/passport/verify/${passportUid}?mode=underwriter&scope=full_audit&zkp=sha256_7f8c92a104b2c89d&aa_consent=AA-SBI-VT-8819283-ENC`
    : `${baseUrl}/passport/verify/${passportUid}?mode=zkp_anonymized&scope=score_only&zkp=sha256_7f8c92a104b2c89d`;

  useEffect(() => {
    if (!isOpen) return;

    setIsGenerating(true);
    QRCode.toDataURL(verificationUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#004f36', // VyaparTrust Sovereign Dark Green
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
        setIsGenerating(false);
      });
  }, [isOpen, verificationUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `VyaparTrust_QR_${passportUid}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#bccac0]/30 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#bccac0]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[20px] font-extrabold text-[#131b2e] tracking-tight">
                  Underwriter Verification QR
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#85f8c4] text-[#002114] border border-[#68dba9]">
                  Instant Scan
                </span>
              </div>
              <p className="text-[12px] text-[#6d7a72] mt-0.5">
                Encodes a tamper-evident credential URL for bank loan officers and NBFC underwriters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d7a72] hover:text-[#131b2e] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Security Scope Selector (DPDP Act 2023) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a72]">
            Data Scope Encoded in QR Code
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/20">
            <button
              onClick={() => setSecurityLevel('full')}
              className={`py-2 px-3 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                securityLevel === 'full'
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Full Underwriting Dossier</span>
            </button>
            <button
              onClick={() => setSecurityLevel('zkp')}
              className={`py-2 px-3 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                securityLevel === 'zkp'
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>ZKP Anonymized Pass</span>
            </button>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-gradient-to-br from-[#f2f3ff] via-[#f5fff7] to-white border border-[#bccac0]/30 shadow-xs">
          {/* QR Code Container */}
          <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-[#bccac0]/40 flex flex-col items-center justify-center shrink-0">
            {isGenerating ? (
              <div className="w-48 h-48 flex flex-col items-center justify-center text-[#6d7a72] gap-2">
                <span className="material-symbols-outlined animate-spin text-[32px] text-[#006948]">sync</span>
                <span className="text-[12px] font-medium">Generating QR...</span>
              </div>
            ) : (
              qrDataUrl && (
                <div className="relative group">
                  <img
                    src={qrDataUrl}
                    alt="Underwriter Verification QR Code"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                  {/* Sovereign Shield Badge in Center of QR */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-md border border-[#85f8c4] flex items-center justify-center">
                      <VyaparLogo size="sm" showText={false} />
                    </div>
                  </div>
                </div>
              )
            )}
            <span className="font-mono text-[10px] text-[#006948] font-bold mt-2">
              SEAL: SHA256-7F8C92A1
            </span>
          </div>

          {/* QR Metadata & Highlights */}
          <div className="flex flex-col gap-2.5 text-left w-full">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a72]">
                Target Enterprise
              </span>
              <h4 className="text-[16px] font-bold text-[#131b2e]">
                {merchant?.storeName || 'Ramesh General Store'}
              </h4>
              <p className="text-[12px] text-[#3d4a42]">
                Proprietor: {merchant?.ownerName || 'Ramesh Kumar'} • Udaipur
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#bccac0]/30 text-[11px] flex flex-col gap-1 shadow-2xs">
              <div className="flex justify-between">
                <span className="text-[#6d7a72]">Passport ID:</span>
                <span className="font-mono font-bold text-[#131b2e]">{passportUid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6d7a72]">Vyapar Score:</span>
                <span className="font-bold text-[#006948]">
                  {merchant?.healthScore || 78}/100 ({merchant?.riskGrade || 'Grade A-'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6d7a72]">Underwriter Band:</span>
                <span className="font-bold text-[#131b2e]">₹50,000 – ₹1,00,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6d7a72]">Validation Protocol:</span>
                <span className="font-bold text-[#006948]">RBI Account Aggregator</span>
              </div>
            </div>

            {/* Quick Action Buttons for QR */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleDownloadQrPng}
                className="flex-1 py-2 px-3 rounded-lg bg-white border border-[#bccac0] text-[#131b2e] text-[12px] font-semibold hover:bg-[#f2f3ff] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006948]">image</span>
                <span>Save QR Image</span>
              </button>
              <button
                onClick={() => setShowUnderwriterPreview(!showUnderwriterPreview)}
                className="flex-1 py-2 px-3 rounded-lg bg-[#e2e7ff] text-[#006948] text-[12px] font-bold hover:bg-[#dae2fd] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>{showUnderwriterPreview ? 'Hide Preview' : 'Test Underwriter View'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Encoded URL & Copy Row */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a72]">
            Encoded Cryptographic Verification URL
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/30">
            <span className="material-symbols-outlined text-[18px] text-[#006948] ml-1 shrink-0">link</span>
            <input
              type="text"
              readOnly
              value={verificationUrl}
              className="bg-transparent text-[11px] font-mono text-[#131b2e] w-full focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`py-1.5 px-3 rounded-lg text-[12px] font-bold transition-all shrink-0 cursor-pointer ${
                copied
                  ? 'bg-[#006948] text-white'
                  : 'bg-white text-[#131b2e] border border-[#bccac0] hover:bg-gray-50'
              }`}
            >
              {copied ? 'Copied Link!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Underwriter Instant Verification Live Preview Drawer */}
        {showUnderwriterPreview && (
          <div className="p-5 rounded-2xl bg-[#0c2a21] text-white shadow-lg border border-[#85f8c4]/30 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">verified_user</span>
                <span className="text-[13px] font-bold text-white">
                  Underwriter Portal View (What Bank Officers See)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#85f8c4] text-[#002114]">
                AUTHENTICATED CREDENTIAL
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-gray-300 block text-[9px] uppercase">Vyapar Health Score</span>
                <span className="text-[20px] font-extrabold text-[#85f8c4] block">78 / 100</span>
                <span className="text-gray-300 text-[10px]">Grade A- (Low Risk)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-gray-300 block text-[9px] uppercase">Pre-Approved Band</span>
                <span className="text-[16px] font-extrabold text-white block">₹50K – ₹1.0L</span>
                <span className="text-gray-300 text-[10px]">Safe EMI: ₹6.5K/mo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-gray-300 block text-[9px] uppercase">Cashflow Regularity</span>
                <span className="text-[16px] font-extrabold text-[#85f8c4] block">94.2%</span>
                <span className="text-gray-300 text-[10px]">248 UPI syncs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-gray-300 block text-[9px] uppercase">Mandate Bounces</span>
                <span className="text-[16px] font-extrabold text-white block">0 Bounces</span>
                <span className="text-[#85f8c4] text-[10px]">Clean track record</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10 text-[11px]">
              <div className="text-gray-300">
                ZKP Hash: <span className="font-mono text-white">SHA256:7f8c92a104b2c89d51e7</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Underwriting Decision Simulation: Pre-approved loan offer of ₹75,000 at 1.15%/mo issued for ${merchant?.storeName || 'Ramesh General Store'}.`)}
                  className="px-3 py-1.5 rounded-lg bg-[#85f8c4] text-[#002114] font-bold text-[11px] hover:bg-white transition-colors cursor-pointer"
                >
                  Approve ₹75,000 Working Capital
                </button>
                {onOpenVerificationPortal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVerificationPortal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Full Verification Portal</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Export Full Document Options */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#bccac0]/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a72]">
            Complete Passport Export Formats
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                onClose();
                onExecuteDownload('pdf');
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#bccac0] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">picture_as_pdf</span>
                <div className="text-left">
                  <span className="text-[13px] font-bold text-[#131b2e] block">Official PDF Report</span>
                  <span className="text-[10px] text-[#6d7a72]">Includes embedded QR</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#6d7a72] text-[16px]">chevron_right</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onExecuteDownload('csv');
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#bccac0] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#00855d] text-[20px]">table_view</span>
                <div className="text-left">
                  <span className="text-[13px] font-bold text-[#131b2e] block">Transaction Ledger (CSV)</span>
                  <span className="text-[10px] text-[#6d7a72]">Spreadsheet analysis</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#6d7a72] text-[16px]">chevron_right</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onExecuteDownload('json');
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#bccac0] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#006948] text-[20px]">data_object</span>
                <div className="text-left">
                  <span className="text-[13px] font-bold text-[#131b2e] block">JSON Audit Artifact</span>
                  <span className="text-[10px] text-[#6d7a72]">Cryptographic proof</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#6d7a72] text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#6d7a72] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#006948]">security</span>
            DPDP Act 2023 & RBI Account Aggregator Compliant
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 text-[#131b2e] font-semibold text-[13px] hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
