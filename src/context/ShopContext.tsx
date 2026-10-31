import React,{createContext,useCallback,useContext,useEffect,useState,useRef} from 'react';
import {useAuth} from '../context/AuthContext.tsx';
import {useDemo} from '../demo/DemoContext.tsx';
import {supabase} from '../lib/supabase.ts';
import {indiaDate} from '../lib/shopLogic.ts';
export {dailyTasks} from '../lib/shopLogic.ts';

export type ShopContact={id:string;merchant_id:number;kind:'customer'|'supplier';name:string;phone:string|null;repeat_items:string;repeat_consent:boolean};
export type ShopDue={id:string;merchant_id:number;contact_id:string;direction:'receive'|'pay';amount:number;settled:number;due_date:string|null;note:string};
export type ShopStock={id:string;merchant_id:number;item_name:string;unit:'pcs'|'kg'|'litres'|'packs'|'boxes';quantity:number;reorder_at:number;last_cost:number|null};
export type ShopEntry={id:string;merchant_id:number;entry_date:string;kind:'sale'|'expense';payment_method:'Cash'|'UPI'|'Bank'|'Other';amount:number;note:string;source?:'manual'|'provider';provider?:string|null;provider_reference?:string|null;payment_verified_at?:string|null;matched_provider_entry_id?:string|null};
type Group='contacts'|'dues'|'stock'|'entries';
type RecordOf<G extends Group>=G extends 'contacts'?ShopContact:G extends 'dues'?ShopDue:G extends 'stock'?ShopStock:ShopEntry;
type Store={contacts:ShopContact[];dues:ShopDue[];stock:ShopStock[];entries:ShopEntry[]};
type ContextValue=Store&{loading:boolean;error:string;demo:boolean;refresh:()=>Promise<void>;add:<G extends Group>(group:G,value:Omit<RecordOf<G>,'id'|'merchant_id'>)=>Promise<boolean>;patch:<G extends Group>(group:G,id:string,value:Partial<Omit<RecordOf<G>,'id'|'merchant_id'>>)=>Promise<boolean>;remove:<G extends Group>(group:G,id:string)=>Promise<boolean>};
const empty=():Store=>({contacts:[],dues:[],stock:[],entries:[]});
const today=()=>indiaDate();
const dateOffset=(n:number)=>{const x=new Date();x.setDate(x.getDate()+n);return indiaDate(x)};
export const formatRupees=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
function sample():Store{
 const mid=-1;
 const contacts:ShopContact[]=[
 {id:'d-c1',merchant_id:mid,kind:'customer',name:'Ramesh Ji',phone:null,repeat_items:'Atta 5kg, rice 2kg, oil 1L',repeat_consent:true},
 {id:'d-c2',merchant_id:mid,kind:'customer',name:'Seema Ji',phone:null,repeat_items:'Milk, sugar, tea',repeat_consent:true},
 {id:'d-c3',merchant_id:mid,kind:'customer',name:'Mohan Ji',phone:null,repeat_items:'',repeat_consent:false},
 {id:'d-s1',merchant_id:mid,kind:'supplier',name:'Shakti Wholesale',phone:null,repeat_items:'',repeat_consent:false},
 {id:'d-s2',merchant_id:mid,kind:'supplier',name:'Jaipur Dairy Supplier',phone:null,repeat_items:'',repeat_consent:false}
 ];
 const dues:ShopDue[]=[
 {id:'d-u1',merchant_id:mid,contact_id:'d-c1',direction:'receive',amount:1800,settled:600,due_date:dateOffset(-2),note:'Groceries'},
 {id:'d-u2',merchant_id:mid,contact_id:'d-c2',direction:'receive',amount:750,settled:0,due_date:dateOffset(2),note:'Monthly khata'},
 {id:'d-u3',merchant_id:mid,contact_id:'d-s1',direction:'pay',amount:4800,settled:1800,due_date:dateOffset(1),note:'Atta and rice cartons'},
 {id:'d-u4',merchant_id:mid,contact_id:'d-s2',direction:'pay',amount:2200,settled:0,due_date:dateOffset(4),note:'Milk supply'}
 ];
 const stock:ShopStock[]=[
 {id:'d-k1',merchant_id:mid,item_name:'Atta',unit:'packs',quantity:3,reorder_at:6,last_cost:225},
 {id:'d-k2',merchant_id:mid,item_name:'Cooking oil',unit:'litres',quantity:4,reorder_at:8,last_cost:142},
 {id:'d-k3',merchant_id:mid,item_name:'Rice',unit:'kg',quantity:18,reorder_at:10,last_cost:52},
 {id:'d-k4',merchant_id:mid,item_name:'Sugar',unit:'kg',quantity:6,reorder_at:7,last_cost:46},
 {id:'d-k5',merchant_id:mid,item_name:'Tea',unit:'packs',quantity:13,reorder_at:5,last_cost:125},
 {id:'d-k6',merchant_id:mid,item_name:'Biscuits',unit:'packs',quantity:27,reorder_at:12,last_cost:15}
 ];
 const entries:ShopEntry[]=[
 {id:'d-e1',merchant_id:mid,entry_date:today(),kind:'sale',payment_method:'Cash',amount:1950,note:'Morning counter'},
 {id:'d-e2',merchant_id:mid,entry_date:today(),kind:'sale',payment_method:'UPI',amount:2480,note:'Daily sales (demo)',source:'manual',matched_provider_entry_id:'d-provider1'},
 {id:'d-provider1',merchant_id:mid,entry_date:today(),kind:'sale',payment_method:'UPI',amount:2480,note:'Sample UPI provider receipt',source:'provider',provider:'razorpay',provider_reference:'payment:demo-1',payment_verified_at:new Date().toISOString()},
 {id:'d-provider2',merchant_id:mid,entry_date:today(),kind:'expense',payment_method:'Bank',amount:1000,note:'Sample supplier payout',source:'provider',provider:'razorpay',provider_reference:'payout:demo-2',payment_verified_at:new Date().toISOString()},
 {id:'d-e3',merchant_id:mid,entry_date:today(),kind:'expense',payment_method:'Cash',amount:750,note:'Local delivery and supplies'},
 {id:'d-e4',merchant_id:mid,entry_date:dateOffset(-1),kind:'sale',payment_method:'Cash',amount:3400,note:'Yesterday sales'}
 ];
 return {contacts,dues,stock,entries};
}
const Context=createContext<ContextValue|null>(null);
const tables:Record<Group,string>={contacts:'shop_contacts',dues:'shop_dues',stock:'shop_stock',entries:'shop_entries'};
const numeric=(data:Store):Store=>({
 contacts:data.contacts,dues:data.dues.map(x=>({...x,amount:Number(x.amount),settled:Number(x.settled)})),
 stock:data.stock.map(x=>({...x,quantity:Number(x.quantity),reorder_at:Number(x.reorder_at),last_cost:x.last_cost===null?null:Number(x.last_cost)})),
 entries:data.entries.map(x=>({...x,amount:Number(x.amount)}))
});
export function ShopProvider({children}:{children:React.ReactNode}){
 const {merchant}=useAuth();const {demoEnabled}=useDemo();const [store,setStore]=useState<Store>(demoEnabled?sample():empty());
 const [loading,setLoading]=useState(!demoEnabled),[error,setError]=useState('');
 const requestVersion=useRef(0);
 const refresh=useCallback(async()=>{
  const version=++requestVersion.current;
  if(demoEnabled){setStore(sample());setError('');setLoading(false);return}
  if(!merchant?.id){setStore(empty());setError('');setLoading(false);return}
  setLoading(true);setError('');
  try{
   const all=await Promise.all((Object.keys(tables) as Group[]).map(async k=>{
    const rows:unknown[]=[];
    for(let offset=0;offset<5000;offset+=500){
     const result=await supabase.from(tables[k]).select('*').eq('merchant_id',merchant.id).order('id').range(offset,offset+499);
     if(result.error)throw result.error;
     const page=result.data||[];rows.push(...page);
     if(page.length<500)return rows;
    }
    // Never show misleading incomplete dues or financial totals.
    throw new Error('Shop has more than 5,000 records in one section; server pagination required');
   }));
   if(version!==requestVersion.current)return;
   setStore(numeric({contacts:all[0] as ShopContact[],dues:all[1] as ShopDue[],stock:all[2] as ShopStock[],entries:all[3] as ShopEntry[]}));
  }catch(e){
   if(version!==requestVersion.current)return;
   setStore(empty());
   setError(e instanceof Error && e.message.includes('5,000')?'Too many shop records to show safely. Contact the administrator.':'Could not load your shop records. Please try again.');
  }finally{if(version===requestVersion.current)setLoading(false)}
 },[merchant?.id,demoEnabled]);
 useEffect(()=>{void refresh()},[refresh]);
 useEffect(()=>{
  if(demoEnabled||!merchant?.id)return;
  const onActive=()=>{if(document.visibilityState==='visible')void refresh()};
  const poll=window.setInterval(onActive,60000);
  window.addEventListener('focus',onActive);
  document.addEventListener('visibilitychange',onActive);
  return ()=>{window.clearInterval(poll);window.removeEventListener('focus',onActive);document.removeEventListener('visibilitychange',onActive)};
 },[demoEnabled,merchant?.id,refresh]);
 const add=async<G extends Group>(group:G,value:Omit<RecordOf<G>,'id'|'merchant_id'>):Promise<boolean>=>{
  setError('');const row={...value,merchant_id:demoEnabled?-1:merchant?.id};
  if(demoEnabled){setStore(old=>({...old,[group]:[{...row,id:'d-'+Date.now()+'-'+Math.random().toString(36).slice(2)},...old[group]]}));return true}
  if(!merchant?.id){setError('Please sign in and set up your shop.');return false}
  const result=await supabase.from(tables[group]).insert(row).select('*').single();
  if(result.error){setError('Could not save this entry. Check the details and try again.');return false}
  await refresh();return true
 };
 const patch=async<G extends Group>(group:G,id:string,value:Partial<Omit<RecordOf<G>,'id'|'merchant_id'>>):Promise<boolean>=>{
  setError('');
  if(demoEnabled){setStore(old=>({...old,[group]:old[group].map(x=>x.id===id?{...x,...value}:x)}));return true}
  if(!merchant?.id)return false;
  const result=await supabase.from(tables[group]).update(value as never).eq('merchant_id',merchant.id).eq('id',id).select('id').maybeSingle();
  if(result.error||!result.data){setError('Could not update this record.');return false}
  await refresh();return true
 };
 const remove=async<G extends Group>(group:G,id:string):Promise<boolean>=>{
  setError('');
  if(demoEnabled){setStore(old=>({...old,[group]:old[group].filter(x=>x.id!==id)}));return true}
  if(!merchant?.id)return false;
  const result=await supabase.from(tables[group]).delete().eq('merchant_id',merchant.id).eq('id',id).select('id').maybeSingle();
  if(result.error||!result.data){setError('Could not remove this record.');return false}
  await refresh();return true
 };
 return <Context.Provider value={{...store,loading,error,demo:demoEnabled,refresh,add,patch,remove}}>{children}</Context.Provider>
}
export function useShop(){const ctx=useContext(Context);if(!ctx)throw Error('Missing ShopProvider');return ctx}
