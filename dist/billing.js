import {getPlan,pricing} from './billing-policy.js';
import {resolveWalletCheckout} from './wallet-checkout.js';
const params=new URLSearchParams(location.search);
const plan=params.get('plan');
if(plan){try{getPlan(plan);document.querySelector(`input[value="${plan}"]`).checked=true;}catch{document.querySelector('#billing-status').textContent='That subscription plan is not available. Choose monthly or annual below.';}}
const update=()=>{const id=new FormData(document.querySelector('#plan-form')).get('plan'),p=getPlan(id);document.querySelector('#plan-name').textContent=p.name+' plan';document.querySelector('#plan-price').textContent=`US$${(p.amountMinor/100).toFixed(2)} per ${p.interval}, billed after the ${pricing.trialDays}-day free trial. Checkout remains inactive.`;};
document.querySelector('#plan-form').addEventListener('change',update);update();
const button=document.querySelector('button.button');
function wallet(){
 button.disabled=true;button.textContent='Subscription checkout unavailable';
 try{const offer=resolveWalletCheckout(new FormData(document.querySelector('#plan-form')).get('plan'));button.disabled=false;button.textContent='Continue to '+offer.provider;document.querySelector('#billing-status').textContent='One-time payment with manual renewal. Access begins only after independent payment verification.';}
 catch(error){document.querySelector('#billing-status').textContent=error.message;}
}
document.querySelector('#plan-form').addEventListener('change',wallet);
window.addEventListener('pageshow',wallet);wallet();
button.addEventListener('click',()=>{if(button.disabled)return;try{location.assign(resolveWalletCheckout(new FormData(document.querySelector('#plan-form')).get('plan')).url);}catch(error){button.disabled=true;document.querySelector('#billing-status').textContent=error.message;}});
if(params.has('result'))document.querySelector('#billing-status').textContent=params.get('result')==='cancelled'?'Checkout was cancelled. No subscription has been confirmed.':'Payment verification pending. This return page does not activate a subscription. An authenticated server must verify the provider record.';
