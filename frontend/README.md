# Frontend

The frontend is a React and TypeScript application built with Vite. It uses
React Router for navigation, TanStack Query for server state, and Playwright
for end-to-end and accessibility coverage.

Project-wide setup, environment variables, and production instructions are in
the repository [README](../README.md). Frontend work should also follow the
[design guide](../DESIGN_GUIDE.md) and
[UI/UX review checklist](../UI_UX_REVIEW_CHECKLIST.md).

Common commands:

```sh
npm run dev
npm run lint
npm run build
npm run test:e2e
```

The development server proxies `/api` requests to `http://localhost:3000`.
Production builds are written to `../backend/dist` so the Express server can
serve the application.
