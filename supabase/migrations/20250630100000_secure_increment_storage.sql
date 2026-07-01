-- Restrict increment file reads: published books are public; drafts are author-only.
-- Private bucket is required — public buckets bypass RLS for direct object URLs.

UPDATE storage.buckets
SET public = false
WHERE id = 'book-increments';

-- Helper: extract book_id from storage path (second segment: authorId/bookId/file.ext)
CREATE OR REPLACE FUNCTION public.storage_book_id(object_name text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(object_name, '/', 2), '')::uuid;
$$;

DROP POLICY IF EXISTS book_increments_select ON storage.objects;

CREATE POLICY book_increments_select_published
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'book-increments'
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = public.storage_book_id(name)
        AND b.status = 'published'
    )
  );

CREATE POLICY book_increments_select_own
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'book-increments'
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = public.storage_book_id(name)
        AND b.author_id = auth.uid()
    )
  );
