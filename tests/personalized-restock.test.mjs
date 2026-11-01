import {analyzeRestockCycles,validateCheckpoint} from '../src/lib/restockInsights.ts';
const today='2026-11-01';
const evt=(id,offset,kind,qty)=>{
 const d=new Date(Date.parse(today+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);
 return {id,merchant_id:7,stock_id:'aloo',event_type:kind,quantity:qty,reported_on:d,created_at:d+'T10:00:00Z'};
};
const history=[
 evt('a',-55,'restocked',40),evt('b',-35,'stockout',null),
 evt('c',-34,'restocked',50),evt('d',-14,'stockout',null),
 evt('e',-13,'restocked',30)
];
const initial=analyzeRestockCycles(history,'aloo',today);
if(initial.dailyRate!==2.25||initial.suggestedOrder!==36||initial.reorderOn!=='2026-10-31')throw Error('Default forecast changed '+JSON.stringify(initial));
const custom=analyzeRestockCycles(history,'aloo',today,{leadDays:7,planDays:21,bufferDays:5});
if(custom.reorderOn!=='2026-10-26'||custom.suggestedOrder!==58||!custom.orderNow||!custom.earliestRunoutOn||!custom.latestRunoutOn)throw Error('Custom planning failed '+JSON.stringify(custom));
const learning=analyzeRestockCycles(history.slice(0,2),'aloo',today,{leadDays:10});
if(learning.suggestedOrder!==null||learning.orderNow)throw Error('Premature forecast');
const other=analyzeRestockCycles(history,'rice',today);
if(other.dailyRate!==null)throw Error('Cross-item data leak');
const trend=[
 evt('a',-110,'restocked',40),evt('b',-90,'stockout',null),
 evt('c',-89,'restocked',40),evt('d',-69,'stockout',null),
 evt('e',-68,'restocked',60),evt('f',-48,'stockout',null),
 evt('g',-47,'restocked',70),evt('h',-27,'stockout',null),
 evt('i',-15,'restocked',50)
];
const trained=analyzeRestockCycles(trend,'aloo',today);
if(trained.trend!=='rising'||trained.confidence!=='developing'||!(trained.dailyRate>2.5))throw Error('Adaptation failed '+JSON.stringify(trained));
if(!validateCheckpoint('restocked',20)||validateCheckpoint('restocked',-1))throw Error('Unsafe quantity accepted');
console.log('Personalized restock tests passed: default compatibility, per-merchant settings, prediction band, lead time, trend and learning safeguards');
