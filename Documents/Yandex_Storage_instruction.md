# Yandex Cloud Storage Integration — Fictioneers Library

This document describes how **Yandex Object Storage** (S3-compatible) is integrated into the Borodina Library application, what is already implemented, and what you still need to configure or build.

---

## 1. Overview

The application stores binary files (book covers and chapter increments) outside the Postgres database. Metadata (paths, sizes, formats) lives in Supabase; file bytes live in object storage.

| Asset | Storage backend | Status |
|-------|-----------------|--------|
| **Book covers** (JPG/PNG, ≤ 5 MB) | Yandex Object Storage | **Implemented** — upload via Supabase Edge Function |
| **Book increments** (EPUB/PDF/TXT, ≤ 50 MB) | Supabase Storage (`book-increments` bucket) | **Not migrated** — still uses Supabase client upload |

**Why Yandex for covers?** Object Storage is cheaper and scales better for public images. Covers are read frequently and do not need Supabase RLS on every GET — they are public once a book is published.

**Why increments stay on Supabase (for now)?** Increment files need stricter access control (draft vs published). Supabase Storage RLS and signed URLs already enforce that. Migrating increments to Yandex is a separate phase (see [Section 9](#9-future-work-increment-migration)).

### Architecture (covers)

```
Angular (BookService.uploadCover)
    │  POST + JWT + file bytes
    ▼
Supabase Edge Function: upload-book-cover
    │  validates auth, ownership, quota
    │  AWS S3 SDK → Yandex endpoint
    ▼
Yandex bucket: borodina-library
    │  object key: {authorId}/{bookId}/cover.{ext}
    ▼
Public URL stored in books.cover_path
```

Relevant code:

- Edge function: `supabase/functions/upload-book-cover/index.ts`
- Frontend upload: `FictioneersUI/src/app/core/services/book.service.ts` (`uploadCover`, `getCoverPublicUrl`)
- DB column: `books.cover_path`, `books.cover_size_bytes`

---

## 2. Path and URL conventions

### Object keys (covers)

```
{author_id}/{book_id}/cover.{jpg|jpeg|png}
```

Example:

```
a1b2c3d4-....-....-....-............../e5f6g7h8-....-....-....-............../cover.jpg
```

### What is stored in the database

After a successful upload, `books.cover_path` is set to the **full public URL** returned by the edge function (not only the object key). `BookService.getCoverPublicUrl()` supports both:

- a full `https://...` URL (Yandex), or
- a relative storage path (legacy Supabase `book-covers` bucket).

Cache-busting query param `?v={updated_at}` is appended in the UI when needed.

---

## 3. Yandex Cloud setup

You already created:

- Bucket: **`borodina-library`**
- Service account: **`acc2`**

Complete the following in [Yandex Cloud Console](https://console.cloud.yandex.ru/).

### 3.1 Service account permissions

Assign the service account a role that allows object read/write:

| Role | Purpose |
|------|---------|
| `storage.editor` | Upload, overwrite, delete objects (recommended minimum) |
| `storage.admin` | Full bucket management (only if you need bucket policy changes via API) |

In Console: **IAM → Service accounts → acc2 → Assign roles** (scope: folder or cloud where the bucket lives).

### 3.2 Static access keys

The edge function uses **static access keys** (not instance metadata).

1. Open **acc2** → **Create new key** → **Create static access key**.
2. Save **Key ID** and **Secret** immediately (secret is shown once).
3. Map them to Supabase secrets (Section 4):
   - `YC_STORAGE_ACCESS_KEY_ID` = Key ID
   - `YC_STORAGE_SECRET_ACCESS_KEY` = Secret

Never commit keys to git or put them in `environment.ts`.

### 3.3 Bucket settings

**Region / endpoint**

- Region: `ru-central1` (default for most YC buckets)
- S3 endpoint: `storage.yandexcloud.net`

**Public read for cover objects**

The edge function uploads with `ACL: public-read`. Ensure the bucket allows public ACLs or configure a bucket policy for anonymous `GetObject` on cover prefixes.

In Console: **Object Storage → borodina-library → Security**:

- Enable public access for objects that should be readable without signing, **or**
- Add a bucket policy allowing `GetObject` for `book-covers` paths (optional prefix rule).

**CORS** (only if the browser will call Yandex directly)

Current design uploads **through the edge function**, so bucket CORS is **not required** for cover upload. Add CORS rules later if you switch to presigned browser uploads.

Example CORS (for future direct uploads):

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://your-github-pages-domain.github.io</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

### 3.4 Optional: CDN or custom public base URL

If you front the bucket with Yandex CDN or a custom domain, set `YC_STORAGE_PUBLIC_BASE_URL` in Supabase secrets to the CDN origin, e.g.:

```
https://cdn.example.com
```

The edge function builds `publicUrl` as `{YC_STORAGE_PUBLIC_BASE_URL}/{objectKey}`. If unset, it defaults to:

```
https://storage.yandexcloud.net/borodina-library/{objectKey}
```

---

## 4. Supabase Edge Function configuration

### 4.1 Required secrets

Set these in the **Supabase Dashboard** → **Project Settings → Edge Functions → Secrets**, or via CLI:

```bash
npx supabase secrets set \
  YC_STORAGE_ENDPOINT=storage.yandexcloud.net \
  YC_STORAGE_REGION=ru-central1 \
  YC_STORAGE_BUCKET=borodina-library \
  YC_STORAGE_ACCESS_KEY_ID=<key-id-from-acc2> \
  YC_STORAGE_SECRET_ACCESS_KEY=<secret-from-acc2>
```

Optional:

```bash
npx supabase secrets set YC_STORAGE_PUBLIC_BASE_URL=https://storage.yandexcloud.net/borodina-library
```

| Variable | Required | Description |
|----------|----------|-------------|
| `YC_STORAGE_ENDPOINT` | Yes | S3 API host (`storage.yandexcloud.net`) |
| `YC_STORAGE_REGION` | Yes | `ru-central1` |
| `YC_STORAGE_BUCKET` | Yes | `borodina-library` |
| `YC_STORAGE_ACCESS_KEY_ID` | Yes | Static key ID for `acc2` |
| `YC_STORAGE_SECRET_ACCESS_KEY` | Yes | Static key secret |
| `YC_STORAGE_PUBLIC_BASE_URL` | No | CDN/custom base; trailing slashes stripped |

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically in hosted Edge Functions.

### 4.2 Deploy the function

From the repository root (linked to your cloud project):

```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase functions deploy upload-book-cover
```

Verify in Dashboard → **Edge Functions** that `upload-book-cover` is active.

### 4.3 Local Edge Function testing (optional)

```bash
# Create supabase/.env.local with secrets (do not commit)
npx supabase functions serve upload-book-cover --env-file supabase/.env.local
```

Example `supabase/.env.local`:

```env
YC_STORAGE_ENDPOINT=storage.yandexcloud.net
YC_STORAGE_REGION=ru-central1
YC_STORAGE_BUCKET=borodina-library
YC_STORAGE_ACCESS_KEY_ID=...
YC_STORAGE_SECRET_ACCESS_KEY=...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

Point the Angular app at local functions only if you change `environment.supabaseUrl` accordingly; normally you test against the deployed function.

---

## 5. Frontend integration (already done)

No extra Yandex configuration is needed in the Angular app. Covers flow through Supabase:

1. Author selects cover on **Add book** or **Edit book**.
2. `BookService.uploadCover()` POSTs the file to:
   ```
   {supabaseUrl}/functions/v1/upload-book-cover?path=...&contentType=...&upsert=true
   ```
   with `Authorization: Bearer <access_token>` and `apikey: <anon_key>`.
3. Response `{ publicUrl, path }` → `cover_path` saved via `update_book_with_version` RPC.
4. UI resolves image URL via `getCoverPublicUrl(cover_path, updated_at)`.

GitHub Pages deploy (`/.github/workflows/deploy.yml`) only needs `SUPABASE_URL` and `SUPABASE_ANON_KEY` — Yandex credentials stay server-side in Edge Function secrets.

---

## 6. Authorization, quota, and validation

The edge function enforces:

| Check | Behavior |
|-------|----------|
| Authentication | Valid Supabase JWT in `Authorization` header |
| Path format | `{uuid}/{uuid}/cover.(jpg\|jpeg\|png)` |
| Ownership | `authorId` in path must equal `auth.uid()`; book must belong to that author |
| MIME type | `image/jpeg` or `image/png` only |
| Size | ≤ 5 242 880 bytes (5 MB) |
| Storage quota | `check_storage_quota` RPC before upload |
| Upsert | `upsert=true` overwrites existing cover; without upsert, returns 409 if object exists |

Quota and `cover_size_bytes` are still managed in Supabase (`profiles.storage_bytes_used`, triggers in `20250608100200_triggers_functions.sql`).

---

## 7. Gaps and known limitations

These items are **not fully solved** by the current Yandex cover integration:

### 7.1 Cover deletion on book delete

`cleanup_book_storage()` in Postgres deletes from **Supabase** `storage.objects` (`book-covers` bucket). It does **not** delete objects from Yandex when `cover_path` is a full HTTPS URL.

**Impact:** Deleting a book may leave an orphan cover file in Yandex.

**Remediation (future):** Add edge function `delete-book-cover` (or extend upload function) that calls S3 `DeleteObject`, and invoke it from a trigger via `pg_net` / webhook, or delete in application code before `delete_book_if_empty`.

### 7.2 Legacy Supabase `book-covers` bucket

The `book-covers` bucket and RLS policies still exist in migrations. New covers should go to Yandex only. Old rows may still point at Supabase paths until migrated.

### 7.3 Increments unchanged

`IncrementService` still uploads to Supabase `book-increments` and uses `createSignedUrl` for downloads. No Yandex env vars are needed for increments today.

---

## 8. Verification checklist

Use this after configuring secrets and deploying the function.

### 8.1 Yandex Console

- [ ] Bucket `borodina-library` exists in the expected folder
- [ ] Service account `acc2` has `storage.editor` (or sufficient) role
- [ ] Static access key created and stored in Supabase secrets only
- [ ] Test object can be downloaded anonymously if public read is required

### 8.2 Supabase

- [ ] All `YC_STORAGE_*` secrets set on the project
- [ ] `upload-book-cover` deployed and shows no runtime errors in logs
- [ ] Migrations applied (`check_storage_quota`, books/increments schema)

### 8.3 Application smoke test

1. Sign in as an author.
2. Create or edit a book; upload a JPG/PNG cover (&lt; 5 MB).
3. Confirm success message and cover preview in the UI.
4. In Yandex Console → `borodina-library`, confirm object at `{your-user-id}/{book-id}/cover.jpg`.
5. Open the cover image URL in a new tab (public read).
6. In Supabase → `books` table, confirm `cover_path` is the Yandex URL.
7. Try uploading over quota (optional) — expect **Storage quota exceeded**.

### 8.4 Common errors

| Symptom | Likely cause |
|---------|----------------|
| `Missing required env var: YC_STORAGE_...` | Secret not set or function not redeployed after setting secrets |
| `403` / `Access Denied` from S3 | Wrong keys, or `acc2` lacks `storage.editor` on the bucket |
| `Cover upload failed (401)` | Session expired; sign in again |
| `Not authorized` | Path `authorId` does not match logged-in user, or book not owned |
| Cover uploads but image 403 in browser | Object not public; check ACL / bucket policy |
| CORS error in browser | Should not happen with current server-side upload; check if URL was changed to direct Yandex PUT |

---

## 9. Future work: increment migration

To move **book increments** to Yandex (as listed in `Specifications/TechStack.md`):

1. **Upload path** — New edge function `upload-book-increment` (mirror cover function with increment MIME/size rules).
2. **Download path** — Private objects: generate presigned GET URLs in an edge function after RLS-equivalent checks (published book OR author owns draft).
3. **Delete path** — Edge function or batch job for `DeleteObject` when `delete_increment` runs.
4. **DB trigger** — Replace `delete_storage_object('book-increments', ...)` with a call to the delete edge function or store only object keys and centralize cleanup.
5. **Migration** — Copy existing objects from Supabase Storage to Yandex; update `increments.file_path` if you switch from keys to URLs.

Until then, keep the Supabase `book-increments` bucket (private bucket + RLS per `20250630100000_secure_increment_storage.sql`).

---

## 10. Security notes

- **Secrets:** Yandex keys exist only in Supabase Edge Function secrets, never in the Angular bundle or GitHub Actions vars (except Supabase URL/anon key).
- **Ownership:** The edge function validates JWT user id and book ownership before writing to Yandex (bypasses Supabase Storage RLS by design).
- **CORS:** The function reflects `Origin` for browser calls. For production, restrict to your GitHub Pages / app domain (see `Documents/security_report.md`).
- **Public covers:** Cover images are intentionally world-readable; do not store sensitive data in cover files.

---

## 11. Quick reference

| Item | Value |
|------|-------|
| Bucket name | `borodina-library` |
| Service account | `acc2` |
| S3 endpoint | `storage.yandexcloud.net` |
| Region | `ru-central1` |
| Edge function | `upload-book-cover` |
| Max cover size | 5 MB |
| Allowed types | JPEG, PNG |
| Per-author quota | 2 GB (covers + increments, enforced in Supabase) |

**Related files**

- `supabase/functions/upload-book-cover/index.ts`
- `FictioneersUI/src/app/core/services/book.service.ts`
- `FictioneersUI/src/app/features/book-new/book-new.page.ts`
- `FictioneersUI/src/app/features/book-edit/book-edit.page.ts`
- `supabase/migrations/20250608100400_storage.sql`
- `supabase/migrations/20250608100200_triggers_functions.sql` (quota, cleanup)
- `Specifications/TechStack.md`
