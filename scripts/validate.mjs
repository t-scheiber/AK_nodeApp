import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ejs from 'ejs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8')),lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
assert.equal(pkg.name,lock.name);assert.deepEqual(pkg.dependencies,lock.packages[''].dependencies);
for(const directory of ['controllers','models','routes','services'])for(const file of fs.readdirSync(directory))if(file.endsWith('.js'))execFileSync(process.execPath,['--check',path.join(directory,file)],{stdio:'pipe'});
execFileSync(process.execPath,['--check','index.js'],{stdio:'pipe'});
function views(root){for(const e of fs.readdirSync(root,{withFileTypes:true})){const file=path.join(root,e.name);if(e.isDirectory())views(file);else if(file.endsWith('.ejs'))ejs.compile(fs.readFileSync(file,'utf8'),{filename:path.resolve(file)});}}
views('views');
console.log('Application syntax, EJS compilation and matching dependency manifests passed');
