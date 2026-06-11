import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BookService } from './book.service';
import { SupabaseService } from './supabase.service';

describe('BookService', () => {
  let service: BookService;

  const supabaseMock = {
    client: {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: null,
                  error: new Error('offline'),
                }),
            }),
          }),
        }),
      }),
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: supabaseMock }],
    });
    service = TestBed.inject(BookService);
  });

  it('should return seed books for dragon realms', async () => {
    const books = await firstValueFrom(service.getBooksByRealm('8'));
    expect(books.length).toBeGreaterThan(0);
    expect(books.every((book) => book.realm_id === '8')).toBe(true);
    expect(books.every((book) => book.status === 'published')).toBe(true);
  });

  it('should return seed books for epic fantasy', async () => {
    const books = await firstValueFrom(service.getBooksByRealm('3'));
    expect(books.length).toBe(1);
    expect(books[0].title).toBe('The Gravity of Lost Things');
  });

  it('should return empty list for time travel archives (US-R-03)', async () => {
    const books = await firstValueFrom(service.getBooksByRealm('9'));
    expect(books).toHaveLength(0);
  });

  it('should return empty list for unknown realm', async () => {
    const books = await firstValueFrom(service.getBooksByRealm('unknown'));
    expect(books).toHaveLength(0);
  });
});
