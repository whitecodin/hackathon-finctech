import React, { useState, useEffect } from 'react';
import { SavingsGoal, Merchant } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SavingsGoalTrackerProps {
  merchant: Merchant | null;
  dailyBurn?: number;
}

const DEFAULT_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: '30-Day Emergency Kirana Reserve',
    category: 'emergency',
    targetAmount: 75000,
    currentAmount: 52500,
    targetDate: '2026-03-31',
    color: '#006948',
    icon: 'savings',
    createdAt: '2026-01-01',
    notes: 'Liquid emergency fund to safeguard store operations against sudden seasonal disruptions.',
  },
  {
    id: 'goal-2',
    name: 'Diwali Bulk FMCG Inventory Advance',
    category: 'inventory',
    targetAmount: 120000,
    currentAmount: 84000,
    targetDate: '2026-09-30',
    color: '#00855d',
    icon: 'inventory_2',
    createdAt: '2026-01-05',
    notes: 'Advance cash pool for wholesale bulk discounts on dry fruits and gift packages.',
  },
  {
    id: 'goal-3',
    name: 'Deep Freezer & Power Backup Fund',
    category: 'equipment',
    targetAmount: 35000,
    currentAmount: 28000,
    targetDate: '2026-05-15',
    color: '#006a61',
    icon: 'mode_fan',
    createdAt: '2026-01-10',
    notes: 'Commercial inverter and ice-cream display unit upgrade.',
  },
];

export const SavingsGoalTracker: React.FC<SavingsGoalTrackerProps> = ({
  merchant,
  dailyBurn = 9800,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vyapartrust_savings_goals');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_GOALS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // New Goal Form State
  const [newGoalName, setNewGoalName] = useState('');
  const [newCategory, setNewCategory] = useState<SavingsGoal['category']>('emergency');
  const [newTargetAmount, setNewTargetAmount] = useState<number>(50000);
  const [newCurrentAmount, setNewCurrentAmount] = useState<number>(10000);
  const [newTargetDate, setNewTargetDate] = useState('2026-06-30');
  const [newNotes, setNewNotes] = useState('');

  // Save to localStorage & Firestore whenever goals change
  const saveGoals = async (updatedGoals: SavingsGoal[]) => {
    setGoals(updatedGoals);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vyapartrust_savings_goals', JSON.stringify(updatedGoals));
    }

    // Persist to Cloud Firestore
    const uid = user?.uid || 'demo-ramesh-user-uid';
    try {
      const settingsRef = doc(db, 'settings', uid);
      await setDoc(settingsRef, { savingsGoals: updatedGoals, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore goals sync note:', err);
    }
  };

  // Load from Firestore on mount
  useEffect(() => {
    const uid = user?.uid || 'demo-ramesh-user-uid';
    const fetchFirestoreGoals = async () => {
      try {
        const settingsRef = doc(db, 'settings', uid);
        const snap = await getDoc(settingsRef);
        if (snap.exists() && snap.data()?.savingsGoals) {
          setGoals(snap.data().savingsGoals);
        }
      } catch (err) {
        console.warn('Firestore load goals note:', err);
      }
    };
    fetchFirestoreGoals();
  }, [user?.uid]);

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const totalRunwayAdded = Math.round(totalSaved / Math.max(dailyBurn, 1000));

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name: newGoalName.trim(),
      category: newCategory,
      targetAmount: Number(newTargetAmount) || 50000,
      currentAmount: Number(newCurrentAmount) || 0,
      targetDate: newTargetDate,
      color: newCategory === 'emergency' ? '#006948' : newCategory === 'inventory' ? '#00855d' : '#006a61',
      icon: newCategory === 'emergency' ? 'savings' : newCategory === 'inventory' ? 'inventory_2' : newCategory === 'equipment' ? 'precision_manufacturing' : 'store',
      createdAt: new Date().toISOString().split('T')[0],
      notes: newNotes.trim() || undefined,
    };

    const updated = [...goals, newGoal];
    saveGoals(updated);
    setIsModalOpen(false);
    resetForm();
    showFeedback(language === 'hi' ? 'नया बचत लक्ष्य सफलतापूर्वक बनाया गया!' : language === 'bn' ? 'নতুন সঞ্চয় লক্ষ্য সফলভাবে তৈরি হয়েছে!' : 'New Savings Goal created successfully!');
  };

  const resetForm = () => {
    setNewGoalName('');
    setNewCategory('emergency');
    setNewTargetAmount(50000);
    setNewCurrentAmount(10000);
    setNewTargetDate('2026-06-30');
    setNewNotes('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit || depositAmount <= 0) return;

    const updated = goals.map((g) => {
      if (g.id === selectedGoalForDeposit.id) {
        return {
          ...g,
          currentAmount: Math.min(g.targetAmount * 1.5, g.currentAmount + Number(depositAmount)),
        };
      }
      return g;
    });

    saveGoals(updated);
    setIsDepositModalOpen(false);
    showFeedback(
      language === 'hi'
        ? `₹${depositAmount.toLocaleString('en-IN')} सफलतापूर्वक जमा किए गए!`
        : language === 'bn'
        ? `₹${depositAmount.toLocaleString('en-IN')} সফলভাবে জমা হয়েছে!`
        : `₹${depositAmount.toLocaleString('en-IN')} successfully added to goal!`
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    saveGoals(updated);
    showFeedback(language === 'hi' ? 'बचत लक्ष्य हटा दिया गया' : language === 'bn' ? 'সঞ্চয় লক্ষ্য মুছে ফেলা হয়েছে' : 'Savings Goal deleted');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const applyPreset = (name: string, target: number, initial: number, cat: SavingsGoal['category']) => {
    setNewGoalName(name);
    setNewTargetAmount(target);
    setNewCurrentAmount(initial);
    setNewCategory(cat);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#bccac0]/30 shadow-xs flex flex-col gap-6 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#85f8c4]/15 blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#bccac0]/20 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#e2e7ff] text-[#006948] flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[26px]">savings</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-black text-[#131b2e] tracking-tight">
                {t('savingsGoalsTitle', 'Emergency Savings Goals & Target Buffers')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#85f8c4] text-[#002114] shadow-2xs">
                {goals.length} {t('activeStatus', 'Active')}
              </span>
            </div>
            <p className="text-[13px] text-[#3d4a42] mt-0.5">
              {t('savingsGoalsSubtitle', 'Set, name, and visualize milestone progress towards Kirana liquidity safety reserves.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-bold text-[13px] shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{t('addSavingsGoal', 'Create Savings Goal')}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] text-[13px] font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Overall Savings Summary Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 rounded-2xl bg-[#f7f9f6] border border-[#bccac0]/25 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a72]">
            Total Target Buffer
          </span>
          <div className="text-[28px] font-black text-[#131b2e] my-1 tabular-nums">
            ₹{totalTarget.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#3d4a42]">Across {goals.length} target milestones</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#e8f5e9]/70 border border-[#a5d6a7]/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2e7d32]">
            Total Accumulated
          </span>
          <div className="text-[28px] font-black text-[#1b5e20] my-1 tabular-nums">
            ₹{totalSaved.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#2e7d32] font-semibold">
            {overallPercentage}% funded
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#f2f3ff] border border-[#bccac0]/30 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006948]">
            {t('runwayContribution', 'Runway Boost')}
          </span>
          <div className="text-[28px] font-black text-[#006948] my-1 tabular-nums">
            +{totalRunwayAdded} {t('days', 'Days')}
          </div>
          <span className="text-[11px] text-[#3d4a42]">Autonomous Kirana runway added</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#fff8e1]/70 border border-[#ffe082] flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#f57f17]">
            {t('remainingToTarget', 'Remaining')}
          </span>
          <div className="text-[28px] font-black text-[#e65100] my-1 tabular-nums">
            ₹{Math.max(0, totalTarget - totalSaved).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#f57f17] font-semibold">To reach full liquidity peace-of-mind</span>
        </div>
      </div>

      {/* Grid of Individual Goal Cards with Circular Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10 pt-2">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isComplete = percent >= 100;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const runwayDays = Math.round(goal.currentAmount / Math.max(dailyBurn, 1000));

          // SVG circle math (radius = 42, circumference = 2 * PI * 42 ≈ 263.89)
          const radius = 42;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (percent / 100) * circumference;

          return (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-white border border-[#bccac0]/35 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Card Details */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xs shrink-0"
                      style={{ backgroundColor: isComplete ? '#006948' : goal.color || '#006948' }}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isComplete ? 'check_circle' : goal.icon || 'savings'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#006948]">
                        {goal.category}
                      </span>
                      <h3 className="text-[16px] font-extrabold text-[#131b2e] leading-snug mt-1 line-clamp-1">
                        {goal.name}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    title={t('deleteGoal', 'Delete Goal')}
                    className="text-[#6d7a72] hover:text-[#ba1a1a] p-1 rounded-lg hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {/* Circular Progress Bar Visualizer */}
                <div className="flex items-center justify-between gap-4 my-4 p-4 rounded-2xl bg-[#f7f9f6] border border-[#bccac0]/20">
                  {/* SVG Circular Ring */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      {/* Background track circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#e2e7ff"
                        strokeWidth="9"
                      />
                      {/* Animated Foreground Progress Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={isComplete ? '#006948' : goal.color || '#006948'}
                        strokeWidth="9"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[18px] font-black text-[#131b2e] leading-none">
                        {percent}%
                      </span>
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#6d7a72] mt-0.5">
                        {isComplete ? t('completed', 'Done') : t('inProgress', 'Saved')}
                      </span>
                    </div>
                  </div>

                  {/* Amounts & Metrics */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div>
                      <span className="text-[10px] text-[#6d7a72] font-semibold">{t('currentSaved', 'Saved')}</span>
                      <div className="text-[20px] font-black text-[#006948] tabular-nums">
                        ₹{goal.currentAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#3d4a42] font-semibold">
                      {t('targetAmount', 'Target')}: <strong className="text-[#131b2e]">₹{goal.targetAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] text-[#6d7a72]">
                      <span className="material-symbols-outlined text-[12px] text-[#006948]">bolt</span>
                      <span>+{runwayDays} days OpEx buffer</span>
                    </div>
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-[12px] text-[#3d4a42] line-clamp-2 italic mb-2">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#bccac0]/20 flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-[#6d7a72]">
                  {isComplete
                    ? (language === 'hi' ? 'लक्ष्य पूरा हुआ! 🎉' : language === 'bn' ? 'লক্ষ্য সম্পন্ন হয়েছে! 🎉' : 'Goal Achieved! 🎉')
                    : `₹${remaining.toLocaleString('en-IN')} ${t('remainingToTarget', 'left')}`}
                </span>
                <button
                  onClick={() => {
                    setSelectedGoalForDeposit(goal);
                    setDepositAmount(5000);
                    setIsDepositModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e2e7ff] text-[#006948] hover:bg-[#006948] hover:text-white font-bold text-[12px] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add_card</span>
                  <span>{t('depositFunds', 'Add Funds')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#bccac0] flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/30">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#e2e7ff] text-[#006948] material-symbols-outlined text-[20px]">
                  flag
                </span>
                <h3 className="text-[18px] font-black text-[#131b2e]">
                  {t('addSavingsGoal', 'Create New Emergency Savings Goal')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#6d7a72] hover:text-[#131b2e] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Presets Ribbon */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#3d4a42]">Quick Kirana Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('30-Day Emergency Reserve', 75000, 20000, 'emergency')}
                  className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#006948] text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + 30-Day Reserve (₹75k)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Monsoon Inventory Buffer', 60000, 15000, 'inventory')}
                  className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#006948] text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + Monsoon Buffer (₹60k)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Cold Storage & Freezer', 40000, 10000, 'equipment')}
                  className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#006948] text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + Cold Storage (₹40k)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#3d4a42] mb-1">
                  {t('goalName', 'Goal Name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30-Day Monsoon Emergency Buffer"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#3d4a42] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#006948] cursor-pointer"
                  >
                    <option value="emergency">Emergency Reserve</option>
                    <option value="inventory">Inventory Advance</option>
                    <option value="equipment">Equipment & Assets</option>
                    <option value="renovation">Store Renovation</option>
                    <option value="other">Other Kirana Target</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#3d4a42] mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#3d4a42] mb-1">
                    {t('targetAmount', 'Target Amount (₹)')}
                  </label>
                  <input
                    type="number"
                    min="5000"
                    step="1000"
                    required
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#3d4a42] mb-1">
                    {t('currentSaved', 'Current Initial Amount (₹)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newCurrentAmount}
                    onChange={(e) => setNewCurrentAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#3d4a42] mb-1">
                  Purpose / Kirana Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Set aside 10% daily UPI surplus for wholesale payments"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#131b2e] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#3d4a42] hover:bg-[#eaedff] font-bold text-[13px] cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-bold text-[13px] shadow-sm cursor-pointer"
                >
                  {t('confirm', 'Save Goal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Funds Modal */}
      {isDepositModalOpen && selectedGoalForDeposit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#bccac0] flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/30">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#e8f5e9] text-[#1b5e20] material-symbols-outlined text-[20px]">
                  add_card
                </span>
                <h3 className="text-[18px] font-black text-[#131b2e]">
                  {t('depositFunds', 'Deposit to Savings Goal')}
                </h3>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-[#6d7a72] hover:text-[#131b2e] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#bccac0]/30 flex flex-col gap-1">
              <span className="text-[11px] text-[#6d7a72] font-semibold">Target Goal:</span>
              <span className="text-[15px] font-black text-[#131b2e]">{selectedGoalForDeposit.name}</span>
              <div className="flex justify-between text-[11px] text-[#3d4a42] mt-1">
                <span>Current: <strong>₹{selectedGoalForDeposit.currentAmount.toLocaleString('en-IN')}</strong></span>
                <span>Target: <strong>₹{selectedGoalForDeposit.targetAmount.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#3d4a42] mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-[#bccac0] bg-[#f7f9f6] text-[#006948] text-[20px] font-black focus:outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex gap-2">
                {[1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#006948] text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#3d4a42] hover:bg-[#eaedff] font-bold text-[13px] cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-bold text-[13px] shadow-sm cursor-pointer"
                >
                  {t('confirm', 'Confirm Deposit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
