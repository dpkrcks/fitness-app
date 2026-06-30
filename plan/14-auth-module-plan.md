# 14 — Auth Module Plan (Phase 0)

> **Status:** ⚪ planned — not started. Implementation begins after this doc.
> **Scope:** register / login / JWT access + rotating refresh tokens, end-to-end **mobile → api → db**.
> **Tracker:** see `13-task-tracker.md` → Phase 0 → "Auth module".

## Design decisions (locked)

- **Password hashing:** `argon2` (argon2id). Fallback `@node-rs/argon2` (prebuilt, no native compiler) if node-gyp build fails on Windows.
- **Access token:** JWT, stateless, short-lived (~15 min), via `@nestjs/jwt`.
- **Refresh token:** **opaque random** 256-bit string (NOT a JWT). The DB stores its **SHA-256 hash** (deterministic → indexable for O(1) lookup; argon2 can't be looked up since it's salted). Rotating + **reuse detection**: presenting an already-revoked token revokes all of that user's tokens (theft response).
- **Validation:** zod schemas live in `@fit/shared-types` (shared by api + mobile) + a tiny `ZodValidationPipe` — no new validation dependency.
- **`/me` location:** under `auth` (`GET /auth/me`) for now; split into a `users` module when it grows.
- **Mobile forms:** minimal controlled inputs + zod validation from shared-types (defer `react-hook-form` until forms grow).

## 1. Dependencies (permission-gated — install at implementation time, pinned exact)

**API (`apps/api`):**
- `argon2`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@types/passport-jwt` (dev)

**Mobile (`apps/mobile`):**
- `expo-secure-store` (install via `expo install` → SDK-54-correct version)

## 2. Env contract — `apps/api/src/config/env.schema.ts`

Add:
- `JWT_ACCESS_SECRET` — string, min 32
- `JWT_REFRESH_SECRET` — string, min 32
- `JWT_ACCESS_TTL` — default `"15m"`
- `JWT_REFRESH_TTL` — default `"30d"`

Update `.env` + `.env.example` (secrets generated locally, **never committed**).

## 3. DB schema + migration — `apps/api/prisma/schema.prisma`

- **`User`**: add `passwordHash String @map("password_hash")`.
- **New `RefreshToken`** (`@@map("refresh_tokens")`):
  - `id` uuid (default uuid)
  - `userId` → `User` (cascade delete)
  - `tokenHash String @unique`
  - `expiresAt DateTime`
  - `createdAt DateTime @default(now())`
  - `revokedAt DateTime?`
  - indexes on `userId`, `tokenHash`
- One migration: `prisma migrate dev --name auth`. **Show generated SQL before applying.**

## 4. `@fit/shared-types` (the monorepo payoff)

Add + export zod schemas/types, then rebuild (tsup). Consumed by api (request validation) **and** mobile (form validation + TS types):
- `registerSchema` — email + password policy (min 8, …)
- `loginSchema`
- `AuthTokens` — `{ accessToken: string; refreshToken: string }`
- `UserPublic` — `{ id: string; email: string; createdAt: string }`

## 5. API files

```
src/common/pipes/zod-validation.pipe.ts        # generic zod → 400 {code,message,details}
src/modules/auth/
  auth.module.ts          # JwtModule.registerAsync + PassportModule; provides service + strategy
  auth.controller.ts      # routes below, Swagger-decorated (Bearer auth)
  auth.service.ts         # register / login / refresh / logout business logic
  token.service.ts        # sign access JWT; mint+hash+persist refresh; rotate; reuse-detect
  strategies/jwt.strategy.ts            # passport-jwt: verify access token → attach {userId,email}
  guards/jwt-auth.guard.ts              # AuthGuard("jwt")
  decorators/current-user.decorator.ts  # @CurrentUser() param decorator
```

**Routes** (under `/api/v1/auth`):

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | registerSchema | `UserPublic` + `AuthTokens` |
| POST | `/auth/login` | loginSchema | `UserPublic` + `AuthTokens` |
| POST | `/auth/refresh` | `{ refreshToken }` | new `AuthTokens` (rotated) |
| POST | `/auth/logout` | `{ refreshToken }` | `204` (revokes it) |
| GET  | `/auth/me` | — (Bearer) | `UserPublic` |

## 6. Mobile files

```
src/lib/auth/secure-store.ts   # save/get/delete refresh token (expo-secure-store)
src/lib/auth/auth-api.ts       # register/login/refresh/logout/me calls
src/lib/auth/auth-context.tsx  # AuthProvider + useAuth: access token in memory,
                               #   bootstrap from secure store, refresh-on-401
src/lib/api.ts                 # extend: attach Authorization header + 401 refresh hook
src/app/(auth)/login.tsx
src/app/(auth)/register.tsx
src/app/profile.tsx            # protected screen: shows /auth/me
src/app/_layout.tsx            # wrap in AuthProvider + redirect unauth → /login
```

Health screen stays public; new **Profile** screen demonstrates the protected call.

## 7. Verification

- **API:** `tsc` + `nest build` clean; manual REST flow (register → login → `/auth/me` with Bearer → refresh rotates → reused refresh triggers revoke-all). Optional: a vitest for token rotation / reuse-detection.
- **Mobile:** on-device register → login → Profile shows `/me`; kill & reopen app → still logged in (secure-store persisted); logout clears it.

## 8. Proposed commits

1. `feat(shared-types): add auth schemas (register/login/tokens)`
2. `feat(api): auth module — argon2 + JWT access + rotating refresh tokens`
3. `feat(mobile): auth flow — login/register/profile + secure token storage`
4. `docs(plan): mark Auth module done`

## Open items / revisit later

- Split `/auth/me` into a `users` module once user-facing endpoints grow.
- Add `react-hook-form` if forms gain more fields/validation complexity.
- Email verification + password reset flows (post-Phase-0).
- Rate limiting on `/auth/*` (e.g. `@nestjs/throttler`) — consider before public exposure.
