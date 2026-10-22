# Billing integration status

## Requested offer

- Businesses pay the QueueFlow owner for software access; this is not appointment-payment collection for other businesses.
- First month free, explicitly implemented as a 30-day trial.
- USD 10 monthly, or USD 100 annually after the trial.
- Selecting a plan does not start a trial or subscription in the demo.

## Provider selected

Safepay Pakistan. Its official Node SDK supports hosted subscription checkout using provider-created plan IDs, and its plan settings include recurring intervals and trial days. Live merchant onboarding and currency approval are still required. No merchant account or API keys were created in this session.

Official references:
- https://github.com/getsafepay/safepay-node
- https://safepay.helpscoutdocs.com/article/159-plan-page
- https://safepay.helpscoutdocs.com/article/50-starting-with-safepay-step-by-step-guide

## Implemented

- Public price display and a working monthly/annual plan selector.
- Shared price policy using integer USD cents.
- A server-only Safepay adapter in billing/safepay.mjs, with injected official SDK client. It is not deployed by static GitHub Pages.
- Adapter rejects unauthenticated calls, unapproved currency, live payments before merchant approval, missing plan IDs, invalid references, and unexpected checkout/return hosts.
- Return-page navigation never grants a subscription. Even a valid webhook requires subsequent authenticated reconciliation before granting access.
- Unit tests use mocked SDK calls. No real Safepay sandbox checkout or payment has been tested.

## Required before activation

1. Finish Firebase authentication, create/select the project and database region, identify Firestore edition, and implement the authenticated business-owner backend. No Firebase project is connected yet.
2. The owner completes Safepay merchant onboarding and signs the merchant agreement directly. Do not send card, bank, identity documents, or secret keys in chat or GitHub.
3. Create two sandbox plans in the approved currency, with exact prices, intervals, and a 30-day trial. Verify plan metadata on the server before using their IDs. Confirm whether USD subscription charging is enabled for this merchant; no automatic PKR conversion is implemented.
4. Store SDK credentials only in backend secret storage. Configure separate sandbox and production keys and plan IDs.
5. Authorize business ownership before calling the adapter. A browser must never be allowed to set verifiedOwner, plan IDs, prices, trial dates, or checkout references.
6. Persist an idempotent checkout record and serialize attempts per business. Reuse the original checkout on retry. Prevent more than one active subscription or free trial per eligible business.
7. Verify provider webhook signatures, then match stored business reference, provider subscription, plan, amount, currency and event state. Deduplicate webhook events. Reconcile out-of-order renewals, failures, cancellation and refunds against provider state.
8. Define and publish subscription cancellation, access-expiry, renewal, tax and refund terms before accepting payment. Test trial expiry, payment decline, duplicate notifications, checkout abandonment, delayed webhooks, renewal failures, plan changes and cancellation.
9. Deploy server endpoints, confirm the provider’s actual sandbox/production checkout hostnames, test end to end, and only then enable the public checkout button.

GitHub Pages hosts static frontend assets. It cannot safely execute secret-bearing payment operations. This adapter and pricing UI are preparation, not a live payment integration.
