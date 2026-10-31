import React from 'react';
import type {NavPath} from '../types.ts';
import {useLanguage} from '../context/LanguageContext.tsx';
import {copy,mainLinks} from '../lib/uiCopy.ts';
import {KhataGlyph} from './KhataGlyph.tsx';
export function BottomNavigation({currentPath,onNavigate}:{currentPath:NavPath;onNavigate:(p:NavPath)=>void}){
 const {language}=useLanguage();const t=copy[language];
 return <nav className="desi-bottom-nav" aria-label="Quick navigation">{mainLinks.map(l=><button key={l.id} onClick={()=>onNavigate(l.id)} aria-current={currentPath===l.id?'page':undefined} className={'vt-khata-target '+(currentPath===l.id?'active':'')}><KhataGlyph icon={l.icon} small/><span>{t[l.key]}</span></button>)}</nav>;
}
