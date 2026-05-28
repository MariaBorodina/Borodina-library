

## Happy Path User Journey – Author Portal (MVP)

**Context**: User is a book author. The journey assumes the user has already logged in. The "Books by me" section and all actions within it are **only available to authenticated users**. Unauthenticated users cannot see or access this section.

---

### Stage 1: Logging In to Access Author Features
| Field | Description |
|-------|-------------|
| **User goal** | Gain access to author-only features, including "Books by me" |
| **Actions** | Clicks "Log in" → Enters credentials → Submits |
| **Touchpoints** | Login modal/page |
| **Emotions** | Anticipatory, focused |
| **Pain points** | None (credentials correct, login fast) |
| **Improvements** | "Remember me" option later |

---

### Stage 2: Accessing "Books by Me" Section
| Field | Description |
|-------|-------------|
| **User goal** | Find and manage books they have authored |
| **Actions** | After login, clicks "Books by me" in navigation menu (visible only after authentication) |
| **Touchpoints** | Navigation menu, "Books by me" page |
| **Emotions** | Empowered, organized |
| **Pain points** | None (section appears only for logged-in authors) |
| **Improvements** | None for MVP |

---

### Stage 3: Viewing List of Their Books
| Field | Description |
|-------|-------------|
| **User goal** | See all authored books at a glance |
| **Actions** | Lands on "Books by me" page → Scrolls through book cards (cover, title, status, edit/delete options) |
| **Touchpoints** | "Books by me" page |
| **Emotions** | Satisfied, in control |
| **Pain points** | None if books load quickly |
| **Improvements** | Filter by draft/published status later |

---

### Stage 4: Adding a New Book
| Field | Description |
|-------|-------------|
| **User goal** | Create a new book entry in the library |
| **Actions** | Clicks "Add new book" button → Fills in title, synopsis, realm, cover image, tags → Clicks "Save" |
| **Touchpoints** | Book creation form |
| **Emotions** | Productive, creative |
| **Pain points** | None if form is simple and fast |
| **Improvements** | Autosave draft later |

---

### Stage 5: Viewing Newly Added Book
| Field | Description |
|-------|-------------|
| **User goal** | Confirm book appears correctly |
| **Actions** | Redirected to "Books by me" → Sees new book card at top |
| **Touchpoints** | "Books by me" page |
| **Emotions** | Proud, relieved |
| **Pain points** | None |
| **Improvements** | Preview as reader view later |

---

### Stage 6: Editing Book Info
| Field | Description |
|-------|-------------|
| **User goal** | Update synopsis, realm, cover, or tags |
| **Actions** | Clicks "Edit" on a book card → Modifies fields → Clicks "Save changes" |
| **Touchpoints** | Book edit form |
| **Emotions** | In control, efficient |
| **Pain points** | None |
| **Improvements** | Change history later |

---

### Stage 7: Uploading First Content Increment
| Field | Description |
|-------|-------------|
| **User goal** | Add readable content (first chapter / increment) to the book |
| **Actions** | From book card, clicks "Manage increments" → Clicks "Upload new increment" → Selects file (e.g., EPUB, PDF, or TXT) → Adds increment title (e.g., "Chapter 1") → Clicks "Upload" |
| **Touchpoints** | Increment management page |
| **Emotions** | Accomplished, forward-moving |
| **Pain points** | None if upload is fast and format supported |
| **Improvements** | Drag-and-drop upload later |

---

### Stage 8: Viewing Uploaded Increment
| Field | Description |
|-------|-------------|
| **User goal** | Confirm increment is listed correctly |
| **Actions** | Sees new increment in list with title, upload date, and options (edit, remove) |
| **Touchpoints** | Increment management page |
| **Emotions** | Reassured |
| **Pain points** | None |
| **Improvements** | Preview increment content later |

---

### Stage 9: Uploading Another Increment (e.g., Chapter 2)
| Field | Description |
|-------|-------------|
| **User goal** | Add next part of the book |
| **Actions** | Clicks "Upload new increment" again → Selects file → Adds title → Clicks "Upload" |
| **Touchpoints** | Increment management page |
| **Emotions** | Consistent, productive |
| **Pain points** | None |
| **Improvements** | Bulk upload later |

---

### Stage 10: Editing an Existing Increment
| Field | Description |
|-------|-------------|
| **User goal** | Correct or replace an already uploaded increment |
| **Actions** | Clicks "Edit" next to an increment → Uploads new file (replaces old) or changes increment title → Clicks "Save" |
| **Touchpoints** | Increment edit modal/page |
| **Emotions** | In control, relieved (error fixed) |
| **Pain points** | None if replacement is atomic |
| **Improvements** | Version comparison later |

---

### Stage 11: Removing an Increment
| Field | Description |
|-------|-------------|
| **User goal** | Delete a wrong or outdated increment |
| **Actions** | Clicks "Remove" next to an increment → Confirms deletion in dialog → Increment disappears |
| **Touchpoints** | Increment management page, confirmation dialog |
| **Emotions** | Decisive, clean |
| **Pain points** | None if confirmation prevents accidents |
| **Improvements** | Soft delete + restore later |

---

### Stage 12: Verifying Increment Removal
| Field | Description |
|-------|-------------|
| **User goal** | Ensure book is no longer showing wrong content |
| **Actions** | Sees updated increment list without removed entry |
| **Touchpoints** | Increment management page |
| **Emotions** | Satisfied, tidy |
| **Pain points** | None |
| **Improvements** | None for MVP |

---

### Stage 13: Removing an Entire Book
| Field | Description |
|-------|-------------|
| **User goal** | Delete a book they no longer want in the library |
| **Actions** | Returns to "Books by me" → Clicks "Delete" on a book card → Confirms deletion |
| **Touchpoints** | "Books by me" page, confirmation dialog |
| **Emotions** | Final, decisive (or slightly reluctant) |
| **Pain points** | None if confirmation is clear |
| **Improvements** | Archive instead of delete later |

---

### Stage 14: Confirming Book Removal
| Field | Description |
|-------|-------------|
| **User goal** | Ensure book is gone from public and personal view |
| **Actions** | Sees book card disappear from "Books by me" list |
| **Touchpoints** | "Books by me" page |
| **Emotions** | Relieved (if intentional), clean |
| **Pain points** | None |
| **Improvements** | Undo option for 30 seconds later |

---

### Stage 15: Logging Out
| Field | Description |
|-------|-------------|
| **User goal** | End authenticated session securely |
| **Actions** | Clicks "Log out" → Session ends → Redirected to home page |
| **Touchpoints** | Navigation menu, home page |
| **Emotions** | Accomplished, neutral |
| **Pain points** | None |
| **Improvements** | None for MVP |

---

### Key Changes from Previous Version

| Aspect | Previous | Updated |
|--------|----------|---------|
| **Authentication assumption** | Implied but not explicit | **Stage 1 explicitly shows login** |
| **Visibility of "Books by me"** | Assumed visible | **Only appears after authentication** (Stage 2) |
| **Unauthenticated access** | Not addressed | **Explicitly blocked** (context note) |
| **Logout** | Optional | **Stage 15 added** to close session properly |

---