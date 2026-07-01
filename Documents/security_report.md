# Security Review — Borodina Library

Automated diff-based review found no uncommitted changes on the current branch, so this is a **full-project security audit** of the Angular frontend (`FictioneersUI`) and Supabase backend.

---

## Summary

The project has a solid foundation: RLS is enabled on all tables, auth uses PKCE, error messages avoid credential leakage, and sensitive RPCs check `auth.uid()`. Several issues need attention before production — especially the cover-upload edge function and profile column protections.

## Overall posture

| Area | Rating | Notes |
|------|--------|-------|
| Access control (RLS) | **Strong** | RLS on all tables; recent migrations hardened profiles and increment storage |
| Auth | **Moderate** | PKCE + rate limits, but weak password policy and no email confirmation |
| Injection / XSS | **Strong** | Parameterized queries; Angular auto-escaping; no dangerous DOM APIs |
| Misconfiguration | **Moderate** | CORS reflection, missing CSP, auth config tuned for dev |
| Monitoring | **Weak** | No security event logging or alerting visible |

| Severity | Location | Finding |
|----------|----------|---------|
| **Critical** | `supabase/functions/upload-book-cover/index.ts:129` | **Missing ownership check on upload path.** Any authenticated user can upload/overwrite a cover at `{anyAuthorId}/{anyBookId}/cover.*`. The function validates JWT and path format but never verifies the path's `authorId` matches `auth.uid()` or that the book belongs to that author. Uploads go directly to S3, bypassing Supabase Storage RLS. |
| **High** | `supabase/migrations/20250608100400_storage.sql:68-73` | **Draft/unpublished increment files are publicly readable.** `book_increments_select` allows `anon` + `authenticated` to read all objects in `book-increments`. RLS on the `increments` table hides draft metadata, but anyone who knows or guesses the storage path (`{authorId}/{bookId}/{incrementId}.ext`) can fetch unpublished content directly. |
| **High** | `supabase/migrations/20250608100300_rls_policies.sql:17-22` | **Profile `is_author` is client-writable.** `profiles_update_own` allows updating any column on your own row. A user can call `profiles.update({ is_author: true })` and bypass the intended “create a book first” flow, gaining access to author-only routes. |
| **High** | `supabase/migrations/20250608100300_rls_policies.sql:17-22` | **Storage quota can be bypassed.** The same profile UPDATE policy lets users set `storage_bytes_used` to `0`. `check_storage_quota` and quota triggers read this denormalized field, so an attacker can evade the 2 GB limit before recalculation runs. |
| **Medium** | `supabase/functions/upload-book-cover/index.ts:10-21` | **CORS origin reflection.** `Access-Control-Allow-Origin` echoes the request `Origin` header (or `*`). A malicious site could call the edge function cross-origin if it obtains a victim's JWT (e.g. via phishing). Prefer an allowlist of known app origins. |
| **Medium** | `FictioneersUI/src/app/features/login/login.page.ts:42-43,98-99` | **Unvalidated `returnUrl` open redirect.** After login, `navigateByUrl(returnUrl)` uses the query param without validation. Values like `//evil.com` or external URLs can redirect users post-authentication (phishing risk). Restrict to same-origin relative paths (e.g. must start with `/` but not `//`). |
| **Medium** | `supabase/config.toml:226` | **Email confirmation disabled** (`enable_confirmations = false`). Fine for dev; in production this allows sign-up with unverified emails and weak account integrity. Enable before go-live. |
| **Medium** | `supabase/config.toml:182-185` | **Weak password policy** — minimum length 6, no complexity requirements. Increase to 8+ with `password_requirements` for production. |
| **Low** | `FictioneersUI/src/environments/environment.ts:3-5` | **Supabase anon key committed to git.** Expected for client apps (RLS is the real boundary), but rotate if the repo is ever public and ensure RLS stays strict. Deploy workflow correctly injects secrets at build time. |
| **Low** | `FictioneersUI/src/app/core/services/increment.service.ts:141-148` | **File type partly validated by extension.** MIME type is preferred, but extension fallback (`epub`/`pdf`/`txt`) is client-side only. Supabase Storage `allowed_mime_types` is the server backstop — verify it rejects mismatched content. |
| **Low** | `FictioneersUI/src/app/core/guards/auth.guard.ts:24-36` | **`authorGuard` race condition.** Does not call `waitForProfile()` before checking `isAuthor()`. Legitimate authors may be briefly denied; not an escalation vector, but weakens the guard. |
| **Info** | `FictioneersUI/src/app/core/services/auth.service.ts:8,35-50` | **Good:** Generic "Invalid email or password" message prevents user enumeration on login. |
| **Info** | `supabase/migrations/20250608100500_search.sql:18` | **Good:** Search uses `plainto_tsquery` (parameterized) — no SQL injection risk. |
| **Info** | Angular templates | **Good:** No `innerHTML`, `bypassSecurityTrust`, or `DomSanitizer` usage found — low XSS surface. |
| **Info** | `.github/workflows/deploy.yml` | **Good:** `service_role` key is not in the repo; deploy uses GitHub Secrets for build-time injection. |

---

## What's Working Well

**Database RLS** — Book/increment CRUD is scoped to `author_id = auth.uid()`. Saved books and reading progress are scoped to `user_id = auth.uid()`.

**SECURITY DEFINER RPCs** — `delete_book_if_empty`, `update_book_with_version`, and `delete_increment` all verify authentication and ownership before acting.

**Auth client** — PKCE flow, auto token refresh, and session cleanup on sign-out are configured correctly.

**Upload limits** — Cover uploads enforce MIME type, 5 MB cap, and path regex. Increment uploads enforce 50 MB and allowed formats.

---

## Recommended Fixes (priority order)

1. **Edge function** — After parsing JWT, extract `auth.uid()` and require `path.split('/')[0] === uid`. Optionally verify the book exists and belongs to that author via Supabase query.

2. **Profile updates** — Restrict writable columns, e.g.:
   - Revoke direct UPDATE on `is_author` and `storage_bytes_used`
   - Allow only `display_name` via a dedicated RPC or column-level policy

3. **Storage read policies** — Scope `book-increments` SELECT to published books only (join against `books.status = 'published'`), or make the bucket private and serve via signed URLs.

4. **Login redirect** — Validate `returnUrl`:
   ```typescript
   function safeReturnUrl(url: string): string {
     if (url.startsWith('/') && !url.startsWith('//')) return url;
     return '/';
   }
   ```

5. **Production auth hardening** — Enable email confirmation, strengthen passwords, and add CAPTCHA (Supabase supports hCaptcha/Turnstile in `config.toml`).

6. **CORS** — Replace origin reflection with an explicit allowlist of your app domains.

---

## Pre-Production Checklist

- [ ] Fix edge function ownership validation
- [ ] Lock down `profiles` privileged columns
- [ ] Restrict storage access for draft content
- [ ] Enable email confirmation
- [ ] Add `returnUrl` validation
- [ ] Configure Supabase Auth redirect URLs for your GitHub Pages domain
- [ ] Enable CAPTCHA on sign-up/sign-in
- [ ] Run `supabase db lint` and review any warnings (CI already does this)

---

*Generated: June 30, 2026 — Borodina Library security audit*
