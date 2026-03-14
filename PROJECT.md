# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Quick Development Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the Vite development server on `localhost:5174`. After running, open the URL that appears in the console or use Cursor’s browser tool to navigate to `http://localhost:5174`. |
| `npm run build` | Compiles TypeScript and bundles the app for production. The output is placed under `dist/`. |
| `npm run preview` | Serves the built bundle locally, useful for testing a production‑ready build. |

> **Tip:** If you need to test a single route while developing, simply modify `src/App.tsx` or add a new component and refresh the browser; Vite’s hot module replacement will apply changes instantly.

## 2. Project Structure Overview

```
├─ design-system/          # The portable Venom UI design system
│   ├─ tokens/             # Sass variables & CSS theme vars (light/dark)
│   ├─ layout/             # Layout wrappers, sidebar, menu styles
│   ├─ helpers/            # Mixins such as scrollbar and aspect‑ratio
│   ├─ overrides/          # PrimeReact component overrides
│   └─ uikit/              # UI components (StatusBadge, Tree, DataTableDynamic, etc.)
├─ src/                    # Minimal demo application
│   ├─ App.tsx             # Router, UIkitProvider and error boundary
│   ├─ layout/
│   │   └─ AppLayout.tsx  # Sidebar + navigation component used by the app
│   ├─ pages/
│   │   ├─ Showcase.tsx   # Demo page showing a collection of components
│   │   ├─ Buckets.tsx    # Example data‑heavy page
│   │   ├─ PostgresSettings.tsx
│   │   └─ About.tsx       # Static info page
│   └─ App.scss            # Global styles, imports all design‑system layers in order
└─ .cursor/
    ├─ rules/              # Cursor rules – e.g. build-screen.mdc
    └─ skills/             # Skills that implement rule logic (build-screen)
```

### Design System Layers
The **design-system** folder is intentionally modular:
* `tokens` holds Sass variables for spacing, colors and typography.
* `layout` provides the page shell – `.layout-wrapper`, `.layout-sidebar`, `.layout-main` etc., which are consumed by `src/layout/AppLayout.tsx`.
* `helpers` contains small mixins used throughout the design system.
* `overrides` patch PrimeReact styles so that components match the Venom UI look‑and‑feel.
* `uikit` is a copy of the original uikit; it exports ready‑to‑use React components such as `StatusBadge`, `Tree`, `Message`, `DataTableDynamic`, and many others. All components import their own styles from `design-system/uikit/styles/...`.

The demo app stitches these layers together by importing the design‑system Sass files in `src/App.scss` **in the exact order** shown in the README:
1. PrimeReact core CSS
2. Tokens (light/dark)
3. Helpers & layout styles
4. PrimeReact overrides
5. uikit component styles

Any new component added to the demo should follow this same import sequence.

## 3. Cursor Integration – Building Screens
The repository contains a Cursor rule `build-screen.mdc` that guides how screens are constructed from design‑system components. Key points:
* The rule asks four questions (who, what, why, constraints) before generating the screen.
* Only components from the design system may be used; if a required component is missing, the rule offers alternative implementations.
* After generation, the rule automatically adds the new route to `src/App.tsx` and the sidebar navigation in `AppLayout`.
* Finally, it runs `npm run dev`, waits for the URL output, and opens that page in Cursor’s browser.

If you need to manually invoke this skill from CLI, use the `build-screen` skill (located under `.cursor/skills/build-screen`).

## 4. Development Workflow Tips
* **Linting** – The repo does not ship a dedicated lint script; run `npm i -D eslint` and configure as needed if you want to enforce style.
* **TypeScript** – All source files are in ES‑module syntax (`type: module`). Keep type definitions up‑to‑date by running `npm run build` which invokes `tsc`.
* **Testing** – No tests are bundled yet. If you add tests, place them under `src/__tests__/` and use a framework such as Vitest or Jest.

## 5. Common Commands for CLI Users
```bash
# Install dependencies (use legacy peer deps if required)
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build production bundle
npm run build

# Preview built app locally
npm run preview
```

These commands are the foundation for any future development or debugging sessions.
