# Blocking Quality Gates

Passing unit tests is necessary but not sufficient. Completion requires every applicable gate below.

## Requirement Integrity

- Original source remains available and unchanged.
- Confirmed facts, agent inferences, and unresolved items are distinguishable.
- The page implements the actual user product and primary loop rather than mirroring document headings.
- All three user decisions are retained as append-only history.

## Asset Completeness

- Every visible art slot appears in the BOM and has an owner component.
- No placeholder, baked checkerboard, missing image, accidental opaque rectangle, or low-resolution crop remains.
- Art-title, Hero/KV, gameplay art, content imagery, reward art, and branded controls are present where the visual direction calls for them.
- Candidate and rejected files are not exposed as final assets.

## Runtime and Interaction

- The full page scrolls in Preview.
- Primary action, venue/chapter switch, tab, rule/share entry, gameplay action, and terminal feedback work where in scope.
- The core loop can be completed with mocked local state when backend APIs are intentionally out of scope.
- Switching states does not reset unrelated progress or trap focus.
- There are no inert controls disguised as working buttons.

## Responsive Geometry

Inspect at 320 px, 375 or 390 px, and a large mobile width:

- root and scroll-container width and height;
- horizontal overflow at every long section;
- venue, chapter, and tab switches both at the top and after scrolling;
- image natural dimensions and object-fit behavior;
- fixed or sticky controls against the first and last section;
- stable outer-canvas height when internal content variants switch.

Do not solve a state-height bug by hard-coding a large blank spacer. Normalize the component geometry or make the internal viewport scroll deliberately.

## Visual Attack Review

Actively search for:

- light text on a pale surface or dark text on a dark image;
- empty regions with no compositional purpose;
- clipped art-title, badges, shadows, or decorative edges;
- plain generic cards inside a richly branded scene;
- controls that merge into the background;
- inconsistent radius, depth, stroke, material, or lighting;
- section density far below the supplied quality reference;
- page-height jumps, unexpected recentering, or scroll position loss;
- accidental developer language, placeholders, or workflow explanation in the final page.

Inspect screenshots; do not rely only on reading CSS values.

## Editing Model

Verify that the editor can independently select and edit at least:

- Hero/KV;
- art-title;
- primary action;
- representative gameplay module;
- one repeated content item;
- task/progress module when present;
- reward or terminal-state module when present.

Selection references must be stable across state changes. Clicking a child must not collapse selection to the whole page unless the page root was explicitly targeted.

## Manifest Audit

When using the included manifest contract, run:

```bash
node scripts/audit-activity-manifest.mjs path/to/activity-manifest.json
```

The audit checks required decisions, component ownership, final file existence, asset readiness, and these boolean evidence gates:

- `noHorizontalOverflow`
- `noBrokenImages`
- `contrastReviewed`
- `geometryStable`
- `componentEditable`
- `coreLoopPlayable`
- `noPlaceholderCopy`

Treat an audit failure as blocking. Add project-specific checks when the reference or platform contract is stricter.
