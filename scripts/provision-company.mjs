// Run only on the owner's computer. Never put service-account keys in the website.
import {readFile} from 'node:fs/promises';
import {createSign} from 'node:crypto';
import {parseArgs} from 'node:util';
const {values}=parseArgs({options:{company:{type:'string'},email:{type:'string'}}});
if(!values.company?.trim()||values.company.trim().length>120||!/^\S+@\S+\.\S+$/.test(values.email||''))throw Error('Usage: node scripts/provision-company.mjs --company "Company name" --email "user@company.com"');
if(!process.env.GOOGLE_APPLICATION_CREDENTIALS||!process.env.QUEUEFLOW_INITIAL_PASSWORD)throw Error('Set GOOGLE_APPLICATION_CREDENTIALS and QUEUEFLOW_INITIAL_PASSWORD locally first.');
if(process.env.QUEUEFLOW_INITIAL_PASSWORD.length<12)throw Error('Use an initial password of at least 12 characters.');
const key=JSON.parse(await readFile(process.env.GOOGLE_APPLICATION_CREDENTIALS,'utf8'));
const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const now=Math.floor(Date.now()/1000);
const body=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:key.client_email,scope:'https://www.googleapis.com/auth/cloud-platform',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
const assertion=body+'.'+createSign('RSA-SHA256').update(body).sign(key.private_key,'base64url');
const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
const token=await tokenResponse.json();if(!tokenResponse.ok)throw Error('Owner credentials could not be authenticated.');
async function request(action,data){const response=await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${key.project_id}/accounts${action}`,{method:'POST',headers:{Authorization:`Bearer ${token.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw Error(result.error?.message||'Provisioning failed.');return result;}
const companyName=values.company.trim();
// Create disabled so a failed claim assignment never leaves an accessible account.
const user=await request('',{email:values.email,password:process.env.QUEUEFLOW_INITIAL_PASSWORD,displayName:companyName,emailVerified:false,disabled:true});
await request(':update',{localId:user.localId,customAttributes:JSON.stringify({queueflowAccess:true,companyName}),disableUser:false});
console.log(`Company account created for ${companyName} (${values.email}). Provide the initial password privately. The user must verify their email after sign-in.`);
