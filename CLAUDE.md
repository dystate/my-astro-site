# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the project root:

- `npm run dev` — start the dev server (http://localhost:4321)
- `npm run build` — production build to `./dist/`
- `npm run preview` — preview the production build locally
- `npm run astro check` — type-check `.astro`/TypeScript
- `npm run astro add <integration>` — add an Astro integration

There is no test suite or separate lint script; rely on `astro check` and TypeScript (`tsconfig.json`).

Node `>=22.12.0` is required (see `package.json` `engines`).

## Architecture

This is a personal website ("Dystate") built with **Astro 6 in SSR mode** (`output: 'server'`), React 19 islands, and Tailwind CSS v4. The defining constraint is a **Neo-Brutalism design system** — read `design.md` before touching any styling. It is the source of truth for colors (OKLCH tokens in `src/styles/global.css`), the hard-edged solid-offset-shadow aesthetic (never use blur on shadows), typography, and per-page background colors.

### Rendering model
- `.astro` files (`src/pages/`, `src/layouts/`, `src/components/*.astro`) render on the server.
- `.tsx`/`.jsx` components are React **islands** — interactive widgets (3D scenes, galleries, login, mobile menu) hydrated on the client. Heavy libraries (Three.js, motion, swiper, page-flip) live only in islands.
- Pages are in `src/pages/`. Dynamic routes: `album/[id].astro`, `logs/[...slug].astro`.

### Content collections (`src/content.config.ts`)
Two glob-based collections, both sourced from `src/data/` (kept out of `src/content/` to avoid reserved-directory conflicts):
- `logs` — blog/journal entries (`src/data/logs/`), schema requires `title`/`date`; supports `category`, `draft`, `accent`, etc.
- `woaidan` — a "bookshelf" of markdown pages grouped into books (`src/data/woaidan/`).

Non-collection structured data also lives in `src/data/` as `.ts` files (e.g. `data/books.ts`, `data/album/index.ts`).

### Images / album pipeline
`src/data/album/cloud.ts` is the single point of control for photo URLs. `resolvePhotoSrc(albumId, src)` resolves bare keys (`01.jpg`) against `PHOTO_BASE`, which defaults to local `/photos/<album>/` but can be pointed at a CDN via the `PUBLIC_PHOTO_BASE` env var **without code changes**. `scripts/upload-album-upyun.ps1` batch-uploads an album folder to Upyun via the `upx` CLI; `scripts/livp-to-jpg.ps1` converts iPhone `.livp` photos.

### Navigation — DRY rule
Site nav links are defined **once** in `src/components/SiteNav.astro` (the `LINKS` array). Desktop nav and mobile fullscreen menu both render `<SiteNav current="..." />`; styling is driven entirely by parent-page CSS selectors, never by the component. **Never hardcode duplicate `<a>` link lists per page.** Add a new page by adding one entry to `LINKS`.

### UI components
`src/components/ui/` holds shadcn/ui-style React components built on Radix primitives with `class-variance-authority` variants; use `cn()` from `src/lib/utils.ts` for class merging. These modern rounded components are reserved for functional tool pages; personal-content pages use the brutalist components (`Paper`, `StackingCard`, `BulletinBoard`).

### Deployment
`astro.config.mjs` is configured with the **Vercel** adapter (SSR). The `@astrojs/cloudflare` adapter is also installed as a dependency but not active — switching targets means changing the adapter in the config.
