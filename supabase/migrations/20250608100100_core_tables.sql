-- Core tables: profiles, realms, books, increments, saved_books, reading_progress

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  is_author boolean NOT NULL DEFAULT false,
  storage_bytes_used bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.realms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  realm_id uuid NOT NULL REFERENCES public.realms (id),
  title text NOT NULL,
  synopsis text NOT NULL,
  cover_path text,
  cover_size_bytes bigint NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT '{}',
  status public.book_status NOT NULL DEFAULT 'draft',
  search_vector tsvector,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT books_author_title_unique UNIQUE (author_id, title)
);

CREATE TABLE public.increments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books (id) ON DELETE RESTRICT,
  title text NOT NULL,
  file_path text NOT NULL,
  file_format public.increment_file_format NOT NULL,
  file_size_bytes bigint NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT increments_book_title_unique UNIQUE (book_id, title)
);

CREATE TABLE public.saved_books (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books (id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE public.reading_progress (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books (id) ON DELETE CASCADE,
  increment_id uuid REFERENCES public.increments (id) ON DELETE SET NULL,
  page_number int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE INDEX books_author_id_idx ON public.books (author_id);
CREATE INDEX books_realm_id_idx ON public.books (realm_id);
CREATE INDEX books_status_idx ON public.books (status);
CREATE INDEX increments_book_id_idx ON public.increments (book_id);
CREATE INDEX saved_books_user_id_idx ON public.saved_books (user_id);
CREATE INDEX reading_progress_user_id_idx ON public.reading_progress (user_id);

-- Public view with published book counts per realm
CREATE VIEW public.realms_with_book_count
WITH (security_invoker = true)
AS
SELECT
  r.id,
  r.slug,
  r.name,
  r.description,
  r.sort_order,
  COUNT(b.id) FILTER (WHERE b.status = 'published')::int AS book_count
FROM public.realms r
LEFT JOIN public.books b ON b.realm_id = r.id
GROUP BY r.id, r.slug, r.name, r.description, r.sort_order;

GRANT SELECT ON public.realms_with_book_count TO anon, authenticated;
