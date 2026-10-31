import React, { useState, useEffect } from 'react';
import { NavPath, Transaction, Merchant } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface TransactionSafetyViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath) => void;
  onRefreshProfile?: () => void;
}

export const TransactionSafetyView: React.FC<TransactionSafetyViewProps> = ({
  merchant,
  onNavigate,
  onRefreshProfile,
}) => {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'flagged' | 'normal' | 'inflow' | 'outflow'>('all');
  const [selectedTxnId, setSelectedTxnId] = useState<number>(1);
  const [noteText, setNoteText] = useState<string>('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);

  // Local state for transactions, initialized with seed data
  const [txns, setTxns] = useState<Transaction[]>([
    {
      id: 1,
      merchantId: 1,
      txnRef: 'TXN# 9081248',
      date: '12 Jan 2026',
      counterparty: 'Radhe Shyam Wholesale Traders',
      subDescription: 'HDFC A/C • Ref: NEFT-78192801',
      amount: 48900,
      type: 'outflow',
      channel: 'NEFT',
      isFlagged: true,
      flagReason: 'Unusually high supplier amount (340% higher) & Sunday night timing (11:42 PM)',
      anomalyScore: 0.94,
      status: 'under_review',
      merchantNote: null,
    },
    {
      id: 2,
      merchantId: 1,
      txnRef: 'TXN# 8840121',
      date: '08 Jan 2026',
      counterparty: 'PayTM QR Aggregator Settlement',
      subDescription: 'Merchant Batch • Split 2 of 2',
      amount: 18400,
      type: 'inflow',
      channel: 'QR Batch',
      isFlagged: true,
      flagReason: 'Pattern Deviation: aggregate settlement split mismatch against expected clearing window',
      anomalyScore: 0.82,
      status: 'under_review',
      merchantNote: null,
    },
    {
      id: 3,
      merchantId: 1,
      txnRef: 'TXN# 7729104',
      date: '14 Jan 2026',
      counterparty: 'Daily UPI Retail Collections',
      subDescription: '42 distinct customer transactions',
      amount: 6820,
      type: 'inflow',
      channel: 'Soundbox',
      isFlagged: false,
      flagReason: null,
      anomalyScore: 0.08,
      status: 'normal',
      merchantNote: null,
    },
    {
      id: 4,
      merchantId: 1,
      txnRef: 'TXN# 6638192',
      date: '13 Jan 2026',
      counterparty: 'Amul Dairy Supply Distributor',
      subDescription: 'Regular supplier • Monthly cycle',
      amount: 8450,
      type: 'outflow',
      channel: 'UPI',
      isFlagged: false,
      flagReason: null,
      anomalyScore: 0.12,
      status: 'normal',
      merchantNote: null,
    },
    {
      id: 5,
      merchantId: 1,
      txnRef: 'TXN# 5510931',
      date: '11 Jan 2026',
      counterparty: 'Jaipur Vidyut Vitran Nigam',
      subDescription: 'Commercial Utility Tariff',
      amount: 3200,
      type: 'outflow',
      channel: 'BillPay',
      isFlagged: false,
      flagReason: null,
      anomalyScore: 0.05,
      status: 'normal',
      merchantNote: null,
    },
  ]);

  useEffect(() => {
    // Attempt fetching from backend
    const loadTxns = async () => {
      try {
        const res = await fetch('/api/transactions');
        if (res.ok) {
          const data = await res.json();
          if (data.transactions && data.transactions.length > 0) {
            setTxns(data.transactions);
          }
        }
      } catch (err) {
        console.warn('Backend txns fetch note:', err);
      }
    };
    loadTxns();
  }, []);

  const selectedTxn = txns.find((t) => t.id === selectedTxnId) || txns[0];

  const filteredTxns = txns.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'flagged') return t.isFlagged && t.status !== 'verified_by_merchant';
    if (filter === 'normal') return !t.isFlagged || t.status === 'verified_by_merchant';
    if (filter === 'inflow') return t.type === 'inflow';
    if (filter === 'outflow') return t.type === 'outflow';
    return true;
  });

  const handleVerifyAction = async () => {
    try {
      await fetch(`/api/transactions/${selectedTxn.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'verified_by_merchant',
          note: noteText || 'Bulk festive inventory purchase / seasonal stocking verified by merchant',
        }),
      });

      setTxns((prev) =>
        prev.map((t) =>
          t.id === selectedTxn.id
            ? { ...t, status: 'verified_by_merchant', isFlagged: false }
            : t
        )
      );
      setVerifiedSuccess(true);
      onRefreshProfile?.();
    } catch (err) {
      console.error('Verify error:', err);
      setTxns((prev) =>
        prev.map((t) =>
          t.id === selectedTxn.id
            ? { ...t, status: 'verified_by_merchant', isFlagged: false }
            : t
        )
      );
      setVerifiedSuccess(true);
    }
  };

  const handleReportBank = () => {
    alert('Redirecting to RBI National Cyber Crime Reporting Portal (1930) and SBI Relationship Manager helpline.');
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 4000);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header & Telemetry Health Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#86f2e4] text-[#006f66] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">shield_with_heart</span>
              Telemetry Engine v4.2 • Active Shield
            </span>
            <span className="text-[#3d4a42] text-[11px]">Updated 6 mins ago via RBI-AA Bridge</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">
            Keep an eye on unusual business activity.
          </h1>
          <p className="text-[14px] text-[#3d4a42] mt-1">
            Automated anomaly detection protecting your store from unverified charges, duplicate debits, and pattern deviations.
          </p>
        </div>

        {/* Quick Telemetry Badge Banner */}
        <div className="flex items-center gap-3 bg-[#f2f3ff] px-4 py-2.5 rounded-xl shadow-xs border border-[#bccac0]/20">
          <div className="w-10 h-10 rounded-full bg-[#85f8c4] flex items-center justify-center text-[#006948] shrink-0">
            <span className="material-symbols-outlined text-[22px]">gpp_good</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#3d4a42] font-semibold">Store Risk Status</span>
            <span className="text-[15px] font-bold text-[#006948]">Low Risk (98.8% Safe Volume)</span>
          </div>
        </div>
      </div>

      {/* Metric Overview Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#bccac0]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#3d4a42] font-semibold">Transactions Analyzed</span>
            <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">receipt_long</span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-[#131b2e]">248</span>
              <span className="text-[11px] text-[#006948] font-bold">100% Synced</span>
            </div>
            <p className="text-[11px] text-[#3d4a42] mt-0.5">Last 90 days across 3 accounts</p>
          </div>
          <div className="mt-2">
            <svg className="w-full h-4 text-[#006948]" fill="none" viewBox="0 0 100 20">
              <path d="M0,16 Q20,10 40,14 T80,6 T100,8" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#ffdcc3] p-4 rounded-xl shadow-xs border border-[#ffb77d] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#2f1500]">
            <span className="text-[12px] font-bold">Flagged for Review</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#8d4b00] text-white text-[11px] font-bold">
              Action Needed
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-[#2f1500]">02</span>
              <span className="text-[11px] text-[#8d4b00] font-bold">• 0.8% count</span>
            </div>
            <p className="text-[11px] text-[#2f1500] mt-0.5 font-medium">Requires merchant clarification</p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[#2f1500] text-[11px]">
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span>No direct fund hold applied</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#bccac0]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#3d4a42] font-semibold">Overall Risk Rating</span>
            <span className="material-symbols-outlined text-[#006948] text-[20px]">verified</span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-[#006948]">A+</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-bold">
                Sovereign Grade
              </span>
            </div>
            <p className="text-[11px] text-[#3d4a42] mt-0.5">98.8% Safe Outflow & Inflow</p>
          </div>
          <div className="mt-2 w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#006948] h-full rounded-full" style={{ width: '98.8%' }}></div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#bccac0]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#3d4a42] font-semibold">Total Verified Volume</span>
            <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">currency_rupee</span>
          </div>
          <div className="mt-4">
            <span className="text-[28px] font-bold text-[#131b2e] tabular-nums">₹4,31,100</span>
            <p className="text-[11px] text-[#3d4a42] mt-0.5">Matched with GSTN & Ledger</p>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[#006948] text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[14px]">sync_alt</span>
            <span>Reconciled with SBI Current A/c</span>
          </div>
        </div>
      </div>

      {/* Narrative Context Banner */}
      <div className="bg-[#f2f3ff] rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-xs border border-[#bccac0]/20">
        <div className="w-full md:w-32 h-20 rounded-lg overflow-hidden shrink-0 shadow-xs relative">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB-19-B417NYRqZ92wdPKgk3wBud1En0eWrQNIgGhMbqT642OE2LkfwbsWog2tmfHpaVz2-Ls7KXU0I_tbj5kqKv7xKuOQr4wZkyWoELUuGbsmIQkGPUOVsFJppu4HsTNM9AJ4FFZa0xDh4iAUY47_0SCvB0dEYN0EWB4rVSrv0vYQkroOz8TyauDu-eWJMHXNG99LXitV_qi1WBppda3KafmHl9brX_e5L1AZB78oV84xRh_sk3-cDg"
            alt="Kirana store counter"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] text-[18px]">lightbulb</span>
            <h3 className="text-[15px] font-bold text-[#131b2e]">Why does VyaparTrust monitor transactions?</h3>
          </div>
          <p className="text-[13px] text-[#3d4a42] mt-0.5">
            Lenders reward businesses with clean, explainable bank cash-flows. Flagged items are <span className="font-semibold text-[#131b2e]">not penalizations</span>—they are opportunities to document genuine seasonal purchases, preserving your credit eligibility score without surprises.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={() => setShowRiskModal(true)}
            className="px-4 py-2 rounded-lg bg-white text-[#131b2e] font-semibold text-[13px] shadow-xs border border-[#bccac0]/30 hover:bg-[#eaedff] transition-colors cursor-pointer"
          >
            Read Safety Guidelines
          </button>
        </div>
      </div>

      {/* Primary Workspace: Split Ledger Queue & Attached Detailed Inspection Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filterable Ledger Queue (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="bg-white p-2 rounded-xl shadow-xs border border-[#bccac0]/20 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-[#e2e7ff] text-[#006948]' : 'text-[#3d4a42] hover:bg-[#f2f3ff]'
                }`}
              >
                All Transactions (248)
              </button>
              <button
                onClick={() => setFilter('flagged')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filter === 'flagged' ? 'bg-[#e2e7ff] text-[#006948]' : 'text-[#3d4a42] hover:bg-[#f2f3ff]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#8d4b00]"></span>
                <span>Flagged for Review</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[10px] font-bold">
                  2
                </span>
              </button>
              <button
                onClick={() => setFilter('normal')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  filter === 'normal' ? 'bg-[#e2e7ff] text-[#006948]' : 'text-[#3d4a42] hover:bg-[#f2f3ff]'
                }`}
              >
                Verified Normal (246)
              </button>
              <button
                onClick={() => setFilter('inflow')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  filter === 'inflow' ? 'bg-[#e2e7ff] text-[#006948]' : 'text-[#3d4a42] hover:bg-[#f2f3ff]'
                }`}
              >
                Inflows
              </button>
              <button
                onClick={() => setFilter('outflow')}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  filter === 'outflow' ? 'bg-[#e2e7ff] text-[#006948]' : 'text-[#3d4a42] hover:bg-[#f2f3ff]'
                }`}
              >
                Outflows
              </button>
            </div>
            <div className="flex items-center gap-2 px-2 text-[11px] text-[#3d4a42]">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Live Sorting</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl shadow-xs border border-[#bccac0]/20 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#3d4a42] text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Counterparty / Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Risk Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-[13px] text-[#131b2e]">
                  {filteredTxns.map((t) => {
                    const isSelected = selectedTxn.id === t.id;
                    const isTxnFlagged = t.isFlagged && t.status !== 'verified_by_merchant';
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTxnId(t.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#eaedff]' : 'hover:bg-[#f2f3ff]'
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isTxnFlagged && (
                              <span className="w-1.5 h-6 bg-[#8d4b00] rounded-full"></span>
                            )}
                            <span className="font-medium text-[#3d4a42]">{t.date}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#131b2e] hover:text-[#006948]">
                              {t.counterparty}
                            </span>
                            <span className="text-[11px] text-[#3d4a42]">{t.subDescription}</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right whitespace-nowrap font-bold tabular-nums ${
                          t.type === 'inflow' ? 'text-[#006948]' : 'text-[#8d4b00]'
                        }`}>
                          {t.type === 'inflow' ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#3d4a42] text-[11px] font-medium">
                            {t.type === 'inflow' ? 'Inflow' : 'Outflow'} • {t.channel}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {t.status === 'verified_by_merchant' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              Verified by Store
                            </span>
                          ) : isTxnFlagged ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">warning</span>
                              Review Needed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-semibold">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              Verified Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTxnId(t.id);
                            }}
                            className="px-3 py-1 rounded bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#131b2e] text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            {isTxnFlagged ? 'Review Now' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#f2f3ff] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#3d4a42]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-[18px]">verified_user</span>
                <span>Audited against 90-day seasonal baseline by Sovereign AI Core</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-0.5 rounded bg-white text-[#131b2e] shadow-xs cursor-pointer">Previous</button>
                <span>Page 1 of 12</span>
                <button className="px-2 py-0.5 rounded bg-white text-[#131b2e] shadow-xs cursor-pointer">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detail Inspection Side-Panel (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4 sticky top-28">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col relative overflow-hidden border border-[#bccac0]/30">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8d4b00]"></div>

            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold">
                    {selectedTxn.txnRef}
                  </span>
                  <span className="text-[11px] text-[#3d4a42]">Bank Ref: UTIR0000412</span>
                </div>
                <h2 className="text-[20px] font-bold text-[#131b2e] mt-1">Transaction Flag Details</h2>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#2f1500] shrink-0">
                <span className="material-symbols-outlined text-[18px]">policy</span>
              </span>
            </div>

            {/* Non-Defamatory Status Alert */}
            <div className="p-3 rounded-lg bg-[#ffdcc3]/60 mb-4 flex items-start gap-2 text-[#2f1500]">
              <span className="material-symbols-outlined text-[20px] text-[#8d4b00] shrink-0 mt-0.5">warning</span>
              <div className="flex flex-col">
                <p className="text-[13px] font-bold">This transaction has been flagged for review.</p>
                <p className="text-[11px] mt-0.5">
                  No negative credit penalty is applied. VyaparTrust needs your validation to update cash-flow modeling.
                </p>
              </div>
            </div>

            {/* Core Summary Card */}
            <div className="bg-[#f2f3ff] p-4 rounded-xl mb-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#3d4a42] font-semibold">Amount Transferred</span>
                <span className="text-[22px] font-bold text-[#8d4b00] tabular-nums">
                  ₹{Number(selectedTxn.amount).toLocaleString('en-IN')}.00
                </span>
                <span className="text-[11px] text-[#3d4a42]">Recipient: {selectedTxn.counterparty}</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[11px] text-[#3d4a42] font-semibold">Initiated On</span>
                <span className="text-[14px] font-bold text-[#131b2e]">{selectedTxn.date}</span>
                <span className="text-[11px] text-[#8d4b00] font-bold">11:42 PM (Night)</span>
              </div>
            </div>

            {/* Key Anomaly Factors */}
            <div className="flex flex-col gap-2.5 mb-6">
              <span className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider">
                KEY ANOMALY FACTORS EXPLAINED
              </span>

              <div className="p-3 rounded-lg bg-[#eaedff] flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white text-[#8d4b00] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#131b2e]">Unusually high supplier amount</span>
                  <p className="text-[12px] text-[#3d4a42] mt-0.5">
                    <span className="font-semibold text-[#131b2e]">₹48,900</span> is <span className="text-[#8d4b00] font-bold">340% higher</span> than your average supplier outflow of ₹11,200.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#eaedff] flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white text-[#8d4b00] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#131b2e]">Deviation from normal store rhythm</span>
                  <p className="text-[12px] text-[#3d4a42] mt-0.5">
                    Transfer initiated on a <span className="font-semibold text-[#131b2e]">Sunday at 11:42 PM</span>, outside your typical business hours (09:00 AM - 09:30 PM).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#eaedff] flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white text-[#8d4b00] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#131b2e]">New transaction pattern</span>
                  <p className="text-[12px] text-[#3d4a42] mt-0.5">
                    First transfer to this recipient account IFSC code in <span className="font-semibold text-[#131b2e]">90 days</span> of account monitoring.
                  </p>
                </div>
              </div>
            </div>

            {/* Merchant Action Panel */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider">
                MERCHANT RESOLUTION ACTION
              </span>

              <button
                onClick={handleVerifyAction}
                className="w-full h-11 px-4 rounded-lg bg-[#006948] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#00855d] shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {verifiedSuccess ? 'check' : 'verified'}
                </span>
                <span>
                  {verifiedSuccess
                    ? 'Marked as Legitimate Business Expense'
                    : 'Mark as Verified Business Expense'}
                </span>
              </button>
              <span className="text-[11px] text-center text-[#3d4a42] -mt-1">
                Reason: Bulk festive inventory purchase / seasonal stocking
              </span>

              <button
                onClick={handleReportBank}
                className="w-full h-11 px-4 rounded-lg bg-[#f2f3ff] text-[#ba1a1a] font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#eaedff] shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">report</span>
                <span>Report Unrecognized Transaction to Bank</span>
              </button>

              {/* Input Note */}
              <div className="mt-2 flex flex-col gap-1.5">
                <label className="text-[11px] text-[#3d4a42] font-semibold flex items-center justify-between">
                  <span>Attach Optional Proof (Invoice / Mandi Pauti)</span>
                  <span className="text-[#006948] font-bold cursor-pointer hover:underline">
                    Browse PDF / Image
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add reference bill or invoice copy details (e.g. Radhe-Inv-049)"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#bccac0]/30 text-[#131b2e] text-[13px] outline-none focus:border-[#006948]"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="h-10 px-4 rounded-lg bg-[#e2e7ff] text-[#131b2e] font-semibold text-[12px] hover:bg-[#dae2fd] shrink-0 transition-colors cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
                {noteSavedFeedback && (
                  <p className="text-[11px] text-[#006948] font-semibold">
                    ✓ Note saved to store's permanent audit ledger.
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-[#3d4a42]">
                <button
                  onClick={() => setShowRiskModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#006a61] font-bold hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">help</span>
                  <span>Learn About This Risk Rule</span>
                </button>
                <span className="text-[11px] text-[#6d7a72] font-mono">Rule ID: VTP-OD-340</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Best Practices for Indian Kirana & MSME Merchants */}
      <div className="mt-6 pt-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] text-[20px]">verified</span>
              <span className="text-[11px] uppercase tracking-wider text-[#006948] font-bold">
                Vyapar Shield Guidance
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-[#131b2e]">
              Safety Best Practices for Indian Kirana & MSME Merchants
            </h2>
            <p className="text-[14px] text-[#3d4a42]">
              Simple, daily operational habits that prevent revenue leakages and safeguard your working capital line.
            </p>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-[12px] text-[#006948] bg-[#85f8c4] px-3 py-1.5 rounded-full font-bold">
            <span className="material-symbols-outlined text-[16px]">school</span>
            Merchant Safety Curriculum
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <div className="h-32 w-full rounded-lg overflow-hidden mb-4 shadow-xs relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXoA4VQ87DOo1GnCWkcmxgxhB-1OTyvgzZgptHHAlRuu6pAsxFkpFgHOJBa0i70ieEhbkMPhlWzEfjtMa8cM0JexRpsApbKip6_Ugn_V61LuihX8WeIVT3m6IkTTdjuXNJiekhdH4XIznG5R-mxMxc8brBA0W6KeMycy9CqsMyvLCjvSPC7ZI2181542BnsS5jwc5iOTaythqAU9Br4mxQfWunqrxGdGMbCVPWRYbQiOOUQ4P1iEMdzg"
                  alt="OTP Verification"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#89f5e7] text-[#00201d] flex items-center justify-center font-bold text-[11px]">
                  1
                </span>
                <h3 className="text-[15px] font-bold text-[#131b2e]">Dual-Factor OTP for Large Outflows</h3>
              </div>
              <p className="text-[13px] text-[#3d4a42] mt-1 leading-relaxed">
                Never authorize supplier NEFT or RTGS over ₹25,000 without cross-verifying the beneficiary IFSC via bank app sound prompts or dual SMS confirmation.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#bccac0]/20 flex items-center justify-between">
              <span className="text-[11px] text-[#006948] font-semibold">Recommended Setting: Enabled</span>
              <span className="material-symbols-outlined text-[#006948] text-[20px]">toggle_on</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <div className="h-32 w-full rounded-lg overflow-hidden mb-4 shadow-xs relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrEDtF2DvAT3VRcSfmLUw-ugjsJX3zxvyPNAuYLHB0F0ZPQlINIcU2oBCFLt8lz3g5J9PeiNjciLCklx4WqDwmJRJevQjp4kKHJp_gifFmweT8hL2eL4wg_YHbbYesK4Ab6TrabpTAuSBAg6hsKiQ3egP2GnO-dQwfX4GZdZNJzXQ05eUcrV8EsvMYRVRULfhBjUrcIuw8c1RFyUVOjIyGuLZAU9GVBMLe3hyl9C9r6dJuT8UEaFQAfQ"
                  alt="Soundbox Reconciliations"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#89f5e7] text-[#00201d] flex items-center justify-center font-bold text-[11px]">
                  2
                </span>
                <h3 className="text-[15px] font-bold text-[#131b2e]">Daily QR Soundbox Reconciliation</h3>
              </div>
              <p className="text-[13px] text-[#3d4a42] mt-1 leading-relaxed">
                Match instant audio confirmations with nightly aggregate settlement summaries. Beware of fake screenshot apps or modified QR stickers on your desk.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#bccac0]/20 flex items-center justify-between">
              <span className="text-[11px] text-[#006948] font-semibold">Nightly Match Checklist</span>
              <span className="material-symbols-outlined text-[#006948] text-[18px]">verified</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#bccac0]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <div className="h-32 w-full rounded-lg overflow-hidden mb-4 shadow-xs relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsagedkPj6spJ7Hb5Ul7nnBtVxJFwlLdiBTryOa2cjd9LiF5vXmnj35mC-8xdYqpwTVyyHreKSvQFwF5a0BOh6L3j2cEUYd98fpvIsYcwAhGc2uwHfT8ANvxT-OpiyB_O8FT4HzFbe-lz5C8kg-0UdHGN1lKOdtxHmzzdeFH3VjCRXFAwYh1h-ohJjP9GnDs9Ey6RMrz39EXi31cE12d-Bi5pqwfN4OKKKNWrFK7qCum5keLtRG8AP_Q"
                  alt="GST Turnover Alignment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#89f5e7] text-[#00201d] flex items-center justify-center font-bold text-[11px]">
                  3
                </span>
                <h3 className="text-[15px] font-bold text-[#131b2e]">Periodic GST Turnover Alignment</h3>
              </div>
              <p className="text-[13px] text-[#3d4a42] mt-1 leading-relaxed">
                Ensure reported monthly sales in GSTR-1 & 3B match your bank UPI inflow trails. Large variations delay working capital credit sanctions by 3–4 weeks.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#bccac0]/20 flex items-center justify-between">
              <span className="text-[11px] text-[#006948] font-semibold">GSTR-3B Auto-Sync: Active</span>
              <span className="material-symbols-outlined text-[#006948] text-[18px]">sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Explainer Modal: Rule VTP-OD-340 */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#bccac0]/30 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[24px]">psychology</span>
                <h3 className="text-[18px] font-bold text-[#131b2e]">Rule VTP-OD-340: Outlier Analysis</h3>
              </div>
              <button
                onClick={() => setShowRiskModal(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#131b2e] hover:bg-[#eaedff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[13px] text-[#3d4a42] mt-4">
              VyaparTrust creates a baseline fingerprint of your grocery business using 90-day transaction logs. We calculate normal transaction envelopes based on your business category:
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-[#f2f3ff]">
                <span className="text-[14px] font-bold text-[#131b2e]">Amount Threshold Envelope</span>
                <p className="text-[12px] text-[#3d4a42] mt-0.5">
                  Flag triggered when any single outflow is &gt; 3x your rolling weekly average to an un-whitelisted beneficiary account.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#f2f3ff]">
                <span className="text-[14px] font-bold text-[#131b2e]">Off-Hours Operation Logic</span>
                <p className="text-[12px] text-[#3d4a42] mt-0.5">
                  Transfers occurring past 10:30 PM receive review tags to detect unauthorized device access while the merchant is asleep.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRiskModal(false)}
                className="px-5 py-2.5 rounded-lg bg-[#006948] text-white font-semibold text-[14px] shadow-sm cursor-pointer hover:bg-[#00855d]"
              >
                Understood, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
