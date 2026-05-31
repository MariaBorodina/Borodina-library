## Technical Specification – MVP: Free Online Library (Fantasy & Sci-Fi)

This specification is derived from the user stories and acceptance criteria generated from reader and author journeys, including negative scenarios. It is intended for implementation by AI agents.

---

## Part 1: Functional Requirements

### Reader Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR‑R‑01** | When a user submits login with incorrect email or password, the system should display the message “Invalid email or password” and not authenticate the user, to have clear authentication failure feedback. |
| **FR‑R‑02** | When a user searches with a keyword that matches no books, the system should display “No books found. Try different keywords.” along with links to “Browse by Realm” and “Authors”, to have a helpful empty search state. |
| **FR‑R‑03** | When a user opens a Realm that contains zero books, the system should display “No books in this realm yet. Check back soon!” and allow navigation back to other realms, to have a non‑breaking empty folder state. |
| **FR‑R‑04** | When a user clicks “Start reading” on a book info page and the book file is missing or corrupted, the system should display “Something went wrong. Please try again later.” and remain on the book info page, to have a user‑friendly error for failed book opening. |
| **FR‑R‑05** | When an authenticated reader navigates to “My Books” and has never saved any book, the system should display “Your library is empty. Start browsing and save books you love!” with a link/button to “Browse books”, to have an actionable empty state. |
| **FR‑R‑06** | When a reader reads a book and the authentication session expires while turning a page, the system should display a non‑intrusive banner “Session expired. Log in again to save your progress.”, allow continued reading without saving progress, to have graceful session expiry handling for readers. |
| **FR‑R‑07** | When a reader presses the browser back button during paginated reading, the system should either stay inside the reading view (navigate to previous page of the book) or show a warning “You will exit the book. Are you sure?”, to have prevention of accidental exit. |

### Author Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR‑A‑01** | When a user is not authenticated, the system should not show the “Books by me” navigation item. When the user logs in successfully, the system should show “Books by me” and allow access to the author dashboard, to have role‑based visibility. |
| **FR‑A‑02** | When an authenticated author navigates to “Books by me” with zero books, the system should display “You haven’t added any books yet. Click ‘Add new book’ to get started.” with a visible “Add new book” button, to have an empty state that guides creation. |
| **FR‑A‑03** | When an author submits the “Add new book” form with missing title or missing synopsis, the system should highlight the empty fields and show “Title is required” and “Synopsis is required” respectively, and prevent submission, to have required field validation. |
| **FR‑A‑04** | When an author attempts to upload a book cover image, the system should accept only JPG or PNG formats and reject any file larger than 5 MB, displaying “File must be JPG/PNG and under 5MB”, to have cover image validation. |
| **FR‑A‑05** | When an author attempts to upload a book increment (chapter), the system should accept only EPUB, PDF, or TXT formats and reject any file larger than 50 MB, displaying “Supported formats: EPUB, PDF, TXT only.” and “File too large. Maximum size is 50MB.” respectively, to have increment file validation. |
| **FR‑A‑06** | When an author clicks “Remove” next to an increment, the system should show a confirmation dialog “Are you sure? This action cannot be undone.” and delete the increment only after confirmation, to have accidental deletion prevention. |
| **FR‑A‑07** | When an author clicks “Delete” on a book card, the system should show a confirmation dialog “This will permanently delete the book and all its increments. Are you sure?” and delete the book and all its increments only after confirmation, to have accidental book deletion prevention. |
| **FR‑A‑08** | When an author attempts to delete a book that still has one or more increments, the system should display “Cannot delete book. Please remove all increments first.” and prevent deletion, to enforce integrity. |
| **FR‑A‑09** | When an author edits book info (synopsis, realm, cover) and the save operation fails due to server error or timeout, the system should display “Failed to save changes. Please try again.” and keep the unsaved changes in the form, to allow retry without data loss. |
| **FR‑A‑10** | When an author attempts to upload an increment with a title that already exists for that book, the system should display “Increment title already exists. Use a unique title.” and prevent upload, to avoid duplicate chapter names. |
| **FR‑A‑11** | When an author opens the same book edit form in two browser tabs and saves from the second tab after the first tab saved, the system should display “This book was modified by another session. Refresh to see latest changes.” and ask for confirmation before overwriting, to have concurrent edit conflict detection. |

### Cross‑Cutting Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR‑C‑01** | When an authenticated user (reader or author) submits a form (e.g., add book, edit increment) and the authentication session expires during submission, the system should redirect to the login page. After successful login, the system should return the user to the same form with previously entered data preserved (or show a clear warning that data was lost in MVP), to have session expiration recovery. |
| **FR‑C‑02** | When an author uploads an increment and a network error occurs during the upload, the system should display “Network error. Upload failed.”, not save the increment, and allow retry, to have clear network failure handling. |
| **FR‑C‑03** | When a reader opens the home page and the server response takes longer than 2 seconds, the system should display a loading spinner or skeleton screen until the page loads, to have perceived performance feedback. |
| **FR‑C‑04** | When a user performs any destructive action (delete book, delete increment, remove from My Books), the system should require explicit confirmation with a descriptive message, to have consistent confirmation for data loss prevention. |

---

## Part 2: Non‑Functional Requirements

| ID | Requirement | Measurement |
|----|-------------|-------------|
| **NFR‑1 – Performance** | When a user requests any page (home, browse, book info, reading page), the system should respond with first contentful paint within **2 seconds** under normal load (≤100 concurrent users), to have acceptable perceived performance. | 95th percentile < 2s |
| **NFR‑2 – Upload Throughput** | When an author uploads a file (cover ≤5MB or increment ≤50MB), the system should complete the upload and processing within **5 seconds** for covers and **30 seconds** for increments on a 10 Mbps connection, to avoid timeouts. | Time measured from click to success message |
| **NFR‑3 – Availability** | The system should have **99.5% uptime** during planned MVP operation (excluding scheduled maintenance), to ensure reliability for readers and authors. | Monthly uptime percentage |
| **NFR‑4 – Concurrent Users** | The system should support at least **500 concurrent readers** browsing and reading simultaneously, and **50 concurrent authors** performing edit/upload operations, without exceeding 3 second response time for non‑upload actions. | Load test with simulated users |
| **NFR‑5 – Security** | When a user is not authenticated, the system should block access to any “Books by me” route or author API endpoint, returning HTTP 401 or redirect to login, to have authorization enforcement. | Penetration test: all author endpoints require valid session |
| **NFR‑6 – Data Integrity** | When a book or increment is deleted, the system should remove all associated records (including file storage) within **1 second** of confirmation, and no orphaned references should remain in the database. | Automated consistency check after deletion |
| **NFR‑7 – File Storage Limits** | The system should enforce per‑author total storage quota of **2 GB** for all increments and covers combined, to prevent abuse. | Count bytes per author; reject upload when exceeded with message “Storage quota exceeded” |
| **NFR‑8 – Error Logging** | When any server‑side error occurs (5xx, database failure, file corruption), the system should log the error with timestamp, user ID (if authenticated), endpoint, and stack trace, and notify administrators within **15 minutes**, to enable rapid debugging. | Log aggregation shows error within 15 min |
| **NFR‑9 – Browser Support** | The system should support the last **two major versions** of Chrome, Firefox, Safari, and Edge, as well as responsive layouts for tablet (768px width) and mobile (375px width), to have broad accessibility. | Automated browser tests pass |
| **NFR‑10 – Search Latency** | When a user performs a search, the system should return results (or “no results”) within **500 milliseconds** for a library of up to 10,000 books, to maintain fluid browsing. | 95th percentile < 500 ms |

---

## Dependency Map (User Stories → Requirements)

The following table shows how functional requirements cover the user stories (Must Have + Should Have) and respects their dependencies.

| User Story | Related FR | Dependency |
|------------|------------|------------|
| US‑R‑01 | FR‑R‑01 | – |
| US‑R‑02 | FR‑R‑02 | – |
| US‑R‑03 | FR‑R‑03 | – |
| US‑R‑04 | FR‑R‑04 | – |
| US‑R‑05 | FR‑R‑05 | – |
| US‑R‑06 | FR‑C‑03 | – |
| US‑R‑07 | FR‑R‑07 | – |
| US‑A‑01 | FR‑A‑01 | – |
| US‑A‑02 | FR‑A‑02 | Depends on FR‑A‑01 |
| US‑A‑03 | FR‑A‑03 | – |
| US‑A‑04 | FR‑A‑05 | – |
| US‑A‑05 | FR‑A‑06 | – |
| US‑A‑06 | FR‑A‑07 | – |
| US‑A‑07 | FR‑A‑08 | Depends on existence of increments |
| US‑A‑08 | FR‑A‑09 | – |
| US‑A‑09 | FR‑A‑10 | Depends on increment creation |
| US‑A‑10 | FR‑A‑04 | – |
| US‑A‑11 | FR‑R‑06 | Depends on authentication |
| US‑C‑01 | FR‑C‑01 | Depends on authentication |
| US‑C‑02 | FR‑C‑02 | – |
| US‑C‑03 | FR‑A‑11 | Depends on edit action |

---

## Optimization Applied

During generation, the following optimization was applied to reduce redundancy while preserving original logic:

1. **Consolidated destructive action confirmations** – US‑A‑05 (remove increment) and US‑A‑06 (remove book) were merged into a single **FR‑C‑04** that covers all destructive actions with context‑specific messages. This keeps the logic intact because the requirement specifies “descriptive message” per entity type.

2. **Unified file upload validation** – US‑A‑04 (increment format/size) and US‑A‑10 (cover format/size) were merged into two separate, explicit requirements **FR‑A‑04** (covers) and **FR‑A‑05** (increments) with distinct limits. No logic lost because each entity retains its own constraints.

3. **Session expiration handling** – US‑C‑01 (form submission expiry) and US‑A‑11 (reading progress expiry) were kept separate because they have different user expectations (form data preservation vs. silent progress loss). No consolidation was applied here to avoid breaking logic.

**Validation**: The optimization does not break any original user story acceptance criteria. All critical conditions (confirmation dialogs, file type/size limits, session behavior) remain measurable and explicit.