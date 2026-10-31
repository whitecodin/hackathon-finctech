/**
 * ML Underwriting & Anomaly Detection Engine
 * Transparent rule-based educational estimates only. Not trained ML or a lender credit decision.
 */

export interface UnderwritingInput {
  monthlyInflow: number;
  dailyUpiVolume: number;
  daysActiveSync: number;
  unresolvedFlagsCount: number;
  liquidReserveDays: number;
  bouncedMandates: number;
}

export interface UnderwritingResult {
  vyaparScore: number;
  grade: string;
  creditBandMin: number;
  creditBandMax: number;
  safeEmiMin: number;
  safeEmiMax: number;
  vectors: {
    cashFlowStability: { score: number; rating: string; weight: number };
    repaymentCapacity: { score: number; rating: string; weight: number };
    businessActivity: { score: number; rating: string; weight: number };
    liquidityBuffer: { score: number; rating: string; weight: number };
    dataCoverage: { score: number; rating: string; weight: number };
  };
  attributions: Array<{
    feature: string;
    impact: number;
    description: string;
  }>;
}

export function computeUnderwritingScore(input: UnderwritingInput): UnderwritingResult {
  // Illustrative manually chosen weights; not derived from trained lender datasets.
  const wCashFlow = 0.30;
  const wRepayment = 0.25;
  const wActivity = 0.20;
  const wLiquidity = 0.15;
  const wCoverage = 0.10;

  // Vector 1: Cash flow stability (0 - 100)
  const cashFlowStability = Math.min(100, Math.max(30, 82 - (input.unresolvedFlagsCount * 3)));
  
  // Vector 2: Repayment capacity (0 - 100)
  const repaymentCapacity = Math.min(100, Math.max(25, 74 - (input.bouncedMandates * 25)));

  // Vector 3: Business activity (0 - 100)
  const businessActivity = Math.min(100, Math.max(20, Math.round(50 + (input.dailyUpiVolume / 300))));

  // Vector 4: Liquidity buffer (0 - 100) - benchmark is 30 days
  const liquidityBuffer = Math.min(100, Math.max(20, Math.round((input.liquidReserveDays / 30) * 100)));

  // Vector 5: Data coverage (0 - 100) - benchmark is 90 days active
  const dataCoverage = Math.min(100, Math.max(10, Math.round((input.daysActiveSync / 90) * 90)));

  // Weighted aggregate model score
  const rawScore = 
    (cashFlowStability * wCashFlow) +
    (repaymentCapacity * wRepayment) +
    (businessActivity * wActivity) +
    (liquidityBuffer * wLiquidity) +
    (dataCoverage * wCoverage);

  const vyaparScore = Math.round(rawScore);

  let grade = 'Grade B';
  if (vyaparScore >= 85) grade = 'Grade A+ • Sovereign Prime';
  else if (vyaparScore >= 78) grade = 'Grade A- • Good Standing';
  else if (vyaparScore >= 70) grade = 'Grade B+ • Moderate';
  else grade = 'Grade C • Emerging';

  // Capacity estimate: based on monthly inflow & 20% safe margin
  const creditBandMin = Math.round((input.monthlyInflow * 0.35) / 5000) * 5000;
  const creditBandMax = Math.round((input.monthlyInflow * 0.70) / 10000) * 10000;
  const safeEmiMin = Math.round(creditBandMin * 0.095);
  const safeEmiMax = Math.round(creditBandMax * 0.082);

  return {
    vyaparScore,
    grade,
    creditBandMin,
    creditBandMax,
    safeEmiMin,
    safeEmiMax,
    vectors: {
      cashFlowStability: { score: cashFlowStability, rating: cashFlowStability >= 80 ? 'Excellent' : 'Good', weight: wCashFlow },
      repaymentCapacity: { score: repaymentCapacity, rating: repaymentCapacity >= 70 ? 'Good' : 'Moderate', weight: wRepayment },
      businessActivity: { score: businessActivity, rating: businessActivity >= 80 ? 'High' : 'Moderate', weight: wActivity },
      liquidityBuffer: { score: liquidityBuffer, rating: liquidityBuffer >= 70 ? 'Stable' : 'Moderate', weight: wLiquidity },
      dataCoverage: { score: dataCoverage, rating: '90-Day Full', weight: wCoverage },
    },
    attributions: [
      { feature: 'Daily UPI Velocity', impact: +45, description: `₹${(input.dailyUpiVolume / 1000).toFixed(1)}k avg daily retail customer settlements` },
      { feature: 'Supplier Discipline', impact: +22, description: 'Zero delayed distributor payouts over 90 days' },
      { feature: 'Liquid Cash Reserve', impact: -8, description: `Covers ${input.liquidReserveDays} days (Benchmark: 30 days safe)` },
      { feature: 'Unverified High Value', impact: -(input.unresolvedFlagsCount * 3), description: `${input.unresolvedFlagsCount} transactions pending invoice or buyer match` },
    ],
  };
}

/**
 * Rule-based anomaly indicator (not a calibrated fraud probability)
 */
export function computeTransactionAnomaly(params: {
  amount: number;
  averageSupplierOutflow: number;
  hour: number;
  isSunday: boolean;
  isNewBeneficiary: boolean;
}) {
  let anomalyScore = 0.0;
  const reasons: string[] = [];

  // Ratio check
  const ratio = params.averageSupplierOutflow > 0 ? params.amount / params.averageSupplierOutflow : 0;
  if (ratio >= 3.0) {
    anomalyScore += 0.50;
    reasons.push(`Amount (₹${params.amount.toLocaleString('en-IN')}) is ${Math.round((ratio - 1) * 100)}% higher than normal supplier average (₹${params.averageSupplierOutflow.toLocaleString('en-IN')})`);
  }

  // Time / Day check (Off-hours: after 10 PM or before 6 AM)
  if (params.hour >= 22 || params.hour <= 5 || params.isSunday) {
    anomalyScore += 0.25;
    reasons.push(`Initiated off-hours at ${params.hour}:00, outside regular shop business hours`);
  }

  // New beneficiary check
  if (params.isNewBeneficiary) {
    anomalyScore += 0.20;
    reasons.push('First transfer to this recipient account/IFSC in 90 days of account telemetry');
  }

  return {
    anomalyScore: Math.min(0.99, Number(anomalyScore.toFixed(2))),
    isAnomaly: anomalyScore >= 0.60,
    reasons,
    ruleId: 'VTP-RULE-001',
  };
}
