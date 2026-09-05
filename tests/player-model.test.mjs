import test from 'node:test';
import assert from 'node:assert/strict';
import Player from '../models/player.js';
test('the actual Mongoose schema enforces required names without database access',async()=>{
 await assert.rejects(new Player({bio:'missing names'}).validate(),error=>Object.keys(error.errors).sort().join(',')==='fullname,username');
});
test('the actual Mongoose schema trims names and supplies an empty biography',async()=>{
 const p=new Player({username:'  synthetic  ',fullname:'  Synthetic Player  '});await p.validate();assert.equal(p.username,'synthetic');assert.equal(p.fullname,'Synthetic Player');assert.equal(p.bio,'');
});
