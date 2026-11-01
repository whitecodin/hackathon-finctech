import {parseStatementCsv,sameDayPaymentCandidates,forecastSevenDays} from '../src/lib/operations.ts';
const rows=parseStatementCsv('Date,Direction,Amount,Reference,Description\n2026-10-28,credit,2480,REF1,"Customer, daily sale"\n2026-10-28,debit,750,REF2,Supplies');
if(rows.length!==2||rows[0].description!=='Customer, daily sale')throw Error('CSV quote parsing failed');
let rejected=0;for(const csv of [
 'Date,Direction,Amount,Reference,Description\n28/10/26,credit,100,R,X',
 'Date,Direction,Amount,Reference,Description\n2026-10-28,credit,-10,R,X',
 'Date,Direction,Amount,Reference,Description\n2026-02-30,credit,10,R,X'
]){try{parseStatementCsv(csv)}catch{rejected++}}
if(rejected!==3)throw Error('Invalid records were not rejected');
const matches=sameDayPaymentCandidates(rows[0],[{id:'good',entry_date:'2026-10-28',kind:'sale',payment_method:'UPI',amount:2480},{id:'cash',entry_date:'2026-10-28',kind:'sale',payment_method:'Cash',amount:2480},{id:'wrong',entry_date:'2026-10-28',kind:'expense',payment_method:'UPI',amount:2480}]);
if(matches.length!==1||matches[0].id!=='good')throw Error('Matching rule failed');
const history=[];for(let i=0;i<28;i++)history.push({moved_on:new Date(Date.parse('2026-10-31T00:00:00Z')-i*86400000).toISOString().slice(0,10),movement_kind:'sold',quantity:3,stock_id:'item'});
const forecast=forecastSevenDays(history,'2026-10-31');
if(forecast.confidence!=='observational'||forecast.projectedSeven!==21||forecast.daysCovered!==28)throw Error('Real-data forecast invalid '+JSON.stringify(forecast));
const insufficient=forecastSevenDays(history.slice(0,3),'2026-10-31');
if(insufficient.confidence!=='insufficient')throw Error('Forecast should be withheld');
console.log(JSON.stringify({csvRows:rows.length,rejectedBadRows:rejected,matched:matches.length,sevenDayForecast:forecast.projectedSeven,confidence:forecast.confidence,lowHistory:insufficient.confidence}));
