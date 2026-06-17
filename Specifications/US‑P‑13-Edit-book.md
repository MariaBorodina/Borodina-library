# US‑P‑13: Edit Book Form Implementation Plan

## Scope and Success Criteria
- Implement `US‑P‑13` from `Specifications/User_Stories_for_Pages.md`: when a user clicks **Edit** on a book card, the form loads prefilled (`title`, `synopsis`, `realm`, `cover`, `tags`), and the user can modify fields and save.
- Keep behavior aligned with `Specifications/User_Journey_2_deepseek.md` (author-only, authenticated flow from “Books by me”).
- Confirm no conflicting constraints from `Specifications/User_Journey_1_deepseek.md` (reader journey).

## Current Baseline
- Route and access guard already exist in `FictioneersUI/src/app/app.routes.ts` (`/books/:id/edit` with `authorGuard`).
- Edit page is currently a stub:
  - `FictioneersUI/src/app/features/book-edit/book-edit.page.ts`
  - `FictioneersUI/src/app/features/book-edit/book-edit.page.html`
- Reusable APIs already exist in `FictioneersUI/src/app/core/services/book.service.ts`:
  - `getBookById(...)`
  - `updateBookWithVersion(...)`
  - `uploadCover(...)`
  - `mapBookError(...)`
- Realm dropdown component exists in `FictioneersUI/src/app/shared/components/realm-select/realm-select.component.ts`.
- Reference UX/validation behavior is available in:
  - `FictioneersUI/src/app/features/book-new/book-new.page.ts`
  - `FictioneersUI/src/app/features/book-new/book-new.page.html`

## Implementation Approach
- Build `BookEditPage` as the edit counterpart to `BookNewPage` with matching validation and UX style.
- Read route `id` on init, load the target book, and prefill all editable fields.
- Save via `updateBookWithVersion(...)` with `expected_updated_at` for optimistic locking.
- Preserve existing cover when no new file is selected; if a new cover is selected, upload it first, then update `cover_path` and `cover_size_bytes`.
- Keep author-only behavior via the existing guard and navigate back to `/books-by-me` after successful save.

## Detailed Work Plan

### 1) Prefill and local form state wiring
- In `FictioneersUI/src/app/features/book-edit/book-edit.page.ts`:
  - Inject `ActivatedRoute`, `Router`, `BookService`, `AuthService`.
  - Read `id` from route params and fetch with `getBookById(id)`.
  - Initialize editable state: `title`, `synopsis`, `realmId`, `tagsInput`, and cover preview/path.
  - Store save context (`bookId`, `expectedUpdatedAt`, `status`) from loaded entity.
  - Add `loading`, `notFound`, `saving`, and `formError` states.

### 2) Edit form UI and controls
- Replace stub template in `FictioneersUI/src/app/features/book-edit/book-edit.page.html` with:
  - Title, synopsis, tags inputs.
  - Realm dropdown using `app-realm-select`.
  - Cover upload + preview.
  - Submit button labeled **Save changes** and **Cancel** link back to `/books-by-me`.
  - Inline field errors and form-level error message area.

### 3) Validation and save pipeline
- Reuse create-form compatible validation rules:
  - Title required
  - Synopsis required
  - Realm required
  - Cover must be JPG/PNG and under 5 MB
- On submit:
  - Validate and abort save when invalid.
  - Parse comma-separated tags into normalized array.
  - If a new cover is selected: call `uploadCover(...)`.
  - Call `updateBookWithVersion(...)` using `expected_updated_at` and edited values.
  - Map backend errors via `mapBookError(...)`.
  - Navigate to `/books-by-me` on success.

### 4) Concurrency and conflict behavior
- Handle optimistic locking conflicts (`BOOK_CONFLICT`) from `updateBookWithVersion(...)`.
- Minimum expected behavior:
  - Show conflict message from mapped error.
  - Keep user-entered form values intact.
- Optional enhanced behavior:
  - Prompt for confirmation and retry with `force_overwrite: true`.

### 5) Tests for US‑P‑13 behavior
- Add `FictioneersUI/src/app/features/book-edit/book-edit.page.spec.ts`.
- Cover:
  - Prefill from existing book data.
  - Required-field validation blocks save.
  - Save payload matches update contract.
  - Successful save navigates to `/books-by-me`.
  - Service error is mapped and displayed.
  - Conflict retry path with overwrite confirmation (if implemented).

### 6) Verification checklist
- Manual:
  - Open “Books by me” as authenticated author.
  - Click Edit and verify prefilled fields.
  - Change each field type and save.
  - Confirm updated values after returning to the dashboard.
  - Validate error rendering for invalid input.
  - Validate conflict UX if reproducible.
- Automated:
  - Run unit tests for edit page and adjacent affected components/services.

## Notes / Non-goals
- Do not remove any pages or page elements.
- Do not modify unrelated reader flows.
- Keep changes scoped to US‑P‑13 except minimal supporting fixes.
