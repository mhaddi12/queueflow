import test from 'node:test';
import assert from 'node:assert/strict';
import {needsWorkspaceSkeleton} from '../dist/loading-state.js';
const state={ready:true,online:true,status:'loading',hasSnapshot:false};
test('initial rendering, auth restoration and first snapshot use skeletons',()=>{
 assert.equal(needsWorkspaceSkeleton({...state,ready:false}),true);
 assert.equal(needsWorkspaceSkeleton(state),true);
 assert.equal(needsWorkspaceSkeleton({...state,status:'connecting'}),true);
});
test('loaded records stay visible during reconnects, saves and cached navigation',()=>{
 for(const status of ['loading','connecting','connected'])assert.equal(needsWorkspaceSkeleton({...state,status,hasSnapshot:true,busy:true}),false);
});
test('offline, sign-in and terminal states never get trapped behind a shimmer',()=>{
 assert.equal(needsWorkspaceSkeleton({...state,online:false}),false);
 for(const status of ['signed-out','verify-email','unassigned','error','connected'])assert.equal(needsWorkspaceSkeleton({...state,status}),false);
});
