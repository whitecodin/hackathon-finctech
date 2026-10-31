import React,{useMemo,useState} from 'react';
import './SmartRestockExtras.css';
import {useShop} from '../context/ShopContext.tsx';
import {useAuth} from '../context/AuthContext.tsx';
import {useRestockPreferences} from '../lib/restockPreferences.ts';
import {useLanguage} from '../context/LanguageContext.tsx';
import {analyzeRestockCycles} from '../lib/restockInsights.ts';
import {indiaDate} from '../lib/shopLogic.ts';
const dateLabel=(day:string)=>new Date(day+'T12:00:00Z').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
const precision=(n:number)=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:1}).format(n);
export function SmartRestockPanel(){
 const shop=useShop(),{language}=useLanguage(),hi=language==='hi';
 const {merchant}=useAuth();
 const prefs=useRestockPreferences(shop.demo?-1:merchant?.id);
 const [chosen,setChosen]=useState(''),[quantity,setQuantity]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const item=shop.stock.find(s=>s.id===chosen)||shop.stock[0];
 const settings=item?prefs.get(item.id):null;
 const insight=useMemo(()=>item?analyzeRestockCycles(shop.stockCycles,item.id,indiaDate(),settings||{}):null,[shop.stockCycles,item,settings?.leadDays,settings?.planDays,settings?.bufferDays]);
 const setSetting=(field:'leadDays'|'planDays'|'bufferDays',value:number)=>{
  if(!item||!settings)return;
  if(!prefs.change(item.id,{...settings,[field]:value}))setError(hi?'सेटिंग सेव नहीं हुई।':'Could not save this setting on this device.');
  else setError('');
 };
 const latest=item?shop.stockCycles.filter(e=>e.stock_id===item.id).sort((a,b)=>b.created_at.localeCompare(a.created_at))[0]:undefined;
 const isOut=latest?.event_type==='stockout';
 const count=shop.stock.filter(x=>analyzeRestockCycles(shop.stockCycles,x.id,indiaDate()).confidence!=='learning').length;
 const save=async(type:'stockout'|'restocked')=>{
  if(!item||busy)return;
  const amount=Number(quantity);
  if(type==='restocked'&&(!quantity||!Number.isFinite(amount)||amount<=0||amount>100000)){setError(hi?'सही मात्रा लिखें।':'Enter a valid received quantity.');return}
  if(type==='stockout'&&isOut){setError(hi?'पहले नया सामान आने की एंट्री करें।':'Already marked finished. Record a restock first.');return}
  if(type==='stockout'&&!window.confirm(hi?item.item_name+' सच में खत्म हो गया? इससे दर्ज स्टॉक 0 हो जाएगा।':'Confirm '+item.item_name+' is finished today? This will set its recorded quantity to 0.'))return;
  setBusy(true);setError('');setMessage('');
  const ok=await shop.recordCheckpoint(item.id,type,type==='restocked'?amount:null);
  setBusy(false);
  if(!ok){setError(shop.error||'Could not save. Please retry.');return}
  setQuantity('');
  setMessage(type==='stockout'?(hi?'खत्म होने की तारीख सेव हुई।':'Stock-out recorded. Learning updated.'):(hi?'नया माल दर्ज हुआ। अगली भविष्यवाणी बेहतर होगी।':'Restock recorded. The next prediction can improve.'));
 };
 return <section className="sr-panel" aria-label="Personalized Smart Restock">
  <div className="sr-header"><span className="sr-symbol"><span className="material-symbols-outlined">auto_graph</span></span><div><div className="sr-eyebrow">VYAPARTRUST · SMART RESTOCK</div><h3>{hi?'कम लिखें। बेहतर अंदाज़ा पाएँ।':'Less typing. Smarter restocking.'}</h3>
  <p>{hi?'हर बिक्री लिखने की ज़रूरत नहीं। केवल सामान खत्म होने पर और नया माल आने पर बताइए।':'No need to enter every sale. Just report when an item runs out and when a new batch arrives.'}</p></div><span className="sr-learned">{count}/{shop.stock.length} {hi?'सीख रहे':'learning'}</span></div>
  {shop.demo&&<div className="sr-demo">✳ {hi?'डेमो इतिहास काल्पनिक है।':'Fictional sample cycles shown in demo mode.'}</div>}
  {item?<><div className="sr-actions">
   <label className="sr-item-label">{hi?'कौन सा सामान?':'Which item?'}<select value={item.id} onChange={e=>{setChosen(e.target.value);setQuantity('');setError('');setMessage('')}}>{shop.stock.map(s=><option key={s.id} value={s.id}>{s.item_name} · {s.unit}</option>)}</select></label>
   <div className="sr-action-buttons">
    <button type="button" className="sr-finished" disabled={busy||isOut} onClick={()=>void save('stockout')}><span className="material-symbols-outlined">production_quantity_limits</span>{isOut?(hi?'खत्म दर्ज है':'Already finished'):(hi?'आज खत्म हुआ':'Finished today')}</button>
    <label className="sr-quantity-label">{hi?'कितना नया आया?':'New stock received'}<span><input aria-label="Restock quantity" type="number" min=".01" max="100000" step=".01" placeholder="e.g. 20" value={quantity} onChange={e=>setQuantity(e.target.value)}/><small>{item.unit}</small></span></label>
    <button type="button" className="sr-restocked" disabled={busy||!quantity} onClick={()=>void save('restocked')}><span className="material-symbols-outlined">add_box</span>{hi?'नया माल आया':'Save restock'}</button>
   </div>
   {error&&<p className="sr-error" role="alert">{error}</p>}
   {message&&<p className="sr-success" role="status"><span className="material-symbols-outlined">check_circle</span>{message}</p>}
  </div>
  <div className="sr-settings" aria-label="Personalize stock planning">
   <div><strong>{hi?'आपकी दुकान के अनुसार योजना':'Your shop’s reorder preferences'}</strong><small>{hi?'इस डिवाइस पर अपने आप सेव होगा':'Saved automatically on this device, for this shop'}</small></div>
   <div className="sr-settings-grid">
    <label>{hi?'सप्लायर कितने दिन लेता है?':'Supplier delivery time'}
     <select aria-label="Supplier delivery days" value={settings?.leadDays??2} onChange={e=>setSetting('leadDays',Number(e.target.value))}>{[0,1,2,3,5,7,10,14,21,30].map(n=><option key={n} value={n}>{n} {hi?'दिन':'days'}</option>)}</select></label>
    <label>{hi?'कितने दिनों का माल रखें?':'Days of stock to plan'}
     <select aria-label="Planning days" value={settings?.planDays??14} onChange={e=>setSetting('planDays',Number(e.target.value))}>{[7,10,14,21,30,45,60].map(n=><option key={n} value={n}>{n} {hi?'दिन':'days'}</option>)}</select></label>
    <label>{hi?'अतिरिक्त सुरक्षा दिन':'Extra safety days'}
     <select aria-label="Safety buffer days" value={settings?.bufferDays??2} onChange={e=>setSetting('bufferDays',Number(e.target.value))}>{[0,1,2,3,5,7,10,14].map(n=><option key={n} value={n}>{n} {hi?'दिन':'days'}</option>)}</select></label>
   </div>
  </div>
  <div className="sr-results">
   {insight?.confidence==='learning'?<div className="sr-learning"><span className="material-symbols-outlined">insights</span><div><strong>{hi?'आपके पैटर्न को समझ रहे हैं':'Learning this shop’s pattern'}</strong>
   <p>{insight.completedCycles===0?(hi?'पहले माल आने और खत्म होने का एक पूरा चक्र दर्ज करें।':'Record a batch received, then when it runs out. Repeat to establish a pattern.'):(hi?'एक चक्र समझ लिया। अगली बार माल आने और खत्म होने पर फिर बताइए।':'One completed cycle recorded. Just one more confirmed cycle before we show a forecast.')}</p>
   </div></div>:<>
    <div className="sr-metric-grid">
     <div className="sr-metric"><span>{hi?'लगभग रोज़ की खपत':'Estimated daily use'}</span><strong>{precision(insight?.dailyRate||0)} <small>{item.unit}</small></strong><p>{insight?.completedCycles} {hi?'पुराने चक्रों पर आधारित':'completed stock cycles'}</p></div>
     <div className="sr-metric"><span>{hi?'अगली बार कब खत्म हो सकता है':'Estimated run-out'}</span><strong>{isOut?(hi?'खत्म':'Out now'):insight?.runoutOn?dateLabel(insight.runoutOn):'—'}</strong><p>{insight?.runoutOn&&!isOut?(hi?'केवल अनुमान':'Estimated, not guaranteed'):(hi?'नया माल आने पर अपडेट होगा':'Updates after restocking')}</p></div>
     <div className="sr-metric"><span>{hi?'कितना मँगाना है':'Suggested order'}</span><strong>{insight?.suggestedOrder??'—'} <small>{item.unit}</small></strong><p>{settings?.planDays??14} {hi?'दिन +':'days +'} {settings?.bufferDays??2} {hi?'सुरक्षा दिन':'buffer days'}</p>{Boolean(insight?.suggestedOrder)&&<button type="button" className="sr-use-amount" disabled={busy} onClick={()=>setQuantity(String(insight!.suggestedOrder))}>{hi?'इतनी मात्रा भरें':'Use this amount'}</button>}</div>
    </div>
    <div className="sr-order-signal" role="status"><span className="material-symbols-outlined">event_upcoming</span><div><strong>{isOut?(hi?'माल खत्म दर्ज है':'Marked out of stock'):insight?.orderNow?(hi?'सप्लायर को ऑर्डर करने का समय':'Time to consider reordering'):(hi?'ऑर्डर करने की सुझाई तारीख':'Suggested date to reorder')}: {isOut?(hi?'नया स्टॉक दर्ज करें':'Record the next delivery'):insight?.reorderOn?dateLabel(insight.reorderOn):'—'}</strong>
    <small>{hi?'अनुमानित खत्म होने की अवधि':'Possible run-out window'}: {insight?.earliestRunoutOn?dateLabel(insight.earliestRunoutOn):'—'} – {insight?.latestRunoutOn?dateLabel(insight.latestRunoutOn):'—'} · {hi?'पैटर्न':'Trend'}: {insight?.trend==='insufficient'?(hi?'अभी सीख रहे हैं':'more history needed'):insight?.trend}</small></div></div>
    <p className="sr-explain">{hi?'पुरानी खेपों की खपत से अनुमान बना है, असली गिनती नहीं। बढ़ती या घटती मांग पर धीरे-धीरे अनुकूलित होता है; त्योहार, मौसम, खराब माल और दूसरी डिलीवरी से तारीख बदल सकती है।':'Forecast adapts cautiously when newer supply cycles show rising or falling usage. This is not a physical count: holidays, wastage, missing deliveries and seasonal changes can shift the dates.'}</p>
   </>}
   <div className="sr-history"><strong>{hi?'पिछले अपडेट':'Latest updates'}</strong><div>{shop.stockCycles.filter(x=>x.stock_id===item.id).sort((a,b)=>b.reported_on.localeCompare(a.reported_on)||b.created_at.localeCompare(a.created_at)).slice(0,4).map(e=><span key={e.id}>{e.event_type==='stockout'?(hi?'खत्म':'Finished'):(hi?'आया':'Received')}{e.quantity!==null?' '+precision(e.quantity)+' '+item.unit:''} · {dateLabel(e.reported_on)}</span>)}{!shop.stockCycles.some(x=>x.stock_id===item.id)&&<span>{hi?'अभी कोई इतिहास नहीं':'No observations yet'}</span>}</div></div>
  </div>
  </>:<div className="sr-learning">{hi?'पहले एक आम सामान जोड़ें।':'Add one regularly stocked item to start.'}</div>}
 </section>;
}
