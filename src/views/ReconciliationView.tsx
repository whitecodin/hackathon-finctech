import React,{useCallback,useEffect,useMemo,useState} from 'react';
import type {NavPath} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useShop,formatRupees} from '../context/ShopContext.tsx';
import {supabase} from '../lib/supabase.ts';
import {parseStatementCsv,sameDayPaymentCandidates,sampleCsv} from '../lib/operations.ts';
import type {StatementLine} from '../lib/operations.ts';
import {indiaDate} from '../lib/shopLogic.ts';

type StatementRow=StatementLine&{id:string;matched_entry_id:string|null;fingerprint:string;source_label:string};
const fields=(s:StatementLine)=>[s.txn_date,s.direction,s.amount.toFixed(2),s.reference,s.description].join('|');
async function digest(input:string){
 const bytes=new TextEncoder().encode(input);
 const buffer=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(buffer)).map(v=>v.toString(16).padStart(2,'0')).join('');
}
const todayStr=()=>indiaDate();
export function ReconciliationView({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const {merchant}=useAuth(),shop=useShop();
 const [records,setRecords]=useState<StatementRow[]>([]),[draft,setDraft]=useState<StatementLine[]>([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
 const load=useCallback(async()=>{
  if(shop.demo){
   const sample=shop.entries.filter(x=>x.payment_method!=='Cash').slice(0,3).map((x,i)=>({id:'demo-bank-'+i,fingerprint:'demo-'+i,txn_date:x.entry_date,direction:x.kind==='sale'?'credit' as const:'debit' as const,amount:x.amount,description:x.note,reference:'SAMPLE-'+i,source_label:'Fictional demo statement',matched_entry_id:null}));
   setRecords(sample);return;
  }
  if(!merchant?.id)return;
  setLoading(true);
  const {data,error}=await supabase.from('shop_reconciliation').select('id,fingerprint,txn_date,direction,amount,reference,description,source_label,matched_entry_id').eq('merchant_id',merchant.id).order('txn_date',{ascending:false}).limit(500);
  if(error)setError('Could not load uploaded statement records.');
  else setRecords(((data||[]) as StatementRow[]).map(x=>({...x,amount:Number(x.amount)})));
  setLoading(false);
 },[merchant?.id,shop.demo]); // sample changes are local state until reopening
 useEffect(()=>{void load()},[load]);
 const fileRead=async(f:File|null)=>{setError('');setMessage('');if(!f)return;try{setDraft(parseStatementCsv(await f.text()))}catch(e){setDraft([]);setError(e instanceof Error?e.message:'Could not read CSV')}};
 const save=async()=>{if(!draft.length)return;setBusy(true);setError('');setMessage('');
  try{
   const fileFingerprint=await digest(draft.map(fields).join('\n'));
   const prepared=await Promise.all(draft.map(async(x,i)=>({...x,fingerprint:await digest(fields(x)+'|'+(x.reference?'reference':'file:'+fileFingerprint+':'+i)),source_label:'Merchant uploaded CSV',merchant_id:merchant?.id})));
   if(shop.demo){const existing=new Set(records.map(x=>x.fingerprint));const added=prepared.filter(x=>!existing.has(x.fingerprint)).map((x,i)=>({...x,id:'sample-statement-'+i,matched_entry_id:null}));
    setRecords(old=>[...added,...old]);setMessage('Added '+added.length+' sample lines.');setDraft([]);return}
   if(!merchant?.id)throw Error('Sign in to save statement lines.');
   const result=await supabase.from('shop_reconciliation').upsert(prepared,{onConflict:'merchant_id,fingerprint',ignoreDuplicates:true});
   if(result.error)throw result.error;setMessage('Import complete. Duplicate lines were skipped. Please review matches.');setDraft([]);await load();
  }catch(e){setError(e instanceof Error?e.message:'Import failed')}finally{setBusy(false)}
 };
 const match=async(statement:StatementRow,entryId:string)=>{
  setBusy(true);setError('');
  try{
   if(shop.demo){setRecords(old=>old.map(x=>x.id===statement.id?{...x,matched_entry_id:entryId}:x));return}
   const result=await supabase.rpc('review_statement_match',{p_statement_id:statement.id,p_entry_id:entryId});
   if(result.error)throw result.error;setMessage('Match recorded after your review.');await load();
  }catch(e){setError(e instanceof Error?e.message:'Could not link entries')}finally{setBusy(false)}
 };
 const used=new Set(records.filter(x=>x.matched_entry_id).map(x=>x.matched_entry_id!));
 const pending=records.filter(x=>!x.matched_entry_id);
 const confirmed=records.length-pending.length;
 const sampleTemplate=()=>{const blob=new Blob([sampleCsv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='vyapartrust-statement-template.csv';a.click();URL.revokeObjectURL(url)};
 return <div className="ops-page">
 <div className="vc-page-head"><button className="vc-back" onClick={()=>onNavigate('overview')}>← My Dukaan</button><h2>Match My Payments</h2><p>Upload a statement CSV, review possible matches, and spot missing entries.</p></div>
 <p className="ops-safety">✳ {shop.demo?'DEMO — fictional payments only.':'User-uploaded records only. Uploads are NOT independently verified with a bank.'}</p>
 <div className="vc-totals"><div><span>Needs review</span><strong>{pending.length}</strong></div><div><span>Matched by you</span><strong>{confirmed}</strong></div></div>
 <section className="vc-panel ops-upload"><div className="ops-heading"><h3>1. Import a statement</h3><button type="button" onClick={sampleTemplate}>Get CSV template <span className="material-symbols-outlined">download</span></button></div>
 <p>Use these columns: <strong>Date, Direction, Amount, Reference, Description</strong>. Dates must be YYYY-MM-DD. Direction is credit or debit. Export from your provider and convert to this template locally.</p>
 <label>Choose CSV file<input type="file" accept=".csv,text/csv" onChange={e=>void fileRead(e.target.files?.[0]||null)}/></label>
 {draft.length>0&&<div className="ops-preview"><strong>{draft.length} lines ready</strong><span>Example: {draft[0].txn_date}, {draft[0].direction}, {formatRupees(draft[0].amount)}</span><button disabled={busy} className="vc-primary" type="button" onClick={()=>void save()}>{busy?'Importing…':'Import & check'} →</button></div>}
 </section>
 {error&&<p role="alert" className="vc-error">{error}</p>}{message&&<p role="status" className="ops-success">{message}</p>}
 <section className="ops-section"><div className="vc-heading"><h3>2. Review payments</h3><span>{records.length} statement lines</span></div>
 {loading?<p>Loading…</p>:!records.length?<div className="vc-empty">No statement yet. Import a CSV to begin.</div>:
 <div className="ops-list">{records.slice(0,120).map(line=>{
  const matches=sameDayPaymentCandidates(line,shop.entries,used);
  return <div className="ops-match" key={line.id}>
   <div className="ops-match-head"><div><strong>{line.description||line.reference||'Statement payment'}</strong><small>{line.txn_date} · {line.direction==='credit'?'Money received':'Money sent'} · {line.source_label}</small></div><b>{formatRupees(line.amount)}</b></div>
   {line.matched_entry_id?<span className="ops-status matched"><span className="material-symbols-outlined">check_circle</span> Manually matched — not bank-verified</span>:<div className="ops-match-actions">
    {matches.length?<><span>Matching Hisaab entries:</span>{matches.slice(0,3).map(entry=><button type="button" disabled={busy} key={entry.id} onClick={()=>void match(line,entry.id)}>Confirm {entry.entry_date} · {formatRupees(entry.amount)}</button>)}</>:<span className="ops-status">No exact match yet. Compare your records manually; nothing is auto-approved.</span>}
   </div>}
  </div>})}</div>}
 </section>
 <p className="vc-foot">A match links a manually entered Hisaab line with an uploaded statement line. It does not initiate a transfer, prove a bank payment, or change your totals. Identical lines may be duplicated when imported from different files without unique references.</p>
 </div>;
}
