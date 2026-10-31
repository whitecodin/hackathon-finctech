import {indiaDate} from './shopLogic.ts';
export type StatementLine={txn_date:string;direction:'credit'|'debit';amount:number;reference:string;description:string};
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
export function parseStatementCsv(source:string):StatementLine[]{
 if(source.length>1_000_000)throw Error('File exceeds 1 MB');
 // A deliberately strict CSV template: Date,Direction,Amount,Reference,Description.
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(ch==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++}else quoted=!quoted;continue}
  if(ch===','&&!quoted){row.push(cell);cell='';continue}
  if((ch==='\n'||ch==='\r')&&!quoted){
   if(ch==='\r'&&source[i+1]==='\n')i++;
   row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
   row=[];cell='';continue
  }cell+=ch;
 }
 if(quoted)throw Error('CSV has an unclosed quote');
 row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 if(rows.length<2)throw Error('No statement records found');
 const header=rows[0].map(v=>v.toLowerCase().trim().replace(/^\ufeff/,''));
 if(['date','direction','amount','reference','description'].some((h,i)=>header[i]!==h))throw Error('Expected CSV columns: Date,Direction,Amount,Reference,Description');
 if(rows.length>501)throw Error('Import up to 500 rows at a time');
 return rows.slice(1).map((cols,index)=>{
  if(cols.length!==5)throw Error('Row '+(index+2)+' must have five columns');
  const [date,dir,amt,ref,desc]=cols.map(v=>v.trim());
  if(!datePattern.test(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Row '+(index+2)+': date must be YYYY-MM-DD');
  const direction=dir.toLowerCase();
  if(!['credit','debit'].includes(direction))throw Error('Row '+(index+2)+': use credit or debit');
  if(!/^\d+(\.\d{1,2})?$/.test(amt))throw Error('Row '+(index+2)+': invalid amount');
  const amount=Number(amt);
  if(amount<=0||amount>100000000)throw Error('Row '+(index+2)+': amount outside allowed range');
  if(ref.length>140||desc.length>240)throw Error('Row '+(index+2)+': description too long');
  return {txn_date:date,direction:direction as 'credit'|'debit',amount,reference:ref,description:desc};
 });
}
export function sameDayPaymentCandidates(line:StatementLine,entries:{id:string;entry_date:string;kind:string;payment_method:string;amount:number}[],used:Set<string>=new Set()){
 const days=(date:string)=>Math.floor(Date.parse(date+'T00:00:00Z')/86400000);
 return entries.filter(x=>!used.has(x.id)&&['Bank','UPI'].includes(x.payment_method)&&Math.abs(days(x.entry_date)-days(line.txn_date))<=2&&
 Math.round(x.amount*100)===Math.round(line.amount*100)&&((line.direction==='credit'&&x.kind==='sale')||(line.direction==='debit'&&x.kind==='expense')));
}
export type StockSale={moved_on:string;movement_kind:'sold'|'restocked';quantity:number;stock_id:string};
export type Forecast={daysCovered:number;observedSold:number;projectedSeven:number;dailyAverage:number;bandLow:number;bandHigh:number;confidence:'observational'|'insufficient'};
export function forecastSevenDays(history:StockSale[],asOf:string):Forecast{
 const end=Date.parse(asOf+'T00:00:00Z');
 const windowStart=end-27*86400000;
 const sold=history.filter(x=>x.movement_kind==='sold'&&Number.isFinite(x.quantity)&&x.quantity>0&&Date.parse(x.moved_on+'T00:00:00Z')>=windowStart&&Date.parse(x.moved_on+'T00:00:00Z')<=end);
 const unique=new Set(sold.map(x=>x.moved_on)).size;
 const total=sold.reduce((s,x)=>s+x.quantity,0);
 const avg=total/28;
 const weekly=[0,0,0,0];
 for(const x of sold){const day=Date.parse(x.moved_on+'T00:00:00Z');const week=Math.floor((day-windowStart)/604800000);if(week>=0&&week<4)weekly[week]+=x.quantity;}
 const weekMin=Math.min(...weekly),weekMax=Math.max(...weekly);
 // Signal derived exclusively from observed sales, no black-box fabricated demand.
 return {daysCovered:unique,observedSold:total,projectedSeven:Math.round(avg*7*10)/10,dailyAverage:Math.round(avg*100)/100,
  bandLow:Math.max(0,Math.round(weekMin*10)/10),bandHigh:Math.round(weekMax*10)/10,
  confidence:unique>=14&&total>=10?'observational':'insufficient'};
}
export const sampleCsv=`Date,Direction,Amount,Reference,Description\n${indiaDate()},credit,2480,UPI-DEMO-1,Daily store UPI sale\n${indiaDate()},debit,750,UPI-DEMO-2,Local supplies`;
