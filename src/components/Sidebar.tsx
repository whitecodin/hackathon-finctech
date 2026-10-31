import React from 'react';
import { NavPath, Merchant } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { VyaparLogo } from './VyaparLogo.tsx';

interface SidebarProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  merchant: Merchant | null;
  flaggedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  merchant,
  flaggedCount = 2,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const signedInName = user?.displayName || merchant?.ownerName || (user?.email ? user.email.split('@')[0] : 'Ramesh Kumar');
  const storeName = merchant?.storeName || (user?.displayName ? `${user.displayName}'s Store` : 'Ramesh General Store');
  const avatarUrl = user?.photoURL || merchant?.profilePhotoUrl;
  const storeLocation = merchant?.location || 'Johari Bazaar, Udaipur';

  const navItems: Array<{
    id: NavPath;
    label: string;
    icon: string;
    badge?: { text: string; bg: string; textCol: string };
  }> = [
    { id: 'overview', label: t('navOverview', 'Overview'), icon: 'dashboard' },
    {
      id: 'financial-passport',
      label: t('navFinancialPassport', 'Financial Passport'),
      icon: 'verified_user',
      badge: { text: t('activeStatus', 'Active'), bg: 'bg-[#85f8c4]', textCol: 'text-[#002114]' },
    },
    { id: 'credit-readiness', label: t('navCreditReadiness', 'Credit Readiness'), icon: 'trending_up' },
    {
      id: 'transaction-safety',
      label: t('navTransactionSafety', 'Transaction Safety'),
      icon: 'gpp_maybe',
      badge: flaggedCount > 0 ? { text: `${flaggedCount} ${t('flaggedStatus', 'Flagged')}`, bg: 'bg-[#ffdcc3]', textCol: 'text-[#2f1500]' } : undefined,
    },
    { id: 'business-resilience', label: t('navBusinessResilience', 'Business Resilience'), icon: 'query_stats' },
    {
      id: 'ai-financial-coach',
      label: t('navAIFinancialCoach', 'AI Financial Coach'),
      icon: 'smart_toy',
      badge: { text: 'AI', bg: 'bg-[#89f5e7]', textCol: 'text-[#00201d]' },
    },
    { id: 'consent-privacy', label: t('navConsentPrivacy', 'Consent & Privacy'), icon: 'privacy_tip' },
    { id: 'settings', label: t('navSettings', 'Settings'), icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-40 bg-white border-r border-[#bccac0] flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate('overview')}
          className="h-16 px-5 flex items-center border-b border-[#bccac0] bg-white cursor-pointer select-none hover:bg-slate-50 transition-colors"
        >
          <VyaparLogo
            size="md"
            theme="light"
            subtitle={language === 'hi' ? 'संप्रभु एमएसएमई' : language === 'bn' ? 'সার্বভৌম এমএসএমই' : 'Sovereign MSME'}
          />
        </div>

        {/* Merchant Summary Card */}
        <div className="p-4 border-b border-[#bccac0] bg-[#f2f3ff]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 truncate">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={signedInName}
                  className="w-9 h-9 rounded-full object-cover border border-[#006948] shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {signedInName[0]}
                </div>
              )}
              <div className="truncate">
                <p className="text-[14px] font-bold text-[#131b2e] truncate leading-tight">
                  {storeName}
                </p>
                <p className="text-[11px] text-[#3d4a42] truncate font-medium">
                  {signedInName}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#6d7a72] text-[18px] shrink-0 mt-1">storefront</span>
          </div>
          <p className="text-[11px] text-[#3d4a42] truncate mb-2">
            📍 {storeLocation}
          </p>
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#bccac0]/30">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] border border-[#68dba9]">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span className="text-[11px] font-bold">
                {merchant?.healthScore || 78} / 100 • {t('goodStanding', 'Good')}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#006948] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00855d] animate-pulse"></span>
              Firebase & SQL
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-[14px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e2e7ff] text-[#006948] font-semibold shadow-xs'
                    : 'text-[#3d4a42] hover:bg-[#eaedff] hover:text-[#131b2e]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#006948]' : 'text-[#6d7a72]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${item.badge.bg} ${item.badge.textCol}`}>
                    {item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer MSME Telemetry Status */}
      <div className="p-4 border-t border-[#bccac0] bg-[#f2f3ff]">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-[#00855d] animate-pulse"></span>
          <span className="text-[11px] text-[#131b2e] font-semibold">{t('syncStatus', '90 Days Active Sync')}</span>
        </div>
        <p className="text-[11px] text-[#3d4a42] mb-3">
          {t('telemetryActive', 'Continuous MSME telemetry active')}
        </p>
        <button 
          onClick={() => onNavigate('ai-financial-coach')}
          className="inline-flex items-center gap-1.5 text-[12px] text-[#006948] font-bold hover:underline cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">support_agent</span>
          <span>{t('helpDesk', 'Need help? Speak with MSME desk')}</span>
        </button>
      </div>
    </aside>
  );
};
