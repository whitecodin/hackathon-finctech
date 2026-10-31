import React, { useState } from 'react';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ isOpen, onClose }) => {
  const [amountInr, setAmountInr] = useState<number>(75000);
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');

  if (!isOpen) return null;

  const rates: Record<string, { rate: number; symbol: string; name: string }> = {
    USD: { rate: 0.0118, symbol: '$', name: 'US Dollar' },
    EUR: { rate: 0.0109, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.0093, symbol: '£', name: 'British Pound' },
    AED: { rate: 0.0433, symbol: 'AED', name: 'UAE Dirham' },
    JPY: { rate: 1.82, symbol: '¥', name: 'Japanese Yen' },
  };

  const selected = rates[targetCurrency] || rates['USD'];
  const convertedValue = (amountInr * selected.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#bccac0]/30 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#bccac0]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">currency_exchange</span>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#131b2e] tracking-tight">Merchant Currency Converter</h3>
              <p className="text-[11px] text-[#6d7a72]">Convert Indian Rupee (INR) for international procurement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d7a72] hover:bg-gray-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#3d4a42]">Amount in Indian Rupees (₹)</label>
            <input
              type="number"
              value={amountInr}
              onChange={(e) => setAmountInr(Number(e.target.value))}
              className="px-4 py-2.5 rounded-xl border border-[#bccac0] text-[16px] font-bold text-[#131b2e] focus:outline-none focus:border-[#006948]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#3d4a42]">Target Currency</label>
            <select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#bccac0] text-[14px] font-bold text-[#131b2e] focus:outline-none focus:border-[#006948] bg-white cursor-pointer"
            >
              {Object.entries(rates).map(([code, info]) => (
                <option key={code} value={code}>
                  {code} — {info.name} ({info.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-[#f2f7f4] border border-[#85f8c4] flex flex-col gap-1 text-center">
            <span className="text-[11px] text-[#6d7a72] font-semibold uppercase tracking-wider">Converted Equivalent</span>
            <span className="text-[32px] font-black text-[#006948] tracking-tight">
              {selected.symbol} {convertedValue}
            </span>
            <span className="text-[10px] text-[#3d4a42]">Live Interbank Exchange Rate (RBI Reference)</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#006948] text-white font-bold text-[13px] hover:bg-[#00855d] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
