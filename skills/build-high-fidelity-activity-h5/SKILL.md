---
name: build-high-fidelity-activity-h5
description: Build or substantially redesign production-quality mobile activity H5 pages from a requirement document or campaign brief. Use when an agent must turn a document, gameplay idea, Figma quality reference, or Brand Kit into an asset-complete, interactive, component-editable page with three human confirmation gates, an explicit asset BOM, and visual/runtime QA. Also use when an existing activity page is a CSS shell, leaks placeholders, flattens the whole page, lacks generated visual assets, or falls materially below a supplied reference.
---

# Build High Fidelity Activity H5

Create a complete activity product, not a document-shaped page and not a decorated shell. Preserve requirement meaning, generate the visual inventory the page actually needs, keep behavior in code, and make meaningful modules independently selectable and editable.

## Keep Knowledge in the Right Layer

- Put the repeatable production procedure and quality gates in this skill.
- Put campaign-specific visual grammar, prompt recipes, color, typography, depth, and motifs in a Brand Kit.
- Put reusable stateful structures such as voting cards, task panels, rankings, and reward grids in a component registry.
- Put generated campaign artwork in the project asset library with ownership and provenance metadata.
- Never promote a campaign's exact title, mascot, palette, copy, or intellectual property into a universal skill.

## Resolve Reusable Knowledge

- Use `$activity-h5-component-library` to query versioned gameplay behavior, state, data/events, editable slots, accessibility, and QA contracts when it is installed.
- Use `$douyin-acg-event-brand` for Douyin ACG visual work. Create a campaign child kit; do not copy the reference campaign identity.
- Record resolved registry IDs and Brand Kit artifact versions in the page manifest. If a required skill is unavailable, inspect the project registry and Brand Kit directly and mark the fallback source.

## Required Outputs

Produce all of the following unless the host product explicitly owns an equivalent artifact:

1. Source and requirement documents that separate confirmed facts from agent inference.
2. At most three human decision categories: boundary, gameplay mainline, and Brand Kit direction. Skip any category already resolved by an authoritative input and record the source of truth.
3. A component tree and a runnable gray model after gameplay is confirmed.
4. Three comparable Brand Kit joint samples using the same content and semantic slots.
5. A complete asset bill of materials (BOM), not only a background image.
6. A high-fidelity, interactive, component-editable mobile H5.
7. A replayable decision log, an asset manifest, and visual/runtime QA evidence.

## Load the References

- Always read [references/system-overview.md](references/system-overview.md) when explaining what this skill controls or how the system produces a page.
- Always read [references/input-contracts.md](references/input-contracts.md) before interpreting a requirement document, Figma file, screenshot, embedded demo, or mixed input.
- Read [references/pixel-provenance.md](references/pixel-provenance.md) before deciding whether a visual slot should be exported, generated, vectorized, or rendered in code.
- Always read [references/pipeline.md](references/pipeline.md) before planning or changing the user flow.
- Read [references/component-orchestration.md](references/component-orchestration.md) before creating the page blueprint, component tree, or gameplay implementation.
- Read [references/asset-layering.md](references/asset-layering.md) before defining the asset BOM or composing the final page.
- Read [references/quality-gates.md](references/quality-gates.md) before claiming completion.
- Read [references/xiahua-case.md](references/xiahua-case.md) only to calibrate high-fidelity engineering or explain the evidence behind this method. Do not copy its campaign identity.

## Workflow

### 1. Inspect Before Designing

Classify the source contract using `references/input-contracts.md`, then read every authoritative source completely, including embedded boards, images, links, tables, Figma components, variants, and interaction notes. Inspect the current repository, reusable components, Brand Kits, assets, and dirty worktree before editing. Preserve source material as an immutable document; append confirmations and decisions rather than replacing previous content.

Write down:

- confirmed business facts;
- unresolved choices that materially change the output;
- agent inferences and why they are reasonable;
- the primary user loop and terminal success state;
- hard platform, brand, content, and viewport constraints.

Do not translate document sections one-for-one into page sections. Infer the actual product the document describes.

### 2. Ask Only Unresolved Product Decisions

The only decision categories the process may ask are the three gates defined in `references/pipeline.md`: boundary, gameplay mainline, and Brand Kit. Ask only categories that remain materially unresolved after source inspection. Each asked gate should present one concise recommendation, three preset choices, and a free-form alternative. Explain visible consequences with user-facing language; do not expose internal agent stages or implementation jargon.

When an approved Figma target or explicit requirement already resolves a category, append a source-backed decision record and continue without a performative confirmation.

The agent owns gray-model layout, component decomposition, asset inventory, visual repair, and implementation details. Do not ask the user to approve those separately.

### 3. Build a Runnable Gray Model After Gameplay Confirmation

Before gameplay confirmation, keep only an internal semantic slot map. After confirmation, resolve the gameplay needs against the component registry using `references/component-orchestration.md` and `$activity-h5-component-library`, then build the full component tree and a runnable gray model. The gray model must prove the core loop, information order, state transitions, and page length. It is an agent artifact, not another approval gate.

### 4. Confirm a Brand Kit With Joint Samples

If the visual direction is unresolved, generate three directions using the same minimum joint sample: Hero/KV, art-title, and the representative gameplay module. Keep crop, content, and semantic slots comparable. A palette swatch or mood board alone is not sufficient.

If an approved Figma is the visual source of truth, extract its Brand Kit and component/asset contracts instead of inventing three alternatives. If Figma is only a quality reference, do not copy its campaign identity; create joint samples that meet its density and craft bar using the new campaign content.

For Douyin ACG work, compile the campaign child kit from `$douyin-acg-event-brand` and validate it before producing the joint sample or full asset batch.

After the user selects a direction, freeze the Brand Kit version, switch the host product to the asset surface when supported, and generate the full asset set. Do not batch-generate all final art before the joint sample is selected.

### 5. Build and Audit the Asset BOM

Follow `references/pixel-provenance.md` and `references/asset-layering.md`. Grade evidence per semantic slot rather than assigning one grade to the whole project. Assign every visual slot an owner component, renderer, state, aspect ratio, provenance, coordinate source, rights scope, and final status. Generate isolated transparent assets when modules need independent editing. Reject baked checkerboards, unintended opaque rectangles, low-resolution crops, corrupted text, inconsistent lighting, and unbound files.

Keep candidate images and failed iterations out of the final asset library. Publish only approved final assets.

### 6. Compose the Final Page Without Flattening It

- Keep copy, counters, live state, accessibility text, and interactions in DOM/code.
- Use image or vector assets for complex branded art, illustration, decorative typography, rewards, and atmosphere.
- Allow tightly coupled decorative regions to be composite assets when that improves fidelity and does not remove meaningful editability.
- Give every meaningful module a stable selection reference and an editor schema.
- Preserve each module's registry source, version, configuration, state contract, and visual slots so the result can be replayed and upgraded.
- Do not flatten the whole page into one image, and do not force richly illustrated regions into CSS-only replicas.

### 7. Attack the Result Before Delivery

Run tests and the checks in `references/quality-gates.md`. Inspect real rendered screenshots and scroll behavior at compact, standard, and large mobile widths. Compare the reference and implementation by semantic region, geometry, contrast, density, depth, and interaction behavior.

For Figma-led work, compare every required frame and important variant, not only the first viewport screenshot. Verify exact text/art separation, component boundaries, image crops, section heights, fixed/sticky behavior, and state transitions.

Treat failures as root-cause problems. Repair the asset, layout contract, state model, or component ownership rather than covering a symptom with arbitrary spacing.

When the host uses a manifest, run:

```bash
node scripts/audit-activity-manifest.mjs path/to/activity-manifest.json
```

### 8. Deliver From Preview

Compile, run, and replay the final flow. The final response should summarize delivered artifacts, interaction coverage, and remaining external dependencies, then open or switch to the Preview surface when the host supports it. Progressive artifact tabs belong to replay mode only; steady-state navigation should show the normal product tabs.

## Hard Prohibitions

- Do not make a stack of cards that merely restates the source document.
- Do not ship a background plus generic CSS cards as a high-fidelity activity page.
- Do not render a required art-title as ordinary text when a controlled vector or image asset is available.
- Do not treat an exact visual export as exempt from review; source defects, crop errors, overlays, and assembly can still fail.
- Do not use full-page strips as the default production architecture. Restrict exported composites to immutable decorative regions with declared pixel ownership.
- Do not add user approval gates for the gray model, asset BOM, or repair loop.
- Do not introduce viewport-height jumps when switching venues, chapters, or tabs.
- Do not leave placeholders, debug language, agent rationale, or internal workflow labels in the terminal user page.
