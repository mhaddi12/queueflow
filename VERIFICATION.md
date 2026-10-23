# Verification — 23 October 2026

43 unit/domain tests plus six Firestore emulator integration tests pass. npm audit reports zero vulnerabilities after overriding the transitive grpc-js dependency to patched 1.13.6. Static asset checks and JavaScript syntax checks pass; the Firebase browser bundle builds.

Emulator checks: verified owner create/read; unauthenticated/unverified/foreign access denial; schema/type/size/ownership/timestamp/update bypass denial; consecutive revision enforcement; deletion and legacy/subcollection paths denied; competing transactions yield only one conflicting booking. Browser walkthrough: disposable emulator owner signed in, saved a fictional appointment, restored it after reload, and signed out with private records cleared.

Approved owner-only rules were published in the named production database through the console. No billing activation. Frontend deployment and live account verification are reported in the task response. No real customer data was used in emulator testing.

Limits: opaque owner-controlled JSON, device-local timezone and 500-record cap; no public customer booking, staff accounts, authoritative server business validation, notifications, automated backups/retention or live payments. This is a limited owner beta, not a complete production release.
