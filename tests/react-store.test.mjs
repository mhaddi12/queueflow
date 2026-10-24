import test from 'node:test';
import assert from 'node:assert/strict';
import {useWorkspace,saveWorkspace} from '../lib/workspace-store.ts';
import {empty} from '../dist/engine.js';
test('navigation preserves loaded records and draft without network calls',async()=>{
 const originalFetch=globalThis.fetch;
 let requests=0;globalThis.fetch=async()=>{requests++;throw Error('Unexpected request');};
 try{
  const data=empty(),draft={name:'Fictional customer',phone:'0000000000',date:'2026-10-26',time:'10:00',service:'consult',staff:'Ayesha Khan',requestId:'draft-test'};
  useWorkspace.setState({data,draft,search:'test',day:'2026-10-26',filter:'booked'});
  for(const view of ['overview','appointments','queue','team','settings'])useWorkspace.getState().set({view});
  assert.equal(useWorkspace.getState().data,data);
  assert.equal(useWorkspace.getState().draft,draft);
  assert.equal(useWorkspace.getState().search,'test');
  assert.equal(requests,0);
 }finally{globalThis.fetch=originalFetch;}
});
test('a realtime snapshot preserves transient UI selections and form identity',()=>{
 const draft=useWorkspace.getState().draft,day=useWorkspace.getState().day;
 const data={...empty(),settings:{...empty().settings,paused:true}};
 useWorkspace.setState({data});
 assert.equal(useWorkspace.getState().draft,draft);
 assert.equal(useWorkspace.getState().day,day);
 assert.equal(useWorkspace.getState().data.settings.paused,true);
});
test('offline cloud save fails without altering records or losing the draft',async()=>{
 const data=empty(),draft=useWorkspace.getState().draft;
 useWorkspace.setState({data,mode:'cloud',status:'connected',online:false,busy:false});
 assert.equal(await saveWorkspace(()=>({...data,entries:[]})),false);
 assert.equal(useWorkspace.getState().data,data);
 assert.equal(useWorkspace.getState().draft,draft);
 assert.equal(useWorkspace.getState().busy,false);
 assert.match(useWorkspace.getState().notice,/Reconnect/);
});
test('second save is blocked while first save is pending',async()=>{
 useWorkspace.setState({busy:true});
 let ran=false;
 assert.equal(await saveWorkspace(data=>{ran=true;return data;}),false);
 assert.equal(ran,false);useWorkspace.setState({busy:false});
});
