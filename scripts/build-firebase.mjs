import {build} from 'esbuild';
await build({entryPoints:['firebase-client.js'],outfile:'dist/firebase-client.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof'});
