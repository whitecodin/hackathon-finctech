import React,{useState,useEffect} from 'react';
import type {NavPath,Merchant} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useLanguage} from '../context/LanguageContext.tsx';
import {copy,mainLinks,extraLinks} from '../lib/uiCopy.ts';
import {KhataGlyph} from './KhataGlyph.tsx';
export function Sidebar({currentPath,onNavigate,merchant,onClose}:{currentPath:NavPath;onNavigate:(v:NavPath)=>void;merchant:Merchant|null;onClose?:()=>void;flaggedCount?:number}){
 const {user}=useAuth();const {language}=useLanguage();const t=copy[language];
 const isExtra=extraLinks.some(x=>x.id===currentPath);
 const [more,setMore]=useState(()=>isExtra);
 useEffect(()=>{if(isExtra)setMore(true)},[currentPath]);
 return <aside className="simple-sidebar desi-sidebar" aria-label="Main menu">
  <div className="sidebar-brand desi-brand"><div className="desi-brand-mark">व</div><div className="desi-brand-words"><strong>VyaparTrust</strong><small>आपकी दुकान, आपका हिसाब</small></div><button className="sidebar-close" type="button" onClick={onClose} aria-label="Close menu"><span className="material-symbols-outlined">close</span></button></div>
  <div className="desi-shop-card"><div className="desi-shop-avatar"><span className="material-symbols-outlined">storefront</span></div><div className="desi-shop-meta"><span className="desi-eyebrow">{language==='hi'?'आपकी दुकान':language==='bn'?'আপনার দোকান':'YOUR SHOP'}</span><strong>{merchant?.storeName||user?.displayName||t.shop}</strong><small>{merchant?.location||''}</small></div></div>
  <nav className="simple-nav desi-side-nav" aria-label="Shop pages">
    <span className="desi-nav-caption">{language==='hi'?'रोज़ के काम':language==='bn'?'দৈনন্দিন কাজ':'EVERYDAY'}</span>
    {mainLinks.map(link=><button key={link.id} type="button" aria-current={currentPath===link.id?'page':undefined} className={'vt-khata-target '+(currentPath===link.id?'active':'')} onClick={()=>{onNavigate(link.id);onClose?.()}}><KhataGlyph icon={link.icon} small/><span>{t[link.key]}</span>{currentPath===link.id&&<span className="desi-active-dot" aria-hidden="true"/>}</button>)}
    <div className="desi-nav-divider"/>
    <button className={'desi-more-nav vt-khata-target '+(isExtra?'has-current':'')} type="button" aria-controls="sidebar-extra-links" aria-expanded={more} onClick={()=>setMore(v=>!v)}><KhataGlyph icon="grid_view" small/><span>{t.more}</span><span className="material-symbols-outlined desi-expand">{more?'expand_less':'expand_more'}</span></button>
    {more&&<div id="sidebar-extra-links" className="desi-extra-links" aria-label={t.more}>{extraLinks.map(link=><button key={link.id} type="button" aria-current={currentPath===link.id?'page':undefined} className={'vt-khata-target '+(currentPath===link.id?'active':'')} onClick={()=>{onNavigate(link.id);onClose?.()}}><KhataGlyph icon={link.icon} small/><span>{t[link.key]}</span></button>)}</div>}
  </nav>
  <div className="desi-side-footer"><span className="desi-footer-motif" aria-hidden="true">✦</span>{language==='hi'?'बड़े सपनों की छोटी शुरुआत':language==='bn'?'ছোট শুরু, বড় স্বপ্ন':'Small shop. Big dreams.'}</div>
 </aside>
}
