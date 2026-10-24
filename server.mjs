import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('out');
http.createServer((req,res)=>{
 let request;
 try{request=decodeURIComponent((req.url||'/').split('?')[0]);}catch{res.writeHead(400);res.end('Invalid URL');return;}
 if(request==='/'){res.writeHead(302,{Location:'/queueflow/'});res.end();return;}
 if(!request.startsWith('/queueflow/')){res.writeHead(404);res.end('Not found');return;}
 const relative=request.slice('/queueflow'.length);
 const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml','.png':'image/png','.txt':'text/plain'})[path.extname(file)]||'application/octet-stream');res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/queueflow/'));
