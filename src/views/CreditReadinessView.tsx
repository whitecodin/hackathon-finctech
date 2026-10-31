import React, { useState } from 'react';
import { NavPath, Merchant } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CreditReadinessViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath, initialQuery?: string) => void;
  onTriggerDownload: () => void;
}

export const CreditReadinessView: React.FC<CreditReadinessViewProps> = ({
  merchant,
  onNavigate,
  onTriggerDownload,
}) => {
  const { t, language } = useLanguage();
  const [loanAmount, setLoanAmount] = useState<number>(75000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
  });

  // 6-Month ML Forecast Data
  const forecastData = [
    { month: language === 'hi' ? 'वर्तमान' : language === 'bn' ? 'বর্তমান' : 'Current', limit: 100000, label: '₹1.00L', color: '#006948', growth: 'Base' },
    { month: language === 'hi' ? 'माह १' : language === 'bn' ? 'মাস ১' : 'Month 1', limit: 115000, label: '₹1.15L', color: '#00855d', growth: '+15%' },
    { month: language === 'hi' ? 'माह २' : language === 'bn' ? 'মাস ২' : 'Month 2', limit: 128000, label: '₹1.28L', color: '#00855d', growth: '+28%' },
    { month: language === 'hi' ? 'माह ३' : language === 'bn' ? 'মাস ৩' : 'Month 3', limit: 145000, label: '₹1.45L', color: '#00a374', growth: '+45%' },
    { month: language === 'hi' ? 'माह ४' : language === 'bn' ? 'মাস ৪' : 'Month 4', limit: 160000, label: '₹1.60L', color: '#00a374', growth: '+60%' },
    { month: language === 'hi' ? 'माह ५' : language === 'bn' ? 'মাস ५' : 'Month 5', limit: 182000, label: '₹1.82L', color: '#00c18b', growth: '+82%' },
    { month: language === 'hi' ? 'माह ६' : language === 'bn' ? 'মাস ৬' : 'Month 6', limit: 210000, label: '₹2.10L', color: '#85f8c4', growth: '+110%' },
  ];

  // Calculate EMI based on 16.5% APR
  const annualRate = 0.165;
  const monthlyRate = annualRate / 12;
  const calculatedEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  const getEmiRiskBadge = (emi: number) => {
    if (emi <= 8200) {
      return {
        label: 'Comfortable',
        badgeClass: 'bg-[#85f8c4] text-[#002114]',
        icon: 'check_circle',
      };
    } else if (emi <= 10500) {
      return {
        label: 'Stretched',
        badgeClass: 'bg-[#ffdcc3] text-[#2f1500]',
        icon: 'warning',
      };
    } else {
      return {
        label: 'High Risk',
        badgeClass: 'bg-[#ffdad6] text-[#93000a]',
        icon: 'error',
      };
    }
  };

  const emiStatus = getEmiRiskBadge(calculatedEmi);
  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header Context Block */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#89f5e7] text-[#00201d] text-[11px] font-bold shadow-xs">
            <span className="material-symbols-outlined text-[15px]">insights</span>
            <span>Pre-Underwriting Intelligence • MSME Pulse</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">
            Know where you stand before applying for credit.
          </h1>
          <p className="text-[16px] text-[#3d4a42]">
            Understand your borrowing readiness, evaluate your debt capacity, and eliminate loan application guesswork.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTriggerDownload}
            className="px-4 py-2.5 rounded-lg bg-white text-[#131b2e] font-semibold text-[14px] shadow-xs border border-[#bccac0]/30 hover:bg-[#eaedff] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">sim_card_download</span>
            <span>Export Readiness Report</span>
          </button>
          <button
            onClick={() => {
              alert('Refreshing continuous telemetry against Account Aggregator & UPI QR feeds...');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#006948] text-white font-semibold text-[14px] shadow-md hover:bg-[#00855d] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Refresh Insights</span>
          </button>
        </div>
      </div>

      {/* Hero Assessment Bento Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Big Score / Capacity Gauge Panel (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#85f8c4]/20 blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#85f8c4] text-[#002114] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">speed</span>
                </span>
                <div>
                  <span className="text-[11px] text-[#3d4a42] uppercase tracking-wider block font-semibold">
                    Assessment Tier
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold text-[#131b2e]">Moderate to Good</span>
                    <div className="flex items-center text-[#8d4b00]">
                      <span className="material-symbols-outlined text-[18px]">star</span>
                      <span className="material-symbols-outlined text-[18px]">star</span>
                      <span className="material-symbols-outlined text-[18px]">star</span>
                      <span className="material-symbols-outlined text-[18px]">star</span>
                      <span className="material-symbols-outlined text-[18px] text-[#bccac0]">star</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Illustrative estimate based on synthetic demo transaction data</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2 items-center">
              <div>
                <span className="text-[12px] text-[#3d4a42] font-semibold">
                  Illustrative Credit Readiness Band
                </span>
                <div className="text-[36px] font-bold text-[#006948] tracking-tight mt-1 tabular-nums">
                  ₹50,000 <span className="text-[#3d4a42] text-[18px] font-normal">–</span> ₹1,00,000
                </div>
                <p className="text-[13px] text-[#3d4a42] mt-2">
                  Prudently determined using 90-day cash turnover velocity, recurring vendor debits, and seasonality resilience.
                </p>
              </div>

              <div className="bg-[#f2f3ff] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#3d4a42] font-semibold">Safe Monthly EMI Capacity</span>
                  <span className="material-symbols-outlined text-[#006948] text-[18px]">verified_user</span>
                </div>
                <div className="text-[20px] font-bold text-[#131b2e] tabular-nums">
                  ₹6,500 – ₹8,200 <span className="text-[12px] font-normal text-[#3d4a42]">/ month</span>
                </div>
                <div className="w-full bg-[#dae2fd] rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-[#006948] h-full rounded-full transition-all duration-500" style={{ width: '20%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#3d4a42] pt-1">
                  <span>Calculated at comfortable 20% net margin</span>
                  <span className="font-bold text-[#006948]">Sovereign Standard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-[#bccac0]/30">
            <div>
              <span className="text-[11px] text-[#3d4a42]">Avg Daily UPI Volume</span>
              <p className="text-[16px] font-bold text-[#131b2e] tabular-nums">₹14,820</p>
            </div>
            <div>
              <span className="text-[11px] text-[#3d4a42]">Bouncing / Mandate Fails</span>
              <p className="text-[16px] font-bold text-[#006948]">Zero (0)</p>
            </div>
            <div>
              <span className="text-[11px] text-[#3d4a42]">Operating Margins</span>
              <p className="text-[16px] font-bold text-[#131b2e]">19.4%</p>
            </div>
            <div>
              <span className="text-[11px] text-[#3d4a42]">Cashflow Predictability</span>
              <p className="text-[16px] font-bold text-[#006f66]">High</p>
            </div>
          </div>
        </div>

        {/* Merchant Visual / Shop Profile Snapshot (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-[#3d4a42] uppercase tracking-wider font-semibold">
                Merchant Telemetry
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                Verified Feed
              </span>
            </div>
            <div className="relative w-full h-36 rounded-lg overflow-hidden shadow-inner mb-3">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCihb2BsiMq0zqwKFjIha-lBFGalCgXNWh33gYeEDE0CDo3ivCp3VtaFRyKu95PA-B8BdKL65B_FyUoaT1nzePFPoY_P3ZN6cQ777Sf5e_3d5m85OHMes2JH-SnVtBiXtQqXTi3bnwEortoS2hoJM8q1EgcVUu4j8UgmRjfaHlFFxboOzEJjHrfShX-cBfQoUEAEY-9jc2i_MU6LoZk_68pkt1ZROZotnWUiR-eK-9qKWHGKzzoNq2Kag"
                alt="Ramesh General Store Kirana Counter"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-white font-semibold text-[15px]">Ramesh General Store</span>
              </div>
            </div>
            <p className="text-[13px] text-[#3d4a42]">
              Daily active transactions aggregated across BharatPe QR, PhonePe Merchant, and HDFC Current A/C.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#f2f3ff] mt-4 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#3d4a42]">Data Sync Status</span>
              <span className="text-[#006948] font-bold">Continuous (Live)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#131b2e]">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-ping"></span>
              <span>AA Token ID: AA-RJ-9821034-7B</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Machine Learning Projected Credit Limit Module */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-[#bccac0]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#bccac0]/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#e2e7ff] text-[#006948] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">query_stats</span>
            </div>
            <div>
              <h2 className="text-[20px] font-black text-[#131b2e]">
                {t('sixMonthProjectionTitle', '6-Month Machine Learning Projected Credit Limit')}
              </h2>
              <p className="text-[13px] text-[#3d4a42]">
                {t('sixMonthProjectionSubtitle', 'Simulated credit progression based on continuous UPI turnover and vendor discipline')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-extrabold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-ping"></span>
              {t('mlUnderwritingEngine', 'ML Underwriting Engine')}
            </span>
          </div>
        </div>

        {/* Forecast KPI Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/30">
            <span className="text-[11px] text-[#3d4a42] font-semibold">{t('currentApprovedLimit', 'Current Approved Limit')}</span>
            <div className="text-[24px] font-black text-[#131b2e] mt-0.5">₹1,00,000</div>
            <span className="text-[11px] text-[#006948] font-bold">Base Tier (90-Day Proven)</span>
          </div>
          <div className="p-4 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7]">
            <span className="text-[11px] text-[#2e7d32] font-semibold">{t('projectedMonth6Limit', 'Projected Month-6 Limit')}</span>
            <div className="text-[24px] font-black text-[#1b5e20] mt-0.5">₹2,10,000</div>
            <span className="text-[11px] text-[#2e7d32] font-bold">+110% Borrowing Expansion</span>
          </div>
          <div className="p-4 rounded-xl bg-[#fff8e1] border border-[#ffe082]">
            <span className="text-[11px] text-[#f57f17] font-semibold">{t('safeEmiRange', 'Safe Monthly EMI Range')}</span>
            <div className="text-[24px] font-black text-[#e65100] mt-0.5">₹6,500 – ₹12,800</div>
            <span className="text-[11px] text-[#f57f17] font-bold">Zero Default Safety Corridor</span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-2">
          <div className="flex items-end justify-between gap-2 h-56 px-2 pt-6 pb-2 bg-[#f7f9f6] rounded-2xl border border-[#bccac0]/30">
            {forecastData.map((item, idx) => {
              const heightPercent = Math.round((item.limit / 210000) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#131b2e] text-white text-[11px] py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap z-10 font-bold">
                    {item.label} ({item.growth})
                  </div>

                  <span className="text-[11px] font-bold text-[#131b2e] mb-1.5 tabular-nums">
                    {item.label}
                  </span>

                  <div
                    className="w-full max-w-[48px] rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-xs"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: idx === 0 ? '#006948' : idx === forecastData.length - 1 ? '#00855d' : '#00a374',
                    }}
                  ></div>

                  <span className="text-[11px] font-bold text-[#3d4a42] mt-2 truncate w-full text-center">
                    {item.month}
                  </span>
                  <span className="text-[9px] font-extrabold text-[#006948]">
                    {item.growth}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Core Underwriting Vector Analysis Grid */}
      <div className="bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-[18px] font-bold text-[#131b2e]">Core Underwriting Vector Analysis</h2>
            <p className="text-[14px] text-[#3d4a42]">Five algorithmic pillars used by formal lenders to benchmark creditworthiness.</p>
          </div>
          <span className="text-[11px] text-[#6d7a72] font-semibold">Weight Normalized Against NBFC Frameworks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-1">
          {/* Vector 1 */}
          <div className="bg-[#f2f3ff] rounded-xl p-4 flex flex-col justify-between hover:bg-[#eaedff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-lg bg-[#85f8c4] text-[#002114]">
                  <span className="material-symbols-outlined text-[18px]">water_drop</span>
                </span>
                <span className="text-[22px] font-bold text-[#006948]">82%</span>
              </div>
              <p className="text-[15px] font-semibold text-[#131b2e]">Cash Flow Stability</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#85f8c4]/60 text-[#002114]">
                Excellent
              </span>
              <p className="text-[11px] text-[#3d4a42] mt-2">Consistent weekly inflow pacing with minimal dry periods.</p>
            </div>
            <div className="w-full bg-[#dae2fd] rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-[#006948] h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>

          {/* Vector 2 */}
          <div className="bg-[#f2f3ff] rounded-xl p-4 flex flex-col justify-between hover:bg-[#eaedff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-lg bg-[#89f5e7] text-[#00201d]">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </span>
                <span className="text-[22px] font-bold text-[#006a61]">74%</span>
              </div>
              <p className="text-[15px] font-semibold text-[#131b2e]">Repayment Capacity</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#89f5e7]/60 text-[#00201d]">
                Good
              </span>
              <p className="text-[11px] text-[#3d4a42] mt-2">Healthy buffer above existing operational overheads.</p>
            </div>
            <div className="w-full bg-[#dae2fd] rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-[#006a61] h-full rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>

          {/* Vector 3 */}
          <div className="bg-[#f2f3ff] rounded-xl p-4 flex flex-col justify-between hover:bg-[#eaedff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-lg bg-[#85f8c4] text-[#002114]">
                  <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                </span>
                <span className="text-[22px] font-bold text-[#006948]">85%</span>
              </div>
              <p className="text-[15px] font-semibold text-[#131b2e]">Business Activity</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#85f8c4]/60 text-[#002114]">
                High
              </span>
              <p className="text-[11px] text-[#3d4a42] mt-2">High-frequency retail daily touchpoints across 6 days/week.</p>
            </div>
            <div className="w-full bg-[#dae2fd] rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-[#006948] h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Vector 4 */}
          <div className="bg-[#f2f3ff] rounded-xl p-4 flex flex-col justify-between hover:bg-[#eaedff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-lg bg-[#ffdcc3] text-[#2f1500]">
                  <span className="material-symbols-outlined text-[18px]">savings</span>
                </span>
                <span className="text-[22px] font-bold text-[#8d4b00]">62%</span>
              </div>
              <p className="text-[15px] font-semibold text-[#131b2e]">Liquidity Buffer</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdcc3] text-[#6e3900]">
                Moderate
              </span>
              <p className="text-[11px] text-[#3d4a42] mt-2">Target maintaining 30 days of reserves against unexpected gaps.</p>
            </div>
            <div className="w-full bg-[#dae2fd] rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-[#8d4b00] h-full rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>

          {/* Vector 5 */}
          <div className="bg-[#f2f3ff] rounded-xl p-4 flex flex-col justify-between hover:bg-[#eaedff] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-lg bg-[#85f8c4] text-[#002114]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
                <span className="text-[22px] font-bold text-[#006948]">90%</span>
              </div>
              <p className="text-[15px] font-semibold text-[#131b2e]">Data Coverage</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#85f8c4]/60 text-[#002114]">
                90-Day Full
              </span>
              <p className="text-[11px] text-[#3d4a42] mt-2">Unbroken digital ledger authenticated via Account Aggregator.</p>
            </div>
            <div className="w-full bg-[#dae2fd] rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-[#006948] h-full rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Comparison Panels: Strengths vs Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths Panel */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-full bg-[#85f8c4] text-[#002114]">
                  <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                </span>
                <div>
                  <h2 className="text-[16px] font-bold text-[#131b2e]">Strengths Supporting Your Credit Profile</h2>
                  <p className="text-[11px] text-[#3d4a42]">Verified positives positively impacting loan officer algorithms</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                3 Positive Signals
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[#f2f3ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#006948] text-[20px] mt-0.5 shrink-0">check_circle</span>
                <div>
                  <span className="text-[15px] font-semibold text-[#131b2e] block">Daily UPI sales provide transparent cash trail</span>
                  <p className="text-[13px] text-[#3d4a42] mt-0.5">
                    Over 1,280 recorded micro-payments establish solid business viability without requiring audited ledger balance sheets.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#006948] font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +14 pts on Activity Vector
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#f2f3ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#006948] text-[20px] mt-0.5 shrink-0">check_circle</span>
                <div>
                  <span className="text-[15px] font-semibold text-[#131b2e] block">No returned cheques or failed auto-debits in 90 days</span>
                  <p className="text-[13px] text-[#3d4a42] mt-0.5">
                    0 NACH bounce incidents recorded. Your banking ledger exhibits strict discipline across all existing supplier debits.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#006948] font-bold">
                    <span className="material-symbols-outlined text-[14px]">shield</span> High Trust Anchor
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#f2f3ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#006948] text-[20px] mt-0.5 shrink-0">check_circle</span>
                <div>
                  <span className="text-[15px] font-semibold text-[#131b2e] block">Positive working capital cycle (average 12-day inventory turnover)</span>
                  <p className="text-[13px] text-[#3d4a42] mt-0.5">
                    Inventory clears quickly into liquid receipts, keeping unpaid creditor accounts safely under threshold.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#006948] font-bold">
                    <span className="material-symbols-outlined text-[14px]">autorenew</span> Efficient Cycle
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#bccac0]/30 text-[11px] text-[#3d4a42] flex items-center justify-between">
            <span>Verified by Account Aggregator Protocol</span>
            <span className="text-[#006948] font-bold">RBI Regulated Rails</span>
          </div>
        </div>

        {/* Improvement Opportunities Panel */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-full bg-[#ffdcc3] text-[#2f1500]">
                  <span className="material-symbols-outlined text-[20px]">upgrade</span>
                </span>
                <div>
                  <h2 className="text-[16px] font-bold text-[#131b2e]">Improvement Opportunities Before You Apply</h2>
                  <p className="text-[11px] text-[#3d4a42]">Recommended operational steps to unlock higher credit approvals</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold">
                3 Focus Areas
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[#f2f3ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8d4b00] text-[20px] mt-0.5 shrink-0">hourglass_top</span>
                <div>
                  <span className="text-[15px] font-semibold text-[#131b2e] block">Keep an average minimum daily balance of ₹35,000</span>
                  <p className="text-[13px] text-[#3d4a42] mt-0.5">
                    Current month-end dips below ₹18,000 trigger automated liquidity warnings on prime NBFC underwriting engines.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#8d4b00] font-bold">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> Unlocks ₹1.25L+ Bracket
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#f2f3ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8d4b00] text-[20px] mt-0.5 shrink-0">flag</span>
                <div>
                  <span className="text-[15px] font-semibold text-[#131b2e] block">Resolve 2 pending transaction flags to maximize safety metrics</span>
                  <p className="text-[13px] text-[#3d4a42] mt-0.5">
                    Two outward UPI settlements remain unmatched with tax invoices. Reconcile in the Transaction Safety tab.
                  </p>
                  <button
                    onClick={() => onNavigate('transaction-safety')}
                    className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#8d4b00] font-bold hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">priority_high</span> 2 Flags Pending Action →
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#f2f3ff] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8d4b00] text-[20px] mt-0.5 shrink-0">receipt_long</span>
                <div>
                  <span className="text-[15px] font-semibold text-[#131b2e] block">Upload GSTIN returns (optional) to unlock higher estimated brackets</span>
                  <p className="text-[13px] text-[#3d4a42] mt-0.5">
                    Adding GSTR-3B filings can increase synthetic eligibility estimates by up to 40% on formal banking terms.
                  </p>
                  <div className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#006a61] font-bold">
                    <span className="material-symbols-outlined text-[14px]">bolt</span> Quick Impact Boost
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#bccac0]/30 flex items-center justify-between">
            <span className="text-[11px] text-[#3d4a42]">Projected Impact on Readout</span>
            <span className="text-[11px] font-bold text-[#8d4b00]">+18% Borrowing Power</span>
          </div>
        </div>
      </div>

      {/* Interactive Milestone Checklist & Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Milestone Checklist (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#131b2e]">Your Next Steps Checklist</h2>
              <p className="text-[14px] text-[#3d4a42]">Recommended roadmap prior to approaching banking or NBFC desks.</p>
            </div>
            <span className="text-[11px] text-[#006948] font-bold bg-[#85f8c4] px-3 py-1 rounded-full">
              {completedChecklistCount} of 5 Complete
            </span>
          </div>

          <div className="space-y-3">
            {/* Item 1 */}
            <div 
              onClick={() => setChecklist(prev => ({ ...prev, 1: !prev[1] }))}
              className="p-3 rounded-lg bg-[#f2f3ff] flex items-center justify-between group cursor-pointer hover:bg-[#eaedff] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[22px] ${checklist[1] ? 'text-[#006948]' : 'text-[#6d7a72]'}`}>
                  {checklist[1] ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <div>
                  <p className={`text-[15px] font-semibold text-[#131b2e] ${checklist[1] ? 'line-through text-opacity-70' : ''}`}>
                    Connect primary bank account via Account Aggregator
                  </p>
                  <span className="text-[11px] text-[#3d4a42]">State Bank of India • Auto-synced 90 days telemetry</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${checklist[1] ? 'bg-[#85f8c4] text-[#002114]' : 'bg-[#e2e7ff] text-[#3d4a42]'}`}>
                {checklist[1] ? 'Completed' : 'Pending'}
              </span>
            </div>

            {/* Item 2 */}
            <div 
              onClick={() => setChecklist(prev => ({ ...prev, 2: !prev[2] }))}
              className="p-3 rounded-lg bg-[#f2f3ff] flex items-center justify-between group cursor-pointer hover:bg-[#eaedff] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[22px] ${checklist[2] ? 'text-[#006948]' : 'text-[#6d7a72]'}`}>
                  {checklist[2] ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <div>
                  <p className={`text-[15px] font-semibold text-[#131b2e] ${checklist[2] ? 'line-through text-opacity-70' : ''}`}>
                    Verify 90-day UPI QR merchant statement
                  </p>
                  <span className="text-[11px] text-[#3d4a42]">PhonePe QR & BharatPe combined receipts verified</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${checklist[2] ? 'bg-[#85f8c4] text-[#002114]' : 'bg-[#e2e7ff] text-[#3d4a42]'}`}>
                {checklist[2] ? 'Completed' : 'Pending'}
              </span>
            </div>

            {/* Item 3 */}
            <div className="p-3 rounded-lg bg-[#f2f3ff] border-l-4 border-[#b15f00] flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#8d4b00] text-[22px]">pending</span>
                <div>
                  <p className="text-[15px] font-semibold text-[#131b2e]">Verify pending supplier payment of ₹48,900</p>
                  <span className="text-[11px] text-[#3d4a42]">Match transaction with supplier invoice in Transaction Safety tab</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('transaction-safety')}
                className="px-3 py-1 rounded bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold hover:bg-[#8d4b00] hover:text-white transition-colors cursor-pointer"
              >
                Resolve Now
              </button>
            </div>

            {/* Item 4 */}
            <div 
              onClick={() => setChecklist(prev => ({ ...prev, 4: !prev[4] }))}
              className="p-3 rounded-lg bg-[#f2f3ff] flex items-center justify-between group cursor-pointer hover:bg-[#eaedff] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[22px] ${checklist[4] ? 'text-[#006948]' : 'text-[#6d7a72]'}`}>
                  {checklist[4] ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#131b2e]">Maintain liquid emergency buffer for 30 consecutive days</p>
                  <span className="text-[11px] text-[#3d4a42]">14 days completed. Keep daily balance above ₹35,000 threshold</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] bg-[#dae2fd] text-[#3d4a42] font-semibold">16 Days Left</span>
            </div>

            {/* Item 5 */}
            <div className="p-3 rounded-lg bg-[#f2f3ff] flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6d7a72] text-[22px]">radio_button_unchecked</span>
                <div>
                  <p className="text-[15px] font-semibold text-[#131b2e]">Generate updated Financial Passport for lender submission</p>
                  <span className="text-[11px] text-[#3d4a42]">Compile tamper-evident cryptographic shareable link</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('financial-passport')}
                className="px-3 py-1 rounded bg-[#85f8c4] text-[#002114] text-[11px] font-bold hover:bg-[#006948] hover:text-white transition-colors cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Visual Interactive Loan Simulator Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#85f8c4] text-[#002114]">
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                </span>
                <span className="text-[16px] font-bold text-[#131b2e]">Debt Service Simulator</span>
              </div>
              <span className="text-[11px] text-[#3d4a42] font-semibold">Interactive Preview</span>
            </div>
            <p className="text-[13px] text-[#3d4a42] mb-4">
              Adjust loan quantum to test how monthly EMIs align against your safe ₹8,200 threshold.
            </p>

            {/* Dynamic Range Controls */}
            <div className="space-y-4 bg-[#f2f3ff] p-4 rounded-xl">
              <div>
                <div className="flex justify-between items-center text-[12px] mb-1">
                  <span className="text-[#3d4a42] font-semibold">Desired Loan Quantum</span>
                  <span className="font-bold text-[#131b2e] text-[16px] tabular-nums">
                    ₹{loanAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="150000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-[#dae2fd] rounded-lg appearance-none cursor-pointer accent-[#006948]"
                />
                <div className="flex justify-between text-[11px] text-[#6d7a72] mt-1 font-semibold">
                  <span>₹30,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[12px] mb-1">
                  <span className="text-[#3d4a42] font-semibold">Repayment Tenure</span>
                  <span className="font-bold text-[#131b2e] text-[16px]">
                    {tenureMonths} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="3"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full h-2 bg-[#dae2fd] rounded-lg appearance-none cursor-pointer accent-[#006948]"
                />
                <div className="flex justify-between text-[11px] text-[#6d7a72] mt-1 font-semibold">
                  <span>6 mos</span>
                  <span>24 mos</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[11px] text-[#3d4a42] block font-semibold">Estimated Monthly Outflow</span>
                  <span className="text-[20px] text-[#006948] font-bold tabular-nums">
                    ₹{calculatedEmi.toLocaleString('en-IN')} / mo
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${emiStatus.badgeClass}`}>
                  <span className="material-symbols-outlined text-[14px]">{emiStatus.icon}</span>
                  <span>{emiStatus.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#bccac0]/30 flex items-center justify-between">
            <span className="text-[11px] text-[#3d4a42]">Assumed Benchmark APR: 16.5% p.a.</span>
            <button
              onClick={() => onNavigate('ai-financial-coach', `Can my store afford a loan of ₹${loanAmount.toLocaleString('en-IN')} with ₹${calculatedEmi.toLocaleString('en-IN')} EMI?`)}
              className="text-[12px] text-[#006948] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Scenarios with AI</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Non-Lender Disclaimer Advisory Box */}
      <div className="bg-[#f2f3ff] rounded-xl p-6 shadow-xs border border-[#bccac0]/20 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 rounded-full bg-[#dae2fd] text-[#3d4a42] shrink-0">
          <span className="material-symbols-outlined text-[28px]">gavel</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#8d4b00] font-bold">
              Statutory Non-Lender Regulatory Disclosure
            </span>
            <span className="text-[#6d7a72] text-[11px]">•</span>
            <span className="text-[11px] text-[#3d4a42]">RBI Digital Lending Guidelines Compliant</span>
          </div>
          <p className="text-[13px] text-[#3d4a42] leading-relaxed">
            VyaparTrust does not approve, reject, or disburse loans. This profile provides informational insights and does not guarantee loan eligibility. Final decisions are made solely by regulated financial institutions (Banks & NBFCs). All estimates are derived from synthetic demonstration telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};
