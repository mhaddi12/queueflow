# Verification report

- 27 Node tests passed, including more than 5,000 pairwise combinations of valid service durations and start slots.
- Covered interval conflicts, adjacent slots, different staff, customer conflicts, business-hour boundaries, lunch, Sunday, closures, absent staff, booking horizon, leap day, rescheduling, retries, terminal states, queue capacity, ticket sequence, check-in windows, and no-show grace.
- Mobile browser walkthrough passed: create a fictional appointment, check in, start service, and complete service. The completed record remained in appointment history.
- Preview returned HTTP 200; JavaScript syntax check passed.
- Firebase network access recovered enough to issue a login URL. Google authorization code remains required; no Firebase project has been created or connected.
- Sites source packaging/publishing was blocked when automatic approval review rejected passing a source credential to the helper. No production URL is claimed.
- Not verified: real Firebase transactions, authorization rules, multi-tenant isolation, notification delivery, cross-device concurrency, DST handling, load testing, and formal accessibility audit. These require implementation and deployment; they are not represented as completed.

Run locally with Node.js 20 or newer using `npm start` or double-click `start.cmd` on Windows, then visit http://127.0.0.1:4173. Run `npm test` to repeat the domain checks.
