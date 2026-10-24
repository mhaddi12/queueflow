# QueueFlow

Mobile appointment and queue manager built with Next.js, React, TypeScript and Zustand, using Firebase Authentication and Firestore for private owner workspaces. Limited owner beta, not a complete production SaaS.

## Run and test

Node.js 24.12+: `npm ci`, `npm run build`, `npm start`. Open http://127.0.0.1:4173/queueflow/. Next.js exports public pages and a React dashboard to out/. A single Zustand store keeps navigation, filters and booking drafts in memory; changing dashboard views does not reconnect Firebase. `npm test` runs 62 unit/domain/store tests. Run `npm run typecheck` and `node scripts/check-static.mjs` after building. Java 21 and the Firebase emulators are required for six integration tests (`npm run test:rules`). GitHub Actions builds and runs both suites before deploying Pages.

## Private cloud workspace

Select Sign in / cloud workspace, use Google or email/password, and verify your email. Unverified accounts cannot access records. Auth uses session persistence. Cloud data is not stored in localStorage. Visitors see sign-in before any company records. There is no shared anonymous company. Legacy demo utilities are retained for compatibility tests, but are not exposed by the React application. Cloud edits stay locked while signed out, offline, unverified or disconnected. A failed cloud save never falls back to demo storage. Sign-out and account changes clear visible records.

Selected project: angular-gateway-xmbw7. Named Enterprise database: ai-studio-resumeaiairesume-160378a3-37d7-4ab9-b93d-ec929e2cbef4, us-west1. No billing activation. The live hostname mhaddi12.github.io is authorized. Google and Email/Password were verified enabled in the console. CLI rule deployment remains permission-blocked; owner-only rules were published through the console on 23 October 2026 with explicit approval.

`/workspaces/{uid}` stores a bounded private snapshot. Verified owners can read/create/update only their own document. Exact envelope fields, immutable ownership/creation time, server update time and consecutive revisions are enforced. Legacy users/payments/analyses, other paths and document deletion stay denied. Transactions reread the latest state before applying booking logic, preventing stale client overwrites. Realtime document listeners are required for queue synchronization across owner devices; no collection queries are used.

## Limits before broad production use

The payload is owner-controlled JSON. Rules enforce owner isolation and the envelope, not booking business semantics. An owner can directly rewrite their own payload, but cannot grant roles, subscriptions or access to other owners through it. Public booking, staff accounts, authoritative server-side business validation, shared business timezone/DST handling, App Check/rate controls, retention/backups, reminders and live Safepay integration remain unfinished. Devices currently use their local timezone. Limit: 500 appointments and 400 KB per workspace; export/archive old records before exceeding it. No automated trial or payment entitlement is implemented.

The emulator exercises Standard document/rules semantics, not a full Enterprise production simulation. Live account and database verification are separate checks after deployment. Passing tests does not establish absence of all errors.

## Development isolation

Start `firebase emulators:start --config firebase.emulators.json --project demo-queueflow --only auth,firestore`. Services bind only to loopback. Open http://127.0.0.1:4173/queueflow/app.html?emulators=1&workspace=cloud. Emulator mode is allowed only on 127.0.0.1 and uses demo-queueflow instead of the real project. Disposable test accounts and fictional records must remain in emulators.

## Payments

The Safepay adapter has mocked tests only. Checkout stays disabled. Merchant secrets and payment verification must run on a secure server, never in GitHub Pages or browser code. See BILLING_SETUP.md.
