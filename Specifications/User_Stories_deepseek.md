## User Stories – Reader & Author Journeys (with Negative Scenarios)

Below are user stories derived from both user journeys (reader and author) and the 30 negative scenarios. Each story follows the format:  
**“I, as <role>, want <action>, for <goal>”**  
Acceptance criteria are written in **Gherkin** (Given/When/Then).  
Priorities: **Must have** (MVP critical), **Should have** (important but not blocking), **Nice to have** (post-MVP).

---

## Must Have (MVP Critical)

### Reader – Authentication & Access

#### US‑R‑01: Login failure feedback
**I, as a reader, want to see a clear error message when I enter incorrect credentials, for knowing whether to retry or reset my password.**

**Acceptance Criteria**
```gherkin
Given I am on the login page
When I enter an incorrect password (or unregistered email)
And I submit the form
Then I see a message “Invalid email or password”
And I am not logged in
And the password field is cleared (or remains for retry)
```

#### US‑R‑02: Empty search results
**I, as a reader, want to see a friendly “No books found” message when my search returns no results, for knowing that I should try different keywords.**

**Acceptance Criteria**
```gherkin
Given I am on the search page
When I enter a keyword that matches no books
And I submit the search
Then I see “No books found. Try different keywords.”
And I see suggestions to browse by Realm or Authors
And no error is shown
```

#### US‑R‑03: Empty “Browse by Realm” folder
**I, as a reader, want to see a clear message when a realm has no books, for understanding that the library is growing and not broken.**

**Acceptance Criteria**
```gherkin
Given I select a Realm that contains 0 books
When the Realm detail page loads
Then I see “No books in this realm yet. Check back soon!”
And I do not see a blank page or broken UI
And I can navigate back to other realms
```

#### US‑R‑04: Error opening a book for reading
**I, as a reader, want to see a user-friendly error message when a book fails to open, for knowing that the issue is temporary and not my fault.**

**Acceptance Criteria**
```gherkin
Given I am on a book info page
When I click “Start reading”
And the book file is missing or corrupted
Then I see “Something went wrong. Please try again later.”
And I remain on the book info page
And I can try another book without refreshing
```

#### US‑R‑05: Empty “My Books” section (authenticated)
**I, as a reader, want to see a helpful empty state with a call to action when I have no saved books, for knowing how to start using the library.**

**Acceptance Criteria**
```gherkin
Given I am authenticated
And I have never saved any book
When I navigate to “My Books”
Then I see “Your library is empty. Start browsing and save books you love!”
And I see a link/button to “Browse books”
```

---

### Author – Authentication & Core Management

#### US‑A‑01: “Books by me” visible only after login
**I, as an author, want the “Books by me” section to appear only after I am authenticated, for preventing unauthorized access to my drafts and books.**

**Acceptance Criteria**
```gherkin
Given I am not logged in
When I view the navigation menu
Then I do not see “Books by me”

Given I log in successfully
When I view the navigation menu again
Then I see “Books by me”
And clicking it takes me to my author dashboard
```

#### US‑A‑02: Empty “Books by me” for new author
**I, as a new author, want to see an empty state with an “Add new book” button when I have no books yet, for knowing exactly how to start.**

**Acceptance Criteria**
```gherkin
Given I am an authenticated author
And I have 0 books
When I navigate to “Books by me”
Then I see “You haven’t added any books yet. Click ‘Add new book’ to get started.”
And an “Add new book” button is visible and clickable
```

#### US‑A‑03: Add a book – required field validation
**I, as an author, want to see validation errors when I submit a book form with missing required fields, for avoiding incomplete book entries in the library.**

**Acceptance Criteria**
```gherkin
Given I am on the “Add new book” form
When I leave Title or Synopsis empty
And I click “Save”
Then I see “Title is required” and “Synopsis is required” near the respective fields
And the form is not submitted
And no book is created
```

#### US‑A‑04: Upload increment – unsupported file format
**I, as an author, want to see an error message when I upload an unsupported file format, for knowing that I need to convert my file before retrying.**

**Acceptance Criteria**
```gherkin
Given I am on the “Manage increments” page for a book
When I select a file with format .docx, .mp4, or .jpg
And I click “Upload”
Then I see “Supported formats: EPUB, PDF, TXT only.”
And the increment is not saved
```

#### US‑A‑05: Remove increment – confirmation dialog
**I, as an author, want to confirm before removing an increment, for preventing accidental deletion of chapters.**

**Acceptance Criteria**
```gherkin
Given I am on the “Manage increments” page
When I click “Remove” next to an increment
Then I see a confirmation dialog “Are you sure? This action cannot be undone.”
And if I click “Cancel”, the increment remains
And if I click “Confirm”, the increment is permanently deleted
```

#### US‑A‑06: Remove book – confirmation dialog
**I, as an author, want to confirm before deleting an entire book, for preventing irreversible loss of all chapters.**

**Acceptance Criteria**
```gherkin
Given I am on the “Books by me” page
When I click “Delete” on a book card
Then I see a confirmation dialog “This will permanently delete the book and all its increments. Are you sure?”
And if I click “Cancel”, the book remains
And if I click “Confirm”, the book and all increments are deleted
```

#### US‑A‑07: Delete book fails if increments remain (foreign key)
**I, as an author, want to see a clear message when I cannot delete a book because it still has increments, for knowing that I must remove increments first.**

**Acceptance Criteria**
```gherkin
Given a book has at least one increment
When I try to delete that book directly
Then I see “Cannot delete book. Please remove all increments first.”
And the book is not deleted
```

---

### Cross‑Journey – Session & Reliability

#### US‑C‑01: Session expiration during form submission
**I, as any authenticated user (reader or author), want to be redirected to login without losing all my work when my session expires mid-action, for being able to resume after re‑authenticating.**

**Acceptance Criteria**
```gherkin
Given I am authenticated
And my session expires while I am filling a form (e.g., add book, edit increment)
When I submit the form
Then I am redirected to the login page
And after successful login, I am returned to the same form with previously entered data preserved (or shown a clear warning that data was lost in MVP)
```

#### US‑C‑02: Network error during increment upload
**I, as an author, want to see a clear network error message when my connection drops during file upload, for knowing that I need to retry without assuming the upload succeeded.**

**Acceptance Criteria**
```gherkin
Given I am uploading an increment file
When the network connection drops during the upload
Then I see “Network error. Upload failed.”
And the increment is not saved
And I can retry the upload after reconnecting
```

---

## Should Have (Important but Non‑Blocking)

### Reader – Search & Browsing

#### US‑R‑06: Slow home page load
**I, as a reader, want to see a loading indicator when the home page takes more than 2 seconds to load, for knowing that the app is working and not frozen.**

**Acceptance Criteria**
```gherkin
Given I open the home page
When the server response takes longer than 2 seconds
Then I see a loading spinner or skeleton screen
And after loading, the hero section appears normally
```

#### US‑R‑07: Browser back button in paginated reading
**I, as a reader, want to stay inside the reading view when I press the browser back button, for avoiding accidentally exiting the book.**

**Acceptance Criteria**
```gherkin
Given I am reading a book in paginated view
When I press the browser back button
Then I do not exit the reading view (instead I go to previous page of the book or see a confirmation dialog)
Or (MVP) I see a warning “You will exit the book. Are you sure?”
```

---

### Author – Edit & Delete Operations

#### US‑A‑08: Edit book info – save failure
**I, as an author, want to see an error message when saving edited book info fails, for knowing that my changes were not applied and I need to retry.**

**Acceptance Criteria**
```gherkin
Given I am editing a book’s synopsis or realm
When I click “Save changes”
And the server returns an error (timeout, validation, etc.)
Then I see “Failed to save changes. Please try again.”
And my unsaved changes remain in the form
And the book info is not updated
```

#### US‑A‑09: Duplicate increment title
**I, as an author, want to see a validation error when I try to upload an increment with a title that already exists, for avoiding duplicate chapter names.**

**Acceptance Criteria**
```gherkin
Given a book already has an increment titled “Chapter 2”
When I try to upload another increment titled “Chapter 2”
Then I see “Increment title already exists. Use a unique title.”
And the upload is prevented
```

#### US‑A‑10: Cover upload fails (size/format)
**I, as an author, want to see specific error messages for file size or format issues when uploading a book cover, for knowing exactly how to fix it.**

**Acceptance Criteria**
```gherkin
Given I am adding or editing a book
When I upload a cover image larger than 5MB
Then I see “File too large. Maximum size is 5MB.”

When I upload a file that is not JPG or PNG
Then I see “File must be JPG or PNG format.”
```

#### US‑A‑11: Session expiration during reading progress save (reader)
**I, as a reader, want to be silently warned that my reading progress could not be saved when my session expires, for knowing that I should log in again to preserve my place.**

**Acceptance Criteria**
```gherkin
Given I am authenticated
And my session expires while I am reading
When I turn to a new page
Then I see a non‑intrusive banner “Session expired. Log in again to save your progress.”
And my reading continues normally
And progress is not saved until I re‑authenticate
```

---

### Cross‑Journey – Data Integrity

#### US‑C‑03: Concurrent edit conflict (author)
**I, as an author, want to be warned when another session tries to save changes to the same book I am editing, for preventing silent overwrites.**

**Acceptance Criteria**
```gherkin
Given I open a book edit form in two browser tabs
When I save changes from the first tab
And I save different changes from the second tab
Then the second save sees a warning “This book was modified by another session. Refresh to see latest changes.”
And I am asked to confirm overwrite or cancel
```

---

## Nice to Have (Post‑MVP)

### Reader – Enhanced Recovery

#### US‑R‑08: Undo for accidental book removal from “My Books”
**I, as a reader, want to undo removing a book from “My Books” for at least 30 seconds, for recovering from accidental clicks.**

**Acceptance Criteria**
```gherkin
Given I am on the “My Books” page
When I remove a book
Then I see an “Undo” button for 30 seconds
And if I click “Undo”, the book reappears in my library
```

---

### Author – Advanced Error Handling

#### US‑A‑12: Restore accidentally deleted increment (soft delete)
**I, as an author, want to restore a recently deleted increment from a trash folder, for recovering from accidental deletions without re‑uploading.**

**Acceptance Criteria**
```gherkin
Given I delete an increment
Then the increment moves to a “Deleted increments” section (not permanently removed)
And I see a “Restore” option for up to 7 days
And after 7 days, the increment is permanently deleted
```

#### US‑A‑13: Autosave draft for new book
**I, as an author, want my book form data to be autosaved as a draft every 30 seconds, for recovering from accidental page refreshes or session expiration.**

**Acceptance Criteria**
```gherkin
Given I am filling the “Add new book” form
Then the form data is autosaved locally every 30 seconds
When I accidentally refresh the page
Then I see a “Restore draft?” prompt
And my previously entered data is restored
```

#### US‑A‑14: Version history for increments
**I, as an author, want to see previous versions of an increment when I replace a file, for rolling back to an older chapter if needed.**

**Acceptance Criteria**
```gherkin
Given I replace an increment file with a new version
Then the old version is kept as “v1” in a version history list
When I view increment details
Then I can see and restore any previous version
```

---

### Cross‑Journey – Offline & Performance

#### US‑C‑04: Offline reading mode
**I, as a reader, want to download a book for offline reading, for continuing to read without an internet connection.**

**Acceptance Criteria**
```gherkin
Given I am on a book info page
When I click “Download for offline”
Then the book (or its increments) is saved locally
And when I lose internet, I can still open and read it from “My Books”
```

#### US‑C‑05: Automatic retry on server error for book deletion
**I, as an author, want the system to automatically retry a failed delete operation once, for handling transient database errors without me having to click again.**

**Acceptance Criteria**
```gherkin
Given I click “Delete book”
And the first database transaction fails due to a timeout
Then the system automatically retries once
If the second attempt succeeds, I see “Book deleted”
If both fail, I see “Server error. Please try again later.”
```

---

## Priority Summary

| Priority | Reader Stories | Author Stories | Cross‑Journey Stories | Total |
|----------|---------------|----------------|-----------------------|-------|
| **Must have** | 5 (R‑01 to R‑05) | 7 (A‑01 to A‑07) | 2 (C‑01, C‑02) | **14** |
| **Should have** | 2 (R‑06, R‑07) | 4 (A‑08 to A‑11) | 1 (C‑03) | **7** |
| **Nice to have** | 1 (R‑08) | 3 (A‑12 to A‑14) | 2 (C‑04, C‑05) | **6** |
| **Total** | 8 | 14 | 5 | **27** |