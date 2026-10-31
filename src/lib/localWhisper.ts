/* Privacy-conscious audio fallback for browsers whose Web Speech service fails.
 * Audio samples stay in this browser; only Whisper model weights are downloaded.
 * Model: onnx-community/whisper-tiny (multilingual) via Transformers.js.
 */
export type VoiceLanguage='hi-IN'|'en-IN'|'bn-IN';
export type LocalProgress={percent?:number;message:string};
export interface LocalRecorder {stop:()=>Promise<Float32Array>;cancel:()=>void}
export function localMicSupported():boolean{
 return typeof window!=='undefined'&&typeof MediaRecorder!=='undefined'&&
  !!navigator.mediaDevices?.getUserMedia&&typeof AudioContext!=='undefined'&&window.isSecureContext;
}
export const localRecordingLimitMs=15000;
export async function beginLocalRecording():Promise<LocalRecorder>{
 if(!localMicSupported())throw Error('Microphone recording is not supported in this browser or insecure page.');
 const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
 let media:MediaRecorder;
 try{
  const mimeTypes=['audio/webm;codecs=opus','audio/webm','audio/mp4'];
  const chosen=mimeTypes.find(type=>MediaRecorder.isTypeSupported(type));
  media=new MediaRecorder(stream,chosen?{mimeType:chosen}:undefined);
 }catch(e){stream.getTracks().forEach(t=>t.stop());throw e}
 const chunks:Blob[]=[];
 let cancelled=false;
 let stopped=false;
 let settle:(b:Blob)=>void=()=>{};
 let fail:(e:Error)=>void=()=>{};
 const result=new Promise<Blob>((resolve,reject)=>{settle=resolve;fail=reject});
 media.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 media.onerror=()=>fail(new Error('Could not record microphone audio.'));
 media.onstop=()=>{
  stream.getTracks().forEach(t=>t.stop());
  if(cancelled){fail(new Error('Recording cancelled'));return}
  settle(new Blob(chunks,{type:media.mimeType||'audio/webm'}));
 };
 try{media.start(250)}catch(e){stream.getTracks().forEach(t=>t.stop());throw e}
 return {
  stop:async()=>{
   if(stopped)throw Error('Already stopped');
   stopped=true;
   if(media.state!=='inactive')media.stop();
   const blob=await result;
   if(blob.size<1200)throw Error('Could not hear any recorded audio.');
   const ctx=new AudioContext();
   try{
    const decoded=await ctx.decodeAudioData(await blob.arrayBuffer());
    const sr=decoded.sampleRate;
    const len=decoded.length;
    const channels=Math.max(1,decoded.numberOfChannels);
    const pcm=new Float32Array(len);
    for(let channel=0;channel<channels;channel++){
     const src=decoded.getChannelData(channel);
     for(let i=0;i<len;i++)pcm[i]+=src[i]/channels;
    }
    const targetRate=16000;
    const targetLength=Math.round(pcm.length*targetRate/sr);
    const output=new Float32Array(targetLength);
    for(let i=0;i<targetLength;i++){
     const sampleAt=i*sr/targetRate,index=Math.floor(sampleAt),ratio=sampleAt-index;
     const left=pcm[Math.min(index,pcm.length-1)]||0,right=pcm[Math.min(index+1,pcm.length-1)]||left;
     output[i]=left+(right-left)*ratio;
    }
    return output;
   }finally{await ctx.close()}
  },
  cancel:()=>{cancelled=true;stopped=true;if(media.state!=='inactive')media.stop();stream.getTracks().forEach(t=>t.stop())}
 };
}

let worker:Worker|null=null;
let pending:{resolve:(text:string)=>void;reject:(error:Error)=>void;onProgress:(x:LocalProgress)=>void;id:number;timeout:ReturnType<typeof setTimeout>}|null=null;
let nextId=0;
export function transcribeLocally(audio:Float32Array,language:VoiceLanguage,onProgress:(progress:LocalProgress)=>void):Promise<string>{
 if(pending)return Promise.reject(new Error('A transcription is already running.'));
 if(!worker){
  worker=new Worker(new URL('../workers/whisper.worker.ts',import.meta.url),{type:'module'});
  worker.onmessage=(event:MessageEvent<{type:string;requestId:number;percent?:number;status?:string;text?:string;error?:string}>)=>{
   const info=event.data,current=pending;
   if(!current||info.requestId!==current.id)return;
   if(info.type==='progress'){current.onProgress({percent:info.percent,message:info.status||'Preparing offline speech model'});return}
   clearTimeout(current.timeout);pending=null;
   if(info.type==='result')current.resolve(info.text||'');
   else current.reject(new Error(info.error||'Offline speech recognition failed.'));
  };
  worker.onerror=(e)=>{
   e.preventDefault();
   const current=pending;if(current)clearTimeout(current.timeout);pending=null;worker?.terminate();worker=null;
   current?.reject(new Error('Whisper model could not start. Check the model download and available memory.'));
  };
 }
 const id=++nextId;
 return new Promise<string>((resolve,reject)=>{
  const timeout=setTimeout(()=>{
   if(pending?.id!==id)return;
   pending=null;worker?.terminate();worker=null;
   reject(new Error('Local Whisper was taking too long. Check the model connection or use Windows Win + H.'));
  },210000);
  pending={id,resolve,reject,onProgress,timeout};
  // Browser transfers the PCM buffer, never uploads recorded audio.
  worker?.postMessage({type:'transcribe',requestId:id,language,audio},[audio.buffer]);
 });
}
