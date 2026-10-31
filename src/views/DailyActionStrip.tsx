import React from 'react';
import type {NavPath} from '../types.ts';
import {useLanguage} from '../context/LanguageContext.tsx';
import {useShop,dailyTasks} from '../context/ShopContext.tsx';
export function DailyActionStrip({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const s=useShop(),t=dailyTasks(s);const {language}=useLanguage();const hi=language==='hi';
 const todos=[{id:'udhar' as NavPath,icon:'wallet',n:t.overdue.filter(x=>x.direction==='receive').length,text:hi?'उधार याद दिलाएँ':'Customer dues to follow up'},
 {id:'stock' as NavPath,icon:'inventory_2',n:t.low.length,text:hi?'सामान कम है':'Items to reorder'},
 {id:'udhar' as NavPath,icon:'calendar_clock',n:t.upcoming.length,text:hi?'सप्लायर को देना है':'Supplier payments soon'}].filter(x=>x.n>0);
 return <section className="vc-today">
  <div className="vc-heading"><h3>{hi?'आज दुकान में क्या काम है?':'What needs attention today?'}</h3><span>{s.demo?'SAMPLE SHOP':'MY SHOP'}</span></div>
  {s.loading?<div className="vc-empty">{hi?'खुल रहा है…':'Checking your records…'}</div>:todos.length?<div className="vc-today-list">{todos.map(x=><button key={x.icon} className="vt-khata-target" onClick={()=>onNavigate(x.id)}><span className="material-symbols-outlined">{x.icon}</span><strong>{x.n}</strong><span>{x.text}</span><span className="material-symbols-outlined">arrow_forward</span></button>)}</div>:<div className="vc-today-empty"><span className="material-symbols-outlined">check_circle</span><span>{hi?'कोई ज़रूरी काम अभी नहीं दिख रहा। पहले हिसाब जोड़ें।':'Nothing urgent in your recorded tasks. Add your first entry to get started.'}</span></div>}
  <div className="vc-quick-grid">{([{p:'daily-hisaab',i:'receipt_long',en:'Today’s Hisaab',hi:'आज का हिसाब'},{p:'udhar',i:'handshake',en:'Udhar & Dues',hi:'उधार'},{p:'stock',i:'inventory_2',en:'My Stock',hi:'सामान'},{p:'regulars',i:'group',en:'Regular Customers',hi:'पक्के ग्राहक'}] as const).map(x=><button key={x.p} type="button" onClick={()=>onNavigate(x.p)}><span className="material-symbols-outlined">{x.i}</span><strong>{hi?x.hi:x.en}</strong><span className="material-symbols-outlined">chevron_right</span></button>)}</div>
 </section>;
}
