import React,{useEffect,useRef,useState} from 'react';
import type {Merchant,NavPath,Language} from '../types.ts';
import {useAuth} from '../context/AuthContext.tsx';
import {useLanguage} from '../context/LanguageContext.tsx';
import {useShop,formatRupees} from '../context/ShopContext.tsx';
import {supabase} from '../lib/supabase.ts';
import {saathiCopy,saathiGuide} from '../lib/saathiGuide.ts';
import type {SaathiRoute} from '../lib/saathiGuide.ts';
import {parseVoiceCommand,draftNote} from '../lib/voiceCommands.ts';
import type {VoiceDraft,VoiceUnit,ManualMethod} from '../lib/voiceCommands.ts';
import {createListener,stopSpeech,speak,classifySpeechError,describeVoiceProblem,voiceIsSecure,voiceAvailable,isBrave,testMicrophone} from '../lib/browserVoice.ts';
import type {SpeechListener,VoiceProblem,MicDiagnostic} from '../lib/browserVoice.ts';
import {beginLocalRecording,transcribeLocally,localMicSupported,localRecordingLimitMs} from '../lib/localWhisper.ts';
import type {LocalRecorder,LocalProgress} from '../lib/localWhisper.ts';
import {reviewTranscript,voiceActivitySummary,audioIsClearEnough} from '../lib/voiceReview.ts';

type Msg={id:string;role:'assistant'|'user';text:string;mode?:'live'|'guide';route?:SaathiRoute};
const uid=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():String(Date.now()+Math.random());
const routeLabels:Partial<Record<NavPath,string>>={
 overview:'My Dukaan','daily-hisaab':'Daily Hisaab',udhar:'Udhar',stock:'My Stock',regulars:'Regular Customers',
 'auto-hisaab':'Auto Hisaab',reconciliation:'Match Payments',forecast:'Sales Forecast','merchant-league':'Bazaar League',
 'mohalla-power':'Mohalla Power','audit-history':'Activity History','data-controls':'My Data & Privacy',
 settings:'Shop Settings','transaction-safety':'Payment Review','business-resilience':'My Savings',
 'credit-readiness':'Loan Guide','financial-passport':'Shop Details'
};
const availableRoutes=new Set(Object.keys(routeLabels));
const texts={
 en:{header:'Dukaan Saathi',sub:'Speak, ask, and write your Hisaab with confidence',guide:'App guide',live:'Live AI',ask:'Ask a question or describe today’s sale…',send:'Send',clear:'Clear chat',personal:'Use my shop totals for live AI answers',priv:'Off by default. Messages may be sent to the AI service when connected. Your shop summary is shared only if enabled. Never enter OTP or UPI PIN.',tip:'Please review every drafted transaction before saving. Saathi cannot send payments.',working:'Checking your question…',offline:'Live AI is unavailable. Dukaan Saathi is using its built-in shop guide.',start:'What can I help with?',quick:'Try asking',review:'Review before saving',record:'Save in Daily Hisaab',invoice:'Printable receipt draft',voice:'Speak in Hindi',voiceOff:'Stop listening',read:'Read replies aloud',cancel:'Discard draft',hint:'Payment method defaults to Cash; change it if the sale used UPI, Bank, or something else.',item:'Item or reason',quantity:'Quantity',amount:'Amount (₹)',method:'Payment method',print:'Print draft receipt',edit:'Check the amount, item and payment method. No stock quantity will change.',saved:'Saved to Daily Hisaab.',unsup:'Speech recognition is unavailable in this browser. You can type the same command.',noMic:'Microphone could not start. Allow microphone access or type your question.',voiceData:'Speech recognition may be processed by your browser’s speech provider; do not speak passwords or PINs.',demo:'Demo mode — saved entries are fictional.'},
 hi:{header:'दुकान साथी',sub:'बोलकर पूछें, हिसाब लिखें, दुकान संभालें',guide:'ऐप गाइड',live:'लाइव AI',ask:'सवाल पूछें या आज की बिक्री बताएँ…',send:'भेजें',clear:'चैट साफ़',personal:'लाइव AI के लिए मेरी दुकान का हिसाब इस्तेमाल करें',priv:'शुरू में बंद है। लाइव AI चालू होने पर संदेश सेवा को जा सकते हैं। दुकान का सार आपकी इजाज़त से जाता है। OTP या PIN न दें।',tip:'हिसाब लिखने से पहले हमेशा जाँचकर पक्का करें। साथी पैसे नहीं भेजता।',working:'सवाल समझ रहे हैं…',offline:'लाइव AI उपलब्ध नहीं है। दुकान साथी अपने ऐप गाइड से जवाब दे रहा है।',start:'मैं क्या मदद करूँ?',quick:'ऐसे पूछिए',review:'लिखने से पहले जाँचें',record:'रोज़ के हिसाब में सेव करें',invoice:'बिल / रसीद का ड्राफ्ट',voice:'हिंदी में बोलें',voiceOff:'बोलना बंद करें',read:'जवाब सुनें',cancel:'ड्राफ्ट हटाएँ',hint:'डिफ़ॉल्ट नकद है। UPI या बैंक हो तो बदलें।',item:'सामान / वजह',quantity:'मात्रा',amount:'रकम (₹)',method:'भुगतान का तरीका',print:'रसीद प्रिंट करें',edit:'रकम और सामान पक्का करें। स्टॉक अपने आप नहीं कटेगा।',saved:'रोज़ के हिसाब में सेव हो गया।',unsup:'इस ब्राउज़र में बोलकर लिखने की सुविधा नहीं है। सवाल टाइप करें।',noMic:'माइक शुरू नहीं हुआ। अनुमति दें या लिखकर पूछें।',voiceData:'आपकी आवाज़ ब्राउज़र की स्पीच सेवा को जा सकती है। PIN या पासवर्ड न बोलें।',demo:'डेमो है — हिसाब काल्पनिक है।'},
 bn:{header:'দোকান সাথী',sub:'কথা বলে জিজ্ঞেস করুন, হিসাব লিখুন',guide:'অ্যাপ গাইড',live:'লাইভ AI',ask:'প্রশ্ন করুন বা আজকের বিক্রি বলুন…',send:'পাঠান',clear:'চ্যাট মুছুন',personal:'লাইভ AI উত্তরে আমার দোকানের হিসাব ব্যবহার করুন',priv:'শুরুতে বন্ধ। লাইভ AI থাকলে লেখা বার্তা পাঠানো হতে পারে। দোকানের সারাংশ আপনার অনুমতিতে যাবে। PIN/OTP লিখবেন না।',tip:'রেকর্ড সংরক্ষণের আগে যাচাই করুন। সাথী টাকা পাঠাতে পারে না।',working:'প্রশ্ন বুঝছি…',offline:'লাইভ AI নেই, অ্যাপ গাইড উত্তর দিচ্ছে।',start:'কীভাবে সাহায্য করব?',quick:'এগুলো জিজ্ঞাসা করুন',review:'সংরক্ষণের আগে যাচাই করুন',record:'দৈনিক হিসাবে সংরক্ষণ',invoice:'রসিদের খসড়া',voice:'হিন্দিতে বলুন',voiceOff:'শোনা বন্ধ করুন',read:'উত্তর শুনুন',cancel:'খসড়া মুছুন',hint:'নগদ নির্বাচিত আছে। UPI/ব্যাংক হলে বদলান।',item:'পণ্য / কারণ',quantity:'পরিমাণ',amount:'টাকার পরিমাণ (₹)',method:'পেমেন্ট পদ্ধতি',print:'রসিদ প্রিন্ট',edit:'সব তথ্য যাচাই করুন। স্টক নিজে কমবে না।',saved:'দৈনিক হিসাবে সংরক্ষিত।',unsup:'এই ব্রাউজারে ভয়েস লেখা নেই। টাইপ করুন।',noMic:'মাইক্রোফোন চালু হয়নি। অনুমতি দিন বা লিখুন।',voiceData:'ভয়েস ব্রাউজারের স্বীকৃতি সেবায় যেতে পারে। PIN বলবেন না।',demo:'ডেমো — কাল্পনিক তথ্য।'}
};
export function AIFinancialCoachView({onNavigate,initialQuery,merchant}:{merchant:Merchant|null;onNavigate:(p:NavPath)=>void;language:Language;onLanguageChange:(l:Language)=>void;initialQuery?:string}){
 const {language}=useLanguage(),t=texts[language],copy=saathiCopy(language);
 const {user}=useAuth(),shop=useShop();
 const [messages,setMessages]=useState<Msg[]>([]);
 const [question,setQuestion]=useState(''),[loading,setLoading]=useState(false);
 const [personal,setPersonal]=useState(false),[mode,setMode]=useState<'checking'|'live'|'guide'>(shop.demo?'guide':'checking');
 const [warning,setWarning]=useState(''),[voicePhase,setVoicePhase]=useState<'idle'|'starting'|'listening'>('idle');
 const [voiceProblem,setVoiceProblem]=useState<VoiceProblem>('none'),[micResult,setMicResult]=useState<MicDiagnostic|null>(null),[testingMic,setTestingMic]=useState(false);
 const [localMode,setLocalMode]=useState(()=>isBrave()),[localPhase,setLocalPhase]=useState<'idle'|'starting'|'recording'|'transcribing'>('idle');
 const [localProgress,setLocalProgress]=useState<LocalProgress|null>(null);
 const [voiceReview,setVoiceReview]=useState<{text:string;uncertain:boolean}|null>(null);
 const [voiceLang,setVoiceLang]=useState<'hi-IN'|'en-IN'|'bn-IN'>(language==='bn'?'bn-IN':'hi-IN');
 const [readReplies,setReadReplies]=useState(false);
 const [draft,setDraft]=useState<VoiceDraft|null>(null),[recorded,setRecorded]=useState(false),[saving,setSaving]=useState(false),[savedMessage,setSavedMessage]=useState('');
 const tail=useRef<HTMLDivElement>(null),questionInput=useRef<HTMLTextAreaElement>(null),listener=useRef<SpeechListener|null>(null);
 const listeningTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const localRecorder=useRef<LocalRecorder|null>(null),localTimer=useRef<ReturnType<typeof setTimeout>|null>(null),localActive=useRef(false);
 const askRef=useRef<(q:string)=>Promise<void>>(async()=>{});
 const retryAt=useRef(0);
 const snapshot={entries:shop.entries,dues:shop.dues,stock:shop.stock,contacts:shop.contacts,isDemo:shop.demo};
 const addAgent=(reply:string,route:SaathiRoute='none',origin:'live'|'guide'='guide')=>{
  setMessages(list=>[...list,{id:uid(),role:'assistant',text:reply,route,mode:origin}]);
  if(readReplies){const lang=voiceLang;speak(reply,lang)}
 };
 useEffect(()=>{tail.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[messages,loading,draft]);
 useEffect(()=>{if(initialQuery?.trim())setQuestion(initialQuery.trim())},[initialQuery]);
 useEffect(()=>{if(shop.demo||!user)setMode('guide')},[shop.demo,user]);
 useEffect(()=>()=>{listener.current?.abort();listener.current=null;if(listeningTimeout.current)clearTimeout(listeningTimeout.current);if(localTimer.current)clearTimeout(localTimer.current);localRecorder.current?.cancel();localActive.current=false;stopSpeech()},[]);
 const clear=()=>{if(loading||saving)return;setMessages([]);setWarning('');setVoiceReview(null);setDraft(null);setRecorded(false);setSavedMessage('');stopSpeech()};
 const ask=async(text:string)=>{
  const q=text.trim().slice(0,1000);
  if(!q||loading||saving)return;
  setQuestion('');setVoiceReview(null);setWarning('');setSavedMessage('');stopSpeech();
  const prior=messages.slice(-8).map(m=>({role:m.role,text:m.text}));
  setMessages(list=>[...list,{id:uid(),role:'user',text:q}]);
  const voiceDraft=parseVoiceCommand(q);
  const isFollowup=draft&&!voiceDraft&&q.length<120&&
    (/[₹\d०-९]/.test(q)||/\b(?:cash|upi|bank|rs)\b|नकद|कैश|रुपये|रुपए|किलो|लीटर|पीस|হাতে|টাকা/i.test(q))&&
    !/\b(?:what|how|why|kitna|kitni|kya|kahan)\b|कितन|क्या|कैसे|কত|কেন/iu.test(q);
  if(isFollowup){
    const inferred=parseVoiceCommand((draft.intent==='invoice'?'invoice banado ':draft.intent==='expense'?'aaj ':'aaj ')+q+(draft.intent==='expense'?' kharch':draft.intent==='sale'?' beche':''));
    if(inferred&&(inferred.amount!==null||inferred.quantity!==null||inferred.method!==draft.method)){
      setDraft(old=>old?{...old,
        amount:inferred.amount??old.amount,
        quantity:inferred.quantity??old.quantity,
        unit:inferred.unit??old.unit,
        item:inferred.item||old.item,
        method:inferred.method==='Cash'&&old.method!=='Cash'&&!/\bcash\b|नकद|कैश/i.test(q)?old.method:inferred.method
      }:null);
      setRecorded(false);
      addAgent(language==='hi'?'मैंने उसी ड्राफ्ट में नई जानकारी भर दी है। नीचे जाँचें।':language==='bn'?'একই খসড়ায় নতুন তথ্য যোগ করেছি। যাচাই করুন।':'Updated the same draft with your new details. Please review before saving.');
      return;
    }
  }
  if(voiceDraft){
    setDraft(voiceDraft);setRecorded(false);
    addAgent(language==='hi'?'मैंने सुना और ड्राफ्ट तैयार किया है। नीचे रकम और सामान जाँचें, फिर सेव करें।':language==='bn'?'আপনার কথা থেকে খসড়া তৈরি করেছি। যাচাই করে সংরক্ষণ করুন।':'I prepared a draft from your words. Review its details below; nothing is saved until you confirm.');
    return;
  }
  setLoading(true);
  if(shop.demo||!user||Date.now()<retryAt.current){
   const out=saathiGuide(q,language,snapshot);addAgent(out.answer,out.route);setMode('guide');setLoading(false);return;
  }
  try{
   const {data,error}=await supabase.functions.invoke('vyapartrust-saathi',{body:{message:q,history:prior,language,includeShopData:personal}});
   if(error||!data||typeof data.reply!=='string')throw Error('AI unavailable');
   const route:SaathiRoute=typeof data.route==='string'&&availableRoutes.has(data.route)?data.route as NavPath:'none';
   addAgent(data.reply.slice(0,1700),route,'live');setMode('live');
  }catch{
   const out=saathiGuide(q,language,snapshot);addAgent(out.answer,out.route);
   retryAt.current=Date.now()+90_000;setMode('guide');setWarning(t.offline);
  }finally{setLoading(false)}
 };
 askRef.current=ask;
 const clearListeningTimer=()=>{if(listeningTimeout.current){clearTimeout(listeningTimeout.current);listeningTimeout.current=null}};
 const stopListening=()=>{
  const recognizer=listener.current;listener.current=null;clearListeningTimer();
  if(recognizer){try{recognizer.abort()}catch{/* may already have stopped */}}
  setVoicePhase('idle');
 };
 const showVoiceError=(problem:VoiceProblem,code:string)=>{
  setVoiceProblem(problem);
  const desc=describeVoiceProblem(problem,language,isBrave());
  setWarning(desc+(code?' ['+code+']':''));
 };
 const checkMicrophone=async()=>{
  if(testingMic||voicePhase!=='idle'||localPhase!=='idle')return;
  setTestingMic(true);setWarning('');setMicResult(null);
  const result=await testMicrophone();
  setMicResult(result);setTestingMic(false);
  if(!result.ok)showVoiceError(result.problem,result.details);
  else{setVoiceProblem('none');setWarning(language==='hi'?'माइक की अनुमति मिल गई। अब “हिंदी में बोलें” दबाएँ। अगर Brave में आवाज़ नहीं पहचानी जाए तो Edge खोलें।':language==='bn'?'মাইক্রোফোন কাজ করছে। এবার কথা বলুন। Brave-এ না হলে Edge ব্যবহার করুন।':'Microphone works. Tap Speak to try speech recognition. If Brave still fails, open this page in Edge.');}
 };
 const receiveSpeech=(raw:string)=>{
  const review=reviewTranscript(raw,voiceLang);
  setQuestion('');
  if(review.quality==='empty'){
   setVoiceReview(null);
   setWarning(language==='hi'?'आवाज़ साफ़ नहीं समझी। थोड़ा पास आकर दोबारा बोलें।':'I could not hear clear words. Please try again.');
   return;
  }
  setVoiceReview({text:review.transcript,uncertain:review.quality!=='clear'});
  setWarning('');
 };
 const applyVoiceReview=()=>{
  if(!voiceReview||!voiceReview.text.trim())return;
  const cleaned=voiceReview.text.trim();
  setVoiceReview(null);
  void askRef.current(cleaned);
 };
 const stopLocal=async()=>{
  if(!localRecorder.current||localPhase==='transcribing')return;
  const recording=localRecorder.current;
  localRecorder.current=null;
  if(localTimer.current){clearTimeout(localTimer.current);localTimer.current=null}
  setLocalPhase('transcribing');setLocalProgress({message:language==='hi'?'आवाज़ पहचान रहे हैं…':'Preparing audio for local transcription'});
  try{
   const pcm=await recording.stop();
   if(!localActive.current)return;
   const quality=voiceActivitySummary(pcm);
   if(!audioIsClearEnough(quality))throw Error('Too quiet or unclear. Speak for 2–8 seconds near the microphone and try again.');
   const result=await transcribeLocally(pcm,voiceLang,progress=>{if(localActive.current)setLocalProgress(progress)});
   if(!localActive.current)return;
   receiveSpeech(result);
   setLocalProgress(null);
  }catch(e){
   const explanation=e instanceof Error?e.message:'Offline voice recognition failed';
   setWarning((language==='hi'?'ऑफ़लाइन आवाज़ पहचान नहीं हो पाई: ':'Offline transcription failed: ')+explanation+
    (language==='hi'?' · Windows में Win + H से भी बोल सकते हैं।':' · Windows Win + H is another option.'));
   setLocalProgress(null);
  }finally{setLocalPhase('idle')}
 };
 const startLocal=async()=>{
  if(localPhase!=='idle'||loading||saving)return;
  if(!localMicSupported()){showVoiceError('unsupported','local-audio-capture-not-supported');return}
  stopSpeech();setVoiceReview(null);setVoiceProblem('none');setWarning('');setMicResult(null);setLocalProgress(null);
  setLocalPhase('starting');localActive.current=true;
  try{
   const rec=await beginLocalRecording();
   if(!localActive.current){rec.cancel();return}
   localRecorder.current=rec;setLocalPhase('recording');
   localTimer.current=setTimeout(()=>void stopLocalRef.current(),localRecordingLimitMs);
  }catch(e){
   const code=e instanceof Error?e.name:'recording-error';
   showVoiceError(classifySpeechError(code),code);
   setLocalPhase('idle');
  }
 };
 const stopLocalRef=useRef<()=>Promise<void>>(async()=>{});
 stopLocalRef.current=stopLocal;
 const cancelLocal=()=>{
  localActive.current=false;localRecorder.current?.cancel();localRecorder.current=null;
  if(localTimer.current){clearTimeout(localTimer.current);localTimer.current=null}
  setLocalPhase('idle');setLocalProgress(null);
 };
 const toggleListen=()=>{
  if(localMode){
   if(localPhase==='idle'){void startLocal();return}
   if(localPhase==='recording'){void stopLocal();return}
   return;
  }
  if(voicePhase!=='idle'){stopListening();return}
  if(!voiceIsSecure()){showVoiceError('insecure','insecure-context');return}
  if(!voiceAvailable()){setLocalMode(true);void startLocal();return}
  const recognition=createListener();
  if(!recognition){showVoiceError('unsupported','recognizer-unavailable');return}
  stopSpeech();setWarning('');setVoiceProblem('none');
  setMicResult(null);listener.current=recognition;
  recognition.lang=voiceLang;recognition.interimResults=false;recognition.continuous=false;
  let recognized=false,failed=false;
  const armSpeechTimeout=(ms:number,code:string)=>{
   clearListeningTimer();
   listeningTimeout.current=setTimeout(()=>{
    if(listener.current!==recognition)return;
    stopListening();showVoiceError(isBrave()?'speech-service':'no-speech',code);
   },ms);
  };
  recognition.onstart=()=>{if(listener.current===recognition){setVoicePhase('listening');armSpeechTimeout(18000,'recognition-result-timeout')}};
  recognition.onaudiostart=()=>{if(listener.current===recognition){setVoicePhase('listening');armSpeechTimeout(18000,'recognition-result-timeout')}};
  recognition.onresult=event=>{
   if(listener.current!==recognition)return;
   const spoken=Array.from(event.results).map(group=>group[0]?.transcript||'').join(' ').trim();
   if(spoken){recognized=true;clearListeningTimer();receiveSpeech(spoken)}
  };
  recognition.onerror=e=>{
   if(listener.current!==recognition)return;
   failed=true;listener.current=null;clearListeningTimer();setVoicePhase('idle');
   const problem=classifySpeechError(e.error);
   if(problem==='network'||problem==='speech-service'){
    setLocalMode(true);
    setWarning((language==='hi'?'ब्राउज़र की आवाज़ सेवा उपलब्ध नहीं। Whisper चालू कर दिया है — माइक फिर दबाएँ।':'Browser speech service failed. Local Whisper is now enabled — press the microphone again.')+' ['+e.error+']');
   }else if(problem!=='none')showVoiceError(problem,e.error);
  };
  recognition.onend=()=>{
   if(listener.current!==recognition)return;
   listener.current=null;clearListeningTimer();setVoicePhase('idle');
   if(!recognized&&!failed)showVoiceError('no-speech','ended-without-result');
  };
  try{
   setVoicePhase('starting');recognition.start();
   // Brave and other Chromium builds can expose SpeechRecognition even when its
   // backend never starts. Detect that separately from missing mic permission.
   listeningTimeout.current=setTimeout(()=>{
    if(listener.current!==recognition)return;
    stopListening();showVoiceError('speech-service','recognition-start-timeout');
   },8000);
  }catch(e){
   listener.current=null;clearListeningTimer();setVoicePhase('idle');
   const code=e instanceof Error?e.name:'start-failed';
   showVoiceError(classifySpeechError(code),code);
  }
 };
 const focusWindowsDictation=()=>{
  questionInput.current?.focus();
  setWarning(language==='hi'?'टेक्स्ट बॉक्स चुन लिया। Windows पर Win + H दबाकर हिंदी में बोलें, फिर Send दबाएँ।':language==='bn'?'লেখার বক্সে ক্লিক করা হয়েছে। Windows-এ Win + H চাপুন, তারপর Send।':'Text field focused. On Windows, press Win + H, dictate, and then Send.');
 };
 const copyEdgeLink=async()=>{
  try{await navigator.clipboard.writeText(window.location.href);setWarning(language==='hi'?'इस पेज का लिंक कॉपी हो गया। Microsoft Edge में पेस्ट करके खोलें।':language==='bn'?'লিংক কপি করা হয়েছে। Microsoft Edge-এ খুলুন।':'Link copied. Paste it into Microsoft Edge and try the microphone there.')}
  catch{setWarning(language==='hi'?'पेज का पता कॉपी करके Microsoft Edge में खोलें।':'Copy the page address and open it in Microsoft Edge.')}
 };
 const updateDraft=<K extends keyof VoiceDraft>(key:K,value:VoiceDraft[K])=>{setDraft(old=>old?{...old,[key]:value}:null);setRecorded(false);setSavedMessage('')};
 const canSave=draft&&Number.isFinite(draft.amount)&&draft.amount!==null&&draft.amount>0&&draft.amount<=10000000&&(draft.intent!=='invoice'||(!!draft.item.trim()&&draft.quantity!==null&&draft.quantity>0));
 const saveDraft=async()=>{
  if(!draft||!canSave||saving||recorded)return;
  setSaving(true);setSavedMessage('');setWarning('');
  const kind=draft.intent==='expense'?'expense':'sale';
  const ok=await shop.add('entries',{entry_date:draft.day,kind,payment_method:draft.method,amount:Number(draft.amount),note:draftNote(draft),source:'manual',provider:null,provider_reference:null,payment_verified_at:null,matched_provider_entry_id:null});
  setSaving(false);
  if(ok){setRecorded(true);setSavedMessage(t.saved);addAgent(t.saved+' '+formatRupees(Number(draft.amount))+' · '+(draft.intent==='expense'?'expense':'sale')+'.', 'daily-hisaab');}
  else setWarning(shop.error||'Could not save entry. Check your connection and try again.');
 };
 const voiceStatus=localMode?
   localPhase==='starting'?(language==='hi'?'माइक की अनुमति ले रहे हैं…':'Requesting microphone…'):
   localPhase==='recording'?(language==='hi'?'आवाज़ रिकॉर्ड हो रही है — रोककर लिखें':'Recording locally — press Stop to transcribe'):
   localPhase==='transcribing'?(localProgress?.message||'Running local Whisper…'):
   '' :
   voicePhase==='starting'?(language==='hi'?'माइक शुरू हो रहा है…':'Starting microphone…'):voicePhase==='listening'?(language==='hi'?'सुन रहे हैं…':'Listening…'):'';
 return <section className="saathi-page" aria-label="Dukaan Saathi chatbot">
  <div className="saathi-hero">
   <div className="saathi-icon" aria-hidden="true"><span className="material-symbols-outlined">support_agent</span><span className="saathi-icon-star">✳</span></div>
   <div className="saathi-hero-copy"><span className="saathi-kicker">✦ VYAPARTRUST · VOICE & SHOP ASSISTANT</span><h2>{t.header}</h2><p>{t.sub}</p></div>
   <span className={'saathi-mode '+(mode==='live'?'is-live':'')}>{mode==='live'?t.live:t.guide}</span>
  </div>
  <div className="saathi-layout">
   <div className="saathi-main">
    <div className="saathi-chat" role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions">
     {messages.length===0&&<div className="saathi-intro">
       <span className="saathi-seal">सा</span><h3>{t.start}</h3>
       <p>{copy.greet} {language==='hi'?'उदाहरण: आज 2 किलो आलू 240 रुपये के बेचे।': 'Try: Aaj 2 kilo aalo beche h 240rs k.'}</p>
       <div className="saathi-question-grid">{[...copy.qs.slice(0,3),language==='hi'?'आज 2 किलो आलू 240 रुपये के बेचे':'Aaj 2 kilo aalo beche h 240rs k'].map(s=><button type="button" key={s} onClick={()=>void ask(s)} disabled={loading}><span className="material-symbols-outlined">auto_awesome</span>{s}</button>)}</div>
     </div>}
     {messages.map(m=><div className={'saathi-message '+(m.role==='user'?'saathi-from-user':'saathi-from-agent')} key={m.id}>
       {m.role==='assistant'&&<span className="saathi-avatar" aria-hidden="true">सा</span>}
       <div className="saathi-message-stack"><div className="saathi-bubble">{m.text}</div>
       {m.role==='assistant'&&<div className="saathi-message-tools">
         <span className="saathi-source">{m.mode==='live'?t.live:t.guide}</span>
         <button type="button" aria-label="Read reply aloud" onClick={()=>speak(m.text,voiceLang)}><span className="material-symbols-outlined">volume_up</span></button>
         {m.route&&m.route!=='none'&&availableRoutes.has(m.route)&&<button type="button" onClick={()=>onNavigate(m.route as NavPath)}><span className="material-symbols-outlined">arrow_forward</span> {routeLabels[m.route as NavPath]||t.header}</button>}
       </div>}</div></div>)}
     {loading&&<div className="saathi-message saathi-from-agent"><span className="saathi-avatar">सा</span><div className="saathi-thinking"><span/><span/><span/> {t.working}</div></div>}
     <div ref={tail}/>
    </div>
    {draft&&<section className="saathi-draft" aria-label={t.review}>
      <div className="saathi-draft-heading"><span className="material-symbols-outlined">{draft.intent==='invoice'?'receipt_long':'edit_note'}</span><div><h3>{draft.intent==='invoice'?t.invoice:t.review}</h3><small>{draft.intent==='expense'?'Expense':draft.intent==='invoice'?'Draft receipt':'Sale'} · {draft.day}</small></div><button type="button" onClick={()=>{setDraft(null);setSavedMessage('')}} aria-label={t.cancel}><span className="material-symbols-outlined">close</span></button></div>
      <div className="saathi-fields">
       <label>{t.item}<input value={draft.item} maxLength={70} placeholder={language==='hi'?'जैसे आलू':'e.g. Aloo'} onChange={e=>updateDraft('item',e.target.value)}/></label>
       <label>{t.quantity}<input type="number" min=".01" max="100000" step=".01" value={draft.quantity??''} placeholder="—" onChange={e=>updateDraft('quantity',e.target.value===''?null:Number(e.target.value))}/></label>
       <label>{language==='hi'?'इकाई':'Unit'}<select value={draft.unit||'pcs'} onChange={e=>updateDraft('unit',e.target.value as VoiceUnit)}><option value="kg">kg</option><option value="litres">litres</option><option value="pcs">pcs</option><option value="packs">packs</option><option value="boxes">boxes</option></select></label>
       <label>{t.amount}<input type="number" min=".01" max="10000000" step=".01" value={draft.amount??''} placeholder="₹" onChange={e=>updateDraft('amount',e.target.value===''?null:Number(e.target.value))}/></label>
       <label>{t.method}<select value={draft.method} onChange={e=>updateDraft('method',e.target.value as ManualMethod)}><option value="Cash">Cash</option><option value="UPI">UPI (manual)</option><option value="Bank">Bank (manual)</option><option value="Other">Other</option></select></label>
      </div>
      <p className="saathi-draft-hint">{t.hint} {t.edit} {shop.demo?t.demo:''}</p>
      {savedMessage&&<p className="saathi-draft-saved" role="status">{savedMessage}</p>}
      <div className="saathi-draft-actions">
       <button className="saathi-confirm" type="button" disabled={!canSave||saving||recorded} onClick={()=>void saveDraft()}><span className="material-symbols-outlined">check_circle</span>{saving?'Saving…':recorded?t.saved:t.record}</button>
       {draft.intent==='invoice'&&<button type="button" className="saathi-print" onClick={()=>window.print()} disabled={!canSave||draft.quantity===null||draft.quantity<=0}><span className="material-symbols-outlined">print</span>{t.print}</button>}
       <button type="button" className="saathi-discard" onClick={()=>{setDraft(null);setSavedMessage('')}}>{t.cancel}</button>
      </div>
    </section>}
    {warning&&<p className="saathi-notice" role="status"><span className="material-symbols-outlined">info</span>{warning}</p>}
    {(isBrave()||voiceProblem!=='none'||micResult||voicePhase!=='idle'||localPhase!=='idle')&&<div className="saathi-mic-help" role="region" aria-label="Microphone troubleshooting">
       {(voicePhase!=='idle'||localPhase!=='idle')?<p><span className="material-symbols-outlined">graphic_eq</span>{voiceStatus}{localProgress?.percent!==undefined?' · '+localProgress.percent+'%':''}</p>:
         <p><span className="material-symbols-outlined">info</span>{isBrave()?(localMode?(language==='hi'?'Brave के लिए Whisper चुना गया है — ऑडियो इसी ब्राउज़र में पहचाना जाएगा।':language==='bn'?'Brave-এর জন্য Whisper সক্রিয়: অডিও এই ব্রাউজারেই শনাক্ত হবে।':'Brave detected: private on-device Whisper is enabled instead of Brave’s failing speech service.'):(language==='hi'?'Brave की ऑनलाइन स्पीच सेवा काम नहीं कर सकती। ऑफ़लाइन Whisper चालू करें।':'Brave speech recognition may fail; enable local Whisper.')):(voiceProblem==='none'?'Speech recognition support depends on your browser.':'Speech recognition needs attention.')}</p>}
       {localMode&&<p><span className="material-symbols-outlined">shield</span>{language==='hi'?'Whisper मॉडल पहली बार इंटरनेट से डाउनलोड होगा; उसके बाद आवाज़ आपके ब्राउज़र में पहचानी जाएगी। छोटी रिकॉर्डिंग बोलें, फिर Stop दबाएँ।':language==='bn'?'মডেল প্রথমে ডাউনলোড হবে, তারপর অডিও এই ব্রাউজারেই ট্রান্সক্রাইব হবে।':'First use downloads a multilingual Whisper model; audio stays in your browser. Speak briefly and press Stop to transcribe.'}</p>}
       {micResult?.ok&&<p className="saathi-mic-success"><span className="material-symbols-outlined">check_circle</span>{language==='hi'?'माइक टेस्ट सफल':'Microphone test passed'} · {micResult.details}</p>}
       <div className="saathi-mic-help-actions">
         <button type="button" onClick={()=>void checkMicrophone()} disabled={testingMic||voicePhase!=='idle'||localPhase!=='idle'}><span className="material-symbols-outlined">settings_voice</span>{testingMic?(language==='hi'?'माइक जाँच रहे हैं…':'Checking microphone…'):(language==='hi'?'माइक टेस्ट करें':'Test microphone')}</button>
         <button type="button" onClick={focusWindowsDictation}><span className="material-symbols-outlined">keyboard_voice</span>{language==='hi'?'Windows Win + H':'Windows dictation (Win + H)'}</button>
         {isBrave()&&<button type="button" onClick={()=>void copyEdgeLink()}><span className="material-symbols-outlined">open_in_new</span>{language==='hi'?'Edge के लिए लिंक कॉपी':'Copy link for Edge'}</button>}
       </div>
     </div>}
    {voiceReview&&<section className={'saathi-transcript '+(voiceReview.uncertain?'saathi-transcript-uncertain':'')} aria-label="Review voice transcription">
      <div className="saathi-transcript-title"><span className="material-symbols-outlined">{voiceReview.uncertain?'hearing_disabled':'record_voice_over'}</span>
        <div><strong>{language==='hi'?'क्या मैंने सही सुना?':language==='bn'?'আমি কি ঠিক শুনেছি?':'Did I hear you correctly?'}</strong>
        <small>{voiceReview.uncertain?(language==='hi'?'आवाज़ साफ़ नहीं समझी — टेक्स्ट बदलें या फिर बोलें।':'Low-confidence recognition: edit or record again.'):(language==='hi'?'जाँचकर भेजें — अभी कोई जवाब या हिसाब नहीं लिखा गया।':'Review before sending. Nothing has been saved or answered.')}</small></div>
      </div>
      <textarea aria-label="Edit recognized words" rows={2} value={voiceReview.text} onChange={e=>setVoiceReview(old=>old?{text:e.target.value,uncertain:false}:null)}/>
      <div className="saathi-transcript-actions">
        <button className="saathi-transcript-send" type="button" disabled={!voiceReview.text.trim()||loading||saving} onClick={applyVoiceReview}><span className="material-symbols-outlined">send</span>{language==='hi'?'सही है — भेजें':'Looks right — send'}</button>
        <button type="button" onClick={()=>{setVoiceReview(null);setQuestion('');void startLocal()}} disabled={localPhase!=='idle'}><span className="material-symbols-outlined">replay</span>{language==='hi'?'फिर से बोलें':'Record again'}</button>
        <button type="button" onClick={()=>setVoiceReview(null)}><span className="material-symbols-outlined">close</span>{language==='hi'?'हटाएँ':'Discard'}</button>
      </div>
     </section>}
    <div className="saathi-voicebar">
      <button className={'saathi-mic '+(localPhase==='recording'||voicePhase==='listening'?'listening':'')} type="button" onClick={toggleListen} disabled={loading||saving||testingMic||localPhase==='transcribing'||localPhase==='starting'} aria-pressed={localMode?localPhase==='recording':voicePhase!=='idle'} aria-label={localMode?localPhase==='recording'?'Stop and transcribe':t.voice:voicePhase!=='idle'?t.voiceOff:t.voice}><span className="material-symbols-outlined">{localMode&&localPhase==='recording'||!localMode&&voicePhase!=='idle'?'stop_circle':'mic'}</span>{localMode&&localPhase==='recording'?'Stop & transcribe / लिखें':!localMode&&voicePhase!=='idle'?'Stop / बंद करें':localMode?'Record Hindi / हिंदी बोलें':t.voice}<span className="saathi-voice-bars" aria-hidden="true">▂▅▃</span></button>
      <label className="saathi-voice-mode"><input type="checkbox" checked={localMode} disabled={localPhase!=='idle'||voicePhase!=='idle'} onChange={e=>{if(!e.target.checked)cancelLocal();setLocalMode(e.target.checked);setWarning('')}}/><span>{language==='hi'?'ब्राउज़र में ऑफ़लाइन Whisper':language==='bn'?'ব্রাউজারে স্থানীয় Whisper':'Private on-device Whisper'}</span></label>
      <label className="saathi-voice-locale"><span className="sr-only">Voice language</span><select aria-label="Voice language" value={voiceLang} onChange={e=>setVoiceLang(e.target.value as 'hi-IN'|'en-IN'|'bn-IN')}><option value="hi-IN">हिंदी</option><option value="en-IN">English</option><option value="bn-IN">বাংলা</option></select></label>
      <label className="saathi-read-check"><input type="checkbox" checked={readReplies} onChange={e=>{setReadReplies(e.target.checked);if(!e.target.checked)stopSpeech()}}/><span className="material-symbols-outlined">volume_up</span><span>{t.read}</span></label>
    </div>
    <form className="saathi-composer" onSubmit={e=>{e.preventDefault();void ask(question)}}>
      <label className="sr-only" htmlFor="saathi-question">{t.ask}</label>
      <textarea ref={questionInput} id="saathi-question" rows={2} maxLength={1000} value={question} onChange={e=>setQuestion(e.target.value)}
       onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void ask(question)}}} placeholder={t.ask} disabled={loading||saving}/>
      <button type="submit" className="saathi-send" disabled={loading||saving||!question.trim()} aria-label={t.send}><span className="material-symbols-outlined">arrow_upward</span></button>
    </form>
    <p className="saathi-disclaimer">{t.tip} {localMode?(language==='hi'?'Whisper मॉडल इंटरनेट से डाउनलोड होता है; आपके रिकॉर्ड किए हुए ऑडियो इसी ब्राउज़र में रहते हैं।':'Whisper model files download from Hugging Face; recorded audio stays in this browser.'):t.voiceData}</p>
   </div>
   <aside className="saathi-side" aria-label="Assistant options">
     <div className="saathi-side-section"><div className="saathi-side-heading"><span className="material-symbols-outlined">lightbulb</span><h3>{t.quick}</h3></div>
       {[...copy.qs,'invoice banado','kitna kharch hua'].map(q=><button type="button" disabled={loading} className="saathi-quick" key={q} onClick={()=>void ask(q)}>{q}<span className="material-symbols-outlined">north_east</span></button>)}
     </div>
     <div className="saathi-side-section saathi-privacy">
       <div className="saathi-side-heading"><span className="material-symbols-outlined">shield</span><h3>{language==='hi'?'मेरे डेटा की सुरक्षा':language==='bn'?'আমার তথ্যের সুরক্ষা':'Your data, your choice'}</h3></div>
       <label className="saathi-switch-row"><input type="checkbox" checked={personal} disabled={shop.demo} onChange={e=>setPersonal(e.target.checked)}/><span>{t.personal}</span></label><p>{t.priv}</p>
     </div>
     <button type="button" className="saathi-clear" onClick={clear} disabled={loading||saving||messages.length===0}><span className="material-symbols-outlined">delete_sweep</span>{t.clear}</button>
     <button type="button" className="saathi-back" onClick={()=>onNavigate('overview')}><span className="material-symbols-outlined">arrow_back</span>{language==='hi'?'मेरी दुकान':language==='bn'?'আমার দোকান':'My Dukaan'}</button>
   </aside>
  </div>
  {draft?.intent==='invoice'&&<article id="saathi-print-receipt" aria-label="Receipt draft">
    <h2>{merchant?.storeName||'My Dukaan'}</h2><p>DRAFT SALE RECEIPT · NOT A GST TAX INVOICE</p><hr/><p>Date: {draft.day}</p><p>Item: {draft.item||'—'}</p><p>Quantity: {draft.quantity||'—'} {draft.unit||'pcs'}</p><p>Payment: {draft.method} (self-reported)</p><h3>Total: {formatRupees(Number(draft.amount||0))}</h3><hr/><small>{recorded?'Entered in shop Hisaab':'Not yet entered in Hisaab'} · Draft record for customer reference only</small>
  </article>}
 </section>;
}
