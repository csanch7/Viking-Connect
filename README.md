# Viking Connect -- https://www.vikingconnect.org/

An alumni mentorship platform for connecting St. Laurence students and alumni
with approved mentors. The application includes member registration, admin
approval, mentor and mentee directories, profile management, password recovery,
mentorship topics, and email notifications.

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
- `APP_URL` — required HTTPS production origin used in notification links
- `AWS_REGION` — required in production; AWS Region containing the verified Amazon SES identity
- `SES_FROM_EMAIL` — required SES-verified production sender
- `ADMIN_NOTIFICATION_EMAIL` — required comma-separated admin notification recipients
- `CONTACT_EMAIL` — required comma-separated contact form recipients
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — optional when the runtime
  does not already have an IAM role; loaded through the standard AWS credential
  chain

Production startup fails when its public URL or email configuration is missing
or malformed. Outside production, email delivery is skipped when its SES
settings are incomplete. Before sending to users, verify the sending domain in
SES and request production access for the selected Region.

## Database migrations

Ordered SQL migrations live in `backend/migrations`. The server records applied
migrations in `schema_migrations`. Local development runs pending migrations when
the backend starts. Production migrations are a separate deployment step so a
failed migration stops the release before the new application version starts.
Add schema changes as a new numbered SQL file; never edit a migration that has
already reached a shared environment.

After building the backend, run production migrations with:

```sh
cd backend
npm run migrate
```

To run them directly from TypeScript during local development:

```sh
cd backend
npm run migrate:dev
```

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
the backend, run migrations, and start the server:

```sh
cd frontend && npm ci && npm run build
cd ../backend && npm ci && npm run build
npm run migrate
npm start
```

On a paid Render web service, set the service's **Pre-Deploy Command** to
`npm run migrate --if-present` when its Root Directory is `backend`, or
`cd backend && npm run migrate --if-present` when the Root Directory is the
repository root. The `--if-present` flag keeps older releases that predate the
migration script deployable; when the script exists, migration failures still
cancel the deployment. Render runs this command after the build and before the
new version starts.

Render's free web service does not support a pre-deploy command. For that plan,
append the migration to the service's existing **Build Command** after the
backend build completes. For example, if the Root Directory is the repository
root:

```sh
cd frontend && npm ci && npm run build && cd ../backend && npm ci && npm run build && npm run migrate
```

Production server startup does not run migrations automatically. Configure one
of these deployment commands before shipping a migration newer than the one
already applied to the production database.

Runtime endpoints:

- `GET /api/health` — process liveness
- `GET /api/ready` — database readiness

After a production deployment, verify both endpoints with:

```sh
cd backend
npm run smoke:production
```

The command uses `APP_URL`, fails on a non-200 response or an unexpected JSON
status, and times out each request after ten seconds. Render's Health Check Path
should be `/api/ready` so a new instance must reach PostgreSQL before it is
considered ready.

The server emits structured JSON logs with request IDs and supports graceful
shutdown on `SIGTERM` and `SIGINT`.

### Performance follow-ups

The current architecture is appropriate for the initial school launch and a
single Render instance. Revisit the following items as traffic and membership
grow:

- split frontend routes into lazy-loaded chunks;
- give content-hashed JavaScript and CSS assets long-lived immutable caching;
- avoid returning the entire college catalog before a visitor starts searching;
- re-profile and optimize recommendation queries when the member count reaches
  the thousands; and
- run a staging load test before planning for hundreds of simultaneous users.

These are scaling improvements rather than launch blockers. Continue watching
Render CPU and memory, database latency, API error rates, and p95 response times
after launch.

## Pull requests

GitHub Actions must pass backend tests/typecheck/build and frontend
lint/build/Playwright checks. Pull requests should describe the change, list
the verification performed, and call out database migrations, environment
variable changes, API contract changes, and deployment considerations.

## License

Copyright (c) 2026 Christopher Sanchez. All rights reserved. The source is
publicly viewable for evaluation, but reuse, modification, and redistribution
require prior written permission. See [LICENSE](LICENSE) for the complete terms.
