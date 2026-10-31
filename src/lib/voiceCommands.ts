import {indiaDate} from './shopLogic.ts';
export type VoiceUnit='kg'|'litres'|'pcs'|'packs'|'boxes';
export type ManualMethod='Cash'|'UPI'|'Bank'|'Other';
export type VoiceDraft={
 intent:'sale'|'expense'|'invoice';
 amount:number|null;quantity:number|null;unit:VoiceUnit|null;item:string;
 method:ManualMethod;day:string;spoken:string;
};
const numerals='०१२३४५६७८९';
const commonNumbers:Record<string,number>={
 'एक':1,'दो':2,'तीन':3,'चार':4,'पांच':5,'पाँच':5,'छह':6,'सात':7,'आठ':8,'नौ':9,'दस':10,
 'ग्यारह':11,'बारह':12,'पंद्रह':15,'पन्द्रह':15,'बीस':20,'पच्चीस':25,'तीस':30,'चालीस':40,'पचास':50,
 'साठ':60,'सत्तर':70,'अस्सी':80,'नब्बे':90,'सौ':100,
 'ek':1,'do':2,'teen':3,'char':4,'paanch':5,'panch':5,'che':6,'saat':7,'aath':8,
 'das':10,'bees':20,'tees':30,'chalis':40,'sau':100
};
const plain=(s:string)=>s.replace(/[०-९]/g,x=>String(numerals.indexOf(x))).toLowerCase().replace(/\s+/g,' ').trim();
const extractAmount=(text:string):number|null=>{
 const s=plain(text);
 const regexes=[
 /(?:₹|rs\.?|inr|रुपये?|रुपए|रुपया|रुपय|रू|टका|টাকা)\s*[:\-]?\s*(\d[\d,]*(?:\.\d{1,2})?)/iu,
 /(\d[\d,]*(?:\.\d{1,2})?)\s*(?:₹|rs\.?|rupees?|inr|रुपये?|रुपए|रुपया|टका|টাকা)/iu,
 /(?:के|का|की|में|me|mein|for)\s*(\d[\d,]*(?:\.\d{1,2})?)/iu
 ];
 for(const rx of regexes){const m=s.match(rx);if(m){const num=Number(m[1].replaceAll(',',''));if(num>0&&num<=10000000)return num}}
 const speech=s.match(/(एक|दो|तीन|चार|पांच|पाँच|पचास|do|teen|ek)\s+(?:सौ|sau)\s*(चालीस|पचास|बीस|तीस|साठ|दस|chalis|pachas|bees|tees|das)?\s*(?:रुपये|रुपए|रुपया|rupees?|rs)/iu);
 if(speech){
  const h=commonNumbers[speech[1]]||1,tail=speech[2]?commonNumbers[speech[2]]||0:0;
  return h*100+tail;
 }
 // Explicit payment phrases without currency after a recognized sale/expense verb.
 if(/(?:sold|bech|बेच|बिक|sale|कमाए|received|खर्च|kharch|paid|spend|खरीद|purchase|বিক্রি|খরচ)/iu.test(s)){
  const nums=[...s.matchAll(/(^|[^\p{L}\d])(\d[\d,]*(?:\.\d{1,2})?)(?![\p{L}\d])/giu)].map(m=>Number(m[2].replaceAll(',',''))).filter(x=>x>0&&x<=10000000);
  return nums.length?nums[nums.length-1]:null;
 }
 return null;
};
const quantity=(original:string):{quantity:number;unit:VoiceUnit;start:number;end:number}|null=>{
 let s=plain(original);
 const words=Object.entries(commonNumbers).filter(([key,val])=>val<100&&val>0).sort((a,b)=>b[0].length-a[0].length);
 for(const [key,val] of words){
  const r=new RegExp('(^|\\s)'+key+'(?=\\s+(?:kg|kilo|kilogram|किलो|किलोग्राम|लीटर|litre|liter|litter|piece|पीस|pcs|packet|पैकेट|pack|box|डब्बे))','giu');
  s=s.replace(r,(_,before)=>before+val);
 }
 const m=/(\d+(?:\.\d{1,2})?)\s*(kg|kgs?|kilo|kilogram|किलो|किलोग्राम|litres?|liters?|litter|लीटर|ltr|pieces?|pcs|पीस|नग|packets?|packs?|पैकेट|boxes?|box|डब्बे)/iu.exec(s);
 if(!m)return null;
 const n=Number(m[1]);
 if(!Number.isFinite(n)||n<=0||n>100000)return null;
 const u=m[2].toLowerCase();
 const unit:VoiceUnit=/(?:kg|kilo|किलो)/u.test(u)?'kg':/(?:lit|लीटर|ltr)/u.test(u)?'litres':/(?:packet|pack|पैकेट)/u.test(u)?'packs':/(?:box|डब्बे)/u.test(u)?'boxes':'pcs';
 return {quantity:n,unit,start:m.index,end:m.index+m[0].length};
};
const cleanupItem=(s:string)=>s.replace(/[₹\d,]/g,' ').replace(/\b(?:aaj|today|kal|ka|ke|ki|mein|me|hai|h|rs|rupees|cash|upi)\b/giu,' ').replace(/(?:आज|कल|रुपये|रुपए|रुपया|बेचा|बेचे|बेची|बिका|बिके|बिकी|खरीदा|खरीदे|है|हैं|में|को|का|की|के|নগদ|টাকা)/gu,' ').replace(/\b(?:becha|beche|bechi|bech|sold|sell|sale|bought|purchased|khareeda|khareede|kharch|expense|invoice|bill|banao|banado|banana)\b/giu,' ').replace(/^[\s.,:\-]+|[\s.,:\-]+$/g,'').replace(/\s+/g,' ').slice(0,72);
const itemAfterUnit=(s:string)=>{
 // Find unit in original script instead of relying on offsets after word normalization.
 const m=/(?:\d+(?:\.\d+)?|एक|दो|तीन|चार|पांच|पाँच|ek|do|teen)\s*(?:kg|kgs?|kilo|kilogram|किलो|किलोग्राम|litres?|liters?|लीटर|ltr|pieces?|pcs|पीस|नग|packets?|packs?|पैकेट|boxes?|box|डब्बे)\s+(.{1,90})/iu.exec(s);
 if(!m)return '';
 const part=m[1].split(/(?:(?:एक|दो|तीन|चार|पाँच|पांच|do|ek|teen)\s+(?:सौ|sau)|\d+\s*(?:₹|rs|rupees|रुपये|रुपए)|(?:₹|rs)\s*\d+|बेच[ाेी]?|बिक[ाेी]?|खरीद[ाे]?|bech|sold|sell|sale|khareed|purchase|₹|रुपये|रुपए|rs|rupees|for|के\s*\d+)/iu)[0];
 return cleanupItem(part);
};
export function parseVoiceCommand(raw:string):VoiceDraft|null{
 const s=plain(raw);
 if(!s||s.length>700)return null;
 const invoiceWord=/(?:invoice|इनवॉइस|इनवॉयस|इन्वॉइस|बिल|रसीद|receipt|\bbill\b)/iu.test(s);
 const askingHow=/^(?:how\b|what\b|can i\b|could you explain\b|kaise\b|कैसे|क्या है|किस तरह|কিভাবে|কীভাবে)/iu.test(s);
 const invoice=invoiceWord&&!askingHow&&(/(?:बना|बनाओ|बनादो|बनाना|छाप|भेज|bana|banado|make|create|generate|print|prepare|chahiye|चाहिए|बनিয়ে|বানাও)/iu.test(s)||/^(?:invoice|बिल|रसीद|receipt|bill)$/iu.test(s));
 const explicitSale=/(?:बेच|बिक्री|बिका|sold|sell|sale|bech|biki|beche|becha|बिक্রি|বেচ|বিক্রি)/iu.test(s);
 const explicitExpense=/(?:खर्च|खरीद|दिए|भुगतान|paid|spent|expense|kharch|kharid|khareed|purchase|bought|খরচ|কিনেছি)/iu.test(s);
 if(!invoice&&!explicitSale&&!explicitExpense)return null;
 if(/\b(?:yesterday|tomorrow|kal)\b|कल|গতকাল|আগামীকাল/iu.test(s))return null; // avoid silently using wrong date
 const qty=quantity(s);
 let amount=extractAmount(s);
 if(qty&&amount===qty.quantity&&!/(?:₹|rs\.?|rupees?|रुपये|रुपए|रुपया|টাকা|\bfor\b|के\s*\d+)/iu.test(s))amount=null;
 if(!amount&&!invoice)return null;
 const intent=invoice?'invoice':explicitExpense&&!explicitSale?'expense':'sale';
 const item=qty?itemAfterUnit(s):'';
 const method:ManualMethod=/\bupi\b|यूपीआई|ইউপিআই/iu.test(s)?'UPI':/\bbank\b|बैंक|ব্যাংক/iu.test(s)?'Bank':/\bcash\b|नकद|कैश|নগদ/iu.test(s)?'Cash':'Cash';
 return {intent,amount,quantity:qty?.quantity??null,unit:qty?.unit??null,item,method,day:indiaDate(),spoken:raw.slice(0,350)};
}
export const draftNote=(d:VoiceDraft)=>{
 const core=[d.quantity!==null?String(d.quantity)+' '+(d.unit||'pcs'):null,d.item].filter(Boolean).join(' ').trim();
 return (d.intent==='expense'?'Voice expense':'Voice sale')+(core?' · '+core:'')+' · owner confirmed';
};
