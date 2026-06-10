-- Storage buckets and policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'book-covers',
    'book-covers',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png']
  ),
  (
    'book-increments',
    'book-increments',
    true,
    52428800,
    ARRAY['application/epub+zip', 'application/pdf', 'text/plain']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Helper: extract author_id from storage path (first segment)
CREATE OR REPLACE FUNCTION public.storage_author_id(object_name text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(object_name, '/', 1), '')::uuid;
$$;

-- Book covers: public read
CREATE POLICY book_covers_select
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'book-covers');

-- Book covers: authors upload to their own prefix
CREATE POLICY book_covers_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'book-covers'
    AND public.storage_author_id(name) = auth.uid()
  );

CREATE POLICY book_covers_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'book-covers'
    AND public.storage_author_id(name) = auth.uid()
  );

CREATE POLICY book_covers_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'book-covers'
    AND public.storage_author_id(name) = auth.uid()
  );

-- Book increments: public read
CREATE POLICY book_increments_select
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'book-increments');

CREATE POLICY book_increments_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'book-increments'
    AND public.storage_author_id(name) = auth.uid()
  );

CREATE POLICY book_increments_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'book-increments'
    AND public.storage_author_id(name) = auth.uid()
  );

CREATE POLICY book_increments_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'book-increments'
    AND public.storage_author_id(name) = auth.uid()
  );
