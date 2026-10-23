import test from 'node:test';import assert from 'node:assert/strict';
import {empty,book} from '../dist/engine.js';
import {encodeWorkspace,decodeWorkspace} from '../dist/workspace-state.js';
const now=new Date('2026-10-23T08:00:00');
function valid(){return book(empty(),{name:'Test Customer',phone:'+92 300 0000000',service:'consult',staff:'Ayesha Khan',date:'2026-10-23',time:'10:00',requestId:crypto.randomUUID()},now);}
test('cloud workspace round trip preserves valid appointments',()=>{const s=valid();assert.deepEqual(decodeWorkspace(encodeWorkspace(s)),s);});
test('cloud schema rejects stored HTML in attribute fields',()=>{for(const [key,value] of [['id','x" onmouseover="alert(1)'],['date','2026-02-31'],['time','<script>'],['status','admin'],['staff','not a staff member']]){const s=valid();s.entries[0][key]=value;assert.throws(()=>encodeWorkspace(s));}});
test('cloud schema rejects extra roles and unknown fields',()=>{const s=valid();s.isAdmin=true;assert.throws(()=>encodeWorkspace(s));delete s.isAdmin;s.entries[0].paid=true;assert.throws(()=>encodeWorkspace(s));});
test('cloud schema rejects missing fields and duplicate IDs',()=>{const s=valid();s.entries.push({...s.entries[0]});assert.throws(()=>encodeWorkspace(s));s.entries.pop();delete s.entries[0].ticket;assert.throws(()=>encodeWorkspace(s));});
test('cloud workspace bounds size and settings',()=>{const s=valid();s.settings.capacity=101;assert.throws(()=>encodeWorkspace(s));assert.throws(()=>decodeWorkspace('x'.repeat(400001)));});
