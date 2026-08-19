# Asset BOM and Layering

## Inventory Categories

Audit all applicable categories. A single background image is never a complete asset plan for a high-fidelity campaign.

- Campaign identity: logo lockup, art-title, date strip, venue or chapter labels.
- Atmosphere: Hero/KV, foreground, midground, background, transitions, ornaments, particles, dividers.
- Gameplay: representative scene, state badges, meters, tokens, voting sides, cards, interaction feedback.
- Content: creator avatars, work thumbnails, chapter covers, media posters, category emblems.
- Rewards: prize illustrations, coupon or badge art, locked/unlocked states, celebration effects.
- Controls: branded primary action, secondary action, tabs, arrows, share/rule controls when plain UI would break the visual system.
- Distribution: share cover, feed card, poster, or platform entry image when included in scope.

## Required Manifest Metadata

Each asset record should carry:

- `id`: stable unique identifier;
- `slot`: semantic purpose rather than a filename description;
- `src`: project-relative source;
- `ownerComponent`: stable component selection reference;
- `provenance`: generated, supplied, licensed, or derived;
- `renderer`: image, vector, video, canvas, or DOM;
- `format`, alpha behavior, dimensions, and aspect ratio;
- `states`: default, selected, locked, completed, disabled, and so on;
- `editable`: whether the editor exposes the asset separately;
- `stage`: intermediate or final;
- `status`: planned, generating, review, ready, rejected;
- `prompt` or generation recipe when applicable.

## Choose the Rendering Layer

Use this order:

1. If content is dynamic, localized, accessible, or state-driven, render it in DOM/code.
2. If it is complex branded artwork or decorative typography, use image or vector.
3. If the user must select or replace it independently, keep it as a separate asset and component slot.
4. If several decorative layers are tightly coupled and never need separate editing, use a composite region.
5. Do not create meaningless layers merely to increase layer count.

| Region | Preferred rendering | Reason |
| --- | --- | --- |
| Art-title | Vector or transparent image | Preserves custom letterform, contour, shadow, and highlights. |
| Hero/KV | Layered or bounded composite art | Preserves depth while allowing title and controls to remain independent. |
| Task progress and counts | DOM | Dynamic, accessible, and stateful. |
| Reward illustration | Transparent image/vector | Visually rich and independently replaceable. |
| Vote count or ranking number | DOM | Live state. |
| Static ornamental divider | Composite/vector | No meaningful behavior or content state. |
| Entire page | Never one flattened image | Destroys interaction, responsiveness, and module editing. |

## Brand Kit Joint Sample

The minimum comparable sample contains the same:

- Hero/KV semantic crop;
- art-title wording and placement;
- representative gameplay module and primary action;
- viewport and content density.

Only the Brand Kit direction should change. After selection, use the chosen grammar across the full BOM.

## Asset Acceptance

Before binding an asset:

- inspect natural dimensions at target density;
- verify alpha is real transparency, not a checkerboard baked into pixels;
- inspect edges and crops against both light and dark backgrounds;
- verify generated text or symbols are intentional and legible;
- verify lighting, perspective, and material agree with adjacent art;
- bind it to a semantic slot and owner component;
- keep only approved final files in the final library.

If an asset cannot meet the slot contract, regenerate or redesign the slot. Do not conceal it with CSS overlays.
