# Easypaisa payment links

Prepared but DISABLED. No approved merchant account or real payment links exist yet. No live payment or subscription activation is implemented.

Merchant signup: https://merchantportal.easypaisa.com.pk/

Complete merchant eligibility/KYC yourself using genuine information. Ask Easypaisa about individual/freelancer eligibility if unregistered. Account opening, verification and provider agreement acceptance belong to the account owner.

After approval, obtain public hosted links for each plan. Confirm currency and amount: current pricing is USD10 monthly and USD100 annually after a 30-day trial. Do not silently convert to PKR; ask the owner to approve PKR prices if required. The adapter refuses mismatched prices.

The configuration in dist/wallet-checkout.js accepts only reviewed public HTTPS Easypaisa links. Credentials, wallet PINs and API secrets must never go in frontend code. Other hosted-link domains require official verification before changing the allowlist. Test URLs are placeholders and must never be used for payments.

Payment links are one-time payments with manual renewal, not automatic subscriptions. A trusted administrator must independently verify settlement, match payer to workspace and plan, reject reused references, and then grant access. Neither screenshots nor callback query parameters prove payment. Client writes to payment/entitlement records remain denied. Current frontend does not assign or enforce trials. Automated orders, signed webhooks and recurring billing require separate backend work before enabling them.

This prepared route needs no Firebase billing upgrade because checkout is externally hosted. Merchant transaction fees may apply. Do not enable walletConfig.approved until merchant approval, real links, approved pricing and a trusted entitlement process are in place.
