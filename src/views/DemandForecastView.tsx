import React,{useCallback,useEffect,useMemo,useState} from 'react';
import type {NavPath} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useShop,formatRupees} from '../context/ShopContext.tsx';
import {supabase} from '../lib/supabase.ts';
import {forecastSevenDays} from '../lib/operations.ts';
import type {StockSale} from '../lib/operations.ts';
import {indiaDate} from '../lib/shopLogic.ts';
function makeDemoHistory(ids:string[]):StockSale[]{
 const rows:StockSale[]=[];const now=Date.parse(indiaDate()+'T00:00:00Z');
 ids.slice(0,3).forEach((id,j)=>{for(let i=0;i<27;i++){const d=new Date(now-i*86400000).toISOString().slice(0,10);rows.push({stock_id:id,moved_on:d,movement_kind:'sold',quantity:1+((i*3+j)%5)})}});
 return rows;
}
export function DemandForecastView({onNavigate}:{onNavigate:(p:NavPath)=>void}){
 const shop=useShop(),{merchant}=useAuth();
 const [sales,setSales]=useState<StockSale[]>([]),[selected,setSelected]=useState(''),[kind,setKind]=useState<'sold'|'restocked'>('sold'),[qty,setQty]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const load=useCallback(async()=>{
  if(shop.demo){setSales(makeDemoHistory(shop.stock.map(x=>x.id)));return}
  if(!merchant?.id){setSales([]);return}
  const since=new Date(Date.now()-90*86400000).toISOString().slice(0,10);
  const {data,error}=await supabase.from('shop_stock_movements').select('stock_id,moved_on,movement_kind,quantity').eq('merchant_id',merchant.id).gte('moved_on',since).limit(5000);
  if(error)setError('Could not read item sale history.');else setSales(((data||[]) as StockSale[]).map(x=>({...x,quantity:Number(x.quantity)})));
 },[shop.demo,merchant?.id,shop.stock.map(x=>x.id).join('|')]);
 useEffect(()=>{void load()},[load]);
 const item=shop.stock.find(x=>x.id===selected)||shop.stock[0];
 const history=useMemo(()=>sales.filter(x=>x.stock_id===item?.id),[sales,item?.id]);
 const forecast=useMemo(()=>forecastSevenDays(history,indiaDate()),[history]);
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();if(!item)return;const amount=Number(qty);if(!Number.isFinite(amount)||amount<=0||amount>100000)return;
  setBusy(true);setError('');setMessage('');
  try{
   if(shop.demo){
    if(kind==='sold'&&item.quantity<amount)throw Error('Not enough recorded stock.');
    const updated=await shop.patch('stock',item.id,{quantity:item.quantity+(kind==='sold'?-amount:amount)});
    if(!updated)throw Error('Could not update demo stock');
    setSales(old=>[...old,{stock_id:item.id,moved_on:indiaDate(),movement_kind:kind,quantity:amount}]);
   }else{
    const {error}=await supabase.rpc('record_stock_activity',{p_stock_id:item.id,p_kind:kind,p_quantity:amount});
    if(error)throw error;await shop.refresh();await load();
   }
   setQty('');setMessage('Stock and history updated.');
  }catch(e){setError(e instanceof Error?e.message:'Could not save stock movement')}finally{setBusy(false)}
 };
 const available=forecast.confidence==='observational';
 const suggested=available?Math.max(0,Math.ceil(forecast.projectedSeven+item.reorder_at-item.quantity)):0;
 return <div className="ops-page">
 <div className="vc-page-head"><button className="vc-back" onClick={()=>onNavigate('overview')}>← My Dukaan</button><h2>Kal Ka Samaan</h2><p>Use actual recorded item sales to estimate next week's stock needs.</p></div>
 {shop.demo&&<p className="ops-safety">✳ DEMO — movement history is fictional and does not touch real data.</p>}
 <section className="vc-panel vc-form"><h3>Record an item sale or restock</h3>
 <p className="vc-foot">Forecasting needs quantity sold for each item. Total rupee sales alone cannot tell us which items to reorder.</p>
 <form onSubmit={e=>void submit(e)} className="vc-form">
 <div className="vc-form-grid"><label>Item<select value={item?.id||''} onChange={e=>setSelected(e.target.value)}><option value="">Choose item</option>{shop.stock.map(x=><option key={x.id} value={x.id}>{x.item_name} · {x.quantity} {x.unit}</option>)}</select></label>
 <label>Change<select value={kind} onChange={e=>setKind(e.target.value as 'sold'|'restocked')}><option value="sold">Sold to customers</option><option value="restocked">Received from supplier</option></select></label></div>
 <label>Quantity<input type="number" min="0.01" max="100000" step="0.01" value={qty} onChange={e=>setQty(e.target.value)} placeholder="e.g. 3" required/></label>
 <button className="vc-primary" type="submit" disabled={!item||busy}>{busy?'Recording…':'Record movement'} <span className="material-symbols-outlined">check</span></button>
 </form></section>
 {error&&<p role="alert" className="vc-error">{error}</p>}{message&&<p role="status" className="ops-success">{message}</p>}
 {item?<><section className="vc-totals"><div><span>Current recorded stock</span><strong>{item.quantity} {item.unit}</strong></div><div><span>Sales days with data · last 28</span><strong>{forecast.daysCovered}/28</strong></div></section>
 <section className="vc-panel ops-forecast"><div className="ops-heading"><h3>Next 7 days · {item.item_name}</h3><span className="ops-label">{available?'Observed trend':'More history needed'}</span></div>
 {available?<><div className="ops-forecast-number"><strong>{forecast.projectedSeven}</strong><span>{item.unit} estimated sales</span></div>
 <p>Historical weekly range: <strong>{forecast.bandLow}–{forecast.bandHigh} {item.unit}</strong>. This is a range of the last four weeks, not a statistical guarantee.</p>
 <p className="ops-advice">{suggested>0?'Consider ordering about '+suggested+' '+item.unit+' for the coming week.':'Recorded stock appears sufficient for the next week at the observed rate.'}</p></>:
 <p>Record item sales on at least <strong>14 different days</strong> within 28 days, with at least 10 units sold. Until then, we won't invent a forecast.</p>}
 </section></>:<div className="vc-empty">Add an item in My Stock first.</div>}
 <p className="vc-foot">The forecast is a transparent 28-day moving average, not an AI guarantee. Missing sales entries, holidays, weather, promotions and local events can change actual demand. Verify quantities before ordering.</p>
 <button className="easy-back" onClick={()=>onNavigate('stock')}>← My Stock</button>
 </div>;
}
