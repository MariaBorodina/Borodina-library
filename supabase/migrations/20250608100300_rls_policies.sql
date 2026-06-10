-- Row Level Security policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.increments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_public
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Realms (reference data, public read)
CREATE POLICY realms_select_all
  ON public.realms
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Books
CREATE POLICY books_select_published
  ON public.books
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY books_select_own
  ON public.books
  FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY books_insert_own
  ON public.books
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY books_update_own
  ON public.books
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY books_delete_own
  ON public.books
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Increments
CREATE POLICY increments_select_published
  ON public.increments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = increments.book_id AND b.status = 'published'
    )
  );

CREATE POLICY increments_select_own
  ON public.increments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = increments.book_id AND b.author_id = auth.uid()
    )
  );

CREATE POLICY increments_insert_own
  ON public.increments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = increments.book_id AND b.author_id = auth.uid()
    )
  );

CREATE POLICY increments_update_own
  ON public.increments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = increments.book_id AND b.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = increments.book_id AND b.author_id = auth.uid()
    )
  );

CREATE POLICY increments_delete_own
  ON public.increments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = increments.book_id AND b.author_id = auth.uid()
    )
  );

-- Saved books (My Books)
CREATE POLICY saved_books_select_own
  ON public.saved_books
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY saved_books_insert_own
  ON public.saved_books
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_books_delete_own
  ON public.saved_books
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Reading progress
CREATE POLICY reading_progress_select_own
  ON public.reading_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY reading_progress_insert_own
  ON public.reading_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reading_progress_update_own
  ON public.reading_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reading_progress_delete_own
  ON public.reading_progress
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
