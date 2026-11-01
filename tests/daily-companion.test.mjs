import {dailyTasks,indiaDate} from '../src/lib/shopLogic.ts';
const today=indiaDate(),p={contacts:[],entries:[],dues:[
 {direction:'receive',amount:1200,settled:200,due_date:today},
 {direction:'pay',amount:3000,settled:1000,due_date:today},
 {direction:'receive',amount:500,settled:500,due_date:today},
 {direction:'pay',amount:400,settled:0,due_date:null}
],stock:[{quantity:3,reorder_at:5},{quantity:12,reorder_at:6},{quantity:0,reorder_at:0}]};
const s=dailyTasks(p);
if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error('Date format invalid: '+today);
if(s.owed!==1000||s.payable!==2400||s.overdue.length!==2||s.upcoming.length!==1||s.low.length!==2)throw Error('Wrong tasks '+JSON.stringify(s));
const cleared=dailyTasks({contacts:[],entries:[],dues:[],stock:[]});
if(cleared.owed!==0||cleared.low.length!==0||cleared.upcoming.length!==0)throw Error('Empty shop mismatch');
console.log(JSON.stringify({date:today,checks:['partially settled due','settled entries excluded','low-stock inclusive threshold','upcoming supplier','empty state'],status:'passed'}));
