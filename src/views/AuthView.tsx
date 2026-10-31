import React, { useState } from 'react';
import { NavPath } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { VyaparLogo } from '../components/VyaparLogo.tsx';

interface AuthViewProps {
  onNavigate: (path: NavPath) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const { loginWithGoogle, loginWithEmailOrPin, registerWithEmail, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [emailOrPhone, setEmailOrPhone] = useState('ramesh.store@vyapartrust.in');
  const [pin, setPin] = useState('1234');
  const [name, setName] = useState('Ramesh Kumar');
  const [storeName, setStoreName] = useState('Ramesh General Store');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeHudMetric, setActiveHudMetric] = useState<'cashflow' | 'health' | 'credit'>('cashflow');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const success = await loginWithEmailOrPin(emailOrPhone, pin);
      if (success) {
        onNavigate('overview');
      } else {
        setErrorMsg('Invalid credentials. You can use the Quick Demo Login below.');
      }
    } catch {
      setErrorMsg('Login failed. Please try again or use Quick Demo.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const success = await registerWithEmail({
        email: emailOrPhone,
        name,
        storeName,
      });
      if (success) {
        onNavigate('onboarding');
      } else {
        setErrorMsg('Could not register merchant profile. Please try again.');
      }
    } catch {
      setErrorMsg('Registration error. Please check your details.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      const success = await loginWithGoogle();
      if (success) {
        onNavigate('overview');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Google Sign-In was cancelled or popup blocked. You can use the Quick Demo button.');
    }
  };

  const handleQuickDemo = async () => {
    await loginWithEmailOrPin('ramesh.store@vyapartrust.in', '1234');
    onNavigate('overview');
  };

  return (
    <div className="relative min-h-screen bg-[#071122] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-x-hidden font-sans selection:bg-[#38bdf8] selection:text-[#071122]">
      {/* Cinematic Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-[#0284c7]/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-[#34d399]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto flex items-center justify-between pb-4 sm:pb-6 border-b border-white/10">
        <VyaparLogo
          size="lg"
          theme="dark"
          subtitle={language === 'hi' ? 'संप्रभु एमएसएमई अंडरराइटिंग' : language === 'bn' ? 'সার্বভৌম এমএসএমই আন্ডাররাইটিং' : 'Sovereign MSME Underwriting Protocol'}
        />

        {/* Language Selector */}
        <div className="flex items-center bg-[#0d1d36] rounded-full p-1 border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-[#071122] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-[#071122] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => setLanguage('bn')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              language === 'bn'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-[#071122] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            বাংলা
          </button>
        </div>
      </header>

      {/* Main Hero Split Content */}
      <main className="relative z-10 max-w-7xl w-full mx-auto my-auto py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Sign In & Registration Card (5.5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-[#0b1a30]/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.65)] flex flex-col gap-5">
            {/* Header Titles */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold mb-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  {language === 'hi' ? 'आरबीआई अकाउंट एग्रीगेटर पावर्ड' : language === 'bn' ? 'আরবিআই অ্যাকাউন্ট এগ্রিগেটর যুক্ত' : 'RBI Account Aggregator Network'}
                </span>
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-black text-white tracking-tight leading-snug">
                {tab === 'signin' ? t('welcomeVyapari') : t('createPassport')}
              </h1>
              <p className="text-[13px] text-gray-300 mt-1 leading-relaxed">
                {tab === 'signin' ? t('signinDesc') : t('registerDesc')}
              </p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="flex bg-[#071224] p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-[#071122] shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('tabSignIn')}
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-[#071122] shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('tabRegister')}
              </button>
            </div>

            {/* Google Sign-in Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t('continueWithGoogle')}</span>
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                {t('orWithCredentials')}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-[12px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Forms */}
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-300">{t('emailOrPhone')}</label>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="ramesh.store@vyapartrust.in"
                    className="px-4 py-2.5 rounded-xl bg-[#071224] border border-white/10 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold text-gray-300">{t('securityPin')}</label>
                    <button
                      type="button"
                      onClick={() => alert('Demo PIN is 1234. Use 1-Click Instant Demo below.')}
                      className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      {t('forgotPin')}
                    </button>
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="px-4 py-2.5 rounded-xl bg-[#071224] border border-white/10 text-[14px] text-white tracking-widest placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-[#071122] text-[14px] font-black hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {isLoading ? t('authenticating') : t('signInBtn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-300">{t('fullNameLabel')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ramesh Kumar"
                      className="px-3.5 py-2.5 rounded-xl bg-[#071224] border border-white/10 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-300">{t('storeNameInput')}</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ramesh General Store"
                      className="px-3.5 py-2.5 rounded-xl bg-[#071224] border border-white/10 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-300">{t('businessEmail')}</label>
                  <input
                    type="email"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="merchant@example.com"
                    className="px-3.5 py-2.5 rounded-xl bg-[#071224] border border-white/10 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-[#071122] text-[14px] font-black hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {isLoading ? t('creatingProfile') : t('registerBtn')}
                </button>
              </form>
            )}

            {/* Quick Demo Access Button */}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-400/10 border border-cyan-400/40 text-cyan-300 text-[12px] font-bold hover:bg-cyan-400/20 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[17px] text-cyan-400">bolt</span>
                <span>{t('quickDemoBtn')}</span>
              </button>
            </div>
          </div>

          {/* Privacy & Trust Safeguards Bar */}
          <div className="flex items-center justify-between px-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-cyan-400">lock</span>
              <span>DPDP Act 2023 Compliant</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">verified</span>
              <span>Zero Hard Bureau Inquiries</span>
            </span>
          </div>
        </div>

        {/* Right Column: Reference Visual Showcase with Merchant & Augmented Reality Holographic HUD (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Visual Showcase Frame */}
          <div className="relative rounded-3xl overflow-hidden border border-cyan-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_50px_rgba(56,189,248,0.2)] bg-[#071325] group">
            {/* The Reference Photograph: Indian Merchant in Shop with Holographic HUD */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-30_at_5.09.47_PM_297aef54.jpeg"
                alt="VyaparTrust Sovereign Merchant with Holographic Intelligence Interface"
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Gentle Vignette Gradient for Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#071122] via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Floating Live Badge Overlay on Image */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#071325]/85 backdrop-blur-md border border-cyan-400/40 text-white text-[11px] font-bold shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-cyan-300">Live Sovereign Intelligence</span>
                <span className="text-white/40">•</span>
                <span className="font-mono text-emerald-400">Udaipur MSME Pilot</span>
              </div>
            </div>

            {/* Bottom Interactive HUD Details Bar directly under visual */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#07152b] via-[#091b35] to-[#081830] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Donut progress ring matching reference image */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset="19"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3.5"
                      strokeDasharray="88"
                      strokeDashoffset="72"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[12px] font-black text-white">78</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-extrabold text-white">
                      Ramesh General Store
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      Tier-1 Grade A-
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Proprietor: <span className="text-white font-medium">Ramesh Kumar</span> • Udaipur, Rajasthan
                  </p>
                </div>
              </div>

              {/* Pre-Approved Limit & Telemetry Vector */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                    {language === 'hi' ? 'पूर्व-स्वीकृत क्रेडिट सीमा' : language === 'bn' ? 'প্রাক-অনুমোদিত ক্রেডিট লিমিট' : 'Pre-Approved Credit Band'}
                  </span>
                  <span className="text-[16px] font-black text-cyan-300 tabular-nums">
                    ₹1,00,000 – ₹3,50,000
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-[#071122] text-[12px] font-extrabold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <span>Explore Passport</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Three Live Telemetry Explainers (Reflecting the 3 cards in the HUD) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: Wave Inflow Velocity */}
            <div
              onClick={() => setActiveHudMetric('cashflow')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                activeHudMetric === 'cashflow'
                  ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                  : 'bg-[#0b1a30]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  {language === 'hi' ? 'दैनिक यूपीआई प्रवाह' : language === 'bn' ? 'দৈনিক ইউপিআই ফ্লো' : 'Daily Inflow Velocity'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-cyan-400">trending_up</span>
              </div>
              <div className="text-[18px] font-black text-white tabular-nums">
                ₹14,820 <span className="text-[11px] font-medium text-cyan-300">/ day</span>
              </div>
              <p className="text-[10px] text-gray-300 line-clamp-1">
                92% active trade days across 90-day window
              </p>
            </div>

            {/* Card 2: Health Score Radial */}
            <div
              onClick={() => setActiveHudMetric('health')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                activeHudMetric === 'health'
                  ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                  : 'bg-[#0b1a30]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  {language === 'hi' ? 'स्वास्थ्य स्कोर' : language === 'bn' ? 'হেলথ স্কোর' : 'Health Score'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-emerald-400">speed</span>
              </div>
              <div className="text-[18px] font-black text-emerald-400 tabular-nums">
                78 / 100 <span className="text-[11px] font-medium text-gray-300">(Grade A-)</span>
              </div>
              <p className="text-[10px] text-gray-300 line-clamp-1">
                +16 pts above Udaipur Kirana sector median (62)
              </p>
            </div>

            {/* Card 3: Mandate Fulfillment Shield */}
            <div
              onClick={() => setActiveHudMetric('credit')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                activeHudMetric === 'credit'
                  ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                  : 'bg-[#0b1a30]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  {language === 'hi' ? 'सप्लायर अनुशासन' : language === 'bn' ? 'সাপ্লায়ার নিয়মানুবর্তিতা' : 'Supplier Mandates'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-teal-400">verified_user</span>
              </div>
              <div className="text-[18px] font-black text-teal-300 tabular-nums">
                0 Bounces <span className="text-[11px] font-medium text-emerald-300">(100% Clean)</span>
              </div>
              <p className="text-[10px] text-gray-300 line-clamp-1">
                Punctual NACH settlements for FMCG wholesalers
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Sovereign Trust Protocol Note */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-400">
        <div>
          <span>© 2026 VyaparTrust Sovereign Protocol. All Rights Reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('consent-privacy')}>
            DPDP Act Privacy Policy
          </span>
          <span className="text-gray-600">•</span>
          <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('underwriter-verification')}>
            Underwriter Verification Node
          </span>
          <span className="text-gray-600">•</span>
          <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('consent-privacy')}>
            RBI AA Architecture
          </span>
        </div>
      </footer>
    </div>
  );
};
