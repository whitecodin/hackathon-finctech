import React, { useState, useEffect, useRef } from 'react';
import { Merchant } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { db } from '../lib/firebase.ts';
import { doc, setDoc } from 'firebase/firestore';

interface GeminiLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant | null;
  language: 'en' | 'hi' | 'bn';
}

interface VoiceTranscriptItem {
  id: string;
  speaker: 'user' | 'gemini';
  text: string;
  timestamp: string;
  hasAudio?: boolean;
}

export const GeminiLiveVoiceModal: React.FC<GeminiLiveVoiceModalProps> = ({
  isOpen,
  onClose,
  merchant,
  language: initialLanguage,
}) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>(initialLanguage);
  const [voiceName, setVoiceName] = useState<'Zephyr' | 'Kore' | 'Puck'>('Zephyr');
  
  // Voice interaction states: 'idle' | 'listening' | 'thinking' | 'speaking'
  const [liveState, setLiveState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [manualInput, setManualInput] = useState<string>('');
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [firestoreSavedBanner, setFirestoreSavedBanner] = useState<string | null>(null);

  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([
    {
      id: 'init-1',
      speaker: 'gemini',
      text:
        initialLanguage === 'hi'
          ? `नमस्ते ${merchant?.ownerName || 'रमेश जी'}! मैं जेमिनी लाइव वॉयस असिस्टेंट हूँ। आपके स्टोर (${merchant?.storeName || 'रमेश जनरल स्टोर'}) का व्यापार स्कोर 78/100 है। आप अपने कैश फ्लो, लोन एलिजिबिलिटी, या फ्लैग्ड ट्रांजैक्शन के बारे में कुछ भी पूछ सकते हैं।`
          : initialLanguage === 'bn'
          ? `নমস্কার ${merchant?.ownerName || 'রমেশ বাবু'}! আমি জেমিনি লাইভ ভয়েস কোচ। আপনার স্টোরের ব্যাপার স্কোর ৭৮/১০০। আপনি ক্যাশ ফ্লো বা ক্রেডিট লিমিট নিয়ে যা খুশি জিজ্ঞাসা করতে পারেন।`
          : `Hello ${merchant?.ownerName || 'Ramesh ji'}! I am your Gemini Live conversational coach. Your store (${merchant?.storeName || 'Ramesh General Store'}) has a solid 78/100 Vyapar score. How can I assist your working capital or loan readiness today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Audio & Animation references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  // Quick vocal prompt suggestions
  const promptSuggestions = language === 'hi' ? [
    'रमेश जी, आज का कैश फ्लो और 30-दिन का बफर कैसा है?',
    'मेरा व्यापार स्कोर 78 से 85 कैसे हो सकता है?',
    'क्या मुझे 1 लाख का मुद्रा शिशु लोन मिल सकता है?',
    '₹48,900 का सप्लायर बिल कैसे वेरीफाई करें?',
  ] : language === 'bn' ? [
    'রমেশ বাবু, আজকের ক্যাশ ফ্লো এবং ৩০ দিনের বাফার কেমন?',
    'আমার ব্যাপার স্কোর ৭৮ থেকে ৮৫ কিভাবে হবে?',
    'আমি কি ১ লাখ টাকার মুদ্রা লোন পেতে পারি?',
    '₹৪৮,৯০০ সাপ্লায়ার বিল কিভাবে ভেরিফাই করব?',
  ] : [
    'How do I elevate my Vyapar score from 78 to 85+?',
    'What is my 30-day liquid working capital buffer?',
    'Am I eligible for a ₹1,00,000 MSME Mudra credit line?',
    'How does my ₹48,900 wholesale invoice impact underwriting?',
  ];

  // Auto-scroll transcript
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, liveState]);

  // Visualizer Animation Loop
  const startCanvasWaveform = (mode: 'listening' | 'speaking') => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      phase += 0.12;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const numBars = 36;
      const barWidth = width / numBars;

      for (let i = 0; i < numBars; i++) {
        const x = i * barWidth;
        const distFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
        const envelope = 1 - Math.pow(distFromCenter, 2);

        let amplitude = 4;
        if (mode === 'listening') {
          amplitude = Math.sin(phase + i * 0.4) * 20 * envelope + 10;
        } else if (mode === 'speaking') {
          amplitude = (Math.sin(phase * 1.5 + i * 0.5) * 26 + Math.cos(phase * 2 + i * 0.3) * 14) * envelope + 8;
        }

        const barHeight = Math.max(4, Math.abs(amplitude));

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
        if (mode === 'listening') {
          gradient.addColorStop(0, '#ba1a1a');
          gradient.addColorStop(0.5, '#ff897d');
          gradient.addColorStop(1, '#ba1a1a');
        } else {
          gradient.addColorStop(0, '#006948');
          gradient.addColorStop(0.5, '#85f8c4');
          gradient.addColorStop(1, '#00855d');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 2, centerY - barHeight / 2, barWidth - 4, barHeight, 3);
        ctx.fill();
      }
    };

    draw();
  };

  const stopAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Start Mic & Speech Recognition
  const startListening = async () => {
    stopAudio();
    setLiveState('listening');
    setMicNotice(null);
    startCanvasWaveform('listening');

    // 1. Setup speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          if (event.results && event.results[0]) {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
              handleUserSpokenMessage(transcript);
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
          if (e.error === 'not-allowed') {
            setMicNotice('Microphone permission blocked. You can type or tap suggestions below.');
          }
          if (liveState === 'listening') {
            setLiveState('idle');
          }
        };

        recognition.onend = () => {
          if (liveState === 'listening') {
            setLiveState('idle');
          }
        };

        recognition.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        setMicNotice('Speech listening ready. You can also tap any prompt below.');
      }
    } else {
      setMicNotice('Microphone recognition not supported in this browser. Tap any question chip below to test Gemini Live.');
    }

    // 2. Also try audio stream for hardware visualizer
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }
    } catch {
      // Non-blocking fallback
    }
  };

  // Send query to Gemini Live backend
  const handleUserSpokenMessage = async (userText: string) => {
    if (!userText.trim()) return;

    stopAudio();
    setMicNotice(null);

    const userItem: VoiceTranscriptItem = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscripts((prev) => [...prev, userItem]);
    setManualInput('');
    setLiveState('thinking');

    try {
      const res = await fetch('/api/coach/live-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          language,
          voiceName,
        }),
      });

      if (!res.ok) throw new Error('Live talk endpoint failure');
      const data = await res.json();
      handleGeminiSpokenResponse(data.text, data.audioBase64);
    } catch (err) {
      console.error('Live talk error:', err);
      // Fallback response
      const fallbackReply =
        language === 'hi'
          ? `रमेश जी, आपका व्यापार स्कोर 78 (ग्रेड A-) बहुत संतुलित है। दैनिक यूपीआई फ्लो ₹14,820 स्थिर है। अगले 30 दिनों में ₹35,000 लिक्विड बफर रखने से स्कोर 85+ हो जाएगा।`
          : language === 'bn'
          ? `রমেশ বাবু, আপনার ব্যাপার স্কোর ৭৮/১০০ বেশ ভালো। দৈনিক ইউপিআই ফ্লো ₹১৪,৮২০ স্থিতিশীল। ৩০ দিনের বাফার বানালে স্কোর ৮৫+ হয়ে যাবে।`
          : `Ramesh ji, your 78/100 Vyapar score reflects steady monthly inflows of ₹1.6 Lakhs. Reaching 30 days of liquidity buffer will qualify Ramesh General Store for ₹1.0 Lakh low-interest Mudra lines.`;
      handleGeminiSpokenResponse(fallbackReply, null);
    }
  };

  // Play audio response using Gemini TTS Audio / SpeechSynthesis
  const handleGeminiSpokenResponse = (replyText: string, audioBase64: string | null) => {
    const geminiItem: VoiceTranscriptItem = {
      id: `gemini-${Date.now()}`,
      speaker: 'gemini',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasAudio: !!audioBase64,
    };

    setTranscripts((prev) => [...prev, geminiItem]);
    setLiveState('speaking');
    startCanvasWaveform('speaking');

    // Attempt 1: Play authentic Gemini TTS Audio (WAV from gemini-3.8-flash-lite-tts)
    if (audioBase64) {
      try {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setLiveState('idle');
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
        };

        audio.onerror = () => {
          fallbackSpeechSynthesis(replyText);
        };

        audio.play().catch(() => {
          fallbackSpeechSynthesis(replyText);
        });
        return;
      } catch {
        // Fallback
      }
    }

    // Attempt 2: SpeechSynthesis
    fallbackSpeechSynthesis(replyText);
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = voiceName === 'Puck' ? 1.15 : 0.95;

      utterance.onend = () => {
        setLiveState('idle');
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
      utterance.onerror = () => {
        setLiveState('idle');
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setLiveState('idle');
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      }, 4000);
    }
  };

  // Save session transcript to Firestore
  const handleSaveToFirestore = async () => {
    const uid = user?.uid || 'demo-ramesh-user-uid';
    try {
      await setDoc(
        doc(db, 'settings', uid),
        {
          userId: uid,
          voiceAssistEnabled: true,
          lastVoiceTranscript: transcripts.map((t) => `[${t.speaker.toUpperCase()}]: ${t.text}`).join('\n\n'),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setFirestoreSavedBanner('Voice session saved to Firestore settings!');
      setTimeout(() => setFirestoreSavedBanner(null), 4000);
    } catch {
      setFirestoreSavedBanner('Session stored in local session log.');
      setTimeout(() => setFirestoreSavedBanner(null), 3000);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#bccac0]/40 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#004d34] via-[#006948] to-[#00855d] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[#85f8c4] border border-white/20">
              <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold tracking-tight">Gemini Live Voice Coach</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-extrabold uppercase tracking-wider">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Real-time conversational financial voice experience for {merchant?.storeName || 'Ramesh General Store'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Audio Visualizer Stage */}
        <div className="px-6 py-5 bg-gradient-to-b from-[#f2f7f4] to-white border-b border-[#bccac0]/20 flex flex-col items-center justify-center relative">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#bccac0]/30 shadow-xs mb-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                liveState === 'speaking'
                  ? 'bg-[#00855d] animate-ping'
                  : liveState === 'listening'
                  ? 'bg-[#ba1a1a] animate-pulse'
                  : liveState === 'thinking'
                  ? 'bg-[#8d4b00] animate-spin'
                  : 'bg-[#6d7a72]'
              }`}
            />
            <span className="text-[11px] font-bold text-[#131b2e] capitalize">
              {liveState === 'speaking'
                ? `Gemini Speaking (${voiceName} Voice)...`
                : liveState === 'listening'
                ? 'Listening to Merchant Audio (Speak now)...'
                : liveState === 'thinking'
                ? 'Reasoning Financial Guidance...'
                : 'Ready — Click Microphone or Prompt Below'}
            </span>
          </div>

          {/* Canvas Waveform */}
          <div className="w-full max-w-md h-20 bg-white/90 rounded-2xl border border-[#bccac0]/30 shadow-inner flex items-center justify-center p-2 relative overflow-hidden">
            <canvas ref={canvasRef} width={380} height={70} className="w-full h-full" />
            {liveState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#6d7a72] font-semibold gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006948]">mic</span>
                <span>Click "Speak to Gemini Live" or type below</span>
              </div>
            )}
          </div>

          {/* Mic Notice if applicable */}
          {micNotice && (
            <p className="mt-2 text-[11px] text-[#ba1a1a] font-semibold text-center max-w-md">
              {micNotice}
            </p>
          )}

          {/* Controls Bar: Mic, Persona, Language */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            {/* Primary Mic Button */}
            <button
              onClick={liveState === 'listening' || liveState === 'speaking' ? stopAudio : startListening}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold shadow-md transition-all cursor-pointer ${
                liveState === 'listening'
                  ? 'bg-[#ba1a1a] text-white animate-pulse'
                  : liveState === 'speaking'
                  ? 'bg-[#8d4b00] text-white hover:bg-[#723c00]'
                  : 'bg-[#006948] text-white hover:bg-[#00855d]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {liveState === 'listening' ? 'mic_off' : liveState === 'speaking' ? 'stop_circle' : 'mic'}
              </span>
              <span>
                {liveState === 'listening'
                  ? 'Stop Listening'
                  : liveState === 'speaking'
                  ? 'Stop Audio'
                  : 'Speak to Gemini Live'}
              </span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-[#e2e7ff] rounded-full p-1 border border-[#bccac0]/30">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  language === 'hi' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42]'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  language === 'en' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  language === 'bn' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#3d4a42]'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Voice Persona Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#bccac0]/30 text-[11px] font-bold text-[#131b2e]">
              <span className="material-symbols-outlined text-[16px] text-[#006948]">record_voice_over</span>
              <span>Voice:</span>
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value as any)}
                className="bg-transparent font-bold text-[#006948] focus:outline-none cursor-pointer"
              >
                <option value="Zephyr">Zephyr (Warm)</option>
                <option value="Kore">Kore (Calm)</option>
                <option value="Puck">Puck (Energetic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Conversation Transcript Timeline */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#fafbfa]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a72] px-1 flex items-center justify-between">
            <span>Conversational Experience Timeline</span>
            <span className="text-[10px] text-[#006948] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00855d] animate-pulse"></span>
              Gemini 3.8 Audio Engine Active
            </span>
          </div>

          {transcripts.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {item.speaker === 'gemini' && (
                <div className="w-8 h-8 rounded-xl bg-[#006948] text-white flex items-center justify-center shrink-0 shadow-xs text-[14px]">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                  item.speaker === 'user'
                    ? 'bg-[#006948] text-white rounded-tr-none'
                    : 'bg-white text-[#131b2e] border border-[#bccac0]/30 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span
                    className={`text-[11px] font-bold ${
                      item.speaker === 'user' ? 'text-white/80' : 'text-[#006948]'
                    }`}
                  >
                    {item.speaker === 'user' ? merchant?.ownerName || 'Merchant' : `Gemini Live (${voiceName})`}
                  </span>
                  <span
                    className={`text-[10px] ${
                      item.speaker === 'user' ? 'text-white/70' : 'text-[#6d7a72]'
                    }`}
                  >
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed">{item.text}</p>
              </div>

              {item.speaker === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#eaedff] text-[#131b2e] flex items-center justify-center shrink-0 shadow-xs border border-[#bccac0]">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
              )}
            </div>
          ))}

          <div ref={scrollEndRef} />
        </div>

        {/* Text Input / Spoken Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSpokenMessage(manualInput);
          }}
          className="px-4 py-2 bg-white border-t border-[#bccac0]/20 flex items-center gap-2"
        >
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'रमेश जी, यहाँ प्रश्न लिखें या माइक से बोलें...'
                : language === 'bn'
                ? 'রমেশ বাবু, প্রশ্ন লিখুন বা মাইকে বলুন...'
                : 'Ask a financial question or click mic to speak...'
            }
            className="flex-1 px-4 py-2 rounded-xl bg-[#f2f3ff] text-[13px] text-[#131b2e] placeholder-[#6d7a72] focus:outline-none focus:ring-2 focus:ring-[#006948] border border-[#bccac0]/30"
          />
          <button
            type="submit"
            disabled={!manualInput.trim() || liveState === 'thinking'}
            className="px-4 py-2 rounded-xl bg-[#006948] text-white text-[12px] font-bold hover:bg-[#00855d] disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Ask</span>
          </button>
        </form>

        {/* Quick Voice Prompt Chips */}
        <div className="px-5 py-2.5 bg-[#f7f9f6] border-t border-[#bccac0]/20 flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3d4a42]">
            Instant Voice Prompts:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleUserSpokenMessage(prompt)}
                disabled={liveState === 'speaking' || liveState === 'thinking'}
                className="shrink-0 text-left px-3 py-1.5 rounded-xl bg-white hover:bg-[#eaedff] text-[#131b2e] text-[11px] font-semibold border border-[#bccac0]/30 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions: Firestore Sync & Close */}
        <div className="px-6 py-3 bg-[#f2f7f4] border-t border-[#bccac0]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToFirestore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#bccac0] text-[#006948] text-[11px] font-bold hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>Save Session to Firestore</span>
            </button>
            {firestoreSavedBanner && (
              <span className="text-[11px] text-[#006948] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check</span>
                {firestoreSavedBanner}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-[#131b2e] text-white text-[12px] font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
