import React,{useMemo,useState} from 'react';
import {DEMO_SHOP,demoLeague} from './data.ts';
import type {DemoRegionScope,DemoLeagueMode} from './data.ts';
import {useLanguage} from '../context/LanguageContext.tsx';
const tiers:{id:DemoRegionScope;icon:string;english:string;hindi:string;subtitle:string}[]=[
 {id:'local',icon:'location_on',english:'My PIN',hindi:'मेरा पिन',subtitle:'PIN 302001'},
 {id:'city',icon:'location_city',english:'City',hindi:'शहर',subtitle:'Jaipur'},
 {id:'district',icon:'map',english:'District',hindi:'ज़िला',subtitle:'Jaipur district'},
 {id:'state',icon:'flag',english:'State',hindi:'राज्य',subtitle:'Rajasthan'}
];
const labelGrowth=(n:number)=>(n>0?'+':'')+n+'%';
export function RegionalLeague({additionalInflow=0}:{additionalInflow?:number}){
 const {language}=useLanguage();const hi=language==='hi';
 const [scope,setScope]=useState<DemoRegionScope>('local'),[mode,setMode]=useState<DemoLeagueMode>('activity'),[showAll,setShowAll]=useState(false);
 const peers=useMemo(()=>demoLeague(scope,mode,additionalInflow),[scope,mode,additionalInflow]);
 const me=peers.find(x=>x.self);const current=tiers.find(x=>x.id===scope)!;const rank=me?.rank??0;
 const percentile=peers.length?Math.ceil((rank/peers.length)*100):0;const next=peers.find(x=>x.rank===rank-1);
 const visible=showAll?peers:peers.slice(0,7);
 return <section className="vt-region-league">
   <div className="vt-region-banner"><div><span className="vt-region-kicker">✺ {hi?'अपना बाज़ार, अपनी पहचान':'APNA BAZAAR · APNI PEHCHAAN'}</span>
     <h2>{hi?'मेरे इलाक़े की लीग':'My Regional League'}</h2><p>{hi?'आपके जैसे दुकानदार, आपके ही इलाक़े में।':'A friendly league for shops like yours.'}</p>
     <span className="vt-region-banner-tag"><span className="material-symbols-outlined">storefront</span>Kirana shops · {DEMO_SHOP.state}</span></div>
     <div className="vt-region-art" aria-hidden="true">✺<strong>बाज़ार</strong></div></div>
   <div className="vt-region-path"><span>📍 {DEMO_SHOP.pin}</span><span>›</span><span>{DEMO_SHOP.city}</span><span>›</span><span>{DEMO_SHOP.district} district</span><span>›</span><span>{DEMO_SHOP.state}</span></div>
   <div className="vt-region-intro"><h3>{hi?'कहाँ मुकाबला देखें?':'Choose your area'}</h3><p>{hi?'इलाका अपने आप सेट है।':'Your shop stays in the same place. Only the league area changes.'}</p></div>
   <div className="vt-region-scopes" role="group" aria-label="Region">
     {tiers.map(t=><button key={t.id} type="button" aria-pressed={scope===t.id} onClick={()=>{setScope(t.id);setShowAll(false)}}><span className="material-symbols-outlined">{t.icon}</span><strong>{hi?t.hindi:t.english}</strong><small>{t.subtitle}</small></button>)}</div>
   <div className="vt-region-board-top"><div><span className="vt-region-label">✦ {hi?'मेरी लीग':'MY LEAGUE'}</span><h3>{current.subtitle}</h3><small>{peers.length} {hi?'नमूने की दुकानें':'fictional kirana shops'}</small></div>
     <div className="vt-region-modes" role="group" aria-label="Leaderboard type"><button aria-pressed={mode==='activity'} onClick={()=>setMode('activity')}>{hi?'बाज़ार सितारे':'Bazaar Stars'}</button><button aria-pressed={mode==='growth'} onClick={()=>setMode('growth')}>{hi?'तरक्की सितारे':'Rising Stars'}</button></div></div>
   <div className="vt-region-me"><div className="vt-region-rank-circle"><span>{hi?'मेरी जगह':'MY PLACE'}</span><strong>#{rank}</strong><small>of {peers.length}</small></div>
     <div className="vt-region-me-copy"><span>✳ APNA KIRANA</span><h3>{mode==='growth'?(hi?'आपकी तरक्की':'Your shop growth'):(hi?'आपकी बाज़ार रैंक':'Your bazaar position')}</h3>
     <p>{mode==='growth'?(hi?'अपने पिछले महीने से मुकाबला, बड़ी दुकान से नहीं।':'Improvement against your own past month, not against a larger shop.'):(hi?'सिर्फ अपने जैसे किराना दुकानदारों से मुकाबला।':'Only similar kirana stores within your selected region.')}</p>
     <div className="vt-region-pillset"><span>✳ Top {percentile}%</span>{mode==='growth'&&me&&<span>{labelGrowth(me.growthPercent)} {hi?'बदलाव':'change'}</span>}</div></div><span className="vt-region-medal" aria-hidden="true">{rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'✦'}</span></div>
   <div className="vt-region-next"><span className="material-symbols-outlined">{next?'near_me':'auto_awesome'}</span>
     <span>{next?<>{hi?'अगली जगह':'Next position'}: <strong>{next.alias}</strong> · {mode==='growth'?labelGrowth(next.growthPercent)+' growth':'higher sample activity'}</>:(hi?'आप सबसे आगे हैं!':'You lead this sample group!')}</span></div>
   <div className="vt-region-listheading"><h3>{hi?'बाज़ार के सितारे':'Bazaar board'}</h3><small>{mode==='growth'?'Improvement against previous month':'30-day recorded inflow ranking'}</small></div>
   <div className="vt-region-rows">{visible.map((s,i)=><div key={s.id} className={'vt-region-row '+(s.self?'self':'')}>
      <span className="vt-region-position">{i<3?['🥇','🥈','🥉'][i]:'#'+s.rank}</span>
      <span className="vt-region-shop"><strong>{s.alias}{s.self?' · You':''}</strong><small>{s.self?'Your sample shop':scope==='state'?s.city:s.locality} · Kirana</small></span>
      <span className="vt-region-score"><strong>{mode==='growth'?labelGrowth(s.growthPercent):s.tier+' Star'}</strong><small>{mode==='growth'?'sample growth':'activity band'}</small></span></div>)}</div>
   {peers.length>7&&<button className="vt-region-showall" type="button" onClick={()=>setShowAll(v=>!v)}>{showAll?(hi?'कम दिखाएँ':'Show fewer'):(hi?'सभी दुकानें':'See all shops')}<span className="material-symbols-outlined">{showAll?'expand_less':'expand_more'}</span></button>}
   <div className="vt-region-insight"><span className="material-symbols-outlined">tips_and_updates</span><div><strong>{hi?'बाज़ार की बात':'Bazaar wisdom'}</strong><p>{mode==='growth'?(hi?'छोटी दुकान भी आगे आ सकती है। अपनी तरक्की देखना ज़रूरी है।':'A small shop can lead Rising Stars. Your own improvement matters.'):(hi?'केवल बड़ी बिक्री नहीं, अपनी तरक्की भी देखें।':'Being the biggest is not everything. Try Rising Stars to compare progress.')}</p></div></div>
   <details className="vt-region-rules"><summary><span className="material-symbols-outlined">shield</span>{hi?'नियम और निजता':'Rules & privacy'}<span className="material-symbols-outlined">expand_more</span></summary><p>{hi?'सभी दुकानों का डेटा काल्पनिक है। असली लीग में शामिल होना आपकी मर्ज़ी है।':'Every shop and number shown here is fictional. Rising Stars uses simulated previous-month baselines. The real league requires opt-in, enough nearby shops and validated location information. This is not a bank rating or profit score.'}</p></details>
 </section>;
}
