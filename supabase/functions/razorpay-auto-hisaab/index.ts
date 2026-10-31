import {createClient} from 'npm:@supabase/supabase-js@2';
// Razorpay sends raw JSON and an HMAC-SHA256 signature in X-Razorpay-Signature.
// This route is public to the provider; NOTHING is recorded unless the HMAC and
// separately administrator-approved merchant account linkage both check out.
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const fromHex=(s:string)=>new Uint8Array((s.match(/../g)||[]).map(x=>parseInt(x,16)));
const supported=new Set(['payment.captured','qr_code.credited','payout.processed','payout.reversed','refund.processed']);
const secretFor=()=>Deno.env.get('RAZORPAY_WEBHOOK_SECRET')||'';
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 const secret=secretFor();
 // Hard fail if webhook is not yet configured by the platform operator.
 if(!secret||secret.length<24)return reply(503,{error:'Webhook not configured'});
 if(Number(req.headers.get('content-length')||'0')>64000)return reply(413,{error:'Payload too large'});
 const signature=req.headers.get('x-razorpay-signature')||'';
 const eventId=req.headers.get('x-razorpay-event-id')||'';
 if(!/^[a-f0-9]{64}$/i.test(signature)||!/^[-_a-zA-Z0-9]{8,120}$/.test(eventId))return reply(401,{error:'Signature or event ID missing'});
 let raw:Uint8Array;
 try{raw=new Uint8Array(await req.arrayBuffer());if(raw.byteLength>64000)return reply(413,{error:'Payload too large'})}
 catch{return reply(400,{error:'Invalid payload'})}
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('HMAC',key,fromHex(signature),raw))return reply(401,{error:'Invalid signature'});
 let data:Record<string,any>;
 try{data=JSON.parse(new TextDecoder().decode(raw))}catch{return reply(400,{error:'Invalid JSON'})}
 const event=typeof data.event==='string'?data.event:'';
 if(!supported.has(event))return reply(200,{ok:true,status:'ignored'});
 const account=typeof data.account_id==='string'?data.account_id:'';
 const entity=event.startsWith('payout.')?data.payload?.payout?.entity:
 event==='refund.processed'?data.payload?.refund?.entity:
 data.payload?.payment?.entity;
 if(!account||!/^acc_[a-zA-Z0-9]{6,96}$/.test(account)||!entity||typeof entity.id!=='string')return reply(400,{error:'Invalid event entity'});
 const txid=entity.id;
 const value=entity.amount;
 if(!Number.isSafeInteger(value)||value<=0||value>10000000000)return reply(400,{error:'Invalid paise amount'});
 if(entity.currency!=='INR')return reply(200,{ok:true,status:'non_inr_ignored'});
 if((event==='payment.captured'||event==='qr_code.credited') && entity.status!=='captured')return reply(200,{ok:true,status:'ignored'});
 if(event==='payout.processed' && entity.status!=='processed')return reply(200,{ok:true,status:'ignored'});
 if(event==='payout.reversed' && entity.status!=='reversed')return reply(200,{ok:true,status:'ignored'});
 if(event==='refund.processed' && entity.status!=='processed')return reply(200,{ok:true,status:'ignored'});
 const eventUnix=event==='payout.processed'?entity.processed_at||data.created_at:
 event==='payout.reversed'?entity.updated_at||data.created_at:
 data.created_at;
 const when=typeof eventUnix==='number'&&Number.isFinite(eventUnix)?new Date(eventUnix*1000):null;
 if(!when||!Number.isFinite(when.getTime()))return reply(400,{error:'Invalid time'});
 const url=Deno.env.get('SUPABASE_URL');
 const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}') as Record<string,string>;
 const adminKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||keys.default||Deno.env.get('SUPABASE_SECRET_KEY');
 if(!url||!adminKey)return reply(503,{error:'Backend not configured'});
 const admin=createClient(url,adminKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:result,error}=await admin.rpc('ingest_verified_razorpay_event',{
  p_account_id:account,p_event_id:eventId,p_event_type:event,p_transaction_id:txid,
  p_amount_paise:value,p_timestamp:when.toISOString(),p_method:typeof entity.method==='string'?entity.method:(typeof entity.mode==='string'?entity.mode.toLowerCase():'bank')
 });
 if(error){console.error('Provider ingestion failed',error.code);return reply(500,{error:'Temporary processing failure'})}
 return reply(200,{ok:true,status:result});
});
