import React, { useState, useEffect, useRef } from 'react';
import { NavPath, Merchant, ChatMessage, Language } from '../types.ts';
import { GeminiLiveVoiceModal } from '../components/GeminiLiveVoiceModal.tsx';

interface AIFinancialCoachViewProps {
  merchant: Merchant | null;
  onNavigate: (path: NavPath) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  initialQuery?: string;
}

export const AIFinancialCoachView: React.FC<AIFinancialCoachViewProps> = ({
  merchant,
  onNavigate,
  language,
  onLanguageChange,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [showLiveVoiceModal, setShowLiveVoiceModal] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If an initial query was passed from overview quick prompt
    if (initialQuery && initialQuery.trim() !== '') {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }),
      });

      if (!res.ok) throw new Error('API failure');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Coach API call failed:', err);
      // Grounded fallback
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Namaste Ramesh ji! Based on your 90-day transactions (₹1.6L/month turnover), your store is in Good Standing (78/100). Resolving your 2 flagged transactions and keeping a ₹35,000 liquid buffer will elevate you to Tier-1 (85+ score), qualifying for up to ₹1.5L low-interest credit lines.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeechToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
    } else {
      const textToSpeak =
        language === 'hi'
          ? 'नमस्ते रमेश जी! आपका स्कोर अठहत्तर है क्योंकि आपके पास स्थिर नकद प्रवाह है। तीस दिनों का बैकअप बनाने पर स्कोर पचासी प्लस हो सकता है।'
          : 'Namaste Ramesh ji! Your score is 78 because your business has stable inflows and regular transaction activity. Building a 30-day cash buffer unlocks a score of 85+ and lowers interest rates.';

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      setIsAudioPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Merchant Identity & Real-time Analytical Telemetry Bar */}
      <section className="bg-white rounded-xl p-4 shadow-xs border border-[#bccac0]/20 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#006948]">
              <span className="material-symbols-outlined text-[32px]">storefront</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00855d] flex items-center justify-center ring-2 ring-white">
              <span className="material-symbols-outlined text-[10px] text-white">check</span>
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-bold text-[#131b2e]">
                {merchant?.storeName || 'Ramesh General Store'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#3d4a42] text-[11px] font-semibold">
                Jaipur, RJ
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span> Consented MSME Identity
              </span>
            </div>
            <p className="text-[13px] text-[#3d4a42]">
              Sovereign Financial Passport ID: <span className="font-mono text-[#131b2e] font-semibold">{merchant?.passportUid || 'IND-RJ-JAI-9941'}</span> • Last Live AA Sync: Today, 08:30 AM
            </p>
          </div>
        </div>

        {/* Telemetry Badges Strip */}
        <div className="flex flex-wrap items-center gap-2 xl:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f2f3ff]">
            <span className="material-symbols-outlined text-[#006948] text-[18px]">favorite</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#3d4a42] font-semibold">Health Index</span>
              <span className="text-[15px] text-[#006948] font-bold">78 / 100</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffdcc3] text-[#2f1500]">
            <span className="material-symbols-outlined text-[18px]">flag</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold">Safety Check</span>
              <span className="text-[15px] font-bold">2 Flagged</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f2f3ff]">
            <span className="material-symbols-outlined text-[#006a61] text-[18px]">hourglass_top</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#3d4a42] font-semibold">Cash Buffer</span>
              <span className="text-[15px] text-[#131b2e] font-bold">18 Days</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f2f3ff]">
            <span className="material-symbols-outlined text-[#6d7a72] text-[18px]">account_balance_wallet</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#3d4a42] font-semibold">Est. Credit Line</span>
              <span className="text-[15px] text-[#131b2e] font-bold">₹50k - ₹1.0L</span>
            </div>
          </div>

          <div className="flex items-center p-1 rounded-full bg-[#e2e7ff] ml-auto xl:ml-0">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                language === 'en' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                language === 'hi' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                language === 'bn' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42]'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Gemini Live Voice Mode Button */}
          <button
            onClick={() => setShowLiveVoiceModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#006948] to-[#00855d] text-white text-[12px] font-bold shadow-sm hover:from-[#00855d] hover:to-[#006948] transition-all cursor-pointer group shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-[#85f8c4] animate-ping" />
            <span className="material-symbols-outlined text-[17px] text-[#85f8c4]">graphic_eq</span>
            <span>Gemini Live Voice</span>
          </button>
        </div>
      </section>

      {/* Page Header Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-[#006948] text-[12px] font-bold mb-1">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>AGENTIC UNDERWRITING ADVISORY</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">
            Your Personal Financial Coach for Business
          </h1>
          <p className="text-[14px] text-[#3d4a42]">
            Conversational, explainable guidance powered by your consented financial identity. Tailored for Indian micro-merchants.
          </p>
        </div>

        <button
          onClick={handleSpeechToggle}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer ${
            isAudioPlaying
              ? 'bg-[#ba1a1a] text-white animate-pulse'
              : 'bg-[#89f5e7] text-[#00201d] hover:bg-[#6bd8cb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isAudioPlaying ? 'volume_off' : 'volume_up'}
          </span>
          <span className="text-[12px] font-bold">
            {isAudioPlaying ? 'Stop Audio (रोकें)' : 'Listen in Hindi (ऑडियो सुनें)'}
          </span>
        </button>
      </div>

      {/* Primary Workspace: Split 2-Column Mesh Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left & Center Conversational Chamber (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-6 min-h-[500px]">
            {/* AI Coach Initial Salutation Card */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">assistant</span>
              </div>
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#131b2e]">Vyapar AI Coach</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[11px] font-semibold text-[#3d4a42]">
                    Live Model 4.2
                  </span>
                  <span className="text-[11px] text-[#6d7a72]">08:31 AM</span>
                </div>
                <div className="p-4 rounded-2xl rounded-tl-xs bg-[#f2f3ff] text-[#131b2e] shadow-xs">
                  <p className="text-[14px] leading-relaxed">
                    <span className="font-bold text-[#006948]">Namaste Ramesh ji!</span> I've analyzed your store's last 90 days of transactions. Your inflows are healthy at <strong className="font-semibold text-[#131b2e]">₹1.6L/month</strong>, but you have 2 pending transaction flags and your liquid cash reserve could be strengthened. What would you like to explore today?
                  </p>
                  <div className="mt-3 pt-2 flex items-center gap-2 text-[#3d4a42] text-[12px] border-t border-[#bccac0]/20">
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">translate</span>
                    <span>नमस्ते रमेश जी! आपके स्टोर के पिछले 90 दिनों के लेनदेन का विश्लेषण किया गया है।</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Default Example Exchange */}
            <div className="flex items-start justify-end gap-4">
              <div className="flex flex-col items-end gap-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#6d7a72]">08:34 AM</span>
                  <span className="text-[14px] font-bold text-[#131b2e]">Ramesh Kumar</span>
                </div>
                <div className="p-4 rounded-2xl rounded-tr-xs bg-[#006948] text-white shadow-xs">
                  <p className="text-[14px] font-medium">Why is my financial health score 78?</p>
                </div>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnRvbWBqnUv3MmVOGBf4O6CmK2xl-7kQY8IEXNBLxTVKSTMYT6325BeUSOaLsKBz7OlOCren3xffRlfrGXiM8hM1RaIYDMYxE2WThgKCc4I0KsN1C_nMU_nnpzSs02TIP2TA7I-sEYZ07nTxlQvvqX5jhupxZ1GSJjvcDH40c6a_XzIqbB4GqeLzV2GohTVrlpZ4oQux9keg6WxFBym_ZsC-GsSQoANRY1UWytoN2X3RaqzJ5OvjtXcg"
                alt="Ramesh Kumar"
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-[#85f8c4]"
              />
            </div>

            {/* AI Deep Explainability Breakdown Card */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">assistant</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#131b2e]">Vyapar AI Coach</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                    Verified Breakdown
                  </span>
                  <span className="text-[11px] text-[#6d7a72]">08:34 AM</span>
                </div>

                <div className="p-4 md:p-6 rounded-2xl rounded-tl-xs bg-[#f2f3ff] shadow-xs flex flex-col gap-4">
                  <p className="text-[14px] text-[#131b2e] leading-relaxed">
                    Your score is <strong className="text-[#006948] font-bold">78</strong> because your business has stable inflows and regular transaction activity. Your main opportunities are building a stronger cash reserve and reviewing two unusual transactions.
                  </p>

                  {/* Inline Visual Score Progression Bar */}
                  <div className="p-4 rounded-xl bg-white flex flex-col gap-2 shadow-xs border border-[#bccac0]/20">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#3d4a42] font-semibold">Scoring Archetype: Daily Essentials Retail</span>
                      <span className="text-[#006948] font-bold">Score 78 / 100 • Grade A-</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#eaedff] overflow-hidden flex">
                      <div className="h-full bg-[#006948] transition-all" style={{ width: '78%' }}></div>
                      <div className="h-full bg-[#ffdcc3] transition-all" style={{ width: '14%' }}></div>
                      <div className="h-full bg-[#d2d9f4] transition-all" style={{ width: '8%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6d7a72]">
                      <span>Base Threshold: 50</span>
                      <span>Target for Mudra Fast-Track: 85+</span>
                    </div>
                  </div>

                  {/* Mathematical Deductions Breakdown */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider">
                      EXACT MATHEMATICAL ATTRIBUTION
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-white flex items-start gap-3 shadow-xs border border-[#bccac0]/20">
                        <span className="w-6 h-6 rounded-md bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0 text-[11px] font-bold">
                          +45
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#131b2e]">Daily UPI Velocity</span>
                          <span className="text-[11px] text-[#3d4a42]">₹5.2k avg daily retail customer settlements</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white flex items-start gap-3 shadow-xs border border-[#bccac0]/20">
                        <span className="w-6 h-6 rounded-md bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0 text-[11px] font-bold">
                          +22
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#131b2e]">Supplier Discipline</span>
                          <span className="text-[11px] text-[#3d4a42]">Zero delayed distributor payouts over 90 days</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white flex items-start gap-3 shadow-xs border border-[#bccac0]/20">
                        <span className="w-6 h-6 rounded-md bg-[#ffdcc3] text-[#2f1500] flex items-center justify-center shrink-0 text-[11px] font-bold">
                          -8
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#131b2e]">Liquid Cash Reserve</span>
                          <span className="text-[11px] text-[#3d4a42]">Covers only 18 days (Benchmark: 30 days safe)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white flex items-start gap-3 shadow-xs border border-[#bccac0]/20">
                        <span className="w-6 h-6 rounded-md bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0 text-[11px] font-bold">
                          -6
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#131b2e]">Unverified High Value</span>
                          <span className="text-[11px] text-[#3d4a42]">2 transactions pending invoice or buyer match</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => onNavigate('transaction-safety')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#006948] text-white hover:bg-[#00855d] text-[12px] font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <span>Review 2 Flagged Transactions</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                    <button
                      onClick={() => onNavigate('credit-readiness')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e2e7ff] text-[#131b2e] hover:bg-[#dae2fd] text-[12px] font-semibold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span>
                      <span>Simulate Emergency Reserve</span>
                    </button>
                  </div>

                  {/* Hindi Transliteration Cardlet */}
                  <div className="p-3 rounded-lg bg-[#eaedff] flex items-center gap-2 text-[#3d4a42] text-[11px]">
                    <span className="material-symbols-outlined text-[16px] text-[#8d4b00]">info</span>
                    <span>आपका स्कोर 78 है क्योंकि आपके पास स्थिर नकद प्रवाह है। 30 दिनों का बैकअप बनाने पर स्कोर 85+ हो सकता है।</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Conversation Bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">assistant</span>
                  </div>
                )}
                <div className={`flex flex-col max-w-xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-[#131b2e]">
                      {msg.sender === 'user' ? 'Ramesh Kumar' : 'Vyapar AI Coach'}
                    </span>
                    <span className="text-[10px] text-[#6d7a72]">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-[14px] shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#006948] text-white rounded-tr-xs'
                        : 'bg-[#f2f3ff] text-[#131b2e] rounded-tl-xs whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnRvbWBqnUv3MmVOGBf4O6CmK2xl-7kQY8IEXNBLxTVKSTMYT6325BeUSOaLsKBz7OlOCren3xffRlfrGXiM8hM1RaIYDMYxE2WThgKCc4I0KsN1C_nMU_nnpzSs02TIP2TA7I-sEYZ07nTxlQvvqX5jhupxZ1GSJjvcDH40c6a_XzIqbB4GqeLzV2GohTVrlpZ4oQux9keg6WxFBym_ZsC-GsSQoANRY1UWytoN2X3RaqzJ5OvjtXcg"
                    alt="Ramesh Kumar"
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-[#85f8c4]"
                  />
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3 text-[#3d4a42] text-[13px]">
                <div className="w-8 h-8 rounded-full bg-[#85f8c4] flex items-center justify-center text-[#002114]">
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                </div>
                <span>Vyapar AI Coach is analyzing 90-day telemetry and calculating cash-flow attribution...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider">
                Merchant Quick Prompts • Tap to Ask
              </span>
              <span className="text-[11px] text-[#006948] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Custom queries enabled
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSendMessage('Why is my score 78?')}
                className="px-3 py-1.5 rounded-full bg-[#e2e7ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006948]">analytics</span>
                <span>Why is my score 78?</span>
              </button>
              <button
                onClick={() => handleSendMessage('How can I improve my credit readiness to ₹1,50,000?')}
                className="px-3 py-1.5 rounded-full bg-[#e2e7ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">trending_up</span>
                <span>How can I improve my credit readiness to ₹1,50,000?</span>
              </button>
              <button
                onClick={() => handleSendMessage('Can my business handle a 20% drop in sales?')}
                className="px-3 py-1.5 rounded-full bg-[#e2e7ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#8d4b00]">crisis_alert</span>
                <span>Can my business handle a 20% drop in sales?</span>
              </button>
              <button
                onClick={() => handleSendMessage('Explain my unusual transactions.')}
                className="px-3 py-1.5 rounded-full bg-[#e2e7ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">gpp_maybe</span>
                <span>Explain my unusual transactions.</span>
              </button>
              <button
                onClick={() => handleSendMessage('How much emergency reserve should I maintain for my Jaipur store?')}
                className="px-3 py-1.5 rounded-full bg-[#e2e7ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006948]">savings</span>
                <span>How much emergency reserve should I maintain for my Jaipur store?</span>
              </button>
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="relative pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-[#f2f3ff] focus-within:bg-white focus-within:shadow-md transition-all border border-[#bccac0]/30"
            >
              <button
                type="button"
                onClick={handleSpeechToggle}
                className="p-2 text-[#3d4a42] hover:text-[#006948] rounded-lg transition-colors cursor-pointer"
                title="Voice Input / Audio"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask financial questions in English, Hindi, or Hinglish (e.g. 'Mera loan kaise approve hoga?')..."
                className="w-full bg-transparent text-[#131b2e] placeholder:text-[#6d7a72] text-[14px] focus:outline-none px-2"
              />
              <button
                type="button"
                onClick={() => onNavigate('financial-passport')}
                className="p-2 text-[#3d4a42] hover:text-[#006948] rounded-lg transition-colors cursor-pointer"
                title="Attach GST or Bank Bill"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="px-4 py-2 rounded-lg bg-[#006948] text-white hover:bg-[#00855d] disabled:opacity-50 text-[13px] font-semibold transition-all flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>

          {/* Governance & Disclaimer */}
          <div className="p-4 rounded-xl bg-[#e2e7ff] text-[#3d4a42] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#6d7a72] text-[22px] shrink-0 mt-0.5">lock</span>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-bold text-[#131b2e]">
                Institutional Model Governance & Explainability Guarantee
              </span>
              <p className="text-[11px] leading-relaxed">
                🔒 AI-generated insights are for informational purposes only. VyaparTrust is an MSME data and analysis orchestration platform and does not offer direct financial, credit underwriting, or investment advice. Always verify lending terms directly with your designated financial institution or accredited banking partner.
              </p>
            </div>
          </div>
        </div>

        {/* Right Drawer: Coach Playbook (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Executive Recommendations Playbook */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-xs border border-[#bccac0]/20 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-[20px]">verified</span>
                <h3 className="text-[18px] font-bold text-[#131b2e]">Coach Playbook</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                January 2026
              </span>
            </div>

            <p className="text-[13px] text-[#3d4a42]">
              Priority actions to lift Ramesh General Store from <strong>78</strong> to <strong>86</strong> within 45 operating days:
            </p>

            {/* Action 1 */}
            <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col gap-2 hover:bg-[#eaedff] transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-[11px] font-bold">
                  Action 01
                </span>
                <span className="text-[11px] text-[#006948] font-bold">+5 Score Boost</span>
              </div>
              <p className="font-bold text-[#131b2e] text-[14px]">Daily Auto-Sweep Deposit</p>
              <p className="text-[12px] text-[#3d4a42] leading-relaxed">
                Set aside <strong className="text-[#131b2e]">₹500/day</strong> into an auto-sweep deposit account to reach a 30-day liquid operating buffer by March.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-[#6d7a72]">Target: ₹45,000 buffer</span>
                <button
                  onClick={() => onNavigate('credit-readiness')}
                  className="text-[#006948] text-[12px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Set Rule</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Action 2 */}
            <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col gap-2 hover:bg-[#eaedff] transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold">
                  Action 02
                </span>
                <span className="text-[11px] text-[#8d4b00] font-bold">+4 Safety Index</span>
              </div>
              <p className="font-bold text-[#131b2e] text-[14px]">Resolve ₹48,900 Supplier Tag</p>
              <p className="text-[12px] text-[#3d4a42] leading-relaxed">
                Attach vendor tax invoice for the 12th Jan bulk FMCG transfer to clear anomaly flags with underwriter engines.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-[#6d7a72]">Ref: TXN# 9081248</span>
                <button
                  onClick={() => onNavigate('transaction-safety')}
                  className="text-[#8d4b00] text-[12px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Upload Bill</span>
                  <span className="material-symbols-outlined text-[14px]">upload_file</span>
                </button>
              </div>
            </div>

            {/* Action 3 */}
            <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col gap-2 hover:bg-[#eaedff] transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold">
                  Action 03
                </span>
                <span className="text-[11px] text-[#006948] font-bold">Low Interest</span>
              </div>
              <p className="font-bold text-[#131b2e] text-[14px]">Pre-Qualify for MSME Mudra</p>
              <p className="text-[12px] text-[#3d4a42] leading-relaxed">
                Export your 78-score verified Financial Passport directly to State Bank of India or Bank of Baroda MSME desks.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-[#6d7a72]">Eligible for ₹1.0L Shishu</span>
                <button
                  onClick={() => onNavigate('financial-passport')}
                  className="text-[#006948] text-[12px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Export Core</span>
                  <span className="material-symbols-outlined text-[14px]">file_download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Cash Buffer Sparkline */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#bccac0]/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[20px]">timelapse</span>
                <span className="text-[15px] font-bold text-[#131b2e]">30-Day Liquidity Trajectory</span>
              </div>
              <span className="text-[11px] text-[#3d4a42] font-semibold">Live Projections</span>
            </div>

            <div className="w-full bg-[#f2f3ff] rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[22px] font-bold text-[#131b2e] tabular-nums">₹28,400</span>
                  <span className="text-[11px] text-[#3d4a42] ml-1">Current liquid pool</span>
                </div>
                <span className="text-[11px] text-[#006a61] font-bold">18 of 30 Safe Days</span>
              </div>

              {/* Sparkline Graph */}
              <svg className="w-full h-16 text-[#006948]" fill="none" viewBox="0 0 300 70">
                <path
                  d="M 0 55 Q 50 48, 100 42 T 200 30 T 300 15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></path>
                <line
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeOpacity="0.3"
                  strokeWidth="1.5"
                  x1="0"
                  x2="300"
                  y1="20"
                  y2="20"
                ></line>
                <circle className="fill-white" cx="100" cy="42" r="3.5" stroke="currentColor" strokeWidth="2"></circle>
                <circle className="fill-white" cx="200" cy="30" r="3.5" stroke="currentColor" strokeWidth="2"></circle>
                <circle className="fill-[#006948]" cx="300" cy="15" r="4.5"></circle>
              </svg>

              <div className="flex items-center justify-between text-[10px] text-[#6d7a72] font-semibold">
                <span>Today (18d buffer)</span>
                <span>Target Day 45 (32d buffer)</span>
              </div>
            </div>

            <p className="text-[11px] text-[#3d4a42]">
              Consistent UPI settlement sweeping will insulate Ramesh General Store against seasonal supplier cost surges during the Holi festival cycle.
            </p>
          </div>

          {/* Geo-Location Validated Card */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#bccac0]/20 flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[#f2f3ff]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtKXtJQ5vm6V7cRNVcq7SpFRGAtJEjZizLUT1B_7UtjPUsakCp6zMyZM-vTxGfBFYU-o1jzez2_vVY6cTzQ3I3MMfd0TBC3YGwE3feJVYtT4-Ad6JaOJaISAa_enaF2_At8LZPVk10roklwIM8L1rRE0R0eHuC3qsQx3vo5vIjtMdTeupnWRnsI9qPFXKNc14Jbg_hy-qZdHjDfwkv4mgZdWp6CLgeyPyEDj8NaOay_aTDo7lix75bCQ"
                alt="Storefront"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1 text-[#006948]">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span className="text-[11px] font-bold truncate">Johari Bazaar, Jaipur</span>
              </div>
              <span className="text-[14px] font-bold text-[#131b2e] truncate">Geo-Location Validated</span>
              <p className="text-[11px] text-[#3d4a42] line-clamp-2">
                Physical storefront geo-tag matches Udyam & GST registration records.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Live Conversational Voice Experience Modal */}
      <GeminiLiveVoiceModal
        isOpen={showLiveVoiceModal}
        onClose={() => setShowLiveVoiceModal(false)}
        merchant={merchant}
        language={language}
      />
    </div>
  );
};
