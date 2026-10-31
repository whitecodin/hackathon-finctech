import React, {createContext,useContext,useEffect,useState} from 'react';
import {supabase,isSupabaseConfigured} from '../lib/supabase.ts';
import type {User,Merchant} from '../types.ts';
type AuthContextType={user:User|null;merchant:Merchant|null;token:string|null;isLoading:boolean;isDemoUser:boolean;loginWithEmailOrPin:(a:string,b:string)=>Promise<boolean>;loginWithGoogle:()=>Promise<boolean>;registerWithEmail:(a:{email:string;name:string;storeName:string})=>Promise<boolean>;updateProfilePhoto:(url:string)=>Promise<void>;updateLocation:(a:{location:string;city?:string;state?:string;pinCode:string})=>Promise<void>;toggleDemoMode:()=>void;logout:()=>void;updateMerchantLocally:(m:Partial<Merchant>)=>void;authError:string|null};
const Context=createContext<AuthContextType|null>(null);
export const AuthProvider=({children}:{children:React.ReactNode})=>{
 const [user,setUser]=useState<User|null>(null),[merchant,setMerchant]=useState<Merchant|null>(null),[token,setToken]=useState<string|null>(null),[isLoading,setLoading]=useState(true),[authError,setAuthError]=useState<string|null>(null);
 useEffect(()=>{
 let mounted=true;
 const setSession=(session:import('@supabase/supabase-js').Session|null)=>{
  if(!mounted)return;
  setToken(session?.access_token||null);
  const u=session?.user;
  setUser(u?{id:0,uid:u.id,email:u.email||'',displayName:u.user_metadata?.full_name||u.email?.split('@')[0]||'Merchant',photoURL:u.user_metadata?.avatar_url,role:'merchant'}:null);
  if(!u)setMerchant(null);
  setLoading(false);
 };
 supabase.auth.getSession().then(({data,error})=>{if(error)setAuthError(error.message);setSession(data.session)}).catch(()=>setLoading(false));
 const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setSession(session)});
 return ()=>{mounted=false;subscription.unsubscribe()};
 },[]);
 useEffect(()=>{
 if(!user)return;
 let active=true;
 (async()=>{const {data,error}=await supabase.from('merchants').select('*').eq('user_id',user.uid).maybeSingle();if(!active)return;if(error){setAuthError('Signed in, but business data could not load. '+error.message);return}if(!data){const created=await supabase.rpc('create_my_shop');if(created.data&&active){setMerchant({id:Number(created.data.id),userId:0,storeName:created.data.store_name,ownerName:created.data.owner_name,category:created.data.category,location:created.data.location,city:created.data.city||'',district:created.data.district||'',state:created.data.state||'',pinCode:created.data.pin_code,gstin:'NOT_VERIFIED',udyamId:'NOT_VERIFIED',bankAccount:'NOT_CONNECTED',healthScore:0,riskGrade:'Unassessed',creditBandMin:0,creditBandMax:0,safeEmiMin:0,safeEmiMax:0,resilienceDays:0,monthlyInflow:0,dailyBurn:0,passportUid:''} as Merchant);}return;}if(data)setMerchant({...data,id:Number(data.id),userId:0,storeName:data.store_name,ownerName:data.owner_name,category:data.category,location:data.location,city:data.city||'',district:data.district||'',state:data.state||'',pinCode:data.pin_code,gstin:'NOT_VERIFIED',udyamId:'NOT_VERIFIED',bankAccount:'NOT_CONNECTED',healthScore:0,riskGrade:'Unassessed',creditBandMin:0,creditBandMax:0,safeEmiMin:0,safeEmiMax:0,resilienceDays:0,monthlyInflow:0,dailyBurn:0,passportUid:''} as Merchant);})().catch(()=>{});
 return()=>{active=false};
 },[user?.uid]);
 const loginWithGoogle=async()=>{
  setAuthError(null);
  if(!isSupabaseConfigured){setAuthError('Supabase is not configured yet. Add project URL and publishable key.');return false}
  const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
  if(error){setAuthError(error.message);return false}
  return true;
 };
 const updateMerchantLocally=(m:Partial<Merchant>)=>setMerchant(old=>old?{...old,...m}:null);
 const updateLocation=async(m:{location:string;city?:string;state?:string;pinCode:string})=>{
 if(!user)throw new Error('Sign in first');
 const {error}=await supabase.from('merchants').update({location:m.location,pin_code:m.pinCode}).eq('user_id',user.uid);
 if(error)throw error;updateMerchantLocally(m);
 };
 const updateProfilePhoto=async(photoURL:string)=>{const {error}=await supabase.auth.updateUser({data:{avatar_url:photoURL}});if(error)throw error;setUser(u=>u?{...u,photoURL}:null)};
 const logout=()=>{void supabase.auth.signOut();setUser(null);setMerchant(null);setToken(null)};
 return <Context.Provider value={{user,merchant,token,isLoading,isDemoUser:false,loginWithEmailOrPin:async()=>false,loginWithGoogle,registerWithEmail:async()=>false,updateProfilePhoto,updateLocation,toggleDemoMode:()=>{},logout,updateMerchantLocally,authError}}>{children}</Context.Provider>
};
export const useAuth=()=>{const v=useContext(Context);if(!v)throw new Error('Missing AuthProvider');return v};
