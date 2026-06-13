import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Book } from '../../shared/models/library.model';
import { BookService } from './book.service';
import { SupabaseService } from './supabase.service';

describe('BookService', () => {
  let service: BookService;

  const mockBooks: Book[] = [
    {
      id: 'book-1',
      author_id: 'author-1',
      realm_id: 'realm-8',
      title: 'Ember of the Last Dragon',
      synopsis: 'A dragon tale.',
      cover_path: null,
      cover_size_bytes: 0,
      tags: [],
      status: 'published',
      updated_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    },
  ];

  function createThenable<T>(result: { data: T | null; error: unknown }) {
    const response = Promise.resolve(result);
    return Object.assign(response, {
      abortSignal: () => response,
    });
  }

  function createSupabaseMock(options: { books?: Book[] | null; error?: Error } = {}) {
    const books = options.books !== undefined ? options.books : mockBooks;
    const error = options.error ?? null;

    const client = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => createThenable({ data: books, error }),
              }),
              maybeSingle: () => createThenable({ data: books?.[0] ?? null, error }),
            }),
          }),
        }),
      };

    return {
      isConfigured: true,
      client,
      requireClient: () => client,
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: createSupabaseMock() }],
    });
    service = TestBed.inject(BookService);
  });

  it('should return published books for a realm from Supabase', async () => {
    const books = await firstValueFrom(service.getBooksByRealm('realm-8'));
    expect(books.length).toBeGreaterThan(0);
    expect(books.every((book) => book.status === 'published')).toBe(true);
  });

  it('should return an empty list when Supabase fails', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SupabaseService,
          useValue: createSupabaseMock({ books: null, error: new Error('offline') }),
        },
      ],
    });
    service = TestBed.inject(BookService);

    const books = await firstValueFrom(service.getBooksByRealm('realm-8'));
    expect(books).toHaveLength(0);
  });

  it('should return an empty list when a realm has no books', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SupabaseService,
          useValue: createSupabaseMock({ books: [] }),
        },
      ],
    });
    service = TestBed.inject(BookService);

    const books = await firstValueFrom(service.getBooksByRealm('realm-empty'));
    expect(books).toHaveLength(0);
  });

  it('should return cached books without refetching', async () => {
    const supabaseMock = createSupabaseMock();
    const fromSpy = vi.spyOn(supabaseMock.client, 'from');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: supabaseMock }],
    });
    service = TestBed.inject(BookService);

    await firstValueFrom(service.getBooksByRealm('realm-8'));
    await firstValueFrom(service.getBooksByRealm('realm-8'));

    expect(fromSpy).toHaveBeenCalledTimes(1);
  });
});
