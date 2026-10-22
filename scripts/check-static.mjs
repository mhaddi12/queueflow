import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const html=await readFile(path.join(root,'index.html'),'utf8');
for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(url.startsWith('#')||/^https?:/.test(url))continue;
 if(url.startsWith('/'))throw Error('Root-relative asset breaks GitHub project Pages: '+url);
 await access(path.resolve(root,url));
}
const app=await readFile(path.join(root,'app.js'),'utf8');
if(!app.includes("from './engine.js'"))throw Error('Missing relative domain module import');
console.log('Static assets resolve under a GitHub Pages repository subpath.');
