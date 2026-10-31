import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface MonthlyDebtData {
  month: string;
  shortMonth: string;
  onTimeRepaymentRate: number; // in %
  creditUtilization: number;    // in %
  outstandingDebt: number;      // in INR
  creditLimit: number;          // in INR
  emiPaid: number;              // in INR
  events?: string;
  scoreContribution?: string;
  underwriterVerdict?: string;
}

const HISTORICAL_DEBT_DATA: MonthlyDebtData[] = [
  { month: 'February 2025', shortMonth: "Feb '25", onTimeRepaymentRate: 97.5, creditUtilization: 52, outstandingDebt: 52000, creditLimit: 100000, emiPaid: 6500, scoreContribution: '+2.4 Pts', underwriterVerdict: 'Moderate debt load with prompt initial settlement' },
  { month: 'March 2025', shortMonth: "Mar '25", onTimeRepaymentRate: 98.2, creditUtilization: 48, outstandingDebt: 48000, creditLimit: 100000, emiPaid: 6500, events: 'Holi inventory cycle', scoreContribution: '+2.8 Pts', underwriterVerdict: 'Seasonal inventory surge cleared within 14 days' },
  { month: 'April 2025', shortMonth: "Apr '25", onTimeRepaymentRate: 100.0, creditUtilization: 45, outstandingDebt: 45000, creditLimit: 100000, emiPaid: 6500, scoreContribution: '+3.5 Pts', underwriterVerdict: 'Flawless mandate clearance across all distributor debits' },
  { month: 'May 2025', shortMonth: "May '25", onTimeRepaymentRate: 100.0, creditUtilization: 41, outstandingDebt: 41000, creditLimit: 100000, emiPaid: 6500, scoreContribution: '+3.5 Pts', underwriterVerdict: 'Steadily de-leveraging while expanding sales volume' },
  { month: 'June 2025', shortMonth: "Jun '25", onTimeRepaymentRate: 98.5, creditUtilization: 38, outstandingDebt: 38000, creditLimit: 100000, emiPaid: 6500, scoreContribution: '+3.1 Pts', underwriterVerdict: 'Low leverage position with strong weekday collection' },
  { month: 'July 2025', shortMonth: "Jul '25", onTimeRepaymentRate: 100.0, creditUtilization: 35, outstandingDebt: 35000, creditLimit: 100000, emiPaid: 6500, scoreContribution: '+3.8 Pts', underwriterVerdict: 'Optimal 35% utilization corridor achieved' },
  { month: 'August 2025', shortMonth: "Aug '25", onTimeRepaymentRate: 100.0, creditUtilization: 39, outstandingDebt: 39000, creditLimit: 100000, emiPaid: 7200, events: 'Raksha Bandhan surge', scoreContribution: '+3.6 Pts', underwriterVerdict: 'Festive advance fully backed by retail UPI inflow' },
  { month: 'September 2025', shortMonth: "Sep '25", onTimeRepaymentRate: 100.0, creditUtilization: 44, outstandingDebt: 44000, creditLimit: 100000, emiPaid: 7200, scoreContribution: '+3.4 Pts', underwriterVerdict: 'Controlled pre-festive restocking with zero NACH bounce' },
  { month: 'October 2025', shortMonth: "Oct '25", onTimeRepaymentRate: 99.0, creditUtilization: 58, outstandingDebt: 58000, creditLimit: 100000, emiPaid: 7200, events: 'Diwali stock buildup', scoreContribution: '+2.9 Pts', underwriterVerdict: 'Planned seasonal peak utilization (58%) repaid promptly' },
  { month: 'November 2025', shortMonth: "Nov '25", onTimeRepaymentRate: 100.0, creditUtilization: 42, outstandingDebt: 42000, creditLimit: 100000, emiPaid: 7200, events: 'Festive proceeds sweep', scoreContribution: '+3.9 Pts', underwriterVerdict: 'Rapid debt reduction via holiday cash flow sweeps' },
  { month: 'December 2025', shortMonth: "Dec '25", onTimeRepaymentRate: 100.0, creditUtilization: 36, outstandingDebt: 36000, creditLimit: 100000, emiPaid: 7200, scoreContribution: '+3.8 Pts', underwriterVerdict: 'Strong year-end balance sheet with 64% open credit buffer' },
  { month: 'January 2026', shortMonth: "Jan '26", onTimeRepaymentRate: 100.0, creditUtilization: 32, outstandingDebt: 32000, creditLimit: 100000, emiPaid: 7200, events: 'Current 32% optimal utilization', scoreContribution: '+4.0 Pts', underwriterVerdict: 'Prime micro-merchant standing with pristine repayment track' },
];

interface DebtRepaymentTrendChartProps {
  storeName?: string;
}

export const DebtRepaymentTrendChart: React.FC<DebtRepaymentTrendChartProps> = ({
  storeName = 'Ramesh General Store',
}) => {
  const [viewMode, setViewMode] = useState<'percentage' | 'monetary'>('percentage');
  const [timeRange, setTimeRange] = useState<'12m' | '6m'>('12m');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const filteredData = timeRange === '6m' ? HISTORICAL_DEBT_DATA.slice(-6) : HISTORICAL_DEBT_DATA;

  // Rich Interactive Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentItem = filteredData.find((d) => d.shortMonth === label);
      return (
        <div className="bg-white/98 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-[#bccac0]/50 text-[12px] flex flex-col gap-2.5 min-w-[280px] max-w-[320px] animate-in fade-in zoom-in-95 duration-150 z-30">
          <div className="flex items-center justify-between pb-2 border-b border-[#bccac0]/30">
            <div>
              <span className="font-extrabold text-[#131b2e] text-[13px] block">{currentItem?.month || label}</span>
              <span className="text-[10px] text-[#6d7a72] font-medium">Monthly Mandate Verification</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] shadow-2xs">
              ✓ AA Mandate
            </span>
          </div>

          {viewMode === 'percentage' ? (
            <div className="space-y-2 bg-[#f7f9f6] p-2.5 rounded-xl border border-[#bccac0]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#006948]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006948] shrink-0"></span>
                  <span className="font-bold">On-Time Repayment:</span>
                </div>
                <span className="font-black text-[#131b2e] tabular-nums text-[13px]">
                  {payload.find((p: any) => p.dataKey === 'onTimeRepaymentRate')?.value}%
                </span>
              </div>
              <p className="text-[10px] text-[#3d4a42] leading-tight pl-4">
                <strong>Metric Explanation:</strong> Measures proportion of automated debit mandates honored on first presentation without return charges.
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#bccac0]/20">
                <div className="flex items-center gap-1.5 text-[#904d00]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#904d00] shrink-0"></span>
                  <span className="font-bold">Credit Utilization:</span>
                </div>
                <span className="font-black text-[#131b2e] tabular-nums text-[13px]">
                  {payload.find((p: any) => p.dataKey === 'creditUtilization')?.value}%
                </span>
              </div>
              <p className="text-[10px] text-[#3d4a42] leading-tight pl-4">
                <strong>Metric Explanation:</strong> Revolving debt ratio. Optimal zone is 30%–50% to indicate healthy cash flow without over-leverage.
              </p>
            </div>
          ) : (
            <div className="space-y-2 bg-[#f7f9f6] p-2.5 rounded-xl border border-[#bccac0]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#006948]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006948] shrink-0"></span>
                  <span className="font-bold">Outstanding Debt:</span>
                </div>
                <span className="font-black text-[#131b2e] tabular-nums text-[13px]">
                  ₹{(currentItem?.outstandingDebt || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-[#3d4a42] leading-tight pl-4">
                <strong>Metric Explanation:</strong> Active principal liability. Available credit: ₹{(100000 - (currentItem?.outstandingDebt || 0)).toLocaleString('en-IN')}.
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#bccac0]/20">
                <div className="flex items-center gap-1.5 text-[#006a61]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a61] shrink-0"></span>
                  <span className="font-bold">EMI Serviced:</span>
                </div>
                <span className="font-black text-[#131b2e] tabular-nums text-[13px]">
                  ₹{(currentItem?.emiPaid || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-[#3d4a42] leading-tight pl-4">
                <strong>Metric Explanation:</strong> Regular monthly payment seamlessly cleared from primary current account.
              </p>
            </div>
          )}

          {/* Underwriting Verdict & Event Callout */}
          <div className="pt-1.5 border-t border-[#bccac0]/20 flex flex-col gap-1 text-[11px]">
            {currentItem?.scoreContribution && (
              <div className="flex items-center justify-between text-[#006948] font-bold text-[10px]">
                <span>Score Impact:</span>
                <span className="px-1.5 py-0.5 rounded bg-[#85f8c4]/50">{currentItem.scoreContribution}</span>
              </div>
            )}
            {currentItem?.underwriterVerdict && (
              <p className="text-[10px] text-[#131b2e] italic bg-white p-1.5 rounded-lg border border-[#bccac0]/30 font-medium">
                🎯 <strong>Verdict:</strong> {currentItem.underwriterVerdict}
              </p>
            )}
            {currentItem?.events && (
              <div className="p-1.5 rounded bg-[#f2f3ff] text-[10px] text-[#006948] font-semibold flex items-center gap-1">
                <span>💡 Event:</span>
                <span>{currentItem.events}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xs border border-[#bccac0]/30 flex flex-col gap-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#bccac0]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#006948] text-[20px]">insights</span>
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#006948]">
              Underwriting Longitudinal Analysis
            </span>
            <span className="text-[11px] text-[#6d7a72]">• RBI Account Aggregator Telemetry</span>
          </div>
          <h3 className="text-[20px] font-extrabold text-[#131b2e] tracking-tight">
            Historical Debt Repayment Performance & Credit Utilization Trends
          </h3>
          <p className="text-[13px] text-[#3d4a42]">
            12-month longitudinal audit of borrowing discipline, EMI servicing consistency, and working capital utilization for {storeName}. Hover over any data point to inspect metric details.
          </p>
        </div>

        {/* View & Range Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Mode Toggle */}
          <div className="flex p-1 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/20 text-[12px]">
            <button
              onClick={() => setViewMode('percentage')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'percentage'
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#131b2e]'
              }`}
            >
              Rate & Utilization (%)
            </button>
            <button
              onClick={() => setViewMode('monetary')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'monetary'
                  ? 'bg-white text-[#006948] shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#131b2e]'
              }`}
            >
              Amounts (₹ INR)
            </button>
          </div>

          {/* Time Range Toggle */}
          <div className="flex p-1 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/20 text-[12px]">
            <button
              onClick={() => setTimeRange('12m')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === '12m'
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#131b2e]'
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'text-[#6d7a72] hover:text-[#131b2e]'
              }`}
            >
              6 Months
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive Metric Callout Badges with Hover Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div
          onMouseEnter={() => setHoveredMetric('repayment')}
          onMouseLeave={() => setHoveredMetric(null)}
          className="p-3.5 rounded-xl bg-[#f5fff7] border border-[#85f8c4]/70 relative group cursor-pointer transition-all hover:shadow-md hover:border-[#006948]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-[#6d7a72] block">
              12-Mo Repayment Rate
            </span>
            <span className="material-symbols-outlined text-[15px] text-[#006948] opacity-70 group-hover:opacity-100">info</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[22px] font-black text-[#006948]">99.4%</span>
            <span className="text-[11px] font-semibold text-[#006948]">On-Time</span>
          </div>
          <span className="text-[11px] text-[#3d4a42] block mt-0.5">Top 5% of Jaipur Kiranas</span>

          {/* Hover Explainer Tooltip */}
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-xl z-20 hidden group-hover:block transition-all animate-in fade-in">
            <p className="font-bold text-[#85f8c4] mb-1">On-Time Repayment Metric</p>
            <p className="text-white/90 leading-relaxed">
              Measures percentage of automated NACH debits & vendor invoices settled on or before due date. 99.4% is classified as Prime Tier-1 discipline.
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onMouseEnter={() => setHoveredMetric('utilization')}
          onMouseLeave={() => setHoveredMetric(null)}
          className="p-3.5 rounded-xl bg-[#fff8f2] border border-[#ffdcbe] relative group cursor-pointer transition-all hover:shadow-md hover:border-[#904d00]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-[#6d7a72] block">
              Credit Utilization
            </span>
            <span className="material-symbols-outlined text-[15px] text-[#904d00] opacity-70 group-hover:opacity-100">info</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[22px] font-black text-[#904d00]">32.0%</span>
            <span className="text-[11px] font-semibold text-[#904d00]">Safe Buffer</span>
          </div>
          <span className="text-[11px] text-[#3d4a42] block mt-0.5">18% Below 50% Benchmark</span>

          {/* Hover Explainer Tooltip */}
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-xl z-20 hidden group-hover:block transition-all animate-in fade-in">
            <p className="font-bold text-[#ffdcc3] mb-1">Credit Utilization Metric</p>
            <p className="text-white/90 leading-relaxed">
              Calculated as (Current Debt / Sanctioned Limit). At 32%, you retain 68% buffer to absorb emergency procurement shocks.
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onMouseEnter={() => setHoveredMetric('serviced')}
          onMouseLeave={() => setHoveredMetric(null)}
          className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/30 relative group cursor-pointer transition-all hover:shadow-md hover:border-[#006948]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-[#6d7a72] block">
              12-Mo Debt Serviced
            </span>
            <span className="material-symbols-outlined text-[15px] text-[#006948] opacity-70 group-hover:opacity-100">info</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[22px] font-black text-[#131b2e]">₹83,200</span>
          </div>
          <span className="text-[11px] text-[#3d4a42] block mt-0.5">Clean NACH Auto-Debits</span>

          {/* Hover Explainer Tooltip */}
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-xl z-20 hidden group-hover:block transition-all animate-in fade-in">
            <p className="font-bold text-[#85f8c4] mb-1">Debt Serviced Metric</p>
            <p className="text-white/90 leading-relaxed">
              Cumulative EMI and vendor working capital repaid. Proves recurring capacity to service loans from operating cash flows.
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onMouseEnter={() => setHoveredMetric('bounces')}
          onMouseLeave={() => setHoveredMetric(null)}
          className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/30 relative group cursor-pointer transition-all hover:shadow-md hover:border-[#006948]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-[#6d7a72] block">
              Mandate Bounces
            </span>
            <span className="material-symbols-outlined text-[15px] text-[#006948] opacity-70 group-hover:opacity-100">info</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[22px] font-black text-[#006948]">0 Bounces</span>
          </div>
          <span className="text-[11px] text-[#006948] font-bold block mt-0.5">Zero Bureau Defaults</span>

          {/* Hover Explainer Tooltip */}
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-[#131b2e] text-white text-[11px] rounded-xl shadow-xl z-20 hidden group-hover:block transition-all animate-in fade-in">
            <p className="font-bold text-[#85f8c4] mb-1">Mandate Dishonor Metric</p>
            <p className="text-white/90 leading-relaxed">
              Evaluates Account Aggregator logs for NSF penalties or bounced cheque records. Zero failures grants maximum underwriting confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart Container with Interactive Hover Data Points */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'percentage' ? (
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#bccac0" opacity={0.35} vertical={false} />
              <XAxis
                dataKey="shortMonth"
                tick={{ fill: '#6d7a72', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#bccac0', opacity: 0.5 }}
                tickLine={false}
              />
              <YAxis
                domain={[20, 105]}
                tick={{ fill: '#6d7a72', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 600 }}
                formatter={(value) => {
                  if (value === 'onTimeRepaymentRate') return 'On-Time Debt Repayment Performance (%)';
                  if (value === 'creditUtilization') return 'Credit Line Utilization (%)';
                  return value;
                }}
              />
              {/* Benchmark Reference Line */}
              <ReferenceLine
                y={50}
                stroke="#ba1a1a"
                strokeDasharray="4 4"
                label={{
                  value: '50% Safe Utilization Cap',
                  position: 'insideBottomRight',
                  fill: '#ba1a1a',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
              <ReferenceLine
                y={95}
                stroke="#006948"
                strokeDasharray="3 3"
                opacity={0.4}
                label={{
                  value: '95% Prime Tier Benchmark',
                  position: 'insideTopLeft',
                  fill: '#006948',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              {/* Green Line for Repayment Rate */}
              <Line
                type="monotone"
                dataKey="onTimeRepaymentRate"
                stroke="#006948"
                strokeWidth={3}
                dot={{ fill: '#006948', r: 4.5, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, fill: '#85f8c4', stroke: '#006948', strokeWidth: 3 }}
                name="onTimeRepaymentRate"
              />
              {/* Amber Line for Credit Utilization */}
              <Line
                type="monotone"
                dataKey="creditUtilization"
                stroke="#904d00"
                strokeWidth={2.5}
                dot={{ fill: '#904d00', r: 4.5, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, fill: '#ffdcc3', stroke: '#904d00', strokeWidth: 3 }}
                name="creditUtilization"
              />
            </LineChart>
          ) : (
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#bccac0" opacity={0.35} vertical={false} />
              <XAxis
                dataKey="shortMonth"
                tick={{ fill: '#6d7a72', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#bccac0', opacity: 0.5 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 70000]}
                tick={{ fill: '#6d7a72', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 600 }}
                formatter={(value) => {
                  if (value === 'outstandingDebt') return 'Active Outstanding Debt (₹)';
                  if (value === 'emiPaid') return 'Monthly EMI Serviced (₹)';
                  return value;
                }}
              />
              <ReferenceLine
                y={50000}
                stroke="#6d7a72"
                strokeDasharray="4 4"
                label={{
                  value: 'Pre-Approved Credit Band Lower Bound (₹50k)',
                  position: 'insideTopRight',
                  fill: '#6d7a72',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="outstandingDebt"
                stroke="#006948"
                strokeWidth={3}
                dot={{ fill: '#006948', r: 4.5, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, fill: '#85f8c4', stroke: '#006948', strokeWidth: 3 }}
                name="outstandingDebt"
              />
              <Line
                type="monotone"
                dataKey="emiPaid"
                stroke="#006a61"
                strokeWidth={2.5}
                dot={{ fill: '#006a61', r: 4.5, strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, fill: '#89f5e7', stroke: '#006a61', strokeWidth: 3 }}
                name="emiPaid"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Insight & Explainability Note */}
      <div className="pt-3 border-t border-[#bccac0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-[#3d4a42]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006948] text-[18px]">verified</span>
          <span>
            Underwriter Summary: Utilization dropped from <strong>58% (Diwali peak)</strong> to <strong>32% (Current)</strong> while maintaining <strong>100% on-time EMI auto-debits</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#6d7a72] shrink-0 font-medium">
          <span>Source: SBI Mandate Registry • RBI AA Protocol</span>
        </div>
      </div>
    </div>
  );
};
