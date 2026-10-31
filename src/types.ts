export type NavPath = 
  | 'overview'
  | 'financial-passport'
  | 'credit-readiness'
  | 'transaction-safety'
  | 'business-resilience'
  | 'ai-financial-coach'
  | 'consent-privacy'
  | 'onboarding'
  | 'settings'
  | 'auth'
  | 'underwriter-verification';

export type Language = 'en' | 'hi' | 'bn';

export interface User {
  id: number;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
}

export interface Merchant {
  id: number;
  userId: number;
  storeName: string;
  ownerName: string;
  category: string;
  location: string;
  city?: string;
  state?: string;
  pinCode: string;
  profilePhotoUrl?: string;
  gstin: string;
  udyamId: string;
  bankAccount: string;
  healthScore: number;
  riskGrade: string;
  creditBandMin: number;
  creditBandMax: number;
  safeEmiMin: number;
  safeEmiMax: number;
  resilienceDays: number;
  monthlyInflow: number;
  dailyBurn: number;
  passportUid: string;
}

export interface Transaction {
  id: number;
  merchantId: number;
  txnRef: string;
  date: string;
  counterparty: string;
  subDescription?: string | null;
  amount: string | number;
  type: 'inflow' | 'outflow';
  channel: string;
  isFlagged: boolean;
  flagReason?: string | null;
  anomalyScore?: string | number | null;
  status: 'normal' | 'under_review' | 'verified_by_merchant' | 'reported_bank';
  merchantNote?: string | null;
}

export interface UnderwritingVectors {
  cashFlowStability: { score: number; rating: string; weight: number };
  repaymentCapacity: { score: number; rating: string; weight: number };
  businessActivity: { score: number; rating: string; weight: number };
  liquidityBuffer: { score: number; rating: string; weight: number };
  dataCoverage: { score: number; rating: string; weight: number };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mathematicalAttribution?: {
    dailyUpiVelocity?: number;
    supplierDiscipline?: number;
    liquidReserve?: number;
    unverifiedHighValue?: number;
  };
  hindiTranslation?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  category: 'emergency' | 'inventory' | 'equipment' | 'renovation' | 'other';
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  notes?: string;
}

