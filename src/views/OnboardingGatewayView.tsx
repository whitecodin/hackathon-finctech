import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { NavPath, Merchant } from '../types.ts';

interface OnboardingGatewayViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath, initialQuery?: string) => void;
  onPassportCreated: () => void;
}

export const OnboardingGatewayView: React.FC<OnboardingGatewayViewProps> = ({
  merchant,
  onNavigate,
  onPassportCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [consents, setConsents] = useState<{
    health: boolean;
    credit: boolean;
    fraud: boolean;
  }>({
    health: true,
    credit: true,
    fraud: true,
  });
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilationProgress, setCompilationProgress] = useState<number>(33);
  const [statusText, setStatusText] = useState<string>('Validating 248 bank & UPI settlements via DigiLocker & RBI AA...');
  const [completedPassport, setCompletedPassport] = useState<boolean>(false);

  const activeConsentsCount = Object.values(consents).filter(Boolean).length;

  const handleCreatePassport = () => {
    setIsCompiling(true);
    setCompilationProgress(35);
    setStatusText('Validating 248 bank & UPI settlements via DigiLocker & RBI AA Gateway...');

    setTimeout(() => {
      setCompilationProgress(70);
      setStatusText('Analyzing 90-day cash-flow regularity & supplier settlements...');
    }, 1000);

    setTimeout(() => {
      setCompilationProgress(95);
      setStatusText('Computing illustrative borrowing capacity (₹75k–₹1.2L) & sealing SHA-256 hash...');
    }, 2000);

    setTimeout(() => {
      setIsCompiling(false);
      setCompletedPassport(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#006948', '#85f8c4', '#86f2e4', '#ffdcc3'],
      });
      onPassportCreated();
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Banner & Stepper Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[12px] font-bold text-[#006948] mb-1 uppercase tracking-wider">
            <span>Onboarding Gateway</span>
            <span>•</span>
            <span className="text-[#3d4a42] font-semibold">Create My Financial Passport</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">
            Establish Your Sovereign Credit Identity
          </h1>
          <p className="text-[14px] text-[#3d4a42] mt-0.5">
            Consented, explainable financial underwriting tailored for Indian MSMEs & Kirana merchants.
          </p>
        </div>

        {/* Live Step Indicators */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#f2f3ff] shadow-xs border border-[#bccac0]/20">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-[#3d4a42] hover:text-[#131b2e]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#006948] text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Identity</span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-[#3d4a42] hover:text-[#131b2e]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep >= 2 ? 'bg-[#006948] text-white' : 'bg-[#e2e7ff] text-[#3d4a42]'
            }`}>
              2
            </span>
            <span>Data Bridge</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-white text-[#006948] shadow-xs'
                : 'text-[#3d4a42] hover:text-[#131b2e]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 3 ? 'bg-[#006948] text-white' : 'bg-[#e2e7ff] text-[#3d4a42]'
            }`}>
              3
            </span>
            <span>Granular Consent</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="w-full bg-[#f2f3ff] rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-[#006948] h-full transition-all duration-500 rounded-full"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        ></div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* STEP 1: Verify Store Identity */}
          {currentStep === 1 && (
            <section className="bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-4">
              <div className="flex items-start justify-between border-b pb-3 border-[#eaedff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#006948]">
                    <span className="material-symbols-outlined text-[24px]">store</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold text-[#131b2e]">Verify Your Store Identity</h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#85f8c4] text-[#002114] font-bold">
                        <span className="material-symbols-outlined text-[13px]">verified</span> Pre-Verified
                      </span>
                    </div>
                    <p className="text-[13px] text-[#3d4a42]">
                      Authoritative registry verification via Ministry of MSME Udyam Database
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#f2f3ff] text-[11px] font-semibold text-[#3d4a42]">
                  Step 1 of 3
                </span>
              </div>

              {/* Merchant Card Preview */}
              <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shadow-xs shrink-0 bg-[#e2e7ff]">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiTbhKIoQ1h6_L2QLWs_EUjSJ20Eumg5TUP_gq_Zox_53eH5-EAZnerxZRuzUXI1zLno20j4OLdEcpWZN4qYNuWlgq2GPltwqqBo5vOO7ZUoR8uLJIH2VNi3QmmWwE9uTeZkgJHb733hogReHDaVybPcKWNNeo3JJMQINRDvArmn6zdEYCdCZAlkM3ezWt_Diy8NNuE6znL-BooXLSddA5E7clrZtlV_8k6tsa_dm5XwbE24zJvSun9Q"
                      alt="Ramesh Kumar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-bold text-[#131b2e]">
                      {merchant?.storeName || 'Ramesh General Store'}
                    </span>
                    <span className="text-[13px] text-[#3d4a42]">
                      Proprietor: {merchant?.ownerName || 'Ramesh Kumar'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#006948] mt-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">verified_user</span>
                      <span>Pre-verified via Udyam Registration (Rajasthan Regional Directorate)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#131b2e]">Registered Business Trade Name</label>
                  <div className="flex items-center px-4 py-2.5 rounded-lg bg-white border border-[#bccac0]/30 shadow-xs text-[#131b2e] text-[14px]">
                    <span className="material-symbols-outlined text-[#6d7a72] text-[18px] mr-2">storefront</span>
                    <input
                      type="text"
                      readOnly
                      value={merchant?.storeName || 'Ramesh General Store'}
                      className="w-full bg-transparent outline-none cursor-default font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#131b2e]">Primary Operator / Authorized Signatory</label>
                  <div className="flex items-center px-4 py-2.5 rounded-lg bg-white border border-[#bccac0]/30 shadow-xs text-[#131b2e] text-[14px]">
                    <span className="material-symbols-outlined text-[#6d7a72] text-[18px] mr-2">person</span>
                    <input
                      type="text"
                      readOnly
                      value={merchant?.ownerName || 'Ramesh Kumar'}
                      className="w-full bg-transparent outline-none cursor-default font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#131b2e]">Trade Classification & Sector</label>
                  <div className="flex items-center px-4 py-2.5 rounded-lg bg-white border border-[#bccac0]/30 shadow-xs text-[#131b2e] text-[14px]">
                    <span className="material-symbols-outlined text-[#6d7a72] text-[18px] mr-2">category</span>
                    <input
                      type="text"
                      readOnly
                      value={merchant?.category || 'Grocery & Daily Essentials (Kirana)'}
                      className="w-full bg-transparent outline-none cursor-default font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#131b2e]">Operating Location & PIN</label>
                  <div className="flex items-center px-4 py-2.5 rounded-lg bg-white border border-[#bccac0]/30 shadow-xs text-[#131b2e] text-[14px]">
                    <span className="material-symbols-outlined text-[#6d7a72] text-[18px] mr-2">location_on</span>
                    <input
                      type="text"
                      readOnly
                      value={`${merchant?.location || 'Jaipur, Rajasthan'} • PIN ${merchant?.pinCode || '302001'}`}
                      className="w-full bg-transparent outline-none cursor-default font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Registration Pills */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="flex-1 p-3 rounded-lg bg-[#f2f3ff] flex items-center justify-between border border-[#bccac0]/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006a61] text-[20px]">badge</span>
                    <div>
                      <p className="text-[10px] text-[#3d4a42] uppercase font-bold">GSTIN / Tax ID</p>
                      <p className="text-[13px] text-[#131b2e] font-mono font-bold">{merchant?.gstin || '08AAACR4092K1Z9'}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#006948] text-[18px]">check_circle</span>
                </div>

                <div className="flex-1 p-3 rounded-lg bg-[#f2f3ff] flex items-center justify-between border border-[#bccac0]/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006a61] text-[20px]">assignment_turned_in</span>
                    <div>
                      <p className="text-[10px] text-[#3d4a42] uppercase font-bold">MSME Udyam ID</p>
                      <p className="text-[13px] text-[#131b2e] font-mono font-bold">{merchant?.udyamId || 'UDYAM-RJ-14-002819'}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#006948] text-[18px]">check_circle</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#eaedff]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#6d7a72]">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Cryptographically sealed under IT Act 2000 § 43A</span>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-lg bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-[14px] shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Data Connection</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </section>
          )}

          {/* STEP 2: Build Your Financial Passport */}
          {currentStep === 2 && (
            <section className="bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-4">
              <div className="flex items-start justify-between border-b pb-3 border-[#eaedff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#86f2e4]/30 flex items-center justify-center text-[#006a61]">
                    <span className="material-symbols-outlined text-[24px]">hub</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold text-[#131b2e]">Build Your Financial Passport</h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#ffdcc3] text-[#2f1500] font-bold">
                        <span className="material-symbols-outlined text-[13px]">science</span> RBI AA Sandbox
                      </span>
                    </div>
                    <p className="text-[13px] text-[#3d4a42]">
                      Automated telemetry capture across QR settlements and current account transactions.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#f2f3ff] text-[11px] font-semibold text-[#3d4a42]">
                  Step 2 of 3
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#f2f3ff] flex items-start gap-4">
                <span className="material-symbols-outlined text-[#006948] text-[22px] shrink-0 mt-0.5">info</span>
                <p className="text-[13px] text-[#131b2e]">
                  VyaparTrust uses consented financial activity across UPI QR settlements and current accounts to generate your explainable financial health profile. No unconsented storage; encrypted in transit.
                </p>
              </div>

              {/* Connection Card */}
              <div className="p-4 rounded-xl bg-[#f2f3ff] shadow-xs border border-[#bccac0]/20 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[#006948] text-[22px]">account_balance</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#131b2e]">Business Financial Data (Account Aggregator Bridge)</h3>
                      <p className="text-[13px] text-[#3d4a42]">State Bank of India • Current A/c •••• 4092</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold shrink-0">
                    <span className="material-symbols-outlined text-[14px]">cloud_done</span> Ready to Ingest
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-lg bg-white flex items-start gap-2 border border-[#bccac0]/20">
                    <span className="material-symbols-outlined text-[#006948] text-[18px] shrink-0 mt-0.5">task_alt</span>
                    <div>
                      <p className="text-[12px] text-[#131b2e] font-bold">90-Day Ledgers</p>
                      <p className="text-[11px] text-[#3d4a42]">248 verified transactions</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white flex items-start gap-2 border border-[#bccac0]/20">
                    <span className="material-symbols-outlined text-[#006948] text-[18px] shrink-0 mt-0.5">task_alt</span>
                    <div>
                      <p className="text-[12px] text-[#131b2e] font-bold">Cash-Flow Velocity</p>
                      <p className="text-[11px] text-[#3d4a42]">Daily inward patterns</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white flex items-start gap-2 border border-[#bccac0]/20">
                    <span className="material-symbols-outlined text-[#006948] text-[18px] shrink-0 mt-0.5">task_alt</span>
                    <div>
                      <p className="text-[12px] text-[#131b2e] font-bold">UPI Settlement Rail</p>
                      <p className="text-[11px] text-[#3d4a42]">PayTM & BharatPe QRs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Progress Bar */}
              <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col gap-2 border border-[#bccac0]/20">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#131b2e] font-bold">Telemetry Data Coverage Ratio</span>
                  <span className="text-[#006948] font-bold">94.2% Complete</span>
                </div>
                <div className="w-full bg-[#dae2fd] rounded-full h-2.5 flex overflow-hidden">
                  <div className="bg-[#006948] h-full" style={{ width: '58%' }} title="UPI Settlements"></div>
                  <div className="bg-[#006a61] h-full" style={{ width: '26%' }} title="Current Account"></div>
                  <div className="bg-[#b15f00] h-full" style={{ width: '10%' }} title="GST Turnover"></div>
                  <div className="bg-[#bccac0] h-full" style={{ width: '6%' }} title="Unmatched Cash"></div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#3d4a42] pt-1">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span> UPI Settlements (58%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span> Current Account (26%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#b15f00]"></span> GST E-Way Invoices (10%)</div>
                </div>
              </div>

              {/* Hackathon Callout */}
              <div className="p-4 rounded-xl bg-[#ffdcc3]/60 text-[#2f1500] flex items-center gap-3 border border-[#ffb77d]">
                <span className="material-symbols-outlined text-[#8d4b00] text-[24px] shrink-0">build_circle</span>
                <div className="flex flex-col text-[11px]">
                  <span className="font-bold">Hackathon Demo — Synthetic Data Pre-Loaded</span>
                  <span>No live banking credentials or OTP required. Synthetic merchant dataset pre-calibrated for Jaipur micro-retail testing.</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#eaedff]">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-lg text-[#3d4a42] hover:text-[#131b2e] font-semibold text-[13px] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Back to Details</span>
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-lg bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-[14px] shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue with Consented Feeds</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </section>
          )}

          {/* STEP 3: Granular Consent & Permissions */}
          {currentStep === 3 && (
            <section className="bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-4">
              <div className="flex items-start justify-between border-b pb-3 border-[#eaedff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#006948]">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold text-[#131b2e]">Your Data. Your Choice.</h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#85f8c4] text-[#002114] font-bold">
                        <span className="material-symbols-outlined text-[13px]">gavel</span> DPDP Act 2023 Compliant
                      </span>
                    </div>
                    <p className="text-[13px] text-[#3d4a42]">
                      VyaparTrust is built on sovereign data principles. All consent is granular, revocable anytime, and time-bound.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#f2f3ff] text-[11px] font-semibold text-[#3d4a42]">
                  Step 3 of 3
                </span>
              </div>

              {/* Consent Toggles */}
              <div className="flex flex-col gap-3">
                {/* Toggle 1 */}
                <div className="p-4 rounded-xl bg-[#f2f3ff] flex items-center justify-between gap-4 border border-[#bccac0]/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#006948] shrink-0 mt-0.5 shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">insights</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-[#131b2e]">Financial Health Analysis</h3>
                        <span className="text-[10px] px-2 py-0.2 bg-[#e2e7ff] rounded text-[#3d4a42] font-semibold">Core Indicator</span>
                      </div>
                      <p className="text-[12px] text-[#3d4a42] mt-0.5">
                        Analyzes inflow regularity, operating margins, and liquid reserves to generate your 1–100 health score.
                      </p>
                      <span className="text-[10px] text-[#006948] font-semibold mt-1">Expiry: 180 days • Revocable with 1-click in Profile Settings</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={consents.health}
                      onChange={(e) => setConsents((prev) => ({ ...prev, health: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
                  </label>
                </div>

                {/* Toggle 2 */}
                <div className="p-4 rounded-xl bg-[#f2f3ff] flex items-center justify-between gap-4 border border-[#bccac0]/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#006a61] shrink-0 mt-0.5 shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-[#131b2e]">Credit Readiness Insights</h3>
                        <span className="text-[10px] px-2 py-0.2 bg-[#86f2e4]/40 text-[#006f66] rounded font-semibold">Zero-Lender Exposure</span>
                      </div>
                      <p className="text-[12px] text-[#3d4a42] mt-0.5">
                        Calculates illustrative borrowing capacity (₹50k–₹1L) and safe EMI benchmarks without sharing data with banks.
                      </p>
                      <span className="text-[10px] text-[#006948] font-semibold mt-1">Simulated advisory only • Zero CIBIL inquiry footprint</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={consents.credit}
                      onChange={(e) => setConsents((prev) => ({ ...prev, credit: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
                  </label>
                </div>

                {/* Toggle 3 */}
                <div className="p-4 rounded-xl bg-[#f2f3ff] flex items-center justify-between gap-4 border border-[#bccac0]/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#8d4b00] shrink-0 mt-0.5 shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-[#131b2e]">Transaction Risk Analysis</h3>
                        <span className="text-[10px] px-2 py-0.2 bg-[#ffdcc3] text-[#2f1500] rounded font-semibold">Fraud Guard</span>
                      </div>
                      <p className="text-[12px] text-[#3d4a42] mt-0.5">
                        Monitors unusual debit patterns and sudden vendor outflow spikes for store security and resilience.
                      </p>
                      <span className="text-[10px] text-[#006948] font-semibold mt-1">Self-monitoring notifications directly to merchant WhatsApp</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={consents.fraud}
                      onChange={(e) => setConsents((prev) => ({ ...prev, fraud: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#f2f3ff] flex items-center gap-2 text-[11px] text-[#3d4a42]">
                <span className="material-symbols-outlined text-[#006a61] text-[18px]">verified</span>
                <span><strong>Notice:</strong> VyaparTrust is an analytics platform, not a lender. Does not guarantee credit approval. Consent is governed under the RBI Account Aggregator Master Directions.</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#eaedff]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-lg text-[#3d4a42] hover:text-[#131b2e] font-semibold text-[13px] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Back</span>
                </button>
                <button
                  onClick={handleCreatePassport}
                  disabled={isCompiling}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#006948] hover:bg-[#00855d] text-white font-bold text-[15px] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  <span>{isCompiling ? 'Synthesizing Passports...' : 'Create My Financial Passport'}</span>
                </button>
              </div>
            </section>
          )}

          {/* Compilation Feedback Card */}
          {isCompiling && (
            <div className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center justify-center gap-4 text-center border border-[#006948]/20 animate-in fade-in">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="animate-spin w-16 h-16 text-[#006948]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"></path>
                </svg>
                <span className="material-symbols-outlined text-[#006948] text-[24px] absolute">assured_workload</span>
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-[18px] font-bold text-[#131b2e]">Compiling Financial Passport...</h3>
                <p className="text-[13px] text-[#3d4a42]">{statusText}</p>
              </div>
              <div className="w-full max-w-sm bg-[#eaedff] rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="bg-[#006948] h-full transition-all duration-700"
                  style={{ width: `${compilationProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {completedPassport && (
            <div className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center justify-center gap-4 text-center border border-[#006948]/30 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-[#85f8c4] text-[#002114] flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-[#006948]">verified</span>
              </div>
              <h3 className="text-[20px] font-bold text-[#131b2e]">Financial Passport Generated!</h3>
              <p className="text-[14px] text-[#3d4a42] max-w-md">
                {merchant?.storeName || 'Ramesh General Store'}'s sovereign passport is sealed. Score: <strong className="text-[#006948] font-bold">82/100 (Grade A)</strong>. Ready for collateral-free MSME credit programs.
              </p>
              <button
                onClick={() => onNavigate('financial-passport')}
                className="px-6 py-2.5 rounded-lg bg-[#006948] text-white font-semibold text-[14px] shadow-md hover:bg-[#00855d] transition-colors cursor-pointer"
              >
                View Full Passport Dossier →
              </button>
            </div>
          )}
        </div>

        {/* Right Summary Column (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse"></span>
                <span className="text-[11px] uppercase tracking-wider text-[#006948] font-bold">
                  Passport Preview
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#3d4a42] font-semibold">
                Live Draft
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#e2e7ff] overflow-hidden shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtKXtJQ5vm6V7cRNVcq7SpFRGAtJEjZizLUT1B_7UtjPUsakCp6zMyZM-vTxGfBFYU-o1jzez2_vVY6cTzQ3I3MMfd0TBC3YGwE3feJVYtT4-Ad6JaOJaISAa_enaF2_At8LZPVk10roklwIM8L1rRE0R0eHuC3qsQx3vo5vIjtMdTeupnWRnsI9qPFXKNc14Jbg_hy-qZdHjDfwkv4mgZdWp6CLgeyPyEDj8NaOay_aTDo7lix75bCQ"
                  alt="Shop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-bold text-[#131b2e] leading-tight">
                  {merchant?.storeName || 'Ramesh General Store'}
                </h4>
                <span className="text-[11px] text-[#3d4a42]">Jaipur (302001) • MSME Tier 3</span>
                <span className="text-[11px] text-[#006948] font-semibold mt-0.5">
                  GST: {merchant?.gstin || '08AAACR4092K1Z9'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col gap-1 border border-[#bccac0]/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#3d4a42] font-semibold">Estimated Vyapar Score</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#85f8c4] text-[#002114] font-bold">
                  Grade A • High Stability
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[36px] font-bold text-[#006948] tabular-nums">82</span>
                <span className="text-[16px] text-[#3d4a42] font-semibold">/ 100</span>
              </div>
              <p className="text-[11px] text-[#3d4a42]">
                Based on 90-day steady inflow velocity (₹1,48,200 avg/mo) across 248 daily QR scans.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-[#eaedff] text-[12px]">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#3d4a42]">Consented Banking Period</span>
                <span className="font-semibold text-[#131b2e]">Nov 2025 – Jan 2026</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#3d4a42]">Monthly Inflow Vol</span>
                <span className="font-semibold text-[#131b2e] tabular-nums">₹1,48,200 / mo</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#3d4a42]">Illustrative Safe Capacity</span>
                <span className="font-bold text-[#006948] tabular-nums">₹75,000 – ₹1,20,000</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#3d4a42]">Active Permissions</span>
                <span className="font-bold text-[#006948]">{activeConsentsCount} of 3 Approved</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#f2f3ff] flex items-start gap-2.5 border border-[#bccac0]/20">
              <span className="material-symbols-outlined text-[#006a61] text-[20px] shrink-0 mt-0.5">lock_clock</span>
              <div className="flex flex-col text-[11px] text-[#3d4a42]">
                <span className="font-bold text-[#131b2e]">Self-Sovereign Data Storage</span>
                <span>You retain full sovereignty. No credit bureau ping. You can wipe your financial passport at any second.</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f2f3ff] flex items-center justify-between gap-3 shadow-xs border border-[#bccac0]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#006948] shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#131b2e] block leading-tight">Need assistance in Hindi?</span>
                <span className="text-[11px] text-[#3d4a42]">बोल कर सहायता प्राप्त करें</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('ai-financial-coach', 'नमस्ते! क्या आप मुझे पासवर्ड बनाने में मदद कर सकते हैं?')}
              className="px-3.5 py-1.5 rounded-lg bg-white text-[#006948] text-[12px] font-bold shadow-xs hover:bg-[#e2e7ff] transition-colors cursor-pointer"
            >
              सुनिए
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
