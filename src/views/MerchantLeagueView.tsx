/** Live Bazaar League: opt-in, server-calculated, no peer turnover exposed.
 * See BAZAAR_LEAGUE_V2.sql for the authenticated restricted RPC.
 */
import React,{useCallback,useEffect,useState} from 'react';
import type {Merchant,NavPath} from '../types.ts';
import {supabase} from '../lib/supabase.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useLanguage} from '../context/LanguageContext.tsx';
type Scope='local'|'city'|'district'|'state';type Mode='activity'|'growth';
type LeagueRow={alias:string;place:number;is_self:boolean;cohort_size:number;growth_percent:number|null;region_name:string;refreshed_at:string};
const scopes:{id:Scope;icon:string;en:string;hi:string}[]=[
 {id:'local',icon:'location_on',en:'My PIN',hi:'पिन कोड'},{id:'city',icon:'location_city',en:'City',hi:'शहर'},
 {id:'district',icon:'map',en:'District',hi:'ज़िला'},{id:'state',icon:'flag',en:'State',hi:'राज्य'}];
export function MerchantLeagueView({onNavigate}:{onNavigate?:(p:NavPath)=>void}){
 const {merchant}=useAuth();const {language}=useLanguage();const hi=language==='hi';
 const [scope,setScope]=useState<Scope>('local'),[mode,setMode]=useState<Mode>('activity');
 const [alias,setAlias]=useState(''),[optedIn,setOptedIn]=useState(false),[rows,setRows]=useState<LeagueRow[]>([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[showAll,setShowAll]=useState(false);
 const ready=Boolean(merchant?.pinCode&&/^[0-9]{6}$/.test(merchant.pinCode)&&merchant.city?.trim()&&merchant.district?.trim()&&merchant.state?.trim());
 const areaLabel=scope==='local'?'PIN '+(merchant?.pinCode||'—'):scope==='city'?(merchant?.city||'City'):scope==='district'?(merchant?.district||'District'):merchant?.state||'State';
 const load=useCallback(async()=>{
  if(!merchant?.id){setLoading(false);setError('Add your shop details first.');return}
  setLoading(true);setError('');
  try{
   const pref=await supabase.from('merchant_league_preferences').select('opted_in,display_alias').eq('merchant_id',merchant.id).maybeSingle();
   if(pref.error)throw pref.error;
   const enrolled=Boolean(pref.data?.opted_in);setOptedIn(enrolled);
   if(pref.data?.display_alias)setAlias(pref.data.display_alias);
   if(!enrolled||!ready){setRows([]);return}
   const result=await supabase.rpc('get_bazaar_league',{p_scope:scope,p_mode:mode});
   if(result.error)throw result.error;
   setRows((result.data||[]) as LeagueRow[]);
  }catch{setError(hi?'लीग अभी नहीं खुल रही। फिर कोशिश करें।':'Could not open rankings. Please try again.')}finally{setLoading(false)}
 },[merchant?.id,ready,scope,mode,hi]);
 useEffect(()=>{void load()},[load]);
 const save=async(join:boolean)=>{
  if(!merchant?.id)return;
  if(join&&!ready){setError(hi?'पहले शहर, ज़िला, राज्य और पिन कोड भरें।':'First add your correct PIN, city, district and state in Shop Settings.');return}
  if(join&&!/^[\p{L}\p{N} ._-]{3,40}$/u.test(alias.trim())){setError(hi?'3 से 40 अक्षरों का नाम भरें।':'Enter a nickname of 3 to 40 letters or numbers.');return}
  setBusy(true);setError('');
  try{
   const result=await supabase.from('merchant_league_preferences').upsert({merchant_id:merchant.id,opted_in:join,display_alias:alias.trim()||'Local Shop',updated_at:new Date().toISOString()},{onConflict:'merchant_id'});
   if(result.error)throw result.error;
   setOptedIn(join);
   if(!join)setRows([]);else await load();
  }catch{setError(hi?'जानकारी सेव नहीं हुई। फिर कोशिश करें।':'Could not save your choice. Try again.')}
  finally{setBusy(false)}
 };
 const me=rows.find(x=>x.is_self);const total=rows.length?rows[0].cohort_size:0;
 const percent=me?Math.ceil((me.place/total)*100):null;
 const displayed=showAll?rows:rows.slice(0,7);
 return <div className="easy-page vt-region-league vt-live-region">
   <div className="vt-region-banner"><div><span className="vt-region-kicker">✺ APNA BAZAAR · APNI PEHCHAAN</span><h2>{hi?'मेरे इलाक़े की लीग':'My Regional League'}</h2><p>{hi?'पास की दुकानों से दोस्ताना मुकाबला।':'A friendly league for shops like yours.'}</p>
   <span className="vt-region-banner-tag"><span className="material-symbols-outlined">storefront</span>{merchant?.category||'Kirana'}</span></div>
   <div className="vt-region-art" aria-hidden="true">✺<strong>बाज़ार</strong></div></div>
   <div className="vt-region-path"><span>📍 {merchant?.pinCode||'PIN needed'}</span><span>›</span><span>{merchant?.city||'City'}</span><span>›</span><span>{merchant?.district||'District'}</span><span>›</span><span>{merchant?.state||'State'}</span></div>
   <div className="vt-region-intro"><h3>{hi?'कहाँ मुकाबला देखें?':'Choose your area'}</h3><p>{hi?'अपनी जगह बदलने के लिए सेटिंग्स खोलें।':'Your region follows your saved shop address.'}</p></div>
   <div className="vt-region-scopes" role="group" aria-label="Region">{scopes.map(t=><button type="button" key={t.id} aria-pressed={scope===t.id} onClick={()=>{setScope(t.id);setShowAll(false)}}>
   <span className="material-symbols-outlined">{t.icon}</span><strong>{hi?t.hi:t.en}</strong><small>{t.id==='local'?'PIN '+(merchant?.pinCode||'—'):t.id==='city'?(merchant?.city||'Not added'):t.id==='district'?(merchant?.district||'Not added'):(merchant?.state||'Not added')}</small></button>)}</div>
   {!ready?<div className="vt-region-insight"><span className="material-symbols-outlined">location_off</span><div><strong>{hi?'पहले अपना इलाक़ा भरें':'Add your league area'}</strong><p>{hi?'सही पिन कोड, शहर, ज़िला और राज्य भरें।':'We need your PIN, city, district and state to find the right local league. These are self-reported until verified.'}</p>
   <button type="button" className="vt-region-link" onClick={()=>onNavigate?.('settings')}>{hi?'दुकान की सेटिंग्स':'Open Shop Settings'} →</button></div></div>:null}
   {error&&<p className="vt-settings-status" role="alert">{error}</p>}
   {loading?<div className="desi-league-state" role="status">{hi?'लीग खुल रही है…':'Opening your league…'}</div>:ready&&!optedIn?<div className="desi-league-join"><span className="desi-join-icon material-symbols-outlined">handshake</span><h3>{hi?'अपना बाज़ार जॉइन करें':'Join your bazaar'}</h3><p>{hi?'शामिल होना आपकी मर्ज़ी है। दूसरे दुकानदार सिर्फ आपका उपनाम और रैंक देख पाएँगे।':'Joining is optional. Other participants can see your nickname, rank and relative growth—not your exact income, account or transactions.'}</p><label htmlFor="real-league-name">{hi?'आपका लीग नाम':'Your league nickname'}</label><input id="real-league-name" maxLength={40} value={alias} onChange={e=>setAlias(e.target.value)} placeholder="e.g. Apna Kirana"/>
   <button type="button" className="easy-primary" disabled={busy} onClick={()=>void save(true)}>{hi?'लीग जॉइन करें':'Join league'} <span className="material-symbols-outlined">arrow_forward</span></button></div>:optedIn&&ready?<React.Fragment>
    <div className="vt-region-board-top"><div><span className="vt-region-label">✦ {hi?'मेरी लीग':'MY LEAGUE'}</span><h3>{areaLabel}</h3><small>{total||0} {hi?'शामिल दुकानें':'participating shops'}</small></div>
     <div className="vt-region-modes" role="group" aria-label="Ranking"><button type="button" aria-pressed={mode==='activity'} onClick={()=>setMode('activity')}>{hi?'बाज़ार सितारे':'Bazaar Stars'}</button><button type="button" aria-pressed={mode==='growth'} onClick={()=>setMode('growth')}>{hi?'तरक्की सितारे':'Rising Stars'}</button></div></div>
    {me&&<div className="vt-region-me"><div className="vt-region-rank-circle"><span>MY PLACE</span><strong>#{me.place}</strong><small>of {total}</small></div><div className="vt-region-me-copy"><span>✳ {merchant?.storeName||'MY SHOP'}</span><h3>{hi?'मेरी लीग में जगह':'Your local position'}</h3><p>{mode==='growth'?'Compared with your shop’s previous month.':'Ranked among participating shops of your category.'}</p><div className="vt-region-pillset"><span>Top {percent}%</span>{mode==='growth'&&me.growth_percent!==null&&<span>{me.growth_percent>0?'+':''}{me.growth_percent}% growth</span>}</div></div></div>}
    {rows.length<5?<div className="desi-league-state"><span className="material-symbols-outlined">groups</span><h3>{hi?'अभी लीग बन रही है':'Your league is forming'}</h3><p>{mode==='growth'?'Rising Stars needs at least five shops with two months of records.':'At least five opted-in, active shops with matching regional details are needed. Positions update about every 30 minutes.'}</p></div>:<>
    <div className="vt-region-listheading"><h3>{hi?'बाज़ार के सितारे':'Bazaar board'}</h3><small>{mode==='growth'?'Growth against own previous month':'Recorded activity (no peer revenue shown)'}</small></div>
    <div className="vt-region-rows">{displayed.map((r,i)=><div key={r.place} className={'vt-region-row '+(r.is_self?'self':'')}><span className="vt-region-position">{i<3?['🥇','🥈','🥉'][i]:'#'+r.place}</span><span className="vt-region-shop"><strong>{r.alias}{r.is_self?' · You':''}</strong><small>{r.is_self?'Your shop':'Participating shop'} · {areaLabel}</small></span><span className="vt-region-score"><strong>{mode==='growth'&&r.growth_percent!==null?(r.growth_percent>0?'+':'')+r.growth_percent+'%':r.place<=3?'Bazaar Star':'Shop Star'}</strong><small>{mode==='growth'?'relative change':'place only'}</small></span></div>)}</div>
    {rows.length>7&&<button type="button" className="vt-region-showall" onClick={()=>setShowAll(v=>!v)}>{showAll?'Show fewer':'See all shops'} <span className="material-symbols-outlined">{showAll?'expand_less':'expand_more'}</span></button>}
    </>}
    <button type="button" className="easy-back" disabled={busy} onClick={()=>void save(false)}>{hi?'लीग छोड़ें':'Leave league'}</button>
   </React.Fragment>:null}
   <details className="vt-region-rules"><summary><span className="material-symbols-outlined">shield</span>{hi?'नियम और निजता':'Rules & privacy'}<span className="material-symbols-outlined">expand_more</span></summary><p>Opt-in only. Rankings use 30-day recorded inflows, not profit or bank-verified turnover. Rising Stars needs two months of records. Region is based on your self-reported location until postal validation is available. Minimum five active participants per board. Peer amounts and identities are not shared.</p></details>
 </div>;
}
