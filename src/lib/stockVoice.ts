import type {ShopStock} from '../context/ShopContext.tsx';
export type StockVoiceAction={stockId:string;itemName:string;unit:ShopStock['unit'];kind:'stockout'|'restocked';quantity:number|null};
const clean=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[०-९]/gu,x=>String('०१२३४५६७८९'.indexOf(x))).replace(/[\s\p{P}]+/gu,' ').trim();
const aliases:Record<string,string[]>={
 'aloo':['आलू','आलु','आलू','aloo','aaloo','aalu','potato','potatoes'],
 'atta':['आटा','आटे','atta','flour'],
 'oil':['तेल','ऑयल','oil','cooking oil'],
 'rice':['चावल','चावलों','rice'],
 'sugar':['चीनी','शक्कर','sugar'],
 'milk':['दूध','milk'],
 'biscuit':['बिस्कुट','biscuit','biscuits']
};
const normalAlias=(value:string)=>{
 const v=clean(value);
 for(const [base,terms] of Object.entries(aliases))if(terms.some(t=>clean(t)===v))return base;
 return v;
};
const numberWords:Record<string,number>={'एक':1,'दो':2,'तीन':3,'चार':4,'पांच':5,'पाँच':5,'दस':10,'बीस':20,'तीस':30,'चालीस':40,'पचास':50,'सौ':100,'ek':1,'do':2,'teen':3,'bees':20,'das':10};
export function findStockMention(query:string,knownItems:ShopStock[]):ShopStock|undefined{
 const phrase=clean(query);
 return knownItems.find(item=>{
  const name=normalAlias(item.item_name);
  return (name.length>=3&&phrase.includes(name)) ||
   Object.entries(aliases).some(([base,alts])=>base===name&&alts.some(x=>phrase.includes(clean(x))));
 });
}
const qtyPattern=/(\d+(?:\.\d+)?|एक|दो|तीन|चार|पाँच|पांच|दस|बीस|तीस|चालीस|पचास|सौ|ek|do|teen|bees|das)\s*(kg|kgs?|kilo|kilograms?|किलो|किलोग्राम|litres?|liters?|लीटर|ltr|pieces?|pcs|पीस|packs?|packets?|पैकेट|boxes?|डब्बे)/iu;
export function parseStockVoice(text:string,knownItems:ShopStock[]):StockVoiceAction|null{
 const phrase=clean(text);
 if(!phrase||phrase.length>350)return null;
 const finished=/(?:खत्म|ख़त्म|खाली|समाप्त|finish(?:ed)?|ran out|out of stock|khatam|khtm|khali|stockout)/iu.test(phrase);
 const arrived=/(?:आया|आए|आयी|आय[ाेी]|आ गया|आ गए|आ चुका|मंगाया|मंगवाया|नया माल|restock(?:ed)?|received|delivered|delivery|aaya|aaye|aa gaya|aa gaye|stock arrived)/iu.test(phrase);
 if((!finished&&!arrived)||(finished&&arrived))return null;
 // Avoid processing a question as a confirmation command.
 if(/^(?:how|why|when|what|क्या|कैसे|कब|कितना|कितनी|कैसा|क्यों|kitna|kab)(?:\s|$)/iu.test(phrase))return null;
 // A sale or customer expense is not a restock.
 if(/(?:बेचा|बेचे|बेची|बिक्री|sold|sale|sell|becha|beche|khareeda customer|खर्च)/iu.test(phrase))return null;
 const candidate=findStockMention(phrase,knownItems);
 if(!candidate)return null;
 if(finished)return {stockId:candidate.id,itemName:candidate.item_name,unit:candidate.unit,kind:'stockout',quantity:null};
 const match=phrase.match(qtyPattern);
 if(!match)return null;
 const n=Number.isFinite(Number(match[1]))?Number(match[1]):numberWords[match[1]];
 if(!Number.isFinite(n)||n<=0||n>100000)return null;
 const word=match[2].toLowerCase();
 const unit=/(?:kg|kilo|किलो)/iu.test(word)?'kg':/(?:lit|लीटर|ltr)/iu.test(word)?'litres':/(?:pack|पैकेट)/iu.test(word)?'packs':/(?:box|डब्बे)/iu.test(word)?'boxes':'pcs';
 if(unit!==candidate.unit)return null; // never silently convert units
 return {stockId:candidate.id,itemName:candidate.item_name,unit:candidate.unit,kind:'restocked',quantity:n};
}
