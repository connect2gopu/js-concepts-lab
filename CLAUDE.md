# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive learning playground for JavaScript/TypeScript concepts. Each concept (TypeScript, Async Patterns, Design Patterns, Functional Programming, Performance, Data Structures) has its own route with tabbed, live-runnable demos. There is also a full Todo app used as the primary testing target.

## Development Commands

```bash
# Install
npm install

# Dev server (localhost:3000)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Jest (unit + integration) — all tests
npm test

# Jest — single file
npm test -- --testPathPattern=__tests__/unit/useTodos

# Jest watch mode
npm run test:watch

# Cypress component tests (interactive)
npm run cy:open

# Cypress component tests (headless)
npm run cy:run

# Playwright e2e (auto-starts dev server)
npm run e2e

# Playwright with browser visible
npm run e2e:headed

# Playwright interactive UI mode
npm run e2e:ui
```

## Architecture

```
Browser
  └── Next.js App Router (app/)
        ├── layout.tsx          ← Sidebar + ThemeProvider wrapping all pages
        ├── page.tsx            ← Home: concept cards grid
        ├── concepts/
        │     ├── layout.tsx    ← max-w-5xl content container
        │     └── [slug]/
        │           ├── page.tsx       ← "use client"; uses <Tabs> + imports demos
        │           └── demos/*.tsx    ← Self-contained interactive demo components
        ├── lld/
        │     ├── layout.tsx    ← LLD section layout
        │     ├── page.tsx      ← LLD listing page (card grid)
        │     └── [slug]/
        │           └── page.tsx ← Detail page: Statement | Editor | Visual tabs
        ├── todo/page.tsx       ← Full Todo page (testing showcase)
        ├── playground/page.tsx ← Monaco Editor sandbox: run JS/TS; collapsible snippet sidebar (save/load/delete/export); Save modal with .js/.ts toggle; language mode follows active snippet extension; example-snippets strip
        ├── error.tsx           ← Global error boundary (Next.js special page)
        ├── loading.tsx         ← Global loading skeleton (Next.js special page)
        ├── not-found.tsx       ← 404 page (Next.js special page)
        └── api/
              ├── concepts/route.ts     ← Shape Factory API (Design Patterns demo)
              └── snippets/
                    ├── route.ts            ← GET list / POST save / DELETE snippet files
                    └── [filename]/route.ts ← GET individual snippet by filename

State
  ├── lib/store.ts        ← Zustand stores (usePipelineStore, useCounterStore)
  └── components/todo/useTodos.ts ← Local useState hook + exported pure reducers

Shared
  ├── lib/concepts-data.ts  ← Single source of truth for concept metadata (slug, title, tags, color)
  ├── lib/lld-data.ts       ← Single source of truth for LLD metadata (id, slug, title, problem statement)
  ├── components/sidebar.tsx ← Nav built from concepts-data.ts and lld-data.ts
  ├── components/lld/visuals/ ← Per-LLD visual components (e.g. calendar-visual.tsx)
  ├── components/ui/tabs.tsx ← Generic tab primitive used by all concept pages
  ├── components/code-demo.tsx ← Syntax-highlighted code block wrapper
  ├── lib/utils.ts          ← `cn(...classes)` utility (joins class names, filters falsy values)
  ├── proxy.ts              ← Unused Next.js middleware draft (see Gotchas)
  ├── snippets/             ← Persisted user code snippets (saved from Playground; .js/.ts files)
  └── sessions/             ← Session handoff notes (.md files) for resuming LLD work across conversations
```

## Testing Layers

Three distinct test layers, each for a different purpose:

| Layer | Tool | Location | What it tests |
|---|---|---|---|
| Unit | Jest | `__tests__/unit/` | Pure reducer functions (no React) |
| Integration | Jest + RTL | `__tests__/integration/` | Component behaviour with DOM |
| Component | Cypress | `cypress/component/` | Components with Next.js webpack/Tailwind |
| E2E | Playwright | `e2e/` | Full user flows against running dev server |

Jest config (`jest.config.ts`): uses `ts-jest`, `jest-environment-jsdom`, and resolves the `@/` alias. Only files under `__tests__/` matching `*.test.(ts|tsx)` are picked up — `cypress/` is excluded from the main tsconfig.

**Todo reducers are intentionally pure functions** (`addTodoReducer`, `toggleTodoReducer`, etc.) exported from `components/todo/useTodos.ts` so they can be unit-tested without React.

## Key Conventions

- **Adding a new concept**: add an entry to `lib/concepts-data.ts`, create `app/concepts/[slug]/page.tsx` (mark `"use client"`), add demos under `app/concepts/[slug]/demos/`. The Sidebar and home page cards update automatically.
- **Adding a new LLD item**: add an entry to `lib/lld-data.ts` (id, title, slug, description, problem, icon, color), then create its visual component at `components/lld/visuals/<slug>-visual.tsx` and register it in the `VISUAL_REGISTRY` inside `app/lld/[slug]/page.tsx`. The sidebar and listing page update automatically. Current item: Calendar (id: 24, slug: `24-calendar`).
- **LLD detail page layout**: three tabs — Statement (markdown problem description), Editor (Monaco + console runner), Visual (interactive React component). The visual registry maps slug → dynamically imported component.
- **Path alias**: `@/` resolves to the project root (e.g. `@/components/ui/tabs`).
- **Concept page pattern**: every concept page renders `<Tabs tabs={[{id, label, content: <DemoComponent />}]} />`.
- **Zustand stores** in `lib/store.ts` are for cross-component/demo state. Local UI state stays in component `useState`.
- **Tailwind v4** is used via `@tailwindcss/postcss` — no `tailwind.config.js` file; config is in `postcss.config.mjs`.
- **Theme**: dark/light mode is handled by `components/theme-provider.tsx`; an inline script in `app/layout.tsx` prevents flash of wrong theme on load.

## Known Gotchas

- **Jest vs tsconfig**: `jest.config.ts` overrides `moduleResolution` to `"node"` for `ts-jest` compatibility — the main tsconfig uses `"bundler"`. Don't change this without testing both.
- **Cypress is excluded from main tsconfig** (`"exclude": ["cypress", "cypress.config.ts"]`); it has its own `cypress/tsconfig.json`.
- **Playwright expects the dev server running** on port 3000. `playwright.config.ts` sets `reuseExistingServer: true`, so running `npm run dev` first avoids a cold start.
- **`app/api/concepts/route.ts`** is a real API route (Shape Factory demo) — it is not a test mock, it is used live by the Design Patterns demo page.
- **Snippet API** (`app/api/snippets/`): `GET /api/snippets` lists saved snippets, `POST` saves a new one, `DELETE` removes one, `GET /api/snippets/[filename]` fetches a single file. Snippets are stored as `.js`/`.ts` files in `snippets/` at the project root. Filenames are validated against `/^[a-zA-Z0-9_-]+\.(js|ts)$/`.
- **Playground snippet persistence**: `app/playground/page.tsx` uses the snippet API to load/save/delete named code files. The `snippets/` directory is gitignored-by-convention (user data) but currently tracked — commit snippet files only when they are part of deliberate LLD/concept work (e.g. scratch files for LLD exercises).
- **Session handoff files**: `sessions/` holds Markdown handoff docs that capture mid-session state for LLD problems (current progress, open questions, resume prompt). Naming convention: `lld-<id>-<slug>.md`. Commit these so context survives across Claude Code sessions.
- **`proxy.ts`** at the project root is written as a Next.js middleware (exports `default` + `config.matcher`) but is dead code — Next.js only auto-loads `middleware.ts` at the root. Renaming it would activate the timing/path headers it adds.
- **Key runtime versions**: Next.js 16.1.6, React 19.2.3. Both are very recent; check release notes before upgrading dependencies.
- **`react-markdown`** is used in LLD detail pages to render the problem statement (markdown string from `lib/lld-data.ts`). **`framer-motion`** is available for animations in demos.
