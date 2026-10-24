# Agent Instructions

## Project

This repository is the React/Vite frontend for **E-Teller Bank Mini Sekolah**. It consumes the Laravel API in `../backend` for authentication, role-based access control, customer accounts, deposits, withdrawals, daily reports, accounting journals, and audit-sensitive data.

The backend is the security boundary and source of truth. Frontend checks improve usability only; they must never be treated as authorization, validation, or transaction-integrity controls.

## Verified Stack

- React `19.3.0`
- Vite `8.2.0`
- React Router DOM `7.18.4`
- Axios `1.20.0`
- Tailwind CSS `4.3.3`
- Lucide React `1.49.0`
- API prefix: `/api`
- Backend reference: `../backend/agent.md`

Before relying on a package API, verify the installed version in `package.json`.

## Working Rules

- Read the owning component, API client, route configuration, nearby components, and relevant backend contract before changing behavior.
- Keep changes focused and preserve existing routes, API payloads, and visual conventions unless a requirement explicitly changes them.
- Reuse existing components, utilities, icons, and API helpers before creating new abstractions.
- Keep business rules and sensitive validation enforced by the Laravel backend. The frontend may provide early feedback but must handle server rejection correctly.
- Do not invent business rules when requirements are undefined. Mark the decision `UNDEFINED/PENDING` and ask before implementing it.
- Do not modify dependencies without approval, commit changes, or edit generated/vendor files.
- Do not expose passwords, PINs, tokens, secrets, or sensitive financial data in UI text, logs, URLs, analytics, or error messages.

## Roles And UI Access

The backend roles are `administrator`, `teller`, and `supervisor`; customers are authenticated separately. Keep navigation and page visibility aligned with backend authorization, but assume a user can call every API route directly.

- Administrator: user management, customer management, and journal auditing.
- Teller: customer lookup, deposits, withdrawals, and daily reports.
- Supervisor: daily-report approval and journal/audit access.
- Customer: own balance, own transactions, and transaction confirmation only.

Never hide a button as the only protection. Handle `401`, `403`, `404`, `409`, `422`, `429`, and `5xx` responses explicitly and without leaking server internals.

## API And State

- Use the existing Axios/API helper and its authentication configuration; do not create parallel clients without approval.
- Await mutations before showing success, changing local state, or reloading. Prevent duplicate submissions with pending state.
- Treat API responses as untrusted and validate the shape needed by the component before rendering or using it.
- Never calculate authoritative balances, journal totals, permissions, approval states, or transaction results only in the browser.
- Do not put sensitive values in query strings, route parameters, local storage, session storage, or browser logs. Prefer the existing secure authentication flow and follow the backend token/cookie contract.
- Keep error messages useful to the user but generic enough not to reveal SQL, stack traces, paths, tokens, account existence, or private data.

## Standard Cybersecurity Defense

Apply defense in depth and use maintained framework/library protections. These rules are defensive coding requirements, not permission to implement offensive testing against systems without authorization.

### XSS And Unsafe Rendering

- Render user/API values as text through normal React rendering. Do not use `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval`, dynamic script/style injection, or string-based event handlers.
- If the product explicitly requires user-authored HTML, sanitize it with a maintained sanitizer at the rendering boundary and add tests for malicious markup. Do not rely on a generic filter or Content Security Policy alone.
- Validate external and user-controlled URLs before using them in `href`, `src`, redirects, images, or downloads. Allow only approved `https` destinations and reject `javascript:`, `data:`, unexpected schemes, and untrusted hosts.
- Do not interpolate untrusted data into CSS, HTML attributes with code meaning, JavaScript source, or DOM selectors.
- Keep security headers, CSP, clickjacking protection, and cookie attributes configured by the deployment/backend; do not weaken them to make a component work.

### Tokens, JWT, And Sessions

- Prefer the existing Laravel Sanctum flow. Do not introduce custom JWT handling without approval.
- If JWT is ever required, verify the signature, fixed allowed algorithm, issuer, audience, expiry, not-before, and required claims. Never accept `alg: none`, select an algorithm from the token, trust unverified claims, or place secrets in the payload.
- Never log or expose access tokens, refresh tokens, signing keys, passwords, PINs, or full authentication responses. Do not store secrets in source control.
- On logout, expiry, password change, account blocking, or `401`, clear client authentication state according to the existing flow and redirect safely without an open redirect.
- Do not infer authorization by decoding a token on the client. The API response is authoritative.

### Injection And Input Handling

- Do not construct SQL, shell commands, regular expressions, HTML, template expressions, or JavaScript from user input in frontend code.
- Encode query parameter values with URL APIs and use fixed route paths. Do not concatenate arbitrary URLs or pass user values into navigation without validation.
- Use allowlists for client-side option values such as sort fields, filters, roles, statuses, and transaction types. Still expect the backend to reject invalid values.
- Do not trust client-provided IDs, roles, status, balances, totals, or hidden form fields.

### CSRF, CORS, And Network Requests

- Preserve the existing Axios credential and CSRF configuration. Do not disable CSRF protection, `withCredentials`, TLS verification, or certificate validation to fix a local request problem.
- Do not add wildcard CORS workarounds or send credentials to untrusted origins.
- Use HTTPS in deployed environments and never put credentials or tokens in URLs.
- Do not add client features that make arbitrary server-side URL requests; SSRF must be prevented and controlled by the backend.

### Abuse And Business Logic

- Disable or guard buttons during mutations and handle retries safely. A reload or repeated click must not create duplicate deposits, withdrawals, approvals, or report submissions.
- For money movement and approval actions, show server-confirmed results and preserve idempotency/request identifiers when the backend supports them.
- Do not bypass minimum balance, PIN, role, report approval, immutable transaction, or account-status rules in the UI.
- Display only the current actor's permitted data and do not rely on route obscurity for IDOR/BOLA protection.

### Files, Downloads, And Third-Party Content

- Treat uploaded files, downloaded files, filenames, MIME types, and preview content as untrusted. The backend must validate and scan files; the frontend must not execute or inject file content.
- Use safe download behavior, fixed filenames where possible, and validate download origins. Do not render arbitrary HTML/SVG/PDF content inline without an approved security design.
- Keep third-party scripts and packages minimal, pinned through the lockfile, and reviewed before adding them.

### Errors, Logging, And Dependencies

- Do not log request headers, authorization values, cookies, password/PIN fields, or full API responses. Redact sensitive fields before diagnostic logging.
- Do not display raw Axios errors or server exception messages to users. Show a safe message and preserve actionable details only in controlled development diagnostics.
- Keep React, Vite, Axios, router, and other dependencies patched. Review lockfile changes and run available dependency audits.
- Do not commit `.env` files or expose `VITE_` variables that contain secrets; frontend build variables are public to anyone who can load the bundle.

## Accessibility And UX

- Preserve keyboard access, semantic controls, focus states, readable contrast, responsive layouts, and clear loading/empty/error states.
- Use icons from the existing icon library with accessible labels or tooltips where needed.
- Do not use a browser reload as a substitute for correct local state management unless the requested workflow requires a full refresh.

## Testing And Verification

Every behavior change must be programmatically checked. Prefer the smallest relevant commands:

```bash
npm run lint
npm run build
```

For security-sensitive UI changes, verify at minimum:

- unauthenticated, forbidden-role, expired-session, and blocked-user states;
- `401`, `403`, `404`, `409`, `422`, `429`, and server-error handling;
- duplicate-click/retry behavior for mutations;
- safe rendering of malicious text and URLs;
- no sensitive values in browser logs, URLs, rendered markup, or built client environment variables;
- server-side authorization remains required even when UI controls are hidden.

Use OWASP Top 10 and the OWASP Cheat Sheet Series as defensive references, especially the XSS, SQL Injection, Authentication, Authorization, JWT, CSRF, SSRF, File Upload, REST Security, Mass Assignment, Logging, and Vulnerable Dependency guidance.

## Change Workflow

1. Identify the owning component, API helper, route, and nearest test or reproducible UI path.
2. Read the corresponding backend contract in `../backend` when request fields, permissions, or business rules are involved.
3. State the smallest behavior change needed and preserve existing user changes.
4. Implement only the required files.
5. Run the focused lint/build or relevant test immediately.
6. Re-check API error handling, authorization assumptions, and sensitive-data exposure.
7. Report changed files, verification results, and unrelated pre-existing failures.

Do not begin the next use case until the current behavior is tested and stable.
