import React,{useState} from 'react';
import type {NavPath,Language} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useLanguage} from '../context/LanguageContext.tsx';
import {ThemeSwitch} from '../context/ThemeContext.tsx';
import {useDemo} from '../demo/DemoContext.tsx';
const words={
 en:{badge:'Made for your neighbourhood shop',heading:'Your shop. Your हिसाब.',sub:'Money in, money out and a little help to grow. All in one easy place.',login:'Continue with Google',working:'Opening Google…',feature1:'Clear money records',feature2:'Your bazaar ranking',feature3:'Help when you need it',rightTitle:'A simpler way to run your shop',rightSub:'Like your trusted bahi-khata — now on your phone.',signin:'Welcome to VyaparTrust',hint:'Your shop’s information stays with your account.',err:'Could not open sign-in. Please try again.'},
 hi:{badge:'आपकी मोहल्ले की दुकान के लिए',heading:'आपकी दुकान। आपका हिसाब।',sub:'कितने पैसे आए, कितने गए और दुकान कैसे बढ़े — सब एक ही जगह।',login:'Google से शुरू करें',working:'खुल रहा है…',feature1:'पैसों का साफ़ हिसाब',feature2:'बाज़ार में आपकी रैंक',feature3:'ज़रूरत पर मदद',rightTitle:'दुकानदारी अब और आसान',rightSub:'आपकी भरोसेमंद बही-खाता, अब फ़ोन पर।',signin:'VyaparTrust में स्वागत है',hint:'आपकी दुकान की जानकारी आपके अकाउंट में सुरक्षित रहती है।',err:'अभी साइन इन नहीं हो पाया। फिर कोशिश करें।'},
 bn:{badge:'আপনার পাড়ার দোকানের জন্য',heading:'আপনার দোকান। আপনার হিসাব।',sub:'কত টাকা এল, কত গেল, আর কীভাবে বাড়াবেন — সব এক জায়গায়।',login:'Google দিয়ে শুরু করুন',working:'খুলছে…',feature1:'সহজ টাকার হিসাব',feature2:'বাজারে আপনার স্থান',feature3:'প্রয়োজনে সাহায্য',rightTitle:'দোকান চালানো এখন সহজ',rightSub:'বিশ্বস্ত খাতার হিসাব এখন ফোনে।',signin:'VyaparTrust-এ স্বাগতম',hint:'দোকানের তথ্য আপনার অ্যাকাউন্টেই থাকে।',err:'সাইন ইন হয়নি। আবার চেষ্টা করুন।'}
};
export function AuthView({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const {enterDemo}=useDemo();
 const {loginWithGoogle,isLoading,authError}=useAuth();const {language,setLanguage}=useLanguage();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const c=words[language];
 const login=async()=>{setBusy(true);setError('');try{if(!(await loginWithGoogle()))setError(c.err)}catch{setError(c.err)}finally{setBusy(false)}};
 return <div className="desi-landing">
   <header className="desi-landing-header">
    <div className="desi-brand"><span className="desi-brand-mark">व</span><div className="desi-brand-words"><strong>VyaparTrust</strong><small>भरोसे का हिसाब</small></div></div>
    <div className="desi-landing-actions"><label className="desi-lang-wrap"><span className="material-symbols-outlined" aria-hidden="true">translate</span><select className="simple-language" aria-label="Choose language" value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="hi">हिंदी</option><option value="en">English</option><option value="bn">বাংলা</option></select></label><ThemeSwitch/></div>
   </header>
   <main className="desi-landing-main">
     <section className="desi-landing-hero">
       <div className="desi-landing-pattern" aria-hidden="true"><span>✳</span><span>✳</span><span>✳</span></div>
       <span className="desi-badge"><span className="material-symbols-outlined">storefront</span>{c.badge}</span>
       <h1>{c.heading}</h1><p>{c.sub}</p>
       <div className="desi-landing-points">{([['account_balance_wallet',c.feature1],['emoji_events',c.feature2],['support_agent',c.feature3]] as const).map(([icon,label])=><span key={icon}><span className="material-symbols-outlined">{icon}</span>{label}</span>)}</div>
       <div className="desi-landing-art" aria-hidden="true"><div className="desi-art-arch"><div className="desi-arch-sign">अपनी दुकान</div><div className="desi-art-awning"><i/><i/><i/><i/><i/><i/></div><div className="desi-arch-shelves"><span>◼</span><span>▥</span><span>▤</span><span>▦</span><span>▣</span><span>▥</span></div></div><span className="desi-landing-art-leaf left">✺</span><span className="desi-landing-art-leaf right">✺</span></div>
     </section>
     <section className="desi-landing-signin" aria-label="Sign in">
      <span className="desi-signin-top">✦ &nbsp; VyaparTrust</span><div className="desi-signin-emblem" aria-hidden="true"><span className="material-symbols-outlined">receipt_long</span></div>
      <h2>{c.signin}</h2><p>{c.rightSub}</p>
      <button className="desi-signin-button" type="button" onClick={()=>void login()} disabled={busy||isLoading}><span className="desi-google-mark" aria-hidden="true">G</span>{busy||isLoading?c.working:c.login}<span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
      <button className="vt-demo-login" type="button" onClick={()=>{enterDemo();onNavigate('overview')}}><span className="material-symbols-outlined" aria-hidden="true">storefront</span> Explore Sample Shop <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
      <p className="vt-demo-login-note">No account needed · fictional demo records</p>
      {(error||authError)&&<div className="desi-signin-error" role="alert">{authError||error}</div>}
      <div className="desi-signin-privacy"><span className="material-symbols-outlined">lock</span>{c.hint}</div>
     </section>
   </main>
   <footer className="desi-landing-footer"><span>✳</span> छोटे व्यापार के बड़े सपने <span>✳</span></footer>
 </div>;
}
