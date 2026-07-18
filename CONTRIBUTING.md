# Contributing

## Development workflow

1. Create a focused branch from `main`.
2. Keep backend behavior separate from UI-only work.
3. Add or update tests for changed behavior.
4. Run the relevant local checks before opening a pull request.
5. Complete the pull-request template and call out migrations or environment
   changes explicitly.

## Required checks

```sh
cd backend && npm test && npm run typecheck && npm run build
cd frontend && npm run lint && npm run build && npm run test:e2e
```

## Database changes

Create a new ordered file in `backend/migrations`. Migrations must be safe to run
once in every environment and must not depend on application startup order.

## API changes

Update `shared/contracts.ts`, backend response behavior, frontend runtime
parsers, backend integration tests, and Playwright mocks together.

## UI changes

Follow `DESIGN_GUIDE.md`, preserve keyboard and screen-reader behavior, and
verify both desktop and mobile Playwright projects.
