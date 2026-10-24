import {empty, localDay, staff} from './engine.js';
export function demoWorkspace(now = new Date()) {
 const data=empty();
 data.entries=['Alex Morgan','Jamie Lee','Taylor Reed','Sam Carter'].map((name,i)=>({id:crypto.randomUUID(),name,phone:'0000000000',service:'consult',staff:staff[i%staff.length],date:localDay(now),time:['09:00','10:00','11:00','14:00'][i],status:['completed','serving','waiting','booked'][i],ticket:i<3?i+1:null,createdAt:now.toISOString(),sample:true}));
 return data;
}
