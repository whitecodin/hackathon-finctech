import React, { useState } from 'react';
import { NavPath, Merchant } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SavingsGoalTracker } from '../components/SavingsGoalTracker.tsx';
import { downloadPassportPdf, downloadExcelCsv, downloadJsonAudit } from '../lib/exportUtils.ts';

interface BusinessResilienceViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath) => void;
  onTriggerDownload: () => void;
}

export const BusinessResilienceView: React.FC<BusinessResilienceViewProps> = ({
  merchant,
  onNavigate,
  onTriggerDownload,
}) => {
  const { t, language } = useLanguage();
  // Simulator parameters
  const [salesShock, setSalesShock] = useState<number>(0); // -40% to +40%
  const [supplierTermsDays, setSupplierTermsDays] = useState<number>(30); // 15 to 60 days
  const [emergencyExpense, setEmergencyExpense] = useState<number>(0); // ₹0 to ₹1,00,000
  const [showDownloadMenu, setShowDownloadMenu] = useState<boolean>(false);

  // Base metrics
  const baseRunwayDays = merchant?.resilienceDays || 42;
  const baseMonthlyInflow = merchant?.monthlyInflow || 482000;
  const baseDailyBurn = merchant?.dailyBurn || 9800;
  const baseLiquidReserves = 142800;

  // Dynamic simulation calculations
  const adjustedInflow = Math.round(baseMonthlyInflow * (1 + salesShock / 100));
  const creditTermFactor = (supplierTermsDays - 30) * 850; // extra days of supplier credit buys working capital
  const simulatedReserves = Math.max(0, baseLiquidReserves + creditTermFactor - emergencyExpense);
  const adjustedDailyBurn = baseDailyBurn;
  const simulatedRunwayDays = Math.max(
    3,
    Math.round(simulatedReserves / Math.max(adjustedDailyBurn, 1000))
  );

  const currentStressParams = {
    simulatedRunwayDays,
    simulatedReserves,
    salesShock,
    supplierTermsDays,
    emergencyExpense,
    dailyBurn: adjustedDailyBurn,
  };

  const runwayStatus =
    simulatedRunwayDays >= 45
      ? { label: 'Optimal Buffer', color: 'text-[#006948]', bg: 'bg-[#85f8c4]', border: 'border-[#68dba9]' }
      : simulatedRunwayDays >= 25
      ? { label: 'Moderate Runway', color: 'text-[#904d00]', bg: 'bg-[#ffdcbe]', border: 'border-[#ffb77b]' }
      : { label: 'Critical Liquidity Alert', color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]', border: 'border-[#ff897d]' };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Breadcrumb Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e2e7ff] text-[#006948] border border-[#bccac0]/30">
              MSME Liquidity Stress Testing
            </span>
            <span className="text-[12px] text-[#6d7a72]">• RBI Working Capital Norms</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#131b2e] tracking-tight">
            Business Resilience & Working Capital Engine
          </h1>
          <p className="text-[14px] text-[#3d4a42]">
            Simulate seasonal revenue shocks, supplier payment terms, and inventory turnover to protect your kirana runway.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative">
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#bccac0] text-[#131b2e] text-[13px] font-semibold hover:bg-[#f2f3ff] transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#006948]">file_download</span>
              <span>Download Stress Report</span>
              <span className="material-symbols-outlined text-[16px] text-[#6d7a72]">expand_more</span>
            </button>

            {/* Download Options Menu */}
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-[#bccac0]/40 p-2 z-30 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowDownloadMenu(false);
                    downloadPassportPdf(merchant, currentStressParams);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#f2f3ff] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">picture_as_pdf</span>
                  <div>
                    <span className="text-[12px] font-bold text-[#131b2e] block">Official Report (PDF)</span>
                    <span className="text-[10px] text-[#6d7a72]">Includes active simulation results</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowDownloadMenu(false);
                    downloadExcelCsv(merchant, currentStressParams);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#f2f3ff] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#00855d] text-[20px]">table_view</span>
                  <div>
                    <span className="text-[12px] font-bold text-[#131b2e] block">Spreadsheet Ledger (CSV)</span>
                    <span className="text-[10px] text-[#6d7a72]">Excel & Sheets compatible (UTF-8)</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowDownloadMenu(false);
                    downloadJsonAudit(merchant, currentStressParams);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#f2f3ff] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#006948] text-[20px]">data_object</span>
                  <div>
                    <span className="text-[12px] font-bold text-[#131b2e] block">Audit Artifact (JSON)</span>
                    <span className="text-[10px] text-[#6d7a72]">Cryptographic proof & vectors</span>
                  </div>
                </button>

                <div className="h-px bg-gray-100 my-1" />

                <button
                  onClick={() => {
                    setShowDownloadMenu(false);
                    onTriggerDownload();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 text-left text-[11px] font-semibold text-[#006948]"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>Open Full Verification Modal</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('ai-financial-coach')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#006948] text-white text-[13px] font-semibold hover:bg-[#00855d] transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            Ask AI Coach
          </button>
        </div>
      </div>

      {/* Hero Metric Cards (3 Bento Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Runway Days */}
        <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#6d7a72]">
                Simulated Working Runway
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${runwayStatus.bg} ${runwayStatus.color} ${runwayStatus.border}`}>
                {runwayStatus.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-[44px] font-extrabold text-[#131b2e] tracking-tight">
                {simulatedRunwayDays}
              </span>
              <span className="text-[16px] font-semibold text-[#6d7a72]">days</span>
              <span className={`text-[12px] font-bold ml-2 ${simulatedRunwayDays >= baseRunwayDays ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>
                {simulatedRunwayDays >= baseRunwayDays ? `+${simulatedRunwayDays - baseRunwayDays}d` : `${simulatedRunwayDays - baseRunwayDays}d`} vs baseline
              </span>
            </div>
            <p className="text-[12px] text-[#3d4a42] leading-relaxed">
              Based on daily operating expenditure of ₹{adjustedDailyBurn.toLocaleString('en-IN')}/day for Ramesh General Store.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#bccac0]/20 flex items-center justify-between text-[11px] text-[#6d7a72]">
            <span>Baseline: 42 Days</span>
            <span className="text-[#006948] font-bold">Safe Minimum: 30 Days</span>
          </div>
        </div>

        {/* Card 2: Liquid Cash Reserves */}
        <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#6d7a72]">
                Available Liquid Reserves
              </span>
              <span className="material-symbols-outlined text-[#006948] text-[20px]">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-[40px] font-extrabold text-[#131b2e] tracking-tight">
                ₹{simulatedReserves.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[12px] text-[#3d4a42] leading-relaxed">
              State Bank of India Current A/C (••4891) + Verified DigiLocker UPI sweep deposits.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#bccac0]/20 flex items-center justify-between text-[11px]">
            <span className="text-[#6d7a72]">Buffer Ratio</span>
            <span className="font-bold text-[#131b2e]">
              {(simulatedReserves / Math.max(1, baseMonthlyInflow) * 100).toFixed(1)}% of Monthly Turnover
            </span>
          </div>
        </div>

        {/* Card 3: Pre-Approved NBFC Working Capital Credit Line */}
        <div className="bg-gradient-to-br from-[#006948] to-[#004f36] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#85f8c4]">
                Instant NBFC Credit Line
              </span>
              <span className="material-symbols-outlined text-[#85f8c4] text-[20px]">verified</span>
            </div>
            <span className="text-[36px] font-extrabold text-white tracking-tight block my-2">
              ₹3,50,000
            </span>
            <p className="text-[12px] text-[#d0e8d9] leading-relaxed">
              Pre-approved based on your 78/100 Vyapar Score and verified UPI daily cashflow regularity.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <div className="text-[11px] text-[#85f8c4]">
              Rate: <span className="font-bold text-white">1.15% / month</span> (No collateral)
            </div>
            <button
              onClick={() => onNavigate('credit-readiness')}
              className="px-3 py-1.5 rounded-lg bg-white text-[#006948] text-[12px] font-bold hover:bg-[#85f8c4] transition-colors cursor-pointer"
            >
              Activate Line
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Savings Goal Tracker Component with Circular Progress Bars */}
      <SavingsGoalTracker merchant={merchant} dailyBurn={adjustedDailyBurn} />

      {/* Main Content: Interactive Stress Testing Matrix (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Stress Controls (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/20">
            <div>
              <h2 className="text-[18px] font-bold text-[#131b2e]">
                Interactive Stress Testing Simulator
              </h2>
              <p className="text-[12px] text-[#6d7a72]">
                Adjust macroeconomic factors to evaluate your Kirana liquidity boundary
              </p>
            </div>
            <button
              onClick={() => {
                setSalesShock(0);
                setSupplierTermsDays(30);
                setEmergencyExpense(0);
              }}
              className="text-[12px] font-bold text-[#006948] hover:underline cursor-pointer"
            >
              Reset to Base
            </button>
          </div>

          {/* Slider 1: Sales Drop / Growth */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#f2f3ff]/60 border border-[#bccac0]/20">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006948]">trending_down</span>
                Monthly Revenue Shock / Surge
              </label>
              <span className={`text-[14px] font-extrabold ${salesShock >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>
                {salesShock > 0 ? `+${salesShock}%` : `${salesShock}%`} (₹{adjustedInflow.toLocaleString('en-IN')})
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="5"
              value={salesShock}
              onChange={(e) => setSalesShock(Number(e.target.value))}
              className="w-full accent-[#006948] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#6d7a72]">
              <span>-40% (Severe off-season slump)</span>
              <span>0% Baseline</span>
              <span>+40% (Festive Diwali surge)</span>
            </div>
          </div>

          {/* Slider 2: Supplier Payment Credit Terms */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#f2f3ff]/60 border border-[#bccac0]/20">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006948]">credit_card_clock</span>
                Supplier Credit Payment Terms
              </label>
              <span className="text-[14px] font-extrabold text-[#006948]">
                {supplierTermsDays} Days
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={supplierTermsDays}
              onChange={(e) => setSupplierTermsDays(Number(e.target.value))}
              className="w-full accent-[#006948] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#6d7a72]">
              <span>15 Days (Tight cash upfront)</span>
              <span>30 Days (Current HDFC terms)</span>
              <span>60 Days (Extended wholesale terms)</span>
            </div>
          </div>

          {/* Slider 3: Contingency / Emergency Outflow */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#f2f3ff]/60 border border-[#bccac0]/20">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">warning</span>
                Emergency Outflow Contingency
              </label>
              <span className="text-[14px] font-extrabold text-[#ba1a1a]">
                ₹{emergencyExpense.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="10000"
              value={emergencyExpense}
              onChange={(e) => setEmergencyExpense(Number(e.target.value))}
              className="w-full accent-[#ba1a1a] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#6d7a72]">
              <span>₹0 (Normal Operations)</span>
              <span>₹50,000 (Equipment/Repair)</span>
              <span>₹1,00,000 (Major Medical / Renovation)</span>
            </div>
          </div>

          {/* Scenario Recommendations Box */}
          <div className="p-4 rounded-xl bg-[#f5fff7] border border-[#85f8c4] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#006948] text-[22px] shrink-0 mt-0.5">psychology</span>
            <div className="flex flex-col text-[12px] text-[#002114]">
              <span className="font-bold text-[13px] text-[#006948]">AI Underwriting Advice for This Scenario</span>
              <p className="mt-1 leading-relaxed">
                {simulatedRunwayDays < 30 ? (
                  <>
                    Warning: Your runway drops to <strong className="text-[#ba1a1a]">{simulatedRunwayDays} days</strong>. We advise renegotiating Radhe Shyam Wholesale invoice schedules from 15 to 30 days and securing a ₹1.5L standby overdraft line to prevent payment defaults.
                  </>
                ) : (
                  <>
                    Healthy liquidity buffer confirmed! Ramesh General Store retains a robust <strong className="text-[#006948]">{simulatedRunwayDays}-day runway</strong>. Your cashflow regularity allows you to purchase fast-moving FMCG inventory in bulk for a 4.2% vendor discount.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Working Capital Cycle & Seasonal Analysis (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Working Capital Cycle Analysis */}
          <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col gap-4">
            <h3 className="text-[16px] font-bold text-[#131b2e] flex items-center justify-between">
              <span>Cash Conversion Cycle (CCC)</span>
              <span className="text-[12px] font-bold text-[#006948] px-2 py-0.5 rounded-full bg-[#85f8c4]/40">
                18.4 Days (Healthy)
              </span>
            </h3>

            <div className="flex flex-col gap-3">
              {/* Days Sales Outstanding */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f2f3ff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006948] text-[18px]">qr_code_scanner</span>
                  <span className="text-[13px] font-semibold text-[#131b2e]">Customer Collection (DSO)</span>
                </div>
                <div className="text-right">
                  <span className="text-[14px] font-bold text-[#131b2e]">1.2 Days</span>
                  <span className="text-[10px] text-[#006948] block">94% Instant UPI QR</span>
                </div>
              </div>

              {/* Days Inventory Outstanding */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f2f3ff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">inventory_2</span>
                  <span className="text-[13px] font-semibold text-[#131b2e]">Inventory Turnover (DIO)</span>
                </div>
                <div className="text-right">
                  <span className="text-[14px] font-bold text-[#131b2e]">24.8 Days</span>
                  <span className="text-[10px] text-[#6d7a72] block">Fast Grocery Rotation</span>
                </div>
              </div>

              {/* Days Payables Outstanding */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f2f3ff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">payments</span>
                  <span className="text-[13px] font-semibold text-[#131b2e]">Wholesale Payables (DPO)</span>
                </div>
                <div className="text-right">
                  <span className="text-[14px] font-bold text-[#131b2e]">{supplierTermsDays} Days</span>
                  <span className="text-[10px] text-[#006948] block">Credit Terms Active</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#6d7a72] leading-relaxed pt-2 border-t border-[#bccac0]/20">
              *Kirana Formula: CCC = DIO (24.8) + DSO (1.2) - DPO ({supplierTermsDays}) = {(26 - supplierTermsDays).toFixed(1)} Days.
            </p>
          </div>

          {/* Seasonal Kirana Shock Calendar */}
          <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-[#131b2e] flex items-center justify-between">
              <span>Festival & Seasonal Readiness</span>
              <span className="material-symbols-outlined text-[#006948] text-[20px]">calendar_month</span>
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded-lg bg-[#f5fff7] border border-[#85f8c4]/60 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold text-[#002114] block">Holi Festival Cycle (March)</span>
                  <span className="text-[11px] text-[#006948]">Expected Surge: +35% FMCG / Colors / Sweets</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#006948] text-white">
                  Prepared
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#fff8f2] border border-[#ffdcbe] flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold text-[#2f1500] block">Summer Off-Peak (May - June)</span>
                  <span className="text-[11px] text-[#904d00]">Expected Slump: -12% Footfall (Heatwave)</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ffdcbe] text-[#2f1500]">
                  Reserve Buffer
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#bccac0]/20 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold text-[#131b2e] block">Diwali Grand Season (Oct - Nov)</span>
                  <span className="text-[11px] text-[#3d4a42]">Expected Surge: +65% Dry Fruits / Gift Hampers</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#006948]">
                  Max Credit Line
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
