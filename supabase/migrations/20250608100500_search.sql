-- Full-text search (NFR-10)

CREATE INDEX books_search_vector_idx ON public.books USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.search_books(p_query text, p_limit int DEFAULT 50)
RETURNS SETOF public.books
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT b.*
  FROM public.books b
  WHERE b.status = 'published'
    AND (
      p_query IS NULL
      OR trim(p_query) = ''
      OR b.search_vector @@ plainto_tsquery('english', p_query)
    )
  ORDER BY
    CASE
      WHEN p_query IS NULL OR trim(p_query) = '' THEN b.created_at
      ELSE ts_rank(b.search_vector, plainto_tsquery('english', p_query))
    END DESC
  LIMIT greatest(p_limit, 1);
$$;

GRANT EXECUTE ON FUNCTION public.search_books(text, int) TO anon, authenticated;
