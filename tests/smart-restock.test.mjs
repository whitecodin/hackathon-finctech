import {analyzeRestockCycles,validateCheckpoint} from '../src/lib/restockInsights.ts';
import {parseStockVoice} from '../src/lib/stockVoice.ts';
import {saathiGuide} from '../src/lib/saathiGuide.ts';

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
const result=analyzeRestockCycles(history,'aloo',today);
if(result.confidence!=='early'||result.completedCycles!==2)throw Error('Should learn after 2 cycles '+JSON.stringify(result));
if(Math.abs(result.dailyRate-2.25)>0.001)throw Error('Expected midpoint median rate '+JSON.stringify(result));
if(result.estimatedRemaining!==0.75||result.daysUntilEmpty!==1||result.suggestedOrder!==36)throw Error('Expected runout and 16-day reorder '+JSON.stringify(result));
const before=analyzeRestockCycles(history.slice(0,3),'aloo',today);
if(before.dailyRate!==null||before.suggestedOrder!==null||before.confidence!=='learning')throw Error('No confident forecast from a single cycle');
const x=analyzeRestockCycles([...history,evt('f',0,'stockout',null)],'aloo',today);
if(x.suggestedOrder===null||x.daysUntilEmpty!==null)throw Error('Finish should set next runout unknown '+JSON.stringify(x));
if(!validateCheckpoint('restocked',20)||validateCheckpoint('restocked',-2)||validateCheckpoint('stockout',20))throw Error('validation failed');
const stocks=[{id:'aloo',item_name:'Aloo',unit:'kg',quantity:10,reorder_at:5,last_cost:20,merchant_id:7}];
const actions=[
 ['आज आलू खत्म हो गए','stockout',null],
 ['aaj aloo khatam ho gaya','stockout',null],
 ['20 kilo aloo aaye','restocked',20],
 ['आज 20 किलो आलू आए','restocked',20],
 ['Aloo restocked 5kg','restocked',5]
];
for(const [q,k,n] of actions){const got=parseStockVoice(q,stocks);if(!got||got.kind!==k||got.quantity!==n)throw Error('Voice failed: '+q+' => '+JSON.stringify(got));}
for(const q of ['How many kilos aloo should I order?','आज 2 किलो आलू बेचे','आलू कितने रुपये में','15 litres aloo arrived','20 किलो चावल आए']){
 if(parseStockVoice(q,stocks)!==null)throw Error('Unsafe voice command '+q);
}
const snapshot={entries:[],contacts:[],dues:[],stock:stocks,stockCycles:history,isDemo:true};
const guide=saathiGuide('aloo next kab khatam hoga aur kitna mangana','hi',snapshot);
if(guide.route!=='stock'||!guide.answer.includes('2.25')||!guide.answer.includes('36'))throw Error('Guide not personalized: '+guide.answer);
console.log('Smart Restock tests passed: 2-cycle threshold, median, late stockout, quantities, Hindi voice and shop-specific assistant.');
