## Most Probable Negative Scenarios – Reader & Author Journeys

Below are the most probable negative scenarios across both user journeys (reader and author), covering authentication, input errors, empty states, system failures, and data mutations.

---

### Reader Journey – Negative Scenarios

#### 1. Unsuccessful Sign-In (Wrong Password)
| Field | Description |
|-------|-------------|
| **User goal** | Access “My Books” section |
| **Failure** | Enters incorrect password |
| **System response** | Shows error: “Invalid email or password” |
| **User emotion** | Frustrated, impatient |
| **Recovery** | Clicks “Forgot password” or retries |

#### 2. Unsuccessful Sign-In (Nonexistent Email)
| Field | Description |
|-------|-------------|
| **User goal** | Log in to existing account |
| **Failure** | Enters email not registered |
| **System response** | Shows same generic error: “Invalid email or password” |
| **User emotion** | Confused (thinks they have an account) |
| **Recovery** | Clicks “Sign up” instead |

#### 3. Search Found No Books
| Field | Description |
|-------|-------------|
| **User goal** | Find a book by keyword (e.g., “wizard school”) |
| **Failure** | No books match the query |
| **System response** | Shows “No books found. Try different keywords.” |
| **User emotion** | Disappointed, slightly annoyed |
| **Recovery** | Refines search or browses by realm instead |

#### 4. Empty “Browse by Realm” Folder
| Field | Description |
|-------|-------------|
| **User goal** | Explore books in a specific realm (e.g., “Dragon Realms”) |
| **Failure** | Realm exists but has 0 books (MVP data gap) |
| **System response** | Shows “No books in this realm yet. Check back soon!” |
| **User emotion** | Confused, let down |
| **Recovery** | Browses another realm or Authors section |

#### 5. Error Opening Book for Reading
| Field | Description |
|-------|-------------|
| **User goal** | Start reading a selected book |
| **Failure** | Book file is corrupted or missing (404 on increment) |
| **System response** | Shows “Something went wrong. Please try again later.” |
| **User emotion** | Frustrated, disappointed |
| **Recovery** | Refreshes page or tries another book |

#### 6. Paginated Reading Fails Mid-Session
| Field | Description |
|-------|-------------|
| **User goal** | Turn to next page |
| **Failure** | Network timeout or server error on page load |
| **System response** | Shows “Failed to load next page. Check your connection.” |
| **User emotion** | Annoyed, immersion broken |
| **Recovery** | Refreshes page or retries after a few seconds |

#### 7. “My Books” Empty (Authenticated User)
| Field | Description |
|-------|-------------|
| **User goal** | Resume reading a saved book |
| **Failure** | User has never saved any books |
| **System response** | Shows “Your library is empty. Start browsing and save books you love!” |
| **User emotion** | Neutral, slightly motivated |
| **Recovery** | Navigates to home page or Browse by Realm |

#### 8. Book Info Page Missing Data
| Field | Description |
|-------|-------------|
| **User goal** | Decide whether to read a book |
| **Failure** | Synopsis or author field is empty (incomplete metadata) |
| **System response** | Shows “[No description available]” or blank field |
| **User emotion** | Hesitant, uncertain |
| **Recovery** | Skips the book or opens it anyway |

---

### Author Journey – Negative Scenarios

#### 9. Unsuccessful Sign-In (Author)
| Field | Description |
|-------|-------------|
| **User goal** | Access “Books by me” section |
| **Failure** | Incorrect password or email |
| **System response** | Shows “Invalid email or password” |
| **User emotion** | Irritated, rushed |
| **Recovery** | Uses password reset or retries carefully |

#### 10. “Books by Me” Empty (New Author)
| Field | Description |
|-------|-------------|
| **User goal** | See list of authored books |
| **Failure** | Author has not added any books yet |
| **System response** | Shows “You haven’t added any books yet. Click ‘Add new book’ to get started.” |
| **User emotion** | Neutral, ready to create |
| **Recovery** | Clicks “Add new book” button |

#### 11. Adding a Book – Missing Required Fields
| Field | Description |
|-------|-------------|
| **User goal** | Create a new book entry |
| **Failure** | User submits form without title or synopsis |
| **System response** | Highlights empty fields, shows “Title is required” and “Synopsis is required” |
| **User emotion** | Slightly annoyed, impatient |
| **Recovery** | Fills in missing fields and resubmits |

#### 12. Adding a Book – Duplicate Title
| Field | Description |
|-------|-------------|
| **User goal** | Add a new unique book |
| **Failure** | Book title already exists for this author |
| **System response** | Shows “You already have a book with this title. Please use a different title.” |
| **User emotion** | Confused (may have forgotten existing book) |
| **Recovery** | Edits title or cancels |

#### 13. Adding a Book – Cover Upload Fails
| Field | Description |
|-------|-------------|
| **User goal** | Upload cover image with book |
| **Failure** | File too large or unsupported format |
| **System response** | Shows “File must be JPG/PNG and under 5MB” |
| **User emotion** | Frustrated, delayed |
| **Recovery** | Resizes image or converts format, then retries |

#### 14. Editing Book Info – Save Fails
| Field | Description |
|-------|-------------|
| **User goal** | Update synopsis or realm |
| **Failure** | Server timeout or validation error |
| **System response** | Shows “Failed to save changes. Please try again.” |
| **User emotion** | Annoyed, worried about losing edits |
| **Recovery** | Refreshes and retries (unsaved changes lost) |

#### 15. Uploading New Increment – Unsupported File Format
| Field | Description |
|-------|-------------|
| **User goal** | Upload a chapter (e.g., Chapter 1) |
| **Failure** | User uploads .docx or .mp4 instead of EPUB/PDF/TXT |
| **System response** | Shows “Supported formats: EPUB, PDF, TXT only.” |
| **User emotion** | Frustrated, confused |
| **Recovery** | Converts file to supported format and retries |

#### 16. Uploading Increment – File Too Large
| Field | Description |
|-------|-------------|
| **User goal** | Upload a long chapter |
| **Failure** | File exceeds 50MB limit |
| **System response** | Shows “File too large. Maximum size is 50MB.” |
| **User emotion** | Annoyed, slowed down |
| **Recovery** | Splits chapter into smaller files or compresses |

#### 17. Uploading Increment – Duplicate Increment Title
| Field | Description |
|-------|-------------|
| **User goal** | Add Chapter 2 |
| **Failure** | User already uploaded “Chapter 2” before |
| **System response** | Shows “Increment title already exists. Use a unique title.” |
| **User emotion** | Slightly frustrated |
| **Recovery** | Renames to “Chapter 2 – Revised” or edits existing increment |

#### 18. Editing Increment – Replacement File Fails
| Field | Description |
|-------|-------------|
| **User goal** | Replace a faulty increment with corrected version |
| **Failure** | New file is corrupted or fails validation |
| **System response** | Shows “Upload failed. Please check the file and try again.” |
| **User emotion** | Irritated, time wasted |
| **Recovery** | Repairs file locally and retries |

#### 19. Removing Increment – Accidental Deletion
| Field | Description |
|-------|-------------|
| **User goal** | Remove a wrong increment (e.g., duplicate chapter) |
| **Failure** | User removes the wrong increment by mistake |
| **System response** | Deletes immediately (no undo in MVP) |
| **User emotion** | Panicked, regretful |
| **Recovery** | Must re-upload the lost increment manually |

#### 20. Removing a Book – Accidental Deletion
| Field | Description |
|-------|-------------|
| **User goal** | Delete an old draft book |
| **Failure** | User accidentally deletes a published book |
| **System response** | Deletes book and all increments permanently |
| **User emotion** | Devastated, angry |
| **Recovery** | No recovery in MVP (post-MVP: soft delete + restore) |

#### 21. Removing a Book – Foreign Key Constraint (Orphaned Data)
| Field | Description |
|-------|-------------|
| **User goal** | Delete a book |
| **Failure** | System fails to delete because increments reference the book |
| **System response** | Shows “Cannot delete book. Please remove all increments first.” |
| **User emotion** | Confused, annoyed |
| **Recovery** | Deletes increments one by one, then deletes book |

#### 22. Failure to Load “Manage Increments” Page
| Field | Description |
|-------|-------------|
| **User goal** | View or edit increments for a book |
| **Failure** | Backend times out or book ID is invalid |
| **System response** | Shows “Failed to load increments. Please refresh.” |
| **User emotion** | Frustrated, blocked |
| **Recovery** | Refreshes page or returns to “Books by me” |

---

### Cross-Journey Negative Scenarios

#### 23. Session Expires During Action (Author)
| Field | Description |
|-------|-------------|
| **User goal** | Save a new book or increment |
| **Failure** | Authentication token expires while filling form |
| **System response** | On submit, redirects to login page, loses unsaved work |
| **User emotion** | Extremely frustrated, angry |
| **Recovery** | Logs in again and re-enters all data |

#### 24. Session Expires During Reading (Reader)
| Field | Description |
|-------|-------------|
| **User goal** | Save progress in “My Books” |
| **Failure** | Token expires before saving last page |
| **System response** | Silent failure (progress not saved) or redirect to login |
| **User emotion** | Annoyed, surprised |
| **Recovery** | Logs in again; progress lost from that session |

#### 25. Slow Network – Image Loading Fails
| Field | Description |
|-------|-------------|
| **User goal** | Browse book covers |
| **Failure** | Images fail to load (broken placeholders appear) |
| **System response** | Shows broken image icon or blank box |
| **User emotion** | Visually disappointed, distrustful |
| **Recovery** | Refreshes page or ignores missing covers |

#### 26. Server Overload – Home Page Slow
| Field | Description |
|-------|-------------|
| **User goal** | Land on home page hero section |
| **Failure** | Page takes >5 seconds to load |
| **System response** | Shows loading spinner indefinitely |
| **User emotion** | Impatient, likely to leave |
| **Recovery** | Refreshes or abandons site temporarily |

#### 27. Browser Back Button Breaks Paginated Reading
| Field | Description |
|-------|-------------|
| **User goal** | Return to previous page in book |
| **Failure** | Clicking browser back exits reading view entirely |
| **System response** | Navigates away from reading page, losing place |
| **User emotion** | Frustrated, disoriented |
| **Recovery** | Reopens book from browse or “My Books” |

#### 28. Concurrent Edit Conflict (Author)
| Field | Description |
|-------|-------------|
| **User goal** | Edit book info from two browser tabs |
| **Failure** | Second save overwrites first without warning |
| **System response** | No conflict detection (last write wins) |
| **User emotion** | Confused, angry if changes lost |
| **Recovery** | Re-enters lost changes manually |

#### 29. Internet Disconnect While Uploading Increment
| Field | Description |
|-------|-------------|
| **User goal** | Upload a chapter |
| **Failure** | Connection drops mid-upload |
| **System response** | Shows “Network error. Upload failed.” |
| **User emotion** | Frustrated, powerless |
| **Recovery** | Reconnects and re-uploads from scratch |

#### 30. Database Error on Book Delete
| Field | Description |
|-------|-------------|
| **User goal** | Remove a book |
| **Failure** | Database transaction fails (foreign key or constraint) |
| **System response** | Shows “Server error. Please try again later.” |
| **User emotion** | Annoyed, concerned about data integrity |
| **Recovery** | Retries after a few minutes or contacts support |

---

### Summary Table by Category

| Category | Number of Scenarios |
|----------|---------------------|
| Authentication failures | 3 (#1, #2, #9) |
| Empty states | 3 (#4, #7, #10) |
| Search & browse failures | 2 (#3, #8) |
| Reading failures | 3 (#5, #6, #27) |
| Book/increment mutations (Author) | 11 (#11–#22) |
| Session & network issues | 5 (#23–#26, #29) |
| Concurrency & server errors | 3 (#28, #30) |
| **Total** | **30** |