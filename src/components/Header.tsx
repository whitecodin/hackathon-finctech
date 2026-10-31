import React, { useState } from 'react';
import { NavPath, Language, Merchant } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface HeaderProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  merchant: Merchant | null;
  onOpenLiveVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  merchant,
  onOpenLiveVoice,
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'verification' | 'policy'>('all');

  const getBreadcrumbTitle = () => {
    switch (currentPath) {
      case 'financial-passport':
        return t('navFinancialPassport', 'Financial Passport');
      case 'credit-readiness':
        return t('navCreditReadiness', 'Pre-Underwriting Intelligence');
      case 'transaction-safety':
        return t('navTransactionSafety', 'Transaction Safety & Anomalies');
      case 'business-resilience':
        return t('navBusinessResilience', 'Business Resilience Analysis');
      case 'ai-financial-coach':
        return t('navAIFinancialCoach', 'AI Financial Coach');
      case 'consent-privacy':
        return t('navConsentPrivacy', 'Consent & Privacy Ledger');
      case 'onboarding':
        return t('navOnboarding', 'Onboarding Gateway');
      case 'settings':
        return t('navSettings', 'Store & Telemetry Settings');
      default:
        return t('sovereignCore', 'Sovereign Underwriting Core');
    }
  };

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'credit' | 'verification' | 'policy' | 'anomaly';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    targetPath: NavPath;
  }>>([
    {
      id: '1',
      type: 'credit',
      title: 'Credit Limit Upgraded to ₹7,50,000',
      message: 'Sovereign Underwriting Engine approved +₹1,50,000 limit based on 90-day UPI stability.',
      timestamp: '10 mins ago',
      isRead: false,
      targetPath: 'credit-readiness'
    },
    {
      id: '2',
      type: 'verification',
      title: 'Pending Document Verification: GSTIN',
      message: 'GSTIN 07AABCT3421K1Z8 return filing verification pending for credit tier upgrade.',
      timestamp: '1 hour ago',
      isRead: false,
      targetPath: 'onboarding'
    },
    {
      id: '3',
      type: 'policy',
      title: 'Trust Policy Update: 45-Day Buffer',
      message: 'Executive Board updated sovereign credit guidelines. Zero-interest credit buffer extended to 45 days.',
      timestamp: 'Yesterday',
      isRead: true,
      targetPath: 'consent-privacy'
    },
    {
      id: '4',
      type: 'anomaly',
      title: 'Unusual Supplier Transfer Flagged',
      message: '₹48,900 transfer to Radhe Shyam Wholesale Traders pending review against baseline.',
      timestamp: '2 hours ago',
      isRead: false,
      targetPath: 'transaction-safety'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id: string, targetPath: NavPath) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    onNavigate(targetPath);
    setShowNotificationMenu(false);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'credit') return n.type === 'credit';
    if (activeTab === 'verification') return n.type === 'verification';
    if (activeTab === 'policy') return n.type === 'policy';
    return true;
  });

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#bccac0] z-30 px-6 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Left Breadcrumb */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onNavigate('overview')}
          className="material-symbols-outlined text-[#6d7a72] text-[18px] hover:text-[#006948] cursor-pointer"
        >
          home
        </button>
        <span className="text-[#6d7a72] text-[12px]">/</span>
        <span className="text-[12px] font-semibold text-[#3d4a42]">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Center Consent Status Pill */}
      <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eaedff] border border-[#bccac0]">
        <span className="material-symbols-outlined text-[#006948] text-[16px]">check_circle</span>
        <span className="text-[11px] font-medium text-[#131b2e]">
          {t('consentVerified', 'Consent verified • Last synced Today 08:30 AM')}
        </span>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex items-center bg-[#e2e7ff] rounded-full p-0.5 border border-[#bccac0]">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white text-[#131b2e] shadow-xs'
                : 'text-[#3d4a42] hover:text-[#131b2e]'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-white text-[#131b2e] shadow-xs'
                : 'text-[#3d4a42] hover:text-[#131b2e]'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('bn')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              language === 'bn'
                ? 'bg-white text-[#131b2e] shadow-xs'
                : 'text-[#3d4a42] hover:text-[#131b2e]'
            }`}
          >
            বাংলা
          </button>
        </div>

        {/* Gemini Live Voice Quick Action */}
        {onOpenLiveVoice && (
          <button
            onClick={onOpenLiveVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#006948] to-[#00855d] text-white text-[11px] font-bold shadow-xs hover:shadow-sm hover:brightness-110 transition-all cursor-pointer group shrink-0"
            title="Open Gemini Live Voice Coach"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#85f8c4] animate-ping" />
            <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">graphic_eq</span>
            <span className="hidden sm:inline">Gemini Voice</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative p-2 rounded-full text-[#3d4a42] hover:bg-[#eaedff] hover:text-[#131b2e] transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-[#bccac0] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#eaedff] pb-3 mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#131b2e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#006948] text-[16px]">notifications_active</span>
                    {t('notificationsTitle', 'Sovereign Trust Alerts')}
                  </h4>
                  <p className="text-[10px] text-[#6d7a72]">{t('notificationsSubtitle', 'Real-time credit limits, verifications & policies')}</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold text-[#006948] hover:underline cursor-pointer"
                  >
                    {t('markAllRead', 'Mark all read')}
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#eaedff] p-1 rounded-lg mb-3">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    activeTab === 'all' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42] hover:text-[#131b2e]'
                  }`}
                >
                  {t('filterAll', 'All')} ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('credit')}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    activeTab === 'credit' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42] hover:text-[#131b2e]'
                  }`}
                >
                  {t('filterCredit', 'Credit')}
                </button>
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    activeTab === 'verification' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42] hover:text-[#131b2e]'
                  }`}
                >
                  {t('filterVerify', 'Verify')}
                </button>
                <button
                  onClick={() => setActiveTab('policy')}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    activeTab === 'policy' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42] hover:text-[#131b2e]'
                  }`}
                >
                  {t('filterPolicy', 'Policy')}
                </button>
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-6 text-[#6d7a72] text-[12px]">
                    {t('noNotifications', 'No notifications in this category.')}
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id, notif.targetPath)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        notif.isRead
                          ? 'bg-white border-[#bccac0]/50 hover:bg-[#f8f9fa]'
                          : notif.type === 'credit'
                          ? 'bg-[#e8f5e9] border-[#a5d6a7] hover:bg-[#c8e6c9]'
                          : notif.type === 'verification'
                          ? 'bg-[#fff8e1] border-[#ffe082] hover:bg-[#ffecb3]'
                          : notif.type === 'policy'
                          ? 'bg-[#e3f2fd] border-[#bbdefb] hover:bg-[#bbdefb]/70'
                          : 'bg-[#ffebee] border-[#ffcdd2] hover:bg-[#ffcdd2]/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className={`material-symbols-outlined text-[18px] mt-0.5 ${
                            notif.type === 'credit' ? 'text-[#2e7d32]' :
                            notif.type === 'verification' ? 'text-[#f57f17]' :
                            notif.type === 'policy' ? 'text-[#1565c0]' : 'text-[#c62828]'
                          }`}>
                            {notif.type === 'credit' ? 'trending_up' :
                             notif.type === 'verification' ? 'verified' :
                             notif.type === 'policy' ? 'gavel' : 'warning'}
                          </span>
                          <div>
                            <p className="font-semibold text-[12px] text-[#131b2e] leading-tight">
                              {language === 'hi' && notif.type === 'credit' ? 'क्रेडिट सीमा ₹7,50,000 तक बढ़ाई गई' :
                               language === 'hi' && notif.type === 'verification' ? 'लंबित दस्तावेज़ सत्यापन: GSTIN' :
                               language === 'hi' && notif.type === 'policy' ? 'ट्रस्ट नीति अपडेट: 45-दिन बफर' :
                               language === 'hi' && notif.type === 'anomaly' ? 'संदिग्ध आपूर्तिकर्ता हस्तांतरण' :
                               language === 'bn' && notif.type === 'credit' ? 'ক্রেডিট সীমা ₹৭,৫০,০০০-এ উন্নীত' :
                               language === 'bn' && notif.type === 'verification' ? 'বাকি নথি যাচাইকরণ: GSTIN' :
                               language === 'bn' && notif.type === 'policy' ? 'ট্রাস্ট নীতি আপডেট: ৪৫-দিনের বাফার' :
                               language === 'bn' && notif.type === 'anomaly' ? 'সন্দেহজনক সরবরাহকারী স্থানান্তর' :
                               notif.title}
                            </p>
                            <p className="text-[#3d4a42] text-[11px] mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#006948] shrink-0 mt-1"></span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-black/5 text-[10px] text-[#6d7a72]">
                        <span>{notif.timestamp}</span>
                        <span className="font-medium text-[#006948] hover:underline">{t('viewDetails', 'View details →')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 border-l border-[#bccac0] cursor-pointer select-none"
          >
            <img
              src={user?.photoURL || merchant?.profilePhotoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAnRvbWBqnUv3MmVOGBf4O6CmK2xl-7kQY8IEXNBLxTVKSTMYT6325BeUSOaLsKBz7OlOCren3xffRlfrGXiM8hM1RaIYDMYxE2WThgKCc4I0KsN1C_nMU_nnpzSs02TIP2TA7I-sEYZ07nTxlQvvqX5jhupxZ1GSJjvcDH40c6a_XzIqbB4GqeLzV2GohTVrlpZ4oQux9keg6WxFBym_ZsC-GsSQoANRY1UWytoN2X3RaqzJ5OvjtXcg"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-[#006948]"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-[12px] font-semibold text-[#131b2e] truncate">
                {user?.displayName || merchant?.ownerName || 'Ramesh Kumar'}
              </span>
              <span className="text-[11px] text-[#3d4a42] truncate">
                {merchant?.storeName || 'Ramesh General Store'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">expand_more</span>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#bccac0] py-2 z-50">
              <div className="px-4 py-2 border-b border-[#eaedff]">
                <p className="text-[12px] font-bold text-[#131b2e]">{user?.displayName || 'Ramesh Kumar'}</p>
                <p className="text-[11px] text-[#3d4a42]">{user?.email || 'ramesh.store@vyapartrust.in'}</p>
              </div>
              <button
                onClick={() => { onNavigate('financial-passport'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-[12px] text-[#3d4a42] hover:bg-[#eaedff] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>{t('myPassport', 'My Financial Passport')}</span>
              </button>
              <button
                onClick={() => { onNavigate('onboarding'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-[12px] text-[#3d4a42] hover:bg-[#eaedff] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>{t('navOnboarding', 'Onboarding Gateway')}</span>
              </button>
              <button
                onClick={() => { onNavigate('auth'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-[12px] text-[#3d4a42] hover:bg-[#eaedff] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>{t('navSwitchAccount', 'Switch / Sign In Account')}</span>
              </button>
              <div className="border-t border-[#eaedff] my-1"></div>
              <button
                onClick={() => { logout(); onNavigate('auth'); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-[12px] text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>{t('navSignOut', 'Sign Out')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
