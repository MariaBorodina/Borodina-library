import { Increment } from '../../shared/models/library.model';

const now = '2025-06-01T00:00:00Z';

/** One TXT increment per seed book for offline/demo reading flow */
export const SEED_INCREMENTS: Increment[] = [
  {
    id: 'seed-increment-1',
    book_id: 'seed-book-1',
    title: 'Chapter 1',
    file_path: 'seed-author-1/seed-book-1/seed-increment-1.txt',
    file_format: 'txt',
    file_size_bytes: 1024,
    sort_order: 0,
    created_at: now,
  },
  {
    id: 'seed-increment-2',
    book_id: 'seed-book-2',
    title: 'Chapter 1',
    file_path: 'seed-author-2/seed-book-2/seed-increment-1.txt',
    file_format: 'txt',
    file_size_bytes: 1024,
    sort_order: 0,
    created_at: now,
  },
  {
    id: 'seed-increment-3',
    book_id: 'seed-book-3',
    title: 'Chapter 1',
    file_path: 'seed-author-1/seed-book-3/seed-increment-1.txt',
    file_format: 'txt',
    file_size_bytes: 1024,
    sort_order: 0,
    created_at: now,
  },
  {
    id: 'seed-increment-4',
    book_id: 'seed-book-4',
    title: 'Chapter 1',
    file_path: 'seed-author-3/seed-book-4/seed-increment-1.txt',
    file_format: 'txt',
    file_size_bytes: 1024,
    sort_order: 0,
    created_at: now,
  },
];

export function getSeedIncrementsByBook(bookId: string): Increment[] {
  return SEED_INCREMENTS.filter((increment) => increment.book_id === bookId).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}
