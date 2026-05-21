# CLAUDE.md

Guidance for AI agents working in this repo. Read this first.

## What this is

A **front-end prototype** of "抖音 AI 工坊" (Douyin AI Workshop) — an AI-assisted
creation platform where users build products (AI 分身 / 小程序 / 网站 / 网页游戏 /
营销 H5 / 运营提案) by chatting. It is a **demo**: almost all data is mocked. The
one real integration is the chat, which streams from Kimi (Moonshot) via a
server-side proxy.

## Stack

- React 19 + TypeScript (~6) + Vite 8, Tailwind CSS 4
- State: `zustand` (stores) + lots of local `useState`
- UI: `framer-motion`, `lucide-react` + `@tabler/icons-react` (re-exported from
  `src/shared/icons.tsx`), `sonner` (toasts)
- Backend: Node 22, Express (prod) / Vite middleware (dev), Kimi chat API

## Commands

- `npm run dev` — Vite dev server on :5173. **Also serves `/api`** in-process via
  a plugin in `vite.config.ts` (so no separate backend needed in dev).
- `npm run build` — `tsc -b && vite build` → `dist/`
- `npm run start` — Express (`server/index.mjs`) serves `dist/` + `/api` (prod self-host)
- `npm run lint` — ESLint (note: has known pre-existing errors, not yet a CI gate)

There is no test suite.

## Layout

- `src/app/App.tsx` — root
- `src/modules/vibecoding/` — the main product UI
  - `components/VibeCodingPage.tsx` — **the hub, ~10k lines**: sidebar, chat,
    preview pane, toolbars, all the scripted flows. Most feature work lands here.
  - `components/ProjectProductView.ts` — re-buckets a project's raw file tree into
    plain-language "product" categories (页面 / 知识库 / 技能 / 数据库 …) per kind.
  - `components/PublishDrawer.tsx` — the 发布 popover.
  - other `components/*` — per-surface previews (AgentHubPreview, GarudaGamePreview,
    MiniAppPreview, MarketingH5Preview …) and edit panels.
- `src/modules/editor/` — chat preview, `store/publish-flow-store.ts`,
  `store/persona-store.ts`, static `data/`
- `src/shared/` — `icons.tsx`, `api/chat.ts` (SSE client → `/api/chat`),
  `components/`, `hooks/`, `storage/` (theme, ip-profile)
- `server/kimi.mjs` — shared Kimi proxy handlers (Node `(req,res)`; work in both
  Express and Vercel)
- `server/index.mjs` — Express prod server
- `api/chat.js`, `api/health.js` — Vercel serverless functions; thin re-exports of
  `server/kimi.mjs` handlers
- `public/` — static assets, served verbatim (large; see Gotchas). Includes the
  self-contained `garuda/` web game loaded via iframe.

## Core concepts

- **`ProjectKind`** (`mini-program | ai-avatar | ops-proposal | web-app | web-game |
  marketing-h5`) drives both the right-pane preview and the product-view bucketing.
  `PROJECT_KINDS` in VibeCodingPage maps each seeded project name → kind.
- **Chat (`sendChat` in VibeCodingPage)**: keyword matching routes a message into a
  scripted demo flow (发布 / 触发器 / 需求收集 / 游戏生成) **or**, for plain messages,
  a **real streamed Kimi reply** (`LiveAiReply` → `streamChat` → `/api/chat`).
- **Publish flow**: `usePublishFlowStore` is shared by the in-chat publish card and
  the `PublishDrawer` popover.
- **Kimi proxy**: the key lives only on the server (`.env` locally, platform env in
  prod). The browser only ever calls same-origin `/api/chat`.

## Conventions

- Path alias `@/` → `src/`.
- Comments explain **why**, not what; keep them short. Match existing terse style.
- Default to editing `VibeCodingPage.tsx` for product UI; new previews go in
  `src/modules/vibecoding/components/`.
- Verify UI changes in the browser preview (a `dev` config exists in
  `.claude/launch.json`).
- **Clickable elements must show the hand cursor.** Tailwind v4's preflight no
  longer sets `cursor: pointer` on buttons. A global rule in `src/index.css`
  restores it for enabled `button` / `[role="button"]` / `label[for]` / `summary`
  — keep that rule, and for any custom clickable (a `div`/`span` with `onClick`)
  add `cursor-pointer` explicitly (use `cursor-not-allowed` / `cursor-default`
  for disabled / non-interactive).
- **Images must be compressed.** Any image added to `public/` (or replaced) must be
  kept small — no oversized dimensions, no multi-MB files. Cap dimensions to what's
  actually displayed (avatars ≤ 512px, backgrounds ≤ 1600px long side) and run it
  through `node scripts/compress-images.mjs` (TinyPNG; key in `.env`). Prefer the
  smallest format that works.
- After any change, append a one-line entry to `WORKLOG.md` (newest on top).

## Gotchas

- **Never expose the Kimi key client-side.** `.env` is gitignored; keep it server-only.
- `public/` ships everything verbatim and is heavy — compress new images (WebP/AVIF),
  don't add multi-MB PNGs. Unused assets are NOT tree-shaken.
- `VibeCodingPage.tsx` is huge: edits can be slow to HMR and easy to mis-scope.
- Programmatic input via DevTools may not sync React draft state before a click —
  not a real bug; real typing works.
- Do **not** commit/push unless the user explicitly asks.
