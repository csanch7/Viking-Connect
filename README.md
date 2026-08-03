# Viking Connect -- https://www.vikingconnect.org/

An alumni mentorship platform for connecting St. Laurence students and alumni
with approved mentors. The application includes member registration, admin
approval, mentor discovery, profile management, and email notifications.

## Architecture

- `frontend/` — React, TypeScript, Vite, and Playwright
- `backend/` — Express, TypeScript, PostgreSQL/Neon, and server-side sessions
- `shared/` — shared API contracts and runtime response validation
- `.github/` — CI, dependency updates, and contribution templates

## Requirements

- Node.js 24
- npm
- A PostgreSQL-compatible database, such as Neon

## Local setup

1. Copy `.env.example` to `.env` and provide the required values.
2. Install dependencies:

   ```sh
   cd backend && npm ci
   cd ../frontend && npm ci
   ```

3. In separate terminals, start the backend and frontend:

   ```sh
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

The frontend development server proxies `/api` requests to
`http://localhost:3000`.

## Environment variables

- `DATABASE_URL` — required PostgreSQL connection string
- `SESSION_SECRET` — required in production; use a long random value
- `NODE_ENV` — set to `production` in production
- `PORT` — backend port, default `3000`
- `APP_URL` — public application URL used in notification links
- `RESEND_API` — optional Resend API key
- `FROM_RESEND_EMAIL` — optional verified sender
- `TO_RESEND_EMAIL` — optional admin notification recipient
- `TO_CONTACT_US_EMAIL` — optional contact form recipient

Registration email is skipped when its Resend settings are incomplete. Contact
form delivery requires `RESEND_API`, `FROM_RESEND_EMAIL`, and
`TO_CONTACT_US_EMAIL`.

## Database migrations

Ordered SQL migrations live in `backend/migrations`. The server records applied
migrations in `schema_migrations` and runs pending migrations before accepting
traffic. Add schema changes as a new numbered SQL file; never edit a migration
that has already reached a shared environment.

## Verification

Backend:

```sh
cd backend
npm test
npm run typecheck
npm run build
```

Frontend:

```sh
cd frontend
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright runs page behavior, mobile viewport, and accessibility checks with
mocked API responses. Backend HTTP integration tests exercise Express,
validation, sessions, authorization, and routing with injected repositories.

## Production

Build the frontend first so its output is written to `backend/dist`, then build
and start the backend:

```sh
cd frontend && npm ci && npm run build
cd ../backend && npm ci && npm run build && npm start
```

Runtime endpoints:

- `GET /api/health` — process liveness
- `GET /api/ready` — database readiness

The server emits structured JSON logs with request IDs and supports graceful
shutdown on `SIGTERM` and `SIGINT`.

## Pull requests

GitHub Actions must pass backend tests/typecheck/build and frontend
lint/build/Playwright checks. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
expected workflow.
