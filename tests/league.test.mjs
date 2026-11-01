import {DEMO_SHOPS,DEMO_TRANSACTIONS,demoLeague,shopStats} from '../src/demo/data.ts';
const scopes=['local','city','district','state'];
const expected=[6,12,16,28];
const results=scopes.map((scope,i)=>{
 const rows=demoLeague(scope,'activity');const growth=demoLeague(scope,'growth');
 if(rows.length!==expected[i]||growth.length!==expected[i])throw Error(scope+': wrong cohort');
 if(rows.some((r,j)=>r.rank!==j+1)||growth.some((r,j)=>r.rank!==j+1))throw Error(scope+': rankings not sequential');
 if(rows.some((r,j)=>j>0 && rows[j-1].averageDailyGross<r.averageDailyGross))throw Error(scope+': activity sort wrong');
 if(growth.some((r,j)=>j>0 && growth[j-1].growthPercent<r.growthPercent))throw Error(scope+': growth sort wrong');
 const boosted=demoLeague(scope,'activity',300000);
 if(boosted.find(r=>r.self).rank>rows.find(r=>r.self).rank)throw Error(scope+': boosted sale lowered rank');
 return {scope,peers:rows.length,activityRank:rows.find(r=>r.self).rank,growthRank:growth.find(r=>r.self).rank};
});
if(DEMO_SHOPS.length!==28||DEMO_TRANSACTIONS.length!==5880||new Set(DEMO_TRANSACTIONS.map(r=>r.id)).size!==5880)throw Error('Dataset invalid');
console.log(JSON.stringify({shops:DEMO_SHOPS.length,transactions:DEMO_TRANSACTIONS.length,flagged:DEMO_TRANSACTIONS.filter(r=>r.flagged).length,results},null,2));
