import React,{useEffect,useState} from 'react';
import type {Merchant,NavPath} from '../types.ts';
import {supabase} from '../lib/supabase.ts';
import {useLanguage} from '../context/LanguageContext.tsx';
export function SettingsView({merchant,onNavigate,onUpdateMerchant}:{merchant:Merchant|null;onNavigate:(p:NavPath)=>void;onUpdateMerchant?:(m:Partial<Merchant>)=>void}){
 const {language}=useLanguage();const hi=language==='hi';
 const [name,setName]=useState(merchant?.storeName||''),[owner,setOwner]=useState(merchant?.ownerName||'');
 const [location,setLocation]=useState(merchant?.location||''),[pin,setPin]=useState(merchant?.pinCode||'');
 const [city,setCity]=useState(merchant?.city||''),[district,setDistrict]=useState(merchant?.district||''),[state,setState]=useState(merchant?.state||'');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{setName(merchant?.storeName||'');setOwner(merchant?.ownerName||'');setLocation(merchant?.location||'');setPin(merchant?.pinCode||'');setCity(merchant?.city||'');setDistrict(merchant?.district||'');setState(merchant?.state||'')},[merchant?.id]);
 const save=async(e:React.FormEvent)=>{
 e.preventDefault();if(!merchant?.id)return;
 if(pin.trim()&&!/^[0-9]{6}$/.test(pin.trim())){setMessage('Please enter a 6-digit PIN code.');return}
 setBusy(true);setMessage('');
 const changes={store_name:name.trim(),owner_name:owner.trim(),location:location.trim(),pin_code:pin.trim(),city:city.trim(),district:district.trim(),state:state.trim()};
 const {error}=await supabase.from('merchants').update(changes).eq('id',merchant.id).select('id').maybeSingle();
 if(error){setMessage('Could not save. Please try again.')}else{onUpdateMerchant?.({storeName:changes.store_name,ownerName:changes.owner_name,location:changes.location,pinCode:changes.pin_code,city:changes.city,district:changes.district,state:changes.state});setMessage(hi?'जानकारी सेव हो गई।':'Shop details saved.')}
 setBusy(false);
 };
 return <div className="easy-page"><div className="easy-page-title"><h2>{hi?'मेरी दुकान':'My shop details'}</h2><p>{hi?'अपनी दुकान की जानकारी यहाँ बदलें।':'Your shop, your details. Keep them up to date.'}</p></div>
 <form className="easy-form" onSubmit={e=>void save(e)}>
  <section className="easy-panel easy-form"><h3>{hi?'दुकान की जानकारी':'Shop information'}</h3>
   <label>{hi?'दुकान का नाम':'Shop name'}<input maxLength={100} required value={name} onChange={e=>setName(e.target.value)}/></label>
   <label>{hi?'मालिक का नाम':'Owner name'}<input maxLength={100} required value={owner} onChange={e=>setOwner(e.target.value)}/></label>
   <label>{hi?'गली या मोहल्ला':'Street or neighbourhood'}<input maxLength={150} value={location} placeholder="e.g. MI Road" onChange={e=>setLocation(e.target.value)}/></label>
  </section>
  <details className="easy-panel vt-region-settings" open={!merchant?.city||!merchant?.district||!merchant?.state||!merchant?.pinCode}>
   <summary><span className="material-symbols-outlined">location_on</span><strong>{hi?'बाज़ार लीग में मेरा इलाक़ा':'My Bazaar League area'}</strong><span className="material-symbols-outlined">expand_more</span></summary>
   <p>{hi?'सही इलाक़ा भरने से पास की दुकानों से तुलना होगी।':'Add your location so the league compares you with nearby shops. Details are self-reported until checked.'}</p>
   <div className="easy-form">
    <label>{hi?'6 अंकों का पिन कोड':'6-digit PIN code'}<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="e.g. 302001" value={pin} onChange={e=>setPin(e.target.value)}/></label>
    <label>{hi?'शहर':'Town or city'}<input maxLength={70} placeholder="e.g. Jaipur" value={city} onChange={e=>setCity(e.target.value)}/></label>
    <label>{hi?'ज़िला':'District'}<input maxLength={70} placeholder="e.g. Jaipur" value={district} onChange={e=>setDistrict(e.target.value)}/></label>
    <label>{hi?'राज्य':'State'}<input maxLength={70} placeholder="e.g. Rajasthan" value={state} onChange={e=>setState(e.target.value)}/></label>
   </div>
   <small>{hi?'सही पिन, ज़िला और राज्य चुनें। गलत जानकारी से गलत रैंकिंग बनेगी।':'Use your actual postal area. Region verification will be added before production launch.'}</small>
  </details>
  <button className="easy-primary" disabled={busy||!merchant}>{busy?(hi?'सेव हो रहा है…':'Saving…'):(hi?'जानकारी सेव करें':'Save my details')}<span className="material-symbols-outlined">check</span></button>
  {message&&<p role="status" className="vt-settings-status">{message}</p>}
 </form>
 <button className="easy-back" onClick={()=>onNavigate('overview')}>← {hi?'मेरी दुकान':'Back to my shop'}</button>
 </div>;
}
