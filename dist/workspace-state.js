import {empty,services,staff,localDay} from './engine.js';
const statuses=['booked','waiting','serving','completed','cancelled','noshow'];
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>keys.includes(k));
const day=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&localDay(new Date(s+'T12:00:00'))===s;
const instant=s=>typeof s==='string'&&s.length<=30&&Number.isFinite(Date.parse(s));
export function validateWorkspace(s){
 if(!exact(s,['version','entries','settings'])||s.version!==1||!Array.isArray(s.entries)||s.entries.length>500)throw Error('Workspace data has an invalid format or exceeds 500 appointments. Export and archive old records before adding more.');
 const t=s.settings;
 if(!exact(t,['paused','capacity','away','closedDates'])||typeof t.paused!=='boolean'||!Number.isInteger(t.capacity)||t.capacity<1||t.capacity>100||!Array.isArray(t.away)||t.away.length>staff.length||!t.away.every(n=>staff.includes(n))||!Array.isArray(t.closedDates)||t.closedDates.length>366||!t.closedDates.every(day))throw Error('Workspace settings are invalid.');
 const ids=new Set();
 for(const e of s.entries){
  if(!exact(e,['id','name','phone','service','staff','date','time','requestId','status','createdAt','updatedAt','ticket','sample'])||!uuid.test(e.id)||ids.has(e.id)||typeof e.name!=='string'||e.name.trim().length<2||e.name.length>80||typeof e.phone!=='string'||!/^\+?[\d ()-]{7,22}$/.test(e.phone)||!services.some(x=>x.id===e.service)||!staff.includes(e.staff)||!day(e.date)||typeof e.time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)||!statuses.includes(e.status)||!instant(e.createdAt)||('updatedAt' in e&&!instant(e.updatedAt))||('requestId' in e&&!uuid.test(e.requestId))||('sample' in e&&typeof e.sample!=='boolean')||!(e.ticket===null||Number.isSafeInteger(e.ticket)&&e.ticket>0&&e.ticket<=1000000))throw Error('An appointment has invalid data. No changes were saved.');
  ids.add(e.id);
 }
 return s;
}
export function encodeWorkspace(s){validateWorkspace(s);const payload=JSON.stringify(s);if(new TextEncoder().encode(payload).length>400000)throw Error('Workspace storage limit reached. Export and archive old records.');return payload;}
export function decodeWorkspace(payload){if(typeof payload!=='string'||new TextEncoder().encode(payload).length>400000)throw Error('Invalid workspace response.');return validateWorkspace(JSON.parse(payload));}
export function initialWorkspace(){return empty();}
