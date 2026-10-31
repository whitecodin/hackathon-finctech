import type {VoiceLanguage} from './localWhisper.ts';
export type VoiceReview={quality:'clear'|'uncertain'|'empty';reason:'empty'|'too-short'|'unclear'|'unexpected-language'|'no-app-intent'|'ok';transcript:string};
const helpTerms=/\b(?:hisaab|hisab|udhar|kharcha?|spent|spend|expenses?|sales?|sold|sell|cash|upi|amount|rs|rupees|received|pay(?:ment)?|stock|loan|invoice|bill|rice|aloo|aalo|aalu|aaloo|potato|beche?|becha|bikri|paise|rupaye|paisa|kilo|kg|buy|bought|khareed|kirana|mohalla|bazaar|profit|supplier|money|microphone|vyapar|saathi|record|reorder|receipt|forecast|inventory|supplier|payment)\b|[\u0900-\u097F\u0980-\u09FF]/iu;
const disallowed=/\b(?:thanks for watching|subscribe to my channel|please like|please subscribe|copyright|subtitles by|amara\.org|thank you for watching)\b/iu;
export function reviewTranscript(raw:string,language:VoiceLanguage):VoiceReview{
 const text=raw.normalize('NFKC').replace(/\s+/g,' ').trim().slice(0,1000);
 const clean=text.replace(/[\p{P}\p{S}\s]/gu,'');
 if(clean.length===0)return{quality:'empty',reason:'empty',transcript:text};
 if(clean.length<3||(/^\W*\d+\W*$/u.test(text)&&clean.length<3))return{quality:'uncertain',reason:'too-short',transcript:text};
 if(disallowed.test(text)||/([a-zA-Z\u0900-\u097F])\1{6,}/u.test(text))return{quality:'uncertain',reason:'unclear',transcript:text};
 const tokens=text.toLocaleLowerCase().split(/\s+/u).map(w=>w.replace(/[\p{P}\p{S}]/gu,'')).filter(Boolean);
 if(tokens.length>=4){
  const counts=new Map<string,number>();
  for(const token of tokens)counts.set(token,(counts.get(token)||0)+1);
  if(Math.max(...counts.values())/tokens.length>=0.6)return{quality:'uncertain',reason:'unclear',transcript:text};
 }
 // For the Hindi/English shop commands, short prose with zero relevant shop words
 // is much likelier to be an ASR hallucination than actionable business input.
 if(!helpTerms.test(text))return{quality:'uncertain',reason:'no-app-intent',transcript:text};
 // Hindi-mode ASR sometimes outputs fully English sentences unrelated to any
 // Indian shop words. Flag them rather than silently acting on them.
 if(language==='hi-IN'&&/^[\x00-\x7F]+$/.test(text)&&/\b(?:i have been|i['’]ve been|i can get|you know|in my voice|been in voice|jambi)\b/i.test(text)){
  return {quality:'uncertain',reason:'unexpected-language',transcript:text};
 }
 return {quality:'clear',reason:'ok',transcript:text};
}
export function voiceActivitySummary(pcm:Float32Array):{rms:number;peak:number;activeRatio:number;seconds:number}{
 if(!pcm.length)return{rms:0,peak:0,activeRatio:0,seconds:0};
 let power=0,peak=0,active=0,frames=0;
 const frame=320;
 for(let offset=0;offset<pcm.length;offset+=frame){
  const end=Math.min(pcm.length,offset+frame);
  let framePower=0;
  for(let i=offset;i<end;i++){
   const sample=pcm[i];power+=sample*sample;framePower+=sample*sample;peak=Math.max(peak,Math.abs(sample));
  }
  const frameRms=Math.sqrt(framePower/(end-offset));
  if(frameRms>=0.006)active++;
  frames++;
 }
 return {rms:Math.sqrt(power/pcm.length),peak,activeRatio:active/frames,seconds:pcm.length/16000};
}
export function audioIsClearEnough(summary:ReturnType<typeof voiceActivitySummary>):boolean{
 return summary.seconds>=1&&summary.peak>=0.016&&summary.rms>=0.0025&&summary.activeRatio>=0.035;
}
