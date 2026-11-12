# UKK Hore Frontend

This folder contains the React + Vite frontend for the UKK Hore / E-Teller Bank Mini Sekolah application. It is the client layer for the Laravel backend in the sibling `backend` directory and provides role-based screens for administrators, tellers, supervisors, and customer-facing flows.

## Overview

The frontend handles:

- Authentication and password recovery flows
- Dashboard views by user role
- User and account management
- Teller transaction workflows
- Daily reports and report detail screens
- Journaling and audit-related views
- PIN request handling and export/filter operations
- Realtime updates through Echo / Pusher integration

## Tech Stack

- React 19
- Vite 8
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React
- ExcelJS for spreadsheet exports
- QR scanner support for customer/account workflows

## Project Structure

```text
frontend/
├── public/                  # Static assets
├── src/
│   ├── api/                # API helpers and axios config
│   ├── assets/             # Icons and images
│   ├── components/         # Shared UI and route wrappers
│   ├── config/             # Sidebar/menu configuration
│   ├── hooks/              # Reusable custom hooks
│   ├── pages/              # Route-level screens
│   ├── utils/             # Helpers and formatters
│   ├── App.jsx            # Main router and route protection
│   ├── main.jsx           # App bootstrap
│   └── index.css          # Global styles
├── .env                    # Local environment configuration
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── public/
```

## Roles and Access

The app enforces role-based access in the frontend, while the backend remains the authoritative source for authorization and business rules.

- Administrator / Admin: users, customers, journals, PIN requests
- Teller: customer transactions, daily reports, account-related flows
- Supervisor: reports, journal/audit views, supervisor transactions
- Customer-facing flows: authentication and account-specific actions via the backend

## Environment Variables

Create or update the local environment file before starting development:

```env
VITE_API_URL=http://localhost:8000

VITE_REVERB_APP_KEY=ptuazi5dydj7talxi9gy
VITE_REVERB_HOST=localhost:8080
VITE_REVERB_PORT=443
```

If your backend runs on a different host or port, update `VITE_API_URL` accordingly.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local Vite URL shown in the terminal.

## Available Scripts

```bash
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # run ESLint checks
```

## Main Application Routes

- `/login` — login screen
- `/forgot-password` — password recovery
- `/reset-password` — reset password flow
- `/` — dashboard
- `/users` and `/user/add` — user management
- `/accounts` and `/account/add` — customer management
- `/transactions` — teller transactions
- `/supervisor/transactions` — supervisor transactions
- `/reports` and `/report/:report_id` — reporting screens
- `/journals` — journals and audit data
- `/pin-requests` — PIN-related requests

## Backend Dependency

This frontend expects the Laravel API backend to be running and reachable through `VITE_API_URL`. The backend is responsible for authentication, permissions, validation, account safety, and transaction integrity.

## Security Notes

- Frontend role checks are for UX only; the backend is the source of truth.
- Do not expose secrets or tokens in source control or UI logs.
- Keep `.env` values local and do not commit sensitive deployment config.
- Treat all API data as untrusted and validate it before rendering or using it.

## Notes

This repository is structured as a monorepo with a separate backend service. To run the full app end-to-end, start both the backend and the frontend together.

