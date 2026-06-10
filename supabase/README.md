# Supabase backend (Fictioneers Library)

## Local development

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) and Node.js.

```bash
# From repo root
npx supabase start
npx supabase db reset   # applies migrations + seed.sql
```

Local endpoints (defaults):

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Anon key: see `FictioneersUI/src/environments/environment.ts`

Angular app:

```bash
cd FictioneersUI
npm start
```

## Cloud project

1. Create a project at [supabase.com](https://supabase.com).
2. Link the repo:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

3. Copy the project URL and anon key into `FictioneersUI/src/environments/environment.prod.ts`.

## Schema overview

- `profiles` — extends `auth.users` (display name, author flag, storage quota)
- `realms` — browse categories (seeded)
- `books`, `increments` — catalog and chapter files
- `saved_books`, `reading_progress` — reader library
- Storage buckets: `book-covers`, `book-increments`
- RPCs: `search_books`, `update_book_with_version`, `delete_book_if_empty`, `delete_increment`
