import React, { useState, useEffect } from 'react';
import { NavPath, Merchant } from '../types.ts';
import { DebtRepaymentTrendChart } from '../components/DebtRepaymentTrendChart.tsx';
import { VyaparLogo } from '../components/VyaparLogo.tsx';

interface UnderwriterVerificationViewProps {
  passportUid: string;
  onNavigate: (path: NavPath) => void;
  merchant: Merchant | null;
}

export const UnderwriterVerificationView: React.FC<UnderwriterVerificationViewProps> = ({
  passportUid,
  onNavigate,
  merchant,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/passport/verify/${passportUid}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [passportUid]);

  return (
    <div className="min-h-screen bg-[#f0f4f1] text-[#131b2e] flex flex-col items-center py-8 px-4 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        {/* Verification Top Nav */}
        <div className="flex items-center justify-between pb-4 border-b border-[#bccac0]/40">
          <VyaparLogo
            size="lg"
            theme="light"
            subtitle="Sovereign MSME Underwriter Verification Protocol"
          />

          <button
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-[#bccac0] text-[#131b2e] text-[12px] font-bold hover:bg-[#f2f3ff] transition-colors cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#006948]">arrow_back</span>
            Back to Merchant Portal
          </button>
        </div>

        {decisionFeedback && (
          <div className="p-4 rounded-2xl bg-[#85f8c4]/30 border border-[#68dba9] text-[#002114] text-[13px] font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] text-[20px]">check_circle</span>
              <span>{decisionFeedback}</span>
            </div>
            <button onClick={() => setDecisionFeedback(null)} className="text-[11px] underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Verification Status Banner */}
        <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#85f8c4]/40 border border-[#68dba9] flex items-center justify-center text-[#006948] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[32px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#85f8c4] text-[#002114] border border-[#68dba9]">
                  ACTIVE & VALIDATED
                </span>
                <span className="text-[11px] font-mono text-[#6d7a72]">
                  UID: {passportUid || 'VY-IND-2026-004821'}
                </span>
              </div>
              <h1 className="text-[22px] font-extrabold text-[#131b2e] tracking-tight mt-1">
                Authentic MSME Credit Credential
              </h1>
              <p className="text-[13px] text-[#3d4a42]">
                Cryptographically anchored to RBI Account Aggregator (SBI Current A/C) & Ministry of MSME Udyam Gateway.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#bccac0]/20">
            <span className="text-[10px] uppercase font-bold text-[#6d7a72] block">Verified Timestamp</span>
            <span className="text-[12px] font-bold text-[#131b2e]">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Live Sync
            </span>
            <span className="text-[10px] text-[#006948] font-bold block mt-0.5">Zero Bureau Hard Pulls</span>
          </div>
        </div>

        {/* Bento Grid: Underwriter Assessment (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Credit & Cashflow Scores (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            {/* Health Score & Recommended Limits Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/20">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#6d7a72]">
                  Pre-Underwriting Assessment
                </span>
                <span className="text-[11px] font-bold text-[#006948] bg-[#f5fff7] px-2.5 py-0.5 rounded-full border border-[#85f8c4]">
                  Low Default Probability (&lt;1.8%)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#bccac0]/20">
                  <span className="text-[10px] uppercase font-bold text-[#6d7a72] block">Vyapar Score</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[36px] font-black text-[#006948]">
                      {data?.underwritingMetrics?.vyaparScore || merchant?.healthScore || 78}
                    </span>
                    <span className="text-[14px] font-bold text-[#6d7a72]">/ 100</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#006948] block mt-0.5">
                    {data?.underwritingMetrics?.riskGrade || merchant?.riskGrade || 'Grade A-'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#bccac0]/20">
                  <span className="text-[10px] uppercase font-bold text-[#6d7a72] block">Safe Credit Band</span>
                  <div className="text-[24px] font-black text-[#131b2e] mt-1">
                    ₹50K – ₹1.0L
                  </div>
                  <span className="text-[11px] font-bold text-[#3d4a42] block mt-1">
                    Safe EMI: ₹6,500 – ₹8,200/mo
                  </span>
                </div>
              </div>

              {/* Banking & UPI Telemetry Rows */}
              <div className="flex flex-col gap-2.5 text-[12px]">
                <div className="flex justify-between p-2.5 rounded-xl bg-[#f7f9f6]">
                  <span className="text-[#6d7a72]">90-Day Cashflow Regularity:</span>
                  <span className="font-bold text-[#006948]">94.2% daily active inflows</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-[#f7f9f6]">
                  <span className="text-[#6d7a72]">Monthly Turnover (Inflows):</span>
                  <span className="font-bold text-[#131b2e]">₹1,60,000 / month</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-[#f7f9f6]">
                  <span className="text-[#6d7a72]">NACH / Mandate Bounces:</span>
                  <span className="font-bold text-[#006948]">Zero (0) in past 180 days</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-[#f7f9f6]">
                  <span className="text-[#6d7a72]">Working Capital Reserve Runway:</span>
                  <span className="font-bold text-[#131b2e]">
                    {data?.underwritingMetrics?.liquidReserveRunwayDays || 18} Days
                  </span>
                </div>
              </div>
            </div>

            {/* Underwriter Quick Decision Bar */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#006948] to-[#004f36] text-white shadow-md flex flex-col gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#85f8c4]">
                  Instant Digital Decisioning
                </span>
                <h3 className="text-[18px] font-bold text-white mt-0.5">
                  Pre-Approved Loan Disbursement Station
                </h3>
                <p className="text-[12px] text-[#d0e8d9] mt-1">
                  Issue working capital term sheets or pre-approve unsecured kirana credit with 1-click underwriter verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() =>
                    setDecisionFeedback(
                      `Approved! Working Capital Credit Offer of ₹75,000 sent to Ramesh General Store via Account Aggregator mandate.`
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-[#85f8c4] text-[#002114] font-bold text-[13px] hover:bg-white transition-colors cursor-pointer shadow-sm text-center"
                >
                  Approve ₹75,000 Line
                </button>
                <button
                  onClick={() =>
                    setDecisionFeedback(
                      `Term Sheet generated with 1.15% monthly interest rate. Exported to loan origination system.`
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[13px] transition-colors cursor-pointer text-center"
                >
                  Generate Term Sheet
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Merchant Identity & Cryptographic Audit Proof (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {/* Merchant Identity Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
              <h3 className="text-[16px] font-bold text-[#131b2e] pb-2 border-b border-[#bccac0]/20">
                Verified Enterprise Identity
              </h3>

              <div className="flex flex-col gap-2.5 text-[12px]">
                <div>
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-bold">Store Name</span>
                  <span className="text-[15px] font-bold text-[#131b2e]">
                    {data?.merchant?.storeName || merchant?.storeName || 'Ramesh General Store'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-bold">Proprietor Name</span>
                  <span className="font-semibold text-[#131b2e]">
                    {data?.merchant?.ownerName || merchant?.ownerName || 'Ramesh Kumar'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-bold">GSTIN Registration</span>
                  <span className="font-mono font-bold text-[#006948]">
                    {data?.merchant?.gstin || merchant?.gstin || '08AAACR4092K1Z9'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-bold">Udyam MSME Certificate</span>
                  <span className="font-mono text-[#131b2e]">
                    {data?.merchant?.udyamId || merchant?.udyamId || 'UDYAM-RJ-14-002819'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-bold">Geo-Location Match</span>
                  <span className="text-[#3d4a42]">
                    Johari Bazaar, Udaipur, Rajasthan (PIN 313001)
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof & ZKP Seal */}
            <div className="p-6 rounded-3xl bg-white border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
              <h3 className="text-[16px] font-bold text-[#131b2e] pb-2 border-b border-[#bccac0]/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006948] text-[20px]">security</span>
                Cryptographic Audit Proof
              </h3>

              <div className="flex flex-col gap-2.5 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-[#f2f3ff] break-all">
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-sans font-bold">SHA-256 ZKP Hash:</span>
                  <span className="text-[#006948] font-bold">
                    {data?.cryptographicSeal || 'SHA256:7f8c92a104b2c89d51e709a3c4819df5'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#f2f3ff]">
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-sans font-bold">AA Consent Artifact:</span>
                  <span className="text-[#131b2e] font-bold">
                    {data?.consentArtifactId || 'AA-SBI-VT-8819283-ENC'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#f2f3ff]">
                  <span className="text-[#6d7a72] block text-[10px] uppercase font-sans font-bold">Regulatory Framework:</span>
                  <span className="text-[#131b2e] font-sans font-medium">
                    DPDP Act 2023 & RBI Master Direction for NBFC-AA
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data || merchant, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Underwriter_Dossier_${passportUid}.json`;
                  a.click();
                }}
                className="w-full py-2.5 rounded-xl border border-[#bccac0] text-[#131b2e] text-[12px] font-bold hover:bg-[#f2f3ff] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006948]">file_download</span>
                Download Raw Underwriter Audit JSON
              </button>
            </div>
          </div>
        </div>

        {/* 12-Month Debt Repayment & Credit Utilization Trends (Recharts) */}
        <DebtRepaymentTrendChart storeName={merchant?.storeName} />
      </div>
    </div>
  );
};
