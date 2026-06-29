# 12 — Monorepo & Shared Types (Build Details)

How the repo is organized, how shared code is consumed, and how each app builds/deploys. Read this before scaffolding.

## Tooling
- **Package manager:** pnpm (workspaces) — fast, disk-efficient, strict.
- **Task runner / caching:** Turborepo — builds only what changed, orchestrates dependency order.
- **Language:** TypeScript (strict) everywhere.

> A monorepo is a **code-organization** choice, not a deployment choice. Each app still builds and deploys **independently**.

## Folder structure
```
/apps
  /mobile        (Expo)            → @fit/mobile
  /web           (React + Vite)    → @fit/web
  /api           (NestJS)          → @fit/api
  /ml            (FastAPI, Phase 3+) — Python, NOT a pnpm workspace package
/packages
  /shared-types  → @fit/shared-types  (zod schemas + TS types — the one source of truth)
  /config        → @fit/config        (shared tsconfig / eslint / prettier presets)
  /ui            → @fit/ui            (design TOKENS only — colors/spacing/type scale; NOT components)
/plan            (these docs)
pnpm-workspace.yaml
turbo.json
package.json    (root, private)
```

### Notes on the structure
- **Scoped names** (`@fit/*`) make internal imports unambiguous.
- **`/ml` is Python**, not a JS workspace package. It talks to `api` over HTTP; it does not import `@fit/shared-types`. Keep its contract in sync via OpenAPI/JSON schema, not TS imports.
- **`/ui` is tokens-only.** Sharing React Native ↔ web *components* needs `react-native-web` and is a real tax — defer it. Sharing tokens (a JSON/TS object of colors/spacing) is cheap and safe.

## Shared types: how they're consumed (NOT hosted)
`@fit/shared-types` is **never deployed or published**. The package manager symlinks it into each app's `node_modules`; each app's bundler compiles it into its own output. There is no runtime service for types.

### 1. Declare workspaces
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2. The package exposes compiled output
```jsonc
// packages/shared-types/package.json
{
  "name": "@fit/shared-types",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.js" }
  },
  "scripts": { "build": "tsup src/index.ts --format esm,cjs --dts" },
  "dependencies": { "zod": "<pinned stable>" },
  "devDependencies": { "tsup": "<pinned stable>", "typescript": "<pinned stable>" }
}
```

### 3. Each consumer depends on it via the workspace protocol
```jsonc
// apps/mobile, apps/web, apps/api  → package.json
{ "dependencies": { "@fit/shared-types": "workspace:*" } }
```

### 4. Use it anywhere
```ts
import { ExerciseSchema, type Exercise } from "@fit/shared-types";
// same zod schema: validates the request in NestJS, the form in web, types the response in mobile
```

## Build strategy: COMPILE the package (do not consume raw .ts)
**Decision:** build `shared-types` to JS + `.d.ts` (via `tsup`) before apps consume it. Turborepo enforces order.

Why not consume raw TypeScript source directly?
- **Metro (Expo) does not transpile `node_modules` by default** and historically struggles with symlinked workspace source. Shipping compiled output sidesteps this entirely.
- Vite and NestJS handle either, but compiled output is uniformly safe across all three bundlers.

```jsonc
// turbo.json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "build/**"] },
    "dev":   { "cache": false, "persistent": true },
    "lint":  {},
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```
`^build` = "build my dependencies first," so `@fit/shared-types/dist` always exists before an app builds.

### Keep the package runtime-light
It ships **inside the mobile bundle**. `zod` is a legitimate runtime dependency (validation). Do **not** let heavy libraries leak into it.

## Shared tsconfig (`@fit/config`)
```jsonc
// packages/config/tsconfig.base.json  (strict, extended by every app)
{ "compilerOptions": { "strict": true, "target": "ES2022", "module": "ESNext",
  "moduleResolution": "Bundler", "skipLibCheck": true, "esModuleInterop": true } }
```
Each app: `{ "extends": "@fit/config/tsconfig.base.json", ... }`.

## Local dev & common commands
```bash
pnpm install                       # links all workspaces
pnpm --filter @fit/shared-types build
pnpm --filter @fit/api dev         # run one app
turbo run dev                      # run dev across apps
turbo run build                    # build everything in dependency order
turbo run lint typecheck
```

## Service hosting / deployment (open-source-first, runtime — separate from the repo)
| Service | v1 hosting (cheap/OSS) | Later |
|---|---|---|
| `api` (NestJS) | Docker on a small VPS, or Railway/Render/Fly free tier | Managed container/K8s |
| `ml` (FastAPI, Phase 3) | Own Docker container (Python; GPU later) | Dedicated inference host |
| PostgreSQL | Docker self-host, or free managed tier | Managed Postgres |
| Object store (loops, images, body map) | **MinIO** self-host (S3-compatible) | AWS S3 + CDN |
| `web` (Vite) | Static build → Netlify/Vercel/Cloudflare Pages free tier | Same + CDN |
| `mobile` (Expo) | Not hosted — EAS build → TestFlight / Play internal | App Store / Play prod |

Turborepo builds only changed apps, so the monorepo deploys each service independently — one repo, many deploy targets.

## Gotchas checklist (so they aren't rediscovered painfully)
- [ ] `shared-types` must be **built** before apps build (Turborepo `^build` handles it).
- [ ] If Metro can't resolve `@fit/shared-types`, confirm it consumes `dist/`, not `src/`.
- [ ] Pin exact stable versions in every `package.json` (no `^`, no `@latest`).
- [ ] `ml` (Python) syncs with `api` via OpenAPI/JSON schema, **not** TS imports.
- [ ] Keep `@fit/shared-types` runtime-light (zod ok; nothing heavy).
- [ ] `/ui` stays tokens-only until `react-native-web` is justified.
