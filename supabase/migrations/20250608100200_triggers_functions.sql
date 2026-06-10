-- Triggers and database functions

-- 2 GB per-author storage quota (NFR-7)
CREATE OR REPLACE FUNCTION public.author_storage_quota_bytes()
RETURNS bigint
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 2147483648::bigint;
$$;

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER books_set_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER reading_progress_set_updated_at
  BEFORE UPDATE ON public.reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Full-text search vector maintenance
CREATE OR REPLACE FUNCTION public.update_book_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.synopsis, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER books_search_vector
  BEFORE INSERT OR UPDATE OF title, synopsis, tags ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_book_search_vector();

-- Create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, is_author)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    coalesce((NEW.raw_user_meta_data ->> 'is_author')::boolean, false)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Mark user as author on first book creation
CREATE OR REPLACE FUNCTION public.mark_author_on_book_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET is_author = true
  WHERE id = NEW.author_id AND is_author = false;
  RETURN NEW;
END;
$$;

CREATE TRIGGER books_mark_author
  AFTER INSERT ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_author_on_book_insert();

-- Recalculate author storage usage
CREATE OR REPLACE FUNCTION public.recalculate_author_storage(p_author_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
BEGIN
  SELECT coalesce(sum(b.cover_size_bytes), 0) + coalesce(sum(i.file_size_bytes), 0)
  INTO v_total
  FROM public.books b
  LEFT JOIN public.increments i ON i.book_id = b.id
  WHERE b.author_id = p_author_id;

  UPDATE public.profiles
  SET storage_bytes_used = coalesce(v_total, 0)
  WHERE id = p_author_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_author_storage_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'books' THEN
    v_author_id := coalesce(NEW.author_id, OLD.author_id);
  ELSE
    SELECT b.author_id INTO v_author_id
    FROM public.books b
    WHERE b.id = coalesce(NEW.book_id, OLD.book_id);
  END IF;

  IF v_author_id IS NOT NULL THEN
    PERFORM public.recalculate_author_storage(v_author_id);
  END IF;

  RETURN coalesce(NEW, OLD);
END;
$$;

CREATE TRIGGER books_recalculate_storage
  AFTER INSERT OR UPDATE OF cover_size_bytes OR DELETE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_author_storage_trigger();

CREATE TRIGGER increments_recalculate_storage
  AFTER INSERT OR UPDATE OF file_size_bytes OR DELETE ON public.increments
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_author_storage_trigger();

-- Enforce storage quota before increment insert/update
CREATE OR REPLACE FUNCTION public.check_author_storage_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id uuid;
  v_current bigint;
  v_delta bigint;
  v_quota bigint;
BEGIN
  SELECT b.author_id INTO v_author_id
  FROM public.books b
  WHERE b.id = NEW.book_id;

  SELECT storage_bytes_used INTO v_current
  FROM public.profiles
  WHERE id = v_author_id;

  v_quota := public.author_storage_quota_bytes();

  IF TG_OP = 'INSERT' THEN
    v_delta := NEW.file_size_bytes;
  ELSE
    v_delta := NEW.file_size_bytes - OLD.file_size_bytes;
  END IF;

  IF coalesce(v_current, 0) + v_delta > v_quota THEN
    RAISE EXCEPTION 'Storage quota exceeded'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER increments_check_quota
  BEFORE INSERT OR UPDATE OF file_size_bytes ON public.increments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_author_storage_quota();

-- Enforce quota on cover size changes
CREATE OR REPLACE FUNCTION public.check_cover_storage_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current bigint;
  v_delta bigint;
  v_quota bigint;
BEGIN
  v_quota := public.author_storage_quota_bytes();

  IF TG_OP = 'INSERT' THEN
    v_delta := NEW.cover_size_bytes;
  ELSE
    v_delta := NEW.cover_size_bytes - OLD.cover_size_bytes;
  END IF;

  SELECT storage_bytes_used INTO v_current
  FROM public.profiles
  WHERE id = NEW.author_id;

  IF coalesce(v_current, 0) + v_delta > v_quota THEN
    RAISE EXCEPTION 'Storage quota exceeded'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER books_check_cover_quota
  BEFORE INSERT OR UPDATE OF cover_size_bytes ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cover_storage_quota();

-- Delete storage object helper (NFR-6)
CREATE OR REPLACE FUNCTION public.delete_storage_object(p_bucket text, p_path text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF p_path IS NULL OR p_path = '' THEN
    RETURN;
  END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = p_bucket AND name = p_path;
END;
$$;

-- Cleanup storage when increment is deleted
CREATE OR REPLACE FUNCTION public.cleanup_increment_storage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  PERFORM public.delete_storage_object('book-increments', OLD.file_path);
  RETURN OLD;
END;
$$;

CREATE TRIGGER increments_cleanup_storage
  AFTER DELETE ON public.increments
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_increment_storage();

-- Cleanup cover when book is deleted
CREATE OR REPLACE FUNCTION public.cleanup_book_storage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  PERFORM public.delete_storage_object('book-covers', OLD.cover_path);
  RETURN OLD;
END;
$$;

CREATE TRIGGER books_cleanup_storage
  AFTER DELETE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_book_storage();

-- FR-A-08: delete book only when it has no increments
CREATE OR REPLACE FUNCTION public.delete_book_if_empty(p_book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_author_id uuid;
  v_increment_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = '42501';
  END IF;

  SELECT author_id INTO v_author_id
  FROM public.books
  WHERE id = p_book_id;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'Book not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_author_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized'
      USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_increment_count
  FROM public.increments
  WHERE book_id = p_book_id;

  IF v_increment_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete book. Please remove all increments first.'
      USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM public.books WHERE id = p_book_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_book_if_empty(uuid) TO authenticated;

-- FR-A-11: optimistic locking for book updates
CREATE OR REPLACE FUNCTION public.update_book_with_version(
  p_book_id uuid,
  p_expected_updated_at timestamptz,
  p_title text,
  p_synopsis text,
  p_realm_id uuid,
  p_tags text[],
  p_status public.book_status,
  p_cover_path text DEFAULT NULL,
  p_cover_size_bytes bigint DEFAULT NULL,
  p_force_overwrite boolean DEFAULT false
)
RETURNS public.books
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_book public.books;
  v_current timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = '42501';
  END IF;

  SELECT updated_at INTO v_current
  FROM public.books
  WHERE id = p_book_id AND author_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Book not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_current <> p_expected_updated_at AND NOT p_force_overwrite THEN
    RAISE EXCEPTION 'This book was modified by another session. Refresh to see latest changes.'
      USING ERRCODE = 'BOOK_CONFLICT';
  END IF;

  UPDATE public.books
  SET
    title = p_title,
    synopsis = p_synopsis,
    realm_id = p_realm_id,
    tags = coalesce(p_tags, '{}'),
    status = p_status,
    cover_path = coalesce(p_cover_path, cover_path),
    cover_size_bytes = coalesce(p_cover_size_bytes, cover_size_bytes)
  WHERE id = p_book_id AND author_id = auth.uid()
  RETURNING * INTO v_book;

  RETURN v_book;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_book_with_version(
  uuid, timestamptz, text, text, uuid, text[], public.book_status, text, bigint, boolean
) TO authenticated;

-- Delete increment with ownership check
CREATE OR REPLACE FUNCTION public.delete_increment(p_increment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_book_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = '42501';
  END IF;

  SELECT i.book_id INTO v_book_id
  FROM public.increments i
  JOIN public.books b ON b.id = i.book_id
  WHERE i.id = p_increment_id AND b.author_id = auth.uid();

  IF v_book_id IS NULL THEN
    RAISE EXCEPTION 'Increment not found'
      USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.increments WHERE id = p_increment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_increment(uuid) TO authenticated;

-- Check quota before upload (callable from client before storage upload)
CREATE OR REPLACE FUNCTION public.check_storage_quota(p_additional_bytes bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used bigint;
  v_quota bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT storage_bytes_used INTO v_used
  FROM public.profiles
  WHERE id = auth.uid();

  v_quota := public.author_storage_quota_bytes();

  RETURN coalesce(v_used, 0) + p_additional_bytes <= v_quota;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_storage_quota(bigint) TO authenticated;
