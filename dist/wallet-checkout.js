import {getPlan,pricing} from './billing-policy.js';
// Public merchant payment links only. Never store credentials here.
export const walletConfig=Object.freeze({approved:false,links:Object.freeze({})});
export function resolveWalletCheckout(planId,config=walletConfig){
 const plan=getPlan(planId);
 if(config?.approved!==true)throw Error('Payments are not available yet. No charge or trial has started.');
 if(!config.links||!Object.hasOwn(config.links,planId))throw Error('This plan is not available for payment yet.');
 const offer=config.links[planId];
 if(offer.currency!==pricing.currency||offer.amountMinor!==plan.amountMinor||offer.interval!==plan.interval)throw Error('The payment amount or currency needs review. Checkout is paused.');
 if(offer.recurring!==false||offer.manualVerification!==true)throw Error('Payment verification settings need review.');
 let url;try{url=new URL(offer.url);}catch{throw Error('The payment link is unavailable.');}
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash||!(url.hostname==='easypaisa.com.pk'||url.hostname.endsWith('.easypaisa.com.pk')))throw Error('The payment link is not an approved secure checkout.');
 return Object.freeze({url:url.href,provider:'Easypaisa',amountMinor:plan.amountMinor,currency:pricing.currency,manualVerification:true});
}
