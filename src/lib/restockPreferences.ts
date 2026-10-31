import {useCallback,useEffect,useState} from 'react';
import type {RestockOptions} from './restockInsights.ts';

const defaults:Required<RestockOptions>={leadDays:2,planDays:14,bufferDays:2};
const valid=(value:unknown,max:number)=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=max;
function sanitize(input:unknown):Required<RestockOptions>{
 const o=(input&&typeof input==='object'?input:{}) as RestockOptions;
 return {
  leadDays:valid(o.leadDays,60)?o.leadDays!:defaults.leadDays,
  planDays:valid(o.planDays,90)?o.planDays!:defaults.planDays,
  bufferDays:valid(o.bufferDays,30)?o.bufferDays!:defaults.bufferDays
 };
}
const key=(owner:number)=>'vyapartrust:restock-settings:v1:'+owner;
/** Per merchant on this device; no shop information sent to analytics or third parties. */
export function useRestockPreferences(owner:number|null|undefined){
 const [preferences,setPreferences]=useState<Record<string,Required<RestockOptions>>>({});
 useEffect(()=>{
  if(owner===null||owner===undefined){setPreferences({});return}
  try{
   const parsed=JSON.parse(window.localStorage.getItem(key(owner))||'{}');
   const result:Record<string,Required<RestockOptions>>={};
   if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){
    Object.entries(parsed).slice(0,500).forEach(([id,value])=>{result[id]=sanitize(value)});
   }
   setPreferences(result);
  }catch{setPreferences({})}
 },[owner]);
 const change=useCallback((itemId:string,options:RestockOptions)=>{
  if(owner===null||owner===undefined)return false;
  const next={...preferences,[itemId]:sanitize(options)};
  try{window.localStorage.setItem(key(owner),JSON.stringify(next))}
  catch{return false}
  setPreferences(next);
  return true;
 },[owner,preferences]);
 return {get:(itemId:string)=>preferences[itemId]||defaults,change};
}
