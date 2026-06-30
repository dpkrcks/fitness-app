# 15 — Auth: Google OAuth + Email OTP Plan (Phase 0)

> **Status:** ⚪ planned — not started. **Layers on top of `14-auth-module-plan.md`** (argon2 + JWT access + rotating DB refresh tokens). Implement doc 14's core first, then this.
> **Scope:** Google sign-in (OAuth) + email OTP verification on signup, end-to-end **mobile → api → db**, on a **100% open-source / free** path.
> **Tracker:** `13-task-tracker.md` → Phase 0 → "Auth module".

## Locked decisions (this doc)

- ✅ **OTP channels:** **email only** for now; the OTP system is built **channel-agnostic** so SMS drops in later behind the same interface. (No free open-source SMS transport exists at scale; deferred until there's a transport budget.)
- ✅ **Google on mobile:** **`expo-auth-session`** (PKCE, web-browser flow) — **stays in Expo Go**, no EAS dev build required. (Native `@react-native-google-signin` revisited only with a dev build.)
- ✅ **Token model unchanged:** Google and OTP are only *ways to establish identity*; after either, we mint our **own** access + rotating refresh tokens (from doc 14). One session currency everywhere.
- ✅ **Apple Sign In:** deferred to iOS-release time (App Store guideline 4.8 requires it once Google sign-in ships). OSS path noted, not scoped here.
- ✅ **Onboarding/profile:** collected **after** OTP verification (not at signup — keeps signup friction low and avoids storing data for unverified emails). `displayName` + `dateOfBirth` are **required** (min age **13**, configurable); units + body metrics (sex/height/weight/goal/activity) are **skippable** and completed later from a Profile screen. Stored in a **1:1 `Profile`** table, separate from the auth `User`. Body metrics are consumed in Phase 3 (BMI/BMR/TDEE).

## The "open-source only" reality

Everything is free + OSS **except the OTP delivery transport**, which we isolate behind a provider interface:

| Capability | OSS? | Cost |
|---|---|---|
| Google as IdP (Cloud project) | ✅ | Free |
| Verify Google ID token (`google-auth-library`, Apache-2.0) | ✅ | Free |
| OTP generate / hash / verify (Node `crypto`) | ✅ | Free |
| Email send (`nodemailer`, MIT) | ✅ | Lib free; needs an SMTP relay |
| **SMS send** | ⚠️ no free OSS transport | Paid gateway / self-hosted SIM gateway — **deferred** |

Dev email = **Mailpit** (fully OSS, local capture + web UI). Prod email transport is swappable via env vars (self-hosted Postfix or a free-tier relay). No SaaS auth platform (no Auth0/Firebase/Clerk).

## Architecture

```
  email+password ─┐      establishSession(userId):
  Google ID token ─┼────▶   sign access JWT
  (after OTP verify)┘        mint+hash+persist rotating refresh  ──▶ AuthTokens
```

### A. Google OAuth (ID-token pattern)

**Mobile** (`expo-auth-session`, Expo Go): run Google PKCE flow → obtain **ID token** → `POST /auth/google { idToken }`.

**API** `POST /api/v1/auth/google`:
1. Verify ID token via `google-auth-library` `OAuth2Client.verifyIdToken` (audience = our Google client IDs). Extract `sub`, `email`, `email_verified`, `name`.
2. Find-or-create:
   - by `oauth_accounts(provider=GOOGLE, providerUserId=sub)`, else
   - link by **verified** email match, else
   - create new user (`passwordHash = null`, `emailVerifiedAt` from Google `email_verified`).
3. Return our `AuthTokens` + `UserPublic` (same shape as login/register).

### B. Email OTP verification

**Signup flow:**
1. `POST /auth/register` → create user `emailVerifiedAt = null`; generate 6-digit code; store its **hash**; send via email channel. **No session tokens issued yet** (returns the unverified `UserPublic`).
2. `POST /auth/verify-otp { identifier, code, purpose }` → on match: set `emailVerifiedAt`, **then** issue `AuthTokens`.
3. `POST /auth/resend-otp { identifier, purpose }` → throttled re-send.
4. `login` of an unverified user → `403 { code: "EMAIL_NOT_VERIFIED" }` → mobile routes to verify screen.
5. **After verify → onboarding** (see Part C): if the user has no `Profile`, route to onboarding before the app.

### C. Post-OTP onboarding (Profile)

Collected once, right after verify. **Required:** `displayName` + `dateOfBirth` (validated as a real past date; enforce a configurable **minimum age**, default 13). **Skippable → complete later:** `units` (+ Phase-3 body metrics). The app gate checks "has profile?" — missing → onboarding; present → app. A Profile/Settings screen lets users edit/fill the rest anytime.

- `GET /me/profile` → current profile (or 404 if none).
- `POST /me/profile` (auth-guarded) → create/complete; validates required fields + min age.
- Mobile: `src/app/(onboarding)/profile-setup.tsx` (name + DOB required, "Skip the rest"); a later Profile screen for edits.

**OTP rules (a 6-digit code is only 10⁶ — online brute force is the threat):**
- Hash code at rest (sha-256 OK *given* strict rate-limiting).
- Expiry ~10 min; **max 5** verify attempts then invalidate; **resend cooldown 60s** + daily cap.
- Constant-time compare; never reveal whether an identifier exists (no enumeration).

## Data model (one migration: `auth_oauth_otp`)

> Builds on doc 14's `User.passwordHash` + `RefreshToken`. **Show generated SQL before applying.**

```prisma
model User {
  // existing + doc 14: id, email, createdAt, updatedAt, deletedAt, refreshTokens
  passwordHash    String?   @map("password_hash")   // nullable: Google users have none
  emailVerifiedAt DateTime? @map("email_verified_at")
  phone           String?   @unique                  // E.164, reserved for later
  phoneVerifiedAt DateTime? @map("phone_verified_at")
  oauthAccounts   OAuthAccount[]
  profile         Profile?
}

model Profile {                                      // @@map("profiles")
  userId        String   @id @db.Uuid               // 1:1, PK = FK to User
  displayName   String                              // required
  dateOfBirth   DateTime @db.Date                   // required (age; min 13)
  units         String   @default("metric")         // "metric" | "imperial"
  // Deferred / fill-later (nullable) — consumed in Phase 3:
  sex           String?
  heightCm      Int?
  weightKg      Float?
  goal          String?
  activityLevel String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model OAuthAccount {                                 // @@map("oauth_accounts")
  id             String  @id @default(uuid()) @db.Uuid
  userId         String  @db.Uuid
  provider       String                              // "GOOGLE"
  providerUserId String                              // Google `sub`
  user           User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerUserId])
  @@index([userId])
}

model VerificationCode {                             // @@map("verification_codes")
  id           String   @id @default(uuid()) @db.Uuid
  userId       String?  @db.Uuid                     // null if pre-account
  channel      String                                // "EMAIL" | "SMS"
  identifier   String                                // email (or E.164 phone later)
  purpose      String                                // "SIGNUP" | "LOGIN" | "PASSWORD_RESET"
  codeHash     String
  expiresAt    DateTime
  attemptCount Int      @default(0)
  consumedAt   DateTime?
  createdAt    DateTime @default(now())
  @@index([identifier, purpose])
}
```

## Dependencies (OSS, install permission-gated, pinned `-E`)

**API:** `google-auth-library`, `nodemailer` + `@types/nodemailer` (dev), `@nestjs/throttler`.
(`libphonenumber-js` only when SMS/phone is picked up later.)

**Mobile:** `expo-auth-session`, `expo-crypto`, `expo-web-browser` (install via `expo install` → SDK-54-correct versions).

**Dev tooling:** Mailpit (standalone binary or Docker — not an npm dep).

## Env additions — `apps/api/src/config/env.schema.ts`

- `GOOGLE_CLIENT_ID_ANDROID`, `GOOGLE_CLIENT_ID_IOS`, `GOOGLE_CLIENT_ID_WEB` (audiences accepted by token verify)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `OTP_TTL` (default `"10m"`), `OTP_MAX_ATTEMPTS` (default `5`), `OTP_RESEND_COOLDOWN` (default `60`)

Update `.env` + `.env.example` (secrets generated locally, **never committed**).

## shared-types additions (`@fit/shared-types`)

- `googleAuthSchema` — `{ idToken: string }`
- `verifyOtpSchema` — `{ identifier, code (6 digits), purpose }`
- `resendOtpSchema` — `{ identifier, purpose }`
- extend `UserPublic` → add `emailVerified: boolean`

Rebuild (tsup) — consumed by api (validation) + mobile (forms/types).

## API files (added to doc 14's auth module)

```
src/modules/auth/
  auth.controller.ts        # + POST /auth/google, /auth/verify-otp, /auth/resend-otp
  auth.service.ts           # + verifyGoogle / requireVerifiedOrThrow
  google.service.ts         # google-auth-library: verify ID token → claims
  otp.service.ts            # generate/hash/persist/verify + attempt/expiry/cooldown
src/modules/notifications/
  otp-delivery.interface.ts # send(channel, to, code, purpose)
  email-smtp.provider.ts    # nodemailer → SMTP (Mailpit/relay)
  email-log.provider.ts     # dev fallback: logs the code to the API console
  sms.provider.ts           # stub: throws "not configured" (deferred)
  notifications.module.ts   # selects sender: SMTP_* set → SMTP, else log (+ warn in prod)
```

**Delivery strategy (locked):** the email channel resolves at module init — if `SMTP_HOST` is configured it sends via nodemailer; otherwise it uses the **log sender** (writes the OTP to the API console) so the verify flow is testable in dev **without Mailpit**. Point `SMTP_*` at Mailpit or any relay to switch to real email with **zero code change**. In `production` with no SMTP configured, boot warns loudly (codes-to-log is dev-only).

`@nestjs/throttler` applied to `/auth/*` (tighter limits on otp/verify/resend).

## Mobile files (added to doc 14's auth flow)

```
src/lib/auth/google.ts        # expo-auth-session Google PKCE → idToken
src/lib/auth/auth-api.ts       # + google(), verifyOtp(), resendOtp()
src/app/(auth)/verify.tsx      # OTP entry screen (resend + cooldown)
src/app/(auth)/login.tsx       # + "Continue with Google" button
src/app/(auth)/register.tsx    # + "Continue with Google" button
```

## Verification

- **API:** `tsc` + `nest build` clean. Manual flows: (1) register → receive code in Mailpit → verify-otp → tokens; (2) login unverified → 403 → resend → verify; (3) Google ID token → user created/linked → tokens; (4) reused/expired/over-attempt codes rejected. Optional vitest for otp.service attempt/expiry/cooldown.
- **Mobile (Expo Go):** register → enter code from Mailpit → logged in; "Continue with Google" → logged in; kill & reopen → still logged in (secure-store from doc 14).

## Proposed commits (layer after doc 14's commits)

1. `feat(shared-types): add google + otp auth schemas`
2. `feat(api): email OTP verification (channel-agnostic) + Mailpit dev delivery`
3. `feat(api): google sign-in via id-token verification`
4. `feat(mobile): google button + OTP verify screen`
5. `docs(plan): mark Google OAuth + OTP done`

## Open items / revisit later

- **SMS/phone OTP** — pick a transport (paid gateway or self-hosted SIM gateway) + `libphonenumber-js`; the `sms.provider.ts` slot is already there.
- **Sign in with Apple** — required before iOS App Store submission once Google sign-in ships.
- Prod email transport choice (self-hosted Postfix vs free-tier relay) + SPF/DKIM for deliverability.
- TOTP authenticator-app 2FA (offline, no delivery) as a later security upgrade — distinct from email/phone *ownership* verification.
