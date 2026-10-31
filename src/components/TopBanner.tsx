import React from 'react';
import { NavPath } from '../types.ts';

interface TopBannerProps {
  onNavigate: (path: NavPath) => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onNavigate }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-[#ffdcc3] border-b border-[#bccac0] flex items-center justify-between px-6 text-[11px] font-medium text-[#6e3900]">
      <div className="flex items-center gap-2 truncate">
        <span className="material-symbols-outlined text-[15px] text-[#8d4b00]">lock</span>
        <span className="truncate">
          Demo Mode — All financial and credit figures are synthetic demo insights. VyaparTrust is not a lender and does not approve loans.
        </span>
      </div>
      <button 
        onClick={() => onNavigate('consent-privacy')} 
        className="text-[11px] text-[#8d4b00] font-semibold hover:underline shrink-0 ml-4 cursor-pointer"
      >
        Consent & Privacy Settings
      </button>
    </div>
  );
};
