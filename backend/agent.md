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
