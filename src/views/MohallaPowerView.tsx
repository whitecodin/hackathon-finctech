import React,{useCallback,useEffect,useState} from 'react';
import type {NavPath} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useShop} from '../context/ShopContext.tsx';
import {supabase} from '../lib/supabase.ts';
import {indiaDate} from '../lib/shopLogic.ts';
type Campaign={id:string;merchant_id:number;item_name:string;unit:'packs'|'boxes'|'kg'|'litres'|'pcs';city:string;state:string;target_quantity:number;closes_on:string;description:string};
type Pledge={id:string;campaign_id:string;merchant_id:number;quantity:number};
type Stat={participants:number|null;pledged_total:number|null;target_quantity:number};
const daysAhead=(n:number)=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
const sampleCampaigns:Campaign[]=[
 {id:'m1',merchant_id:-2,item_name:'Atta cartons',unit:'boxes',city:'Jaipur',state:'Rajasthan',target_quantity:150,closes_on:daysAhead(16),description:'Neighbourhood wholesalers can quote after the group forms.'},
 {id:'m2',merchant_id:-2,item_name:'Cooking oil',unit:'litres',city:'Jaipur',state:'Rajasthan',target_quantity:90,closes_on:daysAhead(9),description:'Group quantity enquiry, not a price agreement.'}
];
export function MohallaPowerView({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const {merchant}=useAuth(),shop=useShop();
 const [campaigns,setCampaigns]=useState<Campaign[]>([]),[pledges,setPledges]=useState<Pledge[]>([]),[stats,setStats]=useState<Record<string,Stat>>({});
 const [item,setItem]=useState(''),[unit,setUnit]=useState<Campaign['unit']>('boxes'),[target,setTarget]=useState(''),[closes,setCloses]=useState(daysAhead(14)),[description,setDescription]=useState(''),[qty,setQty]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(false);
 const city=shop.demo?'Jaipur':merchant?.city?.trim()||'',state=shop.demo?'Rajasthan':merchant?.state?.trim()||'';
 const myId=shop.demo?-1:(merchant?.id??-1);
 const load=useCallback(async()=>{
  if(shop.demo){setCampaigns(sampleCampaigns);setPledges([{id:'sample-p1',merchant_id:-1,campaign_id:'m1',quantity:20}]);setStats({m1:{participants:6,pledged_total:115,target_quantity:150},m2:{participants:null,pledged_total:null,target_quantity:90}});return}
  if(!merchant?.id||!city||!state){setCampaigns([]);return}
  setLoading(true);setError('');
  try{
   const {data,error}=await supabase.from('mohalla_campaigns').select('id,merchant_id,item_name,unit,city,state,target_quantity,closes_on,description').order('closes_on',{ascending:true}).limit(80);
   if(error)throw error;
   const rows=((data||[]) as Campaign[]).map(x=>({...x,target_quantity:Number(x.target_quantity)}));
   setCampaigns(rows);
   const own=await supabase.from('mohalla_pledges').select('id,campaign_id,merchant_id,quantity').eq('merchant_id',merchant.id);
   if(own.error)throw own.error;setPledges(((own.data||[]) as Pledge[]).map(x=>({...x,quantity:Number(x.quantity)})));
   const counts:Record<string,Stat>={};
   for(const c of rows){
    const stats=await supabase.rpc('get_mohalla_progress',{p_campaign_id:c.id});
    const first=(stats.data as Stat[]|null)?.[0];
    counts[c.id]=stats.error?{participants:null,pledged_total:null,target_quantity:c.target_quantity}:first?{participants:first.participants?Number(first.participants):null,pledged_total:first.pledged_total?Number(first.pledged_total):null,target_quantity:c.target_quantity}:{participants:null,pledged_total:null,target_quantity:c.target_quantity};
   }setStats(counts);
  }catch{setError('Could not load local group requests.')}finally{setLoading(false)}
 },[shop.demo,merchant?.id,city,state]);
 useEffect(()=>{void load()},[load]);
 const add=async(e:React.FormEvent)=>{e.preventDefault();if(!item.trim()||!target||Number(target)<=0)return;setBusy(true);setError('');
  try{
   if(!city||!state)throw Error('Add city and state in Shop Settings first.');
   const row={merchant_id:myId,item_name:item.trim(),unit,target_quantity:Number(target),closes_on:closes,description:description.trim(),city,state};
   if(shop.demo){const id='new-'+Date.now();setCampaigns(old=>[{...row,id},...old]);setStats(old=>({...old,[id]:{participants:null,pledged_total:null,target_quantity:Number(target)}}))}
   else {const x=await supabase.from('mohalla_campaigns').insert(row).select('id').single();if(x.error)throw x.error;await load()}
   setItem('');setTarget('');setDescription('');setMessage('Group request created. Other shops can opt in.');
  }catch(e){setError(e instanceof Error?e.message:'Could not create group request')}finally{setBusy(false)}
 };
 const join=async(c:Campaign)=>{const value=Number(qty[c.id]||'0');if(!Number.isFinite(value)||value<=0||value>100000)return;setBusy(true);setError('');try{
  if(shop.demo){setPledges(old=>{const previous=old.find(p=>p.campaign_id===c.id);return previous?old.map(p=>p.campaign_id===c.id?{...p,quantity:value}:p):[...old,{id:'mine-'+c.id,campaign_id:c.id,merchant_id:-1,quantity:value}]});setMessage('Your sample quantity is recorded.')}
  else{const x=await supabase.from('mohalla_pledges').upsert({merchant_id:merchant?.id,campaign_id:c.id,quantity:value},{onConflict:'campaign_id,merchant_id'});if(x.error)throw x.error;await load();setMessage('Your voluntary quantity was saved.')}
  setQty(old=>({...old,[c.id]:''}));
 }catch(e){setError(e instanceof Error?e.message:'Could not join request')}finally{setBusy(false)}};
 const leave=async(c:Campaign)=>{const own=pledges.find(p=>p.campaign_id===c.id&&p.merchant_id===myId);if(!own)return;setBusy(true);setError('');try{
  if(shop.demo){
   setPledges(old=>old.filter(p=>p.id!==own.id));
   setStats(old=>{const current=old[c.id];return !current||current.participants===null?old:{...old,[c.id]:{...current,participants:(current.participants-1)<5?null:current.participants-1,pledged_total:Math.max(0,(current.pledged_total||0)-own.quantity)}}});
  }else{
   const x=await supabase.from('mohalla_pledges').delete().eq('merchant_id',myId).eq('campaign_id',c.id);if(x.error)throw x.error;await load();
  }setMessage('You left this group request.');
 }catch(e){setError(e instanceof Error?e.message:'Could not leave request')}finally{setBusy(false)}};
 const copy=async(c:Campaign,count:Stat)=>{if(count.participants===null||count.pledged_total===null)return;const message='Group procurement enquiry (no individual merchant information)\nItem: '+c.item_name+'\nRegion: '+c.city+', '+c.state+'\nCombined interest: '+count.pledged_total+' '+c.unit+'\nPlease quote availability and delivery terms. No sale price or order is agreed.';try{await navigator.clipboard.writeText(message);setMessage('Anonymous enquiry copied. Review before sharing with a supplier.')}catch{window.prompt('Copy supplier enquiry:',message)}};
 const active=campaigns.filter(c=>c.closes_on>=indiaDate());
 return <div className="ops-page"><div className="vc-page-head"><button className="vc-back" onClick={()=>onNavigate('overview')}>← My Dukaan</button><h2>Mohalla Power</h2><p>Ask nearby shops whether they want to order the same stock together.</p></div>
 <p className="ops-safety">✳ {shop.demo?'DEMO — fictional neighbours and quantities.':'Opt-in buying interest only. No money moves, no automatic supplier orders, and no selling-price coordination.'}</p>
 <div className="ops-region"><span className="material-symbols-outlined">location_on</span><div><strong>{city&&state?city+', '+state:'Location needed'}</strong><small>{city?'Only nearby participating shops can see these group requests.':'Add your city and state in Shop Settings.'}</small></div></div>
 {error&&<p className="vc-error" role="alert">{error}</p>}{message&&<p className="ops-success" role="status">{message}</p>}
 <div className="vc-heading"><h3>Open group requests</h3><span>{active.length} active</span></div>
 {loading?<p>Loading nearby groups…</p>:!active.length?<div className="vc-empty">No requests yet. You can create one below.</div>:<div className="ops-list">
 {active.map(c=>{const my=pledges.find(p=>p.campaign_id===c.id&&p.merchant_id===myId),st=stats[c.id];
 return <section className="ops-campaign" key={c.id}><div className="ops-campaign-head"><span className="material-symbols-outlined">groups</span><div><strong>{c.item_name}</strong><small>{c.city} · Closes {c.closes_on}</small></div><span>{c.unit}</span></div><p>{c.description||'Group buying interest only.'}</p>
 <div className="ops-progress">{st?.participants!==null&&st?.participants!==undefined&&st.pledged_total!==null?<><strong>{st.pledged_total} / {c.target_quantity} {c.unit}</strong><small>{st.participants} independent shops opted in. Quantity is aggregated.</small></>:<><strong>Group forming</strong><small>Totals are private until at least 5 distinct shops participate.</small></>}</div>
 <div className="ops-pledge"><label>Your optional quantity ({c.unit})<input inputMode="decimal" type="number" min="1" max="100000" step="0.01" value={qty[c.id]??String(my?.quantity||'')} onChange={e=>setQty(old=>({...old,[c.id]:e.target.value}))}/></label><button type="button" disabled={busy} onClick={()=>void join(c)}>{my?'Update pledge':'Join voluntarily'}</button>{my&&<button type="button" disabled={busy} onClick={()=>void leave(c)}>Leave group</button>}</div>
 {st?.participants!==null&&st?.participants!==undefined&&st.pledged_total!==null&&<button className="ops-copy" onClick={()=>void copy(c,st)}>Copy anonymous supplier enquiry <span className="material-symbols-outlined">content_copy</span></button>}
 </section>})}</div>}
 <form className="vc-form vc-panel" onSubmit={e=>void add(e)}><h3>Start a local group request</h3><div className="vc-form-grid"><label>Product<input required maxLength={80} placeholder="e.g. Wheat flour cartons" value={item} onChange={e=>setItem(e.target.value)}/></label><label>Unit<select value={unit} onChange={e=>setUnit(e.target.value as Campaign['unit'])}><option>boxes</option><option>packs</option><option>kg</option><option>litres</option><option>pcs</option></select></label></div>
 <div className="vc-form-grid"><label>Group quantity goal<input required type="number" min="1" max="1000000" step="0.01" value={target} onChange={e=>setTarget(e.target.value)}/></label><label>Close by<input required type="date" min={indiaDate()} max={daysAhead(90)} value={closes} onChange={e=>setCloses(e.target.value)}/></label></div>
 <label>Extra details (optional)<input maxLength={180} placeholder="e.g. Unopened cartons only" value={description} onChange={e=>setDescription(e.target.value)}/></label>
 <button className="vc-primary" type="submit" disabled={busy||!city||!state}>Create request <span className="material-symbols-outlined">arrow_forward</span></button></form>
 <p className="vc-foot">Joining indicates interest, not a purchase commitment. Each merchant arranges and pays their own supplier. Individual quantities, identities and customer data are not shared. Avoid coordinated retail prices or market allocation.</p></div>
}
