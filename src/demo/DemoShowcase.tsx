import React,{useMemo,useState} from 'react';
import type {NavPath} from '../types.ts';
import {useLanguage} from '../context/LanguageContext.tsx';
import {useDemo} from './DemoContext.tsx';
import {DEMO_SHOP,DEMO_TRANSACTIONS,DEMO_SHOPS,demoLeague,shopStats} from './data.ts';
import type {DemoTxn} from './data.ts';
import {RegionalLeague} from './RegionalLeague.tsx';
import {DailyActionStrip} from '../views/DailyActionStrip.tsx';

const rupees=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const date=(v:string)=>new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
type PageProps={path:NavPath;onNavigate:(path:NavPath)=>void};
const actions:{path:NavPath;icon:string;english:string;hindi:string;caption:string}[]=[
 {path:'transaction-safety',icon:'receipt_long',english:'My Hisaab',hindi:'मेरा हिसाब',caption:'Payments in & out'},
 {path:'merchant-league',icon:'emoji_events',english:'Bazaar League',hindi:'बाज़ार लीग',caption:'Your shop ranking'},
 {path:'ai-financial-coach',icon:'support_agent',english:'Ask for Help',hindi:'मदद चाहिए?',caption:'Simple daily advice'},
 {path:'business-resilience',icon:'savings',english:'Savings',hindi:'बचत',caption:'Plan for slow days'},
 {path:'credit-readiness',icon:'account_balance',english:'Loan Guide',hindi:'लोन जानकारी',caption:'Get ready to borrow'},
 {path:'financial-passport',icon:'storefront',english:'Shop Details',hindi:'दुकान की जानकारी',caption:'Your shop profile'},
 {path:'consent-privacy',icon:'shield',english:'Privacy',hindi:'निजता',caption:'What is shared'},
 {path:'settings',icon:'tune',english:'Settings',hindi:'सेटिंग्स',caption:'Your choices'}
];
function KhataAction({icon,label,detail,onClick,variant='plain'}:{icon:string;label:string;detail?:string;onClick:()=>void;variant?:'plain'|'gold'|'green'}){
 return <button className={'vt-khata-action '+variant} type="button" onClick={onClick}>
   <span className="vt-book" aria-hidden="true"><span className="vt-book-pages"><i/><i/><i/></span><span className="vt-book-cover"><span className="material-symbols-outlined">{icon}</span></span></span>
   <span className="vt-action-copy"><strong>{label}</strong>{detail&&<small>{detail}</small>}</span>
   <span className="material-symbols-outlined vt-action-arrow" aria-hidden="true">arrow_forward</span>
 </button>
}
export function DemoShowcase({path,onNavigate}:PageProps){
 const {exitDemo}=useDemo();const {language}=useLanguage();const isHi=language==='hi';
 const [extra,setExtra]=useState(false);
 const [custom,setCustom]=useState<DemoTxn[]>([]),[saleAmount,setSaleAmount]=useState(''),[filter,setFilter]=useState<'all'|'inflow'|'outflow'|'flagged'>('all');
 const [checked,setChecked]=useState<string[]>([]),[goal,setGoal]=useState('10000'),[savedGoal,setSavedGoal]=useState(''),[selectedAdvice,setSelectedAdvice]=useState<number|null>(null);
 const all=useMemo(()=>[...custom,...DEMO_TRANSACTIONS.filter(t=>t.shopId===DEMO_SHOP.id)].sort((a,b)=>b.date.localeCompare(a.date)),[custom]);
 const base=shopStats(DEMO_SHOP.id);const incoming=base.incoming+custom.filter(t=>t.type==='inflow').reduce((a,t)=>a+t.amount,0);const outgoing=base.outgoing+custom.filter(t=>t.type==='outflow').reduce((a,t)=>a+t.amount,0);
 const flagged=all.filter(t=>t.flagged&&!checked.includes(t.id));
 const peers=demoLeague('local','activity',incoming-base.incoming);
 const myRank=peers.find(x=>x.self)?.rank??0;
 const goHome=()=>onNavigate('overview');const leave=()=>{exitDemo();onNavigate('auth')};
 const addSampleSale=(e:React.FormEvent)=>{e.preventDefault();const amount=Math.round(Number(saleAmount));if(!Number.isFinite(amount)||amount<=0||amount>100000)return;setCustom(prev=>[{id:'sample-added-'+(prev.length+1),shopId:DEMO_SHOP.id,date:new Date().toISOString(),counterparty:'Sample counter sale',amount,type:'inflow',channel:'UPI',flagged:false,description:'Added in this demo only'},...prev]);setSaleAmount('')};
 const resetDemo=()=>{setCustom([]);setChecked([]);setSavedGoal('');setSaleAmount('')};
 const pageHeading=(title:string,sub:string)=><div className="vt-demo-heading"><div><span className="vt-eyebrow">✳ {isHi?'अपनी दुकान':'APNA DUKAAN'}</span><h2>{title}</h2><p>{sub}</p></div><button type="button" onClick={goHome} className="vt-back"><span className="material-symbols-outlined">arrow_back</span>{isHi?'दुकान':'My shop'}</button></div>;
 const sampleTxn=(t:DemoTxn)=> <details key={t.id} className="vt-demo-txn">
  <summary><span className={'vt-money-direction '+(t.type==='inflow'?'in':'out')}><span className="material-symbols-outlined">{t.type==='inflow'?'south_west':'north_east'}</span></span><span className="vt-txn-name"><strong>{t.counterparty}</strong><small>{date(t.date)} · {t.channel}{t.flagged&&!checked.includes(t.id)?' · Needs review':''}</small></span><b className={t.type==='inflow'?'positive':''}>{t.type==='inflow'?'+':'−'}{rupees(t.amount)}</b></summary>
  <div className="vt-demo-txn-detail"><span>{t.description}</span>{t.flagged&&<button type="button" disabled={checked.includes(t.id)} onClick={()=>setChecked(v=>[...v,t.id])}>{checked.includes(t.id)?'Checked in demo':'Mark checked (demo)'}</button>}</div>
 </details>;
 let main:React.ReactNode;
 if(path==='overview'||path==='onboarding'){
  main=<>
   <section className="vt-demo-hero"><div className="vt-demo-hero-copy"><div className="vt-demo-greeting">✳ {isHi?'नमस्ते, दुकानदार जी!':'Namaste, Shopkeeper!'}</div><h2>{isHi?'आज दुकान का हाल':'Your dukaan today'}</h2><p>{isHi?'ज़रूरी बातें, बिना उलझन के।':'Everything important, without the clutter.'}</p><span className="vt-shop-label"><span className="material-symbols-outlined">storefront</span>{DEMO_SHOP.alias} · Jaipur</span></div><div className="vt-demo-emblem" aria-hidden="true"><span className="material-symbols-outlined">storefront</span><span>बही</span></div></section>
   <section className="vt-demo-ledger"><div className="vt-ledger-top"><span>✦ {isHi?'मेरा बही खाता':'MY BAHI-KHATA'}</span><small>{isHi?'पिछले 30 दिन':'Last 30 days'}</small></div><div className="vt-ledger-numbers"><div><span><i className="material-symbols-outlined">south_west</i>{isHi?'पैसे आए':'Money in'}</span><strong>{rupees(incoming)}</strong></div><div><span><i className="material-symbols-outlined">north_east</i>{isHi?'पैसे गए':'Money out'}</span><strong>{rupees(outgoing)}</strong></div></div><div className="vt-ledger-bottom"><span>{isHi?'सिर्फ नमूने के आँकड़े':'Illustrative records — not real earnings'}</span><button onClick={()=>onNavigate('transaction-safety')}>{isHi?'पूरा हिसाब':'Full hisaab'} <span className="material-symbols-outlined">arrow_forward</span></button></div></section>
   <DailyActionStrip onNavigate={onNavigate}/>
   <div className="vt-demo-sectionhead"><span>{isHi?'दुकान के काम':'YOUR SHOP TOOLS'}</span><span>✺</span></div>
   <div className="vt-action-grid"><KhataAction variant="green" icon="receipt_long" label={isHi?'मेरा हिसाब':'My Hisaab'} detail="Payments in & out" onClick={()=>onNavigate('transaction-safety')}/><KhataAction variant="gold" icon="emoji_events" label={isHi?'बाज़ार लीग':'Bazaar League'} detail={'Your rank: #'+myRank} onClick={()=>onNavigate('merchant-league')}/><KhataAction icon="support_agent" label={isHi?'मदद चाहिए?':'Ask for Help'} detail="Easy money tips" onClick={()=>onNavigate('ai-financial-coach')}/></div>
   <div className="vt-demo-recent"><div className="vt-demo-sectionhead"><span>{isHi?'हाल के लेन-देन':'LATEST PAYMENTS'}</span><button onClick={()=>onNavigate('transaction-safety')}>See all <span className="material-symbols-outlined">arrow_forward</span></button></div>{all.slice(0,3).map(sampleTxn)}</div>
   <button type="button" className="vt-other-toggle" aria-expanded={extra} onClick={()=>setExtra(v=>!v)}><span className="material-symbols-outlined">grid_view</span>{isHi?'और काम':'Other tools'}<span className="material-symbols-outlined">{extra?'expand_less':'expand_more'}</span></button>
   {extra&&<div className="vt-action-grid vt-more-actions">{actions.slice(3).map(a=><KhataAction key={a.path} icon={a.icon} label={isHi?a.hindi:a.english} onClick={()=>onNavigate(a.path)}/>)}</div>}
  </>;
 }else if(path==='transaction-safety'){
  const visible=all.filter(t=>filter==='all'||filter==='flagged'&&t.flagged&&!checked.includes(t.id)||t.type===filter);
  main=<>{pageHeading(isHi?'मेरा हिसाब':'My Hisaab',isHi?'देखें पैसे कहाँ आए और कहाँ गए।':'Your everyday money record, made simple.')}
   <div className="vt-demo-summaryline"><span><span className="material-symbols-outlined">receipt_long</span>{all.length} sample payments</span><span><span className="material-symbols-outlined">priority_high</span>{flagged.length} to check</span></div>
   <form className="vt-demo-addsale" onSubmit={addSampleSale}><label htmlFor="vt-sale-amount">{isHi?'नया नमूना बिक्री जोड़ें':'Try adding a sample sale'}</label><div><span>₹</span><input id="vt-sale-amount" inputMode="numeric" type="number" min="1" max="100000" placeholder="e.g. 750" value={saleAmount} onChange={e=>setSaleAmount(e.target.value)}/><button type="submit" disabled={!saleAmount||Number(saleAmount)<=0}>+ Add sale</button></div><small>Demo only. Nothing is saved to your account.</small></form>
   <div className="vt-demo-tabs" role="group" aria-label="Filter payments">{([['all','All'],['inflow','Money in'],['outflow','Money out'],['flagged','To check']] as const).map(([v,label])=><button key={v} aria-pressed={v===filter} onClick={()=>setFilter(v)}>{label}</button>)}</div>
   <div className="vt-demo-transactions">{visible.length?visible.slice(0,25).map(sampleTxn):<div className="vt-demo-empty">Nothing here right now.</div>}</div>
  </>;
 }else if(path==='merchant-league'){
  main=<RegionalLeague additionalInflow={incoming-base.incoming}/>;
 }else if(path==='ai-financial-coach'){
  const faq=[['How do I know if my shop is growing?','Compare recorded money received across similar time periods. Keep cash and UPI sales together in one daily record.'],['How do I save for slow days?','Start with a small, affordable amount. Review your expenses and avoid committing money you need for stock.'],['What should I do about an unknown payment?','Check your records first. If it looks suspicious, contact your bank using an official phone number.']];
  main=<>{pageHeading(isHi?'कोई सवाल है?':'Ask for Help','Simple answers for everyday shopkeeping.')}
   <div className="vt-demo-action-list">{faq.map(([q],i)=><KhataAction key={q} icon="menu_book" label={q} onClick={()=>setSelectedAdvice(i)}/>)}</div>
   {selectedAdvice!==null&&<div className="vt-demo-answer" role="status"><strong>{faq[selectedAdvice][0]}</strong><p>{faq[selectedAdvice][1]}</p></div>}<p className="vt-demo-caption">Sample educational guidance only. No live AI, financial advice, or lender approval is implied.</p>
  </>;
 }else if(path==='business-resilience'){
  main=<>{pageHeading(isHi?'मेरी बचत':'My Savings','Set a small target for difficult business days.')}<form className="vt-demo-form" onSubmit={e=>{e.preventDefault();if(Number(goal)>0)setSavedGoal(goal)}}><label htmlFor="vt-goal">Savings target (₹)</label><input id="vt-goal" type="number" inputMode="numeric" min="1" max="5000000" value={goal} onChange={e=>setGoal(e.target.value)}/><button type="submit" className="vt-demo-primary">Set sample target <span className="material-symbols-outlined">arrow_forward</span></button>{savedGoal&&<p role="status">Sample goal: {rupees(Number(savedGoal))}. This does not move or save real money.</p>}</form></>;
 }else if(path==='credit-readiness'){
  main=<>{pageHeading(isHi?'लोन की जानकारी':'Loan Guide','Before borrowing, check these three things.')}
   <div className="vt-demo-steps">{[['1','Know your shop records','Keep a simple history of money received and paid.'],['2','Choose a comfortable payment','A loan should not leave you short of money for stock.'],['3','Check the total cost','Compare interest, fees, repayment dates, and lender credentials.']].map(([n,h,d])=><div key={n}><span>{n}</span><div><strong>{h}</strong><p>{d}</p></div></div>)}</div><p className="vt-demo-caption">Illustrative education only — not a credit score or eligibility assessment.</p></>;
 }else if(path==='financial-passport'||path==='settings'){
  main=<>{pageHeading(isHi?'दुकान की जानकारी':'Shop Details','Your sample shop profile.')}<div className="vt-demo-profile">{[['Shop name',DEMO_SHOP.alias],['Location',`${DEMO_SHOP.locality}, ${DEMO_SHOP.city}`],['PIN code',DEMO_SHOP.pin],['Business type',DEMO_SHOP.category],['Bank verification','Not connected (demo)']].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><p className="vt-demo-caption">All details are fictional. Nothing on this page is a verified financial passport.</p></>;
 }else if(path==='consent-privacy'){
  main=<>{pageHeading(isHi?'मेरी निजता':'Your Privacy','You choose what you share.')}<div className="vt-demo-steps">{[['✓','Safe sample data','This demo uses fictional shops and transactions only.'],['✓','No bank connected','Demo buttons never read or write real financial data.'],['✓','No hidden sharing','Sample league ranks do not represent actual merchants.']].map(([n,h,d])=><div key={h}><span>{n}</span><div><strong>{h}</strong><p>{d}</p></div></div>)}</div></>;
 }else {main=<>{pageHeading('Sample experience','Explore the main shop tools.')}<KhataAction icon="storefront" label="Back to my shop" onClick={goHome}/></>}
 return <div className="vt-demo-shell">
   <div className="vt-demo-ribbon" role="status"><span className="vt-demo-ribbon-tag">✳ DEMO BAZAAR</span><span>Sample shops • No real bank data</span><div><button type="button" onClick={resetDemo} title="Restore original sample records">Reset</button><button type="button" onClick={leave} className="vt-demo-exit">Exit demo <span className="material-symbols-outlined">logout</span></button></div></div>
   {main}
 </div>;
}
