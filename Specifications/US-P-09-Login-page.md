# US‑P‑09: Login Page / Modal — Implementation Plan

## Story

**I, as a reader or author, want to access a login form with email and password fields, for authenticating myself to access personal sections.**

### Acceptance Criteria

```gherkin
Given I click “Log in” in the navigation
When the login form appears (as a page or modal)
Then I see fields for email and password
And I see a “Submit” or “Log in” button
And I see a link to sign up (if new user)
```

### Related Requirements

| ID | Requirement |
|----|-------------|
| **US‑P‑15** | Navigation — “Log in” when anonymous; “My Books” / “Books by me” + “Log out” when authenticated |
| **US‑P‑10** | My Books — downstream; requires successful login |
| **US‑P‑11** | Books by me — downstream; requires author login |
| **US‑R‑01 / FR‑R‑01** | Wrong credentials → “Invalid email or password”; user stays logged out |
| **US‑A‑01 / FR‑A‑01** | “Books by me” nav visible only after auth; author role from `profiles.is_author` |
| **US‑C‑01 / FR‑C‑01** | Guard redirect to login with `returnUrl`; resume destination after success |
| **NFR‑5** | Unauthenticated users blocked from protected routes (`authGuard`, `authorGuard`) |
| **NFR‑1** | Page loads quickly — form is static; no heavy data fetch |

---

## Journey Context

### Reader Journey 1 — Stage 12 (optional authenticated path)

```mermaid
flowchart LR
    Browse[Browse / read public books] -->|Optional| NavLogin[Click Log in US-P-09]
    NavLogin --> LoginPage[/login page]
    LoginPage -->|Success| MyBooks[My Books US-P-10]
    MyBooks --> Reading[Reading page US-P-05]
    LoginPage -->|Sign up toggle| SignUp[Create account same page]
    SignUp -->|Success| MyBooks
```

| Stage | User goal | Touchpoint expectations |
|-------|-----------|-------------------------|
| **12 — Signing up / logging in** | Access “My Books” to save favorites | Quick, optional auth; email + password; sign-up path for new users |
| **13 — My Books** | See saved library | Nav shows “My Books” only after login (US‑P‑15) |

**Emotions to support:** willing, neutral — auth must not block the main reading journey (stages 1–7 remain login-free).

### Author Journey 2 — Stage 1 (required entry)

```mermaid
flowchart LR
    NavLogin[Click Log in] --> LoginPage[/login page]
    LoginPage -->|Reader account| Home[Home — no Books by me]
    LoginPage -->|Author signup or author profile| BooksByMe[Books by me US-P-11]
    GuardBlock[/books-by-me without auth/] -->|authGuard redirect| LoginPage
    LoginPage -->|returnUrl=/books-by-me| BooksByMe
    BooksByMe --> Logout[Log out US-P-15]
    Logout --> Home
```

| Stage | User goal | Touchpoint expectations |
|-------|-----------|-------------------------|
| **1 — Logging in** | Reach author-only features | Credentials submit fast; clear errors on failure |
| **2 — Books by me** | Manage publications | Nav “Books by me” appears only when `is_author === true` |

**Emotions to support:** anticipatory, focused — author expects immediate access after valid login.

### Cross-journey constraints

- **Page vs modal:** Story allows either. **Use a dedicated page at `/login`** (already routed) — works with `returnUrl` from guards, deep links, and browser back. Modal overlay is post-MVP.
- **Reading stays public:** Login is never required for published book info or reading (US‑P‑05).
- **Do not remove** existing nav items, footer links, or page sections (workspace rule). Extra nav links (Library, Collections, Community) stay as-is until US‑P‑15 cleanup.
- **Logout** lives in nav (`AppShellComponent`), not on the login page — Author Journey stage 15.

---

## Current Codebase

| Area | Status |
|------|--------|
| Route `/login` → `LoginPage` | ✅ `app.routes.ts` |
| Nav “Log in” / “Log out” + role-based links | ✅ `app-shell.component.html` |
| Email + password fields + sign-up toggle | ✅ `login.page.html` |
| `AuthService.signIn` / `signUp` / optimistic `signOut` | ✅ Supabase + local session clear |
| Profile creation on signup | ✅ DB trigger `handle_new_user` |
| `returnUrl` redirect after login | ✅ `login.page.ts` |
| Guard redirect to `/login?returnUrl=…` | ✅ `auth.guard.ts`, `author.guard.ts` |
| `authGuard` waits for session load | ✅ `toObservable(auth.loading)` |
| US‑R‑01 error message | ✅ `INVALID_CREDENTIALS_MESSAGE` |
| Author signup checkbox + `?mode=signup` | ✅ Same-page toggle |
| Chronicles design system styling | ✅ `.section`, `.auth-card`, `.auth-form__*` |
| `login.page.spec.ts` | ✅ 10 tests |
| `auth.guard.spec.ts` | ✅ 3 tests |
| Redirect if already authenticated | ✅ `login.page.ts` effect |
| Supabase-not-configured UX | ✅ Banner + disabled submit |
| `environment.ts` Supabase URL | ✅ `supabaseUrl` + `supabaseAnonKey` |
| Password reset link | ❌ Out of scope — `resetPassword` exists |
| Social login | ❌ Out of scope |

### Key files (shipped)

```
FictioneersUI/src/app/
├── app.routes.ts                           # /login route (no guard)
├── features/login/
│   ├── login.page.ts                       # submit, toggle signup, returnUrl, auth redirect
│   ├── login.page.html                     # Chronicles auth card
│   └── login.page.spec.ts                  # 10 unit tests
├── core/services/auth.service.ts           # session signals, signIn/signUp/signOut
├── core/services/supabase.service.ts       # isConfigured gate
├── core/guards/
│   ├── auth.guard.ts                       # wait-for-session + returnUrl redirect
│   └── auth.guard.spec.ts                  # 3 unit tests
└── layout/app-shell/
    ├── app-shell.component.html            # Log in / Log out / role-based links
    └── app-shell.component.ts              # logout(), direct signal bindings

supabase/migrations/
└── 20250608100200_triggers_functions.sql   # handle_new_user trigger
```

---

## Design Decision: Page (not modal)

| Option | Pros | Cons | MVP choice |
|--------|------|------|------------|
| **Dedicated `/login` page** | Guard redirects work; bookmarkable; matches existing code; accessible focus management | Leaves current browsing context | **Yes** |
| **Modal overlay** | Stays on current page | Harder `returnUrl`; focus trap; duplicate entry points | Defer post-MVP |

Sign-up stays on the **same page** via mode toggle (already implemented) — satisfies “link to sign up” without a separate route.

---

## Target UX

### Layout

Centered auth card inside standard page section (match Search page structure):

```
┌─────────────────────────────────────────────────────────────┐
│  section (max-width 1400px)                                 │
│    ┌─────────────────────────────────────┐                  │
│    │  auth-card (max-width ~420px, centered)                 │
│    │  h1.page-title — Log in / Create account               │
│    │  p.section-subtitle — optional one-liner                 │
│    │  [Display name]     (signup only)                        │
│    │  [☐ Author checkbox] (signup only)                       │
│    │  Email input                                             │
│    │  Password input                                          │
│    │  [error alert]      role="alert"                         │
│    │  [ Log in ]         btn btn-primary, full width          │
│    │  New here? Sign up  text link / button                   │
│    └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Visual tokens (reuse existing)

| Element | Classes / pattern |
|---------|-------------------|
| Section wrapper | `.section` |
| Title | `h1.page-title` — “Log <span>in</span>” / “Create <span>account</span>” |
| Subtitle | `.section-subtitle` — e.g. “Access your saved books and author tools.” |
| Card | `.auth-card` — bordered card like `.realm-empty` / search empty states |
| Inputs | `.auth-form__input` — mirror `.search-form__input` (dark bg, border, focus ring) |
| Labels | `.auth-form__label` |
| Primary CTA | `.btn.btn-primary` — full width |
| Mode toggle | `.auth-form__toggle` — underline text button, primary color on hover |
| Error | `.auth-form__error` — `role="alert"`, muted red border |
| Disabled submit | `[disabled]="loading()"` + reduced opacity |
| Checkbox row | `.auth-form__checkbox` |

### Copy

| State | Text |
|-------|------|
| Login heading | **Log in** |
| Signup heading | **Create account** |
| Email label | **Email** |
| Password label | **Password** |
| Submit (login) | **Log in** |
| Submit (signup) | **Sign up** |
| Loading | **Please wait…** |
| Sign-up prompt | **New here?** → **Sign up** |
| Login prompt | **Already have an account?** → **Log in** |
| Author checkbox | **I want to publish books as an author** |
| Invalid credentials (US‑R‑01) | **Invalid email or password** |
| Supabase offline | **Sign-in is unavailable. Configure Supabase to enable login.** |
| Already logged in | Redirect silently to `returnUrl` or `/` |

---

## Architecture

### Auth flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant AuthService
    participant Supabase
    participant DB as profiles + trigger

    User->>LoginPage: Submit email/password
    alt sign in
        LoginPage->>AuthService: signIn(email, password)
        AuthService->>Supabase: signInWithPassword
    else sign up
        LoginPage->>AuthService: signUp(email, password, { displayName, isAuthor })
        AuthService->>Supabase: signUp + user_metadata
        Supabase->>DB: handle_new_user trigger
    end
    Supabase-->>AuthService: session | error
    alt success
        AuthService->>AuthService: onAuthStateChange → loadProfile
        AuthService-->>LoginPage: complete
        LoginPage->>LoginPage: navigateByUrl(returnUrl ?? '/')
    else failure
        AuthService-->>LoginPage: Error(INVALID_CREDENTIALS_MESSAGE)
        LoginPage->>User: show error, keep email, keep password (US-R-01 allows either)
    end
```

### Post-login navigation

| User type | `returnUrl` | Default if missing |
|-----------|-------------|-------------------|
| Reader | e.g. `/my-books` | `/` (home) |
| Author | e.g. `/books-by-me` | `/` — author uses nav to reach dashboard |
| Non-author hitting `authorGuard` | Redirected to `/` after login if not author | — |

`authorGuard` already sends non-authors to `/` after login when `returnUrl` was `/books-by-me`.

### Sign-up metadata → profile

`AuthService.signUp` passes Supabase `options.data`:

```typescript
{
  display_name: options.displayName ?? email.split('@')[0],
  is_author: options.isAuthor ?? false,
}
```

DB trigger `handle_new_user` inserts into `public.profiles` — no client-side profile insert needed.

---

## Component Implementation Checklist

### `login.page.ts`

- [x] Inject `SupabaseService` (or expose `auth.isConfigured` on `AuthService`) for offline banner.
- [x] On init: if `auth.isAuthenticated()`, redirect to `returnUrl ?? '/'` (skip form for logged-in users).
- [x] Optional: read `?mode=signup` query param to open in signup mode (author onboarding link).
- [x] Guard submit when `!supabase.isConfigured` — set error message, do not call API.
- [x] Keep `returnUrl` from `ActivatedRoute.snapshot` (or `queryParamMap` subscription if slug changes matter).
- [x] After successful login, wait for profile load if nav depends on `isAuthor` (see note below).
- [x] Preserve email on error; keep password filled (US‑R‑01 allows “remains for retry”).

**Profile load timing:** `onAuthStateChange` loads profile asynchronously. If author lands on `/books-by-me` immediately, `authorGuard` may run before profile loads. **Mitigation:** in `signIn`/`signUp` success handler, await `auth.loadProfile()` (expose package-private method or return profile from sign-in observable) before navigating when `returnUrl` is author-only.

### `login.page.html`

- [x] Wrap in `<section class="section">` + `.auth-card`.
- [x] Use design-system classes (remove inline `indigo-600`, `max-w-md` ad-hoc Tailwind where globals exist).
- [x] `autocomplete="email"`, `autocomplete="current-password"` / `new-password`.
- [x] `@if (!isConfigured)` config warning above form.
- [x] Error block with `role="alert"`.
- [x] Submit button: `.btn.btn-primary`, `[disabled]="loading() || !isConfigured"`.
- [x] Sign-up toggle link at bottom (keep existing behavior).

### `styles.scss`

- [x] `.auth-card` — centered, max-width ~420px, padding, border consistent with app cards.
- [x] `.auth-form` — flex column, gap.
- [x] `.auth-form__input` — match `.search-form__input`.
- [x] `.auth-form__error` — visible error state.
- [x] `.auth-form__toggle` — text button for mode switch.
- [x] `.nav-link-btn` — if missing, style logout button like nav links (may already inherit).

### `auth.service.ts` (minimal tweaks)

- [x] Add readonly `isConfigured` computed from `SupabaseService`.
- [x] Optionally expose `waitForProfile(): Promise<void>` after sign-in for guard-safe navigation.
- [x] Keep generic `INVALID_CREDENTIALS_MESSAGE` for all sign-in failures (US‑R‑01).
- [x] Optimistic `signOut()` — clear signals + `localStorage` immediately; background Supabase call.

### `auth.guard.ts` (optional hardening — separate small task)

- [x] Replace `if (auth.loading()) return true` with wait-for-session resolver or functional guard that returns `Observable`/`Promise` until `loading()` is false — prevents flash of protected content. Can ship with US‑P‑09 or US‑P‑15.

### Environment

- [x] Fix `environment.ts`: set `supabaseUrl` to project URL (remove stray `asupabaseUrl` typo) so local login works against Supabase Cloud.
- [x] Document that anon browsing works with empty URL; auth requires configured Supabase.

### Tests — `login.page.spec.ts`

Mirror patterns from `search.page.spec.ts` / `book-info.page.spec.ts`:

| Test | Assert |
|------|--------|
| should create | component truthy |
| should render email and password fields | `input[type=email]`, `input[type=password]` |
| should render Log in button | `.btn-primary` text “Log in” |
| should show Sign up toggle when logged out | “Sign up” button visible |
| should toggle to signup mode | heading “Create account”, author checkbox visible |
| should display error on failed signIn | `INVALID_CREDENTIALS_MESSAGE`, `role="alert"` |
| should call signIn and navigate on success | AuthService spy, Router.navigateByUrl |
| should use returnUrl query param | navigate to `/my-books` when `?returnUrl=/my-books` |
| should redirect when already authenticated | Router.navigate when session present |
| should disable submit when Supabase not configured | button disabled + message |

Mock `AuthService`, `SupabaseService`, `Router`, `ActivatedRoute`.

### Regression

- [x] `app-shell` still shows “Log in” when logged out.
- [x] Protected routes still redirect to `/login?returnUrl=…`.
- [x] No pages or nav elements removed.
- [x] `ng build` and `npx ng test --no-watch` succeed (78 tests).

---

## Entry Points

| Source | Route / action | Notes |
|--------|----------------|-------|
| Nav “Log in” | `/login` | Primary US‑P‑09 path |
| `authGuard` on `/my-books` | `/login?returnUrl=/my-books` | Reader Journey stage 12 → 13 |
| `authorGuard` on `/books-by-me` | `/login?returnUrl=/books-by-me` | Author Journey stage 1 → 2 |
| Sign-up toggle | Same page, no route change | Satisfies “link to sign up” |
| Future FR‑C‑01 session expiry | Form submit → redirect login | Reuse `returnUrl` pattern |

---

## How to Verify

```powershell
cd FictioneersUI
# Ensure environment.supabaseUrl is set for auth testing
npm start
```

| Step | Expected |
|------|----------|
| Click **Log in** in nav | Lands on `/login` with email, password, **Log in** button |
| Click **Sign up** | Form switches to signup; author checkbox appears |
| Submit wrong password | **Invalid email or password**; still logged out |
| Submit valid reader credentials | Redirect to `/` or `returnUrl`; nav shows **My Books**, **Log out** |
| Sign up with author checkbox | After login, nav shows **Books by me** |
| Visit `/my-books` logged out | Redirect to `/login?returnUrl=/my-books`; after login → My Books |
| Visit `/books-by-me` logged out | Redirect with returnUrl; author sees dashboard |
| Visit `/login` while logged in | Redirect to home (after implementation) |
| Log out (nav) | Session cleared; **Log in** returns; Author Journey stage 15 |

```powershell
npx ng test --no-watch
npm run build
```

---

## Acceptance Verification Checklist

- [x] “Log in” nav opens login form (page at `/login`)
- [x] Email field visible and required
- [x] Password field visible and required
- [x] “Log in” (or Submit) button visible and clickable
- [x] Link/toggle to sign up for new users
- [x] US‑R‑01: invalid credentials show **Invalid email or password**
- [x] Successful login updates nav per US‑P‑15 (My Books / Books by me / Log out)
- [x] `returnUrl` honored after login (FR‑C‑01 partial)
- [x] Styled consistently with Chronicles design system
- [x] Works when Supabase configured; graceful message when not
- [x] No existing pages or elements removed
- [x] Unit tests added and passing
- [x] Log out clears nav immediately (optimistic local sign-out)

---

## Implementation Phases

### Phase 1 — Environment & service readiness (≈15 min)

1. Fix `environment.ts` `supabaseUrl` (remove typo key). ✅
2. Add `AuthService.isConfigured` (or use `SupabaseService` in page). ✅
3. Optional: `waitForProfile()` after sign-in for author `returnUrl`. ✅

### Phase 2 — UI & design system (≈45 min)

1. Restyle `login.page.html` with `.section`, `.auth-card`, `.btn-primary`. ✅
2. Add `.auth-form__*` styles to `styles.scss`. ✅
3. Redirect authenticated users away from `/login`. ✅
4. Supabase-not-configured banner. ✅

### Phase 3 — Tests & guard polish (≈45 min)

1. Create `login.page.spec.ts` (full checklist above). ✅
2. Optional: improve `authGuard` session wait (coordinate with US‑P‑15). ✅
3. Manual walkthrough: Reader Journey stage 12; Author Journey stages 1, 2, 15. ✅

### Phase 4 — Documentation & handoff (≈10 min)

1. Update this file’s **Implementation Summary** table when complete. ✅
2. Note any follow-ups for US‑P‑10 / US‑P‑11 empty states. ✅

**Estimated total:** ~2 hours — **complete**.

---

## Out of Scope (defer)

| Item | Story / note |
|------|----------------|
| Login modal overlay | Post-MVP; page satisfies US‑P‑09 |
| Social login (Google, etc.) | Journey 1 improvement |
| “Remember me” | Author Journey improvement |
| Password reset UI | `resetPassword` exists; add link post-MVP |
| Email confirmation flow | Supabase project setting — document if confirm email enabled |
| My Books / Books by me page content | US‑P‑10, US‑P‑11 |
| Full nav cleanup (Library, Collections placeholders) | US‑P‑15 |
| Session-expired banner on reading page | US‑R‑06 |
| Form data preservation after re-login | US‑C‑01 full |

---

## Implementation Summary

| Area | Status |
|------|--------|
| `/login` route + form fields | ✅ Complete |
| Sign-up toggle + author checkbox | ✅ Complete |
| `AuthService` + Supabase auth | ✅ Complete |
| `AuthService.isConfigured` | ✅ Complete |
| Profile load before post-login redirect | ✅ Complete |
| `environment.ts` URL fix | ✅ Complete |
| Nav “Log in” + guards + `returnUrl` | ✅ Complete |
| US‑R‑01 error message | ✅ Complete |
| Supabase-not-configured guard on submit | ✅ Complete (login page) |
| Chronicles design system styling | ✅ Complete |
| Authenticated-user redirect | ✅ Complete |
| Supabase-not-configured banner in UI | ✅ Complete |
| `login.page.spec.ts` | ✅ Complete (10 tests) |
| `auth.guard.spec.ts` | ✅ Complete (3 tests) |
| `authGuard` session wait | ✅ Complete |
| Optimistic `signOut` + nav signal bindings | ✅ Complete |
| Email confirmation pending flow | ✅ Complete (`EMAIL_CONFIRMATION_SENT_MESSAGE`) |

**US‑P‑09 status: ✅ Complete**

---

## Handoff — downstream stories (US‑P‑10 / US‑P‑11)

Login and auth plumbing are done. Protected routes (`/my-books`, `/books-by-me`) and nav role links work after sign-in. The destination pages exist as **stubs** — implement full UX in the next stories.

### US‑P‑10: My Books (`/my-books`)

| Item | Current state | Next story work |
|------|---------------|-----------------|
| Route + `authGuard` | ✅ Wired via login `returnUrl` | — |
| Page shell | ✅ `my-books.page.ts` loads saved books | — |
| Empty state | ⚠️ Plain text + “Browse books” link (`my-books.page.html`) | Align with Chronicles design system (`.section`, `.page-title`, card grid); use `app-book-card`; meet US‑R‑05 recovery pattern |
| Book list | ⚠️ Title/synopsis only — no covers, no “resume reading” | Add cover, author, link to `/books/:id` and reading flow |
| Save-book action | ❌ No “save to library” on book-info yet | Required for non-empty state — separate story / US‑R‑05 |
| Tests | ❌ No `my-books.page.spec.ts` | Add per US‑P‑10 spec |

**Reader journey after login:** `/login?returnUrl=/my-books` → empty state is expected for new accounts until save-book exists.

### US‑P‑11: Books by me (`/books-by-me`)

| Item | Current state | Next story work |
|------|---------------|-----------------|
| Route + `authorGuard` | ✅ Wired via login `returnUrl` | — |
| Nav visibility | ✅ `isAuthor()` from `profiles.is_author` | — |
| Page shell | ✅ `books-by-me.page.ts` loads author books | — |
| Empty state | ⚠️ Plain text + non-functional “Add new book” button (`books-by-me.page.html`) | Style per design system; wire button to US‑P‑12 add-book form (US‑A‑02) |
| Book cards | ⚠️ Title + status only — no cover, Edit/Delete | Per acceptance criteria: cover placeholder, Edit, Delete actions |
| Tests | ❌ No `books-by-me.page.spec.ts` | Add per US‑P‑11 spec |

**Author journey after login:** Sign up with author checkbox or `?mode=signup` → `/login?returnUrl=/books-by-me` lands on stub dashboard.

### Shared auth assumptions (no rework needed)

- Session: `AuthService` signals (`session`, `profile`, `isAuthenticated`, `isAuthor`)
- Sign-out: optimistic local clear — do not block UI on Supabase network
- Guards: `authGuard` waits for `loading()` false before redirect
- Email confirmation: if Supabase requires confirm, signup shows success message and returns to login mode

### Suggested implementation order

1. **US‑P‑10** — design-system empty state + book cards (unblocks Reader Journey stage 13)
2. **US‑P‑11** — design-system empty state + book cards with Edit/Delete stubs
3. **US‑P‑12** — wire “Add new book” (US‑P‑11 empty-state CTA)
4. **US‑P‑15** — full nav cleanup (Library, Collections placeholders)
