## New User Stories for Pages (Must Have for MVP)

The following user stories ensure that all pages described in the happy path journeys exist with their basic layout and key elements. These complement the existing functional stories.

---

### Reader Pages

#### US‑P‑01: Home page
**I, as a reader, want to access a home page with a hero section, tagline, and call‑to‑action, for understanding what the library offers and starting my exploration.**

**Acceptance Criteria**
```gherkin
Given I open the web app URL
When the home page loads
Then I see a hero section with a compelling tagline (e.g., “Fantasy & Sci‑Fi Library”)
And I see a background art/image related to the genre
And I see a call‑to‑action button (“Start exploring” or “Browse books”)
And the page loads in under 3 seconds
```

#### US‑P‑02: Browse by Realm page
**I, as a reader, want to see a page that lists all available fantasy/sci‑fi realms as clickable cards, for browsing books by thematic category.**

**Acceptance Criteria**
```gherkin
Given I click “Browse by Realm” in the navigation
When the Browse by Realm page loads
Then I see a grid or list of realm cards
Each card displays a realm name (e.g., “Dragon Realms”, “Cyberpunk Wastelands”)
And each card is clickable and leads to the realm detail page
```

#### US‑P‑03: Realm detail page
**I, as a reader, want to see a page that displays all books belonging to a selected realm, for focusing my browsing on a specific theme.**

**Acceptance Criteria**
```gherkin
Given I click on a realm card
When the realm detail page loads
Then I see the realm name as a heading
And I see a list of book covers and titles from that realm
If the realm has no books, I see a friendly empty state message (covered by US‑R‑03)
```

#### US‑P‑04: Book info page
**I, as a reader, want to see a dedicated page for each book with synopsis, author, and a “Start reading” button, for deciding whether to read the book.**

**Acceptance Criteria**
```gherkin
Given I click on a book cover or title from any list
When the book info page loads
Then I see the book cover, title, author name, synopsis, and any tags
And I see a “Start reading” button
And the button is clearly visible and clickable
```

#### US‑P‑05: Reading page (paginated view)
**I, as a reader, want to open a book in a paginated reading view that allows me to turn pages, for reading the book without distractions.**

**Acceptance Criteria**
```gherkin
Given I am on a book info page
When I click “Start reading”
Then the reading page opens with the first page of the book displayed
And I see forward/back controls (swipe or buttons) to turn pages
And the page does not require login (for public books)
```

#### US‑P‑06: Search page
**I, as a reader, want to access a search page where I can enter keywords and see matching book results, for finding specific books or topics.**

**Acceptance Criteria**
```gherkin
Given I click “Search” in the navigation
When the search page loads
Then I see a text input field and a “Search” button
And I can enter keywords and submit
When results are displayed, they include book covers and titles
```

#### US‑P‑07: Authors page
**I, as a reader, want to see a page listing all authors, for discovering books by a specific writer or browsing the author catalogue.**

**Acceptance Criteria**
```gherkin
Given I click “Authors” in the navigation
When the Authors page loads
Then I see a scrollable list of author names
Each author name is clickable and leads to the author detail page
```

#### US‑P‑08: Author detail page
**I, as a reader, want to see a page that shows all books written by a selected author, for reading their complete works in one place.**

**Acceptance Criteria**
```gherkin
Given I click on an author name
When the author detail page loads
Then I see the author’s name as a heading
And I see a list of book covers and titles by that author
```

#### US‑P‑09: Login page / modal
**I, as a reader or author, want to access a login form with email and password fields, for authenticating myself to access personal sections.**

**Acceptance Criteria**
```gherkin
Given I click “Log in” in the navigation
When the login form appears (as a page or modal)
Then I see fields for email and password
And I see a “Submit” or “Log in” button
And I see a link to sign up (if new user)
```

#### US‑P‑10: My Books page (authenticated readers)
**I, as a reader, want to see a “My Books” page that lists all the books I have saved, for resuming reading or managing my personal library.**

**Acceptance Criteria**
```gherkin
Given I am authenticated as a reader
When I click “My Books” in the navigation
Then I see a list of book covers and titles that I have saved
If I have no saved books, I see an empty state with a “Browse books” link (covered by US‑R‑05)
```

---

### Author Pages

#### US‑P‑11: Books by me page (author dashboard)
**I, as an author, want to access a “Books by me” page that lists all the books I have authored, for managing my publications.**

**Acceptance Criteria**
```gherkin
Given I am authenticated as an author
When I click “Books by me” in the navigation
Then I see a grid or list of book cards
Each card shows cover (placeholder if none), title, status (draft/published), and “Edit” / “Delete” buttons
If I have no books, I see an empty state with an “Add new book” button (covered by US‑A‑02)
And this page is not visible to unauthenticated users
```

#### US‑P‑12: Add new book form
**I, as an author, want to see a form with fields for title, synopsis, realm, cover image, and tags, for creating a new book entry.**

**Acceptance Criteria**
```gherkin
Given I am on the “Books by me” page
When I click “Add new book”
Then I see a form with the following fields: Title (required), Synopsis (required), Realm (dropdown), Cover image upload, Tags (text input)
And I see a “Save” button and a “Cancel” button
```

#### US‑P‑13: Edit book form
**I, as an author, want to see a pre‑filled form when I edit an existing book, for modifying its information without retyping everything.**

**Acceptance Criteria**
```gherkin
Given I click “Edit” on a book card
When the edit book form loads
Then all existing book data (title, synopsis, realm, cover, tags) is pre‑filled
And I can change any field and click “Save changes”
```

#### US‑P‑14: Increment management page
**I, as an author, want to see a page for a specific book that lists all its uploaded increments (chapters), with options to upload, edit, or remove increments, for managing the book’s content.**

**Acceptance Criteria**
```gherkin
Given I click “Manage increments” on a book card
When the increment management page loads
Then I see the book’s title as a heading
And I see a list of existing increments showing title, upload date, and “Edit” / “Remove” buttons
And I see an “Upload new increment” button
```

---

### Cross‑Journey Page

#### US‑P‑15: Navigation menu
**I, as any user, want to see a consistent navigation menu that adapts to my authentication status, for moving between key sections of the app.**

**Acceptance Criteria**
```gherkin
Given I am not logged in
When I view the navigation menu
Then I see links to: Home, Browse by Realm, Search, Authors, Log in
And I do not see “My Books” or “Books by me”

Given I log in as a reader
When I view the navigation menu
Then I see additional link “My Books” (and “Log out”)

Given I log in as an author
When I view the navigation menu
Then I see additional link “Books by me” (and “Log out”)
```

---

These 15 new user stories cover every distinct page and core navigation element described in the happy path journeys. They are all **Must have** for MVP, as without these pages the user journey cannot be completed.