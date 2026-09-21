# “这夏夯爆了” Engineering Evidence

This case is evidence for the production method, not a visual template.

## Evidence Source

- Implementation: `src/modules/vibecoding/components/XiahuaH5Preview.tsx`
- Core high-fidelity implementation commit: `c6ea469`

Inspect the current repository and commit history before relying on exact paths or behavior.

## Transferable Lessons

1. Treat the page as a composition of semantic sections, not as one generic long-form template.
2. Use exported or generated visual assets for asset-rich decorative regions; keep dynamic copy, state, and gameplay in real DOM/code.
3. Build the Hero/KV as a layered composition with deliberate depth, foreground/background roles, and independent branded title/control layers.
4. Give major sections distinct visual identities while maintaining one campaign grammar.
5. Couple every visible module to real local interaction state, even when backend APIs are out of scope.
6. Preserve stable module boundaries so the editor can select and modify meaningful regions independently.

The lesson is not “use more images.” It is to allocate fidelity to images/vectors and behavior to code at the correct semantic boundary.

## Do Not Copy

Do not reuse this case's exact:

- title or art-title treatment;
- mascot, IP, or illustration subjects;
- palette and background scenes;
- card copy, rewards, or gameplay data;
- supplied or generated image assets;
- Figma geometry as a universal template.

Extract only the method. Create a new Brand Kit and asset BOM for every new campaign.
