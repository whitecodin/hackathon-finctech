import {pipeline} from '@huggingface/transformers';

type Incoming={type:'transcribe';audio:Float32Array;language:string;requestId:number};
type Outgoing={type:'progress'|'result'|'error';requestId:number;percent?:number;status?:string;text?:string;error?:string};
const post=(message:Outgoing)=>(self as unknown as {postMessage:(message:Outgoing)=>void}).postMessage(message);
let currentModel:string|null=null;
let pipeInstance:any=null;
let initializing:Promise<any>|null=null;
const getPipe=(language:string,id:number)=>{
 // Hindi and Bengali get the larger multilingual model for better word recognition.
 // English still uses the smaller, faster model.
 const model=language==='en-IN'?'onnx-community/whisper-tiny':'onnx-community/whisper-base';
 if(model!==currentModel){currentModel=model;pipeInstance=null;initializing=null}
 if(pipeInstance)return Promise.resolve(pipeInstance);
 if(!initializing){
   initializing=pipeline('automatic-speech-recognition',model,{
     device:'wasm',dtype:'q8',
     progress_callback:(p:Record<string,unknown>)=>{
       const percent=typeof p.progress==='number'?Math.round(p.progress):undefined;
       post({type:'progress',requestId:id,percent,status:String(p.status||'Loading the speech model')});
     }
   }).then(pipe=>pipeInstance=pipe).catch(e=>{initializing=null;throw e});
 }
 return initializing;
};
self.onmessage=async(event:MessageEvent<Incoming>)=>{
 const input=event.data;
 if(input?.type!=='transcribe')return;
 try{
   if(input.audio.length<16000||input.audio.length>16000*22)throw Error('Record a clear 1–20 second sentence.');
   const asr=await getPipe(input.language,input.requestId);
   post({type:'progress',requestId:input.requestId,status:'Recognizing '+(input.language==='hi-IN'?'Hindi':input.language==='bn-IN'?'Bengali':'English')+' on your device'});
   const generated=await asr(input.audio,{
     language:input.language==='hi-IN'?'hindi':input.language==='bn-IN'?'bengali':'english',
     task:'transcribe',
     return_timestamps:false,
     condition_on_prev_tokens:false,
     max_new_tokens:110
   });
   const text=Array.isArray(generated)?generated.map((part:any)=>String(part.text||'')).join(' '):String(generated?.text||'');
   post({type:'result',requestId:input.requestId,text:text.trim()});
 }catch(e){post({type:'error',requestId:input.requestId,error:e instanceof Error?e.message:'Unable to transcribe speech'})}
};