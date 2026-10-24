import test from 'node:test';
import assert from 'node:assert/strict';
import {demoWorkspace} from '../dist/demo-workspace.js';
import {validateWorkspace} from '../dist/workspace-state.js';
test('demo contains valid fictional appointments and is independent between visitors',()=>{const a=demoWorkspace(),b=demoWorkspace();validateWorkspace(a);assert.equal(a.entries.length,4);assert.ok(a.entries.every(e=>e.sample));assert.notEqual(a.entries[0].id,b.entries[0].id);a.settings.paused=true;assert.equal(b.settings.paused,false);});
