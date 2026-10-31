import express from 'express';
import dotenv from 'dotenv';
import {createClient} from '@supabase/supabase-js';
dotenv.config({path:'.env.local'});
dotenv.config();
const app=express();
app.use(express.json({limit:'100kb'}));
const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
const key=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY;
if(!url||!key)console.warn('Supabase API not configured: set SUPABASE_URL and SUPABASE_ANON_KEY.');
type Request=import('express').Request & {authUserId?:string;client?:any};
const secure=async(req:Request,res:import('express').Response,next:import('express').NextFunction)=>{
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 if(!token||!url||!key)return res.status(401).json({error:'Sign in required'});
 const client=createClient(url,key,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(token);
 if(error||!data.user)return res.status(401).json({error:'Session expired. Please sign in again'});
 req.authUserId=data.user.id;req.client=client;next();
};
const merchant=async(req:Request)=>{
 const {data,error}=await req.client!.from('merchants').select('*').eq('user_id',req.authUserId!).maybeSingle();
 if(error)throw error;return data;
};
app.get('/api/health',(_req,res)=>res.json({status:'online',backend:'supabase',database:'not_checked'}));
app.get('/api/merchant/profile',secure,async(req:Request,res)=>{
 try{const m=await merchant(req);if(!m)return res.status(404).json({error:'Create your shop profile first'});
 res.json({merchant:{id:m.id,storeName:m.store_name,ownerName:m.owner_name,category:m.category,location:m.location,pinCode:m.pin_code,healthScore:0,monthlyInflow:0,resilienceDays:0,creditBandMin:0,creditBandMax:0}});}
 catch{res.status(503).json({error:'Database unavailable'})}
});
app.get('/api/transactions',secure,async(req:Request,res)=>{
 try{const m=await merchant(req);if(!m)return res.status(404).json({error:'No shop profile'});
 const {data,error}=await req.client!.from('transactions').select('*').eq('merchant_id',m.id).order('date',{ascending:false}).limit(500);
 if(error)throw error;res.json({transactions:data||[],totalCount:data?.length||0,verifiedVolume:0});}
 catch{res.status(503).json({error:'Unable to retrieve transactions'})}
});
app.post('/api/transactions/:id/resolve',secure,async(req:Request,res)=>{
 try{const m=await merchant(req);if(!m)return res.status(404).json({error:'Shop not found'});
 const {status,note}=req.body||{};
 if(!['verified_by_merchant','reported_bank'].includes(status)||typeof note!=='string'||note.length>500)return res.status(400).json({error:'Invalid update'});
 const {data,error}=await req.client!.from('transactions').update({status,merchant_note:note}).eq('id',req.params.id).eq('merchant_id',m.id).select().maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Transaction not found'});res.json({success:true,transaction:data});}
 catch{res.status(503).json({error:'Transaction update failed'})}
});
app.post('/api/merchant/update-location',secure,async(req:Request,res)=>{
 const {location,pinCode}=req.body||{};
 if(typeof location!=='string'||location.length>160||!/^\d{6}$/.test(pinCode||''))return res.status(400).json({error:'Invalid location or PIN'});
 const {data,error}=await req.client!.from('merchants').update({location,pin_code:pinCode}).eq('user_id',req.authUserId!).select().maybeSingle();
 if(error)return res.status(503).json({error:'Failed to update shop'});res.json({merchant:data});
});
app.post('/api/merchant/update-profile',secure,async(req:Request,res)=>{
 const allowed=['storeName','ownerName','category','location','pinCode'] as const;
 const map={storeName:'store_name',ownerName:'owner_name',category:'category',location:'location',pinCode:'pin_code'} as const;
 const changes:Record<string,string>={};
 for(const key of allowed){if(req.body?.[key]!==undefined){const value=req.body[key];if(typeof value!=='string'||value.length>160)return res.status(400).json({error:'Invalid field'});changes[map[key]]=value}}
 const {data,error}=await req.client!.from('merchants').update(changes).eq('user_id',req.authUserId!).select().maybeSingle();
 if(error)return res.status(503).json({error:'Update failed'});res.json({merchant:data});
});
app.get('/api/league',secure,async(req:Request,res)=>{
 const scope=typeof req.query.scope==='string'?req.query.scope:'local';
 const mode=typeof req.query.mode==='string'?req.query.mode:'activity';
 if(!['local','city','district','state'].includes(scope)||!['activity','growth'].includes(mode))return res.status(400).json({error:'Invalid league filter'});
 try{
 const {data,error}=await req.client!.rpc('get_bazaar_league',{p_scope:scope,p_mode:mode});
 if(error)throw error;
 res.json({scope,mode,rows:data||[],sample:false,peerAmountsShared:false});
 }catch{res.status(503).json({error:'League currently unavailable'})}
});
app.post('/api/league/preferences',secure,async(req:Request,res)=>{
 try{
 const m=await merchant(req);if(!m)return res.status(404).json({error:'Add your shop details first'});
 const optedIn=req.body?.optedIn,alias=req.body?.alias;
 if(typeof optedIn!=='boolean'||(alias!==undefined && (typeof alias!=='string'||alias.length>40)))return res.status(400).json({error:'Invalid preferences'});
 if(optedIn&&(!/^[0-9]{6}$/.test(m.pin_code||'')||![m.city,m.district,m.state].every((x:string)=>Boolean(x?.trim()))))return res.status(400).json({error:'Add PIN, city, district and state in Shop Settings'});
 const safeAlias=typeof alias==='string'?alias.trim():'';
 if(optedIn&&!/^[\p{L}\p{N} ._-]{3,40}$/u.test(safeAlias))return res.status(400).json({error:'Use a 3 to 40 character shop nickname'});
 const {error}=await req.client!.from('merchant_league_preferences').upsert({merchant_id:m.id,opted_in:optedIn,display_alias:safeAlias||'Local Shop',updated_at:new Date().toISOString()},{onConflict:'merchant_id'});
 if(error)throw error;res.json({success:true,optedIn});
 }catch{res.status(503).json({error:'Unable to save league choice'})}
});
app.post('/api/coach/chat',secure,(_req,res)=>res.status(501).json({error:'AI assistant is not yet configured on Supabase'}));
app.post('/api/coach/live-talk',secure,(_req,res)=>res.status(501).json({error:'Voice assistant not configured'}));
app.post('/api/passport/generate',secure,(_req,res)=>res.status(501).json({error:'Verified passport issuance not implemented'}));
app.get('/api/passport/verify/:uid',(_req,res)=>res.status(501).json({verified:false,error:'Verification not implemented'}));
const port=Number(process.env.PORT||3001);
app.listen(port,'127.0.0.1',()=>console.log('Supabase API ready on http://127.0.0.1:'+port));
