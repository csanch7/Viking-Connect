# Design Guide

## Product Feel

This app is a school alumni mentorship platform. The interface should feel trustworthy, simple, polished, and welcoming. It should help students, mentors, and administrators complete tasks with confidence.

Avoid generic AI SaaS visuals, loud gradients, glossy effects, excessive decoration, and overdesigned hero sections. Favor calm structure, clear hierarchy, readable forms, and practical screens.

## Quality Bar

- Aim for the finish of a mature, production-grade networking or productivity product without requiring the user to provide a visual reference.
- Start from the page's job, audience, information density, and primary action, then choose familiar interaction patterns that make those tasks easy.
- Make screens feel intentionally composed rather than like raw data placed inside generic cards.
- Use hierarchy, spacing, typography, alignment, and interaction feedback to create polish before adding decoration.
- Study existing application patterns and improve them consistently across the requested surface instead of introducing a disconnected visual language.
- External products may inform broad usability conventions, but do not copy their branding, proprietary assets, or layouts literally.

## Layout

- Design mobile-first, then enhance for tablet and desktop.
- Use generous whitespace so pages feel organized, not crowded.
- Prefer clear page sections with predictable alignment.
- Use card-based layouts for profiles, mentor listings, admin review items, dashboards, and form containers.
- Keep cards simple: subtle borders, restrained shadows, and consistent padding.
- Use consistent max-width containers so content does not sprawl on wide screens.

## Spacing

Use a consistent spacing scale:

- `4px` for tiny gaps.
- `8px` for compact internal spacing.
- `12px` for small grouped elements.
- `16px` for standard component spacing.
- `24px` for card padding and section gaps.
- `32px` for larger layout separation.
- `48px` and `64px` for major page sections.

Do not rely on arbitrary one-off spacing values unless the design clearly needs them.

## Typography

- Use a clear typography hierarchy: page title, section heading, body text, supporting text, labels.
- Keep body text readable and avoid tiny text for important information.
- Use font weight and size to create hierarchy before adding decorative treatments.
- Keep line lengths comfortable, especially on desktop.
- Avoid oversized headings inside compact cards or admin tools.

## Color And Surfaces

- Use a professional, restrained palette suitable for education and alumni networking.
- Use the St. Laurence-inspired app color scheme as the primary visual reference:
  - Black for headers, navigation, strong text, and high-emphasis surfaces.
  - Golden yellow for primary brand accents, calls to action, selected states, and key dividers.
  - White and warm off-white for page backgrounds and cards.
  - Neutral gray for secondary text, form borders, inactive controls, and supporting surfaces.
  - Use small amounts of muted orange only when a warmer school-spirit accent is useful.
- Use color to communicate state: success, warning, error, pending, selected, disabled.
- Keep backgrounds quiet and readable.
- Use subtle borders and soft shadows to separate surfaces.
- Avoid large gradient backgrounds, decorative blobs, and high-contrast visual noise.
- Avoid introducing unrelated palettes such as purple SaaS gradients, teal-heavy dashboards, or blue corporate themes.

## Components

- Prefer reusable components for buttons, cards, form fields, page headers, status badges, loading states, empty states, and error messages.
- Reuse a component only when it represents a genuinely repeated pattern; avoid forcing every piece of content into a card.
- Buttons should clearly communicate primary, secondary, and destructive actions.
- Links should be visually identifiable and keyboard accessible.
- Status badges should use consistent colors and labels across the app.
- Keep interaction states consistent: hover, focus, active, disabled, loading.

## Forms

- Forms must be accessible and easy to scan.
- Use visible labels for inputs, not placeholder-only labels.
- Group related fields.
- Show clear validation, error, and success messages.
- Make submit buttons easy to find.
- Preserve existing form behavior and API calls unless explicitly asked to change them.

## Responsiveness

- Every screen should work cleanly on mobile widths.
- Avoid horizontal scrolling.
- Stack dense layouts on small screens.
- Keep tap targets comfortable.
- Ensure nav, forms, cards, and action buttons remain usable on phones.

## States

Design all expected UI states:

- Loading states while data is being fetched.
- Empty states when lists have no content.
- Error states when requests fail.
- Success states after important actions.
- Disabled states when actions are unavailable.

Before considering a screen complete, verify that its default, loading, empty, error, success, and disabled states feel like parts of the same designed experience.

## Accessibility

- Use semantic HTML.
- Provide accessible labels for inputs and controls.
- Ensure keyboard navigation works for interactive elements.
- Keep focus states visible.
- Maintain sufficient color contrast.
- Do not communicate important information by color alone.
