import {supabase} from './supabase.ts';
export async function apiFetch(input:string, init:RequestInit={}):Promise<Response>{
 const {data:{session}}=await supabase.auth.getSession();
 if(!session)throw new Error('Please sign in first');
 const headers=new Headers(init.headers);
 headers.set('Authorization',`Bearer ${session.access_token}`);
 return fetch(input,{...init,headers});
}
