# Repository Instructions

## Frontend And UI Work

- Follow `DESIGN_GUIDE.md` for all frontend, visual design, layout, styling, and UI/UX work.
- Independently choose polished, familiar interface patterns appropriate to the page's purpose. The user should not need to name another product to establish the expected quality bar.
- Treat external products as optional inspiration only. Do not copy their branding, proprietary assets, or layouts literally.
- Treat UI tasks as UI-only unless the user explicitly asks for backend or data changes.
- Do not change backend routes, API behavior, auth logic, session behavior, or database schema during UI work.
- Preserve existing functionality, navigation, form behavior, auth checks, and service calls.
- Prefer reusable components and shared styles over one-off page-specific styling.
- Keep changes scoped to the requested UI surface.
- Inspect adjacent screens and all page states before designing so the result feels complete rather than like isolated styled markup.

## Engineering Expectations

- Match existing project patterns before introducing new abstractions.
- Keep business logic separate from visual styling.
- Use accessible semantic HTML for forms, buttons, navigation, and page structure.
- Run available verification commands after changes, such as typecheck, build, and lint.
- If a command is unavailable or fails for reasons outside the change, note that clearly.

## Final Response Expectations

- Summarize changed files.
- Explain behavior impact, especially whether functionality changed or stayed the same.
- Mention verification commands run and their result.
