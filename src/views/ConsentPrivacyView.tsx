import React, { useState } from 'react';
import { NavPath, Merchant } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ConsentPrivacyViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath) => void;
}

export const ConsentPrivacyView: React.FC<ConsentPrivacyViewProps> = ({
  merchant,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [consents, setConsents] = useState({
    accountAggregator: true,
    gstnInvoices: true,
    udyamIdentity: true,
    anonymizedNbfcSharing: true,
    aiCoachContext: true,
  });

  const [revokedBanner, setRevokedBanner] = useState<string | null>(null);
  const [showWipeModal, setShowWipeModal] = useState<boolean>(false);
  const [showZkpModal, setShowZkpModal] = useState<boolean>(false);

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setRevokedBanner(`Consent settings updated. DPDP Act 2023 audit ledger updated.`);
      setTimeout(() => setRevokedBanner(null), 4000);
      return updated;
    });
  };

  const auditLogs = [
    {
      id: 'AUD-882190',
      timestamp: 'Today, 09:14 AM',
      actor: 'VyaparTrust ML Underwriting',
      purpose: 'Daily UPI cash flow regularity score calculation',
      dataScope: 'SBI Current A/C (••4891) - Inflow credits only',
      zkpStatus: 'Verified (SHA-256)',
    },
    {
      id: 'AUD-881042',
      timestamp: 'Yesterday, 04:30 PM',
      actor: 'Ramesh Kumar (Merchant)',
      purpose: 'Financial Passport shared with NBFC Partner',
      dataScope: 'Zero-Knowledge Vyapar Score & Health Tier only',
      zkpStatus: 'Zero-Knowledge Proof',
    },
    {
      id: 'AUD-879410',
      timestamp: '11 Jan 2026, 11:20 AM',
      actor: 'RBI Account Aggregator (Setu)',
      purpose: '90-Day banking telemetry sync',
      dataScope: '248 Bank & UPI Transactions',
      zkpStatus: 'Consent Artifact #AA-VT-2026-9921',
    },
    {
      id: 'AUD-874102',
      timestamp: '08 Jan 2026, 02:15 PM',
      actor: 'Ministry of MSME Gateway',
      purpose: 'Udyam Registration & Johari Bazaar Geo-tag match',
      dataScope: 'UDYAM-RJ-14-0089124',
      zkpStatus: 'Government API Verified',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Breadcrumb Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#85f8c4] text-[#002114] border border-[#68dba9]">
              DPDP Act 2023 Compliant
            </span>
            <span className="text-[12px] text-[#6d7a72]">• RBI Account Aggregator Framework</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#131b2e] tracking-tight">
            Consent & Sovereign Data Governance
          </h1>
          <p className="text-[14px] text-[#3d4a42]">
            You own your business data. No lender, bureau, or platform can access your financials without active cryptographic consent.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowZkpModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#bccac0] text-[#131b2e] text-[13px] font-semibold hover:bg-[#f2f3ff] transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006948]">shield</span>
            Verify ZKP Proofs
          </button>
          <button
            onClick={() => setShowWipeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ba1a1a] text-white text-[13px] font-semibold hover:bg-[#93000a] transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            Revoke All & Wipe Data
          </button>
        </div>
      </div>

      {revokedBanner && (
        <div className="p-3.5 rounded-xl bg-[#85f8c4]/30 border border-[#68dba9] text-[#002114] text-[13px] font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948]">check_circle</span>
            <span>{revokedBanner}</span>
          </div>
          <button onClick={() => setRevokedBanner(null)} className="text-[12px] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Consent Artifacts (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/20">
            <div>
              <h2 className="text-[18px] font-bold text-[#131b2e]">
                Active Consent Artifacts
              </h2>
              <p className="text-[12px] text-[#6d7a72]">
                Toggle permissions to immediately revoke access for third parties
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#006948] border border-[#bccac0]/20">
              5 Active Consents
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Consent 1: Account Aggregator */}
            <div className="p-4 rounded-xl bg-[#f2f3ff]/60 border border-[#bccac0]/20 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e2e7ff] text-[#006948] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#131b2e]">RBI Account Aggregator (SBI Bank)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#85f8c4] text-[#002114]">One-Time / Revocable</span>
                  </div>
                  <p className="text-[12px] text-[#3d4a42] mt-0.5">
                    Permits reading credit inflows and balance trends for Ramesh General Store (A/C ••4891). Never exposes debit recipients.
                  </p>
                  <span className="text-[10px] text-[#6d7a72] mt-1 block">Consent Artifact: AA-SBI-VT-8819283-ENC</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={consents.accountAggregator}
                  onChange={() => toggleConsent('accountAggregator')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#bccac0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
              </label>
            </div>

            {/* Consent 2: GSTN Portal Returns */}
            <div className="p-4 rounded-xl bg-[#f2f3ff]/60 border border-[#bccac0]/20 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e2e7ff] text-[#006948] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#131b2e]">GST Returns & Invoicing (GSTN)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#85f8c4] text-[#002114]">Verified</span>
                  </div>
                  <p className="text-[12px] text-[#3d4a42] mt-0.5">
                    Verifies GSTIN: 08AAACR4092K1Z9 quarterly turnover declarations to prove tax compliance to NBFC lenders.
                  </p>
                  <span className="text-[10px] text-[#6d7a72] mt-1 block">Consent Artifact: GSTN-API-VAL-90211</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={consents.gstnInvoices}
                  onChange={() => toggleConsent('gstnInvoices')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#bccac0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
              </label>
            </div>

            {/* Consent 3: Ministry of MSME Udyam */}
            <div className="p-4 rounded-xl bg-[#f2f3ff]/60 border border-[#bccac0]/20 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e2e7ff] text-[#006948] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#131b2e]">Ministry of MSME (Udyam Aadhaar)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#85f8c4] text-[#002114]">Verified</span>
                  </div>
                  <p className="text-[12px] text-[#3d4a42] mt-0.5">
                    Confirms enterprise status: Micro Retail Merchant in Jaipur, Rajasthan.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={consents.udyamIdentity}
                  onChange={() => toggleConsent('udyamIdentity')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#bccac0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
              </label>
            </div>

            {/* Consent 4: Anonymized NBFC Sharing */}
            <div className="p-4 rounded-xl bg-[#f2f3ff]/60 border border-[#bccac0]/20 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e2e7ff] text-[#006948] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#131b2e]">Anonymized NBFC Pre-qualification</span>
                  </div>
                  <p className="text-[12px] text-[#3d4a42] mt-0.5">
                    Allows NBFCs to send pre-approved credit lines without knowing your shop name or address until you accept.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={consents.anonymizedNbfcSharing}
                  onChange={() => toggleConsent('anonymizedNbfcSharing')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#bccac0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Sovereign Rights & DPDP Principles (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col gap-4">
            <h3 className="text-[16px] font-bold text-[#131b2e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948]">gavel</span>
              Your Rights Under DPDP Act 2023
            </h3>

            <div className="flex flex-col gap-3 text-[12px]">
              <div className="p-3 rounded-lg bg-[#f5fff7] border border-[#85f8c4]/40">
                <span className="font-bold text-[#002114] block">1. Right to Withdraw Consent</span>
                <p className="text-[#006948] mt-0.5">
                  You can revoke data access at any second. Revocation immediately purges cached analysis across all lender channels.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#bccac0]/20">
                <span className="font-bold text-[#131b2e] block">2. Right to Correction and Erasure</span>
                <p className="text-[#3d4a42] mt-0.5">
                  Request immediate deletion of any flagged transaction notes or unverified financial entries.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#bccac0]/20">
                <span className="font-bold text-[#131b2e] block">3. Zero Bureau Inquiry Penalty</span>
                <p className="text-[#3d4a42] mt-0.5">
                  Checking your Vyapar Score or Financial Passport will never create a hard bureau inquiry or lower your score.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-[#131b2e]">Data Fiduciary Credentials</h3>
            <div className="text-[12px] text-[#3d4a42] flex flex-col gap-1.5">
              <div className="flex justify-between py-1 border-b border-[#bccac0]/20">
                <span className="text-[#6d7a72]">Data Principal:</span>
                <span className="font-bold text-[#131b2e]">Ramesh Kumar</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#bccac0]/20">
                <span className="text-[#6d7a72]">Fiduciary Entity:</span>
                <span className="font-bold text-[#131b2e]">VyaparTrust Protocol Ltd.</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#bccac0]/20">
                <span className="text-[#6d7a72]">Encryption:</span>
                <span className="font-bold text-[#006948]">AES-256-GCM / SHA-256</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6d7a72]">Grievance Officer:</span>
                <span className="font-bold text-[#131b2e]">grievance@vyapartrust.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cryptographic Audit Trail Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/20">
          <div>
            <h2 className="text-[18px] font-bold text-[#131b2e]">
              Cryptographic Data Access Audit Log
            </h2>
            <p className="text-[12px] text-[#6d7a72]">
              Immutable record of every system access and verification event
            </p>
          </div>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `VyaparTrust_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
            }}
            className="text-[12px] font-bold text-[#006948] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Audit JSON
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#f2f3ff] text-[#6d7a72] uppercase font-bold text-[10px]">
              <tr>
                <th className="py-2.5 px-4 rounded-l-lg">Audit ID</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Authorized Actor</th>
                <th className="py-2.5 px-4">Purpose</th>
                <th className="py-2.5 px-4">Scope of Data</th>
                <th className="py-2.5 px-4 rounded-r-lg">ZKP Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bccac0]/20 text-[#3d4a42]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f5fff7]/40">
                  <td className="py-3 px-4 font-mono font-bold text-[#131b2e]">{log.id}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-[#131b2e]">{log.actor}</td>
                  <td className="py-3 px-4">{log.purpose}</td>
                  <td className="py-3 px-4">{log.dataScope}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#85f8c4]/40 text-[#002114] border border-[#68dba9]/40">
                      {log.zkpStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wipe Data Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bccac0]/30 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#131b2e]">
              Confirm Full Sovereign Data Purge
            </h3>
            <p className="text-[13px] text-[#3d4a42] mt-2 leading-relaxed">
              In accordance with Section 12 of the DPDP Act 2023, this will irreversibly revoke all Account Aggregator tokens and wipe your Financial Passport cache from VyaparTrust.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-[#131b2e] font-semibold text-[13px] hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowWipeModal(false);
                  setConsents({
                    accountAggregator: false,
                    gstnInvoices: false,
                    udyamIdentity: false,
                    anonymizedNbfcSharing: false,
                    aiCoachContext: false,
                  });
                  setRevokedBanner('All consents revoked. Financial passport state cleared.');
                }}
                className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white font-semibold text-[13px] hover:bg-[#93000a] cursor-pointer"
              >
                Yes, Purge Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZKP Modal */}
      {showZkpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#bccac0]/30">
            <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948]">verified</span>
                <h3 className="text-[16px] font-bold text-[#131b2e]">Zero-Knowledge Proof Verification</h3>
              </div>
              <button onClick={() => setShowZkpModal(false)} className="text-[#6d7a72] hover:text-[#131b2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="my-4 flex flex-col gap-3 font-mono text-[11px] bg-[#f2f3ff] p-4 rounded-xl border border-[#bccac0]/30 text-[#131b2e]">
              <div>
                <span className="text-[#6d7a72] block">ZKP SNARK Hash:</span>
                <span className="break-all text-[#006948] font-bold">0x7f8a91c2b5e408d81029c7811ef23490bca7821c900eef182390ab1289cf</span>
              </div>
              <div>
                <span className="text-[#6d7a72] block">Claim Proven:</span>
                <span>Merchant net daily inflow &gt; ₹12,000 without revealing individual customer names</span>
              </div>
              <div>
                <span className="text-[#6d7a72] block">Consensus Status:</span>
                <span className="text-[#006948] font-bold">Cryptographically Validated</span>
              </div>
            </div>
            <button
              onClick={() => setShowZkpModal(false)}
              className="w-full py-2.5 rounded-lg bg-[#006948] text-white font-bold text-[13px] cursor-pointer hover:bg-[#00855d]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
