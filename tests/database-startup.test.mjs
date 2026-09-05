import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import mongoose from 'mongoose';
const source=fs.readFileSync(new URL('../index.js',import.meta.url),'utf8');
async function startup({fromDotenv=false}={}) {
 const env=fromDotenv?{}:{MONGODB_URI:'mongodb://127.0.0.1:27017/fixture'};let connected=false,listened=false;
 const app={set(){},use(){},get(){},listen(port,callback){listened=true;callback();}};
 const express=Object.assign(()=>app,{static:()=>()=>{},urlencoded:()=>()=>{}});
 const fakeMongoose={connect(uri,options){
  // Constructor validates the options against the actual installed MongoDB driver.
  // Calling connect is deliberately omitted: this fixture makes no database request.
  const client=new mongoose.mongo.MongoClient(uri,options);void client.close();connected=true;return Promise.resolve();
 }};
 const modules={express,morgan:()=>()=>{},mongoose:fakeMongoose,'./routes/playerRoutes':{},dotenv:{config(){if(fromDotenv)env.MONGODB_URI='mongodb://127.0.0.1:27017/fixture';}}};
 vm.runInNewContext(source,{process:{env,exit(){throw Error('Startup exited');}},console:{log(){},warn(){},error(){}},require(name){if(name==='./services/playerStore')return {isDbEnabled:Boolean(env.MONGODB_URI)};assert.ok(Object.hasOwn(modules,name));return modules[name];}},{timeout:1000});
 await Promise.resolve();return {connected,listened};
}
test('database startup options are accepted by the actual installed MongoDB driver',async()=>assert.deepEqual(await startup(),{connected:true,listened:true}));
test('dotenv configuration is loaded before the database mode is selected',async()=>assert.deepEqual(await startup({fromDotenv:true}),{connected:true,listened:true}));
