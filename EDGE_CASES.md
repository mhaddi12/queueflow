# Edge-case coverage

| Scenario | Current handling |
|---|---|
| Same staff, overlapping service intervals | Rejected, including partial overlap and long service crossing another appointment |
| Adjacent appointments | Allowed |
| Same customer booking different staff concurrently | Rejected using normalized phone number; production must use verified identity |
| Duplicate click or stale tab | Submit disabled; Web Locks serialize local writes; conflicting writes revalidated |
| Cross-device simultaneous requests | Pending Firebase transactional backend; demo does not provide distributed guarantees |
| Past, malformed, impossible or too-distant date | Rejected |
| Lunch, before opening, service ending after closing | Rejected |
| Sunday, explicit closure, absent staff | New bookings blocked; existing appointments retained for manual resolution |
| No available slots | Explicit empty slot option; submission fails safely |
| Reschedule conflict | Old booking retained; mutation is saved only after validation succeeds |
| Reschedule after check-in | Rejected |
| Cancellation | Confirmation; frees appointment interval; terminal record retained |
| Early or wrong-day check-in | Rejected |
| Queue paused or at capacity | New check-ins rejected; existing service can continue |
| Staff already serving someone | Additional service start blocked |
| Late arrival | Same-day check-in allowed after scheduled time; reception decides whether to accept or mark no-show |
| No-show | 15-minute grace period; terminal transition |
| Queue ticket reuse after cancellation | Maximum allocated ticket retained, so next check-in gets a new number |
| Multiple staff | Independent service starts; FIFO check-in order displayed; staff can choose eligible customer |
| Incorrect status transition or missing record | Rejected |
| Offline | Writes blocked; reconnect notice; no false booking-success message |
| Storage unavailable or full | Save errors shown; no success confirmation |
| XSS through customer fields | User text escaped before HTML rendering |
| Search and empty day | Explicit no-results state; searchable name, phone and staff |
| All statuses | Scheduled/waiting/completed tabs and remaining-status selector |
| Holiday changes affecting existing bookings | Existing bookings preserved; warning to review and contact customers |
| Capacity lowered below current queue | Existing customers retained, new check-ins blocked until below capacity |
| Midnight and timezone changes | Uses current device-local date; business timezone/server time pending Firebase |
| DST transitions | Pending production business-timezone backend |
| Authentication expiry, abuse, tenant leakage | Pending Firebase; customer preview explicitly shares local demo data |
| Reminders, SMS failures and opt-outs | Not implemented; app explicitly states no reminders sent |
| Payments, deposits, refunds, multi-branch and subscriptions | Outside this demo; not presented as functional |
| Accessibility | Labeled inputs, native dialogs, visible focus, live status messages, responsive layout; no formal audit |
