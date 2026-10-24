import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('out');
for(const page of ['index.html','app.html','billing.html']){
 const html=await readFile(path.join(root,page),'utf8');
 for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(url.startsWith('#')||/^https?:/.test(url))continue;
  const clean=url.split(/[?#]/)[0];
  if(!clean)continue;
  if(clean.startsWith('/')&&!clean.startsWith('/queueflow/'))throw Error('Asset missing project prefix: '+url);
  const relative=clean.startsWith('/queueflow/')?clean.slice('/queueflow/'.length):clean;
  await access(path.resolve(root,relative||'index.html'));
 }
}
const landing=await readFile(path.join(root,'index.html'),'utf8');
for(const marker of ['name="description"','rel="canonical"','property="og:image"','Less waiting.','Appointment scheduling'])if(!landing.includes(marker))throw Error('Missing prerendered landing content or metadata: '+marker);
for(const page of ['app.html','billing.html'])if(!(await readFile(path.join(root,page),'utf8')).includes('noindex'))throw Error('Private workspace or checkout must not be indexed');
const sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
if(sitemap.includes('app.html')||sitemap.includes('billing.html'))throw Error('Private routes found in public sitemap');
await access(path.join(root,'.nojekyll'));
console.log('Next.js export: public content, metadata, private noindex and GitHub Pages assets verified.');
