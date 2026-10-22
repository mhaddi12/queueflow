# QueueFlow

Mobile-responsive appointment and queue manager. **Working local demo, not a live Firebase application.**

## Run

Node.js 20+: `npm start`, then open http://127.0.0.1:4173. Run `npm test` for domain tests. No npm dependencies are required. Browser Web Locks and localStorage are required for edits. The UI loads optional Google fonts; system fonts work if unavailable.

## Included

Appointment creation and rescheduling, overlap checks, service durations, per-staff schedules, customer phone conflict detection, appointment search, date/status filters, check-in, FIFO ticket order, per-staff service completion, cancellations, no-shows, queue pause/capacity, staff absence, date closures, demo export and sample data. Layout adapts to mobile. All dates use device-local time in this demo.

Booking hours are Monday–Saturday 09:00–18:00, with a 13:00–14:00 break, 15-minute slots and a 60-day horizon. Check-in opens 30 minutes early. No-show requires a 15-minute grace period. Rescheduling is allowed only before check-in. Terminal records remain for history. Customer cancellation and no-show actions require confirmation.

## Firebase status

The selected project is `angular-gateway-xmbw7`. CLI authentication is complete. Deploying the email/password configuration reports success, but the live frontend is still browser-local. Firestore rules deployment is blocked by HTTP 403: missing `serviceusage.services.use`. Rules remain an unverified prototype. No billing activation was performed. No tenant isolation, reminders, payments, or cross-device persistence is active in the live app.

The local production auth configuration requests `mhaddi12.github.io` and `angular-gateway-xmbw7.firebaseapp.com`, with email/password enabled and anonymous sign-in disabled. Console verification found Email/Password and Google providers enabled, but `mhaddi12.github.io` is NOT yet authorized; old AI Studio domains remain. The CLI success response therefore does not establish that domain changes took effect. Adding the prepared domain is awaiting action-time approval. Development emulators are isolated in `firebase.emulators.json`, bind to loopback only, and should be started with a demo project: `firebase emulators:start --config firebase.emulators.json --project demo-queueflow --only auth,firestore`. The frontend is not yet wired to them. This configuration has not been emulator-tested.

To finish integration, first resolve project permissions. The existing named Enterprise Firestore database is `ai-studio-resumeaiairesume-160378a3-37d7-4ab9-b93d-ec929e2cbef4` in `us-west1`. Deploy and test rules before adding authenticated SDK persistence. The local snapshot rules do not enforce booking business rules; authoritative operations must be implemented and tested before production use.

## Production architecture to implement

- Firebase Authentication for owners, staff, and customers. Business membership is server assigned; clients cannot promote their roles.
- Firestore records scoped to business ID. Customers read only their own records, staff access their authorized business, and public queue displays expose ticket numbers only.
- Callable server operations perform booking, reschedule, check-in and transitions. Clients cannot directly write appointment or lock records.
- Server transaction claims every occupied staff/time segment, checks membership, business timezone, closure/breaks, horizon, service version, customer conflicts, and capacity. Rescheduling releases old locks and claims new locks in one transaction. Cancellation/completion/no-show release appropriate locks.
- Idempotency keys return the original response on retried submissions; transactional queue sequence allocation prevents duplicate tickets. Use server timestamps and versions to reject stale operations.
- Use an IANA business timezone and UTC instants. Reject ambiguous/nonexistent daylight-saving times. Do not trust the customer device clock.
- App Check, request quotas, rate limits, server input validation, audit history, retention policy, and backups. Emulator tests for two customers claiming the same slot and cross-tenant access.
- Reminders require scheduled delivery with consent, opt-out, cancellation/reschedule checks, deduplication, delivery retries and failure tracking. No notification delivery is implied by booking success.

## Verification limits

Domain tests run with Node's test runner. Local browser storage operations are serialized across tabs using Web Locks; this does not solve distributed booking conflicts. Customer view is a UI preview, not a security boundary. Demo data should be fictional. No claim is made that all possible edge cases or production readiness have been achieved.

See EDGE_CASES.md for the coverage inventory.
