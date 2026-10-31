import {createClient} from 'npm:@supabase/supabase-js@2';
const cors=(origin:string)=>({
  'Access-Control-Allow-Origin':origin==='http://127.0.0.1:5173'||origin==='http://localhost:5173'?origin:(Deno.env.get('VYAPARTRUST_PUBLIC_ORIGIN')||'https://invalid.example'),
  'Access-Control-Allow-Headers':'authorization, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Vary':'Origin',
});
Deno.serve(async(req:Request)=>{
 const h=cors(req.headers.get('origin')||'');
 if(req.method==='OPTIONS')return new Response(null,{headers:h,status:204});
 if(req.method!=='POST')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{...h,'content-type':'application/json'}});
 const bearer=req.headers.get('authorization')||'';
 if(!bearer.startsWith('Bearer '))return new Response(JSON.stringify({error:'Authentication required'}),{status:401,headers:{...h,'content-type':'application/json'}});
 try{
  const data=await req.json();
  if(data?.confirmation!=='DELETE MY ACCOUNT')return new Response(JSON.stringify({error:'Confirmation did not match'}),{status:400,headers:{...h,'content-type':'application/json'}});
  const supabaseUrl=Deno.env.get('SUPABASE_URL');
  const keyMap=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}') as Record<string,string>;
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||keyMap.default||Deno.env.get('SUPABASE_SECRET_KEY');
  if(!supabaseUrl||!serviceKey)throw Error('Server configuration missing');
  const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:session,error:authError}=await admin.auth.getUser(bearer.slice(7));
  if(authError||!session?.user)return new Response(JSON.stringify({error:'Session invalid. Sign in again.'}),{status:401,headers:{...h,'content-type':'application/json'}});
  // Require a fresh Google sign-in, not a background-refreshed access token.
  const signin=session.user.last_sign_in_at?Date.parse(session.user.last_sign_in_at):0;
  if(!signin||Date.now()-signin>15*60*1000)return new Response(JSON.stringify({error:'Please sign out and sign back in, then retry within 15 minutes.'}),{status:403,headers:{...h,'content-type':'application/json'}});
  // The FK from merchants.user_id to auth.users(id) ON DELETE CASCADE
  // removes all merchant-owned records in the SAME DATABASE TRANSACTION.
  const {error:deleteError}=await admin.auth.admin.deleteUser(session.user.id,false);
  if(deleteError)return new Response(JSON.stringify({error:'Could not delete account. Contact the service administrator.'}),{status:409,headers:{...h,'content-type':'application/json'}});
  return new Response(JSON.stringify({deleted:true}),{status:200,headers:{...h,'content-type':'application/json'}});
 }catch{
  return new Response(JSON.stringify({error:'Unable to process account deletion.'}),{status:500,headers:{...h,'content-type':'application/json'}});
 }
});