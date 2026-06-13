import { Profile } from '../../shared/models/library.model';

const now = '2025-06-01T00:00:00Z';

/** Author profiles for offline/demo use; ids match book.seed.ts author_id values */
export const SEED_AUTHORS: Profile[] = [
  {
    id: 'seed-author-1',
    display_name: 'Amara Singh',
    is_author: true,
    storage_bytes_used: 0,
    created_at: now,
  },
  {
    id: 'seed-author-2',
    display_name: 'Lena Volkov',
    is_author: true,
    storage_bytes_used: 0,
    created_at: now,
  },
  {
    id: 'seed-author-3',
    display_name: 'Julian Reyes',
    is_author: true,
    storage_bytes_used: 0,
    created_at: now,
  },
];

export function getSeedAuthorById(id: string): Profile | undefined {
  return SEED_AUTHORS.find((author) => author.id === id);
}
