import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RealmRow } from '../../shared/models/library.model';
import { RealmService } from './realm.service';
import { SupabaseService } from './supabase.service';

describe('RealmService', () => {
  let service: RealmService;

  const mockRealmRows: RealmRow[] = [
    {
      id: 'realm-1',
      slug: 'hard-sci-fi',
      name: 'Hard Sci-Fi',
      description: 'Stories grounded in rigorous science.',
      sort_order: 1,
      book_count: 5,
    },
    {
      id: 'realm-9',
      slug: 'time-travel-archives',
      name: 'Time Travel Archives',
      description: 'Chronicles that bend the timeline.',
      sort_order: 9,
      book_count: 0,
    },
  ];

  function createThenable<T>(result: { data: T | null; error: unknown }) {
    const response = Promise.resolve(result);
    return Object.assign(response, {
      abortSignal: () => response,
    });
  }

  function createSupabaseMock(
    options: {
      realms?: RealmRow[] | null;
      realmsError?: Error;
      slugRow?: RealmRow | null;
      slugError?: Error;
    } = {},
  ) {
    const realms = options.realms !== undefined ? options.realms : mockRealmRows;
    const realmsError = options.realmsError ?? null;

    const client = {
        from: () => ({
          select: () => ({
            order: () => createThenable({ data: realms, error: realmsError }),
            eq: (column: string, value: string) => ({
              maybeSingle: () => {
                if (options.slugError) {
                  return createThenable({ data: null, error: options.slugError });
                }
                const row =
                  options.slugRow !== undefined
                    ? options.slugRow
                    : column === 'id'
                      ? (mockRealmRows.find((realm) => realm.id === value) ?? null)
                      : (mockRealmRows.find((realm) => realm.slug === value) ?? null);
                return createThenable({ data: row, error: null });
              },
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
    service = TestBed.inject(RealmService);
  });

  it('should return realms from Supabase', async () => {
    const realms = await firstValueFrom(service.getRealms());
    expect(realms.length).toBeGreaterThan(0);
  });

  it('should return realms with required fields', async () => {
    const realms = await firstValueFrom(service.getRealms());
    for (const realm of realms) {
      expect(realm.id).toBeTruthy();
      expect(realm.slug).toBeTruthy();
      expect(realm.name).toBeTruthy();
    }
  });

  it('should find a realm by slug', async () => {
    const realm = await firstValueFrom(service.getRealmBySlug('hard-sci-fi'));
    expect(realm?.name).toBe('Hard Sci-Fi');
  });

  it('should find a realm by id', async () => {
    const realm = await firstValueFrom(service.getRealmById('realm-1'));
    expect(realm?.name).toBe('Hard Sci-Fi');
    expect(realm?.slug).toBe('hard-sci-fi');
  });

  it('should return undefined for an unknown realm id', async () => {
    const realm = await firstValueFrom(service.getRealmById('unknown-id'));
    expect(realm).toBeUndefined();
  });

  it('should return seed realm by id when Supabase is not configured', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { isConfigured: false, requireClient: () => { throw new Error(); } } }],
    });
    service = TestBed.inject(RealmService);

    const realm = await firstValueFrom(service.getRealmById('8'));
    expect(realm?.name).toBe('Dragon Realms');
    expect(realm?.slug).toBe('dragon-realms');
  });

  it('should return undefined for an unknown slug', async () => {
    const realm = await firstValueFrom(service.getRealmBySlug('unknown-realm'));
    expect(realm).toBeUndefined();
  });

  it('should fall back to seed realms when Supabase fails', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SupabaseService,
          useValue: createSupabaseMock({ realms: null, realmsError: new Error('offline') }),
        },
      ],
    });
    service = TestBed.inject(RealmService);

    const realms = await firstValueFrom(service.getRealms());
    expect(realms.length).toBeGreaterThan(0);
    expect(realms.some((realm) => realm.slug === 'hard-sci-fi')).toBe(true);
  });

  it('should include realms with zero books from Supabase', async () => {
    const realms = await firstValueFrom(service.getRealms());
    const emptyRealm = realms.find((realm) => realm.slug === 'time-travel-archives');
    expect(emptyRealm?.name).toBe('Time Travel Archives');
    expect(emptyRealm?.bookCount).toBe(0);
  });

  it('should return cached realms on subsequent calls without refetching', async () => {
    const supabaseMock = createSupabaseMock();
    const fromSpy = vi.spyOn(supabaseMock.client, 'from');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: supabaseMock }],
    });
    service = TestBed.inject(RealmService);

    await firstValueFrom(service.getRealms());
    await firstValueFrom(service.getRealms());

    expect(fromSpy).toHaveBeenCalledTimes(1);
  });
});
