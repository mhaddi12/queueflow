# Owner-managed company accounts

Public registration and Google sign-in have been removed. The owner provisions one private workspace per company account. The registered company name comes from administrator-set Firebase custom claims, not from URL parameters or browser storage.

## Create a company account

1. In Firebase Console, use project `angular-gateway-xmbw7` → Project settings → Service accounts to obtain an owner service-account key. Keep it outside this repository.
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to the local key path, and `QUEUEFLOW_INITIAL_PASSWORD` to a unique temporary password of at least 12 characters in your terminal environment.
3. Run `node scripts/provision-company.mjs --company "Example Clinic" --email "reception@example.com"`.
4. Give credentials to the company privately. They sign in, request email verification, verify their email, and sign in again. Reset password is available on the sign-in screen.
5. Deploy the updated Firestore rules to the named database configured in `firebase.json`: `npx firebase-tools deploy --only firestore:rules`. Without deployment, the old backend access policy still applies. Provision existing accounts with `queueflowAccess: true` and the correct `companyName` custom claim through the Admin SDK before switching policies.

No owner key or live account was available in the development environment. The public demo is a local sample workspace, not a Firebase account. Open `app.html?workspace=demo`; no password is required and no company records are loaded. Demo changes stay in the browser. Each reload starts with fresh sample records.

One account currently owns one company workspace. Shared staff accounts and configurable staff/services require a separate membership model; this change does not introduce shared tenancy.
