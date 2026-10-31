import React from 'react';
import type {NavPath,Language,Merchant} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {ThemeSwitch} from '../context/ThemeContext.tsx';
import {useDemo} from '../demo/DemoContext.tsx';
import {useLanguage} from '../context/LanguageContext.tsx';
import {copy,mainLinks,extraLinks} from '../lib/uiCopy.ts';
export function Header({currentPath,onNavigate,onMenu}:{currentPath:NavPath;onNavigate:(path:NavPath,query?:string)=>void;language:Language;onLanguageChange:(lang:Language)=>void;merchant:Merchant|null;onOpenLiveVoice?:()=>void;onMenu?:()=>void}){
 const {logout}=useAuth();const {demoEnabled,enterDemo,exitDemo}=useDemo();const {language,setLanguage}=useLanguage();const t=copy[language];
 const link=[...mainLinks,...extraLinks].find(x=>x.id===currentPath);
 const title=link?t[link.key]:t.home;
 return <header className="simple-header desi-header">
   <div className="header-heading">
      <button className="mobile-menu-button" type="button" onClick={onMenu} aria-label="Open menu"><span className="material-symbols-outlined">menu</span></button>
      <span className="desi-header-mark" aria-hidden="true">✦</span><h1>{title}</h1>
   </div>
   <div className="header-actions">
      {currentPath!=='ai-financial-coach'&&<button type="button" className="saathi-header-button" onClick={()=>onNavigate('ai-financial-coach',currentPath==='udhar'?'Help me manage my Udhar in VyaparTrust':currentPath==='stock'?'Help me understand my stock and restocking':currentPath==='auto-hisaab'?'How does Auto Hisaab work?':currentPath==='merchant-league'?'How does the Bazaar League work?':currentPath==='mohalla-power'?'How do I use Mohalla Power?':undefined)} aria-label={language==='hi'?'दुकान साथी से पूछें':language==='bn'?'দোকান সাথীকে জিজ্ঞাসা করুন':'Ask Dukaan Saathi'}><span className="material-symbols-outlined">support_agent</span><span>{language==='hi'?'साथी':language==='bn'?'সাথী':'Ask Saathi'}</span></button>}
      <label className="desi-lang-wrap"><span className="material-symbols-outlined" aria-hidden="true">translate</span><span className="sr-only">{t.language}</span><select aria-label={t.language} className="simple-language" value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="hi">हिंदी</option><option value="en">English</option><option value="bn">বাংলা</option></select></label>
      <button type="button" className="vt-demo-header-button" aria-label={demoEnabled?"Exit sample shop":"Open sample shop"} onClick={()=>{if(demoEnabled)exitDemo();else enterDemo();onNavigate('overview')}}><span className="material-symbols-outlined">storefront</span><span>{demoEnabled?"Exit sample":"Sample shop"}</span></button><ThemeSwitch/>
      <button className="signout-button" type="button" onClick={()=>{if(demoEnabled)exitDemo();logout();onNavigate('auth')}} title={t.signout}><span className="material-symbols-outlined" aria-hidden="true">logout</span><span className="desi-signout-text">{t.signout}</span></button>
   </div>
 </header>;
}
