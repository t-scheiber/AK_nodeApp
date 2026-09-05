import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import http from 'node:http';
import {setTimeout as pause} from 'node:timers/promises';
const source=path.resolve(new URL('..',import.meta.url).pathname);
test('actual Express application renders, validates, persists and deletes player data',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'player-app-test-'));
 for(const file of ['index.js','controllers','models','routes','services','views','public','data'])if(fs.existsSync(path.join(source,file)))fs.cpSync(path.join(source,file),path.join(root,file),{recursive:true});
 fs.symlinkSync(path.join(source,'node_modules'),path.join(root,'node_modules'),'dir');
 let server;
 // The test transport cannot follow redirects or connect beyond this loopback fixture.
 function request(route='/',{method='GET',body}={}) {
  assert.ok(route.startsWith('/')&&!route.startsWith('//'));
  return new Promise((resolve,reject)=>{
   const payload=body?.toString();
   const req=http.request({hostname:'127.0.0.1',port:18371,path:route,method,timeout:3000,headers:payload?{'content-type':'application/x-www-form-urlencoded','content-length':Buffer.byteLength(payload)}:{}},res=>{
    const chunks=[];let bytes=0;res.on('data',chunk=>{bytes+=chunk.length;if(bytes>1024*1024){res.destroy(Error('Test response exceeds budget'));return;}chunks.push(chunk);});
    res.on('error',reject);res.on('end',()=>{const text=Buffer.concat(chunks).toString('utf8');resolve({status:res.statusCode,ok:res.statusCode>=200&&res.statusCode<300,headers:{get:key=>res.headers[key]},text:async()=>text,json:async()=>JSON.parse(text)});});
   });
   req.on('error',reject);req.on('timeout',()=>req.destroy(Error('Loopback test request timed out')));req.end(payload);
  });
 }
 async function start(){
  server=spawn(process.execPath,['index.js'],{cwd:root,env:{PATH:process.env.PATH,PORT:'18371',DISABLE_DB:'true',MONGODB_URI:'',NODE_ENV:'test'},stdio:'ignore'});
  for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Application exited before readiness');try{if((await request('/all-players')).ok)return;}catch{}await pause(50);}
  throw Error('Application readiness timed out');
 }
 async function stop(){if(server&&server.exitCode===null){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}}
 try {
  await start();
  await t.test('root redirects to the list',async()=>{const r=await request('/',{redirect:'manual'});assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/players');});
  await t.test('list, about and creation pages compile and render their real EJS templates',async()=>{for(const route of ['/players','/about','/players/create']){const r=await request(route);assert.equal(r.status,200,route);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/<html/i);}});
  await t.test('unknown pages and player identities return 404',async()=>{for(const route of ['/missing','/players/not-a-player'])assert.equal((await request(route)).status,404);});
  await t.test('missing required form fields return a usable 400 page',async()=>{const r=await request('/players',{method:'POST',body:new URLSearchParams({username:''})});assert.equal(r.status,400);assert.match(await r.text(),/<form/i);});
  let created;
  await t.test('create returns a redirect and preserves escaped text in details',async()=>{
   const r=await request('/players',{method:'POST',redirect:'manual',body:new URLSearchParams({username:'<script>fixture</script>',fullname:'Synthetic Player',bio:'Fixture biography'})});assert.equal(r.status,302);
   const players=await (await request('/all-players')).json();created=players.find(p=>p.fullname==='Synthetic Player');assert.ok(created?._id);
   const detail=await request('/players/'+created._id);assert.equal(detail.status,200);const html=await detail.text();assert.doesNotMatch(html,/<script>fixture<\/script>/);assert.match(html,/&lt;script&gt;fixture&lt;\/script&gt;/);
  });
  await t.test('local player data survives application restart',async()=>{await stop();await start();const players=await (await request('/all-players')).json();assert.ok(players.some(p=>p._id===created._id));});
  await t.test('delete removes the created player and repeated deletion returns 404',async()=>{const url='/players/'+created._id;const r=await request(url,{method:'DELETE'});assert.equal(r.status,200);assert.deepEqual(await r.json(),{redirect:'/'});assert.equal((await request(url)).status,404);assert.equal((await request(url,{method:'DELETE'})).status,404);});
 }finally{await stop();fs.rmSync(root,{recursive:true,force:true});}
});
