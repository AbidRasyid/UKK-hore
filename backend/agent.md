# Agent Instructions

## Project

This repository is the Laravel API backend for **E-Teller Bank Mini Sekolah**, a school banking and student savings system.

The backend is responsible for authentication, role-based access control, customer accounts, deposits, withdrawals, daily reports, accounting journals, and audit-sensitive data. The React frontend is outside this repository and must not be assumed to enforce backend rules.

## Verified Stack

- Laravel Framework `13.23.0`
- PHP constraint: `^8.3.36`; local CLI currently runs PHP `8.5.12`
- Laravel Sanctum `4.3.3`
- Laravel Reverb `1.11.1`
- Pest `5.0.3`
- Laravel Pint `1.30.3`
- Database configuration supports the project's configured MySQL/SQLite environments
- API prefix: `/api`
- API testing is done with Postman

Before relying on a package API, verify the installed version with `composer show --direct` or `composer show vendor/package`.

## Working Rules

- Read the relevant controller, model, request, enum, migration, route, and nearby test before changing behavior.
- Keep changes focused and preserve existing API contracts unless a requirement explicitly changes them.
- Follow the existing directory structure and naming conventions.
- Prefer Laravel Form Requests for non-trivial validation.
- Keep business logic in the appropriate service, controller, model, request, or enum boundary; do not duplicate it in routes.
- Use existing enums instead of repeating role, status, transaction type, report status, or account code strings.
- Do not invent business rules when the requirements are undefined. Mark the decision as `UNDEFINED/PENDING` and ask before implementing it.
- Do not revert unrelated user changes, commit changes, or edit generated/vendor files.
- Never expose passwords, PINs, tokens, or secrets in responses, logs, tests, or documentation.
- Do not modify dependencies without approval.
- Treat the backend as the security boundary. Frontend validation, hidden fields, route visibility, and role checks are never authorization controls.
- For every security-sensitive change, identify the threat, the server-side control, and a regression test before implementation.

When the developer asks for manual coding, show the complete proposed change and wait for the developer to apply it and run the tests. Otherwise, make the requested repository edit directly.

## Current Enums

Use the enum cases under `app/enum` as the source of truth:

- `UserRole`: `administrator`, `teller`, `supervisor`
- `Status`: `active`, `inactive`, `blocked`
- `TransactionTypes`: `deposit`, `withdrawal`
- `ReportStatus`: `draft`, `approved`, `rejected`
- `AccountCode`: `101` for cash and `201` for savings

Models such as `User` and `Customer` cast role/status and sensitive fields to enums or hashed values. Compare cast attributes with enum cases, not raw strings.

## Authentication And Authorization

- Staff endpoints use `auth:sanctum` and the existing `role` middleware.
- Customer endpoints use the existing `auth:customer` middleware.
- Never trust frontend-only role checks.
- Authorize every object lookup and mutation for the authenticated actor; do not use an unscoped model lookup that can expose another user's record.
- Preserve the current role boundaries:
	- Administrator: user management, customer management, and journal auditing.
	- Teller: customer lookup, transactions, and daily reports.
	- Supervisor: daily-report approval and journal/audit access.
	- Customer: own balance, own transactions, and transaction confirmation only.

## Current API Routes

Confirm routes with `php artisan route:list`; the current user and customer routes are:

```text
POST   /api/login
POST   /api/customer/login
GET    /api/me
GET    /api/users
GET    /api/user/{user_id}
POST   /api/users
PATCH  /api/user/{user_id}/edit
GET    /api/customers
GET    /api/customer/{customer_id}
POST   /api/customers
PATCH  /api/customer/{customer_id}/edit
DELETE /api/customer/{customer_id}/delete
```

Other route groups cover teller transactions, daily reports, supervisor approval, and customer transaction confirmation. Do not rename or duplicate routes without an explicit requirement and route verification.

## User Management

The current implementation uses `UserController`, `UserRequest`, `User`, and the routes above. Keep status defaulting to `active` when creating a user unless the requirement changes. User updates may change the fields supported by the current validation rules, including username, password, fullname, role, and status.

When a user has the `teller` role, preserve the related `Teller` record behavior. Because `User::$casts` casts `role` to `UserRole`, use `UserRole::TELLER` for comparisons.

## Customer Accounts

The current `Customer` model uses these fields:

- `user_id`
- `account_number`
- `student_id`
- `student_name`
- `student_class`
- `balance`
- `password`
- `pin`
- `status`

The current model hides `balance`, `password`, and `pin`; do not expose them accidentally through API responses. Account-number generation, immutability, and class/major movement rules must follow the existing migrations and requirements. If a rule is not defined by the project, leave it pending instead of guessing.

## Transaction And Accounting Rules

- A successful deposit or withdrawal must update the balance, transaction record, and accounting journals atomically with `DB::transaction()`.
- Amounts must be positive and use integer Rupiah values.
- A withdrawal must leave at least Rp10.000 in the account; a balance exactly Rp10.000 cannot be withdrawn.
- Customer PINs are six digits, stored hashed, and never returned or logged.
- Teller users cannot edit or delete completed transactions.
- Every successful transaction creates two journal entries:
	- Deposit: debit cash, credit customer savings.
	- Withdrawal: debit customer savings, credit cash.
- Preserve existing transaction and journal relationships and verify both sides when changing transaction logic.

## Daily Reports

The daily-report workflow is teller submission followed by supervisor review and approval/rejection. Preserve one-by-one approval and role restrictions. Do not add delegation, automatic approval, or new report states without an explicit requirement.

## Database Integrity

- Preserve foreign keys, unique constraints, enum values, and non-null requirements.
- Use `ON DELETE RESTRICT` where the existing schema or requirement protects referenced financial records.
- Do not solve a migration problem by weakening financial data constraints.
- SQLite may not support every MySQL migration operation, especially `ALTER TABLE ... ADD CONSTRAINT`; handle such differences conditionally when tests require SQLite compatibility.
- Check existing migrations and `docs/ERD.md` before changing schema relationships.

## Use-Case Requirements

The project requirements below are the target contract. If the current implementation differs, inspect existing tests and routes first, then make the smallest compatible change. Do not silently invent behavior where the requirements say `UNDEFINED/PENDING`.

### UC-02 User Management

- Actor: administrator.
- Authorization: `auth:sanctum` plus the existing administrator role middleware.
- Target endpoints:
	- `GET /api/admin/users`
	- `POST /api/admin/users`
	- `GET /api/admin/users/{id}`
	- `PUT /api/admin/users/{id}`
	- `DELETE /api/admin/users/{id}`
- Create fields: `name`, `username`, `full_name`, `email`, `password`, `password_confirmation`, and `role`.
- Creation rules: unique username and email, password at least 8 characters and confirmed, role limited to administrator/teller/supervisor, and status defaults to active.
- Updates may change name, username, full name, email, password, role, and status. Status is limited to active or blocked.
- A referenced user cannot be deleted; return HTTP 409 with a clear message. Blocking is a separate non-delete operation.

### UC-03 Customer Accounts

- Actor: administrator.
- Authorization: `auth:sanctum` plus the existing administrator role middleware.
- Target endpoints: `GET/POST /api/admin/customers` and `GET/PUT /api/admin/customers/{id}`. There is no customer delete endpoint in this use case.
- Create fields: `student_number`, `student_name`, `class_id`, and a six-digit `security_pin`.
- The server generates `account_number`, initializes balance to zero, and sets status to active. The client must not submit the account number.
- `account_number` and `student_number` are immutable during update.
- Account format is `[MAJOR_CODE][3-digit sequence]`, with a sequence per major. Lock the selected major row with `lockForUpdate()` inside the transaction before calculating the next sequence, and retain the unique database constraint as final protection.
- Official major codes are `AK`, `BR`, `BD`, `MP`, `DKV`, `RPL`, and `TKJ`. Do not invent official major names.
- Moving a class across majors is `UNDEFINED/PENDING`; ask before choosing whether to reject it, retain the account number, or regenerate it.

## Standard Cybersecurity Defense

Apply defense in depth and use Laravel's maintained security mechanisms. These controls prevent common attack classes; they do not replace threat modeling, code review, dependency updates, or focused security tests.

### Injection And Unsafe Input

- SQL injection: use Eloquent/query-builder bindings or prepared statements. Never concatenate request data into SQL, table names, column names, `orderBy`, raw expressions, or pagination clauses. If a dynamic identifier is unavoidable, map a small allowlist of application-defined values to fixed identifiers.
- NoSQL, LDAP, XPath, template, and expression injection: use the library's parameterized APIs, strict allowlists, and fixed templates. Never evaluate request data as PHP, Blade, JavaScript, a regular expression, or a shell command.
- OS command injection: avoid shell execution. If unavoidable, use a fixed executable and argument array supplied by code, strict input validation, least privilege, and a test that rejects unexpected input.
- Mass assignment: use explicit `$fillable` or `$guarded` protections and validated request data. Never pass the whole request into `create()` or `update()` when it contains authorization-sensitive fields such as role, status, balance, or ownership.

### XSS And Browser Attacks

- Treat all request, database, log, and third-party values as untrusted when they reach a browser.
- Return JSON with the correct `Content-Type`; do not build HTML from untrusted input in the API.
- In the React client, use normal text rendering and avoid `dangerouslySetInnerHTML`, `innerHTML`, inline event-handler strings, `eval`, and dynamic script/style injection. If user-authored HTML is required, sanitize it with a maintained sanitizer at the rendering boundary.
- Validate untrusted URLs with an allowlist of `https`/approved hosts before placing them in links, redirects, images, or network requests. Do not rely on a generic string filter or CSP alone.
- Protect cookie-based flows with Laravel's CSRF mechanism, `Secure`, `HttpOnly`, and appropriate `SameSite` attributes. Add clickjacking and security headers as appropriate for the deployment.

### Tokens, JWT, Sanctum, And Sessions

- Prefer Laravel Sanctum and server-managed token/session behavior already used by this project. Do not introduce custom JWT handling without approval.
- If JWT is ever required, verify the signature, fixed allowed algorithm, issuer, audience, expiry, not-before, and required claims; never accept `alg: none`, choose an algorithm from the token, trust unverified claims, or put secrets in the payload. Use short-lived access tokens, secure refresh-token rotation/revocation, and key rotation.
- Never store access tokens, refresh tokens, passwords, PINs, or signing keys in logs, source control, query strings, or client-visible error messages. Keep secrets in environment/secret management and rotate compromised secrets.
- Invalidate or rotate sessions/tokens after password changes, logout, account blocking, or other risk events. Do not reveal whether a username exists through authentication error messages.
- Apply rate limiting to login, password/PIN verification, recovery, token issuance, and expensive endpoints. Defend against brute force, password spraying, credential stuffing, and resource exhaustion without creating an account-lockout denial of service.

### Authorization And Business Logic

- Enforce least privilege and deny by default. Test allowed and forbidden role combinations, including direct API calls that bypass the UI.
- Prevent IDOR/BOLA by scoping every resource to the authenticated actor or checking explicit policy authorization before returning or mutating it.
- Re-check ownership, role, status, amount, account state, and transaction invariants inside the service/database transaction. Do not trust client-calculated balances, permissions, totals, or approval states.
- Make money movement idempotent where retries are possible, use database transactions and appropriate row locks, and prevent replay or double submission of sensitive operations.
- Do not allow approval by the same actor who created a report when the requirement separates those duties.

### SSRF, Files, Parsing, And Redirects

- Do not accept arbitrary URLs for server-side fetching. Prefer an explicit host allowlist, fixed scheme/port/path, validated destination IP, disabled redirects, timeouts, response-size limits, and network egress restrictions. Never allow access to localhost, private/link-local ranges, cloud metadata services, or internal services unless explicitly required and controlled.
- For file uploads, allowlist extensions and MIME types, validate file signatures, enforce size/count limits, generate storage names, store outside executable/public paths where possible, and never trust the client filename. Scan files when the deployment supports it.
- Parse XML/archives with external entities and dangerous protocols disabled. Reject decompression bombs, oversized JSON, deeply nested input, and unsafe serialized objects. Do not unserialize untrusted PHP data.
- Use fixed internal redirect destinations or validate same-origin paths. Never redirect to a user-supplied arbitrary URL.

### Errors, Logging, Dependencies, And Operations

- Return generic production errors; never expose stack traces, SQL, filesystem paths, tokens, credentials, or sensitive personal/financial data.
- Log security-relevant events such as authentication failures, authorization failures, blocking/unblocking, password changes, PIN failures, report approval, and transaction anomalies with actor, target, outcome, and correlation context, but never log secrets or full PIN/password/token values.
- Use HTTPS in deployed environments, validate CORS origins explicitly, and configure security headers and trusted proxy settings correctly. Do not use wildcard origins with credentials.
- Keep Laravel, PHP, Composer, npm, and direct/transitive dependencies patched. Review lockfile changes, run dependency audits where available, and remove unused packages.
- Use least-privilege database and operating-system accounts. Do not grant the application DBA/root privileges or commit `.env` files, credentials, private keys, or production dumps.

### Security Testing Checklist

For security-sensitive changes, add tests for:

- unauthenticated access and every forbidden role;
- cross-user/object access attempts;
- validation boundaries, mass-assignment fields, and injection-safe query behavior;
- login/token expiry, revocation, rate limiting, blocked users, and generic errors;
- CSRF for cookie-authenticated state changes;
- transaction replay, concurrent updates, minimum balance, journal atomicity, and approval separation;
- malicious text/URL/file input and safe error/log output.

Use OWASP Top 10 and the OWASP Cheat Sheet Series as defensive references, especially the SQL Injection, XSS, Authentication, Authorization, JWT, CSRF, SSRF, File Upload, Mass Assignment, Logging, REST Security, and Vulnerable Dependency guidance.

## Testing And Verification

Every behavior change must be programmatically tested. Prefer a focused Pest feature test, then run the smallest relevant command:

```bash
php artisan test --compact tests/Feature/RelevantTest.php
```

After PHP changes, run:

```bash
vendor/bin/pint --dirty --format agent
```

For route changes, run:

```bash
php artisan route:list --path=api
```

For broader validation, run:

```bash
php artisan test --compact
```

Do not create ad-hoc verification scripts or models in Tinker when an automated test can cover the behavior. Use existing factories and `Sanctum::actingAs()` in feature tests where applicable.

## Change Workflow

1. Identify the owning code path and the nearest test.
2. Check current routes, casts, migrations, and authorization boundaries.
3. State the smallest behavior change needed.
4. Implement only the required files.
5. Run the focused test immediately.
6. Run Pint for modified PHP files.
7. Re-check routes and broader tests when the change affects shared behavior.
8. Report changed files, verification results, and unrelated pre-existing failures.

Do not begin the next use case until the current behavior is tested and stable.
