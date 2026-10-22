export const services=[{id:'consult',name:'Consultation',minutes:30,price:1500},{id:'followup',name:'Follow-up',minutes:15,price:800},{id:'extended',name:'Extended session',minutes:60,price:2500}];
export const staff=['Ayesha Khan','Omar Ali','Sara Ahmed'];
export const active=['booked','waiting','serving'];
export function localDay(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function minutes(time){if(!/^\d{2}:\d{2}$/.test(time))throw Error('Choose a valid time.');const [h,m]=time.split(':').map(Number);if(h>23||m>59)throw Error('Choose a valid time.');return h*60+m;}
export function clock(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function validate(state,input,now=new Date(),ignoreId){
 const service=services.find(s=>s.id===input.service);if(!service)throw Error('Choose a service.');
 if(!staff.includes(input.staff))throw Error('Choose a team member.');
 if(typeof input.name!=='string'||input.name.trim().length<2||input.name.trim().length>80)throw Error('Enter a name between 2 and 80 characters.');
 if(!/^\+?[\d ()-]{7,22}$/.test(input.phone||'')||(input.phone.match(/\d/g)||[]).length<7)throw Error('Enter a valid phone number.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date))throw Error('Choose a valid date.');
 const day=new Date(input.date+'T12:00:00');if(isNaN(day)||localDay(day)!==input.date)throw Error('Choose a valid date.');
 const today=localDay(now),limit=new Date(now);limit.setDate(limit.getDate()+60);
 if(input.date<today||input.date>localDay(limit))throw Error('Choose a date within the next 60 days.');
 if(day.getDay()===0||state.settings.closedDates.includes(input.date))throw Error('The business is closed on this date.');
 const start=minutes(input.time),end=start+service.minutes;
 if(start%15||start<540||end>1080||(start<840&&end>780))throw Error('Choose a slot within 09:00–18:00, excluding the 13:00–14:00 break.');
 if(input.date===today&&start<=now.getHours()*60+now.getMinutes())throw Error('This time has already passed.');
 if(state.settings.away.includes(input.staff))throw Error('This team member is unavailable.');
 const entries=state.entries.filter(e=>e.id!==ignoreId&&e.date===input.date&&active.includes(e.status));
 if(entries.some(e=>e.staff===input.staff&&start<minutes(e.time)+services.find(s=>s.id===e.service).minutes&&end>minutes(e.time)))throw Error('That time overlaps another booking. Choose a different slot or team member.');
 const phone=input.phone.replace(/\D/g,'');
 if(entries.some(e=>e.phone.replace(/\D/g,'')===phone&&start<minutes(e.time)+services.find(s=>s.id===e.service).minutes&&end>minutes(e.time)))throw Error('This customer already has an overlapping appointment.');
 return {...input,name:input.name.trim(),phone:input.phone.trim()};
}
export function book(state,input,now=new Date(),ignoreId){
 if(input.requestId&&!ignoreId){const existing=state.entries.find(e=>e.requestId===input.requestId);if(existing){if(['name','phone','service','staff','date','time'].some(k=>existing[k]!==input[k]))throw Error('This request was already used for a different booking.');return state;}}
 const data=validate(state,input,now,ignoreId);
 const old=state.entries.find(e=>e.id===ignoreId);if(ignoreId&&(!old||old.status!=='booked'))throw Error('Only a scheduled appointment can be rescheduled.');
 const entry={...data,id:ignoreId||crypto.randomUUID(),status:'booked',createdAt:old?.createdAt||now.toISOString(),ticket:old?.ticket??null};
 return {...state,entries:[...state.entries.filter(e=>e.id!==ignoreId),entry]};
}
export function transition(state,id,next,now=new Date()){
 const item=state.entries.find(e=>e.id===id);if(!item)throw Error('Appointment no longer exists.');
 const allowed={booked:['waiting','cancelled','noshow'],waiting:['serving','cancelled','noshow'],serving:['completed']};
 if(!allowed[item.status]?.includes(next))throw Error('That appointment has changed. Refresh and try again.');
 if(next==='waiting'){
  if(item.date!==localDay(now))throw Error('Check-in is available on the appointment date only.');
  if(minutes(item.time)>now.getHours()*60+now.getMinutes()+30)throw Error('Check-in opens 30 minutes before the appointment.');
  if(state.settings.paused)throw Error('The queue is paused. Please try again shortly.');
  if(state.entries.filter(e=>e.date===item.date&&['waiting','serving'].includes(e.status)).length>=state.settings.capacity)throw Error('The queue is full. Please speak to reception.');
 }
 if(next==='serving'&&state.entries.some(e=>e.date===item.date&&e.staff===item.staff&&e.status==='serving'))throw Error('This team member is already serving a customer.');
 if(next==='noshow'&&(item.date>localDay(now)||(item.date===localDay(now)&&minutes(item.time)+15>now.getHours()*60+now.getMinutes())))throw Error('Allow a 15-minute grace period before marking a no-show.');
 const ticket=next==='waiting'?Math.max(0,...state.entries.filter(e=>e.date===item.date).map(e=>e.ticket||0))+1:item.ticket;
 return {...state,entries:state.entries.map(e=>e.id===id?{...e,status:next,ticket,updatedAt:now.toISOString()}:e)};
}
export function empty(){return {version:1,entries:[],settings:{paused:false,capacity:20,away:[],closedDates:[]}};}
