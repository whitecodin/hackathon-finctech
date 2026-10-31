import type {NavPath,Language} from '../types.ts';
import type {ShopEntry,ShopDue,ShopStock,ShopContact} from '../context/ShopContext.tsx';
import {indiaDate} from './shopLogic.ts';
export type SaathiRoute=NavPath|'none';
type Guide={answer:string;route:SaathiRoute};
export type SaathiSnapshot={entries:ShopEntry[];dues:ShopDue[];stock:ShopStock[];contacts:ShopContact[];isDemo:boolean};
const fmt=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const content={
 en:{
  greet:'Namaste! I am Dukaan Saathi. Ask me about your Hisaab, Udhar, stock, Auto Hisaab, Bazaar League, Mohalla Power, and anything inside VyaparTrust. I can guide you, but I cannot change your records or send payments.',
  qs:['How much money came in today?','Who owes me money?','What should I reorder?','How can I connect UPI?','Explain Bazaar League','What is Mohalla Power?'],
  open:'Open',source:'These are recorded amounts, not bank-verified balances or profit.',
  empty:'No recorded amounts yet.',limitations:'I can guide you around VyaparTrust. Try asking about Hisaab, Udhar, Stock, Auto Hisaab, payments, Bazaar League, Mohalla Power, privacy, savings, loans, or forecasting.'
 },
 hi:{
  greet:'नमस्ते! मैं दुकान साथी हूँ। हिसाब, उधार, सामान, UPI, बाज़ार लीग या मोहल्ला पावर के बारे में पूछिए। मैं रास्ता दिखा सकता हूँ, लेकिन आपके पैसे या रिकॉर्ड अपने आप नहीं बदल सकता।',
  qs:['आज कितने पैसे आए?','कितना उधार बाकी है?','क्या सामान मंगाना है?','UPI पेमेंट कैसे जोड़ूँ?','बाज़ार लीग क्या है?','मोहल्ला पावर समझाओ'],
  open:'खोलें',source:'यह दर्ज किया गया हिसाब है, बैंक में पक्का जमा या मुनाफ़ा नहीं।',
  empty:'अभी कोई दर्ज रकम नहीं है।',limitations:'मैं VyaparTrust की मदद कर सकता हूँ। हिसाब, उधार, स्टॉक, ऑटो हिसाब, बाज़ार लीग, मोहल्ला पावर, बचत और लोन गाइड पूछिए।'
 },
 bn:{
  greet:'নমস্কার! আমি দোকান সাথী। হিসাব, বাকি, স্টক, UPI, বাজার লিগ বা মহল্লা পাওয়ার নিয়ে প্রশ্ন করুন। আমি পথ দেখাব, কিন্তু টাকা পাঠাব না বা রেকর্ড বদলাব না।',
  qs:['আজ কত টাকা এসেছে?','কত টাকা বাকি আছে?','কোন জিনিস আনতে হবে?','UPI কীভাবে সংযুক্ত করব?','বাজার লিগ কী?','মহল্লা পাওয়ার কী?'],
  open:'খুলুন',source:'এটি লেখা হিসাব, ব্যাংকে নিশ্চিত জমা বা লাভ নয়।',
  empty:'এখনও কোনো লেনদেন রেকর্ড নেই।',limitations:'আমি VyaparTrust-এর হিসাব, বাকি, স্টক, অটো হিসাব, বাজার লিগ, মহল্লা পাওয়ার, সঞ্চয় ও ঋণ গাইড বুঝিয়ে দিতে পারি।'
 }
};
export const saathiCopy=(l:Language)=>content[l];
const routes:{route:NavPath;keywords:string[];en:string;hi:string;bn:string}[]=[
 {route:'ai-financial-coach',keywords:['voice assistant','microphone','speak to','speak hindi','bolkar','bol ke','आवाज़ से','आवाज से','बोलकर','माइक','माइक्रोफोन','ভয়েস','মাইক্রোফোন'],
 en:'Dukaan Saathi supports tap-to-speak in Hindi, English and Bengali when your browser offers Speech Recognition. Say “aaj 2 kilo aalo beche 240 rs” to prepare a sale, or “invoice banado” for a receipt draft. Check the draft and confirm before saving. Voice recognition may use your browser provider, and it may not work in every browser.',
 hi:'दुकान साथी में माइक दबाकर हिंदी में बोल सकते हैं, अगर ब्राउज़र सपोर्ट करता है। जैसे “आज 2 किलो आलू 240 रुपये के बेचे” कहें। पहले ड्राफ्ट आएगा, उसे जाँचकर सेव करें। माइक की आवाज़ ब्राउज़र की सेवा को भी जा सकती है।',
 bn:'ব্রাউজার সমর্থন করলে দোকান সাথীর মাইকে হিন্দি, বাংলা বা ইংরেজিতে বলতে পারেন। পরে খসড়া যাচাই করে সংরক্ষণ করুন। ভয়েস শনাক্তকরণ ব্রাউজারের সেবায় যেতে পারে।'},

 {route:'auto-hisaab',keywords:['upi','razorpay','automatic','automate','connect payment','ऑटो','पेमेंट जोड़','यूपीआई','অটো','ইউপিআই'],
 en:'Auto Hisaab supports signed Razorpay merchant notifications after your provider account is verified and linked. A UPI ID alone cannot share all incoming/outgoing payments. Never enter your UPI PIN or OTP.',hi:'ऑटो हिसाब में Razorpay के सत्यापित बिज़नेस पेमेंट अपने आप दर्ज हो सकते हैं, जब कनेक्शन मंज़ूर हो। केवल UPI ID से सभी पेमेंट नहीं दिखते। PIN या OTP कभी न दें।',bn:'অটো হিসাব অনুমোদিত Razorpay ব্যবসায়িক পেমেন্ট রেকর্ড করতে পারে। শুধু UPI ID দিয়ে সব পেমেন্ট পাওয়া যায় না; PIN/OTP দেবেন না।'},
 {route:'reconciliation',keywords:['statement','reconcile','match payment','csv','bank match','बैंक मिलान','स्टेटमेंट','মিলান','স্টেটমেন্ট'],
 en:'Use Match Payments to upload a CSV and manually confirm possible matches. These uploads are not independent bank verification.',hi:'पैसे मिलान में CSV स्टेटमेंट डालें और संभावित पेमेंट खुद जाँचकर मिलाएँ। यह बैंक की पक्की पुष्टि नहीं है।',bn:'পেমেন্ট মিলান পেজে CSV আপলোড করে মিল নিজে যাচাই করুন। এটি ব্যাঙ্ক যাচাইকরণ নয়।'},
 {route:'forecast',keywords:['forecast','demand','prediction','next week','अंदाज़','पूर्वानुमान','चाहिदা','পূর্বাভাস'],
 en:'Sales Forecast uses 28 days of recorded item quantities, with at least 14 separate sales days and 10 units sold. It cannot know which products sold from a UPI amount.',hi:'सामान का अंदाज़ा पिछले 28 दिनों की दर्ज बिक्री से बनता है। कम-से-कम 14 अलग दिनों और 10 यूनिट की बिक्री चाहिए। सिर्फ UPI रकम से सामान पता नहीं चलता।',bn:'চাহিদার হিসাব ২৮ দিনের পণ্য বিক্রির উপর নির্ভর করে। অন্তত ১৪ দিনের বিক্রি ও ১০ ইউনিট লাগবে।'},
 {route:'merchant-league',keywords:['league','rank','ranking','bazaar','ranking','लीग','रैंक','বাজার লিগ','র‍্যাঙ্ক'],
 en:'Bazaar League is opt-in and compares participating nearby shops by PIN/city/district/state. At least five matching shops need records. Currently it uses an older transactions ledger, not Auto Hisaab entries.',hi:'बाज़ार लीग में अपनी मर्ज़ी से शामिल होकर PIN, शहर, ज़िला या राज्य में तुलना करें। कम-से-कम पाँच दुकानें चाहिए। अभी लीग पुराने ट्रांज़ैक्शन रिकॉर्ड पर चलती है, ऑटो हिसाब से नहीं।',bn:'বাজার লিগে অংশ নিতে ইচ্ছা করলে এলাকা অনুযায়ী তুলনা করা যায়। অন্তত পাঁচটি দোকান দরকার; এখন পুরোনো ট্রানজ্যাকশন তথ্য ব্যবহার হয়।'},
 {route:'mohalla-power',keywords:['mohalla','group buy','bulk','wholesale','together','मोहल्ला','साथ खरीद','थोक','মহল্লা','একসঙ্গে'],
 en:'Mohalla Power lets neighbours voluntarily pledge quantities for a joint supplier enquiry. Totals show only after five shops join. It does not place orders, pay suppliers or coordinate retail prices.',hi:'मोहल्ला पावर में आसपास की दुकानें मिलकर थोक सामान की ज़रूरत बता सकती हैं। पाँच दुकानें जुड़ने पर कुल मात्रा दिखती है। ऐप अभी ऑर्डर या पेमेंट नहीं करता।',bn:'মহল্লা পাওয়ার-এ কাছের দোকানরা একসঙ্গে পণ্য কেনার আগ্রহ জানায়। পাঁচটি দোকান যোগ দিলে মোট পরিমাণ দেখা যায়; অর্ডার বা পেমেন্ট হয় না।'},
 {route:'regulars',keywords:['regular customer','repeat order','customer list','loyal','पक्के ग्राहक','बार-बार','নিয়মিত','ক্রেতা তালিকা'],
 en:'Regular Customers saves repeat shopping lists with customer permission. You review and copy messages yourself; no automatic WhatsApp messages are sent.',hi:'पक्के ग्राहकों की सूची उनकी इजाज़त लेकर सेव करें। मैसेज भेजने से पहले आप ही देखें; ऑटो WhatsApp नहीं जाता।',bn:'নিয়মিত ক্রেতার অনুমতি নিয়ে কেনাকাটার তালিকা রাখা যায়। স্বয়ংক্রিয় WhatsApp পাঠানো হয় না।'},
 {route:'audit-history',keywords:['audit','history of change','who changed','log','बदलाव','ऑडिट','অডিট','ইতিহাস'],
 en:'Activity History records when shop records are added, changed or removed. It logs events, not complete before-and-after values.',hi:'बदलाव का हिसाब दिखाता है कब रिकॉर्ड जोड़ा, बदला या हटाया गया। पुरानी-नई पूरी रकम का इतिहास इसमें नहीं है।',bn:'পরিবর্তনের ইতিহাসে কখন রেকর্ড বদলেছে দেখা যায়, কিন্তু সব আগের ও পরের মান নয়।'},
 {route:'data-controls',keywords:['privacy','export','download data','delete','erase','consent','my data','निजता','डेटा हट','ডেটা','মুছ','গোপনীয়তা'],
 en:'My Data & Privacy lets you export your own JSON records or separately delete shop/account data with confirmation. Deletion is irreversible. I cannot perform it for you.',hi:'मेरा डेटा पेज से रिकॉर्ड डाउनलोड कर सकते हैं और अलग से पुष्टि करके मिटा सकते हैं। मिटाना वापस नहीं हो सकता। मैं चैट से ऐसा नहीं करूँगा।',bn:'আমার তথ্য থেকে JSON ডাউনলোড বা নিশ্চিত হয়ে তথ্য মুছতে পারেন। মুছে ফেলা ফেরানো যায় না; আমি চ্যাট থেকে করি না।'},
 {route:'settings',keywords:['change shop','shop name','pin code','address','language','setting','दुकान का नाम','पता बदल','भाषा','সেটিংস','দোকানের নাম'],
 en:'Open Shop Settings to update the shop name, owner, address, PIN, city, district and state. Region details are self-reported until verified.',hi:'दुकान की सेटिंग्स से नाम, मालिक, पता, PIN, शहर और राज्य बदलें। इलाके की जानकारी अभी खुद भरी जाती है।',bn:'দোকানের সেটিংসে নাম, ঠিকানা, PIN, শহর ও রাজ্য বদলাতে পারবেন।'},
 {route:'business-resilience',keywords:['saving','save money','emergency fund','बचत','जमा करना','সঞ্চয়'],
 en:'My Savings is a planning goal only. VyaparTrust does not move money into a savings account or preserve a bank balance there.',hi:'बचत वाला टूल सिर्फ लक्ष्य बनाने के लिए है। ऐप बैंक में पैसे जमा नहीं करता।',bn:'সঞ্চয় পেজ শুধু একটি লক্ষ্য নির্ধারণের সাহায্য করে; ব্যাংকে টাকা পাঠায় না।'},
 {route:'credit-readiness',keywords:['loan','credit','emi','borrow','लोन','कर्ज','ঋণ'],
 en:'The Loan Guide explains basic borrowing preparation. VyaparTrust does not calculate a verified credit score, approve loans or guarantee lender decisions.',hi:'लोन गाइड बस तैयारी समझाता है। VyaparTrust क्रेडिट स्कोर, मंज़ूर लोन या पक्की EMI नहीं बताता।',bn:'ঋণ গাইড সাধারণ প্রস্তুতি শেখায়। VyaparTrust ঋণ অনুমোদন বা নিশ্চিত স্কোর দেয় না।'},
 {route:'financial-passport',keywords:['passport','certificate','verify financial','पासपोर्ट','प्रमाण पत्र','পাসপোর্ট'],
 en:'Financial Passport currently shows basic shop details, not a lender-verified financial certificate. Verification is not ready.',hi:'फाइनेंशियल पासपोर्ट अभी सिर्फ दुकान की जानकारी दिखाता है; बैंक से सत्यापित प्रमाणपत्र नहीं है।',bn:'ফাইন্যান্সিয়াল পাসপোর্ট এখন দোকানের বিবরণ মাত্র, যাচাইকৃত শংসাপত্র নয়।'},
 {route:'transaction-safety',keywords:['old transaction','payment review','flagged','fraud','suspicious','unknown payment','संदिग्ध','गलत पेमेंट','সন্দেহজনক'],
 en:'Payment Review shows older transaction records, separate from Daily Hisaab. If a payment looks unfamiliar, check the official bank/provider channel.',hi:'पेमेंट जाँच पुराने रिकॉर्ड दिखाता है, डेली हिसाब से अलग। अनजान पेमेंट पर बैंक या प्रोवाइडर से आधिकारिक तरीके से जाँचें।',bn:'পেমেন্ট রিভিউ পুরোনো লেনদেন আলাদাভাবে দেখায়। অজানা লেনদেনে ব্যাঙ্কের সরকারি উপায়ে যাচাই করুন।'}
];
export function saathiGuide(question:string,lang:Language,s:SaathiSnapshot):Guide{
 const c=content[lang],q=question.toLocaleLowerCase().trim(),day=indiaDate();
 const received=s.entries.filter(x=>x.entry_date===day&&x.kind==='sale'&&!x.matched_provider_entry_id).reduce((n,x)=>n+x.amount,0);
 const paid=s.entries.filter(x=>x.entry_date===day&&x.kind==='expense'&&!x.matched_provider_entry_id).reduce((n,x)=>n+x.amount,0);
 const due=(direction:'receive'|'pay')=>s.dues.filter(x=>x.direction===direction).reduce((n,x)=>n+Math.max(0,x.amount-x.settled),0);

 const month=/\b(?:month|monthly|mahina|mahine)\b|महीन|मास|মাস/iu.test(q);
 const week=/\b(?:week|weekly|hafta|hafte)\b|हफ्त|सप्ताह|সপ্তাহ/iu.test(q);
 const yesterday=/\b(?:yesterday|kal)\b|कल|গতকাল/iu.test(q);
 const prev=new Date(day+'T12:00:00Z');prev.setUTCDate(prev.getUTCDate()-1);const previous=prev.toISOString().slice(0,10);
 const cutoff=new Date(day+'T12:00:00Z');cutoff.setUTCDate(cutoff.getUTCDate()-6);const startWeek=cutoff.toISOString().slice(0,10);
 const periodRows=s.entries.filter(x=>!x.matched_provider_entry_id&&(month?x.entry_date.slice(0,7)===day.slice(0,7):week?x.entry_date>=startWeek&&x.entry_date<=day:yesterday?x.entry_date===previous:x.entry_date===day));
 const periodIn=periodRows.filter(x=>x.kind==='sale').reduce((n,x)=>n+x.amount,0);
 const periodOut=periodRows.filter(x=>x.kind==='expense').reduce((n,x)=>n+x.amount,0);
 const periodName=lang==='hi'?month?'इस महीने':week?'पिछले 7 दिन':yesterday?'कल':'आज':lang==='bn'?month?'এই মাসে':week?'গত ৭ দিনে':yesterday?'গতকাল':'আজ':month?'This month':week?'Last 7 days':yesterday?'Yesterday':'Today';
 const expenseQuestion=/(?:\b(?:expense|expenses|spent|spend|cost|kharch|kharcha)\b|खर्च|खरचा|खर्चा|व्यय|खরচ)/iu.test(q)&&/(?:\b(?:how|much|total|kitna|kitne|all|spent)\b|कितन|कुल|টাকা|কত|आज|today|महीन|month)/iu.test(q);
 const salesQuestion=/(?:\b(?:sale|sales|sold|income|received|kamai|earning)\b|बिक्री|बेचा|बिके|कमाई|आमदनी|বিক্রি|আয়)/iu.test(q)&&/(?:\b(?:how|much|total|kitna|kitne|all|today|month|week)\b|कितन|कुल|आज|महीन|কত|টাকা)/iu.test(q);
 if(expenseQuestion){
  const reply=lang==='hi'?periodName+' दर्ज खर्च: '+fmt(periodOut)+'। '+periodRows.filter(x=>x.kind==='expense').length+' खर्च रिकॉर्ड।':lang==='bn'?periodName+' লেখা খরচ: '+fmt(periodOut)+'।':'Recorded expenses '+periodName.toLowerCase()+': '+fmt(periodOut)+'. '+periodRows.filter(x=>x.kind==='expense').length+' entries.';
  return {answer:reply+' '+c.source,route:'daily-hisaab'};
 }
 if(salesQuestion){
  const reply=lang==='hi'?periodName+' दर्ज बिक्री: '+fmt(periodIn)+'।':lang==='bn'?periodName+' লেখা বিক্রি: '+fmt(periodIn)+'।':'Recorded sales '+periodName.toLowerCase()+': '+fmt(periodIn)+'.';
  return {answer:reply+' '+c.source,route:'daily-hisaab'};
 }
 if(/\b(?:profit|margin|net profit)\b|मुनाफा|मुनाफ़ा|लाभ|লাভ/iu.test(q)){
  return {answer:lang==='hi'?'अभी पक्का मुनाफ़ा नहीं बता सकते। दर्ज बिक्री और खर्च हैं, लेकिन पूरा स्टॉक लागत, उधार और अन्य खर्च जुड़ना ज़रूरी है।':lang==='bn'?'এখন সঠিক লাভ বলা যাবে না। সম্পূর্ণ খরচ ও পণ্য ক্রয়মূল্য দরকার।':'VyaparTrust cannot yet calculate verified profit: full inventory costs, outstanding dues and overheads are not all linked. You can review recorded cash flow instead.',route:'daily-hisaab'};
 }

 const low=s.stock.filter(x=>x.quantity<=x.reorder_at);

 const named=s.stock.find(x=>x.item_name.trim().length>1&&q.includes(x.item_name.trim().toLocaleLowerCase()));
 if(named&&/(?:\b(?:stock|left|remaining|quantity|kitna|how much|how many)\b|कितन|सामान|बचा|স্টক|কত)/iu.test(q)){
  return {answer:(lang==='hi'?named.item_name+' का दर्ज स्टॉक: ':lang==='bn'?named.item_name+' বর্তমান স্টক: ':named.item_name+' recorded stock: ')+named.quantity+' '+named.unit+'. '+c.source,route:'stock'};
 }

 if(/(?:today|money.*(in|received|out)|sales.*today|cashflow|आज|कितने पैसे|आज.*रकम|আজ|টাকা এসেছে)/i.test(q)){
  const answer=lang==='hi'?'आज दर्ज पैसे आए: '+fmt(received)+'। खर्च: '+fmt(paid)+'। ':lang==='bn'?'আজ রেকর্ডে এসেছে: '+fmt(received)+'। খরচ: '+fmt(paid)+'। ':'Today recorded in: '+fmt(received)+'. Recorded out: '+fmt(paid)+'. ';
  return {answer:answer+(s.entries.length===0?c.empty+' ':'')+c.source,route:'daily-hisaab'};
 }
 if(/(?:udhar|due|owed|owes me|owe me|supplier.*pay|उधार|उधारी|किसका पैसा|बकाया|বাকি|ধার)/i.test(q)){
  const a=due('receive'),b=due('pay');
  return {answer:(lang==='hi'?'ग्राहकों से बाकी: '+fmt(a)+'। सप्लायर को देना: '+fmt(b)+'। ':lang==='bn'?'গ্রাহকদের কাছে বাকি: '+fmt(a)+'। সরবরাহকারীকে দিতে হবে: '+fmt(b)+'। ':'Customer udhar remaining: '+fmt(a)+'. Supplier dues remaining: '+fmt(b)+'. ')+c.source,route:'udhar'};
 }
 if(/(?:stock|reorder|low item|order again|inventory|सामान|मंगाना|खत्म|स्टॉक|স্টক|পণ্য|জিনিস)/i.test(q)){
  const list=low.slice(0,5).map(x=>x.item_name+' ('+x.quantity+' '+x.unit+')').join(', ');
  const answer=lang==='hi'?low.length?'कम स्टॉक: '+list+'। खरीदारी लिस्ट स्टॉक में देखें।':'अभी दर्ज सामान कम-स्टॉक की सीमा पर नहीं है।':lang==='bn'?low.length?'কম স্টক: '+list+'।':'এখন স্টক সতর্কতা নেই।':low.length?'Low-stock items: '+list+'. Open Stock to review your purchase list.':'No recorded item is currently below its reorder threshold.';
  return {answer:answer+' '+c.source,route:'stock'};
 }

 if(/(?:invoice|receipt|बिल|रसीद|इनवॉइस|ইনভয়েস|রসিদ)/iu.test(q)){
  return {answer:lang==='hi'?'बिल बनाना हो तो बोलें: “invoice banado 2 kilo aalo 240 rs”। साथी पहले ड्राफ्ट दिखाएगा; आप रकम जाँचकर रसीद प्रिंट या हिसाब सेव कर सकते हैं। यह GST टैक्स इनवॉइस नहीं है।':lang==='bn'?'রসিদ বানাতে বলুন: “invoice banado 2 kilo aalo 240 rs”। আগে খসড়া দেখে নিশ্চিত করুন; এটি GST কর চালান নয়।':'Say “invoice banado 2 kilo aalo 240 rs”. Saathi will make a reviewable receipt draft and offer print or save; it is not a GST tax invoice.',route:'ai-financial-coach'};
 }
 for(const r of routes){if(r.keywords.some(k=>q.includes(k.toLowerCase())))return {answer:r[lang],route:r.route}}
 if(/(?:hisaab|हिसाब|হিসাব)/i.test(q))return{answer:lang==='hi'?'रोज़ का हिसाब खोलें। बिक्री और खर्च Cash, UPI या Bank में दर्ज होते हैं। पक्के प्रोवाइडर पेमेंट अपने आप जुड़ सकते हैं, लेकिन बैंक बैलेंस नहीं दिखता।':lang==='bn'?'দৈনিক হিসাবে বিক্রি ও খরচ দেখা যায়। এটি ব্যাংক ব্যালেন্স নয়।':'Daily Hisaab keeps manual and supported provider-confirmed payments together. It is not a bank balance or a profit report.',route:'daily-hisaab'};
 return {answer:lang==='hi'?'आप क्या करना चाहते हैं — आज की बिक्री जानना, खर्च देखना, उधार पूछना या नया हिसाब लिखना? उदाहरण: “आज कितना खर्च हुआ?” या “दो किलो आलू 240 रुपये के बेचे”। अगर आपने बोलकर पूछा था, तो पहले सुने हुए शब्द ठीक कर लें।':lang==='bn'?'কোন কাজটি করতে চান — আজকের বিক্রি, খরচ, বাকি, নাকি নতুন হিসাব? উদাহরণ: “আজ কত টাকা খরচ হয়েছে?” ভয়েস ভুল হলে আগে লেখা ঠিক করুন।':'I didn’t understand the specific shop task. Do you want today’s sales, expenses, Udhar, stock, or a new sale entry? Try “How much did I spend today?” or “Sold 2 kg potatoes for ₹240.” If you used voice, please check the transcript first.',route:'none'};
}
