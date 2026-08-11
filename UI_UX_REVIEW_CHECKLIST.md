# UI/UX Review Checklist

Use this checklist before finishing frontend/UI work.

## Product Quality

- [ ] The screen feels like a complete, production-ready experience rather than styled placeholder markup.
- [ ] The design fits the page's audience, information density, and primary task without requiring an external product reference.
- [ ] Familiar interaction patterns are used where they reduce learning effort.
- [ ] The screen belongs to the existing product while improving its clarity and polish.
- [ ] Decoration supports hierarchy or comprehension instead of competing with the content.

## Layout Hierarchy

- [ ] The primary task on the page is visually clear.
- [ ] Page sections are ordered logically.
- [ ] Cards, panels, and lists have consistent structure.
- [ ] Navigation remains predictable and easy to find.

## Spacing Consistency

- [ ] Spacing follows the project spacing scale.
- [ ] Related elements are grouped closely.
- [ ] Unrelated sections have enough separation.
- [ ] Padding is consistent across similar components.

## Typography

- [ ] Page titles, section headings, labels, and body text have clear hierarchy.
- [ ] Text is readable on mobile and desktop.
- [ ] Important labels and actions are not too small.
- [ ] Long text wraps cleanly without overlapping other UI.

## Mobile Responsiveness

- [ ] The layout works at phone widths.
- [ ] No horizontal scrolling is introduced.
- [ ] Buttons and links have comfortable tap targets.
- [ ] Multi-column layouts stack cleanly.

## Loading States

- [ ] Data-fetching screens show a clear loading state.
- [ ] Buttons show loading or disabled states during submit actions when appropriate.
- [ ] Loading states do not cause large layout jumps.

## Empty States

- [ ] Empty lists explain that there is no content.
- [ ] Empty states provide a useful next action when appropriate.
- [ ] Empty states match the tone of the product.

## Error States

- [ ] Request failures show clear, human-readable messages.
- [ ] Form errors identify what needs to be fixed.
- [ ] Error states do not expose internal implementation details.
- [ ] Users have a clear way to retry or recover.

## Success States

- [ ] Successful actions provide visible confirmation.
- [ ] Success messages are concise.
- [ ] The UI updates to reflect completed actions.

## Accessible Labels

- [ ] Inputs have visible labels.
- [ ] Icon-only buttons have accessible names.
- [ ] Form groups and related controls are understandable to screen readers.
- [ ] Required fields are communicated accessibly.

## Keyboard Navigation

- [ ] Interactive elements can be reached with the keyboard.
- [ ] Focus states are visible.
- [ ] Tab order follows the visual flow.
- [ ] Modals, menus, or overlays manage focus correctly if present.

## Preserving Business Logic

- [ ] Existing routes and API calls are preserved.
- [ ] Auth, admin checks, and session behavior are not changed during UI-only work.
- [ ] Database schema and backend behavior are untouched unless explicitly requested.
- [ ] Existing user workflows still complete successfully.

## Final Verification

- [ ] Relevant lint, typecheck, build, and automated test commands pass.
- [ ] The finished page was reviewed at desktop and mobile widths.
- [ ] Loading, empty, error, success, and disabled states were reviewed when applicable.
