export type BookStatus = 'draft' | 'published';

export type IncrementFileFormat = 'epub' | 'pdf' | 'txt';

export interface Profile {
  id: string;
  display_name: string;
  is_author: boolean;
  storage_bytes_used: number;
  created_at: string;
}

export interface Book {
  id: string;
  author_id: string;
  realm_id: string;
  title: string;
  synopsis: string;
  cover_path: string | null;
  cover_size_bytes: number;
  tags: string[];
  status: BookStatus;
  updated_at: string;
  created_at: string;
}

export interface Increment {
  id: string;
  book_id: string;
  title: string;
  file_path: string;
  file_format: IncrementFileFormat;
  file_size_bytes: number;
  sort_order: number;
  created_at: string;
}

export interface SavedBook {
  user_id: string;
  book_id: string;
  saved_at: string;
  books?: Book;
}

export interface ReadingProgress {
  user_id: string;
  book_id: string;
  increment_id: string | null;
  page_number: number;
  updated_at: string;
}

export interface RealmRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  book_count: number;
}
