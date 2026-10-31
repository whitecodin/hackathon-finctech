/* Merchant-specific forecasts from confirmed restock / stockout observations.
 * No inferred per-sale transactions or claims of real-time inventory.
 */
export type CycleEvent={id:string;merchant_id:number;stock_id:string;event_type:'restocked'|'stockout';quantity:number|null;reported_on:string;created_at:string};
export type CycleConfidence='learning'|'early'|'developing';
export type RestockOptions={leadDays?:number;planDays?:number;bufferDays?:number};
export type RestockInsight={
 confidence:CycleConfidence;completedCycles:number;daysObserved:number[];
 dailyRate:number|null;typicalDays:number|null;
 daysUntilEmpty:number|null;runoutOn:string|null;estimatedRemaining:number|null;
 suggestedOrder:number|null;weekDemand:number|null;
 lastRestockOn:string|null;lastStockoutOn:string|null;
 reorderOn:string|null;daysUntilReorder:number|null;orderNow:boolean;
 earliestRunoutOn:string|null;latestRunoutOn:string|null;
 trend:'rising'|'falling'|'stable'|'insufficient';
 leadDays:number;planDays:number;bufferDays:number;
};
const msDay=86400000;
const parseDate=(x:string)=>Date.parse(x+'T12:00:00Z');
const between=(a:string,b:string)=>Math.round((parseDate(b)-parseDate(a))/msDay);
const datePlus=(day:string,n:number)=>new Date(parseDate(day)+n*msDay).toISOString().slice(0,10);
const round=(n:number)=>Math.round(n*100)/100;
const median=(list:number[]):number=>{
 const arr=[...list].sort((a,b)=>a-b),n=arr.length;
 return n%2?arr[(n-1)/2]:(arr[n/2-1]+arr[n/2])/2;
};
const clampInteger=(v:number|undefined,fallback:number,max:number)=>
 v!==undefined&&Number.isInteger(v)&&v>=0&&v<=max?v:fallback;

export function analyzeRestockCycles(events:CycleEvent[],stockId:string,today:string,options:RestockOptions={}):RestockInsight{
 const leadDays=clampInteger(options.leadDays,2,60);
 const planDays=clampInteger(options.planDays,14,90);
 const bufferDays=clampInteger(options.bufferDays,2,30);
 const history=events.filter(e=>e.stock_id===stockId&&/^\d{4}-\d{2}-\d{2}$/.test(e.reported_on)&&Number.isFinite(parseDate(e.reported_on))&&parseDate(e.reported_on)<=parseDate(today))
  .sort((a,b)=>a.reported_on.localeCompare(b.reported_on)||a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));
 let openedOn:string|null=null,batch=0,lastRestockOn:string|null=null,lastStockoutOn:string|null=null;
 const cycles:{days:number;qty:number;rate:number}[]=[];
 for(const event of history){
  if(event.event_type==='restocked'){
   if(event.quantity===null||!Number.isFinite(event.quantity)||event.quantity<=0)continue;
   if(!openedOn)openedOn=event.reported_on;
   batch+=event.quantity;lastRestockOn=event.reported_on;
  }else if(event.event_type==='stockout'){
   lastStockoutOn=event.reported_on;
   if(openedOn){
    const days=between(openedOn,event.reported_on);
    if(days>=1&&days<=180&&batch>0)cycles.push({days,qty:batch,rate:batch/days});
   }
   openedOn=null;batch=0;
  }
 }
 const recent=cycles.slice(-6),completedCycles=recent.length;
 const base={
  completedCycles,daysObserved:recent.map(c=>c.days),
  typicalDays:completedCycles?round(median(recent.map(c=>c.days))):null,
  lastRestockOn,lastStockoutOn,leadDays,planDays,bufferDays
 };
 if(completedCycles<2)return {
  ...base,confidence:'learning',dailyRate:null,daysUntilEmpty:null,runoutOn:null,
  estimatedRemaining:null,suggestedOrder:null,weekDemand:null,reorderOn:null,
  daysUntilReorder:null,orderNow:false,earliestRunoutOn:null,latestRunoutOn:null,trend:'insufficient'
 };
 const rates=recent.map(c=>c.rate);
 const baseline=median(rates);
 // With four or more batches, cautiously adapt to changes without chasing a single outlier.
 const newest=completedCycles>=4?median(rates.slice(-2)):baseline;
 const oldest=completedCycles>=4?median(rates.slice(0,-2)):baseline;
 const trend=completedCycles<4?'insufficient':newest>oldest*1.15?'rising':newest<oldest*.85?'falling':'stable';
 const dailyRate=completedCycles>=4?
  Math.max(baseline*.75,Math.min(baseline*1.25,baseline*.65+newest*.35)):baseline;
 const elapsed=openedOn?Math.max(0,between(openedOn,today)):null;
 const estimatedRemaining=elapsed!==null?round(Math.max(0,batch-dailyRate*elapsed)):null;
 const rawDays=estimatedRemaining!==null?estimatedRemaining/dailyRate:null;
 const daysUntilEmpty=rawDays!==null?Math.max(0,Math.ceil(rawDays)):null;
 const runoutOn=daysUntilEmpty!==null?datePlus(today,daysUntilEmpty):null;
 // A band based on observed variation; widen it for only two or three observed cycles.
 const rateLow=Math.max(0.001,Math.min(...rates)*(completedCycles<4?.8:.9));
 const rateHigh=Math.max(...rates)*(completedCycles<4?1.2:1.1);
 const earliestRunoutOn=estimatedRemaining!==null?datePlus(today,Math.ceil(estimatedRemaining/rateHigh)):null;
 const latestRunoutOn=estimatedRemaining!==null?datePlus(today,Math.ceil(estimatedRemaining/rateLow)):null;
 const daysUntilReorder=daysUntilEmpty!==null?daysUntilEmpty-leadDays:null;
 const reorderOn=daysUntilReorder!==null?datePlus(today,daysUntilReorder):null;
 // Retain default 14-day coverage + 2-day buffer; merchant may adjust lead and buffer.
 const suggestedOrder=Math.max(0,Math.ceil(dailyRate*(planDays+bufferDays)-(estimatedRemaining??0)));
 return {
  ...base,confidence:completedCycles>=4?'developing':'early',
  dailyRate:round(dailyRate),daysUntilEmpty,runoutOn,estimatedRemaining,
  suggestedOrder,weekDemand:Math.ceil(dailyRate*7),
  reorderOn,daysUntilReorder,orderNow:(daysUntilReorder!==null&&daysUntilReorder<=0)||(!openedOn&&lastStockoutOn!==null),
  earliestRunoutOn,latestRunoutOn,trend
 };
}
export function validateCheckpoint(kind:'stockout'|'restocked',quantity:number|null){
 if(kind==='stockout')return quantity===null;
 return typeof quantity==='number'&&Number.isFinite(quantity)&&quantity>0&&quantity<=100000;
}
