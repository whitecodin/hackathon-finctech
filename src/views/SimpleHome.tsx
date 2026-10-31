import React,{useState} from 'react';
import type {Merchant,NavPath} from '../types.ts';
import {useShop} from '../context/ShopContext.tsx';
import {useLanguage} from '../context/LanguageContext.tsx';
import {copy} from '../lib/uiCopy.ts';
import {KhataGlyph} from '../components/KhataGlyph.tsx';
import {useDemo} from '../demo/DemoContext.tsx';
import {DailyActionStrip} from './DailyActionStrip.tsx';
import {analyzeRestockCycles} from '../lib/restockInsights.ts';
import {useRestockPreferences} from '../lib/restockPreferences.ts';
const money=(v:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v);
const content={
 en:{greeting:'Namaste',headline:'Your shop, at a glance.',line:'A little clarity for a better business day.',tag:'MY BAHI-KHATA',period:'TODAY · MANUAL + CONNECTED PAYMENTS',received:'Money received',paid:'Money paid',only:'Manual + provider-confirmed activity, not bank balance or profit',ledger:'Open full hisaab',rank:'Bazaar League',rankHint:'See your place in the neighbourhood',help:'Need a hand?',helpHint:'Simple answers for daily business',listTitle:'What would you like to do?',loading:'Opening your hisaab…',empty:'Your records will appear when payments are added.',err:'Could not open your records.',retry:'Try again',all:'Other shop tools',noData:'No entries yet',count:'Payments recorded',small:'Your money stays private unless you choose to share it.'},
 hi:{greeting:'नमस्ते',headline:'आज दुकान का क्या हाल है?',line:'दुकान का ज़रूरी हिसाब, एक ही जगह।',tag:'मेरी बही-खाता',period:'आज · दर्ज और जुड़े भुगतान',received:'पैसे आए',paid:'पैसे गए',only:'दर्ज और कनेक्टेड पेमेंट · बैंक बैलेंस या मुनाफ़ा नहीं',ledger:'पूरा हिसाब देखें',rank:'बाज़ार लीग',rankHint:'आसपास की दुकानों से अपनी तुलना',help:'कोई सवाल है?',helpHint:'आसान भाषा में मदद पाएँ',listTitle:'आज क्या करना है?',loading:'हिसाब खुल रहा है…',empty:'जब भुगतान जुड़ेंगे, यहाँ दिखेंगे।',err:'हिसाब अभी नहीं खुल रहा।',retry:'फिर कोशिश करें',all:'दुकान के और काम',noData:'अभी कोई लेन-देन नहीं',count:'दर्ज लेन-देन',small:'आपकी जानकारी आपकी है। आप चाहें तभी साझा करें।'},
 bn:{greeting:'নমস্কার',headline:'আজ দোকান কেমন চলছে?',line:'দোকানের দরকারি হিসাব এক জায়গায়।',tag:'আমার খাতা',period:'আজ · হাতে ও সংযুক্ত পেমেন্ট',received:'টাকা এসেছে',paid:'টাকা গেছে',only:'দৈনিক পেমেন্টের রেকর্ড · ব্যাঙ্ক ব্যালেন্স নয়',ledger:'পুরো হিসাব দেখুন',rank:'বাজার লিগ',rankHint:'এলাকার দোকানের সঙ্গে তুলনা',help:'কোনো প্রশ্ন আছে?',helpHint:'সহজ ভাষায় সাহায্য',listTitle:'আজ কী করবেন?',loading:'হিসাব খোলা হচ্ছে…',empty:'পেমেন্ট যোগ হলে এখানে দেখা যাবে।',err:'হিসাব খুলতে পারছি না।',retry:'আবার চেষ্টা করুন',all:'আরও দোকানের কাজ',noData:'এখনও লেনদেন নেই',count:'রেকর্ড করা লেনদেন',small:'আপনার তথ্য আপনারই থাকে।'}
};
export function SimpleHome({merchant,onNavigate}:{merchant:Merchant|null;onNavigate:(p:NavPath)=>void;onTriggerDownload?:()=>void}){
 const {enterDemo}=useDemo();
 const {language}=useLanguage();const c=content[language];const t=copy[language];
 const {entries,stock,stockCycles,loading,error,refresh,demo}=useShop();
 const prefs=useRestockPreferences(demo?-1:merchant?.id);
 const [more,setMore]=useState(false);
 const day=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
 const todayRows=entries.filter(r=>r.entry_date===day && !r.matched_provider_entry_id);
 const incoming=todayRows.filter(r=>r.kind==='sale').reduce((sum,r)=>sum+r.amount,0);
 const outgoing=todayRows.filter(r=>r.kind==='expense').reduce((sum,r)=>sum+r.amount,0);
 const hasRecords=todayRows.length>0;

 const likelyToFinish=stock.map(item=>({item,insight:analyzeRestockCycles(stockCycles,item.id,day,prefs.get(item.id))}))
  .filter(x=>x.insight.confidence!=='learning'&&x.insight.orderNow)
  .sort((a,b)=>(a.insight.daysUntilEmpty??100)-(b.insight.daysUntilEmpty??100)).slice(0,3);

 const shopName=merchant?.storeName&&merchant.storeName!=='My Shop'?merchant.storeName:(language==='hi'?'मेरी दुकान':language==='bn'?'আমার দোকান':'My Dukaan');
 return <div className="desi-home">
   <section className="desi-welcome" aria-labelledby="home-heading">
     <div className="desi-welcome-copy"><span className="desi-kicker"><span className="desi-kicker-star">✳</span> {c.greeting}{merchant?.ownerName&&merchant.ownerName!=='Merchant'?' · '+merchant.ownerName:''}</span><h2 id="home-heading">{c.headline}</h2><p>{c.line}</p><div className="desi-welcome-shop"><span className="material-symbols-outlined" aria-hidden="true">storefront</span>{shopName}</div></div>
     <div className="desi-welcome-art" aria-hidden="true"><div className="desi-art-sun"/><div className="desi-art-awning"><span/><span/><span/><span/><span/></div><div className="desi-art-store"><div className="desi-art-door"/><div className="desi-art-window"/><div className="desi-art-jar one"/><div className="desi-art-jar two"/></div><div className="desi-art-base"/></div>
   </section>
   <div className="desi-section-heading"><span className="desi-deco-line"/><span>{c.tag}</span><span className="desi-deco-line"/></div>
   <section className="desi-khata" aria-label={c.tag}>
      <div className="desi-khata-top"><span className="desi-khata-mark" aria-hidden="true">ब</span><div><strong>{c.tag}</strong><small>{c.period}</small></div><span className="desi-khata-corner" aria-hidden="true">✺</span></div>
      {loading?<p role="status" className="desi-state">{c.loading}</p>:error?<div className="desi-state" role="alert">{c.err} <button onClick={()=>void refresh()}>{c.retry}</button></div>:<div className="desi-khata-values">
       <div className="desi-value"><span className="desi-value-icon receive material-symbols-outlined">south_west</span><span className="desi-value-label">{c.received}</span><strong>{hasRecords?money(incoming):'—'}</strong></div>
       <div className="desi-value"><span className="desi-value-icon spend material-symbols-outlined">north_east</span><span className="desi-value-label">{c.paid}</span><strong>{hasRecords?money(outgoing):'—'}</strong></div>
      </div>}
      <div className="desi-khata-bottom"><span>{!error&&!loading&&!hasRecords?c.noData:c.only}</span><button className="vt-khata-target" onClick={()=>onNavigate('daily-hisaab')}><KhataGlyph icon="receipt_long" small/>{c.ledger}<span className="material-symbols-outlined">arrow_forward</span></button></div>
   </section>
   {likelyToFinish.length>0&&<button type="button" className="sr-home-alert" onClick={()=>onNavigate('stock')}><span className="material-symbols-outlined">inventory_2</span><span><strong>{language==='hi'?'साथी ने सामान की ज़रूरत पहचानी':'Smart Restock: check upcoming needs'}</strong><small>{likelyToFinish.map(x=>x.item.item_name+' · '+(x.insight.daysUntilEmpty===null?'out of stock':x.insight.daysUntilEmpty===0?'possibly out':x.insight.daysUntilEmpty+'d left')).join('  •  ')} · {language==='hi'?'अनुमान, पक्का स्टॉक नहीं':'Estimates, not counted stock'}</small></span><span className="material-symbols-outlined">arrow_forward</span></button>}
   <button type="button" className="ops-auto-home" onClick={()=>onNavigate('auto-hisaab')}><span className="material-symbols-outlined">bolt</span><span><strong>{language==='hi'?'ऑटो हिसाब चालू करें':'Make Hisaab automatic'}</strong><small>{language==='hi'?'कनेक्टेड UPI पेमेंट अपने आप दर्ज होंगे':'Supported UPI payments can appear without typing'}</small></span><span className="material-symbols-outlined">arrow_forward</span></button>
   <button type="button" className="saathi-home-shortcut" onClick={()=>onNavigate('ai-financial-coach')}><span className="material-symbols-outlined">mic</span><span><strong>{language==='hi'?'बोलकर हिसाब लिखें':language==='bn'?'কথা বলে হিসাব লিখুন':'Speak a sale or expense'}</strong><small>{language==='hi'?'“आज 2 किलो आलू ₹240 के बेचे” बोलकर देखें':language==='bn'?'হিন্দিতে বলুন, তারপর যাচাই করে সেভ করুন':'Try “aaj 2 kilo aalo beche 240 rs”'}</small></span><span className="material-symbols-outlined">chevron_right</span></button>
   <DailyActionStrip onNavigate={onNavigate}/>
   <div className="desi-section-heading desi-todo-heading"><span className="desi-deco-line"/><span>{c.listTitle}</span><span className="desi-deco-line"/></div>
   <div className="desi-feature-grid">
     <button type="button" className="desi-feature league vt-khata-target" onClick={()=>onNavigate('merchant-league')}><KhataGlyph icon="emoji_events"/><span className="desi-feature-title">{c.rank}</span><small>{c.rankHint}</small><span className="desi-feature-arrow material-symbols-outlined">arrow_forward</span></button>
     <button type="button" className="desi-feature help vt-khata-target" onClick={()=>onNavigate('ai-financial-coach')}><KhataGlyph icon="support_agent"/><span className="desi-feature-title">{c.help}</span><small>{c.helpHint}</small><span className="desi-feature-arrow material-symbols-outlined">arrow_forward</span></button>
   </div>
   <button className="desi-extra-toggle vt-khata-target" type="button" aria-expanded={more} onClick={()=>setMore(v=>!v)}><KhataGlyph icon="apps" small/>{c.all}<span className="material-symbols-outlined">{more?'expand_less':'expand_more'}</span></button>
   {more&&<div className="desi-extra-grid">{(['business-resilience','credit-readiness','financial-passport','consent-privacy','settings'] as NavPath[]).map((p,i)=><button key={p} onClick={()=>onNavigate(p)} className="vt-khata-target"><KhataGlyph icon={['savings','account_balance','badge','shield','tune'][i]} small/>{[t.savings,t.loans,t.passport,t.privacy,t.settings][i]}<span className="material-symbols-outlined">chevron_right</span></button>)}</div>}
   {!loading&&!error&&!hasRecords&&<button type="button" className="vt-real-demo-invite vt-khata-target" onClick={enterDemo}><KhataGlyph icon="storefront" small/><span><strong>{language==='hi'?'नमूने की दुकान देखें':language==='bn'?'নমুনা দোকান দেখুন':'See a sample kirana shop'}</strong><small>{language==='hi'?'नमूने का हिसाब दिखाएँगे, आपका डेटा नहीं बदलेगा।':'Explore sample payments and bazaar rankings — no real data changes.'}</small></span><span className="material-symbols-outlined">arrow_forward</span></button>}
   <p className="desi-privacy-foot"><span className="material-symbols-outlined">verified_user</span>{c.small}</p>
 </div>;
}
