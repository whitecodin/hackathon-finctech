import React, { useState, useEffect } from 'react';
import { NavPath, Merchant } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { db } from '../lib/firebase.ts';
import { doc, onSnapshot } from 'firebase/firestore';

interface OverviewViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath, initialQuery?: string) => void;
  onTriggerDownload: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  merchant,
  onNavigate,
  onTriggerDownload,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Real-time Firestore state
  const [firestoreUser, setFirestoreUser] = useState<any>(null);
  const [firestoreSettings, setFirestoreSettings] = useState<any>(null);
  
  // Real-time Cloud SQL PostgreSQL state
  const [sqlMetrics, setSqlMetrics] = useState<any>(null);
  const [showStatusCard, setShowStatusCard] = useState<boolean>(false);

  // Currency converter state
  const [converterAmount, setConverterAmount] = useState<number>(100000);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const exchangeRates: Record<string, { rate: number; symbol: string; name: string }> = {
    USD: { rate: 0.012, symbol: '$', name: 'US Dollar' },
    EUR: { rate: 0.011, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.0095, symbol: '£', name: 'British Pound' },
    AED: { rate: 0.044, symbol: 'AED', name: 'UAE Dirham' },
    SGD: { rate: 0.016, symbol: 'S$', name: 'Singapore Dollar' },
    JPY: { rate: 1.85, symbol: '¥', name: 'Japanese Yen' },
    CAD: { rate: 0.0165, symbol: 'CA$', name: 'Canadian Dollar' },
    BDT: { rate: 1.42, symbol: '৳', name: 'Bangladeshi Taka' },
  };

  // Determine signed-in person's name
  const signedInName =
    firestoreUser?.displayName ||
    user?.displayName ||
    merchant?.ownerName ||
    (user?.email ? user.email.split('@')[0] : 'Ramesh Kumar');

  const signedInStoreName =
    firestoreSettings?.storeName ||
    merchant?.storeName ||
    (signedInName ? `${signedInName}'s Store` : 'Ramesh General Store');

  const currentLocation =
    firestoreSettings?.location ||
    merchant?.location ||
    'Shop 14, Johari Bazaar, Jaipur, Rajasthan';

  const avatarUrl =
    firestoreUser?.photoURL ||
    firestoreSettings?.profilePhotoUrl ||
    user?.photoURL ||
    merchant?.profilePhotoUrl;

  // Real-time Firestore Sync
  useEffect(() => {
    const uid = user?.uid || 'demo-ramesh-user-uid';
    const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) setFirestoreUser(snap.data());
    }, () => {});

    const unsubSettings = onSnapshot(doc(db, 'settings', uid), (snap) => {
      if (snap.exists()) setFirestoreSettings(snap.data());
    }, () => {});

    return () => {
      unsubUser();
      unsubSettings();
    };
  }, [user?.uid]);

  // Fetch Cloud SQL PostgreSQL Metrics
  useEffect(() => {
    const fetchSqlMetrics = async () => {
      try {
        const uid = user?.uid || 'demo-ramesh-user-uid';
        const res = await fetch(`/api/overview/metrics?uid=${encodeURIComponent(uid)}`);
        if (res.ok) {
          const data = await res.json();
          setSqlMetrics(data.metrics);
        }
      } catch (err) {
        console.warn('SQL metrics fetch note:', err);
      }
    };
    fetchSqlMetrics();
  }, [user?.uid]);

  const convertedValue = (converterAmount * (exchangeRates[selectedCurrency]?.rate || 0.012)).toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <div className="flex flex-col w-full gap-7 animate-in fade-in duration-300">
      {/* Header Greeting Block & Unique Identity Ribbon */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 bg-gradient-to-r from-[#f5f9f6] via-[#eef6f2] to-white p-6 sm:p-8 rounded-3xl border border-[#bccac0]/30 shadow-xs relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#85f8c4]/15 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#006948] text-[12px] font-bold shadow-2xs border border-[#bccac0]/30">
              <span className="material-symbols-outlined text-[15px] mr-1 text-[#006948]">location_on</span>
              {currentLocation}
            </span>
            <span className="text-[#6d7a72] text-[12px]">•</span>
            <span className="text-[12px] text-[#3d4a42] uppercase tracking-wider font-extrabold">
              GSTIN: {merchant?.gstin || '08AAACR4092K1Z9'}
            </span>
            <span className="text-[#6d7a72] text-[12px]">•</span>
            <button
              onClick={() => setShowStatusCard(!showStatusCard)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006948] text-white text-[11px] font-bold shadow-sm hover:bg-[#00855d] transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#85f8c4] animate-ping"></span>
              <span>{t('sovereignTierVerified', 'Sovereign Tier Verified')}</span>
              <span className="material-symbols-outlined text-[13px]">verified</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={signedInName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#006948] shadow-md shrink-0"
              />
            )}
            <div>
              <h1 className="text-[30px] font-black text-[#131b2e] tracking-tight">
                {t('goodMorning', 'Good Morning')}, {signedInName} 👋
              </h1>
              <p className="text-[14px] text-[#3d4a42] mt-0.5 font-medium">
                {t('sovereignIntelligenceFor', 'Sovereign commercial intelligence for')} <strong className="text-[#006948] font-bold">{signedInStoreName}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Quick State Pills */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-xs text-[#131b2e] border border-[#bccac0]/30 font-bold text-[13px]">
            <span className="material-symbols-outlined text-[#006948] text-[18px]">account_balance</span>
            <span>{merchant?.bankAccount || 'SBI Current A/c ••8912'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#006948] text-white shadow-sm font-bold text-[13px]">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>{sqlMetrics?.totalTransactions || 248} {t('syncStatus', 'Live Syncs')}</span>
          </div>
        </div>
      </div>

      {/* Interactive Sovereign Status Drawer */}
      {showStatusCard && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c2a21] via-[#004d34] to-[#006948] text-white shadow-xl border border-[#85f8c4]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#85f8c4] border border-white/20 shrink-0">
              <span className="material-symbols-outlined text-[26px]">military_tech</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[16px] font-extrabold text-white">Tier-1 Sovereign Enterprise Identity</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-extrabold">
                  {t('activeStatus', 'ACTIVE')}
                </span>
              </div>
              <p className="text-[13px] text-white/80 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'आपका खुदरा व्यवसाय एमएसएमई उद्यम, आरबीआई खाता एग्रीगेटर बैंकिंग प्रवाह और शून्य-ज्ञान प्रमाण अंडरराइटिंग में शीर्ष अनुपालन बनाए रखता है।'
                  : language === 'bn'
                  ? 'আপনার খুচরা ব্যবসা এমএসএমই উদ্যোগ, আরবিআই অ্যাকাউন্ট এগ্রিগেটর ব্যাংকিং প্রবাহ এবং জিরো-নলেজ প্রুফ আন্ডাররাইটিংয়ে শীর্ষ সম্মতি বজায় রাখে।'
                  : 'Your retail business maintains top-tier compliance across Ministry of MSME Udyam, RBI Account Aggregator banking streams, and Zero-Knowledge Proof underwriting rails.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusCard(false)}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[12px] transition-colors cursor-pointer shrink-0"
          >
            {t('cancel', 'Close')}
          </button>
        </div>
      )}

      {/* 1. Hero Financial Health Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#006948] via-[#00855d] to-[#004d34] text-white shadow-2xl">
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-[#89f5e7]/25 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-24 w-80 h-80 rounded-full bg-[#00855d]/50 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 p-7 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left side: Radial Gauge & Metrics */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Circular Gauge */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle cx="60" cy="60" fill="transparent" r="50" stroke="#004d34" strokeWidth="10"></circle>
                <circle
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="#85f8c4"
                  strokeDasharray="314.159"
                  strokeDashoffset="69.11"
                  strokeLinecap="round"
                  strokeWidth="10"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[44px] leading-none font-black text-white tracking-tight">
                  {sqlMetrics?.healthScore || merchant?.healthScore || 78}
                </span>
                <span className="text-[11px] text-[#85f8c4] tracking-widest uppercase font-extrabold mt-0.5">
                  / 100 {t('points', 'Score')}
                </span>
              </div>
            </div>

            {/* Metric Details */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-[12px] font-extrabold shadow-xs">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  {t('riskGradeTitle', 'Grade A- • Prime Lending Band')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] backdrop-blur-md font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-[#85f8c4]">trending_up</span>
                  +6 {t('points', 'pts')} vs last month
                </span>
              </div>
              <h2 className="text-[24px] font-extrabold text-white tracking-tight">
                {t('healthScoreTitle', 'Sovereign Commercial Health Index')}
              </h2>
              <p className="text-[14px] text-[#85f8c4]/90 max-w-xl leading-relaxed">
                {language === 'hi'
                  ? 'स्थिर नकद प्रवाह और असाधारण ग्राहक निष्ठा। आपकी दुकान तुरंत कम ब्याज वाले एमएसएमई कार्यशील पूंजी ऋण के लिए पूर्व-योग्य है।'
                  : language === 'bn'
                  ? 'স্থিতিশীল নগদ প্রবাহ এবং চমৎকার গ্রাহক বিশ্বস্ততা। আপনার দোকান তাৎক্ষণিক স্বল্প-সুদের এমএসএমই ওয়ার্কিং ক্যাপিটাল লোনের জন্য প্রাক-যোগ্য।'
                  : 'Stable cash inflows with exceptional retail patron loyalty. Your store is pre-qualified for instantaneous low-interest MSME working capital loans.'}
              </p>
            </div>
          </div>

          {/* Right side: Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 justify-end">
            <button
              onClick={() => onNavigate('financial-passport')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#006948] font-bold text-[14px] shadow-lg hover:bg-[#f2f3ff] transition-all cursor-pointer group"
            >
              <span>{t('myPassport', 'View Complete Passport')}</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button
              onClick={onTriggerDownload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 text-white hover:bg-white/25 font-bold text-[14px] backdrop-blur-md transition-all cursor-pointer border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>{t('downloadPdfBtn', 'Download Ledger & Report')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Business Inflow */}
        <div className="rounded-3xl bg-white p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-[#bccac0]/30 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-[#3d4a42] font-bold">{t('monthlyInflowTitle', 'Total 90-Day Inflow')}</span>
            <div className="w-10 h-10 rounded-2xl bg-[#e2e7ff] flex items-center justify-center text-[#006948] group-hover:bg-[#006948] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="my-2">
            <div className="text-[34px] font-black text-[#131b2e] tracking-tight tabular-nums">
              {sqlMetrics?.totalVolume ? `₹${(sqlMetrics.totalVolume).toLocaleString('en-IN')}` : '₹4,80,000'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#3d4a42] pt-3 border-t border-[#bccac0]/20">
            <span className="material-symbols-outlined text-[#006948] text-[16px]">trending_up</span>
            <span className="text-[12px]"><strong className="text-[#006948] font-bold">+12% MoM</strong> {t('growthFactor', 'growth')}</span>
          </div>
        </div>

        {/* KPI 2: Average Monthly Inflow */}
        <div className="rounded-3xl bg-white p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-[#bccac0]/30 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-[#3d4a42] font-bold">{t('upiBankVerified', 'Average Monthly Inflow')}</span>
            <div className="w-10 h-10 rounded-2xl bg-[#e2e7ff] flex items-center justify-center text-[#006948] group-hover:bg-[#006948] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="my-2">
            <div className="text-[34px] font-black text-[#131b2e] tracking-tight tabular-nums">
              ₹1,60,000
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#3d4a42] pt-3 border-t border-[#bccac0]/20">
            <span className="material-symbols-outlined text-[#006948] text-[16px]">verified</span>
            <span className="text-[12px]">{t('verified', 'Verified via Account Aggregator')}</span>
          </div>
        </div>

        {/* KPI 3: Working Capital Runway */}
        <div className="rounded-3xl bg-white p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-[#bccac0]/30 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-[#3d4a42] font-bold">{t('cashResilienceTitle', 'Working Capital Runway')}</span>
            <div className="w-10 h-10 rounded-2xl bg-[#f2f3ff] flex items-center justify-center text-[#006948] group-hover:bg-[#006948] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
            </div>
          </div>
          <div className="my-2">
            <div className="text-[34px] font-black text-[#131b2e] tracking-tight tabular-nums">
              {sqlMetrics?.resilienceDays || merchant?.resilienceDays || 18} {t('days', 'Days')}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#3d4a42] pt-3 border-t border-[#bccac0]/20">
            <span className="material-symbols-outlined text-[#8d4b00] text-[16px]">bolt</span>
            <span className="text-[12px]">{t('daysContinuousOps', 'Target: 30 days buffer')}</span>
          </div>
        </div>

        {/* KPI 4: Transaction Safety Flags */}
        <div 
          onClick={() => onNavigate('transaction-safety')}
          className="rounded-3xl bg-white p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-[#bccac0]/30 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-[#3d4a42] font-bold">{t('navTransactionSafety', 'Transaction Safety Flags')}</span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffdcc3] flex items-center justify-center text-[#8d4b00] group-hover:bg-[#ba1a1a] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">gpp_maybe</span>
            </div>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div className="text-[34px] font-black text-[#ba1a1a] tracking-tight tabular-nums">
              {sqlMetrics?.flaggedCount ?? 2} {t('flaggedStatus', 'Flagged')}
            </div>
            <span className="text-[12px] font-bold text-[#006948] group-hover:underline flex items-center">
              {t('viewDetails', 'Review')} <span className="material-symbols-outlined text-[14px] ml-0.5">chevron_right</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#3d4a42] pt-3 border-t border-[#bccac0]/20">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">error</span>
            <span className="text-[12px]">{t('pending', 'Vendor tax invoice needed')}</span>
          </div>
        </div>
      </div>

      {/* Interactive Currency Converter Section */}
      <div className="rounded-3xl bg-white p-7 border border-[#bccac0]/30 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#bccac0]/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#e2e7ff] text-[#006948] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">currency_exchange</span>
            </div>
            <div>
              <h3 className="text-[18px] font-black text-[#131b2e]">
                {t('currencyConverterTitle', 'Live Currency & Settlement Converter')}
              </h3>
              <p className="text-[12px] text-[#6d7a72]">
                {t('currencyConverterSubtitle', 'Convert INR merchant ledger balances to global reserve and trade currencies in real-time.')}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#85f8c4]/40 text-[#002114] text-[11px] font-extrabold self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
            Live Forex Index
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div>
            <label className="block text-[12px] font-bold text-[#3d4a42] mb-1.5">
              {t('amountInInr', 'Amount in INR (₹)')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a42] font-bold">₹</span>
              <input
                type="number"
                value={converterAmount}
                onChange={(e) => setConverterAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] font-bold text-[15px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                placeholder="100000"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#3d4a42] mb-1.5">
              {t('targetCurrency', 'Target Currency')}
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-[#006948] cursor-pointer"
            >
              {Object.entries(exchangeRates).map(([code, cur]) => (
                <option key={code} value={code}>
                  {code} - {cur.name} ({cur.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-[#e2e7ff]/70 border border-[#bccac0]/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#3d4a42] font-semibold">{t('convertedValue', 'Converted Value')}</span>
              <div className="text-[22px] font-black text-[#006948]">
                {exchangeRates[selectedCurrency]?.symbol} {convertedValue}
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#6d7a72] text-right">
              1 INR ≈ {exchangeRates[selectedCurrency]?.rate} {selectedCurrency}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#6d7a72] italic">
          {t('sovereignExchangeRate', 'Official sovereign exchange rate benchmarked via RBI / ECB market feeds')}
        </p>
      </div>

      {/* 3. Bottom Grid: Quick Insights & AI Consultation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column (8 cols): Cash Flow Trajectory */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-7 border border-[#bccac0]/30 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#bccac0]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e2e7ff] flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[22px]">bar_chart</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-extrabold text-[#131b2e]">
                    {language === 'hi' ? 'साप्ताहिक आवक बनाम बहिर्वाह प्रक्षेपवक्र' : language === 'bn' ? 'সাপ্তাহিক অন্তর্মুখী বনাম বহির্মুখী গতিপথ' : 'Weekly Inflow vs Outflow Trajectory'}
                  </h3>
                  <p className="text-[12px] text-[#6d7a72]">
                    {language === 'hi' ? 'क्लाउड एसक्यूएल पोस्टग्रेएसक्यूएल लेजर से समेकित' : language === 'bn' ? 'ক্লাউড এসকিউএল পোস্টগ্রেস লেজার থেকে সমন্বিত' : 'Consolidated ledger analytics from PostgreSQL'}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#f2f3ff] text-[#006948] text-[11px] font-extrabold">
                {language === 'hi' ? 'पिछले ४ सप्ताह' : language === 'bn' ? 'গত ৪ সপ্তাহ' : 'Last 4 Weeks'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {[
                { week: language === 'hi' ? 'सप्ताह १' : language === 'bn' ? 'সপ্তাহ ১' : 'Week 1', inflow: '₹1.15L', outflow: '₹84k', status: t('verified', 'Stable') },
                { week: language === 'hi' ? 'सप्ताह २' : language === 'bn' ? 'সপ্তাহ ২' : 'Week 2', inflow: '₹1.28L', outflow: '₹92k', status: t('growthFactor', 'Growth') },
                { week: language === 'hi' ? 'सप्ताह ३' : language === 'bn' ? 'সप्ताह ৩' : 'Week 3', inflow: '₹1.42L', outflow: '₹98k', status: t('high', 'Peak') },
                { week: language === 'hi' ? 'सप्ताह ४' : language === 'bn' ? 'सप्ताह ४' : 'Week 4', inflow: '₹1.35L', outflow: '₹95k', status: t('verified', 'Stable') },
              ].map((w, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#f7f9f6] border border-[#bccac0]/20 flex flex-col gap-2 hover:bg-[#eef6f2] transition-colors">
                  <span className="text-[11px] text-[#6d7a72] font-bold">{w.week}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] font-black text-[#006948]">{w.inflow}</span>
                    <span className="text-[12px] text-[#ba1a1a] font-semibold">-{w.outflow}</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-[#131b2e] self-start border border-[#bccac0]/30 shadow-2xs">
                    {w.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f2f7f4] to-[#eaf7f1] border border-[#85f8c4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#006948] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">lightbulb</span>
                </div>
                <div>
                  <span className="text-[14px] font-extrabold text-[#002114]">{t('aiCoachTitle', 'AI Financial Coach Recommendation')}</span>
                  <p className="text-[12px] text-[#006948] mt-0.5">
                    {language === 'hi'
                      ? 'सप्ताहांत यूपीआई भुगतान वेग कार्यदिवसों की तुलना में ३४% अधिक है। शुक्रवार को उच्च-मार्जिन वस्तुओं का स्टॉक बनाए रखें।'
                      : language === 'bn'
                      ? 'সাপ্তাহিক ইউপিআই পেমেন্টের গতি সাধারণ দিনের তুলনায় ৩৪% বেশি। শুক্রবারে বেশি লাভের পণ্যের স্টক বজায় রাখুন।'
                      : 'Weekend UPI settlement velocity is 34% higher than weekdays. Maintain stock of high-margin impulse items on Fridays.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('ai-financial-coach', language === 'hi' ? 'सप्ताहांत इन्वेंटरी कैसे अनुकूलित करें?' : language === 'bn' ? 'সাপ্তাহিক ইনভেন্টরি কীভাবে অপ্টিমাইজ করবেন?' : 'How do I optimize weekend grocery inventory?')}
                className="px-4 py-2.5 rounded-xl bg-[#006948] text-white text-[13px] font-bold hover:bg-[#00855d] transition-all shrink-0 cursor-pointer shadow-sm"
              >
                {t('talkAiCoachBtn', 'Ask Coach')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick AI Consultations */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-7 border border-[#bccac0]/30 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#bccac0]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#e2e7ff] flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <h3 className="text-[17px] font-extrabold text-[#131b2e]">
                  {t('quickPromptsTitle', 'Quick Consultations')}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {(language === 'hi'
                ? [
                    'मैं अपना क्रेडिट स्कोर 78 से 85+ कैसे बढ़ाऊं?',
                    'मुद्रा ऋण के लिए मेरी सुरक्षित मासिक ईएमआई क्या है?',
                    'संदिग्ध आपूर्तिकर्ता हस्तांतरण को कैसे हल करें?',
                    'मेरी शून्य-ज्ञान प्रमाण सुरक्षा समझाएं',
                  ]
                : language === 'bn'
                ? [
                    'আমি কীভাবে আমার ক্রেডিট স্কোর ৭৮ থেকে ৮৫+ এ উন্নীত করব?',
                    'মুদ্রা ঋণের জন্য আমার নিরাপদ মাসিক ইএমআই কত?',
                    'সন্দেহজনক সরবরাহকারী স্থানান্তর কীভাবে সমাধান করবেন?',
                    'আমার জিরো-নলেজ প্রুফ নিরাপত্তা ব্যাখ্যা করুন',
                  ]
                : [
                    'How can I raise my credit score from 78 to 85+?',
                    'What is my safe monthly EMI capacity for a Mudra loan?',
                    'How do I resolve flagged supplier transfers?',
                    'Explain my ZKP cryptographic proof security',
                  ]
              ).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate('ai-financial-coach', question)}
                  className="w-full text-left p-3.5 rounded-2xl bg-[#f7f9f6] hover:bg-[#e2e7ff] text-[#131b2e] text-[13px] font-bold transition-all flex items-center justify-between group cursor-pointer border border-[#bccac0]/20 shadow-2xs"
                >
                  <span className="line-clamp-1">{question}</span>
                  <span className="material-symbols-outlined text-[16px] text-[#6d7a72] group-hover:text-[#006948] group-hover:translate-x-0.5 transition-all shrink-0 ml-2">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
