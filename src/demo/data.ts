/** Completely synthetic, deterministic sample records. Never send to Supabase. */
export interface DemoShop { id: string; alias: string; locality: string; city: string; district: string; state: string; pin: string; category: string; baseDailyGross: number; previousDailyGross: number; }
export interface DemoTxn { id: string; shopId: string; date: string; counterparty: string; amount: number; type: 'inflow' | 'outflow'; channel: 'UPI' | 'Cash' | 'Bank'; flagged: boolean; description: string; }

export const DEMO_SHOPS: DemoShop[] = [
  {id:'d01',alias:'Apna Kirana',locality:'MI Road',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302001',category:'Kirana',baseDailyGross:16100,previousDailyGross:12000},
  {id:'d02',alias:'Shree Ganesh Stores',locality:'MI Road',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302001',category:'Kirana',baseDailyGross:19500,previousDailyGross:18135},
  {id:'d03',alias:'Laxmi General Store',locality:'MI Road',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302001',category:'Kirana',baseDailyGross:17800,previousDailyGross:16554},
  {id:'d04',alias:'Gopal Provisions',locality:'MI Road',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302001',category:'Kirana',baseDailyGross:14900,previousDailyGross:13857},
  {id:'d05',alias:'Savera Mini Mart',locality:'MI Road',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302001',category:'Kirana',baseDailyGross:13200,previousDailyGross:12276},
  {id:'d06',alias:'Radha Daily Needs',locality:'MI Road',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302001',category:'Kirana',baseDailyGross:12200,previousDailyGross:11346},
  {id:'d07',alias:'Bharat Kirana',locality:'Bapu Bazaar',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302003',category:'Kirana',baseDailyGross:23100,previousDailyGross:21483},
  {id:'d08',alias:'Meera Grocers',locality:'Bapu Bazaar',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302003',category:'Kirana',baseDailyGross:20700,previousDailyGross:19251},
  {id:'d09',alias:'Navrang Mart',locality:'Johari Bazaar',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302003',category:'Kirana',baseDailyGross:15700,previousDailyGross:14601},
  {id:'d10',alias:'Mangal Stores',locality:'Malviya Nagar',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302017',category:'Kirana',baseDailyGross:11100,previousDailyGross:10323},
  {id:'d11',alias:'Sunder Provisions',locality:'Malviya Nagar',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302017',category:'Kirana',baseDailyGross:14400,previousDailyGross:13392},
  {id:'d12',alias:'Asha Daily Bazaar',locality:'Vaishali Nagar',city:'Jaipur',district:'Jaipur',state:'Rajasthan',pin:'302021',category:'Kirana',baseDailyGross:18600,previousDailyGross:17298},
  {id:'d13',alias:'Chomu Grain Corner',locality:'Bus Stand',city:'Chomu',district:'Jaipur',state:'Rajasthan',pin:'303702',category:'Kirana',baseDailyGross:12700,previousDailyGross:11100},
  {id:'d14',alias:'Balaji Daily Bazaar',locality:'Main Market',city:'Chomu',district:'Jaipur',state:'Rajasthan',pin:'303702',category:'Kirana',baseDailyGross:15400,previousDailyGross:16900},
  {id:'d15',alias:'Rani Kirana House',locality:'Main Market',city:'Chomu',district:'Jaipur',state:'Rajasthan',pin:'303702',category:'Kirana',baseDailyGross:11100,previousDailyGross:9100},
  {id:'d16',alias:'Mohan General Store',locality:'Bus Stand',city:'Chomu',district:'Jaipur',state:'Rajasthan',pin:'303702',category:'Kirana',baseDailyGross:14600,previousDailyGross:13600},
  {id:'d17',alias:'Lake City Kirana',locality:'Hathipole',city:'Udaipur',district:'Udaipur',state:'Rajasthan',pin:'313001',category:'Kirana',baseDailyGross:17900,previousDailyGross:15600},
  {id:'d18',alias:'Pichola Daily Needs',locality:'Hathipole',city:'Udaipur',district:'Udaipur',state:'Rajasthan',pin:'313001',category:'Kirana',baseDailyGross:13700,previousDailyGross:13100},
  {id:'d19',alias:'Aravali Grocery',locality:'Surajpole',city:'Udaipur',district:'Udaipur',state:'Rajasthan',pin:'313001',category:'Kirana',baseDailyGross:17200,previousDailyGross:18900},
  {id:'d20',alias:'Mewar Stores',locality:'Surajpole',city:'Udaipur',district:'Udaipur',state:'Rajasthan',pin:'313001',category:'Kirana',baseDailyGross:15000,previousDailyGross:12900},
  {id:'d21',alias:'Rangoli Mart',locality:'Shobhagpura',city:'Udaipur',district:'Udaipur',state:'Rajasthan',pin:'313001',category:'Kirana',baseDailyGross:16600,previousDailyGross:14400},
  {id:'d22',alias:'Shree Nath Kirana',locality:'Ashok Nagar',city:'Udaipur',district:'Udaipur',state:'Rajasthan',pin:'313001',category:'Kirana',baseDailyGross:12000,previousDailyGross:13300},
  {id:'d23',alias:'Marwar General Store',locality:'Sardarpura',city:'Jodhpur',district:'Jodhpur',state:'Rajasthan',pin:'342001',category:'Kirana',baseDailyGross:18300,previousDailyGross:17100},
  {id:'d24',alias:'Blue City Grocers',locality:'Sardarpura',city:'Jodhpur',district:'Jodhpur',state:'Rajasthan',pin:'342001',category:'Kirana',baseDailyGross:16500,previousDailyGross:14700},
  {id:'d25',alias:'Uma Daily Bazaar',locality:'Clock Tower',city:'Jodhpur',district:'Jodhpur',state:'Rajasthan',pin:'342001',category:'Kirana',baseDailyGross:19600,previousDailyGross:17200},
  {id:'d26',alias:'Rajasthan Kirana',locality:'Clock Tower',city:'Jodhpur',district:'Jodhpur',state:'Rajasthan',pin:'342001',category:'Kirana',baseDailyGross:11200,previousDailyGross:9800},
  {id:'d27',alias:'Surya Provisions',locality:'Ratanada',city:'Jodhpur',district:'Jodhpur',state:'Rajasthan',pin:'342001',category:'Kirana',baseDailyGross:14300,previousDailyGross:15200},
  {id:'d28',alias:'Shakti Grain & More',locality:'Ratanada',city:'Jodhpur',district:'Jodhpur',state:'Rajasthan',pin:'342001',category:'Kirana',baseDailyGross:12700,previousDailyGross:11200},
];
export const DEMO_SHOP = DEMO_SHOPS[0];
function rng(seed:number){let x=seed>>>0;return ()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
const salesNames=['Daily UPI sales','Counter sales','Evening groceries','Fresh produce sales','Household items','Morning customers','Bulk grocery sale'];
const expenseNames=['Wholesale stock purchase','Milk and dairy supplies','Vegetables and produce','Packing materials'];
function dateForDaysAgo(daysAgo:number, index:number):string {const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-daysAgo);d.setHours(10+(index%10),index*7%60,0,0);return d.toISOString();}
export function generateDemoTransactions(shops:DemoShop[]=DEMO_SHOPS):DemoTxn[]{
 const rows:DemoTxn[]=[];
 for(const [shopIndex,shop] of shops.entries()){
  const random=rng(20261031+shopIndex*2009);
  for(let day=0;day<30;day++){
   const activity=0.79+random()*0.42;
   for(let k=0;k<5;k++){
    const amount=Math.round(shop.baseDailyGross*activity*(0.15+random()*0.10));
    rows.push({id:`${shop.id}-in-${day}-${k}`,shopId:shop.id,date:dateForDaysAgo(day,k),counterparty:salesNames[k%7],amount,type:'inflow',channel:k%4===0?'Cash':'UPI',flagged:false,description:'Recorded sample sale'});
   }
   for(let k=0;k<2;k++){
    const amount=Math.round(shop.baseDailyGross*(0.12+random()*0.16));
    const flagged=shopIndex===0&&((day===3&&k===0)||(day===18&&k===1));
    rows.push({id:`${shop.id}-out-${day}-${k}`,shopId:shop.id,date:dateForDaysAgo(day,k+5),counterparty:expenseNames[(day+k)%expenseNames.length],amount,type:'outflow',channel:k%2===0?'Bank':'UPI',flagged,description:flagged?'Sample payment to double-check':'Recorded sample shop expense'});
   }
  }
 }
 return rows.sort((a,b)=>b.date.localeCompare(a.date));
}
export const DEMO_TRANSACTIONS=generateDemoTransactions();
export function shopStats(shopId:string){const tx=DEMO_TRANSACTIONS.filter(t=>t.shopId===shopId);const incoming=tx.filter(t=>t.type==='inflow').reduce((sum,t)=>sum+t.amount,0);const outgoing=tx.filter(t=>t.type==='outflow').reduce((sum,t)=>sum+t.amount,0);return {incoming,outgoing,count:tx.length,averageDailyGross:Math.round(incoming/30)};}
export type DemoRegionScope='local'|'city'|'district'|'state';
export type DemoLeagueMode='activity'|'growth';
export function demoLeague(scope:DemoRegionScope='local',mode:DemoLeagueMode='activity',additionalInflow=0){
 const peers=DEMO_SHOPS.filter(s=>s.category===DEMO_SHOP.category&&(scope==='state'?s.state===DEMO_SHOP.state:scope==='district'?s.district===DEMO_SHOP.district:scope==='city'?s.city===DEMO_SHOP.city:s.pin===DEMO_SHOP.pin));
 return peers.map(s=>{const stats=shopStats(s.id);const avg=stats.averageDailyGross+(s.id===DEMO_SHOP.id?Math.round(additionalInflow/30):0);const baseline=Math.round(s.previousDailyGross*0.99);return {...s,...stats,averageDailyGross:avg,growthPercent:Math.round(((avg-baseline)/Math.max(1,baseline))*100)};})
 .sort((a,b)=>(mode==='growth'?b.growthPercent-a.growthPercent:b.averageDailyGross-a.averageDailyGross)||a.alias.localeCompare(b.alias))
 .map((s,i)=>({...s,rank:i+1,self:s.id===DEMO_SHOP.id,tier:i<3?'Gold':i<6?'Silver':'Bronze'}));
}
export {DEMO_MERCHANT} from './previewMerchant.ts';
