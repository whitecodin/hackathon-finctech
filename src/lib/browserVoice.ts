export type SpeechResult={results:ArrayLike<ArrayLike<{transcript:string;confidence:number}> & {isFinal:boolean}>};
export type SpeechError={error:string;message?:string};
export type SpeechListener={
 lang:string;interimResults:boolean;continuous:boolean;
 onstart:(()=>void)|null;
 onaudiostart:(()=>void)|null;
 onresult:((event:SpeechResult)=>void)|null;
 onerror:((event:SpeechError)=>void)|null;
 onend:(()=>void)|null;
 start:()=>void;stop:()=>void;abort:()=>void;
};
type SpeechConstructor=new()=>SpeechListener;
type SpeechWindow=Window&{SpeechRecognition?:SpeechConstructor;webkitSpeechRecognition?:SpeechConstructor};
type BraveNavigator=Navigator&{brave?:{isBrave?:()=>Promise<boolean>}};
export type VoiceProblem='none'|'insecure'|'unsupported'|'blocked'|'no-device'|'device-busy'|'speech-service'|'network'|'no-speech'|'language'|'already-starting'|'unknown';
export const voiceAvailable=()=>typeof window!=='undefined'&&!!((window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition);
export const isBrave=()=>typeof navigator!=='undefined'&&Boolean((navigator as BraveNavigator).brave);
export const voiceIsSecure=()=>typeof window!=='undefined'&&window.isSecureContext===true;
export const createListener=():SpeechListener|null=>{
 if(!voiceAvailable())return null;
 const w=window as SpeechWindow,Class=w.SpeechRecognition||w.webkitSpeechRecognition;
 try{return Class?new Class():null}catch{return null}
};
export const classifySpeechError=(error:string):VoiceProblem=>{
 switch(error){
  case 'not-allowed':return 'blocked';
  case 'service-not-allowed':return 'speech-service';
  case 'audio-capture':return 'no-device';
  case 'network':return 'network';
  case 'language-not-supported':return 'language';
  case 'no-speech':return 'no-speech';
  case 'aborted':return 'none';
  case 'InvalidStateError':return 'already-starting';
  case 'NotAllowedError':case 'SecurityError':return 'blocked';
  case 'NotFoundError':return 'no-device';
  case 'NotReadableError':case 'AbortError':return 'device-busy';
  case 'NotSupportedError':return 'unsupported';
  default:return 'unknown';
 }
};
export type MicDiagnostic={ok:boolean;problem:VoiceProblem;details:string};
export async function testMicrophone():Promise<MicDiagnostic>{
 if(!voiceIsSecure())return {ok:false,problem:'insecure',details:'The page needs HTTPS or localhost.'};
 if(typeof navigator==='undefined'||!navigator.mediaDevices?.getUserMedia)return {ok:false,problem:'unsupported',details:'Browser MediaDevices API not available.'};
 let stream:MediaStream|undefined;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
  const track=stream.getAudioTracks()[0];
  if(!track)return {ok:false,problem:'no-device',details:'No microphone audio track returned.'};
  return {ok:true,problem:'none',details:track.label||'Microphone connected'};
 }catch(e){
  const name=e instanceof Error?e.name:'unknown';
  return {ok:false,problem:classifySpeechError(name),details:name};
 }finally{stream?.getTracks().forEach(track=>track.stop())}
}
export function describeVoiceProblem(problem:VoiceProblem,language:'en'|'hi'|'bn',brave=isBrave()):string{
 const hints={
  en:{
   none:'',insecure:'Microphone access needs HTTPS or the local http://127.0.0.1 address.',
   unsupported:'This browser cannot use the required speech API. Try Microsoft Edge or Google Chrome, or use Windows voice typing (Win + H).',
   blocked:'Microphone permission was blocked. Click the icon beside the website address, allow Microphone, then retry. Also check Windows Settings → Privacy & security → Microphone.',
   'no-device':'The browser could not capture microphone audio. Check that a microphone is plugged in, enabled, and chosen in Windows Sound settings.',
   'device-busy':'The microphone is currently unavailable or being used by another application. Close other recording apps and retry.',
   'speech-service':'The browser blocked or could not provide speech recognition, even though the microphone itself may work. Try this page in Edge/Chrome or use Windows voice typing (Win + H).',
   network:'Speech recognition could not reach the browser’s speech service. Check your connection, then try Edge/Chrome or Windows voice typing (Win + H).',
   'no-speech':'No clear speech was heard. Speak closer to the mic and try again.',
   language:'The browser does not support this recognition language. Try Hindi/English in Edge or Chrome.',
   'already-starting':'Speech recognition is already starting. Stop and try again.',
   unknown:'Speech recognition failed. Test microphone access below; Edge/Chrome or Windows voice typing may work.'
  },
  hi:{
   none:'',insecure:'माइक के लिए HTTPS या लोकल http://127.0.0.1 वेबसाइट चाहिए।',
   unsupported:'इस ब्राउज़र में बोलकर लिखने की सुविधा नहीं है। Edge या Chrome खोलें, या Windows पर Win + H दबाकर बोलें।',
   blocked:'माइक की अनुमति बंद है। वेबसाइट के पते के पास आइकन दबाकर Microphone को Allow करें। Windows Settings → Privacy & security → Microphone भी जाँचें।',
   'no-device':'ब्राउज़र को माइक की आवाज़ नहीं मिल रही। Windows Sound settings में सही माइक चुनें।',
   'device-busy':'माइक अभी उपलब्ध नहीं है। दूसरी रिकॉर्डिंग ऐप बंद करके दोबारा कोशिश करें।',
   'speech-service':'ब्राउज़र की आवाज़-पहचान सेवा काम नहीं कर रही। माइक ठीक होने पर भी यह हो सकता है। Edge/Chrome या Windows Win + H से बोलें।',
   network:'आवाज़ पहचानने वाली ब्राउज़र सेवा से संपर्क नहीं हुआ। इंटरनेट जाँचें और Edge/Chrome या Win + H आज़माएँ।',
   'no-speech':'कोई साफ़ आवाज़ नहीं सुनाई दी। माइक के पास बोलकर फिर कोशिश करें।',
   language:'यह भाषा इस ब्राउज़र में नहीं चल रही। Edge/Chrome में हिंदी या English चुनें।',
   'already-starting':'माइक पहले से शुरू हो रहा है। रोककर फिर कोशिश करें।',
   unknown:'आवाज़ पहचानने में दिक्कत आई। नीचे माइक टेस्ट करें। Edge या Windows Win + H आज़माएँ।'
  },
  bn:{
   none:'',insecure:'মাইক্রোফোনের জন্য HTTPS বা http://127.0.0.1 দরকার।',
   unsupported:'এই ব্রাউজারে স্পিচ রিকগনিশন নেই। Edge/Chrome বা Windows Win + H ব্যবহার করুন।',
   blocked:'মাইক্রোফোন অনুমতি বন্ধ। ওয়েবসাইটের পাশে আইকনে ক্লিক করে Microphone Allow দিন। Windows privacy settings-ও পরীক্ষা করুন।',
   'no-device':'ব্রাউজার মাইক্রোফোন থেকে শব্দ পাচ্ছে না। Windows Sound settings দেখুন।',
   'device-busy':'মাইক্রোফোন ব্যস্ত বা অনুপলব্ধ। অন্য রেকর্ডিং অ্যাপ বন্ধ করুন।',
   'speech-service':'ব্রাউজারের স্পিচ সার্ভিস কাজ করছে না; মাইক্রোফোন ঠিক থাকলেও এটি হতে পারে। Edge/Chrome বা Win + H ব্যবহার করুন।',
   network:'স্পিচ সার্ভিসে সংযোগ হচ্ছে না। ইন্টারনেট ও Edge/Chrome পরীক্ষা করুন।',
   'no-speech':'কথা শোনা যায়নি। মাইকের কাছে বলে আবার চেষ্টা করুন।',
   language:'এই ভাষা ব্রাউজারে সমর্থিত নয়। Edge বা Chrome ব্যবহার করুন।',
   'already-starting':'শোনা ইতিমধ্যে শুরু হচ্ছে। বন্ধ করে আবার চেষ্টা করুন।',
   unknown:'ভয়েস সেবা কাজ করেনি। নিচে মাইক্রোফোন পরীক্ষা করুন।'
  }
 };
 const base=hints[language][problem];
 if(!base)return '';
 return brave&&['speech-service','network','unsupported','unknown'].includes(problem)?base+' '+(language==='hi'?'Brave में यह दिक्कत आम है।':language==='bn'?'Brave-এ এই সমস্যা দেখা যায়।':'Brave has known Web Speech compatibility problems.'):base;
}
export const speak=(text:string,locale:string,onEnd?:()=>void):boolean=>{
 if(typeof window==='undefined'||!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return false;
 window.speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(text.slice(0,700));
 utterance.lang=locale;utterance.rate=0.92;utterance.pitch=1;
 const voices=window.speechSynthesis.getVoices();
 const matched=voices.find(v=>v.lang.toLowerCase()===locale.toLowerCase())||voices.find(v=>v.lang.slice(0,2)===locale.slice(0,2));
 if(matched)utterance.voice=matched;
 utterance.onend=()=>onEnd?.();utterance.onerror=()=>onEnd?.();
 window.speechSynthesis.speak(utterance);
 return true;
};
export const stopSpeech=()=>{if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()};
