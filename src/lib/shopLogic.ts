import type {ShopContact,ShopDue,ShopStock,ShopEntry} from '../context/ShopContext.tsx';
export type ShopRecords={contacts:ShopContact[];dues:ShopDue[];stock:ShopStock[];entries:ShopEntry[]};
export const indiaDate=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const dayAhead=(days:number)=>{const d=new Date();d.setDate(d.getDate()+days);return indiaDate(d)};
export function dailyTasks(data:ShopRecords){
 const open=data.dues.filter(x=>x.amount>x.settled);
 const overdue=open.filter(x=>x.due_date&&x.due_date<=indiaDate());
 const low=data.stock.filter(x=>x.quantity<=x.reorder_at);
 const upcoming=open.filter(x=>x.direction==='pay'&&x.due_date&&x.due_date<=dayAhead(2));
 const owed=data.dues.filter(x=>x.direction==='receive').reduce((sum,x)=>sum+(x.amount-x.settled),0);
 const payable=data.dues.filter(x=>x.direction==='pay').reduce((sum,x)=>sum+(x.amount-x.settled),0);
 return {overdue,low,upcoming,owed,payable};
}
