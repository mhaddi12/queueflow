import {getPlan, pricing} from '../dist/billing-policy.js';

/**
 * Server-only provider adapter. Not deployed or exposed by GitHub Pages.
 * An authenticated backend must obtain businessId and checkoutReference from
 * durable server records, enforce ownership, and serialize duplicate attempts.
 */
export function subscriptionGateway({sdk, environment = 'sandbox', planIds = {}, merchantApproved = false, currencyApproved = false}) {
  if (!['sandbox', 'production'].includes(environment)) throw new Error('Invalid gateway environment.');
  return {
    async checkout({plan, checkoutReference, verifiedOwner, origin}) {
      const policy = getPlan(plan);
      if (verifiedOwner !== true) throw new Error('Business owner authentication is required.');
      if (!currencyApproved) throw new Error('Merchant subscription currency has not been verified.');
      if (environment === 'production' && !merchantApproved) throw new Error('Live merchant approval is required.');
      if (typeof planIds[plan] !== 'string' || !/^plan_[a-zA-Z0-9-]+$/.test(planIds[plan])) throw new Error('Safepay subscription plan is not configured.');
      if (typeof checkoutReference !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(checkoutReference)) throw new Error('A server-generated checkout reference is required.');
      const base = new URL(origin);
      if (base.origin !== 'https://mhaddi12.github.io' || base.pathname !== '/queueflow/' || base.search || base.hash || base.username || base.password) throw new Error('Unexpected checkout return URL.');
      if (!sdk?.checkout?.createSubscription) throw new Error('Safepay SDK is not configured.');
      const target = await sdk.checkout.createSubscription({
        planId: planIds[plan], reference: checkoutReference,
        cancelUrl: new URL('billing.html?result=cancelled', base).href,
        redirectUrl: new URL('billing.html?result=pending', base).href,
      });
      const url = new URL(target);
      const hosts = environment === 'production' ? ['getsafepay.com', 'www.getsafepay.com'] : ['sandbox.api.getsafepay.com', 'sandbox.getsafepay.com'];
      if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || url.username || url.password) throw new Error('Unexpected payment provider URL.');
      return {checkoutUrl: url.href, plan, amountMinor: policy.amountMinor, currency: pricing.currency, state: 'pending'};
    },
    async verifyWebhook(request) {
      if (!sdk?.verify?.webhook || !await sdk.verify.webhook(request)) throw new Error('Payment notification could not be verified.');
      // Verification alone does not grant access. The backend must reconcile
      // reference, provider subscription, plan, amount, currency and event state,
      // deduplicate notification IDs, and persist the resulting entitlement.
      return {verified: true, grantAccess: false};
    },
  };
}
