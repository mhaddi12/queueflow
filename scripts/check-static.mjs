import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
for(const page of ['index.html','app.html']){
const html=await readFile(path.join(root,page),'utf8');
for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(url.startsWith('#')||/^https?:/.test(url))continue;
 if(url.startsWith('/'))throw Error('Root-relative asset breaks GitHub project Pages: '+url);
 await access(path.resolve(root,url));
}
}
const landing=await readFile(path.join(root,'index.html'),'utf8');
if(!landing.includes('name="description"')||!landing.includes('rel="canonical"')||!landing.includes('property="og:image"'))throw Error('Missing public landing page metadata');
await access(path.join(root,'social-card.png'));
const workspace=await readFile(path.join(root,'app.html'),'utf8');
if(!workspace.includes('content="noindex,follow"'))throw Error('Demo workspace should not be indexed');
const app=await readFile(path.join(root,'app.js'),'utf8');
if(!app.includes("from './engine.js'"))throw Error('Missing relative domain module import');
console.log('Static assets resolve under a GitHub Pages repository subpath.');
