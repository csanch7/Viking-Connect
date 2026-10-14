---
name: Viking Connect
description: A private St. Laurence mentorship network with disciplined professional clarity.
colors:
  primary: "#ffc72c"
  ink: "#191919"
  ink-deep: "#090909"
  surface-soft: "#fbfaf7"
  surface-card: "#fffefa"
  surface-muted: "#f7f3eb"
  surface-white: "#ffffff"
  border: "#e6e1d7"
  border-strong: "#d7cfc2"
  text-muted: "#6b675f"
  accent-text: "#806a35"
  danger: "#8d3216"
  danger-soft: "#fff2ec"
  success: "#2f6f47"
  nav-surface: "rgba(255, 253, 248, 0.94)"
typography:
  display:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(44px, 7vw, 88px)"
    fontWeight: 820
    lineHeight: 0.96
    letterSpacing: "normal"
  headline:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(32px, 4vw, 54px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "normal"
  title:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 760
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 720
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  accent: "2px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  page: "28px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface-card}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  chip:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
    height: "24px"
---

# Design System: Viking Connect

## Overview

**Creative North Star: "The Professional Commons"**

Viking Connect combines the legibility and network credibility associated with LinkedIn-like professional products with the restrained surfaces and content-first utility associated with Notion-like workspaces. It should feel credible enough for alumni, approachable enough for students, and focused enough that a member can quickly move from browsing to a useful conversation. These references describe the current design intent; they are inspiration, not templates or permanent constraints.

The incumbent system is warm, disciplined, and compact. Near-black ink creates authority, St. Laurence gold carries identity and interaction emphasis, and paper-like cream surfaces prevent the product from feeling cold or generic. Decoration is secondary to readable profiles, explicit controls, and clear state feedback.

**Key Characteristics:**

- Professional and community-minded rather than corporate or promotional.
- Warm paper surfaces grounded by near-black type and actions.
- Gold used as a deliberate signal for identity, focus, selection, and reassurance.
- Compact system typography with strong weight contrast instead of ornamental font pairing.
- Bordered, gently lifted containers with modest rounding and reliable interaction states.

## Colors

The palette uses professional near-black and warm neutrals as its foundation, with St. Laurence gold reserved for high-information moments.

### Primary

- **Viking Gold** (`primary`): St. Laurence identity, focus rings, selected filters, informational accents, and small moments of warmth. It is not the default body-text or primary-button color.

### Neutral

- **Near-Black Ink** (`ink`): Primary text, primary actions, selected navigation, and structural contrast.
- **Deep Ink** (`ink-deep`): Immersive dark sections such as the public hero and footer.
- **Warm Paper** (`surface-soft`): Default page background and broad application canvas.
- **Cream Card** (`surface-card`): Cards, panels, dialogs, and other foreground surfaces.
- **Quiet Paper** (`surface-muted`): Subordinate or accent panels and gentle hover states.
- **Quiet Taupe Border** (`border`): Default dividers and container outlines.
- **Strong Taupe Border** (`border-strong`): Inputs and controls that need clearer definition.
- **Muted Stone Text** (`text-muted`): Supporting copy, metadata, descriptions, and lower-priority labels.
- **Burnished Gold Text** (`accent-text`): Small kickers and warm metadata where full gold would be too bright.

### Tertiary

- **Measured Danger** (`danger`) with **Soft Danger** (`danger-soft`): Destructive confirmations, errors, and recovery states.
- **Positive Green** (`success`): Valid field feedback and successful validation only.

### Named Rules

**The Gold Is a Signal Rule.** Gold identifies the institution and clarifies focus, selection, or reassurance; it does not flood routine product surfaces.

**The Ink Leads Rule.** Near-black carries primary actions and the strongest hierarchy. Gold supports that hierarchy instead of competing with it.

## Typography

**Display Font:** System UI, with Segoe UI and Roboto fallbacks  
**Body Font:** System UI, with Segoe UI and Roboto fallbacks  
**Label Font:** System UI, with Segoe UI and Roboto fallbacks

**Character:** The system relies on native clarity, compact proportions, and weight contrast. It feels efficient and familiar across platforms; personality comes from hierarchy, color, and composition rather than a decorative typeface.

### Hierarchy

- **Display** (`display`): Public hero titles only; large, tightly led, and visually decisive.
- **Headline** (`headline`): Marketing section headings and high-emphasis editorial statements.
- **Page heading** (30–38px, 760–780 weight, approximately 1.1 line-height): Operational page titles, profile names, registration, and administrative headings.
- **Title** (`title`): Card titles and section headers inside product surfaces.
- **Body** (`body`): Explanatory copy, profiles, and primary reading content; typically constrained to roughly 58–72 characters per line.
- **Label** (`label`): Buttons, field labels, navigation, badges, and compact metadata.
- **Kicker** (11–13px, 680–760 weight): Warm-gold context labels. Sentence case is the default; tracked uppercase is reserved for rare sponsor or utility labeling.

### Named Rules

**The One System Voice Rule.** Use the system stack throughout; establish hierarchy with size, weight, and spacing before adding another font family.

**The Compact Utility Rule.** Operational screens favor 13–15px text with deliberate weight contrast, while large display type belongs to persuasive surfaces.

## Layout

The application uses centered fluid containers with a maximum working width of 1140px. Desktop page gutters are generally 28px; compact screens reduce them to 14–20px. Public marketing sections use an 80px vertical rhythm, while operational screens use denser 12–24px gaps and 18–24px card padding.

Two-column layouts pair a flexible primary region with a narrower contextual or summary region. Profile summaries become sticky on wide screens. Registration uses a sticky explanatory column beside the form. Directory rows use broad horizontal layouts for scanning, while responsive layouts collapse grids and action groups into a single column.

The recurring breakpoints are 980px for major structural collapse, 760px for mobile layout and type changes, and 520px for compact dialogs. Controls preserve a 44px interaction floor even when their visual styling is dense.

The home hero is a focused two-part composition on desktop. Its left column carries the entire message hierarchy: a decisive two-line `Viking Connect` wordmark with white `Viking` and an indented gold `Connect`, followed by the statement, factual program copy, and the primary and secondary actions. The right column contains only an oversized rendering of the real St. Laurence crest at `0.25` opacity; it is atmospheric identity, not an explanatory panel. The three-step warm-paper strip overlaps the bottom edge of the dark hero and stays visible within the first desktop viewport. At 760px and below, hide the decorative crest, collapse to one column, stack the actions, and let the existing content lead without compressing its touch targets.

**The Home Hero Composition Rule.** On desktop, keep the two-line white-and-gold Viking Connect wordmark, statement, factual copy, and actions together on the left; reserve the right side for only the real oversized crest at 25% opacity, overlap the warm-paper three-step strip into the hero, and hide the crest when the mobile layout collapses.

**The One Working Column Rule.** Once horizontal space becomes constrained, collapse supporting columns before compressing content or touch targets.

**The Wide Canvas, Short Measure Rule.** Containers may span 1140px, but explanatory copy remains materially narrower for readability.

## Elevation & Depth

The system is layered rather than highly elevated. Borders and tonal changes define most surfaces. Shallow ambient shadows reinforce important cards without making every container float; stronger elevation is reserved for dialogs, overlays, and occasional public-page feature blocks.

### Shadow Vocabulary

- **Micro control** (`0 1px 2px rgba(9, 9, 9, 0.08)`): Primary buttons and compact controls.
- **Card ambient** (`0 10px 30px rgba(25, 25, 25, 0.045)`): Standard cards, form sections, and directory controls.
- **Panel ambient** (`0 14px 36px rgba(25, 25, 25, 0.055)`): Login panels and emphasized containers.
- **Raised feature** (`0 18px 48px rgba(25, 25, 25, 0.08)`): Public proof blocks and occasional feature panels.
- **Dialog** (`0 24px 72px rgba(9, 9, 9, 0.24)`): Modal confirmation surfaces only.
- **Focus halo** (`0 0 0 3px rgba(255, 199, 44, 0.2–0.55)`): Keyboard focus and selected-control reinforcement.

**The Flat-by-Default Rule.** Borders and surface tone establish hierarchy first. Add shadow only when a surface genuinely sits above another or needs stronger task focus.

## Shapes

The form language is gently rectangular rather than pill-heavy. Interactive controls use compact 6px corners, cards use 8px, and dialogs use 10px. Pills are limited to statuses and compact counts; circular shapes belong to status icons and small indicators. The home hero and footer may use angular clipping or line accents as rare brand-scale geometry.

**The Modest Radius Rule.** Use 6px for controls and 8px for containers. Larger or fully rounded shapes need a semantic reason such as status, count, avatar, or dialog hierarchy.

## Components

### Buttons

- **Shape:** Compact rectangular controls with gently curved corners (`rounded.sm`) and a 44px interaction floor.
- **Primary:** Near-black fill, cream text, 13px semibold label, and a micro shadow.
- **Secondary:** Cream or white surface, ink text, and a strong taupe border.
- **Hover:** Dark primary controls lift only through tone; secondary controls shift to quiet paper. Large movement is avoided.
- **Focus:** A clearly separated gold halo, typically 3px with 2–3px offset.
- **Destructive:** Measured-danger fill is reserved for confirmed destructive actions, never ordinary cancellation.

### Chips

- **Style:** Compact rectangular tags use quiet paper, muted text, a subtle border, and 6px corners.
- **Selection:** Selectable filter chips become gold with an ink border; selected state is communicated by more than color alone through control semantics.
- **Pills:** Fully rounded chips are reserved for status and count indicators.

### Cards / Containers

- **Corner Style:** Gently rounded (`rounded.md`).
- **Background:** Cream card on warm paper; muted paper marks subordinate or supportive content.
- **Shadow Strategy:** Flat or card-ambient at rest; stronger elevation appears only for persuasive feature blocks or overlays.
- **Border:** Quiet taupe by default, with stronger taupe for high-interaction panels.
- **Internal Padding:** 18–24px for standard cards and 24–32px for larger marketing blocks.

### Inputs / Fields

- **Style:** White fill, strong taupe stroke, 6px corners, 14px text, and a 44px height.
- **Focus:** Gold-tinted border and halo; no browser-default focus suppression without a replacement.
- **Error:** Warm red stroke and soft danger fill with nearby explanatory text.
- **Valid:** Muted green stroke and very pale green fill; validation is never color-only.
- **Disabled:** Quiet paper, muted text, standard cursor feedback, and preserved readability.

### Navigation

The sticky navigation uses a translucent warm-cream surface, a fine bottom border, and subtle backdrop blur. Brand text is compact and weight-forward beside the crest. Navigation actions use text labels; the primary or active destination becomes an ink-filled control. On mobile, actions wrap or stack while retaining the 44px interaction floor.

### Home Hero

The home hero is the public surface's clearest brand-scale moment: a near-black field with message and actions on the left and a single oversized crest on the right. Keep the wordmark to two lines, set `Viking` in cream-white, indent `Connect` in Viking Gold, and preserve the crest at 25% opacity so it supports rather than competes with the copy. Do not add a card, caption, label, statistic, or explanatory panel around the crest. The warm-paper three-step strip should overlap the hero boundary and remain part of the initial desktop composition; on mobile, remove the crest from layout and stack the existing content and actions.

### Directory Rows

Directory entries prioritize horizontal scanning: identity first, mentorship details second, and contact actions last. Hover uses a quiet paper wash plus a thin gold inset accent rather than a dramatic lift. On mobile, the row becomes a vertical card without hiding member context.

### Reversible Match Actions

Recommendation cards lead with a concise, directional explanation of relevance: mentor expertise matches a mentee's interests, while mentee interests match a mentor's experience. Shared-college context may strengthen that explanation, but college-only matches must not imply shared topics. Supporting chips name the matching expertise or interests without exposing an abstract recommendation score.

The ink-filled `View profile and contact` control is the primary path because members review contact details before beginning a conversation outside the product. Private tracking stays subordinate: `Mark as contacted` and `Not a fit` use bordered secondary controls. All actions retain the 44px interaction floor; the tracking pair stacks into one column on compact cards while the heading and college badge wrap without clipping. Removing a recommendation must produce immediate inline status or alert feedback, move keyboard focus to that feedback, and offer `Undo` when the action can be safely reversed.

The member profile carries the same private state and recovery language. Personal match history uses divided, text-forward lists with dates and explicit `Remove from history` or `Restore` controls; rows collapse vertically on mobile without hiding identity or state. Privacy is stated in plain language rather than implied by color or iconography.

**The Reversible Triage Rule.** Lightweight preference and tracking actions stay private, explain their result immediately, and provide an obvious route back through Undo, restore, or removal.

### Profile Hero

Profile heroes combine a gold-tinted patterned cover, an overlapping squared avatar, a strong member name, and compact actions. The cover provides institutional identity while the content remains operational and readable.

### Confirmation Dialog

Dialogs use the strongest elevation in the system, a dimmed and lightly blurred backdrop, explicit title and description hierarchy, and actions separated into a warm-paper footer. Destructive and neutral confirmations use distinct icon and action treatments.

## Do's and Don'ts

### Do:

- **Do** preserve near-black, gold, and warm paper as the dominant incumbent relationship while the current identity remains in force.
- **Do** use 6px controls, 8px cards, and 44px minimum interactive targets as the default component grammar.
- **Do** keep primary actions visually decisive with ink fills and explicit text labels.
- **Do** use gold focus halos and visible semantic feedback for keyboard, validation, loading, success, and error states.
- **Do** let LinkedIn-like professional clarity and Notion-like restraint inform decisions without reproducing either product's layouts or components.
- **Do** treat these narrative descriptions as refinable; update this document when the implemented system materially changes.

### Don't:

- **Don't** turn gold into a default page background, long-form text color, or competing primary action.
- **Don't** mix highly rounded consumer-app components into the compact rectangular system without a semantic purpose.
- **Don't** elevate every card; depth loses meaning when every surface floats.
- **Don't** use decorative typography or generic SaaS gradients to manufacture personality that the St. Laurence identity should supply.
- **Don't** shrink controls or focus indicators to preserve a dense layout on mobile.
- **Don't** invent testimonials, member counts, or outcome proof as decorative content.
