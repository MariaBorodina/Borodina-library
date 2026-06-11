import { Book } from '../../shared/models/library.model';

const now = '2025-06-01T00:00:00Z';

/** Published books for offline/demo use; realm_id matches SEED_REALMS ids */
export const SEED_BOOKS: Book[] = [
  {
    id: 'seed-book-1',
    author_id: 'seed-author-1',
    realm_id: '8',
    title: 'Ember of the Last Dragon',
    synopsis: 'A dragon rider discovers the final egg of an extinct bloodline.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['dragons', 'fantasy'],
    status: 'published',
    updated_at: now,
    created_at: now,
  },
  {
    id: 'seed-book-2',
    author_id: 'seed-author-2',
    realm_id: '8',
    title: 'Hoard of the Sky Wyrm',
    synopsis: 'Treasure hunters race to a floating citadel before the wyrm awakens.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['dragons', 'adventure'],
    status: 'published',
    updated_at: now,
    created_at: now,
  },
  {
    id: 'seed-book-3',
    author_id: 'seed-author-1',
    realm_id: '3',
    title: 'The Gravity of Lost Things',
    synopsis: 'A librarian aboard a generation ship uncovers centuries of altered archives.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['space', 'mystery'],
    status: 'published',
    updated_at: now,
    created_at: now,
  },
  {
    id: 'seed-book-4',
    author_id: 'seed-author-3',
    realm_id: '5',
    title: 'Neon Sacrament',
    synopsis: 'A street samurai hunts a rogue AI through rain-slick megacity alleys.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['cyberpunk', 'noir'],
    status: 'published',
    updated_at: now,
    created_at: now,
  },
];

export function getSeedBooksByRealm(realmId: string): Book[] {
  return SEED_BOOKS.filter((book) => book.realm_id === realmId && book.status === 'published');
}

export function getSeedBookById(id: string): Book | undefined {
  return SEED_BOOKS.find((book) => book.id === id);
}
