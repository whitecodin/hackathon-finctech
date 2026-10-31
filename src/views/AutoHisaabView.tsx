import React,{useCallback,useEffect,useState} from 'react';
import type {NavPath} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useDemo} from '../demo/DemoContext.tsx';
import {useShop,formatRupees} from '../context/ShopContext.tsx';
import {supabase} from '../lib/supabase.ts';
import {indiaDate} from '../lib/shopLogic.ts';
type Connection={id:string;provider:string;provider_account_id:string;status:'active'|'disconnected';approved_at:string};
type Request={id:string;account_hint:string;status:'pending'|'approved'|'rejected';created_at:string};
const getKind=(x:{source?:string;payment_verified_at?:string|null})=>x.source==='provider'&&x.payment_verified_at;
export function AutoHisaabView({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const {merchant}=useAuth(),{demoEnabled}=useDemo(),shop=useShop();
 const [connections,setConnections]=useState<Connection[]>([]),[requests,setRequests]=useState<Request[]>([]);
 const [account,setAccount]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const automatic=shop.entries.filter(x=>getKind(x)),manual=shop.entries.filter(x=>!getKind(x));
 const today=indiaDate();
 const autoToday=automatic.filter(x=>x.entry_date===today);
 const inToday=autoToday.filter(x=>x.kind==='sale').reduce((s,x)=>s+x.amount,0);
 const outToday=autoToday.filter(x=>x.kind==='expense').reduce((s,x)=>s+x.amount,0);
 const load=useCallback(async()=>{
  if(demoEnabled){setConnections([{id:'demo',provider:'razorpay',provider_account_id:'acc_DEMOONLY',status:'active',approved_at:new Date().toISOString()}]);setRequests([]);return}
  if(!merchant?.id)return;
  setLoading(true);setError('');
  const [c,r]=await Promise.all([
   supabase.from('shop_payment_connections').select('id,provider,provider_account_id,status,approved_at').eq('merchant_id',merchant.id),
   supabase.from('shop_payment_link_requests').select('id,account_hint,status,created_at').eq('merchant_id',merchant.id)
  ]);
  if(c.error||r.error)setError('Could not load payment connection status.');
  else{setConnections((c.data||[]) as Connection[]);setRequests((r.data||[]) as Request[])}
  setLoading(false);
 },[merchant?.id,demoEnabled]);
 useEffect(()=>{void load()},[load]);
 const requestLink=async(e:React.FormEvent)=>{
  e.preventDefault();setError('');setMessage('');
  if(!/^acc_[a-zA-Z0-9]{6,96}$/.test(account.trim())){setError('Enter the Razorpay merchant account ID starting with acc_. This is not a UPI ID.');return}
  if(!merchant?.id)return;
  setBusy(true);
  const result=await supabase.from('shop_payment_link_requests').insert({merchant_id:merchant.id,provider:'razorpay',account_hint:account.trim(),status:'pending'});
  if(result.error)setError('Connection request could not be submitted. An existing request may be pending.');
  else{setAccount('');setMessage('Request saved. A verified provider-account ownership check is required before activation.');await load()}
  setBusy(false);
 };
 const disconnect=async()=>{
  if(!window.confirm('Stop new Razorpay payments from being added? Existing payment history remains.'))return;
  setBusy(true);setError('');setMessage('');
  const res=await supabase.rpc('disconnect_my_payment_provider',{p_provider:'razorpay'});
  if(res.error)setError('Could not disconnect payment feed.');
  else{setMessage('Connection stopped. Previous records remain in your shop.');await load()}
  setBusy(false);
 };
 const simulate=async()=>{
  if(!demoEnabled)return;
  setBusy(true);
  const amount=120+Math.floor(Math.random()*350);
  const ok=await shop.add('entries',{
   entry_date:indiaDate(),kind:'sale',payment_method:'UPI',amount,
   note:'Demo: automatic Razorpay UPI received',
   source:'provider',provider:'razorpay',provider_reference:'payment:demo-'+Date.now(),
   payment_verified_at:new Date().toISOString(),matched_provider_entry_id:null
  });
  setBusy(false);
  if(ok)setMessage('New demo UPI payment added automatically: '+formatRupees(amount));
 };
 const active=connections.find(x=>x.status==='active');
 const pending=requests.find(x=>x.status==='pending');
 return <div className="ops-page">
  <div className="vc-page-head"><button className="vc-back" onClick={()=>onNavigate('overview')}>← My Dukaan</button><h2>Auto Hisaab</h2><p>Successful connected payments appear in your shop automatically—even when this app is closed.</p></div>
  {demoEnabled&&<p className="ops-safety">✳ DEMO — this is a simulated feed, not connected to a real UPI account.</p>}
  <div className="vc-totals"><div><span>Automatically received today</span><strong>{formatRupees(inToday)}</strong></div><div><span>Automatically paid out today</span><strong>{formatRupees(outToday)}</strong></div></div>
  {error&&<p role="alert" className="vc-error">{error}</p>}{message&&<p role="status" className="ops-success">{message}</p>}
  <section className="vc-panel ops-auto-status">
    <div className="ops-heading"><h3>Payment connection</h3><span className={'ops-auto-pill '+(active?'connected':'')}>{active?'Connected':pending?'Under review':'Not connected'}</span></div>
    {loading?<p>Checking status…</p>:active?<><p><strong>Razorpay merchant account:</strong> {active.provider_account_id.slice(0,7)}…{active.provider_account_id.slice(-3)}</p><p>Only payments confirmed by the connected provider are included in automatic Hisaab. Not all external UPI apps or bank transfers are covered.</p>{!demoEnabled&&<button className="ops-danger-button" disabled={busy} onClick={()=>void disconnect()}>Disconnect provider</button>}</>:
    pending?<><p>Your request is saved. Activation requires checking that this Razorpay account belongs to your shop, plus the webhook setup performed by the platform operator.</p><p>Requested account: <strong>{pending.account_hint.slice(0,7)}…</strong></p></>:
    <><p>To receive automatic entries, use a supported business payment provider and have its merchant account linked with verified ownership.</p>
    <p><strong>Important:</strong> A UPI ID alone does not grant access to transaction history. Never share a UPI PIN, bank password, OTP, or provider API secret here.</p>
    {!demoEnabled&&<form className="vc-form" onSubmit={e=>void requestLink(e)}>
     <label>Razorpay merchant account ID (not UPI ID)<input required maxLength={100} value={account} onChange={e=>setAccount(e.target.value)} placeholder="acc_..." autoComplete="off"/></label>
     <button className="vc-primary" type="submit" disabled={busy}>Request secure connection <span className="material-symbols-outlined">arrow_forward</span></button>
    </form>}</>}
    {demoEnabled&&<button className="vc-primary" onClick={()=>void simulate()} disabled={busy}><span className="material-symbols-outlined">bolt</span> Simulate a UPI payment</button>}
  </section>
  <section className="vc-panel"><div className="ops-heading"><h3>Automatically recorded payments</h3><span>{automatic.length} entries</span></div>
  {!automatic.length?<div className="vc-empty">No provider-confirmed payments yet. Connected payments will appear here without manual entry.</div>:
   <div className="ops-list">{automatic.slice().reverse().slice(0,25).map(x=><div className="vc-list-line" key={x.id}>
    <span className="ops-auto-icon material-symbols-outlined">{x.kind==='sale'?'south_west':'north_east'}</span>
    <div className="vc-record-main"><strong>{x.note}</strong><small>{x.entry_date} · {x.payment_method} · Provider-confirmed</small></div>
    <b>{x.kind==='sale'?'+':'−'}{formatRupees(x.amount)}</b>
   </div>)}</div>}
  </section>
  <section className="ops-auto-guide"><h3>What happens without opening the app?</h3>
   <div><span className="material-symbols-outlined">verified_user</span><p><strong>1. The provider confirms payment.</strong> Signed events are verified on our server.</p></div>
   <div><span className="material-symbols-outlined">receipt_long</span><p><strong>2. Hisaab is updated once.</strong> Retries do not add duplicate entries. Matching manual records are flagged to avoid double counting.</p></div>
   <div><span className="material-symbols-outlined">notifications_active</span><p><strong>3. Only exceptions need your attention.</strong> Customer udhar, cash spending and stock items are not guessed from a payment amount.</p></div>
  </section>
  <p className="vc-foot">This integration is read-only: it does not initiate payments or request UPI PINs. Outgoing automation needs supported provider payout events. Arbitrary personal UPI/bank transactions need a separate authorised integration.</p>
  <button className="easy-back" onClick={()=>onNavigate('daily-hisaab')}>← Open Daily Hisaab</button>
 </div>;
}
