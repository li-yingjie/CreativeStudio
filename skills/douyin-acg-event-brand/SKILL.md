---
name: douyin-acg-event-brand
description: Extract, compile, apply, and audit a reusable Douyin ACG campaign Brand Kit for high-fidelity mobile H5 pages. Use when turning an approved Figma or activity brief into ACG event visuals, generating a complete asset BOM and low-noise image prompts, binding Brand Kit tokens to editable gameplay components, reviewing page density and craft, or preventing campaign pages from collapsing into generic card-based web UI.
---

# Douyin ACG Event Brand

Use this skill as a production visual contract, not as a mood-board and not as a source of campaign IP.

This kit is extracted from the approved Figma file `PxXGus8deG2BZ3xQLUFl0u`, root frame `1:369`. Generated campaign samples may test the kit, but they must never define or overwrite it.

## Load the Contract

- Read [references/brand-system.md](references/brand-system.md) before designing or reviewing an ACG event page.
- Read [references/production-contract.md](references/production-contract.md) before generating assets, compiling a page, or adapting the kit to a new campaign.
- Load [assets/douyin-acg-experience-kit.v1.json](assets/douyin-acg-experience-kit.v1.json) whenever machine-readable tokens, slots, recipes, or gates are needed.
- Load [assets/brand-kit-presentation.v1.json](assets/brand-kit-presentation.v1.json) when rendering a user-facing Brand Kit page. It is the single presentation source for Logo, main KV, typography, type scale, palette, component styles, and their visible rules.
- Load [assets/preview-manifest.json](assets/preview-manifest.json) only when showing the kit to a person, auditing the Figma evidence, or packaging the skill. Every image under `assets/previews/` is Figma evidence-only and must not be inherited into a new campaign.

## Workflow

1. Classify the input as approved visual source, product constraint, or quality reference. Never silently treat a screenshot as a full Figma contract.
2. Separate platform identity, reusable experience grammar, project-specific campaign identity, and component behavior.
3. Create a campaign child kit that declares the parent kit ID/version and overrides every field listed in `inheritance.mustOverride`.
4. Derive the page blueprint before choosing imagery. Keep gameplay behavior and content structure independent from the skin.
5. Compile an asset BOM across every required slot family. Reject plans that only create a background or Hero image.
6. Generate Hero/KV and art-title separately. Keep buttons, votes, counters, tasks, long copy, and live state editable.
7. Bind each gameplay capability to a distinct module skin while preserving shared tokens and hierarchy.
8. Generate images with the deterministic prompt compiler, then inspect real files for dimensions, alpha, noise, text corruption, and campaign-IP leakage.
9. Audit the compiled kit and page at target mobile widths before delivery.

## Deterministic Tools

Validate the machine-readable kit:

```bash
node scripts/validate-brand-kit.mjs
```

Create a distributable archive after validation:

```bash
node scripts/package-skill.mjs /tmp/douyin-acg-event-brand.skill.tgz
```

Compile a slot-specific prompt:

```bash
node scripts/compile-prompt.mjs hero.scene "原创 ACG 年度内容旅程主视觉" "3:4"
```

Use the compiled prompt as a controlled starting contract. Add project subject matter and platform constraints, but do not remove its safe-area, editability, low-noise, and exclusion clauses.

## Guardrails

- Use the ACG 新春会 evidence to extract method, not characters, logos, creator avatars, works, titles, dates, rewards, or finished page assets.
- Do not substitute generated images for the Figma evidence pack. Generated outputs belong to the campaign asset library and are downstream validation artifacts.
- Do not create a single baked full-page image.
- Do not call a page high fidelity when all sections reuse one card, radius, shadow, and typographic template.
- Preserve object-level editability and set non-interactive decoration layers to ignore input.
- Do not use Brand Kit styling to rewrite a gameplay state machine.
- Record parent and child Brand Kit versions in assets, component bindings, manifests, and replay logs.
- Do not claim production deployment evidence: this kit is a production contract extracted from a locally validated reference implementation.
