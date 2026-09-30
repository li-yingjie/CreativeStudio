# Pixel Provenance and Rendering Decisions

High fidelity depends on trustworthy visual evidence, but it is not equivalent to using more image pixels. Structure, typography, interaction, accessibility, state stability, and editability remain first-class quality dimensions.

## Grade Evidence Per Semantic Slot

Mixed inputs are normal. Grade each visual slot independently:

- `A / authoritative-pixels`: approved Figma export, user-owned source asset, licensed asset, or verified internal library file. Its pixels may be reused within the recorded rights scope.
- `B / intent-only`: rough demo, low-fidelity board, competitor screenshot, or inspiration image. Its composition or intent may inform a new design, but its pixels must not enter the final asset.
- `C / requirement-only`: text or product intent without a visual source. Create original pixels from the approved Brand Kit and slot contract.

Record the grade, source locator, rights scope, and confidence on every asset manifest entry. Do not label an entire project A, B, or C when its slots have different evidence.

## Build a Style Anchor Pack

Before producing a full asset batch, freeze a style anchor pack containing:

1. one approved joint sample that shows Hero/KV, art-title, representative gameplay module, primary action, and surface material together;
2. the compiled Brand Kit tokens and prompt grammar;
3. explicit exclusions and inheritance boundaries;
4. the source and approval record for the anchor.

The anchor pack is the visual baseline for generated C-grade slots and for newly created assets inspired by B-grade evidence. A competitor screenshot cannot become the final anchor; first create and approve an original sample.

## Choose a Renderer With Four Questions

For every slot, ask in this order:

1. Does it change with state, localization, content, accessibility, or data? Use DOM/code.
2. Must the user select, replace, or animate it independently? Keep a separate component or asset slot.
3. Is there authoritative pixel or vector evidence with usable rights? Export or reuse it without redrawing.
4. Otherwise, generate or draw an original asset from the frozen Brand Kit and slot contract.

Use bounded composites only when several decorative layers share one crop, never change independently, and contain no meaningful interaction or live text. Record the composite boundary and protected overlay zones.

## Figma Coordinate Contract

Never hard-code an assumed `0.5` scale or a particular 750-to-375 conversion. Record:

- design frame width and height;
- runtime content width;
- transform and pixel density;
- crop bounds and node IDs;
- safe areas for DOM overlays;
- responsive behavior outside the reference width.

Use integer pixel exports where possible, but preserve the declared transform rather than forcing an arbitrary integer ratio.

## Rights and Reference Safety

- Treat competitor or external screenshots as B-grade unless the user proves ownership and authorizes reuse.
- Extract design methods, hierarchy, density, and composition—not logos, characters, artwork, copy, or distinctive finished pixels.
- Preserve supplied IP exactly when authorized; do not ask a generation model to redraw an existing approved asset.
- Record whether each preview is `production-input`, `evidence-only`, or `sample-only`. Sample-only images in a Skill package must never be inherited into a new campaign.

## Art-Title Recovery Order

If art-title OCR or shape validation fails:

1. regenerate with a stricter isolated title contract;
2. vectorize or manually repair the approved shape;
3. split background ornament from verified glyphs;
4. use controlled CSS text only as the final fallback.

Do not silently replace a required art-title with ordinary runtime text merely because the first generated image failed.

## Review Is Always Required

Authoritative exports reduce uncertainty; they do not remove review. Validate crop, alpha, dimensions, protected zones, assembly seams, text overlays, responsiveness, and interaction after binding every source type.
