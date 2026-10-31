import React,{useCallback,useEffect,useState} from 'react';
import type {NavPath} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useShop} from '../context/ShopContext.tsx';
import {supabase} from '../lib/supabase.ts';

type AuditRow={id:number;record_table:string;record_id:string;action:'INSERT'|'UPDATE'|'DELETE';occurred_at:string};
const labels:Record<string,string>={shop_contacts:'Customer or supplier',shop_dues:'Udhar',shop_stock:'Stock item',shop_entries:'Daily Hisaab',shop_reconciliation:'Statement match',shop_stock_movements:'Item sale or restock',mohalla_campaigns:'Mohalla request',mohalla_pledges:'Group pledge',merchants:'Shop profile',transactions:'Transaction record',merchant_league_preferences:'Bazaar League settings',shop_payment_connections:'Payment provider connection',shop_payment_link_requests:'Payment connection request',shop_payment_webhook_events:'Provider notification'};
const pretty=(k:string)=>labels[k]||k.replaceAll('_',' ');

export function AuditLogView({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const shop=useShop(),{merchant}=useAuth();const [rows,setRows]=useState<AuditRow[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const load=useCallback(async()=>{
  if(shop.demo){
   const now=new Date().toISOString();
   setRows([{id:1,record_table:'shop_entries',record_id:'sample-entry',action:'INSERT',occurred_at:now},{id:2,record_table:'shop_stock',record_id:'sample-stock',action:'UPDATE',occurred_at:now},{id:3,record_table:'shop_dues',record_id:'sample-due',action:'INSERT',occurred_at:now}]);return;
  }
  if(!merchant?.id){setRows([]);return}
  setBusy(true);setError('');
  const res=await supabase.from('shop_audit').select('id,record_table,record_id,action,occurred_at').eq('merchant_id',merchant.id).order('id',{ascending:false}).limit(150);
  if(res.error)setError('Could not load change history.');else setRows((res.data||[]) as AuditRow[]);
  setBusy(false);
 },[shop.demo,merchant?.id]);
 useEffect(()=>{void load()},[load]);
 return <div className="ops-page"><div className="vc-page-head"><button className="vc-back" onClick={()=>onNavigate('overview')}>← My Dukaan</button><h2>Shop Activity History</h2><p>See when something was added, changed or removed in your shop records.</p></div>
 <p className="ops-safety">✳ {shop.demo?'DEMO — these audit events are fictional.':'Changes are logged by the database; you cannot edit or erase individual audit events from this page.'}</p>
 <div className="ops-heading"><h3>Recent events</h3><button onClick={()=>void load()} disabled={busy}>Refresh <span className="material-symbols-outlined">refresh</span></button></div>
 {error&&<p className="vc-error" role="alert">{error}</p>}
 {!rows.length?<div className="vc-empty">No changes have been recorded yet.</div>:<div className="ops-list">
 {rows.map(x=><div className="ops-audit-row" key={x.id}><span className="material-symbols-outlined">{x.action==='INSERT'?'add_circle':x.action==='UPDATE'?'edit_note':'remove_circle'}</span><div><strong>{pretty(x.record_table)}</strong><small>{x.action==='INSERT'?'Added':x.action==='UPDATE'?'Updated':'Removed'} · {new Date(x.occurred_at).toLocaleString('en-IN')}</small></div></div>)}
 </div>}
 <p className="vc-foot">The log records event type and timestamp—not full customer details, original balances, or field-by-field snapshots. The latest 150 events are shown. A full export includes the available history.</p>
 </div>;
}

const tables=[
 ['shop_entries','daily_hisaab'],
 ['shop_ai_usage','assistant_minute_usage'],
 ['shop_ai_daily_usage','assistant_daily_usage'],
 ['shop_payment_connections','payment_connections'],
 ['shop_payment_link_requests','payment_connection_requests'],
 ['shop_payment_webhook_events','provider_webhook_receipts'],
 ['shop_contacts','contacts'],
 ['shop_dues','dues'],
 ['shop_stock','stock'],
 ['shop_stock_movements','stock_movements'],
 ['shop_reconciliation','statement_uploads'],
 ['transactions','transactions'],
 ['mohalla_campaigns','group_requests'],
 ['mohalla_pledges','my_group_pledges'],
 ['merchant_league_preferences','league_preferences'],
 ['shop_audit','audit_history'],
] as const;

const downloadJson=(data:unknown)=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.download='vyapartrust-my-shop-export-'+new Date().toISOString().slice(0,10)+'.json';
 a.href=url;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
};
export function DataControlsView({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const {merchant,user}=useAuth(),shop=useShop();
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const [shopPhrase,setShopPhrase]=useState(''),[accountPhrase,setAccountPhrase]=useState('');
 const exportData=async()=>{
  setBusy(true);setError('');setMessage('');
  try{
   if(shop.demo){downloadJson({source:'FICTIONAL DEMO ONLY',generatedAt:new Date().toISOString(),contacts:shop.contacts,dues:shop.dues,stock:shop.stock,entries:shop.entries});setMessage('Sample export downloaded.');return}
   if(!merchant?.id||!user)throw Error('Sign in first.');
   const authProfile=await supabase.auth.getUser();if(authProfile.error)throw authProfile.error;
   const profile=authProfile.data.user;
   const result:Record<string,unknown>={metadata:{source:'VyaparTrust merchant-entered data and app activity',exportedAt:new Date().toISOString(),bankVerified:false},account:{userId:user.uid,email:user.email,createdAt:profile?.created_at,lastSignIn:profile?.last_sign_in_at,userMetadata:profile?.user_metadata},merchant};
   for(const [table,key] of tables){
    const rows:unknown[]=[];
    for(let offset=0;offset<100000;offset+=500){
     const r=await supabase.from(table).select('*').eq('merchant_id',merchant.id).range(offset,offset+499);
     if(r.error)throw new Error('Export failed on '+table+': '+r.error.message);
     rows.push(...(r.data||[]));
     if((r.data||[]).length<500)break;
     if(offset+500>=100000)throw Error('Export too large; request a server-assisted export. No partial file was downloaded.');
    }
    result[key]=rows;
   }
   downloadJson(result);
   setMessage('Your export is downloaded. Keep the file private—it may contain customer and financial details.');
  }catch(e){setError(e instanceof Error?e.message:'Export failed.')}finally{setBusy(false)}
 };
 const clearShop=async()=>{
  if(shop.demo){setError('This is the sample shop. Exit demo to manage real records.');return}
  if(shopPhrase!=='DELETE MY SHOP DATA')return;
  if(!window.confirm('Permanently delete ALL your shop records, statements, dues, stock, audit history and group participation? This cannot be undone.'))return;
  setBusy(true);setError('');setMessage('');
  try{
   const r=await supabase.rpc('clear_my_shop_records',{p_confirmation:'DELETE MY SHOP DATA'});
   if(r.error)throw r.error;
   await shop.refresh();setShopPhrase('');
   setMessage('Your shop records were cleared. Your profile and login remain.');
  }catch(e){setError(e instanceof Error?e.message:'Could not clear shop records.')}finally{setBusy(false)}
 };
 const deleteAccount=async()=>{
  if(shop.demo){setError('Account deletion is unavailable in the sample shop.');return}
  if(accountPhrase!=='DELETE MY ACCOUNT')return;
  if(!window.confirm('Final confirmation: permanently delete your account, merchant profile and all associated app records? This cannot be undone.'))return;
  setBusy(true);setError('');setMessage('');
  try{
   const result=await supabase.functions.invoke('delete-my-vyapartrust-account',{body:{confirmation:'DELETE MY ACCOUNT'}});
   if(result.error)throw result.error;
   if(!result.data?.deleted)throw new Error(result.data?.error||'Account deletion not confirmed. Please contact the administrator.');
   await supabase.auth.signOut();window.location.assign('/');
  }catch(e){setError(e instanceof Error?e.message:'Account deletion was not completed.')}finally{setBusy(false)}
 };
 return <div className="ops-page"><div className="vc-page-head"><button className="vc-back" onClick={()=>onNavigate('overview')}>← My Dukaan</button><h2>My Data & Privacy</h2><p>Your shop records belong to you. Download a copy or choose what to erase.</p></div>
 {shop.demo&&<p className="ops-safety">✳ DEMO MODE — only fictional data. Real account actions are disabled.</p>}
 {error&&<p className="vc-error" role="alert">{error}</p>}{message&&<p className="ops-success" role="status">{message}</p>}
 <section className="vc-panel ops-controls"><div className="ops-heading"><h3>Download my data</h3><span className="material-symbols-outlined">download</span></div><p>Get a JSON copy of your own customer, payment, stock, procurement, league and audit records. The export is saved on your device and can contain private details.</p><button type="button" className="vc-primary" disabled={busy} onClick={()=>void exportData()}>{busy?'Preparing…':'Download my data'} <span className="material-symbols-outlined">download</span></button></section>
 <section className="vc-panel ops-controls"><h3>Clear my shop records</h3><p>This permanently removes the shop’s recorded Hisaab, dues, customers, stock, uploaded statements, procurement participation, transactions and audit events. Your shop profile and sign-in remain.</p><p className="ops-danger-text">Download your data first. This cannot be undone.</p><label>Type DELETE MY SHOP DATA<input value={shopPhrase} onChange={e=>setShopPhrase(e.target.value)} autoComplete="off" placeholder="DELETE MY SHOP DATA"/></label><button type="button" className="ops-danger-button" disabled={busy||shop.demo||shopPhrase!=='DELETE MY SHOP DATA'} onClick={()=>void clearShop()}>Permanently clear shop records</button></section>
 <section className="vc-panel ops-controls"><h3>Delete my entire account</h3><p>This permanently removes your VyaparTrust sign-in, shop profile and all its business records. Sign in again immediately before proceeding; account deletion requires a fresh sign-in within 15 minutes.</p><p className="ops-danger-text">Irreversible. Download your data first and confirm you no longer need access.</p><label>Type DELETE MY ACCOUNT<input value={accountPhrase} onChange={e=>setAccountPhrase(e.target.value)} autoComplete="off" placeholder="DELETE MY ACCOUNT"/></label><button type="button" className="ops-danger-button" disabled={busy||shop.demo||accountPhrase!=='DELETE MY ACCOUNT'} onClick={()=>void deleteAccount()}>Permanently delete account</button></section>
 <p className="vc-foot">This controls VyaparTrust app data. It cannot delete copies of bank statements you downloaded elsewhere, messages already shared externally, or backups governed by your infrastructure retention policy. A verified privacy review is still required before broad public release.</p>
 </div>;
}
